USE [QLTiec]
GO

ALTER PROCEDURE [dbo].[API_LayMenuTheoNhomQuyen]
    @NhomNguoiDangThaoTac NVARCHAR(50), -- BẮT BUỘC THÊM: ID Nhóm của người gọi API
    @UserGroupID NVARCHAR(50)           -- ID Nhóm mà người đó CẦN XEM Menu
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================================
    -- BƯỚC 1: CẢNH VỆ HỆ THỐNG
    -- Chỉ cho phép 2 cửa: Hoặc là Tự soi của chính tao (@NhomA = @NhomA), 
    -- Hoặc tao là Admin có quyền soi người khác (@NhomA = 'Admin')
    -- =========================================================================
    IF (@NhomNguoiDangThaoTac != @UserGroupID) AND (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        -- Hất văng nếu: Thằng Lễ Tân (Kẻ bấm nút) đòi lôi DB hiển thị Cây Menu của Admin
        RAISERROR (N'Lỗi: Bạn không có thẩm quyền soi mói cấu trúc Phân Quyền của nhánh khác!', 16, 1);
        RETURN;
    END

    -- VẾ 1: LẤY CÁC MENU "LÁ"
    SELECT 
        M.MenuID AS [id],
        M.Parent AS [parent],
        M.VN AS [label],            
        M.SubTitle AS [subTitle],
        M.IconClass AS [icon],
        M.FormName AS [formName],
        M.URLPara AS [URLPara],
        M.FormKey AS [formKey],
        P.IsRun, P.IsAdd, P.IsUpdate, P.IsDelete,
        P.isManager, P.isAdmin, P.isAutoLock, P.isHideAmount, P.isLockDoc, P.isUnLockDoc, P.isExportExcel
    FROM WA_Menu M
    INNER JOIN dbo.WA_UserGroupPermisstion P ON M.MenuID = P.MenuID
    WHERE COALESCE(M.isDisable, 0) = 0 
      AND P.IsRun = 1 
      AND P.UserGroupID = @UserGroupID

    UNION ALL 

    -- VẾ 2: LẤY CÁC THƯ MỤC "CHA"
    SELECT 
        M.MenuID AS [id],
        M.Parent AS [parent],
        M.VN AS [label],
        M.SubTitle AS [subTitle],
        M.IconClass AS [icon],
        M.FormName AS [formName],
        M.URLPara AS [URLPara],
        M.FormKey AS [formKey],
        1 AS IsRun, 0 AS IsAdd, 0 AS IsUpdate, 0 AS IsDelete,
        0 AS isManager, 0 AS isAdmin, 0 AS isAutoLock, 0 AS isHideAmount, 0 AS isLockDoc, 0 AS isUnLockDoc, 0 AS isExportExcel
    FROM WA_Menu M
    WHERE COALESCE(M.isDisable, 0) = 0 
      AND M.MenuID IN (
          SELECT Parent 
          FROM WA_Menu M_Child
          INNER JOIN dbo.WA_UserGroupPermisstion P_Child 
              ON M_Child.MenuID = P_Child.MenuID
          WHERE COALESCE(M_Child.isDisable, 0) = 0 
            AND P_Child.IsRun = 1 
            AND P_Child.UserGroupID = @UserGroupID
      )
      AND M.MenuID NOT IN (
          SELECT MenuID FROM dbo.WA_UserGroupPermisstion 
          WHERE IsRun = 1 AND UserGroupID = @UserGroupID
      )
    ORDER BY [id];
END
GO
