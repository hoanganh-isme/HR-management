SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- =========================================================================
-- DETAIL API: Tab Phép năm theo PersonID (Bảng HR_PersonNghiPhepTbl)
-- Theo đúng cấu hình Desktop App (Image 2 & Image 3)
-- EXEC dbo.API_QuanLyNghiPhepNam_ChiTiet @PersonID = 'ED004'
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam_ChiTiet
(
    @PersonID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        N.UserAutoID,
        N.PersonID,
        N.Nam,
        ISNULL(N.SoNgay, 0)            AS SoNgay,
        N.GhiChu,
        ISNULL(N.PhepThamNien, 0)      AS PhepThamNien,
        ISNULL(N.SoNgayDaSuDung, 0)    AS SoNgayDaSuDung,
        ISNULL(N.SoNgayConLai, 0)      AS SoNgayConLai,
        ISNULL(N.PhepTonNamTruoc, 0)   AS PhepTonNamTruoc,
        ISNULL(N.SoNgayPhepTet, 0)     AS SoNgayPhepTet,
        ISNULL(N.SoNgayPhepOm, 0)      AS SoNgayPhepOm,
        N.NgayCapNhat
    FROM dbo.HR_PersonNghiPhepTbl N
    WHERE N.PersonID = @PersonID
    ORDER BY N.Nam DESC;
END;
GO
