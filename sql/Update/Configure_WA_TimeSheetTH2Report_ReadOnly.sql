USE [X26DIMTUTAC]
GO

-- =========================================================================
-- Cấu hình WA_TimeSheetTH2Report trên Web kết nối trực tiếp với Stored Procedure
-- Desktop ERP: dbo.HR_TimeSheetTH2ReportStp
-- Loại bỏ @ReadOnly=1 (sửa lỗi SQL Error 8145) và truyền @User=N'{UserName}'
-- =========================================================================

IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = N'WA_TimeSheetTH2Report'
      AND [func] = N'View'
)
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = N'HR_TimeSheetTH2ReportStp',
        Para = N'@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=N''{UserName}'''
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
        N'@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=N''{UserName}'''
    );
END
GO

PRINT 'Da cap nhat WA_API [WA_TimeSheetTH2Report -> HR_TimeSheetTH2ReportStp] thanh cong!';
GO
