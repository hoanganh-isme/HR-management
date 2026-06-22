USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        CandidateID,
        FullName,
        NgaySinh,
        GioiTinh,
        SoCCCD,
        NgayCap,
        NoiCap,
        TinhTrangHonNhan,
        SoDienThoai,
        Email,
        DiaChiThuongTru,
        DiaChiHienTai,
        LinkedIn,
        ViTriUngTuyen,
        PhongBan,
        NguonUngTuyen,
        NgayUngTuyen,
        MucLuongMongMuon,
        NgayCoTheDiLam,
        KyNangChuyenMon,
        KyNangMem,
        NgoaiNgu,
        TinHoc,
        TrangThaiHR,
        DiemDanhGia,
        NhanXetHR,
        NguoiPhuTrach,
        KetQuaCuoiCung,
        MucLuongDeXuat,
        NgayOnboard,
        GhiChuChung,
        UserCreate,
        DateCreate
    FROM dbo.HR_UngVienTbl
    WHERE 
        @Keyword = ''
        OR CandidateID LIKE '%' + @Keyword + '%'
        OR FullName LIKE N'%' + @Keyword + '%'
        OR SoDienThoai LIKE '%' + @Keyword + '%'
        OR Email LIKE '%' + @Keyword + '%'
    ORDER BY DateCreate DESC, CandidateID DESC;
END
GO
