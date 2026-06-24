
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_ChiTiet
-- Description: Lấy danh sách phụ cấp chi tiết thuộc một hợp đồng
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_ChiTiet
(
    @MaHopDong NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        D.UserAutoID,
        D.MaHopDong,
        D.MaPhuCap,
        ISNULL(D.TenPhuCap, P.TenPhuCap) AS TenPhuCap,
        D.TienPhuCap,
        P.TienPhuCapNgay,
        P.TienPhuCapThang,
        D.GhiChu
    FROM dbo.HR_HopDongDetailTbl D
    LEFT JOIN dbo.HR_BangPhuCapTbl P ON D.MaPhuCap = P.MaPhuCap
    WHERE D.MaHopDong = @MaHopDong
    ORDER BY D.MaPhuCap ASC;
END
GO
