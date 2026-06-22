USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachViTri
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        PostionName,   -- Tên vị trí (giữ đúng chính tả database: PostionName)
        GhiChu         -- Ghi chú
    FROM HR_PostionListTbl
    WHERE 
        @Keyword = ''
        OR PostionName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), PostionName;
END
GO
