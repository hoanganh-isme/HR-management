# Kết quả kiểm thử Phase 3

## Kết luận hiện tại

**NOT READY.** Tại thời điểm lập báo cáo chưa có bằng chứng chạy đầy đủ trên SQL Server mục tiêu và trình duyệt thật. Registry/source code ở trạng thái chuẩn bị không đồng nghĩa form đã `PHASE3_ACTIVE`.

Quy ước:

- `PASS`: có output/ảnh/log kiểm chứng từ đúng build và môi trường.
- `FAIL`: đã chạy và sai kỳ vọng.
- `PENDING`: chưa chạy hoặc chưa lưu đủ bằng chứng.
- `N/A`: chỉ dùng khi có lý do được phê duyệt; không dùng để bỏ qua gate bắt buộc.
- `EXECUTED_NOT_VALIDATED`: đã chạy thao tác tạo artifact nhưng không suy ra kết quả kiểm thử.
- `NOT_RUN_BY_USER_SCOPE`: không chạy theo chỉ thị phạm vi hiện tại.
- `INSPECTED_WITH_EXISTING_ISSUE`: đã kiểm tra working tree/diff và còn vấn đề ngoài phạm vi được giữ nguyên.

## Kiểm thử mã nguồn

| Hạng mục | Lệnh | Trạng thái | Bằng chứng/ghi chú |
|---|---|---|---|
| Whitespace/diff | `git diff --check` | INSPECTED_WITH_EXISTING_ISSUE | Phát hiện trailing whitespace tại `src/pages/menus/menus.js:1087`; đây là thay đổi người dùng có sẵn, không sửa trong Phase 3 |
| JavaScript syntax | `node --check <từng file JS đã sửa>` | NOT_RUN_BY_USER_SCOPE | Không chạy sau chỉ thị dừng test |
| Backend field sync | `node --test backend-app/src/field-sync/field-sync.test.js` | NOT_RUN_BY_USER_SCOPE | Không chạy sau chỉ thị dừng test |
| Phase 1 regression | `node --test tests/field-sync-phase1.test.mjs` | NOT_RUN_BY_USER_SCOPE | Không chạy sau chỉ thị dừng test |
| Phase 2 regression | `node --test tests/phase2-api-migration.test.mjs` | NOT_RUN_BY_USER_SCOPE | Không chạy sau chỉ thị dừng test |
| Phase 3 regression | `node --test tests/phase3-simple-crud.test.mjs` | NOT_RUN_BY_USER_SCOPE | Không chạy sau chỉ thị dừng test |
| Bundle frontend | `node scripts/build-frontend-bundle.mjs` | EXECUTED_NOT_VALIDATED | Chạy đúng một lần; sinh 50 CSS vào `styles.bundle.css` và 93 JS vào `app.bundle.js`; không suy ra PASS |
| Build khác | `npm run build` | NOT_RUN_BY_USER_SCOPE | Không chạy; phạm vi hiện tại chỉ cho phép đúng một lần build bundle bằng script trên |

## Gate theo form

| Form | Audit Table/PK | View V2 | Unified Contract | Grid/Add/Edit/Filter | Save V2 | Delete policy | Permission/branch | Session/fallback | Mobile | Rollback thật | Activation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `WA_BangThueTNCNFrm` | PENDING | PENDING | PENDING | PENDING | PENDING | `AUTO_SCHEMA`; mode DB PENDING | PENDING | PENDING | PENDING | PENDING | NOT ACTIVE |
| `WA_ChucDanhFrm` | PENDING | PENDING | PENDING | PENDING | PENDING | `AUTO_SCHEMA`; mode DB PENDING | PENDING | PENDING | PENDING | PENDING | NOT ACTIVE |
| `WA_TitleListFrm` | PENDING | PENDING | PENDING | PENDING | PENDING | `AUTO_SCHEMA`; mode DB PENDING | PENDING | PENDING | PENDING | PENDING | NOT ACTIVE |
| `WA_ShiftListFrm` | PENDING | PENDING | PENDING | PENDING | PENDING | `AUTO_SCHEMA`; mode DB PENDING | PENDING | PENDING | PENDING | PENDING | NOT ACTIVE |

Số form đạt đủ gate: **0/4 được chứng minh**. Điều kiện READY là ít nhất 3 form đạt toàn bộ gate.

## Bộ ca bắt buộc cho từng form

| Nhóm | Ca kiểm thử tối thiểu | Trạng thái chung |
|---|---|---|
| Contract | TableName/PK chính xác; PK tồn tại và unique; result-set không duplicate; deny-list bị chặn | PENDING |
| Field động | Thêm một cột nullable an toàn trên QA; View và contract tự thấy; caption từ `SY_FmtFldTbl`; format/lookup khớp nếu đã khai báo | PENDING |
| Context | Grid/Add/Edit/Filter cùng dùng V2 sau cutover; không request API layout legacy | PENDING |
| Read | Search, sort, typed filter, paging; sort/filter field lạ và SQL injection bị từ chối | PENDING |
| Save | Insert, update đúng một row, duplicate PK, unknown field, duplicate JSON key, audit spoof, identity/computed/server-managed | PENDING |
| Security | User active/inactive; quyền Add/Edit/View; branch hợp lệ/không hợp lệ; không nhận TableName từ client | PENDING |
| Delete | `AUTO_SCHEMA`: writable `IsDeleted bit` → soft; absent → hard; sai kiểu/computed → block; ID JSON array; route/Para/permission/branch/transaction đúng | PENDING |
| Session | 500/502/503, 401 + `/api/userinfo`, 403, legacy fallback, cutover contract error | PENDING |
| Mobile | 360/390/768; CORE/OPTIONAL/ADVANCED/HIDDEN; reasonCodes; unsaved state | PENDING |
| Rollback | Khôi phục từng form độc lập về expected old route; dữ liệu nghiệp vụ không đổi; có thể đăng ký lại sau drill | PENDING |

## Bằng chứng cần lưu

- Output đầy đủ của từng lệnh test với timestamp và commit/working-tree hash.
- Result set của `00_AUDIT_CANDIDATES.sql`, `06_VERIFY_PHASE3_FORMS.sql` và `07_RUNTIME_TEST_READONLY.sql`.
- Before/after `WA_API.View` khi tự chạy `05A_REPAIR_VIEW_V2_ALL_FORMS.sql`; xác nhận `Para` có đủ `@List`, `@UserName`, `@BranchID`.
- Before/after snapshot `WA_API` cho từng form và output rollback.
- Network/Console của browser đã che token; ảnh ở 360/390/768.
- Dữ liệu test Save nằm trong transaction rollback hoặc bản ghi test có kế hoạch dọn dẹp được duyệt.

Không được tự điền `PASS` từ kỳ vọng thiết kế. Khi có kết quả, cập nhật trực tiếp bảng này và ghi rõ môi trường/thời điểm.
