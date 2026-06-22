USE [QLTiec]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- VIEW: Danh sách Biên nhận đặt cọc
-- Chức năng: Nối (JOIN) bảng tbmk_Biennhancoccho với bảng Khách hàng
-- Mục đích: Làm Data Source (TableName) cho màn hình Form Động frmBiennhancoccho
-- =============================================
CREATE OR ALTER VIEW [dbo].[v_DanhSachPhieuCoc] AS
SELECT 
    b.DocumentID,
    b.DocumentID AS MaChungTu,
    b.SoBN AS SoPhieu,
    b.Thoigianid,
    b.Loaitiecid AS Loaihinhtiecid,
    b.SobanManchinhthuc,
    b.SobanChaychinhthuc,
    b.SobanManduphong,
    b.SobanChayduphong,
    b.Ghichu,
    -- Ngày tổ chức gốc chuẩn Date để Form Đặt Cọc bind vào Datepicker
    b.Ngaytochuc AS [_Ngaytochuc],
    
    -- Lôi thông tin khách hàng từ bảng khác đắp vào đây
    k.Tenchure,
    k.Tencodau,
    k.DTchure,
    k.DTcodau,
    k.Diachi,
    k.Nguoigd,
    k.DienThoaiDaiDien,
    k.Mail,
    
    -- Cột tính toán Tên khách & Điện thoại
    CASE 
        WHEN k.Tenchure IS NOT NULL AND k.Tencodau IS NOT NULL THEN k.Tenchure + ' & ' + k.Tencodau
        ELSE ISNULL(k.Tenkh, N'Khách vãng lai')
    END AS TenKhachHang,
    
    ISNULL(k.Dienthoai, ISNULL(k.DTchure, k.DTcodau)) AS DienThoai,
    
    -- Cột hiển thị định dạng đẹp dd/MM/yyyy trên Lưới
    CONVERT(VARCHAR(10), b.Ngaytochuc, 103) AS [Ngaytochuc],
    ISNULL(b.Tongsoban, 0) AS SoBan,
    (
        SELECT TOP 1 s.Tensanhtiec 
        FROM tbmk_Biennhancocchosanhtiec bs 
        INNER JOIN dmSanhtiec s ON bs.Sanhtiecid = s.Sanhtiecid 
        WHERE bs.DocumentID = b.DocumentID
    ) AS SanhDat,
    ISNULL(b.Tongtien, 0) AS DaCocVND,
    (
        SELECT Sanhtiecid, IsSanhchinh 
        FROM tbmk_Biennhancocchosanhtiec 
        WHERE DocumentID = b.DocumentID 
        FOR JSON PATH
    ) AS JsonSanhTiec,
    CASE
        WHEN b.IsHuy = 1 THEN N'Đã Hủy'
        WHEN b.IsKetthuc = 1 THEN N'Đã lên Hợp đồng'
        WHEN b.Solan = 2 THEN N'Đã cọc lần 2'
        ELSE N'Đã cọc lần 1'
    END AS TrangThai

FROM tbmk_Biennhancoccho b
LEFT JOIN dmkhachhang k ON b.Makh = k.Makh;
GO

-- Dạy cho Form Đặt Cọc biết: Hãy chọc vào cái View v_DanhSachPhieuCoc thay vì bảng gốc
UPDATE SY_FrmLstTbl 
SET TableName = 'v_DanhSachPhieuCoc' 
WHERE FormID = 'frmBiennhancoccho';
GO
