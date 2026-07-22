import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import crypto from 'crypto';
import { documentConfig } from './src/config/document-config.js';
import { createContractDocumentStore } from './src/contracts/contract-document.store.js';
import { createContractDocumentDb } from './src/contracts/contract-document.db.js';
import { createContractDocumentService } from './src/contracts/contract-document.service.js';
import { createContractDocumentRouter } from './src/contracts/contract-document.routes.js';
import { createFieldSyncConfig } from './src/field-sync/field-sync.config.js';
import { createFieldSyncGateway, FieldSyncGatewayError } from './src/field-sync/field-sync.gateway.js';
import { createFieldSyncRouter } from './src/field-sync/field-sync.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = documentConfig.port;

// Setup directories
const UPLOADS_DIR = documentConfig.paths.uploadsDir;
const SAMPLES_DIR = documentConfig.paths.samplesDir;

[UPLOADS_DIR, SAMPLES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Auto-migrate: file cũ (flat) trong uploads/ → uploads/_unassigned/ ──────
try {
    const entries = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true });
    const oldFiles = entries.filter(e => e.isFile() && (e.name.endsWith('.docx') || e.name.endsWith('.doc') || e.name.endsWith('.xlsx')));
    if (oldFiles.length > 0) {
        const unassignedDir = path.join(UPLOADS_DIR, '_unassigned');
        if (!fs.existsSync(unassignedDir)) fs.mkdirSync(unassignedDir, { recursive: true });
        oldFiles.forEach(f => {
            const src = path.join(UPLOADS_DIR, f.name);
            const dst = path.join(unassignedDir, f.name);
            if (!fs.existsSync(dst)) fs.renameSync(src, dst);
        });
        console.log(`[MIGRATE] ✅ Đã di chuyển ${oldFiles.length} file cũ vào uploads/_unassigned/`);
    }
} catch (migrateErr) {
    console.warn('[MIGRATE] ⚠️ Lỗi migrate file cũ:', migrateErr.message);
}

app.use(cors({
    origin(origin, callback) {
        if (!origin || documentConfig.corsAllowedOrigins.includes(origin)) return callback(null, true);
        const error = new Error(`Origin không được CORS cho phép: ${origin}`);
        error.statusCode = 403;
        return callback(error);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Username', 'BranchID']
}));

app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/samples', express.static(SAMPLES_DIR));

app.use(express.json({ limit: '2mb' }));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('[EXPRESS] Lỗi parse JSON payload!');
        if (String(req.path || '').toLowerCase().startsWith('/api/metadata')) {
            return res.status(400).set('Cache-Control', 'private, no-store').json({ success: false, message: 'Invalid JSON payload' });
        }
        return res.json({ error: 0, message: 'Invalid JSON payload' });
    }
    next();
});

const SQL_API_BASE = documentConfig.sqlApiBase;
const SQL_API_USER = documentConfig.sqlApiUser;

const contractDocumentStore = createContractDocumentStore(documentConfig);
const contractDocumentDb = createContractDocumentDb(documentConfig);
const contractDocumentService = createContractDocumentService(
    documentConfig,
    contractDocumentStore,
    contractDocumentDb
);

app.use('/api', createContractDocumentRouter(documentConfig, contractDocumentService));

const fieldSyncConfig = createFieldSyncConfig(documentConfig);
const fieldSyncGateway = createFieldSyncGateway(fieldSyncConfig);
app.use('/api/metadata', createFieldSyncRouter({ gateway: fieldSyncGateway, config: fieldSyncConfig }));

function extractUserName(req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                const user = payload.UserName || payload.username || payload.unique_name || payload.name || payload.sub;
                if (user) return user;
            }
        } catch (e) {
            console.error('[AUTH] Lỗi giải mã JWT:', e.message);
        }
    }
    return req.body?.UserName || req.query?.UserName || req.headers?.username || 'system';
}

// ── Branch cache: Map<UserName, { branches: string[]|null, expiry: number }> ─
const _userBranchCache = new Map();
const BRANCH_CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Lấy danh sách BranchID của user từ SY_User.
 * - Trả về null  → user không bị giới hạn (BranchID=NULL trong DB, tức là xem tất cả)
 * - Trả về []    → user bị disable hoặc không tồn tại (chặn)
 * - Trả về ['CN001','CN002'] → chỉ được xem các branch này
 */
async function getUserBranchesFromDB(req) {
    const userName = extractUserName(req);
    const now = Date.now();
    const cached = _userBranchCache.get(userName);
    if (cached && now < cached.expiry) return cached.branches;

    try {
        const payload = {
            List: 'SY_User', Func: 'View', UserName: SQL_API_USER,
            Keyword: userName, Page: 1, Limit: 1
        };
        const qs = encodeURIComponent(JSON.stringify(payload));
        const url = `${SQL_API_BASE}/api/API_Gateway_Router?q=${qs}`;
        const headers = {};
        if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
        const resp = await axios.get(url, { headers, timeout: 5000 });
        const json = resp.data;
        const rows = json.records || (Array.isArray(json) ? json : []);
        const user = rows.find(r => {
            const uname = r.UserName || r.username || r.USERNAME || '';
            return uname.toLowerCase() === userName.toLowerCase();
        }) || rows[0];

        let branches = null; // null = xem tất cả (admin)
        if (user) {
            const rawBranch = user.BranchID || user.branchId || user.branchid || null;
            // Kiểm tra admin: sync với logic frontend _getUserBranches()
            // UserGroupID = 'admin' (case-insensitive) → xem tất cả
            const userGroupRaw = user.UserGroupID || user.userGroupID || user.GroupID || user.Group || '';
            const isAdmin = String(userGroupRaw).toLowerCase() === 'admin';

            if (isAdmin) {
                branches = null; // admin → không giới hạn
                console.log(`[BRANCH] User '${userName}' là Admin (UserGroupID='${userGroupRaw}') → ALL`);
            } else if (rawBranch && String(rawBranch).trim() !== '') {
                // BranchID có thể là chuỗi phân cách bởi dấu phẩy: "COBI,DONGDU"
                branches = String(rawBranch).split(',').map(b => b.trim().toUpperCase()).filter(Boolean);
            } else {
                // BranchID rỗng + không phải admin → chặn (giống frontend trả về [])
                branches = [];
                console.warn(`[BRANCH] User '${userName}' không phải admin và chưa được gán chi nhánh → bị chặn`);
            }
        }

        _userBranchCache.set(userName, { branches, expiry: now + BRANCH_CACHE_TTL });
        console.log(`[BRANCH] User '${userName}' → BranchID: ${branches ? JSON.stringify(branches) : 'ALL (null)'}`);
        return branches;
    } catch (err) {
        console.error('[BRANCH] Lỗi lấy branch từ SY_User:', err.message);
        return null; // Fail-open: nếu lỗi DB thì không chặn
    }
}

let _setupCache = null;
let _setupCacheTime = 0;
const SETUP_CACHE_TTL = 5 * 60 * 1000;

async function axiosGetWithRetry(url, config = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, config);
        } catch (err) {
            if (i === retries - 1) throw err;
            console.warn(`[HTTP RETRY] Lần thử ${i + 1} thất bại cho ${url}: ${err.message}. Thử lại sau ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function fetchSetupInfo(authToken) {
    const now = Date.now();
    if (_setupCache && (now - _setupCacheTime) < SETUP_CACHE_TTL) return _setupCache;
    try {
        const url = `${SQL_API_BASE}/api/API_LayGiaTriSetup`;
        const headers = {};
        if (authToken) headers['Authorization'] = authToken;
        const resp = await axiosGetWithRetry(url, { headers, timeout: 8000 }, 3, 1000);
        const json = resp.data;
        const rows = json.records || (Array.isArray(json) ? json : []);
        const setup = {};
        rows.forEach(r => {
            const key = r.CodeID || r.codeID || r.codeid || r.MaSetup;
            const val = r.CodeValue || r.codeValue || r.GiaTri || r.Value || '';
            if (key) setup[key] = val;
        });
        _setupCache = setup;
        _setupCacheTime = now;
        console.log('[SETUP] Keys:', Object.keys(setup).join(', '));
        return setup;
    } catch (err) {
        console.error('[SETUP] Lỗi gọi API_LayGiaTriSetup:', err.message);
        return _setupCache || {};
    }
}

async function fetchFromSQLAPI(listName, keyword, authToken) {
    const payload = {
        List: listName, Func: 'View', UserName: SQL_API_USER,
        Keyword: keyword || '', Page: 1, Limit: 1
    };
    const qs = encodeURIComponent(JSON.stringify(payload));
    const url = `${SQL_API_BASE}/api/API_Gateway_Router?q=${qs}`;
    console.log(`[SQL API] Gọi: ${listName} | Keyword: ${keyword}`);
    const headers = {};
    if (authToken) headers['Authorization'] = authToken;
    try {
        const resp = await axiosGetWithRetry(url, { headers, timeout: 10000 }, 3, 1000);
        const json = resp.data;
        if (json && json.records && json.records.length > 0) return json.records[0];
        if (json && json.code === 0) return json;
    } catch (err) {
        console.error(`[SQL API] Lỗi khi gọi ${listName}:`, err.message);
    }
    return null;
}

app.get('/api/documents', async (req, res) => {
    try {
        const userBranches = await getUserBranchesFromDB(req);
        // userBranches = null → xem tất cả; array → chỉ xem các branch đó

        const fileList = [];
        const scanDir = (dir, branch) => {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            entries.forEach(entry => {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    // Đệ quy vào subfolder branch (không đệ quy sâu hơn 1 cấp)
                    if (!branch) scanDir(fullPath, entry.name);
                } else if (entry.isFile() && (entry.name.endsWith('.docx') || entry.name.endsWith('.doc') || entry.name.endsWith('.xlsx'))) {
                    const stats = fs.statSync(fullPath);
                    fileList.push({
                        fileName: branch ? `${branch}/${entry.name}` : entry.name,
                        branch: branch || '_unassigned',
                        size: (stats.size / 1024).toFixed(2) + ' KB',
                        createdAt: stats.birthtime,
                        updatedAt: stats.mtime
                    });
                }
            });
        };

        if (userBranches === null) {
            // Admin: scan toàn bộ uploads/
            scanDir(UPLOADS_DIR, null);
        } else {
            // User bình thường: chỉ scan các folder branch được gán
            userBranches.forEach(branch => {
                scanDir(path.join(UPLOADS_DIR, branch), branch);
            });
        }

        res.json({ success: true, data: fileList });
    } catch (error) {
        console.error('[API] Lỗi lấy danh sách:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách file.' });
    }
});

app.get('/api/documents/templates', (req, res) => {
    try {
        let results = [];
        const scanDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (file.endsWith('.docx') || file.endsWith('.html')) {
                    results.push({
                        fileName: file,
                        relPath: path.relative(SAMPLES_DIR, fullPath).replace(/\\/g, '/'),
                        size: (stat.size / 1024).toFixed(2) + ' KB',
                        updatedAt: stat.mtime
                    });
                }
            }
        };
        scanDir(SAMPLES_DIR);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('[API] Lỗi lấy danh sách template:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy template.' });
    }
});

app.get('/api/documents/fields/:listName', async (req, res) => {
    try {
        const listName = req.params.listName;
        let sqlListName = null;
        try {
            const formResult = await fetchFromSQLAPI('HR_GetForm', listName, req.headers.authorization);
            if (formResult && (formResult.FormName || formResult.formname)) {
                sqlListName = formResult.FormName || formResult.formname;
            }
        } catch (e) {
            console.log(`[FIELDS] Không lấy được FormName từ CSDL cho '${listName}':`, e.message);
        }

        if (!sqlListName) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy biểu mẫu (FormName) tương ứng với mẫu in '${listName}' trong CSDL.`
            });
        }

        console.log(`[FIELDS] Ánh xạ file mẫu '${listName}' -> Bảng CSDL '${sqlListName}'`);

        let formFields = [];
        try {
            const fieldsUrl = `${SQL_API_BASE}/api/API_DanhSachTruongGiaoDien`;
            const payload = { FormName: sqlListName, Username: extractUserName(req), Limit: 1000 };
            const headers = {};
            if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
            const fieldsResp = await axios.post(fieldsUrl, payload, { headers, timeout: 5000 });
            if (fieldsResp.data && fieldsResp.data.records) {
                formFields = fieldsResp.data.records.map(r => r.FieldName || r.fieldName || r.fieldname).filter(Boolean);
            }
        } catch (fieldsErr) {
            console.warn(`[FIELDS] Lỗi lấy trường từ API_DanhSachTruongGiaoDien cho '${sqlListName}':`, fieldsErr.message);
        }

        let sampleRow = {};
        try {
            const sqlRow = await fetchFromSQLAPI(sqlListName, '', req.headers.authorization);
            if (sqlRow) sampleRow = sqlRow;
        } catch (e) { }

        const setup = await fetchSetupInfo(req.headers.authorization).catch(() => ({}));

        const allFieldsSet = new Set([
            ...Object.keys(setup),
            ...formFields,
            ...Object.keys(sampleRow)
        ]);

        const excludeFields = [
            'id', 'code', 'msg', 'records', 'autoid', 'formname', 'fieldname',
            'status', 'createdby', 'createdat', 'updatedby', 'updatedat'
        ];
        const fields = Array.from(allFieldsSet).filter(f => !excludeFields.includes(f.toLowerCase()));

        const formattedFields = fields.map(f => `{${f}}`);
        res.json({ success: true, fields: formattedFields });
    } catch (error) {
        console.error('[API] Lỗi lấy danh sách biến:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

app.post('/api/documents/generate', async (req, res) => {
    try {
        let { outputFileName, templateType, customerId, rowData, sqlListName } = req.body;
        if (!templateType) return res.status(400).json({ success: false, message: 'Thiếu templateType.' });
        if (!sqlListName) return res.status(400).json({ success: false, message: 'Thiếu sqlListName để truy vấn.' });
        if (!outputFileName) outputFileName = 'Generated_' + templateType;
        outputFileName = outputFileName.replace(/[\/\\:*?"<>|()+]/g, '_').replace(/\s+/g, '_');

        const setup = await fetchSetupInfo(req.headers.authorization).catch(() => ({}));
        let dataMap = { ...setup };

        let dbRow = null;
        if (customerId) {
            try {
                dbRow = await fetchFromSQLAPI(sqlListName, customerId, req.headers.authorization);
                console.log('[GENERATE] ✅ Lấy dữ liệu chi tiết từ SQL API thành công');
            } catch (e) {
                console.error('[GENERATE] Lỗi SQL API:', e.message);
            }
        }

        if (rowData && typeof rowData === 'object') {
            dataMap = { ...dataMap, ...rowData };
        }
        if (dbRow) {
            dataMap = { ...dataMap, ...dbRow };
        }

        // Tự động parse JSON từ CSDL
        dataMap = deepParseJsonStrings(dataMap);

        console.log('[GENERATE] dataMap:', JSON.stringify(dataMap));

        const docxTemplatePath = findTemplatePath(SAMPLES_DIR, templateType);
        if (!docxTemplatePath) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy template '${templateType}' trong samples/ hoặc các thư mục con.`
            });
        }

        if (docxTemplatePath.toLowerCase().endsWith('.doc')) {
            return res.status(400).json({
                success: false,
                message: `Mẫu biểu '${templateType}' đang là định dạng legacy (.doc). Vui lòng lưu thành định dạng .docx trước khi chạy!`
            });
        }

        const content = fs.readFileSync(docxTemplatePath, "binary");
        const zip = new PizZip(content);

        // Chuẩn hóa đường dẫn ZIP
        try {
            const fileNames = Object.keys(zip.files);
            for (const name of fileNames) {
                if (name.includes('\\')) {
                    const normalizedName = name.replace(/\\/g, '/');
                    zip.files[normalizedName] = zip.files[name];
                    if (zip.files[normalizedName]) {
                        zip.files[normalizedName].name = normalizedName;
                    }
                    delete zip.files[name];
                }
            }
        } catch (normErr) {
            console.warn('[GENERATE] ⚠️ Không thể chuẩn hóa đường dẫn trong ZIP:', normErr.message);
        }

        // Tự động làm sạch tag trong Word (XML CLEANER)
        try {
            const docXmlFile = zip.file("word/document.xml");
            if (docXmlFile) {
                let xmlContent = docXmlFile.asText();
                xmlContent = xmlContent.replace(/\{[^{}]*?\}/g, (match) => {
                    return match.replace(/<[^>]+>/g, "");
                });
                zip.file("word/document.xml", xmlContent);
            }
        } catch (cleanErr) {
            console.warn('[GENERATE] ⚠️ Không thể làm sạch XML tags:', cleanErr.message);
        }

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            parser: function (tag) {
                return {
                    get: function (scope) {
                        if (tag === '.') return scope;
                        let val = "";
                        if (scope && typeof scope === 'object') {
                            if (scope[tag] !== undefined && scope[tag] !== null) {
                                val = scope[tag];
                            } else {
                                const cleanTag = tag.toLowerCase().replace(/_/g, '');
                                const foundKey = Object.keys(scope).find(k => {
                                    const cleanKey = k.toLowerCase().replace(/_/g, '');
                                    return cleanKey === cleanTag;
                                });
                                if (foundKey && scope[foundKey] !== undefined && scope[foundKey] !== null) {
                                    val = scope[foundKey];
                                }
                            }
                        }
                        if (val && typeof val === 'object') {
                            return val;
                        }
                        return val === null || val === undefined ? "" : String(val);
                    }
                };
            },
            nullGetter() {
                return "";
            }
        });

        try {
            doc.render(dataMap);
            console.log('[GENERATE] ✅ Render dữ liệu vào template thành công');
        } catch (renderErr) {
            console.error('[GENERATE] ❌ Lỗi render:', renderErr.message);
            if (renderErr.properties && renderErr.properties.errors) {
                console.error('[GENERATE] Chi tiết:', JSON.stringify(renderErr.properties.errors));
            }
            throw renderErr;
        }

        let buf;
        try {
            const docZip = doc.getZip();
            if (!docZip) {
                throw new Error('getZip() trả về null lúc generate');
            }
            buf = docZip.generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            });
        } catch (genErr) {
            console.error('[GENERATE] ❌ Lỗi generate ZIP:', genErr.message);
            throw genErr;
        }

        const finalFileName = `${outputFileName}_${Date.now()}.docx`;

        // ── Xác định branch folder để lưu file ─────────────────────────────
        const userBranches = await getUserBranchesFromDB(req);
        const rowBranch = dataMap.BranchID || dataMap.branchId || dataMap.MaChiNhanh || null;
        
        let targetBranch;
        if (userBranches === null) {
            // Admin (BranchID=null): Luôn lưu là file Hệ thống (_admin). 
            // KHÔNG lấy branch của nhân viên để tránh hiển thị sai branch mà account không được gán.
            targetBranch = '_admin';
        } else if (userBranches.length > 0) {
            // User thường: ưu tiên branch từ data nếu user có quyền, không thì ép về branch đầu tiên của user
            const rowBranchClean = rowBranch ? String(rowBranch).split(',')[0].trim() : null;
            targetBranch = (rowBranchClean && userBranches.includes(rowBranchClean)) ? rowBranchClean : userBranches[0];
        } else {
            targetBranch = '_unassigned';
        }

        const branchDir = path.join(UPLOADS_DIR, targetBranch);
        if (!fs.existsSync(branchDir)) fs.mkdirSync(branchDir, { recursive: true });

        const outputPath = path.join(branchDir, finalFileName);
        fs.writeFileSync(outputPath, buf);
        console.log(`[GENERATE] 📁 Lưu vào branch folder: ${targetBranch}/`);

        // Ghi Log vào HR_Documents
        try {
            const fileHash = crypto.createHash('sha256').update(buf).digest('hex');
            const refId = dataMap.MaHopDong || dataMap.maHopDong || customerId || '';
            const userName = extractUserName(req);
            const docData = {
                RefID: refId,
                DocType: templateType,
                VersionNo: null,
                FilePath: `${targetBranch}/${finalFileName}`,
                BranchID: targetBranch,
                FileHash: fileHash,
                Status: 'ACTIVE',
                GeneratedBy: userName
            };
            const payload = {
                List: 'HR_Documents',
                Func: 'Save',
                UserName: userName,
                JsonData: JSON.stringify(docData)
            };
            const headers = {};
            if (req.headers && req.headers.authorization) {
                headers['Authorization'] = req.headers.authorization;
            }
            await axios.post(`${SQL_API_BASE}/api/API_Gateway_Router`, payload, { headers });
            console.log(`[AUDIT] ✅ Đã lưu vết Sổ lưu trữ cho file ${finalFileName}`);
        } catch (err) {
            console.error(`[AUDIT] ❌ Lỗi ghi log:`, err.message);
        }

        console.log(`[GENERATE] ✅ Tạo thành công: ${finalFileName}`);
        return res.json({ success: true, message: 'Tạo tài liệu thành công!', fileName: `${targetBranch}/${finalFileName}`, branch: targetBranch });

    } catch (error) {
        console.error('[API] Lỗi generate:', error);
        if (error.properties && error.properties.errors) {
            const details = error.properties.errors.map(e => e.message + (e.properties && e.properties.explanation ? ': ' + e.properties.explanation : '')).join('; ');
            return res.status(500).json({ success: false, message: 'Lỗi Docxtemplater: ' + details });
        }
        res.status(500).json({ success: false, message: 'Lỗi server: ' + (error.message || 'Unknown') });
    }
});

// DELETE với branch subfolder: /api/documents/CN001/file.docx
app.delete('/api/documents/:branch/:fileName', async (req, res) => {
    req._rawFileName = `${req.params.branch}/${req.params.fileName}`;
    return _handleDeleteDocument(req, res);
});
// DELETE không có branch: /api/documents/file.docx
app.delete('/api/documents/:fileName', async (req, res) => {
    req._rawFileName = req.params.fileName;
    return _handleDeleteDocument(req, res);
});

async function _handleDeleteDocument(req, res) {
    try {
        const rawFileName = req._rawFileName;
        const filePath = path.join(UPLOADS_DIR, rawFileName);

        // ── Kiểm tra quyền branch ──────────────────────────────────────────
        const userBranches = await getUserBranchesFromDB(req);
        const fileParts = rawFileName.replace(/\\/g, '/').split('/');
        const fileBranch = fileParts.length > 1 ? fileParts[0] : '_unassigned';
        const fileNameOnly = fileParts[fileParts.length - 1];

        if (userBranches !== null && !userBranches.includes(fileBranch)) {
            console.warn(`[BRANCH] ⛔ User không có quyền xóa file thuộc branch '${fileBranch}'`);
            return res.status(403).json({ success: false, message: `Bạn không có quyền xóa tài liệu của chi nhánh '${fileBranch}'.` });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            try {
                let parsedRefID = 'UNKNOWN';
                let parsedDocType = 'UNKNOWN';
                const nameWithoutExt = fileNameOnly.replace(/\.[^/.]+$/, '');
                const parts = nameWithoutExt.split('_');
                if (parts.length >= 3) {
                    const timestamp = parts[parts.length - 1];
                    if (/^\d+$/.test(timestamp)) {
                        parsedRefID = parts[parts.length - 2];
                        parsedDocType = parts.slice(0, parts.length - 2).join('_');
                    }
                }
                const userName = extractUserName(req);
                const payload = {
                    List: 'HR_Documents',
                    Func: 'Edit',
                    UserName: userName,
                    JsonData: JSON.stringify({
                        FilePath: rawFileName,
                        BranchID: fileBranch,
                        RefID: parsedRefID,
                        DocType: parsedDocType,
                        Status: 'DELETED',
                        DeletedBy: userName,
                        DeletedAt: new Date().toISOString()
                    })
                };
                await axios.post(`${SQL_API_BASE}/api/API_Gateway_Router`, payload);
                console.log(`[AUDIT] 🪦 Đã dán nhãn XÓA cho file ${rawFileName}`);
            } catch (err) {
                console.error('[AUDIT] ❌ Lỗi cập nhật bia mộ:', err.message);
            }
            res.json({ success: true, message: 'Xóa thành công!' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy file để xóa!' });
        }
    } catch (error) {
        console.error('[API] Lỗi xóa file:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa file.' });
    }
}

app.post('/api/upload-logo', (req, res) => {
    try {
        const { base64, fileName } = req.body;
        if (!base64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu base64' });

        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let imageBuffer = null;
        if (matches && matches.length === 3) {
            imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
            imageBuffer = Buffer.from(base64, 'base64');
        }

        const logoDir = path.join(__dirname, '..', 'Qplaza', 'Logo');
        if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

        const filePath = path.join(logoDir, fileName || 'logo.jpg');
        fs.writeFileSync(filePath, imageBuffer);

        console.log(`[UPLOAD] Đã lưu logo tại: ${filePath}`);
        res.json({ success: true, message: 'Upload logo thành công!', path: filePath });
    } catch (error) {
        console.error('[API] Lỗi upload logo:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi upload logo.' });
    }
});

app.post('/api/documents/callback', async (req, res) => {
    const respondSuccess = () => res.json({ error: 0 });
    try {
        const data = req.body;
        const docId = req.query.docId || 'unknown';
        const fileName = req.query.fileName || `${docId}.docx`;
        const status = data.status;

        console.log(`[ONLYOFFICE] Callback — DocID: ${docId}, File: ${fileName}, Status: ${status}`);

        const isTemplate = req.query.isTemplate === '1';
        const targetDir = isTemplate ? SAMPLES_DIR : UPLOADS_DIR;

        if (status === 2 || status === 6) {
            const downloadUri = data.url;
            if (!downloadUri) return respondSuccess();

            console.log(`[ONLYOFFICE] Đang lưu file... (${status === 2 ? 'Save' : 'Forcesave'})`);
            const filePath = path.join(targetDir, fileName);
            const response = await axios({ method: 'GET', url: downloadUri, responseType: 'stream' });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
            console.log(`[ONLYOFFICE] ✅ Đã lưu: ${fileName} vào ${isTemplate ? 'samples' : 'uploads'}`);
        }
        return respondSuccess();
    } catch (error) {
        console.error('[ONLYOFFICE] ❌ Lỗi Callback:', error.message);
        return respondSuccess();
    }
});

function deepParseJsonStrings(value) {
    if (typeof value === 'string') {
        const val = value.trim();
        if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
            try {
                return deepParseJsonStrings(JSON.parse(val));
            } catch (e) {
                return value;
            }
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepParseJsonStrings(item));
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const key in value) {
            out[key] = deepParseJsonStrings(value[key]);
        }
        return out;
    }
    return value;
}

function findTemplatePath(baseDir, templateName) {
    const cleanName = templateName.replace(/\.docx?$/i, '');
    const findRecursive = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const found = findRecursive(fullPath);
                if (found) return found;
            } else if (entry.isFile()) {
                const entryBaseName = entry.name.replace(/\.docx?$/i, '');
                if (entryBaseName.normalize().toLowerCase() === cleanName.normalize().toLowerCase()) {
                    return fullPath;
                }
            }
        }
        return null;
    };
    return findRecursive(baseDir);
}

app.get('/health', async (req, res) => {
    const storageWritable = await contractDocumentService.storageIsWritable();
    res.status(storageWritable ? 200 : 503).json({
        status: storageWritable ? 'ok' : 'degraded',
        service: 'HR Contract Document API',
        environment: documentConfig.environment,
        onlyOfficeConfigured: Boolean(documentConfig.onlyOfficePublicUrl),
        samplesAvailable: fs.existsSync(SAMPLES_DIR),
        storageWritable,
        sqlApiConfigured: Boolean(SQL_API_BASE)
    });
});

app.get('/', (req, res) => {
    res.json({
        service: 'HR Document API',
        status: '✅ Running smoothly',
        endpoints: {
            list: 'GET /api/documents',
            generate: 'POST /api/documents/generate',
            delete: 'DELETE /api/documents/:fileName',
            callback: 'POST /api/documents/callback'
        }
    });
});

contractDocumentService.cleanupExpired().catch((error) => {
    console.error('[CONTRACT CLEANUP]', error.message);
});
const cleanupTimer = setInterval(() => {
    contractDocumentService.cleanupExpired().catch((error) => {
        console.error('[CONTRACT CLEANUP]', error.message);
    });
}, 60 * 60 * 1000);
cleanupTimer.unref();

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = Number(error.statusCode) || 500;
    if (status >= 500) console.error('[SERVER]', error.message);
    if (String(req.path || '').toLowerCase().startsWith('/api/metadata')) res.set('Cache-Control', 'private, no-store');
    const body = { success: false, message: error.message || 'Lỗi máy chủ.' };
    if (error instanceof FieldSyncGatewayError && /^[A-Z0-9_]{3,80}$/.test(String(error.diagnosticCode || ''))) {
        body.code = error.diagnosticCode;
        const details = error.details || {};
        const safeDetails = {};
        if (Number.isInteger(details.upstreamStatus)) safeDetails.upstreamStatus = details.upstreamStatus;
        if (Number.isInteger(details.upstreamCode)) safeDetails.upstreamCode = details.upstreamCode;
        if (Number.isInteger(details.errorNumber)) safeDetails.errorNumber = details.errorNumber;
        if (Object.keys(safeDetails).length) body.diagnostic = safeDetails;
    }
    return res.status(status).json(body);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('=======================================================');
    console.log('       ✨ BACKEND SERVER - HR DOCUMENT MANAGEMENT     ');
    console.log('=======================================================');
    console.log(`[🚀] Server : http://127.0.0.1:${PORT}`);
    console.log(`[📁] Uploads: ${UPLOADS_DIR}`);
    console.log(`[📁] Samples: ${SAMPLES_DIR}`);
    console.log(`[🔗] SQL API: ${SQL_API_BASE}`);
    console.log('=======================================================');
});
