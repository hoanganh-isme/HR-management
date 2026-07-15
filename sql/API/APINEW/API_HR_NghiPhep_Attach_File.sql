SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Đọc một file theo ID. Chỉ gọi khi người dùng xem/tải/mở file.
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep_Attach_File
(
    @UserAutoID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        DocumentID,
        FileName,
        FileType,
        STT,
        FileSize,
        Content,
        Base64Content
    FROM dbo.HR_NghiPhepAttachTbl
    WHERE UserAutoID = @UserAutoID;
END;
GO
