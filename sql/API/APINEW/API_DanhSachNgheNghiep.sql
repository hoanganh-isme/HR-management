USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachNgheNghiep
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        CareerName,    -- Tên ngành nghề / nghề nghiệp
        GhiChu         -- Ghi chú
    FROM HR_CareerListTbl
    WHERE 
        @Keyword = ''
        OR CareerName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), CareerName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_CareerlListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_CareerlListFrm', 
    'View', 
    'API_DanhSachNgheNghiep', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_CareerlListFrm',
    @ObjectName = 'API_DanhSachNgheNghiep';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Ngành nghề / Nghề nghiệp' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'CareerName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_CareerlListFrm' AND FieldName = 'GhiChu';
GO
