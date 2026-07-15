# Triển khai và hoàn tác cấu hình SQL

## Mô hình triển khai

Chạy các tệp theo thứ tự trong `sql/install-order.txt` bằng SQLCMD từ thư mục
gốc của repository. Trước khi thay đổi cấu hình, chạy
`API_TheoDoiTaiNguyenFormWeb` trên database đích để kiểm tra tài nguyên hiện có.
Thủ tục tracking chỉ đọc dữ liệu.

Core CRUD phải được cài đủ `API_TruyVanDong`, `API_LuuDong` và `API_XoaDong`
trước `API_LuuMenu`. `API_DangKyFormWeb` sẽ từ chối đăng ký nếu một operation
tham chiếu tới SP chưa tồn tại.

Đối với tài liệu hợp đồng, cài ba SP `API_HopDongLaoDong_Attach_Metadata`,
`API_HopDongLaoDong_Attach_File`, `API_HopDongLaoDong_Attach_Save` trước khi
chạy `sql/Modules/Contract/register_ContractDocumentStorage.sql`. Script này
chưa được tự động chạy trên database thật.

Ví dụ kiểm tra form phép năm:

```sql
EXEC dbo.API_TheoDoiTaiNguyenFormWeb
    @FormName = 'WA_QuanLyNghiPhepNamFrm';
```

Các result set trả về gồm:

1. Bảng, khóa chính, SP View, capability, `OperationProfile`, SP bị thiếu và số
   field có thể nhập.
2. Tên field dùng chung giữa nhiều form.
3. Dữ liệu cấu hình bị trùng.
4. Các operation chính xác trong `WA_API`.
5. `ShowInAdd`, `IsReadOnlyAdd`, `ShowInEdit`, `IsReadOnlyEdit` của từng field.
6. Quyền `IsRun`, `IsAdd`, `IsUpdate`, `IsDelete` của từng nhóm trên menu.
7. Danh sách cột vật lý tên `IsEdit` nếu database thật sự có cột này.

`SY_FrmLstTbl` là sổ đăng ký tài nguyên form. `SY_FormatFields` giữ hành vi riêng
của từng field trong từng form. Nhãn và định dạng dùng chung có thể đặt tại
`SY_FmtFldTbl` với `FormName` rỗng.

`API_LayCacTruongGiaoDien` suy ra `canView`, `canAdd`, `canEdit`, `canDelete`
từ đúng các dòng `WA_API` của form. Frontend không được tự giả định form nào
cũng có đủ CRUD.

## Ý nghĩa của IsEdit

`IsEdit` của form động không được lưu trong bảng cấu hình. Frontend tạo giá trị
này trong JSON khi bấm Lưu:

- `IsEdit = 0`: thêm mới bằng INSERT.
- `IsEdit = 1`: cập nhật bằng UPDATE.

`API_LuuDong` đọc `$.IsEdit` để chọn nhánh xử lý rồi loại key này khỏi danh sách
cột được ghi xuống bảng. Trạng thái khóa field nằm ở `SY_FormatFields`; quyền
thao tác nằm ở `WA_UserGroupPermisstion`; operation nằm ở `WA_API`.

## Luồng tạo menu

Màn hình quản trị menu hỗ trợ ba nguồn form:

1. **Form có sẵn**: chỉ lưu `WA_Menu` và dùng lại đăng ký hiện tại. Hệ thống từ
   chối nếu thiếu bảng, khóa chính, SP View hoặc metadata field.
2. **CRUD từ bảng**: dùng `API_TruyVanDong` để xem dữ liệu và đăng ký
   `API_LuuDong`, `API_XoaDong` cho Save/Delete.
3. **SP nghiệp vụ**: dùng SP được nhập làm View; bảng và khóa chính vẫn xác định
   nơi Save/Delete ghi dữ liệu.

Khi đăng ký form mới, phải chọn một hồ sơ thao tác:

- `CRUD`: hệ thống đồng bộ chính xác `View`, `Save`, `Delete`. Save mặc định dùng
  `API_LuuDong`, Delete mặc định dùng `API_XoaDong`; JSON nghiệp vụ có thể thay
  SP mặc định nhưng vẫn phải dùng tên thao tác `Save` và `Delete` để form động
  nhận biết.
- `READONLY`: chỉ giữ `View`; các thao tác ghi cũ của form bị loại khỏi `WA_API`.
- `CUSTOM`: luôn có `View` và lấy các thao tác còn lại từ JSON. Dùng cho duyệt,
  tính lương, khóa kỳ, cấp phép hoặc luồng có SP Save/Delete riêng.

Profile được xử lý tại `API_DangKyFormWeb`, vì vậy màn hình menu và các script
module cùng kế thừa một quy tắc. Backend kiểm tra SP của từng operation tồn tại
và kiểm tra profile CRUD có đủ `View/Save/Delete` trước khi commit.

`API_LuuMenu` gọi `API_DangKyFormWeb` trong cùng transaction. Nếu đăng ký form
không hợp lệ thì menu cũng được rollback. Quyền nhóm người dùng là bước riêng,
không tự cấp cùng lúc khi tạo menu.

Nếu một form cũ chỉ có `View`, chạy lại script đăng ký canonical của module với
`@OperationProfile = 'CRUD'`. Với phép năm, chạy
`sql/Modules/Leave/register_Leave.sql`; script sẽ sửa chính xác các dòng
`WA_API` của form mà không thay đổi dữ liệu `HR_PersonNghiPhepTbl`.

Sau khi engine mới được triển khai, form CRUD một bảng hoặc form chỉ đọc không
cần tạo thêm file JavaScript. Chỉ các luồng đặc biệt như wizard, master-detail,
tính toán nghiệp vụ hoặc đính kèm mới cần module source riêng.

## Form quản lý phép năm

`WA_QuanLyNghiPhepNamFrm` được đăng ký bởi
`sql/Modules/Leave/register_Leave.sql`:

- Bảng lưu: `HR_PersonNghiPhepTbl`.
- Khóa chính: `UserAutoID`.
- View: `API_QuanLyNghiPhepNam`.
- Save: `API_LuuDong`.
- Delete: `API_XoaDong`.

`PersonID`, `Nam`, số ngày phép, phép thâm niên, phép tồn, phép Tết, phép ốm và
ghi chú có thể nhập theo metadata. `SoNgayDaSuDung`, `SoNgayConLai` và các field
audit vẫn khóa vì là dữ liệu tính toán hoặc dữ liệu hệ thống.

## Phạm vi DELETE

`API_DangKyFormWeb` chỉ thay các dòng `WA_API` có `list` bằng đúng `FormName`
khi `@ReplaceOperations = 1`. Đồng bộ field không tự xóa mặc định.

Riêng script đăng ký phép năm xóa các field metadata cũ không còn thuộc form,
nhưng chỉ trong phạm vi `FormName = 'WA_QuanLyNghiPhepNamFrm'`. Script không xóa
dữ liệu trong `HR_PersonNghiPhepTbl`.

Các script export `Insert_*` cũ có lệnh xóa rộng được giữ để tham khảo tương
thích nhưng không nằm trong thứ tự triển khai mới.

## Kiểm tra lặp lại

`sql/verify-idempotency.sql` chạy seed và các script đăng ký hai lần. Số dòng
form, API và field sau lần hai phải bằng lần một. Bài kiểm thử integration tại
`tests/sql/test-menu-form-registration.sql` kiểm tra menu thuần, CRUD từ bảng,
form có sẵn và chuyển từ CRUD sang chỉ đọc.
Test cũng kiểm tra ánh xạ SP chuẩn và profile nghiệp vụ riêng.

## Hoàn tác

1. Dừng triển khai ngay khi một script lỗi; transaction sẽ rollback script đó.
2. Chạy `sql/rollback-registration-refactor.sql` nếu cần bỏ các unique index do
   bước kiểm tra tạo ra.
3. Triển khai lại phiên bản trước của các core procedure nếu cần rollback code.
4. Không xóa đăng ký để hoàn tác. Khôi phục giá trị metadata từ backup hoặc bản
   snapshot đã được duyệt.

## Rủi ro cần theo dõi

- SP dùng bảng tạm có thể khiến SQL Server không mô tả được result set; khi đó
  hệ thống phải fallback về bảng đã đăng ký.
- Dữ liệu trùng `(list, func)`, `(FormName, FieldName)` hoặc `FormID` phải được
  xử lý trước khi tạo unique index.
- Sau khi đổi source frontend cần bảo đảm trình duyệt nạp đúng phiên bản, tránh
  cache bundle cũ.
