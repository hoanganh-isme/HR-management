/* Kiểm tra sau cài đặt; chỉ đọc và không kích hoạt pilot. */
SET NOCOUNT ON;

DECLARE @Definitions table (
    ListName varchar(50) NOT NULL PRIMARY KEY,
    ProcedureName nvarchar(50) NOT NULL,
    ParameterTemplate nvarchar(max) NOT NULL
);

INSERT INTO @Definitions (ListName, ProcedureName, ParameterTemplate)
VALUES
(
    'API_Web_GridFieldSchemaV2',
    'API_Web_GridFieldSchemaV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
),
(
    'API_Web_GridFieldCompareV2',
    'API_Web_GridFieldCompareV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
),
(
    'API_Web_LookupSchemaV2',
    'API_Web_LookupSchemaV2',
    N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=''{LookupKey}'', @Keyword=N''{Keyword}'', @Page={Page}, @PageSize={PageSize}, @UserName=N''{User}'', @BranchID=N''{BranchID}'''
);

SELECT
    X.ProcedureName,
    CASE WHEN OBJECT_ID(N'dbo.' + X.ProcedureName, N'P') IS NULL THEN 'MISSING' ELSE 'OK' END AS ProcedureStatus
FROM (VALUES
    ('API_Web_GridFieldSchemaV2'),
    ('API_Web_GridFieldCompareV2'),
    ('API_Web_LookupSchemaV2')
) AS X(ProcedureName)
ORDER BY X.ProcedureName;

/* Chỉ route View được dùng bởi metadata backend mới là gate chính. */
SELECT
    D.ListName,
    A.[func],
    A.[SQL],
    A.[Para],
    COUNT(A.[list]) OVER (PARTITION BY D.ListName, A.[func]) AS RegistrationCount,
    CASE
        WHEN A.[func] = 'View'
         AND A.[SQL] = D.ProcedureName
         AND CONVERT(nvarchar(max), A.[Para]) = D.ParameterTemplate
         AND COUNT(A.[list]) OVER (PARTITION BY D.ListName, A.[func]) = 1 THEN 'OK'
        WHEN A.[list] IS NULL THEN 'MISSING'
        ELSE 'REVIEW_REQUIRED'
    END AS RegistrationStatus
FROM @Definitions AS D
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = D.ListName
ORDER BY D.ListName, A.[func], A.[SQL];

/* Execute rows do not participate in the View route; show them separately. */
SELECT
    A.[list],
    A.[func],
    A.[SQL],
    A.[Para],
    'AUXILIARY_NOT_USED_BY_METADATA_VIEW' AS RegistrationRole
FROM dbo.WA_API AS A
WHERE A.[list] IN (
    'API_Web_GridFieldSchemaV2',
    'API_Web_GridFieldCompareV2',
    'API_Web_LookupSchemaV2'
)
  AND A.[func] <> 'View'
ORDER BY A.[list], A.[func];

/* Phát hiện trigger cũ có nguy cơ ghi đè mọi dòng cùng [SQL]. */
SELECT
    T.name AS TriggerName,
    T.is_disabled,
    CASE
        WHEN M.definition IS NULL THEN 'NOT_FOUND'
        WHEN M.definition LIKE '%WHERE [SQL] = @ObjectName%' THEN 'UNSAFE_REWRITE_ALL_MATCHES_SQL'
        ELSE 'SAFE_OR_REVIEW'
    END AS TriggerSafety
FROM sys.triggers AS T
LEFT JOIN sys.sql_modules AS M
  ON M.object_id = T.object_id
WHERE T.parent_class_desc = 'DATABASE'
  AND T.name = N'TRG_AutoSync_WA_API';

SELECT
    A.[list] AS ExistingList,
    A.[func] AS ExistingFunc,
    A.[SQL] AS ExistingProcedure
FROM dbo.WA_API AS A
WHERE A.[list] IN ('WA_BangThueTNCNFrm', 'WA_ChucDanhFrm')
ORDER BY A.[list], A.[func];
