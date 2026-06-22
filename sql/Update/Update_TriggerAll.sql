

-- Báo cáo nghỉ phép
DELETE FROM SY_FrmLstTbl WHERE FormID = 'WA_BaoCaoNghiPhepReport';
INSERT INTO SY_FrmLstTbl (FormID, CaptionVN, TableName, PrimaryKey)
VALUES (
    'WA_BaoCaoNghiPhepReport',        -- FormID hiển thị trên Frontend
    N'Báo Cáo Nghỉ Phép',              -- Tiêu đề Form
    'HR_PersonNghiPhepTbl',           -- Tên Bảng hoặc View vật lý (Nếu dùng CRUD động)
    'UserAutoID'                      -- Tên Khóa chính của bảng vật lý
);
GO

-- =========================================================================
-- DANH MỤC: Ca Làm Việc (WA_ShiftListFrm)
-- Kết nối với bảng vật lý HR_ShiftListTbl của database X26DIMTUTAC
-- =========================================================================

-- 1. Cấu hình bảng SY_FrmLstTbl để chỉ định TableName (bao gồm cả database prefix) và PrimaryKey
DELETE FROM SY_FrmLstTbl WHERE FormID = 'WA_ShiftListFrm';
INSERT INTO SY_FrmLstTbl (FormID, CaptionVN, TableName, PrimaryKey)
VALUES (
    'WA_ShiftListFrm',                  -- FormID hiển thị trên Frontend
    N'Danh mục Ca làm việc',             -- Tiêu đề Form
    'X26DIMTUTAC.dbo.HR_ShiftListTbl',  -- Tên Bảng vật lý với đầy đủ database prefix
    'ShiftID'                           -- Khóa chính
);
GO

-- 2. Cấu hình bảng WA_API định tuyến các tác vụ View, Save, Delete
DELETE FROM WA_API WHERE list = 'WA_ShiftListFrm';
INSERT INTO WA_API (list, func, SQL, Para)
VALUES 
('WA_ShiftListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}''');
GO

-- 3. Đồng bộ hóa cấu trúc cột từ bảng vật lý vào SY_FormatFields
EXEC API_DongBoTruongGiaoDien @FormName = 'WA_ShiftListFrm', @ObjectName = 'X26DIMTUTAC.dbo.HR_ShiftListTbl';
GO

-- 4. Tinh chỉnh cấu hình các trường giao diện hiển thị cho đẹp mắt và đồng bộ tiếng Việt
-- Đảm bảo thứ tự OrderNo chuẩn xác cho 12 cột cần thiết
UPDATE SY_FormatFields SET CaptionVN = N'Mã ca', CaptionEN = 'Shift ID', FormatID = 't', IsRequired = 1, FormPosition = '6', OrderNo = 1 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftID';
UPDATE SY_FormatFields SET CaptionVN = N'Tên ca', CaptionEN = 'Shift Name', FormatID = 't', IsRequired = 1, FormPosition = '6', OrderNo = 2 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftName';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ bắt đầu', CaptionEN = 'Start Time', FormatID = 't', IsRequired = 0, FormPosition = '6', OrderNo = 3 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioBatDau';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ kết thúc', CaptionEN = 'End Time', FormatID = 't', IsRequired = 0, FormPosition = '6', OrderNo = 4 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioKetThuc';
UPDATE SY_FormatFields SET CaptionVN = N'Số giờ công', CaptionEN = 'Work Hours', FormatID = 'n', IsRequired = 0, FormPosition = '6', OrderNo = 5 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoGioCong';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ ca đêm', CaptionEN = 'Night Shift Hours', FormatID = 'n', IsRequired = 0, FormPosition = '6', OrderNo = 6 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioCaDem';
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Index', FormatID = 'n', IsRequired = 0, FormPosition = '6', OrderNo = 7 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Ca tự động', CaptionEN = 'Auto Shift', FormatID = 'sw', IsRequired = 0, FormPosition = '6', OrderNo = 8 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CaTuDong';
UPDATE SY_FormatFields SET CaptionVN = N'Loại ca', CaptionEN = 'Shift Type', FormatID = 't', IsRequired = 0, FormPosition = '6', OrderNo = 9 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftType';
UPDATE SY_FormatFields SET CaptionVN = N'Cách chấm công', CaptionEN = 'Timekeeping Method', FormatID = 't', IsRequired = 0, FormPosition = '6', OrderNo = 10 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CachChamCong';
UPDATE SY_FormatFields SET CaptionVN = N'Màu hiển thị', CaptionEN = 'Display Color', FormatID = 't', IsRequired = 0, FormPosition = '6', OrderNo = 11 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'Color';
UPDATE SY_FormatFields SET CaptionVN = N'Số công', CaptionEN = 'Shift Weight', FormatID = 'n', IsRequired = 0, FormPosition = '6', OrderNo = 12 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoCong';
GO

