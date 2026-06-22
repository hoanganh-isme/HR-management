USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachDanToc
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        PeoplesName,   -- Tên dân tộc (Tiếng Việt)
        PeoplesName2,  -- Tên dân tộc (Tiếng Anh/Khác)
        PeoplesPlace,  -- Địa bàn cư trú chủ yếu
        isDefault,     -- Mặc định
        GhiChu         -- Ghi chú
    FROM HR_PeoplesListTbl
    WHERE 
        @Keyword = ''
        OR PeoplesName LIKE N'%' + @Keyword + '%'
        OR PeoplesName2 LIKE N'%' + @Keyword + '%'
        OR PeoplesPlace LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), PeoplesName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_PeopleListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_PeopleListFrm', 
    'View', 
    'API_DanhSachDanToc', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_PeopleListFrm',
    @ObjectName = 'API_DanhSachDanToc';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên dân tộc' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName';
UPDATE SY_FormatFields SET CaptionVN = N'Tên khác' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesName2';
UPDATE SY_FormatFields SET CaptionVN = N'Địa bàn cư trú' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'PeoplesPlace';
UPDATE SY_FormatFields SET CaptionVN = N'Mặc định' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'isDefault';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_PeopleListFrm' AND FieldName = 'GhiChu';
GO
