SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- This rollback removes only constraints introduced by the verification step.
    -- It intentionally does not delete form, API, field, menu, permission or HR data.
    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID('dbo.WA_API')
          AND name = 'UX_WA_API_list_func'
    )
        DROP INDEX UX_WA_API_list_func ON dbo.WA_API;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID('dbo.SY_FormatFields')
          AND name = 'UX_SY_FormatFields_FormName_FieldName'
    )
        DROP INDEX UX_SY_FormatFields_FormName_FieldName ON dbo.SY_FormatFields;

    IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID('dbo.SY_FrmLstTbl')
          AND name = 'UX_SY_FrmLstTbl_FormID'
    )
        DROP INDEX UX_SY_FrmLstTbl_FormID ON dbo.SY_FrmLstTbl;

    COMMIT TRANSACTION;

    SELECT 0 AS code, N'Refactor indexes removed. Registration and HR data were preserved.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
