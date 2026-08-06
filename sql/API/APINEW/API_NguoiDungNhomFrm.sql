-- USE X26DIMTUTAC
-- GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_NguoiDungNhomFrm
-- Description: Lấy danh sách nhóm người dùng từ bảng SY_UserGroup
--              và tính toán số lượng người dùng (CountUser) từ bảng SY_User
--              Hỗ trợ lọc theo từ khóa (@Keyword)
-- =========================================================================
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
    
    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        G.UserGroupID,    -- Mã nhóm người dùng
        G.UserGroupName,  -- Tên nhóm người dùng
        G.IsDisable,      -- Ngừng sử dụng (1: Ngừng, 0: Đang dùng)
        (
            SELECT COUNT(*) 
            FROM dbo.SY_User U 
            WHERE U.UserGroupID = G.UserGroupID
        ) AS CountUser    -- Số người dùng thuộc nhóm (lấy theo số dòng SY_User)
    FROM dbo.SY_UserGroup G
    WHERE 
        @Keyword = '' 
        OR G.UserGroupName LIKE N'%' + @Keyword + '%' 
        OR G.UserGroupID LIKE N'%' + @Keyword + '%'
    ORDER BY G.UserGroupID ASC;
END
GO

