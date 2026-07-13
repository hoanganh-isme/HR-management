SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FormName VARCHAR(50) = 'WA_HopDongLaoDongFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_HopDongTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'MaHopDong';
    DECLARE @CaptionVN NVARCHAR(255) = N'Hợp đồng lao động';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_HopDongLaoDong';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {"field":"MaHopDong","required":true,"readOnlyEdit":true,"orderNo":1},
      {"field":"PersonID","formatId":"sl","dataSource":"API_HopDongLaoDong_NhanVienChuaCoHD","required":true,"orderNo":2},
      {"field":"BranchID","formatId":"sl","dataSource":"CF_BranchListFrm","showInFilter":true,"orderNo":3},
      {"field":"LoaiHopDong","formatId":"sl","dataSource":"API_HopDongLaoDong_LoaiHD","showInFilter":true,"orderNo":4}
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'Labor Contracts',
        @FormType = 'LIST',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@Keyword=N''{Keyword}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @BranchID=N''{BranchID}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 1;

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_HopDongLaoDong_ChiTiet',
        @TableName = 'HR_HopDongDetailTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Phụ cấp trong hợp đồng',
        @CaptionEN = N'Contract Allowances',
        @ViewProcedure = 'API_HopDongLaoDong_ChiTiet',
        @ViewParameters = N'@MaHopDong=N''{MaHopDong}''',
        @Overrides = N'[
          {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
          {"field":"MaHopDong","required":true,"readOnlyEdit":true}
        ]',
        @Operations = N'[]',
        @ReplaceOperations = 1;

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_HopDongLaoDong_Attach',
        @TableName = 'HR_HopDongAttachTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Tài liệu đính kèm hợp đồng',
        @CaptionEN = N'Contract Attachments',
        @ViewProcedure = 'API_HopDongLaoDong_Attach',
        @ViewParameters = N'@MaHopDong=N''{MaHopDong}''',
        @Overrides = N'[
          {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
          {"field":"MaHopDong","required":true,"readOnlyEdit":true}
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
        ('API_HopDongLaoDong_NamLap', 'View', 'API_HopDongLaoDong_NamLap', N'@Keyword=N''{Keyword}'''),
        ('API_HopDongLaoDong_LoaiHD', 'View', 'API_HopDongLaoDong_LoaiHD', N'@Keyword=N''{Keyword}''');

    IF EXISTS (
        SELECT api.list, api.func
        FROM dbo.WA_API api
        INNER JOIN @Aliases alias ON alias.list = api.list AND alias.func = api.func
        GROUP BY api.list, api.func
        HAVING COUNT(*) > 1
    )
        THROW 51700, 'Duplicate contract compatibility route detected.', 1;

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
        THROW 51701, 'Contract registration verification failed.', 1;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 3
        THROW 51702, 'Contract operation verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Contract registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
