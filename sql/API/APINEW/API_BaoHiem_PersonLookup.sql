USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.API_BaoHiem_PersonLookup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem_PersonLookup;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem_PersonLookup
-- Description: Tìm kiếm nhanh nhân viên trong ô chọn (combobox) của grid chi tiết bảo hiểm.
--              Có cảnh báo nếu nhân viên đã được đóng bảo hiểm ở chứng từ khác.
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem_PersonLookup
(
    @BranchID NVARCHAR(MAX) = '',
    @LoaiBaoHiem NVARCHAR(50) = '',
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID, 
        P.PersonName, 
        P.PhongBan, 
        ISNULL(BH.MucDong, 0) AS MucDong, 
        CASE 
            WHEN BH.PersonID IS NOT NULL 
            THEN N'!!! ĐÃ CÓ BH TẠI KỲ: ' + CAST(BH.PeriodID AS VARCHAR) + N' (Chứng từ: ' + BH.DocumentID + ')'
            ELSE '' 
        END AS CanhBao
    FROM dbo.HR_PersonTbl P
    LEFT JOIN (
        SELECT 
            CT.PersonID, 
            SUM(CT.MucDong) AS MucDong, 
            MAX(H.DocumentID) AS DocumentID, 
            MAX(H.PeriodID) AS PeriodID
        FROM dbo.HR_BaoHiemChiTietTbl CT
        INNER JOIN dbo.HR_BaoHiemTbl H ON H.DocumentID = CT.DocumentID
        GROUP BY CT.PersonID
    ) BH ON P.PersonID = BH.PersonID
    WHERE 1=1
      AND (@BranchID = '' OR P.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
      AND (ISNULL(@Keyword, '') = '' 
           OR P.PersonID LIKE '%' + @Keyword + '%' 
           OR P.PersonName LIKE N'%' + @Keyword + '%')
    ORDER BY P.PersonID DESC;
END
GO
