SET XACT_ABORT ON;
GO

/* ============================================================================
   KHÓA ĐƯỜNG GỌI TRỰC TIẾP DASHBOARD QUA WA_API
   Tên file được giữ để các quy trình triển khai cũ không đăng ký lại route.
   Dashboard mới chỉ gọi stored procedure qua backend đã xác minh token.
   ============================================================================ */
BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @DashboardRoutes table
    (
        [List] varchar(100) NOT NULL PRIMARY KEY
    );

    INSERT INTO @DashboardRoutes ([List])
    VALUES
        ('API_HR_Dashboard_GetBranches'),
        ('API_HR_Dashboard_OverviewToday'),
        ('API_HR_Dashboard_Demographics'),
        ('API_HR_Dashboard_Department'),
        ('API_HR_Dashboard_Birthdays'),
        ('API_HR_Dashboard_Payroll'),
        ('API_HR_Dashboard_ContractsExpiring');

    DELETE Existing
    FROM dbo.WA_API AS Existing
    INNER JOIN @DashboardRoutes AS DashboardRoute
        ON DashboardRoute.[List] = Existing.[list]
    WHERE Existing.[func] = 'View';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

/* Kết quả phải rỗng sau khi khóa đường gọi trực tiếp. */
SELECT
    A.[list],
    A.[func],
    A.[SQL],
    A.[Para]
FROM dbo.WA_API AS A
WHERE A.[list] IN
(
    'API_HR_Dashboard_GetBranches',
    'API_HR_Dashboard_OverviewToday',
    'API_HR_Dashboard_Demographics',
    'API_HR_Dashboard_Department',
    'API_HR_Dashboard_Birthdays',
    'API_HR_Dashboard_Payroll',
    'API_HR_Dashboard_ContractsExpiring'
)
  AND A.[func] = 'View';
GO
