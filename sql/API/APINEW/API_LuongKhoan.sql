USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_LuongKhoan
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        L.UserAutoID,
        L.PersonID,
        P.PersonName,
        L.TuNgay,
        L.DenNgay,
        L.SoTienKhoan,
        L.GhiChu
    FROM dbo.HR_LuongKhoanTbl L
    LEFT JOIN dbo.HR_PersonTbl P ON L.PersonID = P.PersonID
    WHERE 
        @Keyword = ''
        OR L.PersonID LIKE '%' + @Keyword + '%'
        OR P.PersonName LIKE N'%' + @Keyword + '%'
        OR L.GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY L.TuNgay DESC, L.PersonID ASC;
END
GO
