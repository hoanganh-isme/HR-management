USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_BangThamSoFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_BangThamSoFrm',
    'EDIT',
    N'Bảng tham số tính lương',
    'Payroll Insurance Parameters',
    'HR_BangThamSoTbl',
    'UserAutoID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_BangThamSoFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_BangThamSoFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_BangThamSoFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_BangThamSoFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_BangThamSoFrm', @ObjectName = 'HR_BangThamSoTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Kỳ', CaptionEN = 'Period', FormatID = 't', DataSource = 'SY_Period', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'PeriodID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Loại bảo hiểm', CaptionEN = 'Insurance Type', FormatID = 'sl', DataSource = N'STATIC:NVN|Trong nước,NNN|Nước ngoài', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'LoaiBaoHiem';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHXH NLĐ (%)', CaptionEN = 'SI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHXH Cty (%)', CaptionEN = 'SI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHXHCTY';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHYT NLĐ (%)', CaptionEN = 'HI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 5 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHYT Cty (%)', CaptionEN = 'HI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 6 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHYTCTY';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHTN NLĐ (%)', CaptionEN = 'UI EE (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 7 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNNLD';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'BHTN Cty (%)', CaptionEN = 'UI ER (%)', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 8 
WHERE FormName = 'WA_BangThamSoFrm' AND FieldName = 'BHTNCTY';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_BangThamSoFrm (Bang tham so tinh luong)!';
GO
