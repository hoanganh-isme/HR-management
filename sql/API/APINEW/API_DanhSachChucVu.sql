USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucVu
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        TitleName,     -- Tên chức vụ
        GhiChu         -- Ghi chú
    FROM HR_TitleListTbl
    WHERE 
        @Keyword = ''
        OR TitleName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), TitleName;
END
GO
