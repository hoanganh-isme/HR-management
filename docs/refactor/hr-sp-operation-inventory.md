# HR stored procedure operation inventory

## Scope

This inventory covers frontend HR operations found by scanning `ApiClient.post`, `GatewayClient`, `List`, `Func`, `FormName`, `JsonData`, `dataSource`, `api`, and `API_Gateway_Router`. Login, authentication, backend-only document transport, and SQL implementation files are intentionally excluded.

After this refactor, every row below is invoked through `GatewayClient`. `Direct ApiClient` therefore records whether a direct call remains in frontend source, not whether the operation uses the generic router or a dedicated compatible endpoint.

## Operations

| Domain | Module | Operation | SP / API list | Func | Input | Expected output | Primary key | Called from | Type | Direct ApiClient | DB-change risk |
|---|---|---|---|---|---|---|---|---|---|---|---|
| system | users | list/save/delete | `WA_NguoiDungFrm` | View/Save/Delete | paging, keyword, user fields | `code`, `msg`, records | metadata-defined | `src/js/modules/system/users.module.js` | CRUD | No | Medium: field metadata/types |
| system | user groups | list/save/delete | `WA_NguoiDungNhomFrm` | View/Save/Delete | paging, keyword, group fields | `code`, `msg`, records | metadata-defined | `src/js/modules/system/user-groups.module.js` | CRUD | No | Medium: permission fields |
| system | settings | read | `API_HR_SystemSettings` | View | none | CompanyName, CompanyLogo, Locale, Timezone, Currency, EmployeeCodeLength, EmployeePrefixMode, MaxUploadSizeMB | none | `src/js/modules/system/system-settings.module.js` | Lookup | No | High: required setting names |
| system | metadata | form fields | `API_LayCacTruongGiaoDien` | View | FormName | field metadata | FormName + field | `src/js/core/metadata/MetadataService.js` | Lookup | No | High: renderer metadata |
| system | form builder | load/save layout | `frmFormBuilder` / target FormName | View/Save | FormName, field metadata | `code`, `msg`, records | FormName + FieldName | `src/js/utils/FormBuilderPlugin.js` | Business action | No | High: metadata contract |
| system | periods | list/lock | `SY_Period` | View/Edit | PeriodID, isLock | `code`, `msg`, records | PeriodID | `src/js/services/PeriodManager.js` | CRUD/action | No | High: data-locking behavior |
| employee | employees | list/save/delete | `WA_PersonFullFrm` | View/Save/Delete | employee fields, branch, paging | employee records | PersonID | `src/js/modules/people/employees.module.js` | CRUD | No | High: employee schema |
| employee | employees | status lookup | `API_ComboPersonStatus` | View | keyword | status rows | status code | `employees.module.js` | Lookup | No | Low |
| employee | employees | salary history | `API_PersonFull_T1_Salary` | View | PersonID | salary/history rows | row metadata | `employees.module.js` | Detail | No | Medium |
| employee | employees | reward/discipline | `API_PersonFull_T3_KTKL` | View | PersonID | reward rows | row metadata | `employees.module.js` | Detail | No | Medium |
| employee | employees | leave history | `API_PersonFull_T4_NghiPhep` | View | PersonID | leave rows | row metadata | `employees.module.js` | Detail | No | Medium |
| employee | employees | relations | `API_PersonFull_T5_Relation` | View | PersonID | relation rows | RelationID | `employees.module.js` | Detail | No | Medium |
| employee | employees | contract history | `API_PersonFull_T6_HopDong` | View | PersonID | contract rows | MaHopDong | `employees.module.js` | Detail | No | Medium |
| employee | employees | assignment history | `API_PersonFull_T7_CongTac` | View | PersonID | assignment rows | row metadata | `employees.module.js` | Detail | No | Medium |
| employee | employees | audit history | `API_PersonFull_T8_Log` | View | PersonID | audit rows | row metadata | `employees.module.js` | Detail | No | Medium |
| employee | employees | documents | `API_PersonFull_T9_GiayTo` | View | PersonID | document rows | DocumentID | `employees.module.js` | Detail | No | Medium |
| employee | employees | avatar/attachment | `API_PersonAttach` | View/SaveAvatar | owner field, file metadata/content | attachment rows / status | UserAutoID | `employees.module.js`, `WizardForm.js` | Attachment | No | High: binary fields |
| recruitment | candidates | list/save/delete | `WA_DanhSachUngVienFrm` | View/Save/Delete | candidate fields, paging | candidate records | CandidateID | `src/js/modules/recruitment/candidates.module.js` | CRUD | No | High |
| recruitment | candidates | interviews | `API_QuanLyUngVien_PhongVan` | View | CandidateID | interview rows | row metadata | `candidates.module.js` | Detail | No | Medium |
| recruitment | candidates | experience | `API_QuanLyUngVien_KinhNghiem` | View | CandidateID | experience rows | row metadata | `candidates.module.js` | Detail | No | Medium |
| recruitment | candidates | education | `API_QuanLyUngVien_HocVan` | View | CandidateID | education rows | row metadata | `candidates.module.js` | Detail | No | Medium |
| recruitment | candidates | certificates | `API_QuanLyUngVien_ChungChi` | View | CandidateID | certificate rows | row metadata | `candidates.module.js` | Detail | No | Medium |
| recruitment | candidates | avatar/attachment | `API_CandidateAttach` | View/SaveAvatar | owner field, file metadata/content | attachment rows / status | UserAutoID | `candidates.module.js`, `WizardForm.js` | Attachment | No | High: binary fields |
| contract | employment contract | list/save/delete | `WA_HopDongLaoDongFrm` | View/Save/Delete | contract fields, paging | contract records | MaHopDong | `src/js/modules/contracts/employment-contract.module.js` | CRUD | No | High: validation remains in SP |
| contract | employment contract | allowances | `API_HopDongLaoDong_ChiTiet` | View/Save/Delete | MaHopDong, allowance row | allowance rows | UserAutoID | `employment-contract.module.js` | Detail CRUD | No | High: owner/row ID fields |
| contract | employment contract | allowance lookup | `WA_BangPhuCapFrm` | View | keyword | allowance rows | MaPhuCap | `employment-contract.actions.js` | Lookup | No | Medium: mapped fields |
| contract | employment contract | attachments | `API_HopDongLaoDong_Attach` | View/Save/Delete | MaHopDong, file fields | attachment rows / status | UserAutoID | `employment-contract.module.js` | Attachment | No | High: owner/row ID fields |
| contract | employment contract | year/type filters | `API_HopDongLaoDong_NamLap`, `API_HopDongLaoDong_LoaiHD` | View | keyword | lookup rows | returned code | `employment-contract.module.js` | Lookup | No | Low |
| contract | document export | template lookup | `HR_HopDongAddfile` | View | form keyword | template rows | TemplateFile | `src/js/utils/DocumentExportPlugin.js` | Lookup | No | Medium |
| shift | shift planning | list/save/delete | `WA_CaLamViecFrm` | View/Save/Delete | shift-plan fields, paging | shift-plan records | SapCaID | `src/js/modules/time/shift-planning.module.js` | CRUD | No | High |
| shift | shift planning | employees | `API_CaLamViec_NhanVien` | View/Save/Delete | SapCaID, employee row | employee rows | UserAutoID | `shift-planning.module.js` | Detail CRUD | No | High: duplicate/row keys |
| shift | shift planning | schedule | `API_CaLamViec_ChiTiet` | View | SapCaID | generated schedule rows | UserAutoID | `shift-planning.module.js` | Detail | No | Medium |
| shift | shift planning | employee lookup | `HR_PersonTbl` | View | keyword | employee rows | PersonID | `shift.actions.js` | Lookup | No | Medium: field mapping |
| shift | shift planning | auto assign | `HR_CaLamViec_SapCaStp` | dedicated endpoint | SapCaID | `code`, `msg` | SapCaID | `shift.actions.js` | Business action | No | High: SP owns assignment rules |
| attendance | timesheet | daily list | `WA_TimeSheetDayFrm` | View | period, branch, paging | timesheet rows | UserAutoID | `src/js/modules/time/timesheet.module.js` | CRUD/read | No | High |
| attendance | timesheet | generate daily sheet | `WA_TimeSheetDay_Process_Stp` | View | PeriodID, BranchID | `code`, `msg` | PeriodID | `src/js/plugins/timesheet/TimesheetActions.js` | Business action | No | High: aggregation remains in SP |
| leave | annual leave | list/save/delete | `WA_QuanLyNghiPhepNamFrm` | View/Save/Delete | employee/year fields | leave balance rows | PersonID | `src/js/modules/leave/annual-leave.module.js` | CRUD | No | High: balance remains in SP |
| leave | annual leave | detail | `API_QuanLyNghiPhepNam_ChiTiet` | View | PersonID | annual leave detail | row metadata | `annual-leave.module.js` | Detail | No | High |
| insurance | insurance | list/save/delete | `WA_BaoHiemFrm` | View/Save/Delete | document fields, paging | insurance documents | DocumentID | `src/js/modules/insurance/insurance.module.js` | CRUD | No | High |
| insurance | insurance | contribution detail | `API_BaoHiem_Detail` | View/Save/Delete | DocumentID, person fields | contribution rows | UserAutoID | `insurance.module.js` | Detail CRUD | No | High |
| insurance | insurance | eligible employees | `WA_BaoHiemFrm_PersonID` | View | BranchID, LoaiBaoHiem, DocumentID | employee contribution candidates | PersonID | `insurance.actions.js` | Lookup | No | High: direct output fields preferred |
| insurance | insurance | calculate contribution | `WA_BaoHiemFrm_Calculate` | View | PeriodID, LoaiBaoHiem, MucDong | contribution amount fields | none | `insurance.actions.js` | Business action | No | High: calculation remains in SP |
| insurance | union fee | list/save/delete | `WA_KinhPhiCongDoanFrm` | View/Save/Delete | document fields, paging | union-fee records | metadata-defined | `src/js/modules/insurance/union-fee.module.js` | CRUD | No | High |
| payroll | payroll | list/save/delete | `WA_PayrollFrm` | View/Save/Delete | period/employee fields | payroll rows | metadata-defined | `src/js/modules/payroll/payroll.module.js` | CRUD | No | High |
| payroll | payroll | detail | `API_Payroll_Detail` | View | payroll owner filter | payroll detail rows | UserAutoID | `payroll.module.js` | Detail | No | High |
| payroll | payroll | calculate period | `WA_PayRoll_Process_Stp` | View | PeriodID | `code`, `msg` | PeriodID | `src/js/plugins/payroll/PayrollActions.js` | Business action | No | High: payroll remains in SP |
| payroll | piecework | list/save/delete | `WA_LuongKhoanFrm` | View/Save/Delete | period/employee fields | piecework rows | metadata-defined | `piecework.module.js` | CRUD | No | High |
| payroll | allowance | list/save/delete | `WA_BangPhuCapFrm` | View/Save/Delete | allowance fields | allowance rows | MaPhuCap | `allowance.module.js` | CRUD | No | Medium |
| payroll | allowance | detail | `API_BangPhuCap_Detail` | View | MaPhuCap | allowance detail rows | UserAutoID | `allowance.module.js` | Detail | No | Medium |
| dashboard | dashboard | branches | `API_HR_Dashboard_GetBranches` | View | authorized BranchID | branch rows | BranchID | `src/js/modules/dashboard/dashboard.module.js` | Report lookup | No | Medium: branch scope |
| dashboard | dashboard | today overview | `API_HR_Dashboard_OverviewToday` | View | BranchID | headcount/status metrics | none | `dashboard.module.js`, `dashboard.js` | Report | No | High: required metric names |
| dashboard | dashboard | demographics | `API_HR_Dashboard_Demographics` | View | BranchID | groupType/label/value rows | none | `dashboard.module.js`, `dashboard.js` | Report | No | Medium |
| dashboard | dashboard | department | `API_HR_Dashboard_Department` | View | BranchID | groupType/label/value rows | none | `dashboard.module.js`, `dashboard.js` | Report | No | Medium |
| dashboard | dashboard | birthdays | `API_HR_Dashboard_Birthdays` | View | BranchID | birthday rows | PersonID if returned | `dashboard.module.js`, `dashboard.js` | Report | No | Medium |
| dashboard | dashboard | payroll | `API_HR_Dashboard_Payroll` | View | PeriodID, BranchID | totalSalary, headcount, optional avgSalary | none | `dashboard.module.js`, `dashboard.js` | Report | No | High: numeric types |
| dashboard | dashboard | expiring contracts | `API_HR_Dashboard_ContractsExpiring` | View | Days, BranchID | employee/expiry/status rows | MaHopDong if returned | `dashboard.module.js`, `dashboard.js` | Report | No | Medium |
| document | contract documents | generated file | document server `/generate` | direct HTTP | template, row, branch | generated file status | document ID | `DocumentExportPlugin.js` | Business action | Yes, non-SP | Low for DB; separate backend contract |

## Risk interpretation

- Low: lookup labels or optional presentation data.
- Medium: result field names, paging shape, or declarative mappings must remain compatible.
- High: primary keys, owner/row IDs, required output amounts, branch scoping, locking, validation, or business calculations are contract-critical.

