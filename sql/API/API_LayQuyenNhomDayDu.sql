USE [QLTiec]
GO

ALTER PROCEDURE [dbo].[API_LayQuyenNhomDayDu]
    @NhomNguoiDangThaoTac NVARCHAR(50),
    @UserGroupID           NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ cho phép: tự soi chính mình HOẶC Admin soi người khác
    IF (@NhomNguoiDangThaoTac != @UserGroupID) AND (@NhomNguoiDangThaoTac != 'Admin')
    BEGIN
        RAISERROR (N'Lỗi: Bạn không có thẩm quyền xem phân quyền của nhóm này!', 16, 1);
        RETURN;
    END

    -- VẾ 1: Chỉ lấy menu lá ĐÃ ĐƯỢC ĐỒNG BỘ vào bảng Permission (INNER JOIN)
    SELECT
        M.MenuID        AS [id],
        M.Parent        AS [parent],
        M.VN            AS [label],
        M.IconClass     AS [icon],
        M.FormName      AS [formName],
        M.URLPara       AS [urlPara],
        ISNULL(P.IsRun,        0) AS IsRun,
        ISNULL(P.IsAdd,        0) AS IsAdd,
        ISNULL(P.IsUpdate,     0) AS IsUpdate,
        ISNULL(P.IsDelete,     0) AS IsDelete,
        ISNULL(P.isManager,    0) AS isManager,
        ISNULL(P.isAdmin,      0) AS isAdmin,
        ISNULL(P.isAutoLock,   0) AS isAutoLock,
        ISNULL(P.isHideAmount, 0) AS isHideAmount,
        ISNULL(P.isLockDoc,    0) AS isLockDoc,
        ISNULL(P.isUnLockDoc,  0) AS isUnLockDoc,
        ISNULL(P.isExportExcel,0) AS isExportExcel
    FROM WA_Menu M
    INNER JOIN WA_UserGroupPermisstion P        -- Đổi LEFT JOIN → INNER JOIN
        ON M.MenuID = P.MenuID AND P.UserGroupID = @UserGroupID
    WHERE COALESCE(M.isDisable, 0) = 0
      AND COALESCE(M.URLPara, '') <> ''

    UNION ALL

    -- VẾ 2: Chỉ lấy thư mục cha của những menu ĐÃ CÓ TRONG PERMISSION
    SELECT
        M.MenuID    AS [id],
        M.Parent    AS [parent],
        M.VN        AS [label],
        M.IconClass AS [icon],
        M.FormName  AS [formName],
        M.URLPara   AS [urlPara],
        1 AS IsRun, 0 AS IsAdd, 0 AS IsUpdate, 0 AS IsDelete,
        0 AS isManager, 0 AS isAdmin, 0 AS isAutoLock, 0 AS isHideAmount,
        0 AS isLockDoc, 0 AS isUnLockDoc, 0 AS isExportExcel
    FROM WA_Menu M
    WHERE COALESCE(M.isDisable, 0) = 0
      AND COALESCE(M.URLPara, '') = ''
      AND M.MenuID IN (
          -- Chỉ lấy folder cha của menu con ĐÃ CÓ TRONG bảng Permission
          SELECT DISTINCT Parent FROM WA_Menu
          WHERE COALESCE(isDisable, 0) = 0
            AND COALESCE(URLPara, '') <> ''
            AND Parent IS NOT NULL AND Parent <> ''
            AND MenuID IN (
                SELECT MenuID FROM WA_UserGroupPermisstion
                WHERE UserGroupID = @UserGroupID
            )
      )

    ORDER BY [id];
END
GO
