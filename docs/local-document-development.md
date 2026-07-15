# Phát triển tài liệu hợp đồng cục bộ

Tài liệu này mô tả môi trường local cho Document API và ONLYOFFICE. Luồng hợp đồng mới lưu bản nháp trong `backend-app/storage/drafts`, sau đó chỉ lưu file chính thức vào `HR_HopDongAttachTbl` qua SQL Gateway khi người dùng finalize.

## 1. Cài Docker Desktop

Cài Docker Desktop theo hệ điều hành của máy phát triển. Không cần cài tự động bằng script của repository.

Kiểm tra:

```powershell
docker version
docker compose version
```

## 2. Chạy ONLYOFFICE local

Ví dụ chạy Document Server local:

```powershell
docker run -i -t -d -p 8000:80 --name hr-onlyoffice onlyoffice/documentserver
```

Nếu container cũ đã tồn tại thì dùng:

```powershell
docker start hr-onlyoffice
```

Mở `http://localhost:8000` để kiểm tra Document Server đã khởi động.

## 3. Chạy Node Document API

Sao chép `backend-app/.env.example` thành `backend-app/.env`, sau đó điền `SQL_API_BASE` của môi trường được phép sử dụng. Không commit `.env` và không đặt mật khẩu trong file này.

Với OnlyOffice chạy trong Docker, `DOCUMENT_INTERNAL_BASE_URL` thường cần là `http://host.docker.internal:8081` để container tải được file từ Node.

```powershell
Set-Location backend-app
npm install
npm run dev
```

Node Document API chạy tại `http://localhost:8081`.

## 4. Chạy frontend

Từ thư mục gốc repository, chạy máy chủ tĩnh hiện có của dự án hoặc mở frontend qua URL development đang được cấu hình. Frontend gọi Node Document API qua cấu hình `DOCUMENT_MANAGER` và không tự ghép URL callback/document key.

Ví dụ máy chủ tĩnh:

```powershell
npx serve . -l 4173
```

## 5. Kiểm tra health

```powershell
Invoke-RestMethod http://localhost:8081/health
```

Kết quả cần có `status = ok`, `sqlApiConfigured = true` khi đã cấu hình SQL Gateway.

## 6. Kiểm tra OnlyOffice

```powershell
Invoke-WebRequest http://localhost:8000 -UseBasicParsing
Invoke-WebRequest http://localhost:8000/web-apps/apps/api/documents/api.js -UseBasicParsing
```

Nếu sử dụng reverse proxy của hệ thống, kiểm tra thêm đường dẫn proxy `/onlyoffice/...` tương ứng với môi trường frontend.

## 7. Kiểm tra Document Server tải được file

Tạo bản nháp bằng giao diện hợp đồng hoặc API sau khi đăng nhập. Node trả `editorConfig.document.url` dùng `DOCUMENT_INTERNAL_BASE_URL`. Trong log OnlyOffice cần thấy Document Server tải được URL file draft và không có lỗi DNS/connection refused.

Không dùng `localhost` trong URL mà container OnlyOffice phải truy cập. Dùng `host.docker.internal` hoặc hostname mà Docker có thể phân giải.

## 8. Kiểm tra callback

Mở một draft trong OnlyOffice, sửa một nội dung nhỏ rồi đóng trình sửa. Kiểm tra:

1. `metadata.json` trong `backend-app/storage/drafts/<draftId>` cập nhật `lastOnlyOfficeStatus`.
2. callback status `2` đặt `finalCallbackCompleted = true`.
3. callback lỗi trả `error = 1` và bản nháp vẫn còn.
4. nút **Lưu hợp đồng** gọi finalize; chỉ khi SQL Gateway trả `UserAutoID` thì draft mới bị xóa.

Nếu SQL Gateway lỗi hoặc chưa chạy script đăng ký API tài liệu, finalize phải báo lỗi và giữ nguyên draft để thử lại.

