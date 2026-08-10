USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
    Read the report-template choices maintained by the desktop application.
    This procedure is read-only and never changes SY_RpDTbl or an RPX file.
*/
CREATE OR ALTER PROCEDURE dbo.API_ReportTemplateOptions
(
    @ReportName NVARCHAR(128) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @ReportName = LTRIM(RTRIM(ISNULL(@ReportName, '')));

    DECLARE @RawOptions NVARCHAR(MAX);
    DECLARE @JsonOptions NVARCHAR(MAX);

    SELECT TOP (1)
        @RawOptions = DefaultValueVN
    FROM dbo.SY_RpDTbl
    WHERE RpName = @ReportName
      AND PName = N'Template';

    IF LTRIM(RTRIM(ISNULL(@RawOptions, ''))) = '' RETURN;

    -- Desktop stores alternating values as: template;caption;template;caption.
    SET @JsonOptions = N'["'
        + REPLACE(STRING_ESCAPE(@RawOptions, 'json'), ';', '","')
        + N'"]';

    ;WITH Tokens AS
    (
        SELECT
            TRY_CONVERT(INT, [key]) AS TokenIndex,
            LTRIM(RTRIM(CONVERT(NVARCHAR(4000), [value]))) AS TokenValue
        FROM OPENJSON(@JsonOptions)
    )
    SELECT
        CodeToken.TokenValue AS Template,
        COALESCE(NULLIF(NameToken.TokenValue, ''), CodeToken.TokenValue) AS TemplateName
    FROM Tokens CodeToken
    LEFT JOIN Tokens NameToken
        ON NameToken.TokenIndex = CodeToken.TokenIndex + 1
    WHERE CodeToken.TokenIndex % 2 = 0
      AND CodeToken.TokenValue <> ''
    ORDER BY CodeToken.TokenIndex;
END
GO

