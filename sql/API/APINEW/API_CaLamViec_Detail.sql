USE X26DIMTUTAC
GO

-- API Tab 1: Danh sách nhân viên theo SapCaID
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_NhanVien
(
    @SapCaID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        NV.UserAutoID,
        NV.SapCaID,
        NV.PersonID,
        P.PersonName,
        P.PhongBan,
        P.BranchID,
        NV.GhiChu
    FROM dbo.HR_SapCaNhanVienTbl NV
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = NV.PersonID
    WHERE NV.SapCaID = @SapCaID
    ORDER BY P.PhongBan, P.PersonName;
END
GO

-- API Tab 2: Bảng ca chi tiết theo SapCaID
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_ChiTiet
(
    @SapCaID NVARCHAR(50) = ''
)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        CT.UserAutoID,
        CT.SapCaID,
        CT.PersonID,
        P.PersonName,
        P.PhongBan,
        CONVERT(NVARCHAR(10), CT.NgayLamViec, 103) AS NgayLamViec,
        CT.ShiftID,
        SL.ShiftName,
        CT.TrangThaiThucTe,
        CT.GhiChu
    FROM dbo.HR_SapCaChiTietTbl CT
    LEFT JOIN dbo.HR_PersonTbl P ON P.PersonID = CT.PersonID
    LEFT JOIN dbo.HR_ShiftListTbl SL ON SL.ShiftID = CT.ShiftID
    WHERE CT.SapCaID = @SapCaID
    ORDER BY CT.NgayLamViec, P.PhongBan, P.PersonName;
END
GO

-- Đăng ký vào WA_API
DELETE FROM dbo.WA_API WHERE list IN ('API_CaLamViec_NhanVien', 'API_CaLamViec_ChiTiet');
GO

INSERT INTO dbo.WA_API (list, func, [SQL], Para)
VALUES 
('API_CaLamViec_NhanVien', 'View', 'API_CaLamViec_NhanVien', '@SapCaID=N''{SapCaID}'''),
('API_CaLamViec_ChiTiet',  'View', 'API_CaLamViec_ChiTiet',  '@SapCaID=N''{SapCaID}''');
GO

PRINT 'Da tao API_CaLamViec_NhanVien va API_CaLamViec_ChiTiet thanh cong!';
GO
