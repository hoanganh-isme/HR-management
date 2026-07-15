# HR `SY_FormatFields` contract — Phase A

## Required resolver precedence

For a `(FormName, FieldName)` pair, the web resolver must choose metadata in this order:

1. Per-form override in `SY_FormatFields`.
2. Form-specific dictionary in `SY_FmtFldTbl`.
3. Global dictionary in `SY_FmtFldTbl`.
4. Safe frontend fallback (log the missing/invalid field; never write to the database).

`SY_FmtFldTbl` is a legacy/generic dictionary. It must not overwrite a row in `SY_FormatFields`. `FormatID` must be explicit metadata; SQL type inference is not an acceptable release registration strategy.

## Evidence found in the repository

- `sql/API/API_DongBoTruongGiaoDien.sql` (and a duplicate definition in `sql/API/Combined_API.sql`) drops/recreates its procedure, removes fields no longer returned by the source object, infers `FormatID` from SQL types (`int`/`date`/`bit`), defaults `FormPosition='grid'`, and uses the database field name as a temporary caption. This is destructive and guess-based; it is **not** a safe default for production registration.
- `sql/API/API_LuuTruongGiaoDien.sql` drops/recreates the procedure and updates/inserts `SY_FormatFields` from caller-supplied values. It is usable only behind an explicit, validated write contract.
- `sql/API/API_LayCacTruongGiaoDien.sql` reads `SY_FormatFields` and joins `SY_FrmLstTbl`; it is the read path that should feed the resolver.
- `sql/API/API_XoaTruongGiaoDien.sql` deletes selected `SY_FormatFields` rows. It must not be called implicitly by reconciliation.
- `sql/Insert/Combined_Insert_Temp.sql` contains repeated blocks that delete rows from form config, `SY_FrmLstTbl`, `SY_FormatFields`, `WA_API`, and `WA_Menu` before inserting replacement metadata. It is a development/legacy bundle, not a release migration.
- `sql/Update/Update_frmFormBuilder.sql` deletes empty-form placeholder fields and changes dictionary values; it needs an explicit scope and backup before reuse.

## Safe modes for future work

- `ADD_ONLY`: insert only missing `(FormName, FieldName)` rows after duplicate checks; never delete or alter existing overrides.
- `RECONCILE_REPORT`: produce additions, conflicts, stale rows, and invalid `FormatID` values without writing.
- `EXPLICIT_UPDATE`: update an allow-listed key with a before/after audit record and rollback evidence.

`API_DongBoTruongGiaoDien` must not be used by default. If a compatibility wrapper is needed, introduce a new web-owned procedure (for example `HRM_RegisterWebFormSafe`) or an explicit mode parameter; preserve the old signature and add regression tests before changing callers.

## Duplicate and validation gates

Before any write, query for duplicate `(FormName, FieldName)` rows, verify the target form exists in `SY_FrmLstTbl`, validate `FormatID` against an allow-list, and compare captions/layout flags with the per-form contract. A missing snapshot prevents these checks from being run in this Phase A.

