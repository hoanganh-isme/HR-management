
CREATE OR ALTER PROCEDURE dbo.API_BangThamSo
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        PeriodID AS [PeriodID],
        LoaiBaoHiem AS [LoaiBaoHiem],
        CONCAT(PeriodID, '_', LoaiBaoHiem) AS [KeyID],
        UserAutoID AS [UserAutoID],
        BHXHNLD AS [BHXHNLD],
        BHXHCTY AS [BHXHCTY],
        BHYTNLD AS [BHYTNLD],
        BHYTCTY AS [BHYTCTY],
        BHTNNLD AS [BHTNNLD],
        BHTNCTY AS [BHTNCTY]
    FROM dbo.HR_BangThamSoTbl
    WHERE @Keyword = ''
       OR PeriodID LIKE '%' + @Keyword + '%'
       OR LoaiBaoHiem LIKE '%' + @Keyword + '%'
    ORDER BY PeriodID DESC, LoaiBaoHiem ASC;
END
GO
