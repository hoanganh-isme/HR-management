USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_ProvinceListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_ProvinceListFrm',
    'EDIT',
    N'Danh mục Tỉnh thành',
    'Province List',
    'HR_ProvineListTbl',
    'ProvineName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ProvinceListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ProvinceListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ProvinceListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ProvinceListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_ProvinceListFrm', @ObjectName = 'HR_ProvineListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên tỉnh / thành', CaptionEN = 'Province Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Quận / huyện / TX', CaptionEN = 'Township', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_ProvinceListFrm (Danh muc Tinh thanh)!';
GO
