-- =========================================================================
-- PROCEDURE: dbo.API_LuuDong_V2
-- DESCRIPTION: Framework Procedure V2 cho lưu dữ liệu (Save).
-- Đã sửa: Tự đọc @ExpectedTable và @PrimaryKey từ Contract Registry để lưu trực tiếp,
-- KHÔNG phụ thuộc SY_FrmLstTbl và KHÔNG báo lỗi "Chưa cấu hình TableName cho form...".
-- =========================================================================
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

    DECLARE @RowsAffected int = 0, @PrimaryValue nvarchar(4000) = NULL;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedTable sysname,
        @PrimaryKey sysname,
        @ExpectedView sysname,
        @ExpectedSave sysname,
        @PermissionFormName varchar(100),
        @WritePolicy varchar(40),
        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @PrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedView = R.ViewV2,
        @ExpectedSave = R.SaveV2,
        @PermissionFormName = R.PermissionFormName,
        @WritePolicy = R.WritePolicy,
        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableSave = 1;

    SET @PermissionFormName = LTRIM(RTRIM(ISNULL(@PermissionFormName, @List)));
    SET @WritePolicy = UPPER(LTRIM(RTRIM(ISNULL(@WritePolicy, 'SAFE_TABLE_COLUMNS'))));

    IF @ExpectedTable IS NULL OR @ExpectedSave COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_SAVE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @UserName = '' OR ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_AND_JSON_OBJECT_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DUPLICATE_JSON_KEY' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RouteCount int, @RegisteredSave sysname;
    SELECT
        @RouteCount = COUNT(*),
        @RegisteredSave = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR ISNULL(@RegisteredSave, N'') COLLATE DATABASE_DEFAULT <> @ExpectedSave COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_SAVE_ROUTE_NOT_UNIQUE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    -- Kiểm tra SY_FrmLstTbl NẾU FormID có tồn tại trong SY_FrmLstTbl
    DECLARE @RegisteredTable sysname, @RegisteredPrimaryKey sysname, @RegistrationCount int;
    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF @RegistrationCount > 0 AND (
       @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL OR NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_OR_PRIMARY_KEY_NOT_FOUND' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    -- =========================================================================
    -- THỰC THI LƯU TRỰC TIẾP LÊN @ExpectedTable THEO @PrimaryKey
    -- =========================================================================
    BEGIN TRY
        SELECT
            c.name AS ColumnName,
            jd.[value] AS ColumnValue,
            CAST(jd.[type] AS INT) AS JsonType
        INTO #JsonDataRaw
        FROM OPENJSON(@Data) jd
        JOIN sys.columns c ON c.object_id = @ObjectID AND LOWER(c.name) = LOWER(jd.[key]) COLLATE DATABASE_DEFAULT
        WHERE jd.[key] COLLATE DATABASE_DEFAULT NOT LIKE '\_%' ESCAPE '\'
          AND LOWER(jd.[key]) COLLATE DATABASE_DEFAULT NOT IN ('isedit', 'username');

        SELECT
            jd.ColumnName,
            jd.ColumnValue,
            jd.JsonType,
            t.name AS DataType
        INTO #JsonData
        FROM #JsonDataRaw jd
        JOIN sys.columns c ON c.object_id = @ObjectID AND c.name = jd.ColumnName
        JOIN sys.types t ON c.user_type_id = t.user_type_id;

        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE LTRIM(RTRIM(ISNULL(ColumnValue, ''))) = ''
          AND DataType IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money', 'smallmoney',
                           'date', 'datetime', 'datetime2', 'smalldatetime', 'time', 'datetimeoffset');

        DECLARE @PKVal NVARCHAR(MAX) = '';
        SELECT @PKVal = ColumnValue FROM #JsonData WHERE ColumnName = @PrimaryKey;

        DECLARE @IsEdit INT = 0;
        IF ISNULL(@PKVal, '') <> ''
        BEGIN
            DECLARE @CheckExistsSql NVARCHAR(MAX) = N'SELECT @Cnt = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable) + N' WHERE ' + QUOTENAME(@PrimaryKey) + N' = @PK';
            DECLARE @ExistsCnt INT = 0;
            EXEC sp_executesql @CheckExistsSql, N'@PK NVARCHAR(MAX), @Cnt INT OUTPUT', @PK = @PKVal, @Cnt = @ExistsCnt OUTPUT;
            IF @ExistsCnt > 0 SET @IsEdit = 1;
        END;

        DECLARE @SQL NVARCHAR(MAX) = '';
        IF @IsEdit = 0 -- INSERT
        BEGIN
            IF ISNULL(@PKVal, '') = '' AND COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'IsIdentity') = 0
            BEGIN
                SET @PKVal = REPLACE(CAST(NEWID() AS VARCHAR(50)), '-', '');
                DELETE FROM #JsonData WHERE ColumnName = @PrimaryKey;
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES (@PrimaryKey, @PKVal, 1, 'varchar');
            END;

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'UserCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserCreate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('UserCreate', @UserName, 1, 'varchar');

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'DateCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateCreate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('DateCreate', 'GETDATE()', -1, 'datetime');

            DECLARE @Cols NVARCHAR(MAX) = '', @Vals NVARCHAR(MAX) = '';
            SELECT
                @Cols = @Cols + CASE WHEN @Cols = '' THEN '' ELSE ', ' END + QUOTENAME(ColumnName),
                @Vals = @Vals + CASE WHEN @Vals = '' THEN '' ELSE ', ' END +
                        CASE
                            WHEN JsonType = 0 THEN 'NULL'
                            WHEN JsonType = -1 THEN ColumnValue
                            ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + ''''
                        END
            FROM #JsonData
            WHERE COLUMNPROPERTY(@ObjectID, ColumnName, 'IsIdentity') = 0;

            SET @SQL = 'INSERT INTO dbo.' + QUOTENAME(@ExpectedTable) + ' (' + @Cols + ') VALUES (' + @Vals + ');';
        END
        ELSE -- UPDATE
        BEGIN
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'UserUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'UserUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('UserUpdate', @UserName, 1, 'varchar');
            END;

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'DateUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'DateUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');
            END;

            DECLARE @UpdateSet NVARCHAR(MAX) = '';
            SELECT
                @UpdateSet = @UpdateSet + CASE WHEN @UpdateSet = '' THEN '' ELSE ', ' END +
                             QUOTENAME(ColumnName) + ' = ' +
                             CASE
                                 WHEN JsonType = 0 THEN 'NULL'
                                 WHEN JsonType = -1 THEN ColumnValue
                                 ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + ''''
                             END
            FROM #JsonData
            WHERE ColumnName <> @PrimaryKey;

            SET @SQL = 'UPDATE dbo.' + QUOTENAME(@ExpectedTable) + ' SET ' + @UpdateSet +
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' = N''' + REPLACE(@PKVal, '''', '''''') + ''';';
        END;

        EXEC sp_executesql @SQL;

        DROP TABLE #JsonDataRaw;
        DROP TABLE #JsonData;

        SELECT 0 AS code, N'Lưu thành công!' AS msg, @PrimaryKey AS primaryKey, @PKVal AS primaryValue, 1 AS rowsAffected;
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#JsonDataRaw') IS NOT NULL DROP TABLE #JsonDataRaw;
        IF OBJECT_ID('tempdb..#JsonData') IS NOT NULL DROP TABLE #JsonData;

        DECLARE @ErrMsg NVARCHAR(MAX) = ERROR_MESSAGE();
        SELECT -1 AS code, N'Lỗi SQL: ' + @ErrMsg AS msg, @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
    END CATCH;
END;
GO
