SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FormName VARCHAR(50) = 'WA_CaLamViecFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_SapCaTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'SapCaID';
    DECLARE @CaptionVN NVARCHAR(255) = N'Sắp ca làm việc';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_CaLamViec';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {"field":"SapCaID","required":true,"readOnlyEdit":true,"orderNo":1},
      {"field":"BranchID","formatId":"sl","dataSource":"CF_BranchListFrm","required":true,"showInFilter":true,"orderNo":2},
      {"field":"PeriodID","formatId":"sl","dataSource":"SY_Period","showInFilter":true,"orderNo":3}
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[
      {"func":"AutoAssign","sql":"HR_CaLamViec_SapCaStp","para":"@Data=N''''{JsonData}'''', @UserName=N''''{User}''''"}
    ]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'Shift Scheduling',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@Keyword=N''{Keyword}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 1;

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_CaLamViec_NhanVien',
        @TableName = 'HR_SapCaNhanVienTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Nhân viên sắp ca',
        @CaptionEN = N'Shift Employees',
        @ViewProcedure = 'API_CaLamViec_NhanVien',
        @ViewParameters = N'@SapCaID=N''{SapCaID}''',
        @Overrides = N'[
          {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
          {"field":"SapCaID","required":true,"readOnlyEdit":true},
          {"field":"PersonID","formatId":"sl","dataSource":"HR_PersonTbl","required":true}
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
        ('API_HR_DropdownShifts', 'View', 'API_HR_DropdownShifts', N''),
        ('API_CaLamViec_ChiTiet', 'View', 'API_CaLamViec_ChiTiet', N'@SapCaID=N''{SapCaID}''');

    IF EXISTS (
        SELECT api.list, api.func
        FROM dbo.WA_API api
        INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func
        GROUP BY api.list, api.func
        HAVING COUNT(*) > 1
    )
        THROW 51600, 'Duplicate shift compatibility route detected.', 1;

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
        THROW 51601, 'Shift registration verification failed.', 1;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 4
        THROW 51602, 'Shift operation verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Shift registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
