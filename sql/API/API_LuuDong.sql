IF OBJECT_ID('API_LuuDong', 'P') IS NOT NULL
    DROP PROCEDURE API_LuuDong;
GO

CREATE PROCEDURE [dbo].[API_LuuDong]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX), -- Chuỗi JSON chứa dữ liệu cần lưu
    @UserName VARCHAR(50) = '' -- User thực hiện lưu/sửa
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName VARCHAR(100);
    DECLARE @PrimaryKey VARCHAR(100);
    
    -- Lấy thông tin Bảng và Khóa chính (Tự động thích ứng nếu chưa có cột SaveTableName trong SY_FrmLstTbl)
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SY_FrmLstTbl') AND name = 'SaveTableName')
    BEGIN
        DECLARE @SqlCheck NVARCHAR(MAX) = 
            N'SELECT @TN = COALESCE(SaveTableName, TableName), @PK = PrimaryKey FROM SY_FrmLstTbl WHERE FormID = @Form';
        EXEC sp_executesql @SqlCheck, 
            N'@TN VARCHAR(100) OUTPUT, @PK VARCHAR(100) OUTPUT, @Form VARCHAR(50)', 
            @TN = @TableName OUTPUT, @PK = @PrimaryKey OUTPUT, @Form = @List;
    END
    ELSE
    BEGIN
        SELECT 
            @TableName = TableName,
            @PrimaryKey = PrimaryKey
        FROM SY_FrmLstTbl 
        WHERE FormID = @List;
    END

    IF @TableName IS NULL OR @TableName = ''
    BEGIN
        SELECT -1 AS code, N'Chưa cấu hình TableName cho form ' + @List AS msg;
        RETURN;
    END

    -- Chuẩn hóa casing của Khóa chính theo bảng vật lý (tránh lỗi Case-Sensitive)
    DECLARE @ExactPK VARCHAR(100);
    SELECT TOP 1 @ExactPK = name 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(@TableName) 
      AND LOWER(name) = LOWER(@PrimaryKey);
      
    IF @ExactPK IS NOT NULL
        SET @PrimaryKey = @ExactPK;

    BEGIN TRY
        DECLARE @IsEdit INT = ISNULL(CAST(JSON_VALUE(@Data, '$.IsEdit') AS INT), 0);
        DECLARE @SQL NVARCHAR(MAX) = '';
        
        -- 1. Lọc các cột hợp lệ từ JSON (Bỏ qua các cột hệ thống do FE đẩy xuống)
        -- Sử dụng JOIN với sys.columns (so sánh không phân biệt hoa thường) để lấy đúng casing vật lý
        SELECT 
            c.name AS ColumnName, 
            jd.[value] AS ColumnValue,
            jd.[type] AS JsonType
        INTO #JsonDataRaw
        FROM OPENJSON(@Data) jd
        JOIN sys.columns c ON c.object_id = OBJECT_ID(@TableName) AND LOWER(c.name) = LOWER(jd.[key])
        WHERE jd.[key] COLLATE DATABASE_DEFAULT NOT LIKE '\_%' ESCAPE '\'; -- Bỏ qua các key hệ thống bắt đầu bằng _ (VD: _SortColumn)

        -- 2. Kết hợp với kiểu dữ liệu của cột để tự động định dạng / chuyển đổi thông minh
        SELECT 
            jd.ColumnName,
            jd.ColumnValue,
            jd.JsonType,
            t.name AS DataType
        INTO #JsonData
        FROM #JsonDataRaw jd
        JOIN sys.columns c ON c.object_id = OBJECT_ID(@TableName) AND c.name = jd.ColumnName
        JOIN sys.types t ON c.user_type_id = t.user_type_id;

        -- 2.1. Đối với các cột số hoặc ngày tháng, nếu giá trị truyền vào là chuỗi rỗng thì chuyển thành NULL
        -- (Tránh lỗi: Conversion failed khi chèn chuỗi rỗng '' vào cột INT hoặc TIME/DATETIME)
        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE LTRIM(RTRIM(ISNULL(ColumnValue, ''))) = ''
          AND DataType IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money', 'smallmoney', 
                           'date', 'datetime', 'datetime2', 'smalldatetime', 'time', 'datetimeoffset');

        -- 2.2. Đối với các cột kiểu TIME/DATETIME, nếu người dùng chỉ gõ số giờ (ví dụ: '12' hoặc '8'), 
        -- tự động format về dạng giờ chuẩn '12:00' hoặc '08:00' để SQL Server không bị lỗi cast.
        UPDATE #JsonData
        SET ColumnValue = RIGHT('0' + LTRIM(RTRIM(ColumnValue)), 2) + ':00'
        WHERE DataType IN ('time', 'datetime', 'smalldatetime', 'datetime2')
          AND ColumnValue IS NOT NULL
          AND ISNUMERIC(ColumnValue) = 1
          -- Chỉ nhận số nguyên giờ từ 0 đến 23
          AND CAST(ColumnValue AS FLOAT) BETWEEN 0 AND 23
          AND CHARINDEX('.', ColumnValue) = 0
          -- Không chứa ký tự phân tách thời gian/ngày tháng thông thường
          AND CHARINDEX(':', ColumnValue) = 0
          AND CHARINDEX('-', ColumnValue) = 0
          AND CHARINDEX('/', ColumnValue) = 0;

        -- 3. Thêm thông tin Audit nếu cột có trong bảng vật lý
        IF @IsEdit = 0 -- THÊM MỚI (INSERT)
        BEGIN
            -- UserCreate / DateCreate
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserCreate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserCreate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateCreate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateCreate', 'GETDATE()', -1, 'datetime');
            END

            -- UserUpdate / DateUpdate cũng có thể khởi tạo lúc insert
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserUpdate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserUpdate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateUpdate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');
            END
        END
        ELSE -- CẬP NHẬT (UPDATE)
        BEGIN
            -- UserUpdate / DateUpdate (ghi đè an toàn từ hệ thống)
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'UserUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserUpdate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'DateUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');
            END
        END
        
        IF @IsEdit = 0 -- THÊM MỚI (INSERT)
        BEGIN
            DECLARE @Cols NVARCHAR(MAX) = '';
            DECLARE @Vals NVARCHAR(MAX) = '';
            
            SELECT 
                @Cols = @Cols + CASE WHEN @Cols = '' THEN '' ELSE ', ' END + QUOTENAME(ColumnName),
                @Vals = @Vals + CASE WHEN @Vals = '' THEN '' ELSE ', ' END + 
                        CASE 
                            WHEN JsonType = 0 THEN 'NULL'
                            WHEN JsonType = -1 THEN ColumnValue
                            ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + '''' 
                        END
            FROM #JsonData
            -- Loại bỏ hoàn toàn khóa chính nếu là cột IDENTITY (tự tăng)
            WHERE COLUMNPROPERTY(OBJECT_ID(@TableName), ColumnName, 'IsIdentity') = 0;

            SET @SQL = 'INSERT INTO ' + QUOTENAME(@TableName) + ' (' + @Cols + ') VALUES (' + @Vals + ');';
        END
        ELSE -- CẬP NHẬT (UPDATE)
        BEGIN
            DECLARE @UpdateSet NVARCHAR(MAX) = '';
            DECLARE @PKValue NVARCHAR(MAX) = '';
            
            SELECT @PKValue = ColumnValue FROM #JsonData WHERE ColumnName = @PrimaryKey;
            
            IF @PKValue IS NULL OR @PKValue = ''
            BEGIN
                SELECT -1 AS code, N'Không tìm thấy giá trị Khóa chính (' + @PrimaryKey + ') để cập nhật' AS msg;
                RETURN;
            END

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

            SET @SQL = 'UPDATE ' + QUOTENAME(@TableName) + ' SET ' + @UpdateSet + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' = N''' + REPLACE(@PKValue, '''', '''''') + ''';';
        END

        -- Chạy câu lệnh sinh ra
        EXEC sp_executesql @SQL;

        SELECT 0 AS code, N'Lưu thành công!' AS msg;
        
        DROP TABLE #JsonDataRaw;
        DROP TABLE #JsonData;
    END TRY
    BEGIN CATCH
        -- Bẫy lỗi và in ra câu lệnh SQL để dễ debug
        DECLARE @ErrMsg NVARCHAR(MAX) = ERROR_MESSAGE();
        SELECT -1 AS code, N'Lỗi SQL: ' + @ErrMsg + N'. [SQL: ' + ISNULL(@SQL, '') + N']' AS msg;
        
        -- Tránh lỗi rác khi drop table trong catch
        IF OBJECT_ID('tempdb..#JsonDataRaw') IS NOT NULL DROP TABLE #JsonDataRaw;
        IF OBJECT_ID('tempdb..#JsonData') IS NOT NULL DROP TABLE #JsonData;
    END CATCH
END
GO
