USE [X26DIMTUTAC];
GO

CREATE OR ALTER PROCEDURE dbo.API_KinhPhiCongDoan
    @Keyword  nvarchar(100) = NULL,
    @BranchID varchar(max)   = NULL,
    @PeriodID varchar(50)    = NULL,
    @PhongBan nvarchar(100)  = NULL,
    @User     varchar(50)    = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword  = NULLIF(LTRIM(RTRIM(@Keyword)), N'');
    SET @BranchID = NULLIF(LTRIM(RTRIM(@BranchID)), '');
    SET @PeriodID = NULLIF(LTRIM(RTRIM(@PeriodID)), '');
    SET @PhongBan = NULLIF(LTRIM(RTRIM(@PhongBan)), N'');
    SET @User     = NULLIF(LTRIM(RTRIM(@User)), '');

    /*
      Khi frontend không truyền BranchID, lấy danh sách chi nhánh
      được phân quyền của user.
    */
    IF @BranchID IS NULL AND @User IS NOT NULL
    BEGIN
        SELECT TOP (1)
            @BranchID =
                NULLIF(LTRIM(RTRIM(U.BranchID)), '')
        FROM dbo.SY_User AS U
        WHERE U.UserName = @User
          AND ISNULL(U.Disable, 0) = 0;
    END;

    /*
      Trả dữ liệu giống Desktop App:

      SELECT TOP 1000 HR_KinhPhiCongDoanTbl.*, A.LoaiHD
      FROM HR_KinhPhiCongDoanTbl
      LEFT JOIN HR_PersonView A ...
    */
    SELECT TOP (1000)
        KP.*,
        A.LoaiHD
    FROM dbo.HR_KinhPhiCongDoanTbl AS KP
    LEFT JOIN dbo.HR_PersonView AS A
        ON A.PersonID = KP.PersonID
    WHERE
        (
            @Keyword IS NULL
            OR KP.PersonID LIKE N'%' + @Keyword + N'%'
            OR KP.PersonName LIKE N'%' + @Keyword + N'%'
        )
        AND
        (
            @BranchID IS NULL
            OR A.BranchID IN
            (
                SELECT LTRIM(RTRIM(S.value))
                FROM STRING_SPLIT(@BranchID, ',') AS S
                WHERE NULLIF(LTRIM(RTRIM(S.value)), '') IS NOT NULL
            )
        )
        AND
        (
            @PeriodID IS NULL
            OR KP.PeriodID = @PeriodID
        )
        AND
        (
            @PhongBan IS NULL
            OR A.PhongBan = @PhongBan
        )
    ORDER BY
        KP.PersonID,
        KP.UserAutoID DESC;
END;
GO
-- =========================================================================
-- Helper API: Lấy danh sách nhân viên kèm tính toán Kinh Phí Công Đoàn
-- Dùng để làm nguồn dữ liệu (DataSource) tìm kiếm chọn nhân viên cho Form
-- Tự động trả về các trường tính toán để Frontend tự động map vào Form
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
        -- Tính toán các trường tự động
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