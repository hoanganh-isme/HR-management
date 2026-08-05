USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem_Detail
-- Description: Lấy danh sách chi tiết các dòng bảo hiểm cho một chứng từ
-- Khớp 100% cấu hình Desktop ERP: Select top 1000 HR_BaoHiemChiTietTbl.*, A.PersonName, A.PhongBan, A.ChucDanhChuyenMon From HR_BaoHiemChiTietTbl Left join HR_PersonTbl A on HR_BaoHiemChiTietTbl.PersonID = A.PersonID
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoHiem_Detail
(
    @DocumentID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1000
        CT.*,
        A.PersonName,
        A.PhongBan,
        A.ChucDanhChuyenMon
    FROM dbo.HR_BaoHiemChiTietTbl CT WITH (NOLOCK)
    LEFT JOIN dbo.HR_PersonTbl A WITH (NOLOCK) ON CT.PersonID = A.PersonID
    WHERE (ISNULL(@DocumentID, '') = '' OR CT.DocumentID = @DocumentID)
    ORDER BY CT.UserAutoID ASC;
END
GO

PRINT 'Da cap nhat API_BaoHiem_Detail khop 100% Desktop ERP thanh cong!';
GO
