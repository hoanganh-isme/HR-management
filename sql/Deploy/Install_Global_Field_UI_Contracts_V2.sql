/*
  Metadata giao diện/lookup V2 dùng chung cho hồ sơ nhân viên và các field
  ca làm việc đã được đăng ký contract.

  Điều kiện:
  - Đã chạy UnifiedContractRollout/01_CREATE_CONTROL_REGISTRY.sql.
  - WA_PersonFullFrm đã được đăng ký Field Contract V2.
  - Các nguồn động phải là route View duy nhất trong WA_API.

  File không đọc hoặc ghi SY_FormatFields/SY_FrmDrdwTbl.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_LookupContractV2', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_LookupOptionV2', N'U') IS NULL
    THROW 51500, N'FIELD_UI_CONTRACT_V2_REGISTRY_NOT_INSTALLED', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.WA_FieldContractRegistry
    WHERE WebFormName = 'WA_PersonFullFrm'
      AND IsEnabled = 1
)
    THROW 51501, N'WA_PERSONFULLFRM_FIELD_CONTRACT_V2_NOT_REGISTERED', 1;

DECLARE @RequiredRoutes table
(
    RegisteredList varchar(50) NOT NULL PRIMARY KEY
);

INSERT INTO @RequiredRoutes(RegisteredList)
VALUES
    ('CF_BranchListFrm'),
    ('API_ComboPersonStatus'),
    ('API_DanhSachChucVu'),
    ('API_DanhSachChucDanh'),
    ('API_HR_DropdownShifts');

IF EXISTS
(
    SELECT 1
    FROM @RequiredRoutes AS RequiredRoute
    WHERE
    (
        SELECT COUNT(*)
        FROM dbo.WA_API AS Route
        WHERE Route.[list] = RequiredRoute.RegisteredList
          AND LOWER(LTRIM(RTRIM(Route.[func]))) = 'view'
    ) <> 1
)
BEGIN
    SELECT
        RequiredRoute.RegisteredList,
        Route.STT,
        Route.[func],
        Route.[SQL],
        Route.Para
    FROM @RequiredRoutes AS RequiredRoute
    LEFT JOIN dbo.WA_API AS Route
      ON Route.[list] = RequiredRoute.RegisteredList
     AND LOWER(LTRIM(RTRIM(Route.[func]))) = 'view'
    WHERE
    (
        SELECT COUNT(*)
        FROM dbo.WA_API AS DuplicateCheck
        WHERE DuplicateCheck.[list] = RequiredRoute.RegisteredList
          AND LOWER(LTRIM(RTRIM(DuplicateCheck.[func]))) = 'view'
    ) <> 1
    ORDER BY RequiredRoute.RegisteredList, Route.STT;

    THROW 51502, N'FIELD_UI_CONTRACT_V2_LOOKUP_ROUTE_MISSING_OR_DUPLICATED', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @LookupManifest table
    (
        LookupCode varchar(100) NOT NULL PRIMARY KEY,
        SourceType varchar(20) NOT NULL,
        RegisteredList varchar(50) NULL,
        ValueColumn sysname NOT NULL,
        DisplayColumn sysname NOT NULL,
        DisplayColumns nvarchar(1000) NULL,
        DependsOn nvarchar(500) NULL,
        BranchPolicy varchar(40) NOT NULL
    );

    INSERT INTO @LookupManifest
    (
        LookupCode,
        SourceType,
        RegisteredList,
        ValueColumn,
        DisplayColumn,
        DisplayColumns,
        DependsOn,
        BranchPolicy
    )
    VALUES
        ('PERSON_GENDER', 'VALUE_LIST', NULL,
         'Value', 'Display', N'Value,Display', NULL, 'GLOBAL_REFERENCE'),
        ('PERSON_BRANCH', 'REGISTERED_API', 'CF_BranchListFrm',
         'BranchID', 'BranchName', N'BranchID,BranchName', NULL, 'CALLER_SCOPE'),
        ('PERSON_STATUS', 'REGISTERED_API', 'API_ComboPersonStatus',
         'PersonStatus', 'PersonStatusName',
         N'PersonStatus,PersonStatusName', NULL, 'GLOBAL_REFERENCE'),
        ('PERSON_TITLE', 'REGISTERED_API', 'API_DanhSachChucVu',
         'TitleName', 'TitleName', N'TitleName,GhiChu', NULL, 'GLOBAL_REFERENCE'),
        ('PERSON_PROFESSIONAL_TITLE', 'REGISTERED_API', 'API_DanhSachChucDanh',
         'ChucDanhChuyenMon', 'ChucDanhChuyenMon',
         N'ChucDanhChuyenMon,MoTa', NULL, 'GLOBAL_REFERENCE'),
        ('PERSON_SHIFT', 'REGISTERED_API', 'API_HR_DropdownShifts',
         'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, 'GLOBAL_REFERENCE');

    UPDATE Target
    SET
        Target.SourceType = Source.SourceType,
        Target.RegisteredList = Source.RegisteredList,
        Target.ValueColumn = Source.ValueColumn,
        Target.DisplayColumn = Source.DisplayColumn,
        Target.DisplayColumns = Source.DisplayColumns,
        Target.DependsOn = Source.DependsOn,
        Target.BranchPolicy = Source.BranchPolicy,
        Target.IsEnabled = 1,
        Target.SchemaVersion = Target.SchemaVersion + 1,
        Target.UpdatedAt = SYSUTCDATETIME(),
        Target.UpdatedBy = 'SYSTEM_FIELD_UI_V2'
    FROM dbo.WA_LookupContractV2 AS Target
    INNER JOIN @LookupManifest AS Source
      ON Source.LookupCode = Target.LookupCode;

    INSERT INTO dbo.WA_LookupContractV2
    (
        LookupCode,
        SourceType,
        RegisteredList,
        ValueColumn,
        DisplayColumn,
        DisplayColumns,
        DependsOn,
        BranchPolicy,
        IsEnabled,
        SchemaVersion,
        CreatedBy,
        UpdatedBy
    )
    SELECT
        Source.LookupCode,
        Source.SourceType,
        Source.RegisteredList,
        Source.ValueColumn,
        Source.DisplayColumn,
        Source.DisplayColumns,
        Source.DependsOn,
        Source.BranchPolicy,
        1,
        1,
        'SYSTEM_FIELD_UI_V2',
        'SYSTEM_FIELD_UI_V2'
    FROM @LookupManifest AS Source
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_LookupContractV2 AS Target
        WHERE Target.LookupCode = Source.LookupCode
    );

    DELETE FROM dbo.WA_LookupOptionV2
    WHERE LookupCode = 'PERSON_GENDER';

    INSERT INTO dbo.WA_LookupOptionV2
    (
        LookupCode,
        OptionValue,
        OptionLabel,
        OrderNo,
        IsEnabled
    )
    VALUES
        ('PERSON_GENDER', N'Nam', N'Nam', 1, 1),
        ('PERSON_GENDER', N'Nữ', N'Nữ', 2, 1),
        ('PERSON_GENDER', N'Khác', N'Khác', 3, 1);

    DECLARE @FieldManifest table
    (
        WebFormName varchar(100) NOT NULL,
        DatasetKey varchar(80) NOT NULL,
        FieldName sysname NOT NULL,
        Caption nvarchar(200) NOT NULL,
        LookupCode varchar(100) NOT NULL,
        OrderNo int NULL,
        PRIMARY KEY (WebFormName, DatasetKey, FieldName)
    );

    INSERT INTO @FieldManifest
    (
        WebFormName,
        DatasetKey,
        FieldName,
        Caption,
        LookupCode,
        OrderNo
    )
    VALUES
        ('WA_PersonFullFrm', 'MAIN', 'GioiTinh',
         N'Giới tính', 'PERSON_GENDER', NULL),
        ('WA_PersonFullFrm', 'MAIN', 'BranchID',
         N'Chi nhánh', 'PERSON_BRANCH', NULL),
        ('WA_PersonFullFrm', 'MAIN', 'TitleName',
         N'Chức vụ', 'PERSON_TITLE', NULL),
        ('WA_PersonFullFrm', 'MAIN', 'ChucDanhChuyenMon',
         N'Chức danh chuyên môn',
         'PERSON_PROFESSIONAL_TITLE', NULL),
        ('WA_PersonFullFrm', 'MAIN', 'PersonStatus',
         N'Trạng thái', 'PERSON_STATUS', NULL),
        ('WA_PersonFullFrm', 'MAIN', 'ShiftID',
         N'Ca làm việc', 'PERSON_SHIFT', NULL);

    IF EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry
        WHERE WebFormName = 'WA_CaLamViecFrm'
          AND IsEnabled = 1
    )
    BEGIN
        INSERT INTO @FieldManifest
        (
            WebFormName,
            DatasetKey,
            FieldName,
            Caption,
            LookupCode,
            OrderNo
        )
        VALUES
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu2',
             N'Ca thứ 2', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu3',
             N'Ca thứ 3', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu4',
             N'Ca thứ 4', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu5',
             N'Ca thứ 5', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu6',
             N'Ca thứ 6', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu7',
             N'Ca thứ 7', 'PERSON_SHIFT', NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDChuNhat',
             N'Ca chủ nhật', 'PERSON_SHIFT', NULL);
    END;

    UPDATE Target
    SET
        Target.Caption = Source.Caption,
        Target.ControlType = 'LOOKUP',
        Target.FormatID = 'SL',
        Target.OrderNo = Source.OrderNo,
        Target.LookupCode = Source.LookupCode,
        Target.IsEnabled = 1,
        Target.SchemaVersion = Target.SchemaVersion + 1,
        Target.UpdatedAt = SYSUTCDATETIME(),
        Target.UpdatedBy = 'SYSTEM_FIELD_UI_V2'
    FROM dbo.WA_FieldUiContractV2 AS Target
    INNER JOIN @FieldManifest AS Source
      ON Target.WebFormName = Source.WebFormName
     AND Target.DatasetKey = Source.DatasetKey
     AND Target.FieldName = Source.FieldName;

    INSERT INTO dbo.WA_FieldUiContractV2
    (
        WebFormName,
        DatasetKey,
        FieldName,
        Caption,
        ControlType,
        FormatID,
        OrderNo,
        LookupCode,
        IsEnabled,
        SchemaVersion,
        CreatedBy,
        UpdatedBy
    )
    SELECT
        Source.WebFormName,
        Source.DatasetKey,
        Source.FieldName,
        Source.Caption,
        'LOOKUP',
        'SL',
        Source.OrderNo,
        Source.LookupCode,
        1,
        1,
        'SYSTEM_FIELD_UI_V2',
        'SYSTEM_FIELD_UI_V2'
    FROM @FieldManifest AS Source
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldUiContractV2 AS Target
        WHERE Target.WebFormName = Source.WebFormName
          AND Target.DatasetKey = Source.DatasetKey
          AND Target.FieldName = Source.FieldName
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT
    Ui.WebFormName,
    Ui.DatasetKey,
    Ui.FieldName,
    Ui.Caption,
    Ui.ControlType,
    Ui.LookupCode,
    CONVERT
    (
        varchar(64),
        HASHBYTES('SHA2_256', UPPER(LTRIM(RTRIM(Ui.LookupCode)))),
        2
    ) AS LookupKey,
    LookupContract.SourceType,
    LookupContract.RegisteredList,
    LookupContract.ValueColumn,
    LookupContract.DisplayColumn
FROM dbo.WA_FieldUiContractV2 AS Ui
INNER JOIN dbo.WA_LookupContractV2 AS LookupContract
  ON LookupContract.LookupCode = Ui.LookupCode
WHERE Ui.WebFormName IN ('WA_PersonFullFrm', 'WA_CaLamViecFrm')
  AND Ui.DatasetKey = 'MAIN'
  AND Ui.IsEnabled = 1
ORDER BY Ui.OrderNo, Ui.FieldName;
