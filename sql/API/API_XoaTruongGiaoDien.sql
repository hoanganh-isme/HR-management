IF OBJECT_ID('API_XoaTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_XoaTruongGiaoDien;
GO

CREATE PROCEDURE API_XoaTruongGiaoDien
    @IDs varchar(max) = NULL,
    @FormName varchar(50) = NULL, -- Form gọi API (frmFormBuilder)
    @UserName varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @IDs IS NULL OR @IDs = ''
    BEGIN
        SELECT 1 AS code, N'Thiếu ID cần xóa' AS message;
        RETURN;
    END

    BEGIN TRY
        -- Tách chuỗi ID và xóa (hỗ trợ SQL Server 2016 trở lên)
        DELETE FROM SY_FormatFields 
        WHERE AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL);

        SELECT 0 AS code, N'Xóa thành công' AS message;
    END TRY
    BEGIN CATCH
        SELECT 1 AS code, ERROR_MESSAGE() AS message;
    END CATCH
END
GO
