/* Phase 3 - verification chỉ đọc sau cài đặt/đăng ký. */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53600, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;

/* Result set 1: các object và quy tắc cấm. */
SELECT
    X.ObjectName,
    CASE X.ObjectType
        WHEN 'IF' THEN OBJECT_ID(N'dbo.' + X.ObjectName, N'IF')
        ELSE OBJECT_ID(N'dbo.' + X.ObjectName, N'P')
    END AS ObjectID,
    CASE WHEN CASE X.ObjectType
        WHEN 'IF' THEN OBJECT_ID(N'dbo.' + X.ObjectName, N'IF')
        ELSE OBJECT_ID(N'dbo.' + X.ObjectName, N'P')
    END IS NULL THEN 'MISSING' ELSE 'OK' END AS ObjectStatus
FROM (VALUES
    (CONVERT(sysname, N'API_Phase3SimpleCrudRegistry'), 'IF'),
    (CONVERT(sysname, N'API_TruyVanDong_V2'), 'P'),
    (CONVERT(sysname, N'API_Web_GridFieldSchemaV2'), 'P'),
    (CONVERT(sysname, N'API_LuuDong_V2'), 'P'),
    (CONVERT(sysname, N'API_XoaDong_V2'), 'P')
) AS X(ObjectName, ObjectType)
ORDER BY X.ObjectName;

SELECT
    O.name AS ProcedureName,
    CONVERT(bit, CASE WHEN M.definition LIKE '%SY_FormatFields%' THEN 1 ELSE 0 END) AS ReadsLegacyFormatFields,
    CONVERT(bit, CASE WHEN M.definition LIKE '%API_Phase3SimpleCrudRegistry%' THEN 1 ELSE 0 END) AS UsesSourceAllowList,
    CONVERT(bit, CASE WHEN M.definition LIKE '%COLLATE DATABASE_DEFAULT%' THEN 1 ELSE 0 END) AS HasCollationNormalization
FROM sys.objects AS O
INNER JOIN sys.sql_modules AS M ON M.object_id = O.object_id
WHERE O.object_id IN (
    OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P'),
    OBJECT_ID(N'dbo.API_Web_GridFieldSchemaV2', N'P'),
    OBJECT_ID(N'dbo.API_LuuDong_V2', N'P'),
    OBJECT_ID(N'dbo.API_XoaDong_V2', N'P')
)
ORDER BY O.name;

/* Result set 2: gate tĩnh theo form và action. */
DECLARE @ExpectedViewPara nvarchar(4000) =
    N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''';
DECLARE @ExpectedSavePara nvarchar(4000) =
    N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''';
DECLARE @ExpectedDeletePara nvarchar(4000) =
    N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''';

SELECT
    R.WebFormName,
    R.ERPFormID,
    R.ExpectedTableName,
    R.ExpectedPrimaryKey,
    FR.RegistrationCount,
    FR.RegisteredTableName,
    FR.RegisteredPrimaryKey,
    O.ObjectID,
    PC.PhysicalColumnCount,
    MC.CaptionMatchCount,
    FC.FormatMatchCount,
    LC.LookupMatchCount,
    SC.ScopeColumnCount,
    SD.SoftDeleteState,
    CASE SD.SoftDeleteState
        WHEN 'SOFT_READY' THEN 'SOFT'
        WHEN 'ABSENT' THEN 'HARD'
        ELSE 'INVALID_ISDELETED_TYPE'
    END AS ResolvedDeleteMode,
    M.ActiveMenuCount,
    V.ViewRowCount,
    V.CurrentView,
    V.CurrentViewPara,
    CASE WHEN V.ViewRowCount = 1
          AND PARSENAME(V.CurrentView, 1) COLLATE DATABASE_DEFAULT = R.ViewV2 COLLATE DATABASE_DEFAULT
          AND V.CurrentViewPara COLLATE DATABASE_DEFAULT = @ExpectedViewPara COLLATE DATABASE_DEFAULT
         THEN 'PASS' ELSE 'FAIL' END AS ViewGate,
    S.SaveRowCount,
    S.CurrentSave,
    S.CurrentSavePara,
    CASE WHEN S.SaveRowCount = 1
          AND PARSENAME(S.CurrentSave, 1) COLLATE DATABASE_DEFAULT = R.SaveV2 COLLATE DATABASE_DEFAULT
          AND S.CurrentSavePara COLLATE DATABASE_DEFAULT = @ExpectedSavePara COLLATE DATABASE_DEFAULT
         THEN 'PASS' ELSE 'FAIL' END AS SaveGate,
    D.DeleteRowCount,
    D.CurrentDelete,
    D.CurrentDeletePara,
    R.DeletePolicy,
    CASE
        WHEN R.EnableDelete = 0
         AND D.DeleteRowCount = 1
         AND PARSENAME(D.CurrentDelete, 1) COLLATE DATABASE_DEFAULT = R.OldDelete COLLATE DATABASE_DEFAULT
            THEN 'PASS_BLOCKED'
        WHEN R.EnableDelete = 1
         AND R.DeletePolicy COLLATE DATABASE_DEFAULT = 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
         AND SD.SoftDeleteState = 'SOFT_READY'
         AND D.DeleteRowCount = 1
         AND PARSENAME(D.CurrentDelete, 1) COLLATE DATABASE_DEFAULT = R.DeleteV2 COLLATE DATABASE_DEFAULT
         AND D.CurrentDeletePara COLLATE DATABASE_DEFAULT = @ExpectedDeletePara COLLATE DATABASE_DEFAULT
            THEN 'PASS_SOFT'
        WHEN R.EnableDelete = 1
         AND R.DeletePolicy COLLATE DATABASE_DEFAULT = 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
         AND SD.SoftDeleteState = 'ABSENT'
         AND D.DeleteRowCount = 1
         AND PARSENAME(D.CurrentDelete, 1) COLLATE DATABASE_DEFAULT = R.DeleteV2 COLLATE DATABASE_DEFAULT
         AND D.CurrentDeletePara COLLATE DATABASE_DEFAULT = @ExpectedDeletePara COLLATE DATABASE_DEFAULT
            THEN 'PASS_HARD'
        WHEN R.EnableDelete = 1
         AND R.DeletePolicy COLLATE DATABASE_DEFAULT = 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
         AND SD.SoftDeleteState = 'INVALID_TYPE'
            THEN 'BLOCK_INVALID_ISDELETED_TYPE'
        ELSE 'FAIL'
    END AS DeleteGate,
    CASE
        WHEN FR.RegistrationCount <> 1 THEN 'BLOCK_REGISTRATION_COUNT'
        WHEN FR.RegisteredTableName COLLATE DATABASE_DEFAULT <> R.ExpectedTableName COLLATE DATABASE_DEFAULT THEN 'BLOCK_TABLE_MISMATCH'
        WHEN FR.RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> R.ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 'BLOCK_PRIMARY_KEY_MISMATCH'
        WHEN O.ObjectID IS NULL THEN 'BLOCK_TABLE_MISSING'
        WHEN UX.UniqueIndexCount = 0 THEN 'BLOCK_PRIMARY_KEY_NOT_UNIQUE'
        WHEN SC.ScopeColumnCount > 0 THEN 'BLOCK_BRANCH_POLICY_REVIEW'
        WHEN M.ActiveMenuCount = 0 THEN 'BLOCK_MENU_MISSING'
        WHEN V.ViewRowCount <> 1 OR PARSENAME(V.CurrentView, 1) COLLATE DATABASE_DEFAULT <> R.ViewV2 COLLATE DATABASE_DEFAULT THEN 'BLOCK_VIEW_NOT_V2'
        WHEN V.CurrentViewPara IS NULL OR V.CurrentViewPara COLLATE DATABASE_DEFAULT <> @ExpectedViewPara COLLATE DATABASE_DEFAULT THEN 'BLOCK_VIEW_PARA_MISMATCH'
        WHEN S.SaveRowCount <> 1 OR PARSENAME(S.CurrentSave, 1) COLLATE DATABASE_DEFAULT <> R.SaveV2 COLLATE DATABASE_DEFAULT THEN 'BLOCK_SAVE_NOT_V2'
        WHEN S.CurrentSavePara IS NULL OR S.CurrentSavePara COLLATE DATABASE_DEFAULT <> @ExpectedSavePara COLLATE DATABASE_DEFAULT THEN 'BLOCK_SAVE_PARA_MISMATCH'
        WHEN R.EnableDelete = 0 AND (D.DeleteRowCount <> 1 OR PARSENAME(D.CurrentDelete, 1) COLLATE DATABASE_DEFAULT <> R.OldDelete COLLATE DATABASE_DEFAULT) THEN 'BLOCK_DELETE_NOT_SAFE'
        WHEN R.EnableDelete = 1 AND R.DeletePolicy COLLATE DATABASE_DEFAULT <> 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT THEN 'BLOCK_DELETE_POLICY'
        WHEN R.EnableDelete = 1 AND SD.SoftDeleteState = 'INVALID_TYPE' THEN 'BLOCK_INVALID_ISDELETED_TYPE'
        WHEN R.EnableDelete = 1 AND (D.DeleteRowCount <> 1 OR PARSENAME(D.CurrentDelete, 1) COLLATE DATABASE_DEFAULT <> R.DeleteV2 COLLATE DATABASE_DEFAULT) THEN 'BLOCK_DELETE_NOT_V2'
        WHEN R.EnableDelete = 1 AND (D.CurrentDeletePara IS NULL OR D.CurrentDeletePara COLLATE DATABASE_DEFAULT <> @ExpectedDeletePara COLLATE DATABASE_DEFAULT) THEN 'BLOCK_DELETE_PARA_MISMATCH'
        ELSE 'STATIC_GATE_PASS_RUNTIME_TEST_REQUIRED'
    END AS FormGateStatus
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
OUTER APPLY (
    SELECT COUNT(*) AS RegistrationCount,
           MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))) AS RegisteredTableName,
           MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey)))) AS RegisteredPrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = R.WebFormName COLLATE DATABASE_DEFAULT
) AS FR
OUTER APPLY (SELECT OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U') AS ObjectID) AS O
OUTER APPLY (
    SELECT COUNT(*) AS PhysicalColumnCount FROM sys.columns AS C WHERE C.object_id = O.ObjectID
) AS PC
OUTER APPLY (
    SELECT COUNT(*) AS UniqueIndexCount
    FROM (
        SELECT I.index_id
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
        WHERE I.object_id = O.ObjectID AND I.is_unique = 1 AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(O.ObjectID, R.ExpectedPrimaryKey, 'ColumnId')
    ) AS Q
) AS UX
OUTER APPLY (
    SELECT COUNT(*) AS CaptionMatchCount
    FROM sys.columns AS C
    WHERE C.object_id = O.ObjectID
      AND EXISTS (
          SELECT 1 FROM dbo.SY_FmtFldTbl AS F
          WHERE F.FieldName COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
            AND F.FormName COLLATE DATABASE_DEFAULT IN (R.ERPFormID, R.WebFormName)
      )
) AS MC
OUTER APPLY (
    SELECT COUNT(*) AS FormatMatchCount
    FROM sys.columns AS C
    WHERE C.object_id = O.ObjectID
      AND EXISTS (
          SELECT 1 FROM dbo.SY_FmtFldTbl AS FF
          INNER JOIN dbo.SY_FmatTbl AS FM
            ON FM.FormatID COLLATE DATABASE_DEFAULT = FF.FormatID COLLATE DATABASE_DEFAULT
          WHERE FF.FieldName COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
            AND FF.FormName COLLATE DATABASE_DEFAULT IN (R.ERPFormID, R.WebFormName)
      )
) AS FC
OUTER APPLY (
    SELECT COUNT(*) AS LookupMatchCount
    FROM sys.columns AS C
    WHERE C.object_id = O.ObjectID
      AND EXISTS (
          SELECT 1 FROM dbo.SY_FrmDrdwTbl AS L
          WHERE L.ColumnID COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
            AND L.FormID COLLATE DATABASE_DEFAULT IN (R.ERPFormID, R.WebFormName)
            AND ISNULL(L.IsDisable, 0) = 0
      )
) AS LC
OUTER APPLY (
    SELECT COUNT(*) AS ScopeColumnCount
    FROM sys.columns AS C
    WHERE C.object_id = O.ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
) AS SC
OUTER APPLY (
    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM sys.columns AS C
            INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
            WHERE C.object_id = O.ObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
              AND T.name COLLATE DATABASE_DEFAULT = 'bit' COLLATE DATABASE_DEFAULT
              AND C.is_computed = 0
        ) THEN 'SOFT_READY'
        WHEN EXISTS (
            SELECT 1 FROM sys.columns AS C
            WHERE C.object_id = O.ObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
        ) THEN 'INVALID_TYPE'
        ELSE 'ABSENT'
    END AS SoftDeleteState
) AS SD
OUTER APPLY (
    SELECT COUNT(*) AS ActiveMenuCount FROM dbo.WA_Menu AS X
    WHERE X.FormName COLLATE DATABASE_DEFAULT = R.WebFormName COLLATE DATABASE_DEFAULT
      AND ISNULL(X.isDisable, 0) = 0
) AS M
OUTER APPLY (
    SELECT
        COUNT(*) AS ViewRowCount,
        MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentView,
        MIN(CONVERT(nvarchar(4000), LTRIM(RTRIM(A.Para)))) AS CurrentViewPara
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = R.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT
) AS V
OUTER APPLY (
    SELECT
        COUNT(*) AS SaveRowCount,
        MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentSave,
        MIN(CONVERT(nvarchar(4000), LTRIM(RTRIM(A.Para)))) AS CurrentSavePara
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = R.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT
) AS S
OUTER APPLY (
    SELECT
        COUNT(*) AS DeleteRowCount,
        MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL])))) AS CurrentDelete,
        MIN(CONVERT(nvarchar(4000), LTRIM(RTRIM(A.Para)))) AS CurrentDeletePara
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = R.WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT
) AS D
ORDER BY R.WebFormName;

/* Result set 3: metadata động có thể trả 11514; đây là diagnostic, không hard-fail. */
SELECT
    X.ProcedureName,
    D.error_number AS DescribeErrorNumber,
    D.error_message AS DescribeErrorMessage,
    COUNT(CASE WHEN D.error_number IS NULL AND ISNULL(D.is_hidden, 0) = 0 THEN 1 END)
        OVER (PARTITION BY X.ProcedureName) AS DescribedColumnCount,
    CASE
        WHEN D.error_number = 11514 THEN 'DIAGNOSTIC_DYNAMIC_SQL_EXPECTED'
        WHEN D.error_number IS NOT NULL THEN 'REVIEW_REQUIRED'
        ELSE 'DESCRIBED'
    END AS DescribeStatus
FROM (VALUES
    (CONVERT(sysname, N'API_TruyVanDong_V2')),
    (CONVERT(sysname, N'API_LuuDong_V2')),
    (CONVERT(sysname, N'API_XoaDong_V2'))
) AS X(ProcedureName)
OUTER APPLY sys.dm_exec_describe_first_result_set_for_object(OBJECT_ID(N'dbo.' + X.ProcedureName, N'P'), 0) AS D
ORDER BY X.ProcedureName, D.column_ordinal;
GO
