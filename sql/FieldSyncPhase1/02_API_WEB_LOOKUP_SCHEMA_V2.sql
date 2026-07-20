/*
  Lookup V2 chỉ trả danh sách tĩnh hoặc tên API View đã đăng ký.
  Source dạng câu lệnh không bao giờ được thực thi hay trả về client.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
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

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @Page = CASE WHEN ISNULL(@Page, 0) < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN ISNULL(@PageSize, 0) < 1 THEN 30 WHEN @PageSize > 100 THEN 100 ELSE @PageSize END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51101, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND NOT EXISTS (
            SELECT 1
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS P
              ON P.MenuID = M.MenuID AND P.UserGroupID = @UserGroupID
            WHERE M.FormName = @WebFormName
              AND ISNULL(M.isDisable, 0) = 0
              AND (ISNULL(M.isNotCheckPermission, 0) = 1 OR ISNULL(P.IsRun, 0) = 1)
       )
        THROW 51102, N'Không có quyền đọc lookup của form.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND LTRIM(RTRIM(ISNULL(@UserBranches, ''))) <> ''
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@BranchID, ''))) = ''
            THROW 51103, N'Thiếu ngữ cảnh chi nhánh.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                    WHERE LTRIM(RTRIM(Allowed.[value])) = LTRIM(RTRIM(Requested.[value]))
              )
        )
            THROW 51104, N'Chi nhánh nằm ngoài phạm vi được cấp.', 1;
    END;

    DECLARE
        @Source nvarchar(max),
        @LookupType varchar(10),
        @ValueColumn varchar(50),
        @DisplayColumn varchar(50),
        @ResolvedKey varchar(64);

    SELECT TOP (1)
        @Source = D.[Source],
        @LookupType = D.[Type],
        @ValueColumn = D.ValueColumn,
        @DisplayColumn = D.DisplayColumn,
        @ResolvedKey = CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2)
    FROM dbo.SY_FrmDrdwTbl AS D
    WHERE LOWER(ISNULL(D.FormID, '')) IN (LOWER(@ERPFormID), LOWER(@WebFormName))
      AND ISNULL(D.IsDisable, 0) = 0
      AND CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2) = @LookupKey
    ORDER BY CASE WHEN LOWER(ISNULL(D.FormID, '')) = LOWER(@ERPFormID) THEN 1 ELSE 2 END, D.UserAutoID;

    IF @ResolvedKey IS NULL
    BEGIN
        SELECT
            'BLOCKED' AS LookupMode,
            CAST(1 AS bit) AS Blocked,
            'LOOKUP_KEY_NOT_FOUND' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    IF UPPER(ISNULL(@LookupType, '')) = 'VALUELIST'
    BEGIN
        DECLARE @Values table (Ordinal int IDENTITY(1, 1), Item nvarchar(500));
        DECLARE @Work nvarchar(max) = ISNULL(@Source, N''), @Separator int, @Item nvarchar(500);

        WHILE LEN(@Work) > 0 AND (SELECT COUNT(*) FROM @Values) < 500
        BEGIN
            SET @Separator = CHARINDEX(';', @Work);
            IF @Separator = 0
            BEGIN
                SET @Item = LTRIM(RTRIM(@Work));
                SET @Work = N'';
            END
            ELSE
            BEGIN
                SET @Item = LTRIM(RTRIM(LEFT(@Work, @Separator - 1)));
                SET @Work = SUBSTRING(@Work, @Separator + 1, LEN(@Work));
            END;
            IF @Item <> N'' INSERT INTO @Values(Item) VALUES (@Item);
        END;

        SELECT
            'VALUE_LIST' AS LookupMode,
            CAST(0 AS bit) AS Blocked,
            'OK' AS DiagnosticCode,
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN LEFT(V.Item, CHARINDEX('|', V.Item) - 1) ELSE V.Item END AS [Value],
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN SUBSTRING(V.Item, CHARINDEX('|', V.Item) + 1, LEN(V.Item)) ELSE V.Item END AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn
        FROM @Values AS V
        WHERE @Keyword = N'' OR V.Item LIKE N'%' + @Keyword + N'%'
        ORDER BY V.Ordinal
        OFFSET ((@Page - 1) * @PageSize) ROWS FETCH NEXT @PageSize ROWS ONLY;
        RETURN;
    END;

    DECLARE @RegisteredList varchar(50);
    SELECT @RegisteredList = MIN(A.[list])
    FROM dbo.WA_API AS A
    WHERE LOWER(A.[func]) = 'view'
      AND LOWER(A.[list]) = LOWER(LTRIM(RTRIM(@Source)))
    GROUP BY A.[list]
    HAVING COUNT(*) = 1;

    IF @RegisteredList IS NOT NULL
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
