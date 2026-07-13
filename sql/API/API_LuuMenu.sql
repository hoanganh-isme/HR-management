CREATE OR ALTER PROCEDURE [dbo].[API_LuuMenu]
    @NhomNguoiDangThaoTac NVARCHAR(50) = '',
    @MenuID NVARCHAR(50),
    @OldMenuID NVARCHAR(50) = '',
    @ParentID NVARCHAR(50) = '',
    @Label NVARCHAR(250),
    @EN NVARCHAR(250) = '',
    @SubTitle NVARCHAR(250) = '',
    @FormName NVARCHAR(250) = '',
    @FormKey NVARCHAR(250) = '',
    @URLPara NVARCHAR(250) = '',
    @Icon NVARCHAR(100) = '',
    @IsDisable BIT = 0,
    @IsEdit BIT = 0,
    @RegisterForm BIT = 0,
    @RequireAvailableForm BIT = 0,
    @TableName VARCHAR(128) = NULL,
    @PrimaryKey VARCHAR(50) = NULL,
    @FormType VARCHAR(20) = 'EDIT',
    @OperationProfile VARCHAR(20) = NULL,
    @ViewProcedure VARCHAR(128) = NULL,
    @ViewParameters NVARCHAR(MAX) = NULL,
    @Overrides NVARCHAR(MAX) = N'[]',
    @Operations NVARCHAR(MAX) = NULL,
    @ReplaceOperations BIT = 0,
    @IncludeSaveOperation BIT = 1,
    @IncludeDeleteOperation BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ApiInserted INT = 0;
    DECLARE @ApiDeleted INT = 0;
    DECLARE @FieldsInserted INT = 0;
    DECLARE @FieldsUpdated INT = 0;
    DECLARE @FieldsDeleted INT = 0;
    DECLARE @ResourceStatus VARCHAR(60) = 'MENU_ONLY';
    DECLARE @ResolvedOperationProfile VARCHAR(20) = NULL;
    DECLARE @RegisteredOperationCount INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        SET @MenuID = LTRIM(RTRIM(ISNULL(@MenuID, '')));
        SET @OldMenuID = LTRIM(RTRIM(ISNULL(@OldMenuID, '')));
        SET @ParentID = LTRIM(RTRIM(ISNULL(@ParentID, '')));
        SET @FormName = LTRIM(RTRIM(ISNULL(@FormName, '')));
        SET @URLPara = LTRIM(RTRIM(ISNULL(@URLPara, '')));

        IF @MenuID = ''
            THROW 51400, 'MenuID is required.', 1;

        IF NULLIF(LTRIM(RTRIM(@Label)), '') IS NULL
            THROW 51401, 'Menu label is required.', 1;

        IF @ParentID <> '' AND NOT EXISTS (
            SELECT 1 FROM dbo.WA_Menu WITH (UPDLOCK, HOLDLOCK) WHERE MenuID = @ParentID
        )
            THROW 51402, 'Parent menu does not exist.', 1;

        IF @IsEdit = 1
        BEGIN
            IF @OldMenuID = ''
                SET @OldMenuID = @MenuID;

            IF NOT EXISTS (
                SELECT 1 FROM dbo.WA_Menu WITH (UPDLOCK, HOLDLOCK) WHERE MenuID = @OldMenuID
            )
                THROW 51403, 'Menu to update does not exist.', 1;

            IF @ParentID = @OldMenuID
                THROW 51404, 'A menu cannot be its own parent.', 1;

            DECLARE @OldParentID NVARCHAR(50);
            SELECT @OldParentID = ISNULL(Parent, '')
            FROM dbo.WA_Menu
            WHERE MenuID = @OldMenuID;

            IF @OldParentID <> '' AND @MenuID LIKE @OldParentID + '%'
                SET @MenuID = RIGHT(@MenuID, LEN(@MenuID) - LEN(@OldParentID));
        END

        IF @ParentID <> '' AND @MenuID NOT LIKE @ParentID + '%'
            SET @MenuID = @ParentID + @MenuID;

        IF @FormName <> '' AND @URLPara = ''
            SET @URLPara = '#/' + @MenuID;

        IF @RegisterForm = 1
        BEGIN
            IF @FormName = ''
                THROW 51405, 'FormName is required when RegisterForm is enabled.', 1;

            IF LEN(@FormName) > 50
                THROW 51406, 'FormName cannot exceed 50 characters.', 1;

            IF NULLIF(LTRIM(RTRIM(@TableName)), '') IS NULL
                THROW 51407, 'TableName is required when registering a form.', 1;

            IF NULLIF(LTRIM(RTRIM(@PrimaryKey)), '') IS NULL
                THROW 51408, 'PrimaryKey is required when registering a form.', 1;

            IF OBJECT_ID('dbo.API_DangKyFormWeb', 'P') IS NULL
                THROW 51409, 'API_DangKyFormWeb is not installed.', 1;

            SET @ResolvedOperationProfile = UPPER(LTRIM(RTRIM(ISNULL(@OperationProfile, ''))));

            IF @ResolvedOperationProfile = ''
                SET @ResolvedOperationProfile = CASE
                    WHEN @IncludeSaveOperation = 1 AND @IncludeDeleteOperation = 1 THEN 'CRUD'
                    WHEN @IncludeSaveOperation = 0 AND @IncludeDeleteOperation = 0 THEN 'READONLY'
                    ELSE 'CUSTOM'
                END;

            IF @ResolvedOperationProfile NOT IN ('CRUD', 'READONLY', 'CUSTOM')
                THROW 51413, 'OperationProfile must be CRUD, READONLY or CUSTOM.', 1;

            IF NULLIF(LTRIM(RTRIM(@ViewProcedure)), '') IS NULL
                SET @ViewProcedure = 'API_TruyVanDong';

            IF @ViewProcedure = 'API_TruyVanDong'
               AND NULLIF(LTRIM(RTRIM(@ViewParameters)), '') IS NULL
                SET @ViewParameters =
                    N'@List=N''' + REPLACE(@FormName, '''', '''''')
                    + N''', @Keyword=N''{Keyword}'', @SortColumn=N''{SortColumn}'', '
                    + N'@SortDir=N''{SortDir}'', @Data=N''{JsonData}''';

            DECLARE @FormCaptionEN NVARCHAR(255) = NULLIF(@EN, '');

            EXEC dbo.API_DangKyFormWeb
                @FormName = @FormName,
                @TableName = @TableName,
                @PrimaryKey = @PrimaryKey,
                @CaptionVN = @Label,
                @CaptionEN = @FormCaptionEN,
                @FormType = @FormType,
                @ViewProcedure = @ViewProcedure,
                @ViewParameters = @ViewParameters,
                @Overrides = @Overrides,
                @OperationProfile = @ResolvedOperationProfile,
                @Operations = @Operations,
                @ReplaceOperations = @ReplaceOperations,
                @IncludeSaveOperation = @IncludeSaveOperation,
                @IncludeDeleteOperation = @IncludeDeleteOperation,
                @EmitResult = 0,
                @ApiInsertedOutput = @ApiInserted OUTPUT,
                @ApiDeletedOutput = @ApiDeleted OUTPUT,
                @FieldsInsertedOutput = @FieldsInserted OUTPUT,
                @FieldsUpdatedOutput = @FieldsUpdated OUTPUT,
                @FieldsDeletedOutput = @FieldsDeleted OUTPUT;
        END

        IF @IsEdit = 1
        BEGIN
            IF @OldMenuID <> @MenuID
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM dbo.WA_Menu WITH (UPDLOCK, HOLDLOCK) WHERE MenuID = @MenuID
                )
                    THROW 51410, 'The new MenuID already exists.', 1;

                UPDATE dbo.WA_Menu SET MenuID = @MenuID WHERE MenuID = @OldMenuID;

                IF OBJECT_ID('dbo.WA_UserGroupPermisstion', 'U') IS NOT NULL
                    UPDATE dbo.WA_UserGroupPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;

                IF OBJECT_ID('dbo.WA_UserPermisstion', 'U') IS NOT NULL
                    UPDATE dbo.WA_UserPermisstion SET MenuID = @MenuID WHERE MenuID = @OldMenuID;

                UPDATE dbo.WA_Menu SET Parent = @MenuID WHERE Parent = @OldMenuID;
            END

            UPDATE dbo.WA_Menu
               SET Parent = @ParentID,
                   VN = @Label,
                   EN = @EN,
                   SubTitle = @SubTitle,
                   FormName = @FormName,
                   FormKey = @FormKey,
                   URLPara = @URLPara,
                   IconClass = @Icon,
                   isDisable = @IsDisable
            WHERE MenuID = @MenuID;
        END
        ELSE
        BEGIN
            IF EXISTS (
                SELECT 1 FROM dbo.WA_Menu WITH (UPDLOCK, HOLDLOCK) WHERE MenuID = @MenuID
            )
                THROW 51411, 'MenuID already exists.', 1;

            INSERT INTO dbo.WA_Menu
                (MenuID, Parent, VN, EN, SubTitle, FormName, FormKey, URLPara, IconClass, isDisable)
            VALUES
                (@MenuID, @ParentID, @Label, @EN, @SubTitle, @FormName, @FormKey, @URLPara, @Icon, @IsDisable);
        END

        IF @FormName <> ''
        BEGIN
            DECLARE @RegisteredTable VARCHAR(128);
            DECLARE @RegisteredPrimaryKey VARCHAR(50);
            DECLARE @RegisteredView VARCHAR(256);
            DECLARE @RegisteredSave VARCHAR(256);
            DECLARE @RegisteredDelete VARCHAR(256);

            SELECT
                @RegisteredTable = form.TableName,
                @RegisteredPrimaryKey = form.PrimaryKey
            FROM dbo.SY_FrmLstTbl form
            WHERE form.FormID = @FormName;

            SELECT @RegisteredOperationCount = COUNT(*)
            FROM dbo.WA_API api
            WHERE api.list = @FormName;

            SELECT TOP (1) @RegisteredView = api.[SQL]
            FROM dbo.WA_API api
            WHERE api.list = @FormName AND UPPER(api.func) = 'VIEW';

            SELECT TOP (1) @RegisteredSave = api.[SQL]
            FROM dbo.WA_API api
            WHERE api.list = @FormName AND UPPER(api.func) = 'SAVE';

            SELECT TOP (1) @RegisteredDelete = api.[SQL]
            FROM dbo.WA_API api
            WHERE api.list = @FormName AND UPPER(api.func) = 'DELETE';

            SET @ResourceStatus = CASE
                WHEN @RegisteredTable IS NULL THEN 'FORM_NOT_REGISTERED'
                WHEN OBJECT_ID(@RegisteredTable, 'U') IS NULL
                 AND OBJECT_ID(@RegisteredTable, 'V') IS NULL THEN 'MISSING_TABLE'
                WHEN NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(@RegisteredTable)
                      AND name = @RegisteredPrimaryKey
                ) THEN 'MISSING_PRIMARY_KEY'
                WHEN @RegisteredView IS NULL THEN 'MISSING_VIEW_OPERATION'
                WHEN OBJECT_ID(@RegisteredView, 'P') IS NULL THEN 'MISSING_VIEW_PROCEDURE'
                WHEN @ResolvedOperationProfile = 'CRUD' AND @RegisteredSave IS NULL THEN 'MISSING_SAVE_OPERATION'
                WHEN @ResolvedOperationProfile = 'CRUD' AND @RegisteredDelete IS NULL THEN 'MISSING_DELETE_OPERATION'
                WHEN @ResolvedOperationProfile = 'CRUD' AND OBJECT_ID(@RegisteredSave, 'P') IS NULL THEN 'MISSING_SAVE_PROCEDURE'
                WHEN @ResolvedOperationProfile = 'CRUD' AND OBJECT_ID(@RegisteredDelete, 'P') IS NULL THEN 'MISSING_DELETE_PROCEDURE'
                WHEN EXISTS (
                    SELECT 1
                    FROM dbo.WA_API operation
                    WHERE operation.list = @FormName
                      AND OBJECT_ID(operation.[SQL], 'P') IS NULL
                ) THEN 'MISSING_OPERATION_PROCEDURE'
                WHEN NOT EXISTS (
                    SELECT 1 FROM dbo.SY_FormatFields WHERE FormName = @FormName
                ) THEN 'NO_FIELD_METADATA'
                ELSE 'AVAILABLE'
            END;
        END

        IF (@RegisterForm = 1 OR @RequireAvailableForm = 1)
           AND @ResourceStatus <> 'AVAILABLE'
            THROW 51412, 'The selected form is not available.', 1;

        COMMIT TRANSACTION;

        SELECT
            0 AS code,
            @MenuID AS MenuID,
            @FormName AS FormName,
            @URLPara AS URLPara,
            @RegisterForm AS FormRegistered,
            @ResourceStatus AS ResourceStatus,
            COALESCE(@ResolvedOperationProfile, 'EXISTING') AS OperationProfile,
            @RegisteredOperationCount AS OperationCount,
            @ApiInserted AS ApiInserted,
            @ApiDeleted AS ApiDeleted,
            @FieldsInserted AS FieldsInserted,
            @FieldsUpdated AS FieldsUpdated,
            @FieldsDeleted AS FieldsDeleted,
            CASE
                WHEN @RegisterForm = 1 THEN N'Menu and form registration completed.'
                ELSE N'Menu saved.'
            END AS msg;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO
