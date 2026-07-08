CREATE OR ALTER PROCEDURE [dbo].[API_KinhPhiCongDoan]
    @Keyword NVARCHAR(100) = NULL,
    @BranchID VARCHAR(MAX) = NULL,
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Nếu không truyền BranchID, lấy danh sách chi nhánh được phân quyền của User
    IF ISNULL(@BranchID, '') = '' AND ISNULL(@User, '') <> ''
    BEGIN
        -- Lấy trực tiếp từ bảng tài khoản người dùng SY_User
        SET @BranchID = (SELECT TOP 1 BranchID FROM dbo.SY_User WHERE UserName = @User)
    END

    -- 2. Truy vấn dữ liệu chính trả về cho Grid trên Web
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
        -- Bộ lọc từ khóa (Tìm theo mã hoặc tên nhân viên)
        (ISNULL(@Keyword, '') = '' 
         OR KP.PersonID LIKE '%' + @Keyword + '%' 
         OR KP.PersonName LIKE N'%' + @Keyword + '%')
        
        -- Bộ lọc Chi nhánh (Hỗ trợ chọn nhiều chi nhánh dạng chuỗi cắt STRING_SPLIT)
        AND (ISNULL(@BranchID, '') = '' 
             OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY  KP.PersonID;
END
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