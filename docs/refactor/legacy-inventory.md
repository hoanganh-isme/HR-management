# Legacy frontend inventory

Inventory date: 2026-07-13. Production bundle is generated from `scripts/frontend-bundle.manifest.json`.

| Classification | Location / term | Decision |
|---|---|---|
| REMOVE | `src/js/data/mockData.js` (`demoRevenue`, `demoCost`, surveys, customers, halls) | Deleted; no runtime references. |
| REMOVE | `BookingService`, `CheckoutService`, `VisitorService`, `WorkflowTransferPlugin` | Deleted; no consumers outside their own files. |
| REMOVE | Wedding examples in `components-demo.js` | Replaced by HR examples; demo page remains generic. |
| RENAME_WITH_ALIAS | `HallGauge`, `.hall-gauge*` | `StatusGauge` is canonical; JS and CSS aliases remain for compatibility. |
| MOVE_TO_COMPATIBILITY | `hop_dong`, `dat_coc`, `quyet_toan` template inference | Moved to `LegacyDocumentTemplateAdapter`; page uses `DocumentTemplateResolver`. |
| MOVE_TO_COMPATIBILITY | `pmql_*` storage keys | `AppStorage` reads `hrm_*` first and falls back to `pmql_*`; new writes use `hrm_*`. |
| MOVE_TO_COMPATIBILITY | Legacy metadata HTML | Sanitized by `LegacyCompatibility`; known shift action is rebound without inline events. |
| KEEP | `login.html` legacy storage fallback and `auth_token` | Explicitly protected by task constraints; login contract was not changed. |
| KEEP | SQL objects containing customer, hall, deposit, settlement names | Database/schema/SP changes are out of scope and may still be required by the existing database. |
| KEEP | `README.md`, `REQUIREMENT.md`, `Migration_Scripts.md`, `FLOW.md` | Historical/backend documentation is out of scope; not included in production bundle. |
| REMOVE | `FormBuilderPlugin` example `v_DanhSachKhachHang` | Replaced with the HR-neutral `HR_PersonView` example. |
| KEEP | Legacy `pmql_*` fallbacks in older lazy-loaded pages/components | Compatibility debt; migrate page-by-page after authenticated regression coverage exists. |
| KEEP | `db-today-hall-cell` CSS alias | Existing dashboard markup may reference it; rename only with dashboard visual regression tests. |

## Production result

The generated JavaScript bundle no longer contains wedding mock revenue, cost, survey, customer, hall, booking, checkout, or visitor service data. Remaining legacy terms are compatibility aliases or are outside the production manifest.
