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
    @SapCaID nvarchar(50) = N''
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        /* Khóa kỹ thuật vẫn trả về để nhận diện dòng */
        CT.UserAutoID,

        /* Field thuộc bảng chính */
        CT.SapCaID,
        CT.PersonID,

        /* Field JOIN từ nhân viên */
        P.PersonName,
        P.PhongBan,
        P.BranchID,

        /*
          Hiện frontend JOIN detail chưa format date chuyên sâu,
          nên tạm giữ định dạng dd/MM/yyyy ổn định.
        */
        CONVERT(nvarchar(10), CT.NgayLamViec, 103)
            AS NgayLamViec,

        /* Field ca làm việc */
        CT.ShiftID,
        SL.ShiftName,

        CT.TrangThaiThucTe,
        CT.GhiChu

    FROM dbo.HR_SapCaChiTietTbl AS CT

    LEFT JOIN dbo.HR_PersonTbl AS P
        ON P.PersonID = CT.PersonID

    LEFT JOIN dbo.HR_ShiftListTbl AS SL
        ON SL.ShiftID = CT.ShiftID

    WHERE
        CT.SapCaID = @SapCaID

    ORDER BY
        CT.NgayLamViec,
        P.PhongBan,
        P.PersonName;
END;
GO

-- Đăng ký an toàn View route vào WA_API (không xóa Save/Delete đã cutover V2)
UPDATE A
SET A.[SQL] = N'API_CaLamViec_NhanVien', A.[Para] = N'@SapCaID=N''{SapCaID}'''
FROM dbo.WA_API AS A
WHERE A.[list] = 'API_CaLamViec_NhanVien' AND A.[func] = 'View';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'API_CaLamViec_NhanVien' AND [func] = 'View')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('API_CaLamViec_NhanVien', 'View', 'API_CaLamViec_NhanVien', '@SapCaID=N''{SapCaID}''');

UPDATE A
SET A.[SQL] = N'API_CaLamViec_ChiTiet', A.[Para] = N'@SapCaID=N''{SapCaID}'''
FROM dbo.WA_API AS A
WHERE A.[list] = 'API_CaLamViec_ChiTiet' AND A.[func] = 'View';

IF NOT EXISTS (SELECT 1 FROM dbo.WA_API WHERE [list] = 'API_CaLamViec_ChiTiet' AND [func] = 'View')
    INSERT INTO dbo.WA_API ([list], [func], [SQL], [Para]) VALUES ('API_CaLamViec_ChiTiet', 'View', 'API_CaLamViec_ChiTiet', '@SapCaID=N''{SapCaID}''');
GO

PRINT 'Da tao API_CaLamViec_NhanVien va API_CaLamViec_ChiTiet thanh cong!';
GO
