/*
  Phase 3 - rollback đăng ký WA_API theo từng form, không rollback schema/procedure.
  Preview-only mặc định; chỉ rollback khi SESSION_CONTEXT có apply flag và scope.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53800, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;

/*
  Một form:
    EXEC sys.sp_set_session_context N'PHASE3_ROLLBACK_APPLY', 1;
    EXEC sys.sp_set_session_context N'PHASE3_ROLLBACK_TARGET_FORM', N'WA_TitleListFrm';
    EXEC sys.sp_set_session_context N'PHASE3_ROLLBACK_CONFIRMED', 1;
  Tất cả (chỉ sau khi review preview): PHASE3_ROLLBACK_ALL_FORMS=1.
*/
DECLARE @ApplyRollback bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_ROLLBACK_APPLY')), 0);
DECLARE @RollbackConfirmed bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_ROLLBACK_CONFIRMED')), 0);
DECLARE @RollbackAllForms bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_ROLLBACK_ALL_FORMS')), 0);
DECLARE @TargetWebFormName varchar(100) = LTRIM(RTRIM(ISNULL(TRY_CONVERT(varchar(100), SESSION_CONTEXT(N'PHASE3_ROLLBACK_TARGET_FORM')), '')));

IF @TargetWebFormName <> '' AND @RollbackAllForms = 1
    THROW 53802, N'PHASE3_ROLLBACK_SCOPE_AMBIGUOUS', 1;
IF @TargetWebFormName <> '' AND NOT EXISTS (
    SELECT 1 FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @TargetWebFormName COLLATE DATABASE_DEFAULT
)
    THROW 53801, N'PHASE3_ROLLBACK_TARGET_NOT_ALLOWLISTED', 1;

DECLARE @Results table
(
    WebFormName varchar(100) NOT NULL,
    RollbackStatus varchar(30) NOT NULL,
    Diagnostic nvarchar(1000) NULL
);

DECLARE
    @WebFormName varchar(100),
    @OldView sysname,
    @ViewV2 sysname,
    @OldSave sysname,
    @SaveV2 sysname,
    @OldDelete sysname,
    @DeleteV2 sysname;

DECLARE FormCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT R.WebFormName, R.OldView, R.ViewV2, R.OldSave, R.SaveV2, R.OldDelete, R.DeleteV2
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
WHERE @TargetWebFormName = ''
   OR R.WebFormName COLLATE DATABASE_DEFAULT = @TargetWebFormName COLLATE DATABASE_DEFAULT
ORDER BY R.WebFormName;

OPEN FormCursor;
FETCH NEXT FROM FormCursor INTO @WebFormName, @OldView, @ViewV2, @OldSave, @SaveV2, @OldDelete, @DeleteV2;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CanApplyThisForm bit = CONVERT(bit, CASE
            WHEN @ApplyRollback <> 1 THEN 0
            WHEN @RollbackConfirmed <> 1 THEN 0
            WHEN @RollbackAllForms = 1 THEN 1
            WHEN @TargetWebFormName <> ''
             AND @TargetWebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1
            ELSE 0 END);

        DECLARE @RouteCount int, @CurrentProcedure sysname;
        DECLARE @RolledBackRouteCount int = 0;
        DECLARE @RollbackIssueCount int = 0;
        DECLARE @RollbackIssues nvarchar(1000) = N'';

        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;
        IF @RouteCount <> 1 OR NULLIF(LTRIM(RTRIM(@CurrentProcedure)), N'') IS NULL
           OR (
                PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldView, 1) COLLATE DATABASE_DEFAULT
                AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@ViewV2, 1) COLLATE DATABASE_DEFAULT
           )
        BEGIN
            SET @RollbackIssueCount += 1;
            SET @RollbackIssues += CONCAT(N'VIEW_ROUTE_REVIEW_REQUIRED(count=', @RouteCount, N', sql=', COALESCE(@CurrentProcedure, N'NULL'), N'); ');
        END
        ELSE IF @CanApplyThisForm = 1
           AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT = PARSENAME(@ViewV2, 1) COLLATE DATABASE_DEFAULT
        BEGIN
            UPDATE dbo.WA_API
            SET [SQL] = @OldView,
                Para = CASE
                    WHEN PARSENAME(@OldView, 1) COLLATE DATABASE_DEFAULT = 'API_DanhSachChucDanh' COLLATE DATABASE_DEFAULT
                        THEN N'@Keyword=N''{Keyword}'''
                    ELSE N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'''
                END
            WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND [func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;
            IF @@ROWCOUNT = 1 SET @RolledBackRouteCount += 1;
            ELSE
            BEGIN
                SET @RollbackIssueCount += 1;
                SET @RollbackIssues += N'VIEW_ROLLBACK_COUNT_INVALID; ';
            END;
        END;

        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;
        IF @RouteCount <> 1 OR NULLIF(LTRIM(RTRIM(@CurrentProcedure)), N'') IS NULL
           OR (
                PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldSave, 1) COLLATE DATABASE_DEFAULT
                AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@SaveV2, 1) COLLATE DATABASE_DEFAULT
           )
        BEGIN
            SET @RollbackIssueCount += 1;
            SET @RollbackIssues += CONCAT(N'SAVE_ROUTE_REVIEW_REQUIRED(count=', @RouteCount, N', sql=', COALESCE(@CurrentProcedure, N'NULL'), N'); ');
        END
        ELSE IF @CanApplyThisForm = 1
           AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT = PARSENAME(@SaveV2, 1) COLLATE DATABASE_DEFAULT
        BEGIN
            UPDATE dbo.WA_API
            SET [SQL] = @OldSave,
                Para = CASE
                    WHEN @WebFormName COLLATE DATABASE_DEFAULT = 'WA_ChucDanhFrm' COLLATE DATABASE_DEFAULT
                        THEN N'@List=N''WA_ChucDanhFrm'', @Data=N''{JsonData}'', @UserName=N''{User}'''
                    ELSE N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
                END
            WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND [func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;
            IF @@ROWCOUNT = 1 SET @RolledBackRouteCount += 1;
            ELSE
            BEGIN
                SET @RollbackIssueCount += 1;
                SET @RollbackIssues += N'SAVE_ROLLBACK_COUNT_INVALID; ';
            END;
        END;

        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;
        IF @RouteCount <> 1 OR NULLIF(LTRIM(RTRIM(@CurrentProcedure)), N'') IS NULL
           OR (
                PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldDelete, 1) COLLATE DATABASE_DEFAULT
                AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@DeleteV2, 1) COLLATE DATABASE_DEFAULT
           )
        BEGIN
            SET @RollbackIssueCount += 1;
            SET @RollbackIssues += CONCAT(N'DELETE_ROUTE_REVIEW_REQUIRED(count=', @RouteCount, N', sql=', COALESCE(@CurrentProcedure, N'NULL'), N'); ');
        END
        ELSE IF @CanApplyThisForm = 1
           AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT = PARSENAME(@DeleteV2, 1) COLLATE DATABASE_DEFAULT
        BEGIN
            UPDATE dbo.WA_API
            SET [SQL] = @OldDelete,
                Para = N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
            WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND [func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;
            IF @@ROWCOUNT = 1 SET @RolledBackRouteCount += 1;
            ELSE
            BEGIN
                SET @RollbackIssueCount += 1;
                SET @RollbackIssues += N'DELETE_ROLLBACK_COUNT_INVALID; ';
            END;
        END;

        COMMIT TRANSACTION;
        INSERT INTO @Results VALUES (
            @WebFormName,
            CASE
                WHEN @CanApplyThisForm = 1 AND @RolledBackRouteCount > 0 AND @RollbackIssueCount > 0 THEN 'PARTIAL_ROLLBACK_REVIEW'
                WHEN @CanApplyThisForm = 1 AND @RolledBackRouteCount > 0 THEN 'ROLLED_BACK_TO_LEGACY'
                WHEN @CanApplyThisForm = 1 AND @RollbackIssueCount > 0 THEN 'ROLLBACK_REVIEW_REQUIRED'
                WHEN @CanApplyThisForm = 1 THEN 'ALREADY_LEGACY_UNCHANGED'
                WHEN @RollbackIssueCount > 0 THEN 'PREVIEW_ROUTE_REVIEW_REQUIRED'
                WHEN @ApplyRollback = 0 THEN 'PREVIEW_APPLY_FLAG_OFF'
                WHEN @RollbackConfirmed = 0 THEN 'PREVIEW_CONFIRM_REQUIRED'
                ELSE 'PREVIEW_SCOPE_REQUIRED'
            END,
            CASE WHEN @CanApplyThisForm = 1 AND (@RolledBackRouteCount > 0 OR @RollbackIssueCount > 0)
                    THEN CONCAT(N'Rolled back route count: ', @RolledBackRouteCount, N'. ', NULLIF(@RollbackIssues, N''))
                 WHEN @CanApplyThisForm = 1
                    THEN N'Không có route V2; giữ nguyên SQL/Para legacy hiện tại.'
                 WHEN @RollbackIssueCount > 0
                    THEN CONCAT(N'Preview requires route review: ', NULLIF(@RollbackIssues, N''))
                 ELSE CONCAT(N'Planned: View=', @OldView, N'; Save=', @OldSave, N'; Delete=', @OldDelete) END
        );
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        INSERT INTO @Results VALUES (
            @WebFormName, 'ROLLBACK_FAILED', CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE())
        );
    END CATCH;

    FETCH NEXT FROM FormCursor INTO @WebFormName, @OldView, @ViewV2, @OldSave, @SaveV2, @OldDelete, @DeleteV2;
END;

CLOSE FormCursor;
DEALLOCATE FormCursor;

SELECT WebFormName, RollbackStatus, Diagnostic
FROM @Results
ORDER BY WebFormName;

SELECT
    @ApplyRollback AS ApplyRollback,
    @RollbackConfirmed AS RollbackConfirmed,
    @RollbackAllForms AS RollbackAllForms,
    NULLIF(@TargetWebFormName, '') AS TargetWebFormName,
    CASE
        WHEN @ApplyRollback = 0 THEN 'PREVIEW_ONLY_DEFAULT'
        WHEN @RollbackConfirmed = 0 THEN 'PREVIEW_ONLY_CONFIRM_REQUIRED'
        WHEN @RollbackAllForms = 0 AND @TargetWebFormName = '' THEN 'PREVIEW_ONLY_SCOPE_REQUIRED'
        ELSE 'EXPLICIT_ROLLBACK_REQUESTED'
    END AS RollbackMode;
GO
