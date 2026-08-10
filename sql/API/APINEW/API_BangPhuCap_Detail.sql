USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangPhuCap_Detail
(
    @MaPhuCap NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    Select  top 1000 HR_PersonAllowanceTbl.*, PersonName, PhongBan, TitleName
    From HR_PersonAllowanceTbl
    Left join HR_PersonTbl A on HR_PersonAllowanceTbl.PersonID = A.PersonID 
    WHERE HR_PersonAllowanceTbl.MaPhuCap = @MaPhuCap
    ORDER BY HR_PersonAllowanceTbl.PersonID ASC;
END
GO
