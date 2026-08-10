USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- [API_BaoCaoChamCongChiTiet] - BÁO CÁO CHẤM CÔNG CHI TIẾT DÙNG TRÊN WEB APP
-- =========================================================================
ALTER PROCEDURE dbo.API_BaoCaoChamCongChiTiet
(
    @Template VARCHAR(50) = '',
    @Ngay NVARCHAR(50) = '',
    @PeriodID NVARCHAR(50) = '',
    @BranchID NVARCHAR(MAX) = '',
    @Keyword NVARCHAR(200) = '',
    @ReadOnly BIT = 0
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
 
    -- Desktop chỉ xử lý lại dữ liệu khi người dùng yêu cầu chạy báo cáo.
    -- Màn web là viewer nên truyền @ReadOnly = 1 để tuyệt đối không ghi DB.
    IF ISNULL(@ReadOnly, 0) = 0 AND @PeriodID <> ''
    BEGIN
        EXEC dbo.HR_TimeSheetDay_Process_Stp
            @Period = @PeriodID,
            @BranchID = @BranchID;
    END;

    /*
       Desktop trả T.*, P.*. Web cũng lấy schema trực tiếp từ hai bảng này,
       nhưng sinh danh sách P.* động và loại mọi tên trùng với T.* để JSON
       gateway luôn hợp lệ. Khi DB thêm field nhân viên/chấm công, web tự nhận
       field mới mà không cần cập nhật SY_FormatFields.
    */
    DECLARE @PersonColumns NVARCHAR(MAX);
    SELECT @PersonColumns = STUFF((
        SELECT N', P.' + QUOTENAME(PC.name)
        FROM sys.columns PC
        WHERE PC.object_id = OBJECT_ID(N'dbo.HR_PersonTbl')
          AND NOT EXISTS (
              SELECT 1
              FROM sys.columns TC
              WHERE TC.object_id = OBJECT_ID(N'dbo.HR_TimeSheetDayTbl')
                AND TC.name = PC.name
          )
        ORDER BY PC.column_id
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 2, N'');

    DECLARE @SQL NVARCHAR(MAX) = N'
        SELECT T.*'
        + CASE WHEN ISNULL(@PersonColumns, N'') = N'' THEN N'' ELSE N', ' + @PersonColumns END
        + N', HD.ChucDanh AS ChucDanhHopDong
        FROM dbo.HR_TimeSheetDayTbl T
        LEFT JOIN dbo.HR_PersonTbl P ON T.PersonID = P.PersonID
        OUTER APPLY (
            SELECT TOP 1 HD_Sub.ChucDanhChuyenMonHD AS ChucDanh
            FROM dbo.HR_HopDongTbl HD_Sub
            WHERE HD_Sub.PersonID = P.PersonID
            ORDER BY HD_Sub.NgayKyHopDong DESC
        ) HD
        WHERE (@PeriodID = N'''' OR T.PeriodID = @PeriodID)
          AND (@NgayLoc IS NULL OR CAST(T.Ngay AS DATE) = @NgayLoc)
          AND (
              @BranchID = N''''
              OR P.BranchID IN (
                  SELECT Value
                  FROM dbo.SY_String2TableFnc(REPLACE(@BranchID, N'','', N'';''))
              )
          )
          AND (
              @Keyword = N''''
              OR T.PersonID LIKE N''%'' + @Keyword + N''%''
              OR P.PersonName LIKE N''%'' + @Keyword + N''%''
              OR P.PhongBan LIKE N''%'' + @Keyword + N''%''
          )
        ORDER BY T.PeriodID DESC, P.PhongBan, T.PersonID, T.Ngay;';

    EXEC sys.sp_executesql
        @SQL,
        N'@PeriodID NVARCHAR(50), @NgayLoc DATE, @BranchID NVARCHAR(MAX), @Keyword NVARCHAR(200)',
        @PeriodID = @PeriodID,
        @NgayLoc = @NgayLoc,
        @BranchID = @BranchID,
        @Keyword = @Keyword;
END
GO
