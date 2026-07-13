SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @FormName VARCHAR(50) = 'WA_PersonFullFrm';
    DECLARE @TableName VARCHAR(128) = 'HR_PersonTbl';
    DECLARE @PrimaryKey VARCHAR(50) = 'PersonID';
    DECLARE @CaptionVN NVARCHAR(255) = N'Hồ sơ nhân viên tổng hợp';
    DECLARE @ViewProcedure VARCHAR(128) = 'API_HoSoNhanVien';
    DECLARE @Overrides NVARCHAR(MAX) = N'[
      {"field":"PersonID","required":true,"readOnlyAdd":true,"readOnlyEdit":true,"orderNo":1},
      {"field":"PersonName","required":true,"orderNo":2},
      {"field":"PersonStatus","formatId":"sl","dataSource":"API_ComboPersonStatus","required":true,"showInFilter":true,"orderNo":3},
      {"field":"BranchID","formatId":"sl","dataSource":"CF_BranchListFrm","showInFilter":true,"orderNo":4},
      {"field":"LoaiHD","formatId":"sl","dataSource":"API_DanhSachLoaiHD","showInFilter":true,"orderNo":100},
      {"field":"NamLap","formatId":"sl","dataSource":"API_HopDongLaoDong_NamLap","showInFilter":true,"orderNo":101}
    ]';
    DECLARE @Operations NVARCHAR(MAX) = N'[]';

    EXEC dbo.API_DangKyFormWeb
        @FormName = @FormName,
        @TableName = @TableName,
        @PrimaryKey = @PrimaryKey,
        @CaptionVN = @CaptionVN,
        @CaptionEN = N'General Employee Profile',
        @ViewProcedure = @ViewProcedure,
        @ViewParameters = N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @NamLap=N''{NamLap}'', @LoaiHD=N''{LoaiHD}'', @PersonStatus=N''{PersonStatus}''',
        @Overrides = @Overrides,
        @Operations = @Operations,
        @ReplaceOperations = 0;

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_PersonAttach',
        @TableName = 'HR_PersonAttachTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Tài liệu nhân viên',
        @CaptionEN = N'Employee Attachments',
        @ViewProcedure = 'API_PersonAttach',
        @ViewParameters = N'@PersonID=N''{PersonID}''',
        @Overrides = N'[
          {"field":"UserAutoID","showInAdd":false,"showInEdit":false},
          {"field":"PersonID","required":true,"readOnlyEdit":true}
        ]',
        @Operations = N'[
          {"func":"SaveAvatar","sql":"API_PersonAttach_SaveAvatar","para":"@List=N''''{List}'''', @Data=N''''{JsonData}'''', @UserName=N''''{User}''''"}
        ]',
        @ReplaceOperations = 0;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SY_FrmLstTbl
        WHERE FormID = @FormName AND TableName = @TableName AND PrimaryKey = @PrimaryKey
    )
        THROW 51800, 'Employee registration verification failed.', 1;

    IF EXISTS (
        SELECT func FROM dbo.WA_API
        WHERE list = @FormName
        GROUP BY func HAVING COUNT(*) > 1
    )
        THROW 51801, 'Employee operation duplicate verification failed.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.WA_API
        WHERE list = 'API_PersonAttach' AND func = 'SaveAvatar'
    )
        THROW 51802, 'Employee attachment operation verification failed.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, @FormName AS FormName, N'Employee registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
