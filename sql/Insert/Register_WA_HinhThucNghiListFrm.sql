USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HinhThucNghiListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_HinhThucNghiListFrm',
    'EDIT',
    N'Danh mục Hình thức nghỉ',
    'Leave Type List',
    'HR_HinhThucNghiListTbl',
    'HinhThucNghi'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_HinhThucNghiListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HinhThucNghiListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HinhThucNghiListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HinhThucNghiListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HinhThucNghiListFrm', @ObjectName = 'HR_HinhThucNghiListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Mã hình thức nghỉ', CaptionEN = 'Leave Type Code', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên hình thức nghỉ', CaptionEN = 'Leave Type Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Có hưởng lương', CaptionEN = 'With Pay', FormatID = 'sw', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_HinhThucNghiListFrm (Danh muc Hinh thuc nghi)!';
GO
