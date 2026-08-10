
CREATE OR ALTER PROCEDURE dbo.API_Payroll
(
    @PeriodID NVARCHAR(50) = '',
    @PhongBan NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @PeriodID = ISNULL(@PeriodID, '');
    SET @PhongBan = ISNULL(@PhongBan, '');
    SET @Keyword = ISNULL(@Keyword, '');

    Select  top 1000 HR_PayrollTbl.*, A.PhongBan, A.BranchID
    From HR_PayrollTbl
    Left join HR_PersonTbl A on HR_PayrollTbl.PersonID = A.PersonID 
    WHERE 
        (@PeriodID = '' OR HR_PayrollTbl.PeriodID = @PeriodID)
        AND (@PhongBan = '' OR A.PhongBan = @PhongBan)
        AND (
            @Keyword = ''
            OR HR_PayrollTbl.PersonID LIKE '%' + @Keyword + '%'
            OR HR_PayrollTbl.PersonName LIKE N'%' + @Keyword + '%'
            OR HR_PayrollTbl.DocumentID LIKE '%' + @Keyword + '%'
        )
    ORDER BY HR_PayrollTbl.PersonID ASC;
END
GO
