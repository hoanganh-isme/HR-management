/* Đăng ký ba contract chỉ đọc. Không thay đổi đăng ký đã tồn tại. */
SET NOCOUNT ON;

DECLARE @Definitions table (
    ListName varchar(50) NOT NULL,
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

INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para])
SELECT D.ListName, D.FuncName, D.ProcedureName, D.ParameterTemplate
FROM @Definitions AS D
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.WA_API AS A
    WHERE A.[list] = D.ListName
      AND A.[func] = D.FuncName
);

SELECT
    D.ListName,
    D.FuncName,
    A.[SQL] AS ActualProcedure,
    CASE
        WHEN A.[SQL] = D.ProcedureName AND A.[Para] = D.ParameterTemplate THEN 'OK'
        WHEN A.[SQL] IS NULL THEN 'MISSING'
        ELSE 'CONFLICT_REVIEW_REQUIRED'
    END AS RegistrationStatus
FROM @Definitions AS D
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = D.ListName
 AND A.[func] = D.FuncName
ORDER BY D.ListName;

