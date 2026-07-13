
CREATE OR ALTER PROCEDURE dbo.API_DanhSachChucDanh
(
    @Keyword NVARCHAR(100) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Keyword = ISNULL(@Keyword, '');

    SELECT 
        ChucDanhChuyenMon,
        MoTa
    FROM HR_ChucDanhTbl
    WHERE 
        @Keyword = ''
        OR ChucDanhChuyenMon LIKE N'%' + @Keyword + '%'
        OR MoTa LIKE N'%' + @Keyword + '%'
    ORDER BY ChucDanhChuyenMon;
END
GO
IF NOT EXISTS (SELECT 1 FROM WA_API WHERE list = 'API_DanhSachChucDanh' AND func = 'View')
BEGIN
    INSERT INTO WA_API (list, func, [SQL], Para)
    VALUES ('API_DanhSachChucDanh', 'View', 'API_DanhSachChucDanh', '@Keyword=''{Keyword}''');
END
GO
