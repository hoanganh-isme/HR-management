/*
  Rollback chính xác WA_API từ snapshot. Không xóa registry/history,
  metadata ERP hoặc dữ liệu nghiệp vụ.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_RollbackFieldContractV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_RollbackFieldContractV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_RollbackFieldContractV2
    @WebFormName varchar(100) = NULL,
    @BatchID uniqueidentifier = NULL,
    @TargetStatus varchar(20) = 'SHADOW',
    @UserName varchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = NULLIF(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), '');
    SET @TargetStatus = UPPER(LTRIM(RTRIM(ISNULL(@TargetStatus, 'SHADOW'))));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));

    IF @UserName = '' THROW 54500, N'FIELD_CONTRACT_ROLLBACK_ACTOR_REQUIRED', 1;
    IF @TargetStatus NOT IN ('SHADOW', 'DISABLED')
        THROW 54501, N'FIELD_CONTRACT_ROLLBACK_STATUS_INVALID', 1;
    IF @WebFormName IS NULL AND @BatchID IS NULL
        THROW 54502, N'FIELD_CONTRACT_ROLLBACK_SCOPE_REQUIRED', 1;

    IF @BatchID IS NULL
    BEGIN
        SELECT TOP (1) @BatchID = B.BackupBatchID
        FROM dbo.WA_FieldContractRouteBackup AS B
        WHERE B.WebFormName = @WebFormName
          AND B.RestoredAt IS NULL
        ORDER BY B.BackupTime DESC, B.BackupID DESC;
    END;

    IF @BatchID IS NULL
        THROW 54503, N'FIELD_CONTRACT_ROLLBACK_SNAPSHOT_NOT_FOUND', 1;

    DECLARE @Restore table
    (
        BackupID bigint PRIMARY KEY,
        WebFormName varchar(100),
        ApiList varchar(100),
        Func varchar(20),
        RouteExisted bit,
        [SQL] nvarchar(max),
        Para nvarchar(max)
    );

    INSERT INTO @Restore
    SELECT
        B.BackupID, B.WebFormName, B.ApiList, B.Func,
        B.RouteExisted, B.[SQL], B.Para
    FROM dbo.WA_FieldContractRouteBackup AS B
    WHERE B.BackupBatchID = @BatchID
      AND B.RestoredAt IS NULL
      AND (@WebFormName IS NULL OR B.WebFormName = @WebFormName);

    IF NOT EXISTS (SELECT 1 FROM @Restore)
        THROW 54504, N'FIELD_CONTRACT_ROLLBACK_SNAPSHOT_ALREADY_RESTORED_OR_EMPTY', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Restore AS R
        INNER JOIN dbo.WA_API AS A
          ON A.[list] = R.ApiList AND A.[func] = R.Func
        GROUP BY R.ApiList, R.Func
        HAVING COUNT(*) > 1
    )
        THROW 54505, N'FIELD_CONTRACT_ROLLBACK_ROUTE_DUPLICATE', 1;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE
            @BackupID bigint,
            @OwnerForm varchar(100),
            @ApiList varchar(100),
            @Func varchar(20),
            @RouteExisted bit,
            @Sql nvarchar(max),
            @Para nvarchar(max),
            @RouteCount int;

        DECLARE RestoreCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT BackupID, WebFormName, ApiList, Func, RouteExisted, [SQL], Para
            FROM @Restore
            ORDER BY BackupID DESC;

        OPEN RestoreCursor;
        FETCH NEXT FROM RestoreCursor INTO
            @BackupID, @OwnerForm, @ApiList, @Func, @RouteExisted, @Sql, @Para;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT @RouteCount = COUNT(*)
            FROM dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
            WHERE [list] = @ApiList AND [func] = @Func;

            IF @RouteCount > 1
                THROW 54505, N'FIELD_CONTRACT_ROLLBACK_ROUTE_DUPLICATE', 1;

            IF @RouteExisted = 1
            BEGIN
                IF @RouteCount = 1
                    UPDATE dbo.WA_API
                    SET [SQL] = @Sql, Para = @Para
                    WHERE [list] = @ApiList AND [func] = @Func;
                ELSE
                    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
                    VALUES (@ApiList, @Func, @Sql, @Para);
            END
            ELSE IF @RouteCount = 1
                DELETE FROM dbo.WA_API
                WHERE [list] = @ApiList AND [func] = @Func;

            UPDATE dbo.WA_FieldContractRouteBackup
            SET RestoredAt = SYSUTCDATETIME(),
                RestoredBy = @UserName
            WHERE BackupID = @BackupID;

            FETCH NEXT FROM RestoreCursor INTO
                @BackupID, @OwnerForm, @ApiList, @Func, @RouteExisted, @Sql, @Para;
        END;

        CLOSE RestoreCursor;
        DEALLOCATE RestoreCursor;

        UPDATE R
        SET RolloutStatus = @TargetStatus,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName,
            RolloutReason = CONCAT(N'ROLLED_BACK_BATCH_', CONVERT(varchar(36), @BatchID))
        FROM dbo.WA_FieldContractRegistry AS R
        WHERE EXISTS
        (
            SELECT 1 FROM @Restore AS X
            WHERE X.WebFormName = R.WebFormName
        );

        UPDATE D
        SET RolloutStatus = @TargetStatus,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName,
            RolloutReason = CONCAT(N'ROLLED_BACK_BATCH_', CONVERT(varchar(36), @BatchID))
        FROM dbo.WA_FieldDatasetRegistry AS D
        WHERE EXISTS
        (
            SELECT 1 FROM @Restore AS X
            WHERE X.WebFormName = D.WebFormName
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'RestoreCursor') >= 0 CLOSE RestoreCursor;
        IF CURSOR_STATUS('local', 'RestoreCursor') >= -1 DEALLOCATE RestoreCursor;
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT
        @BatchID AS BackupBatchID,
        @TargetStatus AS RolloutStatusAfterRollback,
        R.WebFormName,
        R.ApiList,
        R.Func,
        R.RouteExisted
    FROM @Restore AS R
    ORDER BY R.BackupID;
END;
GO

SELECT TOP (20)
    BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
    BackupTime, BackupUser, RestoredAt, RestoredBy
FROM dbo.WA_FieldContractRouteBackup
ORDER BY BackupTime DESC, BackupID DESC;
