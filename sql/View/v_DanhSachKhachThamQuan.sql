USE [QLTiec]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER VIEW [dbo].[v_DanhSachKhachThamQuan] AS
SELECT 
    -- Mapping chính cho Lưới (Grid)
    t.DocumentID AS [MaPhieu],
    
    -- Các trường dành cho Form Sửa (Edit Binding)
    t.DocumentID,
    t.Makh AS [_TenKhachHang],    -- Cột ảo chứa ID ngầm cho Form Sửa
    k.Tenkh AS [TenKhachHang],    -- Cột thật chứa Tên để in ra Bảng
    ISNULL(k.Dienthoai, ISNULL(k.DTchure, k.DTcodau)) AS [DienThoai],
    
    CONVERT(VARCHAR(10), t.Ngaytochuc, 103) AS [NgayDuKien], -- Hiển thị Lưới (dd/MM/yyyy)
    t.Ngaytochuc AS [NgayToChucGoc], -- Ngày nguyên thủy (ISO) để load vào Datepicker của Form
    
    t.Nhamngay AS [NgayAmLich],
    t.GoiThucDonID AS [_GoiTiec], -- Cột ẩn chứa ID cho Form Sửa
    gd.TenGoiThucDon AS [GoiTiec], -- Cột hiện Tên Gói Tiệc ra Lưới
    
    -- Dữ liệu ngầm định khác (Thêm dấu _ để Lưới tự động tàng hình)
    t.Loaitiecid AS [_Loaitiecid],
    t.Thoigianid AS [_Thoigianid],
    t.SobanMan AS [_SobanMan],
    t.SobanChay AS [_SobanChay],
    t.Ghichu AS [_Ghichu],
    t.Ngaytochuc AS [_Ngaytochuc],
    t.DocumentDate AS [_DocumentDate],
    
    (
        SELECT TOP 1 s.Tensanhtiec 
        FROM tbmk_Khachthamquansanhtiec bs 
        INNER JOIN dmSanhtiec s ON bs.Sanhtiecid = s.Sanhtiecid 
        WHERE bs.DocumentID = t.DocumentID
    ) AS [SanhTiec], -- Đã đổi thành Tên để hiện ra Lưới
    
    -- Dành riêng cho Edit Form Binding
    (
        SELECT TOP 1 bs.Sanhtiecid 
        FROM tbmk_Khachthamquansanhtiec bs 
        WHERE bs.DocumentID = t.DocumentID
    ) AS [_SanhTiec], -- Đổi thành cột chìm chứa ID
    
    CASE
        WHEN t.IsHuy = 1 THEN N'Đã Hủy'
        WHEN t.IsKetthuc = 1 THEN N'Đã Đặt Cọc'
        ELSE N'Đang Tư Vấn'
    END AS [TrangThai]

FROM 
    tbmk_Khachthamquan t
LEFT JOIN 
    dmkhachhang k ON t.Makh = k.Makh
LEFT JOIN
    dmLoaihinhtiec l ON t.Loaitiecid = l.Loaitiecid
LEFT JOIN
    dmGoiThucDon gd ON t.GoiThucDonID = gd.GoiThucDonID;
GO
