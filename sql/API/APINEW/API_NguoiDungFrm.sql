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
