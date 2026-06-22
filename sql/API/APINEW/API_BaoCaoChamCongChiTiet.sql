USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCongChiTiet] - BÁO CÁO CHẤM CÔNG CHI TIẾT DÙNG TRÊN WEB APP
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

    -- Tránh việc truyền chuỗi trống '' hoặc '{Ngay}' từ Web gây lỗi convert ngày
    DECLARE @NgayLoc DATE = NULL;
    IF ISNULL(@Ngay, '') <> '' AND @Ngay <> '1900-01-01' AND @Ngay NOT LIKE '%{Ngay}%' AND ISDATE(@Ngay) = 1
    BEGIN
        SET @NgayLoc = CAST(@Ngay AS DATE);
    END

    -- Nếu cả hai lọc Kỳ và Ngày đều trống, tự động lấy Kỳ mới nhất
    IF @PeriodID = '' AND @NgayLoc IS NULL
 BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetDayTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback nếu bảng chấm công chi tiết hoàn toàn trống thì lấy kỳ mới nhất của hệ thống
        IF ISNULL(@PeriodID, '') = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END
 
    -- Thực hiện xử lý chấm công hàng ngày tương tự như Desktop App
    EXEC dbo.HR_TimeSheetDay_Process_Stp 
        @Period = @PeriodID, 
        @BranchID = @BranchID;
 
    -- SELECT các cột giao diện cần dùng, tránh trùng tên cột gây lỗi 500 khi API Gateway convert sang JSON
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
        SELECT TOP 1 HD_Sub.ChucDanhChuyenMon AS ChucDanh
        FROM dbo.HR_HopDongTbl HD_Sub
        WHERE HD_Sub.PersonID = P.PersonID
        ORDER BY HD_Sub.NgayKyHopDong DESC
    ) HD
    WHERE 
        (@PeriodID = '' OR T.PeriodID = @PeriodID)
        AND (@NgayLoc IS NULL OR CAST(T.Ngay AS DATE) = @NgayLoc)
        AND (
            @BranchID = '' 
            -- Dùng "Value" (chữ V hoa) để tương thích phân biệt hoa/thường (Case-Sensitive Collation)
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
