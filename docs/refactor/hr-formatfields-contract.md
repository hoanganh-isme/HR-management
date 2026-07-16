# Hợp đồng `SY_FormatFields` của HRM

## Thứ tự resolve bắt buộc

Với cặp `(FormName, FieldName)`, frontend phải chọn theo thứ tự:

1. Override riêng trong `SY_FormatFields`.
2. Dictionary có `FormName` cụ thể trong `SY_FmtFldTbl`.
3. Dictionary dùng chung trong `SY_FmtFldTbl` khi `FormName` rỗng/null.
4. Fallback cục bộ an toàn, chỉ log cảnh báo và tuyệt đối không ghi ngược DB.

`SY_FmtFldTbl` là dictionary legacy. Nó không được ghi đè row riêng của `SY_FormatFields`. `FormatID`, vị trí, thứ tự, filter, caption và cờ read-only phải lấy từ contract đã xác nhận, không suy đoán từ SQL type.

## Bằng chứng schema/snapshot

- `SY_FormatFields` có 909 row tĩnh, khóa nghiệp vụ kiểm tra được `FormName+FieldName`, không có duplicate trong snapshot.
- `SY_FmtFldTbl` có 2.648 row, chỉ có khóa identity `AutoID`; đây là dictionary fallback, không phải contract riêng form.
- `API_LayCacTruongGiaoDien` trả `FormatID`, `FormPosition`, `OrderNo`, `DataSource`, `ValidateRule`, `DependsOn`, `VisibleRule`, `ShowInAdd`, `ShowInEdit`, `IsReadOnlyAdd`, `IsReadOnlyEdit`, `ShowInFilter` từ `SY_FormatFields`.
- `API_DongBoTruongGiaoDien` trong schema có các tham số `@Overrides` và `@DeleteMissingFields`; logic cũ vẫn có nhánh xoá field không còn trong result và tự suy đoán `FormatID`. Không dùng procedure này làm bước cài mặc định.
- `API_DangKyFormWeb` tồn tại trong snapshot, nhưng gọi đồng bộ field và có thể thay routing. Migration release không gọi procedure này và không tạo wrapper DDL mới; toàn bộ allow-list nằm trong transaction của file cài đặt.

## Thay đổi frontend

`src/js/modules/hr/HRMetadataAdapter.js` chỉ đọc response. Adapter nhận được cả response hiện tại (`list/records`) và response mở rộng (`specificFields`, `formDictionary`, `globalDictionary`), rồi hợp nhất theo thứ tự trên. Khi có conflict, field riêng đã chọn thắng; không có lệnh gọi API xoá/sửa metadata.

## Chế độ ghi SQL an toàn

- `ADD_ONLY`: chỉ thêm `(FormName, FieldName)` còn thiếu.
- `RECONCILE_REPORT`: chỉ báo cáo thiếu, conflict, duplicate và orphan.
- `EXPLICIT_UPDATE`: chỉ dùng cho allow-list đã review, có before/after và rollback.

`sql/Deploy/HRM_Web_Install.sql` mặc định `@DryRun=1`. Manifest có khóa chính tạm `(FormName, FieldName)` và 464 khóa duy nhất; migration không ghi `SY_FmtFldTbl`, không `DELETE`, không tạo/alter object trong dry-run và không cập nhật field đang có giá trị khác. Conflict `FormatID` hoặc layout được giữ nguyên, xuất trong báo cáo và chặn chế độ apply.
