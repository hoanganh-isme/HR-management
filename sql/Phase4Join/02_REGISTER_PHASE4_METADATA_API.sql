/*
  Phase 4A SQL Script: Đăng ký API_Web_JoinFieldSchemaV2 vào bảng WA_API
  Đăng ký an toàn, idempotent với Transaction + XACT_ABORT.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TargetList varchar(100) = 'API_Web_JoinFieldSchemaV2';
DECLARE @TargetFunc varchar(50) = 'View';
DECLARE @TargetSQL nvarchar(128) = N'API_Web_JoinFieldSchemaV2';
DECLARE @TargetPara nvarchar(max) = N'@WebFormName=N''{FormName}'', @DetailKey=N''{DetailKey}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''';

-- 1. Kiểm tra route trùng lặp hoặc trỏ sai procedure
IF EXISTS (
    SELECT 1 
    FROM dbo.WA_API 
    WHERE LOWER(list) = LOWER(@TargetList) 
      AND LOWER(func) = LOWER(@TargetFunc)
      AND LOWER([SQL]) <> LOWER(@TargetSQL)
)
BEGIN
    RAISERROR(N'Route WA_API đã tồn tại nhưng trỏ đến procedure khác! Hủy đăng ký.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END;

-- 2. Đăng ký mới nếu chưa tồn tại
IF NOT EXISTS (
    SELECT 1 
    FROM dbo.WA_API 
    WHERE LOWER(list) = LOWER(@TargetList) 
      AND LOWER(func) = LOWER(@TargetFunc)
)
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES (@TargetList, @TargetFunc, @TargetSQL, @TargetPara);
    PRINT N'Đã thêm bản ghi đăng ký mới cho API_Web_JoinFieldSchemaV2 vào WA_API.';
END
-- 3. Cập nhật lại Para nếu trỏ đúng procedure
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET [SQL] = @TargetSQL,
        Para = @TargetPara
    WHERE LOWER(list) = LOWER(@TargetList) 
      AND LOWER(func) = LOWER(@TargetFunc);
    PRINT N'Đã cập nhật cấu hình Para cho API_Web_JoinFieldSchemaV2 trong WA_API.';
END;

COMMIT TRANSACTION;
GO

-- 4. Trả về trạng thái đăng ký của Route trong WA_API
SELECT 
    list, 
    func, 
    [SQL], 
    Para,
    N'Đã đăng ký thành công cho Phase 4A' AS Status
FROM dbo.WA_API
WHERE LOWER(list) = 'api_web_joinfieldschemav2' AND LOWER(func) = 'view';
GO
