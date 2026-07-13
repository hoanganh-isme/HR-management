SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Resources TABLE (
        RowID INT IDENTITY(1, 1) PRIMARY KEY,
        FormName VARCHAR(50) NOT NULL,
        TableName VARCHAR(128) NOT NULL,
        PrimaryKey VARCHAR(50) NOT NULL,
        CaptionVN NVARCHAR(255) NOT NULL,
        CaptionEN NVARCHAR(255) NULL
    );

    INSERT INTO @Resources (FormName, TableName, PrimaryKey, CaptionVN, CaptionEN)
    VALUES
        ('CF_BranchListFrm', 'CF_BranchTbl', 'BranchID', N'Danh mục Chi nhánh', N'Branch List'),
        ('WA_BangCapListFrm', 'HR_BangCapTbl', 'MaBangCap', N'Danh mục Bằng cấp', N'Certificate List'),
        ('WA_BankListFrm', 'HR_BankListTbl', 'BankName', N'Danh mục Ngân hàng', N'Bank List'),
        ('WA_CareerlListFrm', 'HR_CareerListTbl', 'CareerName', N'Danh mục Nghề nghiệp', N'Career List'),
        ('WA_DepartmentListFrm', 'HR_DepartmentListTbl', 'PhongBan', N'Danh mục Phòng ban', N'Department List'),
        ('WA_EducationListFrm', 'HR_EducationListTbl', 'EducationName', N'Danh mục Học vấn', N'Education List'),
        ('WA_HinhThucNghiListFrm', 'HR_HinhThucNghiListTbl', 'HinhThucNghi', N'Danh mục Hình thức nghỉ', N'Leave Type List'),
        ('WA_HospitalListFrm', 'HR_HospitalListTbl', 'HospitalName', N'Danh mục Bệnh viện', N'Hospital List'),
        ('WA_JobListFrm', 'HR_JobListTbl', 'JobName', N'Danh mục Công việc', N'Job List'),
        ('WA_NationListFrm', 'HR_NationListTbl', 'NationName', N'Danh mục Quốc gia', N'Nation List'),
        ('WA_PeopleListFrm', 'HR_PeoplesListTbl', 'PeoplesName', N'Danh mục Dân tộc', N'People List'),
        ('WA_PositionListFrm', 'HR_PostionListTbl', 'PostionName', N'Danh mục Vị trí', N'Job Position List'),
        ('WA_ProvinceListFrm', 'HR_ProvineListTbl', 'ProvineName', N'Danh mục Tỉnh thành', N'Province List'),
        ('WA_ReligionListFrm', 'HR_ReligionListTbl', 'ReligionName', N'Danh mục Tôn giáo', N'Religion List'),
        ('WA_ShiftListFrm', 'HR_ShiftListTbl', 'ShiftID', N'Danh mục Ca làm việc', N'Shift List'),
        ('WA_TitleListFrm', 'HR_TitleListTbl', 'TitleName', N'Danh mục Chức vụ', N'Job Title List'),
        ('WA_WorkingGroupListFrm', 'HR_WorkingGroupListTbl', 'WorkingGroupName', N'Danh mục Tổ nhóm', N'Working Group List');

    DECLARE @RowID INT = 1;
    DECLARE @RowCount INT = (SELECT COUNT(*) FROM @Resources);
    DECLARE @FormName VARCHAR(50);
    DECLARE @TableName VARCHAR(128);
    DECLARE @PrimaryKey VARCHAR(50);
    DECLARE @CaptionVN NVARCHAR(255);
    DECLARE @CaptionEN NVARCHAR(255);
    DECLARE @ViewProcedure VARCHAR(128) = 'API_TruyVanDong';
    DECLARE @Overrides NVARCHAR(MAX) = N'[]';
    DECLARE @Operations NVARCHAR(MAX) = N'[]';

    WHILE @RowID <= @RowCount
    BEGIN
        SELECT
            @FormName = FormName,
            @TableName = TableName,
            @PrimaryKey = PrimaryKey,
            @CaptionVN = CaptionVN,
            @CaptionEN = CaptionEN
        FROM @Resources
        WHERE RowID = @RowID;

        EXEC dbo.API_DangKyFormWeb
            @FormName = @FormName,
            @TableName = @TableName,
            @PrimaryKey = @PrimaryKey,
            @CaptionVN = @CaptionVN,
            @CaptionEN = @CaptionEN,
            @ViewProcedure = @ViewProcedure,
            @ViewParameters = N'@List=N''{List}'', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', @SortDir=N''{SortDir}'', @Data=N''{JsonData}''',
            @Overrides = @Overrides,
            @Operations = @Operations,
            @ReplaceOperations = 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.SY_FrmLstTbl
            WHERE FormID = @FormName
              AND TableName = @TableName
              AND PrimaryKey = @PrimaryKey
        )
            THROW 52000, 'Reference-data form verification failed.', 1;

        IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 3
            THROW 52001, 'Reference-data operation verification failed.', 1;

        SET @RowID += 1;
    END

    COMMIT TRANSACTION;

    SELECT 0 AS code, @RowCount AS RegisteredForms, N'Reference-data registration completed.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
