USE [X26DIMTUTAC]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem
-- Description: Lấy danh sách chứng từ đóng bảo hiểm chính từ View Desktop (HR_BaoHiemView)
-- Khớp 100% với cấu hình Desktop ERP: Select Distinct top 1000 HR_BaoHiemView.* From HR_BaoHiemView
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_BaoHiem
(
    @Keyword   NVARCHAR(200) = '',
    @BranchID  NVARCHAR(250) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT TOP 1000
        BH.*,
        CONCAT(BH.PeriodID, '_', BH.LoaiBaoHiem) AS PeriodKeyID
    FROM dbo.HR_BaoHiemView BH
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR BH.DocumentID LIKE '%' + @Keyword + '%' 
           OR BH.Notes LIKE N'%' + @Keyword + '%')
      AND (ISNULL(@BranchID, '') = '' 
           OR BH.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY BH.DocumentDate DESC, BH.DocumentID DESC;
END
GO

PRINT 'Da cap nhat API_BaoHiem truy van DISTINCT TOP 1000 HR_BaoHiemView thanh cong!';
GO
