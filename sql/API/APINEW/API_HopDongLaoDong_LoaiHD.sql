USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_LoaiHD
-- Description: Lấy danh sách loại hợp đồng để phục vụ bộ lọc dropdown
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_LoaiHD
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        LoaiHD 
    FROM dbo.HR_HopDongTbl 
    WHERE LoaiHD IS NOT NULL AND LoaiHD <> ''
      AND (@Keyword = '' OR LoaiHD LIKE '%' + @Keyword + '%')
    ORDER BY LoaiHD;
END
GO
