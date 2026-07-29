/*
  Diagnostics chỉ đọc cho mass rollout. Mỗi mục bên dưới là một result set độc lập.
*/
SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
    THROW 54600, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;

/* 1. Tổng số form theo ContractType. */
SELECT ContractType, COUNT(*) AS FormCount
FROM dbo.WA_FieldContractRegistry
GROUP BY ContractType
ORDER BY ContractType;

/* 2. Tổng số form theo RolloutStatus. */
SELECT RolloutStatus, COUNT(*) AS FormCount
FROM dbo.WA_FieldContractRegistry
GROUP BY RolloutStatus
ORDER BY RolloutStatus;

/* 3. Danh sách ACTIVE. */
SELECT * FROM dbo.WA_FieldContractRegistry
WHERE RolloutStatus = 'ACTIVE'
ORDER BY WebFormName;

/* 4. Danh sách SHADOW. */
SELECT * FROM dbo.WA_FieldContractRegistry
WHERE RolloutStatus = 'SHADOW'
ORDER BY WebFormName;

/* 5. Danh sách DEFERRED. */
SELECT * FROM dbo.WA_FieldContractRegistry
WHERE RolloutStatus = 'DEFERRED'
ORDER BY WebFormName;

/* 6. Danh sách BLOCKED và reason. */
SELECT WebFormName, ContractType, RolloutReason
FROM dbo.WA_FieldContractRegistry
WHERE RolloutStatus = 'BLOCKED' OR ContractType = 'BLOCKED'
ORDER BY WebFormName;

/* 7. Route View/Save/Delete trước và sau theo snapshot mới nhất. */
;WITH LatestBatch AS
(
    SELECT TOP (1) BackupBatchID
    FROM dbo.WA_FieldContractRouteBackup
    ORDER BY BackupTime DESC, BackupID DESC
)
SELECT
    B.BackupBatchID, B.WebFormName, B.ApiList, B.Func,
    B.RouteExisted, B.[SQL] AS BeforeSQL, B.Para AS BeforePara,
    A.[SQL] AS AfterSQL, A.Para AS AfterPara
FROM dbo.WA_FieldContractRouteBackup AS B
INNER JOIN LatestBatch AS X ON X.BackupBatchID = B.BackupBatchID
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = B.ApiList AND A.[func] = B.Func
ORDER BY B.BackupID;

/* 8. Route trùng. */
SELECT [list], [func], COUNT(*) AS RouteCount
FROM dbo.WA_API
GROUP BY [list], [func]
HAVING COUNT(*) > 1
ORDER BY [list], [func];

/* 9. Table/PK mismatch. */
SELECT
    R.WebFormName,
    R.ExpectedTableName,
    R.ExpectedPrimaryKey,
    L.TableName AS RegisteredTableName,
    L.PrimaryKey AS RegisteredPrimaryKey
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.SY_FrmLstTbl AS L
  ON L.FormID = R.WebFormName
WHERE R.IsEnabled = 1
  AND
  (
      L.FormID IS NULL
      OR L.TableName <> R.ExpectedTableName
      OR L.PrimaryKey <> R.ExpectedPrimaryKey
      OR OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U') IS NULL
      OR NOT EXISTS
      (
          SELECT 1 FROM sys.columns AS C
          WHERE C.object_id = OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U')
            AND C.name = R.ExpectedPrimaryKey
      )
  )
ORDER BY R.WebFormName;

/* 10. View procedure không tồn tại. */
SELECT WebFormName, ViewList, ViewProcedure
FROM dbo.WA_FieldContractRegistry
WHERE IsEnabled = 1
  AND ViewProcedure IS NOT NULL
  AND OBJECT_ID(N'dbo.' + ViewProcedure, N'P') IS NULL
ORDER BY WebFormName;

/* 11. Save/Delete procedure không tồn tại. */
SELECT WebFormName, SaveProcedure, DeleteProcedure
FROM dbo.WA_FieldContractRegistry
WHERE IsEnabled = 1
  AND
  (
      (SaveProcedure IS NOT NULL AND OBJECT_ID(N'dbo.' + SaveProcedure, N'P') IS NULL)
      OR (DeleteProcedure IS NOT NULL AND OBJECT_ID(N'dbo.' + DeleteProcedure, N'P') IS NULL)
  )
ORDER BY WebFormName;

/* 12. Form ACTIVE vẫn dùng API_LuuDong legacy. */
SELECT R.WebFormName, A.[SQL], A.Para
FROM dbo.WA_FieldContractRegistry AS R
INNER JOIN dbo.WA_API AS A
  ON A.[list] = R.WebFormName AND A.[func] = 'Save'
WHERE R.RolloutStatus = 'ACTIVE'
  AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) = N'API_LuuDong'
ORDER BY R.WebFormName;

/* 13. Form ACTIVE vẫn dùng API_XoaDong legacy. */
SELECT R.WebFormName, A.[SQL], A.Para
FROM dbo.WA_FieldContractRegistry AS R
INNER JOIN dbo.WA_API AS A
  ON A.[list] = R.WebFormName AND A.[func] = 'Delete'
WHERE R.RolloutStatus = 'ACTIVE'
  AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) = N'API_XoaDong'
ORDER BY R.WebFormName;

/* 14. SIMPLE_TABLE ACTIVE chưa dùng API_TruyVanDong_V2. */
SELECT R.WebFormName, A.[SQL], A.Para
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
 AND A.[func] = 'View'
WHERE R.RolloutStatus = 'ACTIVE'
  AND R.ContractType = 'SIMPLE_TABLE'
  AND ISNULL(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1), N'') <> N'API_TruyVanDong_V2'
ORDER BY R.WebFormName;

/* 15. JOIN View bị thay nhầm bằng generic View. */
SELECT R.WebFormName, R.ViewProcedure AS ExpectedBusinessView, A.[SQL] AS CurrentView
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.WA_API AS A
  ON A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
 AND A.[func] = 'View'
WHERE R.RolloutStatus = 'ACTIVE'
  AND R.ContractType IN ('JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE')
  AND R.ViewProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
  AND
  (
      PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
      OR ISNULL(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1), N'') <> R.ViewProcedure
  )
ORDER BY R.WebFormName;

/* 16. Dataset editable chưa dùng mutation V2. */
SELECT D.WebFormName, D.DatasetKey, D.ApiList, S.[SQL] AS SaveRoute, X.[SQL] AS DeleteRoute
FROM dbo.WA_FieldDatasetRegistry AS D
LEFT JOIN dbo.WA_API AS S ON S.[list] = D.ApiList AND S.[func] = 'Save'
LEFT JOIN dbo.WA_API AS X ON X.[list] = D.ApiList AND X.[func] = 'Delete'
WHERE D.RolloutStatus = 'ACTIVE'
  AND D.IsReadOnly = 0
  AND
  (
      ISNULL(PARSENAME(LTRIM(RTRIM(S.[SQL])), 1), N'') <> N'API_LuuDong_V2'
      OR ISNULL(PARSENAME(LTRIM(RTRIM(X.[SQL])), 1), N'') <> N'API_XoaDong_V2'
  )
ORDER BY D.WebFormName, D.DatasetKey;

/* 17. Dataset read-only có Save/Delete trái phép. */
SELECT D.WebFormName, D.DatasetKey, D.ApiList, A.[func], A.[SQL]
FROM dbo.WA_FieldDatasetRegistry AS D
INNER JOIN dbo.WA_API AS A
  ON A.[list] = D.ApiList AND A.[func] IN ('Save', 'Delete')
WHERE D.RolloutStatus = 'ACTIVE' AND D.IsReadOnly = 1
ORDER BY D.WebFormName, D.DatasetKey, A.[func];

/* 18. Form complex hoặc Report không phải READ_ONLY bị ACTIVE nhầm. */
SELECT WebFormName, ContractType, RolloutStatus, RolloutReason
FROM dbo.WA_FieldContractRegistry
WHERE RolloutStatus = 'ACTIVE'
  AND
  (
      ContractType IN ('COMPLEX_DEFERRED', 'BLOCKED')
      OR (WebFormName LIKE '%Report' AND ContractType <> 'READ_ONLY')
  )
ORDER BY WebFormName;

/* 19. Runtime metadata path còn đọc SY_FormatFields. */
SELECT
    OBJECT_SCHEMA_NAME(M.object_id) AS SchemaName,
    OBJECT_NAME(M.object_id) AS ObjectName
FROM sys.sql_modules AS M
WHERE OBJECT_NAME(M.object_id) IN
(
    'API_Web_GridFieldSchemaV2',
    'API_Web_JoinFieldSchemaV2',
    'API_TruyVanDong_V2',
    'API_LuuDong_V2',
    'API_XoaDong_V2'
)
  AND M.definition LIKE '%SY[_]FormatFields%'
ORDER BY ObjectName;

/* 20. Snapshot rollback batch mới nhất. */
;WITH LatestBatch AS
(
    SELECT TOP (1) BackupBatchID
    FROM dbo.WA_FieldContractRouteBackup
    ORDER BY BackupTime DESC, BackupID DESC
)
SELECT B.*
FROM dbo.WA_FieldContractRouteBackup AS B
INNER JOIN LatestBatch AS X ON X.BackupBatchID = B.BackupBatchID
ORDER BY B.BackupID;

/* 21. Danh sách contract an toàn còn ở SHADOW và route đang chờ cutover V2. */
SELECT
    R.WebFormName,
    R.ContractType,
    R.RolloutReason,
    R.ViewProcedure AS ExpectedView,
    V.[SQL] AS CurrentView,
    R.SaveProcedure AS ExpectedSave,
    S.[SQL] AS CurrentSave,
    R.DeleteProcedure AS ExpectedDelete,
    D.[SQL] AS CurrentDelete
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.WA_API AS V
  ON V.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
 AND V.[func] = 'View'
LEFT JOIN dbo.WA_API AS S
  ON S.[list] = R.WebFormName
 AND S.[func] = 'Save'
LEFT JOIN dbo.WA_API AS D
  ON D.[list] = R.WebFormName
 AND D.[func] = 'Delete'
WHERE R.IsEnabled = 1
  AND R.WebFormName LIKE '%Frm'
  AND R.RolloutStatus = 'SHADOW'
  AND R.RolloutReason LIKE '%READY_FOR_CUTOVER'
  AND R.ContractType IN
      ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY')
ORDER BY R.ContractType, R.WebFormName;

/*
  22. Runtime V2 không được trộn quyền cá nhân cũ với quyền nhóm mà web đang dùng.
  Result set này phải rỗng.
*/
SELECT
    OBJECT_SCHEMA_NAME(M.object_id) AS SchemaName,
    OBJECT_NAME(M.object_id) AS ObjectName
FROM sys.sql_modules AS M
WHERE OBJECT_NAME(M.object_id) IN
(
    'API_Web_GroupFormPermissionV2',
    'API_Web_GridFieldSchemaV2',
    'API_Web_JoinFieldSchemaV2',
    'API_TruyVanDong_V2',
    'API_LuuDong_V2',
    'API_XoaDong_V2'
)
  AND M.definition LIKE '%WA[_]UserPermisstion%'
ORDER BY ObjectName;

/* 23. Contract không ánh xạ được menu dùng để kiểm tra quyền metadata V2. */
SELECT
    R.WebFormName,
    R.PermissionFormName,
    R.RolloutStatus,
    R.RolloutReason
FROM dbo.WA_FieldContractRegistry AS R
WHERE R.IsEnabled = 1
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.WA_Menu AS M
      WHERE M.FormName COLLATE DATABASE_DEFAULT =
            R.PermissionFormName COLLATE DATABASE_DEFAULT
        AND ISNULL(M.isDisable, 0) = 0
  )
ORDER BY R.WebFormName;

/* 24. Contract đủ điều kiện nhưng khai báo route policy không đúng chuẩn V2. */
SELECT
    R.WebFormName,
    R.ContractType,
    R.RolloutStatus,
    R.ViewProcedure,
    R.SaveProcedure,
    R.DeleteProcedure
FROM dbo.WA_FieldContractRegistry AS R
WHERE R.IsEnabled = 1
  AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
  AND
  (
      (
          R.ContractType = 'SIMPLE_TABLE'
          AND
          (
              ISNULL(R.ViewProcedure, N'') <> N'API_TruyVanDong_V2'
              OR ISNULL(R.SaveProcedure, N'') <> N'API_LuuDong_V2'
              OR ISNULL(R.DeleteProcedure, N'') <> N'API_XoaDong_V2'
          )
      )
      OR
      (
          R.ContractType IN ('JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE')
          AND
          (
              R.ViewProcedure IS NULL
              OR ISNULL(R.SaveProcedure, N'') <> N'API_LuuDong_V2'
              OR ISNULL(R.DeleteProcedure, N'') <> N'API_XoaDong_V2'
          )
      )
      OR
      (
          R.ContractType = 'READ_ONLY'
          AND
          (
              R.ViewProcedure IS NULL
              OR R.SaveProcedure IS NOT NULL
              OR R.DeleteProcedure IS NOT NULL
          )
      )
  )
ORDER BY R.ContractType, R.WebFormName;

/*
  25. Danh mục chi nhánh phải dùng contract V2 có giới hạn chi nhánh.
  Result set này phải rỗng.
*/
SELECT
    R.WebFormName,
    R.ContractType,
    R.BranchPolicy,
    R.RolloutStatus,
    R.ViewProcedure,
    V.[SQL] AS CurrentView
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.WA_API AS V
  ON V.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
 AND V.[func] = 'View'
WHERE R.WebFormName = 'CF_BranchListFrm'
  AND
  (
      R.ContractType <> 'SIMPLE_TABLE'
      OR R.BranchPolicy <> 'BRANCH_SCOPED'
      OR R.RolloutStatus <> 'ACTIVE'
      OR R.ViewProcedure <> N'API_TruyVanDong_V2'
      OR ISNULL(PARSENAME(LTRIM(RTRIM(V.[SQL])), 1), N'') <> N'API_TruyVanDong_V2'
  );
