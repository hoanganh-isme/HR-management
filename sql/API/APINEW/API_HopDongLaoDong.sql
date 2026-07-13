-- USE X26DIMTUTAC
-- GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong
-- Description: Lấy danh sách hợp đồng lao động kết hợp thông tin nhân viên
--              Hỗ trợ lọc theo từ khóa, năm lập, loại hợp đồng, chi nhánh
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong
(
    @Keyword NVARCHAR(200) = '',
    @NamLap NVARCHAR(50) = '',
    @LoaiHD NVARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        H.MaHopDong,
        H.PersonID,
        P.PersonName AS PersonName,
        H.NgayKyHopDong,
        H.NoiDung,
        H.LoaiHopDong,
        H.ThoiGianLamViec,
        H.NgayCoHieuLuc,
        H.NgayHetHieuLuc,
        H.PhuongTien,
        H.HinhThucTraLuong,
        H.LuongCoBan,
        H.NguoiKy,
        H.ChucDanhChuyenMonHD,
        H.ChucVuNguoiKy,
        H.DiaDiemLamViec,
        H.PersonStatus,
        S.PersonStatusName,
        H.UserCreate,
        H.UserUpdate,
        H.DateUpdate,
        H.DateCreate,
        H.LoaiTien,
        H.NamLap,
        H.LoaiHD,
        H.MucDong,
        H.ThoiGianThuViec,
        P.BranchID,
        P.CMND,
        P.CMNDNgayCap,
        P.CMNDNoiCap,
        P.DiaChiThuongTru
    FROM dbo.HR_HopDongTbl H
    LEFT JOIN dbo.HR_PersonTbl P ON H.PersonID = P.PersonID
    LEFT JOIN dbo.HR_PersonStatusTbl S ON H.PersonStatus = S.PersonStatus
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR H.MaHopDong LIKE '%' + @Keyword + '%' 
           OR H.PersonID LIKE '%' + @Keyword + '%' 
           OR P.PersonName LIKE N'%' + @Keyword + '%')
      AND (ISNULL(@NamLap, '') = '' OR H.NamLap = TRY_CAST(@NamLap AS INT))
      AND (ISNULL(@LoaiHD, '') = '' OR H.LoaiHD = @LoaiHD)
      AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY H.NgayKyHopDong DESC, H.MaHopDong DESC;
END
GO
