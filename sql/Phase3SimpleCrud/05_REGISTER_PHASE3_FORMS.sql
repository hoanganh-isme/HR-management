/*
  Phase 3 - cutover WA_API theo từng form, idempotent và fail-closed.

  Script CHỈ cập nhật đúng một row WA_API cho mỗi action. Nó không INSERT route,
  không sửa các bảng cấu hình SY_*. Form lỗi gate được rollback
  độc lập; form khác vẫn có thể được kiểm tra/cutover.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.API_Phase3SimpleCrudRegistry', N'IF') IS NULL
    THROW 53500, N'PHASE3_SOURCE_REGISTRY_NOT_INSTALLED', 1;

/*
  Preview-only mặc định. Trước khi apply, DBA phải đặt cả action flag và scope:
    EXEC sys.sp_set_session_context N'PHASE3_APPLY_VIEW', 1;
    EXEC sys.sp_set_session_context N'PHASE3_APPLY_SAVE', 0;
    EXEC sys.sp_set_session_context N'PHASE3_APPLY_DELETE', 0;
    EXEC sys.sp_set_session_context N'PHASE3_TARGET_FORM', N'WA_TitleListFrm';
    EXEC sys.sp_set_session_context N'PHASE3_LIVE_GATES_PASSED', 1;
  Hoặc thay target bằng PHASE3_APPLY_ALL_FORMS=1 sau khi mọi form đã qua live gate.
*/
DECLARE @ApplyView bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_APPLY_VIEW')), 0);
DECLARE @ApplySave bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_APPLY_SAVE')), 0);
DECLARE @ApplyDelete bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_APPLY_DELETE')), 0);
DECLARE @ApplyAllForms bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_APPLY_ALL_FORMS')), 0);
DECLARE @LiveGatesPassed bit = ISNULL(TRY_CONVERT(bit, SESSION_CONTEXT(N'PHASE3_LIVE_GATES_PASSED')), 0);
DECLARE @TargetWebFormName varchar(100) = LTRIM(RTRIM(ISNULL(TRY_CONVERT(varchar(100), SESSION_CONTEXT(N'PHASE3_TARGET_FORM')), '')));

IF @TargetWebFormName <> '' AND @ApplyAllForms = 1
    THROW 53504, N'PHASE3_APPLY_SCOPE_AMBIGUOUS', 1;
IF CONVERT(int, @ApplyView) + CONVERT(int, @ApplySave) + CONVERT(int, @ApplyDelete) > 1
    THROW 53506, N'PHASE3_APPLY_ONE_ACTION_AT_A_TIME', 1;
IF @ApplyView = 1 AND OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
    THROW 53501, N'PHASE3_VIEW_V2_NOT_INSTALLED', 1;
IF @ApplySave = 1 AND OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
    THROW 53502, N'PHASE3_SAVE_V2_NOT_INSTALLED', 1;
IF @ApplyDelete = 1 AND OBJECT_ID(N'dbo.API_XoaDong_V2', N'P') IS NULL
    THROW 53503, N'PHASE3_DELETE_V2_NOT_INSTALLED', 1;
IF @TargetWebFormName <> '' AND NOT EXISTS (
    SELECT 1 FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @TargetWebFormName COLLATE DATABASE_DEFAULT
)
    THROW 53505, N'PHASE3_APPLY_TARGET_NOT_ALLOWLISTED', 1;

DECLARE @Results table
(
    WebFormName varchar(100) NOT NULL,
    GateName varchar(30) NOT NULL,
    GateStatus varchar(30) NOT NULL,
    Diagnostic nvarchar(1000) NULL
);

DECLARE
    @WebFormName varchar(100),
    @ExpectedTable sysname,
    @ExpectedPrimaryKey sysname,
    @OldView sysname,
    @ViewV2 sysname,
    @OldSave sysname,
    @SaveV2 sysname,
    @OldDelete sysname,
    @DeleteV2 sysname,
    @EnableView bit,
    @EnableSave bit,
    @EnableDelete bit,
    @DeletePolicy varchar(40),
    @GlobalReferenceOnly bit;

DECLARE FormCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT
    R.WebFormName, R.ExpectedTableName, R.ExpectedPrimaryKey,
    R.OldView, R.ViewV2, R.OldSave, R.SaveV2, R.OldDelete, R.DeleteV2,
    R.EnableView, R.EnableSave, R.EnableDelete, R.DeletePolicy, R.GlobalReferenceOnly
FROM dbo.API_Phase3SimpleCrudRegistry() AS R
WHERE @TargetWebFormName = ''
   OR R.WebFormName COLLATE DATABASE_DEFAULT = @TargetWebFormName COLLATE DATABASE_DEFAULT
ORDER BY R.WebFormName;

OPEN FormCursor;
FETCH NEXT FROM FormCursor INTO
    @WebFormName, @ExpectedTable, @ExpectedPrimaryKey,
    @OldView, @ViewV2, @OldSave, @SaveV2, @OldDelete, @DeleteV2,
    @EnableView, @EnableSave, @EnableDelete, @DeletePolicy, @GlobalReferenceOnly;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CanApplyThisForm bit = CONVERT(bit, CASE
            WHEN @LiveGatesPassed <> 1 THEN 0
            WHEN @ApplyAllForms = 1 THEN 1
            WHEN @TargetWebFormName <> ''
             AND @TargetWebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1
            ELSE 0 END);

        DECLARE @RegistrationCount int, @RegisteredTable sysname, @RegisteredPrimaryKey sysname;
        SELECT
            @RegistrationCount = COUNT(*),
            @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
            @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
        FROM dbo.SY_FrmLstTbl AS L
        WHERE L.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

        IF ISNULL(@RegistrationCount, 0) <> 1
           OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
           OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
            THROW 53510, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

        DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
        IF @ObjectID IS NULL
            THROW 53511, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;
        IF NOT EXISTS (
            SELECT 1 FROM sys.columns AS C
            WHERE C.object_id = @ObjectID
              AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
        )
            THROW 53512, N'PHASE3_EXPECTED_PRIMARY_KEY_NOT_FOUND', 1;
        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes AS I
            INNER JOIN sys.index_columns AS IC
              ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
            WHERE I.object_id = @ObjectID AND I.is_unique = 1 AND I.is_disabled = 0
            GROUP BY I.index_id
            HAVING COUNT(*) = 1
               AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @ExpectedPrimaryKey, 'ColumnId')
        )
            THROW 53513, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE', 1;
        IF @GlobalReferenceOnly = 1 AND EXISTS (
            SELECT 1 FROM sys.columns AS C
            WHERE C.object_id = @ObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
        )
            THROW 53514, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;
        IF EXISTS (
            SELECT 1 FROM sys.columns AS C
            INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
            WHERE C.object_id = @ObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
              AND (
                  T.name COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
                  OR C.is_computed = 1
              )
        )
            THROW 53527, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT', 1;
        IF NOT EXISTS (
            SELECT 1 FROM dbo.WA_Menu AS M
            WHERE M.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND ISNULL(M.isDisable, 0) = 0
        )
            THROW 53515, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

        /* View gate độc lập. */
        DECLARE @RouteCount int, @CurrentProcedure sysname;
        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;

        IF @EnableView = 1 AND @ApplyView = 1 AND @CanApplyThisForm = 1
        BEGIN
            IF @RouteCount <> 1
                THROW 53516, N'PHASE3_VIEW_ROUTE_NOT_UNIQUE', 1;
            IF PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldView, 1) COLLATE DATABASE_DEFAULT
               AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@ViewV2, 1) COLLATE DATABASE_DEFAULT
                THROW 53517, N'PHASE3_VIEW_ROUTE_UNEXPECTED', 1;

            UPDATE dbo.WA_API
            SET [SQL] = @ViewV2,
                Para = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND [func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;
            IF @@ROWCOUNT <> 1 THROW 53518, N'PHASE3_VIEW_UPDATE_COUNT_INVALID', 1;
            INSERT INTO @Results VALUES (@WebFormName, 'VIEW', 'CUTOVER_V2', @ViewV2);
        END
        ELSE IF @EnableView = 1
            INSERT INTO @Results VALUES (
                @WebFormName, 'VIEW',
                CASE
                    WHEN @ApplyView = 0 THEN 'PREVIEW_APPLY_FLAG_OFF'
                    WHEN @LiveGatesPassed = 0 THEN 'PREVIEW_LIVE_GATE_REQUIRED'
                    ELSE 'PREVIEW_SCOPE_REQUIRED' END,
                CONCAT(N'Planned: ', @CurrentProcedure, N' -> ', @ViewV2)
            );
        ELSE
            INSERT INTO @Results VALUES (@WebFormName, 'VIEW', 'REGISTRY_DISABLED', @CurrentProcedure);

        /* Save gate độc lập. */
        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

        IF @EnableSave = 1 AND @ApplySave = 1 AND @CanApplyThisForm = 1
        BEGIN
            IF @RouteCount <> 1
                THROW 53519, N'PHASE3_SAVE_ROUTE_NOT_UNIQUE', 1;
            IF PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldSave, 1) COLLATE DATABASE_DEFAULT
               AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@SaveV2, 1) COLLATE DATABASE_DEFAULT
                THROW 53520, N'PHASE3_SAVE_ROUTE_UNEXPECTED', 1;

            UPDATE dbo.WA_API
            SET [SQL] = @SaveV2,
                Para = N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
              AND [func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;
            IF @@ROWCOUNT <> 1 THROW 53521, N'PHASE3_SAVE_UPDATE_COUNT_INVALID', 1;
            INSERT INTO @Results VALUES (@WebFormName, 'SAVE', 'CUTOVER_V2', @SaveV2);
        END
        ELSE IF @EnableSave = 1
            INSERT INTO @Results VALUES (
                @WebFormName, 'SAVE',
                CASE
                    WHEN @ApplySave = 0 THEN 'PREVIEW_APPLY_FLAG_OFF'
                    WHEN @LiveGatesPassed = 0 THEN 'PREVIEW_LIVE_GATE_REQUIRED'
                    ELSE 'PREVIEW_SCOPE_REQUIRED' END,
                CONCAT(N'Planned: ', @CurrentProcedure, N' -> ', @SaveV2)
            );
        ELSE
            INSERT INTO @Results VALUES (@WebFormName, 'SAVE', 'REGISTRY_DISABLED', @CurrentProcedure);

        /* Delete gate: mode được suy ra từ schema vật lý, không theo tên form. */
        SELECT @RouteCount = COUNT(*), @CurrentProcedure = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;

        IF @EnableDelete = 1
           AND @DeletePolicy COLLATE DATABASE_DEFAULT = 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
        BEGIN
            DECLARE @ResolvedDeleteMode varchar(20) =
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM sys.columns AS C
                        INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
                        WHERE C.object_id = @ObjectID
                          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
                          AND LOWER(T.name) COLLATE DATABASE_DEFAULT = 'bit' COLLATE DATABASE_DEFAULT
                          AND C.is_computed = 0
                    ) THEN 'SOFT'
                    WHEN EXISTS (
                        SELECT 1
                        FROM sys.columns AS C
                        WHERE C.object_id = @ObjectID
                          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
                    ) THEN 'INVALID'
                    ELSE 'HARD'
                END;

            IF @ResolvedDeleteMode = 'INVALID'
                THROW 53527, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT', 1;

            IF @ApplyDelete = 1 AND @CanApplyThisForm = 1
            BEGIN
                IF @RouteCount <> 1
                    THROW 53522, N'PHASE3_DELETE_ROUTE_NOT_UNIQUE', 1;
                IF PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@OldDelete, 1) COLLATE DATABASE_DEFAULT
                   AND PARSENAME(@CurrentProcedure, 1) COLLATE DATABASE_DEFAULT <> PARSENAME(@DeleteV2, 1) COLLATE DATABASE_DEFAULT
                    THROW 53523, N'PHASE3_DELETE_ROUTE_UNEXPECTED', 1;

                UPDATE dbo.WA_API
                SET [SQL] = @DeleteV2,
                    Para = N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}'''
                WHERE [list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
                   AND [func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;
                IF @@ROWCOUNT <> 1 THROW 53525, N'PHASE3_DELETE_UPDATE_COUNT_INVALID', 1;
                INSERT INTO @Results VALUES (
                    @WebFormName,
                    'DELETE',
                    CONCAT('CUTOVER_', @ResolvedDeleteMode, '_V2'),
                    @DeleteV2
                );
            END
            ELSE
                INSERT INTO @Results VALUES (
                    @WebFormName, 'DELETE',
                    CASE
                        WHEN @ApplyDelete = 0 THEN 'PREVIEW_APPLY_FLAG_OFF'
                        WHEN @LiveGatesPassed = 0 THEN 'PREVIEW_LIVE_GATE_REQUIRED'
                        ELSE 'PREVIEW_SCOPE_REQUIRED' END,
                    CONCAT(N'Planned ', @ResolvedDeleteMode, N': ', @CurrentProcedure, N' -> ', @DeleteV2)
                );
        END
        ELSE
            INSERT INTO @Results VALUES (
                @WebFormName, 'DELETE', 'REGISTRY_DELETE_DISABLED',
                CONCAT(N'No WA_API change. Current=', @CurrentProcedure, N'; policy=', @DeletePolicy)
            );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        INSERT INTO @Results (WebFormName, GateName, GateStatus, Diagnostic)
        VALUES (@WebFormName, 'FORM', 'ROLLED_BACK',
                CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE()));
    END CATCH;

    FETCH NEXT FROM FormCursor INTO
        @WebFormName, @ExpectedTable, @ExpectedPrimaryKey,
        @OldView, @ViewV2, @OldSave, @SaveV2, @OldDelete, @DeleteV2,
        @EnableView, @EnableSave, @EnableDelete, @DeletePolicy, @GlobalReferenceOnly;
END;

CLOSE FormCursor;
DEALLOCATE FormCursor;

SELECT WebFormName, GateName, GateStatus, Diagnostic
FROM @Results
ORDER BY WebFormName,
         CASE GateName WHEN 'VIEW' THEN 1 WHEN 'SAVE' THEN 2 WHEN 'DELETE' THEN 3 ELSE 4 END;

SELECT
    @ApplyView AS ApplyView,
    @ApplySave AS ApplySave,
    @ApplyDelete AS ApplyDelete,
    @ApplyAllForms AS ApplyAllForms,
    @LiveGatesPassed AS LiveGatesPassed,
    NULLIF(@TargetWebFormName, '') AS TargetWebFormName,
    CASE
        WHEN @ApplyView = 0 AND @ApplySave = 0 AND @ApplyDelete = 0 THEN 'PREVIEW_ONLY_DEFAULT'
        WHEN @LiveGatesPassed = 0 THEN 'PREVIEW_ONLY_LIVE_GATE_REQUIRED'
        WHEN @ApplyAllForms = 0 AND @TargetWebFormName = '' THEN 'PREVIEW_ONLY_SCOPE_REQUIRED'
        ELSE 'EXPLICIT_APPLY_REQUESTED'
    END AS ApplyMode;
GO
