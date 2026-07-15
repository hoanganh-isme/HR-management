SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Danh sách metadata hợp đồng, tuyệt đối không trả Content/Base64Content.
IF OBJECT_ID('dbo.API_HopDongLaoDong_Attach_Metadata', 'P') IS NULL
    EXEC (N'CREATE PROCEDURE dbo.API_HopDongLaoDong_Attach_Metadata AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach_Metadata
(
    @MaHopDong NVARCHAR(100) = N'',
    @UserAutoID VARCHAR(50) = '',
    @BranchID NVARCHAR(MAX) = N''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        A.UserAutoID,
        A.MaHopDong,
        A.FileName,
        A.FileType,
        A.STT,
        A.FileSize
    FROM dbo.HR_HopDongAttachTbl A
    LEFT JOIN dbo.HR_HopDongTbl H ON H.MaHopDong = A.MaHopDong
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = H.PersonID
    WHERE (ISNULL(@MaHopDong, N'') = N'' OR A.MaHopDong = @MaHopDong)
      AND (ISNULL(@UserAutoID, '') = '' OR A.UserAutoID = @UserAutoID)
      AND (ISNULL(@BranchID, N'') = N'' OR P.BranchID IN (
          SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, N',')
      ))
    ORDER BY TRY_CONVERT(INT, A.STT) ASC, A.UserAutoID DESC;
END;
GO
