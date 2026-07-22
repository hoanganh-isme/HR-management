# Báo cáo tổng kết Phase 2 — Form Contract V2 động

## Kết luận

**NOT READY cho production** cho tới khi các script mới được cài lại trên SQL Server đích và hoàn tất smoke test DB/Web. Phần mã nguồn local đã chuyển `WA_BangThueTNCNFrm` sang contract động, không còn hard-code danh sách field nghiệp vụ.

## Backup và phạm vi thay đổi

- Nhánh làm việc: `refactor/hr-cleanup`.
- Các nhánh backup đã có, gần nhất: `backup/refactor-hr-cleanup-before-gateway-502-fix-20260722` và `backup/refactor-hr-cleanup-before-save-v2-collation-fix-20260722`.
- Working tree vẫn chưa commit/push.

## Luồng field động

1. `SY_FrmLstTbl` cung cấp TableName và PrimaryKey.
2. `sys.columns/sys.types` cung cấp toàn bộ field vật lý, thứ tự, kiểu, nullable và khả năng ghi.
3. `SY_FmtFldTbl` cung cấp `CaptionVN/CaptionEN/FormatID`; alias form cùng TableName/PrimaryKey được nhận tự động.
4. View V2 trả các cột vật lý, Save V2 nhận field writable và frontend tạo Grid/Add/Edit/Filter từ cùng một contract.
5. Metadata dùng `refresh=1`; frontend polling 30 giây và tải lại data khi schema/caption thay đổi.

Vì vậy, thêm cột an toàn như `PersonName` không yêu cầu sửa SQL/JavaScript theo tên field. Nếu có dòng `SY_FmtFldTbl` tương ứng, Web dùng caption tiếng Việt; nếu chưa có thì fallback về `PersonName`.

## Delete V2

- Có `IsDeleted bit`: `DeleteMode=SOFT`, cập nhật `IsDeleted=1`; audit delete được ghi nếu cột audit tồn tại.
- Không có `IsDeleted`: `DeleteMode=HARD`, xóa vật lý trong transaction.
- `IsDeleted` tồn tại nhưng sai kiểu: fail-closed.
- Permission, actor, branch, kiểu PK, tối đa 100 ID, đủ row count và FK/constraint đều được kiểm soát; lỗi sẽ rollback.

## Kết quả local gần nhất

- Phase 1 + Phase 2: 47/47 pass.
- Backend metadata: 32/32 pass.
- Full frontend + Phase 1/2: 56/59; ba lỗi baseline cũ không thuộc thay đổi này.
- Bundle: 50 CSS + 92 JS, SHA-256 `9EA5F0F53D0C8F31D115A17C39433C6D55207EEBD09EFD4693C28A274BE8DB22`.
- Audit: 176 SQL, 240 procedure/inventory, 231 JOIN, 17 star (16 unsafe, 1 approved), 789 reference `SY_FormatFields`.

## Việc còn lại trước production

1. Cài lại các file SQL theo `11_KICH_HOAT_UNIFIED_FIELD_CONTRACT.md`.
2. Chạy static gate, harness read-only và transaction test Save/Delete trên QA.
3. Restart backend, deploy bundle `v=16`, hard reload và xác nhận `PersonName` xuất hiện với caption đúng.
4. Xác nhận hard-delete bị FK chặn thì rollback; soft-delete không còn xuất hiện trong View.
5. Giữ kill-switch/rollback sẵn sàng theo `09_HUONG_DAN_ROLLBACK.md`.

## Commit message đề xuất (chưa thực hiện)

`feat(metadata): make V2 fields and delete mode schema-driven`
