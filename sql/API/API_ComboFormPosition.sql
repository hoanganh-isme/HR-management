USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- API: Lấy danh sách cấu hình kích thước chia cột (Form Position / Layout)
-- Cột 1: Mã (Value) - Cột 2: Tiêu đề hiển thị (Label)
-- =============================================
CREATE PROCEDURE [dbo].[API_ComboFormPosition]
    @Keyword NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Đẩy dữ liệu tĩnh vào bảng tạm
    SELECT * INTO #TempPos FROM (
        VALUES 
            ('12', N'Đầy đủ 100% (Full)'),
            ('6',  N'Một nửa 50% (Half)'),
            ('4',  N'1/3 Chiều rộng'),
            ('3',  N'1/4 Chiều rộng')
    ) AS PosList(MaViTri, TenViTri)

    -- Trả về kết quả và xử lý tìm kiếm
    SELECT 
        MaViTri,
        TenViTri
    FROM #TempPos
    WHERE 
        (@Keyword IS NULL OR @Keyword = '')
        OR TenViTri LIKE N'%' + @Keyword + '%'
        OR MaViTri LIKE N'%' + @Keyword + '%';
        
    DROP TABLE #TempPos;
END
GO
