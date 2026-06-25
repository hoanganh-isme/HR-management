CREATE OR ALTER PROCEDURE [dbo].[API_KinhPhiCongDoan]
    @Keyword NVARCHAR(100) = NULL,
    @BranchID VARCHAR(MAX) = NULL,
    @PhongBan NVARCHAR(150) = NULL,
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Nếu không truyền BranchID, lấy danh sách chi nhánh được phân quyền của User
    IF ISNULL(@BranchID, '') = '' AND ISNULL(@User, '') <> ''
    BEGIN
        -- Giả định hàm có sẵn dựa trên file mẫu WinForm của bạn
        -- Nếu hệ thống Web lưu kiểu khác, có thể lấy trực tiếp từ bảng phân quyền
        SET @BranchID = (SELECT TOP 1 BranchID FROM dbo.HR_GetBrachIDByUserStp(@User))
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
        P.PhongBan,
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
        
        -- Bộ lọc Phòng ban
        AND (ISNULL(@PhongBan, '') = '' 
             OR P.PhongBan = @PhongBan)
    ORDER BY P.PhongBan, KP.PersonID;
END
GO