USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_BaoCaoLuong
(
    @PeriodID NVARCHAR(10) = '',
    @PhongBan NVARCHAR(50) = '',
    @BranchID1 NVARCHAR(MAX) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @PeriodID = ISNULL(@PeriodID, '');
    SET @PhongBan = ISNULL(@PhongBan, '');
    SET @BranchID1 = ISNULL(@BranchID1, '');
    DECLARE @CleanKeyword NVARCHAR(200) = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    -- Nếu Keyword có dạng 6 chữ số (ví dụ: '202606'), tự động xem đó là Kỳ Lương
    IF @CleanKeyword <> '' AND LEN(@CleanKeyword) = 6 AND ISNUMERIC(@CleanKeyword) = 1
    BEGIN
        SET @PeriodID = @CleanKeyword;
    END

    -- Nếu kỳ lương trống (do Web load lần đầu chưa truyền), tự động lấy kỳ lương hoạt động mới nhất
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        WHERE isUse = 1 
        ORDER BY FromDate DESC;
    END

    -- Fallback 1: Lấy kỳ bất kỳ trong SY_Period
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        ORDER BY FromDate DESC;
    END

    -- Fallback 2: Lấy kỳ lương đã có dữ liệu chấm công
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
    END

    -- Fallback 3: Lấy kỳ lương đã có bảng lương
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM HR_PayrollTbl 
        ORDER BY PeriodID DESC;
    END

    EXEC HR_PayRoll_Process_Stp @PeriodID = @PeriodID;

    DECLARE 
        @FromDate DATE,
        @ToDate DATE,
        @MaxDay INT;

    SELECT 
        @FromDate = FromDate,
        @ToDate = ToDate
    FROM dbo.SY_Period
    WHERE PeriodID = @PeriodID;

    SET @MaxDay = DAY(@ToDate);

    ------------------------------------------------------------
    -- Chấm công
    ------------------------------------------------------------
    IF OBJECT_ID('tempdb..#ChamCongGom') IS NOT NULL
        DROP TABLE #ChamCongGom;

    SELECT
        TS.PersonID,
        TS.PeriodID,
        CASE
            WHEN TS.PersonID IN ('VP010', 'VP016') THEN @MaxDay
            ELSE SUM(ISNULL(TS.SoNgayDiLam,0))
        END AS NgayCongThucTe,
        SUM(ISNULL(TS.NghiPhep,0)) AS NghiPhep,
        TS.SoNgayLe AS NgayCongLe,
        SUM(
            CASE
                WHEN ISNULL(TS.TangCa,0) > 0
                    THEN ISNULL(TS.TangCa,0)
                ELSE 0
            END
        ) AS NgayCongTangCa
    INTO #ChamCongGom
    FROM HR_TimeSheetTbl TS
    LEFT JOIN dbo.HR_HolidayTbl H 
        ON CAST(H.HolidayDate AS DATE) = CAST(TS.DocumentDate AS DATE)
    WHERE TS.PeriodID = @PeriodID
    GROUP BY
        TS.PersonID,
        TS.PeriodID,
        TS.SoNgayLe;

    ------------------------------------------------------------
    -- Payroll Detail
    ------------------------------------------------------------
    IF OBJECT_ID('tempdb..#DetailPivot') IS NOT NULL
        DROP TABLE #DetailPivot;

    SELECT
        D.DocumentID,

        SUM(CASE WHEN D.Code = 10 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS LuongCoBanTheoCong,
        SUM(CASE WHEN D.Code = 11 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS HoTroAnCaTheoCong,
        SUM(CASE WHEN D.Code = 12 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS HoTroXangXeTheoCong,
        SUM(CASE WHEN D.Code = 13 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS HoTroDienThoaiTheoCong,
        SUM(CASE WHEN D.Code = 14 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS LuongKhoanThucTe,
        SUM(CASE WHEN D.Code = 44 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS ThuongHieuSuatTheoCong,
        SUM(CASE WHEN D.Code = 30 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS TongBH,
        SUM(CASE WHEN D.Code = 50 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS ThuNhapChiuThueTNCN,
        SUM(CASE WHEN D.Code = 60 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS ThuNhapTinhThueTNCN,
        SUM(CASE WHEN D.Code = 31 THEN ISNULL(D.SoTien,0) ELSE 0 END) AS ThueTNCNReal

    INTO #DetailPivot
    FROM HR_PayrollDetailTbl D
    WHERE D.DocumentID IN
    (
        SELECT DocumentID
        FROM HR_PayrollTbl
        WHERE PeriodID = @PeriodID
    )
    GROUP BY D.DocumentID;

    ------------------------------------------------------------
    -- Output API
    ------------------------------------------------------------
    SELECT
        PR.DocumentID,
        PR.PersonID,
        PR.PersonName,

        ISNULL(HD.ChucDanhChuyenMon, P.TitleName) AS ChucVu,

        ISNULL(CC.NgayCongThucTe,0) AS NgayCongThucTe,
        ISNULL(CC.NgayCongLe,0) AS NgayCongLe,
        ISNULL(CC.NgayCongTangCa,0) AS NgayCongTangCa,
        ISNULL(CC.NghiPhep,0) AS NghiPhep,

        CASE 
            WHEN PR.PersonID IN ('VP010', 'VP016') THEN @MaxDay
            ELSE 
                ISNULL(CC.NgayCongThucTe, 0) 
                + ISNULL(CC.NghiPhep, 0) 
                + ISNULL(CC.NgayCongLe, 0)
        END AS TongNgayCong,

        PR.LuongTong,

        ISNULL(BH.MucDong,0) AS MucLuongDongBHXH,

        -- Các cột cơ cấu lương bổ sung để khớp với Desktop
        ISNULL(BH.MucDong,0) AS LuongCoBanCoCau,
        ISNULL(DV.HoTroAnCaTheoCong,0) AS HoTroAnCaCoCau,
        0 AS HoTroDongPhucCoCau,
        ISNULL(DV.HoTroXangXeTheoCong,0) AS HoTroXangXeCoCau,
        0 AS HoTroDienThoaiCoCau,
        ISNULL(DV.ThuongHieuSuatTheoCong,0) AS ThuongHieuSuatCoCau,

        CASE
            WHEN ISNULL(DV.LuongKhoanThucTe,0) > 0
                THEN ISNULL(DV.LuongKhoanThucTe,0)
            ELSE ISNULL(DV.LuongCoBanTheoCong,0)
        END AS LuongCoBan,

        ISNULL(DV.HoTroAnCaTheoCong,0) AS HoTroAnCa,
        ISNULL(DV.HoTroXangXeTheoCong,0) AS HoTroXangXe,
        ISNULL(DV.ThuongHieuSuatTheoCong,0) AS ThuongHieuSuat,

        PR.TienBuTru,
        PR.TongLuong,

        PR.SoNguoiPhuThuoc,
        ISNULL(DV.ThuNhapChiuThueTNCN,0) AS ThuNhapChiuThue,
        ISNULL(DV.ThuNhapTinhThueTNCN,0) AS ThuNhapTinhThue,

        ISNULL(DV.TongBH,0) AS BaoHiem,
        ISNULL(DV.ThueTNCNReal,0) AS ThueTNCN,

        ISNULL(DV.TongBH,0)
            + ISNULL(DV.ThueTNCNReal,0) AS TongGiamTru,

        ISNULL(PR.TienBuTru,0) AS TamUng,

        CASE
            WHEN (PR.TongLuong - ISNULL(DV.TongBH,0) - ISNULL(DV.ThueTNCNReal,0) - ISNULL(PR.TienBuTru,0)) < 0
            THEN 0
            ELSE (PR.TongLuong - ISNULL(DV.TongBH,0) - ISNULL(DV.ThueTNCNReal,0) - ISNULL(PR.TienBuTru,0))
        END AS ThucLinh

    FROM HR_PayrollTbl PR

    LEFT JOIN HR_PersonTbl P
        ON P.PersonID = PR.PersonID

    OUTER APPLY
    (
        SELECT TOP 1
            HD.ChucDanhChuyenMon
        FROM HR_HopDongTbl HD
        WHERE HD.PersonID = PR.PersonID
        ORDER BY HD.NgayKyHopDong DESC
    ) HD

    OUTER APPLY
    (
        SELECT TOP 1
            BH.MucDong
        FROM HR_BaoHiemChiTietTbl BH
        WHERE BH.PersonID = PR.PersonID
    ) BH

    LEFT JOIN #ChamCongGom CC
        ON CC.PersonID = PR.PersonID
       AND CC.PeriodID = PR.PeriodID

    LEFT JOIN #DetailPivot DV
        ON DV.DocumentID = PR.DocumentID

    WHERE PR.PeriodID = @PeriodID
      AND (
            @PhongBan = ''
            OR P.PhongBan LIKE '%' + @PhongBan + '%'
          )
      AND (
            @BranchID1 = ''
            OR P.BranchID IN
            (
                SELECT Value
                FROM dbo.SY_String2TableFnc(
                    REPLACE(@BranchID1, ',', ';')
                )
            )
          )
      AND (
            @CleanKeyword = ''
            -- Nếu Keyword là Kỳ lương (đã dùng để gán cho @PeriodID ở trên) thì không lọc theo tên nữa
            OR (LEN(@CleanKeyword) = 6 AND ISNUMERIC(@CleanKeyword) = 1)
            -- Còn lại, cho phép tìm kiếm theo Tên nhân viên hoặc Mã nhân viên hoặc Chức vụ
            OR PR.PersonName LIKE '%' + @CleanKeyword + '%'
            OR PR.PersonID LIKE '%' + @CleanKeyword + '%'
            OR ISNULL(HD.ChucDanhChuyenMon, P.TitleName) LIKE '%' + @CleanKeyword + '%'
          )

    ORDER BY
        P.PhongBan,
        PR.PersonName;

    DROP TABLE IF EXISTS #ChamCongGom;
    DROP TABLE IF EXISTS #DetailPivot;
END
GO
