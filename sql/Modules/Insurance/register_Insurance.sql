SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FormName VARCHAR(50) = 'WA_BaoHiemFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_BaoHiemTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'DocumentID';
    DECLARE @CaptionVN NVARCHAR(255) = N'Bảo hiểm';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_BaoHiem';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {"field":"DocumentID","required":true,"readOnlyEdit":true,"orderNo":1},
      {"field":"PeriodID","formatId":"sl","dataSource":"SY_Period","required":true,"showInFilter":true,"orderNo":2},
      {"field":"BranchID","formatId":"sl","dataSource":"CF_BranchListFrm","required":true,"showInFilter":true,"orderNo":3},
      {"field":"PeriodKeyID","formatId":"sl","dataSource":"HR_BangThamSoTbl","required":true,"orderNo":4}
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[
      {"func":"Save","sql":"WA_BaoHiemFrm_Save","para":"@List=N''''{List}'''', @Data=N''''{JsonData}'''', @UserName=N''''{User}''''"},
      {"func":"Calculate","sql":"TinhBHStp","para":"@PeriodID=N''''{PeriodID}'''', @LoaiBaoHiem=N''''{LoaiBaoHiem}'''', @MucDong={MucDong}"}
    ]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'Insurance',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 1;

    DECLARE @DetailFormName VARCHAR(50) = 'API_BaoHiem_Detail';
    DECLARE @DetailOverrides NVARCHAR(MAX) = N'[
      {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
      {"field":"DocumentID","required":true,"readOnlyEdit":true},
      {"field":"PersonID","formatId":"sl","dataSource":"WA_BaoHiemFrm_PersonID","required":true}
    ]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @DetailFormName,
        @TableName = 'HR_BaoHiemChiTietTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Bảo hiểm chi tiết',
        @CaptionEN = N'Insurance Detail',
        @ViewProcedure = 'API_BaoHiem_Detail',
        @ViewParameters = N'@DocumentID=N''{DocumentID}''',
        @Overrides = @DetailOverrides,
        @Operations = N'[]',
        @ReplaceOperations = 1;

    DECLARE @Aliases TABLE (
        list VARCHAR(50) NOT NULL,
        func VARCHAR(50) NOT NULL,
        [SQL] VARCHAR(256) NOT NULL,
        Para NVARCHAR(MAX) NULL,
        PRIMARY KEY (list, func)
    );

    INSERT INTO @Aliases (list, func, [SQL], Para)
    VALUES
        ('HR_BangThamSoTbl', 'View', 'API_HR_BangThamSo_Lookup', N'@Keyword=N''{Keyword}'''),
        ('WA_BaoHiemFrm_PersonID', 'View', 'WA_BaoHiem_PersonLookup', N'@BranchID=N''{BranchID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @DocumentID=N''{DocumentID}'', @Keyword=N''{Keyword}'''),
        ('WA_BaoHiemFrm_Calculate', 'View', 'TinhBHStp', N'@PeriodID=N''{PeriodID}'', @LoaiBaoHiem=N''{LoaiBaoHiem}'', @MucDong={MucDong}');

    IF EXISTS (
        SELECT api.list, api.func
        FROM dbo.WA_API api
        INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func
        GROUP BY api.list, api.func
        HAVING COUNT(*) > 1
    )
        THROW 51400, 'Duplicate insurance compatibility route detected.', 1;

    UPDATE api WITH (UPDLOCK, HOLDLOCK)
       SET [SQL] = alias.[SQL], Para = alias.Para
    FROM dbo.WA_API api
    INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func;

    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    SELECT alias.list, alias.func, alias.[SQL], alias.Para
    FROM @Aliases alias
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.WA_API api WITH (UPDLOCK, HOLDLOCK)
        WHERE api.list = alias.list AND api.func = alias.func
    );

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SY_FrmLstTbl
        WHERE FormID = @FormName AND TableName = @TableName AND PrimaryKey = @PrimaryKey
    )
        THROW 51401, 'Insurance master registration verification failed.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SY_FrmLstTbl
        WHERE FormID = @DetailFormName
          AND TableName = 'HR_BaoHiemChiTietTbl'
          AND PrimaryKey = 'UserAutoID'
    )
        THROW 51402, 'Insurance detail registration verification failed.', 1;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 4
        THROW 51403, 'Insurance operation verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Insurance registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
