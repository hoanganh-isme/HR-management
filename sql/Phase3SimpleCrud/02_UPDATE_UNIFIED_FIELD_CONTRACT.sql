/*
  Phase 3 - Unified Field Contract cho Grid/Add/Edit/Filter.
  Membership và capability đến từ sys.columns; caption/format/lookup lần lượt từ
  SY_FmtFldTbl, SY_FmatTbl và SY_FrmDrdwTbl. Bảng layout field legacy không tham gia runtime.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53200, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_Web_GridFieldSchemaV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_GridFieldSchemaV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_GridFieldSchemaV2
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
        @ExpectedView sysname,
        @ExpectedSave sysname,
        @ExpectedDelete sysname,
        @EnableView bit,
        @EnableSave bit,
        @EnableDelete bit,
        @DeletePolicy varchar(40),
        @GlobalReferenceOnly bit;

    SELECT
        @ExpectedERPFormID = R.ERPFormID,
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedView = R.ViewV2,
        @ExpectedSave = R.SaveV2,
        @ExpectedDelete = R.DeleteV2,
        @EnableView = R.EnableView,
        @EnableSave = R.EnableSave,
        @EnableDelete = R.EnableDelete,
        @DeletePolicy = R.DeletePolicy,
        @GlobalReferenceOnly = R.GlobalReferenceOnly
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

    IF @ExpectedTable IS NULL
        THROW 53201, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_CONTRACT', 1;
    IF @UserName = ''
        THROW 53202, N'PHASE3_ACTOR_REQUIRED', 1;

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @ExpectedERPFormID)));
    IF @ERPFormID COLLATE DATABASE_DEFAULT <> @ExpectedERPFormID COLLATE DATABASE_DEFAULT
        THROW 53203, N'PHASE3_ERP_FORM_ALIAS_MISMATCH', 1;

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

    IF @GlobalReferenceOnly = 1 AND EXISTS (
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

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
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

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1) @MenuID = M.MenuID, @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
        THROW 53211, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

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

    IF @ViewCount <> 1 OR @SaveCount <> 1 OR @DeleteCount <> 1
        THROW 53213, N'PHASE3_WA_API_ROUTE_NOT_UNIQUE', 1;

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
        CAST('MAIN_TABLE' AS varchar(30)) AS SourceKind,
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
        Flags.CanQuery AS ShowInFilter,
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
            CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2)
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
        Mobile.MobileClass,
        Mobile.ReasonCodes AS MobileReasonCodes,
        CASE
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
      ON F.FormatID COLLATE DATABASE_DEFAULT = M.FormatID COLLATE DATABASE_DEFAULT
    OUTER APPLY (
        SELECT TOP (1)
            X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn, X.DisplayColumn,
            X.ColumnArr, X.WidthArr, X.ParaRequireArr, X.IsMultiSelect, X.ReloadType, X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE X.ColumnID COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
          AND X.FormID COLLATE DATABASE_DEFAULT IN (@ERPFormID, @WebFormName)
          AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY CASE WHEN X.FormID COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1 ELSE 2 END,
                 X.UserAutoID
    ) AS D
    OUTER APPLY (
        SELECT
            CASE
                WHEN Flags.IsDenied = 1 OR Flags.IsServerManaged = 1 THEN 'HIDDEN'
                WHEN (Flags.CanInsert = 1 AND C.is_nullable = 0 AND C.default_object_id = 0)
                  OR Flags.IsPrimaryKey = 1
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%name'
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%code'
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%status%'
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%effective%'
                  OR D.UserAutoID IS NOT NULL THEN 'CORE'
                WHEN C.is_computed = 1
                  OR (T.name IN ('varchar', 'nvarchar') AND (C.max_length = -1 OR C.max_length > 1000)) THEN 'ADVANCED'
                ELSE 'OPTIONAL'
            END AS MobileClass,
            NULLIF(STUFF(CONCAT(
                CASE WHEN Flags.IsDenied = 1 THEN ';DENIED_FIELD' ELSE '' END,
                CASE WHEN Flags.IsServerManaged = 1 THEN ';SERVER_MANAGED' ELSE '' END,
                CASE WHEN Flags.IsPrimaryKey = 1 THEN ';PRIMARY_KEY' ELSE '' END,
                CASE WHEN Flags.CanInsert = 1 AND C.is_nullable = 0 AND C.default_object_id = 0 THEN ';REQUIRED_ON_INSERT' ELSE '' END,
                CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%name' THEN ';BUSINESS_NAME' ELSE '' END,
                CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%code' THEN ';BUSINESS_CODE' ELSE '' END,
                CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%status%' THEN ';STATUS_FIELD' ELSE '' END,
                CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT LIKE '%effective%' THEN ';EFFECTIVE_DATE' ELSE '' END,
                CASE WHEN D.UserAutoID IS NOT NULL THEN ';LOOKUP_FIELD' ELSE '' END,
                CASE WHEN C.is_computed = 1 THEN ';COMPUTED' ELSE '' END,
                CASE WHEN T.name IN ('varchar', 'nvarchar') AND (C.max_length = -1 OR C.max_length > 1000) THEN ';LONG_TEXT' ELSE '' END,
                CASE WHEN Flags.IsDenied = 0 AND Flags.IsServerManaged = 0 AND Flags.IsPrimaryKey = 0
                       AND NOT (Flags.CanInsert = 1 AND C.is_nullable = 0 AND C.default_object_id = 0)
                     THEN ';DEFAULT_OPTIONAL' ELSE '' END
            ), 1, 1, ''), '') AS ReasonCodes
    ) AS Mobile
    WHERE C.object_id = @ObjectID
    ORDER BY C.column_id;
END;
GO
