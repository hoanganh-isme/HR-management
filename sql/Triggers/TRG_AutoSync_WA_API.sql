-- =========================================================================================
-- TRIGGER: TỰ ĐỘNG CẬP NHẬT BẢNG WA_API KHI TẠO/SỬA STORED PROCEDURE
-- Giúp hệ thống đạt cảnh giới "Self-Aware" (Tự nhận thức): Cứ code SP là tự map API
-- =========================================================================================

CREATE OR ALTER TRIGGER TRG_AutoSync_WA_API
ON DATABASE
FOR CREATE_PROCEDURE, ALTER_PROCEDURE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Lấy thông tin từ Event DDL
    DECLARE @EventData XML = EVENTDATA();
    DECLARE @SchemaName SYSNAME = @EventData.value('(/EVENT_INSTANCE/SchemaName)[1]', 'SYSNAME');
    DECLARE @ObjectName SYSNAME = @EventData.value('(/EVENT_INSTANCE/ObjectName)[1]', 'SYSNAME');
    
    -- Chỉ kích hoạt với các Stored Procedure có tiền tố 'API_'
    IF @ObjectName LIKE 'API_%' AND @ObjectName <> 'API_Gateway_Router'
    BEGIN
        DECLARE @ParaTemplate NVARCHAR(MAX) = '';
        
        -- Quét bảng hệ thống sys.parameters để tự động sinh bản đồ tham số
        SELECT @ParaTemplate = @ParaTemplate + 
            CASE WHEN @ParaTemplate = '' THEN '' ELSE ', ' END + 
            name + '=N''{' + 
            CASE 
                WHEN name = '@UserName' THEN 'User'
                WHEN name = '@Keyword' THEN 'Keyword'
                WHEN name = '@Page' THEN 'Page'
                WHEN name = '@Limit' OR name = '@PageSize' THEN 'Limit'
                -- Khai báo thông minh cho các biến Framework:
                WHEN name = '@JsonData' OR name = '@Data' OR name = '@FilterJSON' THEN 'JsonData'
                WHEN name = '@List' THEN 'List'
                WHEN name = '@FormName' OR name = '@WebFormName' THEN 'FormName'
                WHEN name = '@SortColumn' THEN 'SortColumn'
                WHEN name = '@SortDir' THEN 'SortDir'
                -- Biến lạ thì lấy luôn tên (bỏ dấu @)
                ELSE SUBSTRING(name, 2, LEN(name)) 
            END + '}'''
        FROM sys.parameters
        WHERE object_id = OBJECT_ID(@SchemaName + '.' + @ObjectName)
        ORDER BY parameter_id;
        
        -- DDL synchronization owns only its auxiliary Execute route.  It must
        -- never rewrite a curated View/Save/Delete registration.
        IF NOT EXISTS (
            SELECT 1
            FROM WA_API
            WHERE [list] = @ObjectName
              AND [func] = 'Execute'
              AND [SQL] = @ObjectName
        )
        BEGIN
            -- NẾU CHƯA: Tự động Insert 1 dòng mới tinh. 
            -- Tạm gán List và Func bằng tên API, anh có thể vào sửa lại List/Func sau cho đẹp
            INSERT INTO WA_API (List, Func, [SQL], Para)
            VALUES (
                @ObjectName,   -- Lấy luôn tên SP làm List (tạm)
                'Execute',     -- Mặc định Func
                @ObjectName, 
                @ParaTemplate
            );
        END
        ELSE
        BEGIN
            -- NẾU ĐÃ CÓ: Nghĩa là anh vừa dùng lệnh ALTER PROCEDURE để thêm/bớt tham số
            -- Trigger sẽ tự động cập nhật lại cột Para cho khớp với code mới nhất!
            UPDATE WA_API
            SET Para = @ParaTemplate
            WHERE [list] = @ObjectName
              AND [func] = 'Execute'
              AND [SQL] = @ObjectName;
        END
    END
END
GO
