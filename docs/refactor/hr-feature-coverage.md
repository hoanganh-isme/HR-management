# HR feature coverage — Phase A (read-only)

Ngày kiểm tra: 2026-07-15  
Branch: `refactor/hr-cleanup`  
Merge-base với `main`: `0df51f4b288e34ee923f25df336e58a07b97eba1`  
Ahead/behind (`main...refactor/hr-cleanup`): `0 1`

## Phạm vi và nguồn

- ERP binary/layout: `D:\chuyenfile\NhanSu2.zip` (chỉ đọc tên entry; không đọc `settings.config` hay dữ liệu nhạy cảm). Archive có 86 HR-named entries, 63 artifact duy nhất, gồm 42 form và 21 report `.dat`.
- SQL trong repo: 182 file `.sql` (105 API, 55 Insert, 9 Update); 27 file `Register_*`, 18 file có tên `SY_FormatFields`, và các bundle `sql/API/Combined_API.sql`, `sql/Insert/Combined_Insert_Temp.sql`.
- Frontend: `src/js/core/router.js`, `src/js/core/index.js`, `DynamicFormEngine`, `ApiClient`, module và registration SQL.
- **Chưa tìm thấy** `scriptschema(1).sql` và `scriptdataa.sql` trong repo, `D:\chuyenfile`, hoặc thư mục attachments được cung cấp. Vì vậy không thể xác nhận object/column/key, row counts, `isDisable`, quyền, hoặc coverage runtime từ test DB.

## Ma trận sơ bộ

`IMPLEMENTED` nghĩa là có module/route/action hoặc registration evidence trong source; `GENERIC_CRUD_ONLY` nghĩa là metadata/CRUD có file nhưng chưa có module chuyên biệt; `MISSING` là không có evidence trong source; `DATA_REQUIRED` là chưa thể kết luận DB runtime khi snapshot vắng. `DISABLED_IN_DB` không được gán khi chưa đọc được `WA_Menu.isDisable`.

| ERPForm / API | WA_Menu / SY_FrmLstTbl / WA_API evidence | Frontend module/route/action | Status Phase A |
|---|---|---|---|
| `WA_PersonFullFrm` | `API_HoSoNhanVien.sql`, `Register_API_HoSoNhanVien_CRUD.sql`, `Insert_HoSoNhanVien.sql` | `APP_MODULES['WA_PERSONFULLFRM']`, custom personnel actions | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_HopDongLaoDongFrm` | `Insert_WA_HopDongLaoDongFrm_SY_FormatFields.sql`, attachment/update SQL | `APP_MODULES['WA_HOPDONGLAODONGFRM']`, document export | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_BaoHiemFrm` | `WA_BaoHiemFrm_Save.sql`, `Insert_WA_BaoHiemFrm_Config.sql` | `APP_MODULES['WA_BAOHIEMFRM']`, lookup/calculate actions | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_KinhPhiCongDoanFrm` | `Insert_WA_KinhPhiCongDoanFrm.sql`, combined insert | `APP_MODULES['WA_KINHPHICONGDOANFRM']` | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| `WA_TimeSheetFrm` | `Insert_WA_TimeSheetFrm_SY_FormatFields.sql` | No dedicated `APP_MODULES` entry; DB-driven route | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| `WA_TimeSheetCTReport`, `WA_TimeSheetTH2Report` | FormatFields inserts; TH2 has WA_API insert | Dynamic report route only | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| `WA_TimeSheetDayFrm` | `Insert_WA_TimeSheetDayFrm_SY_FormatFields.sql`, process SP | `APP_MODULES['WA_TIMESHEETDAYFRM']`, create-timesheet action | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_CaLamViecFrm` | `Register_WA_ShiftListFrm.sql`, `API_CaLamViec*`, FormatFields insert | `APP_MODULES['WA_CALAMVIECFRM']`, shift action | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_QuanLyNghiPhepNamFrm` | leave API + FormatFields insert | `APP_MODULES['WA_QUANLYNGHIPHEPNAMFRM']` | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_QuanLyNghiLeFrm` | `API_QuanLyNghiLe.sql`, FormatFields insert | DB-driven route only | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| `WA_DonXinNghiPhepFrm` | No tracked SQL/frontend reference found | None | `MISSING` |
| `API_HR_NghiPhep_ChiTiet`, `API_HR_NghiPhep_Attach` | No exact symbol/file found; nearest repo APIs use `API_QuanLyNghiPhepNam*` | None | `MISSING` |
| `WA_PayrollFrm` | Payroll API + FormatFields insert | `APP_MODULES['WA_PAYROLLFRM']`, process action | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_BangPhuCapFrm`, `WA_LuongKhoanFrm` | registration/FormatFields and CRUD SQL | `APP_MODULES['WA_BANGPHUCAPFRM']`, `APP_MODULES['WA_LUONGKHOANFRM']` | `IMPLEMENTED` (DB `DATA_REQUIRED`) |
| `WA_BangThamSoFrm`, `WA_BangThueTNCNFrm` | Register + FormatFields scripts | DB-driven route | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| Department/title/position/shift/job | `Register_WA_*ListFrm.sql`, corresponding APIs/combined insert | `/categories` delegates to DynamicFormEngine | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| Bank/hospital/nation/province/religion/education/leave type | Register + `API_DanhSach*` + metadata scripts | `/categories` delegates to DynamicFormEngine | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |
| Branches (`CF_BranchListFrm`) | `Register_CF_BranchListFrm.sql`, `API_DanhSachChiNhanh.sql` | DB-driven route | `GENERIC_CRUD_ONLY` (DB `DATA_REQUIRED`) |

## Matrix contract (cột bắt buộc cho Phase B)

The following is the audit shape requested for each ERP artifact. `UNVERIFIED` is deliberate: the two DB snapshots were not supplied, so this phase does not invent IDs, parent menus, flags, SQL parameters, `FormatID`, or physical objects.

| ERPForm / ERP artifact | WA_Menu: MenuID / Parent / FormName / FormKey / isDisable | SY_FrmLstTbl: FormID / FormType / TableName / PrimaryKey | WA_API: list / func / SQL / Para | SY_FormatFields: FormName / FieldName / FormatID / layout flags | SY_FmtFldTbl | table/view/SP evidence in repo | frontend module / route / action | status |
|---|---|---|---|---|---|---|---|---|
| `HR_PersonFullFrm.dat` → `WA_PersonFullFrm` | `UNVERIFIED` | `UNVERIFIED` | `API_HoSoNhanVien.sql` (columns/params unverified) | `UNVERIFIED` | `UNVERIFIED` | `HR_PersonTbl` appears in frontend payloads; DB object unverified | `APP_MODULES['WA_PERSONFULLFRM']`; DB-driven `/detail`; personnel actions | `IMPLEMENTED` + `DATA_REQUIRED` |
| `HR_HopDongLaoDongFrm.dat` → `WA_HopDongLaoDongFrm` | `UNVERIFIED` | `UNVERIFIED` | registration/API symbol unverified | FormatFields insert exists; row values unverified | `UNVERIFIED` | attachment/update scripts; object unverified | `APP_MODULES['WA_HOPDONGLAODONGFRM']`; `/detail`; export/attachment actions | `IMPLEMENTED` + `DATA_REQUIRED` |
| `HR_BaoHiemFrm.dat` → `WA_BaoHiemFrm` | `UNVERIFIED` | `UNVERIFIED` | `API_BaoHiem*`, save/lookup files; exact rows unverified | config/FormatFields scripts; values unverified | `UNVERIFIED` | `API_BaoHiem`, detail/lookup symbols | `APP_MODULES['WA_BAOHIEMFRM']`; `/detail`; lookup/calculate | `IMPLEMENTED` + `DATA_REQUIRED` |
| `HR_TimeSheetDayFrm.dat` → `WA_TimeSheetDayFrm` | `UNVERIFIED` | `UNVERIFIED` | process SP file; exact rows unverified | FormatFields insert; values unverified | `UNVERIFIED` | `WA_TimeSheetDay_Process_Stp` symbol | `APP_MODULES['WA_TIMESHEETDAYFRM']`; `/detail`; create-timesheet | `IMPLEMENTED` + `DATA_REQUIRED` |
| `HR_QuanLyNghiLeFrm.dat` → `WA_QuanLyNghiLeFrm` | `UNVERIFIED` | `UNVERIFIED` | `API_QuanLyNghiLe.sql`; exact rows unverified | FormatFields insert; values unverified | `UNVERIFIED` | API file only; table/SP unverified | DB-driven DynamicFormEngine route; no dedicated module | `GENERIC_CRUD_ONLY` + `DATA_REQUIRED` |
| Requested `WA_DonXinNghiPhepFrm` / `API_HR_NghiPhep_*` | `UNVERIFIED` | `UNVERIFIED` | no exact tracked symbol | no exact tracked row | `UNVERIFIED` | no exact tracked object | no module/route/action | `MISSING` |
| `HR_PayrollFrm.dat` → `WA_PayrollFrm` | `UNVERIFIED` | `UNVERIFIED` | `API_Payroll*`; exact rows unverified | FormatFields insert; values unverified | `UNVERIFIED` | payroll process/detail symbols | `APP_MODULES['WA_PAYROLLFRM']`; `/detail`; process action | `IMPLEMENTED` + `DATA_REQUIRED` |
| HR master-data `.dat` artifacts | `UNVERIFIED` (including `isDisable`) | `UNVERIFIED` | `API_DanhSach*` and `Register_WA_*ListFrm.sql`; exact rows unverified | mostly registration scripts; values unverified | `UNVERIFIED` | list APIs; table/view unverified | `/categories` → DynamicFormEngine; generic CRUD | `GENERIC_CRUD_ONLY` + `DATA_REQUIRED` |

## Interpretation

ERP artifact names establish candidate scope only. They do not prove database registration, permissions, or web behaviour. A row may only be labelled `DISABLED_IN_DB` after reading `WA_Menu.isDisable=1`; no such assertion is made here. The missing leave-request/attachment names require a deliberate contract decision in Phase B rather than aliases guessed from similarly named APIs.
