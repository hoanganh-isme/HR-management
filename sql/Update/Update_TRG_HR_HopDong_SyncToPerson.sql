CREATE OR ALTER TRIGGER dbo.TRG_HR_HopDong_SyncToPerson
ON dbo.HR_HopDongTbl
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu không có dữ liệu thay đổi thì bỏ qua
    IF NOT EXISTS (SELECT 1 FROM INSERTED) RETURN;

    -- Cập nhật thông tin hợp đồng sang Hồ sơ nhân viên khi Hợp đồng có Ngày ký
    -- Sử dụng ROW_NUMBER để lấy hợp đồng mới nhất (nếu có nhiều dòng update cùng lúc cho 1 nhân viên)
    UPDATE P
    SET 
        P.SoHopDong = I.MaHopDong,
        P.LoaiHopDong = I.LoaiHopDong,
        P.NgayHopDong = I.NgayCoHieuLuc,
        P.NgayHetHopDong = I.NgayHetHieuLuc
    FROM dbo.HR_PersonTbl P
    INNER JOIN (
        SELECT 
            PersonID, 
            MaHopDong, 
            LoaiHopDong, 
            NgayCoHieuLuc, 
            NgayHetHieuLuc,
            ROW_NUMBER() OVER(PARTITION BY PersonID ORDER BY NgayKyHopDong DESC) as rn
        FROM INSERTED
        WHERE NgayKyHopDong IS NOT NULL
    ) I ON P.PersonID = I.PersonID AND I.rn = 1;

END;
GO
