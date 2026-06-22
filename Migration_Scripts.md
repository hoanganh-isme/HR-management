# Kịch bản Chuyển đổi Toàn diện (All-in-One Migration)

File này bao gồm cấu hình SQL để chuyển đổi **TẤT CẢ** các trang hiện có và các mục tiêu trong `TODO.md` sang hệ thống No-Code `DynamicFormEngine.js`.

---

## PHẦN A: CÁC TRANG DI CƯ 100% SANG NO-CODE (XÓA CODE TAY)
*Lưu ý: Chạy lệnh SQL dưới đây xong, bạn có thể xóa toàn bộ code HTML/JS trong thư mục tương ứng.*

### 1. Khách Tham Quan (`src/pages/visitor/`)
```sql
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
VALUES ('frmKhachThamQuan', 'LIST', N'Khách Tham Quan', 'KhachThamQuanTbl', 'VisitorID');

INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, FormatID, FormPosition, IsRequired, OrderNo) VALUES 
('frmKhachThamQuan', 'VisitorCode', N'Mã Khách', 'text', '6', 1, 1),
('frmKhachThamQuan', 'FullName', N'Tên Khách Hàng', 'text', '6', 1, 2),
('frmKhachThamQuan', 'Phone', N'Số Điện Thoại', 'text', '6', 1, 3),
('frmKhachThamQuan', 'ExpectedDate', N'Ngày cưới dự kiến', 'dt', '6', 0, 4);
```

### 2. Khách Hàng (`#/customers` trong TODO)
```sql
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
VALUES ('frmKhachHang', 'LIST', N'Danh mục Khách Hàng', 'KhachHangTbl', 'CustomerID');

INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, FormatID, FormPosition, IsRequired, OrderNo) VALUES 
('frmKhachHang', 'CustomerCode', N'Mã KH', 'text', '6', 1, 1),
('frmKhachHang', 'CustomerName', N'Tên Khách Hàng', 'text', '6', 1, 2),
('frmKhachHang', 'Phone', N'Số Điện Thoại', 'text', '6', 1, 3);
```

### 3. Người Dùng (`src/pages/users/`)
```sql
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
VALUES ('frmNguoiDung', 'LIST', N'Quản lý Người Dùng', 'UsersTbl', 'UserID');

INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, FormatID, FormPosition, IsRequired, OrderNo) VALUES 
('frmNguoiDung', 'UserName', N'Tên Đăng Nhập', 'text', '6', 1, 1),
('frmNguoiDung', 'FullName', N'Họ và Tên', 'text', '6', 1, 2),
('frmNguoiDung', 'RoleID', N'Nhóm Quyền', 'sl', '6', 1, 3);
```

### 4. Giao Dịch: Đặt Cọc (`src/pages/booking/`)
```sql
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
VALUES ('frmBiennhancoccho', 'DOC', N'Biên Nhận Đặt Cọc', 'DatCocTbl', 'BookingID');

INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, FormatID, FormPosition, IsRequired, OrderNo) VALUES 
('frmBiennhancoccho', 'BookingNo', N'Số Phiếu Cọc', 'text', '6', 1, 1),
('frmBiennhancoccho', 'CustomerID', N'Khách Hàng', 'sl', '6', 1, 2),
('frmBiennhancoccho', 'HallID', N'Sảnh Tiệc', 'sl', '6', 1, 3),
('frmBiennhancoccho', 'DepositAmount', N'Số Tiền Cọc', 'nm', '6', 1, 4);

-- Thêm tính năng Quick Add (Tạo KH mới) ngay tại Combobox Khách Hàng của form Cọc
UPDATE SY_FormatFields 
SET DataSource = 'API_DanhSachKhachHang|API_ThemMoiKhachHang'
WHERE FormName = 'frmBiennhancoccho' AND FieldName = 'CustomerID';
```

### 5. Giao Dịch: Hợp Đồng (`src/pages/contract/`)
```sql
-- Dùng cấu hình Master-Detail (TableDetail) để làm Form Hợp Đồng cắm Bảng Dịch Vụ
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey, TableDetail, TableDetailLeftJoinField)
VALUES ('frmHopDong', 'DOC', N'Lập Hợp Đồng Tiệc', 'HopDongTbl', 'ContractID', 'HopDong_DichVuTbl', 'ContractID');

-- (Ràng buộc Validation: Số HD không có dấu sẽ được config Regex ở đây)
INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, FormatID, FormPosition, IsRequired, ValidateRule) VALUES 
('frmHopDong', 'ContractNo', N'Số Hợp Đồng', 'text', '6', 1, '^[a-zA-Z0-9]+$'), -- KHÔNG DẤU
('frmHopDong', 'CustomerID', N'Khách Hàng', 'sl', '6', 1, ''),
('frmHopDong', 'HallID', N'Sảnh Tiệc (Bắt buộc)', 'sl', '6', 1, '');
```

### 6. Giao Dịch: Quyết Toán (`src/pages/checkout/`)
```sql
INSERT INTO SY_FrmLstTbl (FormID, FormType, CaptionVN, TableName, PrimaryKey)
VALUES ('frmQuyetToan', 'DOC', N'Quyết Toán & Thanh Lý', 'QuyetToanTbl', 'CheckoutID');

-- Quyết toán -> Giải phóng sảnh sẽ được xử lý ngầm bằng SQL Trigger AFTER INSERT trên bảng QuyetToanTbl
```

---

## PHẦN B: CẬP NHẬT ĐIỀU HƯỚNG MENU (XÓA SỔ ROUTER CODE TAY)
Chạy lệnh này để báo cho `router.js` biết: "Khi user bấm menu này, tự động tải DynamicFormEngine".

```sql
UPDATE WA_Menu SET URLPara = 'visitor', FormName = 'frmKhachThamQuan' WHERE URLPara = 'visitor';
UPDATE WA_Menu SET URLPara = 'users', FormName = 'frmNguoiDung' WHERE URLPara = 'users';
UPDATE WA_Menu SET URLPara = 'booking', FormName = 'frmBiennhancoccho' WHERE URLPara = 'booking';
UPDATE WA_Menu SET URLPara = 'contract', FormName = 'frmHopDong' WHERE URLPara = 'contract';
UPDATE WA_Menu SET URLPara = 'checkout', FormName = 'frmQuyetToan' WHERE URLPara = 'checkout';
-- Thêm menu Khách Hàng (nếu chưa có)
INSERT INTO WA_Menu (MenuName, URLPara, FormName) VALUES (N'Khách hàng', 'customers', 'frmKhachHang');
```

---

## PHẦN C: CÁC TRANG "SIÊU ĐẶC THÙ" (KHÔNG XÓA CODE TAY)
Cỗ máy No-Code sinh ra dữ liệu dạng bảng/form. Vì vậy, các trang có giao diện vẽ đồ họa đặc biệt **bắt buộc phải giữ lại thư mục code tay**.

**BẠN KHÔNG ĐƯỢC XÓA CÁC THƯ MỤC NÀY:**
1. `src/pages/calendar/`: Vẽ lịch tiệc theo tháng.
2. `src/pages/hall-status/`: Vẽ sơ đồ/biểu tượng trạng thái Sảnh trống/đầy.
3. `src/pages/report-revenue/`, `report-cost/`: Vẽ biểu đồ (Charts) Báo cáo.
4. `src/pages/dashboard/`: Tổng quan (Có các thẻ màu, chuông cảnh báo quá hạn).

*Giải pháp cho các trang này (đã ghi trong TODO):* Giữ nguyên giao diện HTML/JS của chúng, gọi thẳng các API (`/api/...`) để lấy số liệu vẽ giao diện. Khi người dùng bấm 1 nút nào đó trong trang này (vd bấm vào cái Sảnh tiệc để lập Hợp đồng), bạn gọi hàm mở Form No-Code Popup (`frmHopDong`) lên là xong!
