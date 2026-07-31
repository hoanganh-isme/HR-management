
-- =========================================================================
-- Đổ dữ liệu Combobox cho trạng thái nhân viên
-- Bảng: HR_PersonStatusTbl
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_ComboPersonStatus
(
    @Keyword NVARCHAR(200) = '',
    @UserName VARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PersonStatus,
        PersonStatusName
    FROM dbo.HR_PersonStatusTbl
    WHERE (@Keyword = '' OR PersonStatusName LIKE N'%' + @Keyword + '%')
    ORDER BY PersonStatus ASC;
END
GO
