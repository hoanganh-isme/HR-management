USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThueTNCNFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangThueTNCNFrm',
    'EDIT',
    N'Bảng mức thuế TNCN',
    'PIT Tax Bracket',
    'HR_BangThueTNCNTbl',
    'Bac'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThueTNCNFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThueTNCNFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThueTNCNFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThueTNCNFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThueTNCNFrm', @ObjectName = 'HR_BangThueTNCNTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Bậc', CaptionEN = 'Level', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Bac';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Từ', CaptionEN = 'From', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Tu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Đến', CaptionEN = 'To', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'Den';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Thuế suất (%)', CaptionEN = 'Tax Rate (%)', FormatID = 'n', IsRequired = 1, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_BangThueTNCNFrm' AND FieldName = 'ThueSuat';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangThueTNCNFrm (Bang muc thue TNCN)!';
GO
