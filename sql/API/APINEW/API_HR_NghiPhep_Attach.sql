SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HR_NghiPhep_Attach
-- Description: Lấy danh sách tài liệu đính kèm thuộc một đơn xin nghỉ phép
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep_Attach
(
    @DocumentID VARCHAR(50) = ''
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
        Content
    FROM dbo.HR_NghiPhepAttachTbl
    WHERE DocumentID = @DocumentID
    ORDER BY STT ASC, UserAutoID DESC;
END
GO
