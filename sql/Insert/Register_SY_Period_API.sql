USE [X26DIMTUTAC]
GO

-- =========================================================================
-- 1. ĐĂNG KÝ FORM SY_Period TRONG SY_FrmLstTbl
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = 'SY_Period')
BEGIN
    INSERT INTO dbo.SY_FrmLstTbl (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
    VALUES ('SY_Period', 'EDIT', N'Kỳ lương', 'Payroll Period', 'SY_Period', 'PeriodID');
    PRINT 'Da dang ky SY_Period vao SY_FrmLstTbl';
END
ELSE
BEGIN
    UPDATE dbo.SY_FrmLstTbl
    SET TableName = 'SY_Period', PrimaryKey = 'PeriodID'
    WHERE FormID = 'SY_Period';
    PRINT 'Da cap nhat SY_Period trong SY_FrmLstTbl';
END
GO

-- =========================================================================
-- 2. ĐĂNG KÝ API VIEW (TRA CỨU) CHO SY_Period QUA API_TruyVanDong
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'SY_Period' AND func = 'View')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('SY_Period', 'View', 'API_TruyVanDong', '@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''');
    PRINT 'Da dang ky API SY_Period [View]';
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_TruyVanDong', Para = '@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}'''
    WHERE list = 'SY_Period' AND func = 'View';
    PRINT 'Da cap nhat API SY_Period [View]';
END
GO

-- =========================================================================
-- 3. ĐĂNG KÝ API EDIT (CẬP NHẬT/LƯU KHÓA KỲ) CHO SY_Period QUA API_LuuDong
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'SY_Period' AND func = 'Edit')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('SY_Period', 'Edit', 'API_LuuDong', '@List=''{List}'', @Data=N''{JsonData}''');
    PRINT 'Da dang ky API SY_Period [Edit]';
END
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_LuuDong', Para = '@List=''{List}'', @Data=N''{JsonData}'''
    WHERE list = 'SY_Period' AND func = 'Edit';
    PRINT 'Da cap nhat API SY_Period [Edit]';
END
GO

-- Đồng bộ lại phân quyền truy cập
EXEC dbo.API_DongBoQuyenTruyCap;
GO

PRINT 'Da hoan tat dang ky SY_Period API!';
GO
