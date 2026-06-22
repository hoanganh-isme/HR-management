USE X26DIMTUTAC
GO

CREATE OR ALTER PROCEDURE dbo.API_DanhSachToNhom
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        STT,              -- Số thứ tự hiển thị
        WorkingGroupName, -- Tên tổ / nhóm làm việc
        GhiChu            -- Ghi chú
    FROM HR_WorkingGroupListTbl
    WHERE 
        @Keyword = ''
        OR WorkingGroupName LIKE N'%' + @Keyword + '%'
        OR GhiChu LIKE N'%' + @Keyword + '%'
    ORDER BY ISNULL(STT, 9999), WorkingGroupName;
END
GO
