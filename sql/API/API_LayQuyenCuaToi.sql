CREATE PROCEDURE API_LayQuyenCuaToi
    @Username varchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserGroupID varchar(50);
    
    -- Lấy Nhóm Quyền của Nhân viên đang đăng nhập
    SELECT @UserGroupID = UserGroupID 
    FROM SY_User 
    WHERE UserName = @Username;
    
    -- Nếu không tìm thấy user hoặc chưa có nhóm, trả về mảng rỗng
    IF @UserGroupID IS NULL
    BEGIN
        SELECT 0 AS [code], 'User not found' AS [msg];
        RETURN;
    END

    -- Quét toàn bộ quyền của Nhóm này và móc với Tên Menu
    -- Trả về cho C# duyệt và convert thành chuỗi JSON { "frmStaff": { "CanAdd": 1, ... } }
    SELECT 
        M.FormName AS [FormName],
        M.VN AS [MenuName],
        M.URLPara AS [URLPara],
        M.FormKey AS [FormKey],
        ISNULL(P.IsRun, 0) AS CanView,
        ISNULL(P.IsAdd, 0) AS CanAdd,
        ISNULL(P.IsUpdate, 0) AS CanEdit,
        ISNULL(P.IsDelete, 0) AS CanDelete
    FROM WA_UserGroupPermisstion P
    INNER JOIN WA_Menu M ON P.MenuID = M.MenuID
    WHERE P.UserGroupID = @UserGroupID
      AND M.FormName IS NOT NULL AND M.FormName <> '';
    
END
GO
