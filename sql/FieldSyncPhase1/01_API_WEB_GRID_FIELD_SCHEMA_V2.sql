/*
  Form Contract V2 chỉ đọc.
  - Membership/thứ tự: result-set của WA_API View V2.
  - Table/PK: SY_FrmLstTbl.
  - Caption/format/dropdown: SY_FmtFldTbl + SY_FmatTbl + SY_FrmDrdwTbl.
  - Khả năng Add/Edit/Filter/Sort: sys.columns/sys.types của bảng chính.
  SY_FormatFields không tham gia contract runtime này.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
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
    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = '' OR @UserName = ''
        THROW 51001, N'Thiếu ngữ cảnh đọc metadata.', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51002, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1)
        @MenuID = M.MenuID,
        @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName = @WebFormName
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
        THROW 51003, N'Form chưa có menu hoạt động để kiểm tra quyền metadata.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID = @UserGroupID AND P.MenuID = @MenuID;

        SELECT @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName = @UserName AND P.MenuID = @MenuID;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
            THROW 51003, N'Không có quyền đọc metadata của form.', 1;
    END;

    /* PHASE2_BRANCH_FAIL_CLOSED */
    IF LOWER(@UserGroupID) <> 'admin'
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
            THROW 51009, N'Người dùng không phải admin chưa được gán chi nhánh.', 1;
        IF @BranchID = ''
            THROW 51004, N'Thiếu ngữ cảnh chi nhánh.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                    WHERE UPPER(LTRIM(RTRIM(Allowed.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
              )
        )
            THROW 51005, N'Chi nhánh nằm ngoài phạm vi được cấp.', 1;
    END;

    DECLARE @ApiCount int, @ViewProcedure varchar(50);
    SELECT
        @ApiCount = COUNT(*),
        @ViewProcedure = MIN(LTRIM(RTRIM(A.[SQL])))
    FROM dbo.WA_API AS A
    WHERE A.[list] = @WebFormName
      AND A.[func] = 'View';

    IF ISNULL(@ApiCount, 0) <> 1 OR ISNULL(@ViewProcedure, '') = ''
        THROW 51006, N'WA_API View chưa có duy nhất một đăng ký hợp lệ.', 1;

    DECLARE @RegisteredViewProcedure varchar(50) = @ViewProcedure;
    DECLARE @SaveRegistrationCount int, @DeleteRegistrationCount int;
    DECLARE @RegisteredSaveProcedure varchar(50), @RegisteredDeleteProcedure varchar(50);

    SELECT
        @SaveRegistrationCount = COUNT(*),
        @RegisteredSaveProcedure = MIN(LTRIM(RTRIM(A.[SQL])))
    FROM dbo.WA_API AS A
    WHERE A.[list] = @WebFormName
      AND A.[func] = 'Save';

    SELECT
        @DeleteRegistrationCount = COUNT(*),
        @RegisteredDeleteProcedure = MIN(LTRIM(RTRIM(A.[SQL])))
    FROM dbo.WA_API AS A
    WHERE A.[list] = @WebFormName
      AND A.[func] = 'Delete';

    IF ISNULL(@SaveRegistrationCount, 0) <> 1 SET @RegisteredSaveProcedure = NULL;
    IF ISNULL(@DeleteRegistrationCount, 0) <> 1 SET @RegisteredDeleteProcedure = NULL;

    /* Không suy đoán route bằng FormName: metadata luôn mô tả đúng WA_API View đang đăng ký. */
    DECLARE @ShadowViewOverride bit = 0;

    DECLARE @TableName varchar(100), @PrimaryKey varchar(100), @RegistryCount int;

    /*
      SY_FrmLstTbl của web runtime được đăng ký theo WebFormName.
      ERPFormID là alias để đọc caption/format của ERP; chỉ dùng làm fallback cho
      các form Phase 1 cũ không có registration web riêng.
    */
    SELECT @RegistryCount = COUNT(*)
    FROM dbo.SY_FrmLstTbl AS L
    WHERE LOWER(L.FormID) = LOWER(@WebFormName);

    IF @RegistryCount > 1
        THROW 51007, N'Web Form có nhiều registration SY_FrmLstTbl.', 1;

    IF @RegistryCount = 1
    BEGIN
        SELECT
            @TableName = L.TableName,
            @PrimaryKey = L.PrimaryKey
        FROM dbo.SY_FrmLstTbl AS L
        WHERE LOWER(L.FormID) = LOWER(@WebFormName);
    END
    ELSE
    BEGIN
        SELECT @RegistryCount = COUNT(*)
        FROM dbo.SY_FrmLstTbl AS L
        WHERE LOWER(L.FormID) = LOWER(@ERPFormID);

        IF @RegistryCount <> 1
            THROW 51007, N'Form chưa có duy nhất một registration SY_FrmLstTbl.', 1;

        SELECT
            @TableName = L.TableName,
            @PrimaryKey = L.PrimaryKey
        FROM dbo.SY_FrmLstTbl AS L
        WHERE LOWER(L.FormID) = LOWER(@ERPFormID);
    END;

    IF ISNULL(@TableName, '') = ''
        THROW 51007, N'ERP Form chưa có TableName hợp lệ.', 1;

    DECLARE @TableObjectID int = COALESCE(
        OBJECT_ID(@TableName, N'U'),
        OBJECT_ID(N'dbo.' + @TableName, N'U')
    );

    IF @TableObjectID IS NULL
        THROW 51008, N'Không tìm thấy bảng chính đã đăng ký.', 1;

    DECLARE @ProcedureObjectID int = COALESCE(
        OBJECT_ID(@ViewProcedure, N'P'),
        OBJECT_ID(N'dbo.' + @ViewProcedure, N'P')
    );

    /*
      Không hard-code FormName, TableName hay danh sách field.
      Procedure View nào công bố unified marker sẽ lấy membership trực tiếp từ sys.columns
      của bảng đã đăng ký trong SY_FrmLstTbl.
    */
    DECLARE @UseMainTableContract bit = CASE WHEN EXISTS (
        SELECT 1
        FROM sys.sql_modules AS M
        WHERE M.object_id = @ProcedureObjectID
          AND M.definition LIKE '%PHASE2_UNIFIED_FIELD_CONTRACT%'
    ) THEN 1 ELSE 0 END;

    DECLARE @Fields table (
        FieldOrdinal int NOT NULL,
        FieldName sysname NOT NULL,
        SqlType nvarchar(256) NULL,
        IsNullable bit NULL,
        SourceKind varchar(30) NOT NULL
    );
    DECLARE @ResultSetMetadataError bit = 0;

    IF @UseMainTableContract = 1
    BEGIN
        INSERT INTO @Fields (FieldOrdinal, FieldName, SqlType, IsNullable, SourceKind)
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
            'MAIN_TABLE'
        FROM sys.columns AS C
        WHERE C.object_id = @TableObjectID
        ORDER BY C.column_id;
    END;

    IF @ProcedureObjectID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM @Fields)
    BEGIN
        BEGIN TRY
            IF EXISTS (
                SELECT 1
                FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 0) AS D
                WHERE D.error_number IS NOT NULL
            )
                SET @ResultSetMetadataError = 1;

            INSERT INTO @Fields (FieldOrdinal, FieldName, SqlType, IsNullable, SourceKind)
            SELECT
                D.column_ordinal,
                D.name,
                D.system_type_name,
                D.is_nullable,
                'RESULT_SET'
            FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 0) AS D
            WHERE ISNULL(D.is_hidden, 0) = 0
              AND D.error_number IS NULL
              AND D.name IS NOT NULL;
        END TRY
        BEGIN CATCH
            -- Procedure dùng SQL động sẽ được xử lý bằng fallback có kiểm soát bên dưới.
            SET @ProcedureObjectID = @ProcedureObjectID;
        END CATCH;
    END;

    IF NOT EXISTS (SELECT 1 FROM @Fields)
    BEGIN
        INSERT INTO @Fields (FieldOrdinal, FieldName, SqlType, IsNullable, SourceKind)
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
            'TABLE_FALLBACK'
        FROM sys.columns AS C
        WHERE C.object_id = @TableObjectID
        ORDER BY C.column_id;
    END;

    DECLARE @ResultSetUnsafeField bit = 0;
    IF EXISTS (
        SELECT 1
        FROM @Fields AS F
        WHERE LOWER(F.FieldName) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                     'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%binary%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%image%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%timestamp%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%rowversion%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%xml%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%text%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%sql_variant%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%geography%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%geometry%'
           OR LOWER(ISNULL(F.SqlType, '')) LIKE '%hierarchyid%'
    )
        SET @ResultSetUnsafeField = 1;

    SELECT
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        CAST('1.0' AS varchar(10)) AS CapabilityVersion,
        @WebFormName AS WebFormName,
        @ERPFormID AS ERPFormName,
        @TableName AS TableName,
        @PrimaryKey AS PrimaryKey,
        @RegisteredViewProcedure AS RegisteredViewProcedure,
        @RegisteredSaveProcedure AS RegisteredSaveProcedure,
        @RegisteredDeleteProcedure AS RegisteredDeleteProcedure,
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM sys.columns AS SD
                JOIN sys.types AS ST ON ST.user_type_id = SD.user_type_id
                WHERE SD.object_id = @TableObjectID
                  AND LOWER(SD.name) = 'isdeleted'
                  AND LOWER(ST.name) = 'bit'
            ) THEN 'SOFT'
            WHEN NOT EXISTS (
                SELECT 1
                FROM sys.columns AS SD
                WHERE SD.object_id = @TableObjectID
                  AND LOWER(SD.name) = 'isdeleted'
            ) THEN 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM sys.extended_properties 
                        WHERE major_id = @TableObjectID 
                          AND name = 'AllowHardDelete' 
                          AND value = '1'
                    ) THEN 'HARD_APPROVED' 
                    ELSE 'HARD' 
                END
            ELSE 'INVALID_ISDELETED_TYPE'
        END AS DeleteMode,
        F.SourceKind,
        F.FieldOrdinal,
        CONVERT(varchar(128), F.FieldName) AS FieldName,
        F.SqlType,
        F.IsNullable,
        CONVERT(bit, CASE WHEN C.column_id IS NULL THEN 0 ELSE 1 END) AS IsPhysicalColumn,
        CONVERT(bit, CASE WHEN LOWER(F.FieldName) = LOWER(@PrimaryKey) THEN 1 ELSE 0 END) AS IsPrimaryKey,
        CONVERT(bit, ISNULL(C.is_identity, 0)) AS IsIdentity,
        CONVERT(bit, ISNULL(C.is_computed, 0)) AS IsComputed,
        CONVERT(bit, CASE WHEN ISNULL(C.default_object_id, 0) <> 0 THEN 1 ELSE 0 END) AS HasDefault,
        C.max_length AS DbMaxLength,
        C.[precision] AS DbPrecision,
        C.scale AS DbScale,
        C.is_nullable AS DbIsNullable,
        CONVERT(bit, CASE WHEN Flags.IsServerManaged = 1 THEN 1 ELSE 0 END) AS IsServerManaged,
        CONVERT(bit, CASE WHEN Flags.IsDenied = 1 THEN 1 ELSE 0 END) AS IsSensitiveOrDenied,
        CONVERT(bit, CASE
            WHEN Flags.CanWrite = 1
             AND C.is_nullable = 0
             AND C.default_object_id = 0
            THEN 1 ELSE 0 END) AS IsRequiredOnInsert,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 THEN 1 ELSE 0 END) AS ShowInGrid,
        CONVERT(bit, CASE WHEN Flags.CanWrite = 1 THEN 1 ELSE 0 END) AS ShowInAdd,
        CONVERT(bit, CASE
            WHEN Flags.CanWrite = 1 OR LOWER(F.FieldName) = LOWER(@PrimaryKey)
            THEN 1 ELSE 0 END) AS ShowInEdit,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 THEN 1 ELSE 0 END) AS ShowInFilter,
        CONVERT(bit, CASE WHEN Flags.CanWrite = 1 THEN 1 ELSE 0 END) AS SupportsInsert,
        CONVERT(bit, CASE
            WHEN Flags.CanWrite = 1 AND LOWER(F.FieldName) <> LOWER(@PrimaryKey)
            THEN 1 ELSE 0 END) AS SupportsUpdate,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 THEN 1 ELSE 0 END) AS SupportsFilter,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 THEN 1 ELSE 0 END) AS SupportsSort,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 THEN 1 ELSE 0 END) AS SupportsKeyword,
        COALESCE(NULLIF(M.CaptionVN, ''), NULLIF(M.CaptionEN, ''), CONVERT(nvarchar(200), F.FieldName)) AS Caption,
        M.FormatID,
        R.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN F.SqlType = 'bit' OR F.SqlType LIKE 'bit(%' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('D') THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('DT') THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('H') THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B') THEN 'money'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('Q') THEN 'decimal'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            WHEN F.SqlType LIKE '%date%' OR F.SqlType LIKE '%time%' THEN 'date'
            WHEN F.SqlType LIKE '%int%' OR F.SqlType LIKE '%decimal%' OR F.SqlType LIKE '%numeric%' OR F.SqlType LIKE '%money%' OR F.SqlType LIKE '%float%' THEN 'number'
            ELSE 'text'
        END AS RenderType,
        R.NumberDecimal,
        R.FormatString,
        R.MaskString,
        COALESCE(
            R.MaxLength,
            CASE
                WHEN TYPE_NAME(C.user_type_id) IN ('nvarchar', 'nchar') AND C.max_length > 0 THEN C.max_length / 2
                WHEN TYPE_NAME(C.user_type_id) IN ('varchar', 'char') AND C.max_length > 0 THEN C.max_length
                ELSE NULL
            END
        ) AS MaxLength,
        R.MinValue,
        R.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), R.Align) AS Align,
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
        CASE
            WHEN @ResultSetMetadataError = 1 THEN 'RESULTSET_METADATA_ERROR'
            WHEN F.SourceKind = 'TABLE_FALLBACK' THEN 'RESULTSET_FALLBACK_TO_TABLE'
            WHEN @ResultSetUnsafeField = 1 THEN 'RESULTSET_UNSAFE_FIELD'
            WHEN @ShadowViewOverride = 1 THEN 'SHADOW_VIEW_NOT_REGISTERED'
            ELSE 'OK'
        END AS DiagnosticCode
    FROM @Fields AS F
    LEFT JOIN sys.columns AS C
      ON C.object_id = @TableObjectID
     AND LOWER(C.name) COLLATE DATABASE_DEFAULT = LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
    LEFT JOIN sys.types AS CT
      ON CT.user_type_id = C.user_type_id
    OUTER APPLY (
        SELECT
            CONVERT(bit, CASE
                WHEN C.column_id IS NOT NULL
                 AND LOWER(C.name) IN ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                       'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                                       'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
                THEN 1 ELSE 0 END) AS IsServerManaged,
            CONVERT(bit, CASE
                WHEN C.column_id IS NULL
                  OR LOWER(ISNULL(CT.name, '')) IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                                    'sql_variant', 'geography', 'geometry', 'hierarchyid')
                  OR LOWER(C.name) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                      'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
                THEN 1 ELSE 0 END) AS IsDenied
    ) AS BaseFlags
    OUTER APPLY (
        SELECT
            BaseFlags.IsServerManaged,
            BaseFlags.IsDenied,
            CONVERT(bit, CASE
                WHEN C.column_id IS NOT NULL
                 AND ISNULL(C.is_identity, 0) = 0
                 AND ISNULL(C.is_computed, 0) = 0
                 AND BaseFlags.IsServerManaged = 0
                 AND BaseFlags.IsDenied = 0
                THEN 1 ELSE 0 END) AS CanWrite,
            CONVERT(bit, CASE
                WHEN C.column_id IS NOT NULL
                 AND BaseFlags.IsServerManaged = 0
                 AND BaseFlags.IsDenied = 0
                THEN 1 ELSE 0 END) AS CanQuery
    ) AS Flags
    OUTER APPLY (
        SELECT TOP (1)
            X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE LOWER(X.FieldName) = LOWER(CONVERT(varchar(128), F.FieldName))
          AND (
                LOWER(ISNULL(X.FormName, '')) = LOWER(@ERPFormID)
             OR LOWER(ISNULL(X.FormName, '')) = LOWER(@WebFormName)
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
            CASE
                WHEN LOWER(ISNULL(X.FormName, '')) = LOWER(@ERPFormID) THEN 1
                WHEN LOWER(ISNULL(X.FormName, '')) = LOWER(@WebFormName) THEN 2
                WHEN EXISTS (
                    SELECT 1
                    FROM dbo.SY_FrmLstTbl AS AliasForm
                    WHERE LOWER(AliasForm.FormID) = LOWER(ISNULL(X.FormName, ''))
                      AND LOWER(ISNULL(AliasForm.TableName, '')) = LOWER(@TableName)
                      AND LOWER(ISNULL(AliasForm.PrimaryKey, '')) = LOWER(@PrimaryKey)
                ) THEN 3
                WHEN X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '' THEN 4
                ELSE 5
            END,
            X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS R
      ON R.FormatID = M.FormatID
    OUTER APPLY (
        SELECT TOP (1)
            X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn,
            X.DisplayColumn, X.ColumnArr, X.WidthArr, X.ParaRequireArr,
            X.IsMultiSelect, X.ReloadType, X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE LOWER(X.ColumnID) = LOWER(CONVERT(varchar(128), F.FieldName))
          AND LOWER(ISNULL(X.FormID, '')) IN (LOWER(@ERPFormID), LOWER(@WebFormName))
          AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY CASE WHEN LOWER(ISNULL(X.FormID, '')) = LOWER(@ERPFormID) THEN 1 ELSE 2 END, X.UserAutoID
    ) AS D
    ORDER BY F.FieldOrdinal;
END;
GO
