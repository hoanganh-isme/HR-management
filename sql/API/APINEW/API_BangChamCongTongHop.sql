USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BangChamCongTongHop] - BẢNG CHẤM CÔNG TỔNG HỢP CHO WEB APP
-- Tự động ánh xạ tiêu đề tiếng Việt qua từ điển SY_FmtFldTbl của V2
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BangChamCongTongHop
(
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Giải mã các tham số lọc từ JSON bộ lọc gửi lên từ Web
    DECLARE @PeriodID VARCHAR(50) = NULL;
    DECLARE @PhongBan NVARCHAR(50) = NULL;
    DECLARE @JsonBranchID NVARCHAR(MAX) = NULL;

    IF ISNULL(@Data, '') <> '' AND ISJSON(@Data) > 0
    BEGIN
        SET @PeriodID = JSON_VALUE(@Data, '$.PeriodID');
        SET @PhongBan = JSON_VALUE(@Data, '$.PhongBan');
        SET @JsonBranchID = JSON_VALUE(@Data, '$.BranchID');
    END

    IF ISNULL(@BranchID, '') = '' AND ISNULL(@JsonBranchID, '') <> ''
    BEGIN
        SET @BranchID = @JsonBranchID;
    END

    -- Truy vấn dữ liệu bảng chấm công kết hợp thông tin nhân viên từ HR_PersonView (Bao gồm GioiTinh, PersonName, PhongBan, BranchID, LoaiHD)
    SELECT TOP 1000
        t.*,
        A.PersonName,
        A.GioiTinh,
        A.PhongBan,
        A.BranchID,
        A.LoaiHD
    FROM dbo.HR_TimeSheetTbl t
    LEFT JOIN dbo.HR_PersonView A ON t.PersonID = A.PersonID
    WHERE 
        (
            ISNULL(@BranchID, '') = '' 
            OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','))
        )
        AND (@PeriodID IS NULL OR @PeriodID = '' OR t.PeriodID = @PeriodID)
        AND (@PhongBan IS NULL OR @PhongBan = '' OR A.PhongBan = @PhongBan)
        AND (
            @Keyword = ''
            OR t.PersonID LIKE '%' + @Keyword + '%'
            OR A.PersonName LIKE N'%' + @Keyword + '%'
            OR A.PhongBan LIKE N'%' + @Keyword + '%'
        )
    ORDER BY 
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir = 'DESC' THEN t.PeriodID END DESC,
        CASE WHEN @SortColumn = 'PeriodID' AND @SortDir <> 'DESC' THEN t.PeriodID END ASC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir = 'DESC' THEN t.PersonID END DESC,
        CASE WHEN @SortColumn = 'PersonID' AND @SortDir <> 'DESC' THEN t.PersonID END ASC,
        t.PersonID ASC;
END
GO

-- Cấu hình định tuyến Gateway
DELETE FROM dbo.WA_API WHERE list = 'WA_TimeSheetFrm' AND func = 'View';

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES (
    'WA_TimeSheetFrm', 
    'View', 
    'API_BangChamCongTongHop', 
    '@Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
);
GO
