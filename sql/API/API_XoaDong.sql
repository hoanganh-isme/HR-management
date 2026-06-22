IF OBJECT_ID('API_XoaDong', 'P') IS NOT NULL
    DROP PROCEDURE API_XoaDong;
GO

CREATE PROCEDURE [dbo].[API_XoaDong]
    @List VARCHAR(50),
    @Ids NVARCHAR(MAX) = '', -- Chuỗi danh sách các ID cần xoá, ví dụ: 'ID1,ID2,ID3'
    @UserName VARCHAR(50) = '', -- User thực hiện xóa
    @Data NVARCHAR(MAX) = '' -- Cục JSON dữ liệu dòng cần xóa từ Frontend
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

    IF @PrimaryKey IS NULL OR @PrimaryKey = ''
    BEGIN
        SELECT -1 AS code, N'Chưa cấu hình PrimaryKey cho form ' + @List AS msg;
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

    -- Nếu @Ids rỗng, tự động bóc tách giá trị khóa chính từ @Data gửi từ Frontend qua OPENJSON (tránh lỗi bắt buộc chuỗi literal của JSON_VALUE)
    IF (ISNULL(@Ids, '') = '' OR @Ids = N'{Ids}') AND ISNULL(@Data, '') <> '' AND ISJSON(@Data) = 1
    BEGIN
        SELECT @Ids = CAST([value] AS NVARCHAR(MAX))
        FROM OPENJSON(@Data)
        WHERE LOWER([key]) COLLATE DATABASE_DEFAULT = LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT;
    END

    IF @Ids IS NULL OR @Ids = ''
    BEGIN
        SELECT -1 AS code, N'Không tìm thấy giá trị Khóa chính (' + @PrimaryKey + N') để xóa' AS msg;
        RETURN;
    END

    BEGIN TRY
        DECLARE @sql NVARCHAR(MAX) = '';
        DECLARE @RowsAffected INT = 0;
        
        -- Kiểm tra xem bảng có hỗ trợ Xóa mềm (cột IsDeleted) hay không
        DECLARE @HasIsDeleted BIT = 0;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'IsDeleted')
            SET @HasIsDeleted = 1;

        IF @HasIsDeleted = 1
        BEGIN
            -- Thực hiện Xóa mềm (Soft Delete)
            DECLARE @UpdateClause NVARCHAR(MAX) = 'IsDeleted = 1';
            
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedBy')
                SET @UpdateClause = @UpdateClause + ', DeletedBy = @User';
                
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedDate')
                SET @UpdateClause = @UpdateClause + ', DeletedDate = GETDATE()';
                
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedAt')
                SET @UpdateClause = @UpdateClause + ', DeletedAt = GETDATE()';

            SET @sql = 'UPDATE ' + QUOTENAME(@TableName) + ' SET ' + @UpdateClause + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' IN (SELECT value FROM string_split(@DeleteIds, '',''))';
                       
            EXEC sp_executesql @sql, N'@DeleteIds NVARCHAR(MAX), @User VARCHAR(50)', @DeleteIds = @Ids, @User = @UserName;
            SET @RowsAffected = @@ROWCOUNT;
            
            IF @RowsAffected > 0
                SELECT 0 AS code, N'Đã xóa mềm thành công ' + CAST(@RowsAffected AS VARCHAR) + N' dòng khỏi bảng ' + @TableName AS msg;
            ELSE
                SELECT -1 AS code, N'Không tìm thấy dữ liệu để xóa trong bảng ' + @TableName AS msg;
        END
        ELSE
        BEGIN
            -- Thực hiện Xóa cứng (Hard Delete)
            SET @sql = 'DELETE FROM ' + QUOTENAME(@TableName) + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' IN (SELECT value FROM string_split(@DeleteIds, '',''))';
                       
            EXEC sp_executesql @sql, N'@DeleteIds NVARCHAR(MAX)', @DeleteIds = @Ids;
            SET @RowsAffected = @@ROWCOUNT;
            
            IF @RowsAffected > 0
                SELECT 0 AS code, N'Đã xóa cứng thành công ' + CAST(@RowsAffected AS VARCHAR) + N' dòng khỏi bảng ' + @TableName AS msg;
            ELSE
                SELECT -1 AS code, N'Không tìm thấy dữ liệu để xóa trong bảng ' + @TableName AS msg;
        END
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lỗi xóa dữ liệu: ' + ERROR_MESSAGE() AS msg;
    END CATCH
END
GO
