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
  Metadata giao diện V2 là nguồn cấu hình duy nhất cho web. Bảng này không
  chứa câu SQL và không phụ thuộc SY_FormatFields/SY_FrmDrdwTbl.
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
        LookupCode varchar(100) NULL,
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
            )
    );

    CREATE INDEX IX_WA_FieldUiContractV2_Lookup
        ON dbo.WA_FieldUiContractV2(LookupCode)
        WHERE LookupCode IS NOT NULL AND IsEnabled = 1;
END;
GO

/*
  Lookup chỉ được phép trỏ tới một API View đã đăng ký hoặc danh sách giá trị
  khai báo. Không lưu và không thực thi raw SQL từ metadata.
*/
IF OBJECT_ID(N'dbo.WA_LookupContractV2', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_LookupContractV2
    (
        LookupCode varchar(100) NOT NULL,
        SourceType varchar(20) NOT NULL,
        RegisteredList varchar(50) NULL,
        ValueColumn sysname NOT NULL,
        DisplayColumn sysname NOT NULL,
        DisplayColumns nvarchar(1000) NULL,
        Widths nvarchar(500) NULL,
        DependsOn nvarchar(500) NULL,
        IsMultiSelect bit NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_IsMultiSelect DEFAULT (0),
        ReloadMode varchar(30) NULL,
        BranchPolicy varchar(40) NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_BranchPolicy DEFAULT ('CALLER_SCOPE'),
        IsEnabled bit NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_IsEnabled DEFAULT (1),
        SchemaVersion int NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_SchemaVersion DEFAULT (1),
        CreatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL
            CONSTRAINT DF_WA_LookupContractV2_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_LookupContractV2 PRIMARY KEY (LookupCode),
        CONSTRAINT CK_WA_LookupContractV2_SourceType CHECK
        (
            SourceType IN ('REGISTERED_API', 'VALUE_LIST')
        ),
        CONSTRAINT CK_WA_LookupContractV2_Source CHECK
        (
            (SourceType = 'REGISTERED_API' AND RegisteredList IS NOT NULL)
            OR (SourceType = 'VALUE_LIST' AND RegisteredList IS NULL)
        ),
        CONSTRAINT CK_WA_LookupContractV2_BranchPolicy CHECK
        (
            BranchPolicy IN ('CALLER_SCOPE', 'GLOBAL_REFERENCE')
        ),
        CONSTRAINT CK_WA_LookupContractV2_SchemaVersion
            CHECK (SchemaVersion > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.WA_LookupOptionV2', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_LookupOptionV2
    (
        LookupCode varchar(100) NOT NULL,
        OptionValue nvarchar(500) NOT NULL,
        OptionLabel nvarchar(500) NOT NULL,
        OrderNo int NOT NULL
            CONSTRAINT DF_WA_LookupOptionV2_OrderNo DEFAULT (0),
        IsEnabled bit NOT NULL
            CONSTRAINT DF_WA_LookupOptionV2_IsEnabled DEFAULT (1),
        CONSTRAINT PK_WA_LookupOptionV2
            PRIMARY KEY (LookupCode, OptionValue),
        CONSTRAINT FK_WA_LookupOptionV2_Contract FOREIGN KEY (LookupCode)
            REFERENCES dbo.WA_LookupContractV2(LookupCode)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_WA_FieldUiContractV2_Lookup'
      AND parent_object_id = OBJECT_ID(N'dbo.WA_FieldUiContractV2')
)
BEGIN
    ALTER TABLE dbo.WA_FieldUiContractV2
        WITH CHECK ADD CONSTRAINT FK_WA_FieldUiContractV2_Lookup
        FOREIGN KEY (LookupCode)
        REFERENCES dbo.WA_LookupContractV2(LookupCode);

    ALTER TABLE dbo.WA_FieldUiContractV2
        CHECK CONSTRAINT FK_WA_FieldUiContractV2_Lookup;
END;
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
