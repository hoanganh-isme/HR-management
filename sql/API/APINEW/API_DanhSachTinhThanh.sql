USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachTinhThanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        ProvineName,   -- Tên tỉnh / thành (giữ nguyên chính tả DB: ProvineName)
        TownShip,      -- Quận / Huyện / Xã
        GhiChu         -- Ghi chú
    FROM HR_ProvineListTbl
    WHERE 
        @Keyword = ''
        OR ProvineName LIKE N'%' + @Keyword + '%'
        OR TownShip LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ProvineName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_ProvinceListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ProvinceListFrm', 
    'View', 
    'API_DanhSachTinhThanh', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ProvinceListFrm',
    @ObjectName = 'API_DanhSachTinhThanh';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên tỉnh / thành' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'ProvineName';
UPDATE SY_FormatFields SET CaptionVN = N'Quận / huyện / TX' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'TownShip';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_ProvinceListFrm' AND FieldName = 'GhiChu';
GO
