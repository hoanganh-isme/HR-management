CREATE OR ALTER PROCEDURE [dbo].[API_DangKyFormWeb]
    @FormName          VARCHAR(50),
    @TableName         VARCHAR(128),
    @PrimaryKey        VARCHAR(50),
    @CaptionVN         NVARCHAR(255),
    @CaptionEN         NVARCHAR(255) = NULL,
    @FormType          VARCHAR(20) = 'EDIT',
    @ViewProcedure     VARCHAR(128) = NULL,
    @ViewParameters    NVARCHAR(MAX) = NULL,
    @Overrides         NVARCHAR(MAX) = N'[]',
    @OperationProfile  VARCHAR(20) = NULL,
    @Operations        NVARCHAR(MAX) = NULL,
    @ReplaceOperations BIT = 0,
    @IncludeSaveOperation BIT = 1,
    @IncludeDeleteOperation BIT = 1,
    @EmitResult BIT = 1,
    @ApiInsertedOutput INT = NULL OUTPUT,
    @ApiDeletedOutput INT = NULL OUTPUT,
    @FieldsInsertedOutput INT = NULL OUTPUT,
    @FieldsUpdatedOutput INT = NULL OUTPUT,
    @FieldsDeletedOutput INT = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ApiInserted INT = 0;
    DECLARE @ApiDeleted INT = 0;
    DECLARE @FieldsInserted INT = 0;
    DECLARE @FieldsUpdated INT = 0;
    DECLARE @FieldsDeleted INT = 0;
    DECLARE @HasExplicitProfile BIT = CASE
        WHEN NULLIF(LTRIM(RTRIM(ISNULL(@OperationProfile, ''))), '') IS NULL THEN 0
        ELSE 1
    END;
    DECLARE @ResolvedOperationProfile VARCHAR(20);

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NULLIF(LTRIM(RTRIM(@FormName)), '') IS NULL
            THROW 51000, 'FormName is required.', 1;

        IF NULLIF(LTRIM(RTRIM(@TableName)), '') IS NULL
            THROW 51001, 'TableName is required.', 1;

        IF NULLIF(LTRIM(RTRIM(@PrimaryKey)), '') IS NULL
            THROW 51002, 'PrimaryKey is required.', 1;

        IF NULLIF(LTRIM(RTRIM(@ViewProcedure)), '') IS NULL
            SET @ViewProcedure = @FormName;

        IF NULLIF(LTRIM(RTRIM(@ViewParameters)), '') IS NULL
            SET @ViewParameters = N'@Keyword=N''{Keyword}''';

        IF ISJSON(@Overrides) <> 1
            SET @Overrides = N'[]';

        IF @Operations IS NOT NULL AND ISJSON(@Operations) <> 1
            THROW 51003, 'Operations must be valid JSON.', 1;

        SET @ResolvedOperationProfile = UPPER(LTRIM(RTRIM(ISNULL(@OperationProfile, ''))));

        IF @ResolvedOperationProfile = ''
            SET @ResolvedOperationProfile = CASE
                WHEN @IncludeSaveOperation = 1 AND @IncludeDeleteOperation = 1 THEN 'CRUD'
                WHEN @IncludeSaveOperation = 0 AND @IncludeDeleteOperation = 0 THEN 'READONLY'
                ELSE 'CUSTOM'
            END;

        IF @ResolvedOperationProfile NOT IN ('CRUD', 'READONLY', 'CUSTOM')
            THROW 51007, 'OperationProfile must be CRUD, READONLY or CUSTOM.', 1;

        IF @ResolvedOperationProfile = 'CRUD'
        BEGIN
            SET @IncludeSaveOperation = 1;
            SET @IncludeDeleteOperation = 1;
        END
        ELSE IF @ResolvedOperationProfile = 'READONLY'
        BEGIN
            SET @IncludeSaveOperation = 0;
            SET @IncludeDeleteOperation = 0;
        END
        ELSE IF @HasExplicitProfile = 1
        BEGIN
            -- CUSTOM lay toan bo thao tac ghi du lieu tu @Operations.
            SET @IncludeSaveOperation = 0;
            SET @IncludeDeleteOperation = 0;
        END

        -- Profile duoc chon ro rang la hop dong chinh xac, khong giu lai API cu.
        IF @HasExplicitProfile = 1
            SET @ReplaceOperations = 1;

        DECLARE @CanonicalOperations TABLE (
            func VARCHAR(50) NOT NULL PRIMARY KEY,
            [SQL] VARCHAR(256) NOT NULL,
            Para NVARCHAR(MAX) NULL
        );

        INSERT INTO @CanonicalOperations (func, [SQL], Para)
        VALUES ('View', @ViewProcedure, @ViewParameters);

        IF @IncludeSaveOperation = 1
            INSERT INTO @CanonicalOperations (func, [SQL], Para)
            VALUES ('Save', 'API_LuuDong', N'@List=N''' + REPLACE(@FormName, '''', '''''') + N''', @Data=N''{JsonData}'', @UserName=N''{User}''');

        IF @IncludeDeleteOperation = 1
            INSERT INTO @CanonicalOperations (func, [SQL], Para)
            VALUES ('Delete', 'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

        IF @Operations IS NOT NULL
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM OPENJSON(@Operations)
                WITH (
                    func VARCHAR(50) '$.func',
                    [SQL] VARCHAR(256) '$.sql'
                ) operation
                WHERE NULLIF(LTRIM(RTRIM(operation.func)), '') IS NULL
                   OR NULLIF(LTRIM(RTRIM(operation.[SQL])), '') IS NULL
            )
                THROW 51004, 'Every operation requires func and sql.', 1;

            IF EXISTS (
                SELECT operation.func
                FROM OPENJSON(@Operations)
                WITH (func VARCHAR(50) '$.func') operation
                GROUP BY operation.func
                HAVING operation.func IS NULL OR COUNT(*) > 1
            )
                THROW 51005, 'Operations contains a duplicate func.', 1;

            DECLARE @ParsedOperations TABLE (
                func VARCHAR(50) NOT NULL PRIMARY KEY,
                [SQL] VARCHAR(256) NOT NULL,
                Para NVARCHAR(MAX) NULL
            );

            INSERT INTO @ParsedOperations (func, [SQL], Para)
            SELECT
                LTRIM(RTRIM(operation.func)),
                LTRIM(RTRIM(operation.[SQL])),
                operation.Para
            FROM OPENJSON(@Operations)
            WITH (
                func VARCHAR(50) '$.func',
                [SQL] VARCHAR(256) '$.sql',
                Para NVARCHAR(MAX) '$.para'
            ) operation;

            IF @ResolvedOperationProfile = 'CUSTOM'
               AND @HasExplicitProfile = 1
               AND NOT EXISTS (SELECT 1 FROM @ParsedOperations)
                THROW 51008, 'CUSTOM profile requires at least one custom operation.', 1;

            UPDATE canonical
               SET canonical.[SQL] = parsed.[SQL],
                   canonical.Para = parsed.Para
            FROM @CanonicalOperations canonical
            INNER JOIN @ParsedOperations parsed ON parsed.func = canonical.func;

            INSERT INTO @CanonicalOperations (func, [SQL], Para)
            SELECT parsed.func, parsed.[SQL], parsed.Para
            FROM @ParsedOperations parsed
            WHERE NOT EXISTS (
                SELECT 1
                FROM @CanonicalOperations canonical
                WHERE canonical.func = parsed.func
            );
        END

        IF @ResolvedOperationProfile = 'CUSTOM'
           AND @HasExplicitProfile = 1
           AND NOT EXISTS (
               SELECT 1 FROM @CanonicalOperations WHERE UPPER(func) <> 'VIEW'
           )
            THROW 51008, 'CUSTOM profile requires at least one custom operation.', 1;

        IF @ResolvedOperationProfile = 'READONLY'
           AND EXISTS (
               SELECT 1
               FROM @CanonicalOperations
               WHERE UPPER(func) IN ('SAVE', 'DELETE', 'EXECUTE')
           )
            THROW 51009, 'READONLY profile cannot contain Save, Delete or Execute.', 1;

        IF @ResolvedOperationProfile = 'CRUD'
           AND EXISTS (
               SELECT required.func
               FROM (VALUES ('View'), ('Save'), ('Delete')) required(func)
               WHERE NOT EXISTS (
                   SELECT 1
                   FROM @CanonicalOperations operation
                   WHERE UPPER(operation.func) = UPPER(required.func)
               )
           )
            THROW 51010, 'CRUD profile requires View, Save and Delete.', 1;

        IF EXISTS (
            SELECT 1
            FROM @CanonicalOperations operation
            WHERE OBJECT_ID(operation.[SQL], 'P') IS NULL
        )
            THROW 51011, 'A registered operation references a missing stored procedure.', 1;

        UPDATE form WITH (UPDLOCK, HOLDLOCK)
           SET FormType = @FormType,
               CaptionVN = @CaptionVN,
               CaptionEN = @CaptionEN,
               TableName = @TableName,
               PrimaryKey = @PrimaryKey,
               CaptionCH = COALESCE(NULLIF(form.CaptionCH, N''), @CaptionVN)
        FROM dbo.SY_FrmLstTbl form
        WHERE form.FormID = @FormName;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO dbo.SY_FrmLstTbl
                (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey, CaptionCH)
            VALUES
                (@FormName, @FormType, @CaptionVN, @CaptionEN, @TableName, @PrimaryKey, @CaptionVN);
        END

        IF EXISTS (
            SELECT api.func
            FROM dbo.WA_API api
            WHERE api.list = @FormName
            GROUP BY api.func
            HAVING COUNT(*) > 1
        )
            THROW 51006, 'WA_API contains duplicate list + func rows for this form.', 1;

        IF @ReplaceOperations = 1
        BEGIN
            DELETE api
            FROM dbo.WA_API api
            WHERE api.list = @FormName
              AND NOT EXISTS (
                  SELECT 1
                  FROM @CanonicalOperations operation
                  WHERE UPPER(operation.func) = UPPER(api.func)
              );

            SET @ApiDeleted = @@ROWCOUNT;
        END

        UPDATE api WITH (UPDLOCK, HOLDLOCK)
           SET api.[SQL] = operation.[SQL],
               api.Para = operation.Para
        FROM dbo.WA_API api
        INNER JOIN @CanonicalOperations operation ON operation.func = api.func
        WHERE api.list = @FormName;

        INSERT INTO dbo.WA_API (list, func, [SQL], Para)
        SELECT @FormName, operation.func, operation.[SQL], operation.Para
        FROM @CanonicalOperations operation
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.WA_API api WITH (UPDLOCK, HOLDLOCK)
            WHERE api.list = @FormName
              AND api.func = operation.func
        );

        SET @ApiInserted = @@ROWCOUNT;

        DECLARE @SyncSummary TABLE (
            FieldsInserted INT,
            FieldsUpdated INT,
            FieldsDeleted INT
        );

        INSERT INTO @SyncSummary (FieldsInserted, FieldsUpdated, FieldsDeleted)
        EXEC dbo.API_DongBoTruongGiaoDien
            @FormName = @FormName,
            @ObjectName = @ViewProcedure,
            @Overrides = @Overrides,
            @FallbackObjectName = @TableName;

        SELECT
            @FieldsInserted = FieldsInserted,
            @FieldsUpdated = FieldsUpdated,
            @FieldsDeleted = FieldsDeleted
        FROM @SyncSummary;

        IF OBJECT_ID('dbo.SY_FmtFldTbl', 'U') IS NOT NULL
        BEGIN
            UPDATE field
               SET CaptionVN = COALESCE(formDictionary.CaptionVN, globalDictionary.CaptionVN, field.CaptionVN),
                   CaptionEN = COALESCE(formDictionary.CaptionEN, globalDictionary.CaptionEN, field.CaptionEN),
                   FormatID = COALESCE(NULLIF(field.FormatID, ''), formDictionary.FormatID, globalDictionary.FormatID, 't')
            FROM dbo.SY_FormatFields field
            OUTER APPLY (
                SELECT TOP (1) dictionary.CaptionVN, dictionary.CaptionEN, dictionary.FormatID
                FROM dbo.SY_FmtFldTbl dictionary
                WHERE dictionary.FieldName = field.FieldName
                  AND dictionary.FormName = field.FormName
            ) formDictionary
            OUTER APPLY (
                SELECT TOP (1) dictionary.CaptionVN, dictionary.CaptionEN, dictionary.FormatID
                FROM dbo.SY_FmtFldTbl dictionary
                WHERE dictionary.FieldName = field.FieldName
                  AND ISNULL(dictionary.FormName, '') = ''
            ) globalDictionary
            WHERE field.FormName = @FormName
              AND (NULLIF(field.CaptionVN, '') IS NULL OR field.CaptionVN = field.FieldName);

            SET @FieldsUpdated += @@ROWCOUNT;
        END

        ;WITH overrides AS (
            SELECT
                override.FieldName,
                override.CaptionVN,
                override.CaptionEN,
                override.FormatID,
                override.DataSource,
                override.FormPosition,
                override.ValidateRule,
                override.DependsOn,
                override.VisibleRule,
                override.OrderNo,
                override.ShowInAdd,
                override.ShowInEdit,
                override.IsReadOnlyAdd,
                override.IsReadOnlyEdit,
                override.IsRequired,
                override.ShowInFilter
            FROM OPENJSON(@Overrides)
            WITH (
                FieldName VARCHAR(128) '$.field',
                CaptionVN NVARCHAR(255) '$.captionVN',
                CaptionEN NVARCHAR(255) '$.captionEN',
                FormatID VARCHAR(10) '$.formatId',
                DataSource NVARCHAR(500) '$.dataSource',
                FormPosition VARCHAR(50) '$.position',
                ValidateRule NVARCHAR(500) '$.validateRule',
                DependsOn VARCHAR(100) '$.dependsOn',
                VisibleRule NVARCHAR(500) '$.visibleRule',
                OrderNo INT '$.orderNo',
                ShowInAdd BIT '$.showInAdd',
                ShowInEdit BIT '$.showInEdit',
                IsReadOnlyAdd BIT '$.readOnlyAdd',
                IsReadOnlyEdit BIT '$.readOnlyEdit',
                IsRequired BIT '$.required',
                ShowInFilter BIT '$.showInFilter'
            ) override
            WHERE NULLIF(LTRIM(RTRIM(override.FieldName)), '') IS NOT NULL
        )
        UPDATE field
           SET CaptionVN = COALESCE(override.CaptionVN, field.CaptionVN),
               CaptionEN = COALESCE(override.CaptionEN, field.CaptionEN),
               FormatID = COALESCE(override.FormatID, field.FormatID),
               DataSource = COALESCE(override.DataSource, field.DataSource),
               FormPosition = COALESCE(override.FormPosition, field.FormPosition),
               ValidateRule = COALESCE(override.ValidateRule, field.ValidateRule),
               DependsOn = COALESCE(override.DependsOn, field.DependsOn),
               VisibleRule = COALESCE(override.VisibleRule, field.VisibleRule),
               OrderNo = COALESCE(override.OrderNo, field.OrderNo),
               ShowInAdd = COALESCE(override.ShowInAdd, field.ShowInAdd),
               ShowInEdit = COALESCE(override.ShowInEdit, field.ShowInEdit),
               IsReadOnlyAdd = COALESCE(override.IsReadOnlyAdd, field.IsReadOnlyAdd),
               IsReadOnlyEdit = COALESCE(override.IsReadOnlyEdit, field.IsReadOnlyEdit),
               IsRequired = COALESCE(override.IsRequired, field.IsRequired),
               ShowInFilter = COALESCE(override.ShowInFilter, field.ShowInFilter)
        FROM dbo.SY_FormatFields field
        INNER JOIN overrides override ON override.FieldName = field.FieldName
        WHERE field.FormName = @FormName;

        SET @FieldsUpdated += @@ROWCOUNT;

        COMMIT TRANSACTION;

        SET @ApiInsertedOutput = @ApiInserted;
        SET @ApiDeletedOutput = @ApiDeleted;
        SET @FieldsInsertedOutput = @FieldsInserted;
        SET @FieldsUpdatedOutput = @FieldsUpdated;
        SET @FieldsDeletedOutput = @FieldsDeleted;

        IF @EmitResult = 1
            SELECT
                0 AS code,
                @FormName AS FormName,
                @ResolvedOperationProfile AS OperationProfile,
                (SELECT COUNT(*) FROM @CanonicalOperations) AS OperationCount,
                @ApiInserted AS ApiInserted,
                @ApiDeleted AS ApiDeleted,
                @FieldsInserted AS FieldsInserted,
                @FieldsUpdated AS FieldsUpdated,
                @FieldsDeleted AS FieldsDeleted,
                N'Form registration completed.' AS msg;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO
