/* Đối chiếu legacy và Grid Schema V2; kết quả chỉ dùng shadow/audit. */
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.API_Web_GridFieldCompareV2', N'P') IS NULL
    EXEC(N'CREATE PROCEDURE dbo.API_Web_GridFieldCompareV2 AS BEGIN SET NOCOUNT ON; END');
GO

ALTER PROCEDURE dbo.API_Web_GridFieldCompareV2
    @WebFormName varchar(100),
    @ERPFormID varchar(100) = NULL,
    @UserName varchar(100),
    @BranchID varchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @LegacyPrimaryKey varchar(100);
    SELECT @LegacyPrimaryKey = L.PrimaryKey
    FROM dbo.SY_FrmLstTbl AS L
    WHERE L.FormID = @WebFormName;

    DECLARE @V2 table (
        SchemaVersion varchar(10), CapabilityVersion varchar(10),
        WebFormName varchar(100), ERPFormName varchar(100),
        TableName varchar(100), PrimaryKey varchar(100),
        RegisteredViewProcedure varchar(50), RegisteredSaveProcedure varchar(50),
        RegisteredDeleteProcedure varchar(50), DeleteMode varchar(40),
        SourceKind varchar(30), FieldOrdinal int, FieldName varchar(128),
        SqlType nvarchar(256), IsNullable bit,
        IsPhysicalColumn bit, IsPrimaryKey bit, IsIdentity bit, IsComputed bit, HasDefault bit,
        DbMaxLength smallint, DbPrecision tinyint, DbScale tinyint, DbIsNullable bit,
        IsServerManaged bit, IsSensitiveOrDenied bit, IsRequiredOnInsert bit,
        ShowInGrid bit, ShowInAdd bit, ShowInEdit bit, ShowInFilter bit,
        SupportsInsert bit, SupportsUpdate bit, SupportsFilter bit, SupportsSort bit, SupportsKeyword bit,
        Caption nvarchar(200), FormatID varchar(2), FormatType char(1), RenderType varchar(20),
        NumberDecimal int, FormatString nvarchar(100), MaskString varchar(50),
        MaxLength smallint, MinValue float, MaxValue float, Align varchar(2), MinWidth int, MaxWidth int,
        LookupKey varchar(64), LookupType varchar(10), LookupValueColumn varchar(50),
        LookupDisplayColumn varchar(50), LookupColumns varchar(max), LookupWidths varchar(max),
        LookupDependsOn varchar(max), LookupMultiSelect bit, LookupReloadMode varchar(10),
        LookupDisabled bit, DiagnosticCode varchar(50)
    );

    INSERT INTO @V2
    EXEC dbo.API_Web_GridFieldSchemaV2
        @WebFormName = @WebFormName,
        @ERPFormID = @ERPFormID,
        @UserName = @UserName,
        @BranchID = @BranchID;

    DECLARE @V2PrimaryKey varchar(100);
    SELECT @V2PrimaryKey = MAX(PrimaryKey) FROM @V2;

    ;WITH Legacy AS (
        SELECT
            F.FieldName,
            MAX(F.CaptionVN) AS Caption,
            MAX(F.FormatID) AS FormatID,
            MAX(CASE WHEN NULLIF(LTRIM(RTRIM(ISNULL(F.DataSource, ''))), '') IS NULL THEN 0 ELSE 1 END) AS HasLookup
        FROM dbo.SY_FormatFields AS F
        WHERE LOWER(ISNULL(F.FormName, '')) = LOWER(@WebFormName)
          AND ISNULL(F.ShowInForm, 1) = 1
          AND LOWER(ISNULL(F.FormPosition, 'grid')) LIKE '%grid%'
        GROUP BY F.FieldName
    ), V2 AS (
        SELECT FieldName, Caption, FormatID, RenderType, LookupKey
        FROM @V2
    )
    SELECT
        COALESCE(V2.FieldName, L.FieldName) AS FieldName,
        L.Caption AS LegacyCaption,
        V2.Caption AS V2Caption,
        L.FormatID AS LegacyFormatID,
        V2.FormatID AS V2FormatID,
        CASE
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
            WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
            WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
            ELSE 'text'
        END AS LegacyRenderType,
        V2.RenderType AS V2RenderType,
        CONVERT(bit, ISNULL(L.HasLookup, 0)) AS LegacyHasLookup,
        CONVERT(bit, CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END) AS V2HasLookup,
        @LegacyPrimaryKey AS LegacyPrimaryKey,
        @V2PrimaryKey AS V2PrimaryKey,
        CASE WHEN LOWER(ISNULL(@LegacyPrimaryKey, '')) = LOWER(ISNULL(@V2PrimaryKey, '')) THEN 'MATCH' ELSE 'CRITICAL' END AS PrimaryKeyStatus,
        CASE
            WHEN L.FieldName IS NULL THEN 'ONLY_V2'
            WHEN V2.FieldName IS NULL THEN 'ONLY_LEGACY'
            WHEN ISNULL(L.Caption, '') <> ISNULL(V2.Caption, '') THEN 'CAPTION_DIFF'
            WHEN ISNULL(L.HasLookup, 0) <> CASE WHEN V2.LookupKey IS NULL THEN 0 ELSE 1 END THEN 'LOOKUP_DIFF'
            WHEN
                CASE
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'D' THEN 'date'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'DT' THEN 'datetime'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'H' THEN 'time'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'B' THEN 'money'
                    WHEN UPPER(ISNULL(L.FormatID, '')) = 'Q' THEN 'decimal'
                    WHEN UPPER(ISNULL(L.FormatID, '')) IN ('N', 'N0', 'N3') THEN 'number'
                    ELSE 'text'
                END <> ISNULL(V2.RenderType, 'text') THEN 'FORMAT_DIFF'
            ELSE 'MATCH'
        END AS ParityStatus
    FROM Legacy AS L
    FULL OUTER JOIN V2
      ON LOWER(V2.FieldName) = LOWER(L.FieldName)
    ORDER BY COALESCE(V2.FieldName, L.FieldName);
END;
GO
