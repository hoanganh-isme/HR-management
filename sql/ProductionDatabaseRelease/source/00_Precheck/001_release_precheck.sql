
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
