import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

// ==========================================
// THIẾT LẬP THƯ MỤC
// ==========================================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SAMPLES_DIR = path.join(__dirname, 'samples');

[UPLOADS_DIR, SAMPLES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ==========================================
// MIDDLEWARE
// ==========================================
// Sử dụng cors middleware của Express để luôn tự động thêm headers CORS đầy đủ
app.use(cors({ origin: '*' }));

app.use('/uploads', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}, express.static(UPLOADS_DIR));

app.use('/samples', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}, express.static(SAMPLES_DIR));

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('[EXPRESS] Lỗi parse JSON payload!');
        return res.json({ error: 0, message: 'Invalid JSON payload' });
    }
    next();
});

// ==========================================
// API GATEWAY CHÍNH (SQL Server)
// ==========================================
let SQL_API_BASE;
const SQL_API_USER = 'admin';

// Tự động tải API_BASE từ env.js (Bắt buộc)
try {
    const possiblePaths = [
        path.join(__dirname, '../env.js'),
        path.join(__dirname, 'env.js'),
        '/env.js',
        '/app/env.js'
    ];
    let envJsPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            envJsPath = p;
            break;
        }
    }
    if (!envJsPath) {
        throw new Error(`Không tìm thấy file env.js ở bất kỳ đường dẫn nào: ${possiblePaths.join(', ')}`);
    }
    const envContent = fs.readFileSync(envJsPath, 'utf8');
    const matchBase = envContent.match(/API_BASE\s*:\s*['"`](.*?)['"`]/);
    if (!matchBase || !matchBase[1]) {
        throw new Error('Không tìm thấy API_BASE trong file env.js!');
    }
    SQL_API_BASE = matchBase[1].trim();
    console.log(`[CONFIG] Đã tải SQL_API_BASE từ env.js (${envJsPath}): ${SQL_API_BASE}`);
} catch (err) {
    console.error('[CRITICAL] Không thể chạy server vì thiếu cấu hình env.js:', err.message);
    process.exit(1);
}

/** Giải mã username từ token hoặc fallback */
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

// Cache thông tin nhà hàng (tránh gọi API nhiều lần)
let _setupCache = null;
let _setupCacheTime = 0;
const SETUP_CACHE_TTL = 5 * 60 * 1000; // 5 phút

/** Helper function to execute axios requests with retries */
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

/** Lấy thông tin nhà hàng từ API_LayGiaTriSetup (có cache) */
async function fetchSetupInfo(authToken) {
    const now = Date.now();
    if (_setupCache && (now - _setupCacheTime) < SETUP_CACHE_TTL) return _setupCache;
    try {
        const url = `${SQL_API_BASE}/api/API_LayGiaTriSetup`;
        const headers = {};
        if (authToken) headers['Authorization'] = authToken;
        const resp = await axiosGetWithRetry(url, { headers, timeout: 8000 }, 3, 1000);
        const json = resp.data;
        // API_LayGiaTriSetup trả về rows có CodeID + CodeValue (xem SQL)
        const rows = json.records || (Array.isArray(json) ? json : []);
        const setup = {};
        rows.forEach(r => {
            // Field name thực tế theo SQL: CodeID, CodeValue
            const key = r.CodeID || r.codeID || r.codeid || r.MaSetup;
            const val = r.CodeValue || r.codeValue || r.GiaTri || r.Value || '';
            if (key) setup[key] = val;
        });
        _setupCache = setup;
        _setupCacheTime = now;
        console.log('[SETUP] Keys:', Object.keys(setup).join(', '), '| Raw setup:', JSON.stringify(setup));
        return setup;
    } catch (err) {
        console.error('[SETUP] Lỗi gọi API_LayGiaTriSetup:', err.message);
        return _setupCache || {};
    }
}

/** Gọi API Gateway để lấy record theo List + Keyword */
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

// ==========================================
// API: QUẢN LÝ TÀI LIỆU
// ==========================================

/**
 * 1. Lấy danh sách tài liệu
 */
app.get('/api/documents', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        const fileList = files
            .filter(file => file.endsWith('.docx') || file.endsWith('.xlsx') || file.endsWith('.doc'))
            .map(file => {
                const stats = fs.statSync(path.join(UPLOADS_DIR, file));
                return {
                    fileName: file,
                    size: (stats.size / 1024).toFixed(2) + ' KB',
                    createdAt: stats.birthtime,
                    updatedAt: stats.mtime
                };
            });
        res.json({ success: true, data: fileList });
    } catch (error) {
        console.error('[API] Lỗi lấy danh sách:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách file.' });
    }
});

/**
 * Lấy danh sách Mẫu gốc (Templates)
 */
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
                    // Trả về tên file và đường dẫn tương đối để dễ hiển thị
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

/**
 * 1.5 Lấy danh sách các biến dữ liệu cho một loại mẫu
 */
app.get('/api/documents/fields/:listName', async (req, res) => {
    try {
        const listName = req.params.listName;

        // Dynamic lookup FormName via HR_HopDongAddfile_GetForm routing
        let sqlListName = 'WA_HopDongLaoDongFrm'; // Default fallback
        try {
            const formResult = await fetchFromSQLAPI('HR_HopDongAddfile_GetForm', listName, req.headers.authorization);
            if (formResult && (formResult.FormName || formResult.formname)) {
                sqlListName = formResult.FormName || formResult.formname;
            }
        } catch (e) {
            console.log(`[FIELDS] Không lấy được FormName từ CSDL cho '${listName}':`, e.message);
        }

        console.log(`[FIELDS] Ánh xạ file mẫu '${listName}' -> Bảng CSDL '${sqlListName}'`);

        // 1. Lấy danh sách các trường được cấu hình trong SY_FormatFields cho form này
        let formFields = [];
        try {
            const fieldsUrl = `${SQL_API_BASE}/api/API_DanhSachTruongGiaoDien`;
            const payload = {
                FormName: sqlListName,
                Username: 'admin',
                Limit: 1000
            };
            const headers = {};
            if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
            const fieldsResp = await axios.post(fieldsUrl, payload, { headers, timeout: 5000 });
            if (fieldsResp.data && fieldsResp.data.records) {
                formFields = fieldsResp.data.records.map(r => r.FieldName || r.fieldName || r.fieldname).filter(Boolean);
                console.log(`[FIELDS] Lấy thành công ${formFields.length} trường từ SY_FormatFields cho ${sqlListName}`);
            }
        } catch (fieldsErr) {
            console.warn(`[FIELDS] Lỗi lấy trường từ API_DanhSachTruongGiaoDien cho '${sqlListName}':`, fieldsErr.message);
        }

        // 2. Lấy 1 dòng dữ liệu mẫu từ SQL API làm dự phòng (fallback) để quét thêm cột nếu có
        let sampleRow = {};
        try {
            const sqlRow = await fetchFromSQLAPI(sqlListName, '', req.headers.authorization);
            if (sqlRow) sampleRow = sqlRow;
        } catch (e) {
            console.log(`[FIELDS] Không lấy được data mẫu từ DB cho '${sqlListName}', dùng object rỗng:`, e.message);
        }

        // 3. Lấy thông tin cấu hình nhà hàng (setup)
        const setup = await fetchSetupInfo(req.headers.authorization).catch(() => ({}));

        // Gộp tất cả các trường từ 3 nguồn và loại bỏ trùng lặp
        const allFieldsSet = new Set([
            ...Object.keys(setup),
            ...formFields,
            ...Object.keys(sampleRow)
        ]);

        // Loại bỏ các trường hệ thống dư thừa không dùng trong biểu mẫu .docx
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
        // Lọc bỏ tất cả ký tự đặc biệt, dấu ngoặc, dấu cộng để ONLYOFFICE không bị lỗi 400 Bad Request
        outputFileName = outputFileName.replace(/[\/\\:*?"<>|()+]/g, '_').replace(/\s+/g, '_');

        // ── 1. Lấy thông tin nhà hàng từ Setup API ──────────────────────────
        const setup = await fetchSetupInfo(req.headers.authorization).catch(() => ({}));

        // ── 2. Map data từ rowData (frontend) hoặc SQL API ─────────
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

        // Merge dữ liệu: setup -> rowData từ frontend -> dbRow từ SQL API (ưu tiên cao nhất)
        if (rowData && typeof rowData === 'object') {
            dataMap = { ...dataMap, ...rowData };
        }
        if (dbRow) {
            dataMap = { ...dataMap, ...dbRow };
        }

        // Tự động parse JSON từ CSDL (kể cả JSON lồng nhau)
        dataMap = deepParseJsonStrings(dataMap);

        console.log('[GENERATE] dataMap:', JSON.stringify(dataMap));

        // ── 3. Đọc template DOCX (Tìm kiếm đệ quy) ───────────────────────────
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

        // ── 4. Khởi tạo docxtemplater và bơm dữ liệu ─────────────────────────
        const zip = new PizZip(content);

        // --- CHUẨN HÓA ĐƯỜNG DẪN ZIP (HỖ TRỢ ĐƯỜNG DẪN WINDOWS) ---
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

        // --- TỰ ĐỘNG LÀM SẠCH TAG TRONG WORD (XML CLEANER) ---
        try {
            const docXmlFile = zip.file("word/document.xml");
            if (docXmlFile) {
                let xmlContent = docXmlFile.asText();
                xmlContent = xmlContent.replace(/\{[^{}]*?<[^>]+>[^{}]*?\}/g, (match) => {
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

        // Đổ toàn bộ dataMap vào template Word
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

        // ── 5. Lưu file .docx đã sinh ra ──────────────
        const finalFileName = `${outputFileName}_${Date.now()}.docx`;
        const outputPath = path.join(UPLOADS_DIR, finalFileName);
        fs.writeFileSync(outputPath, buf);

        // ── 6. Ghi Log vào HR_Documents (Sổ lưu trữ tài liệu) ───────────────────────
        try {
            const fileHash = crypto.createHash('sha256').update(buf).digest('hex');
            const refId = dataMap.MaHopDong || dataMap.maHopDong || customerId || '';
            const userName = extractUserName(req);
            const docData = {
                RefID: refId,
                DocType: templateType,
                VersionNo: null,
                FilePath: finalFileName,
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
        return res.json({ success: true, message: 'Tạo tài liệu thành công!', fileName: finalFileName });

    } catch (error) {
        console.error('[API] Lỗi generate:', error);
        if (error.properties && error.properties.errors) {
            console.error('[API] Chi tiết lỗi docxtemplater:', JSON.stringify(error.properties.errors));
            const details = error.properties.errors.map(e => e.message + (e.properties && e.properties.explanation ? ': ' + e.properties.explanation : '')).join('; ');
            return res.status(500).json({ success: false, message: 'Lỗi Docxtemplater: ' + details });
        }
        res.status(500).json({ success: false, message: 'Lỗi server: ' + (error.message || 'Unknown') });
    }
});

/**
 * 3. Xóa tài liệu
 */
app.delete('/api/documents/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(UPLOADS_DIR, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Xóa file vật lý (Hard delete)

            // Cập nhật Bia mộ (Soft Delete) trong CSDL
            try {
                // Thử phân tách tên file để lấy RefID và DocType phòng khi file chưa có trong CSDL
                // Định dạng chuẩn: {DocType}_{RefID}_{Timestamp}.docx
                let parsedRefID = 'UNKNOWN';
                let parsedDocType = 'UNKNOWN';

                const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
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
                    Func: 'Edit', // Cập nhật lại Status
                    UserName: userName,
                    JsonData: JSON.stringify({
                        FilePath: fileName, // Dùng FilePath làm khóa tìm kiếm
                        RefID: parsedRefID,
                        DocType: parsedDocType,
                        Status: 'DELETED',
                        DeletedBy: userName,
                        DeletedAt: new Date().toISOString()
                    })
                };
                await axios.post(`${SQL_API_BASE}/api/API_Gateway_Router`, payload);
                console.log(`[AUDIT] 🪦 Đã dán nhãn XÓA cho file ${fileName} trong CSDL`);
            } catch (err) {
                console.error(`[AUDIT] ❌ Lỗi cập nhật bia mộ:`, err.message);
            }

            res.json({ success: true, message: 'Xóa thành công!' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy file để xóa!' });
        }
    } catch (error) {
        console.error('[API] Lỗi xóa file:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa file.' });
    }
});

/**
 * 4. Upload Logo
 */
app.post('/api/upload-logo', (req, res) => {
    try {
        const { base64, fileName } = req.body;
        if (!base64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu base64' });

        // base64 có dạng: "data:image/jpeg;base64,/9j/4AA..."
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let imageBuffer = null;
        if (matches && matches.length === 3) {
            imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
            imageBuffer = Buffer.from(base64, 'base64');
        }

        // Mô phỏng lưu vào thư mục Qplaza\Logo theo yêu cầu TODO.md
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

// ==========================================
// API: ONLYOFFICE CALLBACK
// ==========================================
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
            if (!downloadUri) { console.warn('[ONLYOFFICE] Không có URL tải file!'); return respondSuccess(); }

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

/** Parse đệ quy mọi chuỗi JSON trong object/array (không hardcode field menu/dịch vụ). */
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

// ==========================================
// ROOT
// ==========================================
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

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('=======================================================');
    console.log('       ✨ BACKEND SERVER - HR DOCUMENT MANAGEMENT     ');
    console.log('=======================================================');
    console.log(`[🚀] Server : http://localhost:${PORT}`);
    console.log(`[📁] Uploads: ${UPLOADS_DIR}`);
    console.log(`[📁] Samples: ${SAMPLES_DIR}`);
    console.log(`[🔗] SQL API: ${SQL_API_BASE}`);
    console.log('=======================================================');
});
