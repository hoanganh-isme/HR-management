USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_Payroll
(
    @PeriodID NVARCHAR(50) = '',
    @PhongBan NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @PeriodID = ISNULL(@PeriodID, '');
    SET @PhongBan = ISNULL(@PhongBan, '');
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        PAY.DocumentID,
        PAY.DocumentDate,
        PAY.PeriodID,
        PAY.PersonID,
        PAY.PersonName,
        PAY.LuongCoBan,
        PAY.LuongTong,
        PAY.TienBuTru,
        PAY.SoNguoiPhuThuoc,
        PAY.MucDong,
        PAY.TongLuong,
        PAY.IsBH,
        PAY.IsHuuTri,
        P.PhongBan
    FROM dbo.HR_PayrollTbl PAY
    LEFT JOIN dbo.HR_PersonTbl P ON PAY.PersonID = P.PersonID
    WHERE 
        (@PeriodID = '' OR PAY.PeriodID = @PeriodID)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        AND (
            @Keyword = ''
            OR PAY.PersonID LIKE '%' + @Keyword + '%'
            OR PAY.PersonName LIKE N'%' + @Keyword + '%'
            OR PAY.DocumentID LIKE '%' + @Keyword + '%'
        )
    ORDER BY PAY.PersonID ASC;
END
GO
