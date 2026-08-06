SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_NguoiDungFrm
-- Description: Lấy danh sách người dùng từ SY_User kết hợp SY_UserGroup và CF_BranchTbl
--              Hỗ trợ lọc theo từ khóa (@Keyword)
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungFrm]
(
    @List VARCHAR(50) = '',
    @Keyword NVARCHAR(200) = '',
    @SortColumn VARCHAR(50) = '',
    @SortDir VARCHAR(10) = '',
    @Data NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        U.*,
        G.UserGroupName,
        B.BranchName
    FROM dbo.SY_User U
    LEFT JOIN dbo.SY_UserGroup G ON U.UserGroupID = G.UserGroupID
    LEFT JOIN dbo.CF_BranchTbl B ON U.BranchID = B.BranchID
    WHERE (@Keyword = '' 
           OR U.UserName LIKE N'%' + @Keyword + '%' 
           OR U.HoTen LIKE N'%' + @Keyword + '%'
           OR U.EmployeeID LIKE N'%' + @Keyword + '%')
    ORDER BY U.UserName ASC;
END
GO
