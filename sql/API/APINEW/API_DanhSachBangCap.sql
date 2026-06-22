USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBangCap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        MaBangCap,     -- Mã bằng cấp
        TenBangCap     -- Tên bằng cấp
    FROM HR_BangCapTbl
    WHERE 
        @Keyword = ''
        OR MaBangCap LIKE '%' + @Keyword + '%'
        OR TenBangCap LIKE N'%' + @Keyword + '%'
    ORDER BY MaBangCap;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_BangCapListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BangCapListFrm', 
    'View', 
    'API_DanhSachBangCap', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BangCapListFrm',
    @ObjectName = 'API_DanhSachBangCap';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Mã bằng cấp' WHERE FormName = 'WA_BangCapListFrm' AND FieldName = 'MaBangCap';
UPDATE SY_FormatFields SET CaptionVN = N'Tên bằng cấp' WHERE FormName = 'WA_EducationListFrm' AND FieldName = 'TenBangCap';
GO
