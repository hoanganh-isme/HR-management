# Frontend architecture after HR cleanup

The application keeps the existing shell and metadata form engine. The new
boundaries are deliberately small:

```text
env.js → ApiClient → DynamicFormEngine → metadata/API gateway
                  ↘ ModuleDefinition (capabilities + mobile metadata)
                  ↘ FormActionRegistry (small async actions)
                  ↘ ResponsiveDataRenderer (table/card list presentation)
```

- `scripts/frontend-bundle.manifest.json` is the only bundle input list.
  `scripts/build-frontend-bundle.mjs --check` validates duplicate/missing files
  without modifying generated artifacts; the default command writes the two
  generated bundles.
- `ModuleDefinition.create()` adds safe defaults (`responsive`) and normalizes
  `MobileVisible`, `MobileOrder`, and `MobileLabel` on metadata fields. Existing
  fields and endpoint names are preserved.
- `FormActionRegistry` provides a Promise-based seam for module actions. It is
  intentionally not a second CRUD engine; modules may register only bounded
  actions with explicit context.
- `ResponsiveDataRenderer` renders metadata-defined columns with `data-label`
  attributes so the existing mobile table/card CSS can stack records without
  selectors tied to a business form.
- `ApiClient.normalizeResponse()` and `requestRecords()` standardize
  `records/list/data` envelopes while returning the original payload as `raw`.
- `SafeFormula` evaluates only the arithmetic subset used by metadata formulas
  and rejects identifiers/function calls; the form engine no longer constructs
  a dynamic JavaScript function from server-provided text.
- HR master-data navigation delegates CRUD to `DynamicFormEngine`; it does not
  embed field maps, primary keys, labels, or enterprise records in a page.

The document export plugin uses `documentId` internally and continues sending
the legacy `customerId` alias required by the current document API. Auth,
permissions, storage keys, and backend routes remain unchanged.
