/*
  Phase 3 - Delete V2 tự xác định chế độ từ bảng vật lý đã đăng ký.
  IsDeleted bit => xóa mềm; không có IsDeleted => xóa cứng trong transaction;
  IsDeleted sai kiểu => chặn. Không hard-code chế độ theo form.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53400, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_XoaDong_V2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_XoaDong_V2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_XoaDong_V2
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

        @GlobalReferenceOnly bit;

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @PrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedDelete = R.DeleteV2,
        @DeletePolicy = R.DeletePolicy,
        @EnableDelete = R.EnableDelete,

        @PermissionFormName = R.PermissionFormName,

        @GlobalReferenceOnly = R.GlobalReferenceOnly

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

    IF @GlobalReferenceOnly = 1 AND EXISTS (
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

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
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

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1) @MenuID = M.MenuID, @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName COLLATE DATABASE_DEFAULT = @PermissionFormName COLLATE DATABASE_DEFAULT
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupAllowed bit, @UserAllowed bit, @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupAllowed = P.IsDelete, @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID COLLATE DATABASE_DEFAULT = @UserGroupID COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;
        SELECT @UserAllowed = P.IsDelete, @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;
        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
           OR ISNULL(@UserAllowed, ISNULL(@GroupAllowed, 0)) <> 1
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
                WHERE ISNULL(T.' + QUOTENAME(@IsDeletedColumn) + N', 0) = 0;
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@Actor varchar(100), @OutRows int OUTPUT',
                @Actor = @UserName,
                @OutRows = @RowsAffected OUTPUT;
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
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END + N';
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@OutRows int OUTPUT',
                @OutRows = @RowsAffected OUTPUT;
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
