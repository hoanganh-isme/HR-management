# SQL deployment and rollback

## Deployment model

Run `sql/install-order.txt` from the repository root in SQLCMD mode. Start with
`API_TheoDoiTaiNguyenFormWeb` on the target database to inventory usable
resources and repeated field names. The tracker is read-only.

`SY_FrmLstTbl` remains the form resource registry. `SY_FormatFields` continues
to hold form-specific behavior required by the current DynamicFormEngine
contract. Shared captions and base formats are seeded once in the global
`SY_FmtFldTbl` dictionary, so module register scripts do not repeat those
values. Existing metadata is not compacted automatically.

## Changed files

- `sql/API/API_DangKyFormWeb.sql`: transactional registration, operations JSON,
  locked upsert and summary counts.
- `sql/API/API_DongBoTruongGiaoDien.sql`: set-based discovery, table fallback
  from the form registry, no cursor, no default pruning.
- `sql/API/API_LuuTruongGiaoDien.sql`: nullable update options and insert-only
  defaults.
- `sql/Insert/Insert_WA_KinhPhiCongDoanFrm.sql`: canonical union-fee register.

## New files

- Read-only registry tracker and shared-field dictionary seed.
- Canonical register scripts for insurance, payroll, shift, contract and
  employee modules.
- Duplicate/index verification, contract verification and two-run idempotency
  test.
- Install-order and rollback scripts.

## DELETE scope

`API_DangKyFormWeb` deletes only `WA_API` rows whose `list` equals the supplied
`FormName`, and only when `@ReplaceOperations = 1`. Field synchronization does
not delete by default; callers must explicitly pass `@DeleteMissingFields = 1`
after successful discovery. No new script deletes `SY_FrmLstTbl`, menu,
permission or business HR rows.

The shared dictionary seed performs update-then-insert and has no `DELETE`.
Compatibility routes outside the main form lists are update-then-insert and
preserve routes owned by other systems.

## Idempotency evidence

`sql/verify-idempotency.sql` runs the shared seed and all canonical register
scripts twice in one SQLCMD session. It captures total counts after each run
and throws if form, API or field counts increase on run two. Actual run-one and
run-two values must be recorded from the target environment because this
repository does not contain a database connection or production data.

Local SQL Server 2019 validation used an isolated scratch schema containing
only registry tables, module key columns and metadata-only SP stubs. Results:

| Metric | Run 1 | Run 2 |
|---|---:|---:|
| `SY_FrmLstTbl` rows | 29 | 29 |
| `WA_API` rows | 102 | 102 |
| `SY_FormatFields` rows | 70 | 70 |
| Shared dictionary rows inserted | 12 | 0 |

The second run also passed after the three unique indexes were created. The
core safety test confirmed that failed metadata discovery preserves existing
field rows and that omitted optional parameters do not reset metadata flags.
These counts validate script behavior, not production contents; target counts
must still be captured during deployment.

## Duplicate handling

Duplicate `(list, func)`, `(FormName, FieldName)` and `FormID` rows are reported
before unique indexes are considered. Dirty sets are left unchanged and do not
receive an index. This task performs no arbitrary canonical-row selection,
backup or duplicate cleanup.

## Rollback

1. Stop after a failed script; `XACT_ABORT` and `TRY/CATCH` roll back that
   script's transaction.
2. Run `sql/rollback-registration-refactor.sql` to remove only unique indexes
   introduced by verification.
3. Redeploy the previous versions of the three core procedures if code rollback
   is required.
4. Do not delete registrations to roll back. Restore metadata values from the
   pre-deployment database backup or approved audit snapshot.

## Production risks

- DMV result-set discovery can fail for procedures that use temporary tables;
  synchronization falls back to the registered table and requires virtual or
  computed fields in `@Overrides`.
- A database with existing duplicate API/form/field keys blocks canonical
  registration until duplicates are reviewed.
- Legacy generated insert scripts remain destructive and are intentionally
  excluded from the new install order.
- Union fee is not a true master/detail document module in the current schema;
  no `Generate`, lock or manual-row preservation contract was invented.
