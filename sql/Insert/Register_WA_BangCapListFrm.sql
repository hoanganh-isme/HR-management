USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangCapListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangCapListFrm',
    'EDIT',
    N'Danh mục Bằng cấp',
    'Certificate List',
    'HR_BangCapTbl',
    'MaBangCap'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangCapListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangCapListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangCapListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangCapListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangCapListFrm', @ObjectName = 'HR_BangCapTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã bằng cấp', CaptionEN = 'Certificate ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên bằng cấp', CaptionEN = 'Certificate Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'TenBangCap';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangCapListFrm (Danh muc Bang cap)!';
GO
