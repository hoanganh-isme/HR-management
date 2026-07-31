/*
  Cập nhật metadata Grid/JOIN. Cấu hình caption/format/lookup chỉ đọc từ
  WA_FieldUiContractV2; dropdown trỏ đến route WA_API gọi API_* tương ứng.
*/
IF OBJECT_ID(N'dbo.API_FieldMetadataContractRegistry', N'IF') IS NULL
   OR OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
   OR OBJECT_ID(N'dbo.API_Web_GroupFormPermissionV2', N'IF') IS NULL
    THROW 54300, N'FIELD_CONTRACT_DYNAMIC_WRAPPERS_NOT_INSTALLED', 1;
IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
    THROW 54301, N'FIELD_UI_CONTRACT_V2_REGISTRY_NOT_INSTALLED', 1;
GO

/* ========================================================================= */
/* 1. UPDATE UNIFIED FIELD CONTRACT (dbo.API_Web_GridFieldSchemaV2)          */
/* ========================================================================= */

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_FieldMetadataContractRegistry', N'IF') IS NULL
    THROW 53200, N'FIELD_METADATA_SOURCE_REGISTRY_NOT_INSTALLED', 1;
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
            COALESCE(ResultCaption.OrderNo, RF.FieldOrdinal) AS FieldOrdinal,
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
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1
                 AND ISNULL(ResultCaption.ShowInGrid, 1) = 1 THEN 1
                ELSE 0
            END) AS ShowInGrid,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanInsert = 1
                 AND ISNULL(ResultCaption.ShowInAdd, 1) = 1 THEN 1
                ELSE 0
            END) AS ShowInAdd,
            CONVERT(bit, CASE
                WHEN (ResultFlags.CanUpdate = 1 OR ResultFlags.IsPrimaryKey = 1)
                 AND ISNULL(ResultCaption.ShowInEdit, 1) = 1 THEN 1
                ELSE 0
            END) AS ShowInEdit,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1
                 AND ResultFilter.UserAutoID IS NOT NULL
                 AND ISNULL(ResultCaption.ShowInFilter, 1) = 1 THEN 1
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
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) = 'TEXTAREA' THEN 'textarea'
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) = 'BOOLEAN' THEN 'boolean'
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) = 'DATE' THEN 'date'
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) = 'DATETIME' THEN 'datetime'
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) = 'TIME' THEN 'time'
                WHEN UPPER(ISNULL(ResultCaption.ControlType, '')) IN ('NUMBER', 'MONEY') THEN 'number'
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
                    UPPER(LTRIM(RTRIM(CONVERT(varchar(max), ResultLookup.LookupCode))))
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
                X.FormatID,
                X.Caption AS CaptionVN,
                CAST(NULL AS nvarchar(200)) AS CaptionEN,
                X.Align AS AlignX,
                X.MinWidth,
                X.MaxWidth,
                X.ControlType,
                X.NumberDecimal,
                X.FormatString,
                X.MaskString,
                X.MaxLength,
                X.MinValue,
                X.MaxValue,
                X.OrderNo,
                X.ShowInGrid,
                X.ShowInAdd,
                X.ShowInEdit,
                X.ShowInFilter,
                X.IsReadOnlyAdd,
                X.IsReadOnlyEdit
            FROM dbo.WA_FieldUiContractV2 AS X
            WHERE X.WebFormName COLLATE DATABASE_DEFAULT =
                  @WebFormName COLLATE DATABASE_DEFAULT
              AND X.DatasetKey COLLATE DATABASE_DEFAULT =
                  'MAIN' COLLATE DATABASE_DEFAULT
              AND X.IsEnabled = 1
              AND X.FieldName COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
        ) AS ResultCaption
        OUTER APPLY
        (
            SELECT
                ResultCaption.ControlType AS [Type],
                ResultCaption.NumberDecimal,
                ResultCaption.FormatString,
                ResultCaption.MaskString,
                ResultCaption.MaxLength,
                ResultCaption.MinValue,
                ResultCaption.MaxValue,
                ResultCaption.AlignX AS Align
        ) AS ResultFormat
        OUTER APPLY
        (
            SELECT TOP (1)
                U.LookupList AS UserAutoID,
                U.WebFormName AS FormID,
                U.FieldName AS ColumnID,
                'REGISTERED_API' AS [Type],
                U.LookupValueColumn AS ValueColumn,
                U.LookupDisplayColumn AS DisplayColumn,
                U.LookupColumns AS ColumnArr,
                U.LookupWidths AS WidthArr,
                U.LookupDependsOn AS ParaRequireArr,
                U.LookupMultiSelect AS IsMultiSelect,
                U.LookupReloadMode AS ReloadType,
                CONVERT(bit, 0) AS IsDisable,
                CONCAT
                (
                    U.LookupList, '|',
                    U.LookupValueColumn, '|',
                    U.LookupDisplayColumn, '|',
                    ISNULL(U.LookupColumns, N''), '|',
                    ISNULL(U.LookupDependsOn, N''), '|',
                    CONVERT(varchar(1), U.LookupMultiSelect)
                ) AS LookupCode
            FROM dbo.WA_FieldUiContractV2 AS U
            WHERE U.WebFormName COLLATE DATABASE_DEFAULT =
                  @WebFormName COLLATE DATABASE_DEFAULT
              AND U.DatasetKey COLLATE DATABASE_DEFAULT =
                  'MAIN' COLLATE DATABASE_DEFAULT
              AND U.IsEnabled = 1
              AND U.LookupList IS NOT NULL
              AND U.LookupValueColumn IS NOT NULL
              AND U.LookupDisplayColumn IS NOT NULL
              AND U.FieldName COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
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
            ORDER BY COALESCE(ResultCaption.OrderNo, RF.FieldOrdinal);

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
        COALESCE(M.OrderNo, C.column_id) AS FieldOrdinal,
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
        CONVERT(bit, CASE
            WHEN Flags.CanQuery = 1 AND ISNULL(M.ShowInGrid, 1) = 1 THEN 1
            ELSE 0
        END) AS ShowInGrid,
        CONVERT(bit, CASE
            WHEN Flags.CanInsert = 1 AND ISNULL(M.ShowInAdd, 1) = 1 THEN 1
            ELSE 0
        END) AS ShowInAdd,
        CONVERT(bit, CASE
            WHEN (Flags.CanUpdate = 1 OR Flags.IsPrimaryKey = 1)
             AND ISNULL(M.ShowInEdit, 1) = 1 THEN 1
            ELSE 0
        END) AS ShowInEdit,
        CONVERT(bit, CASE
        WHEN Flags.CanQuery = 1
         AND FilterCfg.UserAutoID IS NOT NULL
         AND ISNULL(M.ShowInFilter, 1) = 1 THEN 1
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
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'TEXTAREA' THEN 'textarea'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'BOOLEAN' THEN 'boolean'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'DATE' THEN 'date'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'DATETIME' THEN 'datetime'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'TIME' THEN 'time'
            WHEN UPPER(ISNULL(M.ControlType, '')) IN ('NUMBER', 'MONEY') THEN 'number'
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
                UPPER(LTRIM(RTRIM(CONVERT(varchar(max), D.LookupCode))))
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
        SELECT TOP (1)
            X.FormatID,
            X.Caption AS CaptionVN,
            CAST(NULL AS nvarchar(200)) AS CaptionEN,
            X.Align AS AlignX,
            X.MinWidth,
            X.MaxWidth,
            X.ControlType,
            X.NumberDecimal,
            X.FormatString,
            X.MaskString,
            X.MaxLength,
            X.MinValue,
            X.MaxValue,
            X.OrderNo,
            X.ShowInGrid,
            X.ShowInAdd,
            X.ShowInEdit,
            X.ShowInFilter,
            X.IsReadOnlyAdd,
            X.IsReadOnlyEdit
        FROM dbo.WA_FieldUiContractV2 AS X
        WHERE X.WebFormName COLLATE DATABASE_DEFAULT =
              @WebFormName COLLATE DATABASE_DEFAULT
          AND X.DatasetKey COLLATE DATABASE_DEFAULT =
              'MAIN' COLLATE DATABASE_DEFAULT
          AND X.FieldName COLLATE DATABASE_DEFAULT =
              C.name COLLATE DATABASE_DEFAULT
          AND X.IsEnabled = 1
    ) AS M
    OUTER APPLY
    (
        SELECT
            M.ControlType AS [Type],
            M.NumberDecimal,
            M.FormatString,
            M.MaskString,
            M.MaxLength,
            M.MinValue,
            M.MaxValue,
            M.AlignX AS Align
    ) AS F

    OUTER APPLY
    (
        SELECT TOP (1)
            U.LookupList AS UserAutoID,
            U.WebFormName AS FormID,
            U.FieldName AS ColumnID,
            'REGISTERED_API' AS [Type],
            U.LookupValueColumn AS ValueColumn,
            U.LookupDisplayColumn AS DisplayColumn,
            U.LookupColumns AS ColumnArr,
            U.LookupWidths AS WidthArr,
            U.LookupDependsOn AS ParaRequireArr,
            U.LookupMultiSelect AS IsMultiSelect,
            U.LookupReloadMode AS ReloadType,
            CONVERT(bit, 0) AS IsDisable,
            CONCAT
            (
                U.LookupList, '|',
                U.LookupValueColumn, '|',
                U.LookupDisplayColumn, '|',
                ISNULL(U.LookupColumns, N''), '|',
                ISNULL(U.LookupDependsOn, N''), '|',
                CONVERT(varchar(1), U.LookupMultiSelect)
            ) AS LookupCode
        FROM dbo.WA_FieldUiContractV2 AS U
        WHERE
            U.WebFormName COLLATE DATABASE_DEFAULT =
                @WebFormName COLLATE DATABASE_DEFAULT
            AND U.DatasetKey COLLATE DATABASE_DEFAULT =
                'MAIN' COLLATE DATABASE_DEFAULT
            AND U.FieldName COLLATE DATABASE_DEFAULT =
                C.name COLLATE DATABASE_DEFAULT
            AND U.IsEnabled = 1
            AND U.LookupList IS NOT NULL
            AND U.LookupValueColumn IS NOT NULL
            AND U.LookupDisplayColumn IS NOT NULL
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

/* ========================================================================= */
/* 2. UPDATE JOIN FIELD SCHEMA V2 (dbo.API_Web_JoinFieldSchemaV2)             */
/* ========================================================================= */

IF OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
BEGIN
    THROW 53400, N'PHASE4_JOIN_REGISTRY_NOT_INSTALLED', 1;
END;
GO

IF OBJECT_ID(N'dbo.API_Web_JoinFieldSchemaV2', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE dbo.API_Web_JoinFieldSchemaV2 AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE dbo.API_Web_JoinFieldSchemaV2
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
        COALESCE(M.OrderNo, RF.FieldOrdinal) AS FieldOrdinal,
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
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'TEXTAREA' THEN 'textarea'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'BOOLEAN' THEN 'boolean'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'DATE' THEN 'date'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'DATETIME' THEN 'datetime'
            WHEN UPPER(ISNULL(M.ControlType, '')) = 'TIME' THEN 'time'
            WHEN UPPER(ISNULL(M.ControlType, '')) IN ('NUMBER', 'MONEY') THEN 'number'
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
            ELSE CONVERT
            (
                varchar(64),
                HASHBYTES
                (
                    'SHA2_256',
                    UPPER(LTRIM(RTRIM(CONVERT(varchar(max), D.LookupCode))))
                ),
                2
            )
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
        SELECT TOP (1)
            X.FormatID,
            X.Caption AS CaptionVN,
            CAST(NULL AS nvarchar(200)) AS CaptionEN,
            X.Align AS AlignX,
            X.MinWidth,
            X.MaxWidth,
            X.ControlType,
            X.NumberDecimal,
            X.FormatString,
            X.MaskString,
            X.MaxLength,
            X.MinValue,
            X.MaxValue,
            X.OrderNo,
            X.ShowInGrid,
            X.ShowInAdd,
            X.ShowInEdit,
            X.ShowInFilter,
            X.IsReadOnlyAdd,
            X.IsReadOnlyEdit
        FROM dbo.WA_FieldUiContractV2 AS X
        WHERE X.WebFormName COLLATE DATABASE_DEFAULT =
              @WebFormName COLLATE DATABASE_DEFAULT
          AND X.DatasetKey COLLATE DATABASE_DEFAULT =
              @DetailKey COLLATE DATABASE_DEFAULT
          AND X.FieldName COLLATE DATABASE_DEFAULT =
              RF.FieldName COLLATE DATABASE_DEFAULT
          AND X.IsEnabled = 1
    ) AS M
    OUTER APPLY
    (
        SELECT
            M.ControlType AS [Type],
            M.NumberDecimal,
            M.FormatString,
            M.MaskString,
            M.MaxLength,
            M.MinValue,
            M.MaxValue,
            M.AlignX AS Align
    ) AS F
    OUTER APPLY
    (
        SELECT TOP (1)
            U.LookupList AS UserAutoID,
            U.WebFormName AS FormID,
            U.FieldName AS ColumnID,
            'REGISTERED_API' AS [Type],
            U.LookupValueColumn AS ValueColumn,
            U.LookupDisplayColumn AS DisplayColumn,
            U.LookupColumns AS ColumnArr,
            U.LookupWidths AS WidthArr,
            U.LookupDependsOn AS ParaRequireArr,
            U.LookupMultiSelect AS IsMultiSelect,
            U.LookupReloadMode AS ReloadType,
            CONVERT(bit, 0) AS IsDisable,
            CONCAT
            (
                U.LookupList, '|',
                U.LookupValueColumn, '|',
                U.LookupDisplayColumn, '|',
                ISNULL(U.LookupColumns, N''), '|',
                ISNULL(U.LookupDependsOn, N''), '|',
                CONVERT(varchar(1), U.LookupMultiSelect)
            ) AS LookupCode
        FROM dbo.WA_FieldUiContractV2 AS U
        WHERE U.WebFormName COLLATE DATABASE_DEFAULT =
              @WebFormName COLLATE DATABASE_DEFAULT
          AND U.DatasetKey COLLATE DATABASE_DEFAULT =
              @DetailKey COLLATE DATABASE_DEFAULT
          AND U.FieldName COLLATE DATABASE_DEFAULT =
              RF.FieldName COLLATE DATABASE_DEFAULT
          AND U.IsEnabled = 1
          AND U.LookupList IS NOT NULL
          AND U.LookupValueColumn IS NOT NULL
          AND U.LookupDisplayColumn IS NOT NULL
    ) AS D
    ORDER BY COALESCE(M.OrderNo, RF.FieldOrdinal);
END;
GO
