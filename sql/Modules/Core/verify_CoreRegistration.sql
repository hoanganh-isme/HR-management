SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    SELECT list, func, COUNT(*) AS DuplicateCount
    FROM dbo.WA_API
    GROUP BY list, func
    HAVING COUNT(*) > 1;

    SELECT FormName, FieldName, COUNT(*) AS DuplicateCount
    FROM dbo.SY_FormatFields
    GROUP BY FormName, FieldName
    HAVING COUNT(*) > 1;

    SELECT FormID, COUNT(*) AS DuplicateCount
    FROM dbo.SY_FrmLstTbl
    GROUP BY FormID
    HAVING COUNT(*) > 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.WA_API GROUP BY list, func HAVING COUNT(*) > 1)
       AND NOT EXISTS (
           SELECT 1
           FROM sys.indexes indexDefinition
           WHERE indexDefinition.object_id = OBJECT_ID('dbo.WA_API')
             AND indexDefinition.is_unique = 1
             AND (SELECT COUNT(*) FROM sys.index_columns columnDefinition
                  WHERE columnDefinition.object_id = indexDefinition.object_id
                    AND columnDefinition.index_id = indexDefinition.index_id
                    AND columnDefinition.key_ordinal > 0) = 2
             AND EXISTS (SELECT 1 FROM sys.index_columns columnDefinition
                         WHERE columnDefinition.object_id = indexDefinition.object_id
                           AND columnDefinition.index_id = indexDefinition.index_id
                           AND columnDefinition.column_id = COLUMNPROPERTY(OBJECT_ID('dbo.WA_API'), 'list', 'ColumnId'))
             AND EXISTS (SELECT 1 FROM sys.index_columns columnDefinition
                         WHERE columnDefinition.object_id = indexDefinition.object_id
                           AND columnDefinition.index_id = indexDefinition.index_id
                           AND columnDefinition.column_id = COLUMNPROPERTY(OBJECT_ID('dbo.WA_API'), 'func', 'ColumnId'))
       )
        CREATE UNIQUE INDEX UX_WA_API_list_func ON dbo.WA_API (list, func);

    IF NOT EXISTS (SELECT 1 FROM dbo.SY_FormatFields GROUP BY FormName, FieldName HAVING COUNT(*) > 1)
       AND NOT EXISTS (
           SELECT 1
           FROM sys.indexes indexDefinition
           WHERE indexDefinition.object_id = OBJECT_ID('dbo.SY_FormatFields')
             AND indexDefinition.is_unique = 1
             AND (SELECT COUNT(*) FROM sys.index_columns columnDefinition
                  WHERE columnDefinition.object_id = indexDefinition.object_id
                    AND columnDefinition.index_id = indexDefinition.index_id
                    AND columnDefinition.key_ordinal > 0) = 2
             AND EXISTS (SELECT 1 FROM sys.index_columns columnDefinition
                         WHERE columnDefinition.object_id = indexDefinition.object_id
                           AND columnDefinition.index_id = indexDefinition.index_id
                           AND columnDefinition.column_id = COLUMNPROPERTY(OBJECT_ID('dbo.SY_FormatFields'), 'FormName', 'ColumnId'))
             AND EXISTS (SELECT 1 FROM sys.index_columns columnDefinition
                         WHERE columnDefinition.object_id = indexDefinition.object_id
                           AND columnDefinition.index_id = indexDefinition.index_id
                           AND columnDefinition.column_id = COLUMNPROPERTY(OBJECT_ID('dbo.SY_FormatFields'), 'FieldName', 'ColumnId'))
       )
        CREATE UNIQUE INDEX UX_SY_FormatFields_FormName_FieldName
            ON dbo.SY_FormatFields (FormName, FieldName);

    IF NOT EXISTS (SELECT 1 FROM dbo.SY_FrmLstTbl GROUP BY FormID HAVING COUNT(*) > 1)
       AND NOT EXISTS (
           SELECT 1
           FROM sys.indexes indexDefinition
           WHERE indexDefinition.object_id = OBJECT_ID('dbo.SY_FrmLstTbl')
             AND indexDefinition.is_unique = 1
             AND (SELECT COUNT(*) FROM sys.index_columns columnDefinition
                  WHERE columnDefinition.object_id = indexDefinition.object_id
                    AND columnDefinition.index_id = indexDefinition.index_id
                    AND columnDefinition.key_ordinal > 0) = 1
             AND EXISTS (SELECT 1 FROM sys.index_columns columnDefinition
                         WHERE columnDefinition.object_id = indexDefinition.object_id
                           AND columnDefinition.index_id = indexDefinition.index_id
                           AND columnDefinition.column_id = COLUMNPROPERTY(OBJECT_ID('dbo.SY_FrmLstTbl'), 'FormID', 'ColumnId'))
       )
        CREATE UNIQUE INDEX UX_SY_FrmLstTbl_FormID ON dbo.SY_FrmLstTbl (FormID);

    COMMIT TRANSACTION;

    SELECT
        0 AS code,
        N'Duplicate reports returned above. Clean sets received unique indexes; dirty sets were unchanged.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
