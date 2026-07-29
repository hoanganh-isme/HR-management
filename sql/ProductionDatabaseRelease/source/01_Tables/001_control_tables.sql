
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
