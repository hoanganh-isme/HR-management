/* Read-only gate verification. Không trả sample row và không cập nhật WA_API. */
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @RegistryCount int, @TableName sysname, @PrimaryKey sysname;
SELECT
    @RegistryCount = COUNT(*),
    @TableName = MIN(LTRIM(RTRIM(L.TableName))),
    @PrimaryKey = MIN(LTRIM(RTRIM(L.PrimaryKey)))
FROM dbo.SY_FrmLstTbl AS L
WHERE L.FormID = @FormName;

DECLARE @TableObjectID int = COALESCE(
    OBJECT_ID(@TableName, N'U'),
    OBJECT_ID(N'dbo.' + @TableName, N'U')
);
DECLARE @ViewObjectID int = OBJECT_ID(N'dbo.API_BangThueTNCN_V2', N'P');
DECLARE @SaveObjectID int = OBJECT_ID(N'dbo.API_LuuDong_V2', N'P');
DECLARE @DeleteObjectID int = OBJECT_ID(N'dbo.API_XoaDong_V2', N'P');
DECLARE @GridSchemaObjectID int = OBJECT_ID(N'dbo.API_Web_GridFieldSchemaV2', N'P');

IF ISNULL(@RegistryCount, 0) <> 1 OR @TableObjectID IS NULL OR ISNULL(@PrimaryKey, '') = ''
    THROW 52501, N'Không tìm thấy duy nhất TableName/PrimaryKey vật lý của form.', 1;
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
      AND M.definition LIKE '%PHASE2_UNIFIED_FIELD_CONTRACT%'
)
    THROW 52521, N'View V2 thiếu gate branch fail-closed, đối chiếu branch hoặc unified field contract.', 1;

IF EXISTS (
    SELECT RequiredObjectID
    FROM (VALUES (@SaveObjectID), (@DeleteObjectID)) AS Required(RequiredObjectID)
    WHERE NOT EXISTS (
        SELECT 1
        FROM sys.sql_modules AS M
        WHERE M.object_id = Required.RequiredObjectID
          AND M.definition LIKE '%PHASE2_BRANCH_FAIL_CLOSED%'
          AND M.definition LIKE '%PHASE2_PERMISSION_RUN_GATE%'
          AND M.definition LIKE N'%UserName trong JsonData không khớp actor%'
    )
)
    THROW 52522, N'Save/Delete V2 thiếu branch, IsRun hoặc actor-in-JSON gate.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @DeleteObjectID
      AND M.definition LIKE '%PHASE2_AUTO_DELETE_MODE%'
      AND M.definition LIKE '%DELETE T%'
      AND M.definition LIKE '%UPDATE T%'
)
    THROW 52525, N'Delete V2 chưa có đủ nhánh soft-delete và hard-delete tự động.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @GridSchemaObjectID
      AND M.definition LIKE '%SY_FmtFldTbl%'
      AND M.definition LIKE '%sys.columns%'
      AND M.definition LIKE '%@UseMainTableContract%'
      AND M.definition LIKE '%CaptionVN%'
      AND M.definition LIKE '%DeleteMode%'
)
    THROW 52524, N'Grid Schema V2 chưa đọc field động/caption/delete mode từ metadata hệ thống.', 1;

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = @TableObjectID
      AND LOWER(name) = LOWER(@PrimaryKey)
)
    THROW 52505, N'PrimaryKey trong SY_FrmLstTbl không tồn tại ở bảng vật lý.', 1;

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
SELECT
    C.column_id,
    C.name,
    TYPE_NAME(C.user_type_id)
      + CASE
            WHEN TYPE_NAME(C.user_type_id) IN ('varchar', 'char', 'varbinary', 'binary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN TYPE_NAME(C.user_type_id) IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN TYPE_NAME(C.user_type_id) IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            ELSE ''
        END,
    C.is_nullable,
    NULL,
    NULL
FROM sys.columns AS C
WHERE C.object_id = @TableObjectID;

IF EXISTS (SELECT 1 FROM @Contract WHERE ErrorNumber IS NOT NULL)
    THROW 52507, N'Không mô tả được result-set View V2.', 1;
IF EXISTS (SELECT LOWER(ColumnName) FROM @Contract GROUP BY LOWER(ColumnName) HAVING COUNT(*) > 1)
    THROW 52508, N'View V2 có tên cột trùng.', 1;
IF NOT EXISTS (SELECT 1 FROM @Contract WHERE LOWER(ColumnName) = LOWER(@PrimaryKey))
    THROW 52509, N'Form Contract V2 thiếu primary key đã đăng ký.', 1;

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

DECLARE @DuplicatePrimaryCount int = 0, @NullPrimaryCount int = 0;
DECLARE @PrimaryValidationSql nvarchar(max) = N'
    SELECT @DuplicateCount = COUNT(*)
    FROM (
        SELECT ' + QUOTENAME(@PrimaryKey) + N'
        FROM ' + QUOTENAME(OBJECT_SCHEMA_NAME(@TableObjectID)) + N'.' + QUOTENAME(OBJECT_NAME(@TableObjectID)) + N'
        GROUP BY ' + QUOTENAME(@PrimaryKey) + N'
        HAVING COUNT(*) > 1
    ) AS D;
    SELECT @NullCount = COUNT(*)
    FROM ' + QUOTENAME(OBJECT_SCHEMA_NAME(@TableObjectID)) + N'.' + QUOTENAME(OBJECT_NAME(@TableObjectID)) + N'
    WHERE ' + QUOTENAME(@PrimaryKey) + N' IS NULL;';

EXEC sys.sp_executesql
    @PrimaryValidationSql,
    N'@DuplicateCount int OUTPUT, @NullCount int OUTPUT',
    @DuplicateCount = @DuplicatePrimaryCount OUTPUT,
    @NullCount = @NullPrimaryCount OUTPUT;

IF @DuplicatePrimaryCount > 0
    THROW 52514, N'Primary key bị trùng trong dữ liệu hiện tại.', 1;
IF @NullPrimaryCount > 0
    THROW 52515, N'Primary key có NULL.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes AS I
    INNER JOIN sys.index_columns AS IC
        ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
    WHERE I.object_id = @TableObjectID AND I.is_unique = 1 AND I.is_disabled = 0
    GROUP BY I.index_id
    HAVING COUNT(*) = 1 AND MAX(IC.column_id) = COLUMNPROPERTY(@TableObjectID, @PrimaryKey, 'ColumnId')
)
    THROW 52519, N'Primary key chưa có unique index/PK vật lý.', 1;

IF EXISTS (
    SELECT 1
    FROM sys.columns AS C
    JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @TableObjectID
      AND LOWER(C.name) = 'isdeleted'
      AND LOWER(T.name) <> 'bit'
)
    THROW 52520, N'IsDeleted của bảng pilot phải có kiểu bit.', 1;

IF EXISTS (
    SELECT 1
    FROM sys.columns AS C
    JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @TableObjectID
      AND LOWER(C.name) = 'isdeleted'
      AND LOWER(T.name) = 'bit'
)
AND NOT EXISTS (
    SELECT 1 FROM sys.sql_modules
    WHERE object_id = @ViewObjectID
      AND definition LIKE '%PHASE2_SOFT_DELETE_FILTER%'
)
    THROW 52520, N'Bảng có IsDeleted nhưng View V2 chưa có filter xóa mềm.', 1;

SELECT
    'VIEW_CONTRACT' AS GateName,
    'PASS_UNIFIED_CONTRACT_STATIC' AS GateStatus,
    COUNT(*) AS ResultColumnCount,
    COUNT(*) AS PhysicalColumnCount
FROM @Contract;

SELECT
    'SAVE_V2' AS GateName,
    'REQUIRES_TRANSACTION_TEST' AS GateStatus,
    N'Chưa đăng ký Save cho tới khi insert/edit/permission/rollback test đạt.' AS Diagnostic
UNION ALL
SELECT
    'DELETE_V2',
    CASE WHEN EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @TableObjectID AND LOWER(name) = 'isdeleted')
         THEN 'REQUIRES_SOFT_DELETE_TEST' ELSE 'REQUIRES_HARD_DELETE_TEST' END,
    CASE WHEN EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @TableObjectID AND LOWER(name) = 'isdeleted')
         THEN N'Có IsDeleted: API_XoaDong_V2 phải cập nhật IsDeleted=1 và giữ bản ghi vật lý.'
         ELSE N'Không có IsDeleted: API_XoaDong_V2 phải DELETE vật lý trong transaction; FK lỗi phải rollback.' END;

SELECT
    'RUNTIME_SMOKE' AS GateName,
    'REQUIRES_WEB_GATEWAY_TEST' AS GateStatus,
    N'Cần kiểm tra View/Save qua gateway bằng tài khoản thật: keyword, filter, sort, branch, permission và transaction rollback.' AS Diagnostic;

SELECT
    A.[func] AS ApiFunc,
    A.[SQL] AS CurrentProcedure,
    A.Para
FROM dbo.WA_API AS A
WHERE A.[list] = @FormName
  AND A.[func] IN ('View', 'Save', 'Delete')
ORDER BY CASE A.[func] WHEN 'View' THEN 1 WHEN 'Save' THEN 2 ELSE 3 END;
GO
