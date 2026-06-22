USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachQuocGia
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        NationName,    -- Tên quốc gia
        isDefault,     -- Quốc gia mặc định
        GhiChu         -- Ghi chú
    FROM HR_NationListTbl
    WHERE 
        @Keyword = ''
        OR NationName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), NationName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_NationListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_NationListFrm', 
    'View', 
    'API_DanhSachQuocGia', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_NationListFrm',
    @ObjectName = 'API_DanhSachQuocGia';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên quốc gia' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'NationName';
UPDATE SY_FormatFields SET CaptionVN = N'Mặc định' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'isDefault';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_NationListFrm' AND FieldName = 'GhiChu';
GO
