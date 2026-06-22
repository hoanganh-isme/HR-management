NHÓM 1: CÁC LUỒNG NGHIỆP VỤ TIỆC (CORE BUSINESS FLOWS)
Đây là các quy trình đi từ lúc khách bước vào nhà hàng đến khi dọn dẹp xong tiệc và thanh toán. Dựa theo Mục IV-Phụ kết hợp với các Mục IV.8, IV.9, IV.10, IV.13, chúng ta có các nhánh sau:

Các bước phụ trợ (Optional) có thể chèn vào bất kỳ flow nào dưới đây:

[Cọc HĐ 2]: Xảy ra khi đã ký Hợp đồng nhưng tổng tiền cọc chưa đủ 40% giá trị hợp đồng.
[Thay đổi - Bổ sung]: Xảy ra khi khách đã ký Hợp đồng rồi nhưng đột nhiên muốn đổi món, đổi sảnh, thêm bàn, v.v.
[Sắp đặt tiệc]: Luôn diễn ra trước khi tiệc bắt đầu để báo cho Bếp, Lễ tân chuẩn bị.
[Khảo sát khách hàng]: Luôn diễn ra sau khi Quyết toán để xin ý kiến (feedback).
5 Biến thể Flow Chính:

Flow 1 (Suôn sẻ nhất - Không thay đổi trước HĐ): Khách Tham Quan ➔ Cọc Lần 1 ➔ Hợp Đồng ➔ [Cọc HĐ 2] ➔ [Thay đổi - Bổ sung] ➔ Sắp Đặt Tiệc ➔ Tổ Chức Tiệc ➔ Quyết Toán ➔ Khảo Sát Khách Hàng.

Flow 2 (Đổi ý sau khi Cọc 1): Khách Tham Quan ➔ Cọc Lần 1 ➔ Thay Đổi Cọc Lần 1 ➔ Hợp Đồng ➔ [Cọc HĐ 2] ➔ [Thay đổi - Bổ sung] ➔ Sắp Đặt Tiệc ➔ Quyết Toán ➔ Khảo Sát.

Flow 3 (Cọc 1 chưa đủ tiền, phải đóng thêm Cọc 2): Khách Tham Quan ➔ Cọc Lần 1 ➔ Cọc Lần 2 ➔ Hợp Đồng ➔ [Cọc HĐ 2] ➔ [Thay đổi - Bổ sung] ➔ Sắp Đặt Tiệc ➔ Quyết Toán ➔ Khảo Sát.

Flow 4 (Đổi ý sau Cọc 1, rồi mới đóng Cọc 2): Khách Tham Quan ➔ Cọc Lần 1 ➔ Thay Đổi Cọc 1 ➔ Cọc Lần 2 ➔ Hợp Đồng ➔ [Cọc HĐ 2] ➔ [Thay đổi - Bổ sung] ➔ Sắp Đặt Tiệc ➔ Quyết Toán ➔ Khảo Sát.

Flow 5 (Khách hàng do dự, thay đổi liên tục): Khách Tham Quan ➔ Cọc Lần 1 ➔ Thay Đổi Cọc 1 ➔ Cọc Lần 2 ➔ Thay Đổi Cọc 2 ➔ Hợp Đồng ➔ [Cọc HĐ 2] ➔ [Thay đổi - Bổ sung] ➔ Sắp Đặt Tiệc ➔ Quyết Toán ➔ Khảo Sát.

NHÓM 2: CÁC LUỒNG RẼ NHÁNH / NGOẠI LỆ (EDGE CASES)
Không phải lúc nào tiệc cũng diễn ra tới bước Quyết toán. Dưới đây là các flow đứt gánh giữa đường:

Flow 6 (Khách rớt - Không đặt tiệc): Khách Tham Quan ➔ Ghi nhận ý kiến ➔ Khách ra về (Không cọc) ➔ Dữ liệu lưu vào Hồ sơ Khách hàng để Sale gọi điện chăm sóc/remarketing sau này.

Flow 7 (Dời ngày tiệc): Khách đã làm Hợp Đồng ➔ Gặp sự cố muốn dời ngày ➔ Vào tab Dời - Hủy Hợp Đồng ➔ Cập nhật ngày tổ chức mới ➔ Lịch tiệc (Calendar) tự động cập nhật màu sắc & dời vị trí ➔ Tiếp tục quy trình bình thường (Sắp đặt tiệc ➔ Quyết toán).

Flow 8 (Hủy tiệc / Bể kèo): Khách đã Cọc hoặc đã ký Hợp Đồng ➔ Yêu cầu Hủy tiệc ➔ Vào tab Dời - Hủy Hợp Đồng ➔ Xử lý thanh lý hợp đồng (Trả lại cọc hoặc nhà hàng thu luôn tiền cọc) ➔ Giải phóng sảnh (Sảnh chuyển từ Đỏ/Vàng sang Xanh lá) ➔ Kết thúc luồng.

NHÓM 3: LUỒNG SETUP HỆ THỐNG BAN ĐẦU (ADMINISTRATOR FLOWS)
Để nhân viên có thể bắt đầu làm Biên nhận cọc (Nhóm 1), Quản trị viên (Admin) bắt buộc phải đi qua flow này trước:

Flow 9 (Khởi tạo phần mềm lần đầu): Thiết lập Thông số công ty & Nhập Quỹ tiền mặt ban đầu ➔ Khai báo Năm sử dụng (Tự sinh Kỳ/Quý) ➔ Tạo Ngày Dương Lịch & Mapping sang Ngày Âm Lịch ➔ Mở Kỳ sử dụng.

Flow 10 (Chuẩn bị Dữ liệu danh mục): Tạo Danh mục Khu vực ➔ Tạo Nhóm Hàng ➔ Tạo Nguyên vật liệu ➔ Tạo Món ăn (Hàng hóa) ➔ Cấu hình Định lượng (Món ăn A gồm những NVL gì) ➔ Thiết lập Gói Ưu đãi (Combo cưới).

Flow 11 (Phân quyền bảo mật): Tạo Nhóm quyền (Quản lý, Sale, Kế toán...) ➔ Thiết lập quyền (Xem/Thêm/Sửa/Xóa) cho từng Form ➔ Tạo Tài khoản người dùng ➔ Gán người dùng vào Nhóm quyền.

NHÓM 4: LUỒNG BACK-OFFICE (KẾ TOÁN, KHO & NHÂN SỰ)
Các flow chạy ngầm song song với quá trình Sale bán tiệc:

Flow 12 (Đóng / Mở kỳ Kế toán): Đầu tháng: Kế toán vào Chọn kỳ sử dụng ➔ Nhân viên có thể thêm/sửa/xóa phiếu. Cuối tháng: Kế toán Khóa kỳ sử dụng ➔ Toàn bộ Biên nhận, Hợp đồng, Phiếu Thu/Chi trong tháng đó bị khóa (Read-only), không ai được sửa chữa số liệu nữa.

Flow 13 (Tính giá vốn món ăn tự động): Kế toán nhập Kho NVL (Nhập số lượng & giá nhập) ➔ Quản lý thiết lập Định lượng Món ăn ➔ Hệ thống tự nhân (Giá NVL x Định lượng) ➔ Tự động cập nhật Giá vốn Món ăn ➔ Báo cáo Lợi nhuận gộp cuối tháng.

Flow 14 (Luân chuyển Dòng tiền Thu/Chi): Khách cọc tiền hoặc Quyết toán tiệc ➔ Hệ thống tự động sinh Phiếu Thu tương ứng ➔ Cộng dồn vào Quỹ tiền mặt. Nhà hàng mua NVL, trả lương nhân sự ➔ Kế toán lập Phiếu Chi ➔ Trừ đi Quỹ tiền mặt.

Flow 15 (Quản lý và Đánh giá Nhân sự tiệc): Khởi tạo Hồ sơ nhân viên (Thời vụ/Fulltime) ➔ Phân công làm việc theo ca tiệc ➔ Sau khi tiệc xong ➔ Quản lý cập nhật Đánh giá/Nhận xét (Chuyên cần, thái độ) vào hồ sơ nhân viên.

Flow 16 (Cảnh báo công nợ): Khách ký hợp đồng ➔ Hệ thống theo dõi mốc thanh toán ➔ Gần đến hạn (7 ngày): Hiện cảnh báo trên Dashboard ➔ Quá hạn: Cảnh báo đỏ cờ ➔ Sale click vào để gọi điện đòi tiền.

BỔ SUNG: NHÓM 5 - LUỒNG TRA CỨU, BÁO CÁO & BẢO TRÌ
5.1. Các Luồng Tra Cứu (Lookup Flows) Dành cho Quản lý & Sale kiểm tra tình trạng tức thời (Dựa theo mục IV.12, VI.1, VI.2):

Flow 17 (Tra cứu Trạng thái Sảnh tiệc): Mở màn hình Trạng thái sảnh ➔ Xem màu sắc sảnh (Xanh/Vàng/Đỏ) ➔ Click vào ô sảnh Đỏ/Vàng ➔ Hệ thống popup hiển thị thông tin chi tiết Hợp đồng/Biên nhận cọc đang chiếm sảnh đó.
Flow 18 (Tra cứu Lịch Tiệc - Calendar): Mở Lịch tiệc (Dashboard) ➔ Lọc theo Tháng/Năm ➔ Double-click vào một ô lịch có tiệc ➔ Chuyển hướng sang xem chi tiết Biên nhận cọc chỗ hoặc Hợp đồng.
Flow 19 (Tra cứu Lịch sử Khách hàng): Mở Hồ sơ khách hàng ➔ Tìm kiếm theo Tên/SĐT ➔ Xem lại toàn bộ lịch sử giao dịch (Đã tham quan mấy lần, đã ký những hợp đồng nào, thanh toán chưa).
5.2. Các Luồng Báo Cáo & Phân Tích (Reporting Flows) Dành cho Ban Giám đốc và Kế toán (Dựa theo mục V và VI.5, VI.6, VI.7):

Flow 20 (Xem Báo cáo Doanh thu & Chi phí): Chọn loại báo cáo (Doanh thu / Chi phí / Lợi nhuận) ➔ Lọc theo điều kiện (Từ ngày - Đến ngày, theo Sảnh, theo Nhân viên Sale) ➔ Hệ thống xuất biểu đồ hoặc lưới dữ liệu ➔ Click In hoặc Xuất Excel.
Flow 21 (Phân tích Khảo sát Khách hàng): Lọc theo khoảng thời gian ➔ Hệ thống tổng hợp các mẫu ý kiến (Kênh biết đến nhà hàng, Lý do chọn, CTKM yêu thích) ➔ Đưa ra bảng thống kê (giúp Marketing ra quyết định).
5.3. Các Luồng Bảo Trì & Cá Nhân (Maintenance Flows) (Dựa theo mục II.5, II.9):

Flow 22 (Sao lưu dữ liệu định kỳ): Admin vào Sao lưu dữ liệu ➔ Chọn thư mục lưu trữ (Click ...) ➔ Hệ thống xuất file backup tự động theo định dạng [TênDB]_YYYY_MM_DD_HH_mm_ss.
Flow 23 (Bảo mật tài khoản cá nhân): Người dùng đăng nhập ➔ Đổi mật khẩu cá nhân ➔ Lưu.