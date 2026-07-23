/*
  Phase 3 - sửa/cutover đồng bộ route View V2 cho toàn bộ allow-list hiện tại.

  Mục đích:
  - sửa các route đã đổi [SQL] sang API_TruyVanDong_V2 nhưng Para còn thiếu
    @List, @UserName hoặc @BranchID;
  - áp dụng cùng một contract View V2 cho cả bốn form Phase 3;
  - có thể chạy lại nhiều lần mà không tạo thêm row WA_API;
  - fail-closed và rollback toàn bộ nếu bất kỳ form/route/table/PK nào lệch contract.

  Script này chỉ cập nhật đúng các row WA_API có func = 'View'.
  Không thay đổi Save, Delete, SY_* hoặc dữ liệu nghiệp vụ.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53540, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;

IF OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
    THROW 53541, N'PHASE3_VIEW_V2_NOT_INSTALLED', 1;

DECLARE @RequiredForms table
(
    WebFormName varchar(100) NOT NULL PRIMARY KEY
);

INSERT INTO @RequiredForms (WebFormName)
VALUES
    ('WA_BangThueTNCNFrm'),
    ('WA_ChucDanhFrm'),
    ('WA_TitleListFrm'),
    ('WA_ShiftListFrm');

DECLARE @Targets table
(
    WebFormName varchar(100) NOT NULL,
    ExpectedTableName sysname NOT NULL,
    ExpectedPrimaryKey sysname NOT NULL,
    OldView sysname NOT NULL,
    ViewV2 sysname NOT NULL,
    GlobalReferenceOnly bit NOT NULL
);

INSERT INTO @Targets
(
    WebFormName,
    ExpectedTableName,
    ExpectedPrimaryKey,
    OldView,
    ViewV2,
    GlobalReferenceOnly
)
SELECT
    R.WebFormName,
    R.ExpectedTableName,
    R.ExpectedPrimaryKey,
    R.OldView,
    R.ViewV2,
    R.GlobalReferenceOnly
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
WHERE R.EnableView = 1;

/* Không tự áp dụng nếu allow-list source khác đúng bộ form Phase 3 đã duyệt. */
IF EXISTS
(
    SELECT T.WebFormName
    FROM @Targets AS T
    GROUP BY T.WebFormName
    HAVING COUNT(*) <> 1
)
    THROW 53542, N'PHASE3_VIEW_ALLOWLIST_DUPLICATE', 1;

IF EXISTS
(
    SELECT 1
    FROM @RequiredForms AS F
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM @Targets AS T
        WHERE T.WebFormName COLLATE DATABASE_DEFAULT =
              F.WebFormName COLLATE DATABASE_DEFAULT
    )
)
OR EXISTS
(
    SELECT 1
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM @RequiredForms AS F
        WHERE F.WebFormName COLLATE DATABASE_DEFAULT =
              T.WebFormName COLLATE DATABASE_DEFAULT
    )
)
    THROW 53543, N'PHASE3_VIEW_ALLOWLIST_UNEXPECTED', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    WHERE T.ViewV2 COLLATE DATABASE_DEFAULT <>
          N'API_TruyVanDong_V2' COLLATE DATABASE_DEFAULT
       OR OBJECT_ID(N'dbo.' + T.ViewV2, N'P') IS NULL
)
    THROW 53544, N'PHASE3_VIEW_V2_CONTRACT_MISMATCH', 1;

/* Mỗi form phải có đúng một đăng ký table/PK và object vật lý tương ứng. */
IF EXISTS
(
    SELECT T.WebFormName
    FROM @Targets AS T
    LEFT JOIN dbo.SY_FrmLstTbl AS L
      ON L.FormID COLLATE DATABASE_DEFAULT =
         T.WebFormName COLLATE DATABASE_DEFAULT
    GROUP BY
        T.WebFormName,
        T.ExpectedTableName,
        T.ExpectedPrimaryKey
    HAVING COUNT(L.FormID) <> 1
       OR ISNULL(MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))), N'')
            COLLATE DATABASE_DEFAULT <>
          T.ExpectedTableName COLLATE DATABASE_DEFAULT
       OR ISNULL(MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey)))), N'')
            COLLATE DATABASE_DEFAULT <>
          T.ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
)
    THROW 53545, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    WHERE OBJECT_ID(N'dbo.' + T.ExpectedTableName, N'U') IS NULL
       OR NOT EXISTS
       (
           SELECT 1
           FROM sys.columns AS C
           WHERE C.object_id = OBJECT_ID(N'dbo.' + T.ExpectedTableName, N'U')
             AND C.name COLLATE DATABASE_DEFAULT =
                 T.ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
       )
)
    THROW 53546, N'PHASE3_EXPECTED_TABLE_OR_PRIMARY_KEY_NOT_FOUND', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id
         AND IC.index_id = I.index_id
         AND IC.key_ordinal > 0
        WHERE I.object_id = OBJECT_ID(N'dbo.' + T.ExpectedTableName, N'U')
          AND I.is_unique = 1
          AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(
               OBJECT_ID(N'dbo.' + T.ExpectedTableName, N'U'),
               T.ExpectedPrimaryKey,
               'ColumnId'
           )
    )
)
    THROW 53547, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE', 1;

/* Không lách policy branch của các bảng được khai báo là danh mục dùng chung. */
IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    INNER JOIN sys.columns AS C
      ON C.object_id = OBJECT_ID(N'dbo.' + T.ExpectedTableName, N'U')
    WHERE T.GlobalReferenceOnly = 1
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT
          IN ('branchid', 'tenantid', 'companyid', 'donviid')
)
    THROW 53548, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;

/* View V2 chỉ chấp nhận IsDeleted là cột bit có thể đọc/ghi; computed hoặc sai kiểu phải fail closed. */
IF EXISTS
(
    SELECT 1
    FROM @Targets AS Target
    INNER JOIN sys.columns AS C
      ON C.object_id = OBJECT_ID(N'dbo.' + Target.ExpectedTableName, N'U')
    INNER JOIN sys.types AS T
      ON T.user_type_id = C.user_type_id
    WHERE LOWER(C.name) COLLATE DATABASE_DEFAULT =
          'isdeleted' COLLATE DATABASE_DEFAULT
      AND (
          T.name COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
          OR C.is_computed = 1
      )
)
    THROW 53553, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_Menu AS M
        WHERE M.FormName COLLATE DATABASE_DEFAULT =
              T.WebFormName COLLATE DATABASE_DEFAULT
          AND ISNULL(M.isDisable, 0) = 0
    )
)
    THROW 53554, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

/*
  Chấp nhận đúng hai trạng thái procedure:
  - route legacy đã khai báo trong registry;
  - route V2 đang dùng nhưng Para bị thiếu/sai.
  Trạng thái khác bị chặn trước khi có UPDATE.
*/
IF EXISTS
(
    SELECT T.WebFormName
    FROM @Targets AS T
    LEFT JOIN dbo.WA_API AS A
      ON A.[list] COLLATE DATABASE_DEFAULT =
         T.WebFormName COLLATE DATABASE_DEFAULT
     AND A.[func] COLLATE DATABASE_DEFAULT =
         'View' COLLATE DATABASE_DEFAULT
    GROUP BY T.WebFormName
    HAVING COUNT(A.[func]) <> 1
)
    THROW 53549, N'PHASE3_VIEW_ROUTE_NOT_UNIQUE', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A
      ON A.[list] COLLATE DATABASE_DEFAULT =
         T.WebFormName COLLATE DATABASE_DEFAULT
     AND A.[func] COLLATE DATABASE_DEFAULT =
         'View' COLLATE DATABASE_DEFAULT
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT <>
          PARSENAME(T.OldView, 1) COLLATE DATABASE_DEFAULT
      AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT <>
          PARSENAME(T.ViewV2, 1) COLLATE DATABASE_DEFAULT
)
    THROW 53550, N'PHASE3_VIEW_ROUTE_UNEXPECTED', 1;

DECLARE @ExpectedViewPara nvarchar(max) =
    N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''';
DECLARE @TargetCount int = (SELECT COUNT(*) FROM @Targets);

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE A
    SET
        A.[SQL] = T.ViewV2,
        A.Para = @ExpectedViewPara
    FROM dbo.WA_API AS A
    INNER JOIN @Targets AS T
      ON T.WebFormName COLLATE DATABASE_DEFAULT =
         A.[list] COLLATE DATABASE_DEFAULT
    WHERE A.[func] COLLATE DATABASE_DEFAULT =
          'View' COLLATE DATABASE_DEFAULT;

    IF @@ROWCOUNT <> @TargetCount
        THROW 53551, N'PHASE3_VIEW_UPDATE_COUNT_INVALID', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Targets AS T
        INNER JOIN dbo.WA_API AS A
          ON A.[list] COLLATE DATABASE_DEFAULT =
             T.WebFormName COLLATE DATABASE_DEFAULT
         AND A.[func] COLLATE DATABASE_DEFAULT =
             'View' COLLATE DATABASE_DEFAULT
        WHERE LTRIM(RTRIM(A.[SQL])) COLLATE DATABASE_DEFAULT <>
              T.ViewV2 COLLATE DATABASE_DEFAULT
           OR ISNULL(CONVERT(nvarchar(max), A.Para), N'')
                COLLATE DATABASE_DEFAULT <>
              @ExpectedViewPara COLLATE DATABASE_DEFAULT
    )
        THROW 53552, N'PHASE3_VIEW_POST_UPDATE_CONTRACT_MISMATCH', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    A.[list] AS WebFormName,
    A.[func] AS ApiFunc,
    A.[SQL] AS CurrentProcedure,
    A.Para,
    CONVERT(varchar(30), 'VIEW_V2_ROUTE_READY') AS RegistrationStatus
FROM dbo.WA_API AS A
INNER JOIN @Targets AS T
  ON T.WebFormName COLLATE DATABASE_DEFAULT =
     A.[list] COLLATE DATABASE_DEFAULT
WHERE A.[func] COLLATE DATABASE_DEFAULT =
      'View' COLLATE DATABASE_DEFAULT
ORDER BY A.[list];
GO
