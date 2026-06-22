CREATE PROCEDURE API_LayPhienBanQuyen
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Ver nvarchar(50) = '';
    
    -- Lấy phiên bản đồng bộ từ bảng hệ thống
    SELECT @Ver = CodeValue 
    FROM SY_Setup 
    WHERE CodeID = 'menu_sync_ver';
    
    -- Trả về 1 dòng duy nhất cho Frontend đọc
    SELECT 
        0 AS [code], 
        'Success' AS [msg], 
        @Ver AS [version];
END
GO
