# Kiểm kê hard-code frontend HRM

## Kết quả tách registry

Trước patch, `src/js/core/index.js` có khoảng 1.553 dòng và 13 phép gán `window.APP_MODULES[...]`. Hiện file chỉ giữ bootstrap/auth/router và gọi registry; không còn khai báo `APP_MODULES[...]`.

Registry mới dùng global/IIFE tương thích bundle hiện tại:

- `src/js/modules/hr/HRModuleRegistry.js`
- `src/js/modules/hr/definitions/access.js`
- `src/js/modules/hr/definitions/employee.js`
- `src/js/modules/hr/definitions/attendance.js`
- `src/js/modules/hr/definitions/leave.js`
- `src/js/modules/hr/definitions/payroll.js`
- `src/js/modules/hr/definitions/contract.js`

`ModuleDefinition.create` vẫn là nơi normalize capability/mobile metadata. `DynamicFormEngine`, API client, router, auth, permission và storage không bị viết lại.

## 13 module cũ được bảo toàn và 1 slice mới

`WA_NguoiDungNhomFrm`, `WA_NguoiDungFrm`, `WA_TimeSheetDayFrm`, `WA_CaLamViecFrm`, `WA_QuanLyNghiPhepNamFrm`, `WA_KinhPhiCongDoanFrm`, `WA_PersonFullFrm`, `WA_DanhSachUngVienFrm`, `WA_LuongKhoanFrm`, `WA_BangPhuCapFrm`, `WA_BaoHiemFrm`, `WA_PayrollFrm`, `WA_HopDongLaoDongFrm`.

Slice mới là `WA_DonXinNghiPhepFrm`. Module dùng DynamicFormEngine hiện hữu, `DocumentID` làm business key, hai detail tab cho ngày nghỉ và tài liệu, cùng metadata mobile do `ModuleDefinition.create` normalize. Tổng registry hiện là 14 module; 13 module cũ vẫn giữ nguyên.

Các key, `FormName`, `PrimaryKey`, action callback, detail tab và API payload được giữ nguyên. Registry gọi `ModuleDefinition.create` một lần khi bundle khởi tạo và vẫn cho router tra theo FormKey/FormName.

## Hard-code còn lại cần xử lý sau

- 11 route tĩnh trong router là route hệ thống; route form HR vẫn lấy từ `WA_Menu` và DynamicFormEngine.
- Callback nghiệp vụ lớn của chấm công, bảo hiểm và hợp đồng hiện vẫn nằm trong definition tương ứng để tránh thay đổi lifecycle. Chỉ tách tiếp khi có capability chung rõ ràng.
- `src/js/core/DynamicFormEngine.js` không bị format lại hoặc tách cơ học trong patch này.

## Ràng buộc contract

Không đổi tên API, FormName, FormKey, storage key, field name hoặc response envelope. Không sửa trực tiếp bundle; manifest hiện build 77 JS từ source. Module mới được thêm vào `scripts/frontend-bundle.manifest.json` trước `HRModuleRegistry` và `DynamicFormEngine`.
