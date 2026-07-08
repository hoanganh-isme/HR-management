

CREATE PROCEDURE [dbo].[API_LayDanhSachNhom]
AS
BEGIN
    SET NOCOUNT ON;

    -- Chọn lọc và đổi Tên cột (Alias) cho khớp với JSON Frontend (id, name, icon)
    SELECT 
        [UserGroupID] AS [id],
        [UserGroupName] AS [name]
    FROM [SY_UserGroup]
    WHERE COALESCE([IsDisable], 0) = 0 -- Bỏ qua các nhóm đã bị khóa (IsDisable = 1)
    ORDER BY [UserGroupID];
END
GO
