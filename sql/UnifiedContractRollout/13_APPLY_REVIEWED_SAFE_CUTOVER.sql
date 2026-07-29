/*
  Áp dụng cutover cho các contract CRUD đã qua discovery/seed và đủ điều kiện.
  - SIMPLE_TABLE dùng View/Save/Delete V2.
  - JOIN/MASTER giữ View nghiệp vụ đã đăng ký, chỉ dùng mutation V2 khi an toàn.
  - REPORT/READ_ONLY không được tạo route Save/Delete.
  - DEFERRED/BLOCKED và form đặc thù không bị thay route.
  Toàn bộ thay đổi có backup và rollback nếu hậu kiểm không đạt.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.API_Web_CutoverSafeFieldContractsV2', N'P') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
    THROW 54700, N'FIELD_CONTRACT_SAFE_CUTOVER_NOT_INSTALLED', 1;

DECLARE @Actor varchar(100) =
    LEFT(COALESCE(NULLIF(CONVERT(varchar(128), SUSER_SNAME()), ''), 'SYSTEM_SAFE_CUTOVER'), 100);
DECLARE @BatchID uniqueidentifier = NEWID();

DECLARE @ReadyForms table
(
    WebFormName varchar(100) NOT NULL PRIMARY KEY,
    ContractType varchar(40) NOT NULL,
    ViewList varchar(100) NOT NULL,
    ViewProcedure sysname NULL,
    SaveProcedure sysname NULL,
    DeleteProcedure sysname NULL
);

INSERT INTO @ReadyForms
(
    WebFormName,
    ContractType,
    ViewList,
    ViewProcedure,
    SaveProcedure,
    DeleteProcedure
)
SELECT
    R.WebFormName,
    R.ContractType,
    ISNULL(NULLIF(R.ViewList, ''), R.WebFormName),
    R.ViewProcedure,
    R.SaveProcedure,
    R.DeleteProcedure
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
      ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY');

/* Danh sách sẽ được xử lý và route hiện tại trước cutover. */
SELECT
    F.WebFormName,
    F.ContractType,
    F.ViewProcedure AS ExpectedView,
    V.[SQL] AS CurrentView,
    F.SaveProcedure AS ExpectedSave,
    S.[SQL] AS CurrentSave,
    F.DeleteProcedure AS ExpectedDelete,
    D.[SQL] AS CurrentDelete
FROM @ReadyForms AS F
LEFT JOIN dbo.WA_API AS V
  ON V.[list] = F.ViewList
 AND V.[func] = 'View'
LEFT JOIN dbo.WA_API AS S
  ON S.[list] = F.WebFormName
 AND S.[func] = 'Save'
LEFT JOIN dbo.WA_API AS D
  ON D.[list] = F.WebFormName
 AND D.[func] = 'Delete'
ORDER BY F.WebFormName;

IF NOT EXISTS (SELECT 1 FROM @ReadyForms)
BEGIN
    SELECT
        @BatchID AS BackupBatchID,
        CONVERT(varchar(40), 'NO_READY_FORM') AS CutoverStatus;
    RETURN;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    EXEC dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName = NULL,
        @UserName = @Actor,
        @BatchID = @BatchID OUTPUT;

    /* Hậu kiểm route master theo đúng contract, không suy diễn từ tên form. */
    IF EXISTS
    (
        SELECT 1
        FROM @ReadyForms AS F
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = F.ViewList
              AND A.[func] = 'View'
        ) AS V
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = F.WebFormName
              AND A.[func] = 'Save'
        ) AS S
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = F.WebFormName
              AND A.[func] = 'Delete'
        ) AS D
        WHERE V.RouteCount <> 1
           OR ISNULL(V.ProcedureName, N'') <> ISNULL(F.ViewProcedure, N'')
           OR
           (
               F.SaveProcedure IS NOT NULL
               AND (S.RouteCount <> 1 OR S.ProcedureName <> F.SaveProcedure)
           )
           OR
           (
               F.SaveProcedure IS NULL
               AND S.RouteCount <> 0
           )
           OR
           (
               F.DeleteProcedure IS NOT NULL
               AND (D.RouteCount <> 1 OR D.ProcedureName <> F.DeleteProcedure)
           )
           OR
           (
               F.DeleteProcedure IS NULL
               AND D.RouteCount <> 0
           )
    )
        THROW 54701, N'FIELD_CONTRACT_MASTER_ROUTE_POSTCHECK_FAILED', 1;

    /* Dataset con cũng phải đúng View và mutation policy sau cutover. */
    IF EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS Dataset
        INNER JOIN @ReadyForms AS F
          ON F.WebFormName = Dataset.WebFormName
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = Dataset.ApiList
              AND A.[func] = 'View'
        ) AS V
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = Dataset.ApiList
              AND A.[func] = 'Save'
        ) AS S
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS RouteCount,
                MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))) AS ProcedureName
            FROM dbo.WA_API AS A
            WHERE A.[list] = Dataset.ApiList
              AND A.[func] = 'Delete'
        ) AS D
        WHERE Dataset.RolloutStatus = 'ACTIVE'
          AND
          (
              V.RouteCount <> 1
              OR ISNULL(V.ProcedureName, N'') <> ISNULL(Dataset.ViewProcedure, N'')
              OR
              (
                  Dataset.IsReadOnly = 0
                  AND
                  (
                      S.RouteCount <> 1
                      OR S.ProcedureName <> Dataset.SaveProcedure
                      OR D.RouteCount <> 1
                      OR D.ProcedureName <> Dataset.DeleteProcedure
                  )
              )
              OR
              (
                  Dataset.IsReadOnly = 1
                  AND (S.RouteCount <> 0 OR D.RouteCount <> 0)
              )
          )
    )
        THROW 54702, N'FIELD_CONTRACT_DATASET_ROUTE_POSTCHECK_FAILED', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    @BatchID AS BackupBatchID,
    @Actor AS AppliedBy,
    COUNT(DISTINCT B.WebFormName) AS AppliedFormCount,
    COUNT(*) AS ChangedRouteCount
FROM dbo.WA_FieldContractRouteBackup AS B
WHERE B.BackupBatchID = @BatchID;

/* Ma trận route cuối cùng của các form vừa được xét. */
SELECT
    F.WebFormName,
    F.ContractType,
    R.RolloutStatus,
    V.[SQL] AS ViewProcedure,
    S.[SQL] AS SaveProcedure,
    D.[SQL] AS DeleteProcedure
FROM @ReadyForms AS F
INNER JOIN dbo.WA_FieldContractRegistry AS R
  ON R.WebFormName = F.WebFormName
LEFT JOIN dbo.WA_API AS V
  ON V.[list] = F.ViewList
 AND V.[func] = 'View'
LEFT JOIN dbo.WA_API AS S
  ON S.[list] = F.WebFormName
 AND S.[func] = 'Save'
LEFT JOIN dbo.WA_API AS D
  ON D.[list] = F.WebFormName
 AND D.[func] = 'Delete'
ORDER BY F.WebFormName;

/* Các form không được tự động chuyển, giữ để audit tiếp. */
SELECT
    R.WebFormName,
    R.ContractType,
    R.RolloutStatus,
    R.RolloutReason
FROM dbo.WA_FieldContractRegistry AS R
WHERE R.IsEnabled = 1
  AND R.RolloutStatus IN ('DEFERRED', 'BLOCKED')
ORDER BY R.RolloutStatus, R.WebFormName;
