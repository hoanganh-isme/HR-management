
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- 1. VIEW SQL: vHR_PersonGiayToTbl
-- Description: View truy vấn danh sách Giấy tờ kèm Họ tên & Chi nhánh NV
-- =========================================================================
-- =========================================================================
-- 2. STORED PROCEDURE: API_GiayToLienQuan
-- Description: API lấy danh sách Giấy tờ liên quan kết hợp thông tin nhân viên
--              Hỗ trợ lọc theo Từ khóa (@Keyword) và Chi nhánh (@BranchID)
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_GiayToLienQuan
(
    @List NVARCHAR(100) = '',
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = '',
    @UserName VARCHAR(100) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Xử lý chuẩn hóa tham số
    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, N'')));
    SET @BranchID = LTRIM(RTRIM(ISNULL(@BranchID, N'')));

    SELECT TOP 1000 
        G.*, 
        A.PersonName, 
        A.BranchID
    FROM dbo.HR_PersonGiayToTbl G
    LEFT JOIN dbo.HR_PersonTbl A ON G.PersonID = A.PersonID
    WHERE 
        -- 1. Lọc theo từ khóa (Mã NV, Họ tên NV, Loại giấy tờ)
        (
            @Keyword = N'' 
            OR G.PersonID LIKE '%' + @Keyword + '%'
            OR A.PersonName LIKE N'%' + @Keyword + '%'
            OR ISNULL(G.LoaiGiayTo, N'') LIKE N'%' + @Keyword + '%'
        )
        -- 2. Lọc theo chi nhánh (BranchID)
        AND (
            @BranchID = N'' 
            OR ISNULL(A.BranchID, N'') = N''
            OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','))
        )
    ORDER BY G.DocumentID DESC;
END
GO
