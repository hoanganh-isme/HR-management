
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
        PersonStatus AS [Mã],
        PersonStatusName AS [Tên]
    FROM dbo.HR_PersonStatusTbl
    WHERE (@Keyword = '' OR PersonStatusName LIKE N'%' + @Keyword + '%')
    ORDER BY PersonStatus ASC;
END
GO

-- Lệnh để thêm API này vào bảng WA_API để Frontend có thể gọi được
IF NOT EXISTS (SELECT 1 FROM WA_API WHERE list = 'API_ComboPersonStatus' AND func = 'View')
BEGIN
    INSERT INTO WA_API (list, func, SQL, Para)
    VALUES ('API_ComboPersonStatus', 'View', 'API_ComboPersonStatus', '@Keyword=''{Keyword}'', @UserName=''{UserName}''');
END
GO
