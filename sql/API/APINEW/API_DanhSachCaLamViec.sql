USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachCaLamViec
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự
        ShiftID,       -- Mã ca
        ShiftName,     -- Tên ca
        GioBatDau,     -- Giờ bắt đầu
        GioKetThuc,    -- Giờ kết thúc
        SoGioCong,     -- Số giờ công
        GioCaDem,      -- Giờ ca đêm
        CaTuDong,      -- Ca tự động
        ShiftType,     -- Loại ca
        CachChamCong,  -- Cách chấm công
        Color,         -- Màu sắc hiển thị
        SoCong         -- Số công ghi nhận
    FROM HR_ShiftListTbl
    WHERE 
        @Keyword = ''
        OR ShiftID LIKE '%' + @Keyword + '%'
        OR ShiftName LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), ShiftID;
END
GO


USE X26DIMTUTAC
GO

DELETE FROM WA_API WHERE list = 'WA_ShiftListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_ShiftListFrm', 
    'View', 
    'API_DanhSachCaLamViec', 
    '@Keyword=N''{Keyword}'''
);
GO


USE X26DIMTUTAC
GO

-- 1. Đồng bộ các cột từ API vào bảng cấu hình giao diện
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_ShiftListFrm',
    @ObjectName = 'API_DanhSachCaLamViec';
GO

-- 2. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Mã ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftID';
UPDATE SY_FormatFields SET CaptionVN = N'Tên ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftName';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ bắt đầu' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioBatDau';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ kết thúc' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioKetThuc';
UPDATE SY_FormatFields SET CaptionVN = N'Số giờ công' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoGioCong';
UPDATE SY_FormatFields SET CaptionVN = N'Giờ ca đêm' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'GioCaDem';
UPDATE SY_FormatFields SET CaptionVN = N'Ca tự động' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CaTuDong';
UPDATE SY_FormatFields SET CaptionVN = N'Loại ca' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'ShiftType';
UPDATE SY_FormatFields SET CaptionVN = N'Cách chấm công' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'CachChamCong';
UPDATE SY_FormatFields SET CaptionVN = N'Màu sắc' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'Color';
UPDATE SY_FormatFields SET CaptionVN = N'Số công' WHERE FormName = 'WA_ShiftListFrm' AND FieldName = 'SoCong';
GO
