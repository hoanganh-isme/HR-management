/**
 * CORS Proxy Server cho Wedding Banquet Management
 * Bypass l\u1ed7i browser CORS (Cross-Origin Resource Sharing).
 * Forward: Localhost 8080 -> Backend (V\u00ed d\u1ee5: Localhost 5000)
 */

const http = require('http');

const LISTEN_PORT = 8081;
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8081; // Sửa cổng này tương ứng với cổng API Backend của bạn (VD: 5000 của .NET hoặc FastAPI v.v)

console.log('=======================================================');
console.log('       CORS PROXY - WEDDING BANQUET MANAGEMENT         ');
console.log('=======================================================');

const server = http.createServer((req, res) => {
    // 1. Th\u00eam Headers b\u1ebb kh\u00f3a CORS \u0111\u1ec3 \u0111\u00e1nh l\u1eeba tr\u00ecnh duy\u1ec7t Front-End
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // 2. Handle OPTIONS preflight (Trình duyệt thường g\u1eedi để th\u0103m d\u00f2 xem Server có cho cho phép API kh\u00f4ng)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`[Proxy] ${req.method} ${req.url}`);

    // --- ONLYOFFICE CALLBACK INTERCEPTOR ---
    // Bắt sự kiện khi người dùng bấm Lưu trên ONLYOFFICE
    if (req.method === 'POST' && req.url.startsWith('/api/documents/callback')) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // Status 2 = Đã lưu xong, Status 3 = Lưu lỗi/Lưu khẩn cấp
                if (data.status === 2 || data.status === 3) {
                    const downloadUri = data.url; // URL chứa file Word mới nhất do ONLYOFFICE nhả ra
                    const docId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('docId');
                    
                    console.log(`[ONLYOFFICE] Đã nhận sự kiện Lưu file cho DocID: ${docId}`);
                    console.log(`[ONLYOFFICE] Link tải file gốc mới nhất: ${downloadUri}`);
                    
                    // TODO: Tại đây anh có thể dùng thư viện 'http' để tải cái downloadUri kia về 
                    // đè lên thư mục /src/uploads/ của anh.
                }
                // BẮT BUỘC trả về {"error": 0} để báo ONLYOFFICE biết là Server anh đã nhận được file
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ "error": 0 }));
            } catch (e) {
                console.error("[ONLYOFFICE Error]", e);
                res.writeHead(500);
                res.end("Lỗi Callback");
            }
        });
        return;
    }
    // ---------------------------------------

    // 3. Chu\u1ea9n b\u1ecb g\u00f3i tin th\u1ef1c t\u1ebf g\u1eedi cho Backend \u1edf \u0111\u1eb1ng sau
    const options = {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: { ...req.headers }
    };

    // Remove host/origin/referer đ\u1ec3 Backend kh\u00f4ng th\u1ec3 b\u1eaft b\u1ebb là t\u1eeb origin l\u1ea1
    delete options.headers['host'];
    delete options.headers['origin'];
    delete options.headers['referer'];

    const proxyReq = http.request(options, (proxyRes) => {
        // G\u1ed9p header c\u1ee7a Backend r\u1ed3i th\u00eam CORS
        const responseHeaders = { ...proxyRes.headers };
        responseHeaders['Access-Control-Allow-Origin'] = '*';
        
        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error(`[Proxy Error] ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: true, 
             message: `L\u1ed7i Proxy: Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i t\u1edbi Backend \u1edf ${BACKEND_HOST}:${BACKEND_PORT}. Backend của bạn \u0111\u00e3 kh\u1edfi \u0111\u1ed9ng chưa?` 
        }));
    });

    // Pipe b\u1ea3n copy n\u1ed9i dung (VD c\u00e1c form data nh\u1eadp t\u1eeb Browser) sang Backend
    req.pipe(proxyReq, { end: true });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
    console.log(`[SUCCESS] Proxy dang chay tai: http://127.0.0.1:${LISTEN_PORT}`);
    console.log(`[INFO] Tat ca request se duoc day vao Backend tai: http://${BACKEND_HOST}:${BACKEND_PORT}`);
    console.log(`\n=> CÁCH D\u00d9NG: \u1ede file env.js, hãy \u0111\u1ed5i API_BASE thành 'http://127.0.0.1:${LISTEN_PORT}' \u0111\u1ec3 test localhost`);
});
