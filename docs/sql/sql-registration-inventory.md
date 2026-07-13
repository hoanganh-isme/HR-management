# Kiểm kê đăng ký form và dữ liệu cấu hình SQL

## Nguyên tắc đăng ký

`SY_FrmLstTbl` là nơi xác định form nào tồn tại, form dùng bảng nào và khóa chính
là gì. `API_TheoDoiTaiNguyenFormWeb` kiểm tra registry, `WA_API`, metadata field
và quyền menu mà không thay đổi dữ liệu.

Các dòng có cùng `FieldName` trong `SY_FormatFields` không đương nhiên là dữ
liệu trùng vì khóa hiệu lực là `(FormName, FieldName)`. Nhãn và định dạng dùng
chung như `DocumentID`, `PeriodID`, `BranchID`, `PersonID` nên đặt tại
`SY_FmtFldTbl` với `FormName` rỗng. Cờ readonly, required, vị trí và datasource
vẫn phải nằm trong `SY_FormatFields` vì chúng phụ thuộc từng form.

## Các bảng cấu hình quan trọng

| Bảng | Vai trò |
|---|---|
| `WA_Menu` | Menu, FormName và URL |
| `SY_FrmLstTbl` | Bảng dữ liệu, khóa chính và loại form |
| `WA_API` | Operation View, Save, Delete và operation nghiệp vụ |
| `SY_FormatFields` | Hiển thị, readonly, required, datasource của từng field |
| `SY_FmtFldTbl` | Từ điển nhãn và định dạng dùng chung |
| `WA_UserGroupPermisstion` | Quyền Run, Add, Update, Delete theo nhóm và menu |

`IsEdit` không thuộc các bảng trên. Đây là cờ tạm trong payload lúc lưu.

## Hồ sơ thao tác dùng chung

| Profile | Các dòng bắt buộc trong `WA_API` | Trường hợp sử dụng |
|---|---|---|
| `CRUD` | `View`, `Save`, `Delete` | Danh mục và bảng dữ liệu độc lập |
| `READONLY` | `View` | Tra cứu và báo cáo |
| `CUSTOM` | `View` và operation JSON | Duyệt, tính toán, khóa kỳ, master-detail |

`API_DangKyFormWeb` là điểm đăng ký duy nhất cho ba profile. Không thêm thủ công
từng dòng `WA_API` khi tạo menu mới. Với nghiệp vụ đơn giản, dùng generic
`API_LuuDong` và `API_XoaDong`; với nghiệp vụ có kiểm tra chéo hoặc cập nhật nhiều
bảng, khai SP riêng trong operation JSON để giữ transaction nghiệp vụ ở DB.

## Kiểm kê module

| Module | Form chính | Bảng / khóa chính | Operation chính | Ghi chú |
|---|---|---|---|---|
| Kinh phí công đoàn | `WA_KinhPhiCongDoanFrm` | `HR_KinhPhiCongDoanTbl/UserAutoID` | View, Save, Delete | Mẫu CRUD một bảng |
| Bảo hiểm | `WA_BaoHiemFrm` | `HR_BaoHiemTbl/DocumentID` | View, Save riêng, Delete | Master-detail và tính bảo hiểm |
| Bảng lương | `WA_PayrollFrm` | `HR_PayrollTbl/DocumentID` | View, Save, Delete, Process | Có bước xử lý kỳ lương |
| Xếp ca | `WA_CaLamViecFrm` | `HR_SapCaTbl/SapCaID` | View, Save, Delete | Có detail nhân viên |
| Hợp đồng | `WA_HopDongLaoDongFrm` | `HR_HopDongTbl/MaHopDong` | View, Save, Delete | Có phụ lục và đính kèm |
| Hồ sơ nhân viên | `WA_PersonFullFrm` | `HR_PersonTbl/PersonID` | View, Save, Delete | Nhiều tab chi tiết |
| Phép năm | `WA_QuanLyNghiPhepNamFrm` | `HR_PersonNghiPhepTbl/UserAutoID` | View, Save, Delete | CRUD quỹ phép; join nhân viên chỉ để hiển thị |
| Báo cáo | Các form `*Report` | Không ghi dữ liệu | View | Không đăng ký Save/Delete |
| Danh mục | Các form `*ListFrm` | Tùy bảng danh mục | View hoặc CRUD | Không seed lại dữ liệu nghiệp vụ |
| Người dùng/quyền | Các form hệ thống | Bảng bảo mật | SP chuyên dụng | Không dùng generic Save tùy tiện |

## Form phép năm

Form cũ từng đăng ký `WA_QuanLyNghiPhepNamFrm` trên `HR_PersonTbl/PersonID`,
nên bấm Thêm/Sửa mở ra các field hồ sơ nhân viên. Đăng ký mới dùng:

- `HR_PersonNghiPhepTbl/UserAutoID` để lưu.
- `API_QuanLyNghiPhepNam` để xem quỹ phép và JOIN tên, bộ phận, chi nhánh.
- `API_LuuDong` cho thêm/cập nhật.
- `API_XoaDong` cho xóa.
- `SY_FormatFields` để khóa riêng số ngày đã dùng, số ngày còn lại và audit.

## Script cũ không an toàn

Các file export `Insert_*` cũ thường xóa toàn bộ form, menu, permission hoặc API
trước khi tạo lại. Chúng được giữ để đối chiếu nhưng không nên chạy trong luồng
triển khai mới. Script canonical trong `sql/Modules` dùng transaction và giới
hạn thay đổi theo đúng `FormName`.

Không có bảng nghiệp vụ HR nào được xem là dữ liệu thuộc quyền sở hữu của script
đăng ký. Việc rollback metadata không được thực hiện bằng cách xóa dữ liệu HR.
