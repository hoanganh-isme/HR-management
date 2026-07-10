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
    @BranchID      NVARCHAR(MAX) = '',
    @PhongBan      NVARCHAR(200) = '',
    @FromDate      DATETIME      = NULL,
    @ToDate        DATETIME      = NULL,
    @Keyword       NVARCHAR(200) = '',
    @LoaiHopDong   NVARCHAR(50)  = '',
    @ThieuHopDong  BIT           = NULL,
    @ThieuBaoHiem  BIT           = NULL,
    @Template      NVARCHAR(50)  = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- Làm sạch tham số đầu vào
    SET @BranchID    = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    SET @PhongBan    = LTRIM(RTRIM(ISNULL(@PhongBan, '')));
    SET @Keyword     = LTRIM(RTRIM(ISNULL(@Keyword, '')));
    SET @LoaiHopDong = LTRIM(RTRIM(ISNULL(@LoaiHopDong, '')));
    SET @Template    = LTRIM(RTRIM(ISNULL(@Template, '')));

    -- Bỏ qua placeholder chưa được thay thế bởi Gateway Router
    IF @BranchID    LIKE '%{%}%' SET @BranchID    = '';
    IF @PhongBan    LIKE '%{%}%' SET @PhongBan    = '';
    IF @Keyword     LIKE '%{%}%' SET @Keyword     = '';
    IF @LoaiHopDong LIKE '%{%}%' SET @LoaiHopDong = '';
    IF @Template    LIKE '%{%}%' SET @Template    = '';

    -- =========================================================================
    -- Hỗ trợ tương thích ngược (kế thừa lại logic cũ) cho các Template từ Desktop App
    -- =========================================================================
    IF @Template = 'HR_BaoCaoNhanSuNVNReport'
        SET @LoaiHopDong = 'NVN';
    ELSE IF @Template = 'HR_BaoCaoNhanSuNNNReport'
        SET @LoaiHopDong = 'NNN';
    ELSE IF @Template = 'HR_BaoCaoNhanSuThieuHDReport'
        SET @ThieuHopDong = 1;
    ELSE IF @Template = 'HR_BaoCaoNhanSuThieuBHReport'
        SET @ThieuBaoHiem = 1;

    -- =========================================================================
    -- Tính toán số lượng tăng/giảm trong kỳ
    -- =========================================================================
    DECLARE @SoLuongTang INT = 0,
            @SoLuongGiam INT = 0;

    IF @FromDate IS NOT NULL AND @ToDate IS NOT NULL
    BEGIN
        SELECT @SoLuongTang = COUNT(1)
        FROM dbo.HR_PersonTbl
        WHERE NgayVaoLam >= @FromDate
          AND NgayVaoLam < DATEADD(DAY, 1, @ToDate)
          AND (@BranchID = '' OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')));

        SELECT @SoLuongGiam = COUNT(1)
        FROM dbo.HR_PersonTbl
        WHERE NgayNghiViec >= @FromDate
          AND NgayNghiViec < DATEADD(DAY, 1, @ToDate)
          AND PersonStatus = '8'
          AND (@BranchID = '' OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')));
    END

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

        -- ── Các cờ báo cáo ───────────────────────────────────────────────
        CAST(CASE
                WHEN HD.NgayKyHopDong >= @FromDate
                 AND HD.NgayKyHopDong < DATEADD(DAY, 1, @ToDate)
                THEN 1 ELSE 0
             END AS BIT) AS NhanVienMoi,

        CAST(CASE
                WHEN EXISTS
                (
                    SELECT 1
                    FROM dbo.HR_BaoHiemChiTietTbl CT
                    INNER JOIN dbo.HR_BaoHiemTbl BH
                        ON BH.DocumentID = CT.DocumentID
                    WHERE CT.PersonID = P.PersonID
                )
                THEN 0 ELSE 1
             END AS BIT) AS ThieuBaoHiem,

        CAST(CASE
                WHEN HD.PersonID IS NULL THEN 1
                ELSE 0
             END AS BIT) AS ThieuHD,

        @SoLuongTang AS SoLuongTang,
        @SoLuongGiam AS SoLuongGiam,

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
        SELECT PersonID, LuongCoBan, NgayKyHopDong, LoaiHD,
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
        -- =====================================================================
        -- LỌC CỐ ĐỊNH TỪ DESKTOP APP (ĐỒNG BỘ DỮ LIỆU)
        -- Desktop App SP (HR_BaoCaoNhansu2ReportStp) chỉ lấy nhân sự Chính thức (4)
        -- =====================================================================
        P.PersonStatus = 4

        -- Lọc chi nhánh
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

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
        
        -- =====================================================================
        -- Lọc mở rộng cho Báo cáo (từ Web/Mobile hoặc qua Template Desktop)
        -- =====================================================================
        -- Lọc loại hợp đồng (NVN, NNN, ...)
        AND (@LoaiHopDong = '' OR HD.LoaiHD = @LoaiHopDong)

        -- Lọc thiếu hợp đồng
        AND (@ThieuHopDong IS NULL 
             OR (@ThieuHopDong = 1 AND HD.PersonID IS NULL) 
             OR (@ThieuHopDong = 0 AND HD.PersonID IS NOT NULL))

        -- Lọc thiếu bảo hiểm
        AND (@ThieuBaoHiem IS NULL 
             OR (@ThieuBaoHiem = 1 AND NOT EXISTS (
                 SELECT 1 
                 FROM dbo.HR_BaoHiemChiTietTbl CT 
                 INNER JOIN dbo.HR_BaoHiemTbl BH ON BH.DocumentID = CT.DocumentID 
                 WHERE CT.PersonID = P.PersonID
             ))
             OR (@ThieuBaoHiem = 0 AND EXISTS (
                 SELECT 1 
                 FROM dbo.HR_BaoHiemChiTietTbl CT 
                 INNER JOIN dbo.HR_BaoHiemTbl BH ON BH.DocumentID = CT.DocumentID 
                 WHERE CT.PersonID = P.PersonID
             )))

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
    '@BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @FromDate=''{FromDate}'', @ToDate=''{ToDate}'', @Keyword=N''{Keyword}'', @LoaiHopDong=N''{LoaiHopDong}'', @ThieuHopDong=''{ThieuHopDong}'', @ThieuBaoHiem=''{ThieuBaoHiem}'', @Template=N''{Template}'''
);
GO

PRINT 'Da dang ky WA_API [WA_BaoCaoNhanSuReport / View] thanh cong!';
GO
