USE X26DIMTUTAC
GO

-- =========================================================================
-- Cấu hình WA_BaoCaoNghiPhepReport trên Web kết nối trực tiếp với Stored Procedure
-- Desktop ERP: dbo.HR_BaoCaoNghiPhep1ReportStp
-- Đăng ký Idempotent (IF EXISTS -> UPDATE, ELSE -> INSERT) không xóa dữ liệu
-- =========================================================================

IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'WA_BaoCaoNghiPhepReport' AND func = 'View')
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'HR_BaoCaoNghiPhep1ReportStp',
        Para  = '@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=N''{UserName}'''
    WHERE list = 'WA_BaoCaoNghiPhepReport' AND func = 'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'WA_BaoCaoNghiPhepReport',
        'View',
        'HR_BaoCaoNghiPhep1ReportStp',
        '@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @User=N''{UserName}'''
    );
END
GO

PRINT 'Da cap nhat WA_API [WA_BaoCaoNghiPhepReport -> HR_BaoCaoNghiPhep1ReportStp] thanh cong!';
GO
