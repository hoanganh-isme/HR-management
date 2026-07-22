# Danh sách file test Phase 2 và kết quả kỳ vọng

## 0. Phạm vi

Pilot duy nhất:

    Web form : WA_BangThueTNCNFrm
    ERP form: HR_BangThueTNCNFrm
    Table   : HR_BangThueTNCNTbl
    PK      : Bac

Chỉ chạy trên staging/QA có backup và dữ liệu ẩn danh. Không chạy cờ đăng ký bật trên production. Trước bước kích hoạt, `WA_API` vẫn có thể đang trỏ legacy; form unified sẽ fail-closed chứ không quay về `SY_FormatFields`.

Tài liệu kích hoạt chuẩn của kiến trúc mới: `docs/phase2-api-migration/11_KICH_HOAT_UNIFIED_FIELD_CONTRACT.md`.

Ký hiệu: RUN = được chạy; CHECK = chỉ đọc; GATE = chỉ chạy sau khi tất cả test trước đạt; STOP = dừng khi gặp lỗi.

## 1. Test local (không cần SQL Server)

Từ thư mục repository:

~~~powershell
Set-Location 'D:\chuyenfile\clonecode\HR-Management'

cmd.exe /d /c node.exe --test tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs

Push-Location backend-app
npm.cmd test
Pop-Location

node.exe scripts/build-frontend-bundle.mjs --check
node.exe scripts/audit-phase2-api-migration.mjs
~~~

Các file được chạy:

| File | Kỳ vọng |
|---|---|
| tests/field-sync-phase1.test.mjs | Phase 1 contract pass |
| tests/phase2-api-migration.test.mjs | View/Save/Delete V2, shadow, security pass |
| backend-app/src/field-sync/field-sync.test.js | HTTP/auth/resolver/lookup pass |
| scripts/build-frontend-bundle.mjs | Manifest hợp lệ; 50 CSS + 92 JS |
| scripts/audit-phase2-api-migration.mjs | Tạo inventory/JOIN/star/SY_FormatFields report |

Kết quả chuẩn hiện tại:

    Phase 1 + Phase 2: 47/47 pass
    Backend:           32/32 pass
    Audit:             176 SQL; 240 procedure/inventory; 231 JOIN
                       17 star; 16 unsafe; 789 SY_FormatFields; 1 approved star

Full regression tùy chọn:

~~~powershell
cmd.exe /d /c node.exe --test tests/frontend-contracts.test.mjs tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs
~~~

Kết quả hiện tại là 56/59; ba lỗi baseline cũ thuộc DocumentExportPlugin, attachment business key và detail-tab primary key, không dùng để bật Phase 2.

## 2. Cài nền Phase 1 trên SQL Server staging

Chạy bằng SSMS hoặc sqlcmd với cờ fail-on-error:

| Thứ tự | File | Kỳ vọng |
|---:|---|---|
| 2.1 | sql/FieldSyncPhase1/00_KIEM_TRA_NGUON.sql | Xác nhận object/nguồn; không sửa dữ liệu |
| 2.2 | sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql | Tạo/cập nhật Grid Schema V2 |
| 2.3 | sql/FieldSyncPhase1/02_API_WEB_LOOKUP_SCHEMA_V2.sql | Tạo/cập nhật Lookup Schema V2 |
| 2.4 | sql/FieldSyncPhase1/03_API_WEB_GRID_FIELD_COMPARE_V2.sql | Tạo/cập nhật Compare V2 |
| 2.5 | sql/FieldSyncPhase1/04_DANG_KY_API_READONLY.sql | Idempotent: thêm route View thiếu hoặc repair exact Para của ba metadata procedure; fail-closed khi duplicate/trỏ sai |
| 2.6 | sql/FieldSyncPhase1/05_KIEM_TRA_SAU_CAI_DAT.sql | Ba procedure và route View có exact Para, RegistrationCount = 1; kiểm tra trigger không ghi đè route curated |

Sau khi sửa registration, chạy thêm `sql/Phase2RuntimeTests/02_GATEWAY_METADATA_SMOKE_READONLY.sql`. Đây là probe qua đúng `API_Gateway_Router` mà web sử dụng; `error_number = 201` là Para thiếu tham số, còn `error_number = 229` là thiếu quyền `EXECUTE` trực tiếp trên procedure đích.

STOP nếu thiếu menu/quyền/branch, procedure fallback hoặc diagnostic error.

## 3. Cài Phase 2 pilot

| Thứ tự | File | Loại | Kỳ vọng |
|---:|---|---|---|
| 3.1 | sql/Phase2ApiMigration/00_CAPTURE_VIEW_CONTRACT.sql | CHECK | Lưu parameter, result-set, type/nullability, PK/duplicate và row count old/candidate |
| 3.2 | sql/Phase2ApiMigration/01_CREATE_VIEW_V2_PILOT.sql | RUN | Tạo API_BangThueTNCN_V2; không đổi WA_API |
| 3.3 | sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql | RUN lại | Tạo Form Contract V2 từ bảng chính và các bảng SY_* |
| 3.4 | sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql | RUN | Tạo API_LuuDong_V2; không DDL runtime, không đọc SY_FormatFields |
| 3.5 | sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql | RUN | Tạo API_XoaDong_V2; tự chọn soft-delete nếu có IsDeleted bit, nếu không thì hard-delete |
| 3.6 | sql/Phase2ApiMigration/05_VERIFY_PILOT_V2.sql | CHECK | Static gate pass; activation vẫn pending |

Khi WA_API.View còn API_TruyVanDong, response metadata phải có:

    SHADOW_VIEW_NOT_REGISTERED

Đây là kết quả đúng của shadow. Các diagnostic sau đều là STOP:

    RESULTSET_METADATA_ERROR
    RESULTSET_UNSAFE_FIELD
    RESULTSET_FALLBACK_TO_TABLE
    NO_PRIMARY_KEY
    DUPLICATE_FIELD

## 4. Ma trận kiểm thử DB

### 4.1 View

`sql/Phase2RuntimeTests/01_VIEW_PARITY_READONLY.sql` là smoke test chỉ đọc của contract động: tự lấy table/PK/field, chạy metadata và View V2, rồi xác nhận row count/WA_API không bị thay đổi. `05_VERIFY_PILOT_V2.sql` kiểm tra contract tĩnh, còn các ca quyền/branch phải smoke test bằng tài khoản web thật.

| Ca kiểm thử | Kỳ vọng |
|---|---|
| Contract vật lý/Web | Mọi cột an toàn có cùng FieldName/type/nullability; caption ưu tiên SY_FmtFldTbl.CaptionVN |
| PK | PrimaryKey đăng ký không NULL, không duplicate |
| Keyword/filter | Mọi field vật lý an toàn trong contract có thể keyword/filter; audit/server-managed bị chặn |
| Sort | Mọi field vật lý an toàn trong contract có thể ASC/DESC; field ngoài contract bị từ chối |
| Branch | Non-admin thiếu branch hoặc branch ngoài context bị từ chối |
| Permission | IsRun/quyền group-user không đạt thì không trả dữ liệu |
| Safety | Không trả blob/password/token/kiểu kỹ thuật |
| Cột mới | Thêm cột vật lý an toàn và cấu hình cùng FieldName trong SY_FmtFldTbl; metadata/Web tự có cột, caption Việt, sort/filter/Add/Edit mà không sửa code theo tên field |

### 4.2 Save V2

Test trong transaction và rollback sau mỗi ca:

    insert hợp lệ
    insert thiếu required/unknown JSON field
    edit thiếu PK hoặc đổi PK
    identity/computed/blob/audit field từ client
    SQL injection payload
    permission Add/Update và IsRun=0
    branch hoặc UserName/BranchID trong JSON lệch context
    rollback khi DML lỗi

Kỳ vọng response có code/msg/primaryKey/primaryValue/rowsAffected; audit do server gán.

### 4.3 Delete V2

Test:

    permission/branch denied
    soft-delete hợp lệ
    một/nhiều ID, ID sai kiểu, ID không tồn tại/đã xóa
    hard-delete thử nghiệm
    FK dependency và rollback

Kỳ vọng: `DeleteMode=SOFT` khi có `IsDeleted bit`; `DeleteMode=HARD` khi không có `IsDeleted`; nếu `IsDeleted` sai kiểu thì chặn. Soft/hard đều phải đúng permission, đúng toàn bộ số ID và rollback khi có lỗi/FK conflict.

Chi tiết các ca nằm trong docs/phase2-api-migration/08_HUONG_DAN_DB_TEST.md.

## 5. Backend và verifier staging

Tạo backend-app/.env (không commit), tối thiểu có SQL_API_BASE trỏ ERP gateway, rồi chạy:

~~~powershell
Push-Location 'D:\chuyenfile\clonecode\HR-Management\backend-app'
npm.cmd start
Pop-Location
~~~

Thiết lập secret bằng environment variable:

~~~powershell
$env:FIELD_SYNC_METADATA_BASE_URL = 'https://<staging-host>/api/metadata'
$env:FIELD_SYNC_BEARER_TOKEN = '<bearer-token>'
$env:FIELD_SYNC_USERNAME = '<test-user>'
$env:FIELD_SYNC_BRANCH_ID = 'CN01'
$env:FIELD_SYNC_FORM = 'WA_BangThueTNCNFrm'
$env:FIELD_SYNC_ERP_FORM = 'HR_BangThueTNCNFrm'

node.exe scripts/verify-field-sync-staging.mjs

Remove-Item Env:FIELD_SYNC_BEARER_TOKEN -ErrorAction SilentlyContinue
~~~

Verifier PASS chỉ khi View gate đã đạt. Trước khi đổi WA_API.View, verifier activation có thể FAIL với SHADOW_VIEW_NOT_REGISTERED; ghi nhận đây là trạng thái shadow.

Verifier phải xác nhận:

    schemaVersion = 2.0
    capabilityVersion = 1.0
    sourceKind = MAIN_TABLE
    primaryKey = Bac
    runtimeRoutes phản ánh đúng WA_API View/Save/Delete
    thiếu auth = 401
    alias ERP sai = 409
    không có raw SQL
    response có no-store

## 6. Browser smoke test

Các file liên quan:

    env.js
    index.html
    scripts/frontend-bundle.manifest.json
    src/js/config/Phase2MigrationRegistry.js
    src/js/config/FieldSyncConfig.js
    src/js/services/FieldSyncService.js
    src/js/core/DynamicFormEngine.js
    src/js/utils/FormBuilderPlugin.js
    src/js/app.bundle.js (generated)

Trước khi đổi `WA_API`, có thể deploy backend metadata để kiểm tra shadow. Không bật form unified cho người dùng ở trạng thái này vì nó cố ý fail-closed:

~~~javascript
window.HRM_RUNTIME_CONFIG = Object.assign({}, window.HRM_RUNTIME_CONFIG, {
  FIELD_SYNC: {
    enabled: false,
    shadowMode: true,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 30,
    metadataBaseUrl: 'https://<staging-host>/api/metadata'
  }
});
~~~

Kỳ vọng: metadata trả `SHADOW_VIEW_NOT_REGISTERED`, form pilot không dựng UI từ legacy và không gọi `API_LayCacTruongGiaoDien`.

Chỉ sau Gate View mới thử pilot active:

~~~javascript
window.HRM_RUNTIME_CONFIG = Object.assign({}, window.HRM_RUNTIME_CONFIG, {
  FIELD_SYNC: {
    enabled: true,
    shadowMode: false,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 30,
    metadataBaseUrl: 'https://<staging-host>/api/metadata'
  }
});
~~~

Kỳ vọng active:

    membership/type/nullability lấy trực tiếp từ HR_BangThueTNCNTbl qua sys.columns/sys.types
    table/PK lấy từ SY_FrmLstTbl
    caption/format/lookup lấy từ SY_FmtFldTbl, SY_FmatTbl, SY_FrmDrdwTbl
    Grid/Add/Edit/Filter dùng cùng Form Contract V2
    Save chỉ gửi field writable của contract; không có OrderNo/UserName/audit trong JsonData
    Delete chỉ gửi PK và tự bật khi DeleteMode=SOFT hoặc HARD; khóa nếu IsDeleted sai kiểu

## 7. Gate đăng ký thật

File:

    sql/Phase2ApiMigration/04_REGISTER_PILOT_V2.sql

Sau khi có evidence DB/browser, đặt `PHASE2_APPLY_VIEW/SAVE/DELETE=1`, các gate tương ứng và `PHASE2_ACTOR_VERIFIED=1` bằng `SESSION_CONTEXT` trong cùng connection, rồi chạy script. Ba route có thể đổi cùng một transaction. Delete V2 lấy chế độ từ schema vật lý, không cần allow-list tên bảng/cột nghiệp vụ.

Không giả lập PHASE2_ACTOR_VERIFIED=1 bằng giá trị client. Không DELETE + INSERT WA_API.

## 8. Rollback

Frontend kill-switch:

~~~javascript
window.ERP_FIELD_SYNC_CONFIG = {
  enabled: false,
  shadowMode: true,
  pilotForms: []
};
~~~

DB rollback:

    sql/Phase2ApiMigration/06_ROLLBACK_PILOT_REGISTRATION.sql
    docs/phase2-api-migration/09_HUONG_DAN_ROLLBACK.md

Kỳ vọng sau rollback:

    WA_API về procedure legacy
    Grid/Add/Edit/Filter/Save/Delete chạy legacy
    metadata shadow phát lại SHADOW_VIEW_NOT_REGISTERED
    không DROP procedure V2, không xóa SY_FormatFields

## 9. Bảng trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Local Phase 1 + Phase 2 | PASS 47/47 |
| Backend metadata | PASS 32/32 |
| Bundle/source/audit | PASS static |
| SQL Server compile/runtime | REQUIRES_REDEPLOY_AND_DB_TEST |
| Dynamic field/caption | REQUIRES_PERSONNAME_SMOKE_TEST |
| Browser pilot active | REQUIRES_HARD_RELOAD_AND_RETEST |
| Save V2 thật | REQUIRES_TRANSACTION_TEST |
| Delete V2 thật | REQUIRES_SOFT_OR_HARD_TRANSACTION_TEST |

Tài liệu chi tiết: docs/phase2-api-migration/07_KET_QUA_TEST.md, docs/phase2-api-migration/08_HUONG_DAN_DB_TEST.md, docs/phase2-api-migration/09_HUONG_DAN_ROLLBACK.md và docs/field-sync-phase1/07_HUONG_DAN_KICH_HOAT_STAGING.md
