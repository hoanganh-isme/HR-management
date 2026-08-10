
/*
  INSTALL_ALL - HRM_DB_CLEANUP_20260729
  FILE SINH TỰ ĐỘNG. KHÔNG SỬA TRỰC TIẾP.
  Build: node ./scripts/db-release/build-production-database-release.mjs
  Package manifest SHA-256: 4e594fe8ca7978f795ada71b45044019c79cee25ec9b060a83c7a5e2bd79fbe0
*/
:on error exit
:setvar TargetDatabase "X26DIMTUTAC"
:setvar ReleaseMode "PRODUCTION"

USE [$(TargetDatabase)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/00_Precheck/001_release_precheck.sql | SHA-256: 71011dfd9579eeaa942359c232818b8a4dbc7547236c3306be3884851a40be8f ===== */

/*
  Precheck production: read-only, fail-closed, không kết nối database khác.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF DB_ID(N'$(TargetDatabase)') IS NULL
    THROW 56000, N'TARGET_DATABASE_NOT_FOUND', 1;
IF DB_NAME() <> N'$(TargetDatabase)'
    THROW 56001, N'TARGET_DATABASE_CONTEXT_MISMATCH', 1;
IF LOWER(DB_NAME()) IN (N'master', N'tempdb', N'model', N'msdb')
    THROW 56002, N'SYSTEM_DATABASE_IS_FORBIDDEN', 1;
IF TRY_CONVERT(int, SERVERPROPERTY('ProductMajorVersion')) < 13
    THROW 56003, N'SQL_SERVER_2016_OR_NEWER_REQUIRED', 1;
IF ISJSON(N'{"release":"precheck"}') <> 1
    THROW 56004, N'SQL_JSON_SUPPORT_REQUIRED', 1;
IF OBJECT_ID(N'sys.dm_exec_describe_first_result_set_for_object') IS NULL
    THROW 56005, N'DM_EXEC_DESCRIBE_SUPPORT_REQUIRED', 1;

IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SY_User', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_Menu', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_UserGroupPermisstion', N'U') IS NULL
    THROW 56006, N'ORIGINAL_BASELINE_CORE_TABLE_MISSING', 1;

IF OBJECT_ID(N'dbo.API_TruyVanDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_LuuDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_XoaDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_BaoHiem_PersonLookup', N'P') IS NULL
    THROW 56007, N'ORIGINAL_BASELINE_LEGACY_API_MISSING', 1;

IF (OBJECT_ID(N'dbo.WA_FieldContractRegistry',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'WebFormName') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'ContractType') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'RolloutStatus') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_FieldContractRegistry',N'PK') IS NULL))
 OR (OBJECT_ID(N'dbo.WA_FieldDatasetRegistry',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'WebFormName') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'DatasetKey') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'ApiList') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_FieldDatasetRegistry',N'PK') IS NULL))
 OR (OBJECT_ID(N'dbo.WA_FieldContractRouteBackup',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'BackupBatchID') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'ApiList') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'Func') IS NULL
      OR OBJECT_ID(N'dbo.UQ_WA_FieldContractRouteBackup_BatchRoute',N'UQ') IS NULL
      OR NOT EXISTS (SELECT 1 FROM sys.indexes
          WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
            AND name=N'IX_WA_FieldContractRouteBackup_FormTime')))
 OR (OBJECT_ID(N'dbo.WA_DatabaseReleaseHistory',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_DatabaseReleaseHistory',N'ReleaseID') IS NULL
      OR COL_LENGTH(N'dbo.WA_DatabaseReleaseHistory',N'ManifestSha256') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_DatabaseReleaseHistory',N'PK') IS NULL))
    THROW 56011, N'CONTROL_TABLE_SCHEMA_CONFLICT', 1;

DECLARE @ApprovedBusinessModules table(ObjectName sysname PRIMARY KEY, ExpectedSha256 char(64) NOT NULL);
INSERT INTO @ApprovedBusinessModules (ObjectName,ExpectedSha256)
VALUES
        (N'API_ComboPersonStatus',N'402ebd9eff2e123a8f697f5089ae5c85b7a5413d5bb72d1d52a7b89af027f107'),
        (N'API_DanhSachChucDanh',N'7c15a6593ae9c31f41c36f7fb464a8a994636408f0c716514cd5205b990b131a'),
        (N'API_HopDongLaoDong_Attach',N'49c0566b1f5c692624aef2344e9f9527e75c1903b3780800dfe2b7334bf5fd75'),
        (N'API_HopDongLaoDong_ChiTiet',N'6a445e373eaf19713742bcf9b90ba0099e10b44789a67c05a9be74feb58a5acd'),
        (N'API_HopDongLaoDong_LoaiHD',N'e75579b1de14588cc7ed70001427a3600f6a6ec64679b9e1c37f0b9c18b42933'),
        (N'API_HopDongLaoDong_NamLap',N'8aeac92807d8780248bc387c801ece70f69bd6a74cd0085d7bb870baae71921c'),
        (N'API_HR_NghiPhep_Attach',N'1ef54bef33d85f1025006699c07df338fc295f7798157e0c2bbdfbe05ea770b1'),
        (N'API_HR_NghiPhep_Attach_Save',N'79b91489de5814432db0e1b0c50f8a6979be81ef59ce633ec3e4c62ece90cc57'),
        (N'API_HR_NghiPhep_ChiTiet',N'054c469bca7c7ab6cb2413b51a969a59fd6dfba804a8041a0f09c2bc37cc5cba'),
        (N'API_LayQuyenCuaToi',N'2cbe0b2fe6a83487ead985a45bb722899164b3ab120208650e19a3d006a3592a'),
        (N'API_LuuThuTuMenu',N'a1b922cc48b09fe1275ae94015850828e6adca09d41c9b5c86c4a8a485f6ff0f'),
        (N'API_XoaTruongGiaoDien',N'1cf60e873e4b37867968606a3b2ce31346200f1bde8aa42c950de381a511e585'),
        (N'API_CandidateAttach_SaveAvatar',N'09b742361deb6f5d35a60b5928502df84062637083af84f0271248914525c354'),
        (N'API_PersonAttach_SaveAvatar',N'36960f20849f258a8201313146a4b53b48bb5ea6c5690a780c3a1c2f190c1a6d'),
        (N'API_HopDongLaoDong',N'67276d15b67631822c3590b69f55dfbe8e80f12f82ebdf5011d4b09e2a1b5e91'),
        (N'API_HopDongLaoDong_Attach_Save',N'e77160c95c02f38416615da6e1cac52a8c201f405c6cd7ec4828d753211235b7'),
        (N'API_HR_NghiPhep',N'ea001dce50c6854a98dce2b330e723dbcad9f872f42ecff09b78b42cfe87f07e'),
        (N'API_KinhPhiCongDoan',N'31e6be2f473bd6aa76b5861deadd0c297eb302023db6ed27e7cc84d0620d82b1'),
        (N'API_NguoiDungFrm',N'ddc25307f22bc02499a367dd57b7c7f36e5e0df7f94bab61bba3ce98e8932c70'),
        (N'API_NguoiDungNhomFrm',N'c512e32a9c85e3b045235400e879be121993e99dfe336f0deab0553a75f9f829');
IF EXISTS
(
    SELECT 1
    FROM @ApprovedBusinessModules AS E
    CROSS APPLY
    (
        SELECT LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
            REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(N'dbo.'+E.ObjectName))),
                CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
    ) AS H
    WHERE OBJECT_ID(N'dbo.'+E.ObjectName,N'P') IS NOT NULL
      AND ISNULL(H.ActualSha256,'') <> E.ExpectedSha256
)
    THROW 56010, N'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED', 1;

IF EXISTS
(
    SELECT 1 FROM dbo.WA_API
    GROUP BY [list], [func]
    HAVING COUNT(*) > 1
)
    THROW 56008, N'WA_API_DUPLICATE_ROUTE_REVIEW_REQUIRED', 1;

PRINT N'Không có BLOCKING_MISSING_DEPENDENCY trong kết quả phân tích đã hiệu chỉnh.';
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/00_Precheck/001_release_precheck.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/01_Tables/001_control_tables.sql | SHA-256: 8ab69a4cb437d9215ae096713144cf39a606a494ad3d175381fa4a1574ae2578 ===== */

/*
  Control tables Web-owned. Chỉ CREATE khi chưa tồn tại; không xóa hoặc rebuild bảng.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldContractRegistry
    (
        WebFormName varchar(100) NOT NULL,
        ERPFormID varchar(100) NOT NULL,
        PermissionFormName varchar(100) NOT NULL,
        ContractType varchar(40) NOT NULL,
        ExpectedTableName sysname NULL,
        ExpectedPrimaryKey sysname NULL,
        ViewList varchar(100) NULL,
        ViewProcedure sysname NULL,
        SaveProcedure sysname NULL,
        DeleteProcedure sysname NULL,
        WritePolicy varchar(40) NOT NULL,
        BranchPolicy varchar(40) NOT NULL,
        DeletePolicy varchar(40) NOT NULL,
        RolloutStatus varchar(20) NOT NULL,
        RolloutReason nvarchar(500) NULL,
        SchemaVersion int NOT NULL,
        IsEnabled bit NOT NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldContractRegistry PRIMARY KEY (WebFormName),
        CONSTRAINT CK_WA_FieldContractRegistry_ContractType CHECK
            (ContractType IN ('SIMPLE_TABLE','JOIN_VIEW_SINGLE_TABLE','MASTER_DETAIL_SIMPLE','READ_ONLY','COMPLEX_DEFERRED','BLOCKED')),
        CONSTRAINT CK_WA_FieldContractRegistry_RolloutStatus CHECK
            (RolloutStatus IN ('ACTIVE','SHADOW','DEFERRED','DISABLED','BLOCKED')),
        CONSTRAINT CK_WA_FieldContractRegistry_SchemaVersion CHECK (SchemaVersion > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldDatasetRegistry
    (
        WebFormName varchar(100) NOT NULL,
        DatasetKey varchar(80) NOT NULL,
        ApiList varchar(100) NOT NULL,
        ViewProcedure sysname NULL,
        ExpectedTableName sysname NULL,
        ExpectedPrimaryKey sysname NULL,
        ParentField sysname NULL,
        ChildField sysname NULL,
        IsReadOnly bit NOT NULL,
        SaveProcedure sysname NULL,
        DeleteProcedure sysname NULL,
        WritePolicy varchar(40) NOT NULL,
        BranchPolicy varchar(40) NOT NULL,
        RolloutStatus varchar(20) NOT NULL,
        RolloutReason nvarchar(500) NULL,
        SchemaVersion int NOT NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldDatasetRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldDatasetRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldDatasetRegistry PRIMARY KEY (WebFormName, DatasetKey),
        CONSTRAINT FK_WA_FieldDatasetRegistry_Form FOREIGN KEY (WebFormName)
            REFERENCES dbo.WA_FieldContractRegistry(WebFormName),
        CONSTRAINT CK_WA_FieldDatasetRegistry_RolloutStatus CHECK
            (RolloutStatus IN ('ACTIVE','SHADOW','DEFERRED','DISABLED','BLOCKED')),
        CONSTRAINT CK_WA_FieldDatasetRegistry_SchemaVersion CHECK (SchemaVersion > 0),
        CONSTRAINT CK_WA_FieldDatasetRegistry_ReadOnlyMutation CHECK
            (IsReadOnly = 0 OR (SaveProcedure IS NULL AND DeleteProcedure IS NULL))
    );
END;
GO

IF OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldContractRouteBackup
    (
        BackupID bigint IDENTITY(1,1) NOT NULL,
        BackupBatchID uniqueidentifier NOT NULL,
        WebFormName varchar(100) NOT NULL,
        ApiList varchar(100) NOT NULL,
        Func varchar(20) NOT NULL,
        RouteExisted bit NOT NULL,
        [SQL] nvarchar(max) NULL,
        Para nvarchar(max) NULL,
        BackupTime datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRouteBackup_Time DEFAULT SYSUTCDATETIME(),
        BackupUser varchar(100) NOT NULL,
        RestoredAt datetime2(3) NULL,
        RestoredBy varchar(100) NULL,
        CONSTRAINT PK_WA_FieldContractRouteBackup PRIMARY KEY (BackupID),
        CONSTRAINT UQ_WA_FieldContractRouteBackup_BatchRoute UNIQUE (BackupBatchID, ApiList, Func)
    );
    CREATE INDEX IX_WA_FieldContractRouteBackup_FormTime
        ON dbo.WA_FieldContractRouteBackup(WebFormName, BackupTime DESC);
END;
GO

IF OBJECT_ID(N'dbo.WA_DatabaseReleaseHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_DatabaseReleaseHistory
    (
        ReleaseID varchar(100) NOT NULL,
        InstalledAt datetime2(3) NOT NULL,
        InstalledBy varchar(100) NOT NULL,
        ReleaseMode varchar(30) NOT NULL,
        MetadataRouteBatchID uniqueidentifier NULL,
        FieldRouteBatchID uniqueidentifier NULL,
        Status varchar(30) NOT NULL,
        ManifestSha256 char(64) NOT NULL,
        RolledBackAt datetime2(3) NULL,
        RolledBackBy varchar(100) NULL,
        CONSTRAINT PK_WA_DatabaseReleaseHistory PRIMARY KEY (ReleaseID)
    );
END;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/01_Tables/001_control_tables.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/02_ConstraintsAndIndexes/001_safe_constraints_and_indexes.sql | SHA-256: 11fa920a4bb06588ec31b2a8d16e28c8c8f4109e867e7a394b04ce6b20d47b54 ===== */

/* Không có ALTER thu hẹp kiểu/nullable, DROP column, rebuild table hoặc constraint phá dữ liệu. */
SET NOCOUNT ON;
PRINT N'Các constraint/index của control table được tạo cùng table; schema business khác biệt chỉ báo cáo để review.';
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/02_ConstraintsAndIndexes/001_safe_constraints_and_indexes.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/03_Views/001_canonical_views.sql | SHA-256: 58559440b9dbef56f9ba472b2b88ff32fff1d496ebd7b9cc13ca2a1570ec15f6 ===== */
/*
  Canonical views
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

PRINT N'Không có object canonical trong nhóm này.';
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/03_Views/001_canonical_views.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/04_Functions/001_canonical_functions.sql | SHA-256: 62922653939a652d58e124bfb585fbb60fde182fc5091ef4d0c3370b2b9d74fa ===== */
/*
  Canonical functions
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_FieldMetadataContractRegistry; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_FieldMetadataContractRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        R.ContractType,
        CONVERT(sysname, CurrentRoutes.ViewProcedure) AS OldView,
        CONVERT(sysname, CurrentRoutes.ViewProcedure) AS ViewV2,
        CONVERT(sysname, CurrentRoutes.SaveProcedure) AS OldSave,
        CONVERT(sysname, CurrentRoutes.SaveProcedure) AS SaveV2,
        CONVERT(sysname, CurrentRoutes.DeleteProcedure) AS OldDelete,
        CONVERT(sysname, CurrentRoutes.DeleteProcedure) AS DeleteV2,
        R.PermissionFormName,
        R.WritePolicy,
        CASE
            WHEN R.BranchPolicy <> 'AUTO_SCHEMA' THEN R.BranchPolicy
            WHEN EXISTS
            (
                SELECT 1
                FROM sys.columns AS C
                WHERE C.object_id = OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U')
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT
                      IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ) THEN CONVERT(varchar(40), 'BRANCH_SCOPED')
            ELSE CONVERT(varchar(40), 'GLOBAL_REFERENCE')
        END AS BranchPolicy,
        CONVERT(bit, CASE WHEN CurrentRoutes.ViewRouteCount = 1 THEN 1 ELSE 0 END) AS EnableView,
        CONVERT(bit, CASE
            WHEN R.ContractType <> 'READ_ONLY' AND CurrentRoutes.SaveRouteCount = 1 THEN 1
            ELSE 0
        END) AS EnableSave,
        CONVERT(bit, CASE
            WHEN R.ContractType <> 'READ_ONLY' AND CurrentRoutes.DeleteRouteCount = 1 THEN 1
            ELSE 0
        END) AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, CASE WHEN R.BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' THEN 1 ELSE 0 END)
            AS GlobalReferenceOnly
    FROM dbo.WA_FieldContractRegistry AS R
    OUTER APPLY
    (
        SELECT
            SUM(CASE WHEN A.[func] = 'View' THEN 1 ELSE 0 END) AS ViewRouteCount,
            SUM(CASE WHEN A.[func] = 'Save' THEN 1 ELSE 0 END) AS SaveRouteCount,
            SUM(CASE WHEN A.[func] = 'Delete' THEN 1 ELSE 0 END) AS DeleteRouteCount,
            MIN(CASE WHEN A.[func] = 'View'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS ViewProcedure,
            MIN(CASE WHEN A.[func] = 'Save'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS SaveProcedure,
            MIN(CASE WHEN A.[func] = 'Delete'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS DeleteProcedure
        FROM dbo.WA_API AS A
        WHERE A.[list] COLLATE DATABASE_DEFAULT =
              ISNULL(NULLIF(R.ViewList, ''), R.WebFormName) COLLATE DATABASE_DEFAULT
          AND A.[func] IN ('View', 'Save', 'Delete')
    ) AS CurrentRoutes
    WHERE R.IsEnabled = 1
      AND R.ExpectedTableName IS NOT NULL
      AND R.ExpectedPrimaryKey IS NOT NULL
      AND NULLIF(LTRIM(RTRIM(R.ERPFormID)), '') IS NOT NULL
      AND R.ERPFormID <> 'ERP_FORM_ALIAS_REQUIRES_REVIEW'
      AND (R.WebFormName LIKE '%Frm' OR R.WebFormName LIKE '%Report')
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_AuthorizedBranches; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER FUNCTION dbo.API_HR_Dashboard_AuthorizedBranches
(
    @UserName varchar(50),
    @RequestedBranchID nvarchar(max) = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT DISTINCT
        B.BranchID
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.SY_User AS U
        ON U.UserName = @UserName
       AND ISNULL(U.Disable, 0) = 0
    WHERE
        (
            LOWER(LTRIM(RTRIM(ISNULL(U.UserGroupID, '')))) = 'admin'
            OR EXISTS
            (
                SELECT 1
                FROM STRING_SPLIT(ISNULL(U.BranchID, ''), ',') AS Allowed
                WHERE UPPER(LTRIM(RTRIM(Allowed.[value]))) =
                      UPPER(LTRIM(RTRIM(B.BranchID)))
            )
        )
        AND
        (
            LTRIM(RTRIM(ISNULL(@RequestedBranchID, ''))) = ''
            OR EXISTS
            (
                SELECT 1
                FROM STRING_SPLIT(@RequestedBranchID, ',') AS Requested
                WHERE UPPER(LTRIM(RTRIM(Requested.[value]))) =
                      UPPER(LTRIM(RTRIM(B.BranchID)))
            )
        )
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Phase3SimpleCrudRegistry; Input: sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql */
CREATE OR ALTER FUNCTION dbo.API_Phase3SimpleCrudRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
                        AND A.[func] = 'View'), R.ViewProcedure)
            ELSE R.ViewProcedure END) AS OldView,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = ISNULL(NULLIF(R.ViewList, ''), R.WebFormName)
                        AND A.[func] = 'View'), R.ViewProcedure)
            ELSE R.ViewProcedure END) AS ViewV2,
        CONVERT(sysname, N'API_LuuDong') AS OldSave,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = R.WebFormName AND A.[func] = 'Save'), R.SaveProcedure)
            ELSE R.SaveProcedure END) AS SaveV2,
        CONVERT(sysname, N'API_XoaDong') AS OldDelete,
        CONVERT(sysname, CASE WHEN R.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = R.WebFormName AND A.[func] = 'Delete'), R.DeleteProcedure)
            ELSE R.DeleteProcedure END) AS DeleteV2,
        R.PermissionFormName,
        R.WritePolicy,
        CASE
            WHEN R.BranchPolicy <> 'AUTO_SCHEMA' THEN R.BranchPolicy
            WHEN EXISTS (
                SELECT 1
                FROM sys.columns AS C
                WHERE C.object_id = OBJECT_ID(N'dbo.' + R.ExpectedTableName, N'U')
                  AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ) THEN CONVERT(varchar(40), 'BRANCH_SCOPED')
            ELSE CONVERT(varchar(40), 'GLOBAL_REFERENCE')
        END AS BranchPolicy,
        CONVERT(bit, CASE WHEN R.ViewProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableView,
        CONVERT(bit, CASE WHEN R.SaveProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableSave,
        CONVERT(bit, CASE WHEN R.DeleteProcedure IS NOT NULL THEN 1 ELSE 0 END) AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, CASE WHEN R.BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' THEN 1 ELSE 0 END)
            AS GlobalReferenceOnly
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND R.ContractType IN
          ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE', 'READ_ONLY')
      AND R.ExpectedTableName IS NOT NULL
      AND R.ExpectedPrimaryKey IS NOT NULL

    UNION ALL

    SELECT
        D.ApiList AS WebFormName,
        R.ERPFormID,
        D.ExpectedTableName,
        D.ExpectedPrimaryKey,
        CONVERT(sysname, D.ViewProcedure) AS OldView,
        CONVERT(sysname, D.ViewProcedure) AS ViewV2,
        CONVERT(sysname, N'API_LuuDong') AS OldSave,
        CONVERT(sysname, D.SaveProcedure) AS SaveV2,
        CONVERT(sysname, N'API_XoaDong') AS OldDelete,
        CONVERT(sysname, D.DeleteProcedure) AS DeleteV2,
        R.PermissionFormName,
        D.WritePolicy,
        D.BranchPolicy,
        CONVERT(bit, 0) AS EnableView,
        CONVERT(bit, CASE WHEN D.IsReadOnly = 0 AND D.SaveProcedure IS NOT NULL THEN 1 ELSE 0 END)
            AS EnableSave,
        CONVERT(bit, CASE WHEN D.IsReadOnly = 0 AND D.DeleteProcedure IS NOT NULL THEN 1 ELSE 0 END)
            AS EnableDelete,
        R.DeletePolicy,
        CONVERT(bit, 0) AS GlobalReferenceOnly
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN dbo.WA_FieldContractRegistry AS R
      ON R.WebFormName = D.WebFormName
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.ExpectedTableName IS NOT NULL
      AND D.ExpectedPrimaryKey IS NOT NULL
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Phase4JoinRegistry; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_Phase4JoinRegistry()
RETURNS TABLE
AS
RETURN
(
    SELECT
        D.WebFormName,
        D.DatasetKey AS DetailKey,
        D.ApiList,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'View'), D.ViewProcedure)
            ELSE D.ViewProcedure END) AS ExpectedProcedure,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'Save'), D.SaveProcedure)
            ELSE D.SaveProcedure END) AS ExpectedSaveProcedure,
        CONVERT(sysname, CASE WHEN D.RolloutStatus = 'SHADOW' THEN
            COALESCE((SELECT MIN(PARSENAME(LTRIM(RTRIM(A.[SQL])), 1))
                      FROM dbo.WA_API AS A
                      WHERE A.[list] = D.ApiList AND A.[func] = 'Delete'), D.DeleteProcedure)
            ELSE D.DeleteProcedure END) AS ExpectedDeleteProcedure,
        D.ExpectedTableName,
        D.ExpectedPrimaryKey,
        R.PermissionFormName,
        D.IsReadOnly,
        CONVERT(bit, 1) AS EnableMetadata
    FROM dbo.WA_FieldDatasetRegistry AS D
    INNER JOIN dbo.WA_FieldContractRegistry AS R
      ON R.WebFormName = D.WebFormName
    WHERE R.IsEnabled = 1
      AND R.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.RolloutStatus IN ('ACTIVE', 'SHADOW')
      AND D.ExpectedTableName IS NOT NULL
      AND D.ExpectedPrimaryKey IS NOT NULL
      AND D.ViewProcedure IS NOT NULL
);
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GroupFormPermissionV2; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER FUNCTION dbo.API_Web_GroupFormPermissionV2
(
    @UserGroupID varchar(50),
    @PermissionFormName varchar(100)
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        M.MenuID,
        CONVERT(bit, ISNULL(M.isNotCheckPermission, 0)) AS SkipPermission,
        CONVERT(bit, ISNULL(P.IsRun, 0)) AS CanView,
        CONVERT(bit, ISNULL(P.IsAdd, 0)) AS CanAdd,
        CONVERT(bit, ISNULL(P.IsUpdate, 0)) AS CanEdit,
        CONVERT(bit, ISNULL(P.IsDelete, 0)) AS CanDelete
    FROM
    (
        SELECT TOP (1)
            Menu.MenuID,
            Menu.isNotCheckPermission
        FROM dbo.WA_Menu AS Menu
        WHERE Menu.FormName COLLATE DATABASE_DEFAULT =
              @PermissionFormName COLLATE DATABASE_DEFAULT
          AND ISNULL(Menu.isDisable, 0) = 0
        ORDER BY Menu.MenuID
    ) AS M
    LEFT JOIN dbo.WA_UserGroupPermisstion AS P
      ON P.UserGroupID COLLATE DATABASE_DEFAULT =
         @UserGroupID COLLATE DATABASE_DEFAULT
     AND P.MenuID COLLATE DATABASE_DEFAULT =
         M.MenuID COLLATE DATABASE_DEFAULT
);
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/04_Functions/001_canonical_functions.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/05_FrameworkProcedures/001_canonical_framework_procedures.sql | SHA-256: 6ecc7ceea8ef55f1735f76c336089640fa1d84c0759df78c7b65867cb144d5c4 ===== */
/*
  Canonical framework procedures
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LuuDong_V2; Input: sql/UnifiedContractRollout/08_UPDATE_SAVE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_LuuDong_V2
    @List varchar(50),
    @Data nvarchar(max),
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @RowsAffected int = 0, @PrimaryValue nvarchar(4000) = NULL;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedTable sysname,
        @PrimaryKey sysname,

        @ExpectedView sysname,
        @ExpectedSave sysname,

        @PermissionFormName varchar(100),
        @WritePolicy varchar(40),

        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable =
            R.ExpectedTableName,

        @PrimaryKey =
            R.ExpectedPrimaryKey,

        @ExpectedView =
            R.ViewV2,

        @ExpectedSave =
            R.SaveV2,

        @PermissionFormName =
            R.PermissionFormName,

        @WritePolicy =
            R.WritePolicy,

        @GlobalReferenceOnly =
            R.GlobalReferenceOnly,

        @BranchPolicy =
            R.BranchPolicy

    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableSave = 1;

    SET @PermissionFormName =
        LTRIM(
            RTRIM(
                ISNULL(
                    @PermissionFormName,
                    @List
                )
            )
        );

    SET @WritePolicy =
        UPPER(
            LTRIM(
                RTRIM(
                    ISNULL(
                        @WritePolicy,
                        'SAFE_TABLE_COLUMNS'
                    )
                )
            )
        );

    IF @ExpectedTable IS NULL OR @ExpectedSave COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_SAVE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @UserName = '' OR ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_AND_JSON_OBJECT_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DUPLICATE_JSON_KEY' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RouteCount int, @RegisteredSave sysname;
    SELECT
        @RouteCount = COUNT(*),
        @RegisteredSave = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR ISNULL(@RegisteredSave, N'') COLLATE DATABASE_DEFAULT <> @ExpectedSave COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_SAVE_ROUTE_NOT_UNIQUE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @RegisteredTable sysname, @RegisteredPrimaryKey sysname, @RegistrationCount int;
    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL OR NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_OR_PRIMARY_KEY_NOT_FOUND' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    DECLARE @BranchScopePredicate nvarchar(2000) = N'';
    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchScopePredicate = N'
          AND (
              LOWER(@UserGroupID) = ''admin''
              OR EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                  WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                    AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                        = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
              )
          )';

    DECLARE @PrimaryKeyHasCollation bit = 0;
    SELECT @PrimaryKeyHasCollation = CONVERT(bit, CASE WHEN C.collation_name IS NULL THEN 0 ELSE 1 END)
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID
          AND I.is_unique = 1
          AND I.is_disabled = 0
          AND I.has_filter = 0
          AND I.is_hypothetical = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

/*
  Quy tắc ghi dữ liệu:

  SAFE_TABLE_COLUMNS:
  Cho các form CRUD một bảng đã kiểm thử ở Phase 3.

  VIEW_PHYSICAL_COLUMNS:
  Chỉ nhận field:
  - có trong result-set của View API;
  - có source lineage thuộc main table;
  - giữ nguyên tên field vật lý.
*/
IF @WritePolicy NOT IN
(
    'SAFE_TABLE_COLUMNS',
    'VIEW_PHYSICAL_COLUMNS'
)
BEGIN
    SELECT
        -1 AS code,
        N'PHASE3_WRITE_POLICY_INVALID' AS msg,
        @PrimaryKey AS primaryKey,
        @PrimaryValue AS primaryValue,
        0 AS rowsAffected;

    RETURN;
END;

DECLARE @ViewPhysicalColumns table
(
    ColumnName sysname NOT NULL PRIMARY KEY
);

IF @WritePolicy = 'VIEW_PHYSICAL_COLUMNS'
BEGIN
    DECLARE @ViewObjectID int =
        COALESCE
        (
            OBJECT_ID(
                @ExpectedView,
                N'P'
            ),

            OBJECT_ID(
                N'dbo.' + @ExpectedView,
                N'P'
            )
        );

    IF @ViewObjectID IS NULL
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_NOT_FOUND' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1

        FROM sys.dm_exec_describe_first_result_set_for_object
        (
            @ViewObjectID,
            1
        ) AS D

        WHERE D.error_number IS NOT NULL
    )
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_METADATA_ERROR' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;

    INSERT INTO @ViewPhysicalColumns
    (
        ColumnName
    )
    SELECT DISTINCT
        D.source_column

    FROM sys.dm_exec_describe_first_result_set_for_object
    (
        @ViewObjectID,
        1
    ) AS D

    WHERE
        D.error_number IS NULL

        AND ISNULL(D.is_hidden, 0) = 0

        AND D.name IS NOT NULL
        AND D.source_column IS NOT NULL
        AND D.source_table IS NOT NULL

        AND D.source_table
            COLLATE DATABASE_DEFAULT
            =
            @ExpectedTable
            COLLATE DATABASE_DEFAULT

        /*
          Generic Save chỉ ghi an toàn khi tên result field
          giữ nguyên tên physical column.
        */
        AND D.name
            COLLATE DATABASE_DEFAULT
            =
            D.source_column
            COLLATE DATABASE_DEFAULT;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @ViewPhysicalColumns AS V
        WHERE
            V.ColumnName
                COLLATE DATABASE_DEFAULT
                =
                @PrimaryKey
                COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT
            -1 AS code,
            N'PHASE3_WRITE_VIEW_PRIMARY_KEY_MISSING' AS msg,
            @PrimaryKey AS primaryKey,
            @PrimaryValue AS primaryValue,
            0 AS rowsAffected;

        RETURN;
    END;
END;

    IF @GlobalReferenceOnly = 1 AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
          AND (
              T.name COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
              OR C.is_computed = 1
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @DataActor varchar(100), @DataBranch nvarchar(max);
    SELECT TOP (1) @DataActor = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'username' COLLATE DATABASE_DEFAULT;
    SELECT TOP (1) @DataBranch = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT;

    IF @DataActor IS NOT NULL AND @DataActor COLLATE DATABASE_DEFAULT <> @UserName COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_SPOOF_REJECTED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_INVALID_OR_DISABLED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_REQUIRED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_DENIED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    IF @DataBranch IS NOT NULL AND @BranchID <> '' AND EXISTS (
        SELECT 1 FROM STRING_SPLIT(@DataBranch, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
              WHERE LTRIM(RTRIM(ContextBranch.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_JSON_BRANCH_CONTEXT_DENIED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF @BranchPolicy = 'BRANCH_SCOPED'
       AND EXISTS (
           SELECT 1 FROM OPENJSON(@Data) AS J
           WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_MUST_BE_TOP_LEVEL' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @IsEdit bit = 0;
    SELECT TOP (1) @IsEdit = ISNULL(TRY_CONVERT(bit, J.[value]), 0)
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'isedit' COLLATE DATABASE_DEFAULT;

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0,
        @GroupCanAdd bit = 0,
        @GroupCanEdit bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView,
        @GroupCanAdd = P.CanAdd,
        @GroupCanEdit = P.CanEdit
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
           OR CASE WHEN @IsEdit = 1 THEN ISNULL(@GroupCanEdit, 0)
                   ELSE ISNULL(@GroupCanAdd, 0) END <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_MUTATION_PERMISSION_DENIED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;
    END;

    DECLARE @Columns TABLE (
        ColumnName sysname PRIMARY KEY,
        SqlTypeName sysname,
        MaxLength int,
        IsNullable bit,
        IsIdentity bit,
        IsPrimaryKey bit,
        IsComputed bit,
        IsServerManaged bit,
        IsDenied bit,
        JsonValue nvarchar(max),
        HasJsonKey bit
    );

    INSERT INTO @Columns (
        ColumnName, SqlTypeName, MaxLength, IsNullable, IsIdentity,
        IsPrimaryKey, IsComputed, IsServerManaged, IsDenied, JsonValue, HasJsonKey
    )
    SELECT
        C.name AS ColumnName,
        T.name AS SqlTypeName,
        C.max_length,
        C.is_nullable,
        C.is_identity,
        CONVERT(bit, CASE WHEN C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
        C.is_computed,
        CONVERT(bit, CASE
            WHEN C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT THEN 0
            WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN (
                'usercreate', 'userdate', 'useredit', 'usereditdate',
                'userdelete', 'userdeletedate', 'sysdate', 'datecreated', 'datemodified'
            ) THEN 1
            ELSE 0
        END) AS IsServerManaged,
        CONVERT(bit, CASE
            WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('password', 'pass', 'token', 'secret', 'hash', 'salt') THEN 1
            ELSE 0
        END) AS IsDenied,
        J.[value] AS JsonValue,
        CONVERT(bit, CASE WHEN J.[key] IS NOT NULL THEN 1 ELSE 0 END) AS HasJsonKey
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    LEFT JOIN OPENJSON(@Data) AS J
      ON LOWER(J.[key]) COLLATE DATABASE_DEFAULT = LOWER(C.name) COLLATE DATABASE_DEFAULT
    WHERE C.object_id = @ObjectID;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('isedit', 'id', 'username', 'branchid')
          AND NOT EXISTS (
              SELECT 1 FROM @Columns AS C
              WHERE LOWER(C.ColumnName) COLLATE DATABASE_DEFAULT = LOWER(J.[key]) COLLATE DATABASE_DEFAULT
                AND (C.IsIdentity = 0 OR (@IsEdit = 1 AND C.IsPrimaryKey = 1))
                AND C.IsComputed = 0
                AND C.IsServerManaged = 0 AND C.IsDenied = 0
                AND
                (
                    @WritePolicy =
                        'SAFE_TABLE_COLUMNS'

                    OR EXISTS
                    (
                        SELECT 1
                        FROM @ViewPhysicalColumns AS V

                        WHERE
                            V.ColumnName
                                COLLATE DATABASE_DEFAULT
                                =
                                C.ColumnName
                                COLLATE DATABASE_DEFAULT
                    )
                )
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_UNSAFE_PAYLOAD_FIELD_REJECTED' AS msg,
               @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
        RETURN;
    END;

    DECLARE @PkColumnName sysname, @PkJsonValue nvarchar(max), @PkHasKey bit;
    SELECT @PkColumnName = C.ColumnName, @PkJsonValue = C.JsonValue, @PkHasKey = C.HasJsonKey
    FROM @Columns AS C
    WHERE C.IsPrimaryKey = 1;

    IF @IsEdit = 1
    BEGIN
        IF @PkHasKey = 0 OR LTRIM(RTRIM(ISNULL(@PkJsonValue, ''))) = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_PRIMARY_KEY_REQUIRED' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        SET @PrimaryValue = LTRIM(RTRIM(@PkJsonValue));
        DECLARE @ExistsSql nvarchar(max);
        SET @ExistsSql = N'SELECT @RowExists = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T'
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal'
                       + @BranchScopePredicate + N';';
        DECLARE @RowExists int = 0;
        EXEC sp_executesql @ExistsSql, N'@PkVal nvarchar(4000), @RowExists int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
             @PkVal = @PrimaryValue, @RowExists = @RowExists OUTPUT,
             @BranchID = @BranchID, @UserGroupID = @UserGroupID;

        IF @RowExists <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_TARGET_NOT_FOUND' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @UpdateAssignments nvarchar(max) = N'';
        SELECT @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END
             + QUOTENAME(C.ColumnName) + N' = '
             + CASE
                 WHEN C.HasJsonKey = 0 OR C.JsonValue IS NULL THEN N'NULL'
                 ELSE N'N''' + REPLACE(C.JsonValue, N'''', N'''''') + N''''
               END
        FROM @Columns AS C
        WHERE C.IsPrimaryKey = 0
          AND C.IsIdentity = 0
          AND C.IsComputed = 0
          AND C.IsServerManaged = 0
          AND C.IsDenied = 0
          AND C.HasJsonKey = 1;

        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'useredit')
            SET @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END + N'[UserEdit] = N''' + REPLACE(@UserName, N'''', N'''''') + N'''';
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'usereditdate')
            SET @UpdateAssignments = @UpdateAssignments + CASE WHEN @UpdateAssignments = N'' THEN N'' ELSE N', ' END + N'[UserEditDate] = GETDATE()';

        IF @UpdateAssignments = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_UPDATE_NO_WRITABLE_FIELDS' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @UpdateSql nvarchar(max);
        SET @UpdateSql = N'UPDATE T SET ' + @UpdateAssignments
                       + N' FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T'
                       + N' WHERE ' + QUOTENAME(@PrimaryKey)
                       + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                       + N' = @PkVal'
                       + @BranchScopePredicate + N';';

        EXEC sp_executesql @UpdateSql, N'@PkVal nvarchar(4000), @BranchID varchar(max), @UserGroupID varchar(50)',
             @PkVal = @PrimaryValue, @BranchID = @BranchID, @UserGroupID = @UserGroupID;
        SET @RowsAffected = @@ROWCOUNT;
    END
    ELSE
    BEGIN
        IF @PkHasKey = 1 AND LTRIM(RTRIM(ISNULL(@PkJsonValue, ''))) <> ''
        BEGIN
            SET @PrimaryValue = LTRIM(RTRIM(@PkJsonValue));
            DECLARE @DuplicateCheckSql nvarchar(max);
            SET @DuplicateCheckSql = N'SELECT @DupCount = COUNT(*) FROM dbo.' + QUOTENAME(@ExpectedTable)
                                   + N' WHERE ' + QUOTENAME(@PrimaryKey)
                                   + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                                   + N' = @PkVal;';
            DECLARE @DupCount int = 0;
            EXEC sp_executesql @DuplicateCheckSql, N'@PkVal nvarchar(4000), @DupCount int OUTPUT',
                 @PkVal = @PrimaryValue, @DupCount = @DupCount OUTPUT;

            IF @DupCount > 0
            BEGIN
                SELECT -1 AS code, N'PHASE3_INSERT_PRIMARY_KEY_DUPLICATE' AS msg,
                       @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
                RETURN;
            END;
        END;

        DECLARE @InsertCols nvarchar(max) = N'', @InsertVals nvarchar(max) = N'';
        SELECT
            @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + QUOTENAME(C.ColumnName),
            @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END
                        + CASE
                            WHEN C.HasJsonKey = 0 OR C.JsonValue IS NULL THEN N'NULL'
                            ELSE N'N''' + REPLACE(C.JsonValue, N'''', N'''''') + N''''
                          END
        FROM @Columns AS C
        WHERE C.IsIdentity = 0
          AND C.IsComputed = 0
          AND C.IsServerManaged = 0
          AND C.IsDenied = 0
          AND C.HasJsonKey = 1;

        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'usercreate')
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + N'[UserCreate]';
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'N''' + REPLACE(@UserName, N'''', N'''''') + N'''';
        END;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectID AND LOWER(name) = 'userdate')
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + N'[UserDate]';
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'GETDATE()';
        END;

        IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        BEGIN
            SET @InsertCols = @InsertCols + CASE WHEN @InsertCols = N'' THEN N'' ELSE N', ' END + QUOTENAME(@BranchColumn);
            SET @InsertVals = @InsertVals + CASE WHEN @InsertVals = N'' THEN N'' ELSE N', ' END + N'CONVERT(nvarchar(4000), @BranchID)';
        END;

        IF @InsertCols = N''
        BEGIN
            SELECT -1 AS code, N'PHASE3_INSERT_NO_WRITABLE_FIELDS' AS msg,
                   @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, 0 AS rowsAffected;
            RETURN;
        END;

        DECLARE @InsertSql nvarchar(max);
        CREATE TABLE #InsertedPrimary (Value nvarchar(4000) NOT NULL);
        SET @InsertSql = N'INSERT INTO dbo.' + QUOTENAME(@ExpectedTable)
                       + N' (' + @InsertCols + N') OUTPUT CONVERT(nvarchar(4000), INSERTED.' + QUOTENAME(@PrimaryKey)
                       + N') INTO #InsertedPrimary(Value) VALUES (' + @InsertVals + N');';

        EXEC sp_executesql @InsertSql,
             N'@BranchID varchar(max)',
             @BranchID = @BranchID;
        SELECT @RowsAffected = COUNT(*) FROM #InsertedPrimary;

        IF @PrimaryValue IS NULL
        BEGIN
            SELECT TOP (1) @PrimaryValue = Value FROM #InsertedPrimary;
        END;
    END;

    SELECT 0 AS code, N'SUCCESS' AS msg,
           @PrimaryKey AS primaryKey, @PrimaryValue AS primaryValue, @RowsAffected AS rowsAffected;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_TruyVanDong_V2; Input: sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_TruyVanDong_V2
    @List varchar(50),
    @Keyword nvarchar(200) = N'',
    @SortColumn varchar(50) = '',
    @SortDir varchar(10) = '',
    @Data nvarchar(max) = N'',
    @UserName varchar(100) = '',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @SortColumn = LTRIM(RTRIM(ISNULL(@SortColumn, '')));
    SET @SortDir = UPPER(LTRIM(RTRIM(ISNULL(@SortDir, ''))));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    IF @UserName = '' AND ISJSON(@Data) = 1
        SET @UserName = ISNULL(JSON_VALUE(@Data, '$.UserName'), '');

    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));
    IF @BranchID = '' AND ISJSON(@Data) = 1
        SET @BranchID = ISNULL(JSON_VALUE(@Data, '$.BranchID'), '');

    DECLARE
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @ExpectedView sysname,
        @PermissionFormName varchar(100),
        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedView = R.ViewV2,
        @PermissionFormName = R.PermissionFormName,
        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy
    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND R.EnableView = 1;

    IF @ExpectedTable IS NULL OR @ExpectedView COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
        THROW 53101, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_VIEW', 1;

    IF @UserName = ''
        THROW 53102, N'PHASE3_ACTOR_REQUIRED', 1;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @List)));

    IF @Data = N'' SET @Data = N'{}';
    IF ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
        THROW 53103, N'PHASE3_FILTER_JSON_OBJECT_REQUIRED', 1;

    IF EXISTS (
        SELECT LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        FROM OPENJSON(@Data) AS J
        GROUP BY LOWER(J.[key]) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
        THROW 53104, N'PHASE3_DUPLICATE_FILTER_KEY', 1;

    DECLARE @RouteCount int;
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT
      AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT = @ExpectedView COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
        THROW 53105, N'PHASE3_VIEW_ROUTE_NOT_UNIQUE', 1;

    DECLARE
        @RegisteredTable sysname,
        @RegisteredPrimaryKey sysname,
        @FormRegistrationCount int;

    SELECT
        @FormRegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@FormRegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
        THROW 53106, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL
        THROW 53107, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;

    DECLARE @PrimaryColumn sysname;
    SELECT @PrimaryColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT;

    IF @PrimaryColumn IS NULL
        THROW 53108, N'PHASE3_EXPECTED_PRIMARY_KEY_NOT_FOUND', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id
         AND IC.index_id = I.index_id
         AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID
          AND I.is_unique = 1
          AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1
           AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryColumn, 'ColumnId')
    )
        THROW 53109, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE', 1;

    IF @GlobalReferenceOnly = 1 AND EXISTS (
        SELECT 1
        FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    )
        THROW 53110, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 53111, N'PHASE3_ACTOR_INVALID_OR_DISABLED', 1;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1
        WHEN 'tenantid' THEN 2
        WHEN 'companyid' THEN 3
        ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = ''
            THROW 53112, N'PHASE3_BRANCH_CONTEXT_REQUIRED', 1;

        /*
          Phạm vi thật luôn lấy từ SY_User. Client có thể không gửi BranchID hoặc
          chỉ xin một tập con; client không thể tự mở rộng sang chi nhánh khác.
        */
        IF @BranchID = ''
            SET @BranchID = @UserBranches;

        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
            THROW 53113, N'PHASE3_BRANCH_CONTEXT_DENIED', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0, @GroupCanRun bit = 0;
    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
        THROW 53114, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
            THROW 53115, N'PHASE3_VIEW_PERMISSION_DENIED', 1;
    END;

    DECLARE @Columns table
    (
        ColumnID int NOT NULL,
        ColumnName sysname NOT NULL PRIMARY KEY,
        TypeName sysname NOT NULL,
        SqlType nvarchar(256) NOT NULL,
        IsText bit NOT NULL,
        IsSoftDelete bit NOT NULL
    );

    INSERT INTO @Columns (ColumnID, ColumnName, TypeName, SqlType, IsText, IsSoftDelete)
    SELECT
        C.column_id,
        C.name,
        CONVERT(sysname, TYPE_NAME(C.system_type_id)),
        TYPE_NAME(C.system_type_id) + CASE
            WHEN TYPE_NAME(C.system_type_id) IN ('varchar', 'char', 'binary', 'varbinary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            WHEN TYPE_NAME(C.system_type_id) IN ('datetime2', 'datetimeoffset', 'time')
                THEN '(' + CONVERT(varchar(10), C.scale) + ')'
            ELSE '' END,
        CONVERT(bit, CASE WHEN TYPE_NAME(C.system_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') THEN 1 ELSE 0 END),
        CONVERT(bit, CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT AND TYPE_NAME(C.system_type_id) = 'bit' THEN 1 ELSE 0 END)
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND C.is_computed = 0
      AND T.is_user_defined = 0
      AND T.is_assembly_type = 0
      AND LOWER(TYPE_NAME(C.system_type_id)) COLLATE DATABASE_DEFAULT NOT IN
          ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
           'sql_variant', 'geography', 'geometry', 'hierarchyid')
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT NOT IN
          ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
           'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext',
           'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
           'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
           'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat');

    IF NOT EXISTS (
        SELECT 1 FROM @Columns AS C
        WHERE C.ColumnName COLLATE DATABASE_DEFAULT = @PrimaryColumn COLLATE DATABASE_DEFAULT
    )
        THROW 53116, N'PHASE3_PRIMARY_KEY_IS_DENIED', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns AS C
        INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT
          AND (
              T.is_user_defined = 1
              OR T.is_assembly_type = 1
              OR TYPE_NAME(C.system_type_id) COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
              OR C.is_computed = 1
          )
    )
        THROW 53117, N'PHASE3_ISDELETED_MUST_BE_WRITABLE_BIT', 1;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('keyword', 'branchid', 'page', 'pagesize')
          AND NOT EXISTS (
              SELECT 1 FROM @Columns AS C
              WHERE C.ColumnName COLLATE DATABASE_DEFAULT =
                    CASE
                        WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                        WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                        WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 8)
                        WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                        WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                        ELSE J.[key]
                    END COLLATE DATABASE_DEFAULT
                AND C.IsSoftDelete = 0
          )
    )
        THROW 53118, N'PHASE3_FILTER_FIELD_NOT_ALLOWED', 1;

    IF EXISTS (
        SELECT 1
        FROM OPENJSON(@Data) AS J
        INNER JOIN @Columns AS C
          ON C.ColumnName COLLATE DATABASE_DEFAULT =
             CASE
                 WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                 ELSE J.[key]
             END COLLATE DATABASE_DEFAULT
        WHERE (
            (RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT AND C.IsText = 0)
            OR (
                (RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT
                 OR RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT)
                AND C.TypeName COLLATE DATABASE_DEFAULT NOT IN
                    ('tinyint', 'smallint', 'int', 'bigint', 'decimal', 'numeric', 'money', 'smallmoney',
                     'float', 'real', 'date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset', 'time')
            )
        )
    )
        THROW 53120, N'PHASE3_FILTER_OPERATOR_NOT_SUPPORTED_FOR_TYPE', 1;

    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'ASC';
    IF @SortColumn = '' SET @SortColumn = @PrimaryColumn;

    DECLARE @UsePaging bit = CASE WHEN JSON_VALUE(@Data, '$.page') IS NOT NULL OR JSON_VALUE(@Data, '$.pageSize') IS NOT NULL THEN 1 ELSE 0 END;
    DECLARE @Page int = ISNULL(TRY_CONVERT(int, JSON_VALUE(@Data, '$.page')), 1);
    DECLARE @PageSize int = ISNULL(TRY_CONVERT(int, JSON_VALUE(@Data, '$.pageSize')), 30);
    IF @Page < 1 OR @Page > 1000000 OR @PageSize < 1 OR @PageSize > 100000
        THROW 53121, N'PHASE3_PAGING_ARGUMENT_INVALID', 1;
    DECLARE @Offset int = (@Page - 1) * @PageSize;

    DECLARE @ResolvedSortColumn sysname;
    SELECT @ResolvedSortColumn = C.ColumnName
    FROM @Columns AS C
    WHERE C.ColumnName COLLATE DATABASE_DEFAULT = @SortColumn COLLATE DATABASE_DEFAULT
      AND C.IsSoftDelete = 0;

    IF @ResolvedSortColumn IS NULL
        THROW 53119, N'PHASE3_SORT_FIELD_NOT_ALLOWED', 1;

    DECLARE
        @SelectList nvarchar(max),
        @KeywordPredicate nvarchar(max),
        @FilterPredicate nvarchar(max),
        @SoftDeletePredicate nvarchar(500) = N'',
        @BranchPredicate nvarchar(2000) = N'',
        @Sql nvarchar(max);

    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchPredicate = N'
          AND (
              LOWER(@UserGroupID) = ''admin''
              OR EXISTS (
                  SELECT 1
                  FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                  WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                    AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                        = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
              )
          )';

    SELECT @SelectList = STUFF((
        SELECT N', T.' + QUOTENAME(C.ColumnName)
        FROM @Columns AS C
        WHERE C.IsSoftDelete = 0
        ORDER BY C.ColumnID
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'');

    SELECT @KeywordPredicate = STUFF((
        SELECT N' OR CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName)
             + N') COLLATE DATABASE_DEFAULT LIKE (N''%'' + @Keyword + N''%'') COLLATE DATABASE_DEFAULT'
        FROM @Columns AS C
        WHERE C.IsSoftDelete = 0
          AND (C.IsText = 1 OR C.ColumnName COLLATE DATABASE_DEFAULT = @PrimaryColumn COLLATE DATABASE_DEFAULT)
        ORDER BY C.ColumnID
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 4, N'');

    SELECT @FilterPredicate = STUFF((
        SELECT CASE
            WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N') >= TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
            WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N') <= TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
            WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT
                THEN N' AND EXISTS (SELECT 1 FROM STRING_SPLIT(JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''), '','') AS IV WHERE LTRIM(RTRIM(IV.[value])) COLLATE DATABASE_DEFAULT = CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName) + N') COLLATE DATABASE_DEFAULT)'
            WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT OR C.IsText = 0
                THEN N' AND TRY_CONVERT(' + C.SqlType + N', T.' + QUOTENAME(C.ColumnName) + N')'
                   + CASE WHEN C.IsText = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                   + N' = TRY_CONVERT(' + C.SqlType + N', JSON_VALUE(@Data, ''$."' + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''') + N'"''))'
                   + CASE WHEN C.IsText = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
            ELSE N' AND CONVERT(nvarchar(4000), T.' + QUOTENAME(C.ColumnName)
               + N') COLLATE DATABASE_DEFAULT LIKE (N''%'' + JSON_VALUE(@Data, ''$."'
               + REPLACE(STRING_ESCAPE(J.[key], 'json'), '''', '''''')
               + N'"'') + N''%'') COLLATE DATABASE_DEFAULT'
        END
        FROM OPENJSON(@Data) AS J
        INNER JOIN @Columns AS C
          ON C.ColumnName COLLATE DATABASE_DEFAULT =
             CASE
                 WHEN RIGHT(J.[key], 6) COLLATE DATABASE_DEFAULT = '__from' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 6)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__to' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 WHEN RIGHT(J.[key], 8) COLLATE DATABASE_DEFAULT = '__equals' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 8)
                 WHEN RIGHT(J.[key], 10) COLLATE DATABASE_DEFAULT = '__contains' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 10)
                 WHEN RIGHT(J.[key], 4) COLLATE DATABASE_DEFAULT = '__in' COLLATE DATABASE_DEFAULT THEN LEFT(J.[key], LEN(J.[key]) - 4)
                 ELSE J.[key]
             END COLLATE DATABASE_DEFAULT
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('keyword', 'branchid', 'page', 'pagesize')
          AND C.IsSoftDelete = 0
        ORDER BY C.ColumnID, J.[key]
        FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 0, N'');

    IF EXISTS (SELECT 1 FROM @Columns WHERE IsSoftDelete = 1)
        SELECT @SoftDeletePredicate = N' AND ISNULL(T.' + QUOTENAME(ColumnName) + N', 0) = 0'
        FROM @Columns WHERE IsSoftDelete = 1;

    /* PHASE3_UNIFIED_FIELD_CONTRACT / PHASE3_SAFE_COLUMN_LIST */
    SET @Sql = N'
        SELECT ' + @SelectList + N'
        FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
        WHERE (@Keyword = N'''' OR (' + COALESCE(NULLIF(@KeywordPredicate, N''), N'1 = 0') + N'))'
        + ISNULL(@FilterPredicate, N'')
        + @BranchPredicate
        + @SoftDeletePredicate + N'
        ORDER BY T.' + QUOTENAME(@ResolvedSortColumn) + N' ' + @SortDir
        + CASE
              WHEN @ResolvedSortColumn COLLATE DATABASE_DEFAULT <> @PrimaryColumn COLLATE DATABASE_DEFAULT
                  THEN N', T.' + QUOTENAME(@PrimaryColumn) + N' ASC'
              ELSE N''
          END
        + CASE WHEN @UsePaging = 1 THEN N' OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY' ELSE N'' END
        + N';';

    EXEC sys.sp_executesql
        @Sql,
        N'@Keyword nvarchar(200), @Data nvarchar(max), @Offset int, @PageSize int, @BranchID varchar(max), @UserGroupID varchar(50)',
        @Keyword = @Keyword,
        @Data = @Data,
        @Offset = @Offset,
        @PageSize = @PageSize,
        @BranchID = @BranchID,
        @UserGroupID = @UserGroupID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_CutoverSafeFieldContractsV2; Input: sql/UnifiedContractRollout/10_CUTOVER_SAFE_FORMS.sql */
    CREATE OR ALTER PROCEDURE dbo.API_Web_CutoverSafeFieldContractsV2
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

        /*
        Contract được chọn phải khai báo đúng route policy V2. Registry là nguồn
        cấu hình, nhưng không được phép dùng registry để hợp thức hóa route legacy.
        */
        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            WHERE
                (
                    F.ContractType = 'SIMPLE_TABLE'
                    AND
                    (
                        ISNULL(F.ViewProcedure, N'') <> N'API_TruyVanDong_V2'
                        OR ISNULL(F.SaveProcedure, N'') <> N'API_LuuDong_V2'
                        OR ISNULL(F.DeleteProcedure, N'') <> N'API_XoaDong_V2'
                    )
                )
                OR
                (
                    F.ContractType IN ('JOIN_VIEW_SINGLE_TABLE', 'MASTER_DETAIL_SIMPLE')
                    AND
                    (
                        F.ViewProcedure IS NULL
                        OR ISNULL(F.SaveProcedure, N'') <> N'API_LuuDong_V2'
                        OR ISNULL(F.DeleteProcedure, N'') <> N'API_XoaDong_V2'
                    )
                )
                OR
                (
                    F.ContractType = 'READ_ONLY'
                    AND
                    (
                        F.ViewProcedure IS NULL
                        OR F.SaveProcedure IS NOT NULL
                        OR F.DeleteProcedure IS NOT NULL
                    )
                )
        )
            THROW 54412, N'FIELD_CONTRACT_ROUTE_POLICY_INVALID', 1;

        /* Gate table/PK và unique key cho master có mutation; READ_ONLY giữ View nghiệp vụ. */
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
            WHERE F.ContractType <> 'READ_ONLY'
            AND
            (
                L.RegistrationCount <> 1
                OR L.TableName <> F.ExpectedTableName
                OR L.PrimaryKey <> F.ExpectedPrimaryKey
            )
        )
            THROW 54403, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_MISMATCH', 1;

        IF EXISTS
        (
            SELECT 1
            FROM @Forms AS F
            WHERE F.ContractType <> 'READ_ONLY'
            AND
            (
                OBJECT_ID(N'dbo.' + F.ExpectedTableName, N'U') IS NULL
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
        )
            THROW 54404, N'FIELD_CONTRACT_TABLE_PRIMARY_KEY_NOT_SAFE', 1;

        /* Gate physical table/PK của dataset editable; dataset READ_ONLY không có mutation. */
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
            AND D.IsReadOnly = 0
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

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_DiscoverFieldContractCandidatesV2; Input: sql/UnifiedContractRollout/03_CREATE_DISCOVERY_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_DiscoverFieldContractCandidatesV2
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
       OR OBJECT_ID(N'dbo.WA_Menu', N'U') IS NULL
       OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
        THROW 54100, N'FIELD_CONTRACT_DISCOVERY_SOURCE_MISSING', 1;

    ;WITH SourceComplex AS
    (
        SELECT V.WebFormName, V.Reason
        FROM (VALUES
            ('WA_PersonFullFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_DanhSachUngVienFrm', 'FRONTEND_WIZARD_ATTACHMENT_MULTI_DATASET'),
            ('WA_HopDongLaoDongFrm', 'FRONTEND_DOCUMENT_ATTACHMENT_CUSTOM_DETAIL'),
            ('WA_BaoHiemFrm', 'FRONTEND_COMPLEX_DETAIL_CALCULATION'),
            ('WA_DonXinNghiPhepFrm', 'FRONTEND_WORKFLOW_ATTACHMENT'),
            ('WA_QuanLyNghiPhepNamFrm', 'FRONTEND_MULTI_DATASET'),
            ('WA_PayrollFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_TimeSheetDayFrm', 'FRONTEND_PROCESS_ACTION'),
            ('WA_BangPhuCapFrm', 'FRONTEND_DETAIL_MUTATION_NOT_AUDITED'),
            ('WA_NguoiDungFrm', 'FRONTEND_PERMISSION_MANAGEMENT'),
            ('WA_NguoiDungNhomFrm', 'FRONTEND_PERMISSION_MANAGEMENT')
        ) AS V(WebFormName, Reason)
    ),
    CandidateNames AS
    (
        SELECT CONVERT(varchar(100), LTRIM(RTRIM(M.FormName))) AS WebFormName
        FROM dbo.WA_Menu AS M
        WHERE NULLIF(LTRIM(RTRIM(M.FormName)), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(M.FormName)) LIKE '%Frm'
              OR LTRIM(RTRIM(M.FormName)) LIKE '%Report'
          )

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(L.FormID)))
        FROM dbo.SY_FrmLstTbl AS L
        WHERE NULLIF(LTRIM(RTRIM(L.FormID)), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(L.FormID)) LIKE '%Frm'
              OR LTRIM(RTRIM(L.FormID)) LIKE '%Report'
          )

        UNION

        SELECT CONVERT(varchar(100), LTRIM(RTRIM(A.[list])))
        FROM dbo.WA_API AS A
        WHERE NULLIF(LTRIM(RTRIM(A.[list])), '') IS NOT NULL
          AND (
              LTRIM(RTRIM(A.[list])) LIKE '%Frm'
              OR LTRIM(RTRIM(A.[list])) LIKE '%Report'
          )
    ),
    FormRegistration AS
    (
        SELECT
            L.FormID AS WebFormName,
            COUNT(*) AS FormRegistrationCount,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.TableName)), ''))) AS TableName,
            MIN(CONVERT(sysname, NULLIF(LTRIM(RTRIM(L.PrimaryKey)), ''))) AS PrimaryKey
        FROM dbo.SY_FrmLstTbl AS L
        GROUP BY L.FormID
    ),
    Routes AS
    (
        SELECT
            A.[list] AS WebFormName,
            SUM(CASE WHEN A.[func] = 'View' THEN 1 ELSE 0 END) AS ViewRouteCount,
            SUM(CASE WHEN A.[func] = 'Save' THEN 1 ELSE 0 END) AS SaveRouteCount,
            SUM(CASE WHEN A.[func] = 'Delete' THEN 1 ELSE 0 END) AS DeleteRouteCount,
            MIN(CASE WHEN A.[func] = 'View'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS ViewProcedure,
            MIN(CASE WHEN A.[func] = 'Save'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS SaveProcedure,
            MIN(CASE WHEN A.[func] = 'Delete'
                THEN CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)) END) AS DeleteProcedure
        FROM dbo.WA_API AS A
        GROUP BY A.[list]
    ),
    Facts AS
    (
        SELECT
            C.WebFormName,
            CONVERT(varchar(100), CASE
                WHEN C.WebFormName = 'WA_BangThueTNCNFrm' THEN 'HR_BangThueTNCNFrm'
                WHEN F.FormRegistrationCount = 1 THEN C.WebFormName
                ELSE NULL
            END) AS ERPFormID,
            ISNULL(R.ViewProcedure, N'') AS ViewProcedure,
            ISNULL(R.SaveProcedure, N'') AS SaveProcedure,
            ISNULL(R.DeleteProcedure, N'') AS DeleteProcedure,
            F.TableName,
            F.PrimaryKey,
            ISNULL(R.ViewRouteCount, 0) AS ViewRouteCount,
            ISNULL(R.SaveRouteCount, 0) AS SaveRouteCount,
            ISNULL(R.DeleteRouteCount, 0) AS DeleteRouteCount,
            ISNULL(F.FormRegistrationCount, 0) AS FormRegistrationCount,
            T.object_id AS TableObjectID,
            P.object_id AS ViewProcedureObjectID,
            SC.Reason AS SourceComplexReason
        FROM CandidateNames AS C
        LEFT JOIN FormRegistration AS F
          ON F.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN Routes AS R
          ON R.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.tables AS T
          ON T.schema_id = SCHEMA_ID(N'dbo')
         AND T.name COLLATE DATABASE_DEFAULT = F.TableName COLLATE DATABASE_DEFAULT
        LEFT JOIN sys.procedures AS P
          ON P.schema_id = SCHEMA_ID(N'dbo')
         AND P.name COLLATE DATABASE_DEFAULT = R.ViewProcedure COLLATE DATABASE_DEFAULT
        LEFT JOIN SourceComplex AS SC
          ON SC.WebFormName COLLATE DATABASE_DEFAULT = C.WebFormName COLLATE DATABASE_DEFAULT
    ),
    Described AS
    (
        SELECT
            F.*,
            CONVERT(bit, CASE WHEN F.TableObjectID IS NOT NULL THEN 1 ELSE 0 END) AS TableExists,
            CONVERT(bit, CASE WHEN PKC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyExists,
            CONVERT(bit, CASE WHEN UI.index_id IS NOT NULL THEN 1 ELSE 0 END) AS PrimaryKeyUnique,
            CONVERT(bit, CASE
                WHEN F.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2') THEN 1
                WHEN F.ViewProcedureObjectID IS NOT NULL AND ISNULL(D.ResultErrorCount, 0) = 0
                     AND ISNULL(D.ResultColumnCount, 0) > 0 THEN 1
                ELSE 0
            END) AS ResultSetDescribable,
            ISNULL(D.ResultColumnCount, 0) AS ResultColumnCount,
            ISNULL(D.PhysicalFieldCount, 0) AS PhysicalFieldCount,
            ISNULL(D.JoinFieldCount, 0) AS JoinFieldCount,
            CONVERT(bit, CASE WHEN BC.column_id IS NOT NULL THEN 1 ELSE 0 END) AS HasBranchScope
        FROM Facts AS F
        LEFT JOIN sys.columns AS PKC
          ON PKC.object_id = F.TableObjectID
         AND PKC.name COLLATE DATABASE_DEFAULT = F.PrimaryKey COLLATE DATABASE_DEFAULT
        OUTER APPLY
        (
            SELECT TOP (1) I.index_id
            FROM sys.indexes AS I
            INNER JOIN sys.index_columns AS IC
              ON IC.object_id = I.object_id
             AND IC.index_id = I.index_id
             AND IC.key_ordinal > 0
            WHERE I.object_id = F.TableObjectID
              AND I.is_unique = 1
              AND I.is_disabled = 0
            GROUP BY I.index_id
            HAVING COUNT(*) = 1 AND MAX(IC.column_id) = PKC.column_id
        ) AS UI
        OUTER APPLY
        (
            SELECT TOP (1) C.column_id
            FROM sys.columns AS C
            WHERE C.object_id = F.TableObjectID
              AND LOWER(C.name) COLLATE DATABASE_DEFAULT
                  IN ('branchid', 'tenantid', 'companyid', 'donviid')
            ORDER BY C.column_id
        ) AS BC
        OUTER APPLY
        (
            SELECT
                COUNT(*) AS ResultColumnCount,
                SUM(X.IsPhysical) AS PhysicalFieldCount,
                SUM(CASE WHEN X.IsPhysical = 0 THEN 1 ELSE 0 END) AS JoinFieldCount,
                SUM(X.HasError) AS ResultErrorCount
            FROM
            (
                SELECT
                    CASE
                        WHEN C.column_id IS NOT NULL
                         AND RS.source_table COLLATE DATABASE_DEFAULT
                             = OBJECT_NAME(F.TableObjectID) COLLATE DATABASE_DEFAULT
                         AND ISNULL(RS.source_schema, N'dbo') COLLATE DATABASE_DEFAULT
                             = N'dbo' COLLATE DATABASE_DEFAULT
                        THEN 1
                        ELSE 0
                    END AS IsPhysical,
                    CASE WHEN RS.error_type IS NULL THEN 0 ELSE 1 END AS HasError
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (F.ViewProcedureObjectID, 1) AS RS
                LEFT JOIN sys.columns AS C
                  ON C.object_id = F.TableObjectID
                 AND C.name COLLATE DATABASE_DEFAULT
                     = ISNULL(RS.source_column, RS.name) COLLATE DATABASE_DEFAULT
                WHERE ISNULL(RS.is_hidden, 0) = 0
            ) AS X
        ) AS D
    ),
    Classified AS
    (
        SELECT
            D.*,
            CONVERT(varchar(40), CASE
                WHEN D.SourceComplexReason IS NOT NULL THEN 'COMPLEX_DEFERRED'
                WHEN D.FormRegistrationCount <> 1
                  OR D.TableExists = 0
                  OR D.PrimaryKey IS NULL
                  OR D.PrimaryKeyExists = 0
                  OR D.PrimaryKeyUnique = 0
                  OR D.ViewRouteCount <> 1
                  OR D.ViewProcedureObjectID IS NULL
                  OR D.ERPFormID IS NULL THEN 'BLOCKED'
                WHEN D.SaveRouteCount > 1 OR D.DeleteRouteCount > 1 THEN 'BLOCKED'
                WHEN D.WebFormName LIKE '%Report'
                 AND D.ResultSetDescribable = 1
                 AND D.SaveRouteCount = 0
                 AND D.DeleteRouteCount = 0 THEN 'READ_ONLY'
                WHEN D.WebFormName LIKE '%Report' THEN 'BLOCKED'
                WHEN (D.SaveRouteCount = 1
                      AND D.SaveProcedure NOT IN (N'API_LuuDong', N'API_LuuDong_V2'))
                  OR (D.DeleteRouteCount = 1
                      AND D.DeleteProcedure NOT IN (N'API_XoaDong', N'API_XoaDong_V2'))
                    THEN 'COMPLEX_DEFERRED'
                WHEN D.SaveRouteCount <> 1 OR D.DeleteRouteCount <> 1
                    THEN 'BLOCKED'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ViewProcedure IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'SIMPLE_TABLE'
                WHEN D.SaveRouteCount = 1 AND D.DeleteRouteCount = 1
                     AND D.ResultSetDescribable = 1
                     AND D.PhysicalFieldCount > 0
                     AND D.ViewProcedure NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
                    THEN 'JOIN_VIEW_SINGLE_TABLE'
                ELSE 'BLOCKED'
            END) AS SuggestedContractType
        FROM Described AS D
    )
    SELECT
        C.WebFormName,
        C.ERPFormID,
        C.ViewProcedure AS CurrentViewProcedure,
        C.SaveProcedure AS CurrentSaveProcedure,
        C.DeleteProcedure AS CurrentDeleteProcedure,
        C.TableName,
        C.PrimaryKey,
        C.ViewRouteCount,
        C.SaveRouteCount,
        C.DeleteRouteCount,
        C.FormRegistrationCount,
        C.TableExists,
        C.PrimaryKeyExists,
        C.PrimaryKeyUnique,
        C.ResultSetDescribable,
        C.PhysicalFieldCount,
        C.JoinFieldCount,
        C.HasBranchScope,
        CONVERT(varchar(40), CASE
            WHEN C.SaveRouteCount = 0 AND C.DeleteRouteCount = 0 THEN 'MISSING'
            WHEN C.SaveProcedure IN (N'API_LuuDong', N'API_LuuDong_V2')
             AND C.DeleteProcedure IN (N'API_XoaDong', N'API_XoaDong_V2') THEN 'GENERIC'
            ELSE 'CUSTOM'
        END) AS CurrentMutationType,
        C.SuggestedContractType,
        CONVERT(varchar(20), CASE
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY') THEN 'SHADOW'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'DEFERRED'
            ELSE 'BLOCKED'
        END) AS SuggestedRolloutStatus,
        CONVERT(nvarchar(500), CASE
            WHEN C.SourceComplexReason IS NOT NULL THEN C.SourceComplexReason
            WHEN C.ERPFormID IS NULL THEN 'ERP_FORM_ALIAS_REQUIRES_REVIEW'
            WHEN C.FormRegistrationCount <> 1 THEN 'SY_FRMLSTTBL_NOT_UNIQUE'
            WHEN C.TableExists = 0 THEN 'TABLE_NOT_FOUND'
            WHEN C.PrimaryKey IS NULL OR C.PrimaryKeyExists = 0 THEN 'PRIMARY_KEY_NOT_FOUND'
            WHEN C.PrimaryKeyUnique = 0 THEN 'PRIMARY_KEY_NOT_UNIQUE'
            WHEN C.ViewRouteCount <> 1 THEN 'VIEW_ROUTE_NOT_UNIQUE'
            WHEN C.ViewProcedureObjectID IS NULL THEN 'VIEW_PROCEDURE_NOT_FOUND'
            WHEN C.ResultSetDescribable = 0 THEN 'VIEW_RESULTSET_NOT_DESCRIBABLE'
            WHEN C.SaveRouteCount > 1 OR C.DeleteRouteCount > 1 THEN 'MUTATION_ROUTE_NOT_UNIQUE'
            WHEN C.SuggestedContractType = 'READ_ONLY' THEN 'REPORT_READ_ONLY_METADATA_READY'
            WHEN C.SaveRouteCount <> 1 OR C.DeleteRouteCount <> 1
                THEN 'CRUD_MUTATION_ROUTE_MISSING'
            WHEN C.SuggestedContractType = 'COMPLEX_DEFERRED' THEN 'CUSTOM_MUTATION_REQUIRES_AUDIT'
            WHEN C.SuggestedContractType = 'BLOCKED' THEN 'FIELD_LINEAGE_OR_CONTRACT_UNKNOWN'
            WHEN C.SuggestedContractType IN
                ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE', 'READ_ONLY')
                THEN 'DISCOVERY_READY_FOR_CUTOVER'
            ELSE NULL
        END) AS BlockingReason
    FROM Classified AS C
    ORDER BY C.WebFormName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_FieldContractResolveV2; Input: sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_FieldContractResolveV2
    @FormName varchar(100),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @FormName = LTRIM(RTRIM(ISNULL(@FormName, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @FormName = '' OR @UserName = ''
        THROW 54001, N'FIELD_CONTRACT_CONTEXT_REQUIRED', 1;

    SELECT
        R.WebFormName,
        R.ERPFormID,
        R.PermissionFormName,
        R.ContractType,
        R.ExpectedTableName,
        R.ExpectedPrimaryKey,
        R.ViewList,
        R.ViewProcedure,
        R.SaveProcedure,
        R.DeleteProcedure,
        R.WritePolicy,
        R.BranchPolicy,
        R.DeletePolicy,
        R.RolloutStatus,
        R.RolloutReason,
        R.SchemaVersion,
        R.IsEnabled,
        D.DatasetKey,
        D.ApiList,
        D.ViewProcedure AS DatasetViewProcedure,
        D.ExpectedTableName AS DatasetExpectedTableName,
        D.ExpectedPrimaryKey AS DatasetExpectedPrimaryKey,
        D.ParentField,
        D.ChildField,
        D.IsReadOnly,
        D.SaveProcedure AS DatasetSaveProcedure,
        D.DeleteProcedure AS DatasetDeleteProcedure,
        D.WritePolicy AS DatasetWritePolicy,
        D.BranchPolicy AS DatasetBranchPolicy,
        D.RolloutStatus AS DatasetRolloutStatus,
        D.RolloutReason AS DatasetRolloutReason,
        D.SchemaVersion AS DatasetSchemaVersion
    FROM dbo.WA_FieldContractRegistry AS R
    LEFT JOIN dbo.WA_FieldDatasetRegistry AS D
      ON D.WebFormName = R.WebFormName
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @FormName COLLATE DATABASE_DEFAULT
    ORDER BY D.DatasetKey;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GridFieldCompareV2; Input: sql/FieldSyncPhase1/03_API_WEB_GRID_FIELD_COMPARE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_GridFieldCompareV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @LegacyPrimaryKey varchar(100);
    SELECT @LegacyPrimaryKey = L.PrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @WebFormName;

    DECLARE @V2 table (
        SchemaVersion varchar(10), CapabilityVersion varchar(10),
        WebFormName varchar(100), ERPFormName varchar(100),
        TableName varchar(100), PrimaryKey varchar(100),
        RegisteredViewProcedure varchar(50), RegisteredSaveProcedure varchar(50),
        RegisteredDeleteProcedure varchar(50), DeleteMode varchar(40),
        SourceKind varchar(30), FieldOrdinal int, FieldName varchar(128),
        SqlType nvarchar(256), IsNullable bit,
        IsPhysicalColumn bit, IsPrimaryKey bit, IsIdentity bit, IsComputed bit, HasDefault bit,
        DbMaxLength smallint, DbPrecision tinyint, DbScale tinyint, DbIsNullable bit,
        IsServerManaged bit, IsSensitiveOrDenied bit, IsRequiredOnInsert bit,
        ShowInGrid bit, ShowInAdd bit, ShowInEdit bit, ShowInFilter bit,
        SupportsInsert bit, SupportsUpdate bit, SupportsFilter bit, SupportsSort bit, SupportsKeyword bit,
        Caption nvarchar(200), FormatID varchar(2), FormatType char(1), RenderType varchar(20),
        NumberDecimal int, FormatString nvarchar(100), MaskString varchar(50),
        MaxLength smallint, MinValue float, MaxValue float, Align varchar(2), MinWidth int, MaxWidth int,
        LookupKey varchar(64), LookupType varchar(10), LookupValueColumn varchar(50),
        LookupDisplayColumn varchar(50), LookupColumns varchar(max), LookupWidths varchar(max),
        LookupDependsOn varchar(max), LookupMultiSelect bit, LookupReloadMode varchar(10),
        LookupDisabled bit, DiagnosticCode varchar(50)
    );

    INSERT INTO @V2
    EXEC dbo.API_Web_GridFieldSchemaV2
        @WebFormName = @WebFormName,
        @ERPFormID = @ERPFormID,
        @UserName = @UserName,
        @BranchID = @BranchID;

    DECLARE @V2PrimaryKey varchar(100);
    SELECT @V2PrimaryKey = MAX(PrimaryKey) FROM @V2;

    ;WITH Legacy AS (
        SELECT
            F.FieldName,
            MAX(F.CaptionVN) AS Caption,
            MAX(F.FormatID) AS FormatID,
            MAX(CASE WHEN NULLIF(LTRIM(RTRIM(ISNULL(F.DataSource, ''))), '') IS NULL THEN 0 ELSE 1 END) AS HasLookup
        FROM dbo.SY_FormatFields AS F
        WHERE LOWER(ISNULL(F.FormName, '')) = LOWER(@WebFormName)
          AND ISNULL(F.ShowInForm, 1) = 1
          AND LOWER(ISNULL(F.FormPosition, 'grid')) LIKE '%grid%'
        GROUP BY F.FieldName
    ), V2 AS (
        SELECT FieldName, Caption, FormatID, RenderType, LookupKey
        FROM @V2
    )
    SELECT
        COALESCE(V2.FieldName, L.FieldName) AS FieldName,
        L.Caption AS LegacyCaption,
        V2.Caption AS V2Caption,
        L.FormatID AS LegacyFormatID,
        V2.FormatID AS V2FormatID,
        CASE
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
            WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            ELSE 'text'
        END AS LegacyRenderType,
        V2.RenderType AS V2RenderType,
        CONVERT(bit, ISNULL(L.HasLookup, 0)) AS LegacyHasLookup,
        CONVERT(bit, CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END) AS V2HasLookup,
        @LegacyPrimaryKey AS LegacyPrimaryKey,
        @V2PrimaryKey AS V2PrimaryKey,
        CASE WHEN LOWER(ISNULL(@LegacyPrimaryKey, '')) = LOWER(ISNULL(@V2PrimaryKey, '')) THEN 'MATCH' ELSE 'CRITICAL' END AS PrimaryKeyStatus,
        CASE
            WHEN L.FieldName IS NULL THEN 'ONLY_V2'
            WHEN V2.FieldName IS NULL THEN 'ONLY_LEGACY'
            WHEN ISNULL(L.Caption, '') <> ISNULL(V2.Caption, '') THEN 'CAPTION_DIFF'
            WHEN ISNULL(L.HasLookup, 0) <> CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END THEN 'LOOKUP_DIFF'
            WHEN
                CASE
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
                    WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
                    ELSE 'text'
                END <> ISNULL(V2.RenderType, 'text') THEN 'FORMAT_DIFF'
            ELSE 'MATCH'
        END AS ParityStatus
    FROM Legacy AS L
    FULL OUTER JOIN V2
      ON LOWER(V2.FieldName) = LOWER(L.FieldName)
    ORDER BY COALESCE(V2.FieldName, L.FieldName);
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_GridFieldSchemaV2; Input: sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_GridFieldSchemaV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedERPFormID varchar(100),
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @ContractType varchar(40),
        @PermissionFormName varchar(100),
        @ExpectedView sysname,
        @ExpectedSave sysname,
        @ExpectedDelete sysname,
        @EnableView bit,
        @EnableSave bit,
        @EnableDelete bit,
        @DeletePolicy varchar(40),
        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedERPFormID = R.ERPFormID,
        @ExpectedTable = R.ExpectedTableName,
        @ExpectedPrimaryKey = R.ExpectedPrimaryKey,
        @ContractType = R.ContractType,
        @PermissionFormName = R.PermissionFormName,
        @ExpectedView = R.ViewV2,
        @ExpectedSave = R.SaveV2,
        @ExpectedDelete = R.DeleteV2,
        @EnableView = R.EnableView,
        @EnableSave = R.EnableSave,
        @EnableDelete = R.EnableDelete,
        @DeletePolicy = R.DeletePolicy,
        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy
    FROM dbo.API_FieldMetadataContractRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

    IF @ExpectedTable IS NULL
        THROW 53201, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_CONTRACT', 1;
    IF @UserName = ''
        THROW 53202, N'PHASE3_ACTOR_REQUIRED', 1;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @WebFormName)));

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @ExpectedERPFormID)));
    IF @ERPFormID COLLATE DATABASE_DEFAULT <> @ExpectedERPFormID COLLATE DATABASE_DEFAULT
        THROW 53203, N'PHASE3_ERP_FORM_ALIAS_MISMATCH', 1;

/*
  Filter membership dùng trực tiếp SY_FrmFltTbl của ERP.
  Không copy row HR_* sang WA_* và không fallback SY_FormatFields cho Unified V2.
*/
DECLARE @FilterSourceFormID varchar(250) = NULL;

IF OBJECT_ID(N'dbo.SY_FrmFltTbl', N'U') IS NOT NULL
BEGIN
    IF EXISTS
    (
        SELECT 1
        FROM dbo.SY_FrmFltTbl AS X
        WHERE X.FormID COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT
          AND ISNULL(X.IsDisable, 0) = 0
    )
        SET @FilterSourceFormID = @ERPFormID;
    ELSE IF EXISTS
    (
        SELECT 1
        FROM dbo.SY_FrmFltTbl AS X
        WHERE X.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
          AND ISNULL(X.IsDisable, 0) = 0
    )
        SET @FilterSourceFormID = @WebFormName;
END;
    DECLARE
        @RegisteredTable sysname,
        @RegisteredPrimaryKey sysname,
        @RegistrationCount int;

    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
        THROW 53204, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH', 1;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL
        THROW 53205, N'PHASE3_EXPECTED_TABLE_NOT_FOUND', 1;

    /*
      Delete capability is derived from the registered physical table, never from
      a form-specific switch: IsDeleted bit => SOFT, no IsDeleted => HARD, any
      other IsDeleted type => fail closed.
    */
    DECLARE @ResolvedDeleteMode varchar(40) =
        CASE
            WHEN @EnableDelete <> 1
              OR @DeletePolicy COLLATE DATABASE_DEFAULT <> 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
                THEN 'NONE'
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
            ) THEN 'INVALID_ISDELETED_TYPE'
            ELSE 'HARD'
        END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
        THROW 53206, N'PHASE3_EXPECTED_PRIMARY_KEY_NOT_FOUND', 1;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF @GlobalReferenceOnly = 1 AND @BranchColumn IS NOT NULL
       AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
       )
        THROW 53207, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW', 1;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
        THROW 53208, N'PHASE3_ACTOR_INVALID_OR_DISABLED', 1;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
            THROW 53209, N'PHASE3_BRANCH_CONTEXT_REQUIRED', 1;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
            THROW 53210, N'PHASE3_BRANCH_CONTEXT_DENIED', 1;
    END;

    DECLARE @MenuID varchar(50), @SkipPermission bit = 0, @GroupCanRun bit = 0;
    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
        THROW 53211, N'PHASE3_ACTIVE_MENU_REQUIRED', 1;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
            THROW 53212, N'PHASE3_METADATA_PERMISSION_DENIED', 1;
    END;

    DECLARE
        @ViewCount int,
        @SaveCount int,
        @DeleteCount int,
        @RegisteredView sysname,
        @RegisteredSave sysname,
        @RegisteredDelete sysname;

    SELECT @ViewCount = COUNT(*), @RegisteredView = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;
    SELECT @SaveCount = COUNT(*), @RegisteredSave = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;
    SELECT @DeleteCount = COUNT(*), @RegisteredDelete = MIN(CONVERT(sysname, LTRIM(RTRIM(A.[SQL]))))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;

    IF @ViewCount <> 1 OR @SaveCount > 1 OR @DeleteCount > 1
        THROW 53213, N'FIELD_METADATA_WA_API_ROUTE_NOT_UNIQUE', 1;

    /*
      View custom và Report lấy membership từ result-set. Field JOIN/computed chỉ
      đọc; field vật lý của bảng chính vẫn kế thừa capability từ route hiện tại.
    */
    DECLARE @ResultSetFallback bit = 0;

    IF @RegisteredView NOT IN (N'API_TruyVanDong', N'API_TruyVanDong_V2')
    BEGIN
        SET @ResultSetFallback = 1;

        DECLARE @ResultProcedureObjectID int =
            COALESCE(
                OBJECT_ID(@RegisteredView, N'P'),
                OBJECT_ID(N'dbo.' + @RegisteredView, N'P')
            );

        IF @ResultProcedureObjectID IS NULL
            THROW 53214, N'FIELD_METADATA_VIEW_PROCEDURE_NOT_FOUND', 1;

        DECLARE @ResultFields table
        (
            FieldOrdinal int NOT NULL,
            FieldName sysname NOT NULL,
            SqlType nvarchar(256) NULL,
            IsNullable bit NULL,
            MaxLength int NULL,
            SourceSchema sysname NULL,
            SourceTable sysname NULL,
            SourceColumn sysname NULL
        );

        BEGIN TRY
            IF NOT EXISTS
            (
                SELECT 1
                FROM sys.dm_exec_describe_first_result_set_for_object
                    (@ResultProcedureObjectID, 1) AS X
                WHERE X.error_number IS NOT NULL
            )
            BEGIN
                ;WITH DescribedResult AS
                (
                    SELECT
                        X.column_ordinal,
                        X.name,
                        X.system_type_name,
                        X.is_nullable,
                        X.max_length,
                        X.source_schema,
                        X.source_table,
                        X.source_column,
                        ROW_NUMBER() OVER
                        (
                            PARTITION BY LOWER(X.name) COLLATE DATABASE_DEFAULT
                            ORDER BY X.column_ordinal
                        ) AS DuplicateOrdinal
                    FROM sys.dm_exec_describe_first_result_set_for_object
                        (@ResultProcedureObjectID, 1) AS X
                    WHERE ISNULL(X.is_hidden, 0) = 0
                      AND X.error_number IS NULL
                      AND NULLIF(LTRIM(RTRIM(X.name)), '') IS NOT NULL
                )
                INSERT INTO @ResultFields
                (
                    FieldOrdinal, FieldName, SqlType, IsNullable, MaxLength,
                    SourceSchema, SourceTable, SourceColumn
                )
                SELECT
                    X.column_ordinal,
                    X.name,
                    X.system_type_name,
                    X.is_nullable,
                    X.max_length,
                    X.source_schema,
                    X.source_table,
                    X.source_column
                FROM DescribedResult AS X
                WHERE X.DuplicateOrdinal = 1;
            END;
        END TRY
        BEGIN CATCH
            DELETE FROM @ResultFields;
        END CATCH;

        /*
          Một số report desktop gọi procedure xử lý trước SELECT nên SQL Server
          không mô tả được result-set. Với SELECT T.*, P.* ta vẫn có thể lấy schema
          động từ các bảng được đánh dấu is_select_all trong dependency metadata.
          Bảng contract chính được ưu tiên khi hai bảng có cột trùng tên.
        */
        IF NOT EXISTS (SELECT 1 FROM @ResultFields)
        BEGIN
            BEGIN TRY
                DECLARE @ResultProcedureName nvarchar(517) =
                    QUOTENAME(OBJECT_SCHEMA_NAME(@ResultProcedureObjectID)) + N'.' +
                    QUOTENAME(OBJECT_NAME(@ResultProcedureObjectID));

                ;WITH SelectedTables AS
                (
                    SELECT DISTINCT
                        O.object_id,
                        S.name AS SchemaName,
                        O.name AS TableName,
                        CASE
                            WHEN O.name COLLATE DATABASE_DEFAULT = @ExpectedTable COLLATE DATABASE_DEFAULT THEN 0
                            ELSE 1
                        END AS TablePriority
                    FROM sys.dm_sql_referenced_entities(@ResultProcedureName, N'OBJECT') AS R
                    INNER JOIN sys.schemas AS S
                      ON S.name COLLATE DATABASE_DEFAULT = R.referenced_schema_name COLLATE DATABASE_DEFAULT
                    INNER JOIN sys.objects AS O
                      ON O.schema_id = S.schema_id
                     AND O.name COLLATE DATABASE_DEFAULT = R.referenced_entity_name COLLATE DATABASE_DEFAULT
                     AND O.[type] IN ('U', 'V')
                    WHERE R.referenced_database_name IS NULL
                      AND ISNULL(R.is_select_all, 0) = 1
                ),
                RankedColumns AS
                (
                    SELECT
                        T.SchemaName,
                        T.TableName,
                        T.TablePriority,
                        C.column_id,
                        C.name AS FieldName,
                        CONVERT(nvarchar(256), TYPE_NAME(C.user_type_id)) AS SqlType,
                        C.is_nullable AS IsNullable,
                        C.max_length AS MaxLength,
                        ROW_NUMBER() OVER
                        (
                            PARTITION BY LOWER(C.name) COLLATE DATABASE_DEFAULT
                            ORDER BY T.TablePriority, T.TableName, C.column_id
                        ) AS DuplicateOrdinal
                    FROM SelectedTables AS T
                    INNER JOIN sys.columns AS C
                      ON C.object_id = T.object_id
                ),
                UniqueColumns AS
                (
                    SELECT *
                    FROM RankedColumns
                    WHERE DuplicateOrdinal = 1
                )
                INSERT INTO @ResultFields
                (
                    FieldOrdinal, FieldName, SqlType, IsNullable, MaxLength,
                    SourceSchema, SourceTable, SourceColumn
                )
                SELECT
                    ROW_NUMBER() OVER
                    (
                        ORDER BY U.TablePriority, U.TableName, U.column_id
                    ) AS FieldOrdinal,
                    U.FieldName,
                    U.SqlType,
                    U.IsNullable,
                    U.MaxLength,
                    U.SchemaName,
                    U.TableName,
                    U.FieldName
                FROM UniqueColumns AS U;
            END TRY
            BEGIN CATCH
                DELETE FROM @ResultFields;
            END CATCH;
        END;

        IF EXISTS (SELECT 1 FROM @ResultFields)
           AND
           (
               @ContractType = 'READ_ONLY'
               OR @WebFormName NOT LIKE '%Frm'
               OR EXISTS
               (
                   SELECT 1
                   FROM @ResultFields AS F
                   WHERE F.FieldName COLLATE DATABASE_DEFAULT =
                         @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
               )
           )
        BEGIN
            SET @ResultSetFallback = 0;

            SELECT
            CAST('2.0' AS varchar(10)) AS SchemaVersion,
            CAST('1.0' AS varchar(10)) AS CapabilityVersion,
            @WebFormName AS WebFormName,
            @ERPFormID AS ERPFormName,
            @ExpectedTable AS TableName,
            @ExpectedPrimaryKey AS PrimaryKey,
            @RegisteredView AS RegisteredViewProcedure,
            @RegisteredSave AS RegisteredSaveProcedure,
            @RegisteredDelete AS RegisteredDeleteProcedure,
            @ResolvedDeleteMode AS DeleteMode,
            CAST('RESULT_SET' AS varchar(30)) AS SourceKind,
            RF.FieldOrdinal,
            CONVERT(varchar(128), RF.FieldName) AS FieldName,
            RF.SqlType,
            RF.IsNullable,
            CONVERT(bit, CASE WHEN PC.column_id IS NULL THEN 0 ELSE 1 END) AS IsPhysicalColumn,
            ResultFlags.IsPrimaryKey,
            CONVERT(bit, ISNULL(PC.is_identity, 0)) AS IsIdentity,
            CONVERT(bit, ISNULL(PC.is_computed, 0)) AS IsComputed,
            CONVERT(bit, CASE WHEN ISNULL(PC.default_object_id, 0) <> 0 THEN 1 ELSE 0 END) AS HasDefault,
            COALESCE(PC.max_length, RF.MaxLength) AS DbMaxLength,
            PC.[precision] AS DbPrecision,
            PC.scale AS DbScale,
            RF.IsNullable AS DbIsNullable,
            ResultFlags.IsServerManaged,
            ResultFlags.IsDenied AS IsSensitiveOrDenied,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanInsert = 1
                 AND ISNULL(RF.IsNullable, 1) = 0
                 AND ISNULL(PC.default_object_id, 0) = 0 THEN 1
                ELSE 0
            END) AS IsRequiredOnInsert,
            ResultFlags.CanQuery AS ShowInGrid,
            ResultFlags.CanInsert AS ShowInAdd,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanUpdate = 1 OR ResultFlags.IsPrimaryKey = 1 THEN 1
                ELSE 0
            END) AS ShowInEdit,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1 AND ResultFilter.UserAutoID IS NOT NULL THEN 1
                ELSE 0
            END) AS ShowInFilter,
            ResultFlags.CanInsert AS SupportsInsert,
            ResultFlags.CanUpdate AS SupportsUpdate,
            ResultFlags.CanQuery AS SupportsFilter,
            ResultFlags.CanQuery AS SupportsSort,
            CONVERT(bit, CASE
                WHEN ResultFlags.CanQuery = 1
                 AND LOWER(ISNULL(RF.SqlType, '')) LIKE '%char%' THEN 1
                ELSE 0
            END) AS SupportsKeyword,
            COALESCE(
                NULLIF(ResultCaption.CaptionVN, N''),
                NULLIF(ResultCaption.CaptionEN, N''),
                CONVERT(nvarchar(200), RF.FieldName)
            ) AS Caption,
            ResultCaption.FormatID,
            ResultFormat.[Type] AS FormatType,
            CASE
                WHEN ResultLookup.UserAutoID IS NOT NULL THEN 'lookup'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE 'bit%' THEN 'boolean'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'D' THEN 'date'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'DT' THEN 'datetime'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) = 'H' THEN 'time'
                WHEN UPPER(ISNULL(ResultCaption.FormatID, '')) IN ('B', 'Q', 'N', 'N0', 'N3') THEN 'number'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%date%' THEN 'date'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%time%' THEN 'time'
                WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%int%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%decimal%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%numeric%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%money%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%float%'
                  OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%real%' THEN 'number'
                ELSE 'text'
            END AS RenderType,
            ResultFormat.NumberDecimal,
            ResultFormat.FormatString,
            ResultFormat.MaskString,
            COALESCE(ResultFormat.MaxLength, RF.MaxLength) AS MaxLength,
            ResultFormat.MinValue,
            ResultFormat.MaxValue,
            COALESCE(NULLIF(ResultCaption.AlignX, ''), ResultFormat.Align) AS Align,
            ResultCaption.MinWidth,
            ResultCaption.MaxWidth,
            CASE WHEN ResultLookup.UserAutoID IS NULL THEN NULL ELSE
                CONVERT(varchar(64), HASHBYTES(
                    'SHA2_256',
                    UPPER(CONCAT(
                        LTRIM(RTRIM(CONVERT(varchar(100), ResultLookup.FormID))),
                        '|',
                        LTRIM(RTRIM(CONVERT(varchar(128), ResultLookup.ColumnID)))
                    ))
                ), 2)
            END AS LookupKey,
            ResultLookup.[Type] AS LookupType,
            ResultLookup.ValueColumn AS LookupValueColumn,
            ResultLookup.DisplayColumn AS LookupDisplayColumn,
            ResultLookup.ColumnArr AS LookupColumns,
            ResultLookup.WidthArr AS LookupWidths,
            ResultLookup.ParaRequireArr AS LookupDependsOn,
            CONVERT(bit, ISNULL(ResultLookup.IsMultiSelect, 0)) AS LookupMultiSelect,
            ResultLookup.ReloadType AS LookupReloadMode,
            CONVERT(bit, ISNULL(ResultLookup.IsDisable, 0)) AS LookupDisabled,
            CONVERT(bit, CASE WHEN @FilterSourceFormID IS NULL THEN 0 ELSE 1 END) AS HasConfiguredFilters,
            @FilterSourceFormID AS FilterSourceFormID,
            ResultFilter.KeyID AS FilterKeyID,
            COALESCE(
                NULLIF(ResultFilter.Caption, N''),
                NULLIF(ResultCaption.CaptionVN, N''),
                NULLIF(ResultCaption.CaptionEN, N''),
                CONVERT(nvarchar(200), RF.FieldName)
            ) AS FilterCaption,
            ResultFilter.[Type] AS FilterControlType,
            ResultFilter.Operator AS FilterOperator,
            CONVERT(bit, ISNULL(ResultFilter.UseLikeOperator, 0)) AS FilterUseLikeOperator,
            ResultFilter.ControlWidth AS FilterControlWidth,
            ResultFilter.ValueColumn AS FilterValueColumn,
            ResultFilter.DisplayColumn AS FilterDisplayColumn,
            ResultFilter.ColumnArr AS FilterColumns,
            ResultFilter.WidthArr AS FilterWidths,
            CONVERT(bit, ISNULL(ResultFilter.RememberLastValue, 0)) AS FilterRememberLastValue,
            ResultFilter.DefaultValue AS FilterDefaultValue,
            CONVERT(bit, ISNULL(ResultFilter.IsReload, 0)) AS FilterReload,
            CASE
                WHEN ResultFlags.IsDenied = 1 OR ResultFlags.IsServerManaged = 1 THEN 'HIDDEN'
                WHEN ResultFlags.IsPrimaryKey = 1
                  OR ResultFlags.CanInsert = 1
                  OR ResultLookup.UserAutoID IS NOT NULL THEN 'CORE'
                ELSE 'OPTIONAL'
            END AS MobileClass,
            CASE
                WHEN ResultFlags.IsDenied = 1 THEN 'DENIED_FIELD'
                WHEN ResultFlags.IsServerManaged = 1 THEN 'SERVER_MANAGED'
                WHEN ResultFlags.IsPrimaryKey = 1 THEN 'PRIMARY_KEY'
                WHEN PC.column_id IS NULL THEN 'RESULT_SET_READ_ONLY'
                ELSE 'RESULT_SET_FIELD'
            END AS MobileReasonCodes,
            CAST(NULL AS varchar(80)) AS DiagnosticCode
        FROM @ResultFields AS RF
        LEFT JOIN sys.columns AS PC
          ON PC.object_id = @ObjectID
         AND PC.name COLLATE DATABASE_DEFAULT =
             COALESCE(NULLIF(RF.SourceColumn, ''), RF.FieldName) COLLATE DATABASE_DEFAULT
         AND (
             RF.SourceTable IS NULL
             OR RF.SourceTable COLLATE DATABASE_DEFAULT =
                @ExpectedTable COLLATE DATABASE_DEFAULT
         )
        OUTER APPLY
        (
            SELECT
                CONVERT(bit, CASE
                    WHEN RF.FieldName COLLATE DATABASE_DEFAULT =
                         @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1
                    ELSE 0
                END) AS IsPrimaryKey,
                CONVERT(bit, CASE
                    WHEN LOWER(RF.FieldName) COLLATE DATABASE_DEFAULT IN
                    (
                        'usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                        'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                        'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat'
                    ) THEN 1 ELSE 0
                END) AS IsServerManaged,
                CONVERT(bit, CASE
                    WHEN LOWER(RF.FieldName) COLLATE DATABASE_DEFAULT IN
                    (
                        '__proto__', 'prototype', 'constructor', 'content', 'base64content',
                        'filecontent', 'binarydata', 'password', 'passwordhash', 'token',
                        'refreshtoken', 'secret', 'rawsql', 'commandtext'
                    )
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'binary%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'varbinary%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'image%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'rowversion%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'timestamp%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'xml%'
                    OR LOWER(ISNULL(RF.SqlType, '')) LIKE 'sql_variant%'
                    THEN 1 ELSE 0
                END) AS IsDenied
        ) AS ResultBase
        OUTER APPLY
        (
            SELECT
                ResultBase.IsPrimaryKey,
                ResultBase.IsServerManaged,
                ResultBase.IsDenied,
                CONVERT(bit, CASE
                    WHEN @EnableSave = 1
                     AND PC.column_id IS NOT NULL
                     AND ISNULL(PC.is_identity, 0) = 0
                     AND ISNULL(PC.is_computed, 0) = 0
                     AND ResultBase.IsServerManaged = 0
                     AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanInsert,
                CONVERT(bit, CASE
                    WHEN @EnableSave = 1
                     AND PC.column_id IS NOT NULL
                     AND ISNULL(PC.is_identity, 0) = 0
                     AND ISNULL(PC.is_computed, 0) = 0
                     AND ResultBase.IsPrimaryKey = 0
                     AND ResultBase.IsServerManaged = 0
                     AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanUpdate,
                CONVERT(bit, CASE
                    WHEN @EnableView = 1 AND ResultBase.IsDenied = 0 THEN 1
                    ELSE 0
                END) AS CanQuery
        ) AS ResultFlags
        OUTER APPLY
        (
            SELECT TOP (1)
                X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
            FROM dbo.SY_FmtFldTbl AS X
            WHERE X.FieldName COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
            /*
              Desktop tái sử dụng caption của cùng FieldName giữa nhiều form. Caption
              có nghĩa được ưu tiên trước caption kỹ thuật (Person Name/PersonName),
              sau đó mới xét form hiện tại và mức độ dùng chung. Nhờ vậy result-set
              của report không rơi về tên cột kỹ thuật khi caption tiếng Việt đang
              được cấu hình ở một form desktop khác.
            */
            ORDER BY
            CASE
                WHEN NULLIF(LTRIM(RTRIM(X.CaptionVN)), N'') IS NULL THEN 2
                WHEN LOWER(REPLACE(REPLACE(LTRIM(RTRIM(X.CaptionVN)), N' ', N''), N'_', N'')) COLLATE DATABASE_DEFAULT =
                     LOWER(REPLACE(REPLACE(RF.FieldName, N' ', N''), N'_', N'')) COLLATE DATABASE_DEFAULT THEN 1
                ELSE 0
            END,
            CASE
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 2
                WHEN X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '' THEN 3
                ELSE 4
            END,
            (
                SELECT COUNT_BIG(*)
                FROM dbo.SY_FmtFldTbl AS SharedCaption
                WHERE SharedCaption.FieldName COLLATE DATABASE_DEFAULT =
                      X.FieldName COLLATE DATABASE_DEFAULT
                  AND NULLIF(LTRIM(RTRIM(SharedCaption.CaptionVN)), N'') COLLATE DATABASE_DEFAULT =
                      NULLIF(LTRIM(RTRIM(X.CaptionVN)), N'') COLLATE DATABASE_DEFAULT
            ) DESC,
            X.AutoID
        ) AS ResultCaption
        LEFT JOIN dbo.SY_FmatTbl AS ResultFormat
          ON ResultFormat.FormatID COLLATE DATABASE_DEFAULT =
             ResultCaption.FormatID COLLATE DATABASE_DEFAULT
        OUTER APPLY
        (
            SELECT TOP (1)
                X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn,
                X.DisplayColumn, X.ColumnArr, X.WidthArr, X.ParaRequireArr,
                X.IsMultiSelect, X.ReloadType, X.IsDisable
            FROM dbo.SY_FrmDrdwTbl AS X
            WHERE X.ColumnID COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
              AND X.FormID COLLATE DATABASE_DEFAULT IN (@ERPFormID, @WebFormName)
              AND ISNULL(X.IsDisable, 0) = 0
            ORDER BY CASE
                WHEN X.FormID COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
                ELSE 2
            END, X.UserAutoID
        ) AS ResultLookup
        OUTER APPLY
        (
            SELECT TOP (1)
                X.UserAutoID, X.KeyID, X.Caption, X.ControlWidth, X.[Type],
                X.ValueColumn, X.DisplayColumn, X.ColumnArr, X.WidthArr,
                X.RememberLastValue, X.UseLikeOperator, X.IsReload,
                X.Operator, X.DefaultValue
            FROM dbo.SY_FrmFltTbl AS X
            WHERE @FilterSourceFormID IS NOT NULL
              AND X.FormID COLLATE DATABASE_DEFAULT =
                  @FilterSourceFormID COLLATE DATABASE_DEFAULT
              AND X.ColumnID COLLATE DATABASE_DEFAULT =
                  RF.FieldName COLLATE DATABASE_DEFAULT
              AND ISNULL(X.IsDisable, 0) = 0
            ORDER BY
                CASE WHEN TRY_CONVERT(int, X.KeyID) IS NULL THEN 1 ELSE 0 END,
                TRY_CONVERT(int, X.KeyID),
                X.KeyID,
                X.UserAutoID
        ) AS ResultFilter
            ORDER BY RF.FieldOrdinal;

            RETURN;
        END;
    END;

    /* PHASE3_UNIFIED_FIELD_CONTRACT: mỗi cột mới an toàn được phát hiện trực tiếp. */
    SELECT
        /* Phase 3 mở rộng form nhưng giữ nguyên wire contract đã công bố ở Phase 2. */
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        CAST('1.0' AS varchar(10)) AS CapabilityVersion,
        @WebFormName AS WebFormName,
        @ERPFormID AS ERPFormName,
        @ExpectedTable AS TableName,
        @ExpectedPrimaryKey AS PrimaryKey,
        @RegisteredView AS RegisteredViewProcedure,
        @RegisteredSave AS RegisteredSaveProcedure,
        @RegisteredDelete AS RegisteredDeleteProcedure,
        @ResolvedDeleteMode AS DeleteMode,
        CAST(CASE WHEN @ResultSetFallback = 1
            THEN 'TABLE_FALLBACK' ELSE 'MAIN_TABLE' END AS varchar(30)) AS SourceKind,
        C.column_id AS FieldOrdinal,
        CONVERT(varchar(128), C.name) AS FieldName,
        T.name + CASE
            WHEN T.name IN ('varchar', 'char', 'binary', 'varbinary')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
            WHEN T.name IN ('nvarchar', 'nchar')
                THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
            WHEN T.name IN ('decimal', 'numeric')
                THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
            WHEN T.name IN ('datetime2', 'datetimeoffset', 'time')
                THEN '(' + CONVERT(varchar(10), C.scale) + ')'
            ELSE '' END AS SqlType,
        C.is_nullable AS IsNullable,
        CONVERT(bit, 1) AS IsPhysicalColumn,
        Flags.IsPrimaryKey,
        CONVERT(bit, C.is_identity) AS IsIdentity,
        CONVERT(bit, C.is_computed) AS IsComputed,
        CONVERT(bit, CASE WHEN C.default_object_id <> 0 THEN 1 ELSE 0 END) AS HasDefault,
        C.max_length AS DbMaxLength,
        C.[precision] AS DbPrecision,
        C.scale AS DbScale,
        C.is_nullable AS DbIsNullable,
        Flags.IsServerManaged,
        Flags.IsDenied AS IsSensitiveOrDenied,
        CONVERT(bit, CASE
            WHEN Flags.CanInsert = 1 AND C.is_nullable = 0 AND C.default_object_id = 0 THEN 1 ELSE 0 END) AS IsRequiredOnInsert,
        Flags.CanQuery AS ShowInGrid,
        Flags.CanInsert AS ShowInAdd,
        CONVERT(bit, CASE WHEN Flags.CanUpdate = 1 OR Flags.IsPrimaryKey = 1 THEN 1 ELSE 0 END) AS ShowInEdit,
        CONVERT(bit, CASE
        WHEN Flags.CanQuery = 1 AND FilterCfg.UserAutoID IS NOT NULL THEN 1
        ELSE 0
        END) AS ShowInFilter,
        Flags.CanInsert AS SupportsInsert,
        Flags.CanUpdate AS SupportsUpdate,
        Flags.CanQuery AS SupportsFilter,
        Flags.CanQuery AS SupportsSort,
        CONVERT(bit, CASE WHEN Flags.CanQuery = 1 AND T.name IN ('varchar', 'nvarchar', 'char', 'nchar') THEN 1 ELSE 0 END) AS SupportsKeyword,
        COALESCE(NULLIF(M.CaptionVN, N''), NULLIF(M.CaptionEN, N''), CONVERT(nvarchar(200), C.name)) AS Caption,
        M.FormatID,
        F.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN T.name = 'bit' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('D') THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('DT') THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('H') THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B') THEN 'money'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('Q') THEN 'decimal'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            WHEN T.name IN ('date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset') THEN 'date'
            WHEN T.name IN ('time') THEN 'time'
            WHEN T.name IN ('tinyint', 'smallint', 'int', 'bigint', 'decimal', 'numeric', 'money', 'smallmoney', 'float', 'real') THEN 'number'
            ELSE 'text'
        END AS RenderType,
        F.NumberDecimal,
        F.FormatString,
        F.MaskString,
        COALESCE(F.MaxLength, CASE
            WHEN T.name IN ('nvarchar', 'nchar') AND C.max_length > 0 THEN C.max_length / 2
            WHEN T.name IN ('varchar', 'char') AND C.max_length > 0 THEN C.max_length
            ELSE NULL END) AS MaxLength,
        F.MinValue,
        F.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), F.Align) AS Align,
        M.MinWidth,
        M.MaxWidth,
        CASE WHEN D.UserAutoID IS NULL THEN NULL ELSE
            CONVERT(varchar(64), HASHBYTES(
                'SHA2_256',
                UPPER(CONCAT(
                    LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                    '|',
                    LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
                ))
            ), 2)
        END AS LookupKey,
        D.[Type] AS LookupType,
        D.ValueColumn AS LookupValueColumn,
        D.DisplayColumn AS LookupDisplayColumn,
        D.ColumnArr AS LookupColumns,
        D.WidthArr AS LookupWidths,
        D.ParaRequireArr AS LookupDependsOn,
        CONVERT(bit, ISNULL(D.IsMultiSelect, 0)) AS LookupMultiSelect,
        D.ReloadType AS LookupReloadMode,
        CONVERT(bit, ISNULL(D.IsDisable, 0)) AS LookupDisabled,
         CONVERT(bit, CASE WHEN @FilterSourceFormID IS NULL THEN 0 ELSE 1 END) AS HasConfiguredFilters,
    @FilterSourceFormID AS FilterSourceFormID,
    FilterCfg.KeyID AS FilterKeyID,
    COALESCE(
        NULLIF(FilterCfg.Caption, N''),
        NULLIF(M.CaptionVN, N''),
        NULLIF(M.CaptionEN, N''),
        CONVERT(nvarchar(200), C.name)
    ) AS FilterCaption,
    FilterCfg.[Type] AS FilterControlType,
    FilterCfg.Operator AS FilterOperator,
    CONVERT(bit, ISNULL(FilterCfg.UseLikeOperator, 0)) AS FilterUseLikeOperator,
    FilterCfg.ControlWidth AS FilterControlWidth,
    FilterCfg.ValueColumn AS FilterValueColumn,
    FilterCfg.DisplayColumn AS FilterDisplayColumn,
    FilterCfg.ColumnArr AS FilterColumns,
    FilterCfg.WidthArr AS FilterWidths,
    CONVERT(bit, ISNULL(FilterCfg.RememberLastValue, 0)) AS FilterRememberLastValue,
    FilterCfg.DefaultValue AS FilterDefaultValue,
    CONVERT(bit, ISNULL(FilterCfg.IsReload, 0)) AS FilterReload,
        Mobile.MobileClass,
        Mobile.ReasonCodes AS MobileReasonCodes,
        CASE
            WHEN @ResultSetFallback = 1 THEN 'RESULTSET_FALLBACK_TO_TABLE'
            WHEN Flags.IsDenied = 1 THEN 'FIELD_DENIED'
            WHEN @RegisteredView COLLATE DATABASE_DEFAULT <> @ExpectedView COLLATE DATABASE_DEFAULT THEN 'SHADOW_VIEW_NOT_REGISTERED'
            WHEN @EnableSave = 1 AND @RegisteredSave COLLATE DATABASE_DEFAULT <> @ExpectedSave COLLATE DATABASE_DEFAULT THEN 'SHADOW_SAVE_NOT_REGISTERED'
            WHEN @EnableDelete = 1 AND @RegisteredDelete COLLATE DATABASE_DEFAULT <> @ExpectedDelete COLLATE DATABASE_DEFAULT THEN 'SHADOW_DELETE_NOT_REGISTERED'
            ELSE 'OK'
        END AS DiagnosticCode
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    OUTER APPLY (
        SELECT
            CONVERT(bit, CASE WHEN C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
            CONVERT(bit, CASE WHEN LOWER(C.name) COLLATE DATABASE_DEFAULT IN
                ('usercreate', 'createdby', 'createby', 'datecreate', 'createddate', 'createdat',
                 'userupdate', 'updatedby', 'updateby', 'dateupdate', 'updateddate', 'updatedat',
                 'isdeleted', 'userdelete', 'deletedby', 'deleteby', 'datedelete', 'deleteddate', 'deletedat')
                THEN 1 ELSE 0 END) AS IsServerManaged,
            CONVERT(bit, CASE
                WHEN T.is_user_defined = 1
                  OR T.is_assembly_type = 1
                  OR LOWER(T.name) COLLATE DATABASE_DEFAULT IN
                    ('binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext',
                     'sql_variant', 'geography', 'geometry', 'hierarchyid')
                  OR LOWER(C.name) COLLATE DATABASE_DEFAULT IN
                    ('content', 'base64content', 'filecontent', 'binarydata', 'password', 'passwordhash',
                     'token', 'refreshtoken', 'secret', 'rawsql', 'commandtext')
                THEN 1 ELSE 0 END) AS IsDenied
    ) AS Base
    OUTER APPLY (
        SELECT
            Base.IsPrimaryKey,
            Base.IsServerManaged,
            Base.IsDenied,
            CONVERT(bit, CASE
                WHEN @EnableSave = 1 AND C.is_identity = 0 AND C.is_computed = 0
                 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanInsert,
            CONVERT(bit, CASE
                WHEN @EnableSave = 1 AND C.is_identity = 0 AND C.is_computed = 0
                 AND Base.IsPrimaryKey = 0 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanUpdate,
            CONVERT(bit, CASE
                WHEN @EnableView = 1 AND Base.IsServerManaged = 0 AND Base.IsDenied = 0 THEN 1 ELSE 0 END) AS CanQuery
    ) AS Flags
    OUTER APPLY (
        SELECT TOP (1) X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE X.FieldName COLLATE DATABASE_DEFAULT = C.name COLLATE DATABASE_DEFAULT
        ORDER BY
            CASE
                WHEN NULLIF(LTRIM(RTRIM(X.CaptionVN)), N'') IS NULL THEN 2
                WHEN LOWER(REPLACE(REPLACE(LTRIM(RTRIM(X.CaptionVN)), N' ', N''), N'_', N'')) COLLATE DATABASE_DEFAULT =
                     LOWER(REPLACE(REPLACE(C.name, N' ', N''), N'_', N'')) COLLATE DATABASE_DEFAULT THEN 1
                ELSE 0
            END,
            CASE
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @ERPFormID COLLATE DATABASE_DEFAULT THEN 1
                WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 2
                WHEN X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '' THEN 3
                ELSE 4
            END,
            (
                SELECT COUNT_BIG(*)
                FROM dbo.SY_FmtFldTbl AS SharedCaption
                WHERE SharedCaption.FieldName COLLATE DATABASE_DEFAULT =
                      X.FieldName COLLATE DATABASE_DEFAULT
                  AND NULLIF(LTRIM(RTRIM(SharedCaption.CaptionVN)), N'') COLLATE DATABASE_DEFAULT =
                      NULLIF(LTRIM(RTRIM(X.CaptionVN)), N'') COLLATE DATABASE_DEFAULT
            ) DESC,
            X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS F
      ON F.FormatID COLLATE DATABASE_DEFAULT =
         M.FormatID COLLATE DATABASE_DEFAULT

    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID,
            X.FormID,
            X.ColumnID,
            X.[Type],
            X.ValueColumn,
            X.DisplayColumn,
            X.ColumnArr,
            X.WidthArr,
            X.ParaRequireArr,
            X.IsMultiSelect,
            X.ReloadType,
            X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE
            X.ColumnID COLLATE DATABASE_DEFAULT =
                C.name COLLATE DATABASE_DEFAULT
            AND X.FormID COLLATE DATABASE_DEFAULT
                IN (@ERPFormID, @WebFormName)
            AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY
            CASE
                WHEN X.FormID COLLATE DATABASE_DEFAULT =
                     @ERPFormID COLLATE DATABASE_DEFAULT
                THEN 1
                ELSE 2
            END,
            X.UserAutoID
    ) AS D

    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID,
            X.KeyID,
            X.Caption,
            X.ControlWidth,
            X.[Type],
            X.ValueColumn,
            X.DisplayColumn,
            X.ColumnArr,
            X.WidthArr,
            X.RememberLastValue,
            X.UseLikeOperator,
            X.IsReload,
            X.Operator,
            X.DefaultValue
        FROM dbo.SY_FrmFltTbl AS X
        WHERE
            @FilterSourceFormID IS NOT NULL
            AND X.FormID COLLATE DATABASE_DEFAULT =
                @FilterSourceFormID COLLATE DATABASE_DEFAULT
            AND X.ColumnID COLLATE DATABASE_DEFAULT =
                C.name COLLATE DATABASE_DEFAULT
            AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY
            CASE
                WHEN TRY_CONVERT(int, X.KeyID) IS NULL
                THEN 1
                ELSE 0
            END,
            TRY_CONVERT(int, X.KeyID),
            X.KeyID,
            X.UserAutoID
    ) AS FilterCfg

    OUTER APPLY
    (
        SELECT
            CASE
                WHEN Flags.IsDenied = 1
                  OR Flags.IsServerManaged = 1
                    THEN 'HIDDEN'

                WHEN
                    (
                        Flags.CanInsert = 1
                        AND C.is_nullable = 0
                        AND C.default_object_id = 0
                    )
                    OR Flags.IsPrimaryKey = 1
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%name'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%code'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%status%'
                    OR LOWER(C.name) COLLATE DATABASE_DEFAULT
                        LIKE '%effective%'
                    OR D.UserAutoID IS NOT NULL
                    THEN 'CORE'

                WHEN
                    C.is_computed = 1
                    OR
                    (
                        T.name IN ('varchar', 'nvarchar')
                        AND
                        (
                            C.max_length = -1
                            OR C.max_length > 1000
                        )
                    )
                    THEN 'ADVANCED'

                ELSE 'OPTIONAL'
            END AS MobileClass,

            NULLIF(
                STUFF(
                    CONCAT(
                        CASE
                            WHEN Flags.IsDenied = 1
                            THEN ';DENIED_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsServerManaged = 1
                            THEN ';SERVER_MANAGED'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsPrimaryKey = 1
                            THEN ';PRIMARY_KEY'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.CanInsert = 1
                             AND C.is_nullable = 0
                             AND C.default_object_id = 0
                            THEN ';REQUIRED_ON_INSERT'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%name'
                            THEN ';BUSINESS_NAME'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%code'
                            THEN ';BUSINESS_CODE'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%status%'
                            THEN ';STATUS_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN LOWER(C.name)
                                 COLLATE DATABASE_DEFAULT
                                 LIKE '%effective%'
                            THEN ';EFFECTIVE_DATE'
                            ELSE ''
                        END,

                        CASE
                            WHEN D.UserAutoID IS NOT NULL
                            THEN ';LOOKUP_FIELD'
                            ELSE ''
                        END,

                        CASE
                            WHEN C.is_computed = 1
                            THEN ';COMPUTED'
                            ELSE ''
                        END,

                        CASE
                            WHEN T.name IN ('varchar', 'nvarchar')
                             AND
                             (
                                 C.max_length = -1
                                 OR C.max_length > 1000
                             )
                            THEN ';LONG_TEXT'
                            ELSE ''
                        END,

                        CASE
                            WHEN Flags.IsDenied = 0
                             AND Flags.IsServerManaged = 0
                             AND Flags.IsPrimaryKey = 0
                             AND NOT
                             (
                                 Flags.CanInsert = 1
                                 AND C.is_nullable = 0
                                 AND C.default_object_id = 0
                             )
                            THEN ';DEFAULT_OPTIONAL'
                            ELSE ''
                        END
                    ),
                    1,
                    1,
                    ''
                ),
                ''
            ) AS ReasonCodes
    ) AS Mobile

    WHERE C.object_id = @ObjectID
    ORDER BY C.column_id;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_JoinFieldSchemaV2; Input: sql/UnifiedContractRollout/06_UPDATE_METADATA_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_JoinFieldSchemaV2
    @WebFormName varchar(100),
    @DetailKey varchar(80),
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LTRIM(RTRIM(ISNULL(@WebFormName, '')));
    SET @DetailKey = LTRIM(RTRIM(ISNULL(@DetailKey, '')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    IF @WebFormName = '' OR @DetailKey = '' OR @UserName = ''
    BEGIN
        THROW 53401, N'PHASE4_JOIN_CONTEXT_REQUIRED', 1;
    END;

    DECLARE
        @ApiList varchar(100),
        @ExpectedProcedure sysname,
        @ExpectedSaveProcedure sysname,
        @ExpectedDeleteProcedure sysname,
        @ExpectedTable sysname,
        @ExpectedPrimaryKey sysname,
        @PermissionFormName varchar(100),
        @ReadOnly bit,
        @RegistryCount int;

    SELECT
        @RegistryCount = COUNT(*),
        @ApiList = MIN(R.ApiList),
        @ExpectedProcedure = MIN(CONVERT(sysname, R.ExpectedProcedure)),
        @ExpectedSaveProcedure = MIN(CONVERT(sysname, R.ExpectedSaveProcedure)),
        @ExpectedDeleteProcedure = MIN(CONVERT(sysname, R.ExpectedDeleteProcedure)),
        @ExpectedTable = MIN(CONVERT(sysname, R.ExpectedTableName)),
        @ExpectedPrimaryKey = MIN(CONVERT(sysname, R.ExpectedPrimaryKey)),
        @PermissionFormName = MIN(R.PermissionFormName),
        @ReadOnly = CONVERT(bit, MIN(CONVERT(tinyint, R.IsReadOnly)))
    FROM dbo.API_Phase4JoinRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
      AND R.DetailKey COLLATE DATABASE_DEFAULT = @DetailKey COLLATE DATABASE_DEFAULT
      AND R.EnableMetadata = 1;

    IF ISNULL(@RegistryCount, 0) <> 1
    BEGIN
        THROW 53402, N'PHASE4_JOIN_CONTRACT_NOT_ALLOWLISTED', 1;
    END;

    DECLARE
        @UserGroupID varchar(50),
        @UserBranches varchar(max);

    SELECT
        @UserGroupID = U.UserGroupID,
        @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        THROW 53403, N'PHASE4_JOIN_ACTOR_INVALID', 1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            THROW 53406, N'PHASE4_JOIN_BRANCH_REQUIRED', 1;
        END;

        IF EXISTS
        (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            THROW 53407, N'PHASE4_JOIN_BRANCH_DENIED', 1;
        END;
    END;

    SET @PermissionFormName =
        LTRIM(RTRIM(ISNULL(NULLIF(@PermissionFormName, ''), @WebFormName)));

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        THROW 53404, N'PHASE4_JOIN_ACTIVE_MENU_REQUIRED', 1;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
       AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
        BEGIN
            THROW 53405, N'PHASE4_JOIN_PERMISSION_DENIED', 1;
        END;
    END;

    DECLARE
        @RouteCount int,
        @RegisteredProcedure sysname;

    SELECT
        @RouteCount = COUNT(*),
        @RegisteredProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'View' COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
       OR @RegisteredProcedure IS NULL
       OR @RegisteredProcedure COLLATE DATABASE_DEFAULT <> @ExpectedProcedure COLLATE DATABASE_DEFAULT
    BEGIN
        THROW 53408, N'PHASE4_JOIN_VIEW_ROUTE_INVALID', 1;
    END;

    DECLARE
        @SaveRouteCount int = 0,
        @DeleteRouteCount int = 0,
        @RegisteredSaveProcedure sysname = NULL,
        @RegisteredDeleteProcedure sysname = NULL;

    SELECT
        @SaveRouteCount = COUNT(*),
        @RegisteredSaveProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Save' COLLATE DATABASE_DEFAULT;

    SELECT
        @DeleteRouteCount = COUNT(*),
        @RegisteredDeleteProcedure = MIN(CONVERT(sysname, PARSENAME(LTRIM(RTRIM(A.[SQL])), 1)))
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT;

    IF @ReadOnly = 1
       AND (@SaveRouteCount > 0 OR @DeleteRouteCount > 0)
    BEGIN
        THROW 53410, N'PHASE4_JOIN_READONLY_MUTATION_ROUTE_FORBIDDEN', 1;
    END;

    IF @ReadOnly = 0
       AND (
            @ExpectedSaveProcedure IS NULL
            OR @ExpectedDeleteProcedure IS NULL
            OR @SaveRouteCount <> 1
            OR @DeleteRouteCount <> 1
            OR @RegisteredSaveProcedure COLLATE DATABASE_DEFAULT <> @ExpectedSaveProcedure COLLATE DATABASE_DEFAULT
            OR @RegisteredDeleteProcedure COLLATE DATABASE_DEFAULT <> @ExpectedDeleteProcedure COLLATE DATABASE_DEFAULT
       )
    BEGIN
        THROW 53411, N'PHASE4_JOIN_MUTATION_ROUTE_INVALID', 1;
    END;

    DECLARE @ProcedureObjectID int =
        COALESCE(OBJECT_ID(@ExpectedProcedure, N'P'), OBJECT_ID(N'dbo.' + @ExpectedProcedure, N'P'));

    IF @ProcedureObjectID IS NULL
    BEGIN
        THROW 53409, N'PHASE4_JOIN_PROCEDURE_NOT_FOUND', 1;
    END;

    DECLARE @TableObjectID int =
        COALESCE(OBJECT_ID(@ExpectedTable, N'U'), OBJECT_ID(N'dbo.' + @ExpectedTable, N'U'));

    IF @TableObjectID IS NULL
    BEGIN
        THROW 53410, N'PHASE4_JOIN_MAIN_TABLE_NOT_FOUND', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.columns AS C
        WHERE C.object_id = @TableObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53411, N'PHASE4_JOIN_PRIMARY_KEY_NOT_FOUND', 1;
    END;

    DECLARE @Fields TABLE
    (
        FieldOrdinal int NOT NULL,
        FieldName sysname NOT NULL,
        SqlType nvarchar(256) NULL,
        IsNullable bit NULL,
        MaxLength int NULL,
        SourceSchema sysname NULL,
        SourceTable sysname NULL,
        SourceColumn sysname NULL
    );

    BEGIN TRY
        IF EXISTS
        (
            SELECT 1
            FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 1) AS D
            WHERE D.error_number IS NOT NULL
        )
        BEGIN
            THROW 53412, N'PHASE4_JOIN_RESULTSET_METADATA_ERROR', 1;
        END;

        INSERT INTO @Fields
        (
            FieldOrdinal,
            FieldName,
            SqlType,
            IsNullable,
            MaxLength,
            SourceSchema,
            SourceTable,
            SourceColumn
        )
        SELECT
            D.column_ordinal,
            D.name,
            D.system_type_name,
            D.is_nullable,
            D.max_length,
            D.source_schema,
            D.source_table,
            D.source_column
        FROM sys.dm_exec_describe_first_result_set_for_object(@ProcedureObjectID, 1) AS D
        WHERE ISNULL(D.is_hidden, 0) = 0
          AND D.error_number IS NULL
          AND D.name IS NOT NULL
          AND LTRIM(RTRIM(D.name)) <> '';
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() BETWEEN 53400 AND 53499
        BEGIN
            THROW;
        END;

        THROW 53412, N'PHASE4_JOIN_RESULTSET_METADATA_ERROR', 1;
    END CATCH;

    IF NOT EXISTS (SELECT 1 FROM @Fields)
    BEGIN
        THROW 53413, N'PHASE4_JOIN_RESULTSET_EMPTY', 1;
    END;

    IF EXISTS
    (
        SELECT LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
        FROM @Fields AS F
        GROUP BY LOWER(F.FieldName) COLLATE DATABASE_DEFAULT
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 53414, N'PHASE4_JOIN_DUPLICATE_FIELD', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE F.FieldName COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        THROW 53415, N'PHASE4_JOIN_PRIMARY_KEY_NOT_IN_RESULT', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM @Fields AS F
        WHERE LOWER(F.FieldName) COLLATE DATABASE_DEFAULT IN
        (
            '__proto__', 'prototype', 'constructor', 'content', 'base64content',
            'filecontent', 'binarydata', 'password', 'passwordhash', 'token',
            'refreshtoken', 'secret', 'rawsql', 'commandtext'
        )
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'binary%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'varbinary%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'image%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'rowversion%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'timestamp%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'xml%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'sql_variant%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'geography%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'geometry%'
        OR LOWER(ISNULL(F.SqlType, '')) LIKE 'hierarchyid%'
    )
    BEGIN
        THROW 53416, N'PHASE4_JOIN_UNSAFE_RESULT_FIELD', 1;
    END;

    SELECT
        CAST('2.0' AS varchar(10)) AS SchemaVersion,
        CAST('1.0' AS varchar(10)) AS ContractVersion,
        @WebFormName AS WebFormName,
        @DetailKey AS DetailKey,
        @ApiList AS ApiList,
        @ExpectedTable AS TableName,
        @ExpectedPrimaryKey AS PrimaryKey,
        @RegisteredProcedure AS RegisteredViewProcedure,
        @ExpectedSaveProcedure AS RegisteredSaveProcedure,
        @ExpectedDeleteProcedure AS RegisteredDeleteProcedure,
        CONVERT(bit, @ReadOnly) AS [ReadOnly],
        CAST('JOIN_RESULT_SET' AS varchar(40)) AS SourceKind,
        RF.FieldOrdinal,
        CONVERT(varchar(128), RF.FieldName) AS FieldName,
        RF.SqlType,
        RF.IsNullable,
        RF.SourceSchema,
        RF.SourceTable,
        RF.SourceColumn,
        CONVERT(bit, CASE WHEN C.column_id IS NULL THEN 0 ELSE 1 END) AS IsPhysicalColumn,
        CONVERT(bit, CASE WHEN RF.FieldName COLLATE DATABASE_DEFAULT = @ExpectedPrimaryKey COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END) AS IsPrimaryKey,
        CONVERT(bit, CASE WHEN @ReadOnly = 1 OR C.column_id IS NULL THEN 1 ELSE 0 END) AS IsReadOnly,
        COALESCE(NULLIF(M.CaptionVN, N''), NULLIF(M.CaptionEN, N''), CONVERT(nvarchar(200), RF.FieldName)) AS Caption,
        M.FormatID,
        F.[Type] AS FormatType,
        CASE
            WHEN D.UserAutoID IS NOT NULL THEN 'lookup'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE 'bit%' THEN 'boolean'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'D' THEN 'date'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'DT' THEN 'datetime'
            WHEN UPPER(ISNULL(M.FormatID, '')) = 'H' THEN 'time'
            WHEN UPPER(ISNULL(M.FormatID, '')) IN ('B', 'Q', 'N', 'N0', 'N3') THEN 'number'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%date%' THEN 'date'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%time%' THEN 'time'
            WHEN LOWER(ISNULL(RF.SqlType, '')) LIKE '%int%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%decimal%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%numeric%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%money%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%float%'
              OR LOWER(ISNULL(RF.SqlType, '')) LIKE '%real%' THEN 'number'
            ELSE 'text'
        END AS RenderType,
        F.NumberDecimal,
        F.FormatString,
        F.MaskString,
        COALESCE(F.MaxLength, RF.MaxLength) AS MaxLength,
        F.MinValue,
        F.MaxValue,
        COALESCE(NULLIF(M.AlignX, ''), F.Align) AS Align,
        M.MinWidth,
        M.MaxWidth,
        CASE
            WHEN D.UserAutoID IS NULL THEN NULL
            ELSE CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2)
        END AS LookupKey,
        D.[Type] AS LookupType,
        D.ValueColumn AS LookupValueColumn,
        D.DisplayColumn AS LookupDisplayColumn,
        D.ColumnArr AS LookupColumns,
        D.WidthArr AS LookupWidths,
        D.ParaRequireArr AS LookupDependsOn,
        CONVERT(bit, ISNULL(D.IsMultiSelect, 0)) AS LookupMultiSelect,
        D.ReloadType AS LookupReloadMode,
        CONVERT(bit, ISNULL(D.IsDisable, 0)) AS LookupDisabled,
        CAST(NULL AS varchar(80)) AS DiagnosticCode
    FROM @Fields AS RF
    LEFT JOIN sys.columns AS C
      ON C.object_id = @TableObjectID
     AND C.name COLLATE DATABASE_DEFAULT = COALESCE(NULLIF(RF.SourceColumn, ''), RF.FieldName) COLLATE DATABASE_DEFAULT
     AND (RF.SourceTable IS NULL OR RF.SourceTable COLLATE DATABASE_DEFAULT = @ExpectedTable COLLATE DATABASE_DEFAULT)
    OUTER APPLY
    (
        SELECT TOP (1) X.FormatID, X.CaptionVN, X.CaptionEN, X.AlignX, X.MinWidth, X.MaxWidth
        FROM dbo.SY_FmtFldTbl AS X
        WHERE X.FieldName COLLATE DATABASE_DEFAULT = RF.FieldName COLLATE DATABASE_DEFAULT
          AND (X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT
               OR X.FormName COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT
               OR X.FormName IS NULL OR LTRIM(RTRIM(X.FormName)) = '')
        ORDER BY CASE
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1
            WHEN X.FormName COLLATE DATABASE_DEFAULT = @ApiList COLLATE DATABASE_DEFAULT THEN 2
            ELSE 3 END, X.AutoID
    ) AS M
    LEFT JOIN dbo.SY_FmatTbl AS F
      ON F.FormatID COLLATE DATABASE_DEFAULT = M.FormatID COLLATE DATABASE_DEFAULT
    OUTER APPLY
    (
        SELECT TOP (1)
            X.UserAutoID, X.FormID, X.ColumnID, X.[Type], X.ValueColumn, X.DisplayColumn,
            X.ColumnArr, X.WidthArr, X.ParaRequireArr, X.IsMultiSelect, X.ReloadType, X.IsDisable
        FROM dbo.SY_FrmDrdwTbl AS X
        WHERE X.ColumnID COLLATE DATABASE_DEFAULT = RF.FieldName COLLATE DATABASE_DEFAULT
          AND X.FormID COLLATE DATABASE_DEFAULT IN (@WebFormName, @ApiList)
          AND ISNULL(X.IsDisable, 0) = 0
        ORDER BY CASE WHEN X.FormID COLLATE DATABASE_DEFAULT = @WebFormName COLLATE DATABASE_DEFAULT THEN 1 ELSE 2 END, X.UserAutoID
    ) AS D
    ORDER BY RF.FieldOrdinal;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_LookupSchemaV2; Input: sql/FieldSyncPhase1/02_API_WEB_LOOKUP_SCHEMA_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_LookupSchemaV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @LookupKey varchar(64),
    @Keyword nvarchar(200) = NULL,
    @Page int = 1,
    @PageSize int = 30,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @ERPFormID = LTRIM(RTRIM(ISNULL(NULLIF(@ERPFormID, ''), @WebFormName)));
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @Page = CASE WHEN ISNULL(@Page, 0) < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN ISNULL(@PageSize, 0) < 1 THEN 30 WHEN @PageSize > 100 THEN 100 ELSE @PageSize END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName = @UserName AND U.Disable = 0;

    IF @UserGroupID IS NULL
        THROW 51101, N'Người dùng không hợp lệ hoặc đã bị khóa.', 1;

    IF LOWER(@UserGroupID) <> 'admin'
       AND NOT EXISTS (
            SELECT 1
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS P
              ON P.MenuID = M.MenuID AND P.UserGroupID = @UserGroupID
            WHERE M.FormName = @WebFormName
              AND ISNULL(M.isDisable, 0) = 0
              AND (ISNULL(M.isNotCheckPermission, 0) = 1 OR ISNULL(P.IsRun, 0) = 1)
       )
        THROW 51102, N'Không có quyền đọc lookup của form.', 1;

    IF LOWER(@UserGroupID) <> 'admin' AND LTRIM(RTRIM(ISNULL(@UserBranches, ''))) <> ''
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@BranchID, ''))) = ''
            THROW 51103, N'Thiếu ngữ cảnh chi nhánh.', 1;
        IF EXISTS (
            SELECT 1
            FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                    WHERE LTRIM(RTRIM(Allowed.[value])) = LTRIM(RTRIM(Requested.[value]))
              )
        )
            THROW 51104, N'Chi nhánh nằm ngoài phạm vi được cấp.', 1;
    END;

    DECLARE
        @Source nvarchar(max),
        @LookupType varchar(10),
        @ValueColumn varchar(50),
        @DisplayColumn varchar(50),
        @ResolvedKey varchar(64);

    SELECT TOP (1)
        @Source = D.[Source],
        @LookupType = D.[Type],
        @ValueColumn = D.ValueColumn,
        @DisplayColumn = D.DisplayColumn,
        @ResolvedKey = CONVERT(varchar(64), HASHBYTES(
            'SHA2_256',
            UPPER(CONCAT(
                LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                '|',
                LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
            ))
        ), 2)
    FROM dbo.SY_FrmDrdwTbl AS D
    WHERE LOWER(LTRIM(RTRIM(ISNULL(D.FormID, '')))) IN (LOWER(@ERPFormID), LOWER(@WebFormName))
      AND ISNULL(D.IsDisable, 0) = 0
      AND (
          /* Key V2 ổn định, không phụ thuộc khóa ngẫu nhiên UserAutoID của metadata. */
          CONVERT(varchar(64), HASHBYTES(
              'SHA2_256',
              UPPER(CONCAT(
                  LTRIM(RTRIM(CONVERT(varchar(100), D.FormID))),
                  '|',
                  LTRIM(RTRIM(CONVERT(varchar(128), D.ColumnID)))
              ))
          ), 2) = @LookupKey
          /* Tương thích trong thời gian cache/client còn giữ key V1. */
          OR CONVERT(varchar(64), HASHBYTES('SHA2_256', CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID)), 2) = @LookupKey
          OR CONVERT(varchar(64), HASHBYTES('SHA2_256', UPPER(CONCAT(D.UserAutoID, '|', D.FormID, '|', D.ColumnID))), 2) = @LookupKey
      )
    ORDER BY CASE WHEN LOWER(ISNULL(D.FormID, '')) = LOWER(@ERPFormID) THEN 1 ELSE 2 END, D.UserAutoID;

    IF @ResolvedKey IS NULL
    BEGIN
        SELECT
            'BLOCKED' AS LookupMode,
            CAST(1 AS bit) AS Blocked,
            'LOOKUP_KEY_NOT_FOUND' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    IF UPPER(ISNULL(@LookupType, '')) = 'VALUELIST'
    BEGIN
        DECLARE @Values table (Ordinal int IDENTITY(1, 1), Item nvarchar(500));
        DECLARE @Work nvarchar(max) = ISNULL(@Source, N''), @Separator int, @Item nvarchar(500);

        WHILE LEN(@Work) > 0 AND (SELECT COUNT(*) FROM @Values) < 500
        BEGIN
            SET @Separator = CHARINDEX(';', @Work);
            IF @Separator = 0
            BEGIN
                SET @Item = LTRIM(RTRIM(@Work));
                SET @Work = N'';
            END
            ELSE
            BEGIN
                SET @Item = LTRIM(RTRIM(LEFT(@Work, @Separator - 1)));
                SET @Work = SUBSTRING(@Work, @Separator + 1, LEN(@Work));
            END;
            IF @Item <> N'' INSERT INTO @Values(Item) VALUES (@Item);
        END;

        SELECT
            'VALUE_LIST' AS LookupMode,
            CAST(0 AS bit) AS Blocked,
            'OK' AS DiagnosticCode,
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN LEFT(V.Item, CHARINDEX('|', V.Item) - 1) ELSE V.Item END AS [Value],
            CASE WHEN CHARINDEX('|', V.Item) > 0 THEN SUBSTRING(V.Item, CHARINDEX('|', V.Item) + 1, LEN(V.Item)) ELSE V.Item END AS Display,
            CAST(NULL AS varchar(50)) AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn
        FROM @Values AS V
        WHERE @Keyword = N'' OR V.Item LIKE N'%' + @Keyword + N'%'
        ORDER BY V.Ordinal
        OFFSET ((@Page - 1) * @PageSize) ROWS FETCH NEXT @PageSize ROWS ONLY;
        RETURN;
    END;

    DECLARE @RegisteredList varchar(50);
    SELECT @RegisteredList = MIN(A.[list])
    FROM dbo.WA_API AS A
    WHERE LOWER(LTRIM(RTRIM(A.[func]))) = 'view'
      AND LOWER(LTRIM(RTRIM(A.[list]))) = LOWER(LTRIM(RTRIM(@Source)))
    GROUP BY A.[list]
    HAVING COUNT(*) = 1;

    IF @RegisteredList IS NOT NULL
    BEGIN
        SELECT
            'REGISTERED_API' AS LookupMode,
            CAST(0 AS bit) AS Blocked,
            'OK' AS DiagnosticCode,
            CAST(NULL AS nvarchar(500)) AS [Value],
            CAST(NULL AS nvarchar(500)) AS Display,
            @RegisteredList AS RegisteredList,
            @ValueColumn AS ValueColumn,
            @DisplayColumn AS DisplayColumn;
        RETURN;
    END;

    SELECT
        'BLOCKED' AS LookupMode,
        CAST(1 AS bit) AS Blocked,
        'LOOKUP_SOURCE_NOT_REGISTERED' AS DiagnosticCode,
        CAST(NULL AS nvarchar(500)) AS [Value],
        CAST(NULL AS nvarchar(500)) AS Display,
        CAST(NULL AS varchar(50)) AS RegisteredList,
        @ValueColumn AS ValueColumn,
        @DisplayColumn AS DisplayColumn;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_RollbackFieldContractV2; Input: sql/UnifiedContractRollout/12_ROLLBACK_MASS_ROLLOUT.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_RollbackFieldContractV2
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

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_SeedSafeFieldContractsV2; Input: sql/UnifiedContractRollout/03_CREATE_DISCOVERY_PROCEDURES.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_SeedSafeFieldContractsV2
    @UserName varchar(100) = 'SYSTEM_DISCOVERY'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
        THROW 54101, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;

    DECLARE @Candidates table
    (
        WebFormName varchar(100) NOT NULL,
        ERPFormID varchar(100) NULL,
        CurrentViewProcedure sysname NULL,
        CurrentSaveProcedure sysname NULL,
        CurrentDeleteProcedure sysname NULL,
        TableName sysname NULL,
        PrimaryKey sysname NULL,
        ViewRouteCount int NOT NULL,
        SaveRouteCount int NOT NULL,
        DeleteRouteCount int NOT NULL,
        FormRegistrationCount int NOT NULL,
        TableExists bit NOT NULL,
        PrimaryKeyExists bit NOT NULL,
        PrimaryKeyUnique bit NOT NULL,
        ResultSetDescribable bit NOT NULL,
        PhysicalFieldCount int NOT NULL,
        JoinFieldCount int NOT NULL,
        HasBranchScope bit NOT NULL,
        CurrentMutationType varchar(40) NOT NULL,
        SuggestedContractType varchar(40) NOT NULL,
        SuggestedRolloutStatus varchar(20) NOT NULL,
        BlockingReason nvarchar(500) NULL
    );

    INSERT INTO @Candidates
        EXEC dbo.API_Web_DiscoverFieldContractCandidatesV2;

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO dbo.WA_FieldContractRegistry
        (
            WebFormName, ERPFormID, PermissionFormName, ContractType,
            ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
            SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
            DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
            IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        SELECT
            C.WebFormName,
            COALESCE(C.ERPFormID, 'ERP_FORM_ALIAS_REQUIRES_REVIEW'),
            C.WebFormName,
            C.SuggestedContractType,
            C.TableName,
            C.PrimaryKey,
            C.WebFormName,
            CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY'
                THEN 'READ_ONLY' ELSE 'SAFE_TABLE_COLUMNS' END,
            CASE WHEN C.HasBranchScope = 1 THEN 'BRANCH_SCOPED' ELSE 'GLOBAL_REFERENCE' END,
            CASE WHEN C.SuggestedContractType = 'READ_ONLY' THEN 'NONE' ELSE 'AUTO_SCHEMA' END,
            C.SuggestedRolloutStatus,
            C.BlockingReason,
            2,
            1,
            SYSUTCDATETIME(),
            @UserName,
            SYSUTCDATETIME(),
            @UserName
        FROM @Candidates AS C
        WHERE NOT EXISTS
          (
              SELECT 1
              FROM dbo.WA_FieldContractRegistry AS R
              WHERE R.WebFormName = C.WebFormName
          );

        /*
          Chỉ làm mới bản ghi vẫn hoàn toàn do discovery sở hữu. Kết quả được
          tính lại từ schema và route hiện tại nên contract cũ từng DEFERRED hoặc
          BLOCKED có thể chuyển sang SHADOW sau khi nguyên nhân đã được xử lý.
          Bản ghi do quản trị viên sửa thủ công vẫn không bị ghi đè.
        */
        UPDATE R
        SET ContractType = C.SuggestedContractType,
            ExpectedTableName = C.TableName,
            ExpectedPrimaryKey = C.PrimaryKey,
            ViewProcedure = CASE WHEN C.SuggestedContractType = 'SIMPLE_TABLE'
                THEN N'API_TruyVanDong_V2' ELSE NULLIF(C.CurrentViewProcedure, N'') END,
            SaveProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_LuuDong_V2' ELSE NULL END,
            DeleteProcedure = CASE
                WHEN C.SuggestedContractType IN ('SIMPLE_TABLE', 'JOIN_VIEW_SINGLE_TABLE')
                THEN N'API_XoaDong_V2' ELSE NULL END,
            RolloutStatus = C.SuggestedRolloutStatus,
            RolloutReason = C.BlockingReason,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        FROM dbo.WA_FieldContractRegistry AS R
        INNER JOIN @Candidates AS C
          ON C.WebFormName = R.WebFormName
        WHERE R.CreatedBy = 'SYSTEM_DISCOVERY'
          AND R.UpdatedBy IN ('SYSTEM_DISCOVERY', @UserName);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT ContractType, RolloutStatus, COUNT(*) AS FormCount
    FROM dbo.WA_FieldContractRegistry
    GROUP BY ContractType, RolloutStatus
    ORDER BY ContractType, RolloutStatus;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_Web_UpdateFieldFormat; Input: sql/FieldSyncPhase1/02_CREATE_UPDATE_FIELD_FORMAT_PROC.sql */
CREATE OR ALTER PROCEDURE dbo.API_Web_UpdateFieldFormat
    @WebFormName varchar(100) = NULL,
    @FieldName varchar(128),
    @CaptionVN nvarchar(250) = NULL,
    @CaptionEN nvarchar(250) = NULL,
    @CaptionCH nvarchar(250) = NULL,
    @FormatID varchar(50) = NULL,
    @AlignX varchar(10) = NULL,
    @MinWidth int = 0,
    @MaxWidth int = 0,
    @UserName varchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        SET @WebFormName = LEFT(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), 100);
        SET @FieldName = LEFT(LTRIM(RTRIM(ISNULL(@FieldName, ''))), 128);
        SET @CaptionVN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionVN, ''))), 250);
        SET @CaptionEN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionEN, ''))), 250);
        SET @CaptionCH = LEFT(LTRIM(RTRIM(ISNULL(@CaptionCH, ''))), 250);
        SET @FormatID = LEFT(LTRIM(RTRIM(ISNULL(@FormatID, ''))), 50);

        -- Chuẩn hóa AlignX về dạng R / L / C hoặc cắt max 10 ký tự
        DECLARE @RawAlign varchar(10) = LTRIM(RTRIM(ISNULL(@AlignX, '')));
        IF LOWER(@RawAlign) IN ('right', 'r', 'phải') SET @AlignX = 'R';
        ELSE IF LOWER(@RawAlign) IN ('left', 'l', 'trái') SET @AlignX = 'L';
        ELSE IF LOWER(@RawAlign) IN ('center', 'c', 'giữa') SET @AlignX = 'C';
        ELSE SET @AlignX = LEFT(@RawAlign, 10);

        SET @MinWidth = ISNULL(@MinWidth, 0);
        SET @MaxWidth = ISNULL(@MaxWidth, 0);

        IF @FieldName = ''
        BEGIN
            SELECT CAST(0 AS bit) AS Success, N'Tên trường (FieldName) không được để trống.' AS Message;
            RETURN;
        END;

        -- 1. Ưu tiên UPDATE nếu tồn tại bản ghi khớp cả FormName lẫn FieldName
        IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName)
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND LOWER(ISNULL(FormName, '')) = LOWER(@WebFormName);
        END
        -- 2. Ngược lại UPDATE nếu tồn tại bản ghi chung (FormName IS NULL hoặc rỗng)
        ELSE IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '')
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName)
              AND (FormName IS NULL OR LTRIM(RTRIM(FormName)) = '');
        END
        -- 3. Cập nhật bất kỳ bản ghi nào theo FieldName
        ELSE IF EXISTS (
            SELECT 1
            FROM dbo.SY_FmtFldTbl
            WHERE LOWER(FieldName) = LOWER(@FieldName)
        )
        BEGIN
            UPDATE dbo.SY_FmtFldTbl
            SET CaptionVN = CASE WHEN @CaptionVN <> '' THEN @CaptionVN ELSE CaptionVN END,
                CaptionEN = CASE WHEN @CaptionEN <> '' THEN @CaptionEN ELSE CaptionEN END,
                CaptionCH = CASE WHEN @CaptionCH <> '' THEN @CaptionCH ELSE CaptionCH END,
                FormatID = @FormatID,
                AlignX = @AlignX,
                MinWidth = @MinWidth,
                MaxWidth = @MaxWidth
            WHERE LOWER(FieldName) = LOWER(@FieldName);
        END
        -- 4. Nếu chưa từng có, INSERT bản ghi mới
        ELSE
        BEGIN
            INSERT INTO dbo.SY_FmtFldTbl (
                FormName, FieldName, CaptionVN, CaptionEN, CaptionCH, FormatID, AlignX, MinWidth, MaxWidth
            )
            VALUES (
                NULLIF(@WebFormName, ''), @FieldName, @CaptionVN, @CaptionEN, @CaptionCH, @FormatID, @AlignX, @MinWidth, @MaxWidth
            );
        END;

        SELECT
            CAST(1 AS bit) AS Success,
            N'Đã cập nhật tiêu đề và định dạng cột thành công.' AS Message,
            @FieldName AS FieldName,
            @CaptionVN AS CaptionVN,
            @CaptionEN AS CaptionEN,
            @CaptionCH AS CaptionCH,
            @FormatID AS FormatID,
            @AlignX AS AlignX,
            @MinWidth AS MinWidth,
            @MaxWidth AS MaxWidth;
    END TRY
    BEGIN CATCH
        SELECT
            CAST(0 AS bit) AS Success,
            ERROR_MESSAGE() AS Message,
            @FieldName AS FieldName;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_XoaDong_V2; Input: sql/UnifiedContractRollout/09_UPDATE_DELETE_V2.sql */
CREATE OR ALTER PROCEDURE dbo.API_XoaDong_V2
    @List varchar(50),
    @Ids nvarchar(max) = N'',
    @UserName varchar(100) = '',
    @Data nvarchar(max) = N'',
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @RowsAffected int = 0;
    SET @List = LTRIM(RTRIM(ISNULL(@List, '')));
    SET @Ids = LTRIM(RTRIM(ISNULL(@Ids, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));
    SET @Data = LTRIM(RTRIM(ISNULL(@Data, N'')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, '')));

    DECLARE
        @ExpectedTable sysname,
        @PrimaryKey sysname,
        @ExpectedDelete sysname,
        @DeletePolicy varchar(40),
        @EnableDelete bit,

        @PermissionFormName varchar(100),

        @GlobalReferenceOnly bit,
        @BranchPolicy varchar(40);

    SELECT
        @ExpectedTable = R.ExpectedTableName,
        @PrimaryKey = R.ExpectedPrimaryKey,
        @ExpectedDelete = R.DeleteV2,
        @DeletePolicy = R.DeletePolicy,
        @EnableDelete = R.EnableDelete,

        @PermissionFormName = R.PermissionFormName,

        @GlobalReferenceOnly = R.GlobalReferenceOnly,
        @BranchPolicy = R.BranchPolicy

    FROM dbo.API_Phase3SimpleCrudRegistry() AS R
    WHERE R.WebFormName COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    SET @PermissionFormName = LTRIM(RTRIM(ISNULL(@PermissionFormName, @List)));

    IF @ExpectedTable IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_FORM_NOT_ALLOWLISTED_FOR_DELETE' AS msg, 0 AS rowsAffected,
               CAST('BLOCKED' AS varchar(20)) AS deleteMode;
        RETURN;
    END;

    IF @EnableDelete <> 1
       OR @DeletePolicy COLLATE DATABASE_DEFAULT <> 'AUTO_SCHEMA' COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_BLOCKED_BY_POLICY' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF @ExpectedDelete COLLATE DATABASE_DEFAULT <> OBJECT_NAME(@@PROCID) COLLATE DATABASE_DEFAULT
       OR @UserName = ''
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_CONTRACT_OR_ACTOR_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF @Data = N'' SET @Data = N'{}';
    IF ISJSON(@Data) <> 1 OR LEFT(@Data, 1) <> N'{'
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_JSON_OBJECT_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF DATALENGTH(@Ids) > 4000
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_IDS_TOO_LONG' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF ISJSON(@Ids) <> 1 OR LEFT(@Ids, 1) <> N'['
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_IDS_JSON_ARRAY_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @RouteCount int;
    SELECT @RouteCount = COUNT(*)
    FROM dbo.WA_API AS A
    WHERE A.[list] COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT
      AND A.[func] COLLATE DATABASE_DEFAULT = 'Delete' COLLATE DATABASE_DEFAULT
      AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) COLLATE DATABASE_DEFAULT = @ExpectedDelete COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RouteCount, 0) <> 1
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ROUTE_NOT_UNIQUE' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @RegisteredTable sysname, @RegisteredPrimaryKey sysname, @RegistrationCount int;
    SELECT
        @RegistrationCount = COUNT(*),
        @RegisteredTable = MIN(CONVERT(sysname, LTRIM(RTRIM(L.TableName)))),
        @RegisteredPrimaryKey = MIN(CONVERT(sysname, LTRIM(RTRIM(L.PrimaryKey))))
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID COLLATE DATABASE_DEFAULT = @List COLLATE DATABASE_DEFAULT;

    IF ISNULL(@RegistrationCount, 0) <> 1
       OR @RegisteredTable COLLATE DATABASE_DEFAULT <> @ExpectedTable COLLATE DATABASE_DEFAULT
       OR @RegisteredPrimaryKey COLLATE DATABASE_DEFAULT <> @PrimaryKey COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_PRIMARY_KEY_CONTRACT_MISMATCH' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @ExpectedTable, N'U');
    IF @ObjectID IS NULL OR NOT EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_TABLE_OR_PRIMARY_KEY_NOT_FOUND' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @BranchColumn sysname = NULL;
    SELECT TOP (1) @BranchColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
    ORDER BY CASE LOWER(C.name)
        WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2 WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

    SET @BranchPolicy = UPPER(LTRIM(RTRIM(ISNULL(@BranchPolicy, 'AUTO_SCHEMA'))));
    IF @BranchPolicy = 'AUTO_SCHEMA'
        SET @BranchPolicy = CASE WHEN @BranchColumn IS NULL THEN 'GLOBAL_REFERENCE' ELSE 'BRANCH_SCOPED' END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS I
        INNER JOIN sys.index_columns AS IC
          ON IC.object_id = I.object_id AND IC.index_id = I.index_id AND IC.key_ordinal > 0
        WHERE I.object_id = @ObjectID AND I.is_unique = 1 AND I.is_disabled = 0
        GROUP BY I.index_id
        HAVING COUNT(*) = 1 AND MAX(IC.column_id) = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_PRIMARY_KEY_NOT_PROVEN_UNIQUE' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE
        @IsDeletedColumn sysname,
        @IsDeletedType sysname,
        @IsDeletedIsComputed bit,
        @DeletedByColumn sysname,
        @DeletedDateColumn sysname,
        @DeleteMode varchar(20);

    SELECT TOP (1)
        @IsDeletedColumn = C.name,
        @IsDeletedType = T.name,
        @IsDeletedIsComputed = C.is_computed
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT = 'isdeleted' COLLATE DATABASE_DEFAULT;

    IF @IsDeletedColumn IS NOT NULL
       AND (
            LOWER(ISNULL(@IsDeletedType, '')) COLLATE DATABASE_DEFAULT <> 'bit' COLLATE DATABASE_DEFAULT
            OR ISNULL(@IsDeletedIsComputed, 0) = 1
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_INVALID_ISDELETED_TYPE' AS msg, 0 AS rowsAffected,
               CAST('INVALID_ISDELETED_TYPE' AS varchar(40)) AS deleteMode;
        RETURN;
    END;

    SET @DeleteMode = CASE WHEN @IsDeletedColumn IS NULL THEN 'HARD' ELSE 'SOFT' END;

    IF @GlobalReferenceOnly = 1 AND @BranchColumn IS NOT NULL
       AND EXISTS (
        SELECT 1 FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('branchid', 'tenantid', 'companyid', 'donviid')
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_BRANCH_POLICY_REQUIRES_REVIEW' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @DataActor varchar(100), @DataBranch nvarchar(max);
    SELECT TOP (1) @DataActor = NULLIF(LTRIM(RTRIM(CONVERT(varchar(100), J.[value]))), '')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'username' COLLATE DATABASE_DEFAULT;
    SELECT TOP (1) @DataBranch = NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(max), J.[value]))), N'')
    FROM OPENJSON(@Data) AS J
    WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT = 'branchid' COLLATE DATABASE_DEFAULT;

    IF @DataActor IS NOT NULL AND @DataActor COLLATE DATABASE_DEFAULT <> @UserName COLLATE DATABASE_DEFAULT
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_SPOOF_REJECTED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1 FROM OPENJSON(@Data) AS J
        WHERE LOWER(J.[key]) COLLATE DATABASE_DEFAULT NOT IN ('username', 'branchid', 'ids')
          AND LOWER(J.[key]) COLLATE DATABASE_DEFAULT <> LOWER(@PrimaryKey) COLLATE DATABASE_DEFAULT
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_UNKNOWN_JSON_FIELD' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE @UserGroupID varchar(50), @UserBranches varchar(max);
    SELECT @UserGroupID = U.UserGroupID, @UserBranches = U.BranchID
    FROM dbo.SY_User AS U
    WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
      AND ISNULL(U.Disable, 0) = 0;

    IF @UserGroupID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTOR_INVALID_OR_DISABLED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF (@BranchPolicy = 'LEGACY_GLOBAL_REFERENCE' OR @BranchPolicy = 'BRANCH_SCOPED')
       AND LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@UserBranches, ''))) = '' OR @BranchID = ''
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_REQUIRED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
        IF EXISTS (
            SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS Requested
            WHERE LTRIM(RTRIM(Requested.[value])) <> ''
              AND NOT EXISTS (
                  SELECT 1 FROM STRING_SPLIT(@UserBranches, ',') AS Allowed
                  WHERE LTRIM(RTRIM(Allowed.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
              )
        )
        BEGIN
            SELECT -1 AS code, N'PHASE3_BRANCH_CONTEXT_DENIED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
    END;

    IF @DataBranch IS NOT NULL AND @BranchID <> '' AND EXISTS (
        SELECT 1 FROM STRING_SPLIT(@DataBranch, ',') AS Requested
        WHERE LTRIM(RTRIM(Requested.[value])) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM STRING_SPLIT(@BranchID, ',') AS ContextBranch
              WHERE LTRIM(RTRIM(ContextBranch.[value])) COLLATE DATABASE_DEFAULT = LTRIM(RTRIM(Requested.[value])) COLLATE DATABASE_DEFAULT
          )
    )
    BEGIN
        SELECT -1 AS code, N'PHASE3_JSON_BRANCH_CONTEXT_DENIED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    DECLARE
        @MenuID varchar(50),
        @SkipPermission bit = 0,
        @GroupCanRun bit = 0,
        @GroupCanDelete bit = 0;

    SELECT
        @MenuID = P.MenuID,
        @SkipPermission = P.SkipPermission,
        @GroupCanRun = P.CanView,
        @GroupCanDelete = P.CanDelete
    FROM dbo.API_Web_GroupFormPermissionV2
        (@UserGroupID, @PermissionFormName) AS P;

    IF @MenuID IS NULL
    BEGIN
        SELECT -1 AS code, N'PHASE3_ACTIVE_MENU_REQUIRED' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    IF LOWER(@UserGroupID) COLLATE DATABASE_DEFAULT <> 'admin' COLLATE DATABASE_DEFAULT AND @SkipPermission = 0
    BEGIN
        IF ISNULL(@GroupCanRun, 0) <> 1
           OR ISNULL(@GroupCanDelete, 0) <> 1
        BEGIN
            SELECT -1 AS code, N'PHASE3_DELETE_PERMISSION_DENIED' AS msg, 0 AS rowsAffected,
                   @DeletePolicy AS deleteMode;
            RETURN;
        END;
    END;

    DECLARE @RequestedCount int = (SELECT COUNT(*) FROM OPENJSON(@Ids));
    IF @RequestedCount = 0 OR @RequestedCount > 100
       OR EXISTS (
           SELECT 1
           FROM OPENJSON(@Ids) AS J
           WHERE J.[type] NOT IN (1, 2, 3)
              OR LTRIM(RTRIM(CONVERT(nvarchar(4000), J.[value]))) = N''
       )
       OR EXISTS (
           SELECT CONVERT(nvarchar(4000), J.[value]) COLLATE DATABASE_DEFAULT
           FROM OPENJSON(@Ids) AS J
           GROUP BY CONVERT(nvarchar(4000), J.[value]) COLLATE DATABASE_DEFAULT
           HAVING COUNT(*) > 1
       )
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ID_COUNT_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    CREATE TABLE #DeleteIds
    (
        IdValue nvarchar(4000) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY
    );
    INSERT INTO #DeleteIds (IdValue)
    SELECT CONVERT(nvarchar(4000), J.[value])
    FROM OPENJSON(@Ids) AS J;

    DECLARE @PrimarySqlType nvarchar(256), @PrimaryKeyHasCollation bit = 0;
    SELECT
        @PrimarySqlType = T.name + CASE
        WHEN T.name IN ('varchar', 'char') THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length) END + ')'
        WHEN T.name IN ('nvarchar', 'nchar') THEN '(' + CASE WHEN C.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), C.max_length / 2) END + ')'
        WHEN T.name IN ('decimal', 'numeric') THEN '(' + CONVERT(varchar(10), C.[precision]) + ',' + CONVERT(varchar(10), C.scale) + ')'
        ELSE '' END,
        @PrimaryKeyHasCollation = CONVERT(bit, CASE WHEN C.collation_name IS NULL THEN 0 ELSE 1 END)
    FROM sys.columns AS C
    INNER JOIN sys.types AS T ON T.user_type_id = C.user_type_id
    WHERE C.object_id = @ObjectID
      AND C.name COLLATE DATABASE_DEFAULT = @PrimaryKey COLLATE DATABASE_DEFAULT;

    DECLARE @InvalidCount int = 0, @Sql nvarchar(max);
    SET @Sql = N'SELECT @Bad = COUNT(*) FROM #DeleteIds WHERE TRY_CONVERT(' + @PrimarySqlType + N', IdValue) IS NULL;';
    EXEC sys.sp_executesql @Sql, N'@Bad int OUTPUT', @Bad = @InvalidCount OUTPUT;
    IF @InvalidCount > 0
    BEGIN
        SELECT -1 AS code, N'PHASE3_DELETE_ID_TYPE_INVALID' AS msg, 0 AS rowsAffected,
               @DeletePolicy AS deleteMode;
        RETURN;
    END;

    SELECT TOP (1) @DeletedByColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('deletedby', 'userdelete', 'deleteby')
    ORDER BY C.column_id;
    SELECT TOP (1) @DeletedDateColumn = C.name
    FROM sys.columns AS C
    WHERE C.object_id = @ObjectID
      AND LOWER(C.name) COLLATE DATABASE_DEFAULT IN ('deleteddate', 'deletedat', 'datedelete')
    ORDER BY C.column_id;

    DECLARE @UpdateSet nvarchar(max) = N'';
    IF @DeleteMode = 'SOFT'
    BEGIN
        SET @UpdateSet = N'T.' + QUOTENAME(@IsDeletedColumn) + N' = 1';
        IF @DeletedByColumn IS NOT NULL
            SET @UpdateSet += N', T.' + QUOTENAME(@DeletedByColumn) + N' = @Actor';
        IF @DeletedDateColumn IS NOT NULL
            SET @UpdateSet += N', T.' + QUOTENAME(@DeletedDateColumn) + N' = SYSUTCDATETIME()';
    END;

    DECLARE @BranchScopePredicate nvarchar(2000) = N'';
    IF @BranchPolicy = 'BRANCH_SCOPED' AND @BranchColumn IS NOT NULL
        SET @BranchScopePredicate = N'
                AND (
                    LOWER(@UserGroupID) = ''admin''
                    OR EXISTS (
                        SELECT 1 FROM STRING_SPLIT(@BranchID, '','') AS AllowedBranch
                        WHERE LTRIM(RTRIM(AllowedBranch.[value])) <> ''''
                          AND LTRIM(RTRIM(AllowedBranch.[value])) COLLATE DATABASE_DEFAULT
                              = CONVERT(nvarchar(4000), T.' + QUOTENAME(@BranchColumn) + N') COLLATE DATABASE_DEFAULT
                    )
                )';

    BEGIN TRY
        BEGIN TRANSACTION;
        IF @DeleteMode = 'SOFT'
        BEGIN
            SET @Sql = N'
                UPDATE T SET ' + @UpdateSet + N'
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey)
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue)'
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END + N'
                WHERE ISNULL(T.' + QUOTENAME(@IsDeletedColumn) + N', 0) = 0'
                  + @BranchScopePredicate + N';
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@Actor varchar(100), @OutRows int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
                @Actor = @UserName,
                @OutRows = @RowsAffected OUTPUT,
                @BranchID = @BranchID,
                @UserGroupID = @UserGroupID;
        END
        ELSE
        BEGIN
            SET @Sql = N'
                DELETE T
                FROM dbo.' + QUOTENAME(@ExpectedTable) + N' AS T
                INNER JOIN #DeleteIds AS I
                  ON T.' + QUOTENAME(@PrimaryKey)
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' = TRY_CONVERT(' + @PrimarySqlType + N', I.IdValue)'
                  + CASE WHEN @PrimaryKeyHasCollation = 1 THEN N' COLLATE DATABASE_DEFAULT' ELSE N'' END
                  + N' WHERE 1 = 1' + @BranchScopePredicate + N';
                SET @OutRows = @@ROWCOUNT;';

            EXEC sys.sp_executesql
                @Sql,
                N'@OutRows int OUTPUT, @BranchID varchar(max), @UserGroupID varchar(50)',
                @OutRows = @RowsAffected OUTPUT,
                @BranchID = @BranchID,
                @UserGroupID = @UserGroupID;
        END;

        IF @RowsAffected <> @RequestedCount
        BEGIN
            IF @DeleteMode = 'SOFT'
                THROW 53420, N'PHASE3_SOFT_DELETE_MUST_AFFECT_ALL_REQUESTED_ROWS', 1;
            THROW 53421, N'PHASE3_HARD_DELETE_MUST_AFFECT_ALL_REQUESTED_ROWS', 1;
        END;

        COMMIT TRANSACTION;
        SELECT
            0 AS code,
            CASE WHEN @DeleteMode = 'SOFT' THEN N'Xóa mềm V2 thành công.'
                 ELSE N'Xóa cứng V2 thành công.' END AS msg,
            @RowsAffected AS rowsAffected,
            @DeleteMode AS deleteMode;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SELECT
            -1 AS code,
            N'PHASE3_' + @DeleteMode + N'_DELETE_FAILED_' + CONVERT(nvarchar(20), ERROR_NUMBER()) AS msg,
            0 AS rowsAffected,
            @DeleteMode AS deleteMode;
    END CATCH;
END;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/05_FrameworkProcedures/001_canonical_framework_procedures.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/07_Dashboard/001_dashboard_procedures.sql | SHA-256: 491d0837ed372d0d2c4c25e20ad3c83278419ccf8eeca6e16d3ffde3a4b30175 ===== */
/*
  Dashboard procedures backend gọi trực tiếp
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Birthdays; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Birthdays
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (15)
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'') + ')' AS empName,
        CONVERT(varchar(5), P.NgaySinh, 103) AS birthdayDate,
        DAY(P.NgaySinh) AS birthDay
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE MONTH(P.NgaySinh) = MONTH(GETDATE())
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    ORDER BY DAY(P.NgaySinh), P.PersonName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_ContractsExpiring; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_ContractsExpiring
    @Days int = 30,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (10)
        P.PersonName + ' (' + ISNULL(D.TenPhongBan, N'Chưa rõ') + ')' AS empName,
        CONVERT(varchar(10), H.NgayHetHieuLuc, 103) AS expireDate,
        P.PersonID AS empCode,
        CASE
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 7 THEN 'danger'
            WHEN DATEDIFF(DAY, GETDATE(), H.NgayHetHieuLuc) <= 15 THEN 'warning'
            ELSE 'info'
        END AS statusLevel
    FROM dbo.HR_HopDongTbl AS H
    INNER JOIN dbo.HR_PersonTbl AS P
        ON H.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE H.NgayHetHieuLuc BETWEEN GETDATE() AND DATEADD(DAY, @Days, GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    ORDER BY H.NgayHetHieuLuc;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Demographics; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Demographics
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        'Gender' AS groupType,
        CASE
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY
        CASE
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nam', N'Naam', 'Nam', 'Naam') THEN N'Nam'
            WHEN LTRIM(RTRIM(P.GioiTinh)) IN (N'Nữ', N'Nư', N'Nu', 'Nữ', 'Nư', 'Nu') THEN N'Nữ'
            ELSE N'Chưa cập nhật'
        END

    UNION ALL

    SELECT
        'Age' AS groupType,
        CASE
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND P.NgaySinh IS NOT NULL
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY
        CASE
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) < 25 THEN N'Dưới 25 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 25 AND 35 THEN N'25 - 35 tuổi'
            WHEN DATEDIFF(YEAR, P.NgaySinh, GETDATE()) BETWEEN 36 AND 45 THEN N'36 - 45 tuổi'
            ELSE N'Trên 45 tuổi'
        END

    UNION ALL

    SELECT
        'Contract' AS groupType,
        ISNULL(H.LoaiHopDong, N'Chưa có HĐ') AS label,
        COUNT_BIG(1) AS [value]
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_HopDongTbl AS H
        ON H.MaHopDong =
        (
            SELECT TOP (1) Latest.MaHopDong
            FROM dbo.HR_HopDongTbl AS Latest
            WHERE Latest.PersonID = P.PersonID
            ORDER BY Latest.NgayKyHopDong DESC
        )
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY H.LoaiHopDong;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Department; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Department
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        'Dept' AS groupType,
        ISNULL(D.TenPhongBan, ISNULL(P.PhongBan, N'Chưa rõ')) AS label,
        COUNT_BIG(P.PersonID) AS [value]
    FROM dbo.HR_PersonTbl AS P
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON D.PhongBan = P.PhongBan
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY D.TenPhongBan, P.PhongBan

    UNION ALL

    SELECT
        'Branch' AS groupType,
        ISNULL(B.BranchName, B.BranchID) AS label,
        COUNT_BIG(P.PersonID) AS [value]
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
        ON Allowed.BranchID = B.BranchID
    LEFT JOIN dbo.HR_PersonTbl AS P
        ON P.BranchID = B.BranchID
       AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > GETDATE())
    GROUP BY B.BranchName, B.BranchID
    ORDER BY groupType, [value] DESC;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_GetBranches; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_GetBranches
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        B.BranchID AS [value],
        ISNULL(B.BranchName, B.BranchID) AS label
    FROM dbo.CF_BranchTbl AS B
    INNER JOIN dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
        ON Allowed.BranchID = B.BranchID
    ORDER BY B.BranchName, B.BranchID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_OverviewToday; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_OverviewToday
    @Date date = NULL,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Date IS NULL SET @Date = GETDATE();

    DECLARE
        @TotalHeadcount int = 0,
        @Present int = 0,
        @Late int = 0,
        @Absent int = 0,
        @NewHires int = 0,
        @ProbationExpiring int = 0;

    SELECT @TotalHeadcount = COUNT_BIG(1)
    FROM dbo.HR_PersonTbl AS P
    WHERE (P.NgayNghiViec IS NULL OR P.NgayNghiViec > @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT
        @Present = COUNT_BIG(1),
        @Late = ISNULL(SUM(CASE WHEN T.GioVao > '08:00' THEN 1 ELSE 0 END), 0)
    FROM dbo.HR_TimeSheetDayTbl AS T
    INNER JOIN dbo.HR_PersonTbl AS P
        ON T.PersonID = P.PersonID
    WHERE T.Ngay = @Date
      AND (P.NgayNghiViec IS NULL OR P.NgayNghiViec > @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SET @Present = ISNULL(@Present, 0);
    SET @Absent = @TotalHeadcount - @Present;
    IF @Absent < 0 SET @Absent = 0;

    SELECT @NewHires = COUNT_BIG(1)
    FROM dbo.HR_PersonTbl AS P
    WHERE MONTH(P.NgayVaoLam) = MONTH(@Date)
      AND YEAR(P.NgayVaoLam) = YEAR(@Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT @ProbationExpiring = COUNT_BIG(1)
    FROM dbo.HR_HopDongTbl AS H
    INNER JOIN dbo.HR_PersonTbl AS P
        ON H.PersonID = P.PersonID
    WHERE H.NgayHetHieuLuc BETWEEN @Date AND DATEADD(DAY, 7, @Date)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT
        @TotalHeadcount AS totalHeadcount,
        @Present AS present,
        @Late AS late,
        @Absent AS absent,
        @NewHires AS newHires,
        @ProbationExpiring AS probationExpiring;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HR_Dashboard_Payroll; Input: sql/API/APINEW/API_Dashboard_MultiTemplate.sql */
CREATE OR ALTER PROCEDURE dbo.API_HR_Dashboard_Payroll
    @PeriodID varchar(20) = NULL,
    @UserName varchar(50) = '',
    @BranchID nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PeriodID IS NULL OR @PeriodID = ''
        SET @PeriodID = FORMAT(GETDATE(), 'yyyyMM');

    DECLARE @PreviousPeriodID varchar(20) = NULL;

    SELECT TOP (1)
        @PreviousPeriodID = PreviousPeriod.PeriodID
    FROM dbo.SY_Period AS CurrentPeriod
    INNER JOIN dbo.SY_Period AS PreviousPeriod
        ON PreviousPeriod.FromDate < CurrentPeriod.FromDate
    WHERE CurrentPeriod.PeriodID = @PeriodID
    ORDER BY PreviousPeriod.FromDate DESC;

    IF @PreviousPeriodID IS NULL
    BEGIN
        SELECT TOP (1)
            @PreviousPeriodID = PR.PeriodID
        FROM dbo.HR_PayrollTbl AS PR
        WHERE PR.PeriodID < @PeriodID
        ORDER BY PR.PeriodID DESC;
    END;

    SELECT
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.TongLuong ELSE 0 END), 0) AS totalSalary,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.TongLuong ELSE 0 END), 0) AS prevTotalSalary,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.TienBuTru ELSE 0 END), 0) AS bonus,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.TienBuTru ELSE 0 END), 0) AS prevBonus,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PeriodID THEN PR.MucDong ELSE 0 END), 0) AS insurance,
        ISNULL(SUM(CASE WHEN PR.PeriodID = @PreviousPeriodID THEN PR.MucDong ELSE 0 END), 0) AS prevInsurance,
        COUNT(DISTINCT CASE WHEN PR.PeriodID = @PeriodID THEN PR.PersonID END) AS employeeCount
    FROM dbo.HR_PayrollTbl AS PR
    INNER JOIN dbo.HR_PersonTbl AS P
        ON PR.PersonID = P.PersonID
    WHERE PR.PeriodID IN (@PeriodID, @PreviousPeriodID)
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      );

    SELECT TOP (5)
        ISNULL(D.TenPhongBan, ISNULL(P.PhongBan, N'Khác')) AS label,
        SUM(PR.TongLuong) AS [value]
    FROM dbo.HR_PayrollTbl AS PR
    INNER JOIN dbo.HR_PersonTbl AS P
        ON PR.PersonID = P.PersonID
    LEFT JOIN dbo.HR_DepartmentListTbl AS D
        ON P.PhongBan = D.PhongBan
    WHERE PR.PeriodID = @PeriodID
      AND EXISTS
      (
          SELECT 1
          FROM dbo.API_HR_Dashboard_AuthorizedBranches(@UserName, @BranchID) AS Allowed
          WHERE Allowed.BranchID = P.BranchID
      )
    GROUP BY D.TenPhongBan, P.PhongBan
    ORDER BY [value] DESC;
END;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/07_Dashboard/001_dashboard_procedures.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/08_ExcelImport/001_excel_import_support.sql | SHA-256: 5b42b6b7fdc50b28f4484a2e86825817a5722e340290f48a4edad2a430ccc800 ===== */

/* Bulk Import dùng #temp table trong transaction; không tạo staging table lâu dài. */
SET NOCOUNT ON;
SELECT N'EXCEL_IMPORT_SUPPORT' AS SupportName,
       N'DIRECT_SQL_WITH_TEMP_TABLE_NO_PERSISTENT_OBJECT' AS Decision;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/08_ExcelImport/001_excel_import_support.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/09_DocumentsAndAttachments/001_document_attachment_decision.sql | SHA-256: 703925ec53a4be3e14825f9a2c23b2544cba98c51596dbeda953e20ea8c72917 ===== */

/* Document/attachment hiện dùng business WA_API route; giữ definition/route production. */
SET NOCOUNT ON;
SELECT N'DOCUMENT_AND_ATTACHMENT' AS Feature,N'KEEP_ORIGINAL_BUSINESS_ROUTES' AS Decision;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/09_DocumentsAndAttachments/001_document_attachment_decision.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/10_EContract/001_econtract_decision.sql | SHA-256: f93eb51c0bf627f2c3ba11de74acebb70bb58036affd66afa91c76eebb2903f6 ===== */

/* Không seed secret/config từ DB test. Source hiện tại không có caller VNPT eContract trực tiếp. */
SET NOCOUNT ON;
SELECT N'VNPT_ECONTRACT' AS Feature,N'REVIEW_REQUIRED_NOT_DEPLOYED' AS Decision;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/10_EContract/001_econtract_decision.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/06_BusinessProcedures/001_approved_business_procedures.sql | SHA-256: 77079c8c6b7944b0ad46fa96c21d1d8ff7f357a1d1cbec9474846f96fdd52bca ===== */
/*
  Business procedures có caller hiện tại và canonical source rõ ràng
  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_ComboPersonStatus; Input: sql/API/API_ComboPersonStatus.sql */
CREATE OR ALTER PROCEDURE dbo.API_ComboPersonStatus
(
    @Keyword NVARCHAR(200) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PersonStatus AS [Mã],
        PersonStatusName AS [Tên]
    FROM dbo.HR_PersonStatusTbl
    WHERE (@Keyword = '' OR PersonStatusName LIKE N'%' + @Keyword + '%')
    ORDER BY PersonStatus ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_DanhSachChucDanh; Input: sql/API/APINEW/API_DanhSachChucDanh.sql */
CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucDanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT
        ChucDanhChuyenMon,
        MoTa
    FROM HR_ChucDanhTbl
    WHERE
        @Keyword = ''
        OR ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
        OR MoTa LIKE N'%' + @Keyword + '%'
    ORDER BY ChucDanhChuyenMon;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_Attach; Input: sql/API/APINEW/API_HopDongLaoDong_Attach.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        MaHopDong,
        FileName,
        FileType,
        STT,
        FileSize,
        Content
    FROM dbo.HR_HopDongAttachTbl
    WHERE MaHopDong = @MaHopDong
    ORDER BY STT ASC, UserAutoID DESC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_ChiTiet; Input: sql/API/APINEW/API_HopDongLaoDong_ChiTiet.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_ChiTiet
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        D.UserAutoID,
        D.MaHopDong,
        D.MaPhuCap,
        ISNULL(D.TenPhuCap, P.TenPhuCap) AS TenPhuCap,
        D.TienPhuCap,
        P.TienPhuCapNgay,
        P.TienPhuCapThang,
        D.GhiChu
    FROM dbo.HR_HopDongDetailTbl D
    LEFT JOIN dbo.HR_BangPhuCapTbl P ON D.MaPhuCap = P.MaPhuCap
    WHERE D.MaHopDong = @MaHopDong
    ORDER BY D.MaPhuCap ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_LoaiHD; Input: sql/API/APINEW/API_HopDongLaoDong_LoaiHD.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_LoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        LoaiHD
    FROM dbo.HR_HopDongTbl
    WHERE LoaiHD IS NOT NULL AND LoaiHD <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong_NamLap; Input: sql/API/APINEW/API_HopDongLaoDong_NamLap.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NamLap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        NamLap
    FROM dbo.HR_HopDongTbl
    WHERE NamLap IS NOT NULL
      AND (@Keyword = '' OR CAST(NamLap AS NVARCHAR(50)) LIKE '%' + @Keyword + '%')
    ORDER BY NamLap DESC;
END
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_Attach; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_Attach]
(
    @DocumentID VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserAutoID,
        DocumentID,
        FileName,
        FileType,
        STT,
        FileSize,
        Content
    FROM dbo.HR_NghiPhepAttachTbl
    WHERE DocumentID = @DocumentID
    ORDER BY STT ASC, UserAutoID DESC;
END
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_Attach_Save; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_Attach_Save]
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @UserAutoID VARCHAR(50) = NULLIF(JSON_VALUE(@Data, '$.UserAutoID'), '');
        DECLARE @DocumentID NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.DocumentID'), N'');
        DECLARE @FileName NVARCHAR(500) = NULLIF(JSON_VALUE(@Data, '$.FileName'), N'');
        DECLARE @FileType INT = TRY_CONVERT(INT, JSON_VALUE(@Data, '$.FileType'));
        DECLARE @STT NVARCHAR(100) = NULLIF(JSON_VALUE(@Data, '$.STT'), N'');
        DECLARE @FileSize DECIMAL(18, 0) = TRY_CONVERT(DECIMAL(18, 0), JSON_VALUE(@Data, '$.FileSize'));
        DECLARE @ContentText NVARCHAR(MAX) = (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Content');
        DECLARE @Base64Content VARCHAR(MAX) = TRY_CONVERT(VARCHAR(MAX), (SELECT value FROM OPENJSON(@Data) WHERE [key] = 'Base64Content'));
        DECLARE @Content VARBINARY(MAX) = NULL;
        DECLARE @BranchID VARCHAR(50);
        DECLARE @UserBranchID VARCHAR(500);
        DECLARE @UserGroupID VARCHAR(50);
        DECLARE @MenuID NVARCHAR(50);

        IF @DocumentID IS NULL OR @FileName IS NULL OR ISJSON(@Data) <> 1
            THROW 51800, N'Dữ liệu file đính kèm không hợp lệ.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.HR_NghiPhepTbl WHERE DocumentID = @DocumentID)
            THROW 51801, N'Đơn nghỉ phép không tồn tại.', 1;

        SELECT @BranchID = P.BranchID
        FROM dbo.HR_NghiPhepTbl H
        LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = H.PersonID
        WHERE H.DocumentID = @DocumentID;

        SELECT
            @UserBranchID = U.BranchID,
            @UserGroupID = U.UserGroupID
        FROM dbo.SY_User U
        WHERE U.UserName = @UserName;

        IF UPPER(ISNULL(@UserName, '')) <> 'ADMIN'
        BEGIN
            IF @UserGroupID IS NULL
                THROW 51802, N'Không xác định được quyền người dùng.', 1;

            SELECT TOP (1) @MenuID = MenuID
            FROM dbo.WA_Menu
            WHERE FormName = 'WA_DonXinNghiPhepFrm';

            IF @MenuID IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM dbo.WA_UserGroupPermisstion
                WHERE UserGroupID = @UserGroupID
                  AND MenuID = @MenuID
                  AND (ISNULL(IsAdd, 0) = 1 OR ISNULL(IsUpdate, 0) = 1)
            )
                THROW 51803, N'Bạn không có quyền lưu tài liệu đơn xin nghỉ phép.', 1;

            IF NULLIF(LTRIM(RTRIM(@UserBranchID)), '') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM STRING_SPLIT(@UserBranchID, ',')
                   WHERE UPPER(LTRIM(RTRIM(value))) = UPPER(ISNULL(@BranchID, ''))
               )
                THROW 51804, N'Bạn không có quyền lưu tài liệu của chi nhánh này.', 1;
        END;

        IF @UserAutoID IS NULL
            SET @UserAutoID = LOWER(CONVERT(VARCHAR(36), NEWID()));

        IF @STT IS NULL
            SELECT @STT = CONVERT(NVARCHAR(100), ISNULL(MAX(TRY_CONVERT(INT, STT)), 0) + 1)
            FROM dbo.HR_NghiPhepAttachTbl WITH (UPDLOCK, HOLDLOCK)
            WHERE DocumentID = @DocumentID;

        IF @ContentText IS NOT NULL AND LTRIM(RTRIM(@ContentText)) <> N''
        BEGIN
            IF LOWER(LEFT(@ContentText, 2)) = N'0x'
                SET @Content = CONVERT(VARBINARY(MAX), @ContentText, 1);
            ELSE
                SET @Content = CAST(N'' AS XML).value('xs:base64Binary(sql:variable("@ContentText"))', 'varbinary(max)');
        END;

        IF EXISTS (SELECT 1 FROM dbo.HR_NghiPhepAttachTbl WHERE UserAutoID = @UserAutoID)
        BEGIN
            IF EXISTS (
                SELECT 1 FROM dbo.HR_NghiPhepAttachTbl
                WHERE UserAutoID = @UserAutoID AND DocumentID = @DocumentID
            )
            BEGIN
                SELECT 0 AS code, N'File đính kèm đã được lưu trước đó.' AS msg, @UserAutoID AS UserAutoID;
                RETURN;
            END;
            THROW 51805, N'UserAutoID đã tồn tại ở đơn nghỉ phép khác.', 1;
        END;

        INSERT INTO dbo.HR_NghiPhepAttachTbl (
            UserAutoID, DocumentID, FileName, FileType, STT, Content, FileSize, Base64Content
        )
        VALUES (
            @UserAutoID, @DocumentID, @FileName, ISNULL(@FileType, 0), @STT, @Content, @FileSize, @Base64Content
        );

        SELECT 0 AS code, N'Lưu file đính kèm thành công.' AS msg, @UserAutoID AS UserAutoID;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code, ERROR_MESSAGE() AS msg, NULL AS UserAutoID;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_SaoChepQuyenNhom; Input: sql/API/API_SaoChepQuyenNhom.sql */
IF OBJECT_ID(N'dbo.API_SaoChepQuyenNhom', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_SaoChepQuyenNhom AS SELECT 1');
GO

ALTER PROCEDURE dbo.API_SaoChepQuyenNhom
    @UserName nvarchar(100),
    @SourceUserGroupID nvarchar(50),
    @TargetUserGroupID nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, N'')));
    SET @SourceUserGroupID = LTRIM(RTRIM(ISNULL(@SourceUserGroupID, N'')));
    SET @TargetUserGroupID = LTRIM(RTRIM(ISNULL(@TargetUserGroupID, N'')));

    DECLARE @StartedTransaction bit = 0;

    BEGIN TRY
        DECLARE @ActorGroupID nvarchar(50);

        SELECT TOP (1) @ActorGroupID = U.UserGroupID
        FROM dbo.SY_User AS U
        WHERE U.UserName COLLATE DATABASE_DEFAULT = @UserName COLLATE DATABASE_DEFAULT
          AND ISNULL(U.Disable, 0) = 0;

        IF LOWER(ISNULL(@ActorGroupID, N'')) COLLATE DATABASE_DEFAULT <> N'admin' COLLATE DATABASE_DEFAULT
            THROW 52301, N'Chỉ nhóm Admin được phép copy quyền.', 1;

        IF @SourceUserGroupID = N'' OR @TargetUserGroupID = N''
            THROW 52302, N'Vui lòng chọn đầy đủ nhóm nguồn và nhóm đích.', 1;

        IF @SourceUserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
            THROW 52303, N'Nhóm nguồn và nhóm đích phải khác nhau.', 1;

        IF LOWER(@TargetUserGroupID) COLLATE DATABASE_DEFAULT = N'admin' COLLATE DATABASE_DEFAULT
            THROW 52304, N'Không cho phép ghi đè toàn bộ quyền của nhóm Admin.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SY_UserGroup AS G
            WHERE G.UserGroupID COLLATE DATABASE_DEFAULT = @SourceUserGroupID COLLATE DATABASE_DEFAULT
              AND ISNULL(G.IsDisable, 0) = 0
        )
            THROW 52305, N'Nhóm quyền nguồn không tồn tại hoặc đã bị khóa.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SY_UserGroup AS G
            WHERE G.UserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
              AND ISNULL(G.IsDisable, 0) = 0
        )
            THROW 52306, N'Nhóm quyền đích không tồn tại hoặc đã bị khóa.', 1;

        IF EXISTS
        (
            SELECT P.MenuID
            FROM dbo.WA_UserGroupPermisstion AS P
            WHERE P.UserGroupID COLLATE DATABASE_DEFAULT IN
                (@SourceUserGroupID COLLATE DATABASE_DEFAULT, @TargetUserGroupID COLLATE DATABASE_DEFAULT)
            GROUP BY P.UserGroupID, P.MenuID
            HAVING COUNT_BIG(*) > 1
        )
            THROW 52307, N'Dữ liệu quyền đang bị trùng MenuID; cần xử lý trước khi copy.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_Menu AS M
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NULLIF(LTRIM(RTRIM(M.MenuID)), N'') IS NOT NULL
              AND LEN(@TargetUserGroupID + N'_' + M.MenuID) > 50
        )
            THROW 52308, N'Mã nhóm và mã menu vượt quá giới hạn khóa quyền.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.WA_Menu AS M
            INNER JOIN dbo.WA_UserGroupPermisstion AS Existing
              ON Existing.ID COLLATE DATABASE_DEFAULT =
                 (@TargetUserGroupID + N'_' + M.MenuID) COLLATE DATABASE_DEFAULT
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM dbo.WA_UserGroupPermisstion AS TargetPermission
                  WHERE TargetPermission.UserGroupID COLLATE DATABASE_DEFAULT = @TargetUserGroupID COLLATE DATABASE_DEFAULT
                    AND TargetPermission.MenuID COLLATE DATABASE_DEFAULT = M.MenuID COLLATE DATABASE_DEFAULT
              )
              AND (
                  Existing.UserGroupID COLLATE DATABASE_DEFAULT <> @TargetUserGroupID COLLATE DATABASE_DEFAULT
                  OR Existing.MenuID COLLATE DATABASE_DEFAULT <> M.MenuID COLLATE DATABASE_DEFAULT
              )
        )
            THROW 52309, N'Khóa ID quyền đang thuộc bản ghi khác; không thể copy an toàn.', 1;

        IF @@TRANCOUNT = 0
        BEGIN
            BEGIN TRANSACTION;
            SET @StartedTransaction = 1;
        END
        ELSE
            SAVE TRANSACTION CopyPermissionSave;

        DECLARE @Changes table (ActionName nvarchar(10) NOT NULL);

        MERGE dbo.WA_UserGroupPermisstion WITH (HOLDLOCK) AS Target
        USING
        (
            SELECT
                M.MenuID,
                CONVERT(bit, ISNULL(SourcePermission.IsRun, 0)) AS IsRun,
                CONVERT(bit, ISNULL(SourcePermission.IsAdd, 0)) AS IsAdd,
                CONVERT(bit, ISNULL(SourcePermission.IsUpdate, 0)) AS IsUpdate,
                CONVERT(bit, ISNULL(SourcePermission.IsDelete, 0)) AS IsDelete,
                CONVERT(bit, ISNULL(SourcePermission.isManager, 0)) AS isManager,
                CONVERT(bit, ISNULL(SourcePermission.isAdmin, 0)) AS isAdmin,
                CONVERT(bit, ISNULL(SourcePermission.isAutoLock, 0)) AS isAutoLock,
                CONVERT(bit, ISNULL(SourcePermission.isHideAmount, 0)) AS isHideAmount,
                CONVERT(bit, ISNULL(SourcePermission.isLockDoc, 0)) AS isLockDoc,
                CONVERT(bit, ISNULL(SourcePermission.isUnLockDoc, 0)) AS isUnLockDoc,
                CONVERT(bit, ISNULL(SourcePermission.isExportExcel, 0)) AS isExportExcel
            FROM dbo.WA_Menu AS M
            LEFT JOIN dbo.WA_UserGroupPermisstion AS SourcePermission
              ON SourcePermission.UserGroupID COLLATE DATABASE_DEFAULT =
                 @SourceUserGroupID COLLATE DATABASE_DEFAULT
             AND SourcePermission.MenuID COLLATE DATABASE_DEFAULT =
                 M.MenuID COLLATE DATABASE_DEFAULT
            WHERE ISNULL(M.isDisable, 0) = 0
              AND NULLIF(LTRIM(RTRIM(M.MenuID)), N'') IS NOT NULL
        ) AS Source
          ON Target.UserGroupID COLLATE DATABASE_DEFAULT =
             @TargetUserGroupID COLLATE DATABASE_DEFAULT
         AND Target.MenuID COLLATE DATABASE_DEFAULT =
             Source.MenuID COLLATE DATABASE_DEFAULT
        WHEN MATCHED THEN
            UPDATE SET
                Target.IsRun = Source.IsRun,
                Target.IsAdd = Source.IsAdd,
                Target.IsUpdate = Source.IsUpdate,
                Target.IsDelete = Source.IsDelete,
                Target.isManager = Source.isManager,
                Target.isAdmin = Source.isAdmin,
                Target.isAutoLock = Source.isAutoLock,
                Target.isHideAmount = Source.isHideAmount,
                Target.isLockDoc = Source.isLockDoc,
                Target.isUnLockDoc = Source.isUnLockDoc,
                Target.isExportExcel = Source.isExportExcel
        WHEN NOT MATCHED BY TARGET THEN
            INSERT
            (
                ID, UserGroupID, MenuID, IsRun, IsAdd, IsUpdate, IsDelete,
                isManager, isAdmin, isAutoLock, isHideAmount,
                isLockDoc, isUnLockDoc, isExportExcel
            )
            VALUES
            (
                @TargetUserGroupID + N'_' + Source.MenuID,
                @TargetUserGroupID,
                Source.MenuID,
                Source.IsRun,
                Source.IsAdd,
                Source.IsUpdate,
                Source.IsDelete,
                Source.isManager,
                Source.isAdmin,
                Source.isAutoLock,
                Source.isHideAmount,
                Source.isLockDoc,
                Source.isUnLockDoc,
                Source.isExportExcel
            )
        OUTPUT $action INTO @Changes(ActionName);

        IF EXISTS (SELECT 1 FROM dbo.SY_Setup WHERE CodeID = 'menu_sync_ver')
            UPDATE dbo.SY_Setup
            SET CodeValue = CONVERT(nvarchar(50), GETDATE(), 126)
            WHERE CodeID = 'menu_sync_ver';
        ELSE
            INSERT INTO dbo.SY_Setup (CodeID, CodeName, CodeValue, GroupID)
            VALUES
                ('menu_sync_ver', N'Phiên bản đồng bộ Menu', CONVERT(nvarchar(50), GETDATE(), 126), 'SY');

        DECLARE @MenuCount int = (SELECT COUNT(*) FROM @Changes);
        DECLARE @InsertedCount int = (SELECT COUNT(*) FROM @Changes WHERE ActionName = N'INSERT');
        DECLARE @UpdatedCount int = (SELECT COUNT(*) FROM @Changes WHERE ActionName = N'UPDATE');

        IF @StartedTransaction = 1 COMMIT TRANSACTION;

        SELECT
            0 AS code,
            N'Copy quyền nhóm thành công.' AS msg,
            @SourceUserGroupID AS SourceUserGroupID,
            @TargetUserGroupID AS TargetUserGroupID,
            @MenuCount AS MenuCount,
            @InsertedCount AS InsertedCount,
            @UpdatedCount AS UpdatedCount;
    END TRY
    BEGIN CATCH
        IF @StartedTransaction = 1 AND XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        ELSE IF @StartedTransaction = 0 AND XACT_STATE() = 1
            ROLLBACK TRANSACTION CopyPermissionSave;

        SELECT
            1 AS code,
            ERROR_MESSAGE() AS msg,
            ERROR_NUMBER() AS error_number;
    END CATCH
END;
GO




/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep_ChiTiet; Input: Schemadatatest.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep_ChiTiet]
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        D.DetailID,
        D.DocumentID,
        D.HinhThucNghi,
        D.NghiTuNgay,
        D.DenNgay,
        D.SoNgayNghi,
        D.Notes
    FROM dbo.HR_NghiPhepDetailTbl D
    WHERE D.DocumentID = @DocumentID
    ORDER BY D.NghiTuNgay ASC;
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LayQuyenCuaToi; Input: sql/API/API_LayQuyenCuaToi.sql */
CREATE OR ALTER PROCEDURE API_LayQuyenCuaToi
    @Username varchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserGroupID varchar(50);

    -- Lấy Nhóm Quyền của Nhân viên đang đăng nhập
    SELECT @UserGroupID = UserGroupID
    FROM SY_User
    WHERE UserName = @Username;

    -- Nếu không tìm thấy user hoặc chưa có nhóm, trả về mảng rỗng
    IF @UserGroupID IS NULL
    BEGIN
        SELECT 0 AS [code], 'User not found' AS [msg];
        RETURN;
    END

    -- Quét toàn bộ quyền của Nhóm này và móc với Tên Menu
    -- Trả về cho C# duyệt và convert thành chuỗi JSON { "frmStaff": { "CanAdd": 1, ... } }
    SELECT
        M.FormName AS [FormName],
        M.VN AS [MenuName],
        M.URLPara AS [URLPara],
        M.FormKey AS [FormKey],
        ISNULL(P.IsRun, 0) AS CanView,
        ISNULL(P.IsAdd, 0) AS CanAdd,
        ISNULL(P.IsUpdate, 0) AS CanEdit,
        ISNULL(P.IsDelete, 0) AS CanDelete
    FROM WA_UserGroupPermisstion P
    INNER JOIN WA_Menu M ON P.MenuID = M.MenuID
    WHERE P.UserGroupID = @UserGroupID
      AND M.FormName IS NOT NULL AND M.FormName <> '';

END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_LuuThuTuMenu; Input: sql/API/API_LuuThuTuMenu.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_LuuThuTuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @Type NVARCHAR(20) = 'parent',
    @OrderedIDs NVARCHAR(MAX) = '',
    @ParentID NVARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Tách chuỗi ID do Giao diện gửi xuống (chuẩn thứ tự bằng XML)
        DECLARE @Tbl TABLE (Idx INT IDENTITY(1,1), OldID NVARCHAR(50));
        DECLARE @xml XML = CAST('<x>' + REPLACE(@OrderedIDs, ',', '</x><x>') + '</x>' AS XML);

        INSERT INTO @Tbl (OldID)
        SELECT n.value('.', 'NVARCHAR(50)') AS ID
        FROM @xml.nodes('/x') AS p(n);

        -- 2. Lấy danh sách ID HỆ THỐNG HIỆN TẠI đang có (sắp xếp tăng dần theo Alphabet/Số)
        -- Mục đích: Lấy lại chính xác các mã Menu đang dùng để xào bài lại, không sinh mã mới
        DECLARE @TblExisting TABLE (Idx INT IDENTITY(1,1), AvailableID NVARCHAR(50));

        IF (@Type = 'parent')
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu
            WHERE Parent = '' OR Parent IS NULL
            ORDER BY MenuID ASC;
        END
        ELSE
        BEGIN
            INSERT INTO @TblExisting (AvailableID)
            SELECT MenuID FROM WA_Menu
            WHERE Parent = @ParentID
            ORDER BY MenuID ASC;
        END

        -- 3. Đổi toàn bộ ID gốc sang một mã TẠM THỜI (để tránh lỗi Trùng Khóa Chính - Duplicate Key)
        -- VD: Đổi '0304' thành 'TMP_0304'
        UPDATE M
        SET M.MenuID = 'TMP_' + T.OldID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = T.OldID;

        UPDATE P
        SET P.MenuID = 'TMP_' + T.OldID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = T.OldID;

        UPDATE U
        SET U.MenuID = 'TMP_' + T.OldID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = T.OldID;

        -- Nếu đổi Nhóm Cha, phải đổi Parent của menu con trỏ theo mã Tạm
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = 'TMP_' + T.OldID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = T.OldID;
        END

        -- 4. Ghép nối: Vị trí được KÉO (Tbl) sẽ nhận Mã ID SẮP XẾP (TblExisting)
        -- VD: Kéo 0312 lên đầu (Idx=1), sẽ nhận ID nhỏ nhất của hệ thống (Idx=1 là 0304)
        UPDATE M
        SET M.MenuID = E.AvailableID
        FROM WA_Menu M
        JOIN @Tbl T ON M.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE P
        SET P.MenuID = E.AvailableID
        FROM WA_UserGroupPermisstion P
        JOIN @Tbl T ON P.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        UPDATE U
        SET U.MenuID = E.AvailableID
        FROM WA_UserPermisstion U
        JOIN @Tbl T ON U.MenuID = 'TMP_' + T.OldID
        JOIN @TblExisting E ON T.Idx = E.Idx;

        -- Đổi Parent cho menu con về mã mới (nếu là nhóm cha)
        IF (@Type = 'parent')
        BEGIN
            UPDATE M
            SET M.Parent = E.AvailableID
            FROM WA_Menu M
            JOIN @Tbl T ON M.Parent = 'TMP_' + T.OldID
            JOIN @TblExisting E ON T.Idx = E.Idx;
        END

        -- 5. Xóa bỏ cột ThuTu nếu muốn vì giờ đã swap hẳn MenuID
        COMMIT TRANSACTION;
        SELECT 0 AS [code], N'Đã hoàn tất Hoán đổi Mã MenuID thành công' AS [msg];

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 1 AS [code], ERROR_MESSAGE() AS [msg];
    END CATCH
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_XoaTruongGiaoDien; Input: sql/API/API_XoaTruongGiaoDien.sql */
CREATE OR ALTER PROCEDURE API_XoaTruongGiaoDien
    @IDs varchar(max) = NULL,
    @FormName varchar(50) = NULL, -- Form gọi API (frmFormBuilder)
    @UserName varchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @IDs IS NULL OR @IDs = ''
    BEGIN
        SELECT 1 AS code, N'Thiếu ID cần xóa' AS message;
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM SY_FormatFields
        WHERE LOWER(FormName) = LOWER('WA_BangThueTNCNFrm')
          AND AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL)
    )
        THROW 52603, N'FORM_BUILDER_WRITE_BLOCKED_PHASE2: không xóa field legacy của form pilot.', 1;

    BEGIN TRY
        -- Tách chuỗi ID và xóa (hỗ trợ SQL Server 2016 trở lên)
        DELETE FROM SY_FormatFields
        WHERE AutoID IN (SELECT TRY_CAST(value AS int) FROM STRING_SPLIT(@IDs, ',') WHERE TRY_CAST(value AS int) IS NOT NULL);

        SELECT 0 AS code, N'Xóa thành công' AS message;
    END TRY
    BEGIN CATCH
        SELECT 1 AS code, ERROR_MESSAGE() AS message;
    END CATCH
END
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_CandidateAttach_SaveAvatar; Input: sql/API/APINEW/API_UngVienAttach.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_CandidateAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = TRY_CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        IF @CandidateID IS NULL OR @CandidateID = ''
        BEGIN
            SELECT -1 AS code, N'Không tìm thấy mã ứng viên.' AS msg;
            RETURN;
        END;
        IF @FileType = 1
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP (1) @ExistingID = UserAutoID
            FROM dbo.HR_CandidateAttachTbl
            WHERE CandidateID = @CandidateID AND FileType = 1;
            IF @ExistingID IS NOT NULL
            BEGIN
                SET @Data = JSON_MODIFY(@Data, '$.UserAutoID', @ExistingID);
                SET @Data = JSON_MODIFY(@Data, '$.IsEdit', 1);
            END;
        END;
        EXEC dbo.API_LuuDong @List=@List,@Data=@Data,@UserName=@UserName;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_PersonAttach_SaveAvatar; Input: sql/API/APINEW/API_HoSoNhanVien.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_PersonAttach_SaveAvatar]
    @List VARCHAR(50),
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @PersonID VARCHAR(50) = JSON_VALUE(@Data, '$.PersonID');
        DECLARE @CandidateID VARCHAR(50) = JSON_VALUE(@Data, '$.CandidateID');
        DECLARE @FileType INT = TRY_CAST(JSON_VALUE(@Data, '$.FileType') AS INT);
        DECLARE @TargetID VARCHAR(50) = ISNULL(@PersonID,@CandidateID);
        IF @TargetID IS NULL OR @TargetID = ''
        BEGIN
            SELECT -1 AS code,N'Không tìm thấy mã nhân viên/ứng viên.' AS msg;
            RETURN;
        END;
        IF @FileType = 1
        BEGIN
            DECLARE @ExistingID VARCHAR(50);
            SELECT TOP (1) @ExistingID=UserAutoID
            FROM dbo.HR_PersonAttachTbl
            WHERE PersonID=@TargetID AND FileType=1;
            IF @ExistingID IS NOT NULL
            BEGIN
                SET @Data=JSON_MODIFY(@Data,'$.UserAutoID',@ExistingID);
                SET @Data=JSON_MODIFY(@Data,'$.IsEdit',1);
            END;
        END;
        EXEC dbo.API_LuuDong_V2 @List=@List,@Data=@Data,@UserName=@UserName;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg;
    END CATCH;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_HopDongLaoDong; Input: sql/API/APINEW/API_HopDongLaoDong.sql */
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong
(
    @Keyword NVARCHAR(200) = '',
    @NamLap NVARCHAR(50) = '',
    @LoaiHD NVARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1000 *
    FROM dbo.vHR_HopDong_LaoDong
    WHERE
        (ISNULL(@Keyword, '') = ''
         OR MaHopDong LIKE '%' + @Keyword + '%'
         OR PersonID LIKE '%' + @Keyword + '%'
         OR PersonName LIKE N'%' + @Keyword + '%')
        AND (ISNULL(@NamLap, '') = '' OR NamLap = TRY_CAST(@NamLap AS INT))
        AND (ISNULL(@LoaiHD, '') = '' OR LoaiHD = @LoaiHD)
        AND (ISNULL(@BranchID, '') = ''
             OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY NgayKyHopDong DESC, MaHopDong DESC;
END;
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HopDongLaoDong_Attach_Save; no repository definition */
CREATE OR ALTER PROCEDURE [dbo].[API_HopDongLaoDong_Attach_Save]
    @Data NVARCHAR(MAX),
    @UserName VARCHAR(50)=''
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @UserAutoID VARCHAR(50)=NULLIF(JSON_VALUE(@Data,'$.UserAutoID'),'');
        DECLARE @MaHopDong NVARCHAR(100)=NULLIF(JSON_VALUE(@Data,'$.MaHopDong'),N'');
        DECLARE @FileName NVARCHAR(500)=NULLIF(JSON_VALUE(@Data,'$.FileName'),N'');
        DECLARE @FileType INT=TRY_CONVERT(INT,JSON_VALUE(@Data,'$.FileType'));
        DECLARE @STT NVARCHAR(100)=NULLIF(JSON_VALUE(@Data,'$.STT'),N'');
        DECLARE @FileSize DECIMAL(18,0)=TRY_CONVERT(DECIMAL(18,0),JSON_VALUE(@Data,'$.FileSize'));
        DECLARE @ContentText NVARCHAR(MAX)=(SELECT value FROM OPENJSON(@Data) WHERE [key]='Content');
        DECLARE @Base64Content VARCHAR(MAX)=TRY_CONVERT(VARCHAR(MAX),(SELECT value FROM OPENJSON(@Data) WHERE [key]='Base64Content'));
        DECLARE @Content VARBINARY(MAX)=NULL;
        DECLARE @BranchID VARCHAR(50),@UserBranchID VARCHAR(500),@UserGroupID VARCHAR(50),@MenuID NVARCHAR(50);
        IF ISJSON(@Data)<>1 OR @MaHopDong IS NULL OR @FileName IS NULL
            THROW 51800,N'Dữ liệu file hợp đồng không hợp lệ.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.HR_HopDongTbl WHERE MaHopDong=@MaHopDong)
            THROW 51801,N'Hợp đồng không tồn tại.',1;
        SELECT @BranchID=P.BranchID
        FROM dbo.HR_HopDongTbl AS H
        LEFT JOIN dbo.HR_PersonTbl AS P ON P.PersonID=H.PersonID
        WHERE H.MaHopDong=@MaHopDong;
        SELECT @UserBranchID=U.BranchID,@UserGroupID=U.UserGroupID
        FROM dbo.SY_User AS U WHERE U.UserName=@UserName;
        IF UPPER(ISNULL(@UserName,''))<>'ADMIN'
        BEGIN
            IF @UserGroupID IS NULL THROW 51802,N'Không xác định được quyền người dùng.',1;
            SELECT TOP (1) @MenuID=MenuID FROM dbo.WA_Menu WHERE FormName='WA_HopDongLaoDongFrm';
            IF @MenuID IS NOT NULL AND NOT EXISTS
            (
                SELECT 1 FROM dbo.WA_UserGroupPermisstion
                WHERE UserGroupID=@UserGroupID AND MenuID=@MenuID
                  AND (ISNULL(IsAdd,0)=1 OR ISNULL(IsUpdate,0)=1)
            )
                THROW 51803,N'Không có quyền lưu tài liệu hợp đồng.',1;
            IF NULLIF(LTRIM(RTRIM(@UserBranchID)),'') IS NOT NULL
               AND NOT EXISTS
               (
                   SELECT 1 FROM STRING_SPLIT(@UserBranchID,',')
                   WHERE UPPER(LTRIM(RTRIM(value)))=UPPER(ISNULL(@BranchID,''))
               )
                THROW 51804,N'Không có quyền lưu tài liệu của chi nhánh này.',1;
        END;
        IF @UserAutoID IS NULL SET @UserAutoID=LOWER(CONVERT(VARCHAR(36),NEWID()));
        IF @STT IS NULL
            SELECT @STT=CONVERT(NVARCHAR(100),ISNULL(MAX(TRY_CONVERT(INT,STT)),0)+1)
            FROM dbo.HR_HopDongAttachTbl WITH (UPDLOCK,HOLDLOCK)
            WHERE MaHopDong=@MaHopDong;
        IF @ContentText IS NOT NULL AND LTRIM(RTRIM(@ContentText))<>N''
        BEGIN
            IF LOWER(LEFT(@ContentText,2))=N'0x'
                SET @Content=CONVERT(VARBINARY(MAX),@ContentText,1);
            ELSE
                SET @Content=CAST(N'' AS XML).value('xs:base64Binary(sql:variable("@ContentText"))','varbinary(max)');
        END;
        IF EXISTS (SELECT 1 FROM dbo.HR_HopDongAttachTbl WHERE UserAutoID=@UserAutoID)
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.HR_HopDongAttachTbl WHERE UserAutoID=@UserAutoID AND MaHopDong=@MaHopDong)
            BEGIN
                SELECT 0 AS code,N'File hợp đồng đã được lưu trước đó.' AS msg,@UserAutoID AS UserAutoID;
                RETURN;
            END;
            THROW 51805,N'UserAutoID đã tồn tại ở hợp đồng khác.',1;
        END;
        INSERT INTO dbo.HR_HopDongAttachTbl
            (UserAutoID,MaHopDong,FileName,FileType,STT,Content,FileSize,Base64Content)
        VALUES
            (@UserAutoID,@MaHopDong,@FileName,ISNULL(@FileType,0),@STT,@Content,@FileSize,@Base64Content);
        SELECT 0 AS code,N'Lưu file hợp đồng thành công.' AS msg,@UserAutoID AS UserAutoID;
    END TRY
    BEGIN CATCH
        SELECT -1 AS code,ERROR_MESSAGE() AS msg,NULL AS UserAutoID;
    END CATCH;
END;
GO

/* CanonicalSource: DB_TEST; Object: dbo.API_HR_NghiPhep; current leave form route dependency */
CREATE OR ALTER PROCEDURE [dbo].[API_HR_NghiPhep]
    @Keyword NVARCHAR(200)='',
    @BranchID NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (1000) V.*,A.PersonName,A.BranchID AS PersonBranchID
    FROM dbo.HR_NghiPhepView AS V
    LEFT JOIN dbo.HR_PersonTbl AS A ON V.PersonID=A.PersonID
    WHERE (NULLIF(LTRIM(RTRIM(@BranchID)),'') IS NULL
           OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID,',')))
      AND (@Keyword='' OR A.PersonID LIKE '%'+@Keyword+'%'
           OR A.PersonName LIKE N'%'+@Keyword+'%' OR V.DocumentID LIKE '%'+@Keyword+'%')
    ORDER BY V.DocumentDate DESC;
END;
GO

/* CanonicalSource: MERGED_REPOSITORY_WITH_TEST_ROUTE_CONTRACT; Object: dbo.API_KinhPhiCongDoan; Input: repository base + Schemadatatest.sql route signature */
CREATE OR ALTER PROCEDURE [dbo].[API_KinhPhiCongDoan]
    @Keyword NVARCHAR(100)=NULL,
    @BranchID VARCHAR(MAX)=NULL,
    @PeriodID VARCHAR(20)=NULL,
    @PhongBan VARCHAR(50)=NULL,
    @User VARCHAR(50)=NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF ISNULL(@BranchID,'')='' AND ISNULL(@User,'')<>''
        SET @BranchID=(SELECT TOP (1) BranchID FROM dbo.SY_User WHERE UserName=@User);
    SELECT KP.UserAutoID,KP.PersonID,KP.PersonName,KP.ChucDanhChuyenMon,KP.MucDong,
           KP.KinhPhiNopCongDoanVN,KP.CongDoanVN,KP.CongDoanCTY,P.BranchID,
           KP.PeriodID,P.LoaiHD
    FROM dbo.HR_KinhPhiCongDoanTbl AS KP
    LEFT JOIN dbo.HR_PersonView AS P ON KP.PersonID=P.PersonID
    WHERE (ISNULL(@Keyword,'')='' OR KP.PersonID LIKE '%'+@Keyword+'%'
           OR KP.PersonName LIKE N'%'+@Keyword+'%')
      AND (ISNULL(@BranchID,'')='' OR P.BranchID IN
           (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID,',')))
      AND (ISNULL(@PeriodID,'')='' OR KP.PeriodID=@PeriodID)
      AND (ISNULL(@PhongBan,'')='' OR P.PhongBan=@PhongBan)
    ORDER BY KP.PersonID;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_NguoiDungFrm; Input: sql/API/APINEW/API_NguoiDungFrm.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungFrm]
    @List VARCHAR(50)='',
    @Keyword NVARCHAR(200)='',
    @SortColumn VARCHAR(50)='',
    @SortDir VARCHAR(10)='',
    @Data NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT U.*,G.UserGroupName,B.BranchName
    FROM dbo.SY_User AS U
    LEFT JOIN dbo.SY_UserGroup AS G ON U.UserGroupID=G.UserGroupID
    LEFT JOIN dbo.CF_BranchTbl AS B ON U.BranchID=B.BranchID
    WHERE @Keyword='' OR U.UserName LIKE N'%'+@Keyword+'%'
       OR U.HoTen LIKE N'%'+@Keyword+'%' OR U.EmployeeID LIKE N'%'+@Keyword+'%'
    ORDER BY U.UserName;
END;
GO

/* CanonicalSource: REPOSITORY; Object: dbo.API_NguoiDungNhomFrm; Input: sql/API/APINEW/API_NguoiDungNhomFrm.sql */
CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungNhomFrm]
    @List VARCHAR(50)='',
    @Keyword NVARCHAR(200)='',
    @SortColumn VARCHAR(50)='',
    @SortDir VARCHAR(10)='',
    @Data NVARCHAR(MAX)=''
AS
BEGIN
    SET NOCOUNT ON;
    SELECT G.UserGroupID,G.UserGroupName,G.IsDisable,
           (SELECT COUNT(*) FROM dbo.SY_User AS U WHERE U.UserGroupID=G.UserGroupID) AS CountUser
    FROM dbo.SY_UserGroup AS G
    WHERE @Keyword='' OR G.UserGroupName LIKE N'%'+@Keyword+'%'
       OR G.UserGroupID LIKE N'%'+@Keyword+'%'
    ORDER BY G.UserGroupID;
END;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/06_BusinessProcedures/001_approved_business_procedures.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/11_MetadataRegistry/001_field_contract_seed.sql | SHA-256: 9660095445be4f20bf52c9bf9b976efc7e988ed83947fbec1972d83bb03c6043 ===== */

/*
  Explicit seed cho các contract đã audit. Các form có quyết định canonical riêng
  được chuẩn hóa bằng UPDATE idempotent bên dưới.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @Now datetime2(3) = SYSUTCDATETIME();
    DECLARE @Actor varchar(100) = 'PRODUCTION_DATABASE_RELEASE';

    INSERT INTO dbo.WA_FieldContractRegistry
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
        IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT V.*, 2, 1, @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(varchar(100),'HR_BangThueTNCNFrm'),CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(varchar(40),'SIMPLE_TABLE'),CONVERT(sysname,N'HR_BangThueTNCNTbl'),CONVERT(sysname,N'Bac'),CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(sysname,N'API_TruyVanDong_V2'),CONVERT(sysname,N'API_LuuDong_V2'),CONVERT(sysname,N'API_XoaDong_V2'),CONVERT(varchar(40),'SAFE_TABLE_COLUMNS'),CONVERT(varchar(40),'LEGACY_GLOBAL_REFERENCE'),CONVERT(varchar(40),'AUTO_SCHEMA'),CONVERT(varchar(20),'SHADOW'),CONVERT(nvarchar(500),N'CONFIRMED_PHASE3_READY_FOR_CUTOVER')),
        ('WA_ChucDanhFrm','WA_ChucDanhFrm','WA_ChucDanhFrm','SIMPLE_TABLE',N'HR_ChucDanhTbl',N'ChucDanhChuyenMon','WA_ChucDanhFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('WA_TitleListFrm','WA_TitleListFrm','WA_TitleListFrm','SIMPLE_TABLE',N'HR_TitleListTbl',N'TitleName','WA_TitleListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('WA_ShiftListFrm','WA_ShiftListFrm','WA_ShiftListFrm','SIMPLE_TABLE',N'HR_ShiftListTbl',N'ShiftID','WA_ShiftListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('CF_BranchListFrm','CF_BranchListFrm','CF_BranchListFrm','SIMPLE_TABLE',N'CF_BranchTbl',N'BranchID','CF_BranchListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','BRANCH_SCOPED','AUTO_SCHEMA','SHADOW',N'CONFIRMED_BRANCH_DIRECTORY_READY_FOR_CUTOVER'),
        ('WA_TimeSheetCTReport','WA_TimeSheetCTReport','WA_TimeSheetCTReport','READ_ONLY',N'HR_TimeSheetDayTbl',N'UserAutoID','WA_TimeSheetCTReport',N'HR_TimeSheetCTReportStp',NULL,NULL,'READ_ONLY','AUTO_SCHEMA','NONE','SHADOW',N'DESKTOP_REPORT_RESULT_SET_METADATA_V2'),
        ('WA_PersonFullFrm','WA_PersonFullFrm','WA_PersonFullFrm','COMPLEX_DEFERRED',N'HR_PersonTbl',N'PersonID','WA_PersonFullFrm',N'API_HoSoNhanVien',NULL,NULL,'CUSTOM_PROCEDURE','BRANCH_SCOPED','AUTO_SCHEMA','DEFERRED',N'WIZARD_ATTACHMENT_CURRENT_BUSINESS_METADATA_V2'),
        ('WA_CaLamViecFrm','WA_CaLamViecFrm','WA_CaLamViecFrm','MASTER_DETAIL_SIMPLE',N'HR_SapCaTbl',N'SapCaID','WA_CaLamViecFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','AUTO_SCHEMA','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE4_MASTER_DETAIL_READY_FOR_CUTOVER')
    ) AS V
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason
    )
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.WA_FieldContractRegistry AS R
        WHERE R.WebFormName = V.WebFormName
    );

    /*
      WA_PersonFullFrm dùng metadata V2 nhưng vẫn giữ business runtime hiện tại.
      Chuẩn hóa cả bản ghi do discovery cũ tạo để procedure metadata không ném 53201.
    */
    UPDATE R
    SET R.ERPFormID = 'WA_PersonFullFrm',
        R.PermissionFormName = 'WA_PersonFullFrm',
        R.ContractType = 'COMPLEX_DEFERRED',
        R.ExpectedTableName = N'HR_PersonTbl',
        R.ExpectedPrimaryKey = N'PersonID',
        R.ViewList = 'WA_PersonFullFrm',
        R.ViewProcedure = N'API_HoSoNhanVien',
        R.SaveProcedure = NULL,
        R.DeleteProcedure = NULL,
        R.WritePolicy = 'CUSTOM_PROCEDURE',
        R.BranchPolicy = 'BRANCH_SCOPED',
        R.DeletePolicy = 'AUTO_SCHEMA',
        R.RolloutStatus = 'DEFERRED',
        R.RolloutReason = N'WIZARD_ATTACHMENT_CURRENT_BUSINESS_METADATA_V2',
        R.SchemaVersion = 2,
        R.IsEnabled = 1,
        R.UpdatedAt = @Now,
        R.UpdatedBy = @Actor
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.WebFormName = 'WA_PersonFullFrm';

    /* Đồng bộ contract báo cáo đã tồn tại với route SP desktop đã được duyệt. */
    UPDATE R
    SET R.ERPFormID = 'WA_TimeSheetCTReport',
        R.PermissionFormName = 'WA_TimeSheetCTReport',
        R.ContractType = 'READ_ONLY',
        R.ExpectedTableName = N'HR_TimeSheetDayTbl',
        R.ExpectedPrimaryKey = N'UserAutoID',
        R.ViewList = 'WA_TimeSheetCTReport',
        R.ViewProcedure = N'HR_TimeSheetCTReportStp',
        R.SaveProcedure = NULL,
        R.DeleteProcedure = NULL,
        R.WritePolicy = 'READ_ONLY',
        R.BranchPolicy = 'AUTO_SCHEMA',
        R.DeletePolicy = 'NONE',
        R.RolloutStatus = 'SHADOW',
        R.RolloutReason = N'DESKTOP_REPORT_RESULT_SET_METADATA_V2',
        R.SchemaVersion = 2,
        R.IsEnabled = 1,
        R.UpdatedAt = @Now,
        R.UpdatedBy = @Actor
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.WebFormName = 'WA_TimeSheetCTReport'
      AND EXISTS
      (
          SELECT 1
          FROM dbo.WA_API AS A
          WHERE A.[list] = 'WA_TimeSheetCTReport'
            AND A.[func] = 'View'
            AND PARSENAME(LTRIM(RTRIM(A.[SQL])), 1) = 'HR_TimeSheetCTReportStp'
      );

    INSERT INTO dbo.WA_FieldDatasetRegistry
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT V.*, 2, @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (CONVERT(varchar(100),'WA_CaLamViecFrm'),CONVERT(varchar(80),'SHIFT_DETAIL'),CONVERT(varchar(100),'API_CaLamViec_ChiTiet'),CONVERT(sysname,N'API_CaLamViec_ChiTiet'),CONVERT(sysname,N'HR_SapCaChiTietTbl'),CONVERT(sysname,N'UserAutoID'),CONVERT(sysname,N'SapCaID'),CONVERT(sysname,N'SapCaID'),CONVERT(bit,1),CONVERT(sysname,NULL),CONVERT(sysname,NULL),CONVERT(varchar(40),'READ_ONLY'),CONVERT(varchar(40),'AUTO_SCHEMA'),CONVERT(varchar(20),'SHADOW'),CONVERT(nvarchar(500),N'CONFIRMED_PHASE4_READ_ONLY_READY_FOR_CUTOVER')),
        ('WA_CaLamViecFrm','SHIFT_EMPLOYEES','API_CaLamViec_NhanVien',N'API_CaLamViec_NhanVien',N'HR_SapCaNhanVienTbl',N'UserAutoID',N'SapCaID',N'SapCaID',0,N'API_LuuDong_V2',N'API_XoaDong_V2','VIEW_PHYSICAL_COLUMNS','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE4_EDITABLE_READY_FOR_CUTOVER')
    ) AS V
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason
    )
    WHERE EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry AS R WHERE R.WebFormName = V.WebFormName)
      AND NOT EXISTS
      (
          SELECT 1 FROM dbo.WA_FieldDatasetRegistry AS D
          WHERE D.WebFormName = V.WebFormName AND D.DatasetKey = V.DatasetKey
      );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/11_MetadataRegistry/001_field_contract_seed.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/12_SystemSeeds/001_explicit_system_seed.sql | SHA-256: 1e5aca82b18958383589dcdf8fc378fd065d9604e97a699a089c482b628fc867 ===== */

/*
  Không replay dump test. Không copy SY_User, permission, menu, nhân sự, lương,
  hợp đồng, bảo hiểm, chấm công hoặc toàn bảng format.
*/
SET NOCOUNT ON;
PRINT N'Không có system seed ngoài registry/route explicit của release.';
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/12_SystemSeeds/001_explicit_system_seed.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/13_WaApiCutover/001_route_backup_and_cutover.sql | SHA-256: 77c6717f19e730b89f12432669ebbbb9f48798e3fee6b7a30faf20e322f4928a ===== */

/*
  Route registration/cutover: backup trước, transaction, idempotent, không DELETE hàng loạt.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ReleaseID varchar(100) = 'HRM_DB_CLEANUP_20260729';
DECLARE @Actor varchar(100) = LEFT(COALESCE(NULLIF(CONVERT(varchar(128), SUSER_SNAME()),''),'PRODUCTION_DATABASE_RELEASE'),100);
DECLARE @MetadataBatchID uniqueidentifier = NEWID();
DECLARE @FieldBatchID uniqueidentifier = NEWID();

DECLARE @Targets table
(
    ApiList varchar(100) NOT NULL,
    Func varchar(20) NOT NULL,
    DesiredProcedure sysname NOT NULL,
    DesiredPara nvarchar(max) NULL,
    KnownOriginalProcedure sysname NULL,
    PRIMARY KEY (ApiList, Func)
);
INSERT INTO @Targets (ApiList, Func, DesiredProcedure, DesiredPara, KnownOriginalProcedure)
VALUES
        (N'API_BangThueTNCN_V2', N'Execute', N'API_BangThueTNCN_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_BaoHiem_Detail', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_BaoHiem_Detail', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_BaoHiem_Detail', N'View', N'API_BaoHiem_Detail', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_CaLamViec', N'Execute', N'API_CaLamViec', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_CaLamViec_ChiTiet', N'Execute', N'API_CaLamViec_ChiTiet', N'@SapCaID=N''{SapCaID}''', NULL),
        (N'API_CaLamViec_NhanVien', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'API_CaLamViec_NhanVien', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'API_CandidateAttach', N'SaveAvatar', N'API_CandidateAttach_SaveAvatar', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_CandidateAttach', N'View', N'API_TruyVanDong', N'@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'API_ComboPersonStatus', N'Execute', N'API_ComboPersonStatus', N'@Keyword=N''{Keyword}'', @UserName=N''{User}''', NULL),
        (N'API_ComboPersonStatus', N'View', N'API_ComboPersonStatus', N'@Keyword=N''{Keyword}'', @UserName=N''{User}''', NULL),
        (N'API_DanhSachChucDanh', N'Execute', N'API_DanhSachChucDanh', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_DanhSachChucDanh', N'View', N'API_DanhSachChucDanh', N'@Keyword=''{Keyword}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'Save', N'API_HopDongLaoDong_Attach_Save', N'@Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HopDongLaoDong_Attach', N'View', N'API_HopDongLaoDong_Attach', N'@MaHopDong=N''{MaHopDong}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HopDongLaoDong_ChiTiet', N'View', N'API_HopDongLaoDong_ChiTiet', N'@MaHopDong=N''{MaHopDong}''', NULL),
        (N'API_HopDongLaoDong_LoaiHD', N'View', N'API_HopDongLaoDong_LoaiHD', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_HopDongLaoDong_NamLap', N'View', N'API_HopDongLaoDong_NamLap', N'@Keyword=N''{Keyword}''', NULL),
        (N'API_HR_Dashboard_Birthdays', N'Execute', N'API_HR_Dashboard_Birthdays', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_ContractsExpiring', N'Execute', N'API_HR_Dashboard_ContractsExpiring', N'@Days=N''{Days}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Demographics', N'Execute', N'API_HR_Dashboard_Demographics', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Department', N'Execute', N'API_HR_Dashboard_Department', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_GetBranches', N'Execute', N'API_HR_Dashboard_GetBranches', N'@UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_OverviewToday', N'Execute', N'API_HR_Dashboard_OverviewToday', N'@Date=N''{Date}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_Dashboard_Payroll', N'Execute', N'API_HR_Dashboard_Payroll', N'@PeriodID=N''{PeriodID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'Save', N'API_LuuDong', N'@List=N''API_HR_NghiPhep_Attach'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_Attach', N'View', N'API_HR_NghiPhep_Attach', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_HR_NghiPhep_Attach_Save', N'Execute', N'API_HR_NghiPhep_Attach_Save', N'@Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'Save', N'API_LuuDong', N'@List=N''API_HR_NghiPhep_ChiTiet'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_HR_NghiPhep_ChiTiet', N'View', N'API_HR_NghiPhep_ChiTiet', N'@DocumentID=N''{DocumentID}''', NULL),
        (N'API_LayCacTruongGiaoDien', N'Execute', N'API_LayCacTruongGiaoDien', N'@FormName=N''{List}''', NULL),
        (N'API_LayDanhSachMenuTatCa', N'Execute', N'API_LayDanhSachMenuTatCa', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}''', NULL),
        (N'API_LayDanhSachNhom', N'Execute', N'API_LayDanhSachNhom', N'', NULL),
        (N'API_LayGiaTriSetup', N'Execute', N'API_LayGiaTriSetup', N'', NULL),
        (N'API_LayMenuTheoNhomQuyen', N'Execute', N'API_LayMenuTheoNhomQuyen', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}''', NULL),
        (N'API_LayPhienBanQuyen', N'Execute', N'API_LayPhienBanQuyen', N'', NULL),
        (N'API_LayQuyenCuaToi', N'Execute', N'API_LayQuyenCuaToi', N'@Username=N''{User}''', NULL),
        (N'API_LayQuyenNhomDayDu', N'Execute', N'API_LayQuyenNhomDayDu', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}''', NULL),
        (N'API_SaoChepQuyenNhom', N'Execute', N'API_SaoChepQuyenNhom', N'@UserName=N''{UserName}'', @SourceUserGroupID=N''{SourceUserGroupID}'', @TargetUserGroupID=N''{TargetUserGroupID}''', NULL),
        (N'API_LuuDong_V2', N'Execute', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_LuuMenu', N'Execute', N'API_LuuMenu', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @MenuID=N''{MenuID}'', @OldMenuID=N''{OldMenuID}'', @ParentID=N''{ParentID}'', @Label=N''{Label}'', @EN=N''{EN}'', @SubTitle=N''{SubTitle}'', @FormName=N''{FormName}'', @FormKey=N''{FormKey}'', @URLPara=N''{URLPara}'', @Icon=N''{Icon}'', @IsDisable=N''{IsDisable}'', @IsEdit=N''{IsEdit}'', @TableName=N''{TableName}'', @PrimaryKey=N''{PrimaryKey}'', @AllowHardDelete=N''{AllowHardDelete}''', NULL),
        (N'API_LuuQuyenCuaNhom', N'Execute', N'API_LuuQuyenCuaNhom', N'@NhomNguoiDangThaoTac=N''{NhomNguoiDangThaoTac}'', @UserGroupID=N''{UserGroupID}'', @MenuID=N''{MenuID}'', @IsRun=N''{IsRun}'', @IsAdd=N''{IsAdd}'', @IsUpdate=N''{IsUpdate}'', @IsDelete=N''{IsDelete}'', @isManager=N''{isManager}'', @isAdmin=N''{isAdmin}'', @isAutoLock=N''{isAutoLock}'', @isHideAmount=N''{isHideAmount}'', @isLockDoc=N''{isLockDoc}'', @isUnLockDoc=N''{isUnLockDoc}'', @isExportExcel=N''{isExportExcel}''', NULL),
        (N'API_PersonAttach', N'SaveAvatar', N'API_PersonAttach_SaveAvatar', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonAttach', N'View', N'API_TruyVanDong', N'@List=''{List}'', @Keyword=N''{Keyword}'', @SortColumn=''{SortColumn}'', @SortDir=''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T1_Salary', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T1_Salary', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T2_Allowance', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T2_Allowance', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T3_KTKL', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T3_KTKL', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T4_NghiPhep', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T4_NghiPhep', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T5_Relation', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T5_Relation', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T6_HopDong', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T6_HopDong', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T7_CongTac', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T7_CongTac', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T8_Log', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T8_Log', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_PersonFull_T9_GiayTo', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'API_PersonFull_T9_GiayTo', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'API_TruyVanDong_V2', N'Execute', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_CutoverSafeFieldContractsV2', N'Execute', N'API_Web_CutoverSafeFieldContractsV2', N'@WebFormName=N''{FormName}'', @UserName=N''{User}'', @BatchID=N''{BatchID}''', NULL),
        (N'API_Web_DiscoverFieldContractCandidatesV2', N'Execute', N'API_Web_DiscoverFieldContractCandidatesV2', N'', NULL),
        (N'API_Web_FieldContractResolveV2', N'Execute', N'API_Web_FieldContractResolveV2', N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_FieldContractResolveV2', N'View', N'API_Web_FieldContractResolveV2', N'@FormName=N''{FormName}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldCompareV2', N'Execute', N'API_Web_GridFieldCompareV2', N'@WebFormName=N''{WebFormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldCompareV2', N'View', N'API_Web_GridFieldCompareV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldSchemaV2', N'Execute', N'API_Web_GridFieldSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_GridFieldSchemaV2', N'View', N'API_Web_GridFieldSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_JoinFieldSchemaV2', N'Execute', N'API_Web_JoinFieldSchemaV2', N'@WebFormName=N''{FormName}'', @DetailKey=N''{DetailKey}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_JoinFieldSchemaV2', N'View', N'API_Web_JoinFieldSchemaV2', N'@WebFormName=N''{FormName}'', @DetailKey=N''{DetailKey}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_LookupSchemaV2', N'Execute', N'API_Web_LookupSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=N''{LookupKey}'', @Keyword=N''{Keyword}'', @Page=N''{Page}'', @PageSize=N''{Limit}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_LookupSchemaV2', N'View', N'API_Web_LookupSchemaV2', N'@WebFormName=N''{FormName}'', @ERPFormID=N''{ERPFormID}'', @LookupKey=''{LookupKey}'', @Keyword=N''{Keyword}'', @Page={Page}, @PageSize={PageSize}, @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'API_Web_RollbackFieldContractV2', N'Execute', N'API_Web_RollbackFieldContractV2', N'@WebFormName=N''{FormName}'', @BatchID=N''{BatchID}'', @TargetStatus=N''{TargetStatus}'', @UserName=N''{User}''', NULL),
        (N'API_Web_SeedSafeFieldContractsV2', N'Execute', N'API_Web_SeedSafeFieldContractsV2', N'@UserName=N''{User}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'Execute', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{FormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth=N''{MinWidth}'', @MaxWidth=N''{MaxWidth}'', @UserName=N''{User}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'Save', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth={MinWidth}, @MaxWidth={MaxWidth}, @UserName=N''{UserName}''', NULL),
        (N'API_Web_UpdateFieldFormat', N'View', N'API_Web_UpdateFieldFormat', N'@WebFormName=N''{WebFormName}'', @FieldName=N''{FieldName}'', @CaptionVN=N''{CaptionVN}'', @CaptionEN=N''{CaptionEN}'', @CaptionCH=N''{CaptionCH}'', @FormatID=N''{FormatID}'', @AlignX=N''{AlignX}'', @MinWidth={MinWidth}, @MaxWidth={MaxWidth}, @UserName=N''{UserName}''', NULL),
        (N'API_XoaDong_V2', N'Execute', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'CF_BranchListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'CF_BranchListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'CF_BranchListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'HR_Documents', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'HR_Documents', N'Edit', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'HR_Documents', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'HR_HopDongAddfile', N'View', N'API_TruyVanDong', N'@List=N''HR_HopDongAddfile'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_BangCapListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangCapListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangCapListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BangThamSoFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangThamSoFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangThamSoFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BangThueTNCNFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BangThueTNCNFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BangThueTNCNFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_BankListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_BankListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_BankListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_CaLamViecFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_CaLamViecFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_CaLamViecFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_CaLamViec'),
        (N'WA_CareerlListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_CareerlListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_CareerlListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_ChucDanhFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_ChucDanhFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_ChucDanhFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_DanhSachUngVienFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_DanhSachUngVienFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DepartmentListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_DepartmentListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_DepartmentListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_DonXinNghiPhepF', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepF', N'Save', N'API_LuuDong', N'@List=N''WA_DonXinNghiPhepF'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'Save', N'API_LuuDong', N'@List=N''WA_DonXinNghiPhepFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_DonXinNghiPhepFrm', N'View', N'API_HR_NghiPhep', N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_EducationListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_EducationListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_EducationListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_HinhThucNghiListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_HinhThucNghiListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_HopDongLaoDongFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_HopDongLaoDongFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_HopDongLaoDongFrm', N'View', N'API_HopDongLaoDong', N'@Keyword=N''{Keyword}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_HospitalListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_HospitalListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_HospitalListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_HR_NghiPhepFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_HR_NghiPhepFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_JobListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_JobListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_JobListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_KinhPhiCongDoanFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_KinhPhiCongDoanFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', NULL),
        (N'WA_KinhPhiCongDoanFrm', N'View', N'API_KinhPhiCongDoan', N'@Keyword=N''{Keyword}'',@BranchID=N''{BranchID}'',@User=N''{User}'',@PeriodID=N''{PeriodID}''', NULL),
        (N'WA_LuongKhoanFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_LuongKhoanFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_NationListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_NationListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_NationListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_NguoiDungFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_NguoiDungFrm', N'View', N'API_NguoiDungFrm', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_NguoiDungNhomFrm', N'View', N'API_NguoiDungNhomFrm', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''', NULL),
        (N'WA_PeopleListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_PeopleListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_PeopleListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_PersonFullFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}''', NULL),
        (N'WA_PersonFullFrm', N'Save', N'API_LuuDong', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_PositionListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_PositionListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_PositionListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_ProvinceListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_ProvinceListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_ProvinceListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_QuanLyNghiPhepNamFrm', N'Delete', N'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_QuanLyNghiPhepNamFrm', N'Save', N'API_LuuDong', N'@List=N''WA_QuanLyNghiPhepNamFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''', NULL),
        (N'WA_ShiftListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_ShiftListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_ShiftListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_TitleListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_TitleListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_TitleListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong'),
        (N'WA_WorkingGroupListFrm', N'Delete', N'API_XoaDong_V2', N'@List=N''{List}'', @Ids=N''{Ids}'', @UserName=N''{User}'', @Data=N''{JsonData}'', @BranchID=N''{BranchID}''', N'API_XoaDong'),
        (N'WA_WorkingGroupListFrm', N'Save', N'API_LuuDong_V2', N'@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_LuuDong'),
        (N'WA_WorkingGroupListFrm', N'View', N'API_TruyVanDong_V2', N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}'', @UserName=N''{User}'', @BranchID=N''{BranchID}''', N'API_TruyVanDong');

/*
  Chỉ giữ route có caller hiện tại. V2 cho form chỉ được áp dụng với registry đã audit;
  Dashboard gọi direct SQL; procedure quản trị cutover không public qua WA_API.
*/
DELETE FROM @Targets
WHERE ApiList = 'API_BangThueTNCN_V2'
   OR ApiList LIKE 'API_HR_Dashboard[_]%'
   OR ApiList IN
      ('API_Web_CutoverSafeFieldContractsV2','API_Web_DiscoverFieldContractCandidatesV2',
       'API_Web_SeedSafeFieldContractsV2','API_Web_RollbackFieldContractV2');

DELETE FROM @Targets
WHERE DesiredProcedure IN ('API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2')
  AND ApiList NOT IN
      ('WA_BangThueTNCNFrm','WA_ChucDanhFrm','WA_TitleListFrm','WA_ShiftListFrm',
       'WA_CaLamViecFrm','CF_BranchListFrm','API_CaLamViec_NhanVien',
       'API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2');

/* Kinh phí công đoàn giữ business View và mutation legacy cho đến khi contract được audit riêng. */
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Save')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Save','API_LuuDong',
         N'@List=N''WA_KinhPhiCongDoanFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Delete')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Delete','API_XoaDong',
         N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    GROUP BY T.ApiList, T.Func
    HAVING COUNT(*) > 1
)
    THROW 56300, N'RELEASE_ROUTE_DUPLICATE', 1;

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    WHERE OBJECT_ID(N'dbo.' + T.DesiredProcedure, N'P') IS NULL
)
    THROW 56301, N'RELEASE_ROUTE_PROCEDURE_MISSING', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) NOT IN
        (T.DesiredProcedure, ISNULL(T.KnownOriginalProcedure,T.DesiredProcedure))
)
    THROW 56302, N'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED', 1;

BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO dbo.WA_FieldContractRouteBackup
    (
        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
        [SQL], Para, BackupTime, BackupUser
    )
    SELECT
        @MetadataBatchID, T.ApiList, T.ApiList, T.Func,
        CASE WHEN A.[list] IS NULL THEN 0 ELSE 1 END,
        A.[SQL], A.Para, SYSUTCDATETIME(), @Actor
    FROM @Targets AS T
    LEFT JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE A.[list] IS NULL
       OR PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    UPDATE A
    SET [SQL] = T.DesiredProcedure, Para = T.DesiredPara
    FROM dbo.WA_API AS A
    INNER JOIN @Targets AS T ON T.ApiList = A.[list] AND T.Func = A.[func]
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    INSERT INTO dbo.WA_API ([list],[func],[SQL],Para)
    SELECT T.ApiList,T.Func,T.DesiredProcedure,T.DesiredPara
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.WA_API AS A
        WHERE A.[list] = T.ApiList AND A.[func] = T.Func
    );

    EXEC dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName = NULL,
        @UserName = @Actor,
        @BatchID = @FieldBatchID OUTPUT;

    IF EXISTS (SELECT 1 FROM dbo.WA_DatabaseReleaseHistory WHERE ReleaseID = @ReleaseID)
        UPDATE dbo.WA_DatabaseReleaseHistory
        SET InstalledAt = SYSUTCDATETIME(), InstalledBy = @Actor,
            ReleaseMode = '$(ReleaseMode)', MetadataRouteBatchID = @MetadataBatchID,
            FieldRouteBatchID = @FieldBatchID, Status = 'INSTALLED',
            ManifestSha256 = '4e594fe8ca7978f795ada71b45044019c79cee25ec9b060a83c7a5e2bd79fbe0',
            RolledBackAt = NULL, RolledBackBy = NULL
        WHERE ReleaseID = @ReleaseID;
    ELSE
        INSERT INTO dbo.WA_DatabaseReleaseHistory
        (
            ReleaseID,InstalledAt,InstalledBy,ReleaseMode,MetadataRouteBatchID,
            FieldRouteBatchID,Status,ManifestSha256
        )
        VALUES
        (
            @ReleaseID,SYSUTCDATETIME(),@Actor,'$(ReleaseMode)',@MetadataBatchID,
            @FieldBatchID,'INSTALLED','4e594fe8ca7978f795ada71b45044019c79cee25ec9b060a83c7a5e2bd79fbe0'
        );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/13_WaApiCutover/001_route_backup_and_cutover.sql ===== */

/* ===== SOURCE: sql/ProductionDatabaseRelease/source/14_Verification/001_install_summary.sql | SHA-256: 6ac258c3ee00156e567da4d74f72eed4215ad3eaa3f673bef2e6f1aa7365d951 ===== */

SET NOCOUNT ON;
SELECT
    N'HRM_DB_CLEANUP_20260729' AS ReleaseID,
    N'INSTALL_COMPLETED' AS InstallStatus,
    49 AS CanonicalObjectCount,
    45 AS ManualReviewCount,
    SYSUTCDATETIME() AS CompletedAtUtc;
GO
/* ===== END SOURCE: sql/ProductionDatabaseRelease/source/14_Verification/001_install_summary.sql ===== */
