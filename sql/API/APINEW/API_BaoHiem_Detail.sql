USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.API_BaoHiem_Detail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_Detail;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem_Detail
-- Description: Lấy danh sách chi tiết các dòng bảo hiểm cho một chứng từ
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem_Detail
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CT.UserAutoID,
        CT.DocumentID,
        CT.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,
        ISNULL(H.ChucDanhChuyenMonHD, P.ChucDanhChuyenMon) AS ChucDanhChuyenMon,
        CT.MucDong,
        CT.MucDongBHXHNLD,
        CT.MucDongBHXHNSDLD,
        CT.MucDongBHYTNLD,
        CT.MucDongBHYTNSDLD,
        CT.MucDongBHTNNLD,
        CT.MucDongBHTNNSDLD,
        CT.GhiChu
    FROM dbo.HR_BaoHiemChiTietTbl CT
    LEFT JOIN dbo.HR_PersonTbl P ON CT.PersonID = P.PersonID
    LEFT JOIN dbo.HR_HopDongTbl H ON CT.PersonID = H.PersonID
    WHERE CT.DocumentID = @DocumentID
    ORDER BY CT.UserAutoID ASC;
END
GO
