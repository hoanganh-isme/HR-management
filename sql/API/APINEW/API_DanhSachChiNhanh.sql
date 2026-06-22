USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachChiNhanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        BranchID,      -- Mã chi nhánh
        BranchName     -- Tên chi nhánh
    FROM CF_BranchTbl
    WHERE 
        @Keyword = ''
        OR BranchID LIKE '%' + @Keyword + '%'
        OR BranchName LIKE N'%' + @Keyword + '%'
    ORDER BY BranchID;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'CF_BranchListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'CF_BranchListFrm', 
    'View', 
    'API_DanhSachChiNhanh', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'CF_BranchListFrm',
    @ObjectName = 'API_DanhSachChiNhanh';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Mã chi nhánh' WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchID';
UPDATE SY_FormatFields SET CaptionVN = N'Tên chi nhánh' WHERE FormName = 'CF_BranchListFrm' AND FieldName = 'BranchName';
GO
