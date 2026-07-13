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
        BranchID, -- Đã thêm cột này
        Disable,
        EmployeeID,
        Manager
    FROM SY_User
    WHERE (@Keyword IS NULL OR @Keyword = '' 
           OR UserName LIKE '%' + @Keyword + '%')
    ORDER BY UserName ASC;
END
GO
