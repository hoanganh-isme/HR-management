# Kế hoạch migration SQL HRM

## Trạng thái Pha B

Hai snapshot đã được cung cấp và parse thành công:

- `scriptschema.sql`: UTF-16LE, 2.431.546 bytes; 200 bảng duy nhất, 195 procedure, 139 view, 59 function, 1 trigger.
- `scriptdataa.sql`: UTF-16LE, 5.696.162 bytes; 7.232 dòng `INSERT` tĩnh, 58 `WA_Menu`, 290 `WA_API`, 909 `SY_FormatFields`, 2.648 `SY_FmtFldTbl`.

Đã tạo `sql/Deploy/HRM_Web_Install.sql`. File chưa được chạy trên production hoặc bất kỳ DB thật nào. Mặc định file chạy `@DryRun=1`; quyền chỉ được xét khi người triển khai chủ động đặt `@TargetUserGroupID`.

## Nguyên tắc cài đặt

- `SET XACT_ABORT ON`, transaction, preflight object/column checks và `TRY/CATCH` rollback.
- Không tạo/alter procedure trong file release. Các procedure web/core đã tồn tại được preflight theo `#ApiManifest`; thiếu object thì dry-run báo `MISSING_OBJECT` và chế độ apply dừng.
- Upsert theo business key: `WA_Menu.MenuID`, `SY_FrmLstTbl.FormID`, `WA_API(list,func)`, `SY_FormatFields(FormName,FieldName)`.
- Chỉ thêm row còn thiếu. Row hiện hữu khác giá trị được ghi `CONFLICT`, không tự ghi đè.
- `WA_Menu.isDisable=1` được ghi `DISABLED_IN_DB`, không bật lại.
- `SY_FmtFldTbl` chỉ đọc làm fallback; migration không ghi dictionary chung.
- Không `DELETE`, `TRUNCATE`, `IDENTITY_INSERT`, seed user/password/quyền/chi nhánh/PII.
- Báo cáo gồm cột insert/would-insert, update/would-update, skip, conflict, orphan và số row/field được bảo toàn; bảng chi tiết vẫn giữ `DUPLICATE_KEY` và `DISABLED_IN_DB`.
- Manifest `SY_FormatFields` có đúng 464 khóa duy nhất và khóa chính tạm `(FormName,FieldName)`, loại bỏ 330 row lặp của bản nháp trước.
- Quyền không lấy từ snapshot. Có thể đặt `@TargetUserGroupID`; migration khi đó chỉ thêm business key còn thiếu theo `UserGroupID+MenuID`, ID theo mẫu hiện hữu `UserGroupID_MenuID`, mặc định chỉ `IsRun=1` và giữ nguyên mọi quyền đã tồn tại.
- `#AppliedChanges` là rollback journal cho các row insert; bảng before/after counts chứng minh row ngoài allow-list không giảm. Vì migration ADD_ONLY nên không có row hiện hữu cần backup để update/delete.

## Phạm vi allow-list hiện tại

Manifest tập trung vào hồ sơ nhân viên, hợp đồng, bảo hiểm, công đoàn, chấm công, ca làm việc, nghỉ phép, payroll và các danh mục đang bật trong snapshot. Có 26 form contract, 44 API route và 464 field allow-list; static preflight đối với `scriptschema.sql` xác nhận đủ toàn bộ bảng, cột khóa và stored procedure đích. Các field `SY_FormatFields` được lấy nguyên giá trị đã parse; không tự đoán `FormatID`.

Các menu đang tắt như vị trí, tổ, công việc, bệnh viện, ngân hàng, quốc gia, tỉnh, dân tộc, học vấn, bằng cấp và nghề nghiệp chỉ xuất báo cáo `DISABLED_IN_DB`, không được cài/bật.

## Cách chạy trên DB test

1. Chạy nguyên file với `@DryRun=1`, lưu các bảng summary/detail được in ra.
2. Kiểm tra mọi `CONFLICT`, `DUPLICATE_KEY`, orphan và object thiếu.
3. Snapshot tạm các row sẽ thêm; chỉ sau khi review mới đặt `@DryRun=0`.
4. Chạy lại file lần hai; lần hai phải không tạo duplicate và không giảm số row ngoài allow-list.
5. Kiểm tra rollback bằng cách cố ý tạo conflict trên DB disposable; không chạy production.
