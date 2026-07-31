# Kết quả test Phase 1

## Đã chạy và đạt

| Nhóm | Lệnh | Kết quả |
|---|---|---|
| Backend unit + HTTP integration | `npm.cmd test` trong `backend-app` | 25/25 đạt |
| Phase 1 frontend/SQL/verifier mock | `node --test tests/field-sync-phase1.test.mjs` | 20/20 đạt |
| JavaScript syntax | `node --check` cho service, engine, router và server | Đạt |
| Bundle manifest | `node scripts/build-frontend-bundle.mjs --check` | 50 CSS + 91 JS hợp lệ |
| SQL inventory | `node scripts/audit-field-sync-phase1.mjs` | 189 file đã audit |

Các case mới đã phủ thêm:

- Router HTTP thật từ chối thiếu Bearer, alias sai và lookup raw SQL; mọi response có `no-store`.
- Phiên upstream được xác minh trước cả cache hit, nên token giả không thể đọc cache đã warm.
- Metadata/auth cache có giới hạn entry; auth request đồng thời cùng token được coalesce.
- Cache cô lập exact user/branch casing, canonical hóa alias đã xác nhận và không dùng chung branch khác.
- Registered lookup chỉ trả đúng hai cột cấu hình, chặn cột thiếu/nhạy cảm và giới hạn page size.
- `HRM_RUNTIME_CONFIG.FIELD_SYNC` được chuẩn hóa fail-safe; `ERP_FIELD_SYNC_CONFIG` là override toàn bộ/kill-switch.
- Runtime chỉ active khi version/form/result-set/order/PK/compare/lookup descriptor đều đúng contract; table fallback và status lạ bị chặn.
- Verifier được chạy end-to-end với mock HTTP, gồm happy path, PK không nằm trong Grid, lookup 409, negative auth/alias và kiểm tra không in token.

Các case cũ vẫn đạt: JWT/header/upstream-session mismatch, cache TTL, format registry ERP, field sanitizer, lookup allow-list, che lỗi SQL, shadow không đổi bốn schema, pilot chỉ thay Grid, alias validation và static safety của SQL.

## Regression hiện hữu

Chạy `node --test tests/frontend-contracts.test.mjs tests/field-sync-phase1.test.mjs` cho kết quả 29/32 đạt; 3 assertion cũ thất bại:

1. `DocumentExportPlugin` thiếu compatibility payload `documentId/customerId`.
2. Attachment upload chưa dùng `tabDef.filterField || pkField` theo assertion.
3. Editable detail tab chưa có fallback `tabDef.primaryKey || 'UserAutoID'` theo assertion.

Đối chiếu trực tiếp nội dung tại `HEAD bd041d4` cho cả ba pattern đều `False`; do đó đây là baseline của nhánh backup, không do Phase 1 tạo ra. Phase 1 không tự mở rộng phạm vi để sửa các lỗi này.

## Chưa chạy được

- Cài 6 script trên SQL Server đích và chạy lại lần hai để xác minh idempotent thực tế.
- Chạy `scripts/verify-field-sync-staging.mjs` với endpoint/token staging thật cho user admin/user giới hạn branch/user không có quyền.
- Thu parity live của hai candidate.
- Browser E2E cho list/sort/search/paging/add/edit/delete/mobile card.

Verifier local chỉ mới đạt với mock contract; không được dùng kết quả đó để tuyên bố staging live đạt. Workspace chưa có kết nối SQL Server đích hoặc bộ token kiểm thử, vì vậy runtime và pilot tiếp tục tắt. Quy trình chạy thật nằm tại `07_HUONG_DAN_KICH_HOAT_STAGING.md`.
