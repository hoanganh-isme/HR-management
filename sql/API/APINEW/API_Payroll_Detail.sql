USE X26DIMTUTAC
GO
CREATE  PROCEDURE dbo.API_Payroll_Detail
(
    @DocumentID NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @DocumentID = ISNULL(@DocumentID, '');

    SELECT 
        UserAutoID,
        DocumentID,
        Code,
        Mota,
        SoTien,
        Notes
    FROM dbo.HR_PayrollDetailTbl
    WHERE DocumentID = @DocumentID
    ORDER BY Code ASC;
END
GO
