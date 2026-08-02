USE X26DIMTUTAC
GO

-- 1. Đảm bảo SP API_Payroll được cập nhật mới nhất (có PhongBan, BranchID)
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

    SELECT TOP 1000 
        HR_PayrollTbl.*, 
        A.PhongBan, 
        A.BranchID
    FROM dbo.HR_PayrollTbl
    LEFT JOIN dbo.HR_PersonTbl A ON HR_PayrollTbl.PersonID = A.PersonID 
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

-- 2. Khắc phục lỗi 102 bằng cách chuẩn hóa cấu hình WA_API
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'WA_PayrollFrm' AND [func] = 'View')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) 
    VALUES ('WA_PayrollFrm', 'View', 'API_Payroll', '@PeriodID=N''{PeriodID}'',@PhongBan=N''{PhongBan}'',@Keyword=N''{Keyword}''');
ELSE
    UPDATE dbo.WA_API 
    SET [SQL] = 'API_Payroll', 
        [Para] = '@PeriodID=N''{PeriodID}'',@PhongBan=N''{PhongBan}'',@Keyword=N''{Keyword}''' 
    WHERE [list] = 'WA_PayrollFrm' AND [func] = 'View';
GO