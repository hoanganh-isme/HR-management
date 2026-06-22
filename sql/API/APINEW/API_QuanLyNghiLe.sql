USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiLe
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        HolidayID,
        HolidayDate,
        HolidayName,
        SoCong
    FROM dbo.HR_HolidayTbl
    WHERE 
        @Keyword = ''
        OR HolidayID LIKE '%' + @Keyword + '%'
        OR HolidayName LIKE N'%' + @Keyword + '%'
    ORDER BY HolidayDate DESC;
END
GO
