/*
  Phase 2 runtime harness - dynamic Form Contract V2 smoke test.

  READ ONLY:
  - Không INSERT/UPDATE/DELETE dữ liệu nghiệp vụ.
  - Không thay đổi WA_API.
  - Không giả định TableName, PrimaryKey hay danh sách field nghiệp vụ.

  Bắt buộc thay @UserName bằng user test đang hoạt động.
  Với non-admin, @BranchID phải thuộc danh sách branch của user.
  Admin có thể để @BranchID = ''.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @UserName varchar(100) = 'REPLACE_WITH_ACTIVE_TEST_USER';
DECLARE @BranchID varchar(max) = '';

IF @UserName = 'REPLACE_WITH_ACTIVE_TEST_USER' OR LTRIM(RTRIM(@UserName)) = ''
    THROW 52701, N'Phải nhập @UserName của tài khoản test đang hoạt động.', 1;

DECLARE @RegistryCount int, @TableName sysname, @PrimaryKey sysname;
SELECT
    @RegistryCount = COUNT(*),
    @TableName = MIN(LTRIM(RTRIM(L.TableName))),
    @PrimaryKey = MIN(LTRIM(RTRIM(L.PrimaryKey)))
FROM dbo.SY_FrmLstTbl AS L
WHERE L.FormID = @FormName;

IF ISNULL(@RegistryCount, 0) <> 1
   OR LTRIM(RTRIM(ISNULL(@TableName, ''))) = ''
   OR LTRIM(RTRIM(ISNULL(@PrimaryKey, ''))) = ''
    THROW 52702, N'Form chưa có duy nhất TableName/PrimaryKey trong SY_FrmLstTbl.', 1;

DECLARE @TableObjectID int = COALESCE(
    OBJECT_ID(@TableName, N'U'),
    OBJECT_ID(N'dbo.' + @TableName, N'U')
);
DECLARE @PhysicalSchema sysname, @PhysicalTable sysname;
SELECT @PhysicalSchema = S.name, @PhysicalTable = T.name
FROM sys.tables AS T
JOIN sys.schemas AS S ON S.schema_id = T.schema_id
WHERE T.object_id = @TableObjectID;

IF @TableObjectID IS NULL OR @PhysicalSchema IS NULL OR @PhysicalTable IS NULL
    THROW 52703, N'Không tìm thấy bảng vật lý đã đăng ký.', 1;
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = @TableObjectID
      AND LOWER(name) COLLATE DATABASE_DEFAULT = LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT
)
    THROW 52704, N'PrimaryKey đăng ký không tồn tại trong bảng vật lý.', 1;

DECLARE @ViewCount int, @ViewProcedure sysname;
SELECT
    @ViewCount = COUNT(*),
    @ViewProcedure = MIN(LTRIM(RTRIM(A.[SQL])))
FROM dbo.WA_API AS A
WHERE A.[list] = @FormName
  AND A.[func] = 'View';

IF ISNULL(@ViewCount, 0) <> 1 OR LTRIM(RTRIM(ISNULL(@ViewProcedure, ''))) = ''
    THROW 52705, N'WA_API View không duy nhất.', 1;

DECLARE @ViewObjectID int = COALESCE(
    OBJECT_ID(@ViewProcedure, N'P'),
    OBJECT_ID(N'dbo.' + @ViewProcedure, N'P')
);
IF @ViewObjectID IS NULL
    THROW 52706, N'Không tìm thấy procedure View đã đăng ký.', 1;
IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_modules AS M
    WHERE M.object_id = @ViewObjectID
      AND M.definition LIKE '%PHASE2_UNIFIED_FIELD_CONTRACT%'
)
    THROW 52707, N'WA_API View chưa dùng Form Contract V2 động.', 1;

DECLARE @UserGroupID varchar(50), @AllowedBranches varchar(max);
SELECT
    @UserGroupID = U.UserGroupID,
    @AllowedBranches = U.BranchID
FROM dbo.SY_User AS U
WHERE U.UserName = @UserName
  AND ISNULL(U.Disable, 0) = 0;

IF @UserGroupID IS NULL
    THROW 52708, N'User test không tồn tại hoặc đang bị khóa.', 1;
IF LOWER(@UserGroupID) <> 'admin'
BEGIN
    IF LTRIM(RTRIM(ISNULL(@AllowedBranches, ''))) = ''
        THROW 52709, N'User non-admin chưa được gán branch.', 1;
    IF LTRIM(RTRIM(ISNULL(@BranchID, ''))) = ''
        THROW 52710, N'Phải nhập @BranchID khi test bằng user non-admin.', 1;
    IF EXISTS (
        SELECT 1
        FROM STRING_SPLIT(@BranchID, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1
              FROM STRING_SPLIT(@AllowedBranches, ',') AS Allowed
              WHERE UPPER(LTRIM(RTRIM(Allowed.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
          )
    )
        THROW 52711, N'@BranchID không nằm trong phạm vi của user test.', 1;
END;

DECLARE @RegistryBefore nvarchar(max), @RegistryAfter nvarchar(max);
SELECT @RegistryBefore = (
    SELECT [list], [func], [SQL], Para
    FROM dbo.WA_API
    WHERE [list] = @FormName AND [func] IN ('View', 'Save', 'Delete')
    ORDER BY [func]
    FOR JSON PATH, INCLUDE_NULL_VALUES
);

DECLARE @RowCountBefore bigint, @RowCountAfter bigint;
DECLARE @CountSql nvarchar(max) = N'SELECT @OutCount = COUNT_BIG(*) FROM '
    + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N';';
EXEC sys.sp_executesql @CountSql, N'@OutCount bigint OUTPUT', @OutCount = @RowCountBefore OUTPUT;

/* Result 1: contract vật lý dự kiến và caption tiếng Việt, không hard-code field. */
SELECT
    C.column_id AS FieldOrdinal,
    C.name AS FieldName,
    TYPE_NAME(C.user_type_id) AS SqlType,
    C.is_nullable AS IsNullable,
    COALESCE(NULLIF(F.CaptionVN, ''), NULLIF(F.CaptionEN, ''), CONVERT(nvarchar(200), C.name)) AS Caption,
    F.FormatID
FROM sys.columns AS C
OUTER APPLY (
    SELECT TOP (1) X.CaptionVN, X.CaptionEN, X.FormatID
    FROM dbo.SY_FmtFldTbl AS X
    WHERE LOWER(X.FieldName) COLLATE DATABASE_DEFAULT = LOWER(C.name) COLLATE DATABASE_DEFAULT
      AND (
            LOWER(ISNULL(X.FormName, '')) = LOWER(@FormName)
         OR EXISTS (
                SELECT 1
                FROM dbo.SY_FrmLstTbl AS AliasForm
                WHERE LOWER(AliasForm.FormID) = LOWER(ISNULL(X.FormName, ''))
                  AND LOWER(ISNULL(AliasForm.TableName, '')) = LOWER(@TableName)
                  AND LOWER(ISNULL(AliasForm.PrimaryKey, '')) = LOWER(@PrimaryKey)
            )
         OR X.FormName IS NULL
         OR LTRIM(RTRIM(X.FormName)) = ''
      )
    ORDER BY
        CASE WHEN LOWER(ISNULL(X.FormName, '')) = LOWER(@FormName) THEN 1
             WHEN X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '' THEN 3
             ELSE 2 END,
        X.AutoID
) AS F
WHERE C.object_id = @TableObjectID
ORDER BY C.column_id;

/* Result 2: đúng metadata mà backend/Web nhận. */
EXEC dbo.API_Web_GridFieldSchemaV2
    @WebFormName = @FormName,
    @ERPFormID = @FormName,
    @UserName = @UserName,
    @BranchID = @BranchID;

/* Result 3: dữ liệu thật từ View V2 đã đăng ký; cột mới phải xuất hiện ở đây. */
DECLARE @ViewSchema sysname = OBJECT_SCHEMA_NAME(@ViewObjectID);
DECLARE @ViewName sysname = OBJECT_NAME(@ViewObjectID);
DECLARE @ViewSql nvarchar(max) = N'EXEC ' + QUOTENAME(@ViewSchema) + N'.' + QUOTENAME(@ViewName) + N'
    @List=@PList, @Keyword=N'''', @SortColumn='''', @SortDir='''', @Data=N''{}'',
    @UserName=@PUserName, @BranchID=@PBranchID;';
EXEC sys.sp_executesql
    @ViewSql,
    N'@PList varchar(100), @PUserName varchar(100), @PBranchID varchar(max)',
    @PList = @FormName,
    @PUserName = @UserName,
    @PBranchID = @BranchID;

EXEC sys.sp_executesql @CountSql, N'@OutCount bigint OUTPUT', @OutCount = @RowCountAfter OUTPUT;
SELECT @RegistryAfter = (
    SELECT [list], [func], [SQL], Para
    FROM dbo.WA_API
    WHERE [list] = @FormName AND [func] IN ('View', 'Save', 'Delete')
    ORDER BY [func]
    FOR JSON PATH, INCLUDE_NULL_VALUES
);

/* Result 4: bằng chứng harness chỉ đọc. */
SELECT
    CASE WHEN @RowCountBefore = @RowCountAfter AND @RegistryBefore = @RegistryAfter
         THEN 'PASS_READ_ONLY_EVIDENCE'
         ELSE 'FAIL_SOURCE_OR_REGISTRY_CHANGED'
    END AS ReadOnlyStatus,
    DB_NAME() AS DatabaseName,
    @FormName AS FormName,
    @TableName AS RegisteredTable,
    @PrimaryKey AS RegisteredPrimaryKey,
    @ViewProcedure AS RegisteredView,
    @RowCountAfter AS [RowCount],
    (SELECT COUNT(*) FROM sys.columns WHERE object_id = @TableObjectID) AS PhysicalColumnCount,
    @UserName AS TestUser,
    @BranchID AS TestBranch;
GO
