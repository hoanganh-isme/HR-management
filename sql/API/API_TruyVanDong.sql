CREATE OR ALTER PROCEDURE [dbo].[API_TruyVanDong]
    @List VARCHAR(50),
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = '' -- Dùng @Data thay vì @FilterJSON để nhất quán với Gateway
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName VARCHAR(100);
    DECLARE @PrimaryKey VARCHAR(50);
    
    -- Lấy thông tin Bảng vật lý và Khóa chính từ cấu hình form
    SELECT 
        @TableName = LTRIM(RTRIM(TableName)),
        @PrimaryKey = LTRIM(RTRIM(PrimaryKey))
    FROM SY_FrmLstTbl 
    WHERE FormID = @List;

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

    -- Chuẩn hóa casing của Cột sắp xếp theo bảng vật lý (nếu có truyền)
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        DECLARE @ExactSortCol VARCHAR(100);
        SELECT TOP 1 @ExactSortCol = name 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(@TableName) 
          AND LOWER(name) = LOWER(@SortColumn);
          
        IF @ExactSortCol IS NOT NULL
            SET @SortColumn = @ExactSortCol;
    END
    
    -- Biến chứa SQL động
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @whereClause NVARCHAR(MAX) = ' WHERE 1=1';

    -- XỬ LÝ LỌC TỪ JSON (JsonData từ UI)
    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        DECLARE @jsonFilter NVARCHAR(MAX);
        SELECT @jsonFilter = STUFF((
            SELECT ' AND ' + QUOTENAME(c.name) + ' LIKE N''%'' + ' + 
                   'REPLACE(N''' + REPLACE(jd.[value], '''', '''''') + ''', ''\t'', '''')' + ' + ''%'''
            FROM OPENJSON(@Data) jd
            CROSS APPLY (
                SELECT TOP 1 name 
                FROM sys.columns 
                WHERE object_id = OBJECT_ID(@TableName) 
                  AND LOWER(name) = LOWER(jd.[key]) COLLATE DATABASE_DEFAULT
            ) c
            WHERE jd.[value] IS NOT NULL AND CAST(jd.[value] AS NVARCHAR(MAX)) <> ''
              AND jd.[key] COLLATE DATABASE_DEFAULT <> 'Keyword'
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 0, '');

        IF @jsonFilter IS NOT NULL
        BEGIN
            SET @whereClause = @whereClause + @jsonFilter;
        END
    END




    -- Thêm điều kiện tìm kiếm nếu có Keyword (Tìm kiếm toàn cục)
    IF ISNULL(@Keyword, '') <> ''
    BEGIN
        DECLARE @searchCols NVARCHAR(MAX);
        
        -- Dùng sys.columns để lấy danh sách cột text
        SELECT @searchCols = STUFF((
            SELECT ' OR ' + QUOTENAME(c.name) + ' LIKE ''%'' + @kw + ''%'''
            FROM sys.columns c
            JOIN sys.types ty ON c.system_type_id = ty.system_type_id
            WHERE c.object_id = OBJECT_ID(@TableName) 
              AND ty.name IN ('varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext')
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 4, '');

        IF @searchCols IS NOT NULL AND @searchCols <> ''
        BEGIN
            SET @whereClause = @whereClause + ' AND (' + @searchCols + ')';
        END
    END

    -- Xử lý ORDER BY
    DECLARE @OrderByClause NVARCHAR(MAX);
    
    -- Nếu frontend truyền SortColumn thì ưu tiên dùng
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        -- Mặc định ASC nếu không truyền SortDir hợp lệ
        IF ISNULL(@SortDir, '') NOT IN ('ASC', 'DESC', 'asc', 'desc')
            SET @SortDir = 'ASC';
            
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@SortColumn) + ' ' + @SortDir;
    END
    -- Nếu không có SortColumn thì fallback về PrimaryKey
    ELSE IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
    BEGIN
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@PrimaryKey) + ' DESC ';
    END
    ELSE
    BEGIN
        SET @OrderByClause = ' ORDER BY (SELECT 1) ';
    END

    -- Lấy danh sách cột
    DECLARE @ColumnList NVARCHAR(MAX);
    SELECT @ColumnList = STUFF((
        SELECT ', ' + QUOTENAME(FieldName)
        FROM SY_FormatFields
        WHERE FormName = @List
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
        
    IF @ColumnList IS NULL OR @ColumnList = ''
        SET @ColumnList = '*';

    -- Sinh câu SQL động (Trả toàn bộ dữ liệu để C# Backend tự phân trang)
    SET @sql = 'SELECT ' + @ColumnList + ' ' +
               ' FROM ' + QUOTENAME(@TableName) + @whereClause +
               @OrderByClause + ';';
    
    -- Chạy lệnh
    EXEC sp_executesql @sql, N'@kw NVARCHAR(200)', @kw = @Keyword;
END
GO
