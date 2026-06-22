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
const SQL_API_BASE = 'https://qlt.bms79.com';
const SQL_API_USER = 'admin';

// Cache thông tin nhà hàng (tránh gọi API nhiều lần)
let _setupCache = null;
let _setupCacheTime = 0;
const SETUP_CACHE_TTL = 5 * 60 * 1000; // 5 phút

/** Lấy thông tin nhà hàng từ API_LayGiaTriSetup (có cache) */
async function fetchSetupInfo() {
    const now = Date.now();
    if (_setupCache && (now - _setupCacheTime) < SETUP_CACHE_TTL) return _setupCache;
    try {
        const url = `${SQL_API_BASE}/api/API_LayGiaTriSetup`;
        const resp = await axios.get(url, { timeout: 8000 });
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

/**
 * Tạo object thông tin Bên A từ setup API
 * API_LayGiaTriSetup trả về: CodeID='Com1' → tên công ty
 */
function mapBenA(setup) {
    // 'Com1' = Tên công ty theo bảng SY_Setup
    const tenNhaHang = setup['Com1'] || setup.Com1 || setup.TenNhaHang || setup.TenCongTy || 'NHÀ HÀNG TIỆC CƯỚI';
    return {
        TenNhaHang: tenNhaHang,
        SlogenNhaHang: setup.Slogan || setup.SlogenNhaHang || '★ LUXURY WEDDING & EVENTS ★',
        DiaChiNhaHang: setup.DiaChi || setup.DiaChiNhaHang || setup.Com2 || '',
        DienThoaiNhaHang: setup.DienThoai || setup.DienThoaiNhaHang || setup.Com3 || '',
        HotlineNhaHang: setup.Hotline || setup.HotlineNhaHang || setup.Com4 || '',
    };
}

/** Gọi API Gateway để lấy record theo List + Keyword */
async function fetchFromSQLAPI(listName, keyword) {
    const payload = {
        List: listName, Func: 'View', UserName: SQL_API_USER,
        Keyword: keyword || '', Page: 1, Limit: 1
    };
    const qs = encodeURIComponent(JSON.stringify(payload));
    const url = `${SQL_API_BASE}/api/API_Gateway_Router?q=${qs}`;
    console.log(`[SQL API] Gọi: ${listName} | Keyword: ${keyword}`);
    const resp = await axios.get(url, { timeout: 10000 });
    const json = resp.data;
    if (json && json.records && json.records.length > 0) return json.records[0];
    if (json && json.code === 0) return json;
    return null;
}

function mapHopDong(row, setup) {
    return {
        // Bên A — từ setup
        ...mapBenA(setup),
        // Bên B — tự động đổ toàn bộ từ API SQL
        ...row
    };
}

function mapDatCoc(row, setup) {
    return {
        // Bên A — từ setup
        ...mapBenA(setup),
        // Bên B — tự động đổ toàn bộ từ API SQL
        ...row
    };
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
 * 1.5 Lấy danh sách các biến dữ liệu cho một loại mẫu
 */
app.get('/api/documents/fields/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const API_MAP = {
            'hop_dong': { list: 'frmHopDong', mapFn: mapHopDong },
            'dat_coc': { list: 'frmBiennhancocchoancoccho', mapFn: mapDatCoc },
            'phieu_thu': { list: 'frmPhieuThu', mapFn: mapDatCoc },
            'de_nghi_thay_doi': { list: 'frmHopDong', mapFn: mapHopDong },
        };
        const cfg = API_MAP[type];
        if (!cfg) return res.status(400).json({ success: false, message: 'Invalid type' });

        // Lấy 1 dòng dữ liệu mẫu từ SQL API để quét tự động 100% cột
        let sampleRow = {};
        try {
            const sqlRow = await fetchFromSQLAPI(cfg.list, '');
            if (sqlRow) sampleRow = sqlRow;
        } catch (e) {
            console.log('[FIELDS] Không lấy được data mẫu từ DB, dùng object rỗng');
        }

        // Truyền qua map function: Kết quả = Tất cả cột SQL + Các cột ảo (ngày tháng, số tiền format)
        const finalData = cfg.mapFn(sampleRow, {});
        const fields = Object.keys(finalData);

        const formattedFields = fields.map(f => `{${f}}`);
        res.json({ success: true, fields: formattedFields });
    } catch (error) {
        console.error('[API] Lỗi lấy danh sách biến:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

app.post('/api/documents/generate', async (req, res) => {
    try {
        let { outputFileName, templateType, customerId, rowData } = req.body;
        if (!templateType) return res.status(400).json({ success: false, message: 'Thiếu templateType.' });
        if (!outputFileName) outputFileName = 'Generated_' + templateType;
        outputFileName = outputFileName.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');

        // ── 1. Lấy thông tin nhà hàng từ Setup API ──────────────────────────
        const setup = await fetchSetupInfo().catch(() => ({}));

        // ── 2. Map data từ rowData (frontend) hoặc fallback SQL API ─────────
        const API_MAP = {
            'hop_dong': { list: 'frmHopDong', mapFn: mapHopDong },
            'dat_coc': { list: 'frmBiennhancocchoancoccho', mapFn: mapDatCoc },
            'phieu_thu': { list: 'frmPhieuThu', mapFn: mapDatCoc },
            'de_nghi_thay_doi': { list: 'frmHopDong', mapFn: mapHopDong },
        };
        const apiCfg = API_MAP[templateType];
        let dataMap = mapBenA(setup);  // Luôn có thông tin nhà hàng

        if (rowData && typeof rowData === 'object') {
            // Frontend đã gửi kèm rowData (selected row từ DynamicFormEngine)
            dataMap = apiCfg ? apiCfg.mapFn(rowData, setup) : { ...dataMap, ...rowData };
            console.log('[GENERATE] ✅ Dùng rowData từ frontend');
        } else if (apiCfg && customerId) {
            // Fallback: gọi SQL API
            try {
                const row = await fetchFromSQLAPI(apiCfg.list, customerId);
                if (row) dataMap = apiCfg.mapFn(row, setup);
            } catch (e) {
                console.error('[GENERATE] Lỗi SQL API:', e.message);
            }
        }

        console.log('[GENERATE] dataMap:', JSON.stringify(dataMap));

        // ── 3. Đọc template DOCX ─────────────────────────────────────────────
        const docxTemplatePath = path.join(SAMPLES_DIR, `${templateType}.docx`);
        if (!fs.existsSync(docxTemplatePath)) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy template '${templateType}.docx' trong samples/. Vui lòng tạo file Word mẫu!`
            });
        }
        
        const content = fs.readFileSync(docxTemplatePath, "binary");

        // ── 4. Khởi tạo docxtemplater và bơm dữ liệu ─────────────────────────
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Đổ toàn bộ dataMap (Bên A + Bên B + Món ăn) vào template Word
        doc.render(dataMap);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // ── 5. Lưu file .docx đã sinh ra ──────────────
        const finalFileName = `${outputFileName}_${Date.now()}.docx`;
        const outputPath = path.join(UPLOADS_DIR, finalFileName);
        fs.writeFileSync(outputPath, buf);

        // ── 6. Ghi Log vào Tiec_Documents (Sổ lưu trữ) ───────────────────────
        try {
            // Tính toán mã băm SHA-256 từ nội dung file vật lý
            const fileHash = crypto.createHash('sha256').update(buf).digest('hex');

            const docData = {
                DocumentID: 'DOC_' + Date.now(), 
                TiecID: customerId || dataMap.Sohopdong || dataMap.MaChungTu || '', 
                FileName: finalFileName,
                FileType: templateType,
                VersionNo: 1, 
                Status: 'SIGNED', // Vừa in xong chốt cứng luôn
                FileHash: fileHash // Lưu mã băm chống giả mạo
            };
            const payload = {
                List: 'Tiec_Documents',
                Func: 'Save',
                UserName: req.body.UserName || 'system',
                data: docData
            };
            await axios.post(`${SQL_API_BASE}/api/API_Gateway_Router`, payload);
            console.log(`[AUDIT] ✅ Đã lưu vết Sổ lưu trữ cho file ${finalFileName}`);
        } catch(err) {
            console.error(`[AUDIT] ❌ Lỗi ghi log:`, err.message);
        }

        console.log(`[GENERATE] ✅ Tạo thành công: ${finalFileName}`);
        return res.json({ success: true, message: 'Tạo tài liệu thành công!', fileName: finalFileName });

    } catch (error) {
        console.error('[API] Lỗi generate:', error.message || error);
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
                const payload = {
                    List: 'Tiec_Documents',
                    Func: 'Edit', // Cập nhật lại Status
                    UserName: req.body.UserName || 'system',
                    data: {
                        FileName: fileName, // Dùng tên file để tìm record
                        Status: 'DELETED',
                        IsDeleted: 1
                    }
                };
                await axios.post(`${SQL_API_BASE}/api/API_Gateway_Router`, payload);
                console.log(`[AUDIT] 🪦 Đã dán nhãn XÓA cho file ${fileName} trong CSDL`);
            } catch(err) {
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


// ==========================================
// ROOT
// ==========================================
app.get('/', (req, res) => {
    res.json({
        service: 'Wedding Banquet Document API',
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
    console.log('       ✨ BACKEND SERVER - WEDDING BANQUET MANAGEMENT   ');
    console.log('=======================================================');
    console.log(`[🚀] Server : http://localhost:${PORT}`);
    console.log(`[📁] Uploads: ${UPLOADS_DIR}`);
    console.log(`[📁] Samples: ${SAMPLES_DIR}`);
    console.log(`[🔗] SQL API: ${SQL_API_BASE}`);
    console.log('=======================================================');
});
