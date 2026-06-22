USE [QLTiec]
GO

-- 0. Chèn trường ShowInFilter nếu chưa có (Để FormBuilder có thể tự sửa tính năng Lọc)
IF NOT EXISTS (SELECT 1 FROM SY_FormatFields WHERE FormName = 'frmFormBuilder' AND FieldName = 'ShowInFilter')
BEGIN
    INSERT INTO SY_FormatFields (FormName, FieldName, CaptionVN, CaptionEN, FormatID, IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo)
    VALUES ('frmFormBuilder', 'ShowInFilter', N'Hiển thị bộ lọc', 'Show in Filter', 'sw', 0, '6', 1, 1, 0, 0, 99);
END

-- 1. Cập nhật Tiêu đề hiển thị (CaptionVN) cho các trường của Form Builder
UPDATE SY_FormatFields SET CaptionVN = N'Mã Form' WHERE FormName = 'frmFormBuilder' AND FieldName = 'FormName';
UPDATE SY_FormatFields SET CaptionVN = N'Tên Trường (Database)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'FieldName';
UPDATE SY_FormatFields SET CaptionVN = N'Tiêu đề (Hiển thị)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'CaptionVN';
UPDATE SY_FormatFields SET CaptionVN = N'Tiêu đề (Tiếng Anh)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'CaptionEN';
UPDATE SY_FormatFields SET CaptionVN = N'Loại Input' WHERE FormName = 'frmFormBuilder' AND FieldName = 'FormatID';
UPDATE SY_FormatFields SET CaptionVN = N'Nguồn Dữ Liệu (API/Static)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'DataSource';
UPDATE SY_FormatFields SET CaptionVN = N'Bắt buộc nhập' WHERE FormName = 'frmFormBuilder' AND FieldName = 'IsRequired';
UPDATE SY_FormatFields SET CaptionVN = N'Kích thước hiển thị' WHERE FormName = 'frmFormBuilder' AND FieldName = 'FormPosition';
UPDATE SY_FormatFields SET CaptionVN = N'Hiện khi Thêm' WHERE FormName = 'frmFormBuilder' AND FieldName = 'ShowInAdd';
UPDATE SY_FormatFields SET CaptionVN = N'Hiện khi Sửa' WHERE FormName = 'frmFormBuilder' AND FieldName = 'ShowInEdit';
UPDATE SY_FormatFields SET CaptionVN = N'Chỉ đọc khi Thêm' WHERE FormName = 'frmFormBuilder' AND FieldName = 'IsReadOnlyAdd';
UPDATE SY_FormatFields SET CaptionVN = N'Chỉ đọc khi Sửa' WHERE FormName = 'frmFormBuilder' AND FieldName = 'IsReadOnlyEdit';
UPDATE SY_FormatFields SET CaptionVN = N'Quy tắc hiển thị (JS)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'VisibleRule';
UPDATE SY_FormatFields SET CaptionVN = N'Ràng buộc dữ liệu (JS)' WHERE FormName = 'frmFormBuilder' AND FieldName = 'ValidateRule';
UPDATE SY_FormatFields SET CaptionVN = N'Trường phụ thuộc' WHERE FormName = 'frmFormBuilder' AND FieldName = 'DependsOn';
UPDATE SY_FormatFields SET CaptionVN = N'Thứ tự ưu tiên' WHERE FormName = 'frmFormBuilder' AND FieldName = 'OrderNo';

-- 2. Cập nhật FormatID (Loại Input) để giao diện thêm phần sinh động và tiện dụng
-- Các trường Boolean (Tắt/Bật)
UPDATE SY_FormatFields SET FormatID = 'sw' 
WHERE FormName = 'frmFormBuilder' AND FieldName IN ('IsRequired', 'ShowInAdd', 'ShowInEdit', 'IsReadOnlyAdd', 'IsReadOnlyEdit', 'ShowInFilter');

-- Khung chọn Loại Input (Select)
UPDATE SY_FormatFields SET FormatID = 'sl', DataSource = N'STATIC:t|Văn bản (Text),n|Số (Number),dt|Ngày (Date),sw|Bật/Tắt (Switch),sl|Danh sách chọn (Select)' 
WHERE FormName = 'frmFormBuilder' AND FieldName = 'FormatID';

-- Khung chọn Kích thước hiển thị (Select)
UPDATE SY_FormatFields SET FormatID = 'sl', DataSource = N'STATIC:12|Đầy đủ 100% (Full),6|Một nửa 50% (Half),4|1/3 Chiều rộng,3|1/4 Chiều rộng' 
WHERE FormName = 'frmFormBuilder' AND FieldName = 'FormPosition';

-- Cột số thứ tự
UPDATE SY_FormatFields SET FormatID = 'nm' 
WHERE FormName = 'frmFormBuilder' AND FieldName = 'OrderNo';

-- 3. Cập nhật FormPosition để dàn layout cho gọn gàng (2 ô 1 hàng)
UPDATE SY_FormatFields SET FormPosition = '6' 
WHERE FormName = 'frmFormBuilder' AND FieldName IN (
    'FormName', 'FieldName', 'CaptionVN', 'CaptionEN', 
    'FormatID', 'FormPosition', 'OrderNo', 'IsRequired',
    'ShowInFilter'
);

-- Các trường tuỳ chọn logic cho chiếm cả hàng
UPDATE SY_FormatFields SET FormPosition = '12' 
WHERE FormName = 'frmFormBuilder' AND FieldName IN ('DataSource', 'VisibleRule', 'ValidateRule', 'DependsOn');

-- 4. Xóa lỗi Dummy records
DELETE FROM SY_FormatFields WHERE FormName = '' AND FieldName IN ('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15');

-- 5. AUTO-HEAL CHO CHÍNH FORM BUILDER (Trường hợp lưu bị mất ô trên giao diện do C# set null = 0)
UPDATE SY_FormatFields 
SET ShowInAdd = 1, ShowInEdit = 1 
WHERE FormName = 'frmFormBuilder' AND FieldName IN (
    'FormName', 'FieldName', 'CaptionVN', 'CaptionEN', 
    'FormatID', 'FormPosition', 'OrderNo', 'IsRequired',
    'ShowInFilter', 'DataSource', 'VisibleRule', 'ValidateRule', 'DependsOn',
    'ShowInAdd', 'ShowInEdit', 'IsReadOnlyAdd', 'IsReadOnlyEdit'
);

GO
