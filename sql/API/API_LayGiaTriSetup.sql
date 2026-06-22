USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Mô tả: API Lấy giá trị cài đặt từ bảng SY_Setup
-- Trả về: Com1 (tên công ty) + menu_sync_ver (version đồng bộ menu)
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[API_LayGiaTriSetup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [CodeID],
        [CodeValue]
    FROM [dbo].[SY_Setup]
    WHERE [CodeID] IN ('Com1', 'menu_sync_ver');
END
GO
