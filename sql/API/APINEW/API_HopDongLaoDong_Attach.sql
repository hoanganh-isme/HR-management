SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_Attach
-- Description: Lấy danh sách tài liệu đính kèm thuộc một hợp đồng
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach
(
    @MaHopDong NVARCHAR(50) = ''
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
        Content
    FROM dbo.HR_HopDongAttachTbl
    WHERE MaHopDong = @MaHopDong
    ORDER BY STT ASC, UserAutoID DESC;
END
GO
