USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachCongViec
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,           -- Số thứ tự
        JobName,       -- Tên công việc
        GhiChu         -- Ghi chú
    FROM HR_JobListTbl
    WHERE 
        @Keyword = ''
        OR JobName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), JobName;
END
GO


USE X26DIMTUTAC
GO

DELETE FROM WA_API WHERE list = 'WA_JobListFrm' AND func = 'View';

INSERT INTO WA_API (list, func, [SQL], Para)
VALUES (
    'WA_JobListFrm', 
    'View', 
    'API_DanhSachCongViec', 
    '@Keyword=N''{Keyword}'''
);
GO


USE X26DIMTUTAC
GO

-- 1. Đồng bộ các cột từ API
EXEC [dbo].[API_DongBoTruongGiaoDien]
    @FormName = 'WA_JobListFrm',
    @ObjectName = 'API_DanhSachCongViec';
GO

-- 2. Cập nhật nhãn cột hiển thị trên Grid
UPDATE SY_FormatFields SET CaptionVN = N'Số thứ tự' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'STT';
UPDATE SY_FormatFields SET CaptionVN = N'Tên công việc' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'JobName';
UPDATE SY_FormatFields SET CaptionVN = N'Ghi chú' WHERE FormName = 'WA_JobListFrm' AND FieldName = 'GhiChu';
GO
