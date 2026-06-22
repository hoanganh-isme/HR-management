USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- API: Lấy danh sách các Loại Định dạng Input (FormatID)
-- =============================================
CREATE  PROCEDURE [dbo].[API_ComboFormatID]
    @Keyword NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Tạo bảng tạm chứa các giá trị giống y chang STATIC của anh
    SELECT * INTO #TempFormat FROM (
        VALUES 
            ('t',  N'Văn bản (Text)'),
            ('n',  N'Số (Number)'),
            ('dt', N'Ngày (Date)'),
            ('sw', N'Bật/Tắt (Switch)'),
            ('sl', N'Danh sách chọn (Select)')
    ) AS FormatList(MaDinhDang, TenDinhDang)

    -- Trả về kết quả (Lọc nếu user có gõ tìm kiếm)
    SELECT 
        MaDinhDang,
        TenDinhDang
    FROM #TempFormat
    WHERE 
        (@Keyword IS NULL OR @Keyword = '')
        OR TenDinhDang LIKE N'%' + @Keyword + '%'
        OR MaDinhDang LIKE N'%' + @Keyword + '%';
        
    DROP TABLE #TempFormat;
END
GO
