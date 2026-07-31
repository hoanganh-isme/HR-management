
/*
  Explicit seed cho các contract đã audit. Chỉ INSERT bản ghi thiếu; không ghi đè quyết định manual.
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
