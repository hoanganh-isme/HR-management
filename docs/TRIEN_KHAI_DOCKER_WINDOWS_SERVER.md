# Triển khai HR Management bằng Docker trên Windows Server 2022

Cấu hình này giữ đúng tên container và port đang có trên máy remote:

- `hr_frontend`: public `8080 -> 80`.
- `backend_app`: chỉ máy chủ truy cập `127.0.0.1:8083 -> 8081`.
- `onlyoffice_server`: chỉ máy chủ truy cập `127.0.0.1:8082 -> 80`.

Frontend Nginx chuyển `/docserver` vào backend và `/onlyoffice` vào OnlyOffice qua Docker network. Trình duyệt chỉ cần truy cập frontend; không mở trực tiếp 8082/8083 ra Internet.

## 1. Kiểm tra Docker

```powershell
docker info --format '{{.OSType}}'
docker compose version
```

`OSType` phải là `linux` vì Node.js, Nginx và OnlyOffice trong dự án đều dùng Linux image.

## 2. Tạo cấu hình riêng trên server

Sau khi pull code:

```powershell
cd C:\Dat\deploy\HR-management
Copy-Item .env.production.example .env.production
notepad .env.production
```

Thay toàn bộ `SERVER_IP_OR_DOMAIN` bằng IP/domain mà người dùng truy cập. Hai secret phải khác nhau, ngẫu nhiên và không commit. Có thể tạo mỗi secret bằng PowerShell:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Nếu truy cập thử bằng `http://10.0.0.10:8080`, ba giá trị phải đồng bộ:

```dotenv
DOCUMENT_PUBLIC_BASE_URL=http://10.0.0.10:8080/docserver
ONLYOFFICE_PUBLIC_URL=http://10.0.0.10:8080/onlyoffice
CORS_ALLOWED_ORIGINS=http://10.0.0.10:8080
```

Giữ nguyên URL nội bộ Docker:

```dotenv
DOCUMENT_INTERNAL_BASE_URL=http://backend-app:8081
```

## 3. Thay stack Docker cũ

Lệnh `down` dưới đây chỉ áp dụng cho project HR hiện tại; không chạy trong thư mục project khác:

```powershell
docker compose -f docker-compose.yml down
docker compose --env-file .env.production -f docker-compose.production.yml pull onlyoffice
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Không cần cài Node.js/npm hoặc OnlyOffice trực tiếp trên Windows Server. Image backend đã chứa Node.js; image OnlyOffice được Docker tải về.

## 4. Kiểm tra sau triển khai

Thay `SERVER_IP` rồi mở:

- Frontend: `http://SERVER_IP:8080`
- Backend health qua proxy: `http://SERVER_IP:8080/docserver/health`
- OnlyOffice API qua proxy: `http://SERVER_IP:8080/onlyoffice/web-apps/apps/api/documents/api.js`

Xem log khi có lỗi:

```powershell
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=150 backend-app
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=150 onlyoffice
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=150 web
```

Khi đưa vào sử dụng thật, đặt IIS/Nginx reverse proxy HTTPS phía trước port 8080 và đổi ba public URL trong `.env.production` sang domain HTTPS. Chỉ mở 80/443 ra Internet; không public 8082/8083.
