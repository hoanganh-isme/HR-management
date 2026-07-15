SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Danh sách metadata đơn xin nghỉ phép, tuyệt đối không trả Content/Base64Content.
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep_Attach_Metadata
(
    @DocumentID NVARCHAR(100) = N'',
    @UserAutoID VARCHAR(50) = '',
    @BranchID NVARCHAR(MAX) = N''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        A.UserAutoID,
        A.DocumentID,
        A.FileName,
        A.FileType,
        A.STT,
        A.FileSize
    FROM dbo.HR_NghiPhepAttachTbl A
    LEFT JOIN dbo.HR_NghiPhepTbl H ON H.DocumentID = A.DocumentID
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = H.PersonID
    WHERE (ISNULL(@DocumentID, N'') = N'' OR A.DocumentID = @DocumentID)
      AND (ISNULL(@UserAutoID, '') = '' OR A.UserAutoID = @UserAutoID)
      AND (ISNULL(@BranchID, N'') = N'' OR P.BranchID IN (
          SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, N',')
      ))
    ORDER BY TRY_CONVERT(INT, A.STT) ASC, A.UserAutoID DESC;
END;
GO
