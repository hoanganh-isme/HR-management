USE X26DIMTUTAC
GO

-- =========================================================================
-- 1. Master API: Danh sách nhân viên tổng hợp
-- EXEC dbo.API_HoSoNhanVien @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVien
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
        P.HospitalName
    FROM dbo.HR_PersonTbl P
    WHERE 
        -- Bộ lọc từ khoá (Keyword)
        (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
        
        -- Bộ lọc chi nhánh (BranchID)
        AND (@BranchID = '' OR P.BranchID = @BranchID)
        
        -- Bộ lọc bộ phận (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        
        -- Bộ lọc năm lập (NamLap - lọc theo năm sinh của nhân viên hoặc năm vào làm nếu không có cột NamLap)
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
        
        -- Bộ lọc loại hợp đồng (LoaiHopDong / LoaiHD)
        AND (@LoaiHD = '' OR P.SoHopDong LIKE N'%' + @LoaiHD + '%')
    ORDER BY P.PersonID DESC;
END
GO

-- =========================================================================
-- 2. Detail API Tab 1: Quá trình làm việc và lương (HR_PersonSalaryTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T1_Salary
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
       *
    FROM dbo.HR_PersonSalaryTbl
    WHERE PersonID = @PersonID
END
GO

-- =========================================================================
-- 3. Detail API Tab 2: Lương & Phụ cấp (HR_PersonAllowanceTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T2_Allowance
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        MaPhuCap,
        PersonID,
        FromDate,
        ToDate,
        NoiDungPhuCap,
        GhiChu
    FROM dbo.HR_PersonAllowanceTbl
    WHERE PersonID = @PersonID;
END
GO

-- =========================================================================
-- 4. Detail API Tab 3: Khen thưởng - Kỷ luật (HR_PersonKTKLTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T3_KTKL
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        NoiDungKTKL,
        GhiChu
    FROM dbo.HR_PersonKTKLTbl
    WHERE PersonID = @PersonID;
END
GO

-- =========================================================================
-- 5. Detail API Tab 4: Khai báo phép năm (HR_PersonNghiPhepTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T4_NghiPhep
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        Nam,
        SoNgay,
        PhepThamNien,
        SoNgayDaSuDung,
        SoNgayConLai,
        PhepTonNamTruoc,
        SoNgayPhepTet,
        SoNgayPhepOm,
        NgayCapNhat,
        GhiChu
    FROM dbo.HR_PersonNghiPhepTbl
    WHERE PersonID = @PersonID
    ORDER BY Nam DESC;
END
GO

-- =========================================================================
-- 6. Detail API Tab 5: Gia cảnh & Mối liên hệ (HR_PersonRelationTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T5_Relation
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        RelationID,
        PersonRelationName,
        NgaySinh,
        DiaChiThuongTru,
        DiaChiHienNay,
        IsNguoiPhuThuoc,
        GiamTruTuThang,
        GiamTruDenThang
    FROM dbo.HR_PersonRelationTbl
    WHERE PersonID = @PersonID;
END
GO

-- =========================================================================
-- 7. Detail API Tab 6: Lịch sử hợp đồng (HR_HopDongTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T6_HopDong
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaHopDong,
        PersonID,
        PersonName,
        NgayKyHopDong,
        NgayCoHieuLuc,
        NgayHetHieuLuc,
        LoaiHopDong,
        LuongCoBan,
        MucDong,
        NoiDung
    FROM dbo.HR_HopDongTbl
    WHERE PersonID = @PersonID
    ORDER BY NgayKyHopDong DESC;
END
GO

-- =========================================================================
-- 8. Detail API Tab 7: Lịch sử công tác (HR_LichSuCongTacTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T7_CongTac
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        PhongBan,
        TitleName,
        PostionName,
        Quanly,
        ShiftID,
        NgayThayDoi,
        UserName
    FROM dbo.HR_LichSuCongTacTbl
    WHERE PersonID = @PersonID
    ORDER BY NgayThayDoi DESC;
END
GO

-- =========================================================================
-- 9. Detail API Tab 8: Lịch sử công việc (HR_PersonLogTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T8_Log
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        PersonID,
        UserName,
        LogDate,
        BranchID,
        StatusID,
        Notes
    FROM dbo.HR_PersonLogTbl
    WHERE PersonID = @PersonID
    ORDER BY LogDate DESC;
END
GO

-- =========================================================================
-- 10. Detail API Tab 9: Giấy tờ (HR_PersonGiayToTbl)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_PersonFull_T9_GiayTo
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        DocumentID,
        PersonID,
        LoaiGiayTo,
        TuNgay,
        DenNgay,
        Notes
    FROM dbo.HR_PersonGiayToTbl
    WHERE PersonID = @PersonID
    ORDER BY DocumentID DESC;
END
GO

-- =========================================================================
-- Đăng ký các API này vào bảng WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_PersonFullFrm';
DELETE FROM dbo.WA_API WHERE list LIKE 'API_PersonFull_T%';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PersonFullFrm', 'View', 'API_HoSoNhanVien', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'''),
('API_PersonFull_T1_Salary',    'View', 'API_PersonFull_T1_Salary',    '@PersonID=N''{PersonID}'''),
('API_PersonFull_T2_Allowance', 'View', 'API_PersonFull_T2_Allowance', '@PersonID=N''{PersonID}'''),
('API_PersonFull_T3_KTKL',      'View', 'API_PersonFull_T3_KTKL',      '@PersonID=N''{PersonID}'''),
('API_PersonFull_T4_NghiPhep',  'View', 'API_PersonFull_T4_NghiPhep',  '@PersonID=N''{PersonID}'''),
('API_PersonFull_T5_Relation',  'View', 'API_PersonFull_T5_Relation',  '@PersonID=N''{PersonID}'''),
('API_PersonFull_T6_HopDong',   'View', 'API_PersonFull_T6_HopDong',   '@PersonID=N''{PersonID}'''),
('API_PersonFull_T7_CongTac',   'View', 'API_PersonFull_T7_CongTac',   '@PersonID=N''{PersonID}'''),
('API_PersonFull_T8_Log',       'View', 'API_PersonFull_T8_Log',       '@PersonID=N''{PersonID}'''),
('API_PersonFull_T9_GiayTo',    'View', 'API_PersonFull_T9_GiayTo',    '@PersonID=N''{PersonID}''');
GO

PRINT 'Da tao toan bo API_HoSoNhanVien va cac detail SPs dong thoi dang ky WA_API thanh cong!';
GO
