USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
    Báo cáo web chỉ đọc.

    Migration này chỉ cập nhật route API của màn hình web. Không xóa cấu hình
    desktop, không sửa SY_FrmCfg/SY_RpDTbl và không đụng vào file RPX nào.
    Route dùng HR_TimeSheetTH2ReportStp giống desktop và chỉ truyền đúng các
    tham số procedure đang khai báo. Lựa chọn Template chỉ phục vụ hiển thị/PDF.
*/
IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = N'WA_TimeSheetTH2Report'
      AND [func] = N'View'
)
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = N'HR_TimeSheetTH2ReportStp',
        Para = N'@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=''{User}'', @ReadOnly=1'
    WHERE [list] = N'WA_TimeSheetTH2Report'
      AND [func] = N'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
    VALUES (
        N'WA_TimeSheetTH2Report',
        N'View',
        N'HR_TimeSheetTH2ReportStp',
        N'@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=''{User}'', @ReadOnly=1'
    );
END
GO

-- Template choices are read from the desktop report configuration (SY_RpDTbl).
-- Run API_ReportTemplateOptions.sql before this route migration.
IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = N'API_ReportTemplateOptions'
      AND [func] = N'View'
)
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = N'API_ReportTemplateOptions',
        Para = N'@ReportName=N''{ReportName}'''
    WHERE [list] = N'API_ReportTemplateOptions'
      AND [func] = N'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
    VALUES (
        N'API_ReportTemplateOptions',
        N'View',
        N'API_ReportTemplateOptions',
        N'@ReportName=N''{ReportName}'''
    );
END
GO
