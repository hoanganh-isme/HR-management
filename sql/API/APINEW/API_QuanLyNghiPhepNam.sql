-- Danh sach khai bao phep nam.
-- Form chinh luu vao HR_PersonNghiPhepTbl; thong tin nhan vien chi JOIN de hien thi va loc.
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam
(
    @Keyword NVARCHAR(200) = '',
    @BranchID NVARCHAR(MAX) = '',
    @PhongBan NVARCHAR(50) = '',
    @PersonName NVARCHAR(200) = '',
    @Nam NVARCHAR(10) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NamFilter INT = ISNULL(TRY_CONVERT(INT, NULLIF(LTRIM(RTRIM(@Nam)), '')), YEAR(GETDATE()));

    SELECT
        P.PersonID
        P.PersonName,
        P.PhongBan,
        P.TitleName,
        P.BranchID,
        ISNULL(N.Nam, ISNULL(@NamFilter, YEAR(GETDATE()))) AS Nam,
        ISNULL(N.SoNgay, 0) AS SoNgay,
        ISNULL(N.PhepThamNien, 0) AS PhepThamNien,
        ISNULL(N.PhepTonNamTruoc, 0) AS PhepTonNamTruoc,
        ISNULL(N.SoNgayDaSuDung, 0) AS SoNgayDaSuDung,
        ISNULL(N.SoNgayConLai, 0) AS SoNgayConLai,
        ISNULL(N.SoNgayPhepTet, 0) AS SoNgayPhepTet,
        ISNULL(N.SoNgayPhepOm, 0) AS SoNgayPhepOm,
        N.GhiChu
    FROM dbo.HR_PersonTbl P
    LEFT JOIN dbo.HR_PersonNghiPhepTbl N ON P.PersonID = N.PersonID AND (@NamFilter IS NULL OR N.Nam = @NamFilter)
    WHERE (@BranchID = '' OR P.BranchID IN (
              SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@BranchID, ',')
          ))
      AND (@PhongBan = '' OR P.PhongBan = @PhongBan)
     -- AND ISNULL(P.PersonStatus, 1) = 1
      AND (
          @Keyword = ''
          OR P.PersonID LIKE '%' + @Keyword + '%'
          OR P.PersonName LIKE N'%' + @Keyword + '%'
          OR CONVERT(VARCHAR(10), ISNULL(N.Nam, @NamFilter)) LIKE '%' + @Keyword + '%'
      )
    ORDER BY ISNULL(N.Nam, @NamFilter) DESC, P.PhongBan, P.PersonName;
END
GO
