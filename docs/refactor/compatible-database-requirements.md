# Compatible database requirements

## Compatibility boundary

A replacement database can be used without frontend source changes when it preserves the registered stored-procedure/API contracts. The frontend does not depend on table layout and does not reproduce HR calculations in JavaScript.

## Required router contract

The gateway endpoint must continue accepting these fields with their current meaning:

- `List`: registered SP/API list name.
- `FormName`: compatible form/list name.
- `Func`: operation such as View, Save, Delete, Edit, or a configured action.
- `JsonData`: JSON string for operation input.
- `Limit`, `Page`, `Keyword`: optional paging/search controls.
- Existing context fields such as `UserName`, `User`, sorting, and branch filters.

Responses must preserve `code`, `msg`, record collections (`records`, `list`, or the existing compatible alias), and paging metadata (`_recordtotal`, `_pagetotal`) where paging is used. Empty results must be successful empty collections; operation failures must return a non-zero code or reject the HTTP request.

## Contract-critical behavior

The database remains the source of truth for insurance calculation, payroll, attendance aggregation, leave balance, shift auto assignment, contract validation, approval, and data locking. A compatible database must implement those behaviors in its SP layer rather than requiring frontend formulas.

Primary keys and owner/row IDs must retain their configured names and types. In particular, module configs declare `PrimaryKey`, detail `filterField`, detail `rowIdField`, attachment `ownerField`, lookup `keyField`, required fields, duplicate keys, and output mappings. Changing any of these requires a config-contract migration.

## Dashboard contract

Dashboard report SPs must honor the caller's authorized branch scope and must not synthesize a default company branch. Payroll reporting must return numeric `totalSalary` and `headcount`; `avgSalary` is optional and is computed as `totalSalary / headcount` only when absent and headcount is greater than zero.

## System settings contract

`API_HR_SystemSettings` should return one row with:

- `CompanyName`
- `CompanyLogo`
- `Locale`
- `Timezone`
- `Currency`
- `EmployeeCodeLength`
- `EmployeePrefixMode`
- `MaxUploadSizeMB`

The client has a neutral compatibility fallback for unavailable or older databases. Company identity is not embedded in frontend source.

## Migration checklist

1. Register every `sp` listed in module `operations`, `actions`, `lookups`, `details`, and `attachments`.
2. Verify View/Save/Delete payloads against the fixture tests.
3. Verify paging, `code/msg`, null/empty behavior, numeric types, and branch scope.
4. Verify business-action outputs and error handling without moving calculations to JavaScript.
5. Run `node --test tests/sp-contracts.test.mjs` and rebuild bundles from `scripts/frontend-bundle.manifest.json`.

No login, token, backend-authentication, route, FormName, PrimaryKey, database schema, or stored-procedure implementation change is part of this frontend phase.
