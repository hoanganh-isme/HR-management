USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_NamLap
-- Description: Lấy danh sách năm lập hợp đồng để phục vụ bộ lọc dropdown
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NamLap
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
        NamLap 
    FROM dbo.HR_HopDongTbl 
    WHERE NamLap IS NOT NULL
      AND (@Keyword = '' OR CAST(NamLap AS NVARCHAR(50)) LIKE '%' + @Keyword + '%')
    ORDER BY NamLap DESC;
END
GO
