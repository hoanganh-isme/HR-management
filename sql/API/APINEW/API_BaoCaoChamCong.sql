USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCong] - STORED PROCEDURE CHO BÁO CÁO CHẤM CÔNG (WA_TimeSheetReport)
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

    -- Nếu kỳ lương trống, tự động lấy kỳ lương mới nhất
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
        -- Bộ lọc Kỳ lương (PeriodID)
        (@PeriodID = '' OR t.PeriodID = @PeriodID)
        -- Bộ lọc Phòng ban (PhongBan)
        AND (@PhongBan = '' OR p.PhongBan = @PhongBan)
        -- Tìm kiếm chung theo Keyword (Mã NV hoặc Tên NV)
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
