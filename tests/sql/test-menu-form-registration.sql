SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ParentMenuID NVARCHAR(50) = '90';
DECLARE @MenuID NVARCHAR(50) = '9001';
DECLARE @FormName VARCHAR(50) = 'WA_MenuRegistrationTestFrm';
DECLARE @InvalidMenuID NVARCHAR(50) = '9002';
DECLARE @InvalidFormName VARCHAR(50) = 'WA_MenuRegistrationInvalidFrm';
DECLARE @ExistingMenuID NVARCHAR(50) = '9003';
DECLARE @MissingExistingMenuID NVARCHAR(50) = '9004';

CREATE TABLE #FormCapabilities (
    FieldName VARCHAR(128),
    CaptionVN NVARCHAR(255),
    IsRequired BIT,
    FormPosition VARCHAR(50),
    PrimaryKey VARCHAR(50),
    CanView BIT,
    CanAdd BIT,
    CanEdit BIT,
    CanDelete BIT,
    ShowInAdd BIT,
    ShowInEdit BIT,
    IsReadOnlyEdit BIT,
    IsReadOnlyAdd BIT,
    RenderRule VARCHAR(50),
    DataSource NVARCHAR(500),
    OrderNo INT,
    ValidateRule NVARCHAR(500),
    DependsOn VARCHAR(100),
    VisibleRule NVARCHAR(500),
    ShowInFilter BIT
);

DELETE FROM dbo.WA_Menu
WHERE MenuID IN (@MenuID, @InvalidMenuID, @ExistingMenuID, @MissingExistingMenuID, @ParentMenuID);
DELETE FROM dbo.WA_API WHERE list IN (@FormName, @InvalidFormName);
DELETE FROM dbo.SY_FormatFields WHERE FormName IN (@FormName, @InvalidFormName);
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (@FormName, @InvalidFormName);

EXEC dbo.API_LuuMenu
    @MenuID = @ParentMenuID,
    @Label = N'Test menu group',
    @FormName = '',
    @IsEdit = 0;

EXEC dbo.API_LuuMenu
    @MenuID = '01',
    @ParentID = @ParentMenuID,
    @Label = N'Test registered form',
    @FormName = @FormName,
    @IsEdit = 0,
    @RegisterForm = 1,
    @TableName = 'HR_MenuRegistrationTestTbl',
    @PrimaryKey = 'UserAutoID',
    @OperationProfile = 'CRUD',
    @ViewProcedure = 'API_TruyVanDong';

IF NOT EXISTS (
    SELECT 1
    FROM dbo.WA_Menu
    WHERE MenuID = @MenuID
      AND Parent = @ParentMenuID
      AND FormName = @FormName
      AND URLPara = '#/' + @MenuID
)
    THROW 51600, 'Menu and default URL were not saved.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.SY_FrmLstTbl
    WHERE FormID = @FormName
      AND TableName = 'HR_MenuRegistrationTestTbl'
      AND PrimaryKey = 'UserAutoID'
)
    THROW 51601, 'Form registry was not created.', 1;

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 3
    THROW 51602, 'Default View, Save and Delete operations were not registered.', 1;

IF EXISTS (
    SELECT expected.func, expected.[SQL]
    FROM (VALUES
        ('View', 'API_TruyVanDong'),
        ('Save', 'API_LuuDong'),
        ('Delete', 'API_XoaDong')
    ) expected(func, [SQL])
    EXCEPT
    SELECT api.func, api.[SQL]
    FROM dbo.WA_API api
    WHERE api.list = @FormName
)
    THROW 51616, 'CRUD operation mapping is incomplete or incorrect.', 1;

IF (SELECT COUNT(*) FROM dbo.SY_FormatFields WHERE FormName = @FormName) <> 4
    THROW 51603, 'Table fields were not synchronized.', 1;

INSERT INTO #FormCapabilities
EXEC dbo.API_LayCacTruongGiaoDien @FormName = @FormName;

IF NOT EXISTS (SELECT 1 FROM #FormCapabilities)
    THROW 51613, 'CRUD form capability metadata is empty.', 1;

IF EXISTS (
    SELECT 1 FROM #FormCapabilities
    WHERE CanView <> 1 OR CanAdd <> 1 OR CanEdit <> 1 OR CanDelete <> 1
)
    THROW 51614, 'CRUD form capabilities do not match registered operations.', 1;

EXEC dbo.API_LuuMenu
    @MenuID = '03',
    @ParentID = @ParentMenuID,
    @Label = N'Test existing form',
    @FormName = @FormName,
    @IsEdit = 0,
    @RequireAvailableForm = 1;

IF NOT EXISTS (
    SELECT 1 FROM dbo.WA_Menu
    WHERE MenuID = @ExistingMenuID AND FormName = @FormName
)
    THROW 51610, 'An available existing form could not be linked to a menu.', 1;

BEGIN TRY
    EXEC dbo.API_LuuMenu
        @MenuID = '04',
        @ParentID = @ParentMenuID,
        @Label = N'Test missing existing form',
        @FormName = 'WA_FormThatDoesNotExist',
        @IsEdit = 0,
        @RequireAvailableForm = 1;

    THROW 51611, 'A missing existing form should have been rejected.', 1;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 51611
        THROW;
END CATCH;

IF EXISTS (SELECT 1 FROM dbo.WA_Menu WHERE MenuID = @MissingExistingMenuID)
    THROW 51612, 'A rejected existing form left a menu behind.', 1;

EXEC dbo.API_LuuMenu
    @MenuID = @MenuID,
    @OldMenuID = @MenuID,
    @ParentID = @ParentMenuID,
    @Label = N'Test registered form',
    @FormName = @FormName,
    @IsEdit = 1,
    @RegisterForm = 1,
    @TableName = 'HR_MenuRegistrationTestTbl',
    @PrimaryKey = 'UserAutoID',
    @OperationProfile = 'CRUD',
    @ViewProcedure = 'API_TruyVanDong';

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 3
    THROW 51604, 'Repeated registration created duplicate operations.', 1;

IF (SELECT COUNT(*) FROM dbo.SY_FormatFields WHERE FormName = @FormName) <> 4
    THROW 51605, 'Repeated registration created duplicate fields.', 1;

EXEC dbo.API_LuuMenu
    @MenuID = @MenuID,
    @OldMenuID = @MenuID,
    @ParentID = @ParentMenuID,
    @Label = N'Test custom workflow form',
    @FormName = @FormName,
    @IsEdit = 1,
    @RegisterForm = 1,
    @TableName = 'HR_MenuRegistrationTestTbl',
    @PrimaryKey = 'UserAutoID',
    @OperationProfile = 'CUSTOM',
    @ViewProcedure = 'API_TruyVanDong',
    @Operations = N'[
      {"func":"Save","sql":"API_MenuRegistrationSave","para":"@Data=N''{JsonData}''"},
      {"func":"Delete","sql":"API_MenuRegistrationDelete","para":"@Data=N''{JsonData}''"},
      {"func":"Approve","sql":"API_MenuRegistrationApprove","para":"@Data=N''{JsonData}''"}
    ]';

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 4
    THROW 51617, 'CUSTOM profile did not register the exact workflow operations.', 1;

IF NOT EXISTS (
    SELECT 1 FROM dbo.WA_API
    WHERE list = @FormName AND func = 'Save' AND [SQL] = 'API_MenuRegistrationSave'
)
    THROW 51618, 'CUSTOM Save procedure was not registered.', 1;

EXEC dbo.API_LuuMenu
    @MenuID = @MenuID,
    @OldMenuID = @MenuID,
    @ParentID = @ParentMenuID,
    @Label = N'Test registered form',
    @FormName = @FormName,
    @IsEdit = 1,
    @RegisterForm = 1,
    @TableName = 'HR_MenuRegistrationTestTbl',
    @PrimaryKey = 'UserAutoID',
    @OperationProfile = 'READONLY',
    @ViewProcedure = 'API_TruyVanDong',
    @Operations = N'[]',
    @ReplaceOperations = 1;

IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = @FormName) <> 1
    THROW 51609, 'Read-only registration did not retain only the View operation.', 1;

TRUNCATE TABLE #FormCapabilities;
INSERT INTO #FormCapabilities
EXEC dbo.API_LayCacTruongGiaoDien @FormName = @FormName;

IF EXISTS (
    SELECT 1 FROM #FormCapabilities
    WHERE CanView <> 1 OR CanAdd <> 0 OR CanEdit <> 0 OR CanDelete <> 0
)
    THROW 51615, 'Read-only form capabilities do not match registered operations.', 1;

BEGIN TRY
    EXEC dbo.API_LuuMenu
        @MenuID = '02',
        @ParentID = @ParentMenuID,
        @Label = N'Invalid registered form',
        @FormName = @InvalidFormName,
        @IsEdit = 0,
        @RegisterForm = 1,
        @TableName = 'HR_MenuRegistrationTestTbl',
        @PrimaryKey = 'UserAutoID',
        @ViewProcedure = 'API_ProcedureThatDoesNotExist';

    THROW 51606, 'Missing View procedure should have failed registration.', 1;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 51606
        THROW;
END CATCH;

IF EXISTS (SELECT 1 FROM dbo.WA_Menu WHERE MenuID = @InvalidMenuID)
    THROW 51607, 'Failed form registration left a menu behind.', 1;

IF EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl WHERE FormID = @InvalidFormName)
    THROW 51608, 'Failed form registration left registry metadata behind.', 1;

SELECT 0 AS code, N'Menu/form registration integration tests passed.' AS msg;

DELETE FROM dbo.WA_Menu
WHERE MenuID IN (@MenuID, @InvalidMenuID, @ExistingMenuID, @MissingExistingMenuID, @ParentMenuID);
DELETE FROM dbo.WA_API WHERE list IN (@FormName, @InvalidFormName);
DELETE FROM dbo.SY_FormatFields WHERE FormName IN (@FormName, @InvalidFormName);
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (@FormName, @InvalidFormName);
GO
