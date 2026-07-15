/** Runtime-safe defaults and feature flags shared by HR modules. */
window.AppConfig = Object.freeze({
  version: '2.15',
  defaults: Object.freeze({ pageSize: 15, mobileBreakpoint: 768 }),
  features: Object.freeze({ responsiveCards: true, metadataForms: true, documentExport: true })
});
