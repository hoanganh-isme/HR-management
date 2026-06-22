USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachNganHang
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        BankName,      -- Tên ngân hàng
        [Address],     -- Địa chỉ / Chi nhánh ngân hàng
        GhiChu         -- Ghi chú
    FROM HR_BankListTbl
    WHERE 
        @Keyword = ''
        OR BankName LIKE N'%' + @Keyword + '%'
        OR [Address] LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), BankName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_BankListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_BankListFrm', 
    'View', 
    'API_DanhSachNganHang', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_BankListFrm',
    @ObjectName = 'API_DanhSachNganHang';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên ngân hàng' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'BankName';
UPDATE SY_FormatFields SET CaptionVN = N'Địa chỉ chi nhánh' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'Address';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_BankListFrm' AND FieldName = 'GhiChu';
GO
