# HRM web SQL migration plan — Phase A gate

## Decision

`sql/Deploy/HRM_Web_Install.sql` was **not created** and no SQL was executed. The required read-only inputs `scriptschema(1).sql` and `scriptdataa.sql` are absent, so object names, columns, keys, constraints, existing IDs, duplicate state, permissions, and `isDisable` values cannot be proven. Creating a release migration now would violate the requested safety gate.

## Inventory summary

| Area | Evidence |
|---|---:|
| Tracked SQL files | 182 |
| API folder files | 105 |
| Insert folder files | 55 |
| Update folder files | 9 |
| `Register_*.sql` | 27 |
| Files named `SY_FormatFields` | 18 |
| Files touching `WA_API` | 85 |
| Files touching `WA_Menu` | 31 |
| Files touching `SY_FrmLstTbl` | 67 |
| Files touching `SY_FormatFields` | 75 |
| Files touching `SY_FmtFldTbl` | 2 |

## Files that cannot be copied into a release migration

- `sql/Insert/Combined_Insert_Temp.sql`: broad per-form deletes and replacements across metadata tables.
- `sql/API/Combined_API.sql`: concatenated legacy procedures including destructive delete paths.
- `sql/API/API_DongBoTruongGiaoDien.sql`: deletes stale fields and guesses `FormatID`/layout.
- `sql/API/API_XoaMenu.sql`, `API_XoaTruongGiaoDien.sql`, and the delete-first `Register_*` scripts: destructive operations that need an explicit operator action, not installation-time behaviour.

The repository has no exact `API_DangKyFormWeb` symbol. Any compatibility work must therefore be designed against the supplied schema/data snapshot, not inferred from a similarly named script.

## Release migration design (for Phase B only)

The one-file migration will be written only after the snapshot is supplied and a dry-run report is reviewed. It will have:

1. `SET XACT_ABORT ON`, `SET NOCOUNT ON`, an explicit transaction, and preflight checks for required schemas/tables/columns/procedures.
2. `@DryRun` (or equivalent preflight-only mode) that reports planned inserts/updates/conflicts without writes.
3. `CREATE OR ALTER PROCEDURE` only for procedures owned by this web app; no replacement of shared legacy procedures.
4. Business-key upserts: `WA_Menu.MenuID`, `SY_FrmLstTbl.FormID`, `WA_API(list,func)`, and `SY_FormatFields(FormName,FieldName)` after duplicate checks. Permission upserts use existing `UserGroupID+MenuID` identities; no user/password/PII/test permission seed.
5. No broad `DELETE`, no `IDENTITY_INSERT` unless proven necessary, and a single allow-listed config override section.
6. Pre/post counts, duplicate/orphan checks, audit summary, and a rollback/temporary-backup plan.
7. Idempotency evidence from two consecutive dry-run/apply test cycles against a disposable test database.

## Required inputs before implementation

- Exact UTF-16LE `scriptdataa.sql` (or an equivalent sanitized test seed) and `scriptschema(1).sql`.
- A snapshot report for metadata tables: row counts, primary/unique keys, duplicate candidates, and hashes of relevant rows.
- Confirmation of web-owned stored procedures and the intended form/menu allow-list.
- A disposable SQL Server test database for rollback and twice-run idempotency tests.

