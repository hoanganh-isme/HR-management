/*
  View V2 metadata-driven cho các form đã đăng ký route này.
  - Giữ nguyên các tham số của API_TruyVanDong đang được WA_API sử dụng.
  - Bổ sung UserName/BranchID tùy chọn để kiểm tra quyền phía SQL khi đăng ký V2.
  - Không đọc metadata layout cũ; không sửa dữ liệu.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
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
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE @CurrentProcedure sysname = OBJECT_NAME(@@PROCID);
    IF (
        SELECT COUNT(*)
        FROM dbo.WA_API AS A
        WHERE A.[list] = @List
          AND A.[func] = 'View'
          AND LOWER(LTRIM(RTRIM(A.[SQL]))) = LOWER(@CurrentProcedure)
    ) <> 1
        THROW 52101, N'WA_API View V2 chưa được đăng ký duy nhất cho form.', 1;

    IF @UserName = ''
        THROW 52102, N'Thiếu ngữ cảnh người dùng.', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID,
           @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 52103, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    /* PHASE2_BRANCH_FAIL_CLOSED */
    IF LOWER(@UserGroupID) <> 'admin'
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
            THROW 52118, N'Người dùng không phải admin chưa được gán chi nhánh; từ chối theo nguyên tắc fail-closed.', 1;
        IF @BranchID = ''
            THROW 52115, N'Thiếu ngữ cảnh chi nhánh của người dùng.', 1;
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
            THROW 52116, N'Chi nhánh nằm ngoài phạm vi người dùng.', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0;
    SELECT TOP (1)
        @MenuID = M.MenuID,
        @SkipPermission = ISNULL(M.isNotCheckPermission, 0)
    FROM dbo.WA_Menu AS M
    WHERE M.FormName = @List
      AND ISNULL(M.isDisable, 0) = 0
    ORDER BY M.MenuID;

    IF @MenuID IS NULL
        THROW 52104, N'Form chưa có menu hoạt động để kiểm tra quyền.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID = @UserGroupID
          AND P.MenuID = @MenuID;

        SELECT @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName = @UserName
          AND P.MenuID = @MenuID;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
            THROW 52105, N'Không có quyền xem dữ liệu của form.', 1;
    END;

    DECLARE @RegistryCount int, @RegistryTable sysname, @RegistryPrimaryKey sysname;
    SELECT
        @RegistryCount = COUNT(*),
        @RegistryTable = MIN(LTRIM(RTRIM(L.TableName))),
        @RegistryPrimaryKey = MIN(LTRIM(RTRIM(L.PrimaryKey)))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @List;

    IF ISNULL(@RegistryCount, 0) <> 1
       OR LTRIM(RTRIM(ISNULL(@RegistryTable, ''))) = ''
       OR LTRIM(RTRIM(ISNULL(@RegistryPrimaryKey, ''))) = ''
        THROW 52106, N'SY_FrmLstTbl chưa có duy nhất TableName/PrimaryKey cho View V2.', 1;

    DECLARE @TableObjectID int = COALESCE(
        OBJECT_ID(@RegistryTable, N'U'),
        OBJECT_ID(N'dbo.' + @RegistryTable, N'U')
    );
    DECLARE @PhysicalSchema sysname, @PhysicalTable sysname;
    SELECT @PhysicalSchema = S.name, @PhysicalTable = T.name
    FROM sys.tables AS T
    INNER JOIN sys.schemas AS S ON S.schema_id = T.schema_id
    WHERE T.object_id = @TableObjectID;

    IF @TableObjectID IS NULL OR @PhysicalSchema IS NULL OR @PhysicalTable IS NULL
        THROW 52107, N'Không tìm thấy bảng nghiệp vụ đã đăng ký.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @TableObjectID
          AND (
                LOWER(C.name) IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                  'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
             OR LOWER(T.name) IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                  'sql_variant', 'geography', 'geometry', 'hierarchyid')
          )
    )
        THROW 52108, N'Pilot có cột kỹ thuật/blob thuộc deny-list; MAIN_TABLE_STAR bị chặn.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = @TableObjectID
          AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
        THROW 52109, N'Pilot không còn là danh mục toàn cục; cần bổ sung isolation trước khi chạy.', 1;

    -- IF EXISTS (
    --     SELECT 1
    --     FROM sys.columns
    --     WHERE object_id = @TableObjectID
    --       AND (
    --             LOWER(name) LIKE '%password%'
    --          OR LOWER(name) LIKE '%token%'
    --          OR LOWER(name) LIKE '%secret%'
    --          OR LOWER(name) LIKE '%bank%'
    --          OR LOWER(name) LIKE '%cccd%'
    --          OR LOWER(name) LIKE '%cmnd%'
    --          OR LOWER(name) LIKE '%bhxh%'
    --          OR LOWER(name) LIKE '%salary%'
    --          OR LOWER(name) LIKE '%luong%'
    --          OR LOWER(name) LIKE '%email%'
    --          OR LOWER(name) LIKE '%phone%'
    --          OR LOWER(name) LIKE '%dienthoai%'
    --          OR LOWER(name) LIKE '%diachi%'
    --       )
    -- )
    --     THROW 52110, N'Pilot xuất hiện cột dữ liệu nhạy cảm ngoài contract danh mục; cần audit lại.', 1;

    DECLARE @HasSoftDelete bit = CASE WHEN EXISTS (
        SELECT 1
        FROM sys.columns AS C
        JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @TableObjectID
          AND LOWER(C.name) = 'isdeleted'
          AND LOWER(T.name) = 'bit'
    ) THEN 1 ELSE 0 END;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @TableObjectID
          AND LOWER(C.name) = 'isdeleted'
          AND LOWER(T.name) <> 'bit'
    )
        THROW 52113, N'IsDeleted của pilot phải có kiểu bit.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = @TableObjectID
          AND LOWER(name) = LOWER(@RegistryPrimaryKey)
    )
        THROW 52111, N'Pilot thiếu khóa chính vật lý đã đăng ký.', 1;

    IF @Data <> N'' AND (ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{')
        THROW 52112, N'JsonData bộ lọc không hợp lệ.', 1;

    IF @Data = N'' SET @Data = N'{}';

    /* PHASE2_UNIFIED_FIELD_CONTRACT: field mới an toàn dùng cùng sys.columns với metadata và Save V2. */
    IF ISJSON(@Data) = 1 AND EXISTS (
        SELECT LOWER(J.[key])
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key])
        HAVING COUNT(*) > 1
    )
        THROW 52117, N'JsonData có khóa lặp; từ chối contract không xác định.', 1;

    DECLARE @DataBranchID nvarchar(max) = NULL;
    IF ISJSON(@Data) = 1
        SELECT TOP (1) @DataBranchID = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) = 'branchid';

    IF @DataBranchID IS NOT NULL
    BEGIN
        IF LOWER(@UserGroupID) <> 'admin' AND @BranchID = ''
            THROW 52119, N'Thiếu ngữ cảnh chi nhánh trong request View.', 1;
        IF @BranchID <> '' AND EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@DataBranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
                  WHERE UPPER(LTRIM(RTRIM(ContextBranch.[value]))) = UPPER(LTRIM(RTRIM(Requested.[value])))
              )
        )
            THROW 52120, N'BranchID trong JsonData vượt ngữ cảnh request.', 1;
    END;

    IF ISJSON(@Data) = 1 AND EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) NOT IN ('keyword', 'branchid')
          AND NOT EXISTS (
              SELECT 1
              FROM sys.columns AS C
              JOIN sys.types AS T ON T.user_type_id = C.user_type_id
              WHERE C.object_id = @TableObjectID
                AND LOWER(C.name) COLLATE DATABASE_DEFAULT = LOWER(J.[key]) COLLATE DATABASE_DEFAULT
                AND C.is_computed = 0
                AND LOWER(T.name) NOT IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                          'sql_variant', 'geography', 'geometry', 'hierarchyid')
                AND LOWER(C.name) NOT IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                          'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext',
                                          'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                          'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                                          'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
          )
    )
        THROW 52114, N'Bộ lọc chứa field không thuộc Form Contract V2.', 1;

    IF @SortColumn = '' AND @SortDir = '' SET @SortDir = 'DESC';
    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'ASC';
    DECLARE @ResolvedSortColumn sysname;
    SELECT TOP (1) @ResolvedSortColumn = C.name
    FROM sys.columns AS C
    JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @TableObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT = LOWER(CASE WHEN @SortColumn = '' THEN @RegistryPrimaryKey ELSE @SortColumn END) COLLATE DATABASE_DEFAULT
      AND C.is_computed = 0
      AND LOWER(T.name) NOT IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                'sql_variant', 'geography', 'geometry', 'hierarchyid')
      AND LOWER(C.name) NOT IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext',
                                'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                                'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat');

    IF @ResolvedSortColumn IS NULL
        THROW 52121, N'Cột sắp xếp không thuộc Form Contract V2.', 1;

    /*
      MAIN_TABLE_STAR_APPROVED.
      TableName chỉ lấy từ SY_FrmLstTbl rồi đối chiếu sys.tables; giá trị filter/sort luôn parameterized.
      Danh sách field không ghép tay: T.* tự nhận cột vật lý mới, metadata lấy cùng nguồn sys.columns.
    */
    DECLARE @Sql nvarchar(max) = N'
        SELECT T.*
        FROM ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' AS T
        CROSS APPLY (
            SELECT (SELECT T.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES) AS RowJson
        ) AS R
        OUTER APPLY (
            SELECT TOP (1) J.[value] AS SortValue, J.[type] AS SortJsonType
            FROM OPENJSON(R.RowJson) AS J
            WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(@ResolvedSortColumn) COLLATE DATABASE_DEFAULT
        ) AS S
        OUTER APPLY (
            SELECT TOP (1) J.[value] AS PrimaryValue, J.[type] AS PrimaryJsonType
            FROM OPENJSON(R.RowJson) AS J
            WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(@RegistryPrimaryKey) COLLATE DATABASE_DEFAULT
        ) AS P
        WHERE (
            @Keyword = N''''
            OR EXISTS (
                SELECT 1
                FROM OPENJSON(R.RowJson) AS K
                WHERE K.[type] <> 0
                  AND EXISTS (
                      SELECT 1
                      FROM sys.columns AS C
                      JOIN sys.types AS TY ON TY.user_type_id = C.user_type_id
                      WHERE C.object_id = @TableObjectID
                        AND LOWER(C.name) COLLATE DATABASE_DEFAULT = LOWER(K.[key]) COLLATE DATABASE_DEFAULT
                        AND C.is_computed = 0
                        AND LOWER(TY.name) NOT IN (''binary'', ''varbinary'', ''image'', ''timestamp'', ''rowversion'', ''xml'', ''text'', ''ntext'',
                                                   ''sql_variant'', ''geography'', ''geometry'', ''hierarchyid'')
                        AND LOWER(C.name) NOT IN (''content'', ''base64content'', ''filecontent'', ''binarydata'', ''password'', ''passwordhash'',
                                                  ''token'', ''refreshtoken'', ''secret'', ''rawsql'', ''commandtext'',
                                                  ''usercreate'', ''createdby'', ''createby'', ''datecreate'', ''createddate'', ''createdat'',
                                                  ''userupdate'', ''updatedby'', ''updateby'', ''dateupdate'', ''updateddate'', ''updatedat'',
                                                  ''isdeleted'', ''userdelete'', ''deletedby'', ''deleteby'', ''datedelete'', ''deleteddate'', ''deletedat'')
                  )
                  AND CONVERT(nvarchar(4000), K.[value]) LIKE N''%'' + @Keyword + N''%''
            )
        )
          AND NOT EXISTS (
              SELECT 1
              FROM OPENJSON(@Data) AS F
              WHERE LOWER(F.[key]) NOT IN (''keyword'', ''branchid'')
                AND NOT EXISTS (
                    SELECT 1
                    FROM OPENJSON(R.RowJson) AS V
                    WHERE LOWER(V.[key]) COLLATE DATABASE_DEFAULT = LOWER(F.[key]) COLLATE DATABASE_DEFAULT
                      AND V.[type] <> 0
                      AND CONVERT(nvarchar(4000), V.[value]) LIKE N''%'' + CONVERT(nvarchar(4000), F.[value]) + N''%''
                )
          )
          /* PHASE2_SOFT_DELETE_FILTER */
          AND (
              @HasSoftDelete = 0
              OR NOT EXISTS (
                  SELECT 1
                  FROM OPENJSON(R.RowJson) AS SD
                  WHERE LOWER(SD.[key]) = ''isdeleted''
                    AND TRY_CONVERT(bit, SD.[value]) = 1
              )
          )
        ORDER BY
            CASE WHEN @SortDir = ''ASC''  AND S.SortJsonType = 2 THEN TRY_CONVERT(decimal(38, 10), S.SortValue) END ASC,
            CASE WHEN @SortDir = ''DESC'' AND S.SortJsonType = 2 THEN TRY_CONVERT(decimal(38, 10), S.SortValue) END DESC,
            CASE WHEN @SortDir = ''ASC''  AND S.SortJsonType <> 2 THEN S.SortValue END ASC,
            CASE WHEN @SortDir = ''DESC'' AND S.SortJsonType <> 2 THEN S.SortValue END DESC,
            CASE WHEN P.PrimaryJsonType = 2 THEN TRY_CONVERT(decimal(38, 10), P.PrimaryValue) END DESC,
            CASE WHEN P.PrimaryJsonType <> 2 THEN P.PrimaryValue END DESC;';

    EXEC sys.sp_executesql
        @Sql,
        N'@Keyword nvarchar(200), @Data nvarchar(max), @ResolvedSortColumn sysname, @RegistryPrimaryKey sysname,
          @SortDir varchar(10), @HasSoftDelete bit, @TableObjectID int',
        @Keyword = @Keyword,
        @Data = @Data,
        @ResolvedSortColumn = @ResolvedSortColumn,
        @RegistryPrimaryKey = @RegistryPrimaryKey,
        @SortDir = @SortDir,
        @HasSoftDelete = @HasSoftDelete,
        @TableObjectID = @TableObjectID;
END;
GO
