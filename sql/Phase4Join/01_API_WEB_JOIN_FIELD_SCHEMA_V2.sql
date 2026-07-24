/*
  Phase 4A Stored Procedure: dbo.API_Web_JoinFieldSchemaV2
  Chức năng: Trích xuất metadata hợp đồng cho các câu lệnh JOIN trong detail tab (Read-Only Pilot).
  Tự động đọc result-set từ sys.dm_exec_describe_first_result_set_for_object, kiểm tra sys.columns để phân biệt
  cột vật lý vs cột JOINed, và kết hợp với SY_FmtFldTbl, SY_FmatTbl, SY_FrmDrdwTbl.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_JoinFieldSchemaV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_JoinFieldSchemaV2 AS BEGIN SET NOCOUNT ON; END');
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

    -- 1. Kiểm tra TVF Registry
    IF OBJECT_ID(N'dbo.API_Phase4JoinRegistry', N'IF') IS NULL
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_REGISTRY_NOT_INSTALLED' AS DiagnosticCode, N'Chưa cài đặt TVF dbo.API_Phase4JoinRegistry.' AS Message;
        RETURN;
    END;

    -- 2. Chuẩn hóa tham số đầu vào
    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @DetailKey = LTRIM(RTRIM(ISNULL(@DetailKey, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = '' OR @DetailKey = '' OR @UserName = ''
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_CONTEXT_REQUIRED' AS DiagnosticCode, N'WebFormName, DetailKey và UserName là bắt buộc.' AS Message;
        RETURN;
    END;

    -- 3. Resolve contract từ registry
    DECLARE @ApiList varchar(100),
            @ExpectedProcedure varchar(128),
            @ExpectedTableName varchar(128),
            @ExpectedPrimaryKey varchar(128),
            @IsReadOnly bit;

    SELECT TOP 1
        @ApiList = ApiList,
        @ExpectedProcedure = ExpectedProcedure,
        @ExpectedTableName = ExpectedTableName,
        @ExpectedPrimaryKey = ExpectedPrimaryKey,
        @IsReadOnly = IsReadOnly
    FROM dbo.API_Phase4JoinRegistry()
    WHERE LOWER(WebFormName) = LOWER(@WebFormName)
      AND LOWER(DetailKey) = LOWER(@DetailKey)
      AND EnableMetadata = 1;

    IF @ApiList IS NULL
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_CONTRACT_NOT_ALLOWLISTED' AS DiagnosticCode, N'DetailKey chưa được cho phép trong Phase 4 registry.' AS Message;
        RETURN;
    END;

    -- 4. Kiểm tra User
    IF NOT EXISTS (SELECT 1 FROM dbo.SY_User WHERE LOWER(UserName) = LOWER(@UserName) AND (Disable IS NULL OR Disable = 0))
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_ACTOR_INVALID' AS DiagnosticCode, N'Tài khoản không tồn tại hoặc đã bị khóa.' AS Message;
        RETURN;
    END;

    -- 5. Kiểm tra Active Menu
    IF NOT EXISTS (SELECT 1 FROM dbo.WA_Menu WHERE LOWER(FormName) = LOWER(@WebFormName) AND (Active IS NULL OR Active = 1))
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_ACTIVE_MENU_REQUIRED' AS DiagnosticCode, N'Menu cho form này chưa được kích hoạt.' AS Message;
        RETURN;
    END;

    -- 6. Kiểm tra Quyền Truy Cập (Permission Check)
    DECLARE @IsAdmin bit = 0;
    IF LOWER(@UserName) = 'admin' OR EXISTS (SELECT 1 FROM dbo.SY_User WHERE LOWER(UserName) = LOWER(@UserName) AND IsAdmin = 1)
        SET @IsAdmin = 1;

    IF @IsAdmin = 0
    BEGIN
        DECLARE @UserPerm int = NULL, @GroupPerm int = NULL;

        SELECT TOP 1 @UserPerm = Permisstion 
        FROM dbo.WA_UserPermisstion 
        WHERE LOWER(UserName) = LOWER(@UserName) AND LOWER(FormName) = LOWER(@WebFormName);

        SELECT TOP 1 @GroupPerm = ugp.Permisstion
        FROM dbo.WA_UserGroupPermisstion ugp
        INNER JOIN dbo.SY_UserGroupMember ugm ON LOWER(ugm.GroupID) = LOWER(ugp.GroupID)
        WHERE LOWER(ugm.UserName) = LOWER(@UserName) AND LOWER(ugp.FormName) = LOWER(@WebFormName);

        DECLARE @FinalPerm int = ISNULL(@UserPerm, ISNULL(@GroupPerm, 0));
        IF @FinalPerm <= 0
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_PERMISSION_DENIED' AS DiagnosticCode, N'Tài khoản không có quyền xem thông tin form này.' AS Message;
            RETURN;
        END;
    END;

    -- 7. Kiểm tra Chi Nhánh (Branch Check)
    IF @IsAdmin = 0
    BEGIN
        IF @BranchID = ''
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_BRANCH_REQUIRED' AS DiagnosticCode, N'Yêu cầu chi nhánh cho người dùng non-admin.' AS Message;
            RETURN;
        END;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.WA_UserBranch 
            WHERE LOWER(UserName) = LOWER(@UserName) 
              AND (LOWER(BranchID) = LOWER(@BranchID) OR BranchID = '*')
        )
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_BRANCH_DENIED' AS DiagnosticCode, N'Chi nhánh truy cập không hợp lệ.' AS Message;
            RETURN;
        END;
    END;

    -- 8. Kiểm tra Route duy nhất trong WA_API
    DECLARE @RegisteredProcedure varchar(128);
    SELECT TOP 1 @RegisteredProcedure = [SQL]
    FROM dbo.WA_API
    WHERE LOWER(list) = LOWER(@ApiList) AND LOWER(func) = 'view';

    IF @RegisteredProcedure IS NULL OR LOWER(@RegisteredProcedure) <> LOWER(@ExpectedProcedure)
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_VIEW_ROUTE_INVALID' AS DiagnosticCode, N'Route WA_API không hợp lệ hoặc không trỏ đúng procedure.' AS Message;
        RETURN;
    END;

    -- 9. Kiểm tra Procedure tồn tại
    DECLARE @ProcObjectID int = OBJECT_ID(@ExpectedProcedure, N'P');
    IF @ProcObjectID IS NULL
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_PROCEDURE_NOT_FOUND' AS DiagnosticCode, N'Không tìm thấy Stored Procedure.' AS Message;
        RETURN;
    END;

    -- 10. Kiểm tra Main Table tồn tại
    DECLARE @TableObjectID int = OBJECT_ID(@ExpectedTableName, N'U');
    IF @TableObjectID IS NULL
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_MAIN_TABLE_NOT_FOUND' AS DiagnosticCode, N'Không tìm thấy bảng dữ liệu chính.' AS Message;
        RETURN;
    END;

    -- 11. Kiểm tra Primary Key tồn tại trong Main Table
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @TableObjectID AND LOWER(name) = LOWER(@ExpectedPrimaryKey))
    BEGIN
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_PRIMARY_KEY_NOT_FOUND' AS DiagnosticCode, N'Không tìm thấy cột khóa chính trong bảng.' AS Message;
        RETURN;
    END;

    -- 12. Trích xuất Result-Set Metadata từ Procedure
    CREATE TABLE #ResultSet (
        column_ordinal int NOT NULL,
        name sysname NOT NULL,
        is_nullable bit NULL,
        system_type_name nvarchar(128) NULL,
        max_length smallint NULL
    );

    BEGIN TRY
        INSERT INTO #ResultSet (column_ordinal, name, is_nullable, system_type_name, max_length)
        SELECT 
            column_ordinal,
            name,
            is_nullable,
            system_type_name,
            max_length
        FROM sys.dm_exec_describe_first_result_set_for_object(@ProcObjectID, 0)
        WHERE is_hidden = 0 AND name IS NOT NULL AND name <> '';
    END TRY
    BEGIN CATCH
        DROP TABLE #ResultSet;
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_RESULTSET_METADATA_ERROR' AS DiagnosticCode, N'Không thể phân tích result-set metadata của procedure.' AS Message;
        RETURN;
    END CATCH;

    -- 13. Validate Result-Set
    IF NOT EXISTS (SELECT 1 FROM #ResultSet)
    BEGIN
        DROP TABLE #ResultSet;
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_RESULTSET_EMPTY' AS DiagnosticCode, N'Procedure không trả về result-set nào.' AS Message;
        RETURN;
    END;

    -- Duplicate field check
    IF EXISTS (SELECT name FROM #ResultSet GROUP BY LOWER(name) HAVING COUNT(*) > 1)
    BEGIN
        DROP TABLE #ResultSet;
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_DUPLICATE_FIELD' AS DiagnosticCode, N'Result-set có tên cột bị trùng lặp.' AS Message;
        RETURN;
    END;

    -- Primary Key check in result-set
    IF NOT EXISTS (SELECT 1 FROM #ResultSet WHERE LOWER(name) = LOWER(@ExpectedPrimaryKey))
    BEGIN
        DROP TABLE #ResultSet;
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_PRIMARY_KEY_NOT_IN_RESULT' AS DiagnosticCode, N'Result-set không chứa cột khóa chính.' AS Message;
        RETURN;
    END;

    -- Unsafe data type & sensitive name check
    IF EXISTS (
        SELECT 1 FROM #ResultSet 
        WHERE LOWER(system_type_name) LIKE '%binary%'
           OR LOWER(system_type_name) LIKE '%image%'
           OR LOWER(system_type_name) LIKE '%timestamp%'
           OR LOWER(system_type_name) LIKE '%xml%'
           OR LOWER(system_type_name) LIKE '%sql_variant%'
           OR LOWER(system_type_name) LIKE '%geography%'
           OR LOWER(system_type_name) LIKE '%geometry%'
           OR LOWER(system_type_name) LIKE '%hierarchyid%'
           OR LOWER(name) IN ('password', 'passwordhash', 'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext', 'content', 'base64content', 'filecontent', 'binarydata')
    )
    BEGIN
        DROP TABLE #ResultSet;
        SELECT CAST(0 AS bit) AS Success, N'PHASE4_JOIN_UNSAFE_RESULT_FIELD' AS DiagnosticCode, N'Result-set chứa kiểu dữ liệu hoặc cột nhạy cảm không an toàn.' AS Message;
        RETURN;
    END;

    -- 14. Trả về Metadata đầy đủ cho từng cột trong Result-Set
    SELECT
        '2.0' AS SchemaVersion,
        '1.0' AS ContractVersion,
        @WebFormName AS WebFormName,
        @DetailKey AS DetailKey,
        @ApiList AS ApiList,
        @ExpectedTableName AS TableName,
        @ExpectedPrimaryKey AS PrimaryKey,
        @ExpectedProcedure AS RegisteredViewProcedure,
        CAST(1 AS bit) AS ReadOnly,
        'JOIN_RESULT_SET' AS SourceKind,
        rs.column_ordinal AS FieldOrdinal,
        rs.name AS FieldName,
        rs.system_type_name AS SqlType,
        ISNULL(rs.is_nullable, 1) AS IsNullable,
        
        -- Physical column check: 1 nếu cột thực sự nằm trên bảng HR_SapCaChiTietTbl, 0 nếu do JOIN sinh ra
        CASE WHEN syscol.name IS NOT NULL THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS IsPhysicalColumn,
        
        -- Primary Key check: 1 nếu là UserAutoID
        CASE WHEN LOWER(rs.name) = LOWER(@ExpectedPrimaryKey) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS IsPrimaryKey,
        
        CAST(1 AS bit) AS IsReadOnly,
        
        -- Precedence Caption: 1. SY_FmtFldTbl của WebFormName, 2. SY_FmtFldTbl của ApiList, 3. global FormName NULL, 4. FieldName
        ISNULL(fmtForm.CaptionVN, ISNULL(fmtApi.CaptionVN, ISNULL(fmtGlobal.CaptionVN, rs.name))) AS Caption,
        
        ISNULL(fmtForm.FormatID, ISNULL(fmtApi.FormatID, fmtGlobal.FormatID)) AS FormatID,
        fmtTbl.Type AS FormatType,
        ISNULL(fmtForm.FormatID, ISNULL(fmtApi.FormatID, fmtGlobal.FormatID)) AS RenderType,
        fmtTbl.NumberDecimal AS NumberDecimal,
        fmtTbl.FormatString AS FormatString,
        fmtTbl.MaskString AS MaskString,
        rs.max_length AS MaxLength,
        NULL AS MinValue,
        NULL AS MaxValue,
        
        ISNULL(fmtForm.AlignX, ISNULL(fmtApi.AlignX, fmtGlobal.AlignX)) AS Align,
        ISNULL(fmtForm.MinWidth, ISNULL(fmtApi.MinWidth, ISNULL(fmtGlobal.MinWidth, 0))) AS MinWidth,
        ISNULL(fmtForm.MaxWidth, ISNULL(fmtApi.MaxWidth, ISNULL(fmtGlobal.MaxWidth, 0))) AS MaxWidth,
        
        drdw.KeyLookup AS LookupKey,
        drdw.LookupType AS LookupType,
        drdw.ValueColumn AS LookupValueColumn,
        drdw.DisplayColumn AS LookupDisplayColumn,
        drdw.Columns AS LookupColumns,
        drdw.Widths AS LookupWidths,
        drdw.DependsOn AS LookupDependsOn,
        drdw.MultiSelect AS LookupMultiSelect,
        drdw.ReloadMode AS LookupReloadMode,
        drdw.Disabled AS LookupDisabled,
        CAST(NULL AS varchar(80)) AS DiagnosticCode
    FROM #ResultSet rs
    LEFT JOIN sys.columns syscol ON syscol.object_id = @TableObjectID AND LOWER(syscol.name) = LOWER(rs.name)
    LEFT JOIN dbo.SY_FmtFldTbl fmtForm ON LOWER(fmtForm.FieldName) = LOWER(rs.name) AND LOWER(ISNULL(fmtForm.FormName, '')) = LOWER(@WebFormName)
    LEFT JOIN dbo.SY_FmtFldTbl fmtApi ON LOWER(fmtApi.FieldName) = LOWER(rs.name) AND LOWER(ISNULL(fmtApi.FormName, '')) = LOWER(@ApiList)
    LEFT JOIN dbo.SY_FmtFldTbl fmtGlobal ON LOWER(fmtGlobal.FieldName) = LOWER(rs.name) AND (fmtGlobal.FormName IS NULL OR LTRIM(RTRIM(fmtGlobal.FormName)) = '')
    LEFT JOIN dbo.SY_FmatTbl fmtTbl ON LOWER(fmtTbl.FormatID) = LOWER(ISNULL(fmtForm.FormatID, ISNULL(fmtApi.FormatID, fmtGlobal.FormatID)))
    LEFT JOIN dbo.SY_FrmDrdwTbl drdw ON LOWER(drdw.FieldName) = LOWER(rs.name) AND (LOWER(ISNULL(drdw.FormName, '')) = LOWER(@WebFormName) OR LOWER(ISNULL(drdw.FormName, '')) = LOWER(@ApiList))
    ORDER BY rs.column_ordinal;

    DROP TABLE #ResultSet;
END;
GO

PRINT N'✅ Đã khởi tạo thành công Stored Procedure dbo.API_Web_JoinFieldSchemaV2!';
GO
