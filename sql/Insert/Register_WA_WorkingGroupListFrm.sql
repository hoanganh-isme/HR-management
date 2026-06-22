USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM TRONG SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID = 'WA_WorkingGroupListFrm';
GO

INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
VALUES (
    'WA_WorkingGroupListFrm',
    'EDIT',
    N'Danh mục Tổ nhóm',
    'Working Group List',
    'HR_WorkingGroupListTbl',
    'WorkingGroupName'
);
GO

-- =========================================================================
-- 2. ĐĂNG KÝ CÁC ĐỊNH TUYẾN API TRONG WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_WorkingGroupListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_WorkingGroupListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_WorkingGroupListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_WorkingGroupListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

-- =========================================================================
-- 3. ĐỒNG BỘ CẤU TRÚC CỘT DƯỚI BẢNG VẬT LÝ VÀO GIAO DIỆN
-- =========================================================================
EXEC dbo.API_DongBoTruongGiaoDien @FormName = 'WA_WorkingGroupListFrm', @ObjectName = 'HR_WorkingGroupListTbl';
GO

-- =========================================================================
-- 4. TINH CHỈNH TIÊU ĐỀ CÁC CỘT (VIỆT HÓA)
-- =========================================================================
UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Tên tổ nhóm', CaptionEN = 'Working Group Name', FormatID = 't', IsRequired = 1, FormPosition = 'grid', OrderNo = 1 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'WorkingGroupName';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Ghi chú', CaptionEN = 'Note', FormatID = 't', IsRequired = 0, FormPosition = 'grid', OrderNo = 2 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'GhiChu';

UPDATE dbo.SY_FormatFields 
SET CaptionVN = N'Số thứ tự', CaptionEN = 'Order No', FormatID = 'n', IsRequired = 0, FormPosition = 'grid', OrderNo = 3 
WHERE FormName = 'WA_WorkingGroupListFrm' AND FieldName = 'STT';
GO

-- =========================================================================
-- 5. ĐỒNG BỘ PHÂN QUYỀN TRUY CẬP
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da dang ky thanh cong CRUD dong cho form WA_WorkingGroupListFrm (Danh muc To nhom)!';
GO
