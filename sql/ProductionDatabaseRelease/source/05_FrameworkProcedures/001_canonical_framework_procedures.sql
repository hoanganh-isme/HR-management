/*
  Canonical framework procedures
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LuuDong_V2; Input: sql/UnifiedContractRollout/08_UPDATE_SAVE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_LuuDong_V2
    @List varchar(50),
    @Data nvarchar(max),
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @RowsAffected int = 0, @PrimaryValue nvarchar(4000) = NULL;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedTable sysname,
        @PrimaryKey sysname,

        @ExpectedView sysname,
        @ExpectedSave sysname,

        @PermissionFormName varchar(100),
        @WritePolicy varchar(40),

        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable =
            R.ExpectedTableName,

        @PrimaryKey =
            R.ExpectedPrimaryKey,

        @ExpectedView =
            R.ViewV2,

        @ExpectedSave =
            R.SaveV2,

        @PermissionFormName =
            R.PermissionFormName,

        @WritePolicy =
            R.WritePolicy,

        @GlobalReferenceOnly =
            R.GlobalReferenceOnly,

        @BranchPolicy =
            R.BranchPolicy

    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableSave = 1;

    SET @PermissionFormName =
        LTRIM(
            RTRIM(
                ISNULL(
                    @PermissionFormName,
                    @List
                )
            )
        );

    SET @WritePolicy =
        UPPER(
            LTRIM(
                RTRIM(
                    ISNULL(
                        @WritePolicy,
                        'SAFE_TABLE_COLUMNS'
                    )
                )
            )
        );

    IF @ExpectedTable IS NULL OR @ExpectedSave COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_SAVE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @UserName = '' OR ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_AND_JSON_OBJECT_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DUPLICATE_JSON_KEY' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RouteCount int, @RegisteredSave sysname;
    SELECT
        @RouteCount = COUNT(*),
        @RegisteredSave = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR ISNULL(@RegisteredSave, N'') COLLATE DATABASE_DEFAULT <> @ExpectedSave COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_SAVE_ROUTE_NOT_UNIQUE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RegisteredTable sysname, @RegisteredPrimaryKey sysname, @RegistrationCount int;
    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL OR NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_OR_PRIMARY_KEY_NOT_FOUND' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    DECLARE @BranchScopePredicate nvarchar(2000) = N'';
    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchScopePredicate = N'
          AND (
              LOWER(@UserGroupID) = ''admin''
              OR EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                  WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                    AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                        = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
              )
          )';

    DECLARE @PrimaryKeyHasCollation bit = 0;
    SELECT @PrimaryKeyHasCollation = CONVERT(bit, CASE WHEN C.collation_name IS NULL THEN 0 ELSE 1 END)
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID
          AND I.is_unique = 1
          AND I.is_disabled = 0
          AND I.has_filter = 0
          AND I.is_hypothetical = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

/*
  Quy tắc ghi dữ liệu:

  SAFE_TABLE_COLUMNS:
  Cho các form CRUD một bảng đã kiểm thử ở Phase 3.

  VIEW_PHYSICAL_COLUMNS:
  Chỉ nhận field:
  - có trong result-set của View API;
  - có source lineage thuộc main table;
  - giữ nguyên tên field vật lý.
*/
IF @WritePolicy NOT IN
(
    'SAFE_TABLE_COLUMNS',
    'VIEW_PHYSICAL_COLUMNS'
)
BEGIN
    SELECT
        -1 AS code,
        N'PHASE3_WRITE_POLICY_INVALID' AS msg,
        @PrimaryKey AS primaryKey,
        @PrimaryValue AS primaryValue,
        0 AS rowsAffected;

    RETURN;
END;

DECLARE @ViewPhysicalColumns table
(
    ColumnName sysname NOT NULL PRIMARY KEY
);

IF @WritePolicy = 'VIEW_PHYSICAL_COLUMNS'
BEGIN
    DECLARE @ViewObjectID int =
        COALESCE
        (
            OBJECT_ID(
                @ExpectedView,
                N'P'
            ),

            OBJECT_ID(
                N'dbo.' + @ExpectedView,
                N'P'
            )
        );

    IF @ViewObjectID IS NULL
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_NOT_FOUND' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1

        FROM sys.dm_exec_describe_first_result_set_for_object
        (
            @ViewObjectID,
            1
        ) AS D

        WHERE D.error_number IS NOT NULL
    )
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_METADATA_ERROR' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;

    INSERT INTO @ViewPhysicalColumns
    (
        ColumnName
    )
    SELECT DISTINCT
        D.source_column

    FROM sys.dm_exec_describe_first_result_set_for_object
    (
        @ViewObjectID,
        1
    ) AS D

    WHERE
        D.error_number IS NULL

        AND ISNULL(D.is_hidden, 0) = 0

        AND D.name IS NOT NULL
        AND D.source_column IS NOT NULL
        AND D.source_table IS NOT NULL

        AND D.source_table
            COLLATE DATABASE_DEFAULT
            =
            @ExpectedTable
            COLLATE DATABASE_DEFAULT

        /*
          Generic Save chỉ ghi an toàn khi tên result field
          giữ nguyên tên physical column.
        */
        AND D.name
            COLLATE DATABASE_DEFAULT
            =
            D.source_column
            COLLATE DATABASE_DEFAULT;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @ViewPhysicalColumns AS V
        WHERE
            V.ColumnName
                COLLATE DATABASE_DEFAULT
                =
                @PrimaryKey
                COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_PRIMARY_KEY_MISSING' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;
END;

    IF @GlobalReferenceOnly = 1 AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
          AND (
              T.name COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
              OR C.is_computed = 1
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @DataActor varchar(100), @DataBranch nvarchar(max);
    SELECT TOP (1) @DataActor = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'username' COLLATE DATABASE_DEFAULT;
    SELECT TOP (1) @DataBranch = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT;

    IF @DataActor IS NOT NULL AND @DataActor COLLATE DATABASE_DEFAULT <> @UserName COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_SPOOF_REJECTED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_INVALID_OR_DISABLED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_REQUIRED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_DENIED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    IF @DataBranch IS NOT NULL AND @BranchID <> '' AND EXISTS (
        SELECT 1 FROM STRING_SPLIT(@DataBranch, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
              WHERE LTRIM(RTRIM(ContextBranch.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_JSON_BRANCH_CONTEXT_DENIED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @BranchPolicy = 'BRANCH_SCOPED'
       AND EXISTS (
           SELECT 1 FROM OPENJSON(@Data) AS J
           WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_MUST_BE_TOP_LEVEL' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @IsEdit bit = 0;
    SELECT TOP (1) @IsEdit = ISNULL(TRY_CONVERT(bit, J.[value]), 0)
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'isedit' COLLATE DATABASE_DEFAULT;

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0,
        @GroupCanAdd bit = 0,
        @GroupCanEdit bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView,
        @GroupCanAdd = P.CanAdd,
        @GroupCanEdit = P.CanEdit
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
           OR CASE WHEN @IsEdit = 1 THEN ISNULL(@GroupCanEdit, 0)
                   ELSE ISNULL(@GroupCanAdd, 0) END <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_MUTATION_PERMISSION_DENIED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    DECLARE @Columns TABLE (
        ColumnName sysname PRIMARY KEY,
        SqlTypeName sysname,
        MaxLength int,
        IsNullable bit,
        IsIdentity bit,
        IsPrimaryKey bit,
        IsComputed bit,
        IsServerManaged bit,
        IsDenied bit,
        JsonValue nvarchar(max),
        HasJsonKey bit
    );

    INSERT INTO @Columns (
        ColumnName, SqlTypeName, MaxLength, IsNullable, IsIdentity,
        IsPrimaryKey, IsComputed, IsServerManaged, IsDenied, JsonValue, HasJsonKey
    )
    SELECT
        C.name AS ColumnName,
        T.name AS SqlTypeName,
        C.max_length,
        C.is_nullable,
        C.is_identity,
        CONVERT(bit, CASE WHEN C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
        C.is_computed,
        CONVERT(bit, CASE
            WHEN C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT THEN 0
            WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN (
                'usercreate', 'userdate', 'useredit', 'usereditdate',
                'userdelete', 'userdeletedate', 'sysdate', 'datecreated', 'datemodified'
            ) THEN 1
            ELSE 0
        END) AS IsServerManaged,
        CONVERT(bit, CASE
            WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('password', 'pass', 'token', 'secret', 'hash', 'salt') THEN 1
            ELSE 0
        END) AS IsDenied,
        J.[value] AS JsonValue,
        CONVERT(bit, CASE WHEN J.[key] IS NOT NULL THEN 1 ELSE 0 END) AS HasJsonKey
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    LEFT JOIN OPENJSON(@Data) AS J
      ON LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(C.name) COLLATE DATABASE_DEFAULT
    WHERE C.object_id = @ObjectID;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('isedit', 'id', 'username', 'branchid')
          AND NOT EXISTS (
              SELECT 1 FROM @Columns AS C
              WHERE LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT = LOWER(J.[key]) COLLATE DATABASE_DEFAULT
                AND (C.IsIdentity = 0 OR (@IsEdit = 1 AND C.IsPrimaryKey = 1))
                AND C.IsComputed = 0
                AND C.IsServerManaged = 0 AND C.IsDenied = 0
                AND
                (
                    @WritePolicy =
                        'SAFE_TABLE_COLUMNS'

                    OR EXISTS
                    (
                        SELECT 1
                        FROM @ViewPhysicalColumns AS V

                        WHERE
                            V.ColumnName
                                COLLATE DATABASE_DEFAULT
                                =
                                C.ColumnName
                                COLLATE DATABASE_DEFAULT
                    )
                )
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_UNSAFE_PAYLOAD_FIELD_REJECTED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @PkColumnName sysname, @PkJsonValue nvarchar(max), @PkHasKey bit;
    SELECT @PkColumnName = C.ColumnName, @PkJsonValue = C.JsonValue, @PkHasKey = C.HasJsonKey
    FROM @Columns AS C
    WHERE C.IsPrimaryKey = 1;

    IF @IsEdit = 1
    BEGIN
        IF @PkHasKey = 0 OR LTRIM(RTRIM(ISNULL(@PkJsonValue, ''))) = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_PRIMARY_KEY_REQUIRED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        SET @PrimaryValue = LTRIM(RTRIM(@PkJsonValue));
        DECLARE @ExistsSql nvarchar(max);
        SET @ExistsSql = N'SELECT @RowExists = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T'
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal'
                       + @BranchScopePredicate + N';';
        DECLARE @RowExists int = 0;
        EXEC sp_executesql @ExistsSql, N'@PkVal nvarchar(4000), @RowExists int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
             @PkVal = @PrimaryValue, @RowExists = @RowExists OUTPUT,
             @BranchID = @BranchID, @UserGroupID = @UserGroupID;

        IF @RowExists <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_TARGET_NOT_FOUND' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @UpdateAssignments nvarchar(max) = N'';
        SELECT @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END
             + QUOTENAME(C.ColumnName) + N' = '
             + CASE
                 WHEN C.HasJsonKey = 0 OR C.JsonValue IS NULL THEN N'NULL'
                 ELSE N'N''' + REPLACE(C.JsonValue, N'''', N'''''') + N''''
               END
        FROM @Columns AS C
        WHERE C.IsPrimaryKey = 0
          AND C.IsIdentity = 0
          AND C.IsComputed = 0
          AND C.IsServerManaged = 0
          AND C.IsDenied = 0
          AND C.HasJsonKey = 1;

        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'useredit')
            SET @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END + N'[UserEdit] = N''' + REPLACE(@UserName, N'''', N'''''') + N'''';
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'usereditdate')
            SET @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END + N'[UserEditDate] = GETDATE()';

        IF @UpdateAssignments = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_NO_WRITABLE_FIELDS' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @UpdateSql nvarchar(max);
        SET @UpdateSql = N'UPDATE T SET ' + @UpdateAssignments
                       + N' FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T'
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal'
                       + @BranchScopePredicate + N';';

        EXEC sp_executesql @UpdateSql, N'@PkVal nvarchar(4000), @BranchID varchar(max), @UserGroupID varchar(50)',
             @PkVal = @PrimaryValue, @BranchID = @BranchID, @UserGroupID = @UserGroupID;
        SET @RowsAffected = @@ROWCOUNT;
    END
    ELSE
    BEGIN
        IF @PkHasKey = 1 AND LTRIM(RTRIM(ISNULL(@PkJsonValue, ''))) <> ''
        BEGIN
            SET @PrimaryValue = LTRIM(RTRIM(@PkJsonValue));
            DECLARE @DuplicateCheckSql nvarchar(max);
            SET @DuplicateCheckSql = N'SELECT @DupCount = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable)
                                   + N' WHERE ' + QUOTENAME(@PrimaryKey)
                                   + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                                   + N' = @PkVal;';
            DECLARE @DupCount int = 0;
            EXEC sp_executesql @DuplicateCheckSql, N'@PkVal nvarchar(4000), @DupCount int OUTPUT',
                 @PkVal = @PrimaryValue, @DupCount = @DupCount OUTPUT;

            IF @DupCount > 0
            BEGIN
                SELECT -1 AS code, N'PHASE3_INSERT_PRIMARY_KEY_DUPLICATE' AS msg,
                       @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
                RETURN;
            END;
        END;

        DECLARE @InsertCols nvarchar(max) = N'', @InsertVals nvarchar(max) = N'';
        SELECT
            @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + QUOTENAME(C.ColumnName),
            @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END
                        + CASE
                            WHEN C.HasJsonKey = 0 OR C.JsonValue IS NULL THEN N'NULL'
                            ELSE N'N''' + REPLACE(C.JsonValue, N'''', N'''''') + N''''
                          END
        FROM @Columns AS C
        WHERE C.IsIdentity = 0
          AND C.IsComputed = 0
          AND C.IsServerManaged = 0
          AND C.IsDenied = 0
          AND C.HasJsonKey = 1;

        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'usercreate')
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + N'[UserCreate]';
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'N''' + REPLACE(@UserName, N'''', N'''''') + N'''';
        END;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'userdate')
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + N'[UserDate]';
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'GETDATE()';
        END;

        IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + QUOTENAME(@BranchColumn);
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'CONVERT(nvarchar(4000), @BranchID)';
        END;

        IF @InsertCols = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_INSERT_NO_WRITABLE_FIELDS' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @InsertSql nvarchar(max);
        CREATE TABLE #InsertedPrimary (Value nvarchar(4000) NOT NULL);
        SET @InsertSql = N'INSERT INTO dbo.' + QUOTENAME(@ExpectedTable)
                       + N' (' + @InsertCols + N') OUTPUT CONVERT(nvarchar(4000), INSERTED.' + QUOTENAME(@PrimaryKey)
                       + N') INTO #InsertedPrimary(Value) VALUES (' + @InsertVals + N');';

        EXEC sp_executesql @InsertSql,
             N'@BranchID varchar(max)',
             @BranchID = @BranchID;
        SELECT @RowsAffected = COUNT(*) FROM #InsertedPrimary;

        IF @PrimaryValue IS NULL
        BEGIN
            SELECT TOP (1) @PrimaryValue = Value FROM #InsertedPrimary;
        END;
    END;

    SELECT 0 AS code, N'SUCCESS' AS msg,
           @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, @RowsAffected AS rowsAffected;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_TruyVanDong_V2; Input: sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_TruyVanDong_V2
    @List varchar(50),
    @Keyword nvarchar(200) = N'',
    @SortColumn varchar(50) = '',
    @SortDir varchar(10) = '',
    @Data nvarchar(max) = N'',
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @SortColumn = LTRIM(RTRIM(ISNULL(@SortColumn, '')));
    SET @SortDir = UPPER(LTRIM(RTRIM(ISNULL(@SortDir, ''))));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    IF @UserName = '' AND ISJSON(@Data) = 1
        SET @UserName = ISNULL(JSON_VALUE(@Data, '$.UserName'), '');

    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    IF @BranchID = '' AND ISJSON(@Data) = 1
        SET @BranchID = ISNULL(JSON_VALUE(@Data, '$.BranchID'), '');

    DECLARE
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @ExpectedView sysname,
        @PermissionFormName varchar(100),
        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedView = R.ViewV2,
        @PermissionFormName = R.PermissionFormName,
        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableView = 1;

    IF @ExpectedTable IS NULL OR @ExpectedView COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
        THROW 53101, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_VIEW', 1;

    IF @UserName = ''
        THROW 53102, N'PHASE3_ACTOR_REQUIRED', 1;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @List)));

    IF @Data = N'' SET @Data = N'{}';
    IF ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
        THROW 53103, N'PHASE3_FILTER_JSON_OBJECT_REQUIRED', 1;

    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
        THROW 53104, N'PHASE3_DUPLICATE_FILTER_KEY', 1;

    DECLARE @RouteCount int;
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT
      AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT = @ExpectedView COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
        THROW 53105, N'PHASE3_VIEW_ROUTE_NOT_UNIQUE', 1;

    DECLARE
        @RegisteredTable sysname,
        @RegisteredPrimaryKey sysname,
        @FormRegistrationCount int;

    SELECT
        @FormRegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@FormRegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
        THROW 53106, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL
        THROW 53107, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;

    DECLARE @PrimaryColumn sysname;
    SELECT @PrimaryColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT;

    IF @PrimaryColumn IS NULL
        THROW 53108, N'PHASE3_EXPECTED_PRIMARY_KEY_NOT_FOUND', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id
         AND IC.index_id = I.index_id
         AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID
          AND I.is_unique = 1
          AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryColumn, 'ColumnId')
    )
        THROW 53109, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE', 1;

    IF @GlobalReferenceOnly = 1 AND EXISTS (
        SELECT 1
        FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
        THROW 53110, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 53111, N'PHASE3_ACTOR_INVALID_OR_DISABLED', 1;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1
        WHEN 'tenantid' THEN 2
        WHEN 'companyid' THEN 3
        ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
            THROW 53112, N'PHASE3_BRANCH_CONTEXT_REQUIRED', 1;

        /*
          Phạm vi thật luôn lấy từ SY_User. Client có thể không gửi BranchID hoặc
          chỉ xin một tập con; client không thể tự mở rộng sang chi nhánh khác.
        */
        IF @BranchID = ''
            SET @BranchID = @UserBranches;

        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
            THROW 53113, N'PHASE3_BRANCH_CONTEXT_DENIED', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0, @GroupCanRun bit = 0;
    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
        THROW 53114, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
            THROW 53115, N'PHASE3_VIEW_PERMISSION_DENIED', 1;
    END;

    DECLARE @Columns table
    (
        ColumnID int NOT NULL,
        ColumnName sysname NOT NULL PRIMARY KEY,
        TypeName sysname NOT NULL,
        SqlType nvarchar(256) NOT NULL,
        IsText bit NOT NULL,
        IsSoftDelete bit NOT NULL
    );

    INSERT INTO @Columns (ColumnID, ColumnName, TypeName, SqlType, IsText, IsSoftDelete)
    SELECT
        C.column_id,
        C.name,
        CONVERT(sysname, TYPE_NAME(C.system_type_id)),
        TYPE_NAME(C.system_type_id) + CASE
            WHEN TYPE_NAME(C.system_type_id) IN ('varchar', 'char', 'binary', 'varbinary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('datetime2', 'datetimeoffset', 'time')
                THEN '(' + CONVERT(varchar(10), C.scale) + ')'
            ELSE '' END,
        CONVERT(bit, CASE WHEN TYPE_NAME(C.system_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT AND TYPE_NAME(C.system_type_id) = 'bit' THEN 1 ELSE 0 END)
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND C.is_computed = 0
      AND T.is_user_defined = 0
      AND T.is_assembly_type = 0
      AND LOWER(TYPE_NAME(C.system_type_id)) COLLATE DATABASE_DEFAULT NOT IN
          ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
           'sql_variant', 'geography', 'geometry', 'hierarchyid')
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT NOT IN
          ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
           'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext',
           'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
           'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
           'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat');

    IF NOT EXISTS (
        SELECT 1 FROM @Columns AS C
        WHERE C.ColumnName COLLATE DATABASE_DEFAULT = @PrimaryColumn COLLATE DATABASE_DEFAULT
    )
        THROW 53116, N'PHASE3_PRIMARY_KEY_IS_DENIED', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
          AND (
              T.is_user_defined = 1
              OR T.is_assembly_type = 1
              OR TYPE_NAME(C.system_type_id) COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
              OR C.is_computed = 1
          )
    )
        THROW 53117, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT', 1;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('keyword', 'branchid', 'page', 'pagesize')
          AND NOT EXISTS (
              SELECT 1 FROM @Columns AS C
              WHERE C.ColumnName COLLATE DATABASE_DEFAULT =
                    CASE
                        WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                        WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                        WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 8)
                        WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                        WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                        ELSE J.[key]
                    END COLLATE DATABASE_DEFAULT
                AND C.IsSoftDelete = 0
          )
    )
        THROW 53118, N'PHASE3_FILTER_FIELD_NOT_ALLOWED', 1;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        INNER JOIN @Columns AS C
          ON C.ColumnName COLLATE DATABASE_DEFAULT =
             CASE
                 WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                 ELSE J.[key]
             END COLLATE DATABASE_DEFAULT
        WHERE (
            (RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT AND C.IsText = 0)
            OR (
                (RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT
                 OR RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT)
                AND C.TypeName COLLATE DATABASE_DEFAULT NOT IN
                    ('tinyint', 'smallint', 'int', 'bigint', 'decimal', 'numeric', 'money', 'smallmoney',
                     'float', 'real', 'date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset', 'time')
            )
        )
    )
        THROW 53120, N'PHASE3_FILTER_OPERATOR_NOT_SUPPORTED_FOR_TYPE', 1;

    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'ASC';
    IF @SortColumn = '' SET @SortColumn = @PrimaryColumn;

    DECLARE @UsePaging bit = CASE WHEN JSON_VALUE(@Data, '$.page') IS NOT NULL OR JSON_VALUE(@Data, '$.pageSize') IS NOT NULL THEN 1 ELSE 0 END;
    DECLARE @Page int = ISNULL(TRY_CONVERT(int, JSON_VALUE(@Data, '$.page')), 1);
    DECLARE @PageSize int = ISNULL(TRY_CONVERT(int, JSON_VALUE(@Data, '$.pageSize')), 30);
    IF @Page < 1 OR @Page > 1000000 OR @PageSize < 1 OR @PageSize > 100000
        THROW 53121, N'PHASE3_PAGING_ARGUMENT_INVALID', 1;
    DECLARE @Offset int = (@Page - 1) * @PageSize;

    DECLARE @ResolvedSortColumn sysname;
    SELECT @ResolvedSortColumn = C.ColumnName
    FROM @Columns AS C
    WHERE C.ColumnName COLLATE DATABASE_DEFAULT = @SortColumn COLLATE DATABASE_DEFAULT
      AND C.IsSoftDelete = 0;

    IF @ResolvedSortColumn IS NULL
        THROW 53119, N'PHASE3_SORT_FIELD_NOT_ALLOWED', 1;

    DECLARE
        @SelectList nvarchar(max),
        @KeywordPredicate nvarchar(max),
        @FilterPredicate nvarchar(max),
        @SoftDeletePredicate nvarchar(500) = N'',
        @BranchPredicate nvarchar(2000) = N'',
        @Sql nvarchar(max);

    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchPredicate = N'
          AND (
              LOWER(@UserGroupID) = ''admin''
              OR EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                  WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                    AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                        = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
              )
          )';

    SELECT @SelectList = STUFF((
        SELECT N', T.' + QUOTENAME(C.ColumnName)
        FROM @Columns AS C
        WHERE C.IsSoftDelete = 0
        ORDER BY C.ColumnID
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    SELECT @KeywordPredicate = STUFF((
        SELECT N' OR CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName)
             + N') COLLATE DATABASE_DEFAULT LIKE (N''%'' + @Keyword + N''%'') COLLATE DATABASE_DEFAULT'
        FROM @Columns AS C
        WHERE C.IsSoftDelete = 0
          AND (C.IsText = 1 OR C.ColumnName COLLATE DATABASE_DEFAULT = @PrimaryColumn COLLATE DATABASE_DEFAULT)
        ORDER BY C.ColumnID
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 4, N'');

    SELECT @FilterPredicate = STUFF((
        SELECT CASE
            WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N') >= TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
            WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N') <= TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
            WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT
                THEN N' AND EXISTS (SELECT 1 FROM STRING_SPLIT(JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''), '','') AS IV WHERE LTRIM(RTRIM(IV.[value])) COLLATE DATABASE_DEFAULT = CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName) + N') COLLATE DATABASE_DEFAULT)'
            WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT OR C.IsText = 0
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N')'
                   + CASE WHEN C.IsText = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                   + N' = TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
                   + CASE WHEN C.IsText = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
            ELSE N' AND CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName)
               + N') COLLATE DATABASE_DEFAULT LIKE (N''%'' + JSON_VALUE(@Data, ''$."'
               + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''')
               + N'"'') + N''%'') COLLATE DATABASE_DEFAULT'
        END
        FROM OPENJSON(@Data) AS J
        INNER JOIN @Columns AS C
          ON C.ColumnName COLLATE DATABASE_DEFAULT =
             CASE
                 WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 8)
                 WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 ELSE J.[key]
             END COLLATE DATABASE_DEFAULT
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('keyword', 'branchid', 'page', 'pagesize')
          AND C.IsSoftDelete = 0
        ORDER BY C.ColumnID, J.[key]
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 0, N'');

    IF EXISTS (SELECT 1 FROM @Columns WHERE IsSoftDelete = 1)
        SELECT @SoftDeletePredicate = N' AND ISNULL(T.' + QUOTENAME(ColumnName) + N', 0) = 0'
        FROM @Columns WHERE IsSoftDelete = 1;

    /* PHASE3_UNIFIED_FIELD_CONTRACT / PHASE3_SAFE_COLUMN_LIST */
    SET @Sql = N'
        SELECT ' + @SelectList + N'
        FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
        WHERE (@Keyword = N'''' OR (' + COALESCE(NULLIF(@KeywordPredicate, N''), N'1 = 0') + N'))'
        + ISNULL(@FilterPredicate, N'')
        + @BranchPredicate
        + @SoftDeletePredicate + N'
        ORDER BY T.' + QUOTENAME(@ResolvedSortColumn) + N' ' + @SortDir
        + CASE
              WHEN @ResolvedSortColumn COLLATE DATABASE_DEFAULT <> @PrimaryColumn COLLATE DATABASE_DEFAULT
                  THEN N', T.' + QUOTENAME(@PrimaryColumn) + N' ASC'
              ELSE N''
          END
        + CASE WHEN @UsePaging = 1 THEN N' OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY' ELSE N'' END
        + N';';

    EXEC sys.sp_executesql
        @Sql,
        N'@Keyword nvarchar(200), @Data nvarchar(max), @Offset int, @PageSize int, @BranchID varchar(max), @UserGroupID varchar(50)',
        @Keyword = @Keyword,
        @Data = @Data,
        @Offset = @Offset,
        @PageSize = @PageSize,
        @BranchID = @BranchID,
        @UserGroupID = @UserGroupID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_CutoverSafeFieldContractsV2; Input: sql/UnifiedContractRollout/10_CUTOVER_SAFE_FORMS.sql */
    CREATE OR ALTER PROCEDURE dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName varchar(100) = NULL,
        @UserName varchar(100),
        @BatchID uniqueidentifier = NULL OUTPUT
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;

        SET @WebFormName = NULLIF(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), '');
        SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
        IF @UserName = '' THROW 54400, N'FIELD_CONTRACT_CUTOVER_ACTOR_REQUIRED', 1;
        IF @BatchID IS NULL SET @BatchID = NEWID();

        IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
        OR OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
        OR OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
        OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
            THROW 54401, N'FIELD_CONTRACT_CUTOVER_SOURCE_MISSING', 1;

        DECLARE @Forms table
        (
            WebFormName varchar(100) PRIMARY KEY,
            ContractType varchar(40),
            ExpectedTableName sysname,
            ExpectedPrimaryKey sysname,
            ViewList varchar(100),
            ViewProcedure sysname,
            SaveProcedure sysname,
            DeleteProcedure sysname
        );

        INSERT INTO @Forms
        SELECT
            R.WebFormName, R.ContractType, R.ExpectedTableName, R.ExpectedPrimaryKey,
            ISNULL(NULLIF(R.ViewList, ''), R.WebFormName),
            R.ViewProcedure, R.SaveProcedure, R.DeleteProcedure
        FROM dbo.WA_FieldContractRegistry AS R
        WHERE R.IsEnabled = 1
        AND R.WebFormName LIKE '%Frm'
        AND
        (
            R.RolloutStatus = 'ACTIVE'
            OR
            (
                R.RolloutStatus = 'SHADOW'
                AND R.RolloutReason LIKE '%READY_FOR_CUTOVER'
            )
        )
        AND R.ContractType IN
            ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY')
        AND (@WebFormName IS NULL OR R.WebFormName = @WebFormName);

        IF @WebFormName IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM @Forms WHERE WebFormName = @WebFormName)
            THROW 54402, N'FIELD_CONTRACT_FORM_NOT_READY_FOR_CUTOVER', 1;

        IF NOT EXISTS (SELECT 1 FROM @Forms)
        BEGIN
            SELECT @BatchID AS BackupBatchID, N'NO_READY_FORM' AS CutoverStatus;
            RETURN;
        END;

        /*
        Contract được chọn phải khai báo đúng route policy V2. Registry là nguồn
        cấu hình, nhưng không được phép dùng registry để hợp thức hóa route legacy.
        */
        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            WHERE
                (
                    F.ContractType = 'SIMPLE_TABLE'
                    AND
                    (
                        ISNULL(F.ViewProcedure, N'') <> N'API_TruyVanDong_V2'
                        OR ISNULL(F.SaveProcedure, N'') <> N'API_LuuDong_V2'
                        OR ISNULL(F.DeleteProcedure, N'') <> N'API_XoaDong_V2'
                    )
                )
                OR
                (
                    F.ContractType IN ('JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE')
                    AND
                    (
                        F.ViewProcedure IS NULL
                        OR ISNULL(F.SaveProcedure, N'') <> N'API_LuuDong_V2'
                        OR ISNULL(F.DeleteProcedure, N'') <> N'API_XoaDong_V2'
                    )
                )
                OR
                (
                    F.ContractType = 'READ_ONLY'
                    AND
                    (
                        F.ViewProcedure IS NULL
                        OR F.SaveProcedure IS NOT NULL
                        OR F.DeleteProcedure IS NOT NULL
                    )
                )
        )
            THROW 54412, N'FIELD_CONTRACT_ROUTE_POLICY_INVALID', 1;

        /* Gate table/PK và unique key cho master có mutation; READ_ONLY giữ View nghiệp vụ. */
        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            OUTER APPLY
            (
                SELECT
                    COUNT(*) AS RegistrationCount,
                    MIN(CONVERT(sysname, L.TableName)) AS TableName,
                    MIN(CONVERT(sysname, L.PrimaryKey)) AS PrimaryKey
                FROM dbo.SY_FrmLstTbl AS L
                WHERE L.FormID = F.WebFormName
            ) AS L
            WHERE F.ContractType <> 'READ_ONLY'
            AND
            (
                L.RegistrationCount <> 1
                OR L.TableName <> F.ExpectedTableName
                OR L.PrimaryKey <> F.ExpectedPrimaryKey
            )
        )
            THROW 54403, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_MISMATCH', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            WHERE F.ContractType <> 'READ_ONLY'
            AND
            (
                OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U') IS NULL
                OR NOT EXISTS
                (
                    SELECT 1
                    FROM sys.columns AS C
                    WHERE C.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                        AND C.name = F.ExpectedPrimaryKey
                )
                OR NOT EXISTS
                (
                    SELECT 1
                    FROM sys.indexes AS I
                    INNER JOIN sys.index_columns AS IC
                        ON IC.object_id = I.object_id
                    AND IC.index_id = I.index_id
                    AND IC.key_ordinal > 0
                    WHERE I.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                        AND I.is_unique = 1
                        AND I.is_disabled = 0
                    GROUP BY I.index_id
                    HAVING COUNT(*) = 1
                        AND MAX(IC.column_id) = COLUMNPROPERTY(
                            OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U'),
                            F.ExpectedPrimaryKey,
                            'ColumnId'
                        )
                )
            )
        )
            THROW 54404, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_NOT_SAFE', 1;

        /* Gate physical table/PK của dataset editable; dataset READ_ONLY không có mutation. */
        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_FieldDatasetRegistry AS D
            INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
            OUTER APPLY
            (
                SELECT
                    COUNT(*) AS RegistrationCount,
                    MIN(CONVERT(sysname, L.TableName)) AS TableName,
                    MIN(CONVERT(sysname, L.PrimaryKey)) AS PrimaryKey
                FROM dbo.SY_FrmLstTbl AS L
                WHERE L.FormID = D.ApiList
            ) AS L
            WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW')
            AND D.IsReadOnly = 0
            AND
            (
                OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U') IS NULL
                OR NOT EXISTS
                (
                    SELECT 1 FROM sys.columns AS C
                    WHERE C.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                        AND C.name = D.ExpectedPrimaryKey
                )
                OR NOT EXISTS
                (
                    SELECT 1
                    FROM sys.indexes AS I
                    INNER JOIN sys.index_columns AS IC
                        ON IC.object_id = I.object_id
                    AND IC.index_id = I.index_id
                    AND IC.key_ordinal > 0
                    WHERE I.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                        AND I.is_unique = 1
                        AND I.is_disabled = 0
                    GROUP BY I.index_id
                    HAVING COUNT(*) = 1
                        AND MAX(IC.column_id) = COLUMNPROPERTY(
                            OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U'),
                            D.ExpectedPrimaryKey,
                            'ColumnId'
                        )
                )
                OR D.ParentField IS NULL
                OR D.ChildField IS NULL
                OR NOT EXISTS
                (
                    SELECT 1 FROM sys.columns AS C
                    WHERE C.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                        AND C.name = D.ParentField
                )
                OR NOT EXISTS
                (
                    SELECT 1 FROM sys.columns AS C
                    WHERE C.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                        AND C.name = D.ChildField
                )
                OR (L.RegistrationCount > 0
                    AND (L.RegistrationCount <> 1
                        OR L.TableName <> D.ExpectedTableName
                        OR L.PrimaryKey <> D.ExpectedPrimaryKey))
            )
        )
            THROW 54405, N'FIELD_CONTRACT_DATASET_TABLE_PRIMARY_KEY_MISMATCH', 1;

        DECLARE @Targets table
        (
            TargetID int IDENTITY(1, 1) PRIMARY KEY,
            WebFormName varchar(100),
            ApiList varchar(100),
            Func varchar(20),
            DesiredProcedure sysname,
            DesiredPara nvarchar(max),
            KeepBusinessView bit
        );

        INSERT INTO @Targets
            (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
        SELECT
            F.WebFormName,
            F.ViewList,
            'View',
            F.ViewProcedure,
            CASE WHEN F.ContractType = 'SIMPLE_TABLE'
                THEN N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
                ELSE NULL END,
            CONVERT(bit, CASE WHEN F.ContractType = 'SIMPLE_TABLE' THEN 0 ELSE 1 END)
        FROM @Forms AS F
        WHERE F.ViewProcedure IS NOT NULL;

        INSERT INTO @Targets
            (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
        SELECT F.WebFormName, F.WebFormName, 'Save', F.SaveProcedure,
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''',
            0
        FROM @Forms AS F
        WHERE F.SaveProcedure IS NOT NULL AND F.ContractType <> 'READ_ONLY'
        UNION ALL
        SELECT F.WebFormName, F.WebFormName, 'Delete', F.DeleteProcedure,
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''',
            0
        FROM @Forms AS F
        WHERE F.DeleteProcedure IS NOT NULL AND F.ContractType <> 'READ_ONLY';

        INSERT INTO @Targets
            (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
        SELECT D.WebFormName, D.ApiList, 'View', D.ViewProcedure, NULL, 1
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.ViewProcedure IS NOT NULL
        UNION ALL
        SELECT D.WebFormName, D.ApiList, 'Save', D.SaveProcedure,
            N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''',
            0
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 0 AND D.SaveProcedure IS NOT NULL
        UNION ALL
        SELECT D.WebFormName, D.ApiList, 'Delete', D.DeleteProcedure,
            N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''',
            0
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 0 AND D.DeleteProcedure IS NOT NULL;

        IF EXISTS
        (
            SELECT 1 FROM @Targets
            GROUP BY ApiList, Func
            HAVING COUNT(*) > 1
        )
            THROW 54406, N'FIELD_CONTRACT_TARGET_ROUTE_DUPLICATE', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Targets AS T
            WHERE OBJECT_ID(N'dbo.' + T.DesiredProcedure, N'P') IS NULL
        )
            THROW 54407, N'FIELD_CONTRACT_TARGET_PROCEDURE_NOT_FOUND', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Targets AS T
            INNER JOIN dbo.WA_API AS A
            ON A.[list] = T.ApiList AND A.[func] = T.Func
            GROUP BY T.ApiList, T.Func
            HAVING COUNT(*) > 1
        )
            THROW 54408, N'FIELD_CONTRACT_ROUTE_DUPLICATE', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Targets AS T
            WHERE T.KeepBusinessView = 1
            AND
            (
                (SELECT COUNT(*) FROM dbo.WA_API AS A
                WHERE A.[list] = T.ApiList AND A.[func] = T.Func) <> 1
                OR NOT EXISTS
                (
                    SELECT 1 FROM dbo.WA_API AS A
                    WHERE A.[list] = T.ApiList
                        AND A.[func] = T.Func
                        AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) = T.DesiredProcedure
                )
            )
        )
            THROW 54409, N'FIELD_CONTRACT_BUSINESS_VIEW_ROUTE_MISMATCH', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            INNER JOIN dbo.WA_API AS A
            ON A.[list] = F.WebFormName
            AND A.[func] IN ('Save', 'Delete')
            WHERE F.ContractType = 'READ_ONLY'
        )
        OR EXISTS
        (
            SELECT 1
            FROM dbo.WA_FieldDatasetRegistry AS D
            INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
            INNER JOIN dbo.WA_API AS A
            ON A.[list] = D.ApiList
            AND A.[func] IN ('Save', 'Delete')
            WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 1
        )
            THROW 54411, N'FIELD_CONTRACT_READONLY_MUTATION_ROUTE_FORBIDDEN', 1;

        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE
                @TargetID int,
                @OwnerForm varchar(100),
                @ApiList varchar(100),
                @Func varchar(20),
                @DesiredProcedure sysname,
                @DesiredPara nvarchar(max),
                @KeepBusinessView bit,
                @RouteCount int,
                @CurrentProcedure sysname,
                @CurrentSql nvarchar(max),
                @CurrentPara nvarchar(max);

            DECLARE RouteCursor CURSOR LOCAL FAST_FORWARD FOR
                SELECT TargetID, WebFormName, ApiList, Func, DesiredProcedure,
                    DesiredPara, KeepBusinessView
                FROM @Targets
                ORDER BY TargetID;

            OPEN RouteCursor;
            FETCH NEXT FROM RouteCursor INTO
                @TargetID, @OwnerForm, @ApiList, @Func, @DesiredProcedure,
                @DesiredPara, @KeepBusinessView;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                SELECT
                    @RouteCount = COUNT(*),
                    @CurrentProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))),
                    @CurrentSql = MIN(CONVERT(nvarchar(max), A.[SQL])),
                    @CurrentPara = MIN(CONVERT(nvarchar(max), A.Para))
                FROM dbo.WA_API AS A WITH (UPDLOCK, HOLDLOCK)
                WHERE A.[list] = @ApiList AND A.[func] = @Func;

                IF @KeepBusinessView = 0
                AND @RouteCount = 1
                AND @CurrentProcedure <> @DesiredProcedure
                AND
                (
                    (@Func = 'View' AND @CurrentProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2'))
                    OR (@Func = 'Save' AND @CurrentProcedure NOT IN (N'API_LuuDong', N'API_LuuDong_V2'))
                    OR (@Func = 'Delete' AND @CurrentProcedure NOT IN (N'API_XoaDong', N'API_XoaDong_V2'))
                )
                    THROW 54410, N'FIELD_CONTRACT_CUSTOM_MUTATION_OR_VIEW_NOT_REPLACEABLE', 1;

                IF @KeepBusinessView = 0
                AND
                (
                    @RouteCount = 0
                    OR @CurrentProcedure <> @DesiredProcedure
                    OR ISNULL(@CurrentPara, N'') <> ISNULL(@DesiredPara, N'')
                )
                BEGIN
                    INSERT INTO dbo.WA_FieldContractRouteBackup
                    (
                        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
                        [SQL], Para, BackupTime, BackupUser
                    )
                    VALUES
                    (
                        @BatchID, @OwnerForm, @ApiList, @Func,
                        CASE WHEN @RouteCount = 1 THEN 1 ELSE 0 END,
                        @CurrentSql, @CurrentPara, SYSUTCDATETIME(), @UserName
                    );

                    IF @RouteCount = 1
                        UPDATE dbo.WA_API
                        SET [SQL] = @DesiredProcedure, Para = @DesiredPara
                        WHERE [list] = @ApiList AND [func] = @Func;
                    ELSE
                        INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
                        VALUES (@ApiList, @Func, @DesiredProcedure, @DesiredPara);
                END;

                FETCH NEXT FROM RouteCursor INTO
                    @TargetID, @OwnerForm, @ApiList, @Func, @DesiredProcedure,
                    @DesiredPara, @KeepBusinessView;
            END;

            CLOSE RouteCursor;
            DEALLOCATE RouteCursor;

            /*
            Chỉ bật ACTIVE sau khi toàn bộ route đã cập nhật thành công trong cùng
            transaction; lỗi ở bất kỳ route nào sẽ rollback cả route lẫn trạng thái.
            */
            UPDATE D
            SET RolloutStatus = 'ACTIVE',
                RolloutReason = CONCAT(N'CUTOVER_BATCH_', CONVERT(nvarchar(36), @BatchID)),
                UpdatedAt = SYSUTCDATETIME(),
                UpdatedBy = @UserName
            FROM dbo.WA_FieldDatasetRegistry AS D
            INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
            WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW');

            UPDATE R
            SET RolloutStatus = 'ACTIVE',
                RolloutReason = CONCAT(N'CUTOVER_BATCH_', CONVERT(nvarchar(36), @BatchID)),
                UpdatedAt = SYSUTCDATETIME(),
                UpdatedBy = @UserName
            FROM dbo.WA_FieldContractRegistry AS R
            INNER JOIN @Forms AS F ON F.WebFormName = R.WebFormName;

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            IF CURSOR_STATUS('local', 'RouteCursor') >= 0
                CLOSE RouteCursor;

            IF CURSOR_STATUS('local', 'RouteCursor') >= -1
                DEALLOCATE RouteCursor;
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH;

        SELECT
            @BatchID AS BackupBatchID,
            B.WebFormName,
            B.ApiList,
            B.Func,
            B.RouteExisted,
            B.[SQL] AS BeforeSQL,
            A.[SQL] AS AfterSQL,
            B.BackupTime
        FROM dbo.WA_FieldContractRouteBackup AS B
        LEFT JOIN dbo.WA_API AS A
        ON A.[list] = B.ApiList AND A.[func] = B.Func
        WHERE B.BackupBatchID = @BatchID
        ORDER BY B.BackupID;
    END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_DiscoverFieldContractCandidatesV2; Input: sql/UnifiedContractRollout/03_CREATE_DISCOVERY_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_DiscoverFieldContractCandidatesV2
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
       OR OBJECT_ID(N'dbo.WA_Menu', N'U') IS NULL
       OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
        THROW 54100, N'FIELD_CONTRACT_DISCOVERY_SOURCE_MISSING', 1;

    ;WITH SourceComplex AS
    (
        SELECT V.WebFormName, V.Reason
        FROM (VALUES
            ('WA_PersonFullFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_DanhSachUngVienFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_HopDongLaoDongFrm', 'FRONTEND_DOCUMENT_ATTACHMENT_CUSTOM_DETAIL'),
            ('WA_BaoHiemFrm', 'FRONTEND_COMPLEX_DETAIL_CALCULATION'),
            ('WA_DonXinNghiPhepFrm', 'FRONTEND_WORKFLOW_ATTACHMENT'),
            ('WA_QuanLyNghiPhepNamFrm', 'FRONTEND_MULTI_DATASET'),
            ('WA_PayrollFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_TimeSheetDayFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_BangPhuCapFrm', 'FRONTEND_DETAIL_MUTATION_NOT_AUDITED'),
            ('WA_NguoiDungFrm', 'FRONTEND_PERMISSION_MANAGEMENT'),
            ('WA_NguoiDungNhomFrm', 'FRONTEND_PERMISSION_MANAGEMENT')
        ) AS V(WebFormName, Reason)
    ),
    CandidateNames AS
    (
        SELECT CONVERT(varchar(100), LTRIM(RTRIM(M.FormName))) AS WebFormName
        FROM dbo.WA_Menu AS M
        WHERE NULLIF(LTRIM(RTRIM(M.FormName)), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(M.FormName)) LIKE '%Frm'
              OR LTRIM(RTRIM(M.FormName)) LIKE '%Report'
          )

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(L.FormID)))
        FROM dbo.SY_FrmLstTbl AS L
        WHERE NULLIF(LTRIM(RTRIM(L.FormID)), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(L.FormID)) LIKE '%Frm'
              OR LTRIM(RTRIM(L.FormID)) LIKE '%Report'
          )

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(A.[list])))
        FROM dbo.WA_API AS A
        WHERE NULLIF(LTRIM(RTRIM(A.[list])), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(A.[list])) LIKE '%Frm'
              OR LTRIM(RTRIM(A.[list])) LIKE '%Report'
          )
    ),
    FormRegistration AS
    (
        SELECT
            L.FormID AS WebFormName,
            COUNT(*) AS FormRegistrationCount,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.TableName)), ''))) AS TableName,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.PrimaryKey)), ''))) AS PrimaryKey
        FROM dbo.SY_FrmLstTbl AS L
        GROUP BY L.FormID
    ),
    Routes AS
    (
        SELECT
            A.[list] AS WebFormName,
            SUM(CASE WHEN A.[func] = 'View' THEN 1 ELSE 0 END) AS ViewRouteCount,
            SUM(CASE WHEN A.[func] = 'Save' THEN 1 ELSE 0 END) AS SaveRouteCount,
            SUM(CASE WHEN A.[func] = 'Delete' THEN 1 ELSE 0 END) AS DeleteRouteCount,
            MIN(CASE WHEN A.[func] = 'View'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS ViewProcedure,
            MIN(CASE WHEN A.[func] = 'Save'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS SaveProcedure,
            MIN(CASE WHEN A.[func] = 'Delete'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS DeleteProcedure
        FROM dbo.WA_API AS A
        GROUP BY A.[list]
    ),
    Facts AS
    (
        SELECT
            C.WebFormName,
            CONVERT(varchar(100), CASE
                WHEN C.WebFormName = 'WA_BangThueTNCNFrm' THEN 'HR_BangThueTNCNFrm'
                WHEN F.FormRegistrationCount = 1 THEN C.WebFormName
                ELSE NULL
            END) AS ERPFormID,
            ISNULL(R.ViewProcedure, N'') AS ViewProcedure,
            ISNULL(R.SaveProcedure, N'') AS SaveProcedure,
            ISNULL(R.DeleteProcedure, N'') AS DeleteProcedure,
            F.TableName,
            F.PrimaryKey,
            ISNULL(R.ViewRouteCount, 0) AS ViewRouteCount,
            ISNULL(R.SaveRouteCount, 0) AS SaveRouteCount,
            ISNULL(R.DeleteRouteCount, 0) AS DeleteRouteCount,
            ISNULL(F.FormRegistrationCount, 0) AS FormRegistrationCount,
            T.object_id AS TableObjectID,
            P.object_id AS ViewProcedureObjectID,
            SC.Reason AS SourceComplexReason
        FROM CandidateNames AS C
        LEFT JOIN FormRegistration AS F
          ON F.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN Routes AS R
          ON R.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.tables AS T
          ON T.schema_id = SCHEMA_ID(N'dbo')
         AND T.name COLLATE DATABASE_DEFAULT = F.TableName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.procedures AS P
          ON P.schema_id = SCHEMA_ID(N'dbo')
         AND P.name COLLATE DATABASE_DEFAULT = R.ViewProcedure COLLATE DATABASE_DEFAULT
        LEFT JOIN SourceComplex AS SC
          ON SC.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
    ),
    Described AS
    (
        SELECT
            F.*,
            CONVERT(bit, CASE WHEN F.TableObjectID IS NOT NULL THEN 1 ELSE 0 END) AS TableExists,
            CONVERT(bit, CASE WHEN PKC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyExists,
            CONVERT(bit, CASE WHEN UI.index_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyUnique,
            CONVERT(bit, CASE
                WHEN F.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2') THEN 1
                WHEN F.ViewProcedureObjectID IS NOT NULL AND ISNULL(D.ResultErrorCount, 0) = 0
                     AND ISNULL(D.ResultColumnCount, 0) > 0 THEN 1
                ELSE 0
            END) AS ResultSetDescribable,
            ISNULL(D.ResultColumnCount, 0) AS ResultColumnCount,
            ISNULL(D.PhysicalFieldCount, 0) AS PhysicalFieldCount,
            ISNULL(D.JoinFieldCount, 0) AS JoinFieldCount,
            CONVERT(bit, CASE WHEN BC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS HasBranchScope
        FROM Facts AS F
        LEFT JOIN sys.columns AS PKC
          ON PKC.object_id = F.TableObjectID
         AND PKC.name COLLATE DATABASE_DEFAULT = F.PrimaryKey COLLATE DATABASE_DEFAULT
        OUTER APPLY
        (
            SELECT TOP (1) I.index_id
            FROM sys.indexes AS I
            INNER JOIN sys.index_columns AS IC
              ON IC.object_id = I.object_id
             AND IC.index_id = I.index_id
             AND IC.key_ordinal > 0
            WHERE I.object_id = F.TableObjectID
              AND I.is_unique = 1
              AND I.is_disabled = 0
            GROUP BY I.index_id
            HAVING COUNT(*) = 1 AND MAX(IC.column_id) = PKC.column_id
        ) AS UI
        OUTER APPLY
        (
            SELECT TOP (1) C.column_id
            FROM sys.columns AS C
            WHERE C.object_id = F.TableObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT
                  IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ORDER BY C.column_id
        ) AS BC
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS ResultColumnCount,
                SUM(X.IsPhysical) AS PhysicalFieldCount,
                SUM(CASE WHEN X.IsPhysical = 0 THEN 1 ELSE 0 END) AS JoinFieldCount,
                SUM(X.HasError) AS ResultErrorCount
            FROM
            (
                SELECT
                    CASE
                        WHEN C.column_id IS NOT NULL
                         AND RS.source_table COLLATE DATABASE_DEFAULT
                             = OBJECT_NAME(F.TableObjectID) COLLATE DATABASE_DEFAULT
                         AND ISNULL(RS.source_schema, N'dbo') COLLATE DATABASE_DEFAULT
                             = N'dbo' COLLATE DATABASE_DEFAULT
                        THEN 1
                        ELSE 0
                    END AS IsPhysical,
                    CASE WHEN RS.error_type IS NULL THEN 0 ELSE 1 END AS HasError
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (F.ViewProcedureObjectID, 1) AS RS
                LEFT JOIN sys.columns AS C
                  ON C.object_id = F.TableObjectID
                 AND C.name COLLATE DATABASE_DEFAULT
                     = ISNULL(RS.source_column, RS.name) COLLATE DATABASE_DEFAULT
                WHERE ISNULL(RS.is_hidden, 0) = 0
            ) AS X
        ) AS D
    ),
    Classified AS
    (
        SELECT
            D.*,
            CONVERT(varchar(40), CASE
                WHEN D.SourceComplexReason IS NOT NULL THEN 'COMPLEX_DEFERRED'
                WHEN D.FormRegistrationCount <> 1
                  OR D.TableExists = 0
                  OR D.PrimaryKey IS NULL
                  OR D.PrimaryKeyExists = 0
                  OR D.PrimaryKeyUnique = 0
                  OR D.ViewRouteCount <> 1
                  OR D.ViewProcedureObjectID IS NULL
                  OR D.ERPFormID IS NULL THEN 'BLOCKED'
                WHEN D.SaveRouteCount > 1 OR D.DeleteRouteCount > 1 THEN 'BLOCKED'
                WHEN D.WebFormName LIKE '%Report'
                 AND D.ResultSetDescribable = 1
                 AND D.SaveRouteCount = 0
                 AND D.DeleteRouteCount = 0 THEN 'READ_ONLY'
                WHEN D.WebFormName LIKE '%Report' THEN 'BLOCKED'
                WHEN (D.SaveRouteCount = 1
                      AND D.SaveProcedure NOT IN (N'API_LuuDong', N'API_LuuDong_V2'))
                  OR (D.DeleteRouteCount = 1
                      AND D.DeleteProcedure NOT IN (N'API_XoaDong', N'API_XoaDong_V2'))
                    THEN 'COMPLEX_DEFERRED'
                WHEN D.SaveRouteCount <> 1 OR D.DeleteRouteCount <> 1
                    THEN 'BLOCKED'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'SIMPLE_TABLE'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ResultSetDescribable = 1
                     AND D.PhysicalFieldCount > 0
                     AND D.ViewProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'JOIN_VIEW_SINGLE_TABLE'
                ELSE 'BLOCKED'
            END) AS SuggestedContractType
        FROM Described AS D
    )
    SELECT
        C.WebFormName,
        C.ERPFormID,
        C.ViewProcedure AS CurrentViewProcedure,
        C.SaveProcedure AS CurrentSaveProcedure,
        C.DeleteProcedure AS CurrentDeleteProcedure,
        C.TableName,
        C.PrimaryKey,
        C.ViewRouteCount,
        C.SaveRouteCount,
        C.DeleteRouteCount,
        C.FormRegistrationCount,
        C.TableExists,
        C.PrimaryKeyExists,
        C.PrimaryKeyUnique,
        C.ResultSetDescribable,
        C.PhysicalFieldCount,
        C.JoinFieldCount,
        C.HasBranchScope,
        CONVERT(varchar(40), CASE
            WHEN C.SaveRouteCount = 0 AND C.DeleteRouteCount = 0 THEN 'MISSING'
            WHEN C.SaveProcedure IN (N'API_LuuDong', N'API_LuuDong_V2')
             AND C.DeleteProcedure IN (N'API_XoaDong', N'API_XoaDong_V2') THEN 'GENERIC'
            ELSE 'CUSTOM'
        END) AS CurrentMutationType,
        C.SuggestedContractType,
        CONVERT(varchar(20), CASE
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY') THEN 'SHADOW'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'DEFERRED'
            ELSE 'BLOCKED'
        END) AS SuggestedRolloutStatus,
        CONVERT(nvarchar(500), CASE
            WHEN C.SourceComplexReason IS NOT NULL THEN C.SourceComplexReason
            WHEN C.ERPFormID IS NULL THEN 'ERP_FORM_ALIAS_REQUIRES_REVIEW'
            WHEN C.FormRegistrationCount <> 1 THEN 'SY_FRMLSTTBL_NOT_UNIQUE'
            WHEN C.TableExists = 0 THEN 'TABLE_NOT_FOUND'
            WHEN C.PrimaryKey IS NULL OR C.PrimaryKeyExists = 0 THEN 'PRIMARY_KEY_NOT_FOUND'
            WHEN C.PrimaryKeyUnique = 0 THEN 'PRIMARY_KEY_NOT_UNIQUE'
            WHEN C.ViewRouteCount <> 1 THEN 'VIEW_ROUTE_NOT_UNIQUE'
            WHEN C.ViewProcedureObjectID IS NULL THEN 'VIEW_PROCEDURE_NOT_FOUND'
            WHEN C.ResultSetDescribable = 0 THEN 'VIEW_RESULTSET_NOT_DESCRIBABLE'
            WHEN C.SaveRouteCount > 1 OR C.DeleteRouteCount > 1 THEN 'MUTATION_ROUTE_NOT_UNIQUE'
            WHEN C.SuggestedContractType = 'READ_ONLY' THEN 'REPORT_READ_ONLY_METADATA_READY'
            WHEN C.SaveRouteCount <> 1 OR C.DeleteRouteCount <> 1
                THEN 'CRUD_MUTATION_ROUTE_MISSING'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'CUSTOM_MUTATION_REQUIRES_AUDIT'
            WHEN C.SuggestedContractType = 'BLOCKED' THEN 'FIELD_LINEAGE_OR_CONTRACT_UNKNOWN'
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY')
                THEN 'DISCOVERY_READY_FOR_CUTOVER'
            ELSE NULL
        END) AS BlockingReason
    FROM Classified AS C
    ORDER BY C.WebFormName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_FieldContractResolveV2; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_FieldContractResolveV2
    @FormName varchar(100),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @FormName = LTRIM(RTRIM(ISNULL(@FormName, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @FormName = '' OR @UserName = ''
        THROW 54001, N'FIELD_CONTRACT_CONTEXT_REQUIRED', 1;

    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.PermissionFormName,
        R.ContractType,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        R.ViewList,
        R.ViewProcedure,
        R.SaveProcedure,
        R.DeleteProcedure,
        R.WritePolicy,
        R.BranchPolicy,
        R.DeletePolicy,
        R.RolloutStatus,
        R.RolloutReason,
        R.SchemaVersion,
        R.IsEnabled,
        D.DatasetKey,
        D.ApiList,
        D.ViewProcedure AS DatasetViewProcedure,
        D.ExpectedTableName AS DatasetExpectedTableName,
        D.ExpectedPrimaryKey AS DatasetExpectedPrimaryKey,
        D.ParentField,
        D.ChildField,
        D.IsReadOnly,
        D.SaveProcedure AS DatasetSaveProcedure,
        D.DeleteProcedure AS DatasetDeleteProcedure,
        D.WritePolicy AS DatasetWritePolicy,
        D.BranchPolicy AS DatasetBranchPolicy,
        D.RolloutStatus AS DatasetRolloutStatus,
        D.RolloutReason AS DatasetRolloutReason,
        D.SchemaVersion AS DatasetSchemaVersion
    FROM dbo.WA_FieldContractRegistry AS R
    LEFT JOIN dbo.WA_FieldDatasetRegistry AS D
      ON D.WebFormName = R.WebFormName
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @FormName COLLATE DATABASE_DEFAULT
    ORDER BY D.DatasetKey;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GridFieldCompareV2; Input: sql/FieldSyncPhase1/03_API_WEB_GRID_FIELD_COMPARE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_GridFieldCompareV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @LegacyPrimaryKey varchar(100);
    SELECT @LegacyPrimaryKey = L.PrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @WebFormName;

    DECLARE @V2 table (
        SchemaVersion varchar(10), CapabilityVersion varchar(10),
        WebFormName varchar(100), ERPFormName varchar(100),
        TableName varchar(100), PrimaryKey varchar(100),
        RegisteredViewProcedure varchar(50), RegisteredSaveProcedure varchar(50),
        RegisteredDeleteProcedure varchar(50), DeleteMode varchar(40),
        SourceKind varchar(30), FieldOrdinal int, FieldName varchar(128),
        SqlType nvarchar(256), IsNullable bit,
        IsPhysicalColumn bit, IsPrimaryKey bit, IsIdentity bit, IsComputed bit, HasDefault bit,
        DbMaxLength smallint, DbPrecision tinyint, DbScale tinyint, DbIsNullable bit,
        IsServerManaged bit, IsSensitiveOrDenied bit, IsRequiredOnInsert bit,
        ShowInGrid bit, ShowInAdd bit, ShowInEdit bit, ShowInFilter bit,
        SupportsInsert bit, SupportsUpdate bit, SupportsFilter bit, SupportsSort bit, SupportsKeyword bit,
        Caption nvarchar(200), FormatID varchar(2), FormatType char(1), RenderType varchar(20),
        NumberDecimal int, FormatString nvarchar(100), MaskString varchar(50),
        MaxLength smallint, MinValue float, MaxValue float, Align varchar(2), MinWidth int, MaxWidth int,
        LookupKey varchar(64), LookupType varchar(10), LookupValueColumn varchar(50),
        LookupDisplayColumn varchar(50), LookupColumns varchar(max), LookupWidths varchar(max),
        LookupDependsOn varchar(max), LookupMultiSelect bit, LookupReloadMode varchar(10),
        LookupDisabled bit, DiagnosticCode varchar(50)
    );

    INSERT INTO @V2
    EXEC dbo.API_Web_GridFieldSchemaV2
        @WebFormName = @WebFormName,
        @ERPFormID = @ERPFormID,
        @UserName = @UserName,
        @BranchID = @BranchID;

    DECLARE @V2PrimaryKey varchar(100);
    SELECT @V2PrimaryKey = MAX(PrimaryKey) FROM @V2;

    ;WITH Legacy AS (
        SELECT
            F.FieldName,
            MAX(F.CaptionVN) AS Caption,
            MAX(F.FormatID) AS FormatID,
            MAX(CASE WHEN NULLIF(LTRIM(RTRIM(ISNULL(F.DataSource, ''))), '') IS NULL THEN 0 ELSE 1 END) AS HasLookup
        FROM dbo.SY_FormatFields AS F
        WHERE LOWER(ISNULL(F.FormName, '')) = LOWER(@WebFormName)
          AND ISNULL(F.ShowInForm, 1) = 1
          AND LOWER(ISNULL(F.FormPosition, 'grid')) LIKE '%grid%'
        GROUP BY F.FieldName
    ), V2 AS (
        SELECT FieldName, Caption, FormatID, RenderType, LookupKey
        FROM @V2
    )
    SELECT
        COALESCE(V2.FieldName, L.FieldName) AS FieldName,
        L.Caption AS LegacyCaption,
        V2.Caption AS V2Caption,
        L.FormatID AS LegacyFormatID,
        V2.FormatID AS V2FormatID,
        CASE
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
            WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            ELSE 'text'
        END AS LegacyRenderType,
        V2.RenderType AS V2RenderType,
        CONVERT(bit, ISNULL(L.HasLookup, 0)) AS LegacyHasLookup,
        CONVERT(bit, CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END) AS V2HasLookup,
        @LegacyPrimaryKey AS LegacyPrimaryKey,
        @V2PrimaryKey AS V2PrimaryKey,
        CASE WHEN LOWER(ISNULL(@LegacyPrimaryKey, '')) = LOWER(ISNULL(@V2PrimaryKey, '')) THEN 'MATCH' ELSE 'CRITICAL' END AS PrimaryKeyStatus,
        CASE
            WHEN L.FieldName IS NULL THEN 'ONLY_V2'
            WHEN V2.FieldName IS NULL THEN 'ONLY_LEGACY'
            WHEN ISNULL(L.Caption, '') <> ISNULL(V2.Caption, '') THEN 'CAPTION_DIFF'
            WHEN ISNULL(L.HasLookup, 0) <> CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END THEN 'LOOKUP_DIFF'
            WHEN
                CASE
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
                    WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
                    ELSE 'text'
                END <> ISNULL(V2.RenderType, 'text') THEN 'FORMAT_DIFF'
            ELSE 'MATCH'
        END AS ParityStatus
    FROM Legacy AS L
    FULL OUTER JOIN V2
      ON LOWER(V2.FieldName) = LOWER(L.FieldName)
    ORDER BY COALESCE(V2.FieldName, L.FieldName);
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GridFieldSchemaV2; Input: sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_GridFieldSchemaV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedERPFormID varchar(100),
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @ContractType varchar(40),
        @PermissionFormName varchar(100),
        @ExpectedView sysname,
        @ExpectedSave sysname,
        @ExpectedDelete sysname,
        @EnableView bit,
        @EnableSave bit,
        @EnableDelete bit,
        @DeletePolicy varchar(40),
        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedERPFormID = R.ERPFormID,
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ContractType = R.ContractType,
        @PermissionFormName = R.PermissionFormName,
        @ExpectedView = R.ViewV2,
        @ExpectedSave = R.SaveV2,
        @ExpectedDelete = R.DeleteV2,
        @EnableView = R.EnableView,
        @EnableSave = R.EnableSave,
        @EnableDelete = R.EnableDelete,
        @DeletePolicy = R.DeletePolicy,
        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy
    FROM dbo.API_FieldMetadataContractRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

    IF @ExpectedTable IS NULL
        THROW 53201, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_CONTRACT', 1;
    IF @UserName = ''
        THROW 53202, N'PHASE3_ACTOR_REQUIRED', 1;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @WebFormName)));

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @ExpectedERPFormID)));
    IF @ERPFormID COLLATE DATABASE_DEFAULT <> @ExpectedERPFormID COLLATE DATABASE_DEFAULT
        THROW 53203, N'PHASE3_ERP_FORM_ALIAS_MISMATCH', 1;

/*
  Filter membership dùng trực tiếp SY_FrmFltTbl của ERP.
  Không copy row HR_* sang WA_* và không fallback SY_FormatFields cho Unified V2.
*/
DECLARE @FilterSourceFormID varchar(250) = NULL;

IF OBJECT_ID(N'dbo.SY_FrmFltTbl', N'U') IS NOT NULL
BEGIN
    IF EXISTS
    (
        SELECT 1
        FROM dbo.SY_FrmFltTbl AS X
        WHERE X.FormID COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT
          AND ISNULL(X.IsDisable, 0) = 0
    )
        SET @FilterSourceFormID = @ERPFormID;
    ELSE IF EXISTS
    (
        SELECT 1
        FROM dbo.SY_FrmFltTbl AS X
        WHERE X.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND ISNULL(X.IsDisable, 0) = 0
    )
        SET @FilterSourceFormID = @WebFormName;
END;
    DECLARE
        @RegisteredTable sysname,
        @RegisteredPrimaryKey sysname,
        @RegistrationCount int;

    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
        THROW 53204, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL
        THROW 53205, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;

    /*
      Delete capability is derived from the registered physical table, never from
      a form-specific switch: IsDeleted bit => SOFT, no IsDeleted => HARD, any
      other IsDeleted type => fail closed.
    */
    DECLARE @ResolvedDeleteMode varchar(40) =
        CASE
            WHEN @EnableDelete <> 1
              OR @DeletePolicy COLLATE DATABASE_DEFAULT <> 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
                THEN 'NONE'
            WHEN EXISTS (
                SELECT 1
                FROM sys.columns AS C
                INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
                WHERE C.object_id = @ObjectID
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
                  AND LOWER(T.name) COLLATE DATABASE_DEFAULT = 'bit' COLLATE DATABASE_DEFAULT
                  AND C.is_computed = 0
            ) THEN 'SOFT'
            WHEN EXISTS (
                SELECT 1
                FROM sys.columns AS C
                WHERE C.object_id = @ObjectID
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
            ) THEN 'INVALID_ISDELETED_TYPE'
            ELSE 'HARD'
        END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
        THROW 53206, N'PHASE3_EXPECTED_PRIMARY_KEY_NOT_FOUND', 1;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF @GlobalReferenceOnly = 1 AND @BranchColumn IS NOT NULL
       AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
       )
        THROW 53207, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 53208, N'PHASE3_ACTOR_INVALID_OR_DISABLED', 1;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
            THROW 53209, N'PHASE3_BRANCH_CONTEXT_REQUIRED', 1;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
            THROW 53210, N'PHASE3_BRANCH_CONTEXT_DENIED', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0, @GroupCanRun bit = 0;
    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
        THROW 53211, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
            THROW 53212, N'PHASE3_METADATA_PERMISSION_DENIED', 1;
    END;

    DECLARE
        @ViewCount int,
        @SaveCount int,
        @DeleteCount int,
        @RegisteredView sysname,
        @RegisteredSave sysname,
        @RegisteredDelete sysname;

    SELECT @ViewCount = COUNT(*), @RegisteredView = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;
    SELECT @SaveCount = COUNT(*), @RegisteredSave = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;
    SELECT @DeleteCount = COUNT(*), @RegisteredDelete = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;

    IF @ViewCount <> 1 OR @SaveCount > 1 OR @DeleteCount > 1
        THROW 53213, N'FIELD_METADATA_WA_API_ROUTE_NOT_UNIQUE', 1;

    /*
      View custom và Report lấy membership từ result-set. Field JOIN/computed chỉ
      đọc; field vật lý của bảng chính vẫn kế thừa capability từ route hiện tại.
    */
    DECLARE @ResultSetFallback bit = 0;

    IF @RegisteredView NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
    BEGIN
        SET @ResultSetFallback = 1;

        DECLARE @ResultProcedureObjectID int =
            COALESCE(
                OBJECT_ID(@RegisteredView, N'P'),
                OBJECT_ID(N'dbo.' + @RegisteredView, N'P')
            );

        IF @ResultProcedureObjectID IS NULL
            THROW 53214, N'FIELD_METADATA_VIEW_PROCEDURE_NOT_FOUND', 1;

        DECLARE @ResultFields table
        (
            FieldOrdinal int NOT NULL,
            FieldName sysname NOT NULL,
            SqlType nvarchar(256) NULL,
            IsNullable bit NULL,
            MaxLength int NULL,
            SourceSchema sysname NULL,
            SourceTable sysname NULL,
            SourceColumn sysname NULL
        );

        BEGIN TRY
            IF NOT EXISTS
            (
                SELECT 1
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (@ResultProcedureObjectID, 1) AS X
                WHERE X.error_number IS NOT NULL
            )
            BEGIN
                INSERT INTO @ResultFields
                (
                    FieldOrdinal, FieldName, SqlType, IsNullable, MaxLength,
                    SourceSchema, SourceTable, SourceColumn
                )
                SELECT
                    X.column_ordinal,
                    X.name,
                    X.system_type_name,
                    X.is_nullable,
                    X.max_length,
                    X.source_schema,
                    X.source_table,
                    X.source_column
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (@ResultProcedureObjectID, 1) AS X
                WHERE ISNULL(X.is_hidden, 0) = 0
                  AND X.error_number IS NULL
                  AND NULLIF(LTRIM(RTRIM(X.name)), '') IS NOT NULL;
            END;
        END TRY
        BEGIN CATCH
            DELETE FROM @ResultFields;
        END CATCH;

        IF EXISTS (SELECT 1 FROM @ResultFields)
           AND NOT EXISTS
           (
               SELECT LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
               FROM @ResultFields AS F
               GROUP BY LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
               HAVING COUNT(*) > 1
           )
           AND
           (
               @ContractType = 'READ_ONLY'
               OR @WebFormName NOT LIKE '%Frm'
               OR EXISTS
               (
                   SELECT 1
                   FROM @ResultFields AS F
                   WHERE F.FieldName COLLATE DATABASE_DEFAULT =
                         @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
               )
           )
        BEGIN
            SET @ResultSetFallback = 0;

            SELECT
            CAST('2.0' AS varchar(10)) AS SchemaVersion,
            CAST('1.0' AS varchar(10)) AS CapabilityVersion,
            @WebFormName AS WebFormName,
            @ERPFormID AS ERPFormName,
            @ExpectedTable AS TableName,
            @ExpectedPrimaryKey AS PrimaryKey,
            @RegisteredView AS RegisteredViewProcedure,
            @RegisteredSave AS RegisteredSaveProcedure,
            @RegisteredDelete AS RegisteredDeleteProcedure,
            @ResolvedDeleteMode AS DeleteMode,
            CAST('RESULT_SET' AS varchar(30)) AS SourceKind,
            RF.FieldOrdinal,
            CONVERT(varchar(128), RF.FieldName) AS FieldName,
            RF.SqlType,
            RF.IsNullable,
            CONVERT(bit, CASE WHEN PC.column_id IS NULL THEN 0 ELSE 1 END) AS IsPhysicalColumn,
            ResultFlags.IsPrimaryKey,
            CONVERT(bit, ISNULL(PC.is_identity, 0)) AS IsIdentity,
            CONVERT(bit, ISNULL(PC.is_computed, 0)) AS IsComputed,
            CONVERT(bit, CASE WHEN ISNULL(PC.default_object_id, 0) <> 0 THEN 1 ELSE 0 END) AS HasDefault,
            COALESCE(PC.max_length, RF.MaxLength) AS DbMaxLength,
            PC.[precision] AS DbPrecision,
            PC.scale AS DbScale,
            RF.IsNullable AS DbIsNullable,
            ResultFlags.IsServerManaged,
            ResultFlags.IsDenied AS IsSensitiveOrDenied,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanInsert = 1
                 AND ISNULL(RF.IsNullable, 1) = 0
                 AND ISNULL(PC.default_object_id, 0) = 0 THEN 1
                ELSE 0
            END) AS IsRequiredOnInsert,
            ResultFlags.CanQuery AS ShowInGrid,
            ResultFlags.CanInsert AS ShowInAdd,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanUpdate = 1 OR ResultFlags.IsPrimaryKey = 1 THEN 1
                ELSE 0
            END) AS ShowInEdit,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1 AND ResultFilter.UserAutoID IS NOT NULL THEN 1
                ELSE 0
            END) AS ShowInFilter,
            ResultFlags.CanInsert AS SupportsInsert,
            ResultFlags.CanUpdate AS SupportsUpdate,
            ResultFlags.CanQuery AS SupportsFilter,
            ResultFlags.CanQuery AS SupportsSort,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1
                 AND LOWER(ISNULL(RF.SqlType, '')) LIKE '%char%' THEN 1
                ELSE 0
            END) AS SupportsKeyword,
            COALESCE(
                NULLIF(ResultCaption.CaptionVN, N''),
                NULLIF(ResultCaption.CaptionEN, N''),
                CONVERT(nvarchar(200), RF.FieldName)
            ) AS Caption,
            ResultCaption.FormatID,
            ResultFormat.[Type] AS FormatType,
            CASE
                WHEN ResultLookup.UserAutoID IS NOT NULL THEN 'lookup'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE 'bit%' THEN 'boolean'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'D' THEN 'date'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'DT' THEN 'datetime'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'H' THEN 'time'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) IN ('B', 'Q', 'N', 'N0', 'N3') THEN 'number'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%date%' THEN 'date'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%time%' THEN 'time'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%int%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%decimal%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%numeric%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%money%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%float%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%real%' THEN 'number'
                ELSE 'text'
            END AS RenderType,
            ResultFormat.NumberDecimal,
            ResultFormat.FormatString,
            ResultFormat.MaskString,
            COALESCE(ResultFormat.MaxLength, RF.MaxLength) AS MaxLength,
            ResultFormat.MinValue,
            ResultFormat.MaxValue,
            COALESCE(NULLIF(ResultCaption.AlignX, ''), ResultFormat.Align) AS Align,
            ResultCaption.MinWidth,
            ResultCaption.MaxWidth,
            CASE WHEN ResultLookup.UserAutoID IS NULL THEN NULL ELSE
                CONVERT(varchar(64), HASHBYTES(
                    'SHA2_256',
                    UPPER(CONCAT(
                        LTRIM(RTRIM(CONVERT(varchar(100), ResultLookup.FormID))),
                        '|',
                        LTRIM(RTRIM(CONVERT(varchar(128), ResultLookup.ColumnID)))
                    ))
                ), 2)
            END AS LookupKey,
            ResultLookup.[Type] AS LookupType,
            ResultLookup.ValueColumn AS LookupValueColumn,
            ResultLookup.DisplayColumn AS LookupDisplayColumn,
            ResultLookup.ColumnArr AS LookupColumns,
            ResultLookup.WidthArr AS LookupWidths,
            ResultLookup.ParaRequireArr AS LookupDependsOn,
            CONVERT(bit, ISNULL(ResultLookup.IsMultiSelect, 0)) AS LookupMultiSelect,
            ResultLookup.ReloadType AS LookupReloadMode,
            CONVERT(bit, ISNULL(ResultLookup.IsDisable, 0)) AS LookupDisabled,
            CONVERT(bit, CASE WHEN @FilterSourceFormID IS NULL THEN 0 ELSE 1 END) AS HasConfiguredFilters,
            @FilterSourceFormID AS FilterSourceFormID,
            ResultFilter.KeyID AS FilterKeyID,
            COALESCE(
                NULLIF(ResultFilter.Caption, N''),
                NULLIF(ResultCaption.CaptionVN, N''),
                NULLIF(ResultCaption.CaptionEN, N''),
                CONVERT(nvarchar(200), RF.FieldName)
            ) AS FilterCaption,
            ResultFilter.[Type] AS FilterControlType,
            ResultFilter.Operator AS FilterOperator,
            CONVERT(bit, ISNULL(ResultFilter.UseLikeOperator, 0)) AS FilterUseLikeOperator,
            ResultFilter.ControlWidth AS FilterControlWidth,
            ResultFilter.ValueColumn AS FilterValueColumn,
            ResultFilter.DisplayColumn AS FilterDisplayColumn,
            ResultFilter.ColumnArr AS FilterColumns,
            ResultFilter.WidthArr AS FilterWidths,
            CONVERT(bit, ISNULL(ResultFilter.RememberLastValue, 0)) AS FilterRememberLastValue,
            ResultFilter.DefaultValue AS FilterDefaultValue,
            CONVERT(bit, ISNULL(ResultFilter.IsReload, 0)) AS FilterReload,
            CASE
                WHEN ResultFlags.IsDenied = 1 OR ResultFlags.IsServerManaged = 1 THEN 'HIDDEN'
                WHEN ResultFlags.IsPrimaryKey = 1
                  OR ResultFlags.CanInsert = 1
                  OR ResultLookup.UserAutoID IS NOT NULL THEN 'CORE'
                ELSE 'OPTIONAL'
            END AS MobileClass,
            CASE
                WHEN ResultFlags.IsDenied = 1 THEN 'DENIED_FIELD'
                WHEN ResultFlags.IsServerManaged = 1 THEN 'SERVER_MANAGED'
                WHEN ResultFlags.IsPrimaryKey = 1 THEN 'PRIMARY_KEY'
                WHEN PC.column_id IS NULL THEN 'RESULT_SET_READ_ONLY'
                ELSE 'RESULT_SET_FIELD'
            END AS MobileReasonCodes,
            CAST(NULL AS varchar(80)) AS DiagnosticCode
        FROM @ResultFields AS RF
        LEFT JOIN sys.columns AS PC
          ON PC.object_id = @ObjectID
         AND PC.name COLLATE DATABASE_DEFAULT =
             COALESCE(NULLIF(RF.SourceColumn, ''), RF.FieldName) COLLATE DATABASE_DEFAULT
         AND (
             RF.SourceTable IS NULL
             OR RF.SourceTable COLLATE DATABASE_DEFAULT =
                @ExpectedTable COLLATE DATABASE_DEFAULT
         )
        OUTER APPLY
        (
            SELECT
                CONVERT(bit, CASE
                    WHEN RF.FieldName COLLATE DATABASE_DEFAULT =
                         @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1
                    ELSE 0
                END) AS IsPrimaryKey,
                CONVERT(bit, CASE
                    WHEN LOWER(RF.FieldName) COLLATE DATABASE_DEFAULT IN
                    (
                        'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                        'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                        'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat'
                    ) THEN 1 ELSE 0
                END) AS IsServerManaged,
                CONVERT(bit, CASE
                    WHEN LOWER(RF.FieldName) COLLATE DATABASE_DEFAULT IN
                    (
                        '__proto__', 'prototype', 'constructor', 'content', 'base64content',
                        'filecontent', 'binarydata', 'password', 'passwordhash', 'token',
                        'refreshtoken', 'secret', 'rawsql', 'commandtext'
                    )
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'binary%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'varbinary%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'image%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'rowversion%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'timestamp%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'xml%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'sql_variant%'
                    THEN 1 ELSE 0
                END) AS IsDenied
        ) AS ResultBase
        OUTER APPLY
        (
            SELECT
                ResultBase.IsPrimaryKey,
                ResultBase.IsServerManaged,
                ResultBase.IsDenied,
                CONVERT(bit, CASE
                    WHEN @EnableSave = 1
                     AND PC.column_id IS NOT NULL
                     AND ISNULL(PC.is_identity, 0) = 0
                     AND ISNULL(PC.is_computed, 0) = 0
                     AND ResultBase.IsServerManaged = 0
                     AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanInsert,
                CONVERT(bit, CASE
                    WHEN @EnableSave = 1
                     AND PC.column_id IS NOT NULL
                     AND ISNULL(PC.is_identity, 0) = 0
                     AND ISNULL(PC.is_computed, 0) = 0
                     AND ResultBase.IsPrimaryKey = 0
                     AND ResultBase.IsServerManaged = 0
                     AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanUpdate,
                CONVERT(bit, CASE
                    WHEN @EnableView = 1 AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanQuery
        ) AS ResultFlags
        OUTER APPLY
        (
            SELECT TOP (1)
                X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
            FROM dbo.SY_FmtFldTbl AS X
            WHERE X.FieldName COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
              AND (
                  X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT
                  OR X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
                  OR X.FormName IS NULL
                  OR LTRIM(RTRIM(X.FormName)) = ''
              )
            ORDER BY CASE
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 2
                ELSE 3
            END, X.AutoID
        ) AS ResultCaption
        LEFT JOIN dbo.SY_FmatTbl AS ResultFormat
          ON ResultFormat.FormatID COLLATE DATABASE_DEFAULT =
             ResultCaption.FormatID COLLATE DATABASE_DEFAULT
        OUTER APPLY
        (
            SELECT TOP (1)
                X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn,
                X.DisplayColumn, X.ColumnArr, X.WidthArr, X.ParaRequireArr,
                X.IsMultiSelect, X.ReloadType, X.IsDisable
            FROM dbo.SY_FrmDrdwTbl AS X
            WHERE X.ColumnID COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
              AND X.FormID COLLATE DATABASE_DEFAULT IN (@ERPFormID, @WebFormName)
              AND ISNULL(X.IsDisable, 0) = 0
            ORDER BY CASE
                WHEN X.FormID COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
                ELSE 2
            END, X.UserAutoID
        ) AS ResultLookup
        OUTER APPLY
        (
            SELECT TOP (1)
                X.UserAutoID, X.KeyID, X.Caption, X.ControlWidth, X.[Type],
                X.ValueColumn, X.DisplayColumn, X.ColumnArr, X.WidthArr,
                X.RememberLastValue, X.UseLikeOperator, X.IsReload,
                X.Operator, X.DefaultValue
            FROM dbo.SY_FrmFltTbl AS X
            WHERE @FilterSourceFormID IS NOT NULL
              AND X.FormID COLLATE DATABASE_DEFAULT =
                  @FilterSourceFormID COLLATE DATABASE_DEFAULT
              AND X.ColumnID COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
              AND ISNULL(X.IsDisable, 0) = 0
            ORDER BY
                CASE WHEN TRY_CONVERT(int, X.KeyID) IS NULL THEN 1 ELSE 0 END,
                TRY_CONVERT(int, X.KeyID),
                X.KeyID,
                X.UserAutoID
        ) AS ResultFilter
            ORDER BY RF.FieldOrdinal;

            RETURN;
        END;
    END;

    /* PHASE3_UNIFIED_FIELD_CONTRACT: mỗi cột mới an toàn được phát hiện trực tiếp. */
    SELECT
        /* Phase 3 mở rộng form nhưng giữ nguyên wire contract đã công bố ở Phase 2. */
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        CAST('1.0' AS varchar(10)) AS CapabilityVersion,
        @WebFormName AS WebFormName,
        @ERPFormID AS ERPFormName,
        @ExpectedTable AS TableName,
        @ExpectedPrimaryKey AS PrimaryKey,
        @RegisteredView AS RegisteredViewProcedure,
        @RegisteredSave AS RegisteredSaveProcedure,
        @RegisteredDelete AS RegisteredDeleteProcedure,
        @ResolvedDeleteMode AS DeleteMode,
        CAST(CASE WHEN @ResultSetFallback = 1
            THEN 'TABLE_FALLBACK' ELSE 'MAIN_TABLE' END AS varchar(30)) AS SourceKind,
        C.column_id AS FieldOrdinal,
        CONVERT(varchar(128), C.name) AS FieldName,
        T.name + CASE
            WHEN T.name IN ('varchar', 'char', 'binary', 'varbinary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN T.name IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN T.name IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            WHEN T.name IN ('datetime2', 'datetimeoffset', 'time')
                THEN '(' + CONVERT(varchar(10), C.scale) + ')'
            ELSE '' END AS SqlType,
        C.is_nullable AS IsNullable,
        CONVERT(bit, 1) AS IsPhysicalColumn,
        Flags.IsPrimaryKey,
        CONVERT(bit, C.is_identity) AS IsIdentity,
        CONVERT(bit, C.is_computed) AS IsComputed,
        CONVERT(bit, CASE WHEN C.default_object_id <> 0 THEN 1 ELSE 0 END) AS HasDefault,
        C.max_length AS DbMaxLength,
        C.[precision] AS DbPrecision,
        C.scale AS DbScale,
        C.is_nullable AS DbIsNullable,
        Flags.IsServerManaged,
        Flags.IsDenied AS IsSensitiveOrDenied,
        CONVERT(bit, CASE
            WHEN Flags.CanInsert = 1 AND C.is_nullable = 0 AND C.default_object_id = 0 THEN 1 ELSE 0 END) AS IsRequiredOnInsert,
        Flags.CanQuery AS ShowInGrid,
        Flags.CanInsert AS ShowInAdd,
        CONVERT(bit, CASE WHEN Flags.CanUpdate = 1 OR Flags.IsPrimaryKey = 1 THEN 1 ELSE 0 END) AS ShowInEdit,
        CONVERT(bit, CASE
        WHEN Flags.CanQuery = 1 AND FilterCfg.UserAutoID IS NOT NULL THEN 1
        ELSE 0
        END) AS ShowInFilter,
        Flags.CanInsert AS SupportsInsert,
        Flags.CanUpdate AS SupportsUpdate,
        Flags.CanQuery AS SupportsFilter,
        Flags.CanQuery AS SupportsSort,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 AND T.name IN ('varchar', 'nvarchar', 'char', 'nchar') THEN 1 ELSE 0 END) AS SupportsKeyword,
        COALESCE(NULLIF(M.CaptionVN, N''), NULLIF(M.CaptionEN, N''), CONVERT(nvarchar(200), C.name)) AS Caption,
        M.FormatID,
        F.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN T.name = 'bit' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('D') THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('DT') THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('H') THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B') THEN 'money'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('Q') THEN 'decimal'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            WHEN T.name IN ('date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset') THEN 'date'
            WHEN T.name IN ('time') THEN 'time'
            WHEN T.name IN ('tinyint', 'smallint', 'int', 'bigint', 'decimal', 'numeric', 'money', 'smallmoney', 'float', 'real') THEN 'number'
            ELSE 'text'
        END AS RenderType,
        F.NumberDecimal,
        F.FormatString,
        F.MaskString,
        COALESCE(F.MaxLength, CASE
            WHEN T.name IN ('nvarchar', 'nchar') AND C.max_length > 0 THEN C.max_length / 2
            WHEN T.name IN ('varchar', 'char') AND C.max_length > 0 THEN C.max_length
            ELSE NULL END) AS MaxLength,
        F.MinValue,
        F.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), F.Align) AS Align,
        M.MinWidth,
        M.MaxWidth,
        CASE WHEN D.UserAutoID IS NULL THEN NULL ELSE
            CONVERT(varchar(64), HASHBYTES(
                'SHA2_256',
                UPPER(CONCAT(
                    LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                    '|',
                    LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
                ))
            ), 2)
        END AS LookupKey,
        D.[Type] AS LookupType,
        D.ValueColumn AS LookupValueColumn,
        D.DisplayColumn AS LookupDisplayColumn,
        D.ColumnArr AS LookupColumns,
        D.WidthArr AS LookupWidths,
        D.ParaRequireArr AS LookupDependsOn,
        CONVERT(bit, ISNULL(D.IsMultiSelect, 0)) AS LookupMultiSelect,
        D.ReloadType AS LookupReloadMode,
        CONVERT(bit, ISNULL(D.IsDisable, 0)) AS LookupDisabled,
         CONVERT(bit, CASE WHEN @FilterSourceFormID IS NULL THEN 0 ELSE 1 END) AS HasConfiguredFilters,
    @FilterSourceFormID AS FilterSourceFormID,
    FilterCfg.KeyID AS FilterKeyID,
    COALESCE(
        NULLIF(FilterCfg.Caption, N''),
        NULLIF(M.CaptionVN, N''),
        NULLIF(M.CaptionEN, N''),
        CONVERT(nvarchar(200), C.name)
    ) AS FilterCaption,
    FilterCfg.[Type] AS FilterControlType,
    FilterCfg.Operator AS FilterOperator,
    CONVERT(bit, ISNULL(FilterCfg.UseLikeOperator, 0)) AS FilterUseLikeOperator,
    FilterCfg.ControlWidth AS FilterControlWidth,
    FilterCfg.ValueColumn AS FilterValueColumn,
    FilterCfg.DisplayColumn AS FilterDisplayColumn,
    FilterCfg.ColumnArr AS FilterColumns,
    FilterCfg.WidthArr AS FilterWidths,
    CONVERT(bit, ISNULL(FilterCfg.RememberLastValue, 0)) AS FilterRememberLastValue,
    FilterCfg.DefaultValue AS FilterDefaultValue,
    CONVERT(bit, ISNULL(FilterCfg.IsReload, 0)) AS FilterReload,
        Mobile.MobileClass,
        Mobile.ReasonCodes AS MobileReasonCodes,
        CASE
            WHEN @ResultSetFallback = 1 THEN 'RESULTSET_FALLBACK_TO_TABLE'
            WHEN Flags.IsDenied = 1 THEN 'FIELD_DENIED'
            WHEN @RegisteredView COLLATE DATABASE_DEFAULT <> @ExpectedView COLLATE DATABASE_DEFAULT THEN 'SHADOW_VIEW_NOT_REGISTERED'
            WHEN @EnableSave = 1 AND @RegisteredSave COLLATE DATABASE_DEFAULT <> @ExpectedSave COLLATE DATABASE_DEFAULT THEN 'SHADOW_SAVE_NOT_REGISTERED'
            WHEN @EnableDelete = 1 AND @RegisteredDelete COLLATE DATABASE_DEFAULT <> @ExpectedDelete COLLATE DATABASE_DEFAULT THEN 'SHADOW_DELETE_NOT_REGISTERED'
            ELSE 'OK'
        END AS DiagnosticCode
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    OUTER APPLY (
        SELECT
            CONVERT(bit, CASE WHEN C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
            CONVERT(bit, CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN
                ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                 'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                 'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
                THEN 1 ELSE 0 END) AS IsServerManaged,
            CONVERT(bit, CASE
                WHEN T.is_user_defined = 1
                  OR T.is_assembly_type = 1
                  OR LOWER(T.name) COLLATE DATABASE_DEFAULT IN
                    ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                     'sql_variant', 'geography', 'geometry', 'hierarchyid')
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT IN
                    ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                     'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
                THEN 1 ELSE 0 END) AS IsDenied
    ) AS Base
    OUTER APPLY (
        SELECT
            Base.IsPrimaryKey,
            Base.IsServerManaged,
            Base.IsDenied,
            CONVERT(bit, CASE
                WHEN @EnableSave = 1 AND C.is_identity = 0 AND C.is_computed = 0
                 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanInsert,
            CONVERT(bit, CASE
                WHEN @EnableSave = 1 AND C.is_identity = 0 AND C.is_computed = 0
                 AND Base.IsPrimaryKey = 0 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanUpdate,
            CONVERT(bit, CASE
                WHEN @EnableView = 1 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanQuery
    ) AS Flags
    OUTER APPLY (
        SELECT TOP (1) X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE X.FieldName COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
          AND (
              X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT
              OR X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              OR X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = ''
          )
        ORDER BY CASE
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 2
            ELSE 3 END,
            X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS F
      ON F.FormatID COLLATE DATABASE_DEFAULT =
         M.FormatID COLLATE DATABASE_DEFAULT

    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID,
            X.FormID,
            X.ColumnID,
            X.[Type],
            X.ValueColumn,
            X.DisplayColumn,
            X.ColumnArr,
            X.WidthArr,
            X.ParaRequireArr,
            X.IsMultiSelect,
            X.ReloadType,
            X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE
            X.ColumnID COLLATE DATABASE_DEFAULT =
                C.name COLLATE DATABASE_DEFAULT
            AND X.FormID COLLATE DATABASE_DEFAULT
                IN (@ERPFormID, @WebFormName)
            AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY
            CASE
                WHEN X.FormID COLLATE DATABASE_DEFAULT =
                     @ERPFormID COLLATE DATABASE_DEFAULT
                THEN 1
                ELSE 2
            END,
            X.UserAutoID
    ) AS D

    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID,
            X.KeyID,
            X.Caption,
            X.ControlWidth,
            X.[Type],
            X.ValueColumn,
            X.DisplayColumn,
            X.ColumnArr,
            X.WidthArr,
            X.RememberLastValue,
            X.UseLikeOperator,
            X.IsReload,
            X.Operator,
            X.DefaultValue
        FROM dbo.SY_FrmFltTbl AS X
        WHERE
            @FilterSourceFormID IS NOT NULL
            AND X.FormID COLLATE DATABASE_DEFAULT =
                @FilterSourceFormID COLLATE DATABASE_DEFAULT
            AND X.ColumnID COLLATE DATABASE_DEFAULT =
                C.name COLLATE DATABASE_DEFAULT
            AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY
            CASE
                WHEN TRY_CONVERT(int, X.KeyID) IS NULL
                THEN 1
                ELSE 0
            END,
            TRY_CONVERT(int, X.KeyID),
            X.KeyID,
            X.UserAutoID
    ) AS FilterCfg

    OUTER APPLY
    (
        SELECT
            CASE
                WHEN Flags.IsDenied = 1
                  OR Flags.IsServerManaged = 1
                    THEN 'HIDDEN'

                WHEN
                    (
                        Flags.CanInsert = 1
                        AND C.is_nullable = 0
                        AND C.default_object_id = 0
                    )
                    OR Flags.IsPrimaryKey = 1
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%name'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%code'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%status%'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%effective%'
                    OR D.UserAutoID IS NOT NULL
                    THEN 'CORE'

                WHEN
                    C.is_computed = 1
                    OR
                    (
                        T.name IN ('varchar', 'nvarchar')
                        AND
                        (
                            C.max_length = -1
                            OR C.max_length > 1000
                        )
                    )
                    THEN 'ADVANCED'

                ELSE 'OPTIONAL'
            END AS MobileClass,

            NULLIF(
                STUFF(
                    CONCAT(
                        CASE
                            WHEN Flags.IsDenied = 1
                            THEN ';DENIED_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsServerManaged = 1
                            THEN ';SERVER_MANAGED'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsPrimaryKey = 1
                            THEN ';PRIMARY_KEY'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.CanInsert = 1
                             AND C.is_nullable = 0
                             AND C.default_object_id = 0
                            THEN ';REQUIRED_ON_INSERT'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%name'
                            THEN ';BUSINESS_NAME'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%code'
                            THEN ';BUSINESS_CODE'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%status%'
                            THEN ';STATUS_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%effective%'
                            THEN ';EFFECTIVE_DATE'
                            ELSE ''
                        END,

                        CASE
                            WHEN D.UserAutoID IS NOT NULL
                            THEN ';LOOKUP_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN C.is_computed = 1
                            THEN ';COMPUTED'
                            ELSE ''
                        END,

                        CASE
                            WHEN T.name IN ('varchar', 'nvarchar')
                             AND
                             (
                                 C.max_length = -1
                                 OR C.max_length > 1000
                             )
                            THEN ';LONG_TEXT'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsDenied = 0
                             AND Flags.IsServerManaged = 0
                             AND Flags.IsPrimaryKey = 0
                             AND NOT
                             (
                                 Flags.CanInsert = 1
                                 AND C.is_nullable = 0
                                 AND C.default_object_id = 0
                             )
                            THEN ';DEFAULT_OPTIONAL'
                            ELSE ''
                        END
                    ),
                    1,
                    1,
                    ''
                ),
                ''
            ) AS ReasonCodes
    ) AS Mobile

    WHERE C.object_id = @ObjectID
    ORDER BY C.column_id;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_JoinFieldSchemaV2; Input: sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_JoinFieldSchemaV2
    @WebFormName varchar(100),
    @DetailKey varchar(80),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @DetailKey = LTRIM(RTRIM(ISNULL(@DetailKey, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = '' OR @DetailKey = '' OR @UserName = ''
    BEGIN
        THROW 53401, N'PHASE4_JOIN_CONTEXT_REQUIRED', 1;
    END;

    DECLARE
        @ApiList varchar(100),
        @ExpectedProcedure sysname,
        @ExpectedSaveProcedure sysname,
        @ExpectedDeleteProcedure sysname,
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @PermissionFormName varchar(100),
        @ReadOnly bit,
        @RegistryCount int;

    SELECT
        @RegistryCount = COUNT(*),
        @ApiList = MIN(R.ApiList),
        @ExpectedProcedure = MIN(CONVERT(sysname, R.ExpectedProcedure)),
        @ExpectedSaveProcedure = MIN(CONVERT(sysname, R.ExpectedSaveProcedure)),
        @ExpectedDeleteProcedure = MIN(CONVERT(sysname, R.ExpectedDeleteProcedure)),
        @ExpectedTable = MIN(CONVERT(sysname, R.ExpectedTableName)),
        @ExpectedPrimaryKey = MIN(CONVERT(sysname, R.ExpectedPrimaryKey)),
        @PermissionFormName = MIN(R.PermissionFormName),
        @ReadOnly = CONVERT(bit, MIN(CONVERT(tinyint, R.IsReadOnly)))
    FROM dbo.API_Phase4JoinRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND R.DetailKey COLLATE DATABASE_DEFAULT = @DetailKey COLLATE DATABASE_DEFAULT
      AND R.EnableMetadata = 1;

    IF ISNULL(@RegistryCount, 0) <> 1
    BEGIN
        THROW 53402, N'PHASE4_JOIN_CONTRACT_NOT_ALLOWLISTED', 1;
    END;

    DECLARE
        @UserGroupID varchar(50),
        @UserBranches varchar(max);

    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        THROW 53403, N'PHASE4_JOIN_ACTOR_INVALID', 1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            THROW 53406, N'PHASE4_JOIN_BRANCH_REQUIRED', 1;
        END;

        IF EXISTS
        (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            THROW 53407, N'PHASE4_JOIN_BRANCH_DENIED', 1;
        END;
    END;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @WebFormName)));

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        THROW 53404, N'PHASE4_JOIN_ACTIVE_MENU_REQUIRED', 1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
       AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
        BEGIN
            THROW 53405, N'PHASE4_JOIN_PERMISSION_DENIED', 1;
        END;
    END;

    DECLARE
        @RouteCount int,
        @RegisteredProcedure sysname;

    SELECT
        @RouteCount = COUNT(*),
        @RegisteredProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR @RegisteredProcedure IS NULL
       OR @RegisteredProcedure COLLATE DATABASE_DEFAULT <> @ExpectedProcedure COLLATE DATABASE_DEFAULT
    BEGIN
        THROW 53408, N'PHASE4_JOIN_VIEW_ROUTE_INVALID', 1;
    END;

    DECLARE
        @SaveRouteCount int = 0,
        @DeleteRouteCount int = 0,
        @RegisteredSaveProcedure sysname = NULL,
        @RegisteredDeleteProcedure sysname = NULL;

    SELECT
        @SaveRouteCount = COUNT(*),
        @RegisteredSaveProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

    SELECT
        @DeleteRouteCount = COUNT(*),
        @RegisteredDeleteProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;

    IF @ReadOnly = 1
       AND (@SaveRouteCount > 0 OR @DeleteRouteCount > 0)
    BEGIN
        THROW 53410, N'PHASE4_JOIN_READONLY_MUTATION_ROUTE_FORBIDDEN', 1;
    END;

    IF @ReadOnly = 0
       AND (
            @ExpectedSaveProcedure IS NULL
            OR @ExpectedDeleteProcedure IS NULL
            OR @SaveRouteCount <> 1
            OR @DeleteRouteCount <> 1
            OR @RegisteredSaveProcedure COLLATE DATABASE_DEFAULT <> @ExpectedSaveProcedure COLLATE DATABASE_DEFAULT
            OR @RegisteredDeleteProcedure COLLATE DATABASE_DEFAULT <> @ExpectedDeleteProcedure COLLATE DATABASE_DEFAULT
       )
    BEGIN
        THROW 53411, N'PHASE4_JOIN_MUTATION_ROUTE_INVALID', 1;
    END;

    DECLARE @ProcedureObjectID int =
        COALESCE(OBJECT_ID(@ExpectedProcedure, N'P'), OBJECT_ID(N'dbo.' + @ExpectedProcedure, N'P'));

    IF @ProcedureObjectID IS NULL
    BEGIN
        THROW 53409, N'PHASE4_JOIN_PROCEDURE_NOT_FOUND', 1;
    END;

    DECLARE @TableObjectID int =
        COALESCE(OBJECT_ID(@ExpectedTable, N'U'), OBJECT_ID(N'dbo.' + @ExpectedTable, N'U'));

    IF @TableObjectID IS NULL
    BEGIN
        THROW 53410, N'PHASE4_JOIN_MAIN_TABLE_NOT_FOUND', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.columns AS C
        WHERE C.object_id = @TableObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53411, N'PHASE4_JOIN_PRIMARY_KEY_NOT_FOUND', 1;
    END;

    DECLARE @Fields TABLE
    (
        FieldOrdinal int NOT NULL,
        FieldName sysname NOT NULL,
        SqlType nvarchar(256) NULL,
        IsNullable bit NULL,
        MaxLength int NULL,
        SourceSchema sysname NULL,
        SourceTable sysname NULL,
        SourceColumn sysname NULL
    );

    BEGIN TRY
        IF EXISTS
        (
            SELECT 1
            FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 1) AS D
            WHERE D.error_number IS NOT NULL
        )
        BEGIN
            THROW 53412, N'PHASE4_JOIN_RESULTSET_METADATA_ERROR', 1;
        END;

        INSERT INTO @Fields
        (
            FieldOrdinal,
            FieldName,
            SqlType,
            IsNullable,
            MaxLength,
            SourceSchema,
            SourceTable,
            SourceColumn
        )
        SELECT
            D.column_ordinal,
            D.name,
            D.system_type_name,
            D.is_nullable,
            D.max_length,
            D.source_schema,
            D.source_table,
            D.source_column
        FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 1) AS D
        WHERE ISNULL(D.is_hidden, 0) = 0
          AND D.error_number IS NULL
          AND D.name IS NOT NULL
          AND LTRIM(RTRIM(D.name)) <> '';
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() BETWEEN 53400 AND 53499
        BEGIN
            THROW;
        END;

        THROW 53412, N'PHASE4_JOIN_RESULTSET_METADATA_ERROR', 1;
    END CATCH;

    IF NOT EXISTS (SELECT 1 FROM @Fields)
    BEGIN
        THROW 53413, N'PHASE4_JOIN_RESULTSET_EMPTY', 1;
    END;

    IF EXISTS
    (
        SELECT LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
        FROM @Fields AS F
        GROUP BY LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 53414, N'PHASE4_JOIN_DUPLICATE_FIELD', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE F.FieldName COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53415, N'PHASE4_JOIN_PRIMARY_KEY_NOT_IN_RESULT', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE LOWER(F.FieldName) COLLATE DATABASE_DEFAULT IN
        (
            '__proto__', 'prototype', 'constructor', 'content', 'base64content',
            'filecontent', 'binarydata', 'password', 'passwordhash', 'token',
            'refreshtoken', 'secret', 'rawsql', 'commandtext'
        )
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'binary%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'varbinary%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'image%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'rowversion%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'timestamp%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'xml%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'sql_variant%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'geography%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'geometry%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'hierarchyid%'
    )
    BEGIN
        THROW 53416, N'PHASE4_JOIN_UNSAFE_RESULT_FIELD', 1;
    END;

    SELECT
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        CAST('1.0' AS varchar(10)) AS ContractVersion,
        @WebFormName AS WebFormName,
        @DetailKey AS DetailKey,
        @ApiList AS ApiList,
        @ExpectedTable AS TableName,
        @ExpectedPrimaryKey AS PrimaryKey,
        @RegisteredProcedure AS RegisteredViewProcedure,
        @ExpectedSaveProcedure AS RegisteredSaveProcedure,
        @ExpectedDeleteProcedure AS RegisteredDeleteProcedure,
        CONVERT(bit, @ReadOnly) AS [ReadOnly],
        CAST('JOIN_RESULT_SET' AS varchar(40)) AS SourceKind,
        RF.FieldOrdinal,
        CONVERT(varchar(128), RF.FieldName) AS FieldName,
        RF.SqlType,
        RF.IsNullable,
        RF.SourceSchema,
        RF.SourceTable,
        RF.SourceColumn,
        CONVERT(bit, CASE WHEN C.column_id IS NULL THEN 0 ELSE 1 END) AS IsPhysicalColumn,
        CONVERT(bit, CASE WHEN RF.FieldName COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
        CONVERT(bit, CASE WHEN @ReadOnly = 1 OR C.column_id IS NULL THEN 1 ELSE 0 END) AS IsReadOnly,
        COALESCE(NULLIF(M.CaptionVN, N''), NULLIF(M.CaptionEN, N''), CONVERT(nvarchar(200), RF.FieldName)) AS Caption,
        M.FormatID,
        F.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE 'bit%' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'D' THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'DT' THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'H' THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B', 'Q', 'N', 'N0', 'N3') THEN 'number'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%date%' THEN 'date'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%time%' THEN 'time'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%int%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%decimal%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%numeric%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%money%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%float%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%real%' THEN 'number'
            ELSE 'text'
        END AS RenderType,
        F.NumberDecimal,
        F.FormatString,
        F.MaskString,
        COALESCE(F.MaxLength, RF.MaxLength) AS MaxLength,
        F.MinValue,
        F.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), F.Align) AS Align,
        M.MinWidth,
        M.MaxWidth,
        CASE
            WHEN D.UserAutoID IS NULL THEN NULL
            ELSE CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2)
        END AS LookupKey,
        D.[Type] AS LookupType,
        D.ValueColumn AS LookupValueColumn,
        D.DisplayColumn AS LookupDisplayColumn,
        D.ColumnArr AS LookupColumns,
        D.WidthArr AS LookupWidths,
        D.ParaRequireArr AS LookupDependsOn,
        CONVERT(bit, ISNULL(D.IsMultiSelect, 0)) AS LookupMultiSelect,
        D.ReloadType AS LookupReloadMode,
        CONVERT(bit, ISNULL(D.IsDisable, 0)) AS LookupDisabled,
        CAST(NULL AS varchar(80)) AS DiagnosticCode
    FROM @Fields AS RF
    LEFT JOIN sys.columns AS C
      ON C.object_id = @TableObjectID
     AND C.name COLLATE DATABASE_DEFAULT = COALESCE(NULLIF(RF.SourceColumn, ''), RF.FieldName) COLLATE DATABASE_DEFAULT
     AND (RF.SourceTable IS NULL OR RF.SourceTable COLLATE DATABASE_DEFAULT = @ExpectedTable COLLATE DATABASE_DEFAULT)
    OUTER APPLY
    (
        SELECT TOP (1) X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE X.FieldName COLLATE DATABASE_DEFAULT = RF.FieldName COLLATE DATABASE_DEFAULT
          AND (X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
               OR X.FormName COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
               OR X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '')
        ORDER BY CASE
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT THEN 2
            ELSE 3 END, X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS F
      ON F.FormatID COLLATE DATABASE_DEFAULT = M.FormatID COLLATE DATABASE_DEFAULT
    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn, X.DisplayColumn,
            X.ColumnArr, X.WidthArr, X.ParaRequireArr, X.IsMultiSelect, X.ReloadType, X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE X.ColumnID COLLATE DATABASE_DEFAULT = RF.FieldName COLLATE DATABASE_DEFAULT
          AND X.FormID COLLATE DATABASE_DEFAULT IN (@WebFormName, @ApiList)
          AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY CASE WHEN X.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1 ELSE 2 END, X.UserAutoID
    ) AS D
    ORDER BY RF.FieldOrdinal;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_LookupSchemaV2; Input: sql/FieldSyncPhase1/02_API_WEB_LOOKUP_SCHEMA_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_LookupSchemaV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @LookupKey varchar(64),
    @Keyword nvarchar(200) = NULL,
    @Page int = 1,
    @PageSize int = 30,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @Page = CASE WHEN ISNULL(@Page, 0) < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN ISNULL(@PageSize, 0) < 1 THEN 30 WHEN @PageSize > 100 THEN 100 ELSE @PageSize END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51101, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND NOT EXISTS (
            SELECT 1
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS P
              ON P.MenuID = M.MenuID AND P.UserGroupID = @UserGroupID
            WHERE M.FormName = @WebFormName
              AND ISNULL(M.isDisable, 0) = 0
              AND (ISNULL(M.isNotCheckPermission, 0) = 1 OR ISNULL(P.IsRun, 0) = 1)
       )
        THROW 51102, N'Không có quyền đọc lookup của form.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND LTRIM(RTRIM(ISNULL(@UserBranches, ''))) <> ''
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@BranchID, ''))) = ''
            THROW 51103, N'Thiếu ngữ cảnh chi nhánh.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                    WHERE LTRIM(RTRIM(Allowed.[value])) = LTRIM(RTRIM(Requested.[value]))
              )
        )
            THROW 51104, N'Chi nhánh nằm ngoài phạm vi được cấp.', 1;
    END;

    DECLARE
        @Source nvarchar(max),
        @LookupType varchar(10),
        @ValueColumn varchar(50),
        @DisplayColumn varchar(50),
        @ResolvedKey varchar(64);

    SELECT TOP (1)
        @Source = D.[Source],
        @LookupType = D.[Type],
        @ValueColumn = D.ValueColumn,
        @DisplayColumn = D.DisplayColumn,
        @ResolvedKey = CONVERT(varchar(64), HASHBYTES(
            'SHA2_256',
            UPPER(CONCAT(
                LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                '|',
                LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
            ))
        ), 2)
    FROM dbo.SY_FrmDrdwTbl AS D
    WHERE LOWER(LTRIM(RTRIM(ISNULL(D.FormID, '')))) IN (LOWER(@ERPFormID), LOWER(@WebFormName))
      AND ISNULL(D.IsDisable, 0) = 0
      AND (
          /* Key V2 ổn định, không phụ thuộc khóa ngẫu nhiên UserAutoID của metadata. */
          CONVERT(varchar(64), HASHBYTES(
              'SHA2_256',
              UPPER(CONCAT(
                  LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                  '|',
                  LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
              ))
          ), 2) = @LookupKey
          /* Tương thích trong thời gian cache/client còn giữ key V1. */
          OR CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2) = @LookupKey
          OR CONVERT(varchar(64), HASHBYTES('SHA2_256', UPPER(CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID))), 2) = @LookupKey
      )
    ORDER BY CASE WHEN LOWER(ISNULL(D.FormID, '')) = LOWER(@ERPFormID) THEN 1 ELSE 2 END, D.UserAutoID;

    IF @ResolvedKey IS NULL
    BEGIN
        SELECT
            'BLOCKED' AS LookupMode,
            CAST(1 AS bit) AS Blocked,
            'LOOKUP_KEY_NOT_FOUND' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    IF UPPER(ISNULL(@LookupType, '')) = 'VALUELIST'
    BEGIN
        DECLARE @Values table (Ordinal int IDENTITY(1, 1), Item nvarchar(500));
        DECLARE @Work nvarchar(max) = ISNULL(@Source, N''), @Separator int, @Item nvarchar(500);

        WHILE LEN(@Work) > 0 AND (SELECT COUNT(*) FROM @Values) < 500
        BEGIN
            SET @Separator = CHARINDEX(';', @Work);
            IF @Separator = 0
            BEGIN
                SET @Item = LTRIM(RTRIM(@Work));
                SET @Work = N'';
            END
            ELSE
            BEGIN
                SET @Item = LTRIM(RTRIM(LEFT(@Work, @Separator - 1)));
                SET @Work = SUBSTRING(@Work, @Separator + 1, LEN(@Work));
            END;
            IF @Item <> N'' INSERT INTO @Values(Item) VALUES (@Item);
        END;

        SELECT
            'VALUE_LIST' AS LookupMode,
            CAST(0 AS bit) AS Blocked,
            'OK' AS DiagnosticCode,
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN LEFT(V.Item, CHARINDEX('|', V.Item) - 1) ELSE V.Item END AS [Value],
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN SUBSTRING(V.Item, CHARINDEX('|', V.Item) + 1, LEN(V.Item)) ELSE V.Item END AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn
        FROM @Values AS V
        WHERE @Keyword = N'' OR V.Item LIKE N'%' + @Keyword + N'%'
        ORDER BY V.Ordinal
        OFFSET ((@Page - 1) * @PageSize) ROWS FETCH NEXT @PageSize ROWS ONLY;
        RETURN;
    END;

    DECLARE @RegisteredList varchar(50);
    SELECT @RegisteredList = MIN(A.[list])
    FROM dbo.WA_API AS A
    WHERE LOWER(LTRIM(RTRIM(A.[func]))) = 'view'
      AND LOWER(LTRIM(RTRIM(A.[list]))) = LOWER(LTRIM(RTRIM(@Source)))
    GROUP BY A.[list]
    HAVING COUNT(*) = 1;

    IF @RegisteredList IS NOT NULL
    BEGIN
        SELECT
            'REGISTERED_API' AS LookupMode,
            CAST(0 AS bit) AS Blocked,
            'OK' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            @RegisteredList AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    SELECT
        'BLOCKED' AS LookupMode,
        CAST(1 AS bit) AS Blocked,
        'LOOKUP_SOURCE_NOT_REGISTERED' AS DiagnosticCode,
        CAST(NULL AS nvarchar(500)) AS [Value],
        CAST(NULL AS nvarchar(500)) AS Display,
        CAST(NULL AS varchar(50)) AS RegisteredList,
        @ValueColumn AS ValueColumn,
        @DisplayColumn AS DisplayColumn;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_RollbackFieldContractV2; Input: sql/UnifiedContractRollout/12_ROLLBACK_MASS_ROLLOUT.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_RollbackFieldContractV2
    @WebFormName varchar(100) = NULL,
    @BatchID uniqueidentifier = NULL,
    @TargetStatus varchar(20) = 'SHADOW',
    @UserName varchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = NULLIF(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), '');
    SET @TargetStatus = UPPER(LTRIM(RTRIM(ISNULL(@TargetStatus, 'SHADOW'))));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));

    IF @UserName = '' THROW 54500, N'FIELD_CONTRACT_ROLLBACK_ACTOR_REQUIRED', 1;
    IF @TargetStatus NOT IN ('SHADOW', 'DISABLED')
        THROW 54501, N'FIELD_CONTRACT_ROLLBACK_STATUS_INVALID', 1;
    IF @WebFormName IS NULL AND @BatchID IS NULL
        THROW 54502, N'FIELD_CONTRACT_ROLLBACK_SCOPE_REQUIRED', 1;

    IF @BatchID IS NULL
    BEGIN
        SELECT TOP (1) @BatchID = B.BackupBatchID
        FROM dbo.WA_FieldContractRouteBackup AS B
        WHERE B.WebFormName = @WebFormName
          AND B.RestoredAt IS NULL
        ORDER BY B.BackupTime DESC, B.BackupID DESC;
    END;

    IF @BatchID IS NULL
        THROW 54503, N'FIELD_CONTRACT_ROLLBACK_SNAPSHOT_NOT_FOUND', 1;

    DECLARE @Restore table
    (
        BackupID bigint PRIMARY KEY,
        WebFormName varchar(100),
        ApiList varchar(100),
        Func varchar(20),
        RouteExisted bit,
        [SQL] nvarchar(max),
        Para nvarchar(max)
    );

    INSERT INTO @Restore
    SELECT
        B.BackupID, B.WebFormName, B.ApiList, B.Func,
        B.RouteExisted, B.[SQL], B.Para
    FROM dbo.WA_FieldContractRouteBackup AS B
    WHERE B.BackupBatchID = @BatchID
      AND B.RestoredAt IS NULL
      AND (@WebFormName IS NULL OR B.WebFormName = @WebFormName);

    IF NOT EXISTS (SELECT 1 FROM @Restore)
        THROW 54504, N'FIELD_CONTRACT_ROLLBACK_SNAPSHOT_ALREADY_RESTORED_OR_EMPTY', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Restore AS R
        INNER JOIN dbo.WA_API AS A
          ON A.[list] = R.ApiList AND A.[func] = R.Func
        GROUP BY R.ApiList, R.Func
        HAVING COUNT(*) > 1
    )
        THROW 54505, N'FIELD_CONTRACT_ROLLBACK_ROUTE_DUPLICATE', 1;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE
            @BackupID bigint,
            @OwnerForm varchar(100),
            @ApiList varchar(100),
            @Func varchar(20),
            @RouteExisted bit,
            @Sql nvarchar(max),
            @Para nvarchar(max),
            @RouteCount int;

        DECLARE RestoreCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT BackupID, WebFormName, ApiList, Func, RouteExisted, [SQL], Para
            FROM @Restore
            ORDER BY BackupID DESC;

        OPEN RestoreCursor;
        FETCH NEXT FROM RestoreCursor INTO
            @BackupID, @OwnerForm, @ApiList, @Func, @RouteExisted, @Sql, @Para;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT @RouteCount = COUNT(*)
            FROM dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
            WHERE [list] = @ApiList AND [func] = @Func;

            IF @RouteCount > 1
                THROW 54505, N'FIELD_CONTRACT_ROLLBACK_ROUTE_DUPLICATE', 1;

            IF @RouteExisted = 1
            BEGIN
                IF @RouteCount = 1
                    UPDATE dbo.WA_API
                    SET [SQL] = @Sql, Para = @Para
                    WHERE [list] = @ApiList AND [func] = @Func;
                ELSE
                    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
                    VALUES (@ApiList, @Func, @Sql, @Para);
            END
            ELSE IF @RouteCount = 1
                DELETE FROM dbo.WA_API
                WHERE [list] = @ApiList AND [func] = @Func;

            UPDATE dbo.WA_FieldContractRouteBackup
            SET RestoredAt = SYSUTCDATETIME(),
                RestoredBy = @UserName
            WHERE BackupID = @BackupID;

            FETCH NEXT FROM RestoreCursor INTO
                @BackupID, @OwnerForm, @ApiList, @Func, @RouteExisted, @Sql, @Para;
        END;

        CLOSE RestoreCursor;
        DEALLOCATE RestoreCursor;

        UPDATE R
        SET RolloutStatus = @TargetStatus,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName,
            RolloutReason = CONCAT(N'ROLLED_BACK_BATCH_', CONVERT(varchar(36), @BatchID))
        FROM dbo.WA_FieldContractRegistry AS R
        WHERE EXISTS
        (
            SELECT 1 FROM @Restore AS X
            WHERE X.WebFormName = R.WebFormName
        );

        UPDATE D
        SET RolloutStatus = @TargetStatus,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName,
            RolloutReason = CONCAT(N'ROLLED_BACK_BATCH_', CONVERT(varchar(36), @BatchID))
        FROM dbo.WA_FieldDatasetRegistry AS D
        WHERE EXISTS
        (
            SELECT 1 FROM @Restore AS X
            WHERE X.WebFormName = D.WebFormName
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'RestoreCursor') >= 0 CLOSE RestoreCursor;
        IF CURSOR_STATUS('local', 'RestoreCursor') >= -1 DEALLOCATE RestoreCursor;
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT
        @BatchID AS BackupBatchID,
        @TargetStatus AS RolloutStatusAfterRollback,
        R.WebFormName,
        R.ApiList,
        R.Func,
        R.RouteExisted
    FROM @Restore AS R
    ORDER BY R.BackupID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_SeedSafeFieldContractsV2; Input: sql/UnifiedContractRollout/03_CREATE_DISCOVERY_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_SeedSafeFieldContractsV2
    @UserName varchar(100) = 'SYSTEM_DISCOVERY'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
        THROW 54101, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;

    DECLARE @Candidates table
    (
        WebFormName varchar(100) NOT NULL,
        ERPFormID varchar(100) NULL,
        CurrentViewProcedure sysname NULL,
        CurrentSaveProcedure sysname NULL,
        CurrentDeleteProcedure sysname NULL,
        TableName sysname NULL,
        PrimaryKey sysname NULL,
        ViewRouteCount int NOT NULL,
        SaveRouteCount int NOT NULL,
        DeleteRouteCount int NOT NULL,
        FormRegistrationCount int NOT NULL,
        TableExists bit NOT NULL,
        PrimaryKeyExists bit NOT NULL,
        PrimaryKeyUnique bit NOT NULL,
        ResultSetDescribable bit NOT NULL,
        PhysicalFieldCount int NOT NULL,
        JoinFieldCount int NOT NULL,
        HasBranchScope bit NOT NULL,
        CurrentMutationType varchar(40) NOT NULL,
        SuggestedContractType varchar(40) NOT NULL,
        SuggestedRolloutStatus varchar(20) NOT NULL,
        BlockingReason nvarchar(500) NULL
    );

    INSERT INTO @Candidates
        EXEC dbo.API_Web_DiscoverFieldContractCandidatesV2;

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        SELECT
            C.WebFormName,
            COALESCE(C.ERPFormID, 'ERP_FORM_ALIAS_REQUIRES_REVIEW'),
            C.WebFormName,
            C.SuggestedContractType,
            C.TableName,
            C.PrimaryKey,
            C.WebFormName,
            CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY'
                THEN 'READ_ONLY' ELSE 'SAFE_TABLE_COLUMNS' END,
            CASE WHEN C.HasBranchScope = 1 THEN 'BRANCH_SCOPED' ELSE 'GLOBAL_REFERENCE' END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY' THEN 'NONE' ELSE 'AUTO_SCHEMA' END,
            C.SuggestedRolloutStatus,
            C.BlockingReason,
            2,
            1,
            SYSUTCDATETIME(),
            @UserName,
            SYSUTCDATETIME(),
            @UserName
        FROM @Candidates AS C
        WHERE NOT EXISTS
          (
              SELECT 1
              FROM dbo.WA_FieldContractRegistry AS R
              WHERE R.WebFormName = C.WebFormName
          );

        /*
          Chỉ làm mới bản ghi vẫn hoàn toàn do discovery sở hữu. Kết quả được
          tính lại từ schema và route hiện tại nên contract cũ từng DEFERRED hoặc
          BLOCKED có thể chuyển sang SHADOW sau khi nguyên nhân đã được xử lý.
          Bản ghi do quản trị viên sửa thủ công vẫn không bị ghi đè.
        */
        UPDATE R
        SET ContractType = C.SuggestedContractType,
            ExpectedTableName = C.TableName,
            ExpectedPrimaryKey = C.PrimaryKey,
            ViewProcedure = CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            SaveProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            DeleteProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            RolloutStatus = C.SuggestedRolloutStatus,
            RolloutReason = C.BlockingReason,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldContractRegistry AS R
        INNER JOIN @Candidates AS C
          ON C.WebFormName = R.WebFormName
        WHERE R.CreatedBy = 'SYSTEM_DISCOVERY'
          AND R.UpdatedBy IN ('SYSTEM_DISCOVERY', @UserName);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT ContractType, RolloutStatus, COUNT(*) AS FormCount
    FROM dbo.WA_FieldContractRegistry
    GROUP BY ContractType, RolloutStatus
    ORDER BY ContractType, RolloutStatus;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_UpdateFieldFormat; Input: sql/FieldSyncPhase1/02_CREATE_UPDATE_FIELD_FORMAT_PROC.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_UpdateFieldFormat
    @WebFormName varchar(100) = NULL,
    @FieldName varchar(128),
    @CaptionVN nvarchar(250) = NULL,
    @CaptionEN nvarchar(250) = NULL,
    @CaptionCH nvarchar(250) = NULL,
    @FormatID varchar(50) = NULL,
    @AlignX varchar(10) = NULL,
    @MinWidth int = 0,
    @MaxWidth int = 0,
    @UserName varchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        SET @WebFormName = LEFT(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), 100);
        SET @FieldName = LEFT(LTRIM(RTRIM(ISNULL(@FieldName, ''))), 128);
        SET @CaptionVN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionVN, ''))), 250);
        SET @CaptionEN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionEN, ''))), 250);
        SET @CaptionCH = LEFT(LTRIM(RTRIM(ISNULL(@CaptionCH, ''))), 250);
        SET @FormatID = LEFT(LTRIM(RTRIM(ISNULL(@FormatID, ''))), 50);

        -- Chuẩn hóa AlignX về dạng R / L / C hoặc cắt max 10 ký tự
        DECLARE @RawAlign varchar(10) = LTRIM(RTRIM(ISNULL(@AlignX, '')));
        IF LOWER(@RawAlign) IN ('right', 'r', 'phải') SET @AlignX = 'R';
        ELSE IF LOWER(@RawAlign) IN ('left', 'l', 'trái') SET @AlignX = 'L';
        ELSE IF LOWER(@RawAlign) IN ('center', 'c', 'giữa') SET @AlignX = 'C';
        ELSE SET @AlignX = LEFT(@RawAlign, 10);

        SET @MinWidth = ISNULL(@MinWidth, 0);
        SET @MaxWidth = ISNULL(@MaxWidth, 0);

        IF @FieldName = ''
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'Tên trường (FieldName) không được để trống.' AS Message;
            RETURN;
        END;

        -- 1. Ưu tiên UPDATE nếu tồn tại bản ghi khớp cả FormName lẫn FieldName
        IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName)
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName);
        END
        -- 2. Ngược lại UPDATE nếu tồn tại bản ghi chung (FormName IS NULL hoặc rỗng)
        ELSE IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '')
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '');
        END
        -- 3. Cập nhật bất kỳ bản ghi nào theo FieldName
        ELSE IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName);
        END
        -- 4. Nếu chưa từng có, INSERT bản ghi mới
        ELSE
        BEGIN
            INSERT INTO dbo.SY_FmtFldTbl (
                FormName, FieldName, CaptionVN, CaptionEN, CaptionCH, FormatID, AlignX, MinWidth, MaxWidth
            )
            VALUES (
                NULLIF(@WebFormName, ''), @FieldName, @CaptionVN, @CaptionEN, @CaptionCH, @FormatID, @AlignX, @MinWidth, @MaxWidth
            );
        END;

        SELECT
            CAST(1 AS bit) AS Success,
            N'Đã cập nhật tiêu đề và định dạng cột thành công.' AS Message,
            @FieldName AS FieldName,
            @CaptionVN AS CaptionVN,
            @CaptionEN AS CaptionEN,
            @CaptionCH AS CaptionCH,
            @FormatID AS FormatID,
            @AlignX AS AlignX,
            @MinWidth AS MinWidth,
            @MaxWidth AS MaxWidth;
    END TRY
    BEGIN CATCH
        SELECT
            CAST(0 AS bit) AS Success,
            ERROR_MESSAGE() AS Message,
            @FieldName AS FieldName;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_XoaDong_V2; Input: sql/UnifiedContractRollout/09_UPDATE_DELETE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_XoaDong_V2
    @List varchar(50),
    @Ids nvarchar(max) = N'',
    @UserName varchar(100) = '',
    @Data nvarchar(max) = N'',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @RowsAffected int = 0;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Ids = LTRIM(RTRIM(ISNULL(@Ids, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedTable sysname,
        @PrimaryKey sysname,
        @ExpectedDelete sysname,
        @DeletePolicy varchar(40),
        @EnableDelete bit,

        @PermissionFormName varchar(100),

        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @PrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedDelete = R.DeleteV2,
        @DeletePolicy = R.DeletePolicy,
        @EnableDelete = R.EnableDelete,

        @PermissionFormName = R.PermissionFormName,

        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy

    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    SET @PermissionFormName = LTRIM(RTRIM(ISNULL(@PermissionFormName, @List)));

    IF @ExpectedTable IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_DELETE' AS msg, 0 AS rowsAffected,
               CAST('BLOCKED' AS varchar(20)) AS deleteMode;
        RETURN;
    END;

    IF @EnableDelete <> 1
       OR @DeletePolicy COLLATE DATABASE_DEFAULT <> 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_BLOCKED_BY_POLICY' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF @ExpectedDelete COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
       OR @UserName = ''
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_CONTRACT_OR_ACTOR_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF @Data = N'' SET @Data = N'{}';
    IF ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_JSON_OBJECT_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF DATALENGTH(@Ids) > 4000
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_IDS_TOO_LONG' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF ISJSON(@Ids) <> 1 OR LEFT(@Ids, 1) <> N'['
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_IDS_JSON_ARRAY_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @RouteCount int;
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT
      AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT = @ExpectedDelete COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ROUTE_NOT_UNIQUE' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @RegisteredTable sysname, @RegisteredPrimaryKey sysname, @RegistrationCount int;
    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL OR NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_OR_PRIMARY_KEY_NOT_FOUND' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID AND I.is_unique = 1 AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1 AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE
        @IsDeletedColumn sysname,
        @IsDeletedType sysname,
        @IsDeletedIsComputed bit,
        @DeletedByColumn sysname,
        @DeletedDateColumn sysname,
        @DeleteMode varchar(20);

    SELECT TOP (1)
        @IsDeletedColumn = C.name,
        @IsDeletedType = T.name,
        @IsDeletedIsComputed = C.is_computed
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT;

    IF @IsDeletedColumn IS NOT NULL
       AND (
            LOWER(ISNULL(@IsDeletedType, '')) COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
            OR ISNULL(@IsDeletedIsComputed, 0) = 1
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_INVALID_ISDELETED_TYPE' AS msg, 0 AS rowsAffected,
               CAST('INVALID_ISDELETED_TYPE' AS varchar(40)) AS deleteMode;
        RETURN;
    END;

    SET @DeleteMode = CASE WHEN @IsDeletedColumn IS NULL THEN 'HARD' ELSE 'SOFT' END;

    IF @GlobalReferenceOnly = 1 AND @BranchColumn IS NOT NULL
       AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @DataActor varchar(100), @DataBranch nvarchar(max);
    SELECT TOP (1) @DataActor = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'username' COLLATE DATABASE_DEFAULT;
    SELECT TOP (1) @DataBranch = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT;

    IF @DataActor IS NOT NULL AND @DataActor COLLATE DATABASE_DEFAULT <> @UserName COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_SPOOF_REJECTED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1 FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('username', 'branchid', 'ids')
          AND LOWER(J.[key]) COLLATE DATABASE_DEFAULT <> LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_UNKNOWN_JSON_FIELD' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_INVALID_OR_DISABLED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_REQUIRED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_DENIED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
    END;

    IF @DataBranch IS NOT NULL AND @BranchID <> '' AND EXISTS (
        SELECT 1 FROM STRING_SPLIT(@DataBranch, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
              WHERE LTRIM(RTRIM(ContextBranch.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_JSON_BRANCH_CONTEXT_DENIED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0,
        @GroupCanDelete bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView,
        @GroupCanDelete = P.CanDelete
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
           OR ISNULL(@GroupCanDelete, 0) <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_DELETE_PERMISSION_DENIED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
    END;

    DECLARE @RequestedCount int = (SELECT COUNT(*) FROM OPENJSON(@Ids));
    IF @RequestedCount = 0 OR @RequestedCount > 100
       OR EXISTS (
           SELECT 1
           FROM OPENJSON(@Ids) AS J
           WHERE J.[type] NOT IN (1, 2, 3)
              OR LTRIM(RTRIM(CONVERT(nvarchar(4000), J.[value]))) = N''
       )
       OR EXISTS (
           SELECT CONVERT(nvarchar(4000), J.[value]) COLLATE DATABASE_DEFAULT
           FROM OPENJSON(@Ids) AS J
           GROUP BY CONVERT(nvarchar(4000), J.[value]) COLLATE DATABASE_DEFAULT
           HAVING COUNT(*) > 1
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ID_COUNT_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    CREATE TABLE #DeleteIds
    (
        IdValue nvarchar(4000) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY
    );
    INSERT INTO #DeleteIds (IdValue)
    SELECT CONVERT(nvarchar(4000), J.[value])
    FROM OPENJSON(@Ids) AS J;

    DECLARE @PrimarySqlType nvarchar(256), @PrimaryKeyHasCollation bit = 0;
    SELECT
        @PrimarySqlType = T.name + CASE
        WHEN T.name IN ('varchar', 'char') THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
        WHEN T.name IN ('nvarchar', 'nchar') THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
        WHEN T.name IN ('decimal', 'numeric') THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
        ELSE '' END,
        @PrimaryKeyHasCollation = CONVERT(bit, CASE WHEN C.collation_name IS NULL THEN 0 ELSE 1 END)
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT;

    DECLARE @InvalidCount int = 0, @Sql nvarchar(max);
    SET @Sql = N'SELECT @Bad = COUNT(*) FROM #DeleteIds WHERE TRY_CONVERT(' + @PrimarySqlType + N', IdValue) IS NULL;';
    EXEC sys.sp_executesql @Sql, N'@Bad int OUTPUT', @Bad = @InvalidCount OUTPUT;
    IF @InvalidCount > 0
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ID_TYPE_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    SELECT TOP (1) @DeletedByColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('deletedby', 'userdelete', 'deleteby')
    ORDER BY C.column_id;
    SELECT TOP (1) @DeletedDateColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('deleteddate', 'deletedat', 'datedelete')
    ORDER BY C.column_id;

    DECLARE @UpdateSet nvarchar(max) = N'';
    IF @DeleteMode = 'SOFT'
    BEGIN
        SET @UpdateSet = N'T.' + QUOTENAME(@IsDeletedColumn) + N' = 1';
        IF @DeletedByColumn IS NOT NULL
            SET @UpdateSet += N', T.' + QUOTENAME(@DeletedByColumn) + N' = @Actor';
        IF @DeletedDateColumn IS NOT NULL
            SET @UpdateSet += N', T.' + QUOTENAME(@DeletedDateColumn) + N' = SYSUTCDATETIME()';
    END;

    DECLARE @BranchScopePredicate nvarchar(2000) = N'';
    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchScopePredicate = N'
                AND (
                    LOWER(@UserGroupID) = ''admin''
                    OR EXISTS (
                        SELECT 1 FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                        WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                          AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                              = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
                    )
                )';

    BEGIN TRY
        BEGIN TRANSACTION;
        IF @DeleteMode = 'SOFT'
        BEGIN
            SET @Sql = N'
                UPDATE T SET ' + @UpdateSet + N'
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey)
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue)'
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END + N'
                WHERE ISNULL(T.' + QUOTENAME(@IsDeletedColumn) + N', 0) = 0'
                  + @BranchScopePredicate + N';
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@Actor varchar(100), @OutRows int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
                @Actor = @UserName,
                @OutRows = @RowsAffected OUTPUT,
                @BranchID = @BranchID,
                @UserGroupID = @UserGroupID;
        END
        ELSE
        BEGIN
            SET @Sql = N'
                DELETE T
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey)
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue)'
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' WHERE 1 = 1' + @BranchScopePredicate + N';
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@OutRows int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
                @OutRows = @RowsAffected OUTPUT,
                @BranchID = @BranchID,
                @UserGroupID = @UserGroupID;
        END;

        IF @RowsAffected <> @RequestedCount
        BEGIN
            IF @DeleteMode = 'SOFT'
                THROW 53420, N'PHASE3_SOFT_DELETE_MUST_AFFECT_ALL_REQUESTED_ROWS', 1;
            THROW 53421, N'PHASE3_HARD_DELETE_MUST_AFFECT_ALL_REQUESTED_ROWS', 1;
        END;

        COMMIT TRANSACTION;
        SELECT
            0 AS code,
            CASE WHEN @DeleteMode = 'SOFT' THEN N'Xóa mềm V2 thành công.'
                 ELSE N'Xóa cứng V2 thành công.' END AS msg,
            @RowsAffected AS rowsAffected,
            @DeleteMode AS deleteMode;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SELECT
            -1 AS code,
            N'PHASE3_' + @DeleteMode + N'_DELETE_FAILED_' + CONVERT(nvarchar(20), ERROR_NUMBER()) AS msg,
            0 AS rowsAffected,
            @DeleteMode AS deleteMode;
    END CATCH;
END;
GO
