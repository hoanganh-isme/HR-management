SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FormName VARCHAR(50) = 'WA_PayrollFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_PayrollTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'DocumentID';
    DECLARE @CaptionVN NVARCHAR(255) = N'Bảng tính lương tháng';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_Payroll';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {"field":"DocumentID","required":true,"readOnlyEdit":true,"orderNo":1},
      {"field":"PeriodID","formatId":"sl","dataSource":"SY_Period","required":true,"showInFilter":true,"orderNo":2},
      {"field":"BranchID","formatId":"sl","dataSource":"CF_BranchListFrm","showInFilter":true,"orderNo":3}
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[
      {"func":"Process","sql":"WA_PayRoll_Process_Stp","para":"@PeriodID=N''''{PeriodID}''''"}
    ]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'Monthly Payroll',
        @FormType = 'LIST',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@PeriodID=N''{PeriodID}'', @PhongBan=N''{PhongBan}'', @Keyword=N''{Keyword}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 1;

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_Payroll_Detail',
        @TableName = 'HR_PayrollDetailTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Chi tiết bảng lương',
        @CaptionEN = N'Payroll Detail',
        @ViewProcedure = 'API_Payroll_Detail',
        @ViewParameters = N'@DocumentID=N''{DocumentID}''',
        @Overrides = N'[
          {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
          {"field":"DocumentID","required":true,"readOnlyEdit":true},
          {"field":"SoTien","formatId":"n"}
        ]',
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
        ('WA_PayRoll_Process_Stp', 'View', 'WA_PayRoll_Process_Stp', N'@PeriodID=N''{PeriodID}'''),
        ('API_DanhSachBoPhan', 'View', 'API_DanhSachBoPhan', N'@Keyword=N''{Keyword}''');

    IF EXISTS (
        SELECT api.list, api.func
        FROM dbo.WA_API api
        INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func
        GROUP BY api.list, api.func
        HAVING COUNT(*) > 1
    )
        THROW 51500, 'Duplicate payroll compatibility route detected.', 1;

    UPDATE api WITH (UPDLOCK, HOLDLOCK)
       SET [SQL] = alias.[SQL], Para = alias.Para
    FROM dbo.WA_API api
    INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func;

    INSERT INTO dbo.WA_API (list, func, [SQL], Para)
    SELECT alias.list, alias.func, alias.[SQL], alias.Para
    FROM @Aliases alias
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.WA_API api WITH (UPDLOCK, HOLDLOCK)
        WHERE api.list = alias.list AND api.func = alias.func
    );

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SY_FrmLstTbl
        WHERE FormID = @FormName AND TableName = @TableName AND PrimaryKey = @PrimaryKey
    )
        THROW 51501, 'Payroll registration verification failed.', 1;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 4
        THROW 51502, 'Payroll operation verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Payroll registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
