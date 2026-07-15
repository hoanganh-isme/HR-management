# HR frontend hard-code inventory — Phase A

## Baseline

`main` and `refactor/hr-cleanup` resolve to the same `src/js/core/index.js` architecture for this area. The file is 1,553 lines and declares 13 `window.APP_MODULES[...]` entries inline. `src/js/core/router.js` has 11 literal routes, then creates DB-driven DynamicFormEngine routes for menu metadata.

The existing refactor utilities (`ModuleDefinition`, `FormActionRegistry`, `AppConfig`, `SafeFormula`, `ResponsiveDataRenderer`) are present, but the module registry itself has not yet been extracted from `core/index.js`. Phase B must not add more inline modules or restore the removed banquet configuration.

## Inline modules currently present

`WA_NguoiDungNhomFrm`, `WA_NguoiDungFrm`, `WA_TimeSheetDayFrm`, `WA_CaLamViecFrm`, `WA_QuanLyNghiPhepNamFrm`, `WA_KinhPhiCongDoanFrm`, `WA_PersonFullFrm`, `WA_DanhSachUngVienFrm`, `WA_LuongKhoanFrm`, `WA_BangPhuCapFrm`, `WA_BaoHiemFrm`, `WA_PayrollFrm`, and `WA_HopDongLaoDongFrm`.

## Contract boundaries to preserve

- `DynamicFormEngine`, `src/js/utils/apiClient.js`, router/auth/permission/storage, and the existing API response envelopes remain stable.
- Field definitions, actions, lookups, status values, and mobile visibility should be supplied through `ModuleDefinition`/capabilities or server metadata, not another monolithic `index.js` block.
- The resolver must apply the `SY_FormatFields` precedence documented in `hr-formatfields-contract.md`.
- A missing/invalid metadata field falls back locally with a diagnostic; it does not call a destructive registration API.

## Candidate Phase B extraction

1. Move the 13 definitions into small HR module definition files or a factory keyed by `FormName`.
2. Keep only capability registration and compatibility wiring in `core/index.js`.
3. Add a metadata adapter that normalizes `WA_Menu`, `SY_FrmLstTbl`, `WA_API`, and format rows without changing response contracts.
4. Add a leave/attendance vertical slice first, with explicit actions and mobile metadata, before payroll/report expansion.

No source edit is made by this Phase A inventory.

