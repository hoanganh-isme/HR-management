/*
  Tạo registry điều khiển rollout. Hai bảng registry chỉ lưu policy/control,
  không sao chép field, caption, format, lookup hoặc sys.columns.
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
        CreatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldContractRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldContractRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldContractRegistry PRIMARY KEY (WebFormName),
        CONSTRAINT CK_WA_FieldContractRegistry_ContractType CHECK
        (
            ContractType IN
            (
                'SIMPLE_TABLE',
                'JOIN_VIEW_SINGLE_TABLE',
                'MASTER_DETAIL_SIMPLE',
                'READ_ONLY',
                'COMPLEX_DEFERRED',
                'BLOCKED'
            )
        ),
        CONSTRAINT CK_WA_FieldContractRegistry_RolloutStatus CHECK
        (
            RolloutStatus IN ('ACTIVE', 'SHADOW', 'DEFERRED', 'DISABLED', 'BLOCKED')
        ),
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
        CreatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldDatasetRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldDatasetRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldDatasetRegistry PRIMARY KEY (WebFormName, DatasetKey),
        CONSTRAINT FK_WA_FieldDatasetRegistry_Form FOREIGN KEY (WebFormName)
            REFERENCES dbo.WA_FieldContractRegistry(WebFormName),
        CONSTRAINT CK_WA_FieldDatasetRegistry_RolloutStatus CHECK
        (
            RolloutStatus IN ('ACTIVE', 'SHADOW', 'DEFERRED', 'DISABLED', 'BLOCKED')
        ),
        CONSTRAINT CK_WA_FieldDatasetRegistry_SchemaVersion CHECK (SchemaVersion > 0),
        CONSTRAINT CK_WA_FieldDatasetRegistry_ReadOnlyMutation CHECK
        (
            IsReadOnly = 0 OR (SaveProcedure IS NULL AND DeleteProcedure IS NULL)
        )
    );
END;
GO

/*
  Metadata giao diện V2 là nguồn cấu hình duy nhất cho web.
  Dropdown trỏ thẳng đến một route View trong WA_API; route đó gọi API_* tương ứng.
  Vì vậy chỉ cần một bảng field, không cần bảng lookup và bảng option riêng.
*/
IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldUiContractV2
    (
        WebFormName varchar(100) NOT NULL,
        DatasetKey varchar(80) NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_DatasetKey DEFAULT ('MAIN'),
        FieldName sysname NOT NULL,
        Caption nvarchar(200) NULL,
        ControlType varchar(20) NULL,
        FormatID varchar(20) NULL,
        OrderNo int NULL,
        ShowInGrid bit NULL,
        ShowInAdd bit NULL,
        ShowInEdit bit NULL,
        ShowInFilter bit NULL,
        IsReadOnlyAdd bit NULL,
        IsReadOnlyEdit bit NULL,
        LookupList varchar(50) NULL,
        LookupValueColumn sysname NULL,
        LookupDisplayColumn sysname NULL,
        LookupColumns nvarchar(1000) NULL,
        LookupWidths nvarchar(500) NULL,
        LookupDependsOn nvarchar(500) NULL,
        LookupMultiSelect bit NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_LookupMultiSelect DEFAULT (0),
        LookupReloadMode varchar(30) NULL,
        NumberDecimal int NULL,
        FormatString nvarchar(100) NULL,
        MaskString nvarchar(100) NULL,
        MaxLength int NULL,
        MinValue decimal(38, 10) NULL,
        MaxValue decimal(38, 10) NULL,
        Align varchar(20) NULL,
        MinWidth int NULL,
        MaxWidth int NULL,
        IsEnabled bit NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_IsEnabled DEFAULT (1),
        SchemaVersion int NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_SchemaVersion DEFAULT (1),
        CreatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldUiContractV2
            PRIMARY KEY (WebFormName, DatasetKey, FieldName),
        CONSTRAINT FK_WA_FieldUiContractV2_Form FOREIGN KEY (WebFormName)
            REFERENCES dbo.WA_FieldContractRegistry(WebFormName),
        CONSTRAINT CK_WA_FieldUiContractV2_ControlType CHECK
        (
            ControlType IS NULL OR UPPER(ControlType) IN
            (
                'TEXT', 'TEXTAREA', 'DATE', 'DATETIME', 'TIME',
                'NUMBER', 'MONEY', 'BOOLEAN', 'SELECT', 'LOOKUP'
            )
        ),
        CONSTRAINT CK_WA_FieldUiContractV2_SchemaVersion
            CHECK (SchemaVersion > 0),
        CONSTRAINT CK_WA_FieldUiContractV2_Width
            CHECK
            (
                (MinWidth IS NULL OR MinWidth >= 0)
                AND (MaxWidth IS NULL OR MaxWidth >= 0)
                AND (MinWidth IS NULL OR MaxWidth IS NULL OR MinWidth <= MaxWidth)
            ),
        CONSTRAINT CK_WA_FieldUiContractV2_Lookup
            CHECK
            (
                (
                    LookupList IS NULL
                    AND LookupValueColumn IS NULL
                    AND LookupDisplayColumn IS NULL
                )
                OR
                (
                    LookupList IS NOT NULL
                    AND LookupValueColumn IS NOT NULL
                    AND LookupDisplayColumn IS NOT NULL
                )
            )
    );

    CREATE INDEX IX_WA_FieldUiContractV2_Lookup
        ON dbo.WA_FieldUiContractV2(LookupList)
        WHERE LookupList IS NOT NULL AND IsEnabled = 1;
END;
GO

/*
  Nâng cấp từ bản ba bảng cũ. Chỉ migrate nguồn REGISTERED_API; value-list mặc định
  PERSON_GENDER được chuyển sang API_ComboGioiTinh trong installer dropdown.
*/
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupList') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupList varchar(50) NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupValueColumn') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupValueColumn sysname NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupDisplayColumn') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupDisplayColumn sysname NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupColumns') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupColumns nvarchar(1000) NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupWidths') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupWidths nvarchar(500) NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupDependsOn') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupDependsOn nvarchar(500) NULL;
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupMultiSelect') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2
        ADD LookupMultiSelect bit NOT NULL
            CONSTRAINT DF_WA_FieldUiContractV2_LookupMultiSelect DEFAULT (0);
IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupReloadMode') IS NULL
    ALTER TABLE dbo.WA_FieldUiContractV2 ADD LookupReloadMode varchar(30) NULL;
GO

IF OBJECT_ID(N'dbo.WA_LookupContractV2', N'U') IS NOT NULL
BEGIN
    /*
      Dùng SQL động vì bản cài mới không có LookupCode và hai bảng lookup cũ.
      Tên object/column đều cố định trong source, không nhận từ request.
    */
    IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupCode') IS NOT NULL
        EXEC sys.sp_executesql N'
            UPDATE Ui
            SET
                LookupList =
                    CASE
                        WHEN LookupContract.SourceType = ''VALUE_LIST''
                         AND LookupContract.LookupCode = ''PERSON_GENDER''
                            THEN ''API_ComboGioiTinh''
                        ELSE LookupContract.RegisteredList
                    END,
                LookupValueColumn =
                    CASE
                        WHEN LookupContract.SourceType = ''VALUE_LIST''
                         AND LookupContract.LookupCode = ''PERSON_GENDER''
                            THEN ''Value''
                        ELSE LookupContract.ValueColumn
                    END,
                LookupDisplayColumn =
                    CASE
                        WHEN LookupContract.SourceType = ''VALUE_LIST''
                         AND LookupContract.LookupCode = ''PERSON_GENDER''
                            THEN ''Display''
                        ELSE LookupContract.DisplayColumn
                    END,
                LookupColumns =
                    CASE
                        WHEN LookupContract.SourceType = ''VALUE_LIST''
                         AND LookupContract.LookupCode = ''PERSON_GENDER''
                            THEN N''Value,Display''
                        ELSE LookupContract.DisplayColumns
                    END,
                LookupWidths = LookupContract.Widths,
                LookupDependsOn = LookupContract.DependsOn,
                LookupMultiSelect = LookupContract.IsMultiSelect,
                LookupReloadMode = LookupContract.ReloadMode,
                UpdatedAt = SYSUTCDATETIME(),
                UpdatedBy = ''SYSTEM_LOOKUP_SINGLE_TABLE_MIGRATION''
            FROM dbo.WA_FieldUiContractV2 AS Ui
            INNER JOIN dbo.WA_LookupContractV2 AS LookupContract
              ON LookupContract.LookupCode = Ui.LookupCode
             AND LookupContract.IsEnabled = 1
            WHERE LookupContract.SourceType = ''REGISTERED_API''
               OR LookupContract.LookupCode = ''PERSON_GENDER'';';

    DECLARE @CustomValueListCount int = 0;
    EXEC sys.sp_executesql
        N'
            SELECT @Count = COUNT(*)
            FROM dbo.WA_LookupContractV2
            WHERE SourceType = ''VALUE_LIST''
              AND LookupCode <> ''PERSON_GENDER'';',
        N'@Count int OUTPUT',
        @Count = @CustomValueListCount OUTPUT;

    IF @CustomValueListCount > 0
    BEGIN
        EXEC sys.sp_executesql N'
            SELECT
                LookupCode,
                SourceType,
                ValueColumn,
                DisplayColumn
            FROM dbo.WA_LookupContractV2
            WHERE SourceType = ''VALUE_LIST''
              AND LookupCode <> ''PERSON_GENDER''
            ORDER BY LookupCode;';

        THROW 54302, N'CUSTOM_VALUE_LIST_MUST_BE_CONVERTED_TO_REGISTERED_API', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM sys.foreign_keys
        WHERE [name] = N'FK_WA_FieldUiContractV2_Lookup'
          AND parent_object_id = OBJECT_ID(N'dbo.WA_FieldUiContractV2')
    )
        ALTER TABLE dbo.WA_FieldUiContractV2
            DROP CONSTRAINT FK_WA_FieldUiContractV2_Lookup;

    IF EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.WA_FieldUiContractV2')
          AND [name] = N'IX_WA_FieldUiContractV2_Lookup'
    )
        DROP INDEX IX_WA_FieldUiContractV2_Lookup
            ON dbo.WA_FieldUiContractV2;

    IF OBJECT_ID(N'dbo.WA_LookupOptionV2', N'U') IS NOT NULL
        EXEC(N'DROP TABLE dbo.WA_LookupOptionV2;');

    EXEC(N'DROP TABLE dbo.WA_LookupContractV2;');

    IF COL_LENGTH(N'dbo.WA_FieldUiContractV2', N'LookupCode') IS NOT NULL
        EXEC(N'ALTER TABLE dbo.WA_FieldUiContractV2 DROP COLUMN LookupCode;');
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.WA_FieldUiContractV2')
      AND [name] = N'IX_WA_FieldUiContractV2_Lookup'
)
    CREATE INDEX IX_WA_FieldUiContractV2_Lookup
        ON dbo.WA_FieldUiContractV2(LookupList)
        WHERE LookupList IS NOT NULL AND IsEnabled = 1;
GO

IF OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldContractRouteBackup
    (
        BackupID bigint IDENTITY(1, 1) NOT NULL,
        BackupBatchID uniqueidentifier NOT NULL,
        WebFormName varchar(100) NOT NULL,
        ApiList varchar(100) NOT NULL,
        Func varchar(20) NOT NULL,
        RouteExisted bit NOT NULL,
        [SQL] nvarchar(max) NULL,
        Para nvarchar(max) NULL,
        BackupTime datetime2(3) NOT NULL
            CONSTRAINT DF_WA_FieldContractRouteBackup_Time DEFAULT SYSUTCDATETIME(),
        BackupUser varchar(100) NOT NULL,
        RestoredAt datetime2(3) NULL,
        RestoredBy varchar(100) NULL,
        CONSTRAINT PK_WA_FieldContractRouteBackup PRIMARY KEY (BackupID),
        CONSTRAINT UQ_WA_FieldContractRouteBackup_BatchRoute
            UNIQUE (BackupBatchID, ApiList, Func)
    );

    CREATE INDEX IX_WA_FieldContractRouteBackup_FormTime
        ON dbo.WA_FieldContractRouteBackup(WebFormName, BackupTime DESC);
END;
GO
