SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @TestForm VARCHAR(50) = '__CODEX_REGISTRATION_TEST__';

BEGIN TRANSACTION;
DELETE FROM dbo.SY_FormatFields WHERE FormName = @TestForm;
INSERT INTO dbo.SY_FormatFields
    (FormName, FieldName, CaptionVN, FormatID, IsRequired, FormPosition,
     ShowInAdd, ShowInEdit, IsReadOnlyEdit, IsReadOnlyAdd, OrderNo, ShowInFilter)
VALUES
    (@TestForm, 'DocumentID', N'Original', 't', 1, 'grid', 0, 0, 1, 1, 1, 1);
COMMIT TRANSACTION;

DECLARE @DiscoveryFailed BIT = 0;

BEGIN TRY
    EXEC dbo.API_DongBoTruongGiaoDien
        @FormName = @TestForm,
        @ObjectName = 'dbo.__OBJECT_DOES_NOT_EXIST__';
END TRY
BEGIN CATCH
    SET @DiscoveryFailed = 1;
END CATCH;

IF @DiscoveryFailed = 0
    THROW 52100, 'Invalid metadata source did not fail.', 1;

IF NOT EXISTS (
    SELECT 1 FROM dbo.SY_FormatFields
    WHERE FormName = @TestForm AND FieldName = 'DocumentID'
)
    THROW 52101, 'Failed discovery removed existing field metadata.', 1;

EXEC dbo.API_LuuTruongGiaoDien
    @FormName = @TestForm,
    @FieldName = 'DocumentID',
    @CaptionVN = N'Updated caption',
    @NoResult = 1;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.SY_FormatFields
    WHERE FormName = @TestForm
      AND FieldName = 'DocumentID'
      AND CaptionVN = N'Updated caption'
      AND IsRequired = 1
      AND ShowInAdd = 0
      AND ShowInEdit = 0
      AND IsReadOnlyEdit = 1
      AND IsReadOnlyAdd = 1
      AND ShowInFilter = 1
)
    THROW 52102, 'Optional field update reset existing metadata.', 1;

BEGIN TRANSACTION;
DELETE FROM dbo.SY_FormatFields WHERE FormName = @TestForm;
COMMIT TRANSACTION;

SELECT 0 AS code, N'Failed discovery preserved metadata and optional updates preserved existing values.' AS msg;
GO
