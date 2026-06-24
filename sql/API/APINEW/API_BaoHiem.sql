USE X26DIMTUTAC
GO

IF OBJECT_ID('dbo.API_BaoHiem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.API_BaoHiem;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_BaoHiem
-- Description: Lấy danh sách chứng từ đóng bảo hiểm chính (Master list)
-- =========================================================================
CREATE PROCEDURE dbo.API_BaoHiem
(
    @Keyword   NVARCHAR(200) = '',
    @BranchID  NVARCHAR(250) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        BH.DocumentID,
        BH.DocumentDate,
        BH.Notes,
        BH.PeriodID,
        BH.LoaiBaoHiem,
        BH.BranchID,
        (BH.PeriodID + BH.LoaiBaoHiem) AS PeriodKeyID,
        BH.UserCreate,
        BH.UserUpdate,
        BH.DateUpdate,
        BH.DateCreate
    FROM dbo.HR_BaoHiemTbl BH
    WHERE 1=1
      AND (ISNULL(@Keyword, '') = '' 
           OR BH.DocumentID LIKE '%' + @Keyword + '%' 
           OR BH.Notes LIKE N'%' + @Keyword + '%')
      AND (ISNULL(@BranchID, '') = '' 
           OR BH.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')))
    ORDER BY BH.DocumentDate DESC, BH.DocumentID DESC;
END
GO
