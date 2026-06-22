USE X26DIMTUTAC
GO

-- =========================================================================
-- API View: Danh sách nhân viên (Master Grid)
-- EXEC dbo.API_QuanLyNghiPhepNam @Keyword = '', @BranchID = '', @PhongBan = ''
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.API_QuanLyNghiPhepNam
(
    @Keyword  NVARCHAR(200) = '',
    @BranchID NVARCHAR(50)  = '',
    @PhongBan NVARCHAR(50)  = '',
    @PersonName NVARCHAR(200) = ''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PersonID,
        P.PersonName,
        P.PhongBan,
        P.TitleName,            -- Chức vụ
        P.ChucDanhChuyenMon,    -- Chức danh chuyên môn
        P.NgaySinh,             -- Ngày sinh
        P.CMND,                 -- CCCD
        P.DiaChiThuongTru,      -- Địa chỉ thường trú
        P.NgayVaoLam,           -- Ngày nhận việc
        P.BranchID,
        P.NgayHopDong,
        P.NationName,
        P.SoHopDong,
        P.DienThoai
    FROM dbo.HR_PersonTbl P
    WHERE 
        ISNULL(P.PersonStatus, 1) <> 5   -- Không phải đã nghỉ việc (Trạng thái 5 = Nghỉ việc)
        AND (@BranchID = '' OR P.BranchID = @BranchID)
        AND (@PhongBan  = '' OR P.PhongBan = @PhongBan)
        AND (@PersonName = '' OR P.PersonName LIKE N'%' + @PersonName + '%')
        AND (
            @Keyword = ''
            OR P.PersonID   LIKE '%' + @Keyword + '%'
            OR P.PersonName LIKE N'%' + @Keyword + '%'
        )
    ORDER BY P.PhongBan, P.PersonName;
END
GO
