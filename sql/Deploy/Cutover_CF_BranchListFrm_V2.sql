/*
  Cutover riêng danh mục chi nhánh sang Unified Field Contract V2.
  Script idempotent, không đọc hoặc đồng bộ SY_FormatFields.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
   OR OBJECT_ID(N'dbo.API_Web_CutoverSafeFieldContractsV2', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_LuuDong_V2', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_XoaDong_V2', N'P') IS NULL
    THROW 54800, N'BRANCH_DIRECTORY_V2_DEPENDENCY_MISSING', 1;

IF CHARINDEX(
       N'SET @BranchID = @UserBranches',
       ISNULL(OBJECT_DEFINITION(OBJECT_ID(N'dbo.API_TruyVanDong_V2')), N'')
   ) = 0
    THROW 54806, N'BRANCH_DIRECTORY_VIEW_V2_OUTDATED_RUN_FILE_07', 1;

IF OBJECT_ID(N'dbo.CF_BranchTbl', N'U') IS NULL
    THROW 54801, N'BRANCH_DIRECTORY_TABLE_NOT_FOUND', 1;

IF
(
    SELECT COUNT(*)
    FROM dbo.SY_FrmLstTbl
    WHERE FormID = 'CF_BranchListFrm'
      AND TableName = 'CF_BranchTbl'
      AND PrimaryKey = 'BranchID'
) <> 1
    THROW 54802, N'BRANCH_DIRECTORY_TABLE_CONTRACT_INVALID', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes AS I
    INNER JOIN sys.index_columns AS IC
      ON IC.object_id = I.object_id
     AND IC.index_id = I.index_id
     AND IC.key_ordinal > 0
    WHERE I.object_id = OBJECT_ID(N'dbo.CF_BranchTbl', N'U')
      AND I.is_unique = 1
      AND I.is_disabled = 0
    GROUP BY I.index_id
    HAVING COUNT(*) = 1
       AND MAX(IC.column_id) =
           COLUMNPROPERTY(OBJECT_ID(N'dbo.CF_BranchTbl', N'U'), 'BranchID', 'ColumnId')
)
    THROW 54803, N'BRANCH_DIRECTORY_PRIMARY_KEY_NOT_UNIQUE', 1;

DECLARE @Actor varchar(100) =
    LEFT(COALESCE(NULLIF(CONVERT(varchar(128), SUSER_SNAME()), ''), 'SYSTEM_BRANCH_SCOPE_FIX'), 100);
DECLARE @Now datetime2(3) = SYSUTCDATETIME();
DECLARE @BatchID uniqueidentifier = NEWID();
DECLARE @DesiredViewParameters nvarchar(max) =
    N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''';

BEGIN TRANSACTION;
BEGIN TRY
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry
        WHERE WebFormName = 'CF_BranchListFrm'
    )
    BEGIN
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        VALUES
        (
            'CF_BranchListFrm', 'CF_BranchListFrm', 'CF_BranchListFrm', 'SIMPLE_TABLE',
            N'CF_BranchTbl', N'BranchID', 'CF_BranchListFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2', 'SAFE_TABLE_COLUMNS', 'BRANCH_SCOPED',
            'AUTO_SCHEMA', 'SHADOW', N'CONFIRMED_BRANCH_DIRECTORY_READY_FOR_CUTOVER', 2,
            1, @Now, @Actor, @Now, @Actor
        );
    END
    ELSE
    BEGIN
        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_FieldContractRegistry
            WHERE WebFormName = 'CF_BranchListFrm'
              AND
              (
                  ISNULL(ExpectedTableName, N'') <> N'CF_BranchTbl'
                  OR ISNULL(ExpectedPrimaryKey, N'') <> N'BranchID'
              )
        )
            THROW 54804, N'BRANCH_DIRECTORY_EXISTING_CONTRACT_MISMATCH', 1;

        UPDATE dbo.WA_FieldContractRegistry
        SET ERPFormID = 'CF_BranchListFrm',
            PermissionFormName = 'CF_BranchListFrm',
            ContractType = 'SIMPLE_TABLE',
            ViewList = 'CF_BranchListFrm',
            ViewProcedure = N'API_TruyVanDong_V2',
            SaveProcedure = N'API_LuuDong_V2',
            DeleteProcedure = N'API_XoaDong_V2',
            WritePolicy = 'SAFE_TABLE_COLUMNS',
            BranchPolicy = 'BRANCH_SCOPED',
            DeletePolicy = 'AUTO_SCHEMA',
            RolloutStatus = 'SHADOW',
            RolloutReason = N'CONFIRMED_BRANCH_DIRECTORY_READY_FOR_CUTOVER',
            SchemaVersion = 2,
            IsEnabled = 1,
            UpdatedAt = @Now,
            UpdatedBy = @Actor
        WHERE WebFormName = 'CF_BranchListFrm'
          AND
          (
              ContractType <> 'SIMPLE_TABLE'
              OR ViewProcedure <> N'API_TruyVanDong_V2'
              OR SaveProcedure <> N'API_LuuDong_V2'
              OR DeleteProcedure <> N'API_XoaDong_V2'
              OR BranchPolicy <> 'BRANCH_SCOPED'
              OR RolloutStatus <> 'ACTIVE'
              OR NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_API AS CurrentView
                  WHERE CurrentView.[list] = 'CF_BranchListFrm'
                    AND CurrentView.[func] = 'View'
                    AND PARSENAME(LTRIM(RTRIM(CurrentView.[SQL])), 1) =
                        N'API_TruyVanDong_V2'
              )
          );
    END;

    DECLARE
        @ViewRouteCount int,
        @CurrentViewSql nvarchar(max),
        @CurrentViewParameters nvarchar(max);

    SELECT
        @ViewRouteCount = COUNT(*),
        @CurrentViewSql = MIN(CONVERT(nvarchar(max), [SQL])),
        @CurrentViewParameters = MIN(CONVERT(nvarchar(max), Para))
    FROM dbo.WA_API WITH (UPDLOCK, HOLDLOCK)
    WHERE [list] = 'CF_BranchListFrm'
      AND [func] = 'View';

    IF @ViewRouteCount > 1
        THROW 54807, N'BRANCH_DIRECTORY_VIEW_ROUTE_DUPLICATE', 1;

    IF @ViewRouteCount = 0
       OR PARSENAME(LTRIM(RTRIM(@CurrentViewSql)), 1) <> N'API_TruyVanDong_V2'
       OR ISNULL(@CurrentViewParameters, N'') <> @DesiredViewParameters
    BEGIN
        INSERT INTO dbo.WA_FieldContractRouteBackup
        (
            BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
            [SQL], Para, BackupTime, BackupUser
        )
        VALUES
        (
            @BatchID, 'CF_BranchListFrm', 'CF_BranchListFrm', 'View',
            CASE WHEN @ViewRouteCount = 1 THEN 1 ELSE 0 END,
            @CurrentViewSql, @CurrentViewParameters, SYSUTCDATETIME(), @Actor
        );

        IF @ViewRouteCount = 1
            UPDATE dbo.WA_API
            SET [SQL] = N'API_TruyVanDong_V2',
                Para = @DesiredViewParameters
            WHERE [list] = 'CF_BranchListFrm'
              AND [func] = 'View';
        ELSE
            INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
            VALUES
                ('CF_BranchListFrm', 'View', N'API_TruyVanDong_V2', @DesiredViewParameters);
    END;

    EXEC dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName = 'CF_BranchListFrm',
        @UserName = @Actor,
        @BatchID = @BatchID OUTPUT;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry AS R
        INNER JOIN dbo.WA_API AS V
          ON V.[list] = R.ViewList
         AND V.[func] = 'View'
        WHERE R.WebFormName = 'CF_BranchListFrm'
          AND R.ContractType = 'SIMPLE_TABLE'
          AND R.BranchPolicy = 'BRANCH_SCOPED'
          AND R.RolloutStatus = 'ACTIVE'
          AND R.ViewProcedure = N'API_TruyVanDong_V2'
          AND PARSENAME(LTRIM(RTRIM(V.[SQL])), 1) = N'API_TruyVanDong_V2'
    )
        THROW 54805, N'BRANCH_DIRECTORY_V2_POSTCHECK_FAILED', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    @BatchID AS BackupBatchID,
    R.WebFormName,
    R.ContractType,
    R.BranchPolicy,
    R.RolloutStatus,
    R.RolloutReason,
    V.[SQL] AS ViewProcedure,
    V.Para AS ViewParameters
FROM dbo.WA_FieldContractRegistry AS R
INNER JOIN dbo.WA_API AS V
  ON V.[list] = R.ViewList
 AND V.[func] = 'View'
WHERE R.WebFormName = 'CF_BranchListFrm';
