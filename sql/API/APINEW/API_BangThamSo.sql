USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangThamSo
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PeriodID,
        LoaiBaoHiem,
        BHXHNLD,
        BHXHCTY,
        BHYTNLD,
        BHYTCTY,
        BHTNNLD,
        BHTNCTY
    FROM dbo.HR_BangThamSoTbl
    WHERE @Keyword = ''
       OR PeriodID LIKE '%' + @Keyword + '%'
       OR LoaiBaoHiem LIKE '%' + @Keyword + '%'
    ORDER BY PeriodID DESC, LoaiBaoHiem ASC;
END
GO
