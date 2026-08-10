SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'dbo.API_SaoChepQuyenNhom', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_SaoChepQuyenNhom AS SELECT 1');
GO

ALTER PROCEDURE dbo.API_SaoChepQuyenNhom
    @UserName nvarchar(100),
    @SourceUserGroupID nvarchar(50),
    @TargetUserGroupID nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, N'')));
    SET @SourceUserGroupID = LTRIM(RTRIM(ISNULL(@SourceUserGroupID, N'')));
    SET @TargetUserGroupID = LTRIM(RTRIM(ISNULL(@TargetUserGroupID, N'')));

    DECLARE @StartedTransaction bit = 0;

    BEGIN TRY
        DECLARE @ActorGroupID nvarchar(50);

        SELECT TOP (1) @ActorGroupID = U.UserGroupID
        FROM dbo.SY_User AS U
        WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
          AND ISNULL(U.Disable, 0) = 0;

        IF LOWER(ISNULL(@ActorGroupID, N'')) COLLATE DATABASE_DEFAULT <> N'admin' COLLATE DATABASE_DEFAULT
            THROW 52301, N'Chỉ nhóm Admin được phép copy quyền.', 1;

        IF @SourceUserGroupID = N'' OR @TargetUserGroupID = N''
            THROW 52302, N'Vui lòng chọn đầy đủ nhóm nguồn và nhóm đích.', 1;

        IF @SourceUserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
            THROW 52303, N'Nhóm nguồn và nhóm đích phải khác nhau.', 1;

        IF LOWER(@TargetUserGroupID) COLLATE DATABASE_DEFAULT = N'admin' COLLATE DATABASE_DEFAULT
            THROW 52304, N'Không cho phép ghi đè toàn bộ quyền của nhóm Admin.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SY_UserGroup AS G
            WHERE G.UserGroupID COLLATE DATABASE_DEFAULT = @SourceUserGroupID COLLATE DATABASE_DEFAULT
              AND ISNULL(G.IsDisable, 0) = 0
        )
            THROW 52305, N'Nhóm quyền nguồn không tồn tại hoặc đã bị khóa.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SY_UserGroup AS G
            WHERE G.UserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
              AND ISNULL(G.IsDisable, 0) = 0
        )
            THROW 52306, N'Nhóm quyền đích không tồn tại hoặc đã bị khóa.', 1;

        IF EXISTS
        (
            SELECT P.MenuID
            FROM dbo.WA_UserGroupPermisstion AS P
            WHERE P.UserGroupID COLLATE DATABASE_DEFAULT IN
                (@SourceUserGroupID COLLATE DATABASE_DEFAULT, @TargetUserGroupID COLLATE DATABASE_DEFAULT)
            GROUP BY P.UserGroupID, P.MenuID
            HAVING COUNT_BIG(*) > 1
        )
            THROW 52307, N'Dữ liệu quyền đang bị trùng MenuID; cần xử lý trước khi copy.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_Menu AS M
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NULLIF(LTRIM(RTRIM(M.MenuID)), N'') IS NOT NULL
              AND LEN(@TargetUserGroupID + N'_' + M.MenuID) > 50
        )
            THROW 52308, N'Mã nhóm và mã menu vượt quá giới hạn khóa quyền.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_Menu AS M
            INNER JOIN dbo.WA_UserGroupPermisstion AS Existing
              ON Existing.ID COLLATE DATABASE_DEFAULT =
                 (@TargetUserGroupID + N'_' + M.MenuID) COLLATE DATABASE_DEFAULT
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_UserGroupPermisstion AS TargetPermission
                  WHERE TargetPermission.UserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
                    AND TargetPermission.MenuID COLLATE DATABASE_DEFAULT = M.MenuID COLLATE DATABASE_DEFAULT
              )
              AND (
                  Existing.UserGroupID COLLATE DATABASE_DEFAULT <> @TargetUserGroupID COLLATE DATABASE_DEFAULT
                  OR Existing.MenuID COLLATE DATABASE_DEFAULT <> M.MenuID COLLATE DATABASE_DEFAULT
              )
        )
            THROW 52309, N'Khóa ID quyền đang thuộc bản ghi khác; không thể copy an toàn.', 1;

        IF @@TRANCOUNT = 0
        BEGIN
            BEGIN TRANSACTION;
            SET @StartedTransaction = 1;
        END
        ELSE
            SAVE TRANSACTION CopyPermissionSave;

        DECLARE @Changes table (ActionName nvarchar(10) NOT NULL);

        MERGE dbo.WA_UserGroupPermisstion WITH (HOLDLOCK) AS Target
        USING
        (
            SELECT
                M.MenuID,
                CONVERT(bit, ISNULL(SourcePermission.IsRun, 0)) AS IsRun,
                CONVERT(bit, ISNULL(SourcePermission.IsAdd, 0)) AS IsAdd,
                CONVERT(bit, ISNULL(SourcePermission.IsUpdate, 0)) AS IsUpdate,
                CONVERT(bit, ISNULL(SourcePermission.IsDelete, 0)) AS IsDelete,
                CONVERT(bit, ISNULL(SourcePermission.isManager, 0)) AS isManager,
                CONVERT(bit, ISNULL(SourcePermission.isAdmin, 0)) AS isAdmin,
                CONVERT(bit, ISNULL(SourcePermission.isAutoLock, 0)) AS isAutoLock,
                CONVERT(bit, ISNULL(SourcePermission.isHideAmount, 0)) AS isHideAmount,
                CONVERT(bit, ISNULL(SourcePermission.isLockDoc, 0)) AS isLockDoc,
                CONVERT(bit, ISNULL(SourcePermission.isUnLockDoc, 0)) AS isUnLockDoc,
                CONVERT(bit, ISNULL(SourcePermission.isExportExcel, 0)) AS isExportExcel
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS SourcePermission
              ON SourcePermission.UserGroupID COLLATE DATABASE_DEFAULT =
                 @SourceUserGroupID COLLATE DATABASE_DEFAULT
             AND SourcePermission.MenuID COLLATE DATABASE_DEFAULT =
                 M.MenuID COLLATE DATABASE_DEFAULT
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NULLIF(LTRIM(RTRIM(M.MenuID)), N'') IS NOT NULL
        ) AS Source
          ON Target.UserGroupID COLLATE DATABASE_DEFAULT =
             @TargetUserGroupID COLLATE DATABASE_DEFAULT
         AND Target.MenuID COLLATE DATABASE_DEFAULT =
             Source.MenuID COLLATE DATABASE_DEFAULT
        WHEN MATCHED THEN
            UPDATE SET
                Target.IsRun = Source.IsRun,
                Target.IsAdd = Source.IsAdd,
                Target.IsUpdate = Source.IsUpdate,
                Target.IsDelete = Source.IsDelete,
                Target.isManager = Source.isManager,
                Target.isAdmin = Source.isAdmin,
                Target.isAutoLock = Source.isAutoLock,
                Target.isHideAmount = Source.isHideAmount,
                Target.isLockDoc = Source.isLockDoc,
                Target.isUnLockDoc = Source.isUnLockDoc,
                Target.isExportExcel = Source.isExportExcel
        WHEN NOT MATCHED BY TARGET THEN
            INSERT
            (
                ID, UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete,
                isManager, isAdmin, isAutoLock, isHideAmount,
                isLockDoc, isUnLockDoc, isExportExcel
            )
            VALUES
            (
                @TargetUserGroupID + N'_' + Source.MenuID,
                @TargetUserGroupID,
                Source.MenuID,
                Source.IsRun,
                Source.IsAdd,
                Source.IsUpdate,
                Source.IsDelete,
                Source.isManager,
                Source.isAdmin,
                Source.isAutoLock,
                Source.isHideAmount,
                Source.isLockDoc,
                Source.isUnLockDoc,
                Source.isExportExcel
            )
        OUTPUT $action INTO @Changes(ActionName);

        IF EXISTS (SELECT 1 FROM dbo.SY_Setup WHERE CodeID = 'menu_sync_ver')
            UPDATE dbo.SY_Setup
            SET CodeValue = CONVERT(nvarchar(50), GETDATE(), 126)
            WHERE CodeID = 'menu_sync_ver';
        ELSE
            INSERT INTO dbo.SY_Setup (CodeID, CodeName, CodeValue, GroupID)
            VALUES
                ('menu_sync_ver', N'Phiên bản đồng bộ Menu', CONVERT(nvarchar(50), GETDATE(), 126), 'SY');

        DECLARE @MenuCount int = (SELECT COUNT(*) FROM @Changes);
        DECLARE @InsertedCount int = (SELECT COUNT(*) FROM @Changes WHERE ActionName = N'INSERT');
        DECLARE @UpdatedCount int = (SELECT COUNT(*) FROM @Changes WHERE ActionName = N'UPDATE');

        IF @StartedTransaction = 1 COMMIT TRANSACTION;

        SELECT
            0 AS code,
            N'Copy quyền nhóm thành công.' AS msg,
            @SourceUserGroupID AS SourceUserGroupID,
            @TargetUserGroupID AS TargetUserGroupID,
            @MenuCount AS MenuCount,
            @InsertedCount AS InsertedCount,
            @UpdatedCount AS UpdatedCount;
    END TRY
    BEGIN CATCH
        IF @StartedTransaction = 1 AND XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        ELSE IF @StartedTransaction = 0 AND XACT_STATE() = 1
            ROLLBACK TRANSACTION CopyPermissionSave;

        SELECT
            1 AS code,
            ERROR_MESSAGE() AS msg,
            ERROR_NUMBER() AS error_number;
    END CATCH
END;
GO
