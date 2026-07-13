CREATE OR ALTER PROCEDURE [dbo].[API_DangKyFormWeb]
    @FormName       VARCHAR(50),
    @TableName      VARCHAR(128),
    @PrimaryKey     VARCHAR(50),
    @CaptionVN      NVARCHAR(255),
    @CaptionEN      NVARCHAR(255) = NULL,
    @FormType       VARCHAR(20) = 'EDIT',
    @ViewProcedure  VARCHAR(128) = NULL,
    @ViewParameters NVARCHAR(MAX) = NULL,
    @Overrides      NVARCHAR(MAX) = N'[]'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISNULL(@ViewProcedure, '') = '' SET @ViewProcedure = @FormName;
    IF ISNULL(@ViewParameters, '') = '' SET @ViewParameters = N'@Keyword=N''{Keyword}''';
    IF ISJSON(@Overrides) <> 1 SET @Overrides = N'[]';

    MERGE dbo.SY_FrmLstTbl AS target
    USING (SELECT @FormName AS FormID) AS source
       ON target.FormID = source.FormID
    WHEN MATCHED THEN UPDATE SET
        FormType = @FormType,
        CaptionVN = @CaptionVN,
        CaptionEN = @CaptionEN,
        TableName = @TableName,
        PrimaryKey = @PrimaryKey,
        CaptionCH = COALESCE(NULLIF(target.CaptionCH, N''), @CaptionVN)
    WHEN NOT MATCHED THEN
        INSERT (FormID, FormType, CaptionVN, CaptionEN, TableName, PrimaryKey, CaptionCH)
        VALUES (@FormName, @FormType, @CaptionVN, @CaptionEN, @TableName, @PrimaryKey, @CaptionVN);

    MERGE dbo.WA_API AS target
    USING (
        SELECT @FormName AS list, 'View' AS func, @ViewProcedure AS [SQL], @ViewParameters AS Para
        UNION ALL
        SELECT @FormName, 'Save', 'API_LuuDong', N'@List=N''' + REPLACE(@FormName, '''', '''''') + N''', @Data=N''{JsonData}'', @UserName=N''{User}'''
        UNION ALL
        SELECT @FormName, 'Delete', 'API_XoaDong', N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}'''
    ) AS source
       ON target.list = source.list AND target.func = source.func
    WHEN MATCHED THEN UPDATE SET [SQL] = source.[SQL], Para = source.Para
    WHEN NOT MATCHED THEN INSERT (list, func, [SQL], Para)
         VALUES (source.list, source.func, source.[SQL], source.Para);

    EXEC dbo.API_DongBoTruongGiaoDien
        @FormName = @FormName,
        @ObjectName = @ViewProcedure;

    -- Desktop dictionary is the default layer. Existing form captions remain overrides.
    IF OBJECT_ID('dbo.SY_FmtFldTbl', 'U') IS NOT NULL
    BEGIN
        DECLARE @inheritSql NVARCHAR(MAX) = N'
            UPDATE ff
               SET CaptionVN = COALESCE(formDict.CaptionVN, globalDict.CaptionVN, ff.CaptionVN),
                   CaptionEN = COALESCE(formDict.CaptionEN, globalDict.CaptionEN, ff.CaptionEN),
                   FormatID = COALESCE(NULLIF(ff.FormatID, ''''), formDict.FormatID, globalDict.FormatID, ''t'')
            FROM dbo.SY_FormatFields ff
            OUTER APPLY (
                SELECT TOP 1 d.CaptionVN, d.CaptionEN, d.FormatID
                FROM dbo.SY_FmtFldTbl d
                WHERE d.FieldName = ff.FieldName AND d.FormName = ff.FormName
            ) formDict
            OUTER APPLY (
                SELECT TOP 1 d.CaptionVN, d.CaptionEN, d.FormatID
                FROM dbo.SY_FmtFldTbl d
                WHERE d.FieldName = ff.FieldName AND ISNULL(d.FormName, '''') = ''''
            ) globalDict
            WHERE ff.FormName = @FormName
              AND (NULLIF(ff.CaptionVN, '''') IS NULL OR ff.CaptionVN = ff.FieldName);';
        EXEC sp_executesql @inheritSql, N'@FormName VARCHAR(50)', @FormName;
    END

    ;WITH overrides AS (
        SELECT *
        FROM OPENJSON(@Overrides)
        WITH (
            FieldName       VARCHAR(128)  '$.field',
            CaptionVN       NVARCHAR(255) '$.captionVN',
            CaptionEN       NVARCHAR(255) '$.captionEN',
            FormatID        VARCHAR(10)   '$.formatId',
            DataSource      NVARCHAR(500) '$.dataSource',
            FormPosition    VARCHAR(50)   '$.position',
            ValidateRule    NVARCHAR(500) '$.validateRule',
            DependsOn       VARCHAR(100)  '$.dependsOn',
            VisibleRule     NVARCHAR(500) '$.visibleRule',
            OrderNo         INT           '$.orderNo',
            ShowInAdd       BIT           '$.showInAdd',
            ShowInEdit      BIT           '$.showInEdit',
            IsReadOnlyAdd   BIT           '$.readOnlyAdd',
            IsReadOnlyEdit  BIT           '$.readOnlyEdit',
            IsRequired      BIT           '$.required',
            ShowInFilter    BIT           '$.showInFilter'
        )
    )
    UPDATE ff SET
        CaptionVN      = COALESCE(o.CaptionVN, ff.CaptionVN),
        CaptionEN      = COALESCE(o.CaptionEN, ff.CaptionEN),
        FormatID       = COALESCE(o.FormatID, ff.FormatID),
        DataSource     = COALESCE(o.DataSource, ff.DataSource),
        FormPosition   = COALESCE(o.FormPosition, ff.FormPosition),
        ValidateRule   = COALESCE(o.ValidateRule, ff.ValidateRule),
        DependsOn      = COALESCE(o.DependsOn, ff.DependsOn),
        VisibleRule    = COALESCE(o.VisibleRule, ff.VisibleRule),
        OrderNo        = COALESCE(o.OrderNo, ff.OrderNo),
        ShowInAdd      = COALESCE(o.ShowInAdd, ff.ShowInAdd),
        ShowInEdit     = COALESCE(o.ShowInEdit, ff.ShowInEdit),
        IsReadOnlyAdd  = COALESCE(o.IsReadOnlyAdd, ff.IsReadOnlyAdd),
        IsReadOnlyEdit = COALESCE(o.IsReadOnlyEdit, ff.IsReadOnlyEdit),
        IsRequired     = COALESCE(o.IsRequired, ff.IsRequired),
        ShowInFilter   = COALESCE(o.ShowInFilter, ff.ShowInFilter)
    FROM dbo.SY_FormatFields ff
    INNER JOIN overrides o ON o.FieldName = ff.FieldName
    WHERE ff.FormName = @FormName;

    EXEC dbo.API_LayCacTruongGiaoDien @FormName = @FormName;
END
GO
