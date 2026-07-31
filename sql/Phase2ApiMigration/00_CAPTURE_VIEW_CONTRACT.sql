/*
  Phase 2 - snapshot chỉ đọc cho pilot WA_BangThueTNCNFrm.
  Script không lưu dữ liệu nhân sự và không thay đổi cấu hình runtime.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @TableName sysname = N'HR_BangThueTNCNTbl';
DECLARE @PrimaryKey sysname = N'Bac';
DECLARE @OldProcedure sysname = N'API_TruyVanDong';
DECLARE @V2Procedure sysname = N'API_BangThueTNCN_V2';

SELECT
    CAST('BASELINE' AS varchar(20)) AS SnapshotKind,
    DB_NAME() AS DatabaseName,
    @FormName AS FormName,
    L.TableName,
    L.PrimaryKey,
    A.[SQL] AS RegisteredProcedure,
    A.Para AS RegisteredParameters,
    CASE WHEN A.[SQL] = @OldProcedure THEN 'EXPECTED_LEGACY' ELSE 'REVIEW_REQUIRED' END AS RegistrationStatus
FROM dbo.SY_FrmLstTbl AS L
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = L.FormID
 AND A.[func] = 'View'
WHERE L.FormID = @FormName;

;WITH ProcedureNames AS (
    SELECT CAST('BEFORE' AS varchar(20)) AS SnapshotKind, @OldProcedure AS ProcedureName
    UNION ALL
    SELECT 'AFTER_CANDIDATE', @V2Procedure
)
SELECT
    P.SnapshotKind,
    P.ProcedureName,
    PR.parameter_id AS ParameterOrdinal,
    PR.name AS ParameterName,
    TYPE_NAME(PR.user_type_id) AS SqlType,
    PR.max_length AS MaxLength,
    PR.[precision] AS [Precision],
    PR.scale AS Scale,
    PR.has_default_value AS HasDefaultValue,
    PR.is_output AS IsOutput
FROM ProcedureNames AS P
LEFT JOIN sys.parameters AS PR
  ON PR.object_id = COALESCE(OBJECT_ID(P.ProcedureName, N'P'), OBJECT_ID(N'dbo.' + P.ProcedureName, N'P'))
ORDER BY P.SnapshotKind, PR.parameter_id;

DECLARE @ResultContract table (
    SnapshotKind varchar(20) NOT NULL,
    ProcedureName sysname NOT NULL,
    ColumnOrdinal int NULL,
    ColumnName sysname NULL,
    SqlType nvarchar(256) NULL,
    IsNullable bit NULL,
    ErrorNumber int NULL,
    ErrorMessage nvarchar(4000) NULL
);

DECLARE @OldObjectID int = COALESCE(OBJECT_ID(@OldProcedure, N'P'), OBJECT_ID(N'dbo.' + @OldProcedure, N'P'));
DECLARE @V2ObjectID int = COALESCE(OBJECT_ID(@V2Procedure, N'P'), OBJECT_ID(N'dbo.' + @V2Procedure, N'P'));

IF @OldObjectID IS NOT NULL
BEGIN
    INSERT INTO @ResultContract
        (SnapshotKind, ProcedureName, ColumnOrdinal, ColumnName, SqlType, IsNullable, ErrorNumber, ErrorMessage)
    SELECT 'BEFORE', @OldProcedure, column_ordinal, name, system_type_name, is_nullable, error_number, error_message
    FROM sys.dm_exec_describe_first_result_set_for_object(@OldObjectID, 0);
END;

IF @V2ObjectID IS NOT NULL
BEGIN
    INSERT INTO @ResultContract
        (SnapshotKind, ProcedureName, ColumnOrdinal, ColumnName, SqlType, IsNullable, ErrorNumber, ErrorMessage)
    SELECT 'AFTER_CANDIDATE', @V2Procedure, column_ordinal, name, system_type_name, is_nullable, error_number, error_message
    FROM sys.dm_exec_describe_first_result_set_for_object(@V2ObjectID, 0);
END;

SELECT SnapshotKind, ProcedureName, ColumnOrdinal, ColumnName, SqlType, IsNullable, ErrorNumber, ErrorMessage
FROM @ResultContract
ORDER BY SnapshotKind, ColumnOrdinal;

SELECT
    SnapshotKind,
    LOWER(ColumnName) AS DuplicateColumnName,
    COUNT(*) AS DuplicateCount
FROM @ResultContract
WHERE ColumnName IS NOT NULL
GROUP BY SnapshotKind, LOWER(ColumnName)
HAVING COUNT(*) > 1;

IF OBJECT_ID(N'dbo.HR_BangThueTNCNTbl', N'U') IS NULL
    THROW 52001, N'Không tìm thấy bảng pilot HR_BangThueTNCNTbl.', 1;

SELECT
    COUNT_BIG(*) AS SampleRowCount,
    COUNT_BIG(DISTINCT Bac) AS UniquePrimaryKeyCount,
    COALESCE(SUM(CASE WHEN Bac IS NULL THEN 1 ELSE 0 END), 0) AS NullPrimaryKeyCount,
    CASE WHEN COUNT_BIG(*) = COUNT_BIG(DISTINCT Bac) AND COALESCE(SUM(CASE WHEN Bac IS NULL THEN 1 ELSE 0 END), 0) = 0
         THEN 'PASS' ELSE 'FAIL' END AS PrimaryKeyUniqueness
FROM dbo.HR_BangThueTNCNTbl;

SELECT
    C.column_id AS ColumnOrdinal,
    C.name AS ColumnName,
    TYPE_NAME(C.user_type_id) AS SqlType,
    C.is_nullable AS IsNullable,
    C.is_identity AS IsIdentity,
    C.is_computed AS IsComputed,
    CASE
        WHEN TYPE_NAME(C.user_type_id) IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                           'sql_variant', 'geography', 'geometry', 'hierarchyid') THEN 'BLOCKED_TECHNICAL'
        WHEN LOWER(C.name) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                               'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext') THEN 'BLOCKED_NAME'
        ELSE 'SAFE_CANDIDATE'
    END AS MobileSafety
FROM sys.columns AS C
WHERE C.object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
ORDER BY C.column_id;

SELECT
    CASE WHEN EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl')
          AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ) THEN 'SCOPED_REVIEW_REQUIRED' ELSE 'GLOBAL_REFERENCE_TABLE' END AS BranchScope,
    CASE WHEN EXISTS (
        SELECT 1 FROM dbo.WA_Menu WHERE FormName = @FormName AND ISNULL(isDisable, 0) = 0
    ) THEN 'MENU_PRESENT' ELSE 'MENU_MISSING' END AS PermissionScope;
GO
