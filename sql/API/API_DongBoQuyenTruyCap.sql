
IF OBJECT_ID('dbo.API_DongBoQuyenTruyCap') IS NOT NULL
    DROP PROCEDURE [dbo].[API_DongBoQuyenTruyCap];
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_DongBoQuyenTruyCap]
    @NhomNguoiDangThaoTac NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        -- Xóa rác: MenuID rỗng
        DELETE FROM WA_UserGroupPermisstion
        WHERE COALESCE(MenuID, '') = '';

        -- Xóa rác: nhóm không còn tồn tại
        DELETE FROM WA_UserGroupPermisstion
        WHERE UserGroupID NOT IN (SELECT UserGroupID FROM SY_UserGroup);

        -- Xóa rác: menu không còn tồn tại
        DELETE FROM WA_UserGroupPermisstion
        WHERE MenuID NOT IN (SELECT MenuID FROM WA_Menu);

        -- Bơm quyền còn thiếu (dùng URLPara thay FormName vì hệ thống này không dùng FormName)
        INSERT INTO WA_UserGroupPermisstion
            (ID, UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete,
             isManager, isAdmin, isAutoLock, isHideAmount, isLockDoc, isUnLockDoc, isExportExcel)
        SELECT
            G.UserGroupID + '_' + M.MenuID,
            G.UserGroupID,
            M.MenuID,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            0, 0, 0,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END,
            CASE WHEN G.UserGroupID = 'Admin' THEN 1 ELSE 0 END
        FROM (SELECT DISTINCT UserGroupID FROM SY_UserGroup) G
        CROSS JOIN (SELECT DISTINCT MenuID FROM WA_Menu WHERE COALESCE(MenuID, '') <> '') M
        WHERE NOT EXISTS (
            SELECT 1 FROM WA_UserGroupPermisstion P
            WHERE P.UserGroupID = G.UserGroupID
              AND P.MenuID = M.MenuID
        )
        AND NOT EXISTS (
            SELECT 1 FROM WA_UserGroupPermisstion P
            WHERE P.ID = G.UserGroupID + '_' + M.MenuID
        );

        -- Ghi version đồng bộ vào SY_Setup để các client tự biết cache cũ
        IF EXISTS (SELECT 1 FROM SY_Setup WHERE CodeID = 'menu_sync_ver')
            UPDATE SY_Setup
            SET CodeValue = CONVERT(NVARCHAR(50), GETDATE(), 126)
            WHERE CodeID = 'menu_sync_ver';
        ELSE
            INSERT INTO SY_Setup (CodeID, CodeName, CodeValue, GroupID)
            VALUES ('menu_sync_ver', N'Phiên bản đồng bộ Menu', CONVERT(NVARCHAR(50), GETDATE(), 126), 'SY');

        SELECT 0 AS [code], N'Đồng bộ quyền thành công' AS [msg];

    END TRY
    BEGIN CATCH
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg];
    END CATCH

END
GO
