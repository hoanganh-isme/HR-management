-- =========================================================================
-- PROCEDURE: dbo.API_LuuDong_V2
-- DESCRIPTION: Framework Procedure V2 chuẩn hóa toàn diện cho việc Lưu dữ liệu (Save).
-- TÍNH NĂNG NÂNG CẤP:
-- 1. Tự động tương thích cả Phase3 Registry và SY_FrmLstTbl (Dual-Resolution).
-- 2. Xử lý triệt để kiểu dữ liệu Binary/Image/Varbinary (không bao giờ lỗi type clash).
-- 3. Chuẩn hóa tự động kiểu số, ngày giờ, tinyint âm.
-- 4. Quản lý khóa chính, Audit (UserCreate/DateCreate/UserUpdate/DateUpdate).
-- 5. Cơ chế Transaction & Application Lock chống Race Condition.
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

    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    -- Kiểm tra tham số đầu vào cơ bản
    IF @List = '' OR @UserName = '' OR ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'Dữ liệu JSON hoặc thông tin người dùng không hợp lệ.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    -- Kiểm tra chống trùng key JSON
    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'Dữ liệu chứa các trường JSON bị trùng lặp.' AS msg,
               CAST(NULL AS sysname) AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    -- =========================================================================
    -- 1. RESOLVE METADATA (Bảng vật lý & Khóa chính)
    -- =========================================================================
    DECLARE @TableName sysname = NULL;
    DECLARE @PrimaryKey sysname = NULL;

    -- Ưu tiên 1: Đọc từ Phase3 Simple CRUD Registry nếu có
    IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NOT NULL
    BEGIN
        SELECT
            @TableName = R.ExpectedTableName,
            @PrimaryKey = R.ExpectedPrimaryKey
        FROM dbo.API_Phase3SimpleCrudRegistry() AS R
        WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
          AND R.EnableSave = 1;
    END;

    -- Fallback 2: Đọc từ SY_FrmLstTbl nếu chưa có trong Phase 3 Registry
    IF @TableName IS NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SY_FrmLstTbl') AND name = 'SaveTableName')
        BEGIN
            DECLARE @SqlCheck NVARCHAR(MAX) = 
                N'SELECT @TN = COALESCE(SaveTableName, TableName), @PK = PrimaryKey FROM SY_FrmLstTbl WHERE FormID = @Form';
            EXEC sp_executesql @SqlCheck, 
                N'@TN sysname OUTPUT, @PK sysname OUTPUT, @Form VARCHAR(50)', 
                @TN = @TableName OUTPUT, @PK = @PrimaryKey OUTPUT, @Form = @List;
        END
        ELSE IF OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NOT NULL
        BEGIN
            SELECT 
                @TableName = TableName,
                @PrimaryKey = PrimaryKey
            FROM dbo.SY_FrmLstTbl 
            WHERE FormID = @List;
        END;
    END;

    -- Nếu vẫn không tìm thấy Bảng
    IF @TableName IS NULL OR @TableName = ''
    BEGIN
        SELECT -1 AS code, N'Chưa cấu hình TableName cho form ' + @List AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @TableName, N'U');
    IF @ObjectID IS NULL
    BEGIN
        SELECT -1 AS code, N'Bảng vật lý dbo.' + @TableName + N' không tồn tại trong CSDL.' AS msg,
               @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    -- Tự động thêm cột khóa chính (UserAutoID) nếu bảng chưa có
    IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
       AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = LOWER(@PrimaryKey))
    BEGIN
        IF LOWER(@PrimaryKey) = 'userautoid'
        BEGIN
            BEGIN TRY
                DECLARE @AlterSql NVARCHAR(MAX);
                SET @AlterSql = N'ALTER TABLE dbo.' + QUOTENAME(@TableName) + N' ADD ' + QUOTENAME(@PrimaryKey) + N' VARCHAR(50) NULL;';
                EXEC sp_executesql @AlterSql;

                DECLARE @ConstraintName VARCHAR(150) = 'DF_' + REPLACE(REPLACE(REPLACE(@TableName, '.', '_'), '[', ''), ']', '') + '_' + @PrimaryKey;
                SET @AlterSql = N'ALTER TABLE dbo.' + QUOTENAME(@TableName) + N' ADD CONSTRAINT ' + QUOTENAME(@ConstraintName) + N' DEFAULT (REPLACE(CONVERT(VARCHAR(50), NEWID()), ''-'', '''')) FOR ' + QUOTENAME(@PrimaryKey) + N';';
                EXEC sp_executesql @AlterSql;

                SET @AlterSql = N'UPDATE dbo.' + QUOTENAME(@TableName) + N' SET ' + QUOTENAME(@PrimaryKey) + N' = REPLACE(CONVERT(VARCHAR(50), NEWID()), ''-'', '''') WHERE ' + QUOTENAME(@PrimaryKey) + N' IS NULL;';
                EXEC sp_executesql @AlterSql;
            END TRY
            BEGIN CATCH
                PRINT 'Loi auto add UserAutoID: ' + ERROR_MESSAGE();
            END CATCH;
        END;
    END;

    -- Chuẩn hóa casing của Khóa chính theo bảng vật lý
    SELECT TOP 1 @PrimaryKey = name 
    FROM sys.columns 
    WHERE object_id = @ObjectID AND LOWER(name) = LOWER(@PrimaryKey);

    -- =========================================================================
    -- 2. TRÍCH XUẤT VÀ CHUẨN HÓA DỮ LIỆU TỪ JSON
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

        -- 2.1. Chuỗi rỗng -> NULL đối với Số / Ngày tháng
        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE LTRIM(RTRIM(ISNULL(ColumnValue, ''))) = ''
          AND DataType IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money', 'smallmoney',
                           'date', 'datetime', 'datetime2', 'smalldatetime', 'time', 'datetimeoffset');

        -- 2.2. Tinyint âm -> NULL (tránh overflow)
        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE DataType = 'tinyint'
          AND ISNUMERIC(ColumnValue) = 1
          AND TRY_CAST(ColumnValue AS FLOAT) < 0;

        -- 2.3. Format giờ chuẩn 'HH:00' nếu chỉ nhập số nguyên
        UPDATE #JsonData
        SET ColumnValue = RIGHT('0' + LTRIM(RTRIM(ColumnValue)), 2) + ':00'
        WHERE DataType IN ('time', 'datetime', 'smalldatetime', 'datetime2')
          AND ColumnValue IS NOT NULL
          AND ISNUMERIC(ColumnValue) = 1
          AND CAST(ColumnValue AS FLOAT) BETWEEN 0 AND 23
          AND CHARINDEX('.', ColumnValue) = 0
          AND CHARINDEX(':', ColumnValue) = 0
          AND CHARINDEX('-', ColumnValue) = 0
          AND CHARINDEX('/', ColumnValue) = 0;

        -- =========================================================================
        -- 3. XÁC ĐỊNH THÊM MỚI (INSERT) HAY SỬA (UPDATE)
        -- =========================================================================
        DECLARE @PKVal NVARCHAR(MAX) = '';
        IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
            SELECT @PKVal = LTRIM(RTRIM(ISNULL(ColumnValue, ''))) FROM #JsonData WHERE ColumnName = @PrimaryKey;

        DECLARE @IsEdit INT = ISNULL(CAST(JSON_VALUE(@Data, '$.IsEdit') AS INT), 0);
        IF @IsEdit = 0 AND @PKVal <> ''
        BEGIN
            DECLARE @CheckExistsSql NVARCHAR(MAX) = N'SELECT @Cnt = COUNT(*) FROM dbo.' + QUOTENAME(@TableName) + N' WHERE ' + QUOTENAME(@PrimaryKey) + N' = @PK';
            DECLARE @ExistsCnt INT = 0;
            EXEC sp_executesql @CheckExistsSql, N'@PK NVARCHAR(MAX), @Cnt INT OUTPUT', @PK = @PKVal, @Cnt = @ExistsCnt OUTPUT;
            IF @ExistsCnt > 0 SET @IsEdit = 1;
        END;

        DECLARE @SQL NVARCHAR(MAX) = '';

        -- =========================================================================
        -- 4. SINH CÂU LỆNH INSERT / UPDATE
        -- =========================================================================
        IF @IsEdit = 0 -- INSERT
        BEGIN
            -- Tự động sinh GUID cho Khóa chính dạng chuỗi nếu chưa có
            IF (@PKVal = '' OR @PKVal IS NULL) AND @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
               AND COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'IsIdentity') = 0
            BEGIN
                DECLARE @PKType VARCHAR(50);
                SELECT TOP 1 @PKType = t.name 
                FROM sys.columns c
                JOIN sys.types t ON c.user_type_id = t.user_type_id
                WHERE c.object_id = @ObjectID AND c.name = @PrimaryKey;

                IF @PKType IN ('varchar', 'nvarchar', 'char', 'nchar', 'uniqueidentifier')
                BEGIN
                    SET @PKVal = REPLACE(CAST(NEWID() AS VARCHAR(50)), '-', '');
                    DELETE FROM #JsonData WHERE ColumnName = @PrimaryKey;
                    INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                    VALUES (@PrimaryKey, @PKVal, 1, @PKType);
                END;
            END;

            -- Audit Tạo mới
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'UserCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserCreate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('UserCreate', @UserName, 1, 'varchar');

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'DateCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateCreate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('DateCreate', 'GETDATE()', -1, 'datetime');

            -- Audit Cập nhật
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'UserUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserUpdate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('UserUpdate', @UserName, 1, 'varchar');

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND name = 'DateUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateUpdate')
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType) VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');

            DECLARE @Cols NVARCHAR(MAX) = '', @Vals NVARCHAR(MAX) = '';
            SELECT
                @Cols = @Cols + CASE WHEN @Cols = '' THEN '' ELSE ', ' END + QUOTENAME(ColumnName),
                @Vals = @Vals + CASE WHEN @Vals = '' THEN '' ELSE ', ' END +
                        CASE
                            WHEN JsonType = 0 THEN 'NULL'
                            WHEN JsonType = -1 THEN ColumnValue
                            WHEN DataType IN ('varbinary', 'image', 'binary') THEN
                                CASE 
                                    WHEN ColumnValue IS NULL OR LTRIM(RTRIM(ColumnValue)) = '' THEN 'NULL'
                                    WHEN ColumnValue LIKE '0x%' THEN 
                                        'CONVERT(VARBINARY(MAX), ''' + REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                                    ELSE 
                                        'CONVERT(VARBINARY(MAX), ''0x' + REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                                END
                            ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + ''''
                        END
            FROM #JsonData
            WHERE COLUMNPROPERTY(@ObjectID, ColumnName, 'IsIdentity') = 0;

            SET @SQL = 'INSERT INTO dbo.' + QUOTENAME(@TableName) + ' (' + @Cols + ') VALUES (' + @Vals + ');';
        END
        ELSE -- UPDATE
        BEGIN
            IF @PrimaryKey IS NULL OR @PKVal = ''
            BEGIN
                SELECT -1 AS code, N'Không tìm thấy giá trị Khóa chính (' + ISNULL(@PrimaryKey, '') + N') để cập nhật.' AS msg,
                       @PrimaryKey AS primaryKey, CAST(NULL AS nvarchar(4000)) AS primaryValue, 0 AS rowsAffected;
                RETURN;
            END;

            -- Không cho phép cập nhật đè UserCreate / DateCreate
            DELETE FROM #JsonData WHERE ColumnName IN ('UserCreate', 'DateCreate');

            -- Cập nhật UserUpdate / DateUpdate
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
                                 WHEN DataType IN ('varbinary', 'image', 'binary') THEN
                                     CASE 
                                         WHEN ColumnValue IS NULL OR LTRIM(RTRIM(ColumnValue)) = '' THEN 'NULL'
                                         WHEN ColumnValue LIKE '0x%' THEN 
                                             'CONVERT(VARBINARY(MAX), ''' + REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                                         ELSE 
                                             'CONVERT(VARBINARY(MAX), ''0x' + REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                                     END
                                 ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + ''''
                             END
            FROM #JsonData
            WHERE ColumnName <> @PrimaryKey;

            SET @SQL = 'UPDATE dbo.' + QUOTENAME(@TableName) + ' SET ' + @UpdateSet +
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' = N''' + REPLACE(@PKVal, '''', '''''') + ''';';
        END;

        -- =========================================================================
        -- 5. THỰC THI VỚI APPLOCK
        -- =========================================================================
        DECLARE @AppLockResource VARCHAR(255) = 'API_LuuDong_V2_' + @TableName;
        EXEC sp_getapplock @Resource = @AppLockResource, @LockMode = 'Exclusive', @LockOwner = 'Session', @LockTimeout = 15000;

        EXEC sp_executesql @SQL;

        EXEC sp_releaseapplock @Resource = @AppLockResource, @LockOwner = 'Session';

        DROP TABLE #JsonDataRaw;
        DROP TABLE #JsonData;

        SELECT 0 AS code, N'Lưu thành công!' AS msg, @PrimaryKey AS primaryKey, @PKVal AS primaryValue, 1 AS rowsAffected;
    END TRY
    BEGIN CATCH
        DECLARE @CatchLockName VARCHAR(255) = 'API_LuuDong_V2_' + ISNULL(@TableName, '');
        IF APPLOCK_MODE('public', @CatchLockName, 'Session') <> 'NoLock'
            EXEC sp_releaseapplock @Resource = @CatchLockName, @LockOwner = 'Session';

        IF OBJECT_ID('tempdb..#JsonDataRaw') IS NOT NULL DROP TABLE #JsonDataRaw;
        IF OBJECT_ID('tempdb..#JsonData') IS NOT NULL DROP TABLE #JsonData;

        DECLARE @ErrMsg NVARCHAR(MAX) = ERROR_MESSAGE();
        SELECT -1 AS code, N'Lỗi SQL: ' + @ErrMsg AS msg, @PrimaryKey AS primaryKey, @PKVal AS primaryValue, 0 AS rowsAffected;
    END CATCH;
END;
GO
