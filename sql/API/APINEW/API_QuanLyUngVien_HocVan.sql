USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_HocVan
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        TruongDaoTao,
        ChuyenNganh,
        TuNam,
        DenNam,
        BangCap
    FROM dbo.HR_UngVienHocVanTbl
    WHERE CandidateID = @CandidateID;
END
GO
