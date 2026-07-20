# Báo cáo tổng kết Phase 2 — API View/CRUD và giảm dần `SY_FormatFields`

## Kết luận

**NOT READY — chưa được phép bật runtime hoặc đổi đăng ký `WA_API` trên production.** Phase 2 đã chuẩn bị nền tảng và một pilot ở chế độ shadow, nhưng còn thiếu bằng chứng DB/runtime bắt buộc.

## 1. Commit nền và working tree

- Nhánh: `refactor/hr-cleanup`.
- Commit nền: `d94782e4e084692ca9f2e916485f73ffc43c1837`.
- Backup tạo trước khi sửa: `backup/refactor-hr-cleanup-before-phase2-20260720` (cùng commit nền).
- Working tree hiện dirty do các thay đổi Phase 2 chưa commit; không commit và không push.
- Audit không tìm thấy `sql/install-order.txt`; thứ tự cài pilot được kiểm soát trong hướng dẫn DB riêng.

## 2. Audit API View/JOIN/`SELECT *`

- 176 file SQL được quét; 240 procedure definition/inventory row.
- 230 JOIN row được phân tích.
- 18 trường hợp `SELECT *`, trong đó 1 pilot được duyệt có điều kiện `MAIN_TABLE_STAR_APPROVED` và 17 trường hợp `UNSAFE_STAR` còn lại bị giữ ngoài Phase 2.
- 785 reference `SY_FormatFields` được phân loại: `GRID_RUNTIME=1`, `ADD_EDIT_RUNTIME=8`, `FILTER_RUNTIME=8`, `FORM_BUILDER_WRITE=42`, `MIGRATION=725`, `PARITY=1`.
- Các nhóm report, aggregate, attachment, payroll/timesheet, business action, multi-result và JOIN chưa chứng minh cardinality vẫn bị loại khỏi pilot.

## 3. Pilot đã chuẩn bị

`WA_BangThueTNCNFrm` → ERP `HR_BangThueTNCNFrm` → `HR_BangThueTNCNTbl` (PK `Bac`). Đây là danh mục một bảng, không attachment/master-detail/custom calculation đã được phát hiện trong audit. `WA_ChucDanhFrm` và `WA_BangPhuCapFrm` không được chọn vì khác PK hoặc có detail/money risk.

## 4. View V2

Đã tạo `API_BangThueTNCN_V2`: giữ năm tham số legacy, thêm `@UserName/@BranchID`, giữ bốn field/alias đầu (`Bac, Tu, Den, ThueSuat`), tự nhận cột an toàn của bảng chính sau deny-list server. Procedure có menu/group/user permission, chặn non-admin không có branch và kiểm tra `BranchID` trong `JsonData` không vượt context. Filter/sort server-side hiện chỉ mở bốn field legacy; field mới được đánh dấu display-only ở Grid và sort ngoài allow-list bị từ chối. Metadata resolver cũng fail-closed với lỗi DMF và toàn bộ nhóm kiểu kỹ thuật bị deny-list. Keyword parity và các kiểm thử DB vẫn là blocker. `WA_API.View` vẫn trỏ `API_TruyVanDong`.

## 5. Save/Delete V2

Đã tạo `API_LuuDong_V2` và `API_XoaDong_V2` với allow-list pilot, registry/physical-column/unique-PK gate, parameterized JSON, transaction/XACT_ABORT, audit server-controlled và response tương thích. Cả hai yêu cầu đồng thời `IsRun` với quyền action, fail-closed khi non-admin không có branch, và đối chiếu actor/branch lồng trong JSON. Delete mặc định chỉ soft-delete; hard-delete bị chặn. `WA_API.Save/Delete` vẫn trỏ legacy và Form Builder write bị khóa cho pilot.

## 6. Grid và `SY_FormatFields`

Ở shadow, resolver metadata có allow-list đúng một pilot để mô tả `API_BangThueTNCN_V2` dù `WA_API.View` còn legacy, đồng thời phát diagnostic `SHADOW_VIEW_NOT_REGISTERED`; frontend tải/đối chiếu V2 nhưng Grid hiển thị vẫn giữ schema legacy và không thể active. Sau khi Gate View đổi đăng ký thật, Grid mới lấy membership từ result-set V2; caption/format/dropdown/PK lấy từ `SY_FmtFldTbl`, `SY_FmatTbl`, `SY_FrmDrdwTbl`, `SY_FrmLstTbl`. Add/Edit vẫn dùng `SY_FormatFields` ở compatibility mode. Không drop bảng, không xóa dữ liệu, không sửa sâu `SY_FrmCfg`.

## 7. Kiểm thử

Đợt gần nhất ghi nhận 39/39 test Phase 1 + Phase 2 pass; backend 27/27 pass; bộ frontend tổng 48/51 (3 lỗi baseline không liên quan). Bundle 50 CSS + 92 JS được build hai lần với cùng SHA-256 `CF6B735657B1837FC996DBE97E9304CCBED294E763B2E21D8047DB7BC440E615`. Audit/static pass theo số liệu trên. SQL Server compile/runtime, contract parity với dữ liệu thật, browser/mobile smoke và actor/session proof **chưa chạy/chưa đạt**.

## 8. Runtime và đăng ký

Runtime **chưa bật**. Registry frontend là `SHADOW_PREPARED`; các cờ `@ApplyView/@ApplySave/@ApplyDelete` trong `04_REGISTER_PILOT_V2.sql` mặc định `0`. Chỉ mở cờ sau `00_CAPTURE_VIEW_CONTRACT.sql`, `05_VERIFY_PILOT_V2.sql`, DB harness và gate actor/session đã có biên bản.

## 9. Blocker trước Gate View/Save/Delete

1. Chưa có SQL Server harness chứng minh row count, nullability, keyword, sort, branch, permission, actor và rollback old/V2.
2. 17 unsafe star legacy còn tồn tại; không được báo READY toàn hệ thống.
3. Actor hiện vẫn cần chứng minh bằng session/auth integration; không tin mù giá trị client.
4. Pilot View fail-closed nếu DB có scope/sensitive/blob hoặc soft-delete chưa có policy; Delete cần `IsDeleted` kiểu `bit` và audit column.
5. Keyword parity, row-count/nullability và các kiểm thử sort/filter old/V2 so với `API_TruyVanDong` chưa có bằng chứng DB; không mở Gate View trước DB harness.
6. 3 frontend contract baseline failure cần xử lý riêng.

## 10. Tài liệu và rollback

Các báo cáo inventory/JOIN/star/reference nằm cùng thư mục. Runbook tổng hợp thứ tự file, lệnh chạy và kỳ vọng ở `10_DANH_SACH_FILE_TEST_VA_KY_VONG.md`. Hướng dẫn DB và rollback lần lượt ở `08_HUONG_DAN_DB_TEST.md` và `09_HUONG_DAN_ROLLBACK.md`; script rollback là `06_ROLLBACK_PILOT_REGISTRATION.sql`.

## Commit message đề xuất (chưa thực hiện)

`feat(metadata): prepare phase 2 view and CRUD V2 pilot`
