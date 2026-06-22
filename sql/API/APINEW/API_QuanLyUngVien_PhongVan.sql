USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_PhongVan
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        VongPhongVan,
        NgayPhongVan,
        NguoiPhongVan,
        KetQuaVong,
        NhanXetChiTiet
    FROM dbo.HR_UngVienPhongVanTbl
    WHERE CandidateID = @CandidateID
    ORDER BY NgayPhongVan ASC;
END
GO
