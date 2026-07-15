SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Đọc một file theo ID. Chỉ gọi khi người dùng xem/tải/mở file.
IF OBJECT_ID('dbo.API_HopDongLaoDong_Attach_File', 'P') IS NULL
    EXEC (N'CREATE PROCEDURE dbo.API_HopDongLaoDong_Attach_File AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach_File
(
    @UserAutoID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        MaHopDong,
        FileName,
        FileType,
        STT,
        FileSize,
        Content,
        Base64Content
    FROM dbo.HR_HopDongAttachTbl
    WHERE UserAutoID = @UserAutoID;
END;
GO
