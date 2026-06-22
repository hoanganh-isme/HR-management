CREATE OR ALTER PROCEDURE [dbo].[API_LuuTaiKhoan]
    @UserName nvarchar(50),
    @HoTen nvarchar(100) = NULL,
    @UserGroupID varchar(50) = NULL,
    @Disable bit = 0,
    @EmployeeID nvarchar(50) = NULL,
    @Manager nvarchar(50) = NULL,
    @Password nvarchar(255) = NULL,

    -- Các tham số hệ thống
    @FormName VARCHAR(50) = NULL,
    @User VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SY_User WHERE UserName = @UserName)
    BEGIN
        -- Update
        UPDATE SY_User
        SET HoTen = ISNULL(@HoTen, HoTen),
            UserGroupID = ISNULL(@UserGroupID, UserGroupID),
            Disable = ISNULL(@Disable, Disable),
            EmployeeID = ISNULL(@EmployeeID, EmployeeID),
            Manager = ISNULL(@Manager, Manager),
            -- Chỉ update password nếu người dùng có truyền vào
            Password = ISNULL(@Password, Password)
        WHERE UserName = @UserName;
    END
    ELSE
    BEGIN
        -- Insert
        INSERT INTO SY_User (UserName, HoTen, UserGroupID, Disable, EmployeeID, Manager, Password)
        VALUES (@UserName, @HoTen, @UserGroupID, ISNULL(@Disable, 0), @EmployeeID, @Manager, ISNULL(@Password, '123456'));
    END

    -- Trả về dữ liệu vừa lưu để Frontend cập nhật Lưới
    SELECT 
        UserName,
        HoTen,
        UserGroupID,
        Disable,
        EmployeeID,
        Manager
    FROM SY_User
    WHERE UserName = @UserName;

END
GO
