USE X26DIMTUTAC
GO

-- =========================================================================
-- API_BaoCaoNhanSuReportStp
-- Báo cáo tổng hợp danh sách nhân sự từ HR_PersonTbl
-- JOIN với: HR_DepartmentListTbl, HR_PersonStatusTbl, HR_HopDongTbl, HR_LichSuCongTacTbl
--
-- Tham số:
--   @BranchID  : Lọc theo chi nhánh  (rỗng = tất cả)
--   @PhongBan  : Lọc theo bộ phận    (rỗng = tất cả)
--   @FromDate  : Lọc ngày vào làm từ ngày (NULL = bỏ qua)
--   @ToDate    : Lọc ngày vào làm đến ngày (NULL = bỏ qua)
--
-- Test:
--   EXEC dbo.API_BaoCaoNhanSuReportStp
--   EXEC dbo.API_BaoCaoNhanSuReportStp @BranchID='HN', @PhongBan='KINH DOANH'
--   EXEC dbo.API_BaoCaoNhanSuReportStp @FromDate='2024-01-01', @ToDate='2025-12-31'
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoNhanSuReportStp
    @BranchID  NVARCHAR(MAX)  = '',
    @PhongBan  NVARCHAR(200) = '',
    @FromDate  DATETIME      = NULL,
    @ToDate    DATETIME      = NULL,
    @Keyword   NVARCHAR(200) = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- Làm sạch tham số đầu vào
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    SET @PhongBan = LTRIM(RTRIM(ISNULL(@PhongBan, '')));
    SET @Keyword  = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    -- Bỏ qua placeholder chưa được thay thế bởi Gateway Router
    IF @BranchID LIKE '%{%}%' SET @BranchID = '';
    IF @PhongBan LIKE '%{%}%' SET @PhongBan = '';
    IF @Keyword  LIKE '%{%}%' SET @Keyword  = '';

    SELECT
        -- ── Thông tin định danh ──────────────────────────────────────────
        P.PersonID,
        P.NewPersonID,
        P.PersonName,
        P.PersonName2,
        P.GioiTinh,
        P.NgaySinh,
        DATEDIFF(YEAR, P.NgaySinh, GETDATE())
            - CASE
                WHEN DATEADD(YEAR, DATEDIFF(YEAR, P.NgaySinh, GETDATE()), P.NgaySinh) > GETDATE()
                THEN 1 ELSE 0
              END                                        AS Tuoi,

        -- ── CCCD / CMND ──────────────────────────────────────────────────
        P.CMND,
        P.CMNDNgayCap,
        P.CMNDNoiCap,

        -- ── Liên hệ & Địa chỉ ────────────────────────────────────────────
        P.DienThoai,
        P.DiaChiThuongTru,
        P.DiaChiTamTru,

        -- ── Tổ chức ──────────────────────────────────────────────────────
        P.BranchID,
        P.PhongBan,
        ISNULL(LS.TitleName,    P.TitleName)    AS TitleName,
        P.ChucDanhChuyenMon,

        -- ── Thông tin tuyển dụng & thời gian làm việc ────────────────────
        P.PersonStatus,
        PS.PersonStatusName,
        P.isTaiTuyen,

        -- ── Hợp đồng ─────────────────────────────────────────────────────
        P.SoHopDong,
        P.LoaiHopDong,
        P.NgayHopDong,
        HD.LuongCoBan                                   AS LuongCoBanHD,


        -- ── Ngân hàng ────────────────────────────────────────────────────
        P.BankName,
        P.BankAccountNo,
        P.BankHolder,
        P.BankLocation,

        -- ── Học vấn / Nghề nghiệp / Nhân khẩu ─────────────────────────────
        P.EducationName,
        P.NationName,
        P.Nationality,
        P.PeoplesName,
        P.ReligionName,

        -- ── Chấm công ────────────────────────────────────────────────────
        P.ChamCong,
        P.UserID,
        P.STT,


        -- ── Audit ────────────────────────────────────────────────────────
        P.UserCreate,
        P.UserUpdate,
        P.DateCreate,
        P.DateUpdate

    FROM dbo.HR_PersonTbl P


    -- Trạng thái nhân viên
    LEFT JOIN dbo.HR_PersonStatusTbl PS
        ON PS.PersonStatus = P.PersonStatus

    -- Lương hợp đồng mới nhất
    LEFT JOIN (
        SELECT PersonID, LuongCoBan,
               ROW_NUMBER() OVER (PARTITION BY PersonID ORDER BY NgayKyHopDong DESC) AS rn
        FROM dbo.HR_HopDongTbl
    ) HD ON P.PersonID = HD.PersonID AND HD.rn = 1

    -- Chức vụ / vị trí từ lịch sử công tác mới nhất
    LEFT JOIN (
        SELECT PersonID, TitleName,
               ROW_NUMBER() OVER (PARTITION BY PersonID ORDER BY NgayThayDoi DESC) AS rn
        FROM dbo.HR_LichSuCongTacTbl
    ) LS ON P.PersonID = LS.PersonID AND LS.rn = 1

    WHERE
        -- Lọc chi nhánh
        (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        -- Lọc bộ phận (hỗ trợ LIKE nếu truyền một phần tên)
        AND (@PhongBan = '' OR P.PhongBan LIKE N'%' + @PhongBan + N'%')

        -- Lọc khoảng ngày vào làm (nếu truyền ToDate)
        AND (@ToDate IS NULL OR ISNULL(P.NgayVaoLam, '1900-01-01') <= @ToDate)

        -- Nhân viên chưa nghỉ hoặc nghỉ sau FromDate (nếu truyền FromDate)
        AND (@FromDate IS NULL OR P.NgayNghiViec IS NULL OR P.NgayNghiViec >= @FromDate)

        -- Lọc theo từ khóa (Mã NV, Tên NV, Điện thoại, CMND, Số hợp đồng)
        AND (
            @Keyword = ''
            OR P.PersonID LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
            OR P.DienThoai LIKE '%' + @Keyword + '%'
            OR P.CMND LIKE '%' + @Keyword + '%'
            OR P.SoHopDong LIKE '%' + @Keyword + '%'
        )

    ORDER BY P.BranchID, P.PhongBan, P.PersonName;
END
GO

PRINT 'Da tao SP API_BaoCaoNhanSuReportStp thanh cong!';
GO

-- =========================================================================
-- Đăng ký vào bảng WA_API để API_Gateway_Router có thể định tuyến
-- List name: 'WA_BaoCaoNhanSuReport'  →  khớp với FormName trong SY_FrmLstTbl
-- =========================================================================
DELETE FROM dbo.WA_API
WHERE list = 'WA_BaoCaoNhanSuReport';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BaoCaoNhanSuReport',
    'View',
    'API_BaoCaoNhanSuReportStp',
    '@BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @Keyword=N''{Keyword}'''
);
GO

PRINT 'Da dang ky WA_API [WA_BaoCaoNhanSuReport / View] thanh cong!';
GO
