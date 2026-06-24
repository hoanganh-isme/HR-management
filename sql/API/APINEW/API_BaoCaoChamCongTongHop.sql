USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCongTongHop] - BÁO CÁO CHẤM CÔNG TỔNG HỢP MẪU 2 CHO WEB APP
-- Chuyển đổi từ Store Procedure HR_TimeSheetTH2ReportStp của bản Desktop
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoChamCongTongHop
(
    @PeriodID NVARCHAR(50) = '',
    @PhongBan NVARCHAR(50) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @PeriodID = LTRIM(RTRIM(ISNULL(@PeriodID, '')));
    SET @PhongBan = LTRIM(RTRIM(ISNULL(@PhongBan, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    -- Nếu lọc Kỳ trống, tự động lấy Kỳ mới nhất để tránh trống dữ liệu lúc load trang
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback nếu bảng chấm công trống hoàn toàn
        IF @PeriodID = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END

    -- Gọi xử lý đồng bộ dữ liệu chấm công như bản Desktop
    EXEC dbo.HR_TimeSheetDay_Process_Stp 
        @Period = @PeriodID, 
        @BranchID = '';

    EXEC dbo.HR_TimeSheet_UpdateDailyStatus_Stp 
        @Period = @PeriodID;

    -- Tính toán ngày bắt đầu và kết thúc của Kỳ
    DECLARE 
        @FromDate DATE,
        @ToDate DATE,
        @MaxDay INT,
        @DayColumns NVARCHAR(MAX) = N'',
        @SQL NVARCHAR(MAX),
        @ThangTitle NVARCHAR(50),
        @i INT = 1;

    SELECT 
        @FromDate = FromDate, 
        @ToDate = ToDate 
    FROM dbo.SY_Period 
    WHERE PeriodID = @PeriodID;

    IF @FromDate IS NULL RETURN;

    -- Cập nhật ngày lễ, công phép từ đơn nghỉ phép vào bảng chấm công
    ;WITH CTE_NghiPhep AS
    (
        SELECT 
            M.PersonID,
            M.StatusID,
            SUM(ISNULL(DT.SoNgayNghi, 0)) AS SoNgayNghi
        FROM dbo.HR_NghiPhepTbl M
        INNER JOIN dbo.HR_NghiPhepDetailTbl DT 
            ON M.DocumentID = DT.DocumentID
        WHERE ISNULL(M.IsXinHuy, 0) = 0
          AND M.PersonID IS NOT NULL
          AND CAST(DT.NghiTuNgay AS DATE) <= @ToDate
          AND CAST(DT.DenNgay AS DATE) >= @FromDate
        GROUP BY 
            M.PersonID,
            M.StatusID
    ),
    CTE_TongNghi AS
    (
        SELECT 
            PersonID,
            SUM(CASE WHEN StatusID = 8 THEN SoNgayNghi ELSE 0 END) AS CongPhep,
            SUM(CASE WHEN StatusID <> 8 THEN SoNgayNghi ELSE 0 END) AS NghiKhongPhep
        FROM CTE_NghiPhep
        GROUP BY PersonID
    ),
    CTE_CongLe AS 
    (
        SELECT 
            TS.PersonID, 
            SUM(ISNULL(H.SoCong, 0)) AS SoNgayLe
        FROM dbo.HR_TimeSheetTbl TS
        INNER JOIN dbo.HR_HolidayTbl H 
            ON CAST(H.HolidayDate AS DATE) BETWEEN @FromDate AND @ToDate
        WHERE TS.PeriodID = @PeriodID
        GROUP BY TS.PersonID
    )
    UPDATE TS
    SET 
        TS.CongPhep       = ISNULL(NP.CongPhep, 0),
        TS.NghiKhongPhep = ISNULL(NP.NghiKhongPhep, 0),
        TS.SoNgayLe      = ISNULL(CL.SoNgayLe, 0)
    FROM dbo.HR_TimeSheetTbl TS
    LEFT JOIN CTE_TongNghi NP 
        ON NP.PersonID = TS.PersonID
    LEFT JOIN CTE_CongLe CL 
        ON CL.PersonID = TS.PersonID
    WHERE TS.PeriodID = @PeriodID;

    -- Dựng chuỗi cột ngày động [1] -> [31]
    SET @MaxDay = DAY(@ToDate);
    SET @ThangTitle = N'THÁNG ' + RIGHT('0' + CAST(MONTH(@FromDate) AS VARCHAR(2)), 2);

    WHILE @i <= @MaxDay
    BEGIN
        SET @DayColumns += N',
        MAX(
            CASE 
                WHEN DAY(N.Ngay) = ' + CAST(@i AS NVARCHAR(2)) + N' 
                THEN 
                    CASE 
                        WHEN H.HolidayDate IS NOT NULL AND ISNULL(D.SoCong, 0) > 0 
                            THEN CAST(H.HolidayID AS NVARCHAR(20)) + ''+'' + CAST(D.SoCong AS NVARCHAR(20))

                        WHEN H.HolidayDate IS NOT NULL 
                            THEN CAST(H.HolidayID AS NVARCHAR(20))

                        WHEN (DATEPART(WEEKDAY, N.Ngay) + @@DATEFIRST - 1) % 7 = 0 
                             AND ISNULL(D.SoCong, 0) > 0 
                            THEN CAST(D.SoCong AS NVARCHAR(20))

                        WHEN (DATEPART(WEEKDAY, N.Ngay) + @@DATEFIRST - 1) % 7 = 0 
                             THEN ''OFF''

                        WHEN LK.PersonID IS NOT NULL 
                            THEN ''1''

                        WHEN NP.PersonID IS NOT NULL 
                            THEN NP.KyHieu

                        WHEN ISNULL(D.SoCong, 0) > 0 
                            THEN CAST(D.SoCong AS NVARCHAR(20))

                        WHEN N.Ngay > CAST(GETDATE() AS DATE) 
                            THEN ''''

                        ELSE ''KP'' 
                    END
            END
        ) AS [' + CAST(@i AS NVARCHAR(2)) + N']';

        SET @i += 1;
    END;

    -- Biên dịch câu lệnh SQL động với đầy đủ các bộ lọc
    SET @SQL = N'
    ;WITH NgayCTE AS
    (
        SELECT @FromDate AS Ngay
        UNION ALL
        SELECT DATEADD(DAY, 1, Ngay) 
        FROM NgayCTE 
        WHERE Ngay < @ToDate
    ),

    BungDonNghi AS
    (
        SELECT
            M.PersonID,
            DT.HinhThucNghi,
            M.StatusID,
            DATEADD(DAY, V.number, CAST(DT.NghiTuNgay AS DATE)) AS Ngay,
            ROW_NUMBER() OVER 
            (
                PARTITION BY M.PersonID, DT.NghiTuNgay 
                ORDER BY V.number
            ) AS NgayThuMayTrongDon,
            ISNULL(DT.SoNgayNghi, 1) AS TongSoNgayNghiThuong
        FROM dbo.HR_NghiPhepTbl M
        INNER JOIN dbo.HR_NghiPhepDetailTbl DT 
            ON M.DocumentID = DT.DocumentID
        INNER JOIN master..spt_values V 
            ON V.type = ''P'' 
           AND V.number < CEILING(ISNULL(DT.SoNgayNghi, 1))
        WHERE ISNULL(M.IsXinHuy, 0) = 0 
          AND CAST(DT.NghiTuNgay AS DATE) <= @ToDate
          AND CAST(DT.DenNgay AS DATE) >= @FromDate
    ),
    
    NghiPhep AS
    (
        SELECT 
            B.PersonID,
            B.Ngay,
            ISNULL(B.HinhThucNghi, ''R'') AS HinhThucNghiThucTe,

            CAST(
                CASE 
                    WHEN B.NgayThuMayTrongDon <= FLOOR(B.TongSoNgayNghiThuong) 
                        THEN 1.00
                    ELSE B.TongSoNgayNghiThuong - FLOOR(B.TongSoNgayNghiThuong)
                END 
            AS DECIMAL(18,2)) AS SoNgayNghiTrongNgay,

            CASE 
                WHEN B.NgayThuMayTrongDon <= FLOOR(B.TongSoNgayNghiThuong) 
                    THEN ISNULL(B.HinhThucNghi, ''R'')
                ELSE ISNULL(B.HinhThucNghi, ''R'') + ''1/2''
            END AS KyHieu,

            B.StatusID
        FROM BungDonNghi B
    ),

    LuongKhoan AS
    (
        SELECT 
            LK.PersonID,
            MAX(LK.SoTienKhoan) AS SoTienKhoan
        FROM dbo.HR_LuongKhoanTbl LK
        WHERE CAST(LK.TuNgay AS DATE) <= @ToDate
          AND (LK.DenNgay IS NULL OR CAST(LK.DenNgay AS DATE) >= @FromDate)
        GROUP BY LK.PersonID
    ),

    CongDiLamHopLe AS
    (
        SELECT 
            D.PersonID, 
            SUM(ISNULL(D.SoCong, 0)) AS SoNgayDiLamHopLe
        FROM dbo.HR_TimeSheetDayTbl D
        WHERE D.PeriodID = @PeriodID 
          AND CAST(D.Ngay AS DATE) BETWEEN @FromDate AND @ToDate
        GROUP BY D.PersonID
    ),

    CongNghiCoLuong AS
    (
        SELECT 
            NP.PersonID, 
            SUM(ISNULL(NP.SoNgayNghiTrongNgay, 0)) AS SoCongNghiCoLuong
        FROM NghiPhep NP 
        INNER JOIN dbo.HR_HinhThucNghiListTbl HTN 
            ON HTN.HinhThucNghi = NP.HinhThucNghiThucTe
        WHERE NP.Ngay BETWEEN @FromDate AND @ToDate 
          AND ISNULL(HTN.NghiCoLuong, 0) = 1 
          AND ISNULL(NP.HinhThucNghiThucTe, '''') NOT IN (''HH'', ''BL'')
          AND NOT EXISTS 
          (
              SELECT 1 
              FROM dbo.HR_HolidayTbl H 
              WHERE CAST(H.HolidayDate AS DATE) = NP.Ngay
          )
        GROUP BY NP.PersonID
    ),

    CongNghiHieuHy AS
    (
        SELECT 
            NP.PersonID, 
            SUM(ISNULL(NP.SoNgayNghiTrongNgay, 0)) AS SoCongHieuHy
        FROM NghiPhep NP 
        WHERE NP.Ngay BETWEEN @FromDate AND @ToDate 
          AND NP.HinhThucNghiThucTe = ''HH''
          AND NOT EXISTS 
          (
              SELECT 1 
              FROM dbo.HR_HolidayTbl H 
              WHERE CAST(H.HolidayDate AS DATE) = NP.Ngay
          )
        GROUP BY NP.PersonID
    ),

    CongNghiPhepBuLe AS
    (
        SELECT 
            NP.PersonID, 
            SUM(ISNULL(NP.SoNgayNghiTrongNgay, 0)) AS SoCongBuLe
        FROM NghiPhep NP 
        WHERE NP.Ngay BETWEEN @FromDate AND @ToDate 
          AND NP.HinhThucNghiThucTe = ''BL''
          AND NOT EXISTS 
          (
              SELECT 1 
              FROM dbo.HR_HolidayTbl H 
              WHERE CAST(H.HolidayDate AS DATE) = NP.Ngay
          )
        GROUP BY NP.PersonID
    ),

    CongNghiKhongPhep AS
    (
        SELECT 
            PE.PersonID,
            SUM(
                CASE 
                    WHEN NP.PersonID IS NULL 
                         AND ISNULL(D.SoCong, 0) = 0 
                         AND H.HolidayDate IS NULL 
                         AND F.Ngay <= CAST(GETDATE() AS DATE) 
                         AND (DATEPART(WEEKDAY, F.Ngay) + @@DATEFIRST - 1) % 7 <> 0 
                        THEN 1
                    ELSE 0 
                END
            ) AS SoNgayNghiKhongPhep
        FROM NgayCTE F
        CROSS JOIN 
        (
            SELECT DISTINCT PersonID 
            FROM dbo.HR_TimeSheetTbl 
            WHERE PeriodID = @PeriodID
        ) PE
        LEFT JOIN dbo.HR_TimeSheetDayTbl D 
            ON PE.PersonID = D.PersonID 
           AND CAST(D.Ngay AS DATE) = F.Ngay 
           AND D.PeriodID = @PeriodID
        LEFT JOIN NghiPhep NP 
            ON PE.PersonID = NP.PersonID 
           AND NP.Ngay = F.Ngay
        LEFT JOIN dbo.HR_HolidayTbl H 
            ON CAST(H.HolidayDate AS DATE) = F.Ngay
        GROUP BY PE.PersonID
    ),

    CongLe AS
    (
        SELECT 
            TS.PersonID, 
            TS.PeriodID, 
            SUM(ISNULL(H.SoCong, 0)) AS NgayCongLe
        FROM dbo.HR_TimeSheetTbl TS 
        INNER JOIN dbo.HR_HolidayTbl H 
            ON CAST(H.HolidayDate AS DATE) BETWEEN @FromDate AND @ToDate
        WHERE TS.PeriodID = @PeriodID 
        GROUP BY TS.PersonID, TS.PeriodID
    )

    SELECT 
        ROW_NUMBER() OVER(ORDER BY TS.PersonID) AS STT, 
        TS.UserAutoID, 
        TS.PersonID, 
        P.PersonName AS PersonName, 
        P.PhongBan, 
        HD.ChucDanhChuyenMonHD AS ChucDanh, 
        @ThangTitle AS ThangTitle, 
        TS.DocumentDate, 

        CASE 
            WHEN TS.PersonID IN (''VP016'', ''VP010'') THEN @MaxDay
            ELSE TS.SoNgayThang
        END AS SoNgayThang,

        CASE 
            WHEN TS.PersonID IN (''VP016'', ''VP010'') THEN @MaxDay
            WHEN LK.PersonID IS NOT NULL THEN ISNULL(TS.SoNgayThang, 0)
            ELSE ISNULL(CDL.SoNgayDiLamHopLe, 0)
        END AS SoNgayDiLam,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(TS.SoNgayLe, ISNULL(CL.NgayCongLe, 0))
        END AS SoNgayLe,

        TS.TangCa, 
        TS.SoNgayCongTac, 
        TS.CongPhep,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(CNL.SoCongNghiCoLuong, 0)
        END AS NghiPhep,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(CKP.SoNgayNghiKhongPhep, 0)
        END AS NghiKhongPhep,

        TS.PeriodID, 
        TS.GhiChu'
        + @DayColumns + N',

        CASE 
            WHEN TS.PersonID IN (''VP016'', ''VP010'') THEN @MaxDay
            WHEN LK.PersonID IS NOT NULL THEN ISNULL(TS.SoNgayThang, 0)
            ELSE ISNULL(CDL.SoNgayDiLamHopLe, 0)
        END AS [TongNgayDiLam],

        CASE 
            WHEN TS.PersonID IN (''VP016'', ''VP010'') THEN @MaxDay
                     + ISNULL(TS.SoNgayLe, ISNULL(CL.NgayCongLe, 0))
                     + ISNULL(CNL.SoCongNghiCoLuong, 0)
            WHEN LK.PersonID IS NOT NULL THEN ISNULL(TS.SoNgayThang, 0)
            ELSE 
                ISNULL(CDL.SoNgayDiLamHopLe, 0) 
                + ISNULL(CNL.SoCongNghiCoLuong, 0) 
                + ISNULL(CBL.SoCongBuLe, 0) 
                + ISNULL(TS.SoNgayLe, ISNULL(CL.NgayCongLe, 0))
        END AS TongCong,

        CASE 
            WHEN TS.PersonID IN (''VP016'', ''VP010'') THEN @MaxDay
            ELSE TS.SoNgayThang
        END AS SoNgayCongThang,

        ISNULL(NPYear.SoNgayConLai, 0) AS PhepConLaiNam, 
        ISNULL(NPYear.SoNgayPhepTet, 0) AS SoNgayPhepTet, 
        ISNULL(NPYear.SoNgay, 0) AS PhepPhatSinh,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(CHH.SoCongHieuHy, 0)
        END AS HieuHi,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(CBL.SoCongBuLe, 0)
        END AS PhepBuLe,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 0
            ELSE ISNULL(CNL.SoCongNghiCoLuong, 0)
        END AS PhepSuDungTrongThang,

        ISNULL(NPYear.SoNgayDaSuDung, 0) AS PhepDaDungLuyKe, 
        ISNULL(NPYear.SoNgayConLai, 0) AS TonPhepHienTai,

        CASE 
            WHEN LK.PersonID IS NOT NULL THEN 1
            ELSE 0
        END AS IsLuongKhoan,

        ISNULL(LK.SoTienKhoan, 0) AS SoTienKhoan

    FROM dbo.HR_TimeSheetTbl TS 
    LEFT JOIN dbo.HR_PersonTbl P 
        ON TS.PersonID = P.PersonID 
    LEFT JOIN dbo.HR_DepartmentListTbl DP 
        ON P.PhongBan = DP.PhongBan

    CROSS JOIN NgayCTE N
    LEFT JOIN dbo.HR_TimeSheetDayTbl D 
        ON TS.PersonID = D.PersonID 
       AND CAST(D.Ngay AS DATE) = N.Ngay 
       AND D.PeriodID = TS.PeriodID
    LEFT JOIN NghiPhep NP 
        ON TS.PersonID = NP.PersonID 
       AND NP.Ngay = N.Ngay
    LEFT JOIN dbo.HR_HolidayTbl H 
        ON CAST(H.HolidayDate AS DATE) = N.Ngay 

    OUTER APPLY 
    (
        SELECT TOP 1 HD.ChucDanhChuyenMonHD 
        FROM dbo.HR_HopDongTbl HD 
        WHERE HD.PersonID = TS.PersonID 
        ORDER BY HD.NgayKyHopDong DESC
    ) HD

    LEFT JOIN dbo.HR_PersonNghiPhepTbl NPYear 
        ON TS.PersonID = NPYear.PersonID 
       AND NPYear.Nam = YEAR(@FromDate)

    LEFT JOIN CongLe CL 
        ON CL.PersonID = TS.PersonID 
       AND CL.PeriodID = TS.PeriodID

    LEFT JOIN LuongKhoan LK 
        ON LK.PersonID = TS.PersonID

    LEFT JOIN CongDiLamHopLe CDL 
        ON CDL.PersonID = TS.PersonID

    LEFT JOIN CongNghiCoLuong CNL 
        ON CNL.PersonID = TS.PersonID

    LEFT JOIN CongNghiHieuHy CHH 
        ON CHH.PersonID = TS.PersonID 

    LEFT JOIN CongNghiPhepBuLe CBL 
        ON CBL.PersonID = TS.PersonID

    LEFT JOIN CongNghiKhongPhep CKP 
        ON CKP.PersonID = TS.PersonID 

    WHERE TS.PeriodID = @PeriodID 
      AND (@PhongBan = '''' OR P.PhongBan = @PhongBan)
      AND (
            @Keyword = ''''
            OR TS.PersonID LIKE ''%'' + @Keyword + ''%''
            OR P.PersonName LIKE N''%'' + @Keyword + ''%''
      )

   GROUP BY 
        TS.UserAutoID, 
        TS.PersonID, 
        P.PersonName, 
        P.PhongBan, 
        HD.ChucDanhChuyenMonHD, 
        TS.DocumentDate, 
        TS.SoNgayThang,
        TS.SoNgayLe,
        LK.PersonID,
        LK.SoTienKhoan,
        CDL.SoNgayDiLamHopLe, 
        CL.NgayCongLe, 
        CNL.SoCongNghiCoLuong, 
        CHH.SoCongHieuHy, 
        CBL.SoCongBuLe, 
        CKP.SoNgayNghiKhongPhep, 
        TS.TangCa, 
        TS.SoNgayCongTac, 
        TS.CongPhep, 
        TS.PeriodID, 
        TS.GhiChu, 
        NPYear.SoNgayConLai, 
        NPYear.SoNgayPhepTet, 
        NPYear.SoNgay, 
        NPYear.SoNgayDaSuDung
    ORDER BY TS.PersonID 
    OPTION (MAXRECURSION 31);
    ';

    -- 8. Thực thi câu lệnh SQL động
    EXEC sp_executesql 
        @SQL, 
        N'@PeriodID NVARCHAR(50), 
          @FromDate DATE, 
          @ToDate DATE, 
          @ThangTitle NVARCHAR(50),
          @MaxDay INT,
          @PhongBan NVARCHAR(50),
          @Keyword NVARCHAR(200),
          @BranchID NVARCHAR(MAX)', 
        @PeriodID = @PeriodID, 
        @FromDate = @FromDate, 
        @ToDate = @ToDate, 
        @ThangTitle = @ThangTitle,
        @MaxDay = @MaxDay,
        @PhongBan = @PhongBan,
        @Keyword = @Keyword,
        @BranchID = '';
END
GO
