
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_Gateway_Router] - TRẠM ĐỊNH TUYẾN TRUNG TÂM
-- Đọc cấu hình từ bảng WA_API để gọi các thủ tục tương ứng.
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_Gateway_Router]
    @List VARCHAR(50),               -- Ví dụ: 'Customer', 'ComboNhanVien'
    @Func VARCHAR(50) = 'View',      -- Ví dụ: 'View', 'Save', 'Delete'
    @UserName VARCHAR(50) = '',      -- Tên user lấy từ Frontend/Session
    @Keyword NVARCHAR(200) = '',     -- Tham số tìm kiếm chung
    @Page INT = 1,
    @Limit INT = 20,
    @JsonData NVARCHAR(MAX) = '',    -- Dùng cho các hàm Save/Update có body phức tạp
    @SortColumn VARCHAR(50) = '',    -- Cột cần sắp xếp
    @SortDir VARCHAR(10) = ''        -- Chiều sắp xếp (ASC/DESC)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetStore NVARCHAR(200);
    DECLARE @ParaTemplate NVARCHAR(MAX);
    
    -- 1. Tra cứu cấu hình từ bảng WA_API
    SELECT @TargetStore = LTRIM(RTRIM([SQL])), 
           @ParaTemplate = LTRIM(RTRIM(ISNULL(Para, '')))
    FROM WA_API
    WHERE list = @List AND func = @Func;

    -- Kiểm tra nếu API chưa được định nghĩa
    IF @TargetStore IS NULL OR @TargetStore = ''
    BEGIN
        SELECT -1 AS code, N'Lỗi: Chưa định nghĩa API [' + @List + '] - Hành động: [' + @Func + '] trong bảng WA_API!' AS msg;
        RETURN;
    END

    -- 2. Lấy Context của hệ thống dựa theo UserName (Phục vụ Phân quyền RLS)
    DECLARE @UserGroup VARCHAR(50) = '';
    DECLARE @BranchID NVARCHAR(MAX) = ''; -- Tăng kích thước để chứa nhiều chi nhánh
    DECLARE @ManagerID VARCHAR(50) = '';
    DECLARE @EmployeeID VARCHAR(50) = '';
    
    IF ISNULL(@UserName, '') <> ''
    BEGIN
        -- Móc toàn bộ thông tin ngữ cảnh từ bảng tài khoản cốt lõi (SY_User)
        SELECT 
            @UserGroup = UserGroupID, 
            @BranchID = BranchID,
            @ManagerID = ManagerID,
            @EmployeeID = EmployeeID
        FROM SY_User 
        WHERE UserName = @UserName;
    END

    -- Xử lý bộ lọc Chi nhánh từ UI
    IF ISNULL(@JsonData, '') <> '' AND ISJSON(@JsonData) = 1
    BEGIN
        DECLARE @UI_BranchID NVARCHAR(MAX);
        SELECT @UI_BranchID = CAST(JSON_VALUE(@JsonData, '$.BranchID') AS NVARCHAR(MAX));
        
        IF @UI_BranchID IS NOT NULL AND @UI_BranchID <> ''
        BEGIN
            -- Nếu là Admin hoặc tài khoản không bị giới hạn Chi nhánh
            IF (ISNULL(@BranchID, '') = '' OR @UserGroup = 'Admin') 
            BEGIN
                SET @BranchID = @UI_BranchID;
            END
            ELSE
            BEGIN
                -- Nếu tài khoản bị giới hạn chi nhánh, lấy phần giao nhau giữa UI gửi lên và quyền được phép
                DECLARE @ValidBranches NVARCHAR(MAX) = '';
                SELECT @ValidBranches = @ValidBranches + LTRIM(RTRIM(value)) + ','
                FROM STRING_SPLIT(@UI_BranchID, ',')
                WHERE LTRIM(RTRIM(value)) IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','));
                
                IF LEN(@ValidBranches) > 0
                    SET @BranchID = LEFT(@ValidBranches, LEN(@ValidBranches) - 1);
            END
        END
    END

    -- 3. Xử lý Đắp tham số (Replace Placeholders)
    -- CHÚ Ý CẤU HÌNH TRONG DB: Nếu biến là chuỗi, phải có dấu nháy đơn bao quanh. Ví dụ: '{User}', N'{Keyword}', {Page}
    
    -- 3.1. Thay thế các biến Server-side Context (Bảo mật tuyệt đối, Frontend không can thiệp được)
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{User}', REPLACE(ISNULL(@UserName, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{UserName}', REPLACE(ISNULL(@UserName, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{UserGroup}', REPLACE(ISNULL(@UserGroup, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{BranchID}', REPLACE(ISNULL(@BranchID, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{ManagerID}', REPLACE(ISNULL(@ManagerID, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{EmployeeID}', REPLACE(ISNULL(@EmployeeID, ''), '''', ''''''));
    
    -- 3.2. Thay thế các biến Request từ Frontend
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{List}', REPLACE(ISNULL(@List, ''), '''', ''''''));
    
    -- BƯỚC ĐỘT PHÁ MỚI: ƯU TIÊN 1 - TỰ ĐỘNG MAP TẤT CẢ TỪ JSON
    IF ISNULL(@JsonData, '') <> '' AND ISJSON(@JsonData) = 1
    BEGIN
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, '{' + [key] + '}', REPLACE(ISNULL(CAST([value] AS NVARCHAR(MAX)), ''), '''', ''''''))
        FROM OPENJSON(@JsonData);
    END
    
    -- ƯU TIÊN 2: FALLBACK (DỰ PHÒNG CÁC BIẾN CỨNG TỪ C# NẾU CHƯA ĐƯỢC MAP BỞI JSON)
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Keyword}', REPLACE(ISNULL(@Keyword, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{SortColumn}', REPLACE(ISNULL(@SortColumn, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{SortDir}', REPLACE(ISNULL(@SortDir, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Page}', ISNULL(CAST(@Page AS VARCHAR), ''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Limit}', ISNULL(CAST(@Limit AS VARCHAR), ''));
    
    -- Cuối cùng, Replace chính cái cục JsonData nếu API đích cần đọc cả cục
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{JsonData}', REPLACE(ISNULL(@JsonData, ''), '''', ''''''));

    -- 4. DỌN DẸP CÁC BIẾN KHÔNG ĐƯỢC TRUYỀN (GIÁ TRỊ VẪN LÀ '{TenBien}')
    IF OBJECT_ID(@TargetStore) IS NOT NULL
    BEGIN
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, name + '=''{' + SUBSTRING(name, 2, LEN(name)) + '}''', '')
        FROM sys.parameters WHERE object_id = OBJECT_ID(@TargetStore);
        
        -- Dọn dẹp với tiền tố N (nếu có)
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, name + '=N''{' + SUBSTRING(name, 2, LEN(name)) + '}''', '')
        FROM sys.parameters WHERE object_id = OBJECT_ID(@TargetStore);
    END
    
    -- Xóa rác (dấu phẩy thừa)
    WHILE CHARINDEX(', ,', @ParaTemplate) > 0 SET @ParaTemplate = REPLACE(@ParaTemplate, ', ,', ',');
    IF LEFT(LTRIM(@ParaTemplate), 1) = ',' SET @ParaTemplate = LTRIM(SUBSTRING(LTRIM(@ParaTemplate), 2, LEN(@ParaTemplate)));
    IF RIGHT(RTRIM(@ParaTemplate), 1) = ',' SET @ParaTemplate = RTRIM(SUBSTRING(RTRIM(@ParaTemplate), 1, LEN(RTRIM(@ParaTemplate)) - 1));

    -- 5. Chạy câu lệnh hoàn chỉnh
    DECLARE @FinalSQL NVARCHAR(MAX);
    
    -- Ráp lệnh EXEC
    IF @ParaTemplate <> ''
        SET @FinalSQL = 'EXEC ' + QUOTENAME(@TargetStore) + ' ' + @ParaTemplate;
    ELSE
        SET @FinalSQL = 'EXEC ' + QUOTENAME(@TargetStore);

    -- Dòng này dùng để debug khi anh test bằng SQL Management Studio (SSMS)
    -- PRINT N'Đang thực thi lệnh: ' + @FinalSQL;

    -- 5. Thực thi lệnh
    BEGIN TRY
        EXEC(@FinalSQL);
    END TRY
    BEGIN CATCH
        -- Không trả câu lệnh đã nội suy hoặc dữ liệu request về client.
        -- Chi tiết đầy đủ chỉ được ghi ở server log/SSMS khi vận hành.
        SELECT -1 AS code,
               N'API gateway execution failed.' AS msg,
               ERROR_NUMBER() AS error_number,
               ERROR_LINE() AS error_line;
    END CATCH
END
GO
