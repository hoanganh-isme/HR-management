-- =========================================================================================
-- FILE TEST ĐỂ CHẠY THỬ TRỰC TIẾP TRONG SQL MANAGEMENT STUDIO (SSMS)
-- Giả lập các thao tác của Frontend gửi xuống API_Gateway_Router
-- =========================================================================================

-- 1. TEST CHỨC NĂNG TÌM KIẾM / LẤY DỮ LIỆU (VIEW)
-- Trả về danh sách khách hàng có phân trang và sắp xếp
EXEC [dbo].[API_Gateway_Router]
    @List = 'frmCustomer',
    @Func = 'View',
    @UserName = 'admin',
    @Keyword = '',
    @Page = 1,
    @Limit = 20,
    @JsonData = '{"_SortColumn":"TenKhachHang", "_SortDir":"ASC"}';
GO

-- 2. TEST CHỨC NĂNG LƯU DỮ LIỆU (SAVE)
-- Thêm mới hoặc cập nhật thông tin khách hàng
EXEC [dbo].[API_Gateway_Router]
    @List = 'frmCustomer',
    @Func = 'Save',
    @UserName = 'admin',
    @Keyword = '',
    @Page = 1,
    @Limit = 1,
    @JsonData = '{"KhachHangID":"", "TenKhachHang":"Nguyễn Văn A", "SoDienThoai":"0909123456", "Email":"test@gmail.com"}';
GO

-- 3. TEST CHỨC NĂNG XÓA DỮ LIỆU (DELETE)
-- Xóa khách hàng dựa trên ID (nếu API xoá hỗ trợ truyền ID vào JsonData như cấu hình)
EXEC [dbo].[API_Gateway_Router]
    @List = 'frmCustomer',
    @Func = 'Delete',
    @UserName = 'admin',
    @Keyword = '',
    @Page = 1,
    @Limit = 1,
    @JsonData = 'KH001,KH002'; -- Nếu logic xóa dùng chuỗi phân cách phẩy
GO
