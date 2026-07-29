/*
  Seed idempotent cho sáu form và hai dataset đã được audit ở các phase trước.
  Chỉ cập nhật lại bản ghi còn do seed sở hữu, không ghi đè quyết định manual.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
    THROW 54200, N'FIELD_CONTRACT_CONTROL_REGISTRY_NOT_INSTALLED', 1;

BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @Now datetime2(3) = SYSUTCDATETIME();
    DECLARE @Actor varchar(100) = 'CONFIRMED_PHASE3_PHASE4_SEED';

    INSERT INTO dbo.WA_FieldContractRegistry
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
        IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT
        V.WebFormName, V.ERPFormID, V.PermissionFormName, V.ContractType,
        V.ExpectedTableName, V.ExpectedPrimaryKey, V.ViewList, V.ViewProcedure,
        V.SaveProcedure, V.DeleteProcedure, V.WritePolicy, V.BranchPolicy,
        V.DeletePolicy, V.RolloutStatus, V.RolloutReason, 2,
        1, @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (
            CONVERT(varchar(100), 'WA_BangThueTNCNFrm'),
            CONVERT(varchar(100), 'HR_BangThueTNCNFrm'),
            CONVERT(varchar(100), 'WA_BangThueTNCNFrm'),
            CONVERT(varchar(40), 'SIMPLE_TABLE'),
            CONVERT(sysname, N'HR_BangThueTNCNTbl'),
            CONVERT(sysname, N'Bac'),
            CONVERT(varchar(100), 'WA_BangThueTNCNFrm'),
            CONVERT(sysname, N'API_TruyVanDong_V2'),
            CONVERT(sysname, N'API_LuuDong_V2'),
            CONVERT(sysname, N'API_XoaDong_V2'),
            CONVERT(varchar(40), 'SAFE_TABLE_COLUMNS'),
            CONVERT(varchar(40), 'GLOBAL_REFERENCE'),
            CONVERT(varchar(40), 'AUTO_SCHEMA'),
            CONVERT(varchar(20), 'SHADOW'),
            CONVERT(nvarchar(500), N'CONFIRMED_PHASE3_READY_FOR_CUTOVER')
        ),
        (
            'WA_ChucDanhFrm', 'WA_ChucDanhFrm', 'WA_ChucDanhFrm',
            'SIMPLE_TABLE', N'HR_ChucDanhTbl', N'ChucDanhChuyenMon',
            'WA_ChucDanhFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'GLOBAL_REFERENCE', 'AUTO_SCHEMA',
            'SHADOW', N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'
        ),
        (
            'WA_TitleListFrm', 'WA_TitleListFrm', 'WA_TitleListFrm',
            'SIMPLE_TABLE', N'HR_TitleListTbl', N'TitleName',
            'WA_TitleListFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'GLOBAL_REFERENCE', 'AUTO_SCHEMA',
            'SHADOW', N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'
        ),
        (
            'WA_ShiftListFrm', 'WA_ShiftListFrm', 'WA_ShiftListFrm',
            'SIMPLE_TABLE', N'HR_ShiftListTbl', N'ShiftID',
            'WA_ShiftListFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'GLOBAL_REFERENCE', 'AUTO_SCHEMA',
            'SHADOW', N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'
        ),
        (
            'CF_BranchListFrm', 'CF_BranchListFrm', 'CF_BranchListFrm',
            'SIMPLE_TABLE', N'CF_BranchTbl', N'BranchID',
            'CF_BranchListFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'BRANCH_SCOPED', 'AUTO_SCHEMA',
            'SHADOW', N'CONFIRMED_BRANCH_DIRECTORY_READY_FOR_CUTOVER'
        ),
        (
            'WA_CaLamViecFrm', 'WA_CaLamViecFrm', 'WA_CaLamViecFrm',
            'MASTER_DETAIL_SIMPLE', N'HR_SapCaTbl', N'SapCaID',
            'WA_CaLamViecFrm', N'API_TruyVanDong_V2',
            N'API_LuuDong_V2', N'API_XoaDong_V2',
            'SAFE_TABLE_COLUMNS', 'AUTO_SCHEMA', 'AUTO_SCHEMA',
            'SHADOW', N'CONFIRMED_PHASE4_MASTER_DETAIL_READY_FOR_CUTOVER'
        )
    ) AS V
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason
    )
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry AS R
        WHERE R.WebFormName = V.WebFormName
    );

    /*
      Danh mục chi nhánh chỉ đọc các cột vật lý của CF_BranchTbl nên đã được audit
      là SIMPLE_TABLE. Chỉ thay kết quả discovery tự động; contract do quản trị viên
      khai báo thủ công vẫn được giữ nguyên.
    */
    UPDATE R
    SET ERPFormID = 'CF_BranchListFrm',
        PermissionFormName = 'CF_BranchListFrm',
        ContractType = 'SIMPLE_TABLE',
        ExpectedTableName = N'CF_BranchTbl',
        ExpectedPrimaryKey = N'BranchID',
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
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.WebFormName = 'CF_BranchListFrm'
      AND R.CreatedBy = 'SYSTEM_DISCOVERY';

    INSERT INTO dbo.WA_FieldDatasetRegistry
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT
        V.WebFormName, V.DatasetKey, V.ApiList, V.ViewProcedure,
        V.ExpectedTableName, V.ExpectedPrimaryKey, V.ParentField, V.ChildField,
        V.IsReadOnly, V.SaveProcedure, V.DeleteProcedure, V.WritePolicy,
        V.BranchPolicy, V.RolloutStatus, V.RolloutReason, 2,
        @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (
            CONVERT(varchar(100), 'WA_CaLamViecFrm'),
            CONVERT(varchar(80), 'SHIFT_DETAIL'),
            CONVERT(varchar(100), 'API_CaLamViec_ChiTiet'),
            CONVERT(sysname, N'API_CaLamViec_ChiTiet'),
            CONVERT(sysname, N'HR_SapCaChiTietTbl'),
            CONVERT(sysname, N'UserAutoID'),
            CONVERT(sysname, N'SapCaID'),
            CONVERT(sysname, N'SapCaID'),
            CONVERT(bit, 1),
            CONVERT(sysname, NULL),
            CONVERT(sysname, NULL),
            CONVERT(varchar(40), 'READ_ONLY'),
            CONVERT(varchar(40), 'AUTO_SCHEMA'),
            CONVERT(varchar(20), 'SHADOW'),
            CONVERT(nvarchar(500), N'CONFIRMED_PHASE4_READ_ONLY_READY_FOR_CUTOVER')
        ),
        (
            'WA_CaLamViecFrm', 'SHIFT_EMPLOYEES',
            'API_CaLamViec_NhanVien', N'API_CaLamViec_NhanVien',
            N'HR_SapCaNhanVienTbl', N'UserAutoID', N'SapCaID', N'SapCaID',
            0, N'API_LuuDong_V2', N'API_XoaDong_V2',
            'VIEW_PHYSICAL_COLUMNS', 'AUTO_SCHEMA', 'SHADOW',
            N'CONFIRMED_PHASE4_EDITABLE_READY_FOR_CUTOVER'
        )
    ) AS V
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason
    )
    WHERE EXISTS
    (
        SELECT 1 FROM dbo.WA_FieldContractRegistry AS R
        WHERE R.WebFormName = V.WebFormName
    )
      AND NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS D
        WHERE D.WebFormName = V.WebFormName
          AND D.DatasetKey = V.DatasetKey
    );

    /*
      Hạ các seed cũ chưa từng cutover về SHADOW. Bản ghi đã cutover có UpdatedBy
      khác @Actor nên không bị đổi trạng thái khi chạy lại script này.
    */
    UPDATE R
    SET RolloutStatus = 'SHADOW',
        RolloutReason = CASE
            WHEN R.ContractType = 'MASTER_DETAIL_SIMPLE'
                THEN N'CONFIRMED_PHASE4_MASTER_DETAIL_READY_FOR_CUTOVER'
            ELSE N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'
        END,
        UpdatedAt = @Now,
        UpdatedBy = @Actor
    FROM dbo.WA_FieldContractRegistry AS R
    WHERE R.CreatedBy = @Actor
      AND R.UpdatedBy = @Actor
      AND R.RolloutStatus = 'ACTIVE';

    UPDATE D
    SET RolloutStatus = 'SHADOW',
        RolloutReason = CASE
            WHEN D.IsReadOnly = 1
                THEN N'CONFIRMED_PHASE4_READ_ONLY_READY_FOR_CUTOVER'
            ELSE N'CONFIRMED_PHASE4_EDITABLE_READY_FOR_CUTOVER'
        END,
        UpdatedAt = @Now,
        UpdatedBy = @Actor
    FROM dbo.WA_FieldDatasetRegistry AS D
    WHERE D.CreatedBy = @Actor
      AND D.UpdatedBy = @Actor
      AND D.RolloutStatus = 'ACTIVE';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT *
FROM dbo.WA_FieldContractRegistry
WHERE WebFormName IN
    ('WA_BangThueTNCNFrm', 'WA_ChucDanhFrm', 'WA_TitleListFrm', 'WA_ShiftListFrm',
     'CF_BranchListFrm', 'WA_CaLamViecFrm')
ORDER BY WebFormName;

SELECT *
FROM dbo.WA_FieldDatasetRegistry
WHERE WebFormName = 'WA_CaLamViecFrm'
ORDER BY DatasetKey;
