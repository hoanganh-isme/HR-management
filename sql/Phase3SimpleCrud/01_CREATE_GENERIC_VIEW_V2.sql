/*
  Phase 3 - allow-list nguồn mã và View V2 dùng chung cho CRUD một bảng.

  Đây là deployment DDL, không phải runtime DDL. Procedure không nhận TableName/PK
  từ client, không đọc bảng layout field legacy và không ghi bất kỳ bảng SY_* nào.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    EXEC(N'CREATE FUNCTION dbo.API_Phase3SimpleCrudRegistry() RETURNS TABLE AS RETURN (SELECT CAST(NULL AS varchar(100)) AS WebFormName WHERE 1 = 0);');
GO

ALTER FUNCTION dbo.API_Phase3SimpleCrudRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        V.WebFormName,
        V.ERPFormID,
        V.ExpectedTableName,
        V.ExpectedPrimaryKey,
        V.OldView,
        V.ViewV2,
        V.OldSave,
        V.SaveV2,
        V.OldDelete,
        V.DeleteV2,
        CONVERT(bit, V.EnableView) AS EnableView,
        CONVERT(bit, V.EnableSave) AS EnableSave,
        CONVERT(bit, V.EnableDelete) AS EnableDelete,
        V.DeletePolicy,
        CONVERT(bit, 1) AS GlobalReferenceOnly
    FROM (VALUES
        (CONVERT(varchar(100), 'WA_BangThueTNCNFrm'), CONVERT(varchar(100), 'HR_BangThueTNCNFrm'), CONVERT(sysname, N'HR_BangThueTNCNTbl'), CONVERT(sysname, N'Bac'),                  CONVERT(sysname, N'API_TruyVanDong'),       CONVERT(sysname, N'API_TruyVanDong_V2'), CONVERT(sysname, N'API_LuuDong'), CONVERT(sysname, N'API_LuuDong_V2'), CONVERT(sysname, N'API_XoaDong'), CONVERT(sysname, N'API_XoaDong_V2'), 1, 1, 1, CONVERT(varchar(40), 'AUTO_SCHEMA')),
        (CONVERT(varchar(100), 'WA_ChucDanhFrm'),      CONVERT(varchar(100), 'WA_ChucDanhFrm'),      CONVERT(sysname, N'HR_ChucDanhTbl'),       CONVERT(sysname, N'ChucDanhChuyenMon'), CONVERT(sysname, N'API_DanhSachChucDanh'), CONVERT(sysname, N'API_TruyVanDong_V2'), CONVERT(sysname, N'API_LuuDong'), CONVERT(sysname, N'API_LuuDong_V2'), CONVERT(sysname, N'API_XoaDong'), CONVERT(sysname, N'API_XoaDong_V2'), 1, 1, 1, CONVERT(varchar(40), 'AUTO_SCHEMA')),
        (CONVERT(varchar(100), 'WA_TitleListFrm'),     CONVERT(varchar(100), 'WA_TitleListFrm'),     CONVERT(sysname, N'HR_TitleListTbl'),       CONVERT(sysname, N'TitleName'),          CONVERT(sysname, N'API_TruyVanDong'),       CONVERT(sysname, N'API_TruyVanDong_V2'), CONVERT(sysname, N'API_LuuDong'), CONVERT(sysname, N'API_LuuDong_V2'), CONVERT(sysname, N'API_XoaDong'), CONVERT(sysname, N'API_XoaDong_V2'), 1, 1, 1, CONVERT(varchar(40), 'AUTO_SCHEMA')),
        (CONVERT(varchar(100), 'WA_ShiftListFrm'),     CONVERT(varchar(100), 'WA_ShiftListFrm'),     CONVERT(sysname, N'HR_ShiftListTbl'),       CONVERT(sysname, N'ShiftID'),            CONVERT(sysname, N'API_TruyVanDong'),       CONVERT(sysname, N'API_TruyVanDong_V2'), CONVERT(sysname, N'API_LuuDong'), CONVERT(sysname, N'API_LuuDong_V2'), CONVERT(sysname, N'API_XoaDong'), CONVERT(sysname, N'API_XoaDong_V2'), 1, 1, 1, CONVERT(varchar(40), 'AUTO_SCHEMA'))
    ) AS V(WebFormName, ERPFormID, ExpectedTableName, ExpectedPrimaryKey,
           OldView, ViewV2, OldSave, SaveV2, OldDelete, DeleteV2,
           EnableView, EnableSave, EnableDelete, DeletePolicy)
);
GO

IF OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_TruyVanDong_V2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_TruyVanDong_V2
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
        @GlobalReferenceOnly bit;

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedView = R.ViewV2,
        @GlobalReferenceOnly = R.GlobalReferenceOnly
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableView = 1;

    IF @ExpectedTable IS NULL OR @ExpectedView COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
        THROW 53101, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_VIEW', 1;

    IF @UserName = ''
        THROW 53102, N'PHASE3_ACTOR_REQUIRED', 1;

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

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
            THROW 53112, N'PHASE3_BRANCH_CONTEXT_REQUIRED', 1;

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

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1)
        @MenuID = M.MenuID,
        @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
        THROW 53114, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID COLLATE DATABASE_DEFAULT = @UserGroupID COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;

        SELECT @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
          AND P.MenuID COLLATE DATABASE_DEFAULT = @MenuID COLLATE DATABASE_DEFAULT;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
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
    IF @Page < 1 OR @Page > 1000000 OR @PageSize < 1 OR @PageSize > 500
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
        @Sql nvarchar(max);

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
        N'@Keyword nvarchar(200), @Data nvarchar(max), @Offset int, @PageSize int',
        @Keyword = @Keyword,
        @Data = @Data,
        @Offset = @Offset,
        @PageSize = @PageSize;
END;
GO
