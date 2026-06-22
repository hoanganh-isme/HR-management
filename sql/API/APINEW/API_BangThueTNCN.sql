USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangThueTNCN
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        Bac,
        Tu,
        Den,
        ThueSuat
    FROM dbo.HR_BangThueTNCNTbl
    ORDER BY Bac ASC;
END
GO
