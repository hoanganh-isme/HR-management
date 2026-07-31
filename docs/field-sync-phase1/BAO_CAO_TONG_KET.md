# Báo cáo tổng kết Phase 1

## 1. Kết luận

**NOT READY để bật runtime/pilot; READY cho bước cài thử có kiểm soát trên môi trường staging.**

## 2. Audit SQL

Đã quét 189 file SQL, gồm đầy đủ `API`, `APINEW`, `Insert`, `Register`, `Combined`, `Deploy`, `Update`, `Query`, `Restore`, `View`, `tables`, `Triggers` và 6 file Phase 1. Inventory ghi nhận theo scanner bảo thủ: 81 `RUNTIME`, 90 `DESTRUCTIVE_LEGACY`, 7 `INSTALLER_LEGACY`, 2 `REGISTER_ONLY`, 5 `SAFE_READONLY`, 3 `VERIFY`, 1 `ROLLBACK`.

Các script cũ có cleanup hoặc ghi cấu hình không được chạy trong Phase 1. Chi tiết từng file: `01_SQL_DEPENDENCY_INVENTORY.csv`.

## 3. Phụ thuộc `SY_FormatFields`

Scanner ghi nhận 38 file đọc, 70 file ghi và 31 file có thao tác xóa; số liệu có giao nhau. Bốn runtime SP trực tiếp quan trọng là `API_TruyVanDong`, `API_LayCacTruongGiaoDien`, `API_DanhSachTruongGiaoDien`, `API_LuuTruongGiaoDien`. `API_DongBoTruongGiaoDien` là writer/cleanup legacy và khác đáng kể giữa dump với repo.

Add/Edit/Filter vẫn dùng nguồn này; Grid V2 không dùng nó làm field/caption/format chính. Không sửa bất kỳ SP legacy nào.

## 4. Field source mới

- Field/order: result-set của stored procedure `WA_API View`.
- Fallback có diagnostic: `sys.columns` của `TableName` lấy từ ERP form.
- Primary key: `SY_FrmLstTbl.PrimaryKey`.
- Caption: ERP form dictionary → Web compatibility → global dictionary → alias → field name.
- Format: `SY_FmtFldTbl` + `SY_FmatTbl` + SQL type.
- Dropdown: ERP `SY_FrmDrdwTbl` → Web compatibility; browser chỉ nhận descriptor đã sanitize.

`SY_FrmCfg`, layout Add/Edit, master-detail, `LYT*` và `PFID` chưa được đọc hoặc xử lý trong Phase 1; không có mirror table hay mapping table.

## 5. API V2 và backend

Đã tạo ba procedure read-only và ba endpoint:

- `GET /api/metadata/grid-schema/:formName`.
- `GET /api/metadata/grid-schema/:formName/compare`.
- `POST /api/metadata/lookups/:lookupKey/search`.

Backend yêu cầu Bearer context, gọi `API_UserInfo` để ràng buộc username với phiên upstream, chuyển token xuống gateway, kiểm tra user/quyền/branch tại SQL, cache RAM có giới hạn theo form/user/branch và không chuyển lỗi/câu lệnh SQL ra client. Lookup raw SQL bị chặn; registered lookup chỉ trả đúng cột value/display đã đăng ký.

Xác minh phiên được thực hiện trước khi đọc cache schema/compare; token giả không thể dùng chung cache đã warm. Cả response thành công và lỗi của router metadata đều đặt `Cache-Control: private, no-store`.

## 6. Frontend dual schema và shadow

Đã tách:

```text
grid    = V2 khi enabled + không shadow + thuộc pilot
edit    = legacy
add     = legacy
filters = legacy
```

Facade `DynamicFormEngine.render(container, config)` giữ nguyên. Shadow tải schema/compare cho form trong `pilotForms`, lưu parity vào session storage, poll 120 giây và fail-open về legacy. Không refresh khi đang nhập vì mặc định không có pilot và shadow update không render lại Grid. Pilot fail-closed nếu schema/version/form/result-set/order/PK/compare/lookup descriptor không đúng contract; fallback table không được phép kích hoạt Grid V2.

Frontend nhận cấu hình từ `HRM_RUNTIME_CONFIG.FIELD_SYNC`. Nếu có `ERP_FIELD_SYNC_CONFIG` không rỗng trước bundle thì object này override toàn bộ để tương thích và làm kill-switch; hai nguồn không được trộn từng phần. Các gate `enabled/shadowMode/pilotForms` sai kiểu được chuẩn hóa fail-safe.

## 7. Pilot

- `WA_BangThueTNCNFrm → HR_BangThueTNCNFrm`: đã xác nhận alias cho shadow nhờ cùng table/PK và có artifact ERP; chưa bật pilot trước live parity.
- `WA_ChucDanhFrm → HR_ChucDanhFrm`: không xác nhận vì Web PK `ChucDanhChuyenMon` khác ERP PK `ChucDanh`; severity `CRITICAL`.

## 8. Test và blocker

Backend 25/25 và Phase 1 frontend/SQL/verifier mock 20/20 đạt; syntax/manifest đạt. Regression kết hợp 29/32, với ba lỗi cũ đã tồn tại ở commit nền và nằm ngoài phạm vi.

Đã có `scripts/verify-field-sync-staging.mjs` và runbook `07_HUONG_DAN_KICH_HOAT_STAGING.md`. Verifier đã đạt end-to-end với mock contract nhưng **chưa chạy trên staging thật**. Blocker chính vẫn là: chưa cài SQL staging hai lần, chưa có token/branch matrix, chưa có parity live và chưa chạy browser E2E.

## 9. Runtime

Runtime **không bật**:

```javascript
window.HRM_RUNTIME_CONFIG = {
  FIELD_SYNC: {
    enabled: false,
    shadowMode: true,
    pilotForms: [],
    pollSeconds: 120
  }
};
```

## 10. Bước tiếp theo

1. Chụp backup DB staging.
2. Chạy `00` → `05`, sau đó chạy lại cả bộ để kiểm tra idempotent.
3. Deploy backend staging và chạy verifier theo ma trận auth/quyền/branch; xác nhận response không có raw SQL.
4. Thêm duy nhất `WA_BangThueTNCNFrm` vào `pilotForms` ở shadow, thu parity.
5. Chạy browser regression theo checklist trong runbook.
6. Chỉ khi không còn `CRITICAL`, đặt `enabled: true`, `shadowMode: false` cho một pilot staging.

Không có commit/push trong lượt này. Commit message đề xuất khi người dùng quyết định commit: `feat(metadata): add shadow ERP grid field sync phase 1`.
