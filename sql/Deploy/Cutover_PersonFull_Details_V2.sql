/*
  Cutover các tab chi tiết của WA_PersonFullFrm sang API_TruyVanDong_V2.

  Nguyên tắc:
  - Chỉ đọc; không công bố Save/Delete cho các tab detail.
  - Quyền menu kế thừa từ WA_PersonFullFrm.
  - Quyền chi nhánh được kiểm tra qua HR_PersonTbl(PersonID, BranchID), kể cả
    khi bảng detail không có BranchID.
  - Không INSERT route mới vào WA_API. Route View phải tồn tại duy nhất trước
    khi chạy; script chỉ cập nhật route hiện có để tương thích gateway hiện tại.

  Chạy trước:
  1. sql/UnifiedContractRollout/02_CREATE_DYNAMIC_REGISTRY_WRAPPERS.sql
  2. sql/UnifiedContractRollout/07_UPDATE_GENERIC_VIEW_V2.sql
  3. sql/API/APINEW/API_HoSoNhanVien.sql
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
    THROW 51480, N'PERSON_DETAIL_V2_CONTROL_SCHEMA_NOT_READY', 1;

IF OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P') IS NULL
   OR OBJECT_DEFINITION(OBJECT_ID(N'dbo.API_TruyVanDong_V2', N'P'))
        NOT LIKE N'%PHASE3_BRANCH_SCOPE_PARENT_CONTRACT_REQUIRED%'
    THROW 51481, N'PERSON_DETAIL_V2_RUN_UPDATED_GENERIC_VIEW_FIRST', 1;

IF OBJECT_ID(N'dbo.HR_PersonTbl', N'U') IS NULL
   OR COL_LENGTH(N'dbo.HR_PersonTbl', N'PersonID') IS NULL
   OR COL_LENGTH(N'dbo.HR_PersonTbl', N'BranchID') IS NULL
    THROW 51482, N'PERSON_DETAIL_V2_PARENT_SCOPE_NOT_AVAILABLE', 1;

DECLARE @Actor varchar(100) = 'SYSTEM_PERSON_DETAIL_V2';
DECLARE @Now datetime2(3) = SYSUTCDATETIME();
DECLARE @BackupBatchID uniqueidentifier = NEWID();

DECLARE @DetailContracts table
(
    DatasetKey varchar(80) NOT NULL PRIMARY KEY,
    ApiList varchar(100) NOT NULL UNIQUE,
    TableName sysname NOT NULL,
    PrimaryKey sysname NOT NULL,
    CaptionVN nvarchar(200) NOT NULL,
    CaptionEN nvarchar(200) NOT NULL
);

INSERT INTO @DetailContracts
    (DatasetKey, ApiList, TableName, PrimaryKey, CaptionVN, CaptionEN)
VALUES
    ('PERSON_SALARY',    'API_PersonFull_T1_Salary',    N'HR_PersonSalaryTbl',    N'UserAutoID', N'Quá trình lương',       N'Salary'),
    ('PERSON_ALLOWANCE', 'API_PersonFull_T2_Allowance', N'HR_PersonAllowanceTbl', N'UserAutoID', N'Phụ cấp',               N'Allowance'),
    ('PERSON_REWARD',    'API_PersonFull_T3_KTKL',      N'HR_PersonKTKLTbl',      N'UserAutoID', N'Khen thưởng - Kỷ luật', N'Reward'),
    ('PERSON_LEAVE',     'API_PersonFull_T4_NghiPhep',  N'HR_PersonNghiPhepTbl',  N'UserAutoID', N'Nghỉ phép',             N'Leave'),
    ('PERSON_RELATION',  'API_PersonFull_T5_Relation',  N'HR_PersonRelationTbl',  N'UserAutoID', N'Gia cảnh',              N'Relation'),
    ('PERSON_CONTRACT',  'API_PersonFull_T6_HopDong',   N'HR_HopDongTbl',         N'MaHopDong',  N'Hợp đồng',              N'Contract'),
    ('PERSON_WORK',      'API_PersonFull_T7_CongTac',   N'HR_LichSuCongTacTbl',   N'UserAutoID', N'Công tác',              N'Work history'),
    ('PERSON_LOG',       'API_PersonFull_T8_Log',       N'HR_PersonLogTbl',       N'UserAutoID', N'Lịch sử công việc',     N'Work log'),
    ('PERSON_DOCUMENT',  'API_PersonFull_T9_GiayTo',    N'HR_PersonGiayToTbl',    N'DocumentID', N'Giấy tờ',               N'Document');

/* Chặn cutover nếu mapping vật lý chưa thể chứng minh an toàn. */
IF EXISTS
(
    SELECT 1
    FROM @DetailContracts AS Detail
    WHERE OBJECT_ID(N'dbo.' + Detail.TableName, N'U') IS NULL
       OR COL_LENGTH(N'dbo.' + Detail.TableName, Detail.PrimaryKey) IS NULL
       OR COL_LENGTH(N'dbo.' + Detail.TableName, N'PersonID') IS NULL
)
BEGIN
    SELECT
        Detail.DatasetKey,
        Detail.ApiList,
        Detail.TableName,
        Detail.PrimaryKey,
        CONVERT(bit, CASE
            WHEN OBJECT_ID(N'dbo.' + Detail.TableName, N'U') IS NULL THEN 1
            ELSE 0
        END) AS IsTableMissing,
        CONVERT(bit, CASE
            WHEN OBJECT_ID(N'dbo.' + Detail.TableName, N'U') IS NOT NULL
             AND COL_LENGTH(N'dbo.' + Detail.TableName, Detail.PrimaryKey) IS NULL
                THEN 1
            ELSE 0
        END) AS IsPrimaryKeyColumnMissing,
        CONVERT(bit, CASE
            WHEN OBJECT_ID(N'dbo.' + Detail.TableName, N'U') IS NOT NULL
             AND COL_LENGTH(N'dbo.' + Detail.TableName, N'PersonID') IS NULL
                THEN 1
            ELSE 0
        END) AS IsPersonIDColumnMissing
    FROM @DetailContracts AS Detail
    WHERE OBJECT_ID(N'dbo.' + Detail.TableName, N'U') IS NULL
       OR COL_LENGTH(N'dbo.' + Detail.TableName, Detail.PrimaryKey) IS NULL
       OR COL_LENGTH(N'dbo.' + Detail.TableName, N'PersonID') IS NULL
    ORDER BY Detail.DatasetKey;

    THROW 51483, N'PERSON_DETAIL_V2_TABLE_OR_COLUMN_NOT_FOUND', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @DetailContracts AS Detail
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes AS UniqueIndex
        INNER JOIN sys.index_columns AS IndexColumn
            ON IndexColumn.object_id = UniqueIndex.object_id
           AND IndexColumn.index_id = UniqueIndex.index_id
           AND IndexColumn.key_ordinal > 0
        WHERE UniqueIndex.object_id = OBJECT_ID(N'dbo.' + Detail.TableName, N'U')
          AND UniqueIndex.is_unique = 1
          AND UniqueIndex.is_disabled = 0
        GROUP BY UniqueIndex.index_id
        HAVING COUNT(*) = 1
           AND MAX(IndexColumn.column_id) =
               COLUMNPROPERTY(
                   OBJECT_ID(N'dbo.' + Detail.TableName, N'U'),
                   Detail.PrimaryKey,
                   'ColumnId'
               )
    )
)
BEGIN
    SELECT
        Detail.DatasetKey,
        Detail.ApiList,
        Detail.TableName,
        Detail.PrimaryKey,
        N'PRIMARY_KEY_NOT_PROVEN_UNIQUE' AS Diagnostic
    FROM @DetailContracts AS Detail
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes AS UniqueIndex
        INNER JOIN sys.index_columns AS IndexColumn
            ON IndexColumn.object_id = UniqueIndex.object_id
           AND IndexColumn.index_id = UniqueIndex.index_id
           AND IndexColumn.key_ordinal > 0
        WHERE UniqueIndex.object_id = OBJECT_ID(N'dbo.' + Detail.TableName, N'U')
          AND UniqueIndex.is_unique = 1
          AND UniqueIndex.is_disabled = 0
        GROUP BY UniqueIndex.index_id
        HAVING COUNT(*) = 1
           AND MAX(IndexColumn.column_id) =
               COLUMNPROPERTY(
                   OBJECT_ID(N'dbo.' + Detail.TableName, N'U'),
                   Detail.PrimaryKey,
                   'ColumnId'
               )
    )
    ORDER BY Detail.DatasetKey;

    THROW 51484, N'PERSON_DETAIL_V2_PRIMARY_KEY_NOT_PROVEN_UNIQUE', 1;
END;

IF EXISTS
(
    SELECT Detail.ApiList
    FROM @DetailContracts AS Detail
    LEFT JOIN dbo.WA_API AS Route
        ON Route.[list] = Detail.ApiList
       AND Route.[func] = 'View'
    GROUP BY Detail.ApiList
    HAVING COUNT(Route.[list]) <> 1
)
    THROW 51485, N'PERSON_DETAIL_V2_EXISTING_VIEW_ROUTE_REQUIRED', 1;

IF
(
    SELECT COUNT(*)
    FROM dbo.WA_API AS MasterRoute
    WHERE MasterRoute.[list] = 'WA_PersonFullFrm'
      AND MasterRoute.[func] = 'View'
) <> 1
    THROW 51489, N'PERSON_MASTER_EXISTING_VIEW_ROUTE_REQUIRED', 1;

IF EXISTS
(
    SELECT Detail.ApiList, Route.[func]
    FROM @DetailContracts AS Detail
    INNER JOIN dbo.WA_API AS Route
        ON Route.[list] = Detail.ApiList
       AND Route.[func] IN ('View', 'Save', 'Delete')
    GROUP BY Detail.ApiList, Route.[func]
    HAVING COUNT(*) > 1
)
    THROW 51486, N'PERSON_DETAIL_V2_DUPLICATE_ROUTE_FOUND', 1;

IF EXISTS
(
    SELECT 1
    FROM dbo.WA_FieldDatasetRegistry AS ExistingDataset
    INNER JOIN @DetailContracts AS Detail
        ON Detail.ApiList = ExistingDataset.ApiList
    WHERE ExistingDataset.WebFormName <> 'WA_PersonFullFrm'
       OR ExistingDataset.DatasetKey <> Detail.DatasetKey
)
    THROW 51487, N'PERSON_DETAIL_V2_API_LIST_ALREADY_OWNED', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    /*
      Form cha vẫn giữ COMPLEX_DEFERRED vì wizard/attachment có runtime riêng.
      Dataset con được audit và ACTIVE độc lập.
    */
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry
        WHERE WebFormName = 'WA_PersonFullFrm'
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
            'WA_PersonFullFrm', 'WA_PersonFullFrm', 'WA_PersonFullFrm',
            'COMPLEX_DEFERRED', N'HR_PersonTbl', N'PersonID',
            'WA_PersonFullFrm', N'API_HoSoNhanVien',
            NULL, NULL, 'CUSTOM_PROCEDURE', 'BRANCH_SCOPED',
            'AUTO_SCHEMA', 'DEFERRED',
            N'Wizard và attachment giữ runtime riêng; detail đọc bằng V2.',
            2, 1, @Now, @Actor, @Now, @Actor
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.WA_FieldContractRegistry
        SET
            ERPFormID = 'WA_PersonFullFrm',
            PermissionFormName = 'WA_PersonFullFrm',
            ExpectedTableName = N'HR_PersonTbl',
            ExpectedPrimaryKey = N'PersonID',
            ViewList = 'WA_PersonFullFrm',
            ViewProcedure = N'API_HoSoNhanVien',
            BranchPolicy = 'BRANCH_SCOPED',
            IsEnabled = 1,
            UpdatedAt = @Now,
            UpdatedBy = @Actor
        WHERE WebFormName = 'WA_PersonFullFrm';
    END;

    UPDATE RegisteredForm
    SET
        RegisteredForm.FormType = 'LIST',
        RegisteredForm.CaptionVN = Detail.CaptionVN,
        RegisteredForm.CaptionEN = Detail.CaptionEN,
        RegisteredForm.TableName = Detail.TableName,
        RegisteredForm.PrimaryKey = Detail.PrimaryKey
    FROM dbo.SY_FrmLstTbl AS RegisteredForm
    INNER JOIN @DetailContracts AS Detail
        ON Detail.ApiList = RegisteredForm.FormID;

    INSERT INTO dbo.SY_FrmLstTbl
        (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey)
    SELECT
        Detail.ApiList,
        'LIST',
        Detail.CaptionVN,
        Detail.CaptionEN,
        Detail.TableName,
        Detail.PrimaryKey
    FROM @DetailContracts AS Detail
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.SY_FrmLstTbl AS RegisteredForm
        WHERE RegisteredForm.FormID = Detail.ApiList
    );

    UPDATE ExistingDataset
    SET
        ExistingDataset.ApiList = Detail.ApiList,
        ExistingDataset.ViewProcedure = N'API_TruyVanDong_V2',
        ExistingDataset.ExpectedTableName = Detail.TableName,
        ExistingDataset.ExpectedPrimaryKey = Detail.PrimaryKey,
        ExistingDataset.ParentField = N'PersonID',
        ExistingDataset.ChildField = N'PersonID',
        ExistingDataset.IsReadOnly = 1,
        ExistingDataset.SaveProcedure = NULL,
        ExistingDataset.DeleteProcedure = NULL,
        ExistingDataset.WritePolicy = 'READ_ONLY',
        ExistingDataset.BranchPolicy = 'BRANCH_SCOPED',
        ExistingDataset.RolloutStatus = 'ACTIVE',
        ExistingDataset.RolloutReason = N'PERSON_DETAIL_READ_ONLY_V2',
        ExistingDataset.SchemaVersion = 2,
        ExistingDataset.UpdatedAt = @Now,
        ExistingDataset.UpdatedBy = @Actor
    FROM dbo.WA_FieldDatasetRegistry AS ExistingDataset
    INNER JOIN @DetailContracts AS Detail
        ON Detail.DatasetKey = ExistingDataset.DatasetKey
    WHERE ExistingDataset.WebFormName = 'WA_PersonFullFrm';

    INSERT INTO dbo.WA_FieldDatasetRegistry
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT
        'WA_PersonFullFrm',
        Detail.DatasetKey,
        Detail.ApiList,
        N'API_TruyVanDong_V2',
        Detail.TableName,
        Detail.PrimaryKey,
        N'PersonID',
        N'PersonID',
        1,
        NULL,
        NULL,
        'READ_ONLY',
        'BRANCH_SCOPED',
        'ACTIVE',
        N'PERSON_DETAIL_READ_ONLY_V2',
        2,
        @Now,
        @Actor,
        @Now,
        @Actor
    FROM @DetailContracts AS Detail
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldDatasetRegistry AS ExistingDataset
        WHERE ExistingDataset.WebFormName = 'WA_PersonFullFrm'
          AND ExistingDataset.DatasetKey = Detail.DatasetKey
    );

    /* Lưu route cũ để có thể khôi phục bằng BackupBatchID. */
    INSERT INTO dbo.WA_FieldContractRouteBackup
    (
        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
        [SQL], Para, BackupTime, BackupUser
    )
    SELECT
        @BackupBatchID,
        'WA_PersonFullFrm',
        ExistingRoute.[list],
        ExistingRoute.[func],
        1,
        ExistingRoute.[SQL],
        ExistingRoute.Para,
        @Now,
        @Actor
    FROM dbo.WA_API AS ExistingRoute
    INNER JOIN @DetailContracts AS Detail
        ON Detail.ApiList = ExistingRoute.[list]
    WHERE ExistingRoute.[func] IN ('View', 'Save', 'Delete');

    INSERT INTO dbo.WA_FieldContractRouteBackup
    (
        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
        [SQL], Para, BackupTime, BackupUser
    )
    SELECT
        @BackupBatchID,
        'WA_PersonFullFrm',
        MasterRoute.[list],
        MasterRoute.[func],
        1,
        MasterRoute.[SQL],
        MasterRoute.Para,
        @Now,
        @Actor
    FROM dbo.WA_API AS MasterRoute
    WHERE MasterRoute.[list] = 'WA_PersonFullFrm'
      AND MasterRoute.[func] = 'View';

    /*
      Route chính phải truyền actor do gateway xác thực. Stored procedure tự
      đối chiếu BranchID với SY_User và không tin phạm vi do client mở rộng.
    */
    UPDATE MasterRoute
    SET
        MasterRoute.[SQL] = N'API_HoSoNhanVien',
        MasterRoute.Para =
            N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', '
            + N'@PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', '
            + N'@LoaiHD=N''{LoaiHD}'', @PersonStatusName=N''{PersonStatusName}'', '
            + N'@PersonStatus=N''{PersonStatus}'', @UserName=N''{User}'''
    FROM dbo.WA_API AS MasterRoute
    WHERE MasterRoute.[list] = 'WA_PersonFullFrm'
      AND MasterRoute.[func] = 'View';

    UPDATE ViewRoute
    SET
        ViewRoute.[SQL] = N'API_TruyVanDong_V2',
        ViewRoute.Para =
            N'@List=N''{List}'', @Keyword=N''{Keyword}'', '
            + N'@SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', '
            + N'@Data=N''{JsonData}'', @UserName=N''{User}'', '
            + N'@BranchID=N''{BranchID}'''
    FROM dbo.WA_API AS ViewRoute
    INNER JOIN @DetailContracts AS Detail
        ON Detail.ApiList = ViewRoute.[list]
    WHERE ViewRoute.[func] = 'View';

    /* Các tab detail trên web là read-only; không để lại route ghi legacy. */
    DELETE MutationRoute
    FROM dbo.WA_API AS MutationRoute
    INNER JOIN @DetailContracts AS Detail
        ON Detail.ApiList = MutationRoute.[list]
    WHERE MutationRoute.[func] IN ('Save', 'Delete');

    IF EXISTS
    (
        SELECT 1
        FROM @DetailContracts AS Detail
        LEFT JOIN dbo.API_Phase3SimpleCrudRegistry() AS Contract
            ON Contract.WebFormName = Detail.ApiList
           AND Contract.EnableView = 1
        LEFT JOIN dbo.WA_API AS ViewRoute
            ON ViewRoute.[list] = Detail.ApiList
           AND ViewRoute.[func] = 'View'
        WHERE Contract.WebFormName IS NULL
           OR Contract.ViewV2 <> N'API_TruyVanDong_V2'
           OR ViewRoute.[SQL] <> N'API_TruyVanDong_V2'
    )
        THROW 51488, N'PERSON_DETAIL_V2_POST_CUTOVER_VERIFICATION_FAILED', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_API AS MasterRoute
        WHERE MasterRoute.[list] = 'WA_PersonFullFrm'
          AND MasterRoute.[func] = 'View'
          AND PARSENAME(LTRIM(RTRIM(MasterRoute.[SQL])), 1)
              COLLATE DATABASE_DEFAULT = 'API_HoSoNhanVien' COLLATE DATABASE_DEFAULT
          AND MasterRoute.Para LIKE N'%@UserName=N''{User}''%'
    )
        THROW 51490, N'PERSON_MASTER_SECURE_ROUTE_VERIFICATION_FAILED', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    @BackupBatchID AS BackupBatchID,
    Detail.DatasetKey,
    Detail.ApiList,
    Detail.TableName,
    Detail.PrimaryKey,
    Contract.PermissionFormName,
    Contract.BranchPolicy,
    Contract.EnableView,
    ViewRoute.[SQL] AS ViewProcedure
FROM @DetailContracts AS Detail
INNER JOIN dbo.API_Phase3SimpleCrudRegistry() AS Contract
    ON Contract.WebFormName = Detail.ApiList
LEFT JOIN dbo.WA_API AS ViewRoute
    ON ViewRoute.[list] = Detail.ApiList
   AND ViewRoute.[func] = 'View'
ORDER BY Detail.DatasetKey;
GO
