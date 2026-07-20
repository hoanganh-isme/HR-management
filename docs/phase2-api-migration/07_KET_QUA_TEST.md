# Kết quả kiểm thử Phase 2

## Tóm tắt

Kết luận hiện tại: **NOT READY** để bật runtime hoặc đổi `WA_API` trên môi trường thật. Các số liệu dưới đây đã được chạy lại sau các chỉnh sửa cuối ngày 20/07/2026.

| Hạng mục | Kết quả gần nhất | Ghi chú |
|---|---:|---|
| Test Phase 1 + Phase 2 | 39/39 pass | Chạy bằng `node --test tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs`. |
| Bộ frontend contract + Phase 1 + Phase 2 | 48 pass / 51 tổng | 3 lỗi contract baseline có sẵn, không do Phase 2: DocumentExportPlugin, attachment business key và detail-tab primary key. |
| Backend app | 27/27 pass | `backend-app`, chạy `npm.cmd test`. |
| `node --check` JS đã sửa | Pass | Đã kiểm tra source, script audit/verifier, registry và bundle. |
| Build frontend bundle | Pass, xác định | 50 CSS + 92 JS; hai lần build cho cùng SHA-256 `CF6B735657B1837FC996DBE97E9304CCBED294E763B2E21D8047DB7BC440E615`. |
| Audit SQL/API | 176 file SQL; 240 procedure definition/inventory row; 230 JOIN row; 18 star row; 17 unsafe star; 785 reference `SY_FormatFields`; 1 star pilot được duyệt | Số liệu từ `scripts/audit-phase2-api-migration.mjs`. |
| SQL Server compile/runtime | Chưa chạy | Workspace không có SQL Server/harness DB; các gate runtime vẫn để pending. |
| Browser/mobile smoke | Chưa chạy | Cần staging có dữ liệu ẩn danh và quyền thật. |

## Kiểm tra tĩnh bắt buộc

- `sql/Phase2ApiMigration` chỉ có `SELECT T.*` của pilot kèm marker `MAIN_TABLE_STAR_APPROVED`; không có `DROP`, `TRUNCATE`, `ALTER TABLE` hay xóa `SY_FormatFields`.
- 17 `UNSAFE_STAR` còn lại thuộc API legacy/report/attachment/business action và chưa được chuyển Phase 2.
- Hardening cuối đã đồng nhất deny-list metadata/result-set với các kiểu kỹ thuật `binary/varbinary/image/timestamp/rowversion/xml/text/ntext/sql_variant/geography/geometry/hierarchyid`; lỗi DMF được phát riêng bằng `RESULTSET_METADATA_ERROR`, và fallback vẫn là diagnostic chặn.
- View/Save/Delete V2 đã fail-closed khi non-admin chưa được gán branch, kiểm tra `BranchID` trong `JsonData` không vượt context, và Save/Delete yêu cầu đồng thời `IsRun` với quyền action.
- Metadata shadow dùng allow-list `PHASE2_SHADOW_VIEW_OVERRIDE` để compare View V2 nhưng phát `SHADOW_VIEW_NOT_REGISTERED`, được backend/frontend/verifier coi là diagnostic chặn activation.
- `WA_API` chưa đổi; frontend registry vẫn ở `SHADOW_PREPARED`, không active.

## Khoảng trống contract còn chặn Gate View

- Legacy `API_TruyVanDong` cho phép filter/sort mọi cột vật lý; View V2 giữ chắc contract bốn cột `Bac/Tu/Den/ThueSuat`. Field mới có thể xuất hiện trong Grid metadata nhưng được đánh dấu display-only, không cho header sort/filter cho tới khi có contract riêng; API cũng từ chối sort ngoài allow-list thay vì âm thầm đổi thứ tự.
- Keyword legacy chỉ tìm trên cột text, trong khi V2 đang chuyển bốn cột thuế sang text để tìm; phải đo trên DB thật trước khi đăng ký.
- Gateway vẫn cần chứng minh token/phiên đăng nhập ràng buộc đúng `UserName`; giá trị actor từ client chưa đủ làm bằng chứng.

## Ba lỗi baseline cần tách khỏi Phase 2

Các test frontend cũ đang kỳ vọng literal tương thích trong `DocumentExportPlugin`, upload attachment và detail-tab key. Chúng cần được xử lý trong một task riêng hoặc cập nhật contract có chủ đích; không dùng chúng làm lý do bật V2.

## Lệnh rerun trước khi duyệt

```powershell
node --test tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs
node --test tests/frontend-contracts.test.mjs tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs
Push-Location backend-app; npm.cmd test; Pop-Location
node --check src/js/services/FieldSyncService.js
node --check src/js/core/DynamicFormEngine.js
node --check src/js/utils/FormBuilderPlugin.js
node scripts/audit-phase2-api-migration.mjs
node scripts/build-frontend-bundle.mjs
git diff --check
```

Sau đó chạy riêng các script SQL theo hướng dẫn `08_HUONG_DAN_DB_TEST.md`; chỉ khi mọi gate đạt mới xem xét đổi cờ đăng ký.
