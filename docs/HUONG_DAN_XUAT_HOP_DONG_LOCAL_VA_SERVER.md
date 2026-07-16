# Hướng dẫn xuất hợp đồng trên máy local và máy chủ

Tài liệu này dành cho người mới làm quen với dự án HR Management. Chức năng mới tạo một bản nháp DOCX, cho phép chỉnh sửa và xem lại, sau đó chỉ ghi vào tài liệu đính kèm của hợp đồng khi người dùng bấm **Lưu vào hợp đồng**.

## A. Chạy trên máy Windows

### 1. Chuẩn bị

Cần có Windows 10/11, Node.js 20 trở lên, npm, Docker Desktop và VS Code với Live Server hoặc một static server tương đương. Kiểm tra Node bằng `node --version` và Docker bằng `docker --version`.

### 2. Lấy source và chuyển đúng nhánh

```powershell
git clone https://github.com/hoanganh-isme/HR-management.git
cd HR-management
git switch refactor/hr-cleanup
```

### 3. Cài backend

```powershell
cd backend-app
npm install
```

File `.env` không bắt buộc ở development nếu `env.js` tại thư mục gốc có `API_BASE` hợp lệ. Khi cần cấu hình riêng, sao chép `.env.example` thành `.env`, sau đó chỉ thay các giá trị phù hợp với máy của bạn. Không commit `.env`.

### 4. Khởi động OnlyOffice bằng Docker

Từ thư mục gốc repository:

```powershell
docker compose -f docker-compose.document.local.yml up -d
docker compose -f docker-compose.document.local.yml ps
```

Mở `http://127.0.0.1:8001/web-apps/apps/api/documents/api.js`. Nếu trình duyệt hiển thị hoặc tải được JavaScript thì Document Server đã sẵn sàng.

Compose local bật `ALLOW_PRIVATE_IP_ADDRESS=true` để OnlyOffice trong container được phép tải DOCX và gửi callback tới `host.docker.internal`. Chỉ dùng thiết lập này trong môi trường local tin cậy; production nên dùng hostname/container network nội bộ được kiểm soát.

### 5. Chạy Document API Node.js

Mở một terminal khác:

```powershell
cd backend-app
npm run dev
```

Kiểm tra `http://127.0.0.1:8081/health`. Kết quả bình thường có `status: "ok"`, `service: "HR Contract Document API"` và `onlyOfficeConfigured: true`.

### 6. Chạy frontend

Mở thư mục gốc bằng VS Code, dùng Live Server để chạy `index.html`, sau đó mở `http://127.0.0.1:5500`. Các origin local được chấp nhận thêm là `http://localhost:5500`, `http://127.0.0.1:4173` và `http://localhost:4173`.

Repository đã có `.vscode/settings.json` để Live Server bỏ qua `backend-app/storage`, `backend-app/uploads` và thư mục backup mẫu. Sau khi lấy cấu hình mới, phải **Stop Live Server** rồi **Go Live** lại một lần. Nếu không khởi động lại, mỗi lần backend tạo draft DOCX, Live Server sẽ hiểu nhầm đó là thay đổi source và tự reload trang đang mở.

Đăng nhập, mở danh sách hợp đồng, chọn đúng một dòng rồi bấm **Xuất Hợp Đồng**. Không mở chức năng chỉnh sửa trước khi OnlyOffice đã sẵn sàng.

### 7. Các URL local

- Frontend: `http://127.0.0.1:5500`
- Document API: `http://127.0.0.1:8081`
- Health check: `http://127.0.0.1:8081/health`
- OnlyOffice: `http://127.0.0.1:8001`
- URL Node.js cung cấp cho container: `http://host.docker.internal:8081`

### 8. Xử lý lỗi thường gặp

- Port 8001 bị chiếm: chạy `Get-NetTCPConnection -LocalPort 8001`, dừng chương trình không cần thiết hoặc đổi port đồng bộ trong compose, `env.js` và `.env`.
- Port 8081 bị chiếm: chạy `Get-NetTCPConnection -LocalPort 8081`; không chạy hai backend cùng lúc.
- Docker Desktop chưa chạy: mở Docker Desktop, chờ trạng thái Engine running rồi chạy lại compose.
- OnlyOffice chưa sẵn sàng: xem log bằng `docker compose -f docker-compose.document.local.yml logs -f` và đợi API JavaScript trả HTTP 200.
- Callback không về hoặc OnlyOffice báo không thể lưu/tải tài liệu: kiểm tra `DOCUMENT_INTERNAL_BASE_URL=http://host.docker.internal:8081`, `extra_hosts` và `ALLOW_PRIVATE_IP_ADDRESS=true` trong compose local, rồi recreate container.
- `host.docker.internal` không truy cập được trên Linux: Docker phải hỗ trợ `host-gateway` và compose phải có `host.docker.internal:host-gateway`.
- SQL API không kết nối được: kiểm tra `SQL_API_BASE`; development có thể lấy `API_BASE` từ `env.js`, production thì bắt buộc khai báo biến môi trường.
- Template không tồn tại: `TemplateFile` trong `HR_HopDongAddfile` phải đúng basename của file `.docx` thật trong `backend-app/samples`.
- Placeholder bị chia nhỏ trong Word: lưu lại DOCX; backend có bước chuẩn hóa tag nằm giữa các XML run, nhưng placeholder vẫn nên viết liền dạng `{PersonName}`.
- File quá dung lượng: mặc định tối đa 20MB, điều chỉnh bằng `MAX_DOCX_SIZE_MB` nếu hạ tầng cho phép.
- CORS bị chặn: thêm chính xác origin frontend vào `CORS_ALLOWED_ORIGINS`, không dùng ký tự `*`.

Các lệnh Docker hữu ích:

```powershell
docker compose -f docker-compose.document.local.yml ps
docker compose -f docker-compose.document.local.yml logs -f
docker compose -f docker-compose.document.local.yml down
```

## B. Cách sử dụng nghiệp vụ

### Xuất và chỉnh sửa hợp đồng

Chọn đúng một hợp đồng và bấm **Xuất Hợp Đồng**. Hệ thống lấy danh sách mẫu từ `HR_HopDongAddfile`, backend đọc lại dữ liệu hợp đồng từ SQL API, render DOCX rồi lưu vào `backend-app/storage/contract-drafts/{draftId}`. Bản nháp này chưa nằm trong `HR_HopDongAttachTbl`, `uploads` hoặc `HR_Documents`.

Trong editor có các nút **Xem trước**, **Tải DOCX**, **Tải bản đã sửa lên**, **Lưu vào hợp đồng** và **Đóng**. OnlyOffice callback cập nhật file trong draft. Khi OnlyOffice không chạy, vẫn có thể tải DOCX, sửa bằng WPS/Word rồi tải file lên lại. Chỉ nút **Lưu vào hợp đồng** mới finalize vào attachment DB và reload tab tài liệu.

### Quản lý mẫu

Bấm **Quản lý mẫu hợp đồng**, chọn một `TemplateFile` đã đăng ký. Backend copy file active sang `backend-app/storage/template-workspaces/{workspaceId}/template.docx`; OnlyOffice chỉ sửa bản copy này. Dùng **Kiểm tra placeholder** để xem biến hợp lệ và biến chưa xác định. Khi bấm **Áp dụng mẫu**, backend backup mẫu cũ vào `backend-app/samples/backups`, thay file active bằng thao tác atomic và xóa workspace sau khi thành công.

Muốn khôi phục mẫu, chọn file backup phù hợp trong `backend-app/samples/backups`, dừng phiên chỉnh sửa mẫu đang mở, sao chép backup về đúng tên `TemplateFile` trong `backend-app/samples`, sau đó khởi động lại thao tác quản lý mẫu. Luôn giữ một bản backup ngoài máy chủ trước khi khôi phục thủ công.

## C. Cách đọc source code

1. `src/js/modules/hr/definitions/contract.js`: khai báo form hợp đồng, khóa chính, tab attachment và bật nút xuất hợp đồng; được DynamicFormEngine đọc.
2. `src/js/utils/DocumentExportPlugin.js`: nhận danh sách dòng đang chọn, tạo hai nút mỏng và gọi ContractDocumentActions; không gọi HTTP.
3. `src/js/modules/hr/actions/contract-document.actions.js`: dựng modal chọn mẫu, editor overlay, preview, upload, finalize và quản lý mẫu; gọi ContractDocumentApi.
4. `src/js/modules/hr/actions/contract-document.api.js`: nhận dữ liệu từ actions, chỉ thực hiện HTTP và trả JSON.
5. `backend-app/src/contracts/contract-document.routes.js`: nhận request Express, kiểm tra request cơ bản, gọi service và trả response.
6. `backend-app/src/contracts/contract-document.service.js`: điều phối tạo draft, editor config, callback, upload, finalize và workspace mẫu.
7. `backend-app/src/contracts/contract-document.db.js`: đọc hợp đồng, mẫu, quyền và lưu attachment qua SQL API Gateway.
8. `backend-app/src/contracts/contract-document.store.js`: đọc/ghi draft và workspace trên filesystem bằng file `.new` rồi rename.
9. `backend-app/src/contracts/docx-template.js`: kiểm tra cấu trúc DOCX, render placeholder và đọc danh sách placeholder.
10. `backend-app/src/config/document-config.js`: đọc `.env`, fallback development từ `env.js`, kiểm tra secret và cung cấp URL/path cho các file backend khác.

API SQL thực tế dùng để lưu attachment là `POST {SQL_API_BASE}/api/API_Gateway_Router` với `List: "API_HopDongLaoDong_Attach"`, `Func: "Save"` và `JsonData` gồm `UserAutoID`, `MaHopDong`, `FileName`, `FileType`, `FileSize`, `Content`, `Base64Content`. Cấu hình `WA_API` hiện tại chuyển thao tác Save này vào procedure chuyên biệt `API_HopDongLaoDong_Attach_Save`; backend dùng đúng contract đã đăng ký, không tự đoán tên procedure.

## D. Triển khai lên Linux server

### 1. Chuẩn bị hạ tầng

Cài Node.js 20, npm, Docker Engine và Docker Compose. Tạo DNS cho frontend HR và bật HTTPS. Chỉ mở cổng 80/443 ra Internet; không public trực tiếp 8081 hoặc port nội bộ OnlyOffice. Gắn persistent volume cho OnlyOffice, `backend-app/storage` và `backend-app/samples`; cấp quyền ghi cho user chạy Node.js.

Production phải dùng hai secret mạnh, cố định và khác nhau. Không lưu secret thật trong source hoặc tài liệu:

```dotenv
NODE_ENV=production
PORT=8081
SQL_API_BASE=https://sql-api.example.com
SQL_API_USER=
DOCUMENT_PUBLIC_BASE_URL=https://hr.example.com/doc-api
DOCUMENT_INTERNAL_BASE_URL=http://document-api:8081
ONLYOFFICE_PUBLIC_URL=https://hr.example.com/onlyoffice
ONLYOFFICE_JWT_ENABLED=true
ONLYOFFICE_JWT_SECRET=<TAO_SECRET_MANH>
DRAFT_SIGNING_SECRET=<TAO_SECRET_KHAC>
CORS_ALLOWED_ORIGINS=https://hr.example.com
DRAFT_TTL_HOURS=24
MAX_DOCX_SIZE_MB=20
```

Nếu thiếu `DRAFT_SIGNING_SECRET`, backend production sẽ dừng. Nếu bật JWT mà thiếu `ONLYOFFICE_JWT_SECRET`, backend cũng sẽ dừng. Cấu hình container OnlyOffice dùng cùng `ONLYOFFICE_JWT_SECRET` với backend.

Chạy backend bằng systemd hoặc PM2, bật tự khởi động, log rotation và giới hạn tài nguyên. Lập lịch kiểm tra cleanup draft hết hạn. Backup định kỳ `samples`, attachment DB và secret; không backup secret chung vào nơi công khai.

### 2. Reverse proxy Nginx minh họa

```nginx
location /doc-api/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}

location /onlyoffice/ {
    proxy_pass http://127.0.0.1:8001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

Khai báo `map $http_upgrade $connection_upgrade` trong khối `http` của Nginx để hỗ trợ WebSocket. Frontend production có thể đặt `window.HRM_RUNTIME_CONFIG.DOCUMENT_SERVICE_BASE` và `ONLYOFFICE_PUBLIC_URL` trước khi tải `env.js`, nhờ đó không cần sửa source nghiệp vụ.

### 3. Checklist sau triển khai

Kiểm tra HTTPS frontend, `/doc-api/health`, OnlyOffice API JavaScript, callback từ OnlyOffice đến Node.js, kết nối Node.js đến SQL API, CORS allow-list, quyền thư mục, persistent volume, backup, cleanup draft và log rotation. Tạo một draft thử, xác nhận chưa có attachment, sửa và preview, upload bằng WPS/Word, finalize đúng một attachment, reload tab tài liệu, sửa mẫu bằng workspace copy rồi kiểm tra backup được tạo.
