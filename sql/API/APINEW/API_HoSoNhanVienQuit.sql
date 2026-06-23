USE X26DIMTUTAC
GO

-- =========================================================================
-- Master API: Danh sách nhân viên đã nghỉ việc (PersonStatus = 8)
-- Trang: WA_PersonQuitFrm
-- Khác biệt duy nhất so với API_HoSoNhanVienIn: lọc PersonStatus = 8
-- Các SP detail (T1, T3, T4) dùng chung với WA_PersonFullFrm
-- EXEC dbo.API_HoSoNhanVienQuit @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVienQuit
(
    @Keyword   NVARCHAR(200) = '',
    @BranchID  NVARCHAR(50)  = '',
    @PhongBan  NVARCHAR(50)  = '',
    @NamLap    INT           = NULL,
    @LoaiHD    NVARCHAR(50)  = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- Chức vụ
        P.ChucDanhChuyenMon,    -- Chức danh chuyên môn
        P.NgaySinh,             -- Ngày sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Địa chỉ thường trú
        P.NgayVaoLam,           -- Ngày nhận việc
        P.BranchID,
        P.NgayHopDong,
        P.NationName,
        P.SoHopDong,
        P.DienThoai,
        P.PersonStatus,
        P.NewPersonID,
        P.CardNo,
        P.ProvineName,
        P.DiaChiHienNay,
        P.Quanly,
        P.NgayThuViec,
        P.BankHolder,
        P.BankAccountNo,
        P.BankName,
        P.BankLocation,
        P.SocialID,
        P.SocialDate,
        P.NgayKetThucBH,
        P.ShiftID,
        P.SoTheBHYT,
        P.ThoiGianHuongBHYT,
        P.NoiDangKyBHYT,
        P.ChamCong,
        P.LoaiHopDong,
        P.NgayHetHopDong,
        P.NguoiLienHe,
        P.MoiQuanHe,
        P.NguoiLienHeSoDT,
        P.GioiTinh,
        P.HonNhan,
        P.CMNDNgayCap,
        P.CMNDNoiCap,
        P.NoiSinh,
        P.PeoplesName,
        P.ReligionName,
        P.Email,
        P.EducationName,
        P.Nationality,
        P.JobName,
        P.CareerName,
        P.HospitalName,
        PA.FileName,
        PA.Content
    FROM dbo.HR_PersonTbl P
    OUTER APPLY (
        SELECT TOP 1 FileName, Content
        FROM dbo.HR_PersonAttachTbl
        WHERE PersonID = P.PersonID
        ORDER BY UserAutoID DESC
    ) PA
    WHERE 
        -- Chỉ lấy nhân viên đã nghỉ việc (8: Đã nghỉ việc)
        P.PersonStatus = 8

        -- Bộ lọc từ khoá (Keyword)
        AND (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
         
        -- Bộ lọc chi nhánh (BranchID)
        AND (@BranchID = '' OR P.BranchID = @BranchID)
         
        -- Bộ lọc bộ phận (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
         
        -- Bộ lọc năm lập
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
         
        -- Bộ lọc loại hợp đồng
        AND (@LoaiHD = '' OR P.SoHopDong LIKE N'%' + @LoaiHD + '%')
    ORDER BY P.PersonID DESC;
END
GO

PRINT 'SP API_HoSoNhanVienQuit da san sang. Chay Insert_WA_PersonQuitFrm_SY_FormatFields.sql de dang ky form.';
GO
