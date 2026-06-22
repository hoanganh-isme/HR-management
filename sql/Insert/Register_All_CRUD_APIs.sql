USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ CRUD CHO: Danh mục Ca Làm Việc (WA_ShiftListFrm)
-- Phù hợp với phiên bản stored procedure API_LuuDong và API_XoaDong mới
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_ShiftListFrm';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_ShiftListFrm', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('WA_ShiftListFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_ShiftListFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT 'Da dang ky va cap nhat API [View, Save, Delete] cho form WA_ShiftListFrm!';
GO


-- =========================================================================
-- 2. ĐĂNG KÝ CRUD CHO: Danh mục Kỳ Lương (SY_Period)
-- =========================================================================
-- Đảm bảo có cả 'Edit' (tương thích ngược) và 'Save' (chuẩn Frontend DynamicFormEngine)
DELETE FROM dbo.WA_API WHERE list = 'SY_Period' AND func IN ('Save', 'Delete', 'Edit');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('SY_Period', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''),
('SY_Period', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('SY_Period', 'Edit', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('SY_Period', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO

PRINT 'Da dang ky va cap nhat API [View, Save, Edit, Delete] cho form SY_Period!';
GO

-- =========================================================================
-- 3. ĐỒNG BỘ LẠI PHÂN QUYỀN
-- =========================================================================
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da hoan tat dang ky tat ca API CRUD dynamic!';
GO
