USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_LayCacTruongGiaoDien
-- Description: Lấy tiêu đề Tiếng Việt (CaptionVN) và định dạng cột trực tiếp từ CSDL.
-- Nguồn dữ liệu ưu tiên: SY_FormatFields -> SY_FmtFldTbl (Form) -> SY_FmtFldTbl (Global)
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_LayCacTruongGiaoDien]
    @FormName VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem FormName có trong SY_FormatFields hay không
    IF EXISTS (SELECT 1 FROM dbo.SY_FormatFields WITH (NOLOCK) WHERE FormName = @FormName)
    BEGIN
        SELECT 
            ff.FieldName AS [name], 
            COALESCE(
                NULLIF(ff.CaptionVN, ''),
                fForm.CaptionVN,
                fGlobal.CaptionVN,
                ff.FieldName
            ) AS [label],
            ISNULL(ff.IsRequired, 0) AS [required], 
            ISNULL(ff.FormPosition, 'grid') AS [position],
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
        FROM dbo.SY_FormatFields ff WITH (NOLOCK)
        LEFT JOIN dbo.SY_FrmLstTbl l WITH (NOLOCK) ON ff.FormName = l.FormID
        LEFT JOIN dbo.SY_FmtFldTbl fForm WITH (NOLOCK) ON ff.FieldName = fForm.FieldName AND fForm.FormName = @FormName
        LEFT JOIN dbo.SY_FmtFldTbl fGlobal WITH (NOLOCK) ON ff.FieldName = fGlobal.FieldName AND (fGlobal.FormName IS NULL OR fGlobal.FormName = '')
        WHERE (@FormName IS NULL OR ff.FormName = @FormName)
        ORDER BY ISNULL(ff.OrderNo, 0) ASC, ff.FieldName ASC;
    END
    ELSE
    BEGIN
        -- Nếu chưa có trong SY_FormatFields, truy vấn trực tiếp từ bảng định nghĩa tên chung SY_FmtFldTbl
        SELECT 
            f.FieldName AS [name],
            COALESCE(
                NULLIF(f.CaptionVN, ''),
                fGlobal.CaptionVN,
                f.FieldName
            ) AS [label],
            0 AS [required],
            'grid' AS [position],
            '' AS [primaryKey],
            1 AS [showInAdd],
            1 AS [showInEdit],
            0 AS [isReadOnlyEdit],
            0 AS [isReadOnlyAdd],
            ISNULL(f.FormatID, '') AS [renderRule],
            '' AS [dataSource],
            ISNULL(f.OrderNo, 0) AS [orderNo],
            '' AS [validateRule],
            '' AS [dependsOn],
            '' AS [visibleRule],
            0 AS [showInFilter]
        FROM dbo.SY_FmtFldTbl f WITH (NOLOCK)
        LEFT JOIN dbo.SY_FmtFldTbl fGlobal WITH (NOLOCK) ON f.FieldName = fGlobal.FieldName AND (fGlobal.FormName IS NULL OR fGlobal.FormName = '')
        WHERE (@FormName IS NULL OR f.FormName = @FormName)
        ORDER BY ISNULL(f.OrderNo, 0) ASC, f.FieldName ASC;
    END
END
GO

PRINT 'Da cap nhat Stored Procedure API_LayCacTruongGiaoDien doc CaptionVN tu SY_FmtFldTbl thanh cong!';
GO
