USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_DepartmentListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_DepartmentListFrm',
    'EDIT',
    N'Danh mục Phòng ban',
    'Department List',
    'HR_DepartmentListTbl',
    'PhongBan'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_DepartmentListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_DepartmentListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_DepartmentListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_DepartmentListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_DepartmentListFrm', @ObjectName = 'HR_DepartmentListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã phòng ban', CaptionEN = 'Department ID', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_DepartmentListFrm' AND FieldName = 'PhongBan';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên phòng ban', CaptionEN = 'Department Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_DepartmentListFrm' AND FieldName = 'TenPhongBan';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_DepartmentListFrm (Danh muc Phong ban)!';
GO
