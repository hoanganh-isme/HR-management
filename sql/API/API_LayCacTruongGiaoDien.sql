CREATE OR ALTER PROCEDURE [dbo].[API_LayCacTruongGiaoDien]
    @FormName VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ff.FieldName AS [name], 
        ff.CaptionVN AS [label],
        ISNULL(ff.IsRequired, 0) AS [required], 
        ISNULL(ff.FormPosition, 'grid') AS [position],
        
        -- Trả về thêm cấu hình cấp độ Form để loại bỏ hoàn toàn AppModules.js
        ISNULL(l.PrimaryKey, '') AS [primaryKey],
        
        ISNULL(ff.ShowInAdd,      1) AS [showInAdd],
        ISNULL(ff.ShowInEdit,     1) AS [showInEdit],
        ISNULL(ff.IsReadOnlyEdit, 0) AS [isReadOnlyEdit],
        ISNULL(ff.IsReadOnlyAdd,  0) AS [isReadOnlyAdd],

        ISNULL(ff.FormatID, '') AS [renderRule],
        ISNULL(ff.DataSource, '') AS [dataSource],
        ISNULL(ff.OrderNo, 0) AS [orderNo],
        ISNULL(ff.ValidateRule, '') AS [validateRule],
        ISNULL(ff.DependsOn, '') AS [dependsOn],
        ISNULL(ff.VisibleRule, '') AS [visibleRule],
        ISNULL(ff.ShowInFilter, 0) AS [showInFilter]
    FROM SY_FormatFields ff
    LEFT JOIN SY_FrmLstTbl l ON ff.FormName = l.FormID
    WHERE (@FormName IS NULL OR ff.FormName = @FormName)
    ORDER BY ISNULL(ff.OrderNo, 0) ASC, ff.FieldName ASC;
END
GO

-- Lệnh chạy thử:
-- EXEC [dbo].[API_LayCacTruongGiaoDien] @FormName = 'frmCustomer';
