USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_KinhNghiem
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        CongTyCu,
        ViTriCongTac,
        TuThangNam,
        DenThangNam,
        MoTaCongViec
    FROM dbo.HR_UngVienKinhNghiemTbl
    WHERE CandidateID = @CandidateID;
END
GO
