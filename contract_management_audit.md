# BÁO CÁO KIỂM TOÁN VÀ KIẾN TRÚC (ENTERPRISE AUDIT) QUY TRÌNH HỒ SƠ TÀI LIỆU TIỆC CƯỚI

Báo cáo này tổng hợp chi tiết hiện trạng hoạt động, các lỗ hổng hệ thống và giải pháp tái cấu trúc phân hệ Quản lý Hồ sơ Tiệc Cưới theo tiêu chuẩn doanh nghiệp (Enterprise-grade).

---

## 1. THỰC TRẠNG HOẠT ĐỘNG HIỆN TẠI

Hệ thống hiện tại xử lý việc xuất chứng từ theo cách **hoạt động bề mặt**, bỏ qua các ràng buộc logic sâu bên dưới Database:

1. **Khóa riêng biệt cho tài liệu (Primary Key của File):** Dùng **Timestamp** (VD: `HD001_17154215123.doc`) làm khóa nhận diện trên ổ cứng, không có liên kết Database.
2. **Theo dõi tài liệu (Log Tracking):** Bảng `Tiec_Documents` bị bỏ hoang. Toàn bộ file sinh ra bị ném lộn xộn vào chung thư mục `backend-app/uploads/` mà không lưu vết người tạo.
3. **Cơ chế Khóa chứng từ (Lock):** Không có State Machine (Trạng thái). Phiếu cọc đã thu tiền, Hợp đồng đã ký đều vẫn luôn mở nút `Sửa`.
4. **Công nghệ sinh tài liệu (Template Engine):** Đang dùng HTML cũ kỹ, dễ vỡ bảng biểu, người dùng không thể tự mở file HTML lên để thiết kế.

---

## 2. RỦI RO & LỖ HỔNG HỆ THỐNG NGHIÊM TRỌNG

> [!WARNING] RÒ RỈ DỮ LIỆU & BẢO MẬT
> Thư mục `/uploads` Public. Mọi người đều tải được hợp đồng nếu có link. Nhân sự có thể tự ý mở file Word sửa tiền sau khi xuất, gây vênh số liệu Kế toán.

> [!CAUTION] THIẾU LOG XÓA (KHÔNG THỂ QUY TRÁCH NHIỆM)
> Dù triết lý của Ban Giám Đốc là "Lỡ tay xóa thì tự chịu trách nhiệm", nhưng API hiện tại khi xóa là **xóa sạch hoàn toàn** (dữ liệu DB biến mất, file bị hủy) mà KHÔNG LƯU LẠI VẾT. Nếu xảy ra tranh chấp hoặc mất hợp đồng, sếp không có cơ sở dữ liệu nào để biết **Ai là người bấm xóa** để bắt đền.

> [!IMPORTANT] THIẾU TRUY VẾT & QUẢN LÝ PHIÊN BẢN (VERSIONING)
> Hệ thống sinh ra nhiều bản nháp nhưng không đánh số Version, không lưu người tạo (GeneratedBy), không băm dữ liệu (Hash). Không thể làm chứng pháp lý nếu có tranh chấp "Ai đã sửa file này?".

---

## 3. KẾ HOẠCH TÁI CẤU TRÚC KIẾN TRÚC TOÀN DIỆN (ENTERPRISE ARCHITECTURE)

Để chuẩn hóa toàn bộ quy trình, đảm bảo tính toàn vẹn và chịu trách nhiệm giải trình (Auditable), hệ thống sẽ được nâng cấp theo 4 mũi nhọn sau:

### Giai đoạn 1: Nâng Cấp Sổ Lưu Trữ & Tách Biệt Cơ Chế Xóa (Soft Delete vs Hard Delete)
Biến bảng `Tiec_Documents` thành một **Sổ Lưu Trữ Trung Tâm** thực thụ. Đồng thời, giải quyết triệt để triết lý *"Lỡ xóa thì tự chịu"* của sếp nhưng vẫn bảo vệ được an toàn pháp lý công ty:

- **Với File Vật Lý (Word/Excel):** Thực hiện **Hard Delete (Xóa thật)**. File sẽ bị hủy vĩnh viễn khỏi Server, không có Thùng rác khôi phục.
- **Với Sổ Lưu Trữ (`Tiec_Documents`):** Áp dụng cơ chế **"Bia mộ"**. Hệ thống cập nhật `Status = DELETED`, ghi nhận `DeletedBy` (Người xóa) và `DeletedAt` (Giờ xóa). Sếp dựa vào bảng này để lôi đầu thủ phạm ra đền.
- **Với Dữ Liệu Nghiệp Vụ Gốc (`tbmk_Hopdong`, `tbPhieuthu`):** Tuyệt đối **CẤM lệnh xóa thật (DELETE FROM)**. Kế toán/Pháp lý công ty bắt buộc phải giữ lại chứng cứ nếu khách quậy lại sau 6 tháng. Do đó, DB chỉ áp dụng **Soft Delete (Cập nhật `IsDeleted = 1`)**. Dữ liệu sẽ ẩn khỏi màn hình nhân viên, nhưng Sếp và DB Admin vẫn có thể xem lại ruột hợp đồng đó từng ghi gì.
- **Các tính năng kèm theo:** Thêm `VersionNo` (Quản lý phiên bản), `FileHash` (Băm nội dung chống sửa file bên ngoài), `GeneratedBy` (Lưu vết người xuất).

### Giai đoạn 2: Workflow Trạng Thái (State Machine) thay vì "Khóa Cứng"
Từ bỏ tư duy "IsLocked = 1" cứng nhắc. Thay vào đó, áp dụng cột **`Status` (VARCHAR/INT)** cho `tbmk_Hopdong` để điều hướng luồng nghiệp vụ:
- `DRAFT` (Nháp): Sale tự do sửa chữa.
- `SUBMITTED` (Trình ký): Chờ duyệt.
- `SIGNED` (Đã ký): **Khóa dữ liệu gốc**.
- Từ trạng thái `SIGNED`, Sale không được sửa trực tiếp nhưng hệ thống **mở luồng tạo Phụ Lục (`tbmk_Thaydoi`)**. Dữ liệu nghiệp vụ cuối cùng = Hợp đồng gốc + Các Phụ lục.
- `COMPLETED` (Quyết toán): Khóa toàn bộ hồ sơ.

### Giai đoạn 3: Thay Máu Công Nghệ Lõi Sinh Tài Liệu (Template Engine)
- **Tách biệt Template và Document Instance:** Template `.docx` lưu ở `samples/`, Document đã xuất lưu ở `uploads/`. Sửa Template hôm nay không làm biến đổi File hợp đồng đã ký tháng trước.
- **Tích hợp `docxtemplater`:** Nạp dữ liệu thẳng vào Mẫu Word `.docx`. Xử lý hoàn hảo các Bảng biểu Kế toán đa cột (nhân bản tự động số lượng dòng, giữ nguyên cấu trúc gộp ô, form thiết kế chuẩn).
- **Tự Chỉnh Sửa Mẫu:** Cho phép Admin dùng OnlyOffice thiết kế trực tiếp file Template chuẩn trên Web.

### Giai đoạn 4: Gia Cố Bảo Mật & Hệ Sinh Thái Giao Diện
- Viết Middleware chặn quyền tải tại thư mục `/uploads` (Buộc có Token).
- Giao diện "Hồ Sơ Điện Tử": Mở chi tiết 1 Khách Hàng, query `Tiec_Documents` gom toàn bộ Phiếu Cọc, Hợp Đồng, Phụ Lục vào chung 1 lưới lịch sử rõ ràng, có phân loại Version và làm nổi bật các file đã bị xóa (hiển thị ai xóa).
