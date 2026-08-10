SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- =========================================================================
-- PROCEDURE: dbo.API_LuongKhoan
-- Danh sách Lương khoán (Bảng HR_LuongKhoanTbl + Tên nhân viên)
-- Dựa trên câu truy vấn:
-- SELECT TOP 1000 HR_LuongKhoanTbl.*, A.PersonName
-- FROM HR_LuongKhoanTbl LEFT JOIN HR_PersonTbl A ON HR_LuongKhoanTbl.PersonID = A.PersonID
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_LuongKhoan
(
    @Keyword NVARCHAR(200) = '',
    @BranchID NVARCHAR(MAX) = '',
    @UserName NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = LTRIM(RTRIM(ISNULL(@Keyword, '')));

    Select  top 1000 L.*, A.PersonName
    From HR_LuongKhoanTbl L
    Left join HR_PersonTbl A on L.PersonID = A.PersonID 
    WHERE 
        @Keyword = ''
        OR L.PersonID LIKE '%' + @Keyword + '%'
        OR A.PersonName LIKE N'%' + @Keyword + '%'
        OR L.GhiChu LIKE N'%' + @Keyword + '%' 
END;
GO
