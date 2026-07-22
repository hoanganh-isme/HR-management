/*
  API_LuuDong_V2 - CRUD V2 metadata-driven cho route đã đăng ký.
  TableName/PrimaryKey/field lấy từ SY_FrmLstTbl + sys.columns; không runtime DDL,
  không đọc SY_FormatFields và không nhận tên bảng từ client.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_LuuDong_V2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_LuuDong_V2
    @List varchar(50),
    @Data nvarchar(max),
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @RowsAffected int = 0;
    DECLARE @PrimaryValue nvarchar(4000) = NULL;
    DECLARE @PrimaryKey sysname;
    DECLARE @TableName sysname;
    DECLARE @ObjectID int;

    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE @RouteCount int, @CurrentProcedure sysname = OBJECT_NAME(@@PROCID);
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] = @List
      AND A.[func] = 'Save'
      AND LOWER(LTRIM(RTRIM(A.[SQL]))) = LOWER(@CurrentProcedure);

    IF ISNULL(@RouteCount, 0) <> 1
    BEGIN
        SELECT -1 AS code, N'WA_API Save V2 chưa được đăng ký duy nhất cho form.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @UserName = '' OR ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'Thiếu người dùng hoặc JSON object không hợp lệ.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT LOWER(J.[key])
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key])
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'JSON có khóa lặp; từ chối contract không xác định.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @DataBranchID nvarchar(max) = NULL,
            @DataUserName varchar(100) = NULL;
    SELECT TOP (1) @DataBranchID = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) = 'branchid';
    SELECT TOP (1) @DataUserName = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) = 'username';
    IF @DataUserName IS NOT NULL AND LOWER(@DataUserName) <> LOWER(@UserName)
    BEGIN
        SELECT -1 AS code, N'UserName trong JsonData không khớp actor phía server.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
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
        SELECT -1 AS code, N'SY_FrmLstTbl chưa có duy nhất TableName/PrimaryKey cho Save V2.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
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

    IF @ObjectID IS NULL OR @PhysicalSchema IS NULL OR @PhysicalTable IS NULL
    BEGIN
        SELECT -1 AS code, N'Không tìm thấy bảng nghiệp vụ đã đăng ký.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    /* Không giữ lại tên PK từ registry nếu cột vật lý không tồn tại. */
    DECLARE @RegistryPrimaryKey sysname = @PrimaryKey;
    SET @PrimaryKey = NULL;
    SELECT TOP (1) @PrimaryKey = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) = LOWER(@RegistryPrimaryKey);

    IF @PrimaryKey IS NULL
    BEGIN
        SELECT -1 AS code, N'Không tìm thấy khóa chính vật lý.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    /* Save chỉ chạy với một cột PK có unique index/PK vật lý đã xác minh. */
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
        SELECT -1 AS code, N'Khóa chính pilot chưa được chứng minh là duy nhất ở DB.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    /* Pilot là danh mục toàn cục. Nếu schema xuất hiện scope thì fail-closed để tránh vượt chi nhánh/tenant. */
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = @ObjectID
          AND LOWER(name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
    BEGIN
        SELECT -1 AS code, N'Bảng đã có cột scope; Save V2 cần policy chi nhánh riêng.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
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
        SELECT -1 AS code, N'Không xác minh được người dùng/menu.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    /* PHASE2_BRANCH_FAIL_CLOSED */
    IF LOWER(@UserGroupID) <> 'admin'
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
        BEGIN
            SELECT -1 AS code, N'Người dùng không phải admin chưa được gán chi nhánh; từ chối theo nguyên tắc fail-closed.' AS msg,
                   @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
        IF @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'Thiếu ngữ cảnh chi nhánh của người dùng.' AS msg,
                   @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
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
            SELECT -1 AS code, N'Chi nhánh nằm ngoài phạm vi người dùng.' AS msg,
                   @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    IF @DataBranchID IS NOT NULL AND @BranchID = '' AND LOWER(@UserGroupID) <> 'admin'
    BEGIN
        SELECT -1 AS code, N'Thiếu ngữ cảnh chi nhánh trong JsonData Save.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
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
        SELECT -1 AS code, N'BranchID trong JsonData vượt ngữ cảnh request.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @IsEdit bit = 0;
    SELECT TOP (1) @IsEdit = ISNULL(TRY_CONVERT(bit, J.[value]), 0)
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) = 'isedit';
    /* PHASE2_PERMISSION_RUN_GATE */
    IF LOWER(@UserGroupID) <> 'admin' AND @SkipPermission = 0
    BEGIN
        DECLARE @GroupAllowed bit, @UserAllowed bit, @GroupCanRun bit, @UserCanRun bit;
        SELECT @GroupAllowed = CASE WHEN @IsEdit = 1 THEN P.IsUpdate ELSE P.IsAdd END,
               @GroupCanRun = P.IsRun
        FROM dbo.WA_UserGroupPermisstion AS P
        WHERE P.UserGroupID = @UserGroupID AND P.MenuID = @MenuID;

        SELECT @UserAllowed = CASE WHEN @IsEdit = 1 THEN P.IsUpdate ELSE P.IsAdd END,
               @UserCanRun = P.IsRun
        FROM dbo.WA_UserPermisstion AS P
        WHERE P.UserName = @UserName AND P.MenuID = @MenuID;

        IF ISNULL(@UserCanRun, ISNULL(@GroupCanRun, 0)) <> 1
           OR ISNULL(@UserAllowed, ISNULL(@GroupAllowed, 0)) <> 1
        BEGIN
            SELECT -1 AS code, CASE WHEN @IsEdit = 1 THEN N'Không có quyền cập nhật.' ELSE N'Không có quyền thêm mới.' END AS msg,
                   @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    DECLARE @Columns table (
        ColumnID int NOT NULL,
        ColumnName sysname NOT NULL PRIMARY KEY,
        SqlType nvarchar(256) NOT NULL,
        IsRequired bit NOT NULL,
        IsPrimaryKey bit NOT NULL,
        JsonPresent bit NOT NULL,
        IsAudit bit NOT NULL
    );

    INSERT INTO @Columns (ColumnID, ColumnName, SqlType, IsRequired, IsPrimaryKey, JsonPresent, IsAudit)
    SELECT
        C.column_id,
        C.name,
        TYPE_NAME(C.user_type_id)
          + CASE
                WHEN TYPE_NAME(C.user_type_id) IN ('varchar', 'char', 'binary', 'varbinary')
                    THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
                WHEN TYPE_NAME(C.user_type_id) IN ('nvarchar', 'nchar')
                    THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
                WHEN TYPE_NAME(C.user_type_id) IN ('decimal', 'numeric')
                    THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
                WHEN TYPE_NAME(C.user_type_id) IN ('datetime2', 'datetimeoffset', 'time')
                    THEN '(' + CONVERT(varchar(10), C.scale) + ')'
                ELSE ''
            END,
        CONVERT(bit, CASE
            WHEN C.is_nullable = 0
             AND C.is_identity = 0
             AND C.is_computed = 0
             AND C.default_object_id = 0
             AND LOWER(C.name) NOT IN ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                       'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                                       'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
            THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN LOWER(C.name) = LOWER(@PrimaryKey) THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN EXISTS (
            SELECT 1 FROM OPENJSON(@Data) AS J WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(C.name)
        ) THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN LOWER(C.name) IN ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                                       'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                                                       'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
                          THEN 1 ELSE 0 END)
    FROM sys.columns AS C
    JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND C.is_identity = 0
      AND C.is_computed = 0
      AND LOWER(T.name) NOT IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                                'sql_variant', 'geography', 'geometry', 'hierarchyid')
      AND LOWER(C.name) NOT IN ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                                'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext');

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) NOT IN ('isedit', 'id', 'username', 'branchid', 'usercreate', 'userupdate', 'datecreate', 'dateupdate',
                                      'createdby', 'updatedby', 'createddate', 'updateddate', 'createdat', 'updatedat')
          AND NOT EXISTS (SELECT 1 FROM @Columns AS C WHERE LOWER(C.ColumnName) = LOWER(J.[key]) COLLATE DATABASE_DEFAULT)
    )
    BEGIN
        SELECT -1 AS code, N'JSON chứa field không tồn tại hoặc bị chặn.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @IsEdit = 0 AND EXISTS (
        SELECT 1
        FROM @Columns AS C
        WHERE C.IsRequired = 1
          AND (
                C.JsonPresent = 0
             OR EXISTS (
                    SELECT 1 FROM OPENJSON(@Data) AS J
                    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(C.ColumnName)
                      AND (J.[type] = 0 OR LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))) = N'')
                )
          )
    )
    BEGIN
        SELECT -1 AS code, N'Thiếu field bắt buộc theo schema vật lý/default.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @IsEdit = 1 AND NOT EXISTS (
        SELECT 1 FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT
          AND J.[type] <> 0
          AND LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))) <> N''
    )
    BEGIN
        SELECT -1 AS code, N'Thiếu khóa chính khi cập nhật.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @ColumnList nvarchar(max) = N'';
    DECLARE @WithClause nvarchar(max) = N'';
    DECLARE @SelectList nvarchar(max) = N'';
    DECLARE @UpdateSet nvarchar(max) = N'';
    DECLARE @InsertAuditColumns nvarchar(max) = N'';
    DECLARE @InsertAuditValues nvarchar(max) = N'';
    DECLARE @UpdateAuditSet nvarchar(max) = N'';

    SELECT
        @ColumnList = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsAudit = 0
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @WithClause = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName) + N' ' + C.SqlType + N' ''$."' + STRING_ESCAPE(C.ColumnName, 'json') + N'"'''
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsAudit = 0
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @SelectList = STUFF((
            SELECT N', J.' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsAudit = 0
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @UpdateSet = STUFF((
            SELECT N', T.' + QUOTENAME(C.ColumnName) + N' = J.' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.JsonPresent = 1 AND C.IsAudit = 0 AND C.IsPrimaryKey = 0
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    SELECT
        @InsertAuditColumns = STUFF((
            SELECT N', ' + QUOTENAME(C.ColumnName)
            FROM @Columns AS C
            WHERE C.IsAudit = 1
              AND LOWER(C.ColumnName) IN ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                           'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat')
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @InsertAuditValues = STUFF((
            SELECT N', ' + CASE
                WHEN LOWER(C.ColumnName) IN ('usercreate', 'createdby', 'createby', 'userupdate', 'updatedby', 'updateby') THEN N'@Actor'
                ELSE N'SYSUTCDATETIME()' END
            FROM @Columns AS C
            WHERE C.IsAudit = 1
              AND LOWER(C.ColumnName) IN ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                                           'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat')
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N''),
        @UpdateAuditSet = STUFF((
            SELECT N', T.' + QUOTENAME(C.ColumnName) + N' = ' + CASE
                WHEN LOWER(C.ColumnName) IN ('userupdate', 'updatedby', 'updateby') THEN N'@Actor'
                ELSE N'SYSUTCDATETIME()' END
            FROM @Columns AS C
            WHERE C.IsAudit = 1
              AND LOWER(C.ColumnName) IN ('userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat')
            ORDER BY C.ColumnID
            FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    IF @IsEdit = 0 AND ISNULL(@ColumnList, N'') = N'' AND ISNULL(@InsertAuditColumns, N'') = N''
    BEGIN
        SELECT -1 AS code, N'Không có field hợp lệ để thêm.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @IsEdit = 1 AND ISNULL(@UpdateSet, N'') = N'' AND ISNULL(@UpdateAuditSet, N'') = N''
    BEGIN
        SELECT -1 AS code, N'Không có field hợp lệ để cập nhật.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @Sql nvarchar(max);
    BEGIN TRY
        BEGIN TRANSACTION;

        IF @IsEdit = 0
        BEGIN
            IF ISNULL(@InsertAuditColumns, N'') <> N''
            BEGIN
                SET @ColumnList = CONCAT(@ColumnList, CASE WHEN ISNULL(@ColumnList, N'') = N'' THEN N'' ELSE N', ' END, @InsertAuditColumns);
                SET @SelectList = CONCAT(@SelectList, CASE WHEN ISNULL(@SelectList, N'') = N'' THEN N'' ELSE N', ' END, @InsertAuditValues);
            END;

            IF ISNULL(@WithClause, N'') = N''
                SET @Sql = N'
                    DECLARE @Inserted table (PrimaryValue nvarchar(4000));
                    INSERT INTO ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' (' + @ColumnList + N')
                    OUTPUT CONVERT(nvarchar(4000), INSERTED.' + QUOTENAME(@PrimaryKey) + N') INTO @Inserted(PrimaryValue)
                    SELECT ' + @SelectList + N';
                    SET @OutRows = @@ROWCOUNT;
                    SELECT TOP (1) @OutPrimary = PrimaryValue FROM @Inserted;';
            ELSE
                SET @Sql = N'
                    DECLARE @Inserted table (PrimaryValue nvarchar(4000));
                    INSERT INTO ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' (' + @ColumnList + N')
                    OUTPUT CONVERT(nvarchar(4000), INSERTED.' + QUOTENAME(@PrimaryKey) + N') INTO @Inserted(PrimaryValue)
                    SELECT ' + @SelectList + N'
                    FROM OPENJSON(@JsonData) WITH (' + @WithClause + N') AS J;
                    SET @OutRows = @@ROWCOUNT;
                    SELECT TOP (1) @OutPrimary = PrimaryValue FROM @Inserted;';
        END
        ELSE
        BEGIN
            IF ISNULL(@UpdateAuditSet, N'') <> N''
                SET @UpdateSet = CONCAT(@UpdateSet, CASE WHEN ISNULL(@UpdateSet, N'') = N'' THEN N'' ELSE N', ' END, @UpdateAuditSet);

            SET @Sql = N'
                UPDATE T
                SET ' + @UpdateSet + N'
                FROM ' + QUOTENAME(@PhysicalSchema) + N'.' + QUOTENAME(@PhysicalTable) + N' AS T
                CROSS JOIN OPENJSON(@JsonData) WITH (' + @WithClause + N') AS J
                WHERE T.' + QUOTENAME(@PrimaryKey) + N' = J.' + QUOTENAME(@PrimaryKey) + N';
                SET @OutRows = @@ROWCOUNT;
                SET @OutPrimary = CONVERT(nvarchar(4000), JSON_VALUE(@JsonData, ''$."' + STRING_ESCAPE(@PrimaryKey, 'json') + N'"''));';
        END;

        EXEC sys.sp_executesql
            @Sql,
            N'@JsonData nvarchar(max), @Actor varchar(100), @OutRows int OUTPUT, @OutPrimary nvarchar(4000) OUTPUT',
            @JsonData = @Data,
            @Actor = @UserName,
            @OutRows = @RowsAffected OUTPUT,
            @OutPrimary = @PrimaryValue OUTPUT;

        IF @RowsAffected <= 0 OR (@IsEdit = 1 AND @RowsAffected <> 1)
            THROW 52201, N'Không tìm thấy dòng phù hợp hoặc không có thay đổi.', 1;

        COMMIT TRANSACTION;
        SELECT 0 AS code, N'Lưu V2 thành công.' AS msg, @PrimaryKey AS primaryKey,
               @PrimaryValue AS primaryValue, @RowsAffected AS rowsAffected;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SELECT -1 AS code, N'Không thể lưu dữ liệu V2. Mã lỗi: ' + CONVERT(nvarchar(20), ERROR_NUMBER()) AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
    END CATCH;
END;
GO
