/*
  Đăng ký pilot có chủ đích. Tất cả cờ mặc định 0 khi SESSION_CONTEXT chưa được đặt.
  Trước khi bật từng cờ, phải chạy 05_VERIFY_PILOT_V2.sql và đặt cả APPLY + gate
  trong chính session triển khai.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @ApplyView bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_APPLY_VIEW')), 0);
DECLARE @ApplySave bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_APPLY_SAVE')), 0);
DECLARE @ApplyDelete bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_APPLY_DELETE')), 0);

DECLARE @ViewOld sysname = N'API_TruyVanDong';
DECLARE @ViewV2 sysname = N'API_BangThueTNCN_V2';
DECLARE @SaveOld sysname = N'API_LuuDong';
DECLARE @SaveV2 sysname = N'API_LuuDong_V2';
DECLARE @DeleteOld sysname = N'API_XoaDong';
DECLARE @DeleteV2 sysname = N'API_XoaDong_V2';

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'View') <> 1
    THROW 52401, N'WA_API View của pilot không có đúng một dòng.', 1;
IF (SELECT COUNT(*) FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'Save') <> 1
    THROW 52402, N'WA_API Save của pilot không có đúng một dòng.', 1;
IF (SELECT COUNT(*) FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'Delete') <> 1
    THROW 52403, N'WA_API Delete của pilot không có đúng một dòng.', 1;

IF OBJECT_ID(N'dbo.API_BangThueTNCN_V2', N'P') IS NULL
    THROW 52404, N'Chưa cài API_BangThueTNCN_V2.', 1;
IF OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
    THROW 52405, N'Chưa cài API_LuuDong_V2.', 1;
IF OBJECT_ID(N'dbo.API_XoaDong_V2', N'P') IS NULL
    THROW 52406, N'Chưa cài API_XoaDong_V2.', 1;

IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = @FormName
      AND [func] = 'View'
      AND [SQL] NOT IN (@ViewOld, @ViewV2)
)
    THROW 52407, N'View hiện tại không khớp legacy/V2 đã biết; từ chối ghi đè.', 1;

IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = @FormName
      AND [func] = 'Save'
      AND [SQL] NOT IN (@SaveOld, @SaveV2)
)
    THROW 52408, N'Save hiện tại là custom/không xác định; từ chối ghi đè.', 1;

IF EXISTS (
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = @FormName
      AND [func] = 'Delete'
      AND [SQL] NOT IN (@DeleteOld, @DeleteV2)
)
    THROW 52409, N'Delete hiện tại là custom/không xác định; từ chối ghi đè.', 1;

IF @ApplyView = 1 AND ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_VIEW_GATE')), 0) <> 1
    THROW 52410, N'PHASE2_VIEW_GATE chưa được xác nhận trong session.', 1;
IF @ApplySave = 1 AND ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_SAVE_GATE')), 0) <> 1
    THROW 52411, N'PHASE2_SAVE_GATE chưa được xác nhận trong session.', 1;
IF @ApplyDelete = 1 AND ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_DELETE_GATE')), 0) <> 1
    THROW 52412, N'PHASE2_DELETE_GATE chưa được xác nhận trong session.', 1;

IF (@ApplyView = 1 OR @ApplySave = 1 OR @ApplyDelete = 1)
   AND ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE2_ACTOR_VERIFIED')), 0) <> 1
    THROW 52421, N'PHASE2_ACTOR_VERIFIED chưa được xác nhận sau kiểm thử đồng nhất actor phiên đăng nhập.', 1;

IF @ApplySave = 1 AND @ApplyView = 0 AND NOT EXISTS (
    SELECT 1 FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'View' AND [SQL] = @ViewV2
)
    THROW 52413, N'Không đăng ký Save V2 trước khi View V2 đã ổn định.', 1;

/*
  API_XoaDong_V2 tự đọc schema vật lý: có IsDeleted bit thì xóa mềm,
  không có IsDeleted thì xóa cứng trong transaction. Registration không chứa tên field.
*/

IF @ApplyDelete = 1 AND @ApplyView = 0 AND NOT EXISTS (
    SELECT 1 FROM dbo.WA_API WHERE [list] = @FormName AND [func] = 'View' AND [SQL] = @ViewV2
)
    THROW 52417, N'Không đăng ký Delete V2 trước khi View V2 được duyệt.', 1;

DECLARE @ChangedRows int;

BEGIN TRY
    BEGIN TRANSACTION;

    SELECT [SQL]
    FROM dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
    WHERE [list] = @FormName AND [func] IN ('View', 'Save', 'Delete');

    IF @ApplyView = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = @ViewV2,
            Para = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @FormName
          AND [func] = 'View'
          AND [SQL] IN (@ViewOld, @ViewV2);
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52418, N'Đăng ký View V2 không thay đổi đúng một dòng.', 1;
    END;

    IF @ApplySave = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = @SaveV2,
            Para = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @FormName
          AND [func] = 'Save'
          AND [SQL] IN (@SaveOld, @SaveV2);
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52419, N'Đăng ký Save V2 không thay đổi đúng một dòng.', 1;
    END;

    IF @ApplyDelete = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = @DeleteV2,
            Para = N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
        WHERE [list] = @FormName
          AND [func] = 'Delete'
          AND [SQL] IN (@DeleteOld, @DeleteV2);
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52420, N'Đăng ký Delete V2 không thay đổi đúng một dòng.', 1;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    A.[list] AS FormName,
    A.[func] AS ApiFunc,
    A.[SQL] AS CurrentProcedure,
    A.Para,
    @ApplyView AS ApplyViewRequested,
    @ApplySave AS ApplySaveRequested,
    @ApplyDelete AS ApplyDeleteRequested
FROM dbo.WA_API AS A
WHERE A.[list] = @FormName
  AND A.[func] IN ('View', 'Save', 'Delete')
ORDER BY CASE A.[func] WHEN 'View' THEN 1 WHEN 'Save' THEN 2 ELSE 3 END;
GO
