CREATE OR ALTER PROCEDURE [dbo].[API_NguoiDungNhomFrm]
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
        G.UserGroupID,
        G.UserGroupName,
        G.IsDisable,
        (SELECT COUNT(*) FROM dbo.SY_User U WHERE U.UserGroupID = G.UserGroupID) AS CountUser
    FROM dbo.SY_UserGroup G
    WHERE (@Keyword = '' OR G.UserGroupName LIKE N'%' + @Keyword + '%' OR G.UserGroupID LIKE N'%' + @Keyword + '%')
    ORDER BY G.UserGroupID ASC;
END
GO