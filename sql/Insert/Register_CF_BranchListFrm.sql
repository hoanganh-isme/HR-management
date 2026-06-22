USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'CF_BranchListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'CF_BranchListFrm',
    'EDIT',
    N'Danh mục Chi nhánh',
    'Branch List',
    'CF_BranchTbl',
    'BranchID'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'CF_BranchListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('CF_BranchListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('CF_BranchListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('CF_BranchListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'CF_BranchListFrm', @ObjectName = 'CF_BranchTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã chi nhánh', CaptionEN = 'Branch ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên chi nhánh', CaptionEN = 'Branch Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form CF_BranchListFrm (Danh muc Chi nhanh)!';
GO
