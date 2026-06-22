USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BangChamCongTongHop] - LẤY DỮ LIỆU BẢNG CHẤM CÔNG THÁNG CHO WEB APP
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

    -- Giải mã các tham số lọc từ JSON bộ lọc gửi lên từ Web
    DECLARE @PeriodID VARCHAR(50) = NULL;
    DECLARE @PhongBan NVARCHAR(50) = NULL;

    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        SET @PeriodID = JSON_VALUE(@Data, '$.PeriodID');
        SET @PhongBan = JSON_VALUE(@Data, '$.PhongBan');
    END

    -- Truy vấn kết hợp dữ liệu bảng chấm công và bảng nhân viên
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
        (@PeriodID IS NULL OR t.PeriodID = @PeriodID)
        -- Bộ lọc Phòng ban (PhongBan)
        AND (@PhongBan IS NULL OR p.PhongBan = @PhongBan)
        -- Tìm kiếm chung theo Keyword (Mã NV hoặc Tên NV)
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
        -- Sắp xếp mặc định theo Kỳ lương giảm dần, Mã nhân viên tăng dần
        t.PeriodID DESC, t.PersonID ASC;
END
GO
