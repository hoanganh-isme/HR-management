USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_HospitalListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_HospitalListFrm',
    'EDIT',
    N'Danh mục Bệnh viện',
    'Hospital List',
    'HR_HospitalListTbl',
    'HospitalName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_HospitalListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_HospitalListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_HospitalListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_HospitalListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_HospitalListFrm', @ObjectName = 'HR_HospitalListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên bệnh viện', CaptionEN = 'Hospital Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'HospitalName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Địa chỉ', CaptionEN = 'Address', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'Address';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 4 
WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_HospitalListFrm (Danh muc Binh vien)!';
GO
