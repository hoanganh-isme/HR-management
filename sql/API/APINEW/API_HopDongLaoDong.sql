-- USE X26DIMTUTAC
-- GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong
-- Description: Lấy danh sách hợp đồng lao động từ View vHR_HopDong_LaoDong
--              Hỗ trợ lọc theo từ khóa (@Keyword), năm lập (@NamLap), 
--              loại hợp đồng (@LoaiHD), chi nhánh (@BranchID)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong
(
    @Keyword NVARCHAR(200) = '',
    @NamLap NVARCHAR(50) = '',
    @LoaiHD NVARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1000 *
    FROM dbo.vHR_HopDong_LaoDong
    WHERE 
        -- 1. Lọc theo từ khóa (Mã HD, Mã NV, Họ tên NV)
        (ISNULL(@Keyword, '') = '' 
         OR MaHopDong LIKE '%' + @Keyword + '%' 
         OR PersonID LIKE '%' + @Keyword + '%' 
         OR PersonName LIKE N'%' + @Keyword + '%')
        
        -- 2. Lọc theo năm lập
        AND (ISNULL(@NamLap, '') = '' OR NamLap = TRY_CAST(@NamLap AS INT))
        
        -- 3. Lọc theo loại hợp đồng
        AND (ISNULL(@LoaiHD, '') = '' OR LoaiHD = @LoaiHD)
        
        -- 4. Lọc theo chi nhánh
        AND (ISNULL(@BranchID, '') = '' 
             OR BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY NgayKyHopDong DESC, MaHopDong DESC;
END
GO
