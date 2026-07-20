/* Read-only gate verification. Không trả sample row và không cập nhật WA_API. */
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @TableObjectID int = OBJECT_ID(N'dbo.HR_BangThueTNCNTbl', N'U');
DECLARE @ViewObjectID int = OBJECT_ID(N'dbo.API_BangThueTNCN_V2', N'P');
DECLARE @SaveObjectID int = OBJECT_ID(N'dbo.API_LuuDong_V2', N'P');
DECLARE @DeleteObjectID int = OBJECT_ID(N'dbo.API_XoaDong_V2', N'P');
DECLARE @GridSchemaObjectID int = OBJECT_ID(N'dbo.API_Web_GridFieldSchemaV2', N'P');

IF @TableObjectID IS NULL THROW 52501, N'Không tìm thấy bảng pilot.', 1;
IF @ViewObjectID IS NULL THROW 52502, N'Không tìm thấy View V2 pilot.', 1;
IF @SaveObjectID IS NULL THROW 52503, N'Không tìm thấy Save V2.', 1;
IF @DeleteObjectID IS NULL THROW 52504, N'Không tìm thấy Delete V2.', 1;
IF @GridSchemaObjectID IS NULL THROW 52523, N'Không tìm thấy Grid Schema V2 của Phase 1.', 1;

IF (SELECT COUNT(*) FROM sys.parameters WHERE object_id = @ViewObjectID) <> 7
    THROW 52516, N'View V2 không giữ đủ 5 tham số legacy và 2 context tùy chọn.', 1;
IF EXISTS (
    SELECT ExpectedName
    FROM (VALUES ('@List'), ('@Keyword'), ('@SortColumn'), ('@SortDir'), ('@Data'), ('@UserName'), ('@BranchID')) AS E(ExpectedName)
    WHERE NOT EXISTS (
        SELECT 1 FROM sys.parameters AS P
        WHERE P.object_id = @ViewObjectID AND LOWER(P.name) = LOWER(E.ExpectedName)
    )
)
    THROW 52517, N'View V2 thiếu tên tham số trong contract.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @ViewObjectID
      AND M.definition LIKE '%WA_UserGroupPermisstion%'
      AND M.definition LIKE '%WA_UserPermisstion%'
      AND M.definition LIKE '%@Keyword%'
      AND M.definition LIKE '%@BranchID%'
)
    THROW 52518, N'View V2 thiếu kiểm tra quyền hoặc keyword trong module definition.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @ViewObjectID
      AND M.definition LIKE '%PHASE2_BRANCH_FAIL_CLOSED%'
      AND M.definition LIKE '%BranchID trong JsonData%'
      AND M.definition LIKE '%PHASE2_NEW_FIELDS_DISPLAY_ONLY%'
)
    THROW 52521, N'View V2 thiếu gate branch fail-closed, đối chiếu branch hoặc policy field mới display-only.', 1;

IF EXISTS (
    SELECT RequiredObjectID
    FROM (VALUES (@SaveObjectID), (@DeleteObjectID)) AS Required(RequiredObjectID)
    WHERE NOT EXISTS (
        SELECT 1
        FROM sys.sql_modules AS M
        WHERE M.object_id = Required.RequiredObjectID
          AND M.definition LIKE '%PHASE2_BRANCH_FAIL_CLOSED%'
          AND M.definition LIKE '%PHASE2_PERMISSION_RUN_GATE%'
          AND M.definition LIKE '%UserName trong JsonData không khớp actor%'
    )
)
    THROW 52522, N'Save/Delete V2 thiếu branch, IsRun hoặc actor-in-JSON gate.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @GridSchemaObjectID
      AND M.definition LIKE '%PHASE2_SHADOW_VIEW_OVERRIDE%'
      AND M.definition LIKE '%API_BangThueTNCN_V2%'
      AND M.definition LIKE '%SHADOW_VIEW_NOT_REGISTERED%'
      AND M.definition LIKE '%RESULTSET_METADATA_ERROR%'
      AND M.definition LIKE '%RESULTSET_UNSAFE_FIELD%'
)
    THROW 52524, N'Grid Schema V2 chưa có shadow override hoặc gate result-set an toàn cho pilot.', 1;

IF (SELECT COUNT(*) FROM dbo.SY_FrmLstTbl WHERE FormID = @FormName AND TableName = 'HR_BangThueTNCNTbl' AND PrimaryKey = 'Bac') <> 1
    THROW 52505, N'Registry pilot không đúng TableName/PrimaryKey.', 1;

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'View') <> 1
    THROW 52506, N'WA_API View không duy nhất.', 1;

DECLARE @Contract table (
    ColumnOrdinal int NULL,
    ColumnName sysname NULL,
    SqlType nvarchar(256) NULL,
    IsNullable bit NULL,
    ErrorNumber int NULL,
    ErrorMessage nvarchar(4000) NULL
);

INSERT INTO @Contract
SELECT column_ordinal, name, system_type_name, is_nullable, error_number, error_message
FROM sys.dm_exec_describe_first_result_set_for_object(@ViewObjectID, 0);

IF EXISTS (SELECT 1 FROM @Contract WHERE ErrorNumber IS NOT NULL)
    THROW 52507, N'Không mô tả được result-set View V2.', 1;
IF EXISTS (SELECT LOWER(ColumnName) FROM @Contract GROUP BY LOWER(ColumnName) HAVING COUNT(*) > 1)
    THROW 52508, N'View V2 có tên cột trùng.', 1;
IF NOT EXISTS (SELECT 1 FROM @Contract WHERE LOWER(ColumnName) = 'bac')
    THROW 52509, N'View V2 thiếu primary key Bac.', 1;

IF EXISTS (
    SELECT 1
    FROM @Contract
    WHERE LOWER(ColumnName) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
       OR LOWER(SqlType) LIKE '%varbinary%'
       OR LOWER(SqlType) LIKE '% image%'
)
    THROW 52510, N'View V2 có field thuộc deny-list mobile.', 1;

IF EXISTS (
    SELECT 1
    FROM (VALUES (1, 'Bac'), (2, 'Tu'), (3, 'Den'), (4, 'ThueSuat')) AS E(Ordinal, ColumnName)
    LEFT JOIN @Contract AS C
      ON C.ColumnOrdinal = E.Ordinal AND LOWER(C.ColumnName) = LOWER(E.ColumnName)
    WHERE C.ColumnName IS NULL
)
    THROW 52511, N'Bốn field legacy không còn giữ nguyên thứ tự/alias đầu result-set.', 1;

IF EXISTS (
    SELECT 1 FROM sys.columns AS C
    JOIN sys.types AS T ON T.user_type_id = C.user_type_id
      AND C.object_id = @TableObjectID
    WHERE LOWER(C.name) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                            'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
       OR (C.object_id = @TableObjectID AND LOWER(T.name) IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                                               'sql_variant', 'geography', 'geometry', 'hierarchyid'))
)
    THROW 52512, N'Bảng pilot có cột kỹ thuật khiến MainAlias.* không an toàn.', 1;

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = @TableObjectID AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
)
    THROW 52513, N'Bảng pilot có scope nhưng V2 chưa có isolation tương ứng.', 1;

IF EXISTS (SELECT Bac FROM dbo.HR_BangThueTNCNTbl GROUP BY Bac HAVING COUNT(*) > 1)
    THROW 52514, N'Primary key Bac bị trùng trong dữ liệu hiện tại.', 1;
IF EXISTS (SELECT 1 FROM dbo.HR_BangThueTNCNTbl WHERE Bac IS NULL)
    THROW 52515, N'Primary key Bac có NULL.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes AS I
    INNER JOIN sys.index_columns AS IC
        ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
    WHERE I.object_id = @TableObjectID AND I.is_unique = 1 AND I.is_disabled = 0
    GROUP BY I.index_id
    HAVING COUNT(*) = 1 AND MAX(IC.column_id) = COLUMNPROPERTY(@TableObjectID, 'Bac', 'ColumnId')
)
    THROW 52519, N'Bac chưa có unique index/PK vật lý.', 1;

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = @TableObjectID AND LOWER(name) = 'isdeleted'
)
    THROW 52520, N'Bảng pilot có soft-delete nhưng View V2 chưa có policy lọc đã xác minh.', 1;

SELECT
    'VIEW_CONTRACT' AS GateName,
    'PASS_STATIC_ONLY_NOT_ACTIVATION' AS GateStatus,
    COUNT(*) AS ResultColumnCount,
    SUM(CASE WHEN ColumnOrdinal <= 4 THEN 1 ELSE 0 END) AS LegacyColumnCount
FROM @Contract;

SELECT
    'SAVE_V2' AS GateName,
    'REQUIRES_TRANSACTION_TEST' AS GateStatus,
    N'Chưa đăng ký Save cho tới khi insert/edit/permission/rollback test đạt.' AS Diagnostic
UNION ALL
SELECT
    'DELETE_V2',
    CASE WHEN EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @TableObjectID AND LOWER(name) = 'isdeleted')
         THEN 'REQUIRES_SOFT_DELETE_TEST' ELSE 'BLOCKED_NO_SOFT_DELETE' END,
    N'Hard-delete không có allow-list trong pilot đầu.';

SELECT
    'RUNTIME_PARITY' AS GateName,
    'REQUIRES_DB_HARNESS' AS GateStatus,
    N'Chưa tự động chứng minh row count, nullability, keyword, sort, branch, permission và rollback giữa old/V2.' AS Diagnostic;

SELECT
    A.[func] AS ApiFunc,
    A.[SQL] AS CurrentProcedure,
    A.Para
FROM dbo.WA_API AS A
WHERE A.[list] = @FormName
  AND A.[func] IN ('View', 'Save', 'Delete')
ORDER BY CASE A.[func] WHEN 'View' THEN 1 WHEN 'Save' THEN 2 ELSE 3 END;
GO
