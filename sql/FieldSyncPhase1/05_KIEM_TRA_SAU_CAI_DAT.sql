/* Kiểm tra sau cài đặt; chỉ đọc và không kích hoạt pilot. */
SET NOCOUNT ON;

SELECT
    X.ProcedureName,
    CASE WHEN OBJECT_ID(N'dbo.' + X.ProcedureName, N'P') IS NULL THEN 'MISSING' ELSE 'OK' END AS ProcedureStatus
FROM (VALUES
    ('API_Web_GridFieldSchemaV2'),
    ('API_Web_GridFieldCompareV2'),
    ('API_Web_LookupSchemaV2')
) AS X(ProcedureName)
ORDER BY X.ProcedureName;

SELECT
    A.[list], A.[func], A.[SQL],
    COUNT(*) OVER (PARTITION BY A.[list], A.[func]) AS RegistrationCount,
    CASE
        WHEN A.[func] = 'View' AND A.[SQL] = A.[list]
             AND COUNT(*) OVER (PARTITION BY A.[list], A.[func]) = 1 THEN 'OK'
        ELSE 'REVIEW_REQUIRED'
    END AS RegistrationStatus
FROM dbo.WA_API AS A
WHERE A.[list] IN (
    'API_Web_GridFieldSchemaV2',
    'API_Web_GridFieldCompareV2',
    'API_Web_LookupSchemaV2'
)
ORDER BY A.[list], A.[func];

SELECT
    A.[list] AS ExistingList,
    A.[func] AS ExistingFunc,
    A.[SQL] AS ExistingProcedure
FROM dbo.WA_API AS A
WHERE A.[list] IN ('WA_BangThueTNCNFrm', 'WA_ChucDanhFrm')
ORDER BY A.[list], A.[func];

