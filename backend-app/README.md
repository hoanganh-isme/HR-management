# HR Management backend

## Chạy local

```powershell
npm install
npm start
```

Backend tự đọc `backend-app/.env`. Khi chạy bằng Docker Compose, file này được
truyền vào container qua `env_file` và không được copy vào image.

## Bulk Import Excel/clipboard

Hai nguồn dùng chung một pipeline:

1. Upload `.xlsx` hoặc dữ liệu clipboard dạng `.tsv`.
2. Backend đọc streaming để trả preview nhỏ và metadata mapping.
3. Khi xác nhận, backend validate tất cả dòng và BulkCopy theo batch vào
   staging table tạm.
4. Backend kiểm tra chuyển đổi kiểu/khóa trùng rồi `INSERT` bảng đích trong một
   transaction. Có lỗi thì rollback toàn bộ.

Bulk Import cần kết nối SQL Server trực tiếp từ máy/container chạy backend.
`SQL_API_BASE` không thể thay thế kết nối này vì Gateway hiện tại lưu từng dòng.

Các biến bắt buộc:

```dotenv
SQL_SERVER=
SQL_PORT=1433
SQL_DATABASE=
SQL_USER=
SQL_PASSWORD=
SQL_ENCRYPT=true
SQL_TRUST_SERVER_CERTIFICATE=false
```

Quyền nghiệp vụ import dùng chung cờ `isExportExcel` của màn hình. Backend xác
minh token, đối chiếu tài khoản hiện tại trong `SY_User`, form trong `WA_Menu`
và quyền nhóm trong `WA_UserGroupPermisstion` ở cả bước xem khả năng, chuẩn bị
và thực thi. Nhóm `Admin` được kế thừa toàn quyền giống phía giao diện.

Không cần tạo database role riêng cho import. Kết nối `SQL_USER` giữ nguyên role
hiện tại và cần có quyền kỹ thuật `SELECT` metadata/người dùng, `SELECT` và
`INSERT` trên các bảng đích đã đăng ký trong Field Contract.

Các giới hạn (`EXCEL_IMPORT_MAX_ROWS`, `EXCEL_IMPORT_BATCH_SIZE`,
`EXCEL_IMPORT_MAX_FILE_MB`, timeout...) nằm trong `.env.example`; không cần sửa
mã nguồn khi thay đổi.

## Kiểm thử

```powershell
npm test
```
