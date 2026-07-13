CREATE OR ALTER PROCEDURE [dbo].[API_TheoDoiTaiNguyenFormWeb]
    @FormName VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Result set 1: registry resources. This procedure is intentionally read-only.
    SELECT
        form.FormID AS FormName,
        form.TableName,
        form.PrimaryKey,
        viewApi.[SQL] AS ViewProcedure,
        viewApi.Para AS ViewParameters,
        CASE WHEN tableObject.object_id IS NULL THEN 0 ELSE 1 END AS TableExists,
        CASE WHEN primaryKeyColumn.column_id IS NULL THEN 0 ELSE 1 END AS PrimaryKeyExists,
        CASE WHEN viewObject.object_id IS NULL THEN 0 ELSE 1 END AS ViewProcedureExists,
        COALESCE(apiStats.ApiCount, 0) AS ApiCount,
        COALESCE(fieldStats.FieldCount, 0) AS MaterializedFieldCount,
        COALESCE(fieldStats.SharedDictionaryMatches, 0) AS SharedDictionaryMatches,
        CASE
            WHEN tableObject.object_id IS NULL THEN 'MISSING_TABLE'
            WHEN primaryKeyColumn.column_id IS NULL THEN 'MISSING_PRIMARY_KEY'
            WHEN viewApi.[SQL] IS NULL THEN 'MISSING_VIEW_OPERATION'
            WHEN viewObject.object_id IS NULL THEN 'MISSING_VIEW_PROCEDURE'
            WHEN COALESCE(fieldStats.FieldCount, 0) = 0 THEN 'NO_FIELD_METADATA'
            ELSE 'AVAILABLE'
        END AS ResourceStatus
    FROM dbo.SY_FrmLstTbl form
    OUTER APPLY (
        SELECT TOP (1) api.[SQL], api.Para
        FROM dbo.WA_API api
        WHERE api.list = form.FormID
          AND api.func = 'View'
        ORDER BY api.[SQL]
    ) viewApi
    OUTER APPLY (
        SELECT OBJECT_ID(
            QUOTENAME(COALESCE(PARSENAME(form.TableName, 2), 'dbo'))
            + '.' + QUOTENAME(PARSENAME(form.TableName, 1))
        ) AS object_id
    ) tableObject
    OUTER APPLY (
        SELECT columnDefinition.column_id
        FROM sys.columns columnDefinition
        WHERE columnDefinition.object_id = tableObject.object_id
          AND columnDefinition.name = form.PrimaryKey
    ) primaryKeyColumn
    OUTER APPLY (
        SELECT OBJECT_ID(
            QUOTENAME(COALESCE(PARSENAME(viewApi.[SQL], 2), 'dbo'))
            + '.' + QUOTENAME(PARSENAME(viewApi.[SQL], 1)),
            'P'
        ) AS object_id
    ) viewObject
    OUTER APPLY (
        SELECT COUNT(*) AS ApiCount
        FROM dbo.WA_API api
        WHERE api.list = form.FormID
    ) apiStats
    OUTER APPLY (
        SELECT
            COUNT(*) AS FieldCount,
            SUM(CASE WHEN globalDictionary.FieldName IS NULL THEN 0 ELSE 1 END) AS SharedDictionaryMatches
        FROM dbo.SY_FormatFields field
        LEFT JOIN dbo.SY_FmtFldTbl globalDictionary
          ON globalDictionary.FieldName = field.FieldName
         AND ISNULL(globalDictionary.FormName, '') = ''
        WHERE field.FormName = form.FormID
    ) fieldStats
    WHERE @FormName IS NULL OR form.FormID = @FormName
    ORDER BY form.FormID;

    -- Result set 2: repeated names are candidates for one global dictionary row.
    SELECT
        field.FieldName,
        COUNT(DISTINCT field.FormName) AS FormCount,
        MIN(field.CaptionVN) AS ExampleCaptionVN,
        MIN(field.CaptionEN) AS ExampleCaptionEN,
        CASE WHEN globalDictionary.FieldName IS NULL THEN 0 ELSE 1 END AS HasGlobalDictionary,
        CASE
            WHEN COUNT(DISTINCT field.FormName) >= 2
             AND globalDictionary.FieldName IS NULL THEN 'ADD_GLOBAL_DICTIONARY'
            WHEN COUNT(DISTINCT field.FormName) >= 2 THEN 'REUSE_GLOBAL_DICTIONARY'
            ELSE 'FORM_SPECIFIC'
        END AS Recommendation
    FROM dbo.SY_FormatFields field
    LEFT JOIN dbo.SY_FmtFldTbl globalDictionary
      ON globalDictionary.FieldName = field.FieldName
     AND ISNULL(globalDictionary.FormName, '') = ''
    WHERE @FormName IS NULL OR field.FormName = @FormName
    GROUP BY field.FieldName, globalDictionary.FieldName
    ORDER BY COUNT(DISTINCT field.FormName) DESC, field.FieldName;

    -- Result set 3: duplicates are reported only; no row is changed or removed.
    SELECT 'WA_API' AS ResourceType, api.list AS ResourceKey, api.func AS SubKey, COUNT(*) AS DuplicateCount
    FROM dbo.WA_API api
    WHERE @FormName IS NULL OR api.list = @FormName
    GROUP BY api.list, api.func
    HAVING COUNT(*) > 1
    UNION ALL
    SELECT 'SY_FormatFields', field.FormName, field.FieldName, COUNT(*)
    FROM dbo.SY_FormatFields field
    WHERE @FormName IS NULL OR field.FormName = @FormName
    GROUP BY field.FormName, field.FieldName
    HAVING COUNT(*) > 1
    UNION ALL
    SELECT 'SY_FrmLstTbl', form.FormID, NULL, COUNT(*)
    FROM dbo.SY_FrmLstTbl form
    WHERE @FormName IS NULL OR form.FormID = @FormName
    GROUP BY form.FormID
    HAVING COUNT(*) > 1;
END
GO
