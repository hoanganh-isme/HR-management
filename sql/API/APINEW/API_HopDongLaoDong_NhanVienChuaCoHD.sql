USE X26DIMTUTAC
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =========================================================================
-- Stored Procedure: API_HopDongLaoDong_NhanVienChuaCoHD
-- Description: Lấy danh sách toàn bộ nhân viên đang làm việc, phục vụ ô chọn nhân viên khi thêm mới hợp đồng.
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NhanVienChuaCoHD
(
    @Keyword NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName
    FROM dbo.HR_PersonTbl P
    WHERE P.PersonStatus IN (1, 4) -- Chỉ lấy nhân viên đang làm việc (1: Chính thức, 4: Thử việc)
      AND (
          ISNULL(@Keyword, '') = ''
          OR P.PersonName LIKE N'%' + @Keyword + '%'
          OR P.PersonID LIKE N'%' + @Keyword + '%'
      )
    ORDER BY P.PersonID DESC;
END
GO
