USE [QLTiec]
GO

-- 1. Tạo API Xóa chuyên dụng (Xóa sạch cả sảnh tiệc phụ)
CREATE OR ALTER PROCEDURE [dbo].[API_XoaKhachDen]
    @Ids NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- BƯỚC 1: Xóa dữ liệu ở bảng con (Sảnh tiệc) trước
        DELETE FROM tbmk_Khachthamquansanhtiec 
        WHERE DocumentID IN (SELECT value FROM string_split(@Ids, ','));
        
        -- BƯỚC 2: Xóa dữ liệu ở bảng cha
        DELETE FROM tbmk_Khachthamquan 
        WHERE DocumentID IN (SELECT value FROM string_split(@Ids, ','));
        
        DECLARE @Rows INT = @@ROWCOUNT;
        SELECT 0 AS code, N'Đã xóa thành công ' + CAST(@Rows AS VARCHAR) + N' phiếu!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO


