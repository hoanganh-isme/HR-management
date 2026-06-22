USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachTonGiao
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        ReligionName,  -- Tên tôn giáo
        GhiChu         -- Ghi chú
    FROM HR_ReligionListTbl
    WHERE 
        @Keyword = ''
        OR ReligionName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ReligionName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_ReligionListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ReligionListFrm', 
    'View', 
    'API_DanhSachTonGiao', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ReligionListFrm',
    @ObjectName = 'API_DanhSachTonGiao';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên tôn giáo' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'ReligionName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_ReligionListFrm' AND FieldName = 'GhiChu';
GO
