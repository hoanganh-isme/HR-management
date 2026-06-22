CREATE PROCEDURE [dbo].[API_tbmk_Thaydoi_View]
    @Keyword NVARCHAR(250),
    @Sothaydoi NVARCHAR(50) = '' -- Hứng biến Sothaydoi từ UI
AS
BEGIN
    SET NOCOUNT ON;

    -- Chuẩn hóa dữ liệu (Nếu rỗng thì chuyển thành NULL để dễ lọc)
    IF @Sothaydoi = '' SET @Sothaydoi = NULL;

    -- Lọc BẮT BUỘC theo Hợp đồng, và lọc THÊM theo Số thay đổi (nếu có)
    SELECT * 
    FROM tbmk_Thaydoi 
    WHERE Sohopdong = @Keyword
      AND (@Sothaydoi IS NULL OR Sothaydoi = @Sothaydoi)
    ORDER BY Sothaydoi DESC; 
END;
GO

-- 2. Cập nhật lại Gateway để truyền đủ cả 2 biến từ UI xuống SQL
UPDATE WA_API
SET [SQL] = 'API_tbmk_Thaydoi_View',
    [Para] = '@Keyword=N''{Keyword}'', @Sothaydoi=N''{Sothaydoi}'''
WHERE list = 'tbmk_Thaydoi' AND func = 'View';
GO