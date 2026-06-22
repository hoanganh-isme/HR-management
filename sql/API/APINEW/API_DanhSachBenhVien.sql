USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachBenhVien
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự hiển thị
        HospitalName,  -- Tên bệnh viện
        [Address],     -- Địa chỉ bệnh viện
        GhiChu         -- Ghi chú
    FROM HR_HospitalListTbl
    WHERE 
        @Keyword = ''
        OR HospitalName LIKE N'%' + @Keyword + '%'
        OR [Address] LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), HospitalName;
END
GO

-- 1. Cấu hình định tuyến Gateway
DELETE FROM WA_API WHERE list = 'WA_HospitalListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_HospitalListFrm', 
    'View', 
    'API_DanhSachBenhVien', 
    '@Keyword=N''{Keyword}'''
);
GO

-- 2. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_HospitalListFrm',
    @ObjectName = 'API_DanhSachBenhVien';
GO

-- 3. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên bệnh viện' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'HospitalName';
UPDATE SY_FormatFields SET CaptionVN = N'Địa chỉ' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'Address';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_HospitalListFrm' AND FieldName = 'GhiChu';
GO
