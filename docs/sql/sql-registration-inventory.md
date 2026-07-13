# SQL registration and seed inventory

## Registry strategy

`SY_FrmLstTbl` is the authoritative registry for available form resources. The
read-only procedure `API_TheoDoiTaiNguyenFormWeb` inspects that registry, its
`WA_API` routes and field metadata without changing data.

Rows with the same `FieldName` in `SY_FormatFields` are not automatically
duplicates because the effective key is `(FormName, FieldName)`. Shared labels
and base render formats such as `DocumentID`, `PeriodID`, `BranchID` and
`PersonID` belong in the global `SY_FmtFldTbl` dictionary (`FormName` null or
empty). Form-specific behavior remains in `SY_FormatFields`. No existing field
row is compacted or deleted automatically by this refactor.

## Module inventory

| Module | FormName | TableName / PrimaryKey | View / Save / Delete | Custom operations | Register / insert source | Seed table and key | Rerunnable now | Current DELETE safety | Script-owned data | Business data | Difference from union fee |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Core form registration | n/a | `SY_FrmLstTbl.FormID` | `API_DangKyFormWeb` / `API_LuuDong` / `API_XoaDong` | operations JSON | `sql/API/API_DangKyFormWeb.sql` | `WA_API(list,func)`, `SY_FormatFields(FormName,FieldName)` | Partial before refactor | Registration used `MERGE`; sync could delete all fields after failed discovery | Form/API/field metadata | None | This is the shared mechanism used by union fee |
| Union fee | `WA_KinhPhiCongDoanFrm` | `HR_KinhPhiCongDoanTbl` / `UserAutoID` | `API_KinhPhiCongDoan` / `API_LuuDong` / `API_XoaDong` | `API_Calculate_MucDong_CongDoan` datasource | `sql/Insert/Insert_WA_KinhPhiCongDoanFrm.sql` | form/API/field metadata; `(FormName,FieldName)` | Mostly | Scoped API upsert, but not one transaction | Registration and overrides | `HR_KinhPhiCongDoanTbl` | Golden registration pattern; it has no master `DocumentID`, detail table, Generate SP or lock rule |
| Insurance master | `WA_BaoHiemFrm` | `HR_BaoHiemTbl` / `DocumentID` | `API_BaoHiem` / `WA_BaoHiemFrm_Save` / `API_XoaDong` | calculate and person lookup | `sql/Insert/Insert_WA_BaoHiemFrm_Config.sql` | many metadata tables; form IDs and generated IDs | No | Unsafe: deletes form, menu, permissions-related metadata and all API routes | Form metadata, filter and dictionary rows | `HR_BaoHiemTbl`, `HR_BaoHiemChiTietTbl` | Real master/detail document; custom save and calculation contracts |
| Insurance detail | `API_BaoHiem_Detail` | `HR_BaoHiemChiTietTbl` / `UserAutoID` | `API_BaoHiem_Detail` / generic / generic | none | same insurance insert | `(FormName,FieldName)` | No | Deletes all detail form metadata | Detail metadata | Insurance detail rows | Scoped by `DocumentID` |
| Payroll | `WA_PayrollFrm` | `HR_PayrollTbl` / `DocumentID` | `API_Payroll` / generic / generic | `WA_PayRoll_Process_Stp` | `sql/Insert/Insert_WA_PayrollFrm_SY_FormatFields.sql` | form/API/menu metadata | No | Unsafe form/menu/API deletion | Registration and field metadata | Payroll documents and details | Process operation must remain SP-owned and period-scoped |
| Shift planning | `WA_CaLamViecFrm` | `HR_SapCaTbl` / `SapCaID` | `API_CaLamViec` / generic / generic | direct auto-assign, employee detail | `sql/Insert/Insert_WA_CaLamViecFrm_SY_FormatFields.sql` | form/API/menu metadata | No | Deletes both master/detail registrations and menu | Registration and field metadata | Shift assignments | Uses `SapCaID`, not union-fee employee-row key |
| Employment contract | `WA_HopDongLaoDongFrm` | `HR_HopDongTbl` / `MaHopDong` | `API_HopDongLaoDong` / generic / generic | detail, attachment, year/type lookup | `sql/Insert/Insert_WA_HopDongLaoDongFrm_SY_FormatFields.sql` | three form registrations and metadata | No | Deletes form/menu/API metadata across three lists | Registration, attachment and detail metadata | Contracts, allowances, attachments | Contract validation remains in SP; no fee calculation |
| Employee profile | `WA_PersonFullFrm` | `HR_PersonTbl` / `PersonID` | `API_HoSoNhanVien` / generic / generic | details, attachment, avatar | `sql/Insert/Insert_HoSoNhanVien.sql`; `Register_API_HoSoNhanVien_CRUD.sql` | many form/API/menu records | No | Broad deletes include detail forms and prefix-matched API lists | Registration and UI metadata | Employee profiles and attachments | Aggregate root is `PersonID`, not period/document |
| Recruitment | `WA_DanhSachUngVienFrm` | candidate tables / candidate key | `API_QuanLyUngVien` / generic / generic | education, experience, interview, certificate | `sql/Insert/Insert_WA_DanhSachUngVienFrm.sql` | form/API/menu metadata | No | Broad deletes across five API lists and menu | Registration and UI metadata | Candidate records | Candidate lifecycle, no period scope |
| Annual leave | `WA_QuanLyNghiPhepNamFrm` | leave master / script-defined key | report/list SP / generic / generic | detail | `sql/Insert/Insert_WA_QuanLyNghiPhepNamFrm_SY_FormatFields.sql` | form/API/menu metadata | No | Deletes full form and detail registration | Registration and UI metadata | Leave balances and usage | Balance calculation must remain in SP |
| Holiday | `WA_QuanLyNghiLeFrm` | holiday table / script-defined key | holiday SP / generic / generic | none | `sql/Insert/Insert_WA_QuanLyNghiLeFrm_SY_FormatFields.sql` | form/API/menu metadata | No | Deletes complete form and menu metadata | Registration and UI metadata | Holiday catalog | Catalog-style rather than document-style |
| Timesheet | `WA_TimeSheetFrm`, `WA_TimeSheetDayFrm` | attendance tables / script-defined keys | attendance SPs / generic / generic | daily process | `sql/Insert/Insert_WA_TimeSheet*` | form/API/menu metadata | No | Deletes full registrations and report routes | Registration and report metadata | Attendance rows | Processing must be branch/period scoped |
| HR reports | report form names | report-only / no writable PK | report SP / n/a / n/a | export/template | `sql/Insert/Insert_WA_BaoCao*`, `Insert_WA_TimeSheet*Report*` | report field/filter/API metadata | Partial | Several scripts delete all fields/routes for one report; menu deletes also exist | Report metadata | None | Read-only forms do not need generic Save/Delete |
| Reference lists | `WA_*ListFrm`, `CF_BranchListFrm`, `SY_Period` | catalog tables / per-script key | dynamic/list SP / generic / generic | occasional lookup | `sql/Insert/Register_WA_*ListFrm.sql`, `Register_Remaining_List_Forms.sql` | `SY_FrmLstTbl`, `WA_API`, `SY_FormatFields` | No | Most delete the complete form/API registration before recreating | Registration metadata | Existing catalog rows | Catalog data must never be reseeded by registration |
| System users/groups | `WA_NguoiDungFrm`, `WA_NguoiDungNhomFrm` | system tables / configured keys | dedicated SPs / generic or dedicated / generic | group membership | `Register_WA_NguoiDung*.sql` | form/API/field metadata | No | Deletes aliases and metadata; requires ownership review | Registration metadata | Users, groups, permissions | Security data is never script-owned |

## Golden-reference findings

Files inspected as the union-fee reference:

- `sql/API/APINEW/API_KinhPhiCongDoan.sql`
- `sql/Insert/Insert_WA_KinhPhiCongDoanFrm.sql`
- `sql/Update/Fix_WA_KinhPhiCongDoanFrm_Parameters.sql`
- the union-fee sections in both combined SQL files

The useful pattern is declarative registration through `API_DangKyFormWeb` and
JSON field overrides. The current module is not a valid template for a
document generator: it has one table (`HR_KinhPhiCongDoanTbl`), no
`DocumentID`, no detail table, no `Generate` operation, no `IsManual` or
`IsLocked` preservation rule, and calculation currently exists only as a
lookup SP. Those missing contracts must not be invented or copied into other
modules.

## Unsafe legacy scripts

Legacy `Insert_*` exports that delete `SY_FrmLstTbl`, `WA_Menu`, permission
metadata or complete `SY_FormatFields` sets are retained for deployment
compatibility but must not appear in the new install order. They require a
module-by-module conversion because their generated IDs and ownership differ.
No business HR table is considered script-owned, and this task performs no
business-data cleanup.
