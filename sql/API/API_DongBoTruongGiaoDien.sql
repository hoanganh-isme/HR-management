
IF OBJECT_ID('API_DongBoTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_DongBoTruongGiaoDien;
GO

-- =============================================
-- API: Đồng bộ các trường dữ liệu từ Stored Procedure/Table vào bảng cấu hình Form (SY_FormatFields)
-- VD: EXEC API_DongBoTruongGiaoDien @FormName = 'frmHopDong', @ObjectName = 'API_DanhSachHopDong'
-- =============================================
CREATE PROCEDURE API_DongBoTruongGiaoDien
    @FormName VARCHAR(50),
    @ObjectName VARCHAR(128) = NULL, -- Tên Stored Procedure (VD: 'API_DanhSachHopDong') hoặc Table/View
    @TSQL NVARCHAR(MAX) = NULL       -- Hoặc câu lệnh T-SQL (VD: 'SELECT * FROM dmkhachhang')
AS
BEGIN
    SET NOCOUNT ON;

    IF LOWER(LTRIM(RTRIM(ISNULL(@FormName, '')))) = LOWER('WA_BangThueTNCNFrm')
        THROW 52601, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: không đồng bộ SY_FormatFields cho form pilot.', 1;

    -- Bảng tạm chứa danh sách cột lấy được từ metadata
    DECLARE @Columns TABLE (
        name NVARCHAR(128),
        system_type_name NVARCHAR(128),
        column_ordinal INT
    );

    IF @ObjectName IS NOT NULL
    BEGIN
        -- Cách 1: Thử lấy từ Object (Stored Procedure, View, Table Function...) bằng DMV
        INSERT INTO @Columns (name, system_type_name, column_ordinal)
        SELECT name, system_type_name, column_ordinal
        FROM sys.dm_exec_describe_first_result_set_for_object(OBJECT_ID(@ObjectName), 0)
        WHERE name IS NOT NULL;

        -- Cách 2: Nếu là Table/View thông thường thì sys.dm_exec_describe_first_result_set_for_object có thể trả về NULL
        IF NOT EXISTS (SELECT 1 FROM @Columns) AND OBJECT_ID(@ObjectName) IS NOT NULL
        BEGIN
            DECLARE @TableSQL NVARCHAR(MAX) = 'SELECT TOP 1 * FROM ' + @ObjectName;
            INSERT INTO @Columns (name, system_type_name, column_ordinal)
            SELECT name, system_type_name, column_ordinal
            FROM sys.dm_exec_describe_first_result_set(@TableSQL, NULL, 0)
            WHERE name IS NOT NULL;
        END
        
        -- Cách 3: Nếu vẫn không có (vì SP có temp table khó phân tích metadata), dùng string EXEC
        IF NOT EXISTS (SELECT 1 FROM @Columns) 
        BEGIN
            DECLARE @ExecSQL NVARCHAR(MAX) = 'EXEC ' + @ObjectName;
            INSERT INTO @Columns (name, system_type_name, column_ordinal)
            SELECT name, system_type_name, column_ordinal
            FROM sys.dm_exec_describe_first_result_set(@ExecSQL, NULL, 0)
            WHERE name IS NOT NULL;
        END
    END
    ELSE IF @TSQL IS NOT NULL
    BEGIN
        -- Lấy từ câu lệnh T-SQL trực tiếp
        INSERT INTO @Columns (name, system_type_name, column_ordinal)
        SELECT name, system_type_name, column_ordinal
        FROM sys.dm_exec_describe_first_result_set(@TSQL, NULL, 0)
        WHERE name IS NOT NULL;
    END
    -- Xóa các trường cũ không còn tồn tại trong kết quả của Procedure/Table
    DELETE FROM SY_FormatFields 
    WHERE FormName = @FormName 
      AND FieldName NOT IN (SELECT name FROM @Columns);

    -- Cursor duyệt qua các cột để tự động thêm vào SY_FormatFields
    DECLARE @FieldName NVARCHAR(128);
    DECLARE @SysTypeName NVARCHAR(128);
    DECLARE @OrderNo INT;
    
    DECLARE cur CURSOR FOR 
    SELECT name, system_type_name, column_ordinal FROM @Columns ORDER BY column_ordinal;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @FieldName, @SysTypeName, @OrderNo;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Phân tích Type SQL để gán FormatID (Control) cơ bản cho frontend
        DECLARE @ParsedFormat VARCHAR(2) = 't'; -- Mặc định là text (t)
        IF @SysTypeName LIKE '%int%' OR @SysTypeName LIKE '%decimal%' OR @SysTypeName LIKE '%numeric%' OR @SysTypeName LIKE '%float%' OR @SysTypeName LIKE '%money%'
            SET @ParsedFormat = 'n'; -- number
        ELSE IF @SysTypeName LIKE '%date%' OR @SysTypeName LIKE '%time%'
            SET @ParsedFormat = 'd'; -- date
        ELSE IF @SysTypeName LIKE '%bit%'
            SET @ParsedFormat = 'c'; -- checkbox

        -- Kiểm tra xem field đã có trong SY_FormatFields chưa
        IF NOT EXISTS (SELECT 1 FROM SY_FormatFields WHERE FormName = @FormName AND FieldName = @FieldName)
        BEGIN
            -- Gọi API_LuuTruongGiaoDien hiện có để thêm mới field, đảm bảo logic mảng (Hide/Add/Lock) bên SY_FrmLstTbl cũng chạy đúng
            EXEC API_LuuTruongGiaoDien 
                @FormName = @FormName,
                @FieldName = @FieldName,
                @CaptionVN = @FieldName, -- Lấy tên cột làm nhãn tiếng Việt tạm
                @FormatID = @ParsedFormat,
                @FormPosition = 'grid',  -- Mặc định ở dạng lưới (grid)
                @ShowInAdd = 1,
                @ShowInEdit = 1,
                @IsReadOnlyEdit = 0,
                @IsReadOnlyAdd = 0,
                @NoResult = 1; -- Ẩn output của SP con để tránh crash
            
            -- Cập nhật thêm OrderNo để giữ thứ tự giống hệt trong Procedure (vì API_LuuTruongGiaoDien chưa có nhận OrderNo)
            UPDATE SY_FormatFields 
            SET OrderNo = @OrderNo 
            WHERE FormName = @FormName AND FieldName = @FieldName;
        END

        FETCH NEXT FROM cur INTO @FieldName, @SysTypeName, @OrderNo;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;

    -- Cuối cùng trả về danh sách các trường giao diện (cả cũ lẫn mới được thêm)
    EXEC API_LayCacTruongGiaoDien @FormName = @FormName;
END
GO
