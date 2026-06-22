# DANH SÁCH CÁC TRƯỜNG DỮ LIỆU CẦN ĐIỀN TRONG HỢP ĐỒNG ĐẶT TIỆC
Dựa trên việc đọc kỹ toàn bộ nội dung file `hop_dong.docx`, dưới đây là danh sách chi tiết (tất cả các trường dù là nhỏ nhất) đang để trống hoặc ẩn ý cần thay đổi động. 

Các biến dưới đây được gợi ý đặt tên theo chuẩn thẻ của `docxtemplater` (ví dụ: `{SoHopDong}`) để bạn dễ dàng copy dán vào file Word.

## 1. Thông tin quản lý Hợp Đồng & Ngày tháng
1. `{SoHopDong}`: Số của hợp đồng (Ví dụ: `123/24-HHKH2025`). Lưu ý trường này xuất hiện 2 lần (Trang đầu và trang Khuyến mãi).
2. `{NgayLapHD}` / `{ThangLapHD}` / `{NamLapHD}`: Ngày, tháng, năm lập hợp đồng.

## 2. Thông tin Bên A (Nhà hàng / Công ty)
Mặc dù thông tin công ty đã cố định, nhưng các cá nhân đại diện ký có thể thay đổi:
3. `{BenA_NguoiDaiDien}`: Tên người đại diện ký hợp đồng (Ông/Bà ...). Xuất hiện 2 lần (đầu và phần ký tên cuối hợp đồng).
4. `{BenA_ChucVu}`: Chức vụ của người đại diện (Ví dụ: Quản lý nhà hàng, Giám đốc). Xuất hiện 2 lần.
5. `{BenA_NhanVienPhuTrach}`: Tên nhân viên sales/tư vấn trực tiếp phụ trách hợp đồng.
6. `{BenA_SDT_NhanVien}`: Số điện thoại của nhân viên phụ trách để khách liên hệ.

## 3. Thông tin Bên B (Khách hàng)
7. `{BenB_TenDaiDien}`: Tên người đại diện đứng ra ký hợp đồng. Xuất hiện 2 lần (đầu và phần ký tên).
8. `{BenB_TenChuTiec}`: Tên của Chủ tiệc (Tên Cô Dâu & Chú Rể, hoặc người được tổ chức tiệc).
9. `{BenB_CCCD}`: Số Căn cước công dân / CMND của người đại diện ký.
10. `{BenB_DiaChi}`: Địa chỉ thường trú hoặc liên hệ của người đại diện.
11. `{BenB_DienThoai}`: Số điện thoại liên hệ của người đại diện.

## 4. Thông tin chi tiết Tiệc (Điều 1 & 2)
12. `{Tiec_LoaiTiec}`: Loại tiệc. Hiện tại đang ghi cứng là `CƯỚI – LỄ TÂN HÔN/VU QUY/BÁO HỶ`, nên đặt thành biến nếu nhà hàng có làm tiệc Sinh nhật, Hội nghị, Thôi nôi...
13. `{Tiec_GioBatDau}`: Giờ bắt đầu đãi tiệc (Ví dụ: `18:00` hoặc `11:30`).
14. `{Tiec_NgayDL}` / `{Tiec_ThangDL}` / `{Tiec_NamDL}`: Ngày, tháng, năm đãi tiệc theo Dương lịch.
15. `{Tiec_NgayAL}` / `{Tiec_ThangAL}` / `{Tiec_NamAL}`: Ngày, tháng, năm đãi tiệc theo Âm lịch.
16. `{Tiec_SanhTiec}`: Tên sảnh tiệc tổ chức (Ví dụ: `Queen 1`, `King 2`).
17. `{Sanh_QuyMoMin}`: Quy mô phục vụ tối thiểu của sảnh (Ví dụ: từ `20` bàn).
18. `{Sanh_QuyMoMax}`: Quy mô phục vụ tối đa của sảnh (Ví dụ: đến `50` bàn).
19. `{Tiec_SoBanChinhThuc}`: Số lượng bàn tiệc chính thức khách đặt.
20. `{Tiec_SoBanTang}`: Số lượng bàn được nhà hàng tặng thêm.
21. `{Tiec_SoBanDuPhong}`: Số lượng bàn dự phòng chuẩn bị thêm.
22. `{Tiec_SoKhach1Ban}`: Số lượng khách quy định trên 1 bàn (Ví dụ: `10` người/bàn).

## 5. Thanh toán & Đặt cọc (Điều 5)
23. `{Coc_Lan1_SoTien}`: Số tiền khách đặt cọc giữ chỗ lần 1 (ghi bằng số, ví dụ: `10.000.000 VNĐ`).
24. `{Coc_Lan1_BangChu}`: Số tiền cọc ghi bằng chữ (Ví dụ: `Mười triệu đồng chẵn`).
25. `{Coc_Ngay}` / `{Coc_Thang}` / `{Coc_Nam}`: Ngày, tháng, năm khách thực hiện thanh toán tiền cọc lần 1.

## 6. Khuyến mãi & Điều khoản bổ sung (Trang cuối)
26. `{DS_KhuyenMai}`: Hiện tại ở phần "DỊCH VỤ KHUYẾN MÃI ĐƯỢC ÁP DỤNG" đang chừa một khoảng trống rất lớn. Cần một biến động để fill danh sách các dịch vụ/quà tặng cụ thể mà khách hàng này được nhận.
27. `{DieuKhoanBoSung}`: Ở phần "CÁC ĐIỀU KHOẢN BỔ SUNG KHÁC (NẾU CÓ)", nếu có các thỏa thuận riêng biệt ngoài hợp đồng in sẵn, cần một biến để chèn thêm các đoạn text ghi chú này.

---
**Hướng dẫn thực hiện tiếp theo:**
Bạn cần mở file `hop_dong.docx` lên, tìm đến tất cả các dấu chấm lửng (`...`) và thay thế bằng các biến `{...}` tương ứng như danh sách trên để engine `docxtemplater` có thể tự động binding dữ liệu.
