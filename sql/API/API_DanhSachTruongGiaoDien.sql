IF OBJECT_ID('API_DanhSachTruongGiaoDien', 'P') IS NOT NULL
    DROP PROCEDURE API_DanhSachTruongGiaoDien;
GO

CREATE PROCEDURE API_DanhSachTruongGiaoDien
    @Keyword nvarchar(100) = NULL,
    @FormName nvarchar(100) = NULL,
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @OrderByClause NVARCHAR(MAX);

    -- Xử lý ORDER BY
    IF ISNULL(@SortColumn, '') <> ''
    BEGIN
        IF ISNULL(@SortDir, '') NOT IN ('ASC', 'DESC', 'asc', 'desc')
            SET @SortDir = 'ASC';
            
        -- Thêm bí danh 'ff.' nếu cột nằm trong SY_FormatFields để tránh ambiguous
        -- Trong trường hợp này các cột lấy ra đều thuộc ff trừ một số cột đặc biệt,
        -- tạm thời cứ truyền thẳng tên cột vào QUOTENAME
        SET @OrderByClause = ' ORDER BY ' + QUOTENAME(@SortColumn) + ' ' + @SortDir;
    END
    ELSE
    BEGIN
        SET @OrderByClause = ' ORDER BY ff.FormName ASC, ff.FieldName ASC';
    END
    
    SET @sql = N'
    SELECT 
        ff.AutoID, 
        ff.FormName, 
        ff.FieldName, 
        ff.CaptionVN, 
        ff.FormatID, 
        ff.CaptionEN, 
        ff.DataSource,
        ff.IsRequired, 
        ff.FormPosition, 
        ff.ValidateRule,
        ff.DependsOn,
        ff.VisibleRule,
        ff.OrderNo,
        ISNULL(ff.ShowInAdd,      1) AS ShowInAdd,
        ISNULL(ff.ShowInEdit,     1) AS ShowInEdit,
        ISNULL(ff.IsReadOnlyEdit, 0) AS IsReadOnlyEdit,
        ISNULL(ff.IsReadOnlyAdd,  0) AS IsReadOnlyAdd,
        ISNULL(ff.ShowInFilter,   0) AS ShowInFilter

    FROM SY_FormatFields ff
    LEFT JOIN SY_FrmLstTbl l ON ff.FormName = l.FormID
    WHERE (@Keyword IS NULL OR @Keyword = '''' 
           OR ff.FormName LIKE ''%'' + @Keyword + ''%'' 
           OR ff.FieldName LIKE ''%'' + @Keyword + ''%''
           OR ff.CaptionVN LIKE N''%'' + @Keyword + ''%''
           OR l.CaptionVN LIKE N''%'' + @Keyword + ''%'')
      AND (@FormName IS NULL OR @FormName = '''' OR @FormName = ''frmFormBuilder'' OR ff.FormName = @FormName)
    ' + @OrderByClause;

    EXEC sp_executesql @sql, 
        N'@Keyword nvarchar(100), @FormName nvarchar(100)', 
        @Keyword = @Keyword, 
        @FormName = @FormName;

END
GO
