USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.TinhBHStp', 'P') IS NOT NULL
    DROP PROCEDURE dbo.TinhBHStp;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: TinhBHStp
-- Description: Tính toán số tiền đóng bảo hiểm của NLD và CTY dựa trên bảng tham số
-- =========================================================================
CREATE PROCEDURE dbo.TinhBHStp
(
    @PeriodID NVARCHAR(50),
    @LoaiBaoHiem NVARCHAR(50),
    @MucDong DECIMAL(18, 2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Tỷ lệ phần trăm mặc định (theo quy định chung)
    DECLARE @BHXHNLD DECIMAL(18, 4) = 8.0;
    DECLARE @BHXHCTY DECIMAL(18, 4) = 17.5;
    DECLARE @BHYTNLD DECIMAL(18, 4) = 1.5;
    DECLARE @BHYTCTY DECIMAL(18, 4) = 3.0;
    DECLARE @BHTNNLD DECIMAL(18, 4) = 1.0;
    DECLARE @BHTNCTY DECIMAL(18, 4) = 1.0;

    -- Lấy tỉ lệ thực tế từ bảng tham số tính lương (nếu có cấu hình)
    SELECT TOP 1
        @BHXHNLD = ISNULL(BHXHNLD, 8.0),
        @BHXHCTY = ISNULL(BHXHCTY, 17.5),
        @BHYTNLD = ISNULL(BHYTNLD, 1.5),
        @BHYTCTY = ISNULL(BHYTCTY, 3.0),
        @BHTNNLD = ISNULL(BHTNNLD, 1.0),
        @BHTNCTY = ISNULL(BHTNCTY, 1.0)
    FROM dbo.HR_BangThamSoTbl
    WHERE PeriodID = @PeriodID AND LoaiBaoHiem = @LoaiBaoHiem;

    -- Trả về các mức đóng của người lao động và người sử dụng lao động
    SELECT 
        CAST(ROUND(@MucDong * @BHXHNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHXHNLD,
        CAST(ROUND(@MucDong * @BHXHCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHXHNSDLD,
        CAST(ROUND(@MucDong * @BHYTNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHYTNLD,
        CAST(ROUND(@MucDong * @BHYTCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHYTNSDLD,
        CAST(ROUND(@MucDong * @BHTNNLD / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHTNNLD,
        CAST(ROUND(@MucDong * @BHTNCTY / 100.0, 0) AS DECIMAL(18, 2)) AS MucDongBHTNNSDLD;
END
GO
