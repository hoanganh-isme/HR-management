CREATE OR ALTER PROCEDURE [dbo].[API_DongBoTruongGiaoDien]
    @FormName VARCHAR(50),
    @ObjectName VARCHAR(256) = NULL,
    @TSQL NVARCHAR(MAX) = NULL,
    @Overrides NVARCHAR(MAX) = N'[]',
    @DeleteMissingFields BIT = 0,
    @FallbackObjectName VARCHAR(256) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @FieldsInserted INT = 0;
    DECLARE @FieldsUpdated INT = 0;
    DECLARE @FieldsDeleted INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NULLIF(LTRIM(RTRIM(@FormName)), '') IS NULL
            THROW 51100, 'FormName is required.', 1;

        IF NULLIF(LTRIM(RTRIM(@ObjectName)), '') IS NULL
           AND NULLIF(LTRIM(RTRIM(@TSQL)), '') IS NULL
            THROW 51101, 'ObjectName or TSQL is required.', 1;

        IF ISJSON(@Overrides) <> 1
            SET @Overrides = N'[]';

        DECLARE @Columns TABLE (
            FieldName NVARCHAR(128) NOT NULL PRIMARY KEY,
            SystemTypeName NVARCHAR(128) NULL,
            ColumnOrdinal INT NOT NULL
        );

        IF NULLIF(LTRIM(RTRIM(@ObjectName)), '') IS NOT NULL
        BEGIN
            IF PARSENAME(@ObjectName, 3) IS NOT NULL OR PARSENAME(@ObjectName, 4) IS NOT NULL
                THROW 51102, 'ObjectName must be a one-part or two-part name.', 1;

            DECLARE @SchemaName SYSNAME = COALESCE(PARSENAME(@ObjectName, 2), 'dbo');
            DECLARE @SimpleObjectName SYSNAME = PARSENAME(@ObjectName, 1);

            IF NULLIF(@SimpleObjectName, '') IS NULL
                THROW 51103, 'ObjectName is invalid.', 1;

            DECLARE @QualifiedObjectName NVARCHAR(517) =
                QUOTENAME(@SchemaName) + N'.' + QUOTENAME(@SimpleObjectName);
            DECLARE @ObjectID INT = OBJECT_ID(@QualifiedObjectName);
            DECLARE @ObjectType CHAR(2);

            IF @ObjectID IS NULL
                THROW 51104, 'Metadata source object does not exist.', 1;

            SELECT @ObjectType = object.type
            FROM sys.objects object
            WHERE object.object_id = @ObjectID;

            IF @ObjectType IN ('U', 'V')
            BEGIN
                INSERT INTO @Columns (FieldName, SystemTypeName, ColumnOrdinal)
                SELECT
                    columnDefinition.name,
                    typeDefinition.name,
                    columnDefinition.column_id
                FROM sys.columns columnDefinition
                INNER JOIN sys.types typeDefinition
                    ON typeDefinition.user_type_id = columnDefinition.user_type_id
                WHERE columnDefinition.object_id = @ObjectID
                  AND columnDefinition.is_hidden = 0;
            END
            ELSE
            BEGIN
                INSERT INTO @Columns (FieldName, SystemTypeName, ColumnOrdinal)
                SELECT
                    metadata.name,
                    metadata.system_type_name,
                    metadata.column_ordinal
                FROM sys.dm_exec_describe_first_result_set_for_object(@ObjectID, 0) metadata
                WHERE metadata.name IS NOT NULL
                  AND metadata.is_hidden = 0
                  AND metadata.error_type IS NULL;
            END
        END
        ELSE
        BEGIN
            INSERT INTO @Columns (FieldName, SystemTypeName, ColumnOrdinal)
            SELECT
                metadata.name,
                metadata.system_type_name,
                metadata.column_ordinal
            FROM sys.dm_exec_describe_first_result_set(@TSQL, NULL, 0) metadata
            WHERE metadata.name IS NOT NULL
              AND metadata.is_hidden = 0
              AND metadata.error_type IS NULL;
        END

        IF NOT EXISTS (SELECT 1 FROM @Columns)
           AND NULLIF(LTRIM(RTRIM(@FallbackObjectName)), '') IS NOT NULL
        BEGIN
            IF PARSENAME(@FallbackObjectName, 3) IS NOT NULL
               OR PARSENAME(@FallbackObjectName, 4) IS NOT NULL
                THROW 51107, 'FallbackObjectName must be a one-part or two-part name.', 1;

            DECLARE @FallbackSchemaName SYSNAME =
                COALESCE(PARSENAME(@FallbackObjectName, 2), 'dbo');
            DECLARE @FallbackSimpleName SYSNAME = PARSENAME(@FallbackObjectName, 1);
            DECLARE @FallbackQualifiedName NVARCHAR(517) =
                QUOTENAME(@FallbackSchemaName) + N'.' + QUOTENAME(@FallbackSimpleName);
            DECLARE @FallbackObjectID INT = OBJECT_ID(@FallbackQualifiedName);

            IF @FallbackObjectID IS NOT NULL
               AND EXISTS (
                   SELECT 1
                   FROM sys.objects object
                   WHERE object.object_id = @FallbackObjectID
                     AND object.type IN ('U', 'V')
               )
            BEGIN
                INSERT INTO @Columns (FieldName, SystemTypeName, ColumnOrdinal)
                SELECT
                    columnDefinition.name,
                    typeDefinition.name,
                    columnDefinition.column_id
                FROM sys.columns columnDefinition
                INNER JOIN sys.types typeDefinition
                    ON typeDefinition.user_type_id = columnDefinition.user_type_id
                WHERE columnDefinition.object_id = @FallbackObjectID
                  AND columnDefinition.is_hidden = 0;
            END
        END

        IF NOT EXISTS (SELECT 1 FROM @Columns)
            THROW 51105, 'Metadata discovery returned no columns; existing fields were preserved.', 1;

        DECLARE @ExpectedFields TABLE (
            FieldName VARCHAR(128) NOT NULL PRIMARY KEY,
            SystemTypeName NVARCHAR(128) NULL,
            ColumnOrdinal INT NOT NULL,
            IsOverride BIT NOT NULL
        );

        INSERT INTO @ExpectedFields (FieldName, SystemTypeName, ColumnOrdinal, IsOverride)
        SELECT
            CONVERT(VARCHAR(128), columnDefinition.FieldName),
            columnDefinition.SystemTypeName,
            columnDefinition.ColumnOrdinal,
            0
        FROM @Columns columnDefinition;

        DECLARE @LastColumnOrdinal INT =
            COALESCE((SELECT MAX(ColumnOrdinal) FROM @ExpectedFields), 0);

        ;WITH overrideFields AS (
            SELECT DISTINCT LTRIM(RTRIM(override.FieldName)) AS FieldName
            FROM OPENJSON(@Overrides)
            WITH (FieldName VARCHAR(128) '$.field') override
            WHERE NULLIF(LTRIM(RTRIM(override.FieldName)), '') IS NOT NULL
        ), numberedOverrides AS (
            SELECT
                override.FieldName,
                ROW_NUMBER() OVER (ORDER BY override.FieldName) AS OverrideOrdinal
            FROM overrideFields override
        )
        INSERT INTO @ExpectedFields (FieldName, SystemTypeName, ColumnOrdinal, IsOverride)
        SELECT
            override.FieldName,
            N'nvarchar(255)',
            @LastColumnOrdinal + override.OverrideOrdinal,
            1
        FROM numberedOverrides override
        WHERE NOT EXISTS (
            SELECT 1
            FROM @ExpectedFields expected
            WHERE expected.FieldName = override.FieldName
        );

        IF NOT EXISTS (SELECT 1 FROM @ExpectedFields)
            THROW 51106, 'Expected field set is empty; existing fields were preserved.', 1;

        UPDATE field WITH (UPDLOCK, HOLDLOCK)
           SET CaptionVN = COALESCE(NULLIF(field.CaptionVN, N''), field.FieldName),
               FormatID = COALESCE(
                   NULLIF(field.FormatID, ''),
                   CASE
                       WHEN expected.SystemTypeName LIKE '%int%'
                         OR expected.SystemTypeName LIKE '%decimal%'
                         OR expected.SystemTypeName LIKE '%numeric%'
                         OR expected.SystemTypeName LIKE '%float%'
                         OR expected.SystemTypeName LIKE '%money%' THEN 'n'
                       WHEN expected.SystemTypeName LIKE '%date%'
                         OR expected.SystemTypeName LIKE '%time%' THEN 'd'
                       WHEN expected.SystemTypeName LIKE '%bit%' THEN 'c'
                       ELSE 't'
                   END
               ),
               FormPosition = COALESCE(NULLIF(field.FormPosition, ''), 'grid'),
               ShowInAdd = COALESCE(field.ShowInAdd, 1),
               ShowInEdit = COALESCE(field.ShowInEdit, 1),
               IsReadOnlyEdit = COALESCE(field.IsReadOnlyEdit, 0),
               IsReadOnlyAdd = COALESCE(field.IsReadOnlyAdd, 0),
               IsRequired = COALESCE(field.IsRequired, 0),
               ShowInFilter = COALESCE(field.ShowInFilter, 0)
        FROM dbo.SY_FormatFields field
        INNER JOIN @ExpectedFields expected ON expected.FieldName = field.FieldName
        WHERE field.FormName = @FormName
          AND (
              NULLIF(field.CaptionVN, N'') IS NULL
              OR NULLIF(field.FormatID, '') IS NULL
              OR NULLIF(field.FormPosition, '') IS NULL
              OR field.ShowInAdd IS NULL
              OR field.ShowInEdit IS NULL
              OR field.IsReadOnlyEdit IS NULL
              OR field.IsReadOnlyAdd IS NULL
              OR field.IsRequired IS NULL
              OR field.ShowInFilter IS NULL
          );

        SET @FieldsUpdated = @@ROWCOUNT;

        INSERT INTO dbo.SY_FormatFields
            (FormName, FieldName, CaptionVN, FormatID, CaptionEN, DataSource,
             IsRequired, FormPosition, ShowInAdd, ShowInEdit, IsReadOnlyEdit,
             IsReadOnlyAdd, ValidateRule, DependsOn, VisibleRule, OrderNo, ShowInFilter)
        SELECT
            @FormName,
            expected.FieldName,
            expected.FieldName,
            CASE
                WHEN expected.SystemTypeName LIKE '%int%'
                  OR expected.SystemTypeName LIKE '%decimal%'
                  OR expected.SystemTypeName LIKE '%numeric%'
                  OR expected.SystemTypeName LIKE '%float%'
                  OR expected.SystemTypeName LIKE '%money%' THEN 'n'
                WHEN expected.SystemTypeName LIKE '%date%'
                  OR expected.SystemTypeName LIKE '%time%' THEN 'd'
                WHEN expected.SystemTypeName LIKE '%bit%' THEN 'c'
                ELSE 't'
            END,
            NULL,
            NULL,
            0,
            'grid',
            1,
            1,
            0,
            0,
            NULL,
            NULL,
            NULL,
            expected.ColumnOrdinal,
            0
        FROM @ExpectedFields expected
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.SY_FormatFields field WITH (UPDLOCK, HOLDLOCK)
            WHERE field.FormName = @FormName
              AND field.FieldName = expected.FieldName
        );

        SET @FieldsInserted = @@ROWCOUNT;

        IF @DeleteMissingFields = 1
        BEGIN
            DELETE field
            FROM dbo.SY_FormatFields field
            WHERE field.FormName = @FormName
              AND NOT EXISTS (
                  SELECT 1
                  FROM @ExpectedFields expected
                  WHERE expected.FieldName = field.FieldName
              );

            SET @FieldsDeleted = @@ROWCOUNT;
        END

        COMMIT TRANSACTION;

        SELECT
            @FieldsInserted AS FieldsInserted,
            @FieldsUpdated AS FieldsUpdated,
            @FieldsDeleted AS FieldsDeleted;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO
