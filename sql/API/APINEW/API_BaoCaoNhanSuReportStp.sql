USE X26DIMTUTAC
GO

-- =========================================================================
-- API_BaoCaoNhanSuReportStp - Wrapper an toàn cho Web App
-- Gọi trực tiếp Stored Procedure Desktop: dbo.HR_BaoCaoNhansu2ReportStp
-- GIỮ NGUYÊN 100% KHÔNG SỬA SP Desktop dbo.HR_BaoCaoNhansu2ReportStp
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoNhanSuReportStp
    @Template    NVARCHAR(50)  = '',
    @FromDate    DATETIME      = NULL,
    @ToDate      DATETIME      = NULL,
    @BranchID1   NVARCHAR(MAX) = '',
    @BranchID    NVARCHAR(MAX) = '',
    @PhongBan    NVARCHAR(200) = '',
    @Keyword     NVARCHAR(200) = '',
    @User        NVARCHAR(50)  = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Làm sạch tham số
    SET @Template  = LTRIM(RTRIM(ISNULL(@Template, '')));
    SET @BranchID1 = LTRIM(RTRIM(ISNULL(@BranchID1, '')));
    IF @BranchID1 = '' SET @BranchID1 = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    SET @User      = LTRIM(RTRIM(ISNULL(@User, '')));

    IF @Template  LIKE '%{%}%' SET @Template = '';
    IF @BranchID1 LIKE '%{%}%' SET @BranchID1 = '';
    IF @User      LIKE '%{%}%' SET @User = '';

    -- 2. Tự động gán mốc ngày mặc định an toàn nếu chưa truyền từ Web
    IF @FromDate IS NULL OR @FromDate < '1905-01-01'
        SET @FromDate = CAST(CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-01-01' AS DATETIME);

    IF @ToDate IS NULL OR @ToDate < '1905-01-01'
        SET @ToDate = GETDATE();

    -- 3. Gọi trực tiếp Stored Procedure Desktop (Không sửa đổi SP Desktop)
    EXEC dbo.HR_BaoCaoNhansu2ReportStp
        @Template  = @Template,
        @FromDate  = @FromDate,
        @ToDate    = @ToDate,
        @BranchID1 = @BranchID1,
        @User      = @User;
END
GO

PRINT 'Da tao wrapper API_BaoCaoNhanSuReportStp thanh cong!';
GO

-- =========================================================================
-- Đăng ký WA_BaoCaoNhanSuReport trong dbo.WA_API (Idempotent)
-- =========================================================================
IF EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'WA_BaoCaoNhanSuReport' AND func = 'View')
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = 'API_BaoCaoNhanSuReportStp',
        Para  = '@Template=N''{Template}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @BranchID1=N''{BranchID1}'', @BranchID=N''{BranchID}'', @User=N''{UserName}'''
    WHERE list = 'WA_BaoCaoNhanSuReport' AND func = 'View';
END
ELSE
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (
        'WA_BaoCaoNhanSuReport',
        'View',
        'API_BaoCaoNhanSuReportStp',
        '@Template=N''{Template}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @BranchID1=N''{BranchID1}'', @BranchID=N''{BranchID}'', @User=N''{UserName}'''
    );
END
GO

PRINT 'Da cap nhat WA_API [WA_BaoCaoNhanSuReport -> API_BaoCaoNhanSuReportStp -> HR_BaoCaoNhansu2ReportStp] thanh cong!';
GO
