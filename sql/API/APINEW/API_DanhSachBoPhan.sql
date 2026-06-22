USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBoPhan
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        PhongBan,        -- Mã phòng ban / bộ phận
        TenPhongBan      -- Tên phòng ban / bộ phận
    FROM HR_DepartmentListTbl
    WHERE 
        @Keyword = ''
        OR PhongBan LIKE '%' + @Keyword + '%'
        OR TenPhongBan LIKE N'%' + @Keyword + '%'
    ORDER BY PhongBan;
END
GO
