# Kết quả kiểm thử Phase 2

## Tóm tắt ngày 22/07/2026

Phần mã nguồn local đã đạt gate tự động cho Form Contract V2 động. Trạng thái triển khai DB/Web vẫn là **NOT READY** cho tới khi chạy lại các file SQL trên database đích, restart backend và smoke test bằng tài khoản thật.

| Hạng mục | Kết quả gần nhất | Ghi chú |
|---|---:|---|
| Phase 1 + Phase 2 | 47/47 pass | `node --test tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs` |
| Backend metadata | 32/32 pass | Gồm auth, resolver, route và cache bypass `refresh=1` |
| Full frontend + Phase 1/2 | 56/59 pass | 3 lỗi baseline cũ: DocumentExportPlugin, attachment business key, detail-tab primary key |
| Build bundle | Pass | 50 CSS + 92 JS; SHA-256 `9EA5F0F53D0C8F31D115A17C39433C6D55207EEBD09EFD4693C28A274BE8DB22` |
| Audit SQL/API | Pass | 176 SQL; 240 procedure/inventory; 231 JOIN; 17 star; 16 unsafe; 789 reference `SY_FormatFields`; 1 approved star |
| SQL Server compile/runtime | Chưa chạy lại | Cần deploy các procedure mới trên DB đích |
| Browser/mobile smoke | Chưa chạy lại | Cần hard reload bundle `v=16` và kiểm tra `PersonName` |

## Contract mới đã được kiểm tra tĩnh

- View V2 lấy TableName/PrimaryKey từ `SY_FrmLstTbl`, field từ `sys.columns`; không có danh sách field nghiệp vụ hard-code.
- Metadata lấy caption theo `SY_FmtFldTbl.CaptionVN`, rồi `CaptionEN`, cuối cùng fallback về FieldName.
- Save V2 nhận field writable từ chính `sys.columns`; không cần sửa procedure khi thêm field mới.
- Delete V2 tự chọn `SOFT` khi có `IsDeleted bit`, nếu không có thì chọn `HARD`; cả hai chạy trong transaction và kiểm tra đủ số ID.
- Frontend mở form/poll metadata với `refresh=1`; khi signature schema đổi, Grid tải lại cả schema lẫn data.
- Harness DB read-only không còn ép đúng bốn field; nó tự lấy table/PK/field và caption từ registry/schema.

## Gate DB/Web còn phải chạy

1. Cài lại View V2, Save V2, Delete V2 và Grid Schema V2 theo `11_KICH_HOAT_UNIFIED_FIELD_CONTRACT.md`.
2. Chạy `05_VERIFY_PILOT_V2.sql` và `01_VIEW_PARITY_READONLY.sql` bằng user test thật.
3. Xác nhận metadata có `PersonName`, caption tiếng Việt và `DeleteMode=HARD` hoặc `SOFT` đúng schema.
4. Restart `backend-app`, deploy `index.html` + bundle `v=16`, hard reload trình duyệt.
5. Test Add/Edit/Delete trong transaction hoặc bằng dữ liệu QA; với hard-delete phải thử cả trường hợp FK chặn để xác nhận rollback.

## Lệnh rerun local

```powershell
node --test tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs
Push-Location backend-app; npm.cmd test; Pop-Location
node scripts/audit-phase2-api-migration.mjs
node scripts/build-frontend-bundle.mjs --check
git diff --check
```
