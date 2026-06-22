USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        SapCaID,
        TenBangCa,
        TuNgay,
        DenNgay,
        Thu2,
        Thu3,
        Thu4,
        Thu5,
        Thu6,
        Thu7,
        ChuNhat,
        ShiftIDThu2,
        ShiftIDThu3,
        ShiftIDThu4,
        ShiftIDThu5,
        ShiftIDThu6,
        ShiftIDThu7,
        ShiftIDChuNhat
    FROM dbo.HR_SapCaTbl
    WHERE 
        @Keyword = ''
        OR SapCaID LIKE '%' + @Keyword + '%'
        OR TenBangCa LIKE N'%' + @Keyword + '%'
    ORDER BY SapCaID DESC;
END
GO
