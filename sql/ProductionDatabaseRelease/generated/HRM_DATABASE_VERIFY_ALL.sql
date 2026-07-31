
/*
  VERIFY_ALL - HRM_DB_CLEANUP_20260729
  FILE SINH TỰ ĐỘNG. KHÔNG SỬA TRỰC TIẾP.
  Build: node ./scripts/db-release/build-production-database-release.mjs
  Package manifest SHA-256: 8292894fc7b82033ba8a8cfbb9790dc85271b220ddfee8b7087e97917b396535
*/
:on error exit
:setvar TargetDatabase "X26DIMTUTAC"
:setvar ReleaseMode "PRODUCTION"

USE [$(TargetDatabase)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/14_Verification/002_verify_all.sql | SHA-256: 9374c52ca53f7a42ba9ef90d1a4ce79df1bdcb5e379363ad27ab18913116ae23 ===== */

/*
  VERIFY_ALL chỉ SELECT/THROW; không sửa dữ liệu.
*/
SET NOCOUNT ON;
DECLARE @Blocking int = 0;
DECLARE @Review int = 45;

DECLARE @ExpectedObjects table
(
    ObjectType varchar(30), SchemaName sysname, ObjectName sysname, ExpectedSha256 char(64) NULL
);
INSERT INTO @ExpectedObjects (ObjectType,SchemaName,ObjectName,ExpectedSha256)
VALUES
        (N'Table', N'dbo', N'WA_FieldContractRegistry', NULL),
        (N'Table', N'dbo', N'WA_FieldContractRouteBackup', NULL),
        (N'Table', N'dbo', N'WA_FieldDatasetRegistry', NULL),
        (N'Function', N'dbo', N'API_FieldMetadataContractRegistry', N'0304bb4060a096be2931dc9bb06985a26fbed3c02c179df7b8a9886770497c84'),
        (N'Function', N'dbo', N'API_HR_Dashboard_AuthorizedBranches', N'222cc4038bac88f2895176e593e66909b47bd68c26af7df4d768cd574aa8252f'),
        (N'Function', N'dbo', N'API_Phase3SimpleCrudRegistry', N'684b032fc9290fb0ff80ed22f31b9a07bad3259c09c039b6870a1a42c7bf7aef'),
        (N'Function', N'dbo', N'API_Phase4JoinRegistry', N'983cfd4c608cc90403860c64864379570a9b8a9c688e2a5cd1b30b2e11c5b6dd'),
        (N'Function', N'dbo', N'API_Web_GroupFormPermissionV2', N'900c1f4ed4d57d5182d62b56c19d27da8fe7b840410cb715ad1af74d98dcfbd4'),
        (N'StoredProcedure', N'dbo', N'API_ComboPersonStatus', N'402ebd9eff2e123a8f697f5089ae5c85b7a5413d5bb72d1d52a7b89af027f107'),
        (N'StoredProcedure', N'dbo', N'API_DanhSachChucDanh', N'7c15a6593ae9c31f41c36f7fb464a8a994636408f0c716514cd5205b990b131a'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong_Attach', N'49c0566b1f5c692624aef2344e9f9527e75c1903b3780800dfe2b7334bf5fd75'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong_ChiTiet', N'6a445e373eaf19713742bcf9b90ba0099e10b44789a67c05a9be74feb58a5acd'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong_LoaiHD', N'e75579b1de14588cc7ed70001427a3600f6a6ec64679b9e1c37f0b9c18b42933'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong_NamLap', N'8aeac92807d8780248bc387c801ece70f69bd6a74cd0085d7bb870baae71921c'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_Birthdays', N'92a71008a0337bf40b92e3f7c119ae86d17bbc0239ba6f4121dc89a70ac7ebf4'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_ContractsExpiring', N'db38dd32119e7eaf3922d141afb76412ba66ea206f90992147c69662fa2344b1'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_Demographics', N'0a8630b23b7e1976352c65998013ab1d69aa6151a8e48c4b0f719f28bc066576'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_Department', N'381faa184a287d47525c0bf11f2866206ea57ceb4b51c2e29f859523d1d8075e'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_GetBranches', N'9f41c25f0707982574b2a687b5905b63605a4d46adba013e61e5e973dec8ca78'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_OverviewToday', N'4f5a1093702147e8c1e4ea7fb5accc23ce27a67e989e14e8402af5b900ad86f0'),
        (N'StoredProcedure', N'dbo', N'API_HR_Dashboard_Payroll', N'546a0fec2a097b4687eb89a53e005d01db7bb09755d85f1ed7b89754c224806d'),
        (N'StoredProcedure', N'dbo', N'API_HR_NghiPhep_Attach', N'1ef54bef33d85f1025006699c07df338fc295f7798157e0c2bbdfbe05ea770b1'),
        (N'StoredProcedure', N'dbo', N'API_HR_NghiPhep_Attach_Save', N'79b91489de5814432db0e1b0c50f8a6979be81ef59ce633ec3e4c62ece90cc57'),
        (N'StoredProcedure', N'dbo', N'API_HR_NghiPhep_ChiTiet', N'054c469bca7c7ab6cb2413b51a969a59fd6dfba804a8041a0f09c2bc37cc5cba'),
        (N'StoredProcedure', N'dbo', N'API_LayQuyenCuaToi', N'2cbe0b2fe6a83487ead985a45bb722899164b3ab120208650e19a3d006a3592a'),
        (N'StoredProcedure', N'dbo', N'API_LuuDong_V2', N'e6419a9523698b8dea357abd44abe404b65b6510ef6390c1e8d8ee27011e8ae5'),
        (N'StoredProcedure', N'dbo', N'API_LuuThuTuMenu', N'a1b922cc48b09fe1275ae94015850828e6adca09d41c9b5c86c4a8a485f6ff0f'),
        (N'StoredProcedure', N'dbo', N'API_TruyVanDong_V2', N'6cdfc8e86fed889056a13cd2e15581e440b43f0e32ce0bcc08c5814ad31257d0'),
        (N'StoredProcedure', N'dbo', N'API_Web_CutoverSafeFieldContractsV2', N'83039687c15257fad8378979b86d1945fccabcb86e3526543d39cfe9bb24ee5a'),
        (N'StoredProcedure', N'dbo', N'API_Web_DiscoverFieldContractCandidatesV2', N'71582eaf4ea6cbd52ca3f6c39b1dbeb045e16337871e0dd4f841224cdfe2c674'),
        (N'StoredProcedure', N'dbo', N'API_Web_FieldContractResolveV2', N'184c53beb94af47f50aca17ad99fc409d32ebb30eb6db35cb7996a4c3348e1f4'),
        (N'StoredProcedure', N'dbo', N'API_Web_GridFieldCompareV2', N'b0bfe89829ee5ac66627207d1afbe3100d8663ae8ba40239e0f6d0905815db9d'),
        (N'StoredProcedure', N'dbo', N'API_Web_GridFieldSchemaV2', N'9cc1983bf2f3f165cf0452c81622110f4283cf71fecea233984c1a11c9ad0311'),
        (N'StoredProcedure', N'dbo', N'API_Web_JoinFieldSchemaV2', N'bbf5f5dc8988665bc3c2baaeaaddabf95837d90177452c2b09950ba7cad2a001'),
        (N'StoredProcedure', N'dbo', N'API_Web_LookupSchemaV2', N'e35822d746c9170caabaef1001fa9bd8c6545b19e8e77a9d341d98d407fa917e'),
        (N'StoredProcedure', N'dbo', N'API_Web_RollbackFieldContractV2', N'ffb8471919986139e0be4b521569418a1903d8331909ec1f1926eb75644e4c5d'),
        (N'StoredProcedure', N'dbo', N'API_Web_SeedSafeFieldContractsV2', N'70f52b02e121e416bacc4c101fb203da103f86275a35442c57a4f5d12ba669b1'),
        (N'StoredProcedure', N'dbo', N'API_Web_UpdateFieldFormat', N'b502e333a2c5667b412e2cadbc330db1fdd4433f6507c4889b326b805dd7046b'),
        (N'StoredProcedure', N'dbo', N'API_XoaDong_V2', N'4ff7f78d0f90b0a3cd2251b7253bd598fdea1489e892b1de720561dfc53863b0'),
        (N'StoredProcedure', N'dbo', N'API_XoaTruongGiaoDien', N'1cf60e873e4b37867968606a3b2ce31346200f1bde8aa42c950de381a511e585'),
        (N'StoredProcedure', N'dbo', N'API_CandidateAttach_SaveAvatar', N'09b742361deb6f5d35a60b5928502df84062637083af84f0271248914525c354'),
        (N'StoredProcedure', N'dbo', N'API_PersonAttach_SaveAvatar', N'36960f20849f258a8201313146a4b53b48bb5ea6c5690a780c3a1c2f190c1a6d'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong', N'67276d15b67631822c3590b69f55dfbe8e80f12f82ebdf5011d4b09e2a1b5e91'),
        (N'StoredProcedure', N'dbo', N'API_HopDongLaoDong_Attach_Save', N'e77160c95c02f38416615da6e1cac52a8c201f405c6cd7ec4828d753211235b7'),
        (N'StoredProcedure', N'dbo', N'API_HR_NghiPhep', N'ea001dce50c6854a98dce2b330e723dbcad9f872f42ecff09b78b42cfe87f07e'),
        (N'StoredProcedure', N'dbo', N'API_KinhPhiCongDoan', N'31e6be2f473bd6aa76b5861deadd0c297eb302023db6ed27e7cc84d0620d82b1'),
        (N'StoredProcedure', N'dbo', N'API_NguoiDungFrm', N'ddc25307f22bc02499a367dd57b7c7f36e5e0df7f94bab61bba3ce98e8932c70'),
        (N'StoredProcedure', N'dbo', N'API_NguoiDungNhomFrm', N'c512e32a9c85e3b045235400e879be121993e99dfe336f0deab0553a75f9f829');

/* 1. Release object status. */
SELECT N'01_RELEASE_OBJECT_STATUS' AS VerifyGroup, E.*,
       CASE WHEN OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)) IS NULL THEN 0 ELSE 1 END AS ObjectExists
FROM @ExpectedObjects AS E;
SET @Blocking += (SELECT COUNT(*) FROM @ExpectedObjects AS E
    WHERE OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)) IS NULL);

/* 2. Table/column/constraint/index. */
SELECT N'02_TABLE_SCHEMA' AS VerifyGroup, T.TableName,
       CASE WHEN OBJECT_ID(N'dbo.'+T.TableName,N'U') IS NULL THEN 0 ELSE 1 END AS TableExists
FROM (VALUES (N'WA_FieldContractRegistry'),(N'WA_FieldDatasetRegistry'),
             (N'WA_FieldContractRouteBackup'),(N'WA_DatabaseReleaseHistory')) AS T(TableName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES (N'WA_FieldContractRegistry'),(N'WA_FieldDatasetRegistry'),
    (N'WA_FieldContractRouteBackup'),(N'WA_DatabaseReleaseHistory')) AS T(TableName)
    WHERE OBJECT_ID(N'dbo.'+T.TableName,N'U') IS NULL);

DECLARE @RequiredControlColumns table(TableName sysname,ColumnName sysname);
INSERT INTO @RequiredControlColumns VALUES
 (N'WA_FieldContractRegistry',N'WebFormName'),(N'WA_FieldContractRegistry',N'ContractType'),
 (N'WA_FieldContractRegistry',N'ExpectedTableName'),(N'WA_FieldContractRegistry',N'ExpectedPrimaryKey'),
 (N'WA_FieldContractRegistry',N'ViewProcedure'),(N'WA_FieldContractRegistry',N'SaveProcedure'),
 (N'WA_FieldContractRegistry',N'DeleteProcedure'),(N'WA_FieldContractRegistry',N'RolloutStatus'),
 (N'WA_FieldDatasetRegistry',N'WebFormName'),(N'WA_FieldDatasetRegistry',N'DatasetKey'),
 (N'WA_FieldDatasetRegistry',N'ApiList'),(N'WA_FieldDatasetRegistry',N'ViewProcedure'),
 (N'WA_FieldDatasetRegistry',N'SaveProcedure'),(N'WA_FieldDatasetRegistry',N'DeleteProcedure'),
 (N'WA_FieldDatasetRegistry',N'RolloutStatus'),
 (N'WA_FieldContractRouteBackup',N'BackupBatchID'),(N'WA_FieldContractRouteBackup',N'ApiList'),
 (N'WA_FieldContractRouteBackup',N'Func'),(N'WA_FieldContractRouteBackup',N'SQL'),
 (N'WA_FieldContractRouteBackup',N'Para'),(N'WA_FieldContractRouteBackup',N'RestoredAt'),
 (N'WA_DatabaseReleaseHistory',N'ReleaseID'),(N'WA_DatabaseReleaseHistory',N'MetadataRouteBatchID'),
 (N'WA_DatabaseReleaseHistory',N'FieldRouteBatchID'),(N'WA_DatabaseReleaseHistory',N'Status'),
 (N'WA_DatabaseReleaseHistory',N'ManifestSha256');
SELECT N'02_COLUMN_SCHEMA' AS VerifyGroup,C.TableName,C.ColumnName,
       CASE WHEN COL_LENGTH(N'dbo.'+C.TableName,C.ColumnName) IS NULL THEN 0 ELSE 1 END AS ColumnExists
FROM @RequiredControlColumns AS C;
SET @Blocking += (SELECT COUNT(*) FROM @RequiredControlColumns AS C
    WHERE COL_LENGTH(N'dbo.'+C.TableName,C.ColumnName) IS NULL);

DECLARE @RequiredControlConstraints table(ConstraintName sysname,ObjectType varchar(2));
INSERT INTO @RequiredControlConstraints VALUES
 (N'PK_WA_FieldContractRegistry','PK'),(N'CK_WA_FieldContractRegistry_ContractType','C'),
 (N'CK_WA_FieldContractRegistry_RolloutStatus','C'),(N'CK_WA_FieldContractRegistry_SchemaVersion','C'),
 (N'PK_WA_FieldDatasetRegistry','PK'),(N'FK_WA_FieldDatasetRegistry_Form','F'),
 (N'CK_WA_FieldDatasetRegistry_RolloutStatus','C'),(N'CK_WA_FieldDatasetRegistry_SchemaVersion','C'),
 (N'CK_WA_FieldDatasetRegistry_ReadOnlyMutation','C'),
 (N'PK_WA_FieldContractRouteBackup','PK'),(N'UQ_WA_FieldContractRouteBackup_BatchRoute','UQ'),
 (N'PK_WA_DatabaseReleaseHistory','PK');
SELECT N'02_CONSTRAINT_SCHEMA' AS VerifyGroup,C.ConstraintName,C.ObjectType,
       CASE WHEN OBJECT_ID(N'dbo.'+C.ConstraintName,C.ObjectType) IS NULL THEN 0 ELSE 1 END AS ConstraintExists
FROM @RequiredControlConstraints AS C;
SET @Blocking += (SELECT COUNT(*) FROM @RequiredControlConstraints AS C
    WHERE OBJECT_ID(N'dbo.'+C.ConstraintName,C.ObjectType) IS NULL);

SELECT N'02_INDEX_SCHEMA' AS VerifyGroup,N'IX_WA_FieldContractRouteBackup_FormTime' AS IndexName,
       CASE WHEN EXISTS (SELECT 1 FROM sys.indexes
            WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
              AND name=N'IX_WA_FieldContractRouteBackup_FormTime') THEN 1 ELSE 0 END AS IndexExists;
IF NOT EXISTS (SELECT 1 FROM sys.indexes
    WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
      AND name=N'IX_WA_FieldContractRouteBackup_FormTime')
    SET @Blocking += 1;

/* 3. Stored procedure/view/function tồn tại. */
SELECT N'03_MODULE_EXISTENCE' AS VerifyGroup,ObjectType,SchemaName,ObjectName
FROM @ExpectedObjects
WHERE ObjectType IN ('StoredProcedure','View','Function');

/* 4. Object definition hash. */
SELECT N'04_DEFINITION_HASH' AS VerifyGroup, E.ObjectName, E.ExpectedSha256,
       LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
           REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)))),
               CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
FROM @ExpectedObjects AS E
WHERE E.ExpectedSha256 IS NOT NULL;
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM @ExpectedObjects AS E
    CROSS APPLY
    (
        SELECT LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
            REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)))),
                CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
    ) AS H
    WHERE E.ExpectedSha256 IS NOT NULL
      AND ISNULL(H.ActualSha256,'') <> E.ExpectedSha256
);

/* 5. WA_API route. */
SELECT N'05_WA_API_ROUTE' AS VerifyGroup,A.[list],A.[func],A.[SQL],A.Para
FROM dbo.WA_API AS A
WHERE A.[SQL] IN (SELECT ObjectName FROM @ExpectedObjects);

/* 6. Route duplicate. */
SELECT N'06_ROUTE_DUPLICATE' AS VerifyGroup,[list],[func],COUNT(*) AS RouteCount
FROM dbo.WA_API GROUP BY [list],[func] HAVING COUNT(*)>1;
SET @Blocking += (SELECT COUNT(*) FROM (SELECT 1 AS X FROM dbo.WA_API GROUP BY [list],[func] HAVING COUNT(*)>1) AS D);

/* 7. Route trỏ procedure không tồn tại. */
SELECT N'07_ROUTE_MISSING_PROCEDURE' AS VerifyGroup,A.[list],A.[func],A.[SQL]
FROM dbo.WA_API AS A
WHERE NULLIF(LTRIM(RTRIM(A.[SQL])),N'') IS NOT NULL
  AND A.[SQL] NOT LIKE N'% %'
  AND OBJECT_ID(N'dbo.'+PARSENAME(LTRIM(RTRIM(A.[SQL])),1),N'P') IS NULL;
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM dbo.WA_API AS A
    WHERE NULLIF(LTRIM(RTRIM(A.[SQL])),N'') IS NOT NULL
      AND A.[SQL] NOT LIKE N'% %'
      AND OBJECT_ID(N'dbo.'+PARSENAME(LTRIM(RTRIM(A.[SQL])),1),N'P') IS NULL
);

/* 8. SY_FrmLstTbl table/PK mismatch. */
SELECT N'08_FORM_TABLE_PK_MISMATCH' AS VerifyGroup,R.WebFormName,R.ExpectedTableName,R.ExpectedPrimaryKey,
       F.TableName AS RegisteredTable,F.PrimaryKey AS RegisteredPrimaryKey
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.SY_FrmLstTbl AS F ON F.FormID=R.WebFormName
WHERE R.IsEnabled=1 AND R.ContractType<>'READ_ONLY'
  AND (F.FormID IS NULL OR F.TableName<>R.ExpectedTableName OR F.PrimaryKey<>R.ExpectedPrimaryKey);
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM dbo.WA_FieldContractRegistry AS R
    LEFT JOIN dbo.SY_FrmLstTbl AS F ON F.FormID=R.WebFormName
    WHERE R.IsEnabled=1 AND R.ContractType<>'READ_ONLY'
      AND (F.FormID IS NULL OR F.TableName<>R.ExpectedTableName OR F.PrimaryKey<>R.ExpectedPrimaryKey)
);

/* 9. Unified Contract registry. */
SELECT N'09_CONTRACT_REGISTRY' AS VerifyGroup,ContractType,RolloutStatus,COUNT(*) AS ContractCount
FROM dbo.WA_FieldContractRegistry GROUP BY ContractType,RolloutStatus;

/* 10. Dataset registry. */
SELECT N'10_DATASET_REGISTRY' AS VerifyGroup,* FROM dbo.WA_FieldDatasetRegistry;

/* 11. Dashboard dependencies. */
SELECT N'11_DASHBOARD' AS VerifyGroup,D.ProcedureName,
       CASE WHEN OBJECT_ID(N'dbo.'+D.ProcedureName,N'P') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES (N'API_HR_Dashboard_GetBranches'),(N'API_HR_Dashboard_OverviewToday'),
 (N'API_HR_Dashboard_Demographics'),(N'API_HR_Dashboard_Department'),
 (N'API_HR_Dashboard_Birthdays'),(N'API_HR_Dashboard_Payroll'),
 (N'API_HR_Dashboard_ContractsExpiring')) AS D(ProcedureName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES (N'API_HR_Dashboard_GetBranches'),(N'API_HR_Dashboard_OverviewToday'),
 (N'API_HR_Dashboard_Demographics'),(N'API_HR_Dashboard_Department'),
 (N'API_HR_Dashboard_Birthdays'),(N'API_HR_Dashboard_Payroll'),
 (N'API_HR_Dashboard_ContractsExpiring')) AS D(ProcedureName)
 WHERE OBJECT_ID(N'dbo.'+D.ProcedureName,N'P') IS NULL);

/* 12. Bulk Import dependencies. */
SELECT N'12_BULK_IMPORT' AS VerifyGroup,T.ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+T.ObjectName,N'U') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES(N'SY_FrmLstTbl'),(N'WA_API'),(N'SY_User'),(N'WA_Menu'),(N'WA_UserGroupPermisstion')) AS T(ObjectName);

/* 13. Attachment/eContract dependencies. */
SELECT N'13_DOCUMENT_ATTACHMENT_ECONTRACT' AS VerifyGroup,V.Feature,V.Decision
FROM (VALUES
 (N'Contract document / attachment',N'KEEP_ORIGINAL_WA_API_BUSINESS_ROUTES'),
 (N'VNPT eContract tables/view',N'REVIEW_REQUIRED_NOT_DEPLOYED_NO_CURRENT_CALLER')
) AS V(Feature,Decision);

/* 14. Branch policy. */
SELECT N'14_BRANCH_POLICY' AS VerifyGroup,WebFormName,BranchPolicy,RolloutStatus
FROM dbo.WA_FieldContractRegistry;

/* 15. Legacy compatibility APIs. */
SELECT N'15_LEGACY_COMPATIBILITY' AS VerifyGroup,L.ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+L.ObjectName,N'P') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES(N'API_TruyVanDong'),(N'API_LuuDong'),(N'API_XoaDong')) AS L(ObjectName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES(N'API_TruyVanDong'),(N'API_LuuDong'),(N'API_XoaDong')) AS L(ObjectName)
 WHERE OBJECT_ID(N'dbo.'+L.ObjectName,N'P') IS NULL);

/* 16. Complex/deferred forms không bị cutover. */
SELECT N'16_COMPLEX_DEFERRED' AS VerifyGroup,WebFormName,ContractType,RolloutStatus,RolloutReason
FROM dbo.WA_FieldContractRegistry
WHERE ContractType IN ('COMPLEX_DEFERRED','BLOCKED') OR RolloutStatus IN ('DEFERRED','BLOCKED');

/* 17. Original-only object vẫn tồn tại. */
DECLARE @OriginalOnly table(ObjectName sysname);
INSERT INTO @OriginalOnly VALUES
        (N'API_BaoHiem_PersonLookup');
SELECT N'17_ORIGINAL_ONLY' AS VerifyGroup,ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+ObjectName) IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM @OriginalOnly;
SET @Blocking += (SELECT COUNT(*) FROM @OriginalOnly WHERE OBJECT_ID(N'dbo.'+ObjectName) IS NULL);

/* 18. Test-only object deploy hoặc loại với lý do. */
SELECT N'18_TEST_ONLY_DECISION' AS VerifyGroup,T.*
FROM (VALUES
        (N'API_BangThueTNCN_V2', N'DEPRECATE_NOT_DEPLOY', N'Prototype V2 đã được generic API_TruyVanDong_V2 thay thế; không deploy và chưa drop.'),
        (N'API_Calculate_MucDong_CongDoan', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_CandidateAttach_SaveAvatar', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_ComboPersonStatus', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_DangKyFormWeb', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_DanhSachChucDanh', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_DanhSachTaiKhoan', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_Dropdown_ReportTemplates', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HopDongLaoDong', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HopDongLaoDong_Attach', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HopDongLaoDong_Attach_File', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HopDongLaoDong_Attach_Metadata', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HopDongLaoDong_Attach_Save', N'KEEP_TEST', N'Route attachment backend hiện tại cần procedure; dùng definition đã kiểm tra trong DB test.'),
        (N'API_HopDongLaoDong_ChiTiet', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HopDongLaoDong_LoaiHD', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HopDongLaoDong_NamLap', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HoSoNhanVienIn', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HoSoNhanVienQuit', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HR_BangThamSo_Lookup', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HR_Dashboard_Birthdays', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_ContractsExpiring', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_Demographics', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_Department', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_GetBranches', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_OverviewToday', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_Dashboard_Payroll', N'KEEP_REPOSITORY', N'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.'),
        (N'API_HR_GetForm', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_HR_NghiPhep', N'KEEP_TEST', N'Route form nghỉ phép hiện tại cần procedure; dùng definition đã kiểm tra trong DB test.'),
        (N'API_HR_NghiPhep_Attach', N'KEEP_TEST', N'Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng.'),
        (N'API_HR_NghiPhep_Attach_File', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HR_NghiPhep_Attach_Metadata', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_HR_NghiPhep_Attach_Save', N'KEEP_TEST', N'Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng.'),
        (N'API_HR_NghiPhep_ChiTiet', N'KEEP_TEST', N'Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng.'),
        (N'API_KinhPhiCongDoan', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_KinhPhiCongDoan_PersonList', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_LayQuyenCuaToi', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_LuuDong_V2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_NguoiDungFrm', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_NguoiDungNhomFrm', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_PersonAttach_SaveAvatar', N'KEEP_REPOSITORY', N'Object test-only có caller/route hiện tại và canonical repository.'),
        (N'API_TheoDoiTaiNguyenFormWeb', N'REVIEW_REQUIRED', N'Object test-only chưa có đủ bằng chứng để đưa vào production.'),
        (N'API_TruyVanDong_V2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_CutoverSafeFieldContractsV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_DiscoverFieldContractCandidatesV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_FieldContractResolveV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_GridFieldCompareV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_GridFieldSchemaV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_JoinFieldSchemaV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_LookupSchemaV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_RollbackFieldContractV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_SeedSafeFieldContractsV2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_Web_UpdateFieldFormat', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.'),
        (N'API_XoaDong_V2', N'KEEP_REPOSITORY', N'Object Web/framework-owned có canonical source mới nhất trong repository.')
) AS T(ObjectName,Decision,Reason);

/* 19. API decision matrix count. */
SELECT N'19_API_DECISION_COUNT' AS VerifyGroup,D.Decision,D.ObjectCount
FROM (VALUES
 (N'KEEP_REPOSITORY',45),
 (N'KEEP_ORIGINAL',55),
 (N'KEEP_TEST',5),
 (N'MERGE_REQUIRED',29),
 (N'COMPATIBILITY_KEEP',3),
 (N'DEPRECATE_NOT_DEPLOY',1),
 (N'REVIEW_REQUIRED',16),
 (N'DROP_CANDIDATE_AFTER_MONITORING',0)
) AS D(Decision,ObjectCount);

/* 20. Rollback readiness. */
SELECT N'20_ROLLBACK_READINESS' AS VerifyGroup,H.ReleaseID,H.Status,H.MetadataRouteBatchID,H.FieldRouteBatchID,
       CASE WHEN OBJECT_ID(N'dbo.API_Web_RollbackFieldContractV2',N'P') IS NULL THEN 0 ELSE 1 END AS RollbackProcedureExists
FROM dbo.WA_DatabaseReleaseHistory AS H WHERE H.ReleaseID=N'HRM_DB_CLEANUP_20260729';
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.WA_DatabaseReleaseHistory
    WHERE ReleaseID=N'HRM_DB_CLEANUP_20260729'
      AND Status='INSTALLED'
      AND ManifestSha256='8292894fc7b82033ba8a8cfbb9790dc85271b220ddfee8b7087e97917b396535'
)
    SET @Blocking += 1;

SELECT CASE WHEN @Blocking>0 THEN N'FAIL'
            WHEN @Review>0 THEN N'PASS_WITH_REVIEW'
            ELSE N'PASS' END AS FinalVerificationStatus,
       @Blocking AS BlockingIssueCount,@Review AS ManualReviewCount,
       165 AS OriginalStoredProcedureAuditCount,
       217 AS TestStoredProcedureAuditCount;
IF @Blocking>0 THROW 56400,N'VERIFY_ALL_FAILED',1;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/14_Verification/002_verify_all.sql ===== */
