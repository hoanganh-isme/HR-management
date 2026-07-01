
-- =========================================================================
-- Master API: Danh sách nhân viên đang làm việc (PersonStatus IN (1, 4))
-- Trang: WA_PersonInFrm
-- Khác biệt duy nhất so với API_HoSoNhanVien: lọc PersonStatus IN (1, 4)
-- Các SP detail (T1-T9) dùng chung với WA_PersonFullFrm
-- EXEC dbo.API_HoSoNhanVienIn @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVienIn
(
    @Keyword   NVARCHAR(200) = '',
    @BranchID  NVARCHAR(MAX) = '',
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
        
        -- === THAY ĐỔI Ở ĐÂY: Lấy tên trạng thái thay vì mã số ===
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
        P.MaNVChamCong,
        P.PersonName2,
        P.PostionName,
        P.NgayNghiViec,
        P.WorkingGroupName,
        P.DungCuLamViec,
        P.GhiChu,
        P.LocationID,
        P.NgayDuKienTV,
        P.UserCreate,
        P.UserUpdate,
        P.DateUpdate,
        P.DateCreate,
        P.DiaChiTamTru,
        P.isTaiTuyen,
        S.PersonStatusName,
        PA.FileName,
        PA.Content
    FROM dbo.HR_PersonTbl P
    
    -- === THAY ĐỔI Ở ĐÂY: LEFT JOIN với bảng trạng thái ===
    LEFT JOIN dbo.HR_PersonStatusTbl S 
        ON P.PersonStatus = S.PersonStatus
        
    OUTER APPLY (
        SELECT TOP 1 FileName, Content
        FROM dbo.HR_PersonAttachTbl
        WHERE PersonID = P.PersonID
        ORDER BY UserAutoID DESC
    ) PA
    OUTER APPLY (
        SELECT TOP 1 LoaiHD
        FROM dbo.HR_HopDongTbl
        WHERE PersonID = P.PersonID
        ORDER BY NgayKyHopDong DESC
    ) HD
    WHERE 
        -- Chỉ lấy nhân viên đang làm việc (1 và 4)
        P.PersonStatus IN (1, 4)

        -- Bộ lọc từ khoá (Keyword)
        AND (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
        
        -- Bộ lọc chi nhánh (BranchID)
        AND (@BranchID = '' OR LTRIM(RTRIM(P.BranchID)) IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        
        -- Bộ lọc bộ phận (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        
        -- Bộ lọc năm lập
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
        
        -- Bộ lọc loại hợp đồng
        AND (@LoaiHD = '' OR HD.LoaiHD LIKE N'%' + @LoaiHD + '%')
    ORDER BY P.PersonID DESC;
END
GO

-- =========================================================================
-- Đăng ký WA_API và cấu hình hệ thống:
-- Xem file: sql/Insert/Insert_WA_PersonInFrm_SY_FormatFields.sql
-- =========================================================================

PRINT 'SP API_HoSoNhanVienIn da san sang. Chay Insert_WA_PersonInFrm_SY_FormatFields.sql de dang ky form.';
GO

