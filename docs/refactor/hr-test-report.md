# HRM Phase A test and metadata report

Date: 2026-07-15  
Branch: `refactor/hr-cleanup`

## Read-only inputs

- ERP archive inventory completed from `D:\chuyenfile\NhanSu2.zip`; no configuration/connection contents were read.
- Required DB snapshots `scriptschema(1).sql` and `scriptdataa.sql`: **not present**. Therefore DB metadata counts, UTF-16LE decoding, 7,232 INSERT count, 14-table scope, procedure/view count, and row hashes are **not available**.
- No production database connection or migration was attempted.

## Repository metadata counts

These are file/reference counts, not database row counts: 182 SQL files; 105 API; 55 Insert; 9 Update; 27 `Register_*`; 18 `SY_FormatFields`-named inserts/config files. Reference files include 85 touching `WA_API`, 31 `WA_Menu`, 67 `SY_FrmLstTbl`, 75 `SY_FormatFields`, and 2 `SY_FmtFldTbl`.

## Frontend checks

Run after documentation changes:

- `node --check` over every `src/**/*.js` file.
- `node scripts/build-frontend-bundle.mjs --check`.
- `node --test tests/frontend-contracts.test.mjs`.
- `git diff --check`.

These checks cover syntax, manifest/bundle integrity, and existing frontend contracts only. They do not replace SQL Server tests.

## Exit criteria for Phase A

Complete for source/ERP inventory; blocked for DB comparison and migration because the two required snapshots are missing. Phase B remains gated until the sanitized schema/test seed and a disposable SQL Server instance are supplied.

