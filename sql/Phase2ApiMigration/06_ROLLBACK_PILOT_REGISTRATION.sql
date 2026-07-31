/* Rollback chỉ đổi registration về SP cũ; không xóa SP V2 và không xóa metadata. */
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FormName varchar(100) = 'WA_BangThueTNCNFrm';
DECLARE @RollbackView bit = 0;
DECLARE @RollbackSave bit = 0;
DECLARE @RollbackDelete bit = 0;
DECLARE @ChangedRows int;

BEGIN TRY
    BEGIN TRANSACTION;

    SELECT [SQL]
    FROM dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
    WHERE [list] = @FormName AND [func] IN ('View', 'Save', 'Delete');

    IF @RollbackView = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = N'API_TruyVanDong',
            Para = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
        WHERE [list] = @FormName
          AND [func] = 'View'
          AND [SQL] IN (N'API_TruyVanDong', N'API_BangThueTNCN_V2');
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52601, N'Rollback View không thay đổi đúng một dòng.', 1;
    END;

    IF @RollbackSave = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = N'API_LuuDong',
            Para = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
        WHERE [list] = @FormName
          AND [func] = 'Save'
          AND [SQL] IN (N'API_LuuDong', N'API_LuuDong_V2');
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52602, N'Rollback Save không thay đổi đúng một dòng.', 1;
    END;

    IF @RollbackDelete = 1
    BEGIN
        UPDATE dbo.WA_API
        SET [SQL] = N'API_XoaDong',
            Para = N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
        WHERE [list] = @FormName
          AND [func] = 'Delete'
          AND [SQL] IN (N'API_XoaDong', N'API_XoaDong_V2');
        SET @ChangedRows = @@ROWCOUNT;
        IF @ChangedRows <> 1 THROW 52603, N'Rollback Delete không thay đổi đúng một dòng.', 1;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT [list] AS FormName, [func] AS ApiFunc, [SQL] AS CurrentProcedure, Para,
       @RollbackView AS RollbackViewRequested,
       @RollbackSave AS RollbackSaveRequested,
       @RollbackDelete AS RollbackDeleteRequested
FROM dbo.WA_API
WHERE [list] = @FormName AND [func] IN ('View', 'Save', 'Delete');
GO
