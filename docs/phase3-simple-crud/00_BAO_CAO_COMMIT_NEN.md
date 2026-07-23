# Báo cáo commit nền Phase 3

## Kết luận nền

- Repository đang ở nhánh `refactor/hr-cleanup`.
- Commit nền: `f5d04d6` (`xong phase 2`).
- Nhánh backup trước Phase 3: `backup/refactor-hr-cleanup-before-phase3-20260722`.
- Không commit và không push trong Phase 3.
- Trạng thái Phase 3 hiện tại: **NOT READY** cho production vì chưa chạy gate trên SQL Server thật và chưa smoke test trình duyệt.

## Working tree trước khi sửa Phase 3

Hai thay đổi có sẵn của người dùng được giữ nguyên, không ghi đè:

```text
M src/pages/menus/menus.html
M src/pages/menus/menus.js
```

Thống kê diff nền tại thời điểm audit:

```text
src/pages/menus/menus.html | 458 dòng thay đổi
src/pages/menus/menus.js   |  22 dòng thay đổi
2 files changed, 281 insertions(+), 199 deletions(-)
```

Các artifact Phase 3 được thêm sau mốc này không được xem là thay đổi nền của người dùng.

## Phạm vi audit

Audit tĩnh đã dùng các nguồn trong repository, gồm:

- `SY_FrmLstTbl`/`WA_API` được mô tả trong các script đăng ký form;
- định nghĩa View legacy trong `sql/API/APINEW` và `sql/API/Combined_API.sql`;
- inventory Phase 1/Phase 2;
- registry và Unified Field Contract của Phase 2.

Audit tĩnh không thay thế audit database. Các giá trị `PhysicalColumnCount`, `HasSoftDelete`, row count đăng ký, quyền, branch, uniqueness và parity runtime phải được xác nhận lại bằng `sql/Phase3SimpleCrud/00_AUDIT_CANDIDATES.sql` trên database đích.

## Nguyên tắc bảo toàn

- Không reset, checkout đè hoặc sửa hai file menu đang dirty.
- Không tạo metadata mirror.
- Không sửa trực tiếp `SY_*` từ frontend/backend.
- Không xóa `SY_FormatFields`, không sửa `SY_FrmCfg`, không chạy runtime DDL.
- Chỉ form có `Decision=MIGRATE_PHASE3` mới được đưa vào registry Phase 3.
- Registry chỉ là allow-list chuẩn bị; form chưa được xem là `PHASE3_ACTIVE` trước khi hoàn tất toàn bộ gate DB/Web/rollback.

