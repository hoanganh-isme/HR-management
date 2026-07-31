# Phần mềm Quản lý Nhân sự (HR Management)

## Giới thiệu
Đây là hệ thống Quản lý Nhân sự (HR Management System), bao gồm các chức năng cốt lõi:
- Quản lý Hồ sơ nhân viên
- Quản lý Hợp đồng lao động
- Quản lý Bảo hiểm (BHXH, BHYT)
- Báo cáo và Thống kê nhân sự

## Kiến trúc dự án
- **Frontend**: Vanilla JavaScript (ES5/ES6) sử dụng mô hình Module/Service Pattern.
  - Xây dựng lưới dữ liệu với `Tabulator`
  - Quản lý form động (Dynamic Form Engine)
  - UI/UX sử dụng `Bootstrap 5`, `SweetAlert2`, `Flatpickr`
- **Backend**: Node.js (Microservices/API) & SQL Server Database.

## Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản LTS mới nhất)
- Cài đặt các package: `npm install` (trong thư mục `backend-app`)
- Database: Microsoft SQL Server

### Đóng gói Frontend
Để gộp (bundle) toàn bộ file JS và CSS ở frontend, chạy script sau trong môi trường PowerShell:
```powershell
./build.ps1
```
Kết quả sẽ tạo ra `app.bundle.js` và `styles.bundle.css`.

### Cấu hình
Sửa cấu hình môi trường trong file `env.js` (Frontend) và `.env` (Backend).

## Cấu trúc thư mục chính
- `/src`: Chứa mã nguồn Frontend (js, css, components).
- `/backend-app`: Chứa mã nguồn Backend API bằng Node.js.
- `/sql`: Chứa cấu trúc database, các procedures và scripts migration.
- `/docs`: Chứa tài liệu hệ thống.
