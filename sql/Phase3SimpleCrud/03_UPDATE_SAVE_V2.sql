/*
  Phase 3 - API_LuuDong_V2 fail-closed cho allow-list CRUD một bảng.
  Không nhận TableName từ client, không đọc layout field legacy, không DDL runtime.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53300, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_LuuDong_V2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_LuuDong_V2
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

        @GlobalReferenceOnly bit;

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
            R.GlobalReferenceOnly

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

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
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

    DECLARE @IsEdit bit = 0;
    SELECT TOP (1) @IsEdit = ISNULL(TRY_CONVERT(bit, J.[value]), 0)
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'isedit' COLLATE DATABASE_DEFAULT;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1) @MenuID = M.MenuID, @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName COLLATE DATABASE_DEFAULT =
      @PermissionFormName COLLATE DATABASE_DEFAULT
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupAllowed bit, @UserAllowed bit, @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupAllowed = CASE WHEN @IsEdit = 1 THEN P.IsUpdate ELSE P.IsAdd END, @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID COLLATE DATABASE_DEFAULT = @UserGroupID COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;
        SELECT @UserAllowed = CASE WHEN @IsEdit = 1 THEN P.IsUpdate ELSE P.IsAdd END, @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;

        IF COALESCE(@UserCanRun, @GroupCanRun, 0) <> 1 OR COALESCE(@UserAllowed, @GroupAllowed, 0) <> 1
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
        SET @ExistsSql = N'SELECT @RowExists = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable)
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal;';
        DECLARE @RowExists int = 0;
        EXEC sp_executesql @ExistsSql, N'@PkVal nvarchar(4000), @RowExists int OUTPUT',
             @PkVal = @PrimaryValue, @RowExists = @RowExists OUTPUT;

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
        SET @UpdateSql = N'UPDATE dbo.' + QUOTENAME(@ExpectedTable)
                       + N' SET ' + @UpdateAssignments
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal;';

        EXEC sp_executesql @UpdateSql, N'@PkVal nvarchar(4000)', @PkVal = @PrimaryValue;
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

        IF @InsertCols = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_INSERT_NO_WRITABLE_FIELDS' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @InsertSql nvarchar(max);
        SET @InsertSql = N'INSERT INTO dbo.' + QUOTENAME(@ExpectedTable)
                       + N' (' + @InsertCols + N') VALUES (' + @InsertVals + N');';

        EXEC sp_executesql @InsertSql;
        SET @RowsAffected = @@ROWCOUNT;

        IF @PrimaryValue IS NULL
        BEGIN
            IF EXISTS (
                SELECT 1 FROM sys.columns AS C
                WHERE C.object_id = @ObjectID
                  AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
                  AND C.is_identity = 1
            )
            BEGIN
                SET @PrimaryValue = CONVERT(nvarchar(4000), SCOPE_IDENTITY());
            END;
        END;
    END;

    SELECT 1 AS code, N'SUCCESS' AS msg,
           @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, @RowsAffected AS rowsAffected;
END;
GO
