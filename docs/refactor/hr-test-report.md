# Báo cáo kiểm thử HRM — Pha B

Ngày: 16-07-2026
Branch: `refactor/hr-cleanup`

## Kiểm tra nguồn dữ liệu

- Hai file schema/data đều đọc được UTF-16LE; không in secret, password, user, PII hoặc nội dung cấu hình kết nối.
- `scriptdataa.sql` có 7.232 dòng `INSERT` tĩnh trước 195 procedure; các dòng user/quyền/period được thống kê nhưng không đưa vào migration.
- Duplicate kiểm tra trên snapshot: `WA_Menu.MenuID` 0; `WA_API(list,func)` 2; `SY_FormatFields(FormName,FieldName)` 0.
- `WA_Menu`: 42 bật, 16 tắt. Các dòng tắt được phân loại `DISABLED_IN_DB`.

## Kiểm thử frontend

- `node --check` toàn bộ 87 file JavaScript trong `src`: PASS.
- `node scripts/build-frontend-bundle.mjs --check`: PASS, manifest có 49 CSS và 77 JS.
- `node --test tests/frontend-contracts.test.mjs`: 12/12 PASS, gồm 13 module cũ + slice đơn nghỉ phép, lookup router theo FormKey/FormName, action cũ, precedence metadata, business key của detail/attachment và contract migration add-only.
- `git diff --check`: PASS.
- Không còn phép gán `APP_MODULES[...]` trong `src/js/core/index.js`.
- Static scan source/bundle: không có `eval` hoặc `new Function`; bundle không chứa secret/PII được kiểm tra.
- Static scan runtime HR: không còn route/service QL Tiệc; các từ `restaurant` còn lại chỉ là icon lựa chọn trong màn quản trị menu.

## Kiểm thử SQL

- `sql/Deploy/HRM_Web_Install.sql` đã kiểm tra tĩnh: có `XACT_ABORT`, transaction, preflight, `@DryRun`, rollback journal, summary before/after + insert/skip/conflict/orphan/preserved và không có `DELETE/TRUNCATE/IDENTITY_INSERT` trên metadata.
- Manifest field có 464/464 khóa duy nhất; không còn 330 khóa bị lặp. Static preflight trên `scriptschema.sql` xác nhận 26/26 form table+primary key và 44/44 API route có stored procedure đích.
- Dry-run không còn `CREATE OR ALTER`; do đó `@DryRun=1` không thay đổi schema. Apply bị chặn khi có `CONFLICT`, `DUPLICATE_KEY`, `MISSING_OBJECT` hoặc `MISSING_COLUMN`.
- Chưa có `sqlcmd`/SQL Server runtime; Docker Desktop service đang dừng, nên chưa thể biên dịch hoặc chạy migration hai lần. Đây vẫn là bước bắt buộc trên DB disposable.
- Không có thao tác DB production.

## Điều kiện hoàn tất còn lại

Chạy migration trên DB test với `@DryRun=1`, review conflict/duplicate, sau đó chạy `@DryRun=0` hai lần và kiểm tra rollback. Chỉ khi hai vòng này đạt mới xem xét đưa file release vào quy trình triển khai.
