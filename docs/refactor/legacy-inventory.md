# Legacy inventory — HR cleanup

## Baseline

- Branch: `refactor/hr-cleanup` (created from the working tree on 2026-07-15).
- The requested survey commit `601c564719d4a0f886ea203decbfdf33aa53e69e`
  was not the checked-out `HEAD` (`0df51f4`); work proceeded from the actual
  current tree without resetting it.
- The working tree already contained user changes in `src/js/app.bundle.js`,
  `src/css/styles.bundle.css`, `src/js/core/router.js`, `login.html`, and
  `backend-app/storage/`; these were preserved.
- 82 source JavaScript files were checked with `node --check` before the
  refactor; 0 syntax errors were reported. Existing bundle sizes were 949,000
  bytes (JS) and 184,566 bytes (CSS).
- The repository did not contain the referenced `scripts/` or `docs/refactor/`
  structure, so the manifest/build entry point and this inventory were added.
- No ERP archive, database dump, or backend source was changed or added.

## Decision table

| Path / symbol | Layer | Runtime consumer evidence | Decision | Risk / follow-up |
|---|---|---|---|---|
| `src/js/services/CalendarService.js` | service | No source page or module references; only the service and generated bundle referenced it | REMOVE | Verify no DB menu points at a calendar route before enabling any replacement HR calendar |
| `src/js/services/BookingService.js` | service | No source consumer; only legacy booking endpoints and transfer code | REMOVE | Backend endpoints remain untouched |
| `src/js/services/VisitorService.js` | service | No source consumer | REMOVE | Reintroduce only through an HR metadata adapter if a real HR workflow needs it |
| `src/js/services/CheckoutService.js` | service | No source consumer | REMOVE | Backend contract is unchanged |
| `src/js/services/ReportService.js` | service | No HR page consumer; methods were revenue/cost specific | REMOVE | HR reports should use metadata/gateway repository when a route is supplied |
| `src/js/utils/WorkflowTransferPlugin.js` | utility | No source consumer; only visitor → booking/session keys | REMOVE | Do not delete any backend menu/API records |
| `src/js/temp_save.txt` | scratch | Backup text file, never loaded by runtime | REMOVE | None |
| `src/components/hall-gauge/*` | component | No source consumer; component name and classes were hall-specific | REMOVE | Generic metric cards remain available |
| `SystemDataService.getHalls/getBanquetTypes` | service API | No source consumer; Navbar uses only setup/menu version and HR shifts | REMOVE | Kept `getShifts`, setup, and cache invalidation |
| `SYSTEM.HALLS`, `SYSTEM.BANQUET_TYPES` and legacy booking/report groups in `env.js` | config | Only removed services referenced them | REMOVE | API/DB server contract is not modified |
| `/calendar`, `/promotions`, `/report-*`, `/survey`, `/hall-status` | router | Templates/scripts are absent from the repository | REMOVE | Dynamic DB routes remain supported; verify menu data before adding any HR route |
| `src/pages/categories/categories.js` | page | Static implementation was a banquet/goods mock | REFACTOR | Now an HR master-data landing page that delegates CRUD to DynamicFormEngine |
| `src/pages/components-demo/components-demo.js` | demo | Demo card/table/chart used hall/customer/booking data | REFACTOR | Uses employee, department, shift, leave and payroll-shaped fixtures only |
| `src/js/data/mockData.js` | demo fixtures | Permission and component gallery consumers | REFACTOR | HR-only fixtures; not used by production API paths |
| `src/js/utils/DocumentExportPlugin.js` | plugin | Used by dynamic forms | REFACTOR + COMPATIBILITY | Internal `documentId` added; `customerId` alias is still sent for the existing document API |
| `src/js/core/DynamicFormEngine.js` | core | Runtime entry for DB menus and HR modules | KEEP + REFACTOR | Normalizes module capabilities without changing API/storage/auth contracts |
| `src/js/core/router.js` | core | Runtime entry and dynamic DB route loader | KEEP + REFACTOR | Static banquet routes removed; dynamic route compatibility retained |
| `src/js/services/SystemDataService.js` | service | Navbar and HR setup/shift consumers | KEEP + REFACTOR | Shared HR setup/shift repository only |
| `src/components/table/*`, `src/components/calendar/*` | shared UI | Generic table/calendar consumers | KEEP + REFACTOR | Removed hall/booking selectors; retained generic responsive behavior |
| `src/css/design-tokens.css` | tokens | Global CSS | KEEP + REFACTOR | Replaced booking token with attendance/leave/payroll semantics |

## Compatibility boundary

Dynamic routes from the permission/menu API are intentionally not filtered by
business name. A menu record can still supply a route and `FormName`; the router
resolves it through `APP_MODULES` or `DynamicFormEngine`. This preserves existing
menu, permission, storage (`hrm_*` / `pmql_*`), login, and API response contracts.
No SQL, stored procedure, view, database schema, or ERP binary was changed.
