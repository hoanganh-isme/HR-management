USE X26DIMTUTAC
GO

-- =========================================================================
-- Cấu hình WA_BaoCaoLuongReport trên Web kết nối trực tiếp với Stored Procedure
-- Desktop ERP: dbo.HR_BaoCaoLuong1ReportStp
-- Đăng ký Idempotent (IF EXISTS -> UPDATE, ELSE -> INSERT) không xóa dữ liệu
-- =========================================================================

IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'WA_BaoCaoLuongReport' AND func = 'View')
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'HR_BaoCaoLuong1ReportStp',
        Para  = '@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @PhongBan=N''{PhongBan}'', @User=N''{UserName}'''
    WHERE list = 'WA_BaoCaoLuongReport' AND func = 'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'WA_BaoCaoLuongReport',
        'View',
        'HR_BaoCaoLuong1ReportStp',
        '@PeriodID=N''{PeriodID}'', @BranchID1=N''{BranchID1}'', @PhongBan=N''{PhongBan}'', @User=N''{UserName}'''
    );
END
GO

PRINT 'Da cap nhat WA_API [WA_BaoCaoLuongReport -> HR_BaoCaoLuong1ReportStp] thanh cong!';
GO
