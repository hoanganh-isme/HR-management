USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachHinhThucNghi
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        HinhThucNghi,     -- Ký hiệu hình thức nghỉ
        TenHinhThucNghi,  -- Tên hình thức nghỉ
        NghiCoLuong       -- Nghỉ có lương (1: Có, 0: Không)
    FROM HR_HinhThucNghiListTbl
    WHERE 
        @Keyword = ''
        OR HinhThucNghi LIKE '%' + @Keyword + '%'
        OR TenHinhThucNghi LIKE N'%' + @Keyword + '%'
    ORDER BY HinhThucNghi;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_HinhThucNghiListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_HinhThucNghiListFrm', 
    'View', 
    'API_DanhSachHinhThucNghi', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_HinhThucNghiListFrm',
    @ObjectName = 'API_DanhSachHinhThucNghi';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Mã hình thức nghỉ' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'HinhThucNghi';
UPDATE SY_FormatFields SET CaptionVN = N'Tên hình thức nghỉ' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'TenHinhThucNghi';
UPDATE SY_FormatFields SET CaptionVN = N'Có hưởng lương' WHERE FormName = 'WA_HinhThucNghiListFrm' AND FieldName = 'NghiCoLuong';
GO
