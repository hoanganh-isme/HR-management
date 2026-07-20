# Danh sách file test Phase 2 và kết quả kỳ vọng

## 0. Phạm vi

Pilot duy nhất:

    Web form : WA_BangThueTNCNFrm
    ERP form: HR_BangThueTNCNFrm
    Table   : HR_BangThueTNCNTbl
    PK      : Bac

Chỉ chạy trên staging/QA có backup và dữ liệu ẩn danh. Không chạy cờ đăng ký bật trên production. Runtime hiện tại vẫn tắt; WA_API View/Save/Delete vẫn legacy.

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

    Phase 1 + Phase 2: 39/39 pass
    Backend:           27/27 pass
    Audit:             176 SQL; 240 procedure/inventory; 230 JOIN
                       18 star; 17 unsafe; 785 SY_FormatFields; 1 approved star

Full regression tùy chọn:

~~~powershell
cmd.exe /d /c node.exe --test tests/frontend-contracts.test.mjs tests/field-sync-phase1.test.mjs tests/phase2-api-migration.test.mjs
~~~

Kỳ vọng hiện tại là 48/51; ba lỗi baseline cũ thuộc DocumentExportPlugin, attachment business key và detail-tab primary key, không dùng để bật Phase 2.

## 2. Cài nền Phase 1 trên SQL Server staging

Chạy bằng SSMS hoặc sqlcmd với cờ fail-on-error:

| Thứ tự | File | Kỳ vọng |
|---:|---|---|
| 2.1 | sql/FieldSyncPhase1/00_KIEM_TRA_NGUON.sql | Xác nhận object/nguồn; không sửa dữ liệu |
| 2.2 | sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql | Tạo/cập nhật Grid Schema V2 |
| 2.3 | sql/FieldSyncPhase1/02_API_WEB_LOOKUP_SCHEMA_V2.sql | Tạo/cập nhật Lookup Schema V2 |
| 2.4 | sql/FieldSyncPhase1/03_API_WEB_GRID_FIELD_COMPARE_V2.sql | Tạo/cập nhật Compare V2 |
| 2.5 | sql/FieldSyncPhase1/04_DANG_KY_API_READONLY.sql | Chỉ thêm ba registration metadata read-only nếu thiếu |
| 2.6 | sql/FieldSyncPhase1/05_KIEM_TRA_SAU_CAI_DAT.sql | Ba procedure metadata tồn tại, registration không conflict |

STOP nếu thiếu menu/quyền/branch, procedure fallback hoặc diagnostic error.

## 3. Cài Phase 2 pilot

| Thứ tự | File | Loại | Kỳ vọng |
|---:|---|---|---|
| 3.1 | sql/Phase2ApiMigration/00_CAPTURE_VIEW_CONTRACT.sql | CHECK | Lưu parameter, result-set, type/nullability, PK/duplicate và row count old/candidate |
| 3.2 | sql/Phase2ApiMigration/01_CREATE_VIEW_V2_PILOT.sql | RUN | Tạo API_BangThueTNCN_V2; không đổi WA_API |
| 3.3 | sql/FieldSyncPhase1/01_API_WEB_GRID_FIELD_SCHEMA_V2.sql | RUN lại | Shadow metadata mô tả đúng View V2 |
| 3.4 | sql/Phase2ApiMigration/02_CREATE_SAVE_V2.sql | RUN | Tạo API_LuuDong_V2; không DDL runtime, không đọc SY_FormatFields |
| 3.5 | sql/Phase2ApiMigration/03_CREATE_DELETE_V2.sql | RUN | Tạo API_XoaDong_V2; hard-delete bị khóa mặc định |
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

| Ca kiểm thử | Kỳ vọng |
|---|---|
| Old/V2 cùng snapshot | Bốn cột đầu Bac/Tu/Den/ThueSuat giữ nguyên alias/type |
| PK | Bac không NULL, không duplicate |
| Keyword/filter | Có evidence parity old/V2; field V2 mới chưa filter |
| Sort | Bốn cột legacy ASC/DESC đúng; sort field mới bị từ chối |
| Branch | Non-admin thiếu branch hoặc branch ngoài context bị từ chối |
| Permission | IsRun/quyền group-user không đạt thì không trả dữ liệu |
| Safety | Không trả blob/password/token/kiểu kỹ thuật |

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

Kỳ vọng: chỉ soft-delete khi IsDeleted là bit và có audit column; nếu thiếu policy phải trả HARD_DELETE_BLOCKED và không xóa vật lý.

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
    sourceKind = RESULT_SET
    primaryKey = Bac
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

Shadow config phải được inject trước bundle:

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

Sau hard reload, kỳ vọng:

    Grid/Add/Edit/Filter vẫn legacy
    diagnostic shadow được hiển thị/ghi nhận
    sessionStorage có ERP_FIELD_SYNC_PARITY:<form>|<erp>|<user>|<branch>
    mobile card không crash
    field V2 mới không làm Grid active khi diagnostic blocking

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

    membership lấy từ View V2 result-set
    ONLY_V2 hiển thị read-only, không server sort/filter
    caption/format/lookup/PK lấy từ metadata đã xác minh
    Add/Edit vẫn legacy

## 7. Gate đăng ký thật

File:

    sql/Phase2ApiMigration/04_REGISTER_PILOT_V2.sql

Lần đầu luôn giữ:

~~~sql
@ApplyView = 0;
@ApplySave = 0;
@ApplyDelete = 0;
~~~

Sau khi có evidence DB/browser:

1. Xác minh actor/session và View gate.
2. Đăng ký View V2, chạy lại metadata/verifier/browser.
3. Chạy Save insert/edit/rollback rồi mới đăng ký Save.
4. Chỉ đăng ký Delete khi IsDeleted/audit/FK/soft-delete đã xác minh.

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
| Local Phase 1 + Phase 2 | PASS 39/39 |
| Backend metadata | PASS 27/27 |
| Bundle/source/audit | PASS static |
| SQL Server compile/runtime | PENDING_DB |
| Old/V2 parity | PENDING_DB |
| Browser shadow | PENDING_STAGING |
| Browser pilot active | BLOCKED |
| Save V2 thật | BLOCKED, chưa đăng ký WA_API |
| Delete V2 thật | BLOCKED, chờ xác minh soft-delete/audit |

Tài liệu chi tiết: docs/phase2-api-migration/07_KET_QUA_TEST.md, docs/phase2-api-migration/08_HUONG_DAN_DB_TEST.md, docs/phase2-api-migration/09_HUONG_DAN_ROLLBACK.md và docs/field-sync-phase1/07_HUONG_DAN_KICH_HOAT_STAGING.md

