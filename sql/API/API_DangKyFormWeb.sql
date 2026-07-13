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
    @Operations        NVARCHAR(MAX) = NULL,
    @ReplaceOperations BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ApiInserted INT = 0;
    DECLARE @ApiDeleted INT = 0;
    DECLARE @FieldsInserted INT = 0;
    DECLARE @FieldsUpdated INT = 0;
    DECLARE @FieldsDeleted INT = 0;

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

        DECLARE @CanonicalOperations TABLE (
            func VARCHAR(50) NOT NULL PRIMARY KEY,
            [SQL] VARCHAR(256) NOT NULL,
            Para NVARCHAR(MAX) NULL
        );

        INSERT INTO @CanonicalOperations (func, [SQL], Para)
        VALUES
            ('View', @ViewProcedure, @ViewParameters),
            ('Save', 'API_LuuDong', N'@List=N''' + REPLACE(@FormName, '''', '''''') + N''', @Data=N''{JsonData}'', @UserName=N''{User}'''),
            ('Delete', 'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''');

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

        IF @Operations IS NOT NULL AND @ReplaceOperations = 1
        BEGIN
            DELETE FROM dbo.WA_API
            WHERE list = @FormName;

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

        SELECT
            0 AS code,
            @FormName AS FormName,
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
