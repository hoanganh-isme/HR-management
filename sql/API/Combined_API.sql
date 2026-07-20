USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BangChamCongTongHop] - Láº¤Y Dá»® LIá»†U Báº¢NG CHáº¤M CÃ”NG THÃNG CHO WEB APP
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BangChamCongTongHop
(
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Giáº£i mÃ£ cÃ¡c tham sá»‘ lá»c tá»« JSON bá»™ lá»c gá»­i lÃªn tá»« Web
    DECLARE @PeriodID VARCHAR(50) = NULL;
    DECLARE @PhongBan NVARCHAR(50) = NULL;

    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        SET @PeriodID = JSON_VALUE(@Data, '$.PeriodID');
        SET @PhongBan = JSON_VALUE(@Data, '$.PhongBan');
    END

    -- Truy váº¥n káº¿t há»£p dá»¯ liá»‡u báº£ng cháº¥m cÃ´ng vÃ  báº£ng nhÃ¢n viÃªn
    SELECT 
        t.PeriodID,
        t.PersonID,
        p.PersonName,
        p.PhongBan,
        t.DocumentDate,
        t.SoNgayThang,
        t.SoNgayDiLam,
        t.SoNgayLe,
        t.TangCa,
        t.SoNgayCongTac,
        t.CongPhep,
        t.NghiPhep,
        t.NghiKhongPhep,
        t.GhiChu
    FROM dbo.HR_TimeSheetTbl t
    LEFT JOIN dbo.HR_PersonTbl p ON t.PersonID = p.PersonID
    WHERE 
        -- Bá»™ lá»c Ká»³ lÆ°Æ¡ng (PeriodID)
        (@PeriodID IS NULL OR t.PeriodID = @PeriodID)
        -- Bá»™ lá»c PhÃ²ng ban (PhongBan)
        AND (@PhongBan IS NULL OR p.PhongBan = @PhongBan)
        -- TÃ¬m kiáº¿m chung theo Keyword (MÃ£ NV hoáº·c TÃªn NV)
        AND (
            @Keyword = ''
            OR t.PersonID LIKE '%' + @Keyword + '%'
            OR p.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY 
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir = 'DESC' THEN t.PeriodID END DESC,
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir <> 'DESC' THEN t.PeriodID END ASC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir = 'DESC' THEN t.PersonID END DESC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir <> 'DESC' THEN t.PersonID END ASC,
        -- Sáº¯p xáº¿p máº·c Ä‘á»‹nh theo Ká»³ lÆ°Æ¡ng giáº£m dáº§n, MÃ£ nhÃ¢n viÃªn tÄƒng dáº§n
        t.PeriodID DESC, t.PersonID ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangPhuCap
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        MaPhuCap,
        TenPhuCap,
        NhomPhuCap,
        TienPhuCapNgay,
        TienPhuCapThang,
        GhiChu,
        DVT,
        UserCreate,
        UserUpdate,
        DateUpdate,
        DateCreate
    FROM dbo.HR_BangPhuCapTbl
    WHERE 
        @Keyword = ''
        OR MaPhuCap LIKE '%' + @Keyword + '%'
        OR TenPhuCap LIKE N'%' + @Keyword + '%'
        OR NhomPhuCap LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY MaPhuCap ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangPhuCap_Detail
(
    @MaPhuCap NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        A.UserAutoID,
        A.MaPhuCap,
        A.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,
        A.GhiChu,
        A.NoiDungPhuCap
    FROM dbo.HR_PersonAllowanceTbl A
    LEFT JOIN dbo.HR_PersonTbl P ON A.PersonID = P.PersonID
    WHERE A.MaPhuCap = @MaPhuCap
    ORDER BY A.PersonID ASC;
END
GO

GO


CREATE OR ALTER PROCEDURE dbo.API_BangThamSo
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        PeriodID AS [PeriodID],
        LoaiBaoHiem AS [LoaiBaoHiem],
        CONCAT(PeriodID, '_', LoaiBaoHiem) AS [KeyID],
        UserAutoID AS [UserAutoID],
        BHXHNLD AS [BHXHNLD],
        BHXHCTY AS [BHXHCTY],
        BHYTNLD AS [BHYTNLD],
        BHYTCTY AS [BHYTCTY],
        BHTNNLD AS [BHTNNLD],
        BHTNCTY AS [BHTNCTY]
    FROM dbo.HR_BangThamSoTbl
    WHERE @Keyword = ''
       OR PeriodID LIKE '%' + @Keyword + '%'
       OR LoaiBaoHiem LIKE '%' + @Keyword + '%'
    ORDER BY PeriodID DESC, LoaiBaoHiem ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_BangThueTNCN
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        Bac,
        Tu,
        Den,
        ThueSuat
    FROM dbo.HR_BangThueTNCNTbl
    ORDER BY Bac ASC;
END
GO

GO

USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCong] - STORED PROCEDURE CHO BÃO CÃO CHáº¤M CÃ”NG (WA_TimeSheetReport)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoChamCong
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

    -- Náº¿u ká»³ lÆ°Æ¡ng trá»‘ng, tá»± Ä‘á»™ng láº¥y ká»³ lÆ°Æ¡ng má»›i nháº¥t
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.SY_Period 
        ORDER BY FromDate DESC;
    END

    SELECT 
        t.PeriodID,
        t.PersonID,
        p.PersonName,
        p.PhongBan,
        t.DocumentDate,
        t.SoNgayThang,
        t.SoNgayDiLam,
        t.SoNgayLe,
        t.TangCa,
        t.SoNgayCongTac,
        t.CongPhep,
        t.NghiPhep,
        t.NghiKhongPhep,
        t.GhiChu
    FROM dbo.HR_TimeSheetTbl t
    LEFT JOIN dbo.HR_PersonTbl p ON t.PersonID = p.PersonID
    WHERE 
        -- Bá»™ lá»c Ká»³ lÆ°Æ¡ng (PeriodID)
        (@PeriodID = '' OR t.PeriodID = @PeriodID)
        -- Bá»™ lá»c PhÃ²ng ban (PhongBan)
        AND (@PhongBan = '' OR p.PhongBan = @PhongBan)
        -- TÃ¬m kiáº¿m chung theo Keyword (MÃ£ NV hoáº·c TÃªn NV)
        AND (
            @Keyword = ''
            OR t.PersonID LIKE '%' + @Keyword + '%'
            OR p.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY 
        t.PeriodID DESC, 
        p.PhongBan ASC, 
        t.PersonID ASC;
END
GO

GO

USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCongChiTiet] - BÃO CÃO CHáº¤M CÃ”NG CHI TIáº¾T DÃ™NG TRÃŠN WEB APP
-- =========================================================================
    CREATE OR ALTER PROCEDURE dbo.API_BaoCaoChamCongChiTiet
(
    @Template VARCHAR(50) = '',
    @Ngay NVARCHAR(50) = '',
    @PeriodID NVARCHAR(50) = '',
    @BranchID NVARCHAR(MAX) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Template = LTRIM(RTRIM(ISNULL(@Template, '')));
    SET @PeriodID = LTRIM(RTRIM(ISNULL(@PeriodID, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    -- TrÃ¡nh viá»‡c truyá»n chuá»—i trá»‘ng '' hoáº·c '{Ngay}' tá»« Web gÃ¢y lá»—i convert ngÃ y
    DECLARE @NgayLoc DATE = NULL;
    IF ISNULL(@Ngay, '') <> '' AND @Ngay <> '1900-01-01' AND @Ngay NOT LIKE '%{Ngay}%' AND ISDATE(@Ngay) = 1
    BEGIN
        SET @NgayLoc = CAST(@Ngay AS DATE);
    END

    -- Náº¿u cáº£ hai lá»c Ká»³ vÃ  NgÃ y Ä‘á»u trá»‘ng, tá»± Ä‘á»™ng láº¥y Ká»³ má»›i nháº¥t
    IF @PeriodID = '' AND @NgayLoc IS NULL
 BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetDayTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback náº¿u báº£ng cháº¥m cÃ´ng chi tiáº¿t hoÃ n toÃ n trá»‘ng thÃ¬ láº¥y ká»³ má»›i nháº¥t cá»§a há»‡ thá»‘ng
        IF ISNULL(@PeriodID, '') = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END
 
    -- Thá»±c hiá»‡n xá»­ lÃ½ cháº¥m cÃ´ng hÃ ng ngÃ y tÆ°Æ¡ng tá»± nhÆ° Desktop App
    EXEC dbo.HR_TimeSheetDay_Process_Stp 
        @Period = @PeriodID, 
        @BranchID = @BranchID;
 
    -- SELECT cÃ¡c cá»™t giao diá»‡n cáº§n dÃ¹ng, trÃ¡nh trÃ¹ng tÃªn cá»™t gÃ¢y lá»—i 500 khi API Gateway convert sang JSON
    SELECT 
        T.PeriodID,
        T.PersonID,
        P.*,
        T.Ngay,
        T.ThoiGianVao,
        T.ThoiGianRa,
        T.GioVao,
        T.GioRa,
        T.SoGio,
        T.SoCong,
        T.SoPhut,
        T.LyDo,
        T.GhiChu
    FROM dbo.HR_TimeSheetDayTbl T
    LEFT JOIN dbo.HR_PersonTbl P ON T.PersonID = P.PersonID
    OUTER APPLY (
        SELECT TOP 1 HD_Sub.ChucDanhChuyenMonHD AS ChucDanh
        FROM dbo.HR_HopDongTbl HD_Sub
        WHERE HD_Sub.PersonID = P.PersonID
        ORDER BY HD_Sub.NgayKyHopDong DESC
    ) HD
    WHERE 
        (@PeriodID = '' OR T.PeriodID = @PeriodID)
        AND (@NgayLoc IS NULL OR CAST(T.Ngay AS DATE) = @NgayLoc)
        AND (
            @BranchID = '' 
            -- DÃ¹ng "Value" (chá»¯ V hoa) Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch phÃ¢n biá»‡t hoa/thÆ°á»ng (Case-Sensitive Collation)
            OR P.BranchID IN (SELECT Value FROM dbo.SY_String2TableFnc(REPLACE(@BranchID, ',', ';')))
        )
        AND (
            @Keyword = ''
            OR T.PersonID LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
            OR P.PhongBan LIKE N'%' + @Keyword + '%'
        )
    ORDER BY 
        T.PeriodID DESC, 
        P.PhongBan ASC, 
        T.PersonID ASC, 
        T.Ngay ASC;
END
GO

GO

USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCongTongHop] - BÃO CÃO CHáº¤M CÃ”NG Tá»”NG Há»¢P MáºªU 2 CHO WEB APP
-- Chuyá»ƒn Ä‘á»•i tá»« Store Procedure HR_TimeSheetTH2ReportStp cá»§a báº£n Desktop
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

    -- Náº¿u lá»c Ká»³ trá»‘ng, tá»± Ä‘á»™ng láº¥y Ká»³ má»›i nháº¥t Ä‘á»ƒ trÃ¡nh trá»‘ng dá»¯ liá»‡u lÃºc load trang
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback náº¿u báº£ng cháº¥m cÃ´ng trá»‘ng hoÃ n toÃ n
        IF @PeriodID = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END

    -- Gá»i xá»­ lÃ½ Ä‘á»“ng bá»™ dá»¯ liá»‡u cháº¥m cÃ´ng nhÆ° báº£n Desktop
    EXEC dbo.HR_TimeSheetDay_Process_Stp 
        @Period = @PeriodID, 
        @BranchID = '';

    EXEC dbo.HR_TimeSheet_UpdateDailyStatus_Stp 
        @Period = @PeriodID;

    -- TÃ­nh toÃ¡n ngÃ y báº¯t Ä‘áº§u vÃ  káº¿t thÃºc cá»§a Ká»³
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

    -- Cáº­p nháº­t ngÃ y lá»…, cÃ´ng phÃ©p tá»« Ä‘Æ¡n nghá»‰ phÃ©p vÃ o báº£ng cháº¥m cÃ´ng
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

    -- Dá»±ng chuá»—i cá»™t ngÃ y Ä‘á»™ng [1] -> [31]
    SET @MaxDay = DAY(@ToDate);
    SET @ThangTitle = N'THÃNG ' + RIGHT('0' + CAST(MONTH(@FromDate) AS VARCHAR(2)), 2);

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

    -- BiÃªn dá»‹ch cÃ¢u lá»‡nh SQL Ä‘á»™ng vá»›i Ä‘áº§y Ä‘á»§ cÃ¡c bá»™ lá»c
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

    -- 8. Thá»±c thi cÃ¢u lá»‡nh SQL Ä‘á»™ng
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

GO

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

    -- Náº¿u Keyword cÃ³ dáº¡ng 6 chá»¯ sá»‘ (vÃ­ dá»¥: '202606'), tá»± Ä‘á»™ng xem Ä‘Ã³ lÃ  Ká»³ LÆ°Æ¡ng
    IF @CleanKeyword <> '' AND LEN(@CleanKeyword) = 6 AND ISNUMERIC(@CleanKeyword) = 1
    BEGIN
        SET @PeriodID = @CleanKeyword;
    END

    -- Náº¿u ká»³ lÆ°Æ¡ng trá»‘ng (do Web load láº§n Ä‘áº§u chÆ°a truyá»n), tá»± Ä‘á»™ng láº¥y ká»³ lÆ°Æ¡ng hoáº¡t Ä‘á»™ng má»›i nháº¥t
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        WHERE isUse = 1 
        ORDER BY FromDate DESC;
    END

    -- Fallback 1: Láº¥y ká»³ báº¥t ká»³ trong SY_Period
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        ORDER BY FromDate DESC;
    END

    -- Fallback 2: Láº¥y ká»³ lÆ°Æ¡ng Ä‘Ã£ cÃ³ dá»¯ liá»‡u cháº¥m cÃ´ng
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
    END

    -- Fallback 3: Láº¥y ká»³ lÆ°Æ¡ng Ä‘Ã£ cÃ³ báº£ng lÆ°Æ¡ng
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
    -- Cháº¥m cÃ´ng
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

        -- CÃ¡c cá»™t cÆ¡ cáº¥u lÆ°Æ¡ng bá»• sung Ä‘á»ƒ khá»›p vá»›i Desktop
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
            -- Náº¿u Keyword lÃ  Ká»³ lÆ°Æ¡ng (Ä‘Ã£ dÃ¹ng Ä‘á»ƒ gÃ¡n cho @PeriodID á»Ÿ trÃªn) thÃ¬ khÃ´ng lá»c theo tÃªn ná»¯a
            OR (LEN(@CleanKeyword) = 6 AND ISNUMERIC(@CleanKeyword) = 1)
            -- CÃ²n láº¡i, cho phÃ©p tÃ¬m kiáº¿m theo TÃªn nhÃ¢n viÃªn hoáº·c MÃ£ nhÃ¢n viÃªn hoáº·c Chá»©c vá»¥
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

GO

Use X26DIMTUTAC
Go 
CREATE OR ALTER PROCEDURE dbo.API_BaoCaoNghiPhepReportStp 
    @PeriodID varchar(50) = '', 
    @BranchID1 varchar(50) = '',
    @Keyword NVARCHAR(200) = ''  
AS 
BEGIN
    SET NOCOUNT ON;

    SET @PeriodID = LTRIM(RTRIM(ISNULL(@PeriodID, '')));
    SET @BranchID1 = LTRIM(RTRIM(ISNULL(@BranchID1, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    IF @PeriodID = '' OR @PeriodID LIKE '%{PeriodID}%'
    BEGIN
        SET @PeriodID = '';
    END

    IF @BranchID1 = '' OR @BranchID1 LIKE '%{BranchID1}%'
    BEGIN
        SET @BranchID1 = '';
    END

    IF @Keyword LIKE '%{%}%'
    BEGIN
        SET @Keyword = '';
    END

    -- Náº¿u ká»³ lÆ°Æ¡ng trá»‘ng, tá»± Ä‘á»™ng láº¥y ká»³ lÆ°Æ¡ng hoáº¡t Ä‘á»™ng má»›i nháº¥t
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM SY_Period 
        ORDER BY FromDate DESC;
    END

    -- Náº¿u váº«n trá»‘ng, tÃ¬m tá»« báº£ng cháº¥m cÃ´ng
    IF @PeriodID = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM HR_TimeSheetTbl 
        ORDER BY PeriodID DESC;
    END

    DECLARE @NamBC INT, @ThangBC INT;
    
    IF LEN(@PeriodID) >= 6
    BEGIN
        SET @NamBC = CAST(LEFT(@PeriodID, 4) AS INT);   
        SET @ThangBC = CAST(SUBSTRING(@PeriodID, 5, 2) AS INT); 
    END
    ELSE
    BEGIN
        SET @NamBC = YEAR(GETDATE());
        SET @ThangBC = MONTH(GETDATE());
    END;

    ------------------------------------------------------------
    -- 1. Táº§ng bung chi tiáº¿t tá»« báº£ng DETAIL 
    ------------------------------------------------------------
    ;WITH BungDonNghi_CTE AS (
        SELECT
            M.PersonID,
            ISNULL(LTRIM(RTRIM(DT.HinhThucNghi)), '') AS HinhThucNghi, 
            M.StatusID,
            DATEADD(DAY, V.number, CAST(DT.NghiTuNgay AS DATE)) AS NgayThucTe,
            ISNULL(DT.SoNgayNghi, 1) AS TongSoNgayNghiThuong, 
            CEILING(ISNULL(DT.SoNgayNghi, 1)) AS SoDongDuKien
        FROM dbo.HR_NghiPhepTbl M
        INNER JOIN dbo.HR_NghiPhepDetailTbl DT ON M.DocumentID = DT.DocumentID
        JOIN master..spt_values V ON V.type = 'P' AND V.number < CEILING(ISNULL(DT.SoNgayNghi, 1))
        WHERE ISNULL(M.IsXinHuy, 0) = 0 
          AND YEAR(CAST(DT.NghiTuNgay AS DATE)) = @NamBC 
    ),
    
    PhanLoaiNgayNghi_CTE AS (
        SELECT 
            B.PersonID,
            B.NgayThucTe,
            MONTH(B.NgayThucTe) AS ThangNghi,
            B.HinhThucNghi,
            -- Thá»­ viá»‡c (1), ChÃ­nh thá»©c (2), ÄÃ£ duyá»‡t (8) Ä‘á»u ghi nháº­n lÃªn báº£ng 12 thÃ¡ng
            CAST(CASE 
                WHEN B.StatusID IN (1, 2, 8) AND B.SoDongDuKien > 0 AND B.HinhThucNghi <> 'HH' 
                    THEN B.TongSoNgayNghiThuong / B.SoDongDuKien
                ELSE 0
            END AS DECIMAL(18,2)) AS GiaTriPhanBoPhep,
            
            CAST(CASE
                WHEN B.StatusID IN (1, 2, 8) AND B.SoDongDuKien > 0 AND B.HinhThucNghi = 'HH' 
                    THEN B.TongSoNgayNghiThuong / B.SoDongDuKien
                ELSE 0
            END AS DECIMAL(18,2)) AS CongNghiThucTe
        FROM BungDonNghi_CTE B
    ),

    MonthlyLeave_CTE AS (
        SELECT 
            PersonID,
            SUM(CASE WHEN ThangNghi = 1  THEN GiaTriPhanBoPhep ELSE 0 END) AS T1,
            SUM(CASE WHEN ThangNghi = 2  THEN GiaTriPhanBoPhep ELSE 0 END) AS T2,
            SUM(CASE WHEN ThangNghi = 3  THEN GiaTriPhanBoPhep ELSE 0 END) AS T3,
            SUM(CASE WHEN ThangNghi = 4  THEN GiaTriPhanBoPhep ELSE 0 END) AS T4,
            SUM(CASE WHEN ThangNghi = 5  THEN GiaTriPhanBoPhep ELSE 0 END) AS T5,
            SUM(CASE WHEN ThangNghi = 6  THEN GiaTriPhanBoPhep ELSE 0 END) AS T6,
            SUM(CASE WHEN ThangNghi = 7  THEN GiaTriPhanBoPhep ELSE 0 END) AS T7,
            SUM(CASE WHEN ThangNghi = 8  THEN GiaTriPhanBoPhep ELSE 0 END) AS T8,
            SUM(CASE WHEN ThangNghi = 9  THEN GiaTriPhanBoPhep ELSE 0 END) AS T9,
            SUM(CASE WHEN ThangNghi = 10 THEN GiaTriPhanBoPhep ELSE 0 END) AS T10,
            SUM(CASE WHEN ThangNghi = 11 THEN GiaTriPhanBoPhep ELSE 0 END) AS T11,
            SUM(CASE WHEN ThangNghi = 12 THEN GiaTriPhanBoPhep ELSE 0 END) AS T12,
            
            SUM(CASE WHEN ThangNghi <= @ThangBC THEN GiaTriPhanBoPhep ELSE 0 END) AS DaSuDungDenThang,
            SUM(CASE WHEN ThangNghi <= @ThangBC THEN CongNghiThucTe ELSE 0 END) AS HieuHi
        FROM PhanLoaiNgayNghi_CTE
        GROUP BY PersonID
    )

    ------------------------------------------------------------
    -- 2. Táº§ng xuáº¥t dá»¯ liá»‡u khá»›p 100% thá»© tá»± cá»™t báº£ng Excel máº«u
    ------------------------------------------------------------
    SELECT 
        -- Cá»™t 1, 2, 3: ThÃ´ng tin nhÃ¢n viÃªn
        ROW_NUMBER() OVER (ORDER BY PE.PersonID) AS TT, 
        PE.PersonName AS HoVaTen, 
        PE.ChucDanhChuyenMon AS ChucDanh, 
        
        -- Cá»™t 4 Ä‘áº¿n 15: Chi tiáº¿t tá»« ThÃ¡ng 1 Ä‘áº¿n ThÃ¡ng 12
        ISNULL(m.T1, 0) AS M1, 
        ISNULL(m.T2, 0) AS M2, 
        ISNULL(m.T3, 0) AS M3, 
        ISNULL(m.T4, 0) AS M4, 
        ISNULL(m.T5, 0) AS M5, 
        ISNULL(m.T6, 0) AS M6,
        ISNULL(m.T7, 0) AS M7, 
        ISNULL(m.T8, 0) AS M8, 
        ISNULL(m.T9, 0) AS M9, 
        ISNULL(m.T10, 0) AS M10, 
        ISNULL(m.T11, 0) AS M11, 
        ISNULL(m.T12, 0) AS M12,
        
        -- Cá»™t 16: CÃ²n phÃ©p nÄƒm 2025 chuyá»ƒn qua tÃ­nh Ä‘áº¿n háº¿t quÃ½ 1/2026
        ISNULL(p.PhepTonNamTruoc, 0) AS PhepTonNamTruoc, 
        
        -- Cá»™t 17: PhÃ©p nÄƒm 2026 (Ä‘áº¿n thÃ¡ng 04) -> Láº¥y sá»‘ ngÃ y tiÃªu chuáº©n + ngÃ y cá»™ng thÃªm nháº­p tay
      --  (ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0)) AS QuyPhepNamNay, 
        
        -- Cá»™t 18: PhÃ©p ThÃ¢m niÃªn/nÄƒm
        ISNULL(p.PhepThamNien, 0) AS PhepThamNien,
        
        -- Cá»™t 19: NgÃ y táº¿t Ã¢m lá»‹ch 2026 (Ä‘Æ°a vÃ o phÃ©p) do Ä‘i lÃ m
        ISNULL(p.SoNgayPhepTet, 0) AS PhepTetAmLichDiLam, 
        
        -- Cá»™t 20: Hiáº¿u, há»·
        ISNULL(m.HieuHi, 0) AS HieuHi,                 
        
        -- Cá»™t 21: Tá»•ng phÃ©p = PhÃ©p tá»“n gá»‘c + PhÃ©p nÄƒm + PhÃ©p thÃªm + ThÃ¢m niÃªn + PhÃ©p lÃ m Táº¿t
        (ISNULL(p.PhepTonNamTruoc, 0) + ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0) + ISNULL(p.PhepThamNien, 0)) AS TongPhep,
        
        -- Cá»™t 22: PhÃ©p Ä‘Ã£ sá»­ dá»¥ng trong nÄƒm 2026 (Tá»•ng tá»« cÃ¡c Ä‘Æ¡n thÃ¡ng)
        ISNULL(m.DaSuDungDenThang, 0) AS PhepDaSuDungDenThang,                
        
        -- Cá»™t 23: PhÃ©p cÃ²n láº¡i nÄƒm 2026 = Tá»•ng quá»¹ phÃ©p trá»« Ä‘i sá»‘ ngÃ y Ä‘Ã£ nghá»‰ thá»±c táº¿
        ((ISNULL(p.PhepTonNamTruoc, 0) + ISNULL(p.SoNgay, 0) + ISNULL(p.SoNgayPhepTet, 0) + ISNULL(p.PhepThamNien, 0)) - ISNULL(m.DaSuDungDenThang, 0)) AS PhepConLai,
        
        -- Cá»™t 24: Ghi chÃº
        ISNULL(p.GhiChu, N'') AS GhiChu

        --Cá»™t 25 : PhÃ©p táº¿t

    FROM dbo.HR_PersonTbl PE 
    LEFT JOIN dbo.HR_PersonNghiPhepTbl p ON PE.PersonID = p.PersonID AND p.Nam = @NamBC
    LEFT JOIN MonthlyLeave_CTE m ON PE.PersonID = m.PersonID

    WHERE (@BranchID1 = '' OR @BranchID1 = 'ALL' OR PE.BranchID = @BranchID1)
      AND (
            @Keyword = ''
            OR PE.PersonID LIKE '%' + @Keyword + '%'
            OR PE.PersonName LIKE N'%' + @Keyword + '%'
            OR PE.ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
          ); 
END

GO

USE X26DIMTUTAC
GO

-- =========================================================================
-- API_BaoCaoNhanSuReportStp
-- BÃ¡o cÃ¡o tá»•ng há»£p danh sÃ¡ch nhÃ¢n sá»± tá»« HR_PersonTbl
-- JOIN vá»›i: HR_DepartmentListTbl, HR_PersonStatusTbl, HR_HopDongTbl, HR_LichSuCongTacTbl
--
-- Tham sá»‘:
--   @BranchID  : Lá»c theo chi nhÃ¡nh  (rá»—ng = táº¥t cáº£)
--   @PhongBan  : Lá»c theo bá»™ pháº­n    (rá»—ng = táº¥t cáº£)
--   @FromDate  : Lá»c ngÃ y vÃ o lÃ m tá»« ngÃ y (NULL = bá» qua)
--   @ToDate    : Lá»c ngÃ y vÃ o lÃ m Ä‘áº¿n ngÃ y (NULL = bá» qua)
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

    -- LÃ m sáº¡ch tham sá»‘ Ä‘áº§u vÃ o
    SET @BranchID    = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    SET @PhongBan    = LTRIM(RTRIM(ISNULL(@PhongBan, '')));
    SET @Keyword     = LTRIM(RTRIM(ISNULL(@Keyword, '')));
    SET @LoaiHopDong = LTRIM(RTRIM(ISNULL(@LoaiHopDong, '')));
    SET @Template    = LTRIM(RTRIM(ISNULL(@Template, '')));

    -- Bá» qua placeholder chÆ°a Ä‘Æ°á»£c thay tháº¿ bá»Ÿi Gateway Router
    IF @BranchID    LIKE '%{%}%' SET @BranchID    = '';
    IF @PhongBan    LIKE '%{%}%' SET @PhongBan    = '';
    IF @Keyword     LIKE '%{%}%' SET @Keyword     = '';
    IF @LoaiHopDong LIKE '%{%}%' SET @LoaiHopDong = '';
    IF @Template    LIKE '%{%}%' SET @Template    = '';

    -- =========================================================================
    -- Há»— trá»£ tÆ°Æ¡ng thÃ­ch ngÆ°á»£c (káº¿ thá»«a láº¡i logic cÅ©) cho cÃ¡c Template tá»« Desktop App
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
    -- TÃ­nh toÃ¡n sá»‘ lÆ°á»£ng tÄƒng/giáº£m trong ká»³
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
        -- â”€â”€ ThÃ´ng tin Ä‘á»‹nh danh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        -- â”€â”€ CCCD / CMND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.CMND,
        P.CMNDNgayCap,
        P.CMNDNoiCap,

        -- â”€â”€ LiÃªn há»‡ & Äá»‹a chá»‰ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.DienThoai,
        P.DiaChiThuongTru,
        P.DiaChiTamTru,

        -- â”€â”€ Tá»• chá»©c â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.BranchID,
        P.PhongBan,
        ISNULL(LS.TitleName,    P.TitleName)    AS TitleName,
        P.ChucDanhChuyenMon,

        -- â”€â”€ ThÃ´ng tin tuyá»ƒn dá»¥ng & thá»i gian lÃ m viá»‡c â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.PersonStatus,
        PS.PersonStatusName,
        P.isTaiTuyen,

        -- â”€â”€ Há»£p Ä‘á»“ng â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.SoHopDong,
        P.LoaiHopDong,
        P.NgayHopDong,
        HD.LuongCoBan                                   AS LuongCoBanHD,

        -- â”€â”€ NgÃ¢n hÃ ng â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.BankName,
        P.BankAccountNo,
        P.BankHolder,
        P.BankLocation,

        -- â”€â”€ Há»c váº¥n / Nghá» nghiá»‡p / NhÃ¢n kháº©u â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.EducationName,
        P.NationName,
        P.Nationality,
        P.PeoplesName,
        P.ReligionName,

        -- â”€â”€ Cháº¥m cÃ´ng â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.ChamCong,
        P.UserID,
        P.STT,

        -- â”€â”€ CÃ¡c cá» bÃ¡o cÃ¡o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        -- â”€â”€ Audit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        P.UserCreate,
        P.UserUpdate,
        P.DateCreate,
        P.DateUpdate

    FROM dbo.HR_PersonTbl P

    -- Tráº¡ng thÃ¡i nhÃ¢n viÃªn
    LEFT JOIN dbo.HR_PersonStatusTbl PS
        ON PS.PersonStatus = P.PersonStatus

    -- LÆ°Æ¡ng há»£p Ä‘á»“ng má»›i nháº¥t
    LEFT JOIN (
        SELECT PersonID, LuongCoBan, NgayKyHopDong, LoaiHD,
               ROW_NUMBER() OVER (PARTITION BY PersonID ORDER BY NgayKyHopDong DESC) AS rn
        FROM dbo.HR_HopDongTbl
    ) HD ON P.PersonID = HD.PersonID AND HD.rn = 1

    -- Chá»©c vá»¥ / vá»‹ trÃ­ tá»« lá»‹ch sá»­ cÃ´ng tÃ¡c má»›i nháº¥t
    LEFT JOIN (
        SELECT PersonID, TitleName,
               ROW_NUMBER() OVER (PARTITION BY PersonID ORDER BY NgayThayDoi DESC) AS rn
        FROM dbo.HR_LichSuCongTacTbl
    ) LS ON P.PersonID = LS.PersonID AND LS.rn = 1

    WHERE
        -- =====================================================================
        -- Lá»ŒC Cá» Äá»ŠNH Tá»ª DESKTOP APP (Äá»’NG Bá»˜ Dá»® LIá»†U)
        -- Desktop App SP (HR_BaoCaoNhansu2ReportStp) chá»‰ láº¥y nhÃ¢n sá»± ChÃ­nh thá»©c (4)
        -- =====================================================================
        P.PersonStatus = 4

        -- Lá»c chi nhÃ¡nh
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        -- Lá»c bá»™ pháº­n (há»— trá»£ LIKE náº¿u truyá»n má»™t pháº§n tÃªn)
        AND (@PhongBan = '' OR P.PhongBan LIKE N'%' + @PhongBan + N'%')

        -- Lá»c khoáº£ng ngÃ y vÃ o lÃ m (náº¿u truyá»n ToDate)
        AND (@ToDate IS NULL OR ISNULL(P.NgayVaoLam, '1900-01-01') <= @ToDate)

        -- NhÃ¢n viÃªn chÆ°a nghá»‰ hoáº·c nghá»‰ sau FromDate (náº¿u truyá»n FromDate)
        AND (@FromDate IS NULL OR P.NgayNghiViec IS NULL OR P.NgayNghiViec >= @FromDate)

        -- Lá»c theo tá»« khÃ³a (MÃ£ NV, TÃªn NV, Äiá»‡n thoáº¡i, CMND, Sá»‘ há»£p Ä‘á»“ng)
        AND (
            @Keyword = ''
            OR P.PersonID LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
            OR P.DienThoai LIKE '%' + @Keyword + '%'
            OR P.CMND LIKE '%' + @Keyword + '%'
            OR P.SoHopDong LIKE '%' + @Keyword + '%'
        )
        
        -- =====================================================================
        -- Lá»c má»Ÿ rá»™ng cho BÃ¡o cÃ¡o (tá»« Web/Mobile hoáº·c qua Template Desktop)
        -- =====================================================================
        -- Lá»c loáº¡i há»£p Ä‘á»“ng (NVN, NNN, ...)
        AND (@LoaiHopDong = '' OR HD.LoaiHD = @LoaiHopDong)

        -- Lá»c thiáº¿u há»£p Ä‘á»“ng
        AND (@ThieuHopDong IS NULL 
             OR (@ThieuHopDong = 1 AND HD.PersonID IS NULL) 
             OR (@ThieuHopDong = 0 AND HD.PersonID IS NOT NULL))

        -- Lá»c thiáº¿u báº£o hiá»ƒm
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
-- ÄÄƒng kÃ½ vÃ o báº£ng WA_API Ä‘á»ƒ API_Gateway_Router cÃ³ thá»ƒ Ä‘á»‹nh tuyáº¿n
-- List name: 'WA_BaoCaoNhanSuReport'  â†’  khá»›p vá»›i FormName trong SY_FrmLstTbl
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

GO


IF OBJECT_ID('dbo.API_BaoHiem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem
-- Description: Láº¥y danh sÃ¡ch chá»©ng tá»« Ä‘Ã³ng báº£o hiá»ƒm chÃ­nh (Master list)
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem
(
    @Keyword   NVARCHAR(200) = '',
    @BranchID  NVARCHAR(250) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        BH.DocumentID,
        BH.DocumentDate,
        BH.Notes,
        BH.PeriodID,
        BH.LoaiBaoHiem,
        BH.BranchID,
        CONCAT(BH.PeriodID, '_', BH.LoaiBaoHiem) AS PeriodKeyID,
        BH.UserCreate,
        BH.UserUpdate,
        BH.DateUpdate,
        BH.DateCreate
    FROM dbo.HR_BaoHiemTbl BH
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR BH.DocumentID LIKE '%' + @Keyword + '%' 
           OR BH.Notes LIKE N'%' + @Keyword + '%')
      AND (ISNULL(@BranchID, '') = '' 
           OR BH.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY BH.DocumentDate DESC, BH.DocumentID DESC;
END
GO

GO

USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.API_BaoHiem_Detail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_Detail;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem_Detail
-- Description: Láº¥y danh sÃ¡ch chi tiáº¿t cÃ¡c dÃ²ng báº£o hiá»ƒm cho má»™t chá»©ng tá»«
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem_Detail
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CT.UserAutoID,
        CT.DocumentID,
        CT.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,
        ISNULL(H.ChucDanhChuyenMonHD, P.ChucDanhChuyenMon) AS ChucDanhChuyenMon,
        CT.MucDong,
        CT.MucDongBHXHNLD,
        CT.MucDongBHXHNSDLD,
        CT.MucDongBHYTNLD,
        CT.MucDongBHYTNSDLD,
        CT.MucDongBHTNNLD,
        CT.MucDongBHTNNSDLD,
        CT.GhiChu
    FROM dbo.HR_BaoHiemChiTietTbl CT
    LEFT JOIN dbo.HR_PersonTbl P ON CT.PersonID = P.PersonID
    LEFT JOIN dbo.HR_HopDongTbl H ON CT.PersonID = H.PersonID
    WHERE CT.DocumentID = @DocumentID
    ORDER BY CT.UserAutoID ASC;
END
GO

GO

USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.API_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_PersonLookup;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem_PersonLookup
-- Description: TÃ¬m kiáº¿m nhanh nhÃ¢n viÃªn trong Ã´ chá»n (combobox) cá»§a grid chi tiáº¿t báº£o hiá»ƒm.
--              CÃ³ cáº£nh bÃ¡o náº¿u nhÃ¢n viÃªn Ä‘Ã£ Ä‘Æ°á»£c Ä‘Ã³ng báº£o hiá»ƒm á»Ÿ chá»©ng tá»« khÃ¡c.
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem_PersonLookup
(
    @BranchID NVARCHAR(MAX) = '',
    @LoaiBaoHiem NVARCHAR(50) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID, 
        P.PersonName, 
        P.PhongBan, 
        ISNULL(BH.MucDong, 0) AS MucDong, 
        CASE 
            WHEN BH.PersonID IS NOT NULL 
            THEN N'!!! ÄÃƒ CÃ“ BH Táº I Ká»²: ' + CAST(BH.PeriodID AS VARCHAR) + N' (Chá»©ng tá»«: ' + BH.DocumentID + ')'
            ELSE '' 
        END AS CanhBao
    FROM dbo.HR_PersonTbl P
    LEFT JOIN (
        SELECT 
            CT.PersonID, 
            SUM(CT.MucDong) AS MucDong, 
            MAX(H.DocumentID) AS DocumentID, 
            MAX(H.PeriodID) AS PeriodID
        FROM dbo.HR_BaoHiemChiTietTbl CT
        INNER JOIN dbo.HR_BaoHiemTbl H ON H.DocumentID = CT.DocumentID
        GROUP BY CT.PersonID
    ) BH ON P.PersonID = BH.PersonID
    WHERE 1=1
      AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
      AND (ISNULL(@Keyword, '') = '' 
           OR P.PersonID LIKE '%' + @Keyword + '%' 
           OR P.PersonName LIKE N'%' + @Keyword + '%')
    ORDER BY P.PersonID DESC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        SapCaID,
        TenBangCa,
        TuNgay,
        DenNgay,
        Thu2,
        Thu3,
        Thu4,
        Thu5,
        Thu6,
        Thu7,
        ChuNhat,
        ShiftIDThu2,
        ShiftIDThu3,
        ShiftIDThu4,
        ShiftIDThu5,
        ShiftIDThu6,
        ShiftIDThu7,
        ShiftIDChuNhat
    FROM dbo.HR_SapCaTbl
    WHERE 
        @Keyword = ''
        OR SapCaID LIKE '%' + @Keyword + '%'
        OR TenBangCa LIKE N'%' + @Keyword + '%'
    ORDER BY SapCaID DESC;
END
GO

GO

USE X26DIMTUTAC
GO

-- API Tab 1: Danh sÃ¡ch nhÃ¢n viÃªn theo SapCaID
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_NhanVien
(
    @SapCaID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        NV.UserAutoID,
        NV.SapCaID,
        NV.PersonID,
        P.PersonName,
        P.PhongBan,
        P.BranchID,
        NV.GhiChu
    FROM dbo.HR_SapCaNhanVienTbl NV
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = NV.PersonID
    WHERE NV.SapCaID = @SapCaID
    ORDER BY P.PhongBan, P.PersonName;
END
GO

-- API Tab 2: Báº£ng ca chi tiáº¿t theo SapCaID
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_ChiTiet
(
    @SapCaID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        CT.UserAutoID,
        CT.SapCaID,
        CT.PersonID,
        P.PersonName,
        P.PhongBan,
        CONVERT(NVARCHAR(10), CT.NgayLamViec, 103) AS NgayLamViec,
        CT.ShiftID,
        SL.ShiftName,
        CT.TrangThaiThucTe,
        CT.GhiChu
    FROM dbo.HR_SapCaChiTietTbl CT
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = CT.PersonID
    LEFT JOIN dbo.HR_ShiftListTbl SL ON SL.ShiftID = CT.ShiftID
    WHERE CT.SapCaID = @SapCaID
    ORDER BY CT.NgayLamViec, P.PhongBan, P.PersonName;
END
GO

-- ÄÄƒng kÃ½ vÃ o WA_API
DELETE FROM dbo.WA_API WHERE list IN ('API_CaLamViec_NhanVien', 'API_CaLamViec_ChiTiet');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_CaLamViec_NhanVien', 'View', 'API_CaLamViec_NhanVien', '@SapCaID=N''{SapCaID}'''),
('API_CaLamViec_ChiTiet',  'View', 'API_CaLamViec_ChiTiet',  '@SapCaID=N''{SapCaID}''');
GO

PRINT 'Da tao API_CaLamViec_NhanVien va API_CaLamViec_ChiTiet thanh cong!';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBangCap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        MaBangCap,     -- MÃ£ báº±ng cáº¥p
        TenBangCap     -- TÃªn báº±ng cáº¥p
    FROM HR_BangCapTbl
    WHERE 
        @Keyword = ''
        OR MaBangCap LIKE '%' + @Keyword + '%'
        OR TenBangCap LIKE N'%' + @Keyword + '%'
    ORDER BY MaBangCap;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_BangCapListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BangCapListFrm', 
    'View', 
    'API_DanhSachBangCap', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangCapListFrm',
    @ObjectName = 'API_DanhSachBangCap';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'MÃ£ báº±ng cáº¥p' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn báº±ng cáº¥p' WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'TenBangCap';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBenhVien
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        HospitalName,  -- TÃªn bá»‡nh viá»‡n
        [Address],     -- Äá»‹a chá»‰ bá»‡nh viá»‡n
        GhiChu         -- Ghi chÃº
    FROM HR_HospitalListTbl
    WHERE 
        @Keyword = ''
        OR HospitalName LIKE N'%' + @Keyword + '%'
        OR [Address] LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), HospitalName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_HospitalListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_HospitalListFrm', 
    'View', 
    'API_DanhSachBenhVien', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_HospitalListFrm',
    @ObjectName = 'API_DanhSachBenhVien';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn bá»‡nh viá»‡n' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'HospitalName';
UPDATE SY_FormatFields SET CaptionVN = N'Äá»‹a chá»‰' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'Address';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBoPhan
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        PhongBan,        -- MÃ£ phÃ²ng ban / bá»™ pháº­n
        TenPhongBan      -- TÃªn phÃ²ng ban / bá»™ pháº­n
    FROM HR_DepartmentListTbl
    WHERE 
        @Keyword = ''
        OR PhongBan LIKE '%' + @Keyword + '%'
        OR TenPhongBan LIKE N'%' + @Keyword + '%'
    ORDER BY PhongBan;
END
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachCaLamViec
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»±
        ShiftID,       -- MÃ£ ca
        ShiftName,     -- TÃªn ca
        GioBatDau,     -- Giá» báº¯t Ä‘áº§u
        GioKetThuc,    -- Giá» káº¿t thÃºc
        SoGioCong,     -- Sá»‘ giá» cÃ´ng
        GioCaDem,      -- Giá» ca Ä‘Ãªm
        CaTuDong,      -- Ca tá»± Ä‘á»™ng
        ShiftType,     -- Loáº¡i ca
        CachChamCong,  -- CÃ¡ch cháº¥m cÃ´ng
        Color,         -- MÃ u sáº¯c hiá»ƒn thá»‹
        SoCong         -- Sá»‘ cÃ´ng ghi nháº­n
    FROM HR_ShiftListTbl
    WHERE 
        @Keyword = ''
        OR ShiftID LIKE '%' + @Keyword + '%'
        OR ShiftName LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ShiftID;
END
GO


USE X26DIMTUTAC
GO

DELETE FROM WA_API WHERE list = 'WA_ShiftListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ShiftListFrm', 
    'View', 
    'API_DanhSachCaLamViec', 
    '@Keyword=N''{Keyword}'''
);
GO


USE X26DIMTUTAC
GO

-- 1. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API vÃ o báº£ng cáº¥u hÃ¬nh giao diá»‡n
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ShiftListFrm',
    @ObjectName = 'API_DanhSachCaLamViec';
GO

-- 2. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'MÃ£ ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftID';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftName';
UPDATE SY_FormatFields SET CaptionVN = N'Giá» báº¯t Ä‘áº§u' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioBatDau';
UPDATE SY_FormatFields SET CaptionVN = N'Giá» káº¿t thÃºc' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioKetThuc';
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ giá» cÃ´ng' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoGioCong';
UPDATE SY_FormatFields SET CaptionVN = N'Giá» ca Ä‘Ãªm' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioCaDem';
UPDATE SY_FormatFields SET CaptionVN = N'Ca tá»± Ä‘á»™ng' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CaTuDong';
UPDATE SY_FormatFields SET CaptionVN = N'Loáº¡i ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftType';
UPDATE SY_FormatFields SET CaptionVN = N'CÃ¡ch cháº¥m cÃ´ng' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CachChamCong';
UPDATE SY_FormatFields SET CaptionVN = N'MÃ u sáº¯c' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'Color';
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ cÃ´ng' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoCong';
GO

GO



CREATE OR ALTER PROCEDURE dbo.API_DanhSachCaLamViecChiNhanh
(
    @Keyword NVARCHAR(200) = '',
    @UserBranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        BranchID,
        ShiftID,
        ShiftName,
        LoaiCa,
        CachChamCong,
        GioVaoDoan1,
        GioRaDoan1,
        GioVaoDoan2,
        GioRaDoan2,
        GioVaoThang,
        GioRaThang,
        IsCaDem,
        SoGioCong,
        SoCong,
        GhiChu,
        UserCreate,
        DateCreate,
        UserUpdate,
        DateUpdate
    FROM dbo.HR_ShiftListCNTbl
    WHERE 
        (@UserBranchID = '' OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@UserBranchID, ',')))
        AND (@Keyword = ''
        OR ShiftID LIKE '%' + @Keyword + '%'
        OR ShiftName LIKE N'%' + @Keyword + '%')
    ORDER BY BranchID, ShiftID ASC;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'HR_ShiftListCNFrm' AND func = 'View';
GO

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'HR_ShiftListCNFrm', 
    'View', 
    'API_DanhSachCaLamViecChiNhanh', 
    '@Keyword=N''{Keyword}'', @UserBranchID=N''{BranchID}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'HR_ShiftListCNFrm',
    @ObjectName = 'API_DanhSachCaLamViecChiNhanh';
GO

GO

-- USE X26DIMTUTAC
-- GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachChiNhanh
(
    @Keyword NVARCHAR(100) = '',
    @UserBranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        BranchID,      -- MÃ£ chi nhÃ¡nh
        BranchName     -- TÃªn chi nhÃ¡nh
    FROM CF_BranchTbl
    WHERE 
        (@UserBranchID = '' OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@UserBranchID, ',')))
        AND (@Keyword = ''
        OR BranchID LIKE '%' + @Keyword + '%'
        OR BranchName LIKE N'%' + @Keyword + '%')
    ORDER BY BranchID;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'CF_BranchListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'CF_BranchListFrm', 
    'View', 
    'API_DanhSachChiNhanh', 
    '@Keyword=N''{Keyword}'', @UserBranchID=N''{BranchID}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'CF_BranchListFrm',
    @ObjectName = 'API_DanhSachChiNhanh';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'MÃ£ chi nhÃ¡nh' WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn chi nhÃ¡nh' WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO

GO


CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucDanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        ChucDanhChuyenMon,
        MoTa
    FROM HR_ChucDanhTbl
    WHERE 
        @Keyword = ''
        OR ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
        OR MoTa LIKE N'%' + @Keyword + '%'
    ORDER BY ChucDanhChuyenMon;
END
GO
IF NOT EXISTS (SELECT 1 FROM WA_API WHERE list = 'API_DanhSachChucDanh' AND func = 'View')
BEGIN
    INSERT INTO WA_API (list, func, [SQL], Para)
    VALUES ('API_DanhSachChucDanh', 'View', 'API_DanhSachChucDanh', '@Keyword=''{Keyword}''');
END
GO

GO



CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucVu
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        TitleName,     -- TÃªn chá»©c vá»¥
        GhiChu         -- Ghi chÃº
    FROM HR_TitleListTbl
    WHERE 
        @Keyword = ''
        OR TitleName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), TitleName;
END
GO

IF NOT EXISTS (SELECT 1 FROM WA_API WHERE list = 'API_DanhSachChucVu' AND func = 'View')
BEGIN
    INSERT INTO WA_API (list, func, [SQL], Para)
    VALUES ('API_DanhSachChucVu', 'View', 'API_DanhSachChucVu', '@Keyword=''{Keyword}''');
END
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachCongViec
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»±
        JobName,       -- TÃªn cÃ´ng viá»‡c
        GhiChu         -- Ghi chÃº
    FROM HR_JobListTbl
    WHERE 
        @Keyword = ''
        OR JobName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), JobName;
END
GO


USE X26DIMTUTAC
GO

DELETE FROM WA_API WHERE list = 'WA_JobListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_JobListFrm', 
    'View', 
    'API_DanhSachCongViec', 
    '@Keyword=N''{Keyword}'''
);
GO


USE X26DIMTUTAC
GO

-- 1. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_JobListFrm',
    @ObjectName = 'API_DanhSachCongViec';
GO

-- 2. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn cÃ´ng viá»‡c' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'JobName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachDanToc
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        PeoplesName,   -- TÃªn dÃ¢n tá»™c (Tiáº¿ng Viá»‡t)
        PeoplesName2,  -- TÃªn dÃ¢n tá»™c (Tiáº¿ng Anh/KhÃ¡c)
        PeoplesPlace,  -- Äá»‹a bÃ n cÆ° trÃº chá»§ yáº¿u
        isDefault,     -- Máº·c Ä‘á»‹nh
        GhiChu         -- Ghi chÃº
    FROM HR_PeoplesListTbl
    WHERE 
        @Keyword = ''
        OR PeoplesName LIKE N'%' + @Keyword + '%'
        OR PeoplesName2 LIKE N'%' + @Keyword + '%'
        OR PeoplesPlace LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), PeoplesName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_PeopleListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_PeopleListFrm', 
    'View', 
    'API_DanhSachDanToc', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_PeopleListFrm',
    @ObjectName = 'API_DanhSachDanToc';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn dÃ¢n tá»™c' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn khÃ¡c' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName2';
UPDATE SY_FormatFields SET CaptionVN = N'Äá»‹a bÃ n cÆ° trÃº' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesPlace';
UPDATE SY_FormatFields SET CaptionVN = N'Máº·c Ä‘á»‹nh' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'isDefault';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachHinhThucNghi
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        HinhThucNghi,     -- KÃ½ hiá»‡u hÃ¬nh thá»©c nghá»‰
        TenHinhThucNghi,  -- TÃªn hÃ¬nh thá»©c nghá»‰
        NghiCoLuong       -- Nghá»‰ cÃ³ lÆ°Æ¡ng (1: CÃ³, 0: KhÃ´ng)
    FROM HR_HinhThucNghiListTbl
    WHERE 
        @Keyword = ''
        OR HinhThucNghi LIKE '%' + @Keyword + '%'
        OR TenHinhThucNghi LIKE N'%' + @Keyword + '%'
    ORDER BY HinhThucNghi;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_HinhThucNghiListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_HinhThucNghiListFrm', 
    'View', 
    'API_DanhSachHinhThucNghi', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_HinhThucNghiListFrm',
    @ObjectName = 'API_DanhSachHinhThucNghi';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'MÃ£ hÃ¬nh thá»©c nghá»‰' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn hÃ¬nh thá»©c nghá»‰' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';
UPDATE SY_FormatFields SET CaptionVN = N'CÃ³ hÆ°á»Ÿng lÆ°Æ¡ng' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachHocVan
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        EducationName, -- TrÃ¬nh Ä‘á»™ há»c váº¥n
        GhiChu         -- Ghi chÃº
    FROM HR_EducationListTbl
    WHERE 
        @Keyword = ''
        OR EducationName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), EducationName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_BangCapListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BangCapListFrm', 
    'View', 
    'API_DanhSachHocVan', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangCapListFrm',
    @ObjectName = 'API_DanhSachHocVan';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'TrÃ¬nh Ä‘á»™ há»c váº¥n' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'EducationName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'GhiChu';
GO

GO

USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachLoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        LoaiHD 
    FROM dbo.HR_PersonView 
    WHERE ISNULL(LoaiHD, '') <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachNganHang
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        BankName,      -- TÃªn ngÃ¢n hÃ ng
        [Address],     -- Äá»‹a chá»‰ / Chi nhÃ¡nh ngÃ¢n hÃ ng
        GhiChu         -- Ghi chÃº
    FROM HR_BankListTbl
    WHERE 
        @Keyword = ''
        OR BankName LIKE N'%' + @Keyword + '%'
        OR [Address] LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), BankName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_BankListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BankListFrm', 
    'View', 
    'API_DanhSachNganHang', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BankListFrm',
    @ObjectName = 'API_DanhSachNganHang';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn ngÃ¢n hÃ ng' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'BankName';
UPDATE SY_FormatFields SET CaptionVN = N'Äá»‹a chá»‰ chi nhÃ¡nh' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'Address';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachNgheNghiep
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        CareerName,    -- TÃªn ngÃ nh nghá» / nghá» nghiá»‡p
        GhiChu         -- Ghi chÃº
    FROM HR_CareerListTbl
    WHERE 
        @Keyword = ''
        OR CareerName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), CareerName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_CareerlListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_CareerlListFrm', 
    'View', 
    'API_DanhSachNgheNghiep', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_CareerlListFrm',
    @ObjectName = 'API_DanhSachNgheNghiep';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'NgÃ nh nghá» / Nghá» nghiá»‡p' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'CareerName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachQuocGia
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        NationName,    -- TÃªn quá»‘c gia
        isDefault,     -- Quá»‘c gia máº·c Ä‘á»‹nh
        GhiChu         -- Ghi chÃº
    FROM HR_NationListTbl
    WHERE 
        @Keyword = ''
        OR NationName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), NationName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_NationListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_NationListFrm', 
    'View', 
    'API_DanhSachQuocGia', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_NationListFrm',
    @ObjectName = 'API_DanhSachQuocGia';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn quá»‘c gia' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'NationName';
UPDATE SY_FormatFields SET CaptionVN = N'Máº·c Ä‘á»‹nh' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'isDefault';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachTinhThanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        ProvineName,   -- TÃªn tá»‰nh / thÃ nh (giá»¯ nguyÃªn chÃ­nh táº£ DB: ProvineName)
        TownShip,      -- Quáº­n / Huyá»‡n / XÃ£
        GhiChu         -- Ghi chÃº
    FROM HR_ProvineListTbl
    WHERE 
        @Keyword = ''
        OR ProvineName LIKE N'%' + @Keyword + '%'
        OR TownShip LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ProvineName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_ProvinceListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ProvinceListFrm', 
    'View', 
    'API_DanhSachTinhThanh', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ProvinceListFrm',
    @ObjectName = 'API_DanhSachTinhThanh';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn tá»‰nh / thÃ nh' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';
UPDATE SY_FormatFields SET CaptionVN = N'Quáº­n / huyá»‡n / TX' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachTonGiao
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        ReligionName,  -- TÃªn tÃ´n giÃ¡o
        GhiChu         -- Ghi chÃº
    FROM HR_ReligionListTbl
    WHERE 
        @Keyword = ''
        OR ReligionName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ReligionName;
END
GO

-- 1. Cáº¥u hÃ¬nh Ä‘á»‹nh tuyáº¿n Gateway
DELETE FROM WA_API WHERE list = 'WA_ReligionListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ReligionListFrm', 
    'View', 
    'API_DanhSachTonGiao', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Äá»“ng bá»™ cÃ¡c cá»™t tá»« API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ReligionListFrm',
    @ObjectName = 'API_DanhSachTonGiao';
GO

-- 3. Cáº­p nháº­t nhÃ£n cá»™t hiá»ƒn thá»‹ trÃªn Grid
UPDATE SY_FormatFields SET CaptionVN = N'Sá»‘ thá»© tá»±' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'TÃªn tÃ´n giÃ¡o' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'ReligionName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chÃº' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'GhiChu';
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachToNhom
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,              -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        WorkingGroupName, -- TÃªn tá»• / nhÃ³m lÃ m viá»‡c
        GhiChu            -- Ghi chÃº
    FROM HR_WorkingGroupListTbl
    WHERE 
        @Keyword = ''
        OR WorkingGroupName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), WorkingGroupName;
END
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachViTri
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Sá»‘ thá»© tá»± hiá»ƒn thá»‹
        PostionName,   -- TÃªn vá»‹ trÃ­ (giá»¯ Ä‘Ãºng chÃ­nh táº£ database: PostionName)
        GhiChu         -- Ghi chÃº
    FROM HR_PostionListTbl
    WHERE 
        @Keyword = ''
        OR PostionName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), PostionName;
END
GO

GO


-- =========================================================================
-- Táº O STORED PROCEDURE CHO DROPDOWN Láº¤Y CÃC TÃ™Y CHá»ŒN BÃO CÃO (FILTER PRESETS)
-- =========================================================================
-- Giáº£i phÃ¡p: Tráº£ vá» danh sÃ¡ch áº£o (Virtual Table) tá»« SP thay vÃ¬ táº¡o báº£ng váº­t lÃ½.
-- Web App sáº½ gá»i API nÃ y Ä‘á»ƒ build Dropdown, khÃ´ng bá»‹ hardcode dÆ°á»›i React.
CREATE OR ALTER PROCEDURE dbo.API_Dropdown_ReportTemplates
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Tráº£ vá» Ä‘á»‹nh dáº¡ng [value], [label] cho UI Web App (Dropdown)
    SELECT 'HR_BaoCaoNhansu2Report' AS [value], N'BÃ¡o cÃ¡o nhÃ¢n sá»± tá»•ng há»£p' AS [label]
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuNVNReport', N'BÃ¡o cÃ¡o nhÃ¢n sá»± NVN'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuNNNReport', N'BÃ¡o cÃ¡o nhÃ¢n sá»± NNN'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuThieuHDReport', N'BÃ¡o cÃ¡o nhÃ¢n sá»± thiáº¿u HÄLÄ'
    UNION ALL
    SELECT 'HR_BaoCaoNhanSuThieuBHReport', N'BÃ¡o cÃ¡o nhÃ¢n sá»± thiáº¿u BH';
END
GO

PRINT 'Da tao SP API_Dropdown_ReportTemplates thanh cong!';
GO

-- =========================================================================
-- ÄÄƒng kÃ½ API Dropdown vÃ o WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'API_Dropdown_ReportTemplates';
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES ('API_Dropdown_ReportTemplates', 'View', 'API_Dropdown_ReportTemplates', '');
GO

PRINT 'Da dang ky WA_API [API_Dropdown_ReportTemplates / View] thanh cong!';
GO

GO

-- USE X26DIMTUTAC
-- GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong
-- Description: Láº¥y danh sÃ¡ch há»£p Ä‘á»“ng lao Ä‘á»™ng káº¿t há»£p thÃ´ng tin nhÃ¢n viÃªn
--              Há»— trá»£ lá»c theo tá»« khÃ³a, nÄƒm láº­p, loáº¡i há»£p Ä‘á»“ng, chi nhÃ¡nh
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

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_Attach
-- Description: Láº¥y danh sÃ¡ch tÃ i liá»‡u Ä‘Ã­nh kÃ¨m thuá»™c má»™t há»£p Ä‘á»“ng
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        UserAutoID,
        MaHopDong,
        FileName,
        FileType,
        STT,
        FileSize,
        Content
    FROM dbo.HR_HopDongAttachTbl
    WHERE MaHopDong = @MaHopDong
    ORDER BY STT ASC, UserAutoID DESC;
END
GO

GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_ChiTiet
-- Description: Láº¥y danh sÃ¡ch phá»¥ cáº¥p chi tiáº¿t thuá»™c má»™t há»£p Ä‘á»“ng
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_ChiTiet
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        D.UserAutoID,
        D.MaHopDong,
        D.MaPhuCap,
        ISNULL(D.TenPhuCap, P.TenPhuCap) AS TenPhuCap,
        D.TienPhuCap,
        P.TienPhuCapNgay,
        P.TienPhuCapThang,
        D.GhiChu
    FROM dbo.HR_HopDongDetailTbl D
    LEFT JOIN dbo.HR_BangPhuCapTbl P ON D.MaPhuCap = P.MaPhuCap
    WHERE D.MaHopDong = @MaHopDong
    ORDER BY D.MaPhuCap ASC;
END
GO

GO

USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_LoaiHD
-- Description: Láº¥y danh sÃ¡ch loáº¡i há»£p Ä‘á»“ng Ä‘á»ƒ phá»¥c vá»¥ bá»™ lá»c dropdown
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_LoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        LoaiHD 
    FROM dbo.HR_HopDongTbl 
    WHERE LoaiHD IS NOT NULL AND LoaiHD <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO

GO

USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_NamLap
-- Description: Láº¥y danh sÃ¡ch nÄƒm láº­p há»£p Ä‘á»“ng Ä‘á»ƒ phá»¥c vá»¥ bá»™ lá»c dropdown
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NamLap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        NamLap 
    FROM dbo.HR_HopDongTbl 
    WHERE NamLap IS NOT NULL
      AND (@Keyword = '' OR CAST(NamLap AS NVARCHAR(50)) LIKE '%' + @Keyword + '%')
    ORDER BY NamLap DESC;
END
GO

GO

USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_NhanVienChuaCoHD
-- Description: Láº¥y danh sÃ¡ch toÃ n bá»™ nhÃ¢n viÃªn Ä‘ang lÃ m viá»‡c, phá»¥c vá»¥ Ã´ chá»n nhÃ¢n viÃªn khi thÃªm má»›i há»£p Ä‘á»“ng.
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NhanVienChuaCoHD
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName
    FROM dbo.HR_PersonTbl P
    WHERE P.PersonStatus IN (1, 4) -- Chá»‰ láº¥y nhÃ¢n viÃªn Ä‘ang lÃ m viá»‡c (1: ChÃ­nh thá»©c, 4: Thá»­ viá»‡c)
      AND (
          ISNULL(@Keyword, '') = ''
          OR P.PersonName LIKE N'%' + @Keyword + '%'
          OR P.PersonID LIKE N'%' + @Keyword + '%'
      )
    ORDER BY P.PersonID DESC;
END
GO

GO


-- =========================================================================
-- 1. Master API: Danh sÃƒÂ¡ch nhÃƒÂ¢n viÃƒÂªn tÃ¡Â»â€¢ng hÃ¡Â»Â£p
-- EXEC dbo.API_HoSoNhanVien @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVien
(
    @Keyword           NVARCHAR(200) = '',
    @BranchID          NVARCHAR(MAX) = '',
    @PhongBan          NVARCHAR(50)  = '',
    @NamLap            INT           = NULL,
    @LoaiHD            NVARCHAR(50)  = '',
    @PersonStatusName  NVARCHAR(100) = '', -- ThÃƒÂªm tham sÃ¡Â»â€˜ nhÃ¡ÂºÂ­n TÃƒÂªn trÃ¡ÂºÂ¡ng thÃƒÂ¡i tÃ¡Â»Â« UI
    @PersonStatus      NVARCHAR(50)  = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- ChÃ¡Â»Â©c vÃ¡Â»Â¥
        P.ChucDanhChuyenMon,    -- ChÃ¡Â»Â©c danh chuyÃƒÂªn mÃƒÂ´n
        P.NgaySinh,             -- NgÃƒÂ y sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Ã„ÂÃ¡Â»â€¹a chÃ¡Â»â€° thÃ†Â°Ã¡Â»Âng trÃƒÂº
        P.NgayVaoLam,           -- NgÃƒÂ y nhÃ¡ÂºÂ­n viÃ¡Â»â€¡c
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
        HD.LoaiHD,
        YEAR(P.NgayVaoLam) AS NamLap,
        PA.FileName,
        NULL AS Content -- Removed PA.Content to drastically improve load time
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_PersonStatusTbl S 
        ON P.PersonStatus = S.PersonStatus
    OUTER APPLY (
        SELECT TOP 1 FileName
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
        -- BÃ¡Â»â„¢ lÃ¡Â»Âc tÃ¡Â»Â« khoÃƒÂ¡ (Keyword)
        (@Keyword IS NULL OR @Keyword = ''
         OR P.PersonName LIKE N'%' + @Keyword + '%'
         OR P.PersonID   LIKE N'%' + @Keyword + '%'
         OR P.DienThoai  LIKE N'%' + @Keyword + '%')
        
        -- BÃ¡Â»â„¢ lÃ¡Â»Âc chi nhÃƒÂ¡nh (BranchID)
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))

        -- BÃ¡Â»â„¢ lÃ¡Â»Âc bÃ¡Â»â„¢ phÃ¡ÂºÂ­n (PhongBan)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        
        -- BÃ¡Â»â„¢ lÃ¡Â»Âc nÃ„Æ’m lÃ¡ÂºÂ­p
        AND (@NamLap IS NULL OR YEAR(ISNULL(P.NgaySinh, '1900-01-01')) = @NamLap OR YEAR(ISNULL(P.NgayVaoLam, '1900-01-01')) = @NamLap)
        
        -- BÃ¡Â»â„¢ lÃ¡Â»Âc loÃ¡ÂºÂ¡i hÃ¡Â»Â£p Ã„â€˜Ã¡Â»â€œng (LoaiHD tÃ¡Â»Â« HR_HopDongTbl)
        AND (@LoaiHD = '' OR HD.LoaiHD LIKE N'%' + @LoaiHD + '%')
        
        -- BÃ¡Â»â„¢ lÃ¡Â»Âc trÃ¡ÂºÂ¡ng thÃƒÂ¡i nhÃƒÂ¢n sÃ¡Â»Â± (theo tÃƒÂªn hiÃ¡Â»Æ’n thÃ¡Â»â€¹ trÃƒÂªn UI hoÃ¡ÂºÂ·c mÃƒÂ£ trÃ¡ÂºÂ¡ng thÃƒÂ¡i)
        AND (@PersonStatusName = '' OR S.PersonStatusName = @PersonStatusName)
        AND (@PersonStatus = '' OR P.PersonStatus = @PersonStatus)
        
    ORDER BY P.PersonID DESC;
END
GO
-- =========================================================================
-- 2. Detail API Tab 1: QuÃƒÂ¡ trÃƒÂ¬nh lÃƒÂ m viÃ¡Â»â€¡c vÃƒÂ  lÃ†Â°Ã†Â¡ng (HR_PersonSalaryTbl)
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
-- 4. Detail API Tab 3: Khen thÃ†Â°Ã¡Â»Å¸ng - KÃ¡Â»Â· luÃ¡ÂºÂ­t (HR_PersonKTKLTbl)
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
-- 5. Detail API Tab 4: Khai bÃƒÂ¡o phÃƒÂ©p nÃ„Æ’m (HR_PersonNghiPhepTbl)
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
-- 6. Detail API Tab 5: Gia cÃ¡ÂºÂ£nh & MÃ¡Â»â€˜i liÃƒÂªn hÃ¡Â»â€¡ (HR_PersonRelationTbl)
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
-- 7. Detail API Tab 6: LÃ¡Â»â€¹ch sÃ¡Â»Â­ hÃ¡Â»Â£p Ã„â€˜Ã¡Â»â€œng (HR_HopDongTbl)
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
-- 8. Detail API Tab 7: LÃ¡Â»â€¹ch sÃ¡Â»Â­ cÃƒÂ´ng tÃƒÂ¡c (HR_LichSuCongTacTbl)
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
-- 9. Detail API Tab 8: LÃ¡Â»â€¹ch sÃ¡Â»Â­ cÃƒÂ´ng viÃ¡Â»â€¡c (HR_PersonLogTbl)
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
-- 10. Detail API Tab 9: GiÃ¡ÂºÂ¥y tÃ¡Â»Â (HR_PersonGiayToTbl)
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
-- Ã„ÂÃ„Æ’ng kÃƒÂ½ cÃƒÂ¡c API nÃƒÂ y vÃƒÂ o bÃ¡ÂºÂ£ng WA_API
-- =========================================================================
DELETE FROM dbo.WA_API WHERE list = 'WA_PersonFullFrm';
DELETE FROM dbo.WA_API WHERE list LIKE 'API_PersonFull_T%';
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('WA_PersonFullFrm', 'View', 'API_HoSoNhanVien', '@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @PersonStatus=N''{PersonStatus}'''),
('WA_PersonFullFrm', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('WA_PersonFullFrm', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
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

-- 1. Ã„ÂÃ„Æ’ng kÃƒÂ½ cÃƒÂ¡c Detail API lÃƒÂ m danh sÃƒÂ¡ch (List) trong SY_FrmLstTbl
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (
    'API_PersonFull_T1_Salary',
    'API_PersonFull_T2_Allowance',
    'API_PersonFull_T3_KTKL',
    'API_PersonFull_T4_NghiPhep',
    'API_PersonFull_T5_Relation',
    'API_PersonFull_T6_HopDong',
    'API_PersonFull_T7_CongTac',
    'API_PersonFull_T8_Log',
    'API_PersonFull_T9_GiayTo'
);

INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey])
VALUES 
('API_PersonFull_T1_Salary', 'LIST', N'QuÃƒÂ¡ trÃƒÂ¬nh lÃ†Â°Ã†Â¡ng', 'Salary', 'HR_PersonSalaryTbl', 'UserAutoID'),
('API_PersonFull_T2_Allowance', 'LIST', N'PhÃ¡Â»Â¥ cÃ¡ÂºÂ¥p', 'Allowance', 'HR_PersonAllowanceTbl', 'UserAutoID'),
('API_PersonFull_T3_KTKL', 'LIST', N'Khen thÃ†Â°Ã¡Â»Å¸ng kÃ¡Â»Â· luÃ¡ÂºÂ­t', 'KTKL', 'HR_PersonKTKLTbl', 'UserAutoID'),
('API_PersonFull_T4_NghiPhep', 'LIST', N'NghÃ¡Â»â€° phÃƒÂ©p', 'Leave', 'HR_PersonNghiPhepTbl', 'UserAutoID'),
('API_PersonFull_T5_Relation', 'LIST', N'Gia cÃ¡ÂºÂ£nh', 'Relation', 'HR_PersonRelationTbl', 'RelationID'),
('API_PersonFull_T6_HopDong', 'LIST', N'HÃ¡Â»Â£p Ã„â€˜Ã¡Â»â€œng', 'Contract', 'HR_HopDongTbl', 'MaHopDong'),
('API_PersonFull_T7_CongTac', 'LIST', N'CÃƒÂ´ng tÃƒÂ¡c', 'Work history', 'HR_LichSuCongTacTbl', 'UserAutoID'),
('API_PersonFull_T8_Log', 'LIST', N'Log', 'Log', 'HR_LichSuCongViecTbl', 'UserAutoID'),
('API_PersonFull_T9_GiayTo', 'LIST', N'GiÃ¡ÂºÂ¥y tÃ¡Â»Â', 'Document', 'HR_GiayToTbl', 'DocumentID');
GO

-- 2. Ã„ÂÃ„Æ’ng kÃƒÂ½ Save/Delete trong WA_API
INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_PersonFull_T1_Salary', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T1_Salary', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T2_Allowance', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T2_Allowance', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T3_KTKL', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T3_KTKL', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T4_NghiPhep', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T4_NghiPhep', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T5_Relation', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T5_Relation', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T6_HopDong', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T6_HopDong', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T7_CongTac', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T7_CongTac', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T8_Log', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T8_Log', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),

('API_PersonFull_T9_GiayTo', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''),
('API_PersonFull_T9_GiayTo', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
GO



CREATE OR ALTER PROCEDURE [dbo].[API_PersonAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- TrÃƒÂ­ch xuÃ¡ÂºÂ¥t PersonID hoÃ¡ÂºÂ·c CandidateID tÃ¡Â»Â« chuÃ¡Â»â€”i JSON
        DECLARE @PersonID VARCHAR(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        
        DECLARE @TargetID VARCHAR(50) = ISNULL(@PersonID, @CandidateID);
        
        IF @TargetID IS NULL OR @TargetID = ''
        BEGIN
            SELECT -1 AS code, N'LÃ¡Â»â€”i: KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y mÃƒÂ£ nhÃƒÂ¢n viÃƒÂªn/Ã¡Â»Â©ng viÃƒÂªn!' AS msg;
            RETURN;
        END

        -- NÃ¡ÂºÂ¿u lÃƒÂ  tÃ¡ÂºÂ£i Ã¡ÂºÂ£nh Ã„â€˜Ã¡ÂºÂ¡i diÃ¡Â»â€¡n (FileType = 1) -> TÃƒÂ¬m ID Ã¡ÂºÂ£nh cÃ…Â© Ã„â€˜Ã¡Â»Æ’ ghi Ã„â€˜ÃƒÂ¨ (UPDATE)
        IF @FileType = 1 
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP 1 @ExistingID = UserAutoID 
            FROM HR_PersonAttachTbl 
            WHERE (PersonID = @TargetID) AND FileType = 1;

            IF @ExistingID IS NOT NULL
            BEGIN
                -- NÃ¡ÂºÂ¿u Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i Ã¡ÂºÂ£nh -> BÃ†Â¡m UserAutoID vÃƒÂ o JSON vÃƒÂ  Ã„â€˜Ã¡Â»â€¢i IsEdit = 1
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END
        END
        
        -- UÃ¡Â»Â· quyÃ¡Â»Ân lÃ¡ÂºÂ¡i cho hÃƒÂ m lÃƒÂµi API_LuuDong xÃ¡Â»Â­ lÃƒÂ½ JSON chuÃ¡ÂºÂ©n
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;
        
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO
GO

GO


CREATE OR ALTER PROCEDURE [dbo].[API_HR_BangThamSo_Lookup]
    @Keyword NVARCHAR(MAX) = N''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  
        RTRIM(PeriodID) AS [PeriodID],
        RTRIM(LoaiBaoHiem) AS [LoaiBaoHiem],
        CONCAT(PeriodID, '_', LoaiBaoHiem) AS [KeyID]
    FROM dbo.HR_BangThamSoTbl
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR PeriodID LIKE '%' + @Keyword + '%' 
           OR LoaiBaoHiem LIKE '%' + @Keyword + '%')
    GROUP BY PeriodID, LoaiBaoHiem
    ORDER BY PeriodID DESC, LoaiBaoHiem;
END
GO

GO

USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_HR_DropdownShifts
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ShiftID, ShiftName FROM HR_ShiftListTbl ORDER BY ShiftID;
END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_KinhPhiCongDoan]
    @Keyword NVARCHAR(100) = NULL,
    @BranchID VARCHAR(MAX) = NULL,
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Náº¿u khÃ´ng truyá»n BranchID, láº¥y danh sÃ¡ch chi nhÃ¡nh Ä‘Æ°á»£c phÃ¢n quyá»n cá»§a User
    IF ISNULL(@BranchID, '') = '' AND ISNULL(@User, '') <> ''
    BEGIN
        -- Láº¥y trá»±c tiáº¿p tá»« báº£ng tÃ i khoáº£n ngÆ°á»i dÃ¹ng SY_User
        SET @BranchID = (SELECT TOP 1 BranchID FROM dbo.SY_User WHERE UserName = @User)
    END

    -- 2. Truy váº¥n dá»¯ liá»‡u chÃ­nh tráº£ vá» cho Grid trÃªn Web
    SELECT 
        KP.[UserAutoID],
        KP.[PersonID],
        KP.[PersonName],
        KP.[ChucDanhChuyenMon],
        KP.[MucDong],
        KP.[KinhPhiNopCongDoanVN],
        KP.[CongDoanVN],
        KP.[CongDoanCTY],
        P.BranchID
    FROM [dbo].[HR_KinhPhiCongDoanTbl] KP
    LEFT JOIN [dbo].[HR_PersonView] P ON KP.PersonID = P.PersonID
    WHERE 
        -- Bá»™ lá»c tá»« khÃ³a (TÃ¬m theo mÃ£ hoáº·c tÃªn nhÃ¢n viÃªn)
        (ISNULL(@Keyword, '') = '' 
         OR KP.PersonID LIKE '%' + @Keyword + '%' 
         OR KP.PersonName LIKE N'%' + @Keyword + '%')
        
        -- Bá»™ lá»c Chi nhÃ¡nh (Há»— trá»£ chá»n nhiá»u chi nhÃ¡nh dáº¡ng chuá»—i cáº¯t STRING_SPLIT)
        AND (ISNULL(@BranchID, '') = '' 
             OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY  KP.PersonID;
END
GO

-- =========================================================================
-- Helper API: Láº¥y danh sÃ¡ch nhÃ¢n viÃªn kÃ¨m tÃ­nh toÃ¡n Kinh PhÃ­ CÃ´ng ÄoÃ n
-- DÃ¹ng Ä‘á»ƒ lÃ m nguá»“n dá»¯ liá»‡u (DataSource) tÃ¬m kiáº¿m chá»n nhÃ¢n viÃªn cho Form
-- Tá»± Ä‘á»™ng tráº£ vá» cÃ¡c trÆ°á»ng tÃ­nh toÃ¡n Ä‘á»ƒ Frontend tá»± Ä‘á»™ng map vÃ o Form
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_Calculate_MucDong_CongDoan]
    @Keyword NVARCHAR(200) = ''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        PV.PersonID, 
        PV.PersonName, 
        BHCT.MucDong, 
        ISNULL(HD.ChucDanhChuyenMonHD, PV.ChucDanhChuyenMon) AS ChucDanhChuyenMon, 
        PV.BranchID,
        -- TÃ­nh toÃ¡n cÃ¡c trÆ°á»ng tá»± Ä‘á»™ng
        CAST(ISNULL(BHCT.MucDong, 0) * 0.02 AS DECIMAL(18,2)) AS KinhPhiNopCongDoanVN,
        CAST(ISNULL(BHCT.MucDong, 0) * 0.02 * 0.25 AS DECIMAL(18,2)) AS CongDoanVN,
        CAST(ISNULL(BHCT.MucDong, 0) * 0.02 * 0.75 AS DECIMAL(18,2)) AS CongDoanCTY
    FROM [dbo].[HR_PersonView] PV 
    LEFT JOIN [dbo].[HR_BaoHiemChiTietTbl] BHCT ON PV.PersonID = BHCT.PersonID 
    LEFT JOIN [dbo].[HR_HopDongTbl] HD ON PV.PersonID = HD.PersonID
    WHERE @Keyword = '' 
       OR PV.PersonID LIKE '%' + @Keyword + '%' 
       OR PV.PersonName LIKE N'%' + @Keyword + '%';
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_LuongKhoan
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        L.UserAutoID,
        L.PersonID,
        P.PersonName,
        L.TuNgay,
        L.DenNgay,
        L.SoTienKhoan,
        L.GhiChu
    FROM dbo.HR_LuongKhoanTbl L
    LEFT JOIN dbo.HR_PersonTbl P ON L.PersonID = P.PersonID
    WHERE 
        @Keyword = ''
        OR L.PersonID LIKE '%' + @Keyword + '%'
        OR P.PersonName LIKE N'%' + @Keyword + '%'
        OR L.GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY L.TuNgay DESC, L.PersonID ASC;
END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungFrm]
(
    @List VARCHAR(50) = '',
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        U.*,
        G.UserGroupName,
        B.BranchName
    FROM dbo.SY_User U
    LEFT JOIN dbo.SY_UserGroup G ON U.UserGroupID = G.UserGroupID
    LEFT JOIN dbo.CF_BranchTbl B ON U.BranchID = B.BranchID
    WHERE (@Keyword = '' 
           OR U.UserName LIKE N'%' + @Keyword + '%' 
           OR U.HoTen LIKE N'%' + @Keyword + '%'
           OR U.EmployeeID LIKE N'%' + @Keyword + '%')
    ORDER BY U.UserName ASC;
END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungNhomFrm]
(
    @List VARCHAR(50) = '',
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        G.UserGroupID,
        G.UserGroupName,
        G.IsDisable,
        (SELECT COUNT(*) FROM dbo.SY_User U WHERE U.UserGroupID = G.UserGroupID) AS CountUser
    FROM dbo.SY_UserGroup G
    WHERE (@Keyword = '' OR G.UserGroupName LIKE N'%' + @Keyword + '%' OR G.UserGroupID LIKE N'%' + @Keyword + '%')
    ORDER BY G.UserGroupID ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_Payroll
(
    @PeriodID NVARCHAR(50) = '',
    @PhongBan NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @PeriodID = ISNULL(@PeriodID, '');
    SET @PhongBan = ISNULL(@PhongBan, '');
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        PAY.DocumentID,
        PAY.DocumentDate,
        PAY.PeriodID,
        PAY.PersonID,
        PAY.PersonName,
        PAY.LuongCoBan,
        PAY.LuongTong,
        PAY.TienBuTru,
        PAY.SoNguoiPhuThuoc,
        PAY.MucDong,
        PAY.TongLuong,
        PAY.IsBH,
        PAY.IsHuuTri,
        P.PhongBan
    FROM dbo.HR_PayrollTbl PAY
    LEFT JOIN dbo.HR_PersonTbl P ON PAY.PersonID = P.PersonID
    WHERE 
        (@PeriodID = '' OR PAY.PeriodID = @PeriodID)
        AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
        AND (
            @Keyword = ''
            OR PAY.PersonID LIKE '%' + @Keyword + '%'
            OR PAY.PersonName LIKE N'%' + @Keyword + '%'
            OR PAY.DocumentID LIKE '%' + @Keyword + '%'
        )
    ORDER BY PAY.PersonID ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE  PROCEDURE dbo.API_Payroll_Detail
(
    @DocumentID NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @DocumentID = ISNULL(@DocumentID, '');

    SELECT 
        UserAutoID,
        DocumentID,
        Code,
        Mota,
        SoTien,
        Notes
    FROM dbo.HR_PayrollDetailTbl
    WHERE DocumentID = @DocumentID
    ORDER BY Code ASC;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiLe
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        HolidayID,
        HolidayDate,
        HolidayName,
        SoCong
    FROM dbo.HR_HolidayTbl
    WHERE 
        @Keyword = ''
        OR HolidayID LIKE '%' + @Keyword + '%'
        OR HolidayName LIKE N'%' + @Keyword + '%'
    ORDER BY HolidayDate DESC;
END
GO

GO

USE X26DIMTUTAC
GO

-- =========================================================================
-- API View: Danh sÃ¡ch nhÃ¢n viÃªn (Master Grid)
-- EXEC dbo.API_QuanLyNghiPhepNam @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam
(
    @Keyword  NVARCHAR(200) = '',
    @BranchID NVARCHAR(MAX)  = '',
    @PhongBan NVARCHAR(50)  = '',
    @PersonName NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- Chá»©c vá»¥
        P.ChucDanhChuyenMon,    -- Chá»©c danh chuyÃªn mÃ´n
        P.NgaySinh,             -- NgÃ y sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Äá»‹a chá»‰ thÆ°á»ng trÃº
        P.NgayVaoLam,           -- NgÃ y nháº­n viá»‡c
        P.BranchID,
        P.NgayHopDong,
        P.NationName,
        P.SoHopDong,
        P.DienThoai
    FROM dbo.HR_PersonTbl P
    WHERE 
        ISNULL(P.PersonStatus, 1) <> 5   -- KhÃ´ng pháº£i Ä‘Ã£ nghá»‰ viá»‡c (Tráº¡ng thÃ¡i 5 = Nghá»‰ viá»‡c)
        AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
        AND (@PhongBan  = '' OR P.PhongBan = @PhongBan)
        AND (@PersonName = '' OR P.PersonName LIKE N'%' + @PersonName + '%')
        AND (
            @Keyword = ''
            OR P.PersonID   LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY P.PhongBan, P.PersonName;
END
GO

GO

USE X26DIMTUTAC
GO

-- =========================================================================
-- API Tab Chi tiáº¿t: Lá»‹ch sá»­ phÃ©p nÄƒm theo PersonID (táº¥t cáº£ cÃ¡c nÄƒm)
-- EXEC dbo.API_QuanLyNghiPhepNam_ChiTiet @PersonID = 'ED004'
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam_ChiTiet
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        N.UserAutoID,
        N.PersonID,
        N.Nam,
        ISNULL(N.SoNgay, 0)            AS SoNgay,
        N.GhiChu,
        ISNULL(N.PhepThamNien, 0)      AS PhepThamNien,
        ISNULL(N.SoNgayDaSuDung, 0)    AS SoNgayDaSuDung,
        ISNULL(N.SoNgayConLai, 0)      AS SoNgayConLai,
        ISNULL(N.PhepTonNamTruoc, 0)   AS PhepTonNamTruoc,
        ISNULL(N.SoNgayPhepTet, 0)     AS SoNgayPhepTet,
        ISNULL(N.SoNgayPhepOm, 0)      AS SoNgayPhepOm,
        N.NgayCapNhat
    FROM dbo.HR_PersonNghiPhepTbl N
    WHERE N.PersonID = @PersonID
    ORDER BY N.Nam DESC;
END
GO

GO

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

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_ChungChi
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        TenChungChi,
        ToChucCap,
        NgayCap
    FROM dbo.HR_UngVienChungChiTbl
    WHERE CandidateID = @CandidateID;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_HocVan
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        TruongDaoTao,
        ChuyenNganh,
        TuNam,
        DenNam,
        BangCap
    FROM dbo.HR_UngVienHocVanTbl
    WHERE CandidateID = @CandidateID;
END
GO

GO

USE X26DIMTUTAC
GO
CREATE OR ALTER PROCEDURE dbo.API_QuanLyUngVien_KinhNghiem
(
    @CandidateID VARCHAR(50)
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        UserAutoID,
        CandidateID,
        CongTyCu,
        ViTriCongTac,
        TuThangNam,
        DenThangNam,
        MoTaCongViec
    FROM dbo.HR_UngVienKinhNghiemTbl
    WHERE CandidateID = @CandidateID;
END
GO

GO

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

GO

-- 1. Create the HR_CandidateAttachTbl table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'HR_CandidateAttachTbl')
BEGIN
    CREATE TABLE [dbo].[HR_CandidateAttachTbl](
        [UserAutoID] [varchar](50) NOT NULL,
        [CandidateID] [varchar](50) NULL,
        [FileName] [nvarchar](250) NULL,
        [FileType] [int] NULL,
        [STT] [int] NULL,
        [FileSize] [int] NULL,
        [Base64Content] [nvarchar](max) NULL,
        [Content] [varbinary](max) NULL,
        [Notes] [nvarchar](500) NULL,
     CONSTRAINT [PK_HR_CandidateAttachTbl] PRIMARY KEY CLUSTERED 
    (
        [UserAutoID] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

    ALTER TABLE [dbo].[HR_CandidateAttachTbl]  WITH CHECK ADD  CONSTRAINT [FK_HR_CandidateAttachTbl_HR_DanhSachUngVienTbl] FOREIGN KEY([CandidateID])
    REFERENCES [dbo].[HR_DanhSachUngVienTbl] ([CandidateID])
    ON DELETE CASCADE

    ALTER TABLE [dbo].[HR_CandidateAttachTbl] CHECK CONSTRAINT [FK_HR_CandidateAttachTbl_HR_DanhSachUngVienTbl]
END
GO

-- 2. Create the procedure API_CandidateAttach_SaveAvatar
CREATE OR ALTER PROCEDURE [dbo].[API_CandidateAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Extract CandidateID from JSON
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        
        IF @CandidateID IS NULL OR @CandidateID = ''
        BEGIN
            SELECT -1 AS code, N'Lá»—i: KhÃ´ng tÃ¬m tháº¥y mÃ£ á»©ng viÃªn!' AS msg;
            RETURN;
        END

        -- If uploading Avatar (FileType = 1) -> Find old Avatar to overwrite (UPDATE)
        IF @FileType = 1 
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP 1 @ExistingID = UserAutoID 
            FROM HR_CandidateAttachTbl 
            WHERE (CandidateID = @CandidateID) AND FileType = 1;

            IF @ExistingID IS NOT NULL
            BEGIN
                -- If Avatar exists -> Inject UserAutoID into JSON and change IsEdit = 1
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END
        END
        
        -- Delegate to API_LuuDong
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;
        
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO

-- 3. Register Procedure in WA_API
IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE list = 'API_CandidateAttach' AND func = 'SaveAvatar')
BEGIN
    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    VALUES ('API_CandidateAttach', 'SaveAvatar', 'API_CandidateAttach_SaveAvatar', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''');
END
GO

-- 4. Register Mapping in SY_FrmLstTbl
IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = 'API_CandidateAttach')
BEGIN
    INSERT INTO dbo.SY_FrmLstTbl (FormID, TableName, PrimaryKey)
    VALUES ('API_CandidateAttach', 'HR_CandidateAttachTbl', 'UserAutoID');
END
GO

GO

USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_XuLyChamCongHangNgay] - Láº¤Y Dá»® LIá»†U Xá»¬ LÃ CHáº¤M CÃ”NG HÃ€NG NGÃ€Y CHO WEB APP
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_XuLyChamCongHangNgay
(
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Giáº£i mÃ£ cÃ¡c tham sá»‘ lá»c tá»« JSON bá»™ lá»c gá»­i lÃªn tá»« Web
    DECLARE @PeriodID VARCHAR(50) = NULL;
    DECLARE @BranchID NVARCHAR(MAX) = NULL;
    DECLARE @PhongBan NVARCHAR(50) = NULL;
    DECLARE @NgayLoc VARCHAR(50) = NULL;
    DECLARE @LoaiHD NVARCHAR(50) = NULL;

    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        SET @PeriodID = JSON_VALUE(@Data, '$.PeriodID');
        SET @BranchID = JSON_VALUE(@Data, '$.BranchID');
        SET @PhongBan = JSON_VALUE(@Data, '$.PhongBan');
        SET @NgayLoc = JSON_VALUE(@Data, '$.Ngay');
        SET @LoaiHD = JSON_VALUE(@Data, '$.LoaiHD');
    END

    -- Náº¿u lá»c Ká»³ trá»‘ng, tá»± Ä‘á»™ng láº¥y Ká»³ má»›i nháº¥t Ä‘á»ƒ trÃ¡nh trá»‘ng dá»¯ liá»‡u lÃºc load trang
    IF ISNULL(@PeriodID, '') = '' AND ISNULL(@NgayLoc, '') = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetDayTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback náº¿u báº£ng cháº¥m cÃ´ng trá»‘ng hoÃ n toÃ n
        IF ISNULL(@PeriodID, '') = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END

    -- Truy váº¥n káº¿t há»£p dá»¯ liá»‡u báº£ng cháº¥m cÃ´ng chi tiáº¿t vÃ  thÃ´ng tin nhÃ¢n viÃªn
    -- LÆ°u Ã½: Cáº§n chá»n cá»™t UserAutoID lÃ m khoÃ¡ chÃ­nh Ä‘á»ƒ thá»±c hiá»‡n chá»©c nÄƒng ThÃªm/Sá»­a/XoÃ¡ trÃªn Grid
    SELECT 
        T.UserAutoID,
        T.PersonID,
        P.PersonName,
        P.PhongBan,
        P.BranchID,
        P.LoaiHD,
        T.PeriodID,
        T.Ngay,
        T.ThoiGianVao,
        T.ThoiGianRa,
        T.GioVao,
        T.GioRa,
        T.SoGio,
        T.SoPhut,
        T.SoCong,
        T.GhiChu,
        T.LyDo
    FROM dbo.HR_TimeSheetDayTbl T
    LEFT JOIN dbo.HR_PersonView P ON T.PersonID = P.PersonID
    WHERE 
        -- Bá»™ lá»c Ká»³ lÆ°Æ¡ng (PeriodID)
        (@PeriodID IS NULL OR @PeriodID = '' OR T.PeriodID = @PeriodID)
        -- Bá»™ lá»c Chi nhÃ¡nh (BranchID)
        AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
        -- Bá»™ lá»c Bá»™ pháº­n (PhongBan)
        AND (@PhongBan IS NULL OR @PhongBan = '' OR P.PhongBan = @PhongBan)
        -- Bá»™ lá»c NgÃ y (Ngay)
        AND (
            ISNULL(@NgayLoc, '') = '' 
            OR @NgayLoc = '1900-01-01'
            OR CAST(T.Ngay AS DATE) = CAST(@NgayLoc AS DATE)
        )
        -- Bá»™ lá»c Loáº¡i há»£p Ä‘á»“ng (LoaiHD)
        AND (@LoaiHD IS NULL OR @LoaiHD = '' OR P.LoaiHD = @LoaiHD)
        -- TÃ¬m kiáº¿m chung theo Keyword (MÃ£ NV hoáº·c TÃªn NV)
        AND (
            @Keyword = ''
            OR T.PersonID LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY 
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir = 'DESC' THEN T.PeriodID END DESC,
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir <> 'DESC' THEN T.PeriodID END ASC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir = 'DESC' THEN T.PersonID END DESC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir <> 'DESC' THEN T.PersonID END ASC,
        CASE WHEN @SortColumn = 'Ngay' AND @SortDir = 'DESC' THEN T.Ngay END DESC,
        CASE WHEN @SortColumn = 'Ngay' AND @SortDir <> 'DESC' THEN T.Ngay END ASC,
        -- Sáº¯p xáº¿p máº·c Ä‘á»‹nh
        T.Ngay DESC, T.PersonID ASC;
END
GO

GO

USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.TinhBHStp', 'P') IS NOT NULL
    DROP PROCEDURE dbo.TinhBHStp;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: TinhBHStp
-- Description: TÃ­nh toÃ¡n sá»‘ tiá»n Ä‘Ã³ng báº£o hiá»ƒm cá»§a NLD vÃ  CTY dá»±a trÃªn báº£ng tham sá»‘
-- =========================================================================
CREATE PROCEDURE dbo.TinhBHStp
(
    @PeriodID NVARCHAR(50),
    @LoaiBaoHiem NVARCHAR(50),
    @MucDong DECIMAL(18, 2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Tá»· lá»‡ pháº§n trÄƒm máº·c Ä‘á»‹nh (theo quy Ä‘á»‹nh chung)
    DECLARE @BHXHNLD DECIMAL(18, 4) = 8.0;
    DECLARE @BHXHCTY DECIMAL(18, 4) = 17.5;
    DECLARE @BHYTNLD DECIMAL(18, 4) = 1.5;
    DECLARE @BHYTCTY DECIMAL(18, 4) = 3.0;
    DECLARE @BHTNNLD DECIMAL(18, 4) = 1.0;
    DECLARE @BHTNCTY DECIMAL(18, 4) = 1.0;

    -- Láº¥y tá»‰ lá»‡ thá»±c táº¿ tá»« báº£ng tham sá»‘ tÃ­nh lÆ°Æ¡ng (náº¿u cÃ³ cáº¥u hÃ¬nh)
    SELECT TOP 1
        @BHXHNLD = ISNULL(BHXHNLD, 8.0),
        @BHXHCTY = ISNULL(BHXHCTY, 17.5),
        @BHYTNLD = ISNULL(BHYTNLD, 1.5),
        @BHYTCTY = ISNULL(BHYTCTY, 3.0),
        @BHTNNLD = ISNULL(BHTNNLD, 1.0),
        @BHTNCTY = ISNULL(BHTNCTY, 1.0)
    FROM dbo.HR_BangThamSoTbl
    WHERE PeriodID = @PeriodID AND LoaiBaoHiem = @LoaiBaoHiem;

    -- Tráº£ vá» cÃ¡c má»©c Ä‘Ã³ng cá»§a ngÆ°á»i lao Ä‘á»™ng vÃ  ngÆ°á»i sá»­ dá»¥ng lao Ä‘á»™ng
    SELECT 
        CAST(ROUND(@MucDong * @BHXHNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHXHNLD,
        CAST(ROUND(@MucDong * @BHXHCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHXHNSDLD,
        CAST(ROUND(@MucDong * @BHYTNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHYTNLD,
        CAST(ROUND(@MucDong * @BHYTCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHYTNSDLD,
        CAST(ROUND(@MucDong * @BHTNNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHTNNLD,
        CAST(ROUND(@MucDong * @BHTNCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHTNNSDLD;
END
GO

GO


IF OBJECT_ID('dbo.WA_BaoHiemFrm_Save', 'P') IS NOT NULL
    DROP PROCEDURE dbo.WA_BaoHiemFrm_Save;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE dbo.WA_BaoHiemFrm_Save
(
    @List VARCHAR(50) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- TrÃ­ch xuáº¥t PeriodKeyID tá»« JSON (VD: 202606_NVN)
        DECLARE @PeriodKeyID VARCHAR(50) = JSON_VALUE(@Data, '$.PeriodKeyID');
        
        IF @PeriodKeyID IS NOT NULL AND CHARINDEX('_', @PeriodKeyID) > 0
        BEGIN
            -- TÃ¡ch PeriodID vÃ  LoaiBaoHiem tá»« PeriodKeyID
            DECLARE @PeriodID VARCHAR(20) = SUBSTRING(@PeriodKeyID, 1, CHARINDEX('_', @PeriodKeyID) - 1);
            DECLARE @LoaiBaoHiem VARCHAR(50) = SUBSTRING(@PeriodKeyID, CHARINDEX('_', @PeriodKeyID) + 1, LEN(@PeriodKeyID));
            
            -- BÆ¡m ngÆ°á»£c láº¡i PeriodID vÃ  LoaiBaoHiem vÃ o JSON
            SET @Data = JSON_MODIFY(@Data, '$.PeriodID', @PeriodID);
            SET @Data = JSON_MODIFY(@Data, '$.LoaiBaoHiem', @LoaiBaoHiem);
        END

        -- Gá»i láº¡i hÃ m lÃµi API_LuuDong Ä‘á»ƒ tiáº¿n hÃ nh lÆ°u
        EXEC API_LuuDong @List = @List, @Data = @Data, @UserName = @UserName;

    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO

GO

USE X26DIM_TT;
GO
IF OBJECT_ID('dbo.WA_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.WA_BaoHiem_PersonLookup;
GO
IF OBJECT_ID('dbo.API_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_PersonLookup;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[WA_BaoHiem_PersonLookup]
(
    @BranchID NVARCHAR(50) = '',
    @LoaiBaoHiem NVARCHAR(50) = '',
    @DocumentID NVARCHAR(50) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @BranchID = ISNULL(@BranchID, '');
    SET @LoaiBaoHiem = ISNULL(@LoaiBaoHiem, '');
    SET @DocumentID = ISNULL(@DocumentID, '');
    SET @Keyword = ISNULL(@Keyword, '');

    DECLARE @LoaiHDFilter NVARCHAR(50) = '';

    ----------------------------------------------------------------
    -- Náº¿u khÃ´ng truyá»n BranchID / LoaiBaoHiem thÃ¬ láº¥y tá»« master theo DocumentID
    ----------------------------------------------------------------
    IF @DocumentID <> ''
    BEGIN
        SELECT TOP 1
            @BranchID = CASE 
                            WHEN @BranchID = '' 
                            THEN ISNULL(BranchID, '') 
                            ELSE @BranchID 
                        END,

            @LoaiBaoHiem = CASE 
                                WHEN @LoaiBaoHiem = '' 
                                THEN ISNULL(LoaiBaoHiem, '') 
                                ELSE @LoaiBaoHiem 
                            END
        FROM dbo.HR_BaoHiemTbl
        WHERE DocumentID = @DocumentID;
    END;

    ----------------------------------------------------------------
    -- Láº¥y loáº¡i HD tá»« LoaiBaoHiem
    -- VD: BHXH_NVN => NVN
    -- VD: BHXH_NNN => NNN
    ----------------------------------------------------------------
    IF UPPER(@LoaiBaoHiem) LIKE '%NNN%'
        SET @LoaiHDFilter = 'NNN';

    IF UPPER(@LoaiBaoHiem) LIKE '%NVN%'
        SET @LoaiHDFilter = 'NVN';

    ----------------------------------------------------------------
    -- ChÆ°a chá»n chi nhÃ¡nh thÃ¬ khÃ´ng xá»• nhÃ¢n viÃªn
    ----------------------------------------------------------------
    IF @BranchID = ''
    BEGIN
        SELECT 
            CAST(NULL AS NVARCHAR(50)) AS PersonID,
            CAST(NULL AS NVARCHAR(250)) AS PersonName,
            CAST(NULL AS NVARCHAR(250)) AS PhongBan,
            CAST(0 AS DECIMAL(18, 2)) AS MucDong,
            CAST(NULL AS NVARCHAR(50)) AS BranchID,
            CAST(NULL AS NVARCHAR(250)) AS ChucDanhChuyenMon,
            CAST(NULL AS NVARCHAR(50)) AS LoaiHD,
            N'' AS CanhBao
        WHERE 1 = 0;

        RETURN;
    END;

    ----------------------------------------------------------------
    -- Láº¥y nhÃ¢n viÃªn theo chi nhÃ¡nh master
    -- Lá»c NVN / NNN dá»±a theo LoaiBaoHiem
    ----------------------------------------------------------------
    SELECT 
        P.PersonID, 
        P.PersonName, 
        P.PhongBan, 
        ISNULL(BH.MucDong, 0) AS MucDong,
        P.BranchID,

        ISNULL(HDGN.ChucDanhChuyenMon, '') AS ChucDanhChuyenMon,

        CASE 
            WHEN ISNULL(HDGN.LoaiHD, '') LIKE '%NNN%' THEN 'NNN'
            ELSE 'NVN'
        END AS LoaiHD,

        CASE 
            WHEN BH.PersonID IS NOT NULL 
            THEN N'!!! ÄÃƒ CÃ“ BH Táº I Ká»²: ' 
                 + CAST(BH.PeriodID AS VARCHAR(50))
                 + N' - NgÃ y CT: ' + CONVERT(VARCHAR(10), BH.DocumentDate, 103)
                 + N' (Chá»©ng tá»«: ' + BH.DocumentID + N')'
            ELSE N'' 
        END AS CanhBao

    FROM dbo.HR_PersonTbl P

    OUTER APPLY
    (
        SELECT TOP 1
            HD.PersonID,
            HD.LoaiHD,
            P.ChucDanhChuyenMon,
            HD.NgayKyHopDong,
            HD.NgayCoHieuLuc,
            HD.MaHopDong
        FROM dbo.HR_HopDongTbl HD
        WHERE HD.PersonID = P.PersonID
        ORDER BY 
            ISNULL(HD.NgayCoHieuLuc, '19000101') DESC,
            ISNULL(HD.NgayKyHopDong, '19000101') DESC,
            HD.MaHopDong DESC
    ) HDGN

    OUTER APPLY
    (
        SELECT TOP 1
            CT.PersonID,
            CT.MucDong,
            H.DocumentID,
            H.PeriodID,
            H.DocumentDate
        FROM dbo.HR_BaoHiemChiTietTbl CT
        INNER JOIN dbo.HR_BaoHiemTbl H 
            ON H.DocumentID = CT.DocumentID
        WHERE CT.PersonID = P.PersonID

          AND (
                @LoaiBaoHiem = ''
                OR H.LoaiBaoHiem = @LoaiBaoHiem
              )

          -- KhÃ´ng láº¥y chÃ­nh chá»©ng tá»« Ä‘ang sá»­a Ä‘á»ƒ cáº£nh bÃ¡o láº¡i chÃ­nh nÃ³
          AND (
                @DocumentID = ''
                OR H.DocumentID <> @DocumentID
              )

        ORDER BY 
            H.DocumentDate DESC,
            H.PeriodID DESC,
            H.DocumentID DESC
    ) BH

    WHERE P.BranchID = @BranchID

      AND
      (
            @LoaiHDFilter = ''

            OR
            (
                @LoaiHDFilter = 'NNN'
                AND ISNULL(HDGN.LoaiHD, '') LIKE '%NNN%'
            )

            OR
            (
                @LoaiHDFilter = 'NVN'
                AND ISNULL(HDGN.LoaiHD, '') NOT LIKE '%NNN%'
            )
      )
      
      -- Bá»• sung bá»™ lá»c Keyword cho Web App Combobox
      AND (
          @Keyword = ''
          OR P.PersonID LIKE '%' + @Keyword + '%'
          OR P.PersonName LIKE N'%' + @Keyword + '%'
      )

    ORDER BY P.PersonID DESC;
END
GO

GO

USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- API: Láº¥y danh sÃ¡ch cÃ¡c Loáº¡i Äá»‹nh dáº¡ng Input (FormatID)
-- =============================================
CREATE  PROCEDURE [dbo].[API_ComboFormatID]
    @Keyword NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Táº¡o báº£ng táº¡m chá»©a cÃ¡c giÃ¡ trá»‹ giá»‘ng y chang STATIC cá»§a anh
    SELECT * INTO #TempFormat FROM (
        VALUES 
            ('t',  N'VÄƒn báº£n (Text)'),
            ('n',  N'Sá»‘ (Number)'),
            ('dt', N'NgÃ y (Date)'),
            ('sw', N'Báº­t/Táº¯t (Switch)'),
            ('sl', N'Danh sÃ¡ch chá»n (Select)')
    ) AS FormatList(MaDinhDang, TenDinhDang)

    -- Tráº£ vá» káº¿t quáº£ (Lá»c náº¿u user cÃ³ gÃµ tÃ¬m kiáº¿m)
    SELECT 
        MaDinhDang,
        TenDinhDang
    FROM #TempFormat
    WHERE 
        (@Keyword IS NULL OR @Keyword = '')
        OR TenDinhDang LIKE N'%' + @Keyword + '%'
        OR MaDinhDang LIKE N'%' + @Keyword + '%';
        
    DROP TABLE #TempFormat;
END
GO

GO

USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- API: Láº¥y danh sÃ¡ch cáº¥u hÃ¬nh kÃ­ch thÆ°á»›c chia cá»™t (Form Position / Layout)
-- Cá»™t 1: MÃ£ (Value) - Cá»™t 2: TiÃªu Ä‘á» hiá»ƒn thá»‹ (Label)
-- =============================================
CREATE PROCEDURE [dbo].[API_ComboFormPosition]
    @Keyword NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Äáº©y dá»¯ liá»‡u tÄ©nh vÃ o báº£ng táº¡m
    SELECT * INTO #TempPos FROM (
        VALUES 
            ('12', N'Äáº§y Ä‘á»§ 100% (Full)'),
            ('6',  N'Má»™t ná»­a 50% (Half)'),
            ('4',  N'1/3 Chiá»u rá»™ng'),
            ('3',  N'1/4 Chiá»u rá»™ng')
    ) AS PosList(MaViTri, TenViTri)

    -- Tráº£ vá» káº¿t quáº£ vÃ  xá»­ lÃ½ tÃ¬m kiáº¿m
    SELECT 
        MaViTri,
        TenViTri
    FROM #TempPos
    WHERE 
        (@Keyword IS NULL OR @Keyword = '')
        OR TenViTri LIKE N'%' + @Keyword + '%'
        OR MaViTri LIKE N'%' + @Keyword + '%';
        
    DROP TABLE #TempPos;
END
GO

GO


-- =========================================================================
-- Äá»• dá»¯ liá»‡u Combobox cho tráº¡ng thÃ¡i nhÃ¢n viÃªn
-- Báº£ng: HR_PersonStatusTbl
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_ComboPersonStatus
(
    @Keyword NVARCHAR(200) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        PersonStatus AS [MÃ£],
        PersonStatusName AS [TÃªn]
    FROM dbo.HR_PersonStatusTbl
    WHERE (@Keyword = '' OR PersonStatusName LIKE N'%' + @Keyword + '%')
    ORDER BY PersonStatus ASC;
END
GO

-- Lá»‡nh Ä‘á»ƒ thÃªm API nÃ y vÃ o báº£ng WA_API Ä‘á»ƒ Frontend cÃ³ thá»ƒ gá»i Ä‘Æ°á»£c
IF NOT EXISTS (SELECT 1 FROM WA_API WHERE list = 'API_ComboPersonStatus' AND func = 'View')
BEGIN
    INSERT INTO WA_API (list, func, SQL, Para)
    VALUES ('API_ComboPersonStatus', 'View', 'API_ComboPersonStatus', '@Keyword=''{Keyword}'', @UserName=''{UserName}''');
END
GO

GO

IF OBJECT_ID('API_DanhSachTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE API_DanhSachTaiKhoan;
GO

CREATE PROCEDURE API_DanhSachTaiKhoan
    @Keyword nvarchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
        SELECT 
        UserName,
        HoTen,
        UserGroupID,
        BranchID, -- ÄÃ£ thÃªm cá»™t nÃ y
        Disable,
        EmployeeID,
        Manager
    FROM SY_User
    WHERE (@Keyword IS NULL OR @Keyword = '' 
           OR UserName LIKE '%' + @Keyword + '%')
    ORDER BY UserName ASC;
END
GO

GO

IF OBJECT_ID('API_DanhSachTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_DanhSachTruongGiaoDien;
GO

CREATE PROCEDURE API_DanhSachTruongGiaoDien
    @Keyword nvarchar(100) = NULL,
    @FormName nvarchar(100) = NULL,
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @OrderByClause NVARCHAR(MAX);

    -- Xá»­ lÃ½ ORDER BY
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        IF ISNULL(@SortDir, '') NOT IN ('ASC', 'DESC', 'asc', 'desc')
            SET @SortDir = 'ASC';
            
        -- ThÃªm bÃ­ danh 'ff.' náº¿u cá»™t náº±m trong SY_FormatFields Ä‘á»ƒ trÃ¡nh ambiguous
        -- Trong trÆ°á»ng há»£p nÃ y cÃ¡c cá»™t láº¥y ra Ä‘á»u thuá»™c ff trá»« má»™t sá»‘ cá»™t Ä‘áº·c biá»‡t,
        -- táº¡m thá»i cá»© truyá»n tháº³ng tÃªn cá»™t vÃ o QUOTENAME
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@SortColumn) + ' ' + @SortDir;
    END
    ELSE
    BEGIN
        SET @OrderByClause = ' ORDER BY ff.FormName ASC, ff.FieldName ASC';
    END
    
    SET @sql = N'
    SELECT 
        ff.AutoID, 
        ff.FormName, 
        ff.FieldName, 
        ff.CaptionVN, 
        ff.FormatID, 
        ff.CaptionEN, 
        ff.DataSource,
        ff.IsRequired, 
        ff.FormPosition, 
        ff.ValidateRule,
        ff.DependsOn,
        ff.VisibleRule,
        ff.OrderNo,
        ISNULL(ff.ShowInAdd,      1) AS ShowInAdd,
        ISNULL(ff.ShowInEdit,     1) AS ShowInEdit,
        ISNULL(ff.IsReadOnlyEdit, 0) AS IsReadOnlyEdit,
        ISNULL(ff.IsReadOnlyAdd,  0) AS IsReadOnlyAdd,
        ISNULL(ff.ShowInFilter,   0) AS ShowInFilter

    FROM SY_FormatFields ff
    LEFT JOIN SY_FrmLstTbl l ON ff.FormName = l.FormID
    WHERE (@Keyword IS NULL OR @Keyword = '''' 
           OR ff.FormName LIKE ''%'' + @Keyword + ''%'' 
           OR ff.FieldName LIKE ''%'' + @Keyword + ''%''
           OR ff.CaptionVN LIKE N''%'' + @Keyword + ''%''
           OR l.CaptionVN LIKE N''%'' + @Keyword + ''%'')
      AND (@FormName IS NULL OR @FormName = '''' OR @FormName = ''frmFormBuilder'' OR ff.FormName = @FormName)
    ' + @OrderByClause;

    EXEC sp_executesql @sql, 
        N'@Keyword nvarchar(100), @FormName nvarchar(100)', 
        @Keyword = @Keyword, 
        @FormName = @FormName;

END
GO

GO


IF OBJECT_ID('dbo.API_DongBoQuyenTruyCap') IS NOT NULL
    DROP PROCEDURE [dbo].[API_DongBoQuyenTruyCap];
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_DongBoQuyenTruyCap]
    @NhomNguoiDangThaoTac NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        -- XÃ³a rÃ¡c: MenuID rá»—ng
        DELETE FROM WA_UserGroupPermisstion
        WHERE COALESCE(MenuID, '') = '';

        -- XÃ³a rÃ¡c: nhÃ³m khÃ´ng cÃ²n tá»“n táº¡i
        DELETE FROM WA_UserGroupPermisstion
        WHERE UserGroupID NOT IN (SELECT UserGroupID FROM SY_UserGroup);

        -- XÃ³a rÃ¡c: menu khÃ´ng cÃ²n tá»“n táº¡i
        DELETE FROM WA_UserGroupPermisstion
        WHERE MenuID NOT IN (SELECT MenuID FROM WA_Menu);

        -- BÆ¡m quyá»n cÃ²n thiáº¿u (dÃ¹ng URLPara thay FormName vÃ¬ há»‡ thá»‘ng nÃ y khÃ´ng dÃ¹ng FormName)
        INSERT INTO WA_UserGroupPermisstion
            (ID, UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete,
             isManager, isAdmin, isAutoLock, isHideAmount, isLockDoc, isUnLockDoc, isExportExcel)
        SELECT
            G.UserGroupID + '_' + M.MenuID,
            G.UserGroupID,
            M.MenuID,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            0, 0, 0,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END
        FROM (SELECT DISTINCT UserGroupID FROM SY_UserGroup) G
        CROSS JOIN (SELECT DISTINCT MenuID FROM WA_Menu WHERE COALESCE(MenuID, '') <> '') M
        WHERE NOT EXISTS (
            SELECT 1 FROM WA_UserGroupPermisstion P
            WHERE P.UserGroupID = G.UserGroupID
              AND P.MenuID = M.MenuID
        )
        AND NOT EXISTS (
            SELECT 1 FROM WA_UserGroupPermisstion P
            WHERE P.ID = G.UserGroupID + '_' + M.MenuID
        );

        -- Ghi version Ä‘á»“ng bá»™ vÃ o SY_Setup Ä‘á»ƒ cÃ¡c client tá»± biáº¿t cache cÅ©
        IF EXISTS (SELECT 1 FROM SY_Setup WHERE CodeID = 'menu_sync_ver')
            UPDATE SY_Setup
            SET CodeValue = CONVERT(NVARCHAR(50), GETDATE(), 126)
            WHERE CodeID = 'menu_sync_ver';
        ELSE
            INSERT INTO SY_Setup (CodeID, CodeName, CodeValue, GroupID)
            VALUES ('menu_sync_ver', N'PhiÃªn báº£n Ä‘á»“ng bá»™ Menu', CONVERT(NVARCHAR(50), GETDATE(), 126), 'SY');

        SELECT 0 AS [code], N'Äá»“ng bá»™ quyá»n thÃ nh cÃ´ng' AS [msg];

    END TRY
    BEGIN CATCH
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg];
    END CATCH

END
GO

GO


IF OBJECT_ID('API_DongBoTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_DongBoTruongGiaoDien;
GO

-- =============================================
-- API: Äá»“ng bá»™ cÃ¡c trÆ°á»ng dá»¯ liá»‡u tá»« Stored Procedure/Table vÃ o báº£ng cáº¥u hÃ¬nh Form (SY_FormatFields)
-- VD: EXEC API_DongBoTruongGiaoDien @FormName = 'frmHopDong', @ObjectName = 'API_DanhSachHopDong'
-- =============================================
CREATE PROCEDURE API_DongBoTruongGiaoDien
    @FormName VARCHAR(50),
    @ObjectName VARCHAR(128) = NULL, -- TÃªn Stored Procedure (VD: 'API_DanhSachHopDong') hoáº·c Table/View
    @TSQL NVARCHAR(MAX) = NULL       -- Hoáº·c cÃ¢u lá»‡nh T-SQL (VD: 'SELECT * FROM dmkhachhang')
AS
BEGIN
    SET NOCOUNT ON;

    IF LOWER(LTRIM(RTRIM(ISNULL(@FormName, '')))) = LOWER('WA_BangThueTNCNFrm')
        THROW 52601, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: pilot khong duoc dong bo SY_FormatFields.', 1;

    -- Báº£ng táº¡m chá»©a danh sÃ¡ch cá»™t láº¥y Ä‘Æ°á»£c tá»« metadata
    DECLARE @Columns TABLE (
        name NVARCHAR(128),
        system_type_name NVARCHAR(128),
        column_ordinal INT
    );

    IF @ObjectName IS NOT NULL
    BEGIN
        -- CÃ¡ch 1: Thá»­ láº¥y tá»« Object (Stored Procedure, View, Table Function...) báº±ng DMV
        INSERT INTO @Columns (name, system_type_name, column_ordinal)
        SELECT name, system_type_name, column_ordinal
        FROM sys.dm_exec_describe_first_result_set_for_object(OBJECT_ID(@ObjectName), 0)
        WHERE name IS NOT NULL;

        -- CÃ¡ch 2: Náº¿u lÃ  Table/View thÃ´ng thÆ°á»ng thÃ¬ sys.dm_exec_describe_first_result_set_for_object cÃ³ thá»ƒ tráº£ vá» NULL
        IF NOT EXISTS (SELECT 1 FROM @Columns) AND OBJECT_ID(@ObjectName) IS NOT NULL
        BEGIN
            DECLARE @TableSQL NVARCHAR(MAX) = 'SELECT TOP 1 * FROM ' + @ObjectName;
            INSERT INTO @Columns (name, system_type_name, column_ordinal)
            SELECT name, system_type_name, column_ordinal
            FROM sys.dm_exec_describe_first_result_set(@TableSQL, NULL, 0)
            WHERE name IS NOT NULL;
        END
        
        -- CÃ¡ch 3: Náº¿u váº«n khÃ´ng cÃ³ (vÃ¬ SP cÃ³ temp table khÃ³ phÃ¢n tÃ­ch metadata), dÃ¹ng string EXEC
        IF NOT EXISTS (SELECT 1 FROM @Columns) 
        BEGIN
            DECLARE @ExecSQL NVARCHAR(MAX) = 'EXEC ' + @ObjectName;
            INSERT INTO @Columns (name, system_type_name, column_ordinal)
            SELECT name, system_type_name, column_ordinal
            FROM sys.dm_exec_describe_first_result_set(@ExecSQL, NULL, 0)
            WHERE name IS NOT NULL;
        END
    END
    ELSE IF @TSQL IS NOT NULL
    BEGIN
        -- Láº¥y tá»« cÃ¢u lá»‡nh T-SQL trá»±c tiáº¿p
        INSERT INTO @Columns (name, system_type_name, column_ordinal)
        SELECT name, system_type_name, column_ordinal
        FROM sys.dm_exec_describe_first_result_set(@TSQL, NULL, 0)
        WHERE name IS NOT NULL;
    END
    -- XÃ³a cÃ¡c trÆ°á»ng cÅ© khÃ´ng cÃ²n tá»“n táº¡i trong káº¿t quáº£ cá»§a Procedure/Table
    DELETE FROM SY_FormatFields 
    WHERE FormName = @FormName 
      AND FieldName NOT IN (SELECT name FROM @Columns);

    -- Cursor duyá»‡t qua cÃ¡c cá»™t Ä‘á»ƒ tá»± Ä‘á»™ng thÃªm vÃ o SY_FormatFields
    DECLARE @FieldName NVARCHAR(128);
    DECLARE @SysTypeName NVARCHAR(128);
    DECLARE @OrderNo INT;
    
    DECLARE cur CURSOR FOR 
    SELECT name, system_type_name, column_ordinal FROM @Columns ORDER BY column_ordinal;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @FieldName, @SysTypeName, @OrderNo;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- PhÃ¢n tÃ­ch Type SQL Ä‘á»ƒ gÃ¡n FormatID (Control) cÆ¡ báº£n cho frontend
        DECLARE @ParsedFormat VARCHAR(2) = 't'; -- Máº·c Ä‘á»‹nh lÃ  text (t)
        IF @SysTypeName LIKE '%int%' OR @SysTypeName LIKE '%decimal%' OR @SysTypeName LIKE '%numeric%' OR @SysTypeName LIKE '%float%' OR @SysTypeName LIKE '%money%'
            SET @ParsedFormat = 'n'; -- number
        ELSE IF @SysTypeName LIKE '%date%' OR @SysTypeName LIKE '%time%'
            SET @ParsedFormat = 'd'; -- date
        ELSE IF @SysTypeName LIKE '%bit%'
            SET @ParsedFormat = 'c'; -- checkbox

        -- Kiá»ƒm tra xem field Ä‘Ã£ cÃ³ trong SY_FormatFields chÆ°a
        IF NOT EXISTS (SELECT 1 FROM SY_FormatFields WHERE FormName = @FormName AND FieldName = @FieldName)
        BEGIN
            -- Gá»i API_LuuTruongGiaoDien hiá»‡n cÃ³ Ä‘á»ƒ thÃªm má»›i field, Ä‘áº£m báº£o logic máº£ng (Hide/Add/Lock) bÃªn SY_FrmLstTbl cÅ©ng cháº¡y Ä‘Ãºng
            EXEC API_LuuTruongGiaoDien 
                @FormName = @FormName,
                @FieldName = @FieldName,
                @CaptionVN = @FieldName, -- Láº¥y tÃªn cá»™t lÃ m nhÃ£n tiáº¿ng Viá»‡t táº¡m
                @FormatID = @ParsedFormat,
                @FormPosition = 'grid',  -- Máº·c Ä‘á»‹nh á»Ÿ dáº¡ng lÆ°á»›i (grid)
                @ShowInAdd = 1,
                @ShowInEdit = 1,
                @IsReadOnlyEdit = 0,
                @IsReadOnlyAdd = 0,
                @NoResult = 1; -- áº¨n output cá»§a SP con Ä‘á»ƒ trÃ¡nh crash
            
            -- Cáº­p nháº­t thÃªm OrderNo Ä‘á»ƒ giá»¯ thá»© tá»± giá»‘ng há»‡t trong Procedure (vÃ¬ API_LuuTruongGiaoDien chÆ°a cÃ³ nháº­n OrderNo)
            UPDATE SY_FormatFields 
            SET OrderNo = @OrderNo 
            WHERE FormName = @FormName AND FieldName = @FieldName;
        END

        FETCH NEXT FROM cur INTO @FieldName, @SysTypeName, @OrderNo;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;

    -- Cuá»‘i cÃ¹ng tráº£ vá» danh sÃ¡ch cÃ¡c trÆ°á»ng giao diá»‡n (cáº£ cÅ© láº«n má»›i Ä‘Æ°á»£c thÃªm)
    EXEC API_LayCacTruongGiaoDien @FormName = @FormName;
END
GO

GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_Gateway_Router] - TRáº M Äá»ŠNH TUYáº¾N TRUNG TÃ‚M
-- Äá»c cáº¥u hÃ¬nh tá»« báº£ng WA_API Ä‘á»ƒ gá»i cÃ¡c thá»§ tá»¥c tÆ°Æ¡ng á»©ng.
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_Gateway_Router]
    @List VARCHAR(50),               -- VÃ­ dá»¥: 'Customer', 'ComboNhanVien'
    @Func VARCHAR(50) = 'View',      -- VÃ­ dá»¥: 'View', 'Save', 'Delete'
    @UserName VARCHAR(50) = '',      -- TÃªn user láº¥y tá»« Frontend/Session
    @Keyword NVARCHAR(200) = '',     -- Tham sá»‘ tÃ¬m kiáº¿m chung
    @Page INT = 1,
    @Limit INT = 20,
    @JsonData NVARCHAR(MAX) = '',    -- DÃ¹ng cho cÃ¡c hÃ m Save/Update cÃ³ body phá»©c táº¡p
    @SortColumn VARCHAR(50) = '',    -- Cá»™t cáº§n sáº¯p xáº¿p
    @SortDir VARCHAR(10) = ''        -- Chiá»u sáº¯p xáº¿p (ASC/DESC)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetStore NVARCHAR(200);
    DECLARE @ParaTemplate NVARCHAR(MAX);
    
    -- 1. Tra cá»©u cáº¥u hÃ¬nh tá»« báº£ng WA_API
    SELECT @TargetStore = LTRIM(RTRIM([SQL])), 
           @ParaTemplate = LTRIM(RTRIM(ISNULL(Para, '')))
    FROM WA_API
    WHERE list = @List AND func = @Func;

    -- Kiá»ƒm tra náº¿u API chÆ°a Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a
    IF @TargetStore IS NULL OR @TargetStore = ''
    BEGIN
        SELECT -1 AS code, N'Lá»—i: ChÆ°a Ä‘á»‹nh nghÄ©a API [' + @List + '] - HÃ nh Ä‘á»™ng: [' + @Func + '] trong báº£ng WA_API!' AS msg;
        RETURN;
    END

    -- 2. Láº¥y Context cá»§a há»‡ thá»‘ng dá»±a theo UserName (Phá»¥c vá»¥ PhÃ¢n quyá»n RLS)
    DECLARE @UserGroup VARCHAR(50) = '';
    DECLARE @BranchID NVARCHAR(MAX) = ''; -- TÄƒng kÃ­ch thÆ°á»›c Ä‘á»ƒ chá»©a nhiá»u chi nhÃ¡nh
    DECLARE @ManagerID VARCHAR(50) = '';
    DECLARE @EmployeeID VARCHAR(50) = '';
    
    IF ISNULL(@UserName, '') <> ''
    BEGIN
        -- MÃ³c toÃ n bá»™ thÃ´ng tin ngá»¯ cáº£nh tá»« báº£ng tÃ i khoáº£n cá»‘t lÃµi (SY_User)
        SELECT 
            @UserGroup = UserGroupID, 
            @BranchID = BranchID,
            @ManagerID = ManagerID,
            @EmployeeID = EmployeeID
        FROM SY_User 
        WHERE UserName = @UserName;
    END

    -- Xá»­ lÃ½ bá»™ lá»c Chi nhÃ¡nh tá»« UI
    IF ISNULL(@JsonData, '') <> '' AND ISJSON(@JsonData) = 1
    BEGIN
        DECLARE @UI_BranchID NVARCHAR(MAX);
        SELECT @UI_BranchID = CAST(JSON_VALUE(@JsonData, '$.BranchID') AS NVARCHAR(MAX));
        
        IF @UI_BranchID IS NOT NULL AND @UI_BranchID <> ''
        BEGIN
            -- Náº¿u lÃ  Admin hoáº·c tÃ i khoáº£n khÃ´ng bá»‹ giá»›i háº¡n Chi nhÃ¡nh
            IF (ISNULL(@BranchID, '') = '' OR @UserGroup = 'Admin') 
            BEGIN
                SET @BranchID = @UI_BranchID;
            END
            ELSE
            BEGIN
                -- Náº¿u tÃ i khoáº£n bá»‹ giá»›i háº¡n chi nhÃ¡nh, láº¥y pháº§n giao nhau giá»¯a UI gá»­i lÃªn vÃ  quyá»n Ä‘Æ°á»£c phÃ©p
                DECLARE @ValidBranches NVARCHAR(MAX) = '';
                SELECT @ValidBranches = @ValidBranches + LTRIM(RTRIM(value)) + ','
                FROM STRING_SPLIT(@UI_BranchID, ',')
                WHERE LTRIM(RTRIM(value)) IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','));
                
                IF LEN(@ValidBranches) > 0
                    SET @BranchID = LEFT(@ValidBranches, LEN(@ValidBranches) - 1);
            END
        END
    END

    -- 3. Xá»­ lÃ½ Äáº¯p tham sá»‘ (Replace Placeholders)
    -- CHÃš Ã Cáº¤U HÃŒNH TRONG DB: Náº¿u biáº¿n lÃ  chuá»—i, pháº£i cÃ³ dáº¥u nhÃ¡y Ä‘Æ¡n bao quanh. VÃ­ dá»¥: '{User}', N'{Keyword}', {Page}
    
    -- 3.1. Thay tháº¿ cÃ¡c biáº¿n Server-side Context (Báº£o máº­t tuyá»‡t Ä‘á»‘i, Frontend khÃ´ng can thiá»‡p Ä‘Æ°á»£c)
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{User}', REPLACE(ISNULL(@UserName, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{UserName}', REPLACE(ISNULL(@UserName, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{UserGroup}', REPLACE(ISNULL(@UserGroup, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{BranchID}', REPLACE(ISNULL(@BranchID, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{ManagerID}', REPLACE(ISNULL(@ManagerID, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{EmployeeID}', REPLACE(ISNULL(@EmployeeID, ''), '''', ''''''));
    
    -- 3.2. Thay tháº¿ cÃ¡c biáº¿n Request tá»« Frontend
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{List}', REPLACE(ISNULL(@List, ''), '''', ''''''));
    
    -- BÆ¯á»šC Äá»˜T PHÃ Má»šI: Æ¯U TIÃŠN 1 - Tá»° Äá»˜NG MAP Táº¤T Cáº¢ Tá»ª JSON
    IF ISNULL(@JsonData, '') <> '' AND ISJSON(@JsonData) = 1
    BEGIN
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, '{' + [key] + '}', REPLACE(ISNULL(CAST([value] AS NVARCHAR(MAX)), ''), '''', ''''''))
        FROM OPENJSON(@JsonData);
    END
    
    -- Æ¯U TIÃŠN 2: FALLBACK (Dá»° PHÃ’NG CÃC BIáº¾N Cá»¨NG Tá»ª C# Náº¾U CHÆ¯A ÄÆ¯á»¢C MAP Bá»žI JSON)
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Keyword}', REPLACE(ISNULL(@Keyword, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{SortColumn}', REPLACE(ISNULL(@SortColumn, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{SortDir}', REPLACE(ISNULL(@SortDir, ''), '''', ''''''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Page}', ISNULL(CAST(@Page AS VARCHAR), ''));
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{Limit}', ISNULL(CAST(@Limit AS VARCHAR), ''));
    
    -- Cuá»‘i cÃ¹ng, Replace chÃ­nh cÃ¡i cá»¥c JsonData náº¿u API Ä‘Ã­ch cáº§n Ä‘á»c cáº£ cá»¥c
    SET @ParaTemplate = REPLACE(@ParaTemplate, '{JsonData}', REPLACE(ISNULL(@JsonData, ''), '''', ''''''));

    -- 4. Dá»ŒN Dáº¸P CÃC BIáº¾N KHÃ”NG ÄÆ¯á»¢C TRUYá»€N (GIÃ TRá»Š VáºªN LÃ€ '{TenBien}')
    IF OBJECT_ID(@TargetStore) IS NOT NULL
    BEGIN
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, name + '=''{' + SUBSTRING(name, 2, LEN(name)) + '}''', '')
        FROM sys.parameters WHERE object_id = OBJECT_ID(@TargetStore);
        
        -- Dá»n dáº¹p vá»›i tiá»n tá»‘ N (náº¿u cÃ³)
        SELECT @ParaTemplate = REPLACE(@ParaTemplate, name + '=N''{' + SUBSTRING(name, 2, LEN(name)) + '}''', '')
        FROM sys.parameters WHERE object_id = OBJECT_ID(@TargetStore);
    END
    
    -- XÃ³a rÃ¡c (dáº¥u pháº©y thá»«a)
    WHILE CHARINDEX(', ,', @ParaTemplate) > 0 SET @ParaTemplate = REPLACE(@ParaTemplate, ', ,', ',');
    IF LEFT(LTRIM(@ParaTemplate), 1) = ',' SET @ParaTemplate = LTRIM(SUBSTRING(LTRIM(@ParaTemplate), 2, LEN(@ParaTemplate)));
    IF RIGHT(RTRIM(@ParaTemplate), 1) = ',' SET @ParaTemplate = RTRIM(SUBSTRING(RTRIM(@ParaTemplate), 1, LEN(RTRIM(@ParaTemplate)) - 1));

    -- 5. Cháº¡y cÃ¢u lá»‡nh hoÃ n chá»‰nh
    DECLARE @FinalSQL NVARCHAR(MAX);
    
    -- RÃ¡p lá»‡nh EXEC
    IF @ParaTemplate <> ''
        SET @FinalSQL = 'EXEC ' + QUOTENAME(@TargetStore) + ' ' + @ParaTemplate;
    ELSE
        SET @FinalSQL = 'EXEC ' + QUOTENAME(@TargetStore);

    -- DÃ²ng nÃ y dÃ¹ng Ä‘á»ƒ debug khi anh test báº±ng SQL Management Studio (SSMS)
    -- PRINT N'Äang thá»±c thi lá»‡nh: ' + @FinalSQL;

    -- 5. Thá»±c thi lá»‡nh
    BEGIN TRY
        EXEC(@FinalSQL);
    END TRY
    BEGIN CATCH
        -- Không trả câu lệnh đã nội suy hoặc dữ liệu request về client.
        -- Chi tiết đầy đủ chỉ được ghi ở server log/SSMS khi vận hành.
        SELECT -1 AS code,
               N'API gateway execution failed.' AS msg,
               ERROR_NUMBER() AS error_number,
               ERROR_LINE() AS error_line;
    END CATCH
END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_LayCacTruongGiaoDien]
    @FormName VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ff.FieldName AS [name], 
        ff.CaptionVN AS [label],
        ISNULL(ff.IsRequired, 0) AS [required], 
        ISNULL(ff.FormPosition, 'grid') AS [position],
        
        -- Tráº£ vá» thÃªm cáº¥u hÃ¬nh cáº¥p Ä‘á»™ Form Ä‘á»ƒ loáº¡i bá» hoÃ n toÃ n AppModules.js
        ISNULL(l.PrimaryKey, '') AS [primaryKey],
        
        ISNULL(ff.ShowInAdd,      1) AS [showInAdd],
        ISNULL(ff.ShowInEdit,     1) AS [showInEdit],
        ISNULL(ff.IsReadOnlyEdit, 0) AS [isReadOnlyEdit],
        ISNULL(ff.IsReadOnlyAdd,  0) AS [isReadOnlyAdd],

        ISNULL(ff.FormatID, '') AS [renderRule],
        ISNULL(ff.DataSource, '') AS [dataSource],
        ISNULL(ff.OrderNo, 0) AS [orderNo],
        ISNULL(ff.ValidateRule, '') AS [validateRule],
        ISNULL(ff.DependsOn, '') AS [dependsOn],
        ISNULL(ff.VisibleRule, '') AS [visibleRule],
        ISNULL(ff.ShowInFilter, 0) AS [showInFilter]
    FROM SY_FormatFields ff
    LEFT JOIN SY_FrmLstTbl l ON ff.FormName = l.FormID
    WHERE (@FormName IS NULL OR ff.FormName = @FormName)
    ORDER BY ISNULL(ff.OrderNo, 0) ASC, ff.FieldName ASC;
END
GO

-- Lá»‡nh cháº¡y thá»­:
-- EXEC [dbo].[API_LayCacTruongGiaoDien] @FormName = 'frmCustomer';

GO

USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- API: Láº¥y danh sÃ¡ch ChÃº thÃ­ch Lá»‹ch (Legend) dá»±a trá»±c tiáº¿p trÃªn dá»¯ liá»‡u tháº­t cá»§a DB
-- Pháº£n Ã¡nh sá»‘ lÆ°á»£ng thá»±c táº¿ tá»« cÃ¡c báº£ng tbmk_Biennhancoccho vÃ  tbmk_Hopdong
-- =============================================
CREATE PROCEDURE [dbo].[API_LayChuThichLich]
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Äáº¿m sá»‘ lÆ°á»£ng tiá»‡c má»›i cá»c (chÆ°a lÃªn há»£p Ä‘á»“ng, chÆ°a há»§y) tá»« báº£ng tbmk_Biennhancoccho
    DECLARE @CocCount INT = 0;
    SELECT @CocCount = COUNT(*) 
    FROM tbmk_Biennhancoccho 
    WHERE ISNULL(IsHuy, 0) = 0 AND ISNULL(IsKetthuc, 0) = 0;

    -- 2. Äáº¿m sá»‘ lÆ°á»£ng há»£p Ä‘á»“ng Ä‘Ã£ kÃ½ (chÆ°a há»§y) tá»« báº£ng tbmk_Hopdong
    DECLARE @HdCount INT = 0;
    SELECT @HdCount = COUNT(*) 
    FROM tbmk_Hopdong 
    WHERE ISNULL(IsHuy, 0) = 0;

    -- Tráº£ vá» káº¿t quáº£ legend Ä‘á»™ng hoÃ n toÃ n dá»±a vÃ o DB thá»±c táº¿
    SELECT 
        1 AS Id, 
        N'Má»›i Cá»c (' + CAST(@CocCount AS NVARCHAR(10)) + N')' AS Label, 
        'success' AS Color, 
        'dot' AS Type, 
        '' AS Icon
    UNION ALL
    SELECT 
        2 AS Id, 
        N'ÄÃ£ KÃ½ HÄ (' + CAST(@HdCount AS NVARCHAR(10)) + N')' AS Label, 
        'danger' AS Color, 
        'dot' AS Type, 
        '' AS Icon
END
GO

GO



/****** Object:  StoredProcedure [dbo].[API_LayDanhSachMenuTatCa] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LayDanhSachMenuTatCa]
    @NhomNguoiDangThaoTac NVARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MenuID AS [id],
        COALESCE(Parent, '') AS [parent],
        COALESCE(VN, '') AS [label],
        COALESCE(SubTitle, '') AS [subTitle],
        COALESCE(EN, '') AS [en],
        COALESCE(FormName, '') AS [formName],
        COALESCE(FormKey, '') AS [formKey],
        COALESCE(URLPara, '') AS [urlPara],
        COALESCE(IconClass, '') AS [icon],
        COALESCE(isDisable, 0) AS [isDisable]
    FROM WA_Menu
    ORDER BY MenuID ASC;
END
GO

GO



CREATE PROCEDURE [dbo].[API_LayDanhSachNhom]
AS
BEGIN
    SET NOCOUNT ON;

    -- Chọn lọc và đổi Tên cột (Alias) cho khớp với JSON Frontend (id, name, icon)
    SELECT 
        [UserGroupID] AS [id],
        [UserGroupName] AS [name]
    FROM [SY_UserGroup]
    WHERE COALESCE([IsDisable], 0) = 0 -- Bỏ qua các nhóm đã bị khóa (IsDisable = 1)
    ORDER BY [UserGroupID];
END
GO

GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- MÃ´ táº£: API Láº¥y giÃ¡ trá»‹ cÃ i Ä‘áº·t tá»« báº£ng SY_Setup
-- Tráº£ vá»: Com1 (tÃªn cÃ´ng ty) + menu_sync_ver (version Ä‘á»“ng bá»™ menu)
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[API_LayGiaTriSetup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [CodeID],
        [CodeValue]
    FROM [dbo].[SY_Setup]
    WHERE [CodeID] IN ('Com1', 'menu_sync_ver');
END
GO

GO


ALTER PROCEDURE [dbo].[API_LayMenuTheoNhomQuyen]
    @NhomNguoiDangThaoTac NVARCHAR(50), -- Báº®T BUá»˜C THÃŠM: ID NhÃ³m cá»§a ngÆ°á»i gá»i API
    @UserGroupID NVARCHAR(50)           -- ID NhÃ³m mÃ  ngÆ°á»i Ä‘Ã³ Cáº¦N XEM Menu
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================================
    -- BÆ¯á»šC 1: Cáº¢NH Vá»† Há»† THá»NG
    -- Chá»‰ cho phÃ©p 2 cá»­a: Hoáº·c lÃ  Tá»± soi cá»§a chÃ­nh tao (@NhomA = @NhomA), 
    -- Hoáº·c tao lÃ  Admin cÃ³ quyá»n soi ngÆ°á»i khÃ¡c (@NhomA = 'Admin')
    -- =========================================================================
    IF (@NhomNguoiDangThaoTac != @UserGroupID) AND (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        -- Háº¥t vÄƒng náº¿u: Tháº±ng Lá»… TÃ¢n (Káº» báº¥m nÃºt) Ä‘Ã²i lÃ´i DB hiá»ƒn thá»‹ CÃ¢y Menu cá»§a Admin
        RAISERROR (N'Lá»—i: Báº¡n khÃ´ng cÃ³ tháº©m quyá»n soi mÃ³i cáº¥u trÃºc PhÃ¢n Quyá»n cá»§a nhÃ¡nh khÃ¡c!', 16, 1);
        RETURN;
    END

    -- Váº¾ 1: Láº¤Y CÃC MENU "LÃ"
    SELECT 
        M.MenuID AS [id],
        M.Parent AS [parent],
        M.VN AS [label],            
        M.SubTitle AS [subTitle],
        M.IconClass AS [icon],
        M.FormName AS [formName],
        M.URLPara AS [URLPara],
        M.FormKey AS [formKey],
        P.IsRun, P.IsAdd, P.IsUpdate, P.IsDelete,
        P.isManager, P.isAdmin, P.isAutoLock, P.isHideAmount, P.isLockDoc, P.isUnLockDoc, P.isExportExcel
    FROM WA_Menu M
    INNER JOIN dbo.WA_UserGroupPermisstion P ON M.MenuID = P.MenuID
    WHERE COALESCE(M.isDisable, 0) = 0 
      AND P.IsRun = 1 
      AND P.UserGroupID = @UserGroupID

    UNION ALL 

    -- Váº¾ 2: Láº¤Y CÃC THÆ¯ Má»¤C "CHA"
    SELECT 
        M.MenuID AS [id],
        M.Parent AS [parent],
        M.VN AS [label],
        M.SubTitle AS [subTitle],
        M.IconClass AS [icon],
        M.FormName AS [formName],
        M.URLPara AS [URLPara],
        M.FormKey AS [formKey],
        1 AS IsRun, 0 AS IsAdd, 0 AS IsUpdate, 0 AS IsDelete,
        0 AS isManager, 0 AS isAdmin, 0 AS isAutoLock, 0 AS isHideAmount, 0 AS isLockDoc, 0 AS isUnLockDoc, 0 AS isExportExcel
    FROM WA_Menu M
    WHERE COALESCE(M.isDisable, 0) = 0 
      AND M.MenuID IN (
          SELECT Parent 
          FROM WA_Menu M_Child
          INNER JOIN dbo.WA_UserGroupPermisstion P_Child 
              ON M_Child.MenuID = P_Child.MenuID
          WHERE COALESCE(M_Child.isDisable, 0) = 0 
            AND P_Child.IsRun = 1 
            AND P_Child.UserGroupID = @UserGroupID
      )
      AND M.MenuID NOT IN (
          SELECT MenuID FROM dbo.WA_UserGroupPermisstion 
          WHERE IsRun = 1 AND UserGroupID = @UserGroupID
      )
    ORDER BY [id];
END
GO

GO

CREATE PROCEDURE API_LayPhienBanQuyen
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Ver nvarchar(50) = '';
    
    -- Láº¥y phiÃªn báº£n Ä‘á»“ng bá»™ tá»« báº£ng há»‡ thá»‘ng
    SELECT @Ver = CodeValue 
    FROM SY_Setup 
    WHERE CodeID = 'menu_sync_ver';
    
    -- Tráº£ vá» 1 dÃ²ng duy nháº¥t cho Frontend Ä‘á»c
    SELECT 
        0 AS [code], 
        'Success' AS [msg], 
        @Ver AS [version];
END
GO

GO

CREATE PROCEDURE API_LayQuyenCuaToi
    @Username varchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserGroupID varchar(50);
    
    -- Láº¥y NhÃ³m Quyá»n cá»§a NhÃ¢n viÃªn Ä‘ang Ä‘Äƒng nháº­p
    SELECT @UserGroupID = UserGroupID 
    FROM SY_User 
    WHERE UserName = @Username;
    
    -- Náº¿u khÃ´ng tÃ¬m tháº¥y user hoáº·c chÆ°a cÃ³ nhÃ³m, tráº£ vá» máº£ng rá»—ng
    IF @UserGroupID IS NULL
    BEGIN
        SELECT 0 AS [code], 'User not found' AS [msg];
        RETURN;
    END

    -- QuÃ©t toÃ n bá»™ quyá»n cá»§a NhÃ³m nÃ y vÃ  mÃ³c vá»›i TÃªn Menu
    -- Tráº£ vá» cho C# duyá»‡t vÃ  convert thÃ nh chuá»—i JSON { "frmStaff": { "CanAdd": 1, ... } }
    SELECT 
        M.FormName AS [FormName],
        M.VN AS [MenuName],
        M.URLPara AS [URLPara],
        M.FormKey AS [FormKey],
        ISNULL(P.IsRun, 0) AS CanView,
        ISNULL(P.IsAdd, 0) AS CanAdd,
        ISNULL(P.IsUpdate, 0) AS CanEdit,
        ISNULL(P.IsDelete, 0) AS CanDelete
    FROM WA_UserGroupPermisstion P
    INNER JOIN WA_Menu M ON P.MenuID = M.MenuID
    WHERE P.UserGroupID = @UserGroupID
      AND M.FormName IS NOT NULL AND M.FormName <> '';
    
END
GO

GO

USE [QLTiec]
GO

ALTER PROCEDURE [dbo].[API_LayQuyenNhomDayDu]
    @NhomNguoiDangThaoTac NVARCHAR(50),
    @UserGroupID           NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chá»‰ cho phÃ©p: tá»± soi chÃ­nh mÃ¬nh HOáº¶C Admin soi ngÆ°á»i khÃ¡c
    IF (@NhomNguoiDangThaoTac != @UserGroupID) AND (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        RAISERROR (N'Lá»—i: Báº¡n khÃ´ng cÃ³ tháº©m quyá»n xem phÃ¢n quyá»n cá»§a nhÃ³m nÃ y!', 16, 1);
        RETURN;
    END

    -- Váº¾ 1: Chá»‰ láº¥y menu lÃ¡ ÄÃƒ ÄÆ¯á»¢C Äá»’NG Bá»˜ vÃ o báº£ng Permission (INNER JOIN)
    SELECT
        M.MenuID        AS [id],
        M.Parent        AS [parent],
        M.VN            AS [label],
        M.IconClass     AS [icon],
        M.FormName      AS [formName],
        M.URLPara       AS [urlPara],
        ISNULL(P.IsRun,        0) AS IsRun,
        ISNULL(P.IsAdd,        0) AS IsAdd,
        ISNULL(P.IsUpdate,     0) AS IsUpdate,
        ISNULL(P.IsDelete,     0) AS IsDelete,
        ISNULL(P.isManager,    0) AS isManager,
        ISNULL(P.isAdmin,      0) AS isAdmin,
        ISNULL(P.isAutoLock,   0) AS isAutoLock,
        ISNULL(P.isHideAmount, 0) AS isHideAmount,
        ISNULL(P.isLockDoc,    0) AS isLockDoc,
        ISNULL(P.isUnLockDoc,  0) AS isUnLockDoc,
        ISNULL(P.isExportExcel,0) AS isExportExcel
    FROM WA_Menu M
    INNER JOIN WA_UserGroupPermisstion P        -- Äá»•i LEFT JOIN â†’ INNER JOIN
        ON M.MenuID = P.MenuID AND P.UserGroupID = @UserGroupID
    WHERE COALESCE(M.isDisable, 0) = 0
      AND COALESCE(M.URLPara, '') <> ''

    UNION ALL

    -- Váº¾ 2: Chá»‰ láº¥y thÆ° má»¥c cha cá»§a nhá»¯ng menu ÄÃƒ CÃ“ TRONG PERMISSION
    SELECT
        M.MenuID    AS [id],
        M.Parent    AS [parent],
        M.VN        AS [label],
        M.IconClass AS [icon],
        M.FormName  AS [formName],
        M.URLPara   AS [urlPara],
        1 AS IsRun, 0 AS IsAdd, 0 AS IsUpdate, 0 AS IsDelete,
        0 AS isManager, 0 AS isAdmin, 0 AS isAutoLock, 0 AS isHideAmount,
        0 AS isLockDoc, 0 AS isUnLockDoc, 0 AS isExportExcel
    FROM WA_Menu M
    WHERE COALESCE(M.isDisable, 0) = 0
      AND COALESCE(M.URLPara, '') = ''
      AND M.MenuID IN (
          -- Chá»‰ láº¥y folder cha cá»§a menu con ÄÃƒ CÃ“ TRONG báº£ng Permission
          SELECT DISTINCT Parent FROM WA_Menu
          WHERE COALESCE(isDisable, 0) = 0
            AND COALESCE(URLPara, '') <> ''
            AND Parent IS NOT NULL AND Parent <> ''
            AND MenuID IN (
                SELECT MenuID FROM WA_UserGroupPermisstion
                WHERE UserGroupID = @UserGroupID
            )
      )

    ORDER BY [id];
END
GO

GO

IF OBJECT_ID('API_LuuCauHinhForm', 'P') IS NOT NULL
    DROP PROCEDURE API_LuuCauHinhForm;
GO

CREATE PROCEDURE API_LuuCauHinhForm
    @FormID varchar(50),
    @CaptionVN nvarchar(200) = NULL,
    @SubTitle nvarchar(200) = NULL,
    @PrimaryKey varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiá»ƒm tra xem FormID Ä‘Ã£ tá»“n táº¡i trong SY_FrmLstTbl chÆ°a
    IF EXISTS (SELECT 1 FROM SY_FrmLstTbl WHERE FormID = @FormID)
    BEGIN
        -- Cáº­p nháº­t thÃ´ng tin cáº¥u hÃ¬nh chung cá»§a Form
        UPDATE SY_FrmLstTbl
        SET 
            CaptionVN = ISNULL(@CaptionVN, CaptionVN),
            SubTitle = ISNULL(@SubTitle, SubTitle),
            PrimaryKey = ISNULL(@PrimaryKey, PrimaryKey)
        WHERE FormID = @FormID;
    END
    ELSE
    BEGIN
        -- Náº¿u lÃ  Form má»›i, táº¡o dÃ²ng má»›i
        INSERT INTO SY_FrmLstTbl (FormID, CaptionVN, SubTitle, PrimaryKey)
        VALUES (@FormID, @CaptionVN, @SubTitle, @PrimaryKey);
    END

    -- Tráº£ vá» dá»¯ liá»‡u vá»«a lÆ°u
    SELECT FormID, CaptionVN, SubTitle, PrimaryKey
    FROM SY_FrmLstTbl 
    WHERE FormID = @FormID;
END
GO

GO

IF OBJECT_ID('API_LuuDong', 'P') IS NOT NULL
    DROP PROCEDURE API_LuuDong;
GO

CREATE PROCEDURE [dbo].[API_LuuDong]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX), -- Chuá»—i JSON chá»©a dá»¯ liá»‡u cáº§n lÆ°u
    @UserName VARCHAR(50) = '' -- User thá»±c hiá»‡n lÆ°u/sá»­a
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName VARCHAR(100);
    DECLARE @PrimaryKey VARCHAR(100);
    
    -- Láº¥y thÃ´ng tin Báº£ng vÃ  KhÃ³a chÃ­nh (Tá»± Ä‘á»™ng thÃ­ch á»©ng náº¿u chÆ°a cÃ³ cá»™t SaveTableName trong SY_FrmLstTbl)
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SY_FrmLstTbl') AND name = 'SaveTableName')
    BEGIN
        DECLARE @SqlCheck NVARCHAR(MAX) = 
            N'SELECT @TN = COALESCE(SaveTableName, TableName), @PK = PrimaryKey FROM SY_FrmLstTbl WHERE FormID = @Form';
        EXEC sp_executesql @SqlCheck, 
            N'@TN VARCHAR(100) OUTPUT, @PK VARCHAR(100) OUTPUT, @Form VARCHAR(50)', 
            @TN = @TableName OUTPUT, @PK = @PrimaryKey OUTPUT, @Form = @List;
    END
    ELSE
    BEGIN
        SELECT 
            @TableName = TableName,
            @PrimaryKey = PrimaryKey
        FROM SY_FrmLstTbl 
        WHERE FormID = @List;
    END

    IF @TableName IS NULL OR @TableName = ''
    BEGIN
        SELECT -1 AS code, N'ChÆ°a cáº¥u hÃ¬nh TableName cho form ' + @List AS msg;
        RETURN;
    END

    -- Tá»± Ä‘á»™ng táº¡o cá»™t khÃ³a chÃ­nh (UserAutoID) náº¿u chÆ°a tá»“n táº¡i trong báº£ng váº­t lÃ½
    IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
       AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND LOWER(name) = LOWER(@PrimaryKey))
    BEGIN
        IF LOWER(@PrimaryKey) = 'userautoid'
        BEGIN
            BEGIN TRY
                DECLARE @AlterSql NVARCHAR(MAX);
                -- 1. ThÃªm cá»™t
                SET @AlterSql = N'ALTER TABLE ' + QUOTENAME(@TableName) + N' ADD ' + QUOTENAME(@PrimaryKey) + N' VARCHAR(50) NULL;';
                EXEC sp_executesql @AlterSql;

                -- 2. Táº¡o default constraint
                DECLARE @ConstraintName VARCHAR(150) = 'DF_' + REPLACE(REPLACE(REPLACE(@TableName, '.', '_'), '[', ''), ']', '') + '_' + @PrimaryKey;
                SET @AlterSql = N'ALTER TABLE ' + QUOTENAME(@TableName) + N' ADD CONSTRAINT ' + QUOTENAME(@ConstraintName) + N' DEFAULT (REPLACE(CONVERT(VARCHAR(50), NEWID()), ''-'', '''')) FOR ' + QUOTENAME(@PrimaryKey) + N';';
                EXEC sp_executesql @AlterSql;

                -- 3. Cáº­p nháº­t dá»¯ liá»‡u cÅ©
                SET @AlterSql = N'UPDATE ' + QUOTENAME(@TableName) + N' SET ' + QUOTENAME(@PrimaryKey) + N' = REPLACE(CONVERT(VARCHAR(50), NEWID()), ''-'', '''') WHERE ' + QUOTENAME(@PrimaryKey) + N' IS NULL;';
                EXEC sp_executesql @AlterSql;
            END TRY
            BEGIN CATCH
                -- Ghi nháº­n lá»—i nhÆ°ng khÃ´ng cháº·n luá»“ng cháº¡y chÃ­nh
                PRINT 'Loi tu dong them UserAutoID: ' + ERROR_MESSAGE();
            END CATCH
        END
    END

    -- Chuáº©n hÃ³a casing cá»§a KhÃ³a chÃ­nh theo báº£ng váº­t lÃ½ (trÃ¡nh lá»—i Case-Sensitive)
    DECLARE @ExactPK VARCHAR(100);
    SELECT TOP 1 @ExactPK = name 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(@TableName) 
      AND LOWER(name) = LOWER(@PrimaryKey);
      
    IF @ExactPK IS NOT NULL
        SET @PrimaryKey = @ExactPK;

    BEGIN TRY
        DECLARE @IsEdit INT = ISNULL(CAST(JSON_VALUE(@Data, '$.IsEdit') AS INT), 0);
        DECLARE @SQL NVARCHAR(MAX) = '';

        -- =========================================================
        -- Báº¢O Máº¬T: Kiá»ƒm tra quyá»n ThÃªm/Sá»­a tá»« WA_UserGroupPermisstion
        -- =========================================================
        IF @UserName <> 'Admin'
        BEGIN
            DECLARE @HasPermission INT = 0;
            DECLARE @UserGrp VARCHAR(50);
            DECLARE @MenuID VARCHAR(50);

            -- Láº¥y NhÃ³m cá»§a tÃ i khoáº£n Ä‘ang thao tÃ¡c
            SELECT @UserGrp = UserGroupID FROM SY_User WHERE UserName = @UserName;
            
            -- Láº¥y mÃ£ Menu gáº¯n vá»›i FormName (@List)
            SELECT TOP 1 @MenuID = MenuID FROM WA_Menu WHERE FormName = @List;

            -- Chá»‰ kiá»ƒm tra náº¿u Form nÃ y cÃ³ Ä‘Äƒng kÃ½ trÃªn Menu
            IF @MenuID IS NOT NULL AND @UserGrp IS NOT NULL
            BEGIN
                IF @IsEdit = 0 -- ThÃªm má»›i
                    SELECT @HasPermission = IsAdd FROM WA_UserGroupPermisstion WHERE UserGroupID = @UserGrp AND MenuID = @MenuID;
                ELSE -- Cáº­p nháº­t
                    SELECT @HasPermission = IsUpdate FROM WA_UserGroupPermisstion WHERE UserGroupID = @UserGrp AND MenuID = @MenuID;

                IF ISNULL(@HasPermission, 0) = 0
                BEGIN
                    SELECT -1 AS code, N'Lá»—i báº£o máº­t (RBAC): Báº¡n khÃ´ng cÃ³ quyá»n ' + (CASE WHEN @IsEdit = 0 THEN N'ThÃªm má»›i' ELSE N'Cáº­p nháº­t' END) + N' á»Ÿ chá»©c nÄƒng nÃ y!' AS msg;
                    RETURN;
                END
            END
        END
        -- =========================================================

        
        -- 1. Lá»c cÃ¡c cá»™t há»£p lá»‡ tá»« JSON (Bá» qua cÃ¡c cá»™t há»‡ thá»‘ng do FE Ä‘áº©y xuá»‘ng)
        -- Sá»­ dá»¥ng JOIN vá»›i sys.columns (so sÃ¡nh khÃ´ng phÃ¢n biá»‡t hoa thÆ°á»ng) Ä‘á»ƒ láº¥y Ä‘Ãºng casing váº­t lÃ½
        SELECT 
            c.name AS ColumnName, 
            jd.[value] AS ColumnValue,
            CAST(jd.[type] AS INT) AS JsonType
        INTO #JsonDataRaw
        FROM OPENJSON(@Data) jd
        JOIN sys.columns c ON c.object_id = OBJECT_ID(@TableName) AND LOWER(c.name) = LOWER(jd.[key]) COLLATE DATABASE_DEFAULT
        WHERE jd.[key] COLLATE DATABASE_DEFAULT NOT LIKE '\_%' ESCAPE '\'  -- Bá» qua cÃ¡c key há»‡ thá»‘ng báº¯t Ä‘áº§u báº±ng _
          AND LOWER(jd.[key]) COLLATE DATABASE_DEFAULT NOT IN ('isedit', 'username'); -- Bá» qua flag há»‡ thá»‘ng FE gá»­i xuá»‘ng

        -- 2. Káº¿t há»£p vá»›i kiá»ƒu dá»¯ liá»‡u cá»§a cá»™t Ä‘á»ƒ tá»± Ä‘á»™ng Ä‘á»‹nh dáº¡ng / chuyá»ƒn Ä‘á»•i thÃ´ng minh
        SELECT 
            jd.ColumnName,
            jd.ColumnValue,
            jd.JsonType,
            t.name AS DataType
        INTO #JsonData
        FROM #JsonDataRaw jd
        JOIN sys.columns c ON c.object_id = OBJECT_ID(@TableName) AND c.name = jd.ColumnName
        JOIN sys.types t ON c.user_type_id = t.user_type_id;

        -- 2.1. Äá»‘i vá»›i cÃ¡c cá»™t sá»‘ hoáº·c ngÃ y thÃ¡ng, náº¿u giÃ¡ trá»‹ truyá»n vÃ o lÃ  chuá»—i rá»—ng thÃ¬ chuyá»ƒn thÃ nh NULL
        -- (TrÃ¡nh lá»—i: Conversion failed khi chÃ¨n chuá»—i rá»—ng '' vÃ o cá»™t INT hoáº·c TIME/DATETIME)
        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE LTRIM(RTRIM(ISNULL(ColumnValue, ''))) = ''
          AND DataType IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money', 'smallmoney', 
                           'date', 'datetime', 'datetime2', 'smalldatetime', 'time', 'datetimeoffset');

        -- 2.1b. Vá»›i cá»™t tinyint (0-255): náº¿u giÃ¡ trá»‹ Ã¢m (nhÆ° -1) thÃ¬ chuyá»ƒn thÃ nh NULL Ä‘á»ƒ trÃ¡nh arithmetic overflow
        UPDATE #JsonData
        SET JsonType = 0, ColumnValue = NULL
        WHERE DataType = 'tinyint'
          AND ISNUMERIC(ColumnValue) = 1
          AND TRY_CAST(ColumnValue AS FLOAT) < 0;

        -- 2.2. Äá»‘i vá»›i cÃ¡c cá»™t kiá»ƒu TIME/DATETIME, náº¿u ngÆ°á»i dÃ¹ng chá»‰ gÃµ sá»‘ giá» (vÃ­ dá»¥: '12' hoáº·c '8'), 
        -- tá»± Ä‘á»™ng format vá» dáº¡ng giá» chuáº©n '12:00' hoáº·c '08:00' Ä‘á»ƒ SQL Server khÃ´ng bá»‹ lá»—i cast.
        UPDATE #JsonData
        SET ColumnValue = RIGHT('0' + LTRIM(RTRIM(ColumnValue)), 2) + ':00'
        WHERE DataType IN ('time', 'datetime', 'smalldatetime', 'datetime2')
          AND ColumnValue IS NOT NULL
          AND ISNUMERIC(ColumnValue) = 1
          -- Chá»‰ nháº­n sá»‘ nguyÃªn giá» tá»« 0 Ä‘áº¿n 23
          AND CAST(ColumnValue AS FLOAT) BETWEEN 0 AND 23
          AND CHARINDEX('.', ColumnValue) = 0
          -- KhÃ´ng chá»©a kÃ½ tá»± phÃ¢n tÃ¡ch thá»i gian/ngÃ y thÃ¡ng thÃ´ng thÆ°á»ng
          AND CHARINDEX(':', ColumnValue) = 0
          AND CHARINDEX('-', ColumnValue) = 0
          AND CHARINDEX('/', ColumnValue) = 0;

        -- 3. ThÃªm thÃ´ng tin Audit náº¿u cá»™t cÃ³ trong báº£ng váº­t lÃ½
        IF @IsEdit = 0 -- THÃŠM Má»šI (INSERT)
        BEGIN
            -- Tá»± Ä‘á»™ng sinh khÃ³a chÃ­nh náº¿u lÃ  kiá»ƒu chuá»—i, khÃ´ng tá»± tÄƒng (IsIdentity = 0) vÃ  chÆ°a cÃ³ giÃ¡ trá»‹ há»£p lá»‡
            IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
               AND COLUMNPROPERTY(OBJECT_ID(@TableName), @PrimaryKey, 'IsIdentity') = 0
            BEGIN
                DECLARE @PKType VARCHAR(50);
                SELECT TOP 1 @PKType = t.name 
                FROM sys.columns c
                JOIN sys.types t ON c.user_type_id = t.user_type_id
                WHERE c.object_id = OBJECT_ID(@TableName) AND c.name = @PrimaryKey;

                IF @PKType IN ('varchar', 'nvarchar', 'char', 'nchar', 'uniqueidentifier')
                BEGIN
                    -- Náº¿u chÆ°a cÃ³ hoáº·c giÃ¡ trá»‹ bá»‹ trá»‘ng/NULL
                    IF NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = @PrimaryKey AND ColumnValue IS NOT NULL AND LTRIM(RTRIM(ColumnValue)) <> '')
                    BEGIN
                        DELETE FROM #JsonData WHERE ColumnName = @PrimaryKey;
                        
                        -- Sinh GUID khÃ´ng cÃ³ dáº¥u gáº¡ch ngang (Ä‘á»ƒ khá»›p Ä‘á»™ dÃ i varchar)
                        INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                        VALUES (@PrimaryKey, REPLACE(CAST(NEWID() AS VARCHAR(50)), '-', ''), 1, @PKType);
                    END
                END
            END

            -- UserCreate / DateCreate
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserCreate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserCreate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateCreate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateCreate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateCreate', 'GETDATE()', -1, 'datetime');
            END

            -- UserUpdate / DateUpdate cÅ©ng cÃ³ thá»ƒ khá»Ÿi táº¡o lÃºc insert
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'UserUpdate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserUpdate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateUpdate')
               AND NOT EXISTS (SELECT 1 FROM #JsonData WHERE ColumnName = 'DateUpdate')
            BEGIN
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');
            END
        END
        ELSE -- Cáº¬P NHáº¬T (UPDATE)
        BEGIN
            -- KhÃ´ng bao giá» cáº­p nháº­t UserCreate vÃ  DateCreate khi sá»­a dÃ²ng
            DELETE FROM #JsonData WHERE ColumnName IN ('UserCreate', 'DateCreate');

            -- UserUpdate / DateUpdate (ghi Ä‘Ã¨ an toÃ n tá»« há»‡ thá»‘ng)
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UserUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'UserUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('UserUpdate', @UserName, 1, 'varchar');
            END

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DateUpdate')
            BEGIN
                DELETE FROM #JsonData WHERE ColumnName = 'DateUpdate';
                INSERT INTO #JsonData (ColumnName, ColumnValue, JsonType, DataType)
                VALUES ('DateUpdate', 'GETDATE()', -1, 'datetime');
            END
        END
        
        IF @IsEdit = 0 -- THÃŠM Má»šI (INSERT)
        BEGIN
            DECLARE @Cols NVARCHAR(MAX) = '';
            DECLARE @Vals NVARCHAR(MAX) = '';
            
            SELECT 
                @Cols = @Cols + CASE WHEN @Cols = '' THEN '' ELSE ', ' END + QUOTENAME(ColumnName),
                @Vals = @Vals + CASE WHEN @Vals = '' THEN '' ELSE ', ' END + 
                        CASE 
                            WHEN JsonType = 0 THEN 'NULL'
                            WHEN JsonType = -1 THEN ColumnValue
                            WHEN DataType IN ('varbinary', 'image', 'binary') THEN 
                                'CONVERT(VARBINARY(MAX), ''' + 
                                CASE WHEN ColumnValue LIKE '0x%' THEN '' ELSE '0x' END + 
                                REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                            ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + '''' 
                        END
            FROM #JsonData
            -- Loáº¡i bá» hoÃ n toÃ n khÃ³a chÃ­nh náº¿u lÃ  cá»™t IDENTITY (tá»± tÄƒng)
            WHERE COLUMNPROPERTY(OBJECT_ID(@TableName), ColumnName, 'IsIdentity') = 0;

            SET @SQL = 'INSERT INTO ' + QUOTENAME(@TableName) + ' (' + @Cols + ') VALUES (' + @Vals + ');';
        END
        ELSE -- Cáº¬P NHáº¬T (UPDATE)
        BEGIN
            DECLARE @UpdateSet NVARCHAR(MAX) = '';
            DECLARE @PKValue NVARCHAR(MAX) = '';
            
            SELECT @PKValue = ColumnValue FROM #JsonData WHERE ColumnName = @PrimaryKey;
            
            IF @PKValue IS NULL OR @PKValue = ''
            BEGIN
                SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y giÃ¡ trá»‹ KhÃ³a chÃ­nh (' + @PrimaryKey + N') Ä‘á»ƒ cáº­p nháº­t. Dá»¯ liá»‡u: ' + ISNULL(@Data, 'NULL') AS msg;
                RETURN;
            END

            SELECT 
                @UpdateSet = @UpdateSet + CASE WHEN @UpdateSet = '' THEN '' ELSE ', ' END + 
                             QUOTENAME(ColumnName) + ' = ' + 
                             CASE 
                                 WHEN JsonType = 0 THEN 'NULL'
                                 WHEN JsonType = -1 THEN ColumnValue
                                 WHEN DataType IN ('varbinary', 'image', 'binary') THEN 
                                     'CONVERT(VARBINARY(MAX), ''' + 
                                     CASE WHEN ColumnValue LIKE '0x%' THEN '' ELSE '0x' END + 
                                     REPLACE(ColumnValue, '''', '''''') + ''', 1)'
                                 ELSE 'N''' + REPLACE(ColumnValue, '''', '''''') + '''' 
                             END
            FROM #JsonData
            WHERE ColumnName <> @PrimaryKey;

            SET @SQL = 'UPDATE ' + QUOTENAME(@TableName) + ' SET ' + @UpdateSet + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' = N''' + REPLACE(@PKValue, '''', '''''') + ''';';
        END

        -- Cháº¡y cÃ¢u lá»‡nh sinh ra
        DECLARE @AppLockResource VARCHAR(255) = 'API_LuuDong_' + @TableName;
        EXEC sp_getapplock @Resource = @AppLockResource, @LockMode = 'Exclusive', @LockOwner = 'Session', @LockTimeout = 15000;
        
        EXEC sp_executesql @SQL;
        
        EXEC sp_releaseapplock @Resource = @AppLockResource, @LockOwner = 'Session';

        SELECT 0 AS code, N'LÆ°u thÃ nh cÃ´ng!' AS msg;
        
        DROP TABLE #JsonDataRaw;
        DROP TABLE #JsonData;
    END TRY
    BEGIN CATCH
        -- Giáº£i phÃ³ng lock náº¿u cÃ³ lá»—i xáº£y ra
        DECLARE @CatchLockName VARCHAR(255) = 'API_LuuDong_' + ISNULL(@TableName, '');
        IF APPLOCK_MODE('public', @CatchLockName, 'Session') <> 'NoLock'
            EXEC sp_releaseapplock @Resource = @CatchLockName, @LockOwner = 'Session';

        -- Báº«y lá»—i vÃ  in ra cÃ¢u lá»‡nh SQL Ä‘á»ƒ dá»… debug
        DECLARE @ErrMsg NVARCHAR(MAX) = ERROR_MESSAGE();
        SELECT -1 AS code, N'Lá»—i SQL: ' + @ErrMsg + N'. [SQL: ' + ISNULL(@SQL, '') + N']' AS msg;
        
        -- TrÃ¡nh lá»—i rÃ¡c khi drop table trong catch
        IF OBJECT_ID('tempdb..#JsonDataRaw') IS NOT NULL DROP TABLE #JsonDataRaw;
        IF OBJECT_ID('tempdb..#JsonData') IS NOT NULL DROP TABLE #JsonData;
    END CATCH
END
GO

GO

USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-19
-- Description: API LÆ°u (ThÃªm/Sá»­a) Há»£p Äá»“ng Tiá»‡c CÆ°á»›i (LoaiPhieu = 2)
-- =============================================
CREATE PROCEDURE [dbo].[API_LuuHopDong]
    @Sohopdong VARCHAR(50) = NULL OUTPUT, -- Náº¿u NULL: ThÃªm má»›i HÄ, NgÆ°á»£c láº¡i: Cáº­p nháº­t
    @Sobiennhan VARCHAR(20) = NULL,       -- ID BiÃªn nháº­n cá»c chá»—
    
    -- ThÃ´ng tin KhÃ¡ch hÃ ng (Táº¡o má»›i hoáº·c cáº­p nháº­t náº¿u cÃ³)
    @Makh VARCHAR(20) = NULL OUTPUT,
    @Tenchure NVARCHAR(255) = NULL,
    @Tencodau NVARCHAR(255) = NULL,
    @Dienthoai NVARCHAR(50) = NULL,
    @Diachi NVARCHAR(500) = NULL,
    @Mail NVARCHAR(100) = NULL,
    
    -- ThÃ´ng tin Há»£p Ä‘á»“ng Tiá»‡c
    @Ngayhopdong DATETIME = NULL,
    @Ngaytochuc DATETIME = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(10) = NULL,
    @Thoigianid VARCHAR(20) = NULL,      -- Ca tiá»‡c
    
    @SobanManchinhthuc INT = 0,
    @SobanManduphong INT = 0,
    @SobanChaychinhthuc INT = 0,
    @SobanChayduphong INT = 0,
    @TongSoBan DECIMAL(18,2) = 0,
    
    @Tongtienhopdong DECIMAL(18,2) = 0,
    @Sotiencoccho DECIMAL(18,2) = 0,
    @Sotiencochopdong DECIMAL(18,2) = 0,
    @Tongtiencoc DECIMAL(18,2) = 0,
    
    @Ghichu NVARCHAR(1000) = NULL,
    @Manv VARCHAR(20) = NULL,
    @UserCreate VARCHAR(20) = 'System',
    
    -- Danh sÃ¡ch Sáº£nh Ä‘áº·t (Dáº¡ng JSON: [{"Sanhtiecid":"S01", "IsSanhchinh": 1}, ...])
    @JsonSanhTiec NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Now DATETIME = GETDATE();

        -- ==========================================================
        -- 0. KIá»‚M TRA TRÃ™NG Lá»ŠCH Sáº¢NH (CONFLICT VALIDATION)
        -- ==========================================================
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            IF EXISTS (
                -- Kiá»ƒm tra trÃ¹ng vá»›i Há»£p Ä‘á»“ng khÃ¡c
                SELECT 1 
                FROM tbmk_Hopdong h
                INNER JOIN tbmk_Hopdongsanhtiec hs ON h.Sohopdong = hs.Sohopdong
                INNER JOIN OPENJSON(@JsonSanhTiec) j ON hs.Sanhtiecid = JSON_VALUE(j.value, '$.Sanhtiecid')
                WHERE h.Ngaytochuc = @Ngaytochuc 
                  AND h.Thoigianid = @Thoigianid
                  AND ISNULL(h.IsHuy, 0) = 0
                  AND h.Sohopdong != ISNULL(@Sohopdong, '')
                  
                UNION ALL
                
                -- Kiá»ƒm tra trÃ¹ng vá»›i Cá»c chá»— khÃ¡c (chÆ°a lÃªn Há»£p Ä‘á»“ng)
                SELECT 1 
                FROM tbmk_Biennhancoccho b
                INNER JOIN tbmk_Biennhancocchosanhtiec bs ON b.DocumentID = bs.DocumentID
                INNER JOIN OPENJSON(@JsonSanhTiec) j ON bs.Sanhtiecid = JSON_VALUE(j.value, '$.Sanhtiecid')
                WHERE b.Ngaytochuc = @Ngaytochuc 
                  AND b.Thoigianid = @Thoigianid
                  AND ISNULL(b.IsHuy, 0) = 0
                  AND ISNULL(b.IsKetthuc, 0) = 0
                  AND b.DocumentID != ISNULL(@Sobiennhan, '')
            )
            BEGIN
                ROLLBACK TRANSACTION;
                SELECT 0 AS [Success], N'Lá»—i: Sáº£nh báº¡n chá»n Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t hoáº·c cá»c trÆ°á»›c Ä‘Ã³ trong ca tiá»‡c nÃ y. Vui lÃ²ng kiá»ƒm tra láº¡i!' AS [Message], NULL AS [Sohopdong], NULL AS [Makh];
                RETURN;
            END
        END

        -- ==========================================================
        -- 1. Xá»¬ LÃ KHÃCH HÃ€NG (dmkhachhang)
        -- ==========================================================
        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            -- TÃ¬m khÃ¡ch hÃ ng Ä‘Ã£ cÃ³ theo SÄT trÆ°á»›c (trÃ¡nh táº¡o duplicate)
            IF (@Dienthoai IS NOT NULL AND @Dienthoai <> '')
            BEGIN
                SELECT TOP 1 @Makh = Makh
                FROM dmkhachhang
                WHERE Dienthoai = @Dienthoai
                  AND ISNULL(IsKhachhang, 0) = 1
                ORDER BY DateCreate ASC;  -- Láº¥y record cÅ© nháº¥t (gá»‘c)
            END

            -- KhÃ´ng tÃ¬m tháº¥y â†’ táº¡o má»›i
            IF (@Makh IS NULL OR @Makh = '')
            BEGIN
                SET @Makh = 'KH' + FORMAT(@Now, 'yyMMddHHmmss');

                INSERT INTO dmkhachhang (
                    Makh, Tenkh, Tenchure, Tencodau, Dienthoai, Diachi, Mail, 
                    IsKhachhang, DateCreate, UserCreate
                )
                VALUES (
                    @Makh, 
                    CASE 
                        WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                        ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                    END, 
                    @Tenchure, @Tencodau, @Dienthoai, @Diachi, @Mail, 
                    1, @Now, @UserCreate
                );
            END
            ELSE
            BEGIN
                -- TÃ¬m tháº¥y khÃ¡ch cÅ© â†’ cáº­p nháº­t thÃ´ng tin náº¿u cÃ³ thay Ä‘á»•i
                UPDATE dmkhachhang
                SET
                    Tenchure    = ISNULL(NULLIF(@Tenchure, ''), Tenchure),
                    Tencodau    = ISNULL(NULLIF(@Tencodau, ''), Tencodau),
                    Diachi      = ISNULL(NULLIF(@Diachi,   ''), Diachi),
                    Mail        = ISNULL(NULLIF(@Mail,     ''), Mail),
                    DateUpdate  = @Now,
                    UserUpdate  = @UserCreate
                WHERE Makh = @Makh;
            END
        END
        ELSE
        BEGIN
            UPDATE dmkhachhang
            SET 
                Tenkh = CASE 
                            WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                            ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                        END,
                Tenchure = @Tenchure,
                Tencodau = @Tencodau,
                Dienthoai = @Dienthoai,
                Diachi = @Diachi,
                Mail = @Mail,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Makh = @Makh;
        END

        -- ==========================================================
        -- 2. Xá»¬ LÃ Há»¢P Äá»’NG (tbmk_Hopdong)
        -- ==========================================================
        IF (@Sohopdong IS NULL OR @Sohopdong = '')
        BEGIN
            -- PhÃ¡t sinh mÃ£ Há»£p Äá»“ng (Max 20 chars)
            SET @Sohopdong = 'HD' + FORMAT(@Now, 'yyMMddHHmmss');

            INSERT INTO tbmk_Hopdong (
                Sohopdong, Sobiennhan, Ngayhopdong, Ngaytochuc, Nhamngay, Makh, Loaitiecid, Thoigianid,
                SobanManchinhthuc, SobanManduphong, SobanChaychinhthuc, SobanChayduphong, TongSoBan,
                Tongtienhopdong, Sotiencoccho, Sotiencochopdong, Tongtiencoc,
                Manv, Ghichu, IsHuy, IsKetthuc, DateCreate, UserCreate, GoiThucDonID
            )
            VALUES (
                @Sohopdong, @Sobiennhan, ISNULL(@Ngayhopdong, @Now), @Ngaytochuc, @Nhamngay, @Makh, @Loaitiecid, @Thoigianid,
                @SobanManchinhthuc, @SobanManduphong, @SobanChaychinhthuc, @SobanChayduphong, @TongSoBan,
                @Tongtienhopdong, @Sotiencoccho, @Sotiencochopdong, @Tongtiencoc,
                @Manv, @Ghichu, 0, 0, @Now, @UserCreate, ''
            );

            -- Cáº­p nháº­t tráº¡ng thÃ¡i phiáº¿u cá»c náº¿u cÃ³ truyá»n Sobiennhan
            IF (@Sobiennhan IS NOT NULL AND @Sobiennhan != '')
            BEGIN
                UPDATE tbmk_Biennhancoccho 
                SET IsKetthuc = 1, DateUpdate = @Now, UserUpdate = @UserCreate
                WHERE DocumentID = @Sobiennhan;
            END
        END
        ELSE
        BEGIN
            -- Cáº­p nháº­t Há»£p Äá»“ng
            UPDATE tbmk_Hopdong
            SET 
                Sobiennhan = @Sobiennhan,
                Makh = @Makh,
                Ngayhopdong = @Ngayhopdong,
                Ngaytochuc = @Ngaytochuc,
                Nhamngay = @Nhamngay,
                Loaitiecid = @Loaitiecid,
                Thoigianid = @Thoigianid,
                SobanManchinhthuc = @SobanManchinhthuc,
                SobanManduphong = @SobanManduphong,
                SobanChaychinhthuc = @SobanChaychinhthuc,
                SobanChayduphong = @SobanChayduphong,
                TongSoBan = @TongSoBan,
                Tongtienhopdong = @Tongtienhopdong,
                Sotiencoccho = @Sotiencoccho,
                Sotiencochopdong = @Sotiencochopdong,
                Tongtiencoc = @Tongtiencoc,
                Ghichu = @Ghichu,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Sohopdong = @Sohopdong;
        END

        -- ==========================================================
        -- 3. Xá»¬ LÃ CHI TIáº¾T Sáº¢NH TIá»†C (tbmk_Hopdongsanhtiec)
        -- ==========================================================
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            -- XÃ³a sáº£nh cÅ©
            DELETE FROM tbmk_Hopdongsanhtiec WHERE Sohopdong = @Sohopdong;

            -- Insert sáº£nh má»›i tá»« JSON
            INSERT INTO tbmk_Hopdongsanhtiec (
                UserAutoid, Sohopdong, Sanhtiecid, IsSanhchinh, 
                DateCreate, UserCreate
            )
            SELECT 
                NEWID(), 
                @Sohopdong, 
                JSON_VALUE(value, '$.Sanhtiecid'),
                ISNULL(CAST(JSON_VALUE(value, '$.IsSanhchinh') AS BIT), 0),
                @Now,
                @UserCreate
            FROM OPENJSON(@JsonSanhTiec);
        END

        COMMIT TRANSACTION;
        
        -- Tráº£ vá» káº¿t quáº£
        SELECT 1 AS [Success], N'LÆ°u Há»£p Ä‘á»“ng Tiá»‡c CÆ°á»›i thÃ nh cÃ´ng' AS [Message], @Sohopdong AS [Sohopdong], @Makh AS [Makh];
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 0 AS [Success], ERROR_MESSAGE() AS [Message], NULL AS [Sohopdong], NULL AS [Makh];
    END CATCH
END
GO

GO

USE [QLTiec]
GO

CREATE OR ALTER PROCEDURE [dbo].[API_LuuKhachDen]
    @DocumentID VARCHAR(50) = NULL,
    @Makh VARCHAR(50) = NULL,
    @Tenkh NVARCHAR(200) = NULL,
    @Dienthoai VARCHAR(50) = NULL,
    @Ngaytochuc DATE = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(50) = NULL,
    @Thoigianid VARCHAR(50) = NULL,
    @SobanMan INT = 0,
    @SobanChay INT = 0,
    @Ghichu NVARCHAR(500) = NULL,
    @GoiThucDonID VARCHAR(50) = '',
    @SanhTiec VARCHAR(50) = NULL,
    @JsonSanhTiec NVARCHAR(MAX) = '[]'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @IsNew INT = 0;
    
    -- 1. Sinh mÃ£ tá»± Ä‘á»™ng
    IF @DocumentID IS NULL OR @DocumentID = '' OR @DocumentID = 'TQ-AUTO'
    BEGIN
        SET @DocumentID = 'TQ' + FORMAT(GETDATE(), 'yyMM') + '/' + RIGHT('000' + CAST((ABS(CHECKSUM(NEWID())) % 1000) AS VARCHAR), 3);
        SET @IsNew = 1;
    END

    -- 2. Xá»­ lÃ½ thÃ´ng minh: Nháº­n diá»‡n náº¿u @Tenkh thá»±c cháº¥t lÃ  ID khÃ¡ch hÃ ng (KH...) tá»« Combobox
    IF @Tenkh IS NOT NULL AND @Tenkh <> '' AND (@Makh IS NULL OR @Makh = '')
    BEGIN
        IF EXISTS (SELECT 1 FROM dmkhachhang WHERE Makh = @Tenkh)
        BEGIN
            SET @Makh = @Tenkh;
            SET @Tenkh = NULL;
        END
    END

    -- 3. Xá»­ lÃ½ khÃ¡ch hÃ ng (Táº¡o má»›i náº¿u cÃ³ TÃªn KH hoáº·c cÃ³ Sá»‘ Ä‘iá»‡n thoáº¡i)
    IF (@Makh IS NULL OR @Makh = '') AND ((@Tenkh IS NOT NULL AND @Tenkh <> '') OR (@Dienthoai IS NOT NULL AND @Dienthoai <> ''))
    BEGIN
        IF (@Dienthoai IS NOT NULL AND @Dienthoai <> '')
        BEGIN
            SELECT TOP 1 @Makh = Makh FROM dmkhachhang WHERE Dienthoai = @Dienthoai ORDER BY DateCreate ASC;
        END

        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            SET @Makh = 'KH' + FORMAT(GETDATE(), 'yyMM') + RIGHT('0000' + CAST((ABS(CHECKSUM(NEWID())) % 10000) AS VARCHAR), 4);
            INSERT INTO dmkhachhang (Makh, Tenkh, Dienthoai, IsKhachhang, DateCreate)
            VALUES (@Makh, ISNULL(@Tenkh, N'KhÃ¡ch vÃ£ng lai'), @Dienthoai, 1, GETDATE());
        END
        ELSE IF (@Tenkh IS NOT NULL AND @Tenkh <> '')
        BEGIN
            UPDATE dmkhachhang SET Tenkh = ISNULL(NULLIF(@Tenkh, ''), Tenkh) WHERE Makh = @Makh;
        END
    END
    ELSE IF (@Makh IS NOT NULL AND @Makh <> '')
    BEGIN
        UPDATE dmkhachhang SET Tenkh = ISNULL(@Tenkh, Tenkh), Dienthoai = ISNULL(@Dienthoai, Dienthoai) WHERE Makh = @Makh;
    END

    -- 3. Xá»­ lÃ½ fallback cho GÃ³i Thá»±c ÄÆ¡n
    IF ISNULL(@GoiThucDonID, '') = ''
    BEGIN
        SELECT TOP 1 @GoiThucDonID = GoiThucDonID FROM dmGoiThucDon;
    END

    -- 4. LÆ°u KhÃ¡ch Tham Quan (Insert hoáº·c Update)
    IF @IsNew = 1
    BEGIN
        INSERT INTO tbmk_Khachthamquan (
            DocumentID, DocumentDate, Makh, Ngaytochuc, Nhamngay, Loaitiecid, Thoigianid, 
            SobanMan, SobanChay, TongsoBan, Ghichu, IsKetthuc, IsHuy, GoiThucDonID
        ) VALUES (
            @DocumentID, GETDATE(), @Makh, @Ngaytochuc, @Nhamngay, @Loaitiecid, @Thoigianid,
            @SobanMan, @SobanChay, (@SobanMan + @SobanChay), @Ghichu, 0, 0, @GoiThucDonID
        );
    END
    ELSE
    BEGIN
        UPDATE tbmk_Khachthamquan SET
            Makh = @Makh, Ngaytochuc = @Ngaytochuc, Nhamngay = @Nhamngay, Loaitiecid = @Loaitiecid,
            Thoigianid = @Thoigianid, SobanMan = @SobanMan, SobanChay = @SobanChay, 
            TongsoBan = (@SobanMan + @SobanChay), Ghichu = @Ghichu, GoiThucDonID = @GoiThucDonID
        WHERE DocumentID = @DocumentID;
    END

    -- 5. Xá»­ lÃ½ Sáº£nh Tiá»‡c (Sá»­ dá»¥ng NEWID() Ä‘á»ƒ chá»‘ng trÃ¹ng mÃ£)
    IF @SanhTiec IS NOT NULL AND @SanhTiec <> ''
    BEGIN
        DELETE FROM tbmk_Khachthamquansanhtiec WHERE DocumentID = @DocumentID;
        
        INSERT INTO tbmk_Khachthamquansanhtiec (DocumentID, Sanhtiecid, UserAutoid)
        VALUES (@DocumentID, @SanhTiec, CAST(NEWID() AS VARCHAR(50)));
    END
    ELSE IF @JsonSanhTiec IS NOT NULL AND @JsonSanhTiec <> '[]'
    BEGIN
        DELETE FROM tbmk_Khachthamquansanhtiec WHERE DocumentID = @DocumentID;
        
        INSERT INTO tbmk_Khachthamquansanhtiec (DocumentID, Sanhtiecid, UserAutoid)
        SELECT @DocumentID, JSON_VALUE(value, '$.Sanhtiecid'), CAST(NEWID() AS VARCHAR(50))
        FROM OPENJSON(@JsonSanhTiec);
    END

    SELECT @DocumentID AS DocumentID;
END
GO

GO

USE [QLTiec]
GO

-- =============================================
-- MÃ´ táº£: API LÆ°u (ThÃªm/Sá»­a) thÃ´ng tin KhÃ¡ch hÃ ng
-- IsEdit = 0: ThÃªm má»›i | IsEdit = 1: Cáº­p nháº­t
-- =============================================
CREATE PROCEDURE [dbo].[API_LuuKhachHang]
    @NhomNguoiDangThaoTac NVARCHAR(50) = 'Admin',
    @Makh           VARCHAR(50)    = NULL,
    @Tenchure       NVARCHAR(255)  = NULL,
    @Tencodau       NVARCHAR(255)  = NULL,
    @DTchure        NVARCHAR(50)   = NULL,
    @DTcodau        NVARCHAR(50)   = NULL,
    @Dienthoai      NVARCHAR(50)   = NULL,
    @Mail           NVARCHAR(100)  = NULL,
    @Diachi         NVARCHAR(500)  = NULL,
    @Ghichu         NVARCHAR(2000) = NULL,
    @UserCreate     VARCHAR(50)    = 'Admin',
    @IsEdit         TINYINT        = 0   -- 0: ThÃªm má»›i, 1: Cáº­p nháº­t
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @Now DATETIME = GETDATE();

        IF @IsEdit = 0
        BEGIN
            -- Kiá»ƒm tra trÃ¹ng SÄT trÆ°á»›c khi thÃªm má»›i
            IF EXISTS (
                SELECT 1 FROM dmkhachhang
                WHERE Dienthoai = @Dienthoai
                   OR DTchure   = ISNULL(@DTchure, @Dienthoai)
                   OR DTcodau   = ISNULL(@DTcodau, @Dienthoai)
            )
            BEGIN
                SELECT 0 AS [code], N'Sá»‘ Ä‘iá»‡n thoáº¡i Ä‘Ã£ tá»“n táº¡i trong há»‡ thá»‘ng!' AS [msg], NULL AS [Makh];
                RETURN;
            END

            -- PhÃ¡t sinh Makh má»›i
            SET @Makh = 'KH' + FORMAT(@Now, 'yyMMddHHmmss');

            INSERT INTO dmkhachhang (
                Makh, Tenkh, Tenchure, Tencodau,
                DTchure, DTcodau, Dienthoai, Mail, Diachi, Ghichu,
                IsKhachhang, DateCreate, UserCreate
            )
            VALUES (
                @Makh,
                CASE
                    WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                    ELSE ISNULL(@Tenchure, '') + ' & ' + @Tencodau
                END,
                @Tenchure, @Tencodau,
                @DTchure, @DTcodau,
                ISNULL(@Dienthoai, ISNULL(@DTchure, @DTcodau)),
                @Mail, @Diachi, @Ghichu,
                1, @Now, @UserCreate
            );
        END
        ELSE
        BEGIN
            -- Cáº­p nháº­t
            UPDATE dmkhachhang
            SET
                Tenkh = CASE
                            WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                            ELSE ISNULL(@Tenchure, '') + ' & ' + @Tencodau
                        END,
                Tenchure    = @Tenchure,
                Tencodau    = @Tencodau,
                DTchure     = @DTchure,
                DTcodau     = @DTcodau,
                Dienthoai   = ISNULL(@Dienthoai, ISNULL(@DTchure, @DTcodau)),
                Mail        = @Mail,
                Diachi      = @Diachi,
                Ghichu      = @Ghichu,
                DateUpdate  = @Now,
                UserUpdate  = @UserCreate
            WHERE Makh = @Makh;
        END

        SELECT 0 AS [code], N'LÆ°u thÃ nh cÃ´ng' AS [msg], @Makh AS [Makh];

    END TRY
    BEGIN CATCH
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg], NULL AS [Makh];
    END CATCH
END
GO

GO

USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_LuuMenu] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LuuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @MenuID NVARCHAR(50),
    @OldMenuID NVARCHAR(50) = '',
    @ParentID NVARCHAR(50) = '',
    @Label NVARCHAR(250),
    @EN NVARCHAR(250) = '',
    @SubTitle NVARCHAR(250) = '',
    @FormName NVARCHAR(250) = '',
    @FormKey NVARCHAR(250) = '',
    @URLPara NVARCHAR(250) = '',
    @Icon NVARCHAR(100) = '',
    @IsDisable BIT = 0,
    @IsEdit BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiá»ƒm tra NhÃ³m Cha (ParentID) cÃ³ há»£p lá»‡ khÃ´ng
    IF (@ParentID <> '')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM WA_Menu WHERE MenuID = @ParentID)
        BEGIN
            -- Tá»± Ä‘á»™ng táº¡o má»™t Menu Cha (Root) má»›i thay vÃ¬ bÃ¡o lá»—i
            INSERT INTO WA_Menu (MenuID, Parent, VN, EN, SubTitle, FormName, FormKey, URLPara, IconClass, isDisable)
            VALUES (@ParentID, '', N'NhÃ³m Menu ' + @ParentID, '', '', '', '', '', 'folder', 0);
        END

        IF (@IsEdit = 1 AND @ParentID = @OldMenuID)
        BEGIN
            RAISERROR (N'Lá»—i: Má»™t Menu khÃ´ng thá»ƒ tá»± chá»n chÃ­nh nÃ³ lÃ m NhÃ³m Cha!', 16, 1);
            RETURN;
        END
    END

    -- Tá»± Ä‘á»™ng bÃ³c tÃ¡ch vÃ  gÃ¡n tiá»n tá»‘ ID NhÃ³m Cha vÃ o Menu ID
    IF (@IsEdit = 1)
    BEGIN
        DECLARE @OldParentID NVARCHAR(50);
        SELECT @OldParentID = ISNULL(Parent, '') FROM WA_Menu WHERE MenuID = @OldMenuID;
        
        -- Náº¿u ID hiá»‡n táº¡i Ä‘ang dÃ­nh Parent cÅ©, cáº¯t bá» Parent cÅ© ra khá»i ID
        IF (@OldParentID <> '' AND @MenuID LIKE @OldParentID + '%')
        BEGIN
            SET @MenuID = RIGHT(@MenuID, LEN(@MenuID) - LEN(@OldParentID));
        END
    END

    -- Gáº¯n Parent má»›i vÃ o ID náº¿u cÃ³ chá»n NhÃ³m Cha vÃ  ID chÆ°a chá»©a NhÃ³m Cha
    IF (@ParentID <> '' AND @MenuID NOT LIKE @ParentID + '%')
    BEGIN
        SET @MenuID = @ParentID + @MenuID;
    END

    IF (@IsEdit = 1)
    BEGIN
        -- Äá»•i ID náº¿u cáº§n thiáº¿t
        IF (@OldMenuID <> '' AND @OldMenuID <> @MenuID)
        BEGIN
            UPDATE WA_Menu SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            UPDATE WA_UserGroupPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            UPDATE WA_UserPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;
            -- Äá»“ng bá»™ cáº­p nháº­t cá»™t Parent cho cÃ¡c menu con náº¿u Ä‘á»•i ID cá»§a Group cha
            UPDATE WA_Menu SET Parent = @MenuID WHERE Parent = @OldMenuID;
        END

        UPDATE WA_Menu 
        SET 
            Parent = @ParentID,
            VN = @Label,
            EN = @EN,
            SubTitle = @SubTitle,
            FormName = @FormName,
            FormKey = @FormKey,
            URLPara = @URLPara,
            IconClass = @Icon,
            isDisable = @IsDisable
        WHERE MenuID = @MenuID;
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM WA_Menu WHERE MenuID = @MenuID)
        BEGIN
            RAISERROR (N'Lá»—i: Menu ID nÃ y Ä‘Ã£ tá»“n táº¡i trong há»‡ thá»‘ng!', 16, 1);
            RETURN;
        END

        INSERT INTO WA_Menu (MenuID, Parent, VN, EN, SubTitle, FormName, FormKey, URLPara, IconClass, isDisable)
        VALUES (@MenuID, @ParentID, @Label, @EN, @SubTitle, @FormName, @FormKey, @URLPara, @Icon, @IsDisable);
    END
END
GO

GO

USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Antigravity
-- Create date: 2026-04-29
-- Description: API LÆ°u (ThÃªm/Sá»­a) BiÃªn nháº­n cá»c chá»— (Cá»c láº§n 1 & Láº§n 2)
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[API_LuuPhieuCoc]
    @DocumentID VARCHAR(50) = NULL OUTPUT, -- Náº¿u NULL: ThÃªm má»›i, NgÆ°á»£c láº¡i: Cáº­p nháº­t
    -- ThÃ´ng tin KhÃ¡ch hÃ ng
    @Makh VARCHAR(50) = NULL OUTPUT, -- Náº¿u NULL: Táº¡o khÃ¡ch hÃ ng má»›i
    @Tenchure NVARCHAR(255) = NULL,
    @Tencodau NVARCHAR(255) = NULL,
    @DTchure NVARCHAR(50) = NULL,           -- ÄT riÃªng chÃº rá»ƒ
    @DTcodau NVARCHAR(50) = NULL,           -- ÄT riÃªng cÃ´ dÃ¢u
    @Diachi NVARCHAR(500) = NULL,
    @Nguoigd NVARCHAR(100) = NULL,          -- NgÆ°á»i Ä‘áº¡i diá»‡n
    @DienThoaiDaiDien NVARCHAR(50) = NULL,  -- ÄT ngÆ°á»i Ä‘áº¡i diá»‡n
    @Mail NVARCHAR(100) = NULL,
    
    -- ThÃ´ng tin Phiáº¿u Cá»c
    @DocumentDate DATETIME = NULL,
    @Ngaytochuc DATETIME = NULL,
    @Nhamngay NVARCHAR(100) = NULL,
    @Loaitiecid VARCHAR(50) = NULL,
    @Thoigianid VARCHAR(50) = NULL, -- Ca tiá»‡c
    @SobanManchinhthuc INT = 0,
    @SobanManduphong INT = 0,
    @SobanChaychinhthuc INT = 0,
    @SobanChayduphong INT = 0,
    @Tongtien DECIMAL(18,2) = 0, -- Sá»‘ tiá»n Ä‘áº·t cá»c
    @Solan TINYINT = 1, -- 1: Cá»c láº§n 1, 2: Cá»c láº§n 2
    @Ghichu NVARCHAR(500) = NULL,
    @Manv VARCHAR(50) = NULL,
    @UserCreate VARCHAR(50) = 'System',
    
    -- Danh sÃ¡ch Sáº£nh Ä‘áº·t (Dáº¡ng JSON: [{"Sanhtiecid":"S01", "IsSanhchinh": 1}, ...])
    @JsonSanhTiec NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Now DATETIME = GETDATE();
        DECLARE @Tongsoban INT = ISNULL(@SobanManchinhthuc, 0) + ISNULL(@SobanChaychinhthuc, 0);

        -- ==========================================================
        -- 1. Xá»¬ LÃ KHÃCH HÃ€NG (dmkhachhang)
        -- ==========================================================
        IF (@Makh IS NULL OR @Makh = '')
        BEGIN
            -- TÃ¬m khÃ¡ch hÃ ng cÅ© theo SÄT chÃº rá»ƒ hoáº·c cÃ´ dÃ¢u (trÃ¡nh táº¡o duplicate)
            DECLARE @SdtTimkiem NVARCHAR(50) = ISNULL(NULLIF(@DTchure, ''), @DTcodau);
            IF (@SdtTimkiem IS NOT NULL AND @SdtTimkiem <> '')
            BEGIN
                SELECT TOP 1 @Makh = Makh
                FROM dmkhachhang
                WHERE (Dienthoai = @SdtTimkiem OR DTchure = @SdtTimkiem OR DTcodau = @SdtTimkiem)
                  AND ISNULL(Tenchure, '') = ISNULL(@Tenchure, '') 
                  AND ISNULL(Tencodau, '') = ISNULL(@Tencodau, '')
                ORDER BY DateCreate ASC;  -- Láº¥y record gá»‘c cÅ© nháº¥t
            END

            -- KhÃ´ng tÃ¬m tháº¥y â†’ táº¡o má»›i
            IF (@Makh IS NULL OR @Makh = '')
            BEGIN
                SET @Makh = 'KH' + FORMAT(@Now, 'yyMMddHHmmss');

                INSERT INTO dmkhachhang (
                    Makh, Tenkh, Tenchure, Tencodau, DTchure, DTcodau, Dienthoai, Diachi, Nguoigd, DienThoaiDaiDien, Mail,
                    IsKhachhang, DateCreate, UserCreate
                )
                VALUES (
                    @Makh,
                    CASE
                        WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                        ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '')
                    END,
                    @Tenchure, @Tencodau, @DTchure, @DTcodau, ISNULL(@DTchure, @DTcodau), @Diachi, @Nguoigd, @DienThoaiDaiDien, @Mail,
                    1, @Now, @UserCreate
                );
            END
            ELSE
            BEGIN
                -- TÃ¬m tháº¥y khÃ¡ch cÅ© â†’ cáº­p nháº­t thÃ´ng tin (ghi Ä‘Ã¨ dá»¯ liá»‡u má»›i náº¿u cÃ³)
                UPDATE dmkhachhang
                SET
                    Tenchure          = ISNULL(NULLIF(@Tenchure, ''),          Tenchure),
                    Tencodau          = ISNULL(NULLIF(@Tencodau, ''),          Tencodau),
                    DTchure           = ISNULL(NULLIF(@DTchure,  ''),          DTchure),
                    DTcodau           = ISNULL(NULLIF(@DTcodau,  ''),          DTcodau),
                    Diachi            = ISNULL(NULLIF(@Diachi,   ''),          Diachi),
                    Mail              = ISNULL(NULLIF(@Mail,     ''),          Mail),
                    Nguoigd           = ISNULL(NULLIF(@Nguoigd,  ''),          Nguoigd),
                    DienThoaiDaiDien  = ISNULL(NULLIF(@DienThoaiDaiDien, ''), DienThoaiDaiDien),
                    DateUpdate        = @Now,
                    UserUpdate        = @UserCreate
                WHERE Makh = @Makh;
            END
        END
        ELSE
        BEGIN
            -- Cáº­p nháº­t thÃ´ng tin khÃ¡ch hÃ ng náº¿u Ä‘Ã£ tá»“n táº¡i
            UPDATE dmkhachhang
            SET 
                Tenkh = CASE 
                            WHEN @Tencodau IS NULL OR @Tencodau = '' THEN ISNULL(@Tenchure, '')
                            ELSE ISNULL(@Tenchure, '') + ' & ' + ISNULL(@Tencodau, '') 
                        END,
                Tenchure = @Tenchure,
                Tencodau = @Tencodau,
                DTchure = @DTchure,
                DTcodau = @DTcodau,
                Dienthoai = ISNULL(@DTchure, @DTcodau),
                Diachi = @Diachi,
                Nguoigd = @Nguoigd,
                DienThoaiDaiDien = @DienThoaiDaiDien,
                Mail = @Mail,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE Makh = @Makh;
        END

        -- ==========================================================
        -- 2. Xá»¬ LÃ PHIáº¾U BIÃŠN NHáº¬N Cá»ŒC CHá»– (tbmk_Biennhancoccho)
        -- ==========================================================
        IF (@DocumentID IS NULL OR @DocumentID = '')
        BEGIN
            -- PhÃ¡t sinh mÃ£ phiáº¿u (DocumentID & SoBN)
            -- SoBN thÆ°á»ng theo Ä‘á»‹nh dáº¡ng: BNCC-YYMM-XXXX
            DECLARE @SoBN VARCHAR(50) = 'BNCC' + FORMAT(@Now, 'yyMMddHHmmss');
            SET @DocumentID = @SoBN; -- Táº¡m dÃ¹ng SoBN lÃ m DocumentID náº¿u khÃ´ng cÃ³ logic AutoID phá»©c táº¡p

            INSERT INTO tbmk_Biennhancoccho (
                DocumentID, SoBN, DocumentDate, Makh, Solan, Manv, Loaitiecid,
                Ngaytochuc, Nhamngay, Tongtien, Tongsoban, SobanManchinhthuc, SobanManduphong, SobanChaychinhthuc, SobanChayduphong,
                Thoigianid, Ghichu, IsHuy, IsKetthuc, GoiThucDonID, DateCreate, UserCreate
            )
            VALUES (
                @DocumentID, @SoBN, ISNULL(@DocumentDate, @Now), @Makh, @Solan, @Manv, @Loaitiecid,
                @Ngaytochuc, @Nhamngay, @Tongtien, @Tongsoban, @SobanManchinhthuc, @SobanManduphong, @SobanChaychinhthuc, @SobanChayduphong,
                @Thoigianid, @Ghichu, 0, 0, '', @Now, @UserCreate
            );
        END
        ELSE
        BEGIN
            -- Cáº­p nháº­t phiáº¿u cá»c
            UPDATE tbmk_Biennhancoccho
            SET 
                Makh = @Makh,
                Solan = @Solan,
                Loaitiecid = @Loaitiecid,
                Ngaytochuc = @Ngaytochuc,
                Nhamngay = @Nhamngay,
                Tongtien = @Tongtien,
                Tongsoban = @Tongsoban,
                SobanManchinhthuc = @SobanManchinhthuc,
                SobanManduphong = @SobanManduphong,
                SobanChaychinhthuc = @SobanChaychinhthuc,
                SobanChayduphong = @SobanChayduphong,
                Thoigianid = @Thoigianid,
                Ghichu = @Ghichu,
                DateUpdate = @Now,
                UserUpdate = @UserCreate
            WHERE DocumentID = @DocumentID;
        END

        -- ==========================================================
        -- 3. Xá»¬ LÃ CHI TIáº¾T Sáº¢NH TIá»†C (tbmk_Biennhancocchosanhtiec)
        -- ==========================================================
        -- Chá»‰ xá»­ lÃ½ náº¿u cÃ³ truyá»n danh sÃ¡ch Sáº£nh
        IF (@JsonSanhTiec IS NOT NULL AND @JsonSanhTiec != '[]' AND @JsonSanhTiec != '')
        BEGIN
            -- XÃ³a sáº£nh cÅ© cá»§a phiáº¿u nÃ y
            DELETE FROM tbmk_Biennhancocchosanhtiec WHERE DocumentID = @DocumentID;

            -- Parse JSON vÃ  Insert sáº£nh má»›i (YÃªu cáº§u SQL Server 2016+)
            INSERT INTO tbmk_Biennhancocchosanhtiec (
                UserAutoid, DocumentID, Sanhtiecid, IsSanhchinh, 
                DateCreate, UserCreate
            )
            SELECT 
                NEWID(), -- Tá»± sinh GUID cho UserAutoid
                @DocumentID, 
                JSON_VALUE(value, '$.Sanhtiecid'),
                ISNULL(CAST(JSON_VALUE(value, '$.IsSanhchinh') AS BIT), 0),
                @Now,
                @UserCreate
            FROM OPENJSON(@JsonSanhTiec);
        END

        COMMIT TRANSACTION;
        
        -- Tráº£ vá» káº¿t quáº£ thÃ nh cÃ´ng kÃ¨m ID
        SELECT 1 AS [Success], N'LÆ°u biÃªn nháº­n cá»c thÃ nh cÃ´ng' AS [Message], @DocumentID AS [DocumentID], @Makh AS [Makh];
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Tráº£ vá» lá»—i
        SELECT 0 AS [Success], ERROR_MESSAGE() AS [Message], NULL AS [DocumentID], NULL AS [Makh];
    END CATCH
END
GO

GO

USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_LuuQuyenCuaNhom] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[API_LuuQuyenCuaNhom]
    @NhomNguoiDangThaoTac NVARCHAR(50), -- Báº®T BUá»˜C THÃŠM: Truyá»n Session NhÃ³m cá»§a ngÆ°á»i ÄANG Báº¤M NÃšT LÆ¯U
    @UserGroupID NVARCHAR(50),          -- NhÃ³m Bá»Š gÃ¡n quyá»n
    @MenuID NVARCHAR(50),               -- Form Bá»Š gÃ¡n quyá»n
    @IsRun BIT,                         
    @IsAdd BIT,                         
    @IsUpdate BIT,                      
    @IsDelete BIT,
    @isManager BIT,
    @isAdmin BIT,
    @isAutoLock BIT,
    @isHideAmount BIT,
    @isLockDoc BIT,
    @isUnLockDoc BIT,
    @isExportExcel BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- =======================================================
    -- BÆ¯á»šC 1: Cáº¢NH Vá»† Há»† THá»NG - CHá»ˆ SUPER ADMIN Má»šI ÄÆ¯á»¢C CHáº Y
    -- KhoÃ¡ cá»©ng Ä‘iá»u kiá»‡n: MÃ£ nhÃ³m thao tÃ¡c báº¯t buá»™c pháº£i lÃ  'Admin'
    -- =======================================================
    IF (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        RAISERROR (N'Lá»—i Báº£o Máº­t: Báº¡n khÃ´ng pháº£i GiÃ¡m Ä‘á»‘c Server, cáº¥m sá»­a PhÃ¢n Quyá»n!', 16, 1);
        RETURN; 
    END

    -- =======================================================
    -- BÆ¯á»šC 2: Cáº¬P NHáº¬T DATABASE
    -- =======================================================
    UPDATE WA_UserGroupPermisstion
    SET 
        IsRun = @IsRun,
        IsAdd = @IsAdd,
        IsUpdate = @IsUpdate,
        IsDelete = @IsDelete,
        isManager = @isManager,
        isAdmin = @isAdmin,
        isAutoLock = @isAutoLock,
        isHideAmount = @isHideAmount,
        isLockDoc = @isLockDoc,
        isUnLockDoc = @isUnLockDoc,
        isExportExcel = @isExportExcel
    WHERE UserGroupID = @UserGroupID 
      AND MenuID = @MenuID;

    -- =======================================================
    -- BÆ¯á»šC 3: KÃCH HOáº T CÃ’I BÃO Äá»˜NG CHO CÃC TRANG WEB KHÃC Tá»° F5 QUYá»€N
    -- =======================================================
    IF EXISTS (SELECT 1 FROM SY_Setup WHERE CodeID = 'menu_sync_ver')
        UPDATE SY_Setup SET CodeValue = CONVERT(NVARCHAR(50), GETDATE(), 126) WHERE CodeID = 'menu_sync_ver';
    ELSE
        INSERT INTO SY_Setup (CodeID, CodeName, CodeValue, GroupID) VALUES ('menu_sync_ver', N'PhiÃªn báº£n Ä‘á»“ng bá»™ Menu', CONVERT(NVARCHAR(50), GETDATE(), 126), 'SY');

END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_LuuQuyenToan]
    @DocumentID VARCHAR(50) = NULL,
    @DocumentDate DATETIME = NULL,
    @Sohopdong VARCHAR(50) = NULL,
    @Nguoinop NVARCHAR(100) = NULL,
    @Tongtiencoc DECIMAL(18,2) = 0,
    @TongtienHoaDon DECIMAL(18,2) = 0,
    @Thanhtoan DECIMAL(18,2) = 0,
    @Conlai DECIMAL(18,2) = 0,
    @IsKetthuc BIT = 0,
    @Ghichu NVARCHAR(500) = NULL,

    -- CÃ¡c tham sá»‘ há»‡ thá»‘ng máº·c Ä‘á»‹nh
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Tá»± sinh mÃ£ Quyáº¿t toÃ¡n náº¿u táº¡o má»›i
    IF @DocumentID IS NULL OR @DocumentID = ''
    BEGIN
        SET @DocumentID = 'QT' + FORMAT(GETDATE(), 'yyMMddHHmmss');
        
        INSERT INTO tbmk_Phieuthu (
            DocumentID, DocumentDate, SPthu, Ngaythu, Sohopdong, Nguoinop, Manv, 
            Tongtiencoc, TongtienHoaDon, Thanhtoan, Conlai, IsKetthuc, Ghichu, 
            UserCreate, DateCreate
        )
        VALUES (
            @DocumentID, ISNULL(@DocumentDate, GETDATE()), @DocumentID, ISNULL(@DocumentDate, GETDATE()), @Sohopdong, @Nguoinop, @User,
            @Tongtiencoc, @TongtienHoaDon, @Thanhtoan, @Conlai, @IsKetthuc, @Ghichu,
            @User, GETDATE()
        );
    END
    ELSE
    BEGIN
        UPDATE tbmk_Phieuthu
        SET DocumentDate = ISNULL(@DocumentDate, DocumentDate),
            Ngaythu = ISNULL(@DocumentDate, Ngaythu),
            Sohopdong = ISNULL(@Sohopdong, Sohopdong),
            Nguoinop = ISNULL(@Nguoinop, Nguoinop),
            Tongtiencoc = ISNULL(@Tongtiencoc, Tongtiencoc),
            TongtienHoaDon = ISNULL(@TongtienHoaDon, TongtienHoaDon),
            Thanhtoan = ISNULL(@Thanhtoan, Thanhtoan),
            Conlai = ISNULL(@Conlai, Conlai),
            IsKetthuc = ISNULL(@IsKetthuc, IsKetthuc),
            Ghichu = ISNULL(@Ghichu, Ghichu),
            UserUpdate = @User,
            DateUpdate = GETDATE()
        WHERE DocumentID = @DocumentID;
    END

    -- Tá»± Ä‘á»™ng cáº­p nháº­t tráº¡ng thÃ¡i cá»§a Há»£p Ä‘á»“ng náº¿u phiáº¿u thu bÃ¡o káº¿t thÃºc
    IF @IsKetthuc = 1 AND @Sohopdong IS NOT NULL
    BEGIN
        UPDATE tbmk_Hopdong 
        SET IsKetthuc = 1, Conlai = @Conlai
        WHERE Sohopdong = @Sohopdong;
    END

    -- Tráº£ vá» dá»¯ liá»‡u vá»«a lÆ°u Ä‘á»ƒ Grid cáº­p nháº­t láº¡i
    SELECT * FROM tbmk_Phieuthu WHERE DocumentID = @DocumentID;
END
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_LuuTaiKhoan]
    @UserName nvarchar(50),
    @HoTen nvarchar(100) = NULL,
    @UserGroupID varchar(50) = NULL,
    @Disable bit = 0,
    @EmployeeID nvarchar(50) = NULL,
    @Manager nvarchar(50) = NULL,
    @Password nvarchar(255) = NULL,

    -- CÃ¡c tham sá»‘ há»‡ thá»‘ng
    @FormName VARCHAR(50) = NULL,
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SY_User WHERE UserName = @UserName)
    BEGIN
        -- Update
        UPDATE SY_User
        SET HoTen = ISNULL(@HoTen, HoTen),
            UserGroupID = ISNULL(@UserGroupID, UserGroupID),
            Disable = ISNULL(@Disable, Disable),
            EmployeeID = ISNULL(@EmployeeID, EmployeeID),
            Manager = ISNULL(@Manager, Manager),
            -- Chá»‰ update password náº¿u ngÆ°á»i dÃ¹ng cÃ³ truyá»n vÃ o
            Password = ISNULL(@Password, Password)
        WHERE UserName = @UserName;
    END
    ELSE
    BEGIN
        -- Insert
        INSERT INTO SY_User (UserName, HoTen, UserGroupID, Disable, EmployeeID, Manager, Password)
        VALUES (@UserName, @HoTen, @UserGroupID, ISNULL(@Disable, 0), @EmployeeID, @Manager, ISNULL(@Password, '123456'));
    END

    -- Tráº£ vá» dá»¯ liá»‡u vá»«a lÆ°u Ä‘á»ƒ Frontend cáº­p nháº­t LÆ°á»›i
    SELECT 
        UserName,
        HoTen,
        UserGroupID,
        Disable,
        EmployeeID,
        Manager
    FROM SY_User
    WHERE UserName = @UserName;

END
GO

GO

USE [QLTiec]
GO

ALTER PROCEDURE [dbo].[API_LuuThuTuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @Type NVARCHAR(20) = 'parent',   
    @OrderedIDs NVARCHAR(MAX) = '',  
    @ParentID NVARCHAR(50) = ''      
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Tách chuỗi ID do Giao diện gửi xuống (chuẩn thứ tự bằng XML)
        DECLARE @Tbl TABLE (Idx INT IDENTITY(1,1), OldID NVARCHAR(50));
        DECLARE @xml XML = CAST('<x>' + REPLACE(@OrderedIDs, ',', '</x><x>') + '</x>' AS XML);

        INSERT INTO @Tbl (OldID)
        SELECT n.value('.', 'NVARCHAR(50)') AS ID
        FROM @xml.nodes('/x') AS p(n);

        -- 2. Lấy danh sách ID HỆ THỐNG HIỆN TẠI đang có (sắp xếp tăng dần theo Alphabet/Số)
        -- Mục đích: Lấy lại chính xác các mã Menu đang dùng để xào bài lại, không sinh mã mới
        DECLARE @TblExisting TABLE (Idx INT IDENTITY(1,1), AvailableID NVARCHAR(50));
        
        IF (@Type = 'parent')
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu 
            WHERE Parent = '' OR Parent IS NULL
            ORDER BY MenuID ASC;
        END
        ELSE
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu 
            WHERE Parent = @ParentID
            ORDER BY MenuID ASC;
        END

        -- 3. Đổi toàn bộ ID gốc sang một mã TẠM THỜI (để tránh lỗi Trùng Khóa Chính - Duplicate Key)
        -- VD: Đổi '0304' thành 'TMP_0304'
        UPDATE M
        SET M.MenuID = 'TMP_' + T.OldID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = T.OldID;

        UPDATE P
        SET P.MenuID = 'TMP_' + T.OldID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = T.OldID;

        UPDATE U
        SET U.MenuID = 'TMP_' + T.OldID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = T.OldID;

        -- Nếu đổi Nhóm Cha, phải đổi Parent của menu con trỏ theo mã Tạm
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = 'TMP_' + T.OldID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = T.OldID;
        END

        -- 4. Ghép nối: Vị trí được KÉO (Tbl) sẽ nhận Mã ID SẮP XẾP (TblExisting)
        -- VD: Kéo 0312 lên đầu (Idx=1), sẽ nhận ID nhỏ nhất của hệ thống (Idx=1 là 0304)
        UPDATE M
        SET M.MenuID = E.AvailableID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE P
        SET P.MenuID = E.AvailableID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE U
        SET U.MenuID = E.AvailableID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        -- Đổi Parent cho menu con về mã mới (nếu là nhóm cha)
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = E.AvailableID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = 'TMP_' + T.OldID
            JOIN @TblExisting E ON T.Idx = E.Idx;
        END

        -- 5. Xóa bỏ cột ThuTu nếu muốn vì giờ đã swap hẳn MenuID
        COMMIT TRANSACTION;
        SELECT 0 AS [code], N'Đã hoàn tất Hoán đổi Mã MenuID thành công' AS [msg];

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg];
    END CATCH
END
GO

GO

IF OBJECT_ID('API_LuuTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_LuuTruongGiaoDien;
GO

CREATE PROCEDURE API_LuuTruongGiaoDien
    @FormName       varchar(50)      = NULL,
    @FieldName      varchar(50)      = NULL,
    @CaptionVN      nvarchar(255)    = NULL,
    @FormatID       varchar(2)       = NULL,
    @CaptionEN      nvarchar(200)    = NULL,
    @DataSource     nvarchar(500)    = NULL,
    @IsRequired     bit              = 0,
    @FormPosition   varchar(50)      = NULL,
    @ShowInAdd      bit              = 1,
    @ShowInEdit     bit              = 1,
    @IsReadOnlyEdit bit              = 0,
    @IsReadOnlyAdd  bit              = 0,
    @ValidateRule   nvarchar(500)    = NULL,
    @DependsOn      varchar(50)      = NULL,
    @VisibleRule    nvarchar(500)    = NULL,
    @OrderNo        int              = NULL,
    @ShowInFilter   bit              = 0,
    @NoResult       bit              = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF LOWER(LTRIM(RTRIM(ISNULL(@FormName, '')))) = LOWER('WA_BangThueTNCNFrm')
        THROW 52602, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: pilot chi duoc xem layout legacy.', 1;

    -- LÆ°u táº¥t cáº£ trá»±c tiáº¿p vÃ o SY_FormatFields (khÃ´ng dÃ¹ng array trong SY_FrmLstTbl ná»¯a)
    IF EXISTS (SELECT 1 FROM SY_FormatFields WHERE FieldName = @FieldName AND FormName = @FormName)
    BEGIN
        UPDATE SY_FormatFields
        SET CaptionVN     = ISNULL(@CaptionVN,     CaptionVN),
            FormatID      = ISNULL(@FormatID,      FormatID),
            CaptionEN     = ISNULL(@CaptionEN,     CaptionEN),
            DataSource    = ISNULL(@DataSource,    DataSource),
            IsRequired    = ISNULL(@IsRequired,    IsRequired),
            FormPosition  = ISNULL(@FormPosition,  FormPosition),
            ShowInAdd     = ISNULL(@ShowInAdd,     ShowInAdd),
            ShowInEdit    = ISNULL(@ShowInEdit,    ShowInEdit),
            IsReadOnlyEdit= ISNULL(@IsReadOnlyEdit,IsReadOnlyEdit),
            IsReadOnlyAdd = ISNULL(@IsReadOnlyAdd, IsReadOnlyAdd),
            ValidateRule  = ISNULL(@ValidateRule,  ValidateRule),
            DependsOn     = ISNULL(@DependsOn,     DependsOn),
            VisibleRule   = ISNULL(@VisibleRule,   VisibleRule),
            OrderNo       = ISNULL(@OrderNo,       OrderNo),
            ShowInFilter  = ISNULL(@ShowInFilter,  ShowInFilter)
        WHERE FieldName = @FieldName AND FormName = @FormName;
    END
    ELSE
    BEGIN
        INSERT INTO SY_FormatFields
            (FormName, FieldName, CaptionVN, FormatID, CaptionEN, DataSource,
             IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd,
             ValidateRule, DependsOn, VisibleRule, OrderNo, ShowInFilter)
        VALUES
            (@FormName, @FieldName, @CaptionVN, @FormatID, @CaptionEN, @DataSource,
             @IsRequired, @FormPosition, @ShowInAdd, @ShowInEdit, @IsReadOnlyEdit, @IsReadOnlyAdd,
             @ValidateRule, @DependsOn, @VisibleRule, ISNULL(@OrderNo, 0), ISNULL(@ShowInFilter, 0));
    END

    -- Tráº£ vá» dá»¯ liá»‡u vá»«a lÆ°u
    IF @NoResult = 0
    BEGIN
        SELECT FormName, FieldName, CaptionVN, FormatID, CaptionEN, DataSource,
               IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd,
               ValidateRule, DependsOn, VisibleRule, OrderNo, ShowInFilter
        FROM SY_FormatFields
        WHERE FieldName = @FieldName AND FormName = @FormName;
    END
END
GO

GO

CREATE PROCEDURE [dbo].[API_tbmk_Thaydoi_View]
    @Keyword NVARCHAR(250),
    @Sothaydoi NVARCHAR(50) = '' -- Há»©ng biáº¿n Sothaydoi tá»« UI
AS
BEGIN
    SET NOCOUNT ON;

    -- Chuáº©n hÃ³a dá»¯ liá»‡u (Náº¿u rá»—ng thÃ¬ chuyá»ƒn thÃ nh NULL Ä‘á»ƒ dá»… lá»c)
    IF @Sothaydoi = '' SET @Sothaydoi = NULL;

    -- Lá»c Báº®T BUá»˜C theo Há»£p Ä‘á»“ng, vÃ  lá»c THÃŠM theo Sá»‘ thay Ä‘á»•i (náº¿u cÃ³)
    SELECT * 
    FROM tbmk_Thaydoi 
    WHERE Sohopdong = @Keyword
      AND (@Sothaydoi IS NULL OR Sothaydoi = @Sothaydoi)
    ORDER BY Sothaydoi DESC; 
END;
GO

-- 2. Cáº­p nháº­t láº¡i Gateway Ä‘á»ƒ truyá»n Ä‘á»§ cáº£ 2 biáº¿n tá»« UI xuá»‘ng SQL
UPDATE WA_API
SET [SQL] = 'API_tbmk_Thaydoi_View',
    [Para] = '@Keyword=N''{Keyword}'', @Sothaydoi=N''{Sothaydoi}'''
WHERE list = 'tbmk_Thaydoi' AND func = 'View';
GO

GO

CREATE OR ALTER PROCEDURE [dbo].[API_TruyVanDong]
    @List VARCHAR(50),
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = '' -- DÃ¹ng @Data thay vÃ¬ @FilterJSON Ä‘á»ƒ nháº¥t quÃ¡n vá»›i Gateway
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName VARCHAR(100);
    DECLARE @PrimaryKey VARCHAR(50);
    
    -- Láº¥y thÃ´ng tin Báº£ng váº­t lÃ½ vÃ  KhÃ³a chÃ­nh tá»« cáº¥u hÃ¬nh form
    SELECT 
        @TableName = LTRIM(RTRIM(TableName)),
        @PrimaryKey = LTRIM(RTRIM(PrimaryKey))
    FROM SY_FrmLstTbl 
    WHERE FormID = @List;

    IF @TableName IS NULL OR @TableName = ''
    BEGIN
        SELECT -1 AS code, N'ChÆ°a cáº¥u hÃ¬nh TableName cho form ' + @List AS msg;
        RETURN;
    END

    -- Chuáº©n hÃ³a casing cá»§a KhÃ³a chÃ­nh theo báº£ng váº­t lÃ½ (trÃ¡nh lá»—i Case-Sensitive)
    DECLARE @ExactPK VARCHAR(100);
    SELECT TOP 1 @ExactPK = name 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(@TableName) 
      AND LOWER(name) = LOWER(@PrimaryKey);
      
    IF @ExactPK IS NOT NULL
        SET @PrimaryKey = @ExactPK;

    -- Chuáº©n hÃ³a casing cá»§a Cá»™t sáº¯p xáº¿p theo báº£ng váº­t lÃ½ (náº¿u cÃ³ truyá»n)
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        DECLARE @ExactSortCol VARCHAR(100);
        SELECT TOP 1 @ExactSortCol = name 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(@TableName) 
          AND LOWER(name) = LOWER(@SortColumn);
          
        IF @ExactSortCol IS NOT NULL
            SET @SortColumn = @ExactSortCol;
    END
    
    -- Biáº¿n chá»©a SQL Ä‘á»™ng
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @whereClause NVARCHAR(MAX) = ' WHERE 1=1';

    -- Xá»¬ LÃ Lá»ŒC Tá»ª JSON (JsonData tá»« UI)
    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        DECLARE @jsonFilter NVARCHAR(MAX);
        SELECT @jsonFilter = STUFF((
            SELECT ' AND ' + QUOTENAME(c.name) + ' LIKE N''%'' + ' + 
                   'REPLACE(N''' + REPLACE(jd.[value], '''', '''''') + ''', ''\t'', '''')' + ' + ''%'''
            FROM OPENJSON(@Data) jd
            CROSS APPLY (
                SELECT TOP 1 name 
                FROM sys.columns 
                WHERE object_id = OBJECT_ID(@TableName) 
                  AND LOWER(name) = LOWER(jd.[key]) COLLATE DATABASE_DEFAULT
            ) c
            WHERE jd.[value] IS NOT NULL AND CAST(jd.[value] AS NVARCHAR(MAX)) <> ''
              AND jd.[key] COLLATE DATABASE_DEFAULT <> 'Keyword'
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 0, '');

        IF @jsonFilter IS NOT NULL
        BEGIN
            SET @whereClause = @whereClause + @jsonFilter;
        END
    END




    -- ThÃªm Ä‘iá»u kiá»‡n tÃ¬m kiáº¿m náº¿u cÃ³ Keyword (TÃ¬m kiáº¿m toÃ n cá»¥c)
    IF ISNULL(@Keyword, '') <> ''
    BEGIN
        DECLARE @searchCols NVARCHAR(MAX);
        
        -- DÃ¹ng sys.columns Ä‘á»ƒ láº¥y danh sÃ¡ch cá»™t text
        SELECT @searchCols = STUFF((
            SELECT ' OR ' + QUOTENAME(c.name) + ' LIKE ''%'' + @kw + ''%'''
            FROM sys.columns c
            JOIN sys.types ty ON c.system_type_id = ty.system_type_id
            WHERE c.object_id = OBJECT_ID(@TableName) 
              AND ty.name IN ('varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext')
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 4, '');

        IF @searchCols IS NOT NULL AND @searchCols <> ''
        BEGIN
            SET @whereClause = @whereClause + ' AND (' + @searchCols + ')';
        END
    END

    -- Xá»­ lÃ½ ORDER BY
    DECLARE @OrderByClause NVARCHAR(MAX);
    
    -- Náº¿u frontend truyá»n SortColumn thÃ¬ Æ°u tiÃªn dÃ¹ng
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        -- Máº·c Ä‘á»‹nh ASC náº¿u khÃ´ng truyá»n SortDir há»£p lá»‡
        IF ISNULL(@SortDir, '') NOT IN ('ASC', 'DESC', 'asc', 'desc')
            SET @SortDir = 'ASC';
            
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@SortColumn) + ' ' + @SortDir;
    END
    -- Náº¿u khÃ´ng cÃ³ SortColumn thÃ¬ fallback vá» PrimaryKey
    ELSE IF @PrimaryKey IS NOT NULL AND @PrimaryKey <> ''
    BEGIN
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@PrimaryKey) + ' DESC ';
    END
    ELSE
    BEGIN
        SET @OrderByClause = ' ORDER BY (SELECT 1) ';
    END

    -- Láº¥y danh sÃ¡ch cá»™t
    DECLARE @ColumnList NVARCHAR(MAX);
    SELECT @ColumnList = STUFF((
        SELECT ', ' + QUOTENAME(FieldName)
        FROM SY_FormatFields
        WHERE FormName = @List
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
        
    IF @ColumnList IS NULL OR @ColumnList = ''
        SET @ColumnList = '*';

    -- Sinh cÃ¢u SQL Ä‘á»™ng (Tráº£ toÃ n bá»™ dá»¯ liá»‡u Ä‘á»ƒ C# Backend tá»± phÃ¢n trang)
    SET @sql = 'SELECT ' + @ColumnList + ' ' +
               ' FROM ' + QUOTENAME(@TableName) + @whereClause +
               @OrderByClause + ';';
    
    -- Cháº¡y lá»‡nh
    EXEC sp_executesql @sql, N'@kw NVARCHAR(200)', @kw = @Keyword;
END
GO

GO

IF OBJECT_ID('API_XoaDong', 'P') IS NOT NULL
    DROP PROCEDURE API_XoaDong;
GO

CREATE PROCEDURE [dbo].[API_XoaDong]
    @List VARCHAR(50),
    @Ids NVARCHAR(MAX) = '', -- Chuá»—i danh sÃ¡ch cÃ¡c ID cáº§n xoÃ¡, vÃ­ dá»¥: 'ID1,ID2,ID3'
    @UserName VARCHAR(50) = '', -- User thá»±c hiá»‡n xÃ³a
    @Data NVARCHAR(MAX) = '' -- Cá»¥c JSON dá»¯ liá»‡u dÃ²ng cáº§n xÃ³a tá»« Frontend
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName VARCHAR(100);
    DECLARE @PrimaryKey VARCHAR(100);
    
    -- Láº¥y thÃ´ng tin Báº£ng vÃ  KhÃ³a chÃ­nh (Tá»± Ä‘á»™ng thÃ­ch á»©ng náº¿u chÆ°a cÃ³ cá»™t SaveTableName trong SY_FrmLstTbl)
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SY_FrmLstTbl') AND name = 'SaveTableName')
    BEGIN
        DECLARE @SqlCheck NVARCHAR(MAX) = 
            N'SELECT @TN = COALESCE(SaveTableName, TableName), @PK = PrimaryKey FROM SY_FrmLstTbl WHERE FormID = @Form';
        EXEC sp_executesql @SqlCheck, 
            N'@TN VARCHAR(100) OUTPUT, @PK VARCHAR(100) OUTPUT, @Form VARCHAR(50)', 
            @TN = @TableName OUTPUT, @PK = @PrimaryKey OUTPUT, @Form = @List;
    END
    ELSE
    BEGIN
        SELECT 
            @TableName = TableName,
            @PrimaryKey = PrimaryKey
        FROM SY_FrmLstTbl 
        WHERE FormID = @List;
    END

    IF @TableName IS NULL OR @TableName = ''
    BEGIN
        SELECT -1 AS code, N'ChÆ°a cáº¥u hÃ¬nh TableName cho form ' + @List AS msg;
        RETURN;
    END

    IF @PrimaryKey IS NULL OR @PrimaryKey = ''
    BEGIN
        SELECT -1 AS code, N'ChÆ°a cáº¥u hÃ¬nh PrimaryKey cho form ' + @List AS msg;
        RETURN;
    END

    -- Chuáº©n hÃ³a casing cá»§a KhÃ³a chÃ­nh theo báº£ng váº­t lÃ½ (trÃ¡nh lá»—i Case-Sensitive)
    DECLARE @ExactPK VARCHAR(100);
    SELECT TOP 1 @ExactPK = name 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(@TableName) 
      AND LOWER(name) = LOWER(@PrimaryKey);
      
    IF @ExactPK IS NOT NULL
        SET @PrimaryKey = @ExactPK;

    -- Náº¿u @Ids rá»—ng, tá»± Ä‘á»™ng bÃ³c tÃ¡ch giÃ¡ trá»‹ khÃ³a chÃ­nh tá»« @Data gá»­i tá»« Frontend qua OPENJSON (trÃ¡nh lá»—i báº¯t buá»™c chuá»—i literal cá»§a JSON_VALUE)
    IF (ISNULL(@Ids, '') = '' OR @Ids = N'{Ids}') AND ISNULL(@Data, '') <> '' AND ISJSON(@Data) = 1
    BEGIN
        SELECT @Ids = CAST([value] AS NVARCHAR(MAX))
        FROM OPENJSON(@Data)
        WHERE LOWER([key]) COLLATE DATABASE_DEFAULT = LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT;
    END

    IF @Ids IS NULL OR @Ids = ''
    BEGIN
        SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y giÃ¡ trá»‹ KhÃ³a chÃ­nh (' + @PrimaryKey + N') Ä‘á»ƒ xÃ³a' AS msg;
        RETURN;
    END

    BEGIN TRY
        -- =========================================================
        -- Báº¢O Máº¬T: Kiá»ƒm tra quyá»n XÃ³a tá»« WA_UserGroupPermisstion
        -- =========================================================
        IF @UserName <> 'Admin'
        BEGIN
            DECLARE @HasPermission INT = 0;
            DECLARE @UserGrp VARCHAR(50);
            DECLARE @MenuID VARCHAR(50);

            SELECT @UserGrp = UserGroupID FROM SY_User WHERE UserName = @UserName;
            SELECT TOP 1 @MenuID = MenuID FROM WA_Menu WHERE FormName = @List;

            IF @MenuID IS NOT NULL AND @UserGrp IS NOT NULL
            BEGIN
                SELECT @HasPermission = IsDelete FROM WA_UserGroupPermisstion WHERE UserGroupID = @UserGrp AND MenuID = @MenuID;
                IF ISNULL(@HasPermission, 0) = 0
                BEGIN
                    SELECT -1 AS code, N'Lá»—i báº£o máº­t (RBAC): Báº¡n khÃ´ng cÃ³ quyá»n XÃ³a á»Ÿ chá»©c nÄƒng nÃ y!' AS msg;
                    RETURN;
                END
            END
        END
        -- =========================================================

        DECLARE @sql NVARCHAR(MAX) = '';
        DECLARE @RowsAffected INT = 0;
        
        -- Kiá»ƒm tra xem báº£ng cÃ³ há»— trá»£ XÃ³a má»m (cá»™t IsDeleted) hay khÃ´ng
        DECLARE @HasIsDeleted BIT = 0;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'IsDeleted')
            SET @HasIsDeleted = 1;

        IF @HasIsDeleted = 1
        BEGIN
            -- Thá»±c hiá»‡n XÃ³a má»m (Soft Delete)
            DECLARE @UpdateClause NVARCHAR(MAX) = 'IsDeleted = 1';
            
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedBy')
                SET @UpdateClause = @UpdateClause + ', DeletedBy = @User';
                
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedDate')
                SET @UpdateClause = @UpdateClause + ', DeletedDate = GETDATE()';
                
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'DeletedAt')
                SET @UpdateClause = @UpdateClause + ', DeletedAt = GETDATE()';

            SET @sql = 'UPDATE ' + QUOTENAME(@TableName) + ' SET ' + @UpdateClause + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' IN (SELECT value FROM string_split(@DeleteIds, '',''))';
                       
            EXEC sp_executesql @sql, N'@DeleteIds NVARCHAR(MAX), @User VARCHAR(50)', @DeleteIds = @Ids, @User = @UserName;
            SET @RowsAffected = @@ROWCOUNT;
            
            IF @RowsAffected > 0
                SELECT 0 AS code, N'ÄÃ£ xÃ³a má»m thÃ nh cÃ´ng ' + CAST(@RowsAffected AS VARCHAR) + N' dÃ²ng khá»i báº£ng ' + @TableName AS msg;
            ELSE
                SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u Ä‘á»ƒ xÃ³a trong báº£ng ' + @TableName AS msg;
        END
        ELSE
        BEGIN
            -- Thá»±c hiá»‡n XÃ³a cá»©ng (Hard Delete)
            SET @sql = 'DELETE FROM ' + QUOTENAME(@TableName) + 
                       ' WHERE ' + QUOTENAME(@PrimaryKey) + ' IN (SELECT value FROM string_split(@DeleteIds, '',''))';
                       
            EXEC sp_executesql @sql, N'@DeleteIds NVARCHAR(MAX)', @DeleteIds = @Ids;
            SET @RowsAffected = @@ROWCOUNT;
            
            IF @RowsAffected > 0
                SELECT 0 AS code, N'ÄÃ£ xÃ³a cá»©ng thÃ nh cÃ´ng ' + CAST(@RowsAffected AS VARCHAR) + N' dÃ²ng khá»i báº£ng ' + @TableName AS msg;
            ELSE
                SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u Ä‘á»ƒ xÃ³a trong báº£ng ' + @TableName AS msg;
        END
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lá»—i xÃ³a dá»¯ liá»‡u: ' + ERROR_MESSAGE() AS msg;
    END CATCH
END
GO

GO

USE [QLTiec]
GO

-- 1. Táº¡o API XÃ³a chuyÃªn dá»¥ng (XÃ³a sáº¡ch cáº£ sáº£nh tiá»‡c phá»¥)
CREATE OR ALTER PROCEDURE [dbo].[API_XoaKhachDen]
    @Ids NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- BÆ¯á»šC 1: XÃ³a dá»¯ liá»‡u á»Ÿ báº£ng con (Sáº£nh tiá»‡c) trÆ°á»›c
        DELETE FROM tbmk_Khachthamquansanhtiec 
        WHERE DocumentID IN (SELECT value FROM string_split(@Ids, ','));
        
        -- BÆ¯á»šC 2: XÃ³a dá»¯ liá»‡u á»Ÿ báº£ng cha
        DELETE FROM tbmk_Khachthamquan 
        WHERE DocumentID IN (SELECT value FROM string_split(@Ids, ','));
        
        DECLARE @Rows INT = @@ROWCOUNT;
        SELECT 0 AS code, N'ÄÃ£ xÃ³a thÃ nh cÃ´ng ' + CAST(@Rows AS VARCHAR) + N' phiáº¿u!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg;
    END CATCH
END
GO



GO

USE [QLTiec]
GO

/****** Object:  StoredProcedure [dbo].[API_XoaMenu] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_XoaMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @MenuID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Xóa phân quyền của các menu con
    DELETE FROM WA_UserGroupPermisstion WHERE MenuID IN (SELECT MenuID FROM WA_Menu WHERE Parent = @MenuID);
    DELETE FROM WA_UserPermisstion WHERE MenuID IN (SELECT MenuID FROM WA_Menu WHERE Parent = @MenuID);

    -- 2. Xóa phân quyền của menu hiện tại
    DELETE FROM WA_UserGroupPermisstion WHERE MenuID = @MenuID;
    DELETE FROM WA_UserPermisstion WHERE MenuID = @MenuID;

    -- 3. Xóa các menu con
    DELETE FROM WA_Menu WHERE Parent = @MenuID;

    -- 4. Xóa menu hiện tại
    DELETE FROM WA_Menu WHERE MenuID = @MenuID;

END
GO

GO

IF OBJECT_ID('API_XoaTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_XoaTruongGiaoDien;
GO

CREATE PROCEDURE API_XoaTruongGiaoDien
    @IDs varchar(max) = NULL,
    @FormName varchar(50) = NULL, -- Form gá»i API (frmFormBuilder)
    @UserName varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @IDs IS NULL OR @IDs = ''
    BEGIN
        SELECT 1 AS code, N'Thiáº¿u ID cáº§n xÃ³a' AS message;
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM SY_FormatFields
        WHERE LOWER(FormName) = LOWER('WA_BangThueTNCNFrm')
          AND AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL)
    )
        THROW 52603, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: khong xoa field legacy cua pilot.', 1;

    BEGIN TRY
        -- TÃ¡ch chuá»—i ID vÃ  xÃ³a (há»— trá»£ SQL Server 2016 trá»Ÿ lÃªn)
        DELETE FROM SY_FormatFields 
        WHERE AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL);

        SELECT 0 AS code, N'XÃ³a thÃ nh cÃ´ng' AS message;
    END TRY
    BEGIN CATCH
        SELECT 1 AS code, ERROR_MESSAGE() AS message;
    END CATCH
END
GO

GO

USE [QLTiec]
GO

-- 1. Cáº¥u hÃ¬nh báº£ng SY_FrmLstTbl (Äá»ƒ hÃ m API_TruyVanDong biáº¿t tÃªn báº£ng váº­t lÃ½ vÃ  khÃ³a chÃ­nh)
DELETE FROM SY_FrmLstTbl WHERE FormID IN ('frmKho', 'frmHanghoadinhluong', 'frmNhapKho', 'frmXuatKho', 'frmHanghoa');

INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmKho', 'dmKho', 'Khoid');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmHanghoa', 'dmHangHoa', 'Mahang'); -- NVL Map vá»›i dmHangHoa
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmHanghoadinhluong', 'dmHanghoadinhluong', 'UserAutoID');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmNhapKho', 'tbNhaphang', 'DocumentID');
INSERT INTO SY_FrmLstTbl (FormID, TableName, PrimaryKey) VALUES ('frmXuatKho', 'tbXuatnvl', 'DocumentID');

-- 2. Cáº¥u hÃ¬nh báº£ng WA_API (Sá»­a láº¡i cÃº phÃ¡p Para dÃ¹ng biáº¿n Ä‘á»‹nh danh @Param=N'...' Ä‘á»ƒ Gateway parse chuáº©n)
DELETE FROM WA_API WHERE list IN ('frmKho', 'frmHanghoadinhluong', 'frmNhapKho', 'frmXuatKho', 'frmHanghoa') AND func = 'View';

INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmHanghoa', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmHanghoadinhluong', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmNhapKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');
INSERT INTO WA_API (list, func, SQL, Para) VALUES ('frmXuatKho', 'View', 'API_TruyVanDong', '@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''');

GO

GO

USE [X26DIMTUTAC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[WA_PayRoll_Process_Stp] 
    @PeriodID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- 0. Khá»Ÿi Ä‘á»™ng cáº­p nháº­t tráº¡ng thÃ¡i cháº¥m cÃ´ng
        EXEC HR_TimeSheet_UpdateDailyStatus_Stp @Period = @PeriodID;
        
        DECLARE @FromDate DATE, @ToDate DATE, @ToDateDT DATETIME, @NgayCongChuan DECIMAL(18,2) = 26.0;

        SELECT @FromDate = CAST(FromDate AS DATE), @ToDate = CAST(ToDate AS DATE), @ToDateDT = ToDate 
        FROM dbo.SY_Period WHERE PeriodID = @PeriodID;

        IF @FromDate IS NULL 
        BEGIN 
            SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y ká»³ lÆ°Æ¡ng.' AS msg; 
            RETURN; 
        END;

        -- 1. Backup dá»¯ liá»‡u ká»³ hiá»‡n táº¡i Ä‘á»ƒ giá»¯ cÃ¡c chá»‰nh sá»­a tay
        DROP TABLE IF EXISTS #TmpBackup;
        SELECT PersonID, LuongTong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri 
        INTO #TmpBackup 
        FROM dbo.HR_PayrollTbl WHERE PeriodID = @PeriodID;

        -- 2. Dá»n dáº¹p báº£ng cÅ©
        DELETE D FROM dbo.HR_PayrollDetailTbl D INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = D.DocumentID WHERE H.PeriodID = @PeriodID;
        DELETE FROM dbo.HR_PayrollTbl WHERE PeriodID = @PeriodID;

        -- 3. Insert vá»›i logic "VÃ©t" dá»¯ liá»‡u ká»³ gáº§n nháº¥t
        INSERT INTO dbo.HR_PayrollTbl (DocumentID, DocumentDate, PeriodID, PersonID, PersonName, MucDong, LuongTong, TongLuong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri)
        SELECT 
            CAST(UPPER(@PeriodID + P.PersonID) AS VARCHAR(50)), @ToDateDT, @PeriodID, P.PersonID, P.PersonName, 
            ISNULL(B.MucDong, 0), 
            ISNULL(T.LuongTong, Old.LuongTong), 
            0, 
            ISNULL(T.SoNguoiPhuThuoc, ISNULL(Old.SoNguoiPhuThuoc, 0)),
            -- Æ¯u tiÃªn: Sá»­a tay thÃ¡ng nÃ y > Láº¥y tá»« thÃ¡ng trÆ°á»›c > Láº¥y má»©c Ä‘Ã³ng BH
            ISNULL(T.LuongCoBan, ISNULL(Old.LuongCoBan, ISNULL(B.MucDong, 0))),
            ISNULL(T.IsBH, ISNULL(Old.IsBH, 0)), 
            ISNULL(T.IsHuuTri, ISNULL(Old.IsHuuTri, 0))
        FROM dbo.HR_PersonTbl P
        LEFT JOIN #TmpBackup T ON P.PersonID = T.PersonID
        OUTER APPLY (
            -- TÃ¬m ká»³ lÆ°Æ¡ng gáº§n nháº¥t ÄÃƒ CÃ“ LÆ¯Æ NG (>0) cho nhÃ¢n viÃªn Ä‘Ã³
            SELECT TOP 1 LuongTong, SoNguoiPhuThuoc, LuongCoBan, IsBH, IsHuuTri 
            FROM dbo.HR_PayrollTbl 
            WHERE PersonID = P.PersonID 
            AND PeriodID < @PeriodID 
            AND LuongTong > 0 
            ORDER BY PeriodID DESC
        ) Old
        LEFT JOIN (
            SELECT BH.PersonID, BH.MucDong 
            FROM dbo.HR_BaoHiemChiTietTbl BH 
            INNER JOIN (SELECT PersonID, MAX(DocumentID) as MaxDoc FROM dbo.HR_BaoHiemChiTietTbl GROUP BY PersonID) L 
            ON BH.PersonID = L.PersonID AND BH.DocumentID = L.MaxDoc
        ) B ON P.PersonID = B.PersonID
        WHERE ISNULL(P.PersonID, '') <> '';

        -- 4. Báº£ng táº¡m tÃ­nh
        DROP TABLE IF EXISTS #ChamCong, #BaoHiemClean, #PhuCap, #LuongKhoan, #TmpPayrollDetail, #NhanVienPhanLoai;
        SELECT TS.PersonID, SUM(ISNULL(TS.SoNgayDiLam, 0) + ISNULL(TS.NghiPhep, 0) + ISNULL(TS.SoNgayLe, 0)) AS TongNgayCongThucTe INTO #ChamCong FROM dbo.HR_TimeSheetTbl TS WHERE TS.PeriodID = @PeriodID GROUP BY TS.PersonID;
        
        ;WITH CTE_BH AS (SELECT BH.PersonID, (ISNULL(BH.MucDongBHXHNLD, 0) + ISNULL(BH.MucDongBHYTNLD, 0) + ISNULL(BH.MucDongBHTNNLD, 0)) AS TongBH, ISNULL(BH.MucDong, 0) AS MucDong, ROW_NUMBER() OVER (PARTITION BY BH.PersonID ORDER BY M.PeriodID DESC) AS RN FROM dbo.HR_BaoHiemChiTietTbl BH INNER JOIN dbo.HR_BaoHiemTbl M ON BH.DocumentID = M.DocumentID WHERE M.PeriodID <= @PeriodID) 
        SELECT PersonID, TongBH, MucDong INTO #BaoHiemClean FROM CTE_BH WHERE RN = 1;
        
        SELECT PA.PersonID, SUM(CASE WHEN PA.MaPhuCap IN ('HOTROANCA', 'ANCA') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS AnCa, SUM(CASE WHEN PA.MaPhuCap IN ('HOTROXANGXE', 'XANGXE') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS XangXe, SUM(CASE WHEN PA.MaPhuCap IN ('HOTRODIENTHOAI', 'DIENTHOAI') THEN ISNULL(BPC.TienPhuCapThang, 0) ELSE 0 END) AS DienThoai INTO #PhuCap FROM dbo.HR_PersonAllowanceTbl PA LEFT JOIN dbo.HR_BangPhuCapTbl BPC ON BPC.MaPhuCap = PA.MaPhuCap GROUP BY PA.PersonID;
        SELECT LK.PersonID, SUM(ISNULL(LK.SoTienKhoan, 0)) AS SoTienKhoan INTO #LuongKhoan FROM dbo.HR_LuongKhoanTbl LK WHERE @ToDateDT BETWEEN LK.TuNgay AND ISNULL(LK.DenNgay, '2099-12-31') GROUP BY LK.PersonID;
        
        SELECT H.PersonID, H.DocumentID, CASE WHEN LK.PersonID IS NOT NULL THEN 1 ELSE 0 END AS IsKhoan 
        INTO #NhanVienPhanLoai FROM dbo.HR_PayrollTbl H LEFT JOIN #LuongKhoan LK ON H.PersonID = LK.PersonID WHERE H.PeriodID = @PeriodID;
        
        CREATE TABLE #TmpPayrollDetail (DocumentID VARCHAR(50), Code INT, Mota NVARCHAR(255), SoTien DECIMAL(18,0));

        -- 5. Insert cÃ¡c khoáº£n lÆ°Æ¡ng
        INSERT INTO #TmpPayrollDetail 
        SELECT 
            H.DocumentID, 
            10, 
            N'LÆ°Æ¡ng cÆ¡ báº£n', 
            CASE 
                WHEN H.PersonID = 'VP016' THEN 
                    -- VP016: DÃ¹ng LÆ°Æ¡ng khoÃ¡n (LK.SoTienKhoan) Ä‘á»ƒ tÃ­nh
                    ROUND((ISNULL(LK.SoTienKhoan, 0) / @NgayCongChuan) * ISNULL(CC.TongNgayCongThucTe, 0), 0)
                ELSE 
                    -- NgÆ°á»i khÃ¡c: DÃ¹ng LÆ°Æ¡ng cÆ¡ báº£n (H.LuongCoBan) bÃ¬nh thÆ°á»ng
                    ROUND((ISNULL(H.LuongCoBan, 0) / @NgayCongChuan) * ISNULL(CC.TongNgayCongThucTe, 0), 0)
            END
        FROM dbo.HR_PayrollTbl H 
        INNER JOIN #NhanVienPhanLoai NV ON H.DocumentID = NV.DocumentID 
        LEFT JOIN #ChamCong CC ON CC.PersonID = H.PersonID 
        LEFT JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID 
        WHERE H.PeriodID = @PeriodID 
        AND (NV.IsKhoan = 0 OR H.PersonID In ('VP016', 'ÃD251'));
        
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 11, N'HOTROANCA', ISNULL(PC.AnCa, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 12, N'HOTROXANGXE', ISNULL(PC.XangXe, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 13, N'HOTRODIENTHOAI', ISNULL(PC.DienThoai, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #PhuCap PC ON PC.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 14, N'LÆ°Æ¡ng khoÃ¡n', ISNULL(LK.SoTienKhoan, 0) FROM dbo.HR_PayrollTbl H INNER JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;
        INSERT INTO #TmpPayrollDetail SELECT H.DocumentID, 30, N'BHXH, BHYT, BHTN', CASE WHEN H.IsBH = 1 THEN ISNULL(B.TongBH, 0) ELSE 0 END FROM dbo.HR_PayrollTbl H LEFT JOIN #BaoHiemClean B ON B.PersonID = H.PersonID WHERE H.PeriodID = @PeriodID;

        INSERT INTO #TmpPayrollDetail 
        SELECT H.DocumentID, 44, N'ThÆ°á»Ÿng hiá»‡u suáº¥t', ROUND(((ISNULL(H.LuongTong, 0) - (ISNULL(B.MucDong, 0) + ISNULL(PC.AnCa, 0) + ISNULL(PC.XangXe, 0) + ISNULL(PC.DienThoai, 0))) * ISNULL(CC.TongNgayCongThucTe, 0)) / @NgayCongChuan, -3) 
        FROM dbo.HR_PayrollTbl H INNER JOIN #NhanVienPhanLoai NV ON H.DocumentID = NV.DocumentID LEFT JOIN #ChamCong CC ON CC.PersonID = H.PersonID LEFT JOIN #BaoHiemClean B ON B.PersonID = H.PersonID LEFT JOIN #PhuCap PC ON PC.PersonID = H.PersonID AND (NV.IsKhoan = 0 OR H.PersonID IN ('VP016', 'ÃD251'));

        -- 6. TÃ­nh thuáº¿
        INSERT INTO #TmpPayrollDetail 
        SELECT T.DocumentID, 20, N'Tá»•ng thu nháº­p', SUM(CASE WHEN Code = 14 AND H.PersonID = 'VP016'  THEN 0 ELSE SoTien END)
        FROM #TmpPayrollDetail T INNER JOIN dbo.HR_PayrollTbl H ON T.DocumentID = H.DocumentID WHERE Code IN (10, 11, 12, 13, 14, 44) GROUP BY T.DocumentID; 
        
        INSERT INTO #TmpPayrollDetail 
        SELECT H.DocumentID, 50, N'Thu nháº­p chá»‹u thuáº¿', 
        CASE WHEN H.PersonID In ('VP016','ÃD251') THEN ISNULL(T10.SoTien, 0)
             ELSE ISNULL(LK.SoTienKhoan, (ISNULL(T10.SoTien, 0) + ISNULL(T12.SoTien, 0) + ISNULL(T13.SoTien, 0) + ISNULL(T44.SoTien, 0) + ISNULL(T14.SoTien, 0))) END
        FROM dbo.HR_PayrollTbl H LEFT JOIN #LuongKhoan LK ON LK.PersonID = H.PersonID LEFT JOIN #TmpPayrollDetail T10 ON T10.DocumentID = H.DocumentID AND T10.Code = 10 
        LEFT JOIN #TmpPayrollDetail T12 ON T12.DocumentID = H.DocumentID AND T12.Code = 12 LEFT JOIN #TmpPayrollDetail T13 ON T13.DocumentID = H.DocumentID AND T13.Code = 13 
        LEFT JOIN #TmpPayrollDetail T44 ON T44.DocumentID = H.DocumentID AND T44.Code = 44 LEFT JOIN #TmpPayrollDetail T14 ON T14.DocumentID = H.DocumentID AND T14.Code = 14 WHERE H.PeriodID = @PeriodID;
        
        INSERT INTO #TmpPayrollDetail 
        SELECT T50.DocumentID, 60, N'Thu nháº­p tÃ­nh thuáº¿', CASE WHEN H.IsBH = 0 OR H.IsHuuTri = 1 THEN ISNULL(T50.SoTien, 0) WHEN H.SoNguoiPhuThuoc = 0 AND T50.SoTien > 15500000 THEN T50.SoTien - 15500000 WHEN H.SoNguoiPhuThuoc > 0 AND T50.SoTien > 21700000 THEN T50.SoTien - 21700000 ELSE 0 END 
        FROM #TmpPayrollDetail T50 INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = T50.DocumentID WHERE T50.Code = 50;

        INSERT INTO #TmpPayrollDetail 
        SELECT T60.DocumentID, 31, N'Thuáº¿ TNCN', CASE WHEN H.IsBH = 0 OR H.IsHuuTri = 1 THEN ROUND(ISNULL(T60.SoTien, 0) * 0.1, 0) ELSE ROUND(ISNULL(T60.SoTien, 0) * 0.05, 0) END 
        FROM #TmpPayrollDetail T60 INNER JOIN dbo.HR_PayrollTbl H ON H.DocumentID = T60.DocumentID WHERE T60.Code = 60;
        
        UPDATE H SET H.TongLuong = ISNULL(T20.SoTien, 0) - ISNULL(H.TienBuTru, 0) FROM dbo.HR_PayrollTbl H LEFT JOIN #TmpPayrollDetail T20 ON T20.DocumentID = H.DocumentID AND T20.Code = 20 WHERE H.PeriodID = @PeriodID;
        
        INSERT INTO dbo.HR_PayrollDetailTbl (UserAutoID, DocumentID, Code, Mota, SoTien, Notes) 
        SELECT CONVERT(VARCHAR(50), NEWID()), T.DocumentID, T.Code, T.Mota, T.SoTien, '' 
        FROM #TmpPayrollDetail T;

        SELECT 0 AS code, N'TÃ­nh báº£ng lÆ°Æ¡ng thÃ nh cÃ´ng cho ká»³ ' + @PeriodID + '!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lá»—i tÃ­nh lÆ°Æ¡ng: ' + ERROR_MESSAGE() AS msg;
    END CATCH
END

GO

USE [X26DIMTUTAC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[WA_TimeSheetDay_Process_Stp] 
    @PeriodID VARCHAR(10),
    @BranchID NVARCHAR(MAX) = ''
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_WARNINGS OFF;
    SET DATEFIRST 1; -- Thá»© 2 = 1, Thá»© 7 = 6, Chá»§ nháº­t = 7

    BEGIN TRY
        DECLARE 
            @FromDate DATETIME, 
            @ToDate DATETIME;

        SELECT 
            @FromDate = FromDate,
            @ToDate = ToDate
        FROM dbo.SY_Period
        WHERE PeriodID = @PeriodID;

        IF @FromDate IS NULL 
        BEGIN
            SELECT -1 AS code, N'KhÃ´ng tÃ¬m tháº¥y ká»³ cháº¥m cÃ´ng ' + @PeriodID AS msg;
            RETURN;
        END;

        -- 1. XoÃ¡ dá»¯ liá»‡u cÅ© theo ká»³ vÃ  chi nhÃ¡nh
        DELETE T
        FROM dbo.HR_TimeSheetDayTbl T
        INNER JOIN dbo.HR_PersonTbl P
            ON T.PersonID = P.PersonID
        WHERE T.PeriodID = @PeriodID
          AND (@BranchID = '' OR P.BranchID = @BranchID);

        -- 2. TÃ­nh toÃ¡n vÃ  chÃ¨n dá»¯ liá»‡u cháº¥m cÃ´ng má»›i
        ;WITH Attendance AS
        (
            SELECT
                LTRIM(RTRIM(CAST(A.UserID AS NVARCHAR(50)))) AS UserID_Clean,
                CAST(A.EventTime AS DATE) AS Ngay,
                MIN(A.EventTime) AS GioVao,
                MAX(A.EventTime) AS GioRa
            FROM X26DIMTUTACACS.dbo.AC_EventTbl A
            WHERE A.EventTime >= @FromDate
              AND A.EventTime < DATEADD(DAY, 1, @ToDate)
            GROUP BY
                LTRIM(RTRIM(CAST(A.UserID AS NVARCHAR(50)))),
                CAST(A.EventTime AS DATE)
        )
        INSERT INTO dbo.HR_TimeSheetDayTbl
        (
            UserAutoID,
            PersonID,
            PeriodID,
            Ngay,
            ThoiGianVao,
            ThoiGianRa,
            SoCong,
            GhiChu,
            LyDo
        )
        SELECT
            P.PersonID + FORMAT(A.Ngay, 'ddMMyyyy') AS UserAutoID,
            P.PersonID,
            @PeriodID AS PeriodID,
            A.Ngay,
            V.ActualVao AS ThoiGianVao,
            V.ActualRa AS ThoiGianRa,

            CASE
                WHEN FinalShift.ShiftID IS NULL THEN 0
                WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL THEN 0
                WHEN DATEPART(WEEKDAY, A.Ngay) = 7 THEN 0

                -- LÃ m Ä‘á»§ sá»‘ phÃºt cá»§a ca thÃ¬ láº¥y sá»‘ cÃ´ng khai bÃ¡o trong HR_ShiftListTbl
                WHEN W.TongPhutLam >= Q.PhutCaQuyDinh
                    THEN ISNULL(SH.SoCong, 1)

                ELSE 0
            END AS SoCong,

            CASE
                WHEN FinalShift.ShiftID IS NULL THEN N'KhÃ´ng cÃ³ ca'
                WHEN DATEPART(WEEKDAY, A.Ngay) = 7 THEN N'Chá»§ nháº­t'
                WHEN FinalShift.SapCaID IS NOT NULL 
                    THEN N'TÃ­nh theo sáº¯p ca: ' + ISNULL(SH.ShiftName, FinalShift.ShiftID)
                ELSE 
                    N'TÃ­nh theo ca tá»± Ä‘á»™ng: ' + ISNULL(SH.ShiftName, FinalShift.ShiftID)
            END AS GhiChu,

            CASE
                WHEN FinalShift.ShiftID IS NULL
                    THEN N'KhÃ´ng cÃ³ sáº¯p ca vÃ  khÃ´ng cÃ³ ca tá»± Ä‘á»™ng'

                WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL
                    THEN N'KhÃ´ng Ä‘á»§ dá»¯ liá»‡u cháº¥m cÃ´ng'

                WHEN DATEPART(WEEKDAY, A.Ngay) = 7
                    THEN N'Chá»§ nháº­t khÃ´ng tÃ­nh cÃ´ng thÆ°á»ng'

                WHEN W.TongPhutLam < Q.PhutCaQuyDinh
                    THEN N'ChÆ°a Ä‘á»§ giá» cÃ´ng. LÃ m '
                         + CAST(W.TongPhutLam AS NVARCHAR(20))
                         + N' phÃºt / cáº§n '
                         + CAST(Q.PhutCaQuyDinh AS NVARCHAR(20))
                         + N' phÃºt'

                ELSE N'Äá»§ giá» cÃ´ng'
            END AS LyDo

        FROM Attendance A

        INNER JOIN dbo.HR_PersonTbl P
            ON LTRIM(RTRIM(CAST(P.UserID AS NVARCHAR(50)))) = A.UserID_Clean

        OUTER APPLY
        (
            SELECT TOP 1
                CT.SapCaID,
                CT.ShiftID
            FROM dbo.HR_SapCaChiTietTbl CT
            WHERE CT.PersonID = P.PersonID
              AND CAST(CT.NgayLamViec AS DATE) = A.Ngay
            ORDER BY CT.UserAutoID DESC
        ) SCCT

        OUTER APPLY
        (
            SELECT TOP 1
                SC.SapCaID,
                CASE DATEPART(WEEKDAY, A.Ngay)
                    WHEN 1 THEN SC.ShiftIDThu2
                    WHEN 2 THEN SC.ShiftIDThu3
                    WHEN 3 THEN SC.ShiftIDThu4
                    WHEN 4 THEN SC.ShiftIDThu5
                    WHEN 5 THEN SC.ShiftIDThu6
                    WHEN 6 THEN SC.ShiftIDThu7
                    WHEN 7 THEN SC.ShiftIDChuNhat
             END AS ShiftID
            FROM dbo.HR_SapCaTbl SC
            WHERE SC.SapCaID = SCCT.SapCaID
              AND A.Ngay >= CAST(SC.TuNgay AS DATE)
              AND A.Ngay <= CAST(SC.DenNgay AS DATE)
        ) SCTuSapCaID

        OUTER APPLY
        (
            SELECT TOP 1
                SC.SapCaID,
                CASE DATEPART(WEEKDAY, A.Ngay)
                    WHEN 1 THEN SC.ShiftIDThu2
                    WHEN 2 THEN SC.ShiftIDThu3
                    WHEN 3 THEN SC.ShiftIDThu4
                    WHEN 4 THEN SC.ShiftIDThu5
                    WHEN 5 THEN SC.ShiftIDThu6
                    WHEN 6 THEN SC.ShiftIDThu7
                    WHEN 7 THEN SC.ShiftIDChuNhat
                END AS ShiftID
            FROM dbo.HR_SapCaChiTietTbl CT
            INNER JOIN dbo.HR_SapCaTbl SC
                ON SC.SapCaID = CT.SapCaID
            WHERE CT.PersonID = P.PersonID
              AND A.Ngay >= CAST(SC.TuNgay AS DATE)
              AND A.Ngay <= CAST(SC.DenNgay AS DATE)
            ORDER BY SC.SapCaID DESC
        ) SCTuLichTuan

        -- Náº¿u khÃ´ng cÃ³ sáº¯p ca thÃ¬ láº¥y ca tá»± Ä‘á»™ng trong HR_ShiftListTbl
        -- Thá»© 2-6: láº¥y ca HC tá»± Ä‘á»™ng
        -- Thá»© 7: láº¥y ca T7_SANG tá»± Ä‘á»™ng
        OUTER APPLY
        (
            SELECT TOP 1
                SH2.ShiftID
            FROM dbo.HR_ShiftListTbl SH2
            WHERE ISNULL(SH2.CaTuDong, 0) = 1
              AND (
                    (DATEPART(WEEKDAY, A.Ngay) BETWEEN 1 AND 5 AND SH2.ShiftID = 'HC')
                 OR (DATEPART(WEEKDAY, A.Ngay) = 6 AND SH2.ShiftID = 'T7_SANG')
              )
            ORDER BY SH2.ShiftID
        ) AutoShift

        OUTER APPLY
        (
            SELECT
                COALESCE
                (
                    SCCT.ShiftID,
                    SCTuSapCaID.ShiftID,
                    SCTuLichTuan.ShiftID,
                    AutoShift.ShiftID
                ) AS ShiftID,

                COALESCE
                (
                    SCCT.SapCaID,
                    SCTuSapCaID.SapCaID,
                    SCTuLichTuan.SapCaID
                ) AS SapCaID
        ) FinalShift

        LEFT JOIN dbo.HR_ShiftListTbl SH
            ON SH.ShiftID = FinalShift.ShiftID

        LEFT JOIN dbo.HR_TimeSheetDayEditTbl E
            ON P.PersonID = E.PersonID
           AND A.Ngay = CAST(E.ThoiGianVao AS DATE)

        CROSS APPLY
        (
            SELECT
                ISNULL(E.ThoiGianVao, A.GioVao) AS ActualVao,
                ISNULL(E.ThoiGianRa, A.GioRa) AS ActualRa
        ) RealTime

        CROSS APPLY
        (
            SELECT
                RealTime.ActualVao,
                RealTime.ActualRa
        ) V

        CROSS APPLY
        (
            SELECT
                CASE
                    WHEN V.ActualVao IS NULL OR V.ActualRa IS NULL THEN 0
                    WHEN V.ActualRa < V.ActualVao THEN 0
                    ELSE DATEDIFF(MINUTE, V.ActualVao, V.ActualRa)
                END AS TongPhutLam
        ) W

        CROSS APPLY
        (
            SELECT
                CASE
                    WHEN SH.GioBatDau IS NULL OR SH.GioKetThuc IS NULL THEN 0

                    WHEN CAST(SH.GioKetThuc AS TIME) < CAST(SH.GioBatDau AS TIME)
                        THEN DATEDIFF
                        (
                            MINUTE,
                            CAST(SH.GioBatDau AS TIME),
                            CAST(SH.GioKetThuc AS TIME)
                        ) + 1440

                    ELSE DATEDIFF
                    (
                        MINUTE,
                        CAST(SH.GioBatDau AS TIME),
                        CAST(SH.GioKetThuc AS TIME)
                    )
                END AS PhutCaQuyDinh
        ) Q

        WHERE (@BranchID = '' OR P.BranchID = @BranchID);

        SELECT 0 AS code, N'Táº¡o báº£ng cháº¥m cÃ´ng thÃ nh cÃ´ng cho ká»³ ' + @PeriodID + N'!' AS msg;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, N'Lá»—i táº¡o báº£ng cháº¥m cÃ´ng: ' + ERROR_MESSAGE() AS msg;
    END CATCH

    SET ANSI_WARNINGS ON;
END
GO

GO

