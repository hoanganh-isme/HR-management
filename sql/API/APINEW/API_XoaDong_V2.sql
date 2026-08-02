-- =========================================================================
-- PROCEDURE: dbo.API_XoaDong_V2
-- DESCRIPTION: Framework Procedure V2 cho xóa dữ liệu (Delete).
-- Cập nhật: Cho phép xóa Detail API qua Contract Registry khi không có trong SY_FrmLstTbl.
-- =========================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
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

    -- Kiểm tra SY_FrmLstTbl nếu FormID có tồn tại trong SY_FrmLstTbl. Nếu không có (như Detail API), bỏ qua kiểm tra này.
    IF @RegistrationCount > 0 AND (
       @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    )
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

    -- Thực hiện gọi API_XoaDong (V1) để xóa dữ liệu mượt mà
    EXEC dbo.API_XoaDong @List = @List, @Ids = @Ids, @UserName = @UserName;
END;
GO
