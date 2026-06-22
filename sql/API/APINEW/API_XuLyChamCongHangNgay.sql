USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_XuLyChamCongHangNgay] - LẤY DỮ LIỆU XỬ LÝ CHẤM CÔNG HÀNG NGÀY CHO WEB APP
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

    -- Giải mã các tham số lọc từ JSON bộ lọc gửi lên từ Web
    DECLARE @PeriodID VARCHAR(50) = NULL;
    DECLARE @BranchID NVARCHAR(50) = NULL;
    DECLARE @PhongBan NVARCHAR(50) = NULL;
    DECLARE @NgayLoc VARCHAR(50) = NULL;

    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        SET @PeriodID = JSON_VALUE(@Data, '$.PeriodID');
        SET @BranchID = JSON_VALUE(@Data, '$.BranchID');
        SET @PhongBan = JSON_VALUE(@Data, '$.PhongBan');
        SET @NgayLoc = JSON_VALUE(@Data, '$.Ngay');
    END

    -- Nếu lọc Kỳ trống, tự động lấy Kỳ mới nhất để tránh trống dữ liệu lúc load trang
    IF ISNULL(@PeriodID, '') = '' AND ISNULL(@NgayLoc, '') = ''
    BEGIN
        SELECT TOP 1 @PeriodID = PeriodID 
        FROM dbo.HR_TimeSheetDayTbl 
        ORDER BY PeriodID DESC;
        
        -- Fallback nếu bảng chấm công trống hoàn toàn
        IF ISNULL(@PeriodID, '') = ''
        BEGIN
            SELECT TOP 1 @PeriodID = PeriodID 
            FROM dbo.SY_Period 
            ORDER BY FromDate DESC;
        END
    END

    -- Truy vấn kết hợp dữ liệu bảng chấm công chi tiết và thông tin nhân viên
    -- Lưu ý: Cần chọn cột UserAutoID làm khoá chính để thực hiện chức năng Thêm/Sửa/Xoá trên Grid
    SELECT 
        T.PersonID,
        P.PersonName,
        P.PhongBan,
        P.BranchID,
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
    LEFT JOIN dbo.HR_PersonTbl P ON T.PersonID = P.PersonID
    WHERE 
        -- Bộ lọc Kỳ lương (PeriodID)
        (@PeriodID IS NULL OR @PeriodID = '' OR T.PeriodID = @PeriodID)
        -- Bộ lọc Chi nhánh (BranchID)
        AND (@BranchID IS NULL OR @BranchID = '' OR P.BranchID = @BranchID)
        -- Bộ lọc Bộ phận (PhongBan)
        AND (@PhongBan IS NULL OR @PhongBan = '' OR P.PhongBan = @PhongBan)
        -- Bộ lọc Ngày (Ngay)
        AND (
            ISNULL(@NgayLoc, '') = '' 
            OR @NgayLoc = '1900-01-01'
            OR CAST(T.Ngay AS DATE) = CAST(@NgayLoc AS DATE)
        )
        -- Tìm kiếm chung theo Keyword (Mã NV hoặc Tên NV)
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
        -- Sắp xếp mặc định
        T.Ngay DESC, T.PersonID ASC;
END
GO
