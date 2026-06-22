USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachHocVan
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        EducationName, -- Trình độ học vấn
        GhiChu         -- Ghi chú
    FROM HR_EducationListTbl
    WHERE 
        @Keyword = ''
        OR EducationName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), EducationName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_BangCapListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BangCapListFrm', 
    'View', 
    'API_DanhSachHocVan', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangCapListFrm',
    @ObjectName = 'API_DanhSachHocVan';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Trình độ học vấn' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'EducationName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'GhiChu';
GO
