
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
       *
    FROM dbo.HR_SapCaTbl
    WHERE 
        @Keyword = ''
        OR SapCaID LIKE '%' + @Keyword + '%'
        OR TenBangCa LIKE N'%' + @Keyword + '%'
    ORDER BY SapCaID DESC;
END
GO
