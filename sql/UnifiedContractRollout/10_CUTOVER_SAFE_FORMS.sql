/*
  Cutover theo DB registry. Procedure mặc định xử lý toàn bộ contract sẵn sàng;
  truyền @WebFormName để xử lý một form. Mọi route thay đổi đều được backup trước.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_CutoverSafeFieldContractsV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_CutoverSafeFieldContractsV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_CutoverSafeFieldContractsV2
    @WebFormName varchar(100) = NULL,
    @UserName varchar(100),
    @BatchID uniqueidentifier = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = NULLIF(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), '');
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    IF @UserName = '' THROW 54400, N'FIELD_CONTRACT_CUTOVER_ACTOR_REQUIRED', 1;
    IF @BatchID IS NULL SET @BatchID = NEWID();

    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
       OR OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
       OR OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
       OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
        THROW 54401, N'FIELD_CONTRACT_CUTOVER_SOURCE_MISSING', 1;

    DECLARE @Forms table
    (
        WebFormName varchar(100) PRIMARY KEY,
        ContractType varchar(40),
        ExpectedTableName sysname,
        ExpectedPrimaryKey sysname,
        ViewList varchar(100),
        ViewProcedure sysname,
        SaveProcedure sysname,
        DeleteProcedure sysname
    );

    INSERT INTO @Forms
    SELECT
        R.WebFormName, R.ContractType, R.ExpectedTableName, R.ExpectedPrimaryKey,
        ISNULL(NULLIF(R.ViewList, ''), R.WebFormName),
        R.ViewProcedure, R.SaveProcedure, R.DeleteProcedure
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.IsEnabled = 1
      AND R.WebFormName LIKE '%Frm'
      AND
      (
          R.RolloutStatus = 'ACTIVE'
          OR
          (
              R.RolloutStatus = 'SHADOW'
              AND R.RolloutReason LIKE '%READY_FOR_CUTOVER'
          )
      )
      AND R.ContractType IN
          ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY')
      AND (@WebFormName IS NULL OR R.WebFormName = @WebFormName);

    IF @WebFormName IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM @Forms WHERE WebFormName = @WebFormName)
        THROW 54402, N'FIELD_CONTRACT_FORM_NOT_READY_FOR_CUTOVER', 1;

    IF NOT EXISTS (SELECT 1 FROM @Forms)
    BEGIN
        SELECT @BatchID AS BackupBatchID, N'NO_READY_FORM' AS CutoverStatus;
        RETURN;
    END;

    /* Gate table/PK và unique key cho toàn bộ master. */
    IF EXISTS
    (
        SELECT 1
        FROM @Forms AS F
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RegistrationCount,
                MIN(CONVERT(sysname, L.TableName)) AS TableName,
                MIN(CONVERT(sysname, L.PrimaryKey)) AS PrimaryKey
            FROM dbo.SY_FrmLstTbl AS L
            WHERE L.FormID = F.WebFormName
        ) AS L
        WHERE L.RegistrationCount <> 1
           OR L.TableName <> F.ExpectedTableName
           OR L.PrimaryKey <> F.ExpectedPrimaryKey
    )
        THROW 54403, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_MISMATCH', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Forms AS F
        WHERE OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U') IS NULL
           OR NOT EXISTS
           (
               SELECT 1
               FROM sys.columns AS C
               WHERE C.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                 AND C.name = F.ExpectedPrimaryKey
           )
           OR NOT EXISTS
           (
               SELECT 1
               FROM sys.indexes AS I
               INNER JOIN sys.index_columns AS IC
                 ON IC.object_id = I.object_id
                AND IC.index_id = I.index_id
                AND IC.key_ordinal > 0
               WHERE I.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                 AND I.is_unique = 1
                 AND I.is_disabled = 0
               GROUP BY I.index_id
               HAVING COUNT(*) = 1
                  AND MAX(IC.column_id) = COLUMNPROPERTY(
                      OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U'),
                      F.ExpectedPrimaryKey,
                      'ColumnId'
                  )
           )
    )
        THROW 54404, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_NOT_SAFE', 1;

    /* Gate physical table/PK của dataset; SY_FrmLstTbl được đối chiếu nếu có. */
    IF EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RegistrationCount,
                MIN(CONVERT(sysname, L.TableName)) AS TableName,
                MIN(CONVERT(sysname, L.PrimaryKey)) AS PrimaryKey
            FROM dbo.SY_FrmLstTbl AS L
            WHERE L.FormID = D.ApiList
        ) AS L
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW')
          AND
          (
              OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U') IS NULL
              OR NOT EXISTS
              (
                  SELECT 1 FROM sys.columns AS C
                  WHERE C.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                    AND C.name = D.ExpectedPrimaryKey
              )
              OR NOT EXISTS
              (
                  SELECT 1
                  FROM sys.indexes AS I
                  INNER JOIN sys.index_columns AS IC
                    ON IC.object_id = I.object_id
                   AND IC.index_id = I.index_id
                   AND IC.key_ordinal > 0
                  WHERE I.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                    AND I.is_unique = 1
                    AND I.is_disabled = 0
                  GROUP BY I.index_id
                  HAVING COUNT(*) = 1
                     AND MAX(IC.column_id) = COLUMNPROPERTY(
                         OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U'),
                         D.ExpectedPrimaryKey,
                         'ColumnId'
                     )
              )
              OR D.ParentField IS NULL
              OR D.ChildField IS NULL
              OR NOT EXISTS
              (
                  SELECT 1 FROM sys.columns AS C
                  WHERE C.object_id = OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U')
                    AND C.name = D.ParentField
              )
              OR NOT EXISTS
              (
                  SELECT 1 FROM sys.columns AS C
                  WHERE C.object_id = OBJECT_ID(N'dbo.' + D.ExpectedTableName, N'U')
                    AND C.name = D.ChildField
              )
              OR (L.RegistrationCount > 0
                  AND (L.RegistrationCount <> 1
                       OR L.TableName <> D.ExpectedTableName
                       OR L.PrimaryKey <> D.ExpectedPrimaryKey))
          )
    )
        THROW 54405, N'FIELD_CONTRACT_DATASET_TABLE_PRIMARY_KEY_MISMATCH', 1;

    DECLARE @Targets table
    (
        TargetID int IDENTITY(1, 1) PRIMARY KEY,
        WebFormName varchar(100),
        ApiList varchar(100),
        Func varchar(20),
        DesiredProcedure sysname,
        DesiredPara nvarchar(max),
        KeepBusinessView bit
    );

    INSERT INTO @Targets
        (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
    SELECT
        F.WebFormName,
        F.ViewList,
        'View',
        F.ViewProcedure,
        CASE WHEN F.ContractType = 'SIMPLE_TABLE'
            THEN N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
            ELSE NULL END,
        CONVERT(bit, CASE WHEN F.ContractType = 'SIMPLE_TABLE' THEN 0 ELSE 1 END)
    FROM @Forms AS F
    WHERE F.ViewProcedure IS NOT NULL;

    INSERT INTO @Targets
        (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
    SELECT F.WebFormName, F.WebFormName, 'Save', F.SaveProcedure,
           N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''',
           0
    FROM @Forms AS F
    WHERE F.SaveProcedure IS NOT NULL AND F.ContractType <> 'READ_ONLY'
    UNION ALL
    SELECT F.WebFormName, F.WebFormName, 'Delete', F.DeleteProcedure,
           N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''',
           0
    FROM @Forms AS F
    WHERE F.DeleteProcedure IS NOT NULL AND F.ContractType <> 'READ_ONLY';

    INSERT INTO @Targets
        (WebFormName, ApiList, Func, DesiredProcedure, DesiredPara, KeepBusinessView)
    SELECT D.WebFormName, D.ApiList, 'View', D.ViewProcedure, NULL, 1
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
    WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.ViewProcedure IS NOT NULL
    UNION ALL
    SELECT D.WebFormName, D.ApiList, 'Save', D.SaveProcedure,
           N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''',
           0
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
    WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 0 AND D.SaveProcedure IS NOT NULL
    UNION ALL
    SELECT D.WebFormName, D.ApiList, 'Delete', D.DeleteProcedure,
           N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''',
           0
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
    WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 0 AND D.DeleteProcedure IS NOT NULL;

    IF EXISTS
    (
        SELECT 1 FROM @Targets
        GROUP BY ApiList, Func
        HAVING COUNT(*) > 1
    )
        THROW 54406, N'FIELD_CONTRACT_TARGET_ROUTE_DUPLICATE', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Targets AS T
        WHERE OBJECT_ID(N'dbo.' + T.DesiredProcedure, N'P') IS NULL
    )
        THROW 54407, N'FIELD_CONTRACT_TARGET_PROCEDURE_NOT_FOUND', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Targets AS T
        INNER JOIN dbo.WA_API AS A
          ON A.[list] = T.ApiList AND A.[func] = T.Func
        GROUP BY T.ApiList, T.Func
        HAVING COUNT(*) > 1
    )
        THROW 54408, N'FIELD_CONTRACT_ROUTE_DUPLICATE', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Targets AS T
        WHERE T.KeepBusinessView = 1
          AND
          (
              (SELECT COUNT(*) FROM dbo.WA_API AS A
               WHERE A.[list] = T.ApiList AND A.[func] = T.Func) <> 1
              OR NOT EXISTS
              (
                  SELECT 1 FROM dbo.WA_API AS A
                  WHERE A.[list] = T.ApiList
                    AND A.[func] = T.Func
                    AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) = T.DesiredProcedure
              )
          )
    )
        THROW 54409, N'FIELD_CONTRACT_BUSINESS_VIEW_ROUTE_MISMATCH', 1;

    IF EXISTS
    (
        SELECT 1
        FROM @Forms AS F
        INNER JOIN dbo.WA_API AS A
          ON A.[list] = F.WebFormName
         AND A.[func] IN ('Save', 'Delete')
        WHERE F.ContractType = 'READ_ONLY'
    )
       OR EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        INNER JOIN dbo.WA_API AS A
          ON A.[list] = D.ApiList
         AND A.[func] IN ('Save', 'Delete')
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW') AND D.IsReadOnly = 1
    )
        THROW 54411, N'FIELD_CONTRACT_READONLY_MUTATION_ROUTE_FORBIDDEN', 1;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE
            @TargetID int,
            @OwnerForm varchar(100),
            @ApiList varchar(100),
            @Func varchar(20),
            @DesiredProcedure sysname,
            @DesiredPara nvarchar(max),
            @KeepBusinessView bit,
            @RouteCount int,
            @CurrentProcedure sysname,
            @CurrentSql nvarchar(max),
            @CurrentPara nvarchar(max);

        DECLARE RouteCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT TargetID, WebFormName, ApiList, Func, DesiredProcedure,
                   DesiredPara, KeepBusinessView
            FROM @Targets
            ORDER BY TargetID;

        OPEN RouteCursor;
        FETCH NEXT FROM RouteCursor INTO
            @TargetID, @OwnerForm, @ApiList, @Func, @DesiredProcedure,
            @DesiredPara, @KeepBusinessView;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT
                @RouteCount = COUNT(*),
                @CurrentProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))),
                @CurrentSql = MIN(CONVERT(nvarchar(max), A.[SQL])),
                @CurrentPara = MIN(CONVERT(nvarchar(max), A.Para))
            FROM dbo.WA_API AS A WITH (UPDLOCK, HOLDLOCK)
            WHERE A.[list] = @ApiList AND A.[func] = @Func;

            IF @KeepBusinessView = 0
               AND @RouteCount = 1
               AND @CurrentProcedure <> @DesiredProcedure
               AND
               (
                   (@Func = 'View' AND @CurrentProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2'))
                   OR (@Func = 'Save' AND @CurrentProcedure NOT IN (N'API_LuuDong', N'API_LuuDong_V2'))
                   OR (@Func = 'Delete' AND @CurrentProcedure NOT IN (N'API_XoaDong', N'API_XoaDong_V2'))
               )
                THROW 54410, N'FIELD_CONTRACT_CUSTOM_MUTATION_OR_VIEW_NOT_REPLACEABLE', 1;

            IF @KeepBusinessView = 0
               AND
               (
                   @RouteCount = 0
                   OR @CurrentProcedure <> @DesiredProcedure
                   OR ISNULL(@CurrentPara, N'') <> ISNULL(@DesiredPara, N'')
               )
            BEGIN
                INSERT INTO dbo.WA_FieldContractRouteBackup
                (
                    BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
                    [SQL], Para, BackupTime, BackupUser
                )
                VALUES
                (
                    @BatchID, @OwnerForm, @ApiList, @Func,
                    CASE WHEN @RouteCount = 1 THEN 1 ELSE 0 END,
                    @CurrentSql, @CurrentPara, SYSUTCDATETIME(), @UserName
                );

                IF @RouteCount = 1
                    UPDATE dbo.WA_API
                    SET [SQL] = @DesiredProcedure, Para = @DesiredPara
                    WHERE [list] = @ApiList AND [func] = @Func;
                ELSE
                    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
                    VALUES (@ApiList, @Func, @DesiredProcedure, @DesiredPara);
            END;

            FETCH NEXT FROM RouteCursor INTO
                @TargetID, @OwnerForm, @ApiList, @Func, @DesiredProcedure,
                @DesiredPara, @KeepBusinessView;
        END;

        CLOSE RouteCursor;
        DEALLOCATE RouteCursor;

        /*
          Chỉ bật ACTIVE sau khi toàn bộ route đã cập nhật thành công trong cùng
          transaction; lỗi ở bất kỳ route nào sẽ rollback cả route lẫn trạng thái.
        */
        UPDATE D
        SET RolloutStatus = 'ACTIVE',
            RolloutReason = CONCAT(N'CUTOVER_BATCH_', CONVERT(nvarchar(36), @BatchID)),
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldDatasetRegistry AS D
        INNER JOIN @Forms AS F ON F.WebFormName = D.WebFormName
        WHERE D.RolloutStatus IN ('ACTIVE', 'SHADOW');

        UPDATE R
        SET RolloutStatus = 'ACTIVE',
            RolloutReason = CONCAT(N'CUTOVER_BATCH_', CONVERT(nvarchar(36), @BatchID)),
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldContractRegistry AS R
        INNER JOIN @Forms AS F ON F.WebFormName = R.WebFormName;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'RouteCursor') >= 0
            CLOSE RouteCursor;

        IF CURSOR_STATUS('local', 'RouteCursor') >= -1
            DEALLOCATE RouteCursor;
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT
        @BatchID AS BackupBatchID,
        B.WebFormName,
        B.ApiList,
        B.Func,
        B.RouteExisted,
        B.[SQL] AS BeforeSQL,
        A.[SQL] AS AfterSQL,
        B.BackupTime
    FROM dbo.WA_FieldContractRouteBackup AS B
    LEFT JOIN dbo.WA_API AS A
      ON A.[list] = B.ApiList AND A.[func] = B.Func
    WHERE B.BackupBatchID = @BatchID
    ORDER BY B.BackupID;
END;
GO

/*
  Không tự EXEC cutover trong installer. Quản trị viên phải review discovery/
  verify rồi gọi procedure cho toàn bộ hoặc một form cụ thể.
*/
SELECT
    WebFormName, ContractType, RolloutStatus, RolloutReason
FROM dbo.WA_FieldContractRegistry
WHERE IsEnabled = 1 AND RolloutStatus = 'ACTIVE'
ORDER BY WebFormName;
