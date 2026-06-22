USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangPhuCap
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        MaPhuCap,
        TenPhuCap,
        NhomPhuCap,
        TienPhuCapNgay,
        TienPhuCapThang,
        GhiChu,
        DVT,
        UserCreate,
        UserUpdate,
        DateUpdate,
        DateCreate
    FROM dbo.HR_BangPhuCapTbl
    WHERE 
        @Keyword = ''
        OR MaPhuCap LIKE '%' + @Keyword + '%'
        OR TenPhuCap LIKE N'%' + @Keyword + '%'
        OR NhomPhuCap LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY MaPhuCap ASC;
END
GO
