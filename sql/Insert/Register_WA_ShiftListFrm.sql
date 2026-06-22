USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_ShiftListFrm',
    'EDIT',
    N'Danh mục Ca làm việc',
    'Shift List',
    'HR_ShiftListTbl',
    'ShiftID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ShiftListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ShiftListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ShiftListFrm', @ObjectName = 'HR_ShiftListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Mã ca', CaptionEN = 'Shift ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftID';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Tên ca', CaptionEN = 'Shift Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftName';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ bắt đầu', CaptionEN = 'Start Time', FormatID = 'tm', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioBatDau';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ kết thúc', CaptionEN = 'End Time', FormatID = 'tm', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioKetThuc';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số giờ công', CaptionEN = 'Work Hours', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 5 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoGioCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Giờ ca đêm', CaptionEN = 'Night Shift Hours', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 6 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioCaDem';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số thứ tự', CaptionEN = 'Index', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'STT';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Ca tự động', CaptionEN = 'Auto Shift', FormatID = 'sw', IsRequired = 1, FormPosition = 'grid', OrderNo = 8 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CaTuDong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Loại ca', CaptionEN = 'Shift Type', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 9 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftType';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Cách chấm công', CaptionEN = 'Timekeeping Method', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 10 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CachChamCong';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Màu hiển thị', CaptionEN = 'Display Color', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 11 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'Color';
UPDATE dbo.SY_FormatFields SET CaptionVN = N'Số công', CaptionEN = 'Shift Weight', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 12 WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoCong';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_ShiftListFrm (Danh muc Ca lam viec)!';
GO
