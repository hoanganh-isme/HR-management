USE X26DIMTUTAC
GO

-- =========================================================================
-- Đăng ký WA_TimeSheetTH2Report kết nối TRỰC TIẾP Stored Procedure Desktop:
-- dbo.HR_TimeSheetTH2ReportStp
-- GIỮ NGUYÊN 100% KHÔNG SỬA SP DESKTOP dbo.HR_TimeSheetTH2ReportStp
-- =========================================================================

IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = N'WA_TimeSheetTH2Report' AND [func] = N'View')
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = N'HR_TimeSheetTH2ReportStp',
        Para  = N'@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=N''{UserName}'''
    WHERE [list] = N'WA_TimeSheetTH2Report' AND [func] = N'View';
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

PRINT 'Da dang ky WA_API [WA_TimeSheetTH2Report -> HR_TimeSheetTH2ReportStp Desktop] thanh cong!';
GO
