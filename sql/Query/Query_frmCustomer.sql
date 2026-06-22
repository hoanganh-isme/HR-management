USE [QLTiec]
GO

-- 1. Xem cấu hình các trường dữ liệu của form Khách hàng trên Giao diện
SELECT 
    AutoID, 
    FieldName AS [Tên Cột DB], 
    CaptionVN AS [Tiêu đề Tiếng Việt], 
    FormatID AS [Loại Input], 
    FormPosition AS [Độ rộng],
    ShowInFilter AS [Bật Bộ Lọc Động],
    ShowInAdd AS [Hiện lúc Thêm],
    ShowInEdit AS [Hiện lúc Sửa],
    OrderNo AS [Thứ tự]
FROM SY_FormatFields 
WHERE FormName = 'frmCustomer'
ORDER BY OrderNo ASC;

GO

-- 2. Xem dữ liệu mẫu đang có trong bảng Khách hàng vật lý (dmkhachhang)
SELECT TOP 10 
    Makh AS [Mã KH], 
    Tenkh AS [Tên KH], 
    Dienthoai AS [Điện thoại],
    Tenchure AS [Tên chú rể], 
    DTchure AS [SĐT chú rể], 
    Tencodau AS [Tên cô dâu], 
    DTcodau AS [SĐT cô dâu], 
    Diachi AS [Địa chỉ], 
    Mail AS [Email]
FROM dmkhachhang
ORDER BY Makh DESC;

GO
