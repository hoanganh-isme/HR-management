/*
  Cấu hình dropdown toàn cục bằng một bảng WA_FieldUiContractV2.
  Mọi dropdown đều gọi API_* thông qua route View duy nhất trong WA_API.
  File không đọc hoặc ghi SY_FormatFields/SY_FrmDrdwTbl.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
    THROW 51500, N'FIELD_UI_CONTRACT_V2_REGISTRY_NOT_INSTALLED', 1;

IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupList') IS NULL
    THROW 51501, N'FIELD_UI_CONTRACT_V2_SINGLE_TABLE_NOT_INSTALLED', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.WA_FieldContractRegistry
    WHERE WebFormName = 'WA_PersonFullFrm'
      AND IsEnabled = 1
)
    THROW 51502, N'WA_PERSONFULLFRM_FIELD_CONTRACT_V2_NOT_REGISTERED', 1;
GO

/*
  Danh sách giới tính là domain dùng chung, đặt trong API thay vì hard-code
  tại WizardForm hoặc từng trang detail.
*/
CREATE OR ALTER PROCEDURE dbo.API_ComboGioiTinh
    @Keyword nvarchar(200) = N'',
    @UserName varchar(100) = '',
    @BranchID varchar(max) = ''
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @UserName = LTRIM(RTRIM(ISNULL(@UserName, '')));

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SY_User
        WHERE UserName = @UserName
          AND ISNULL(Disable, 0) = 0
    )
        THROW 51503, N'LOOKUP_ACTOR_INVALID', 1;

    SELECT
        Gender.[Value],
        Gender.Display
    FROM
    (
        VALUES
            (1, N'Nam', N'Nam'),
            (2, N'Nữ', N'Nữ'),
            (3, N'Khác', N'Khác')
    ) AS Gender(OrderNo, [Value], Display)
    WHERE @Keyword = N''
       OR Gender.[Value] LIKE N'%' + @Keyword + N'%'
       OR Gender.Display LIKE N'%' + @Keyword + N'%'
    ORDER BY Gender.OrderNo;
END;
GO

/*
  API_ComboGioiTinh là route mới duy nhất cần đăng ký. Các API còn lại phải
  tồn tại sẵn; installer không tự đoán hoặc ghi đè route nghiệp vụ hiện hữu.
*/
IF
(
    SELECT COUNT(*)
    FROM dbo.WA_API
    WHERE [list] = 'API_ComboGioiTinh'
      AND LOWER(LTRIM(RTRIM([func]))) = 'view'
) > 1
    THROW 51504, N'API_COMBO_GIOITINH_ROUTE_DUPLICATED', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.WA_API
    WHERE [list] = 'API_ComboGioiTinh'
      AND LOWER(LTRIM(RTRIM([func]))) = 'view'
)
BEGIN
    INSERT INTO dbo.WA_API ([list], [func], [SQL], Para)
    VALUES
    (
        'API_ComboGioiTinh',
        'View',
        'API_ComboGioiTinh',
        '@Keyword=N''{Keyword}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
    );
END;
ELSE
BEGIN
    UPDATE dbo.WA_API
    SET
        [SQL] = 'API_ComboGioiTinh',
        Para = '@Keyword=N''{Keyword}'', @UserName=N''{User}'', @BranchID=N''{BranchID}'''
    WHERE [list] = 'API_ComboGioiTinh'
      AND LOWER(LTRIM(RTRIM([func]))) = 'view';
END;
GO

DECLARE @RequiredRoutes table
(
    RegisteredList varchar(50) NOT NULL PRIMARY KEY
);

INSERT INTO @RequiredRoutes(RegisteredList)
VALUES
    ('API_ComboGioiTinh'),
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

    THROW 51505, N'FIELD_UI_LOOKUP_API_ROUTE_MISSING_OR_DUPLICATED', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FieldManifest table
    (
        WebFormName varchar(100) NOT NULL,
        DatasetKey varchar(80) NOT NULL,
        FieldName sysname NOT NULL,
        Caption nvarchar(200) NOT NULL,
        LookupList varchar(50) NOT NULL,
        ValueColumn sysname NOT NULL,
        DisplayColumn sysname NOT NULL,
        DisplayColumns nvarchar(1000) NULL,
        Widths nvarchar(500) NULL,
        DependsOn nvarchar(500) NULL,
        IsMultiSelect bit NOT NULL,
        ReloadMode varchar(30) NULL,
        PRIMARY KEY (WebFormName, DatasetKey, FieldName)
    );

    INSERT INTO @FieldManifest
    (
        WebFormName,
        DatasetKey,
        FieldName,
        Caption,
        LookupList,
        ValueColumn,
        DisplayColumn,
        DisplayColumns,
        Widths,
        DependsOn,
        IsMultiSelect,
        ReloadMode
    )
    VALUES
        ('WA_PersonFullFrm', 'MAIN', 'GioiTinh', N'Giới tính',
         'API_ComboGioiTinh', 'Value', 'Display', N'Value,Display', NULL, NULL, 0, NULL),
        ('WA_PersonFullFrm', 'MAIN', 'BranchID', N'Chi nhánh',
         'CF_BranchListFrm', 'BranchID', 'BranchName', N'BranchID,BranchName', NULL, NULL, 0, NULL),
        ('WA_PersonFullFrm', 'MAIN', 'TitleName', N'Chức vụ',
         'API_DanhSachChucVu', 'TitleName', 'TitleName', N'TitleName,GhiChu', NULL, NULL, 0, NULL),
        ('WA_PersonFullFrm', 'MAIN', 'ChucDanhChuyenMon', N'Chức danh chuyên môn',
         'API_DanhSachChucDanh', 'ChucDanhChuyenMon', 'ChucDanhChuyenMon',
         N'ChucDanhChuyenMon,MoTa', NULL, NULL, 0, NULL),
        ('WA_PersonFullFrm', 'MAIN', 'PersonStatus', N'Trạng thái',
         'API_ComboPersonStatus', 'PersonStatus', 'PersonStatusName',
         N'PersonStatus,PersonStatusName', NULL, NULL, 0, NULL),
        ('WA_PersonFullFrm', 'MAIN', 'ShiftID', N'Ca làm việc',
         'API_HR_DropdownShifts', 'ShiftID', 'ShiftName',
         N'ShiftID,ShiftName', NULL, NULL, 0, NULL);

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
            LookupList,
            ValueColumn,
            DisplayColumn,
            DisplayColumns,
            Widths,
            DependsOn,
            IsMultiSelect,
            ReloadMode
        )
        VALUES
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu2', N'Ca thứ 2',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu3', N'Ca thứ 3',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu4', N'Ca thứ 4',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu5', N'Ca thứ 5',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu6', N'Ca thứ 6',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDThu7', N'Ca thứ 7',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL),
            ('WA_CaLamViecFrm', 'MAIN', 'ShiftIDChuNhat', N'Ca chủ nhật',
             'API_HR_DropdownShifts', 'ShiftID', 'ShiftName', N'ShiftID,ShiftName', NULL, NULL, 0, NULL);
    END;

    UPDATE Target
    SET
        Target.Caption = Source.Caption,
        Target.ControlType = 'LOOKUP',
        Target.FormatID = 'SL',
        Target.LookupList = Source.LookupList,
        Target.LookupValueColumn = Source.ValueColumn,
        Target.LookupDisplayColumn = Source.DisplayColumn,
        Target.LookupColumns = Source.DisplayColumns,
        Target.LookupWidths = Source.Widths,
        Target.LookupDependsOn = Source.DependsOn,
        Target.LookupMultiSelect = Source.IsMultiSelect,
        Target.LookupReloadMode = Source.ReloadMode,
        Target.IsEnabled = 1,
        Target.SchemaVersion = Target.SchemaVersion + 1,
        Target.UpdatedAt = SYSUTCDATETIME(),
        Target.UpdatedBy = 'SYSTEM_FIELD_UI_API_LOOKUP'
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
        LookupList,
        LookupValueColumn,
        LookupDisplayColumn,
        LookupColumns,
        LookupWidths,
        LookupDependsOn,
        LookupMultiSelect,
        LookupReloadMode,
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
        Source.LookupList,
        Source.ValueColumn,
        Source.DisplayColumn,
        Source.DisplayColumns,
        Source.Widths,
        Source.DependsOn,
        Source.IsMultiSelect,
        Source.ReloadMode,
        1,
        1,
        'SYSTEM_FIELD_UI_API_LOOKUP',
        'SYSTEM_FIELD_UI_API_LOOKUP'
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
    Ui.LookupList,
    Ui.LookupValueColumn,
    Ui.LookupDisplayColumn,
    CONVERT
    (
        varchar(64),
        HASHBYTES
        (
            'SHA2_256',
            UPPER
            (
                LTRIM
                (
                    RTRIM
                    (
                        CONVERT
                        (
                            varchar(max),
                            CONCAT
                            (
                                Ui.LookupList, '|',
                                Ui.LookupValueColumn, '|',
                                Ui.LookupDisplayColumn, '|',
                                ISNULL(Ui.LookupColumns, N''), '|',
                                ISNULL(Ui.LookupDependsOn, N''), '|',
                                CONVERT(varchar(1), Ui.LookupMultiSelect)
                            )
                        )
                    )
                )
            )
        ),
        2
    ) AS LookupKey
FROM dbo.WA_FieldUiContractV2 AS Ui
WHERE Ui.WebFormName IN ('WA_PersonFullFrm', 'WA_CaLamViecFrm')
  AND Ui.DatasetKey = 'MAIN'
  AND Ui.IsEnabled = 1
  AND Ui.LookupList IS NOT NULL
ORDER BY Ui.OrderNo, Ui.FieldName;
