/*
  Cập nhật caption/format của Field UI Contract V2.
  Procedure không đọc hoặc ghi SY_FmtFldTbl và chỉ cho phép admin cấu hình.
*/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.WA_FieldUiContractV2', N'U') IS NULL
    THROW 51120, N'FIELD_UI_CONTRACT_V2_REGISTRY_NOT_INSTALLED', 1;
GO

IF OBJECT_ID(N'dbo.API_Web_UpdateFieldFormat', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_UpdateFieldFormat AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_UpdateFieldFormat
    @WebFormName varchar(100) = NULL,
    @FieldName varchar(128),
    @CaptionVN nvarchar(250) = NULL,
    @CaptionEN nvarchar(250) = NULL,
    @CaptionCH nvarchar(250) = NULL,
    @FormatID varchar(50) = NULL,
    @AlignX varchar(10) = NULL,
    @MinWidth int = 0,
    @MaxWidth int = 0,
    @UserName varchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @WebFormName = LEFT(LTRIM(RTRIM(ISNULL(@WebFormName, ''))), 100);
    SET @FieldName = LEFT(LTRIM(RTRIM(ISNULL(@FieldName, ''))), 128);
    SET @CaptionVN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionVN, N''))), 200);
    SET @CaptionEN = LEFT(LTRIM(RTRIM(ISNULL(@CaptionEN, N''))), 200);
    SET @CaptionCH = LEFT(LTRIM(RTRIM(ISNULL(@CaptionCH, N''))), 200);
    SET @FormatID = LEFT(LTRIM(RTRIM(ISNULL(@FormatID, ''))), 20);
    SET @UserName = LEFT(LTRIM(RTRIM(ISNULL(@UserName, ''))), 100);

    IF @WebFormName = ''
       OR @FieldName = ''
       OR @FieldName LIKE '%[^A-Za-z0-9_@$#]%'
        THROW 51121, N'FIELD_UI_CONTRACT_V2_REQUEST_INVALID', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SY_User AS Actor
        WHERE Actor.UserName = @UserName
          AND Actor.Disable = 0
          AND LOWER(LTRIM(RTRIM(Actor.UserGroupID))) = 'admin'
    )
        THROW 51122, N'FIELD_UI_CONTRACT_V2_ADMIN_REQUIRED', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.WA_FieldContractRegistry AS Contract
        WHERE Contract.WebFormName = @WebFormName
          AND Contract.IsEnabled = 1
    )
        THROW 51123, N'FIELD_UI_CONTRACT_V2_FORM_NOT_REGISTERED', 1;

    DECLARE @Caption nvarchar(200) =
        COALESCE
        (
            NULLIF(@CaptionVN, N''),
            NULLIF(@CaptionEN, N''),
            NULLIF(@CaptionCH, N'')
        );
    DECLARE @NormalizedAlign varchar(20) =
        CASE
            WHEN LOWER(LTRIM(RTRIM(ISNULL(@AlignX, '')))) IN ('right', 'r', 'phải') THEN 'R'
            WHEN LOWER(LTRIM(RTRIM(ISNULL(@AlignX, '')))) IN ('left', 'l', 'trái') THEN 'L'
            WHEN LOWER(LTRIM(RTRIM(ISNULL(@AlignX, '')))) IN ('center', 'c', 'giữa') THEN 'C'
            ELSE NULL
        END;
    DECLARE @NormalizedMinWidth int =
        CASE WHEN ISNULL(@MinWidth, 0) > 0 THEN @MinWidth ELSE NULL END;
    DECLARE @NormalizedMaxWidth int =
        CASE WHEN ISNULL(@MaxWidth, 0) > 0 THEN @MaxWidth ELSE NULL END;

    IF @NormalizedMinWidth IS NOT NULL
       AND @NormalizedMaxWidth IS NOT NULL
       AND @NormalizedMinWidth > @NormalizedMaxWidth
        THROW 51124, N'FIELD_UI_CONTRACT_V2_WIDTH_INVALID', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.WA_FieldUiContractV2
        SET
            Caption = COALESCE(@Caption, Caption),
            FormatID = NULLIF(@FormatID, ''),
            Align = @NormalizedAlign,
            MinWidth = @NormalizedMinWidth,
            MaxWidth = @NormalizedMaxWidth,
            IsEnabled = 1,
            SchemaVersion = SchemaVersion + 1,
            UpdatedAt = SYSUTCDATETIME(),
            UpdatedBy = @UserName
        WHERE WebFormName = @WebFormName
          AND DatasetKey = 'MAIN'
          AND FieldName = @FieldName;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO dbo.WA_FieldUiContractV2
            (
                WebFormName,
                DatasetKey,
                FieldName,
                Caption,
                FormatID,
                Align,
                MinWidth,
                MaxWidth,
                IsEnabled,
                SchemaVersion,
                CreatedBy,
                UpdatedBy
            )
            VALUES
            (
                @WebFormName,
                'MAIN',
                @FieldName,
                @Caption,
                NULLIF(@FormatID, ''),
                @NormalizedAlign,
                @NormalizedMinWidth,
                @NormalizedMaxWidth,
                1,
                1,
                @UserName,
                @UserName
            );
        END;

        COMMIT TRANSACTION;

        SELECT
            CAST(1 AS bit) AS Success,
            N'Đã cập nhật Field UI Contract V2.' AS Message,
            @WebFormName AS WebFormName,
            @FieldName AS FieldName,
            @Caption AS CaptionVN,
            @CaptionEN AS CaptionEN,
            @CaptionCH AS CaptionCH,
            NULLIF(@FormatID, '') AS FormatID,
            @NormalizedAlign AS AlignX,
            @NormalizedMinWidth AS MinWidth,
            @NormalizedMaxWidth AS MaxWidth;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
