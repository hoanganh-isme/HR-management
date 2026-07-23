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
        @ExpectedSave sysname,
        @GlobalReferenceOnly bit;

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @PrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedSave = R.SaveV2,
        @GlobalReferenceOnly = R.GlobalReferenceOnly
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableSave = 1;

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

    IF @DataBranch IS NOT NULL AND (
        (@BranchID = '' AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT)
        OR (@BranchID <> '' AND EXISTS (
            SELECT 1 FROM STRING_SPLIT(@DataBranch, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
                  WHERE LTRIM(RTRIM(ContextBranch.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        ))
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
    WHERE M.FormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
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
        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
           OR ISNULL(@UserAllowed, ISNULL(@GroupAllowed, 0)) <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_SAVE_PERMISSION_DENIED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    DECLARE @Columns table
    (
        ColumnID int NOT NULL,
        ColumnName sysname NOT NULL PRIMARY KEY,
        SqlType nvarchar(256) NOT NULL,
        IsPrimaryKey bit NOT NULL,
        IsIdentity bit NOT NULL,
        IsComputed bit NOT NULL,
        HasDefault bit NOT NULL,
        IsNullable bit NOT NULL,
        IsServerManaged bit NOT NULL,
        IsDenied bit NOT NULL,
        JsonPresent bit NOT NULL
    );

    INSERT INTO @Columns
        (ColumnID, ColumnName, SqlType, IsPrimaryKey, IsIdentity, IsComputed,
         HasDefault, IsNullable, IsServerManaged, IsDenied, JsonPresent)
    SELECT
        C.column_id,
        C.name,
        T.name + CASE
            WHEN T.name IN ('varchar', 'char', 'binary', 'varbinary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN T.name IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN T.name IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            WHEN T.name IN ('datetime2', 'datetimeoffset', 'time')
                THEN '(' + CONVERT(varchar(10), C.scale) + ')'
            ELSE '' END,
        CONVERT(bit, CASE WHEN C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END),
        CONVERT(bit, C.is_identity),
        CONVERT(bit, C.is_computed),
        CONVERT(bit, CASE WHEN C.default_object_id <> 0 THEN 1 ELSE 0 END),
        CONVERT(bit, C.is_nullable),
        CONVERT(bit, CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN
            ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
             'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
             'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
            THEN 1 ELSE 0 END),
        CONVERT(bit, CASE
            WHEN T.is_user_defined = 1
              OR T.is_assembly_type = 1
              OR LOWER(T.name) COLLATE DATABASE_DEFAULT IN
                ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                 'sql_variant', 'geography', 'geometry', 'hierarchyid')
              OR LOWER(C.name) COLLATE DATABASE_DEFAULT IN
                ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                 'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
            THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN EXISTS (
            SELECT 1 FROM OPENJSON(@Data) AS J
            WHERE J.[key] COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
        ) THEN 1 ELSE 0 END)
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID;

    /* Unknown, denied và audit spoof đều bị từ chối thay vì bỏ qua im lặng. */
    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('isedit', 'id', 'username', 'branchid')
          AND NOT EXISTS (
              SELECT 1 FROM @Columns AS C
              WHERE C.ColumnName COLLATE DATABASE_DEFAULT = J.[key] COLLATE DATABASE_DEFAULT
                AND (C.IsIdentity = 0 OR (@IsEdit = 1 AND C.IsPrimaryKey = 1))
                AND C.IsComputed = 0
                AND C.IsServerManaged = 0 AND C.IsDenied = 0
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_UNKNOWN_DENIED_OR_SERVER_FIELD' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @IsEdit = 0 AND EXISTS (
        SELECT 1 FROM @Columns AS C
        WHERE C.IsIdentity = 0 AND C.IsComputed = 0 AND C.IsServerManaged = 0 AND C.IsDenied = 0
          AND C.IsNullable = 0 AND C.HasDefault = 0
          AND (C.JsonPresent = 0 OR EXISTS (
              SELECT 1 FROM OPENJSON(@Data) AS J
              WHERE J.[key] COLLATE DATABASE_DEFAULT = C.ColumnName COLLATE DATABASE_DEFAULT
                AND (J.[type] = 0 OR (J.[type] = 1 AND LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))) = N''))
          ))
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_REQUIRED_FIELD_MISSING' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @IsEdit = 1 AND NOT EXISTS (
        SELECT 1 FROM OPENJSON(@Data) AS J
        WHERE J.[key] COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
          AND J.[type] <> 0
          AND LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))) <> N''
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_PRIMARY_KEY_REQUIRED_FOR_UPDATE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE
        @ColumnList nvarchar(max) = N'',
        @WithClause nvarchar(max) = N'',
        @SelectList nvarchar(max) = N'',
        @UpdateSet nvarchar(max) = N'',
        @InsertAuditColumns nvarchar(max) = N'',
        @InsertAuditValues nvarchar(max) = N'',
        @UpdateAuditSet nvarchar(max) = N'',
        @Sql nvarchar(max);

    SELECT
        @ColumnList = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsIdentity = 0 AND C.IsComputed = 0
              AND C.IsServerManaged = 0 AND C.IsDenied = 0
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @WithClause = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName) + N' ' + C.SqlType
                 + N' ''$."' + STRING_ESCAPE(C.ColumnName, 'json') + N'"'''
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND (C.IsIdentity = 0 OR (@IsEdit = 1 AND C.IsPrimaryKey = 1)) AND C.IsComputed = 0
              AND C.IsServerManaged = 0 AND C.IsDenied = 0
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @SelectList = STUFF((
            SELECT N', J.' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsIdentity = 0 AND C.IsComputed = 0
              AND C.IsServerManaged = 0 AND C.IsDenied = 0
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @UpdateSet = STUFF((
            SELECT N', T.' + QUOTENAME(C.ColumnName) + N' = J.' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsPrimaryKey = 0 AND C.IsIdentity = 0 AND C.IsComputed = 0
              AND C.IsServerManaged = 0 AND C.IsDenied = 0
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    SELECT
        @InsertAuditColumns = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.IsServerManaged = 1 AND C.IsIdentity = 0 AND C.IsComputed = 0 AND C.HasDefault = 0
              AND LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT IN
                  ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                   'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat', 'isdeleted')
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @InsertAuditValues = STUFF((
            SELECT N', ' + CASE
                WHEN LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT IN
                    ('usercreate', 'createdby', 'createby', 'userupdate', 'updatedby', 'updateby') THEN N'@Actor'
                WHEN LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT THEN N'0'
                ELSE N'SYSUTCDATETIME()' END
            FROM @Columns AS C
            WHERE C.IsServerManaged = 1 AND C.IsIdentity = 0 AND C.IsComputed = 0 AND C.HasDefault = 0
              AND LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT IN
                  ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                   'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat', 'isdeleted')
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @UpdateAuditSet = STUFF((
            SELECT N', T.' + QUOTENAME(C.ColumnName) + N' = ' + CASE
                WHEN LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT IN ('userupdate', 'updatedby', 'updateby') THEN N'@Actor'
                ELSE N'SYSUTCDATETIME()' END
            FROM @Columns AS C
            WHERE C.IsServerManaged = 1 AND C.IsIdentity = 0 AND C.IsComputed = 0
              AND LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT IN
                  ('userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat')
            ORDER BY C.ColumnID FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    /*
      STUFF(FOR XML PATH) trả NULL khi bảng không có cột audit phù hợp.
      Chuẩn hóa về chuỗi rỗng trước khi ghép để không sinh dấu phẩy thừa:
      INSERT (..., ) / SELECT ..., FROM hoặc UPDATE SET ..., FROM.
    */
    SET @ColumnList = ISNULL(@ColumnList, N'');
    SET @WithClause = ISNULL(@WithClause, N'');
    SET @SelectList = ISNULL(@SelectList, N'');
    SET @UpdateSet = ISNULL(@UpdateSet, N'');
    SET @InsertAuditColumns = ISNULL(@InsertAuditColumns, N'');
    SET @InsertAuditValues = ISNULL(@InsertAuditValues, N'');
    SET @UpdateAuditSet = ISNULL(@UpdateAuditSet, N'');

    IF @IsEdit = 0
    BEGIN
        SET @ColumnList = CONCAT(@ColumnList, CASE WHEN @ColumnList = N'' OR @InsertAuditColumns = N'' THEN N'' ELSE N', ' END, @InsertAuditColumns);
        SET @SelectList = CONCAT(@SelectList, CASE WHEN @SelectList = N'' OR @InsertAuditValues = N'' THEN N'' ELSE N', ' END, @InsertAuditValues);
        IF @ColumnList = N'' OR @SelectList = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_NO_INSERTABLE_FIELD' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END
    ELSE
    BEGIN
        SET @UpdateSet = CONCAT(@UpdateSet, CASE WHEN @UpdateSet = N'' OR @UpdateAuditSet = N'' THEN N'' ELSE N', ' END, @UpdateAuditSet);
        IF @UpdateSet = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_NO_UPDATABLE_FIELD' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @IsEdit = 0
        BEGIN
            SET @Sql = N'
                DECLARE @Inserted table (PrimaryValue nvarchar(4000));
                INSERT INTO dbo.' + QUOTENAME(@ExpectedTable) + N' (' + @ColumnList + N')
                OUTPUT CONVERT(nvarchar(4000), INSERTED.' + QUOTENAME(@PrimaryKey) + N') INTO @Inserted(PrimaryValue)
                SELECT ' + @SelectList
                + CASE WHEN @WithClause = N'' THEN N'' ELSE N' FROM OPENJSON(@JsonData) WITH (' + @WithClause + N') AS J' END + N';
                SET @OutRows = @@ROWCOUNT;
                SELECT TOP (1) @OutPrimary = PrimaryValue FROM @Inserted;';
        END
        ELSE
        BEGIN
            SET @Sql = N'
                UPDATE T SET ' + @UpdateSet + N'
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                CROSS JOIN OPENJSON(@JsonData) WITH (' + @WithClause + N') AS J
                WHERE T.' + QUOTENAME(@PrimaryKey)
                + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                + N' = J.' + QUOTENAME(@PrimaryKey)
                + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END + N';
                SET @OutRows = @@ROWCOUNT;
                SET @OutPrimary = CONVERT(nvarchar(4000), JSON_VALUE(@JsonData, ''$."' + STRING_ESCAPE(@PrimaryKey, 'json') + N'"''));';
        END;

        EXEC sys.sp_executesql
            @Sql,
            N'@JsonData nvarchar(max), @Actor varchar(100), @OutRows int OUTPUT, @OutPrimary nvarchar(4000) OUTPUT',
            @JsonData = @Data,
            @Actor = @UserName,
            @OutRows = @RowsAffected OUTPUT,
            @OutPrimary = @PrimaryValue OUTPUT;

        IF @RowsAffected <> 1
            THROW 53320, N'PHASE3_SAVE_MUST_AFFECT_EXACTLY_ONE_ROW', 1;

        COMMIT TRANSACTION;
        SELECT 0 AS code, N'Lưu V2 thành công.' AS msg, @PrimaryKey AS primaryKey,
               @PrimaryValue AS primaryValue, @RowsAffected AS rowsAffected;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SELECT -1 AS code,
               N'PHASE3_SAVE_FAILED_' + CONVERT(nvarchar(20), ERROR_NUMBER()) AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
    END CATCH;
END;
GO
