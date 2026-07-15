-- SP lấy dữ liệu cho danh sách Nghỉ phép
-- Trả về 1000 record mới nhất của HR_NghiPhepView kết hợp tên nhân viên và chi nhánh.
CREATE OR ALTER PROCEDURE dbo.API_HR_NghiPhep
(
    @Keyword NVARCHAR(200) = '',
    @BranchID NVARCHAR(MAX) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1000 
        V.*, 
        A.PersonName, 
        A.BranchID AS PersonBranchID
    FROM dbo.HR_NghiPhepView V
    LEFT JOIN dbo.HR_PersonTbl A ON V.PersonID = A.PersonID 
    WHERE (
        NULLIF(LTRIM(RTRIM(@BranchID)), '') IS NULL
        OR A.BranchID IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ','))
    )
    AND (
        @Keyword = ''
        OR A.PersonID LIKE '%' + @Keyword + '%'
        OR A.PersonName LIKE N'%' + @Keyword + '%'
        OR V.DocumentID LIKE '%' + @Keyword + '%'
    )
    ORDER BY V.DocumentDate DESC;
END
GO
