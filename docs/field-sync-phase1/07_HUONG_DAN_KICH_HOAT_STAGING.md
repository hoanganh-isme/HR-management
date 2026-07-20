# Hướng dẫn kích hoạt Field Sync Phase 1 trên staging

## 1. Phạm vi

Quy trình này chỉ dành cho **staging**. Không chạy SQL hoặc bật pilot trên production khi chưa có biên bản parity, ma trận quyền/chi nhánh và kết quả browser regression đạt.

Mặc định runtime vẫn tắt. Phase 1 chỉ có quyền thay schema của Grid; Add, Edit, Filter, Save, Delete và menu tiếp tục dùng luồng legacy.

## 2. Điều kiện trước khi bắt đầu

- Có snapshot/backup DB staging, người chịu trách nhiệm khôi phục và maintenance window rõ ràng.
- Có bản deploy backend chứa ba endpoint `/api/metadata`.
- Có token staging cho ít nhất: admin, user giới hạn branch và user không có quyền.
- Secret lấy từ secret manager hoặc biến môi trường CI; không ghi token vào `.env`, repo, ảnh chụp hoặc transcript.
- Có nơi lưu evidence đã làm sạch secret: output SQL, hash script, output verifier và checklist trình duyệt.

Nếu thiếu một điều kiện, dừng ở shadow hoặc chưa triển khai.

## 3. Cài SQL có kiểm soát

Thư mục script: `sql/FieldSyncPhase1`.

1. Chụp backup DB staging và xác minh có thể restore.
2. Chạy `00_KIEM_TRA_NGUON.sql`. Dừng nếu object/table/SP nguồn bị thiếu hoặc kết quả cần review.
3. Chạy lần lượt:
   - `01_API_WEB_GRID_FIELD_SCHEMA_V2.sql`
   - `02_API_WEB_LOOKUP_SCHEMA_V2.sql`
   - `03_API_WEB_GRID_FIELD_COMPARE_V2.sql`
   - `04_DANG_KY_API_READONLY.sql`
4. Với script `04`, cả ba dòng phải có `RegistrationStatus = OK`. Nếu có `CONFLICT_REVIEW_REQUIRED` hoặc `MISSING`, dừng; không tự UPDATE/DELETE đăng ký cũ.
5. Chạy `05_KIEM_TRA_SAU_CAI_DAT.sql`. Ba procedure và ba registration phải `OK`, `RegistrationCount = 1`.
6. Chạy lại nguyên bộ `00` đến `05` lần thứ hai. Kết quả phải tương đương lần đầu và không tạo registration trùng.
7. Lưu transcript đã làm sạch secret cùng checksum của sáu file SQL.

`05_KIEM_TRA_SAU_CAI_DAT.sql` chỉ xác minh object/registration. Nó không thay thế test token, quyền, branch hoặc parity live.

## 4. Deploy backend

Đặt các biến môi trường staging theo `backend-app/.env.example`, tối thiểu phải có `SQL_API_BASE` hợp lệ và các timeout/cache Field Sync:

```text
FIELD_SYNC_CACHE_TTL_MS=120000
FIELD_SYNC_CACHE_MAX_ENTRIES=500
FIELD_SYNC_AUTH_CACHE_TTL_MS=60000
FIELD_SYNC_AUTH_CACHE_MAX_ENTRIES=1000
FIELD_SYNC_REQUEST_TIMEOUT_MS=15000
```

Sau khi deploy/restart:

1. Kiểm tra `/health`; kết quả này chỉ chứng minh service chạy và SQL base đã cấu hình.
2. Không coi `/health` là bằng chứng ba procedure metadata hoạt động.
3. Nếu frontend và metadata khác origin, thêm origin staging chính xác vào `CORS_ALLOWED_ORIGINS` và kiểm tra preflight `OPTIONS` trong trình duyệt.
4. Chạy verifier ở bước 5 cho từng user/branch context.

## 5. Chạy verifier staging

Verifier không nhận token qua argv và không in toàn bộ response. Ví dụ PowerShell:

```powershell
$env:FIELD_SYNC_METADATA_BASE_URL = 'https://staging.example/api/metadata'
$env:FIELD_SYNC_USERNAME = 'staging-user'
$env:FIELD_SYNC_BRANCH_ID = 'CN01'
$env:FIELD_SYNC_FORM = 'WA_BangThueTNCNFrm'
$env:FIELD_SYNC_ERP_FORM = 'HR_BangThueTNCNFrm'
$secureToken = Read-Host 'Bearer token tạm thời' -AsSecureString
$tokenCredential = New-Object System.Management.Automation.PSCredential('token', $secureToken)
$env:FIELD_SYNC_BEARER_TOKEN = $tokenCredential.GetNetworkCredential().Password
try {
  npm.cmd --prefix backend-app run verify:field-sync:staging
} finally {
  Remove-Item Env:FIELD_SYNC_BEARER_TOKEN -ErrorAction SilentlyContinue
}
```

Nếu staging cô lập bắt buộc dùng HTTP, cần chủ động đặt `FIELD_SYNC_ALLOW_INSECURE_HTTP=true`; không dùng tùy chọn này trên mạng không tin cậy. Có thể đặt `FIELD_SYNC_LOOKUP_KEY` để kiểm tra bổ sung một lookup cụ thể; verifier vẫn kiểm tra toàn bộ lookup đang bật mà schema công bố (tối đa 50 key).

Verifier chỉ PASS khi:

- Schema/compare trả JSON đúng contract và `Cache-Control: no-store`.
- Field name/order hợp lệ, primary key nằm trong Grid và parity `MATCH` ở cả legacy/V2.
- Schema phải là `2.0`, lấy từ `RESULT_SET`; fallback table và status không nhận diện đều chặn pilot.
- Không có diagnostic `error/critical` hoặc status `CRITICAL/ONLY_V2/ONLY_LEGACY`.
- Response không có key/nội dung giống raw SQL.
- Request thiếu auth trả `401`; alias ERP cố ý sai trả `409`.
- Mọi lookup đang bật phải trả `200` với options `value/label`; mọi `409` chứng minh fail-closed nhưng vẫn **chặn pilot**.

Chạy tối thiểu cho admin đúng branch và user giới hạn đúng branch. Kiểm tra bổ sung bằng tài khoản test rằng user sai quyền/branch ngoài phạm vi không đọc được metadata. Mỗi kết quả chỉ chứng minh đúng context và thời điểm vừa chạy.

Cache metadata có TTL nên sau khi thu hồi quyền/đổi branch, hãy restart backend (hoặc chờ hết TTL) trước khi lưu evidence negative. Trước production cần bổ sung rate-limit/concurrency cap tại reverse proxy cho `/api/metadata`; giới hạn cache không thay thế rate-limit.

## 6. Bật shadow cho một form

Inject cấu hình sau **trước** `env.js` và `src/js/app.bundle.js`, hoặc bằng cơ chế runtime config tương đương của môi trường:

```javascript
window.HRM_RUNTIME_CONFIG = Object.assign({}, window.HRM_RUNTIME_CONFIG, {
  FIELD_SYNC: {
    enabled: false,
    shadowMode: true,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 120,
    metadataBaseUrl: 'https://staging.example/api/metadata'
  }
});
```

Sau hard reload:

1. Grid/Add/Edit/Filter phải tiếp tục hiển thị theo legacy.
2. Xác minh `sessionStorage['ERP_FIELD_SYNC_PARITY:WA_BangThueTNCNFrm']` được tạo.
3. Thu parity theo user/branch; không ghi token hoặc response thô vào evidence.
4. Chạy list/sort/search/paging và mobile card; shadow không được thay Grid.

`ERP_FIELD_SYNC_CONFIG`, nếu được khai báo trước bundle, là override **toàn bộ** `HRM_RUNTIME_CONFIG.FIELD_SYNC`. Không cấu hình một nửa ở mỗi nguồn.

## 7. Điều kiện bật pilot Grid V2

Chỉ chuyển sang pilot khi tất cả điều kiện sau có evidence:

- SQL chạy hai lần không phát sinh conflict/trùng registration.
- Verifier đạt cho ma trận auth/quyền/branch.
- PK `MATCH`, không có critical/only-one-side và khác biệt caption/format/lookup đã được người phụ trách duyệt.
- Không có raw SQL trong browser/network response.
- Browser regression đạt cho list/sort/search/paging/add/edit/delete/mobile.
- Không có người dùng đang nhập liệu trong thời điểm reload.

Khi đó chỉ đổi đúng một form trên staging:

```javascript
window.HRM_RUNTIME_CONFIG = Object.assign({}, window.HRM_RUNTIME_CONFIG, {
  FIELD_SYNC: {
    enabled: true,
    shadowMode: false,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 120,
    metadataBaseUrl: 'https://staging.example/api/metadata'
  }
});
```

Config bị đóng băng khi bundle khởi tạo, vì vậy thay đổi chỉ có hiệu lực sau reload trang.

## 8. Rollback an toàn

1. Đặt `enabled: false`, `shadowMode: true`, `pilotForms: []`, rồi hard reload.
2. Nếu cần kill-switch khẩn cấp, khai báo trước bundle: `window.ERP_FIELD_SYNC_CONFIG = { enabled: false };`.
3. Restart backend nếu cần xóa cache RAM metadata.
4. Xác minh Grid quay về legacy; Add/Edit/Filter/Save/Delete vẫn theo legacy.
5. Giữ nguyên ba SP V2 read-only và registration để điều tra. Không DROP procedure, không DELETE/UPDATE `WA_API`, không chạy cleanup `SY_*` trong rollback Phase 1.

Nếu rollback frontend không khôi phục được hành vi cũ, dừng pilot và restore đúng artifact frontend từ nhánh backup trước Phase 1.
