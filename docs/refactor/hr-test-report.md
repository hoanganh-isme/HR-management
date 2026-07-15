# Báo cáo kiểm thử HRM — Pha B

Ngày: 15-07-2026
Branch: `refactor/hr-cleanup`

## Kiểm tra nguồn dữ liệu

- Hai file schema/data đều đọc được UTF-16LE; không in secret, password, user, PII hoặc nội dung cấu hình kết nối.
- `scriptdataa.sql` có 7.232 dòng `INSERT` tĩnh trước 195 procedure; các dòng user/quyền/period được thống kê nhưng không đưa vào migration.
- Duplicate kiểm tra trên snapshot: `WA_Menu.MenuID` 0; `WA_API(list,func)` 2; `SY_FormatFields(FormName,FieldName)` 0.
- `WA_Menu`: 42 bật, 16 tắt. Các dòng tắt được phân loại `DISABLED_IN_DB`.

## Kiểm thử frontend

- `node --check` toàn bộ JavaScript trong `src`: PASS.
- `node scripts/build-frontend-bundle.mjs --check`: PASS, manifest có 49 CSS và 77 JS.
- `node --test tests/frontend-contracts.test.mjs`: 9/9 PASS, gồm registry 13 module, lookup router theo FormKey/FormName, action cũ và precedence metadata.
- `git diff --check`: PASS.
- Không còn phép gán `APP_MODULES[...]` trong `src/js/core/index.js`.
- Static scan source/bundle: không có `eval` hoặc `new Function`; bundle không chứa secret/PII được kiểm tra.
- Static scan runtime HR: không còn route/service QL Tiệc; các từ `restaurant` còn lại chỉ là icon lựa chọn trong màn quản trị menu.

## Kiểm thử SQL

- `sql/Deploy/HRM_Web_Install.sql` đã kiểm tra tĩnh: có `XACT_ABORT`, transaction, preflight, `@DryRun`, rollback, summary insert/update/skip/conflict/orphan/preserved và không có `DELETE/TRUNCATE/IDENTITY_INSERT` trên metadata.
- Chưa có `sqlcmd`/SQL Server runtime trong workspace, nên chưa thể biên dịch hoặc chạy migration hai lần. Đây là bước bắt buộc tiếp theo trên DB disposable.
- Không có thao tác DB production.

## Điều kiện hoàn tất còn lại

Chạy migration trên DB test với `@DryRun=1`, review conflict/duplicate, sau đó chạy `@DryRun=0` hai lần và kiểm tra rollback. Chỉ khi hai vòng này đạt mới xem xét đưa file release vào quy trình triển khai.
