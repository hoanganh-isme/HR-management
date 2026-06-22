USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_ChungChi
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        TenChungChi,
        ToChucCap,
        NgayCap
    FROM dbo.HR_UngVienChungChiTbl
    WHERE CandidateID = @CandidateID;
END
GO
