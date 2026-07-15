SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HR_NghiPhep_ChiTiet
-- Description: Lấy danh sách ngày nghỉ chi tiết thuộc một đơn xin nghỉ
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep_ChiTiet
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        D.DetailID,
        D.DocumentID,
        D.HinhThucNghi,
        D.NghiTuNgay,
        D.DenNgay,
        D.SoNgayNghi,
        D.Notes
    FROM dbo.HR_NghiPhepDetailTbl D
    WHERE D.DocumentID = @DocumentID
    ORDER BY D.NghiTuNgay ASC;
END
GO
