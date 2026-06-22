USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangPhuCap_Detail
(
    @MaPhuCap NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        A.UserAutoID,
        A.MaPhuCap,
        A.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,
        A.GhiChu,
        A.NoiDungPhuCap
    FROM dbo.HR_PersonAllowanceTbl A
    LEFT JOIN dbo.HR_PersonTbl P ON A.PersonID = P.PersonID
    WHERE A.MaPhuCap = @MaPhuCap
    ORDER BY A.PersonID ASC;
END
GO
