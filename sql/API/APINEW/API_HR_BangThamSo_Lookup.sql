
CREATE OR ALTER PROCEDURE [dbo].[API_HR_BangThamSo_Lookup]
    @Keyword NVARCHAR(MAX) = N''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  
        RTRIM(PeriodID) AS [PeriodID],
        RTRIM(LoaiBaoHiem) AS [LoaiBaoHiem],
        CONCAT(PeriodID, '_', LoaiBaoHiem) AS [KeyID]
    FROM dbo.HR_BangThamSoTbl
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR PeriodID LIKE '%' + @Keyword + '%' 
           OR LoaiBaoHiem LIKE '%' + @Keyword + '%')
    GROUP BY PeriodID, LoaiBaoHiem
    ORDER BY PeriodID DESC, LoaiBaoHiem;
END
GO
