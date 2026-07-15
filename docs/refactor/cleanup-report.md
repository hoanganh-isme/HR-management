# HR cleanup report

## Changed / removed

- Removed 7 unused banquet-only runtime units: Calendar/Booking/Visitor/
  Checkout/Report services, workflow transfer plugin, temporary save text, and
  the hall gauge component plus CSS.
- Removed banquet endpoint groups from `env.js` and stale static routes from
  the router. Rebuilt `src/js/app.bundle.js` and `src/css/styles.bundle.css`
  from the new manifest (917,364 bytes JS; 182,417 bytes CSS).
- Reworked master-data and component-demo pages to HR-only, metadata-driven
  entry points. Mock fixtures now cover employees, departments, shifts, leave,
  contracts and payroll.
- Added `ModuleDefinition`, `FormActionRegistry`, `ResponsiveDataRenderer`,
  `ApiClient.normalizeResponse`, and the manifest-driven Node build script.

## Contracts intentionally unchanged

- No backend source, SQL, stored procedure, view, schema, or ERP binary was
  changed.
- API request/response shapes, login/auth flow, permission/menu sync,
  `hrm_*`/`pmql_*` storage keys, and document API compatibility alias
  (`customerId`) remain intact.
- Dynamic DB routes continue to resolve via `APP_MODULES` and
  `DynamicFormEngine`; no menu records were deleted.

## Verification

- `node --check` on all 81 JavaScript files: 0 errors.
- `node scripts/build-frontend-bundle.mjs --check`: manifest valid (49 CSS,
  69 JS, no duplicate or missing entries).
- `node scripts/build-frontend-bundle.mjs`: succeeded and regenerated bundles.
- `node --test tests/frontend-contracts.test.mjs`: 5 passed (module metadata,
  async action registry, safe formulas, response normalization,
  document-export alias).
- Static scan of `src`, `env.js`, `scripts`, `index.html`, and `login.html` for
  banquet/hall/booking terms: 0 matches.
- Static scan for `eval`/`new Function` in runtime source and bundles: 0
  matches; metadata arithmetic uses `SafeFormula`.
- Static route/template check: 11 routes, 0 missing templates.
- `git diff --check`: passed (line-ending warnings only).

## Not run / remaining risk

Live login, permission sync, DB-backed forms, uploads/downloads, branch
filtering and mobile viewport smoke tests require a valid backend session and
database schema, which were not available in this workspace. The menu API can
still provide arbitrary dynamic routes; before deleting any future DB menu item,
capture a production menu export and verify its callers.
