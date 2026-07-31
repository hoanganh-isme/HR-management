/*
  API_XoaDong_V2 - tự chọn chế độ xóa theo schema vật lý.
  - Có IsDeleted kiểu bit: xóa mềm; các cột audit là tùy chọn và do server ghi.
  - Không có IsDeleted: xóa cứng trong transaction; FK của DB vẫn được tôn trọng.
*/
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

    DECLARE @TableName sysname, @PrimaryKey sysname, @ObjectID int, @RowsAffected int = 0;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Ids = LTRIM(RTRIM(ISNULL(@Ids, N'')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE @RouteCount int, @CurrentProcedure sysname = OBJECT_NAME(@@PROCID);
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] = @List
      AND A.[func] = 'Delete'
      AND LOWER(LTRIM(RTRIM(A.[SQL]))) = LOWER(@CurrentProcedure);

    IF ISNULL(@RouteCount, 0) <> 1
    BEGIN
        SELECT -1 AS code, N'WA_API Delete V2 chưa được đăng ký duy nhất cho form.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    IF @UserName = ''
    BEGIN
        SELECT -1 AS code, N'Thiếu ngữ cảnh người dùng.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    IF @Data <> N'' AND (ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{')
    BEGIN
        SELECT -1 AS code, N'JsonData Delete phải là JSON object hợp lệ.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    IF ISJSON(@Data) = 1 AND EXISTS (
        SELECT LOWER(J.[key])
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key])
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'JSON có khóa lặp; từ chối contract không xác định.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @DataBranchID nvarchar(max) = NULL,
            @DataUserName varchar(100) = NULL;
    IF ISJSON(@Data) = 1
    BEGIN
        SELECT TOP (1) @DataBranchID = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) = 'branchid';
        SELECT TOP (1) @DataUserName = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) = 'username';
    END;
    IF @DataUserName IS NOT NULL AND LOWER(@DataUserName) <> LOWER(@UserName)
    BEGIN
        SELECT -1 AS code, N'UserName trong JsonData không khớp actor phía server.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RegistryCount int;
    SELECT
        @RegistryCount = COUNT(*),
        @TableName = MIN(LTRIM(RTRIM(L.TableName))),
        @PrimaryKey = MIN(LTRIM(RTRIM(L.PrimaryKey)))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @List;

    IF ISNULL(@RegistryCount, 0) <> 1
       OR LTRIM(RTRIM(ISNULL(@TableName, ''))) = ''
       OR LTRIM(RTRIM(ISNULL(@PrimaryKey, ''))) = ''
    BEGIN
        SELECT -1 AS code, N'SY_FrmLstTbl chưa có duy nhất TableName/PrimaryKey cho Delete V2.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    SET @ObjectID = COALESCE(
        OBJECT_ID(@TableName, N'U'),
        OBJECT_ID(N'dbo.' + @TableName, N'U')
    );
    DECLARE @PhysicalSchema sysname, @PhysicalTable sysname;
    SELECT @PhysicalSchema = S.name, @PhysicalTable = T.name
    FROM sys.tables AS T
    INNER JOIN sys.schemas AS S ON S.schema_id = T.schema_id
    WHERE T.object_id = @ObjectID;

    DECLARE @RegistryPrimaryKey sysname = @PrimaryKey;
    SET @PrimaryKey = NULL;
    SELECT TOP (1) @PrimaryKey = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) = LOWER(@RegistryPrimaryKey);

    IF @ObjectID IS NULL OR @PhysicalSchema IS NULL OR @PhysicalTable IS NULL OR @PrimaryKey IS NULL
    BEGIN
        SELECT -1 AS code, N'Không tìm thấy bảng hoặc khóa chính vật lý.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

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
           AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
    )
    BEGIN
        SELECT -1 AS code, N'Khóa chính pilot chưa được chứng minh là duy nhất ở DB.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    /* Pilot hiện được phân loại là danh mục toàn cục; schema có scope mới phải được audit lại. */
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = @ObjectID
          AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
    BEGIN
        SELECT -1 AS code, N'Bảng đã có cột scope; Delete V2 cần policy chi nhánh riêng.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max), @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT @UserGroupID = U.UserGroupID,
           @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND ISNULL(U.Disable, 0) = 0;

    SELECT TOP (1) @MenuID = M.MenuID, @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName = @List
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @UserGroupID IS NULL OR @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'Không xác minh được người dùng/menu.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    /* PHASE2_BRANCH_FAIL_CLOSED */
    IF LOWER(@UserGroupID) <> 'admin'
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
        BEGIN
            SELECT -1 AS code, N'Người dùng không phải admin chưa được gán chi nhánh; từ chối theo nguyên tắc fail-closed.' AS msg, 0 AS rowsAffected;
            RETURN;
        END;
        IF @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'Thiếu ngữ cảnh chi nhánh của người dùng.' AS msg, 0 AS rowsAffected;
            RETURN;
        END;
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
        BEGIN
            SELECT -1 AS code, N'Chi nhánh nằm ngoài phạm vi người dùng.' AS msg, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    IF @DataBranchID IS NOT NULL AND @BranchID = '' AND LOWER(@UserGroupID) <> 'admin'
    BEGIN
        SELECT -1 AS code, N'Thiếu ngữ cảnh chi nhánh trong JsonData Delete.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;
    IF @DataBranchID IS NOT NULL AND @BranchID <> '' AND EXISTS (
        SELECT 1
        FROM STRING_SPLIT(@DataBranchID, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1
              FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
              WHERE UPPER(LTRIM(RTRIM(ContextBranch.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
          )
    )
    BEGIN
        SELECT -1 AS code, N'BranchID trong JsonData vượt ngữ cảnh request.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    /* PHASE2_PERMISSION_RUN_GATE */
    IF LOWER(@UserGroupID) <> 'admin' AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupAllowed bit, @UserAllowed bit, @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupAllowed = P.IsDelete,
               @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID = @UserGroupID AND P.MenuID = @MenuID;

        SELECT @UserAllowed = P.IsDelete,
               @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName = @UserName AND P.MenuID = @MenuID;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
           OR ISNULL(@UserAllowed, ISNULL(@GroupAllowed, 0)) <> 1
        BEGIN
            SELECT -1 AS code, N'Không có quyền xóa.' AS msg, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    IF (@Ids = N'' OR @Ids = N'{Ids}') AND ISJSON(@Data) = 1
    BEGIN
        SELECT TOP (1) @Ids = CONVERT(nvarchar(max), J.[value])
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT;
    END;

    IF DATALENGTH(@Ids) > 4000
    BEGIN
        SELECT -1 AS code, N'Danh sách ID vượt giới hạn an toàn.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    CREATE TABLE #DeleteIds (
        IdValue nvarchar(4000) NOT NULL PRIMARY KEY
    );

    INSERT INTO #DeleteIds (IdValue)
    SELECT DISTINCT LTRIM(RTRIM(S.[value]))
    FROM STRING_SPLIT(@Ids, ',') AS S
    WHERE LTRIM(RTRIM(S.[value])) <> N'';

    IF NOT EXISTS (SELECT 1 FROM #DeleteIds) OR (SELECT COUNT(*) FROM #DeleteIds) > 100
    BEGIN
        SELECT -1 AS code, N'Danh sách ID rỗng hoặc vượt giới hạn 100.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @PrimarySqlType nvarchar(256);
    SELECT @PrimarySqlType = TYPE_NAME(C.user_type_id)
      + CASE
            WHEN TYPE_NAME(C.user_type_id) IN ('varchar', 'char')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN TYPE_NAME(C.user_type_id) IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN TYPE_NAME(C.user_type_id) IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            ELSE ''
        END
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID AND C.name = @PrimaryKey;

    IF @PrimarySqlType IS NULL
    BEGIN
        SELECT -1 AS code, N'Không xác định được kiểu khóa chính.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @InvalidIDCount int = 0, @Sql nvarchar(max);
    SET @Sql = N'SELECT @Bad = COUNT(*) FROM #DeleteIds WHERE TRY_CONVERT(' + @PrimarySqlType + N', IdValue) IS NULL;';
    EXEC sys.sp_executesql @Sql, N'@Bad int OUTPUT', @Bad = @InvalidIDCount OUTPUT;

    IF @InvalidIDCount > 0
    BEGIN
        SELECT -1 AS code, N'Danh sách ID có giá trị không đúng kiểu khóa chính.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @IsDeletedColumn sysname, @DeletedByColumn sysname, @DeletedDateColumn sysname, @IsDeletedType sysname;
    SELECT TOP (1) @IsDeletedColumn = C.name FROM sys.columns AS C WHERE C.object_id = @ObjectID AND LOWER(C.name) = 'isdeleted';
    SELECT TOP (1) @IsDeletedType = T.name
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID AND LOWER(C.name) = 'isdeleted';
    SELECT TOP (1) @DeletedByColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID AND LOWER(C.name) IN ('deletedby', 'userdelete')
    ORDER BY C.column_id;

    SELECT TOP (1) @DeletedDateColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID AND LOWER(C.name) IN ('deleteddate', 'deletedat', 'datedelete')
    ORDER BY C.column_id;

    /* PHASE2_AUTO_DELETE_MODE: chỉ thiếu IsDeleted mới chuyển sang hard-delete. */
    IF @IsDeletedColumn IS NOT NULL AND LOWER(ISNULL(@IsDeletedType, '')) <> 'bit'
    BEGIN
        SELECT -1 AS code, N'IsDeleted phải có kiểu bit để thực hiện xóa mềm.' AS msg, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RequestedCount int = (SELECT COUNT(*) FROM #DeleteIds);
    DECLARE @DeleteMode varchar(10) = CASE WHEN @IsDeletedColumn IS NOT NULL THEN 'SOFT' ELSE 'HARD' END;
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
                UPDATE T
                SET ' + @UpdateSet + N'
                FROM ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey) + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue)
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
                FROM ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey) + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue);
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@OutRows int OUTPUT',
                @OutRows = @RowsAffected OUTPUT;
        END;

        IF @RowsAffected <= 0 OR @RowsAffected <> @RequestedCount
        BEGIN
            IF @DeleteMode = 'SOFT'
                THROW 52301, N'Không tìm thấy đủ dòng phù hợp để xóa mềm.', 1;
            THROW 52302, N'Không tìm thấy đủ dòng phù hợp để xóa cứng.', 1;
        END;

        COMMIT TRANSACTION;
        SELECT
            0 AS code,
            CASE WHEN @DeleteMode = 'SOFT' THEN N'Xóa mềm V2 thành công.' ELSE N'Xóa cứng V2 thành công.' END AS msg,
            @RowsAffected AS rowsAffected,
            @DeleteMode AS deleteMode;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SELECT -1 AS code, N'Không thể xóa dữ liệu V2. Mã lỗi: ' + CONVERT(nvarchar(20), ERROR_NUMBER()) AS msg, 0 AS rowsAffected;
    END CATCH;
END;
GO
