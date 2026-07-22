/*
    Đăng ký ba contract metadata chỉ đọc.

    Script idempotent và fail-closed:
    - chỉ thêm route View còn thiếu;
    - chỉ sửa Para khi route vẫn trỏ đúng procedure đã audit;
    - không đụng tới các route Execute do DDL trigger tự quản lý;
    - dừng nếu có duplicate hoặc route trỏ sang procedure khác.

    Việc chuẩn hóa Para là cần thiết vì bản cũ của TRG_AutoSync_WA_API có thể
    ghi đè {FormName} thành {WebFormName} mỗi khi procedure được ALTER.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Definitions table (
    ListName varchar(50) NOT NULL PRIMARY KEY,
    FuncName varchar(50) NOT NULL,
    ProcedureName nvarchar(50) NOT NULL,
    ParameterTemplate nvarchar(max) NOT NULL
);

INSERT INTO @Definitions (ListName, FuncName, ProcedureName, ParameterTemplate)
VALUES
(
    'API_Web_GridFieldSchemaV2', 'View', 'API_Web_GridFieldSchemaV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
),
(
    'API_Web_GridFieldCompareV2', 'View', 'API_Web_GridFieldCompareV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
),
(
    'API_Web_LookupSchemaV2', 'View', 'API_Web_LookupSchemaV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=''{LookupKey}'', @Keyword=N''{Keyword}'', @Page={Page}, @PageSize={PageSize}, @UserName=N''{User}'', @BranchID=N''{BranchID}'''
);

BEGIN TRY
    BEGIN TRANSACTION;

    /* Khóa đúng ba route View trong lúc kiểm tra/sửa để tránh race. */
    IF EXISTS (
        SELECT 1
        FROM @Definitions AS D
        WHERE (
            SELECT COUNT(*)
            FROM dbo.WA_API AS A WITH (UPDLOCK, HOLDLOCK)
            WHERE A.[list] = D.ListName
              AND A.[func] = D.FuncName
        ) > 1
    )
        THROW 52901, N'Mỗi metadata route chỉ được có tối đa một dòng View.', 1;

    IF EXISTS (
        SELECT 1
        FROM @Definitions AS D
        INNER JOIN dbo.WA_API AS A WITH (UPDLOCK, HOLDLOCK)
          ON A.[list] = D.ListName
         AND A.[func] = D.FuncName
        WHERE ISNULL(LTRIM(RTRIM(A.[SQL])), '') <> D.ProcedureName
    )
        THROW 52902, N'Metadata route đang trỏ tới procedure khác; từ chối ghi đè.', 1;

    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
    SELECT D.ListName, D.FuncName, D.ProcedureName, D.ParameterTemplate
    FROM @Definitions AS D
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.WA_API AS A WITH (UPDLOCK, HOLDLOCK)
        WHERE A.[list] = D.ListName
          AND A.[func] = D.FuncName
    );

    /* Chỉ repair template của đúng route/procedure đã audit. */
    UPDATE A
    SET A.[Para] = D.ParameterTemplate
    FROM dbo.WA_API AS A
    INNER JOIN @Definitions AS D
      ON A.[list] = D.ListName
     AND A.[func] = D.FuncName
     AND A.[SQL] = D.ProcedureName
    WHERE ISNULL(CONVERT(nvarchar(max), A.[Para]), N'') <> D.ParameterTemplate;

    IF EXISTS (
        SELECT 1
        FROM @Definitions AS D
        WHERE (
            SELECT COUNT(*)
            FROM dbo.WA_API AS A
            WHERE A.[list] = D.ListName
              AND A.[func] = D.FuncName
              AND A.[SQL] = D.ProcedureName
              AND ISNULL(CONVERT(nvarchar(max), A.[Para]), N'') = D.ParameterTemplate
        ) <> 1
    )
        THROW 52903, N'Không chuẩn hóa được đầy đủ ba metadata route.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    D.ListName,
    D.FuncName,
    A.[SQL] AS ActualProcedure,
    A.[Para] AS ActualParameterTemplate,
    CASE
        WHEN A.[SQL] = D.ProcedureName
         AND ISNULL(CONVERT(nvarchar(max), A.[Para]), N'') = D.ParameterTemplate
         AND COUNT(*) OVER (PARTITION BY A.[list], A.[func]) = 1 THEN 'OK'
        WHEN A.[SQL] IS NULL THEN 'MISSING'
        ELSE 'CONFLICT_REVIEW_REQUIRED'
    END AS RegistrationStatus
FROM @Definitions AS D
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = D.ListName
 AND A.[func] = D.FuncName
ORDER BY D.ListName;
