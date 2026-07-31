/*
  Phase 3 - runtime test CHỈ ĐỌC.
  Điền tài khoản đang hoạt động và BranchID hợp lệ, sau đó đặt @RunLiveCalls = 1.
  Script không gọi Save/Delete và không thay đổi dữ liệu.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @UserName varchar(100) = '';       -- BẮT BUỘC khi @RunLiveCalls = 1
DECLARE @BranchID varchar(max) = '';       -- BẮT BUỘC với user không phải admin
DECLARE @RunLiveCalls bit = 0;             -- đổi thành 1 sau khi đã điền hai biến trên

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53700, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;
IF @RunLiveCalls = 1 AND @UserName <> '' AND NOT EXISTS (
    SELECT 1 FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0
)
    THROW 53703, N'PHASE3_ACTIVE_TEST_USERNAME_NOT_FOUND', 1;

DECLARE @Results table
(
    WebFormName varchar(100) NOT NULL,
    TestName varchar(50) NOT NULL,
    TestStatus varchar(30) NOT NULL,
    Diagnostic nvarchar(1000) NULL
);

/* Preflight luôn chạy, kể cả khi chưa cấp user test. */
SELECT
    R.WebFormName,
    R.ERPFormID,
    R.ExpectedTableName,
    R.ExpectedPrimaryKey,
    R.ViewV2,
    R.SaveV2,
    R.DeletePolicy,
    R.EnableDelete,
    CASE WHEN @RunLiveCalls = 0 THEN 'PREFLIGHT_ONLY'
         WHEN @UserName = '' THEN 'USER_REQUIRED'
         ELSE 'LIVE_READONLY_ENABLED' END AS RuntimeMode
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
ORDER BY R.WebFormName;

DECLARE
    @WebFormName varchar(100),
    @ERPFormID varchar(100),
    @ExpectedTable sysname,
    @PrimaryKey sysname,
    @Sql nvarchar(max);

DECLARE FormCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT R.WebFormName, R.ERPFormID, R.ExpectedTableName, R.ExpectedPrimaryKey
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
ORDER BY R.WebFormName;

OPEN FormCursor;
FETCH NEXT FROM FormCursor INTO @WebFormName, @ERPFormID, @ExpectedTable, @PrimaryKey;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        IF OBJECT_ID(N'dbo.' + @ExpectedTable, N'U') IS NULL
            THROW 53701, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;

        /* Tối đa 1000 row để kiểm tra PK/null mà không quét toàn bảng lớn. */
        SET @Sql = N'
            SELECT
                @Form AS WebFormName,
                COUNT(*) AS SampleRowCount,
                COUNT(DISTINCT CONVERT(nvarchar(4000), S.' + QUOTENAME(@PrimaryKey) + N')) AS UniquePrimaryKeyCount,
                SUM(CASE WHEN S.' + QUOTENAME(@PrimaryKey) + N' IS NULL THEN 1 ELSE 0 END) AS NullPrimaryKeyCount
            FROM (
                SELECT TOP (1000) T.' + QUOTENAME(@PrimaryKey) + N'
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                ORDER BY T.' + QUOTENAME(@PrimaryKey) + N'
            ) AS S;';
        EXEC sys.sp_executesql @Sql, N'@Form varchar(100)', @Form = @WebFormName;
        INSERT INTO @Results VALUES (@WebFormName, 'PHYSICAL_SAMPLE', 'PASS', N'Đã kiểm tra tối đa 1000 khóa; xem result set ngay trước.');

        IF @RunLiveCalls = 1
        BEGIN
            IF @UserName = ''
                THROW 53702, N'PHASE3_ACTIVE_TEST_USERNAME_REQUIRED', 1;

            /* Unified contract: result set phải có field/capability/mobile/route. */
            EXEC dbo.API_Web_GridFieldSchemaV2
                @WebFormName = @WebFormName,
                @ERPFormID = @ERPFormID,
                @UserName = @UserName,
                @BranchID = @BranchID;
            INSERT INTO @Results VALUES (@WebFormName, 'UNIFIED_CONTRACT', 'PASS_RESULTSET_EMITTED', NULL);

            /* View/search/sort mặc định. */
            EXEC dbo.API_TruyVanDong_V2
                @List = @WebFormName,
                @Keyword = N'',
                @SortColumn = @PrimaryKey,
                @SortDir = 'ASC',
                @Data = N'{}',
                @UserName = @UserName,
                @BranchID = @BranchID;
            INSERT INTO @Results VALUES (@WebFormName, 'VIEW_EMPTY_KEYWORD', 'PASS_RESULTSET_EMITTED', NULL);

            /* Injection probe chỉ đọc: sort không thuộc contract bắt buộc bị chặn. */
            BEGIN TRY
                EXEC dbo.API_TruyVanDong_V2
                    @List = @WebFormName,
                    @Keyword = N'',
                    @SortColumn = 'x];SELECT 1--',
                    @SortDir = 'ASC',
                    @Data = N'{}',
                    @UserName = @UserName,
                    @BranchID = @BranchID;
                INSERT INTO @Results VALUES (@WebFormName, 'SORT_INJECTION', 'FAIL_NOT_BLOCKED', NULL);
            END TRY
            BEGIN CATCH
                INSERT INTO @Results VALUES (
                    @WebFormName,
                    'SORT_INJECTION',
                    CASE WHEN ERROR_NUMBER() = 53119 THEN 'PASS_BLOCKED' ELSE 'REVIEW_ERROR' END,
                    CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE())
                );
            END CATCH;

            /* Unknown filter cũng phải bị chặn trước khi ghép SQL. */
            BEGIN TRY
                EXEC dbo.API_TruyVanDong_V2
                    @List = @WebFormName,
                    @Keyword = N'',
                    @SortColumn = @PrimaryKey,
                    @SortDir = 'ASC',
                    @Data = N'{"__phase3_unknown":"x"}',
                    @UserName = @UserName,
                    @BranchID = @BranchID;
                INSERT INTO @Results VALUES (@WebFormName, 'UNKNOWN_FILTER', 'FAIL_NOT_BLOCKED', NULL);
            END TRY
            BEGIN CATCH
                INSERT INTO @Results VALUES (
                    @WebFormName,
                    'UNKNOWN_FILTER',
                    CASE WHEN ERROR_NUMBER() = 53118 THEN 'PASS_BLOCKED' ELSE 'REVIEW_ERROR' END,
                    CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE())
                );
            END CATCH;
        END
        ELSE
            INSERT INTO @Results VALUES (@WebFormName, 'LIVE_CALLS', 'SKIPPED_BY_DEFAULT', N'Điền @UserName/@BranchID và đặt @RunLiveCalls=1.');
    END TRY
    BEGIN CATCH
        INSERT INTO @Results VALUES (
            @WebFormName, 'FORM_RUNTIME', 'FAIL', CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE())
        );
    END CATCH;

    FETCH NEXT FROM FormCursor INTO @WebFormName, @ERPFormID, @ExpectedTable, @PrimaryKey;
END;

CLOSE FormCursor;
DEALLOCATE FormCursor;

SELECT WebFormName, TestName, TestStatus, Diagnostic
FROM @Results
ORDER BY WebFormName, TestName;

SELECT
    CASE
        WHEN @RunLiveCalls = 0 THEN 'NOT_READY_RUNTIME_NOT_EXECUTED'
        WHEN EXISTS (SELECT 1 FROM @Results WHERE TestStatus LIKE 'FAIL%') THEN 'NOT_READY_RUNTIME_FAILURE'
        WHEN (SELECT COUNT(DISTINCT WebFormName) FROM @Results WHERE TestName = 'UNIFIED_CONTRACT' AND TestStatus = 'PASS_RESULTSET_EMITTED') < 3
            THEN 'NOT_READY_LESS_THAN_THREE_FORMS'
        ELSE 'RUNTIME_READONLY_GATE_PASS_WRITE_AND_BROWSER_TESTS_STILL_REQUIRED'
    END AS Phase3ReadOnlyStatus;
GO
