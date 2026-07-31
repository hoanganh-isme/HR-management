/*
  Lookup V2 chỉ đọc WA_FieldUiContractV2. Mỗi dropdown trỏ trực tiếp đến một
  route View duy nhất trong WA_API; route đó gọi API_* tương ứng.
  Không đọc SY_FrmDrdwTbl, không nhận và không thực thi raw SQL.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
    THROW 51100, N'LOOKUP_CONTRACT_V2_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_Web_LookupSchemaV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_LookupSchemaV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_LookupSchemaV2
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

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @LookupKey = UPPER(LTRIM(RTRIM(ISNULL(@LookupKey, ''))));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @Page = CASE WHEN ISNULL(@Page, 0) < 1 THEN 1 ELSE @Page END;
    SET @PageSize =
        CASE
            WHEN ISNULL(@PageSize, 0) < 1 THEN 30
            WHEN @PageSize > 100 THEN 100
            ELSE @PageSize
        END;

    IF @WebFormName = ''
       OR LEN(@LookupKey) <> 64
       OR @LookupKey LIKE '%[^0-9A-F]%'
        THROW 51101, N'LOOKUP_CONTRACT_V2_REQUEST_INVALID', 1;

    DECLARE
        @UserGroupID varchar(50),
        @UserBranches varchar(max);

    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51102, N'LOOKUP_CONTRACT_V2_ACTOR_INVALID', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND NOT EXISTS
       (
            SELECT 1
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS P
              ON P.MenuID = M.MenuID
             AND P.UserGroupID = @UserGroupID
            WHERE M.FormName = @WebFormName
              AND ISNULL(M.isDisable, 0) = 0
              AND
              (
                  ISNULL(M.isNotCheckPermission, 0) = 1
                  OR ISNULL(P.IsRun, 0) = 1
              )
       )
        THROW 51103, N'LOOKUP_CONTRACT_V2_PERMISSION_DENIED', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND LTRIM(RTRIM(ISNULL(@UserBranches, ''))) <> ''
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@BranchID, ''))) = ''
            THROW 51104, N'LOOKUP_CONTRACT_V2_BRANCH_CONTEXT_REQUIRED', 1;

        IF EXISTS
        (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) =
                        LTRIM(RTRIM(Requested.[value]))
              )
        )
            THROW 51105, N'LOOKUP_CONTRACT_V2_BRANCH_SCOPE_DENIED', 1;
    END;

    DECLARE
        @RegisteredList varchar(50),
        @ValueColumn sysname,
        @DisplayColumn sysname;

    SELECT TOP (1)
        @RegisteredList = U.LookupList,
        @ValueColumn = U.LookupValueColumn,
        @DisplayColumn = U.LookupDisplayColumn
    FROM dbo.WA_FieldUiContractV2 AS U
    WHERE U.WebFormName = @WebFormName
      AND U.IsEnabled = 1
      AND U.LookupList IS NOT NULL
      AND U.LookupValueColumn IS NOT NULL
      AND U.LookupDisplayColumn IS NOT NULL
      AND CONVERT
      (
          varchar(64),
          HASHBYTES
          (
              'SHA2_256',
              UPPER
              (
                  LTRIM
                  (
                      RTRIM
                      (
                          CONVERT
                          (
                              varchar(max),
                              CONCAT
                              (
                                  U.LookupList, '|',
                                  U.LookupValueColumn, '|',
                                  U.LookupDisplayColumn, '|',
                                  ISNULL(U.LookupColumns, N''), '|',
                                  ISNULL(U.LookupDependsOn, N''), '|',
                                  CONVERT(varchar(1), U.LookupMultiSelect)
                              )
                          )
                      )
                  )
              )
          ),
          2
      ) = @LookupKey
    ORDER BY
        CASE WHEN U.DatasetKey = 'MAIN' THEN 1 ELSE 2 END,
        U.DatasetKey,
        U.FieldName;

    IF @RegisteredList IS NULL
    BEGIN
        SELECT
            'BLOCKED' AS LookupMode,
            CAST(1 AS bit) AS Blocked,
            'LOOKUP_KEY_NOT_FOUND' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            CAST(NULL AS sysname) AS ValueColumn,
            CAST(NULL AS sysname) AS DisplayColumn;
        RETURN;
    END;

    IF @ValueColumn = ''
       OR @DisplayColumn = ''
       OR PATINDEX('%[^A-Za-z0-9_@$#]%', @ValueColumn COLLATE Latin1_General_100_BIN2) > 0
       OR PATINDEX('%[^A-Za-z0-9_@$#]%', @DisplayColumn COLLATE Latin1_General_100_BIN2) > 0
    BEGIN
        SELECT
            'BLOCKED' AS LookupMode,
            CAST(1 AS bit) AS Blocked,
            'LOOKUP_COLUMNS_NOT_CONFIGURED' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    IF EXISTS
       (
            SELECT 1
            FROM dbo.WA_API AS A
            WHERE LOWER(LTRIM(RTRIM(A.[func]))) = 'view'
              AND A.[list] = @RegisteredList
       )
       AND NOT EXISTS
       (
            SELECT 1
            FROM dbo.WA_API AS A
            WHERE LOWER(LTRIM(RTRIM(A.[func]))) = 'view'
              AND A.[list] = @RegisteredList
            GROUP BY A.[list], LOWER(LTRIM(RTRIM(A.[func])))
            HAVING COUNT(*) > 1
       )
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
