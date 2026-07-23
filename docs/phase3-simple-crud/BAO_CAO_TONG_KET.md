# Báo cáo tổng kết Phase 3 — CRUD một bảng

## 1. READY/NOT READY

**NOT READY.** Bốn form đã được chọn để chuẩn bị migration, nhưng hiện chưa có form nào được chứng minh đạt toàn bộ gate trên SQL Server và trình duyệt thật. Điều kiện READY là ít nhất ba form `PHASE3_ACTIVE`.

## 2. Commit nền và working tree

- Nhánh: `refactor/hr-cleanup`.
- Commit nền: `f5d04d612d66a78d9dd0d4f2ddc1fc0f64142fb0` — `xong phase 2`.
- Backup: `backup/refactor-hr-cleanup-before-phase3-20260722`, trỏ cùng commit nền khi tạo.
- Hai file dirty có trước Phase 3 và phải được giữ nguyên: `src/pages/menus/menus.html`, `src/pages/menus/menus.js`.
- Không commit, không push.

## 3. Form candidates

| Form | Decision | Lý do chính |
|---|---|---|
| `WA_BangThueTNCNFrm` | MIGRATE_PHASE3 | Pilot một bảng/khóa đơn; cần tái xác nhận DB |
| `WA_ChucDanhFrm` | MIGRATE_PHASE3 | View một bảng/khóa đơn; giữ ERP form self-map để tránh alias PK sai |
| `WA_TitleListFrm` | MIGRATE_PHASE3 | Danh mục một bảng, route generic |
| `WA_ShiftListFrm` | MIGRATE_PHASE3 | Danh mục một bảng; cần test kỹ type giờ/số/bool |
| `WA_BangThamSoFrm` | REVIEW | Payroll/insurance và có KeyID tính toán; ngoài phạm vi |
| `WA_BangPhuCapFrm` | REJECT | Có detail/join và nghiệp vụ liên bảng |
| `WA_CaLamViecFrm` | REJECT | Master/detail, scheduling/timesheet |

Chi tiết và các giá trị cần DB audit nằm trong `01_FORM_CANDIDATES.csv`.

## 4. Form đã migrate

- **Prepared in registry:** `WA_BangThueTNCNFrm`, `WA_ChucDanhFrm`, `WA_TitleListFrm`, `WA_ShiftListFrm`.
- **Đã chứng minh PHASE3_ACTIVE:** 0/4.
- Registry không tự kích hoạt runtime. Form chỉ active khi route V2, contract, CRUD, security, session, mobile và rollback cùng PASS.

## 5. Unified Field Contract

Contract thống nhất phải điều khiển `fields`, `gridFields`, `addFields`, `editFields`, `filterFields`, `runtimeRoutes` và `diagnostics` từ cùng nguồn:

- result-set View V2 và `sys.columns` cho field vật lý/capability;
- `SY_FmtFldTbl` cho caption;
- `SY_FmatTbl` cho format;
- `SY_FrmDrdwTbl` cho lookup.

Registry frontend/backend chỉ chứa contract migration tối thiểu; không chứa field list, caption, format, lookup SQL hay layout. Frontend/backend parity và auto-field vẫn phải qua test.

## 6. View/Save/Delete routes

| Form | View old → V2 | Save old → V2 | Delete |
|---|---|---|---|
| `WA_BangThueTNCNFrm` | `API_TruyVanDong` → `API_TruyVanDong_V2` | `API_LuuDong` → `API_LuuDong_V2` | `API_XoaDong` → `API_XoaDong_V2`; `AUTO_SCHEMA` |
| `WA_ChucDanhFrm` | `API_DanhSachChucDanh` → `API_TruyVanDong_V2` | `API_LuuDong` → `API_LuuDong_V2` | `API_XoaDong` → `API_XoaDong_V2`; `AUTO_SCHEMA` |
| `WA_TitleListFrm` | `API_TruyVanDong` → `API_TruyVanDong_V2` | `API_LuuDong` → `API_LuuDong_V2` | `API_XoaDong` → `API_XoaDong_V2`; `AUTO_SCHEMA` |
| `WA_ShiftListFrm` | `API_TruyVanDong` → `API_TruyVanDong_V2` | `API_LuuDong` → `API_LuuDong_V2` | `API_XoaDong` → `API_XoaDong_V2`; `AUTO_SCHEMA` |

Delete không hard-code theo form: `IsDeleted bit` không computed → `SOFT`; hoàn toàn không có `IsDeleted` → `HARD`; `IsDeleted` sai kiểu hoặc computed → `INVALID_ISDELETED_TYPE` và fail-closed. `Ids` bắt buộc là JSON array để giữ nguyên khóa text có dấu phẩy. Cả soft/hard vẫn phải qua route, actor, permission, branch, PK unique và transaction gate.

`05A_REPAIR_VIEW_V2_ALL_FORMS.sql` được bổ sung để sửa đồng bộ bốn route View đã trỏ/chuẩn bị trỏ V2 nhưng thiếu tham số. Script đặt đủ `@List`, `@UserName`, `@BranchID`, xử lý các lỗi “expects parameter `@List`” và `PHASE3_ACTOR_REQUIRED`, chỉ cập nhật `WA_API.View` và rollback toàn bộ nếu contract lệch.

## 7. `SY_FormatFields` còn ở đâu

`SY_FormatFields` vẫn tồn tại cho form legacy, installer/migration cũ, parity, rollback documentation và test. Phân loại chi tiết ở `04_SY_FORMATFIELDS_REFERENCES.csv`.

Đối với form đã cutover, mọi truy cập từ Grid/Add/Edit/Filter/Save/Delete là `RUNTIME_FORBIDDEN`. Phải chứng minh Network/runtime không gọi API layout legacy trước khi active.

## 8. Session/fallback

Policy yêu cầu:

- metadata 500/502/503 không xóa token hoặc redirect login;
- metadata 401 chỉ logout nếu `/api/userinfo` cũng xác nhận 401;
- metadata 403 là lỗi quyền form, không logout toàn hệ thống;
- route chưa V2 dùng `LEGACY_FULL`;
- route đã cutover nhưng contract lỗi dùng `CUTOVER_CONTRACT_ERROR`, không fallback hỗn hợp;
- giữ unsaved state và hoãn refresh contract khi modal dirty.

Ma trận test nằm trong `05_SESSION_FALLBACK_TEST.md`; trạng thái live hiện tại PENDING.

## 9. Mobile UX

Field được phân loại runtime `CORE`/`OPTIONAL`/`ADVANCED`/`HIDDEN` và trả `reasonCodes`. Required hợp lệ luôn visible; sensitive/binary/computed/server-managed bị ẩn; optional và advanced nằm trong nhóm thu gọn. Không hard-code theo form và không lưu classification vào bảng mới.

Visual QA 360/390/768 hiện PENDING; xem `06_MOBILE_UX_POLICY.md`.

## 10. Test đã chạy

Không chạy test tự động theo phạm vi hiện tại. Lệnh `node scripts/build-frontend-bundle.mjs` đã chạy đúng một lần để sinh lại bundle; đây là thao tác tạo artifact, không phải bằng chứng PASS DB/runtime.

## 11. Test chưa chạy được/chưa có bằng chứng

- Syntax check và backend/Phase1/Phase2/Phase3 regression không chạy theo chỉ thị dừng test.
- `npm run build` không chạy; phạm vi hiện tại chỉ cho phép đúng một lần builder thực tế của repository.
- Toàn bộ SQL gate trên database mục tiêu.
- Add/Edit/duplicate/unknown/audit spoof/permission/branch/injection.
- Session/fallback bằng browser thật.
- Mobile 360/390/768.
- Rollback thật từng form.

Theo dõi ở `07_KET_QUA_TEST.md`; không tự chuyển PENDING thành PASS.

## 12. SQL cần chạy

Theo thứ tự trên staging/clone:

1. `00_AUDIT_CANDIDATES.sql`
2. `01_CREATE_GENERIC_VIEW_V2.sql`
3. `05A_REPAIR_VIEW_V2_ALL_FORMS.sql`
4. `02_UPDATE_UNIFIED_FIELD_CONTRACT.sql`
5. `03_UPDATE_SAVE_V2.sql`
6. `04_UPDATE_DELETE_V2.sql`
7. `05_REGISTER_PHASE3_FORMS.sql`
8. `06_VERIFY_PHASE3_FORMS.sql`
9. `07_RUNTIME_TEST_READONLY.sql`
10. `08_ROLLBACK_PHASE3_REGISTRATION.sql`

Phải kiểm tra đủ mười artifact và review safety trước khi chạy. File 05A thay đổi đồng bộ route View cho cả bốn form nên phải có snapshot `WA_API` trước khi chạy. Hướng dẫn chi tiết ở `08_HUONG_DAN_DB_TEST.md`.

## 13. Rollback

Rollback theo từng form, chỉ khôi phục expected route cũ, không drop V2 và không chạm dữ liệu nghiệp vụ/`SY_FormatFields`/`SY_FrmCfg`. Mỗi form phải có rollback drill rồi đăng ký lại trước khi active. Hiện chưa có bằng chứng drill; xem `09_HUONG_DAN_ROLLBACK.md`.

## 14. Blocker

1. Chưa xác nhận mapping table/PK, uniqueness, deny-list, branch và registration count trên DB thật.
2. Chưa chứng minh result-set, caption/format/lookup và bốn context tự nhận field mới.
3. Chưa chứng minh Save V2 fail-closed và transaction cho từng form.
4. Chưa chứng minh không còn `RUNTIME_FORBIDDEN` sau cutover.
5. Session/fallback, mobile và rollback thật còn PENDING.
6. Chưa có ít nhất ba form đạt toàn bộ gate.
7. Chưa có bằng chứng DB cho mode Delete thực tế (`SOFT`, `HARD` hoặc block `IsDeleted` sai kiểu/computed) và payload ID JSON array của từng form.

## 15. Báo cáo/artifact

Bộ tài liệu gồm đủ 11 artifact:

1. `00_BAO_CAO_COMMIT_NEN.md`
2. `01_FORM_CANDIDATES.csv`
3. `02_FORM_CONTRACT_MATRIX.csv`
4. `03_CRUD_ROUTE_MATRIX.csv`
5. `04_SY_FORMATFIELDS_REFERENCES.csv`
6. `05_SESSION_FALLBACK_TEST.md`
7. `06_MOBILE_UX_POLICY.md`
8. `07_KET_QUA_TEST.md`
9. `08_HUONG_DAN_DB_TEST.md`
10. `09_HUONG_DAN_ROLLBACK.md`
11. `BAO_CAO_TONG_KET.md`

## 16. Commit message đề xuất

Sau khi người dùng tự review và muốn commit:

```text
feat(field-sync): expand unified contract to simple CRUD forms
```

Codex không commit và không push trong Phase 3.
