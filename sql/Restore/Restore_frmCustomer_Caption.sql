USE [QLTiec]
GO

-- 1. Khôi phục Tiêu đề hiển thị (CaptionVN) cho form Khách hàng
UPDATE SY_FormatFields SET CaptionVN = N'Tên khách hàng' WHERE FormName = 'frmCustomer' AND FieldName = 'Tenkh';
UPDATE SY_FormatFields SET CaptionVN = N'Số hợp đồng' WHERE FormName = 'frmCustomer' AND FieldName = 'Sohopdong';
UPDATE SY_FormatFields SET CaptionVN = N'Mã KH' WHERE FormName = 'frmCustomer' AND FieldName = 'Makh';
UPDATE SY_FormatFields SET CaptionVN = N'Tên cô dâu' WHERE FormName = 'frmCustomer' AND FieldName = 'Tencodau';
UPDATE SY_FormatFields SET CaptionVN = N'Tên chú rể' WHERE FormName = 'frmCustomer' AND FieldName = 'Tenchure';
UPDATE SY_FormatFields SET CaptionVN = N'SĐT Chú rể' WHERE FormName = 'frmCustomer' AND FieldName = 'DTchure';
UPDATE SY_FormatFields SET CaptionVN = N'SĐT Cô dâu' WHERE FormName = 'frmCustomer' AND FieldName = 'DTcodau';
UPDATE SY_FormatFields SET CaptionVN = N'Email' WHERE FormName = 'frmCustomer' AND FieldName = 'Mail';
UPDATE SY_FormatFields SET CaptionVN = N'SĐT Chung' WHERE FormName = 'frmCustomer' AND FieldName = 'DienthoaiChung';
UPDATE SY_FormatFields SET CaptionVN = N'Địa chỉ' WHERE FormName = 'frmCustomer' AND FieldName = 'Diachi';
UPDATE SY_FormatFields SET CaptionVN = N'Số lần tham quan' WHERE FormName = 'frmCustomer' AND FieldName = 'SoLanThamQuan';

-- 2. Khôi phục Loại Input (FormatID) 
-- Đa số là Text nên để trống (mặc định Engine tự hiểu là Text), riêng các cột số thì gán lại là 'nm'
UPDATE SY_FormatFields SET FormatID = 'nm' WHERE FormName = 'frmCustomer' AND FieldName = 'SoLanThamQuan';

-- 3. Khôi phục lại độ rộng cơ bản (Tùy chọn, để lúc hiển thị form trông đỡ bị full màn hình)
UPDATE SY_FormatFields SET FormPosition = '6' 
WHERE FormName = 'frmCustomer' AND FieldName IN (
    'Tenkh', 'Sohopdong', 'Makh', 'Tencodau', 'Tenchure', 
    'DTchure', 'DTcodau', 'Mail', 'DienthoaiChung', 'SoLanThamQuan'
);

-- Địa chỉ thường dài nên cho chiếm 100% (body / 12)
UPDATE SY_FormatFields SET FormPosition = '12' 
WHERE FormName = 'frmCustomer' AND FieldName = 'Diachi';

GO
