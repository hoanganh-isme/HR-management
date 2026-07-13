# Frontend architecture

## Runtime order

`index.html` loads `env.js`, then the generated `src/js/app.bundle.js`. The bundle order is owned by `scripts/frontend-bundle.manifest.json` and built by `scripts/build-frontend-bundle.mjs` (or the `build.ps1` compatibility wrapper).

## Layers

- `app/`: bootstrap, current-user context, storage migration and legacy adapters.
- `config/`: application, endpoint, theme and feature-flag defaults.
- `core/metadata/`: composable module definitions and registry.
- `core/dynamic-form/`: state, repository, schema, validation, rendering and safe formula services behind `window.DynamicFormEngine`.
- `core/registry/`: field renderer, form action, detail tab and plugin registries.
- `data/`: Gateway payload wrapper and repositories; `ApiClient` remains unchanged.
- `modules/`: HR form definitions grouped by domain. `ModuleRegistry.toLegacyMap()` keeps `window.APP_MODULES` compatible.
- `plugins/`: long-running domain actions such as shift assignment, timesheet generation and payroll generation.
- `shared/`: reusable responsive renderer and future cross-domain utilities.

## Module composition

`ModuleDefinition.create()` combines a `base`, capabilities, module config, action declarations and lifecycle hooks. `ModuleRegistry` resolves the `dynamic-crud` base and publishes the legacy map. Class inheritance is intentionally avoided.

## Security boundaries

- Formula metadata is parsed by `SafeFormulaEvaluator`; arbitrary JavaScript is never evaluated.
- Component metadata resolves through `FieldRendererRegistry`.
- Legacy HTML is sanitized and inline event handlers are removed.
- Storage access is centralized in `AppStorage`, preserving legacy read compatibility.

## Responsive path

Modules inherit `responsive: { desktop: 'table', mobile: 'card', breakpoint: 768 }`. `ResponsiveDataRenderer` provides a basic card renderer and honors `MobileVisible` and `MobileOrder`. Existing desktop Tabulator behavior is unchanged and integration is opt-in while mobile screens are validated incrementally.

## Deferred work

`DynamicFormEngine.js` remains the compatible orchestrator and still contains substantial rendering/detail code. The new services are extraction boundaries; moving each block requires authenticated add/edit/view/filter regression tests. Long callbacks inside shift, insurance and contract module definitions should next become action declarations backed by `ShiftActions`, `InsuranceActions` and `DocumentActions`.

## Verification record

- All 115 JavaScript sources in the manifest pass `node --check`; generated bundle passes syntax check.
- Generated bundle section count equals manifest count and starts with the generated-file warning.
- Registry test loads 13 module definitions and exports 13 compatible `APP_MODULES` entries.
- Safe formula, document resolver, `SapCaTuDong` aliases and StatusGauge alias have focused tests.
- Browser smoke test confirms login rendering and unauthenticated dashboard redirect.
- Authenticated page workflows require a valid test session and remain the gate before moving more code out of `DynamicFormEngine`.
