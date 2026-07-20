/**
 * Feature flag Phase 1. Mặc định tuyệt đối không thay đổi UI đang chạy.
 * Cấu hình ưu tiên: ERP_FIELD_SYNC_CONFIG (override toàn bộ) rồi
 * HRM_RUNTIME_CONFIG.FIELD_SYNC. Không trộn hai nguồn để tránh ghép nhầm các gate bật pilot.
 */
(function (global) {
  function configObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  var runtimeRoot = configObject(global.HRM_RUNTIME_CONFIG);
  var runtime = configObject(runtimeRoot.FIELD_SYNC);
  var explicit = configObject(global.ERP_FIELD_SYNC_CONFIG);
  var supplied = Object.keys(explicit).length ? explicit : runtime;
  var pilotForms = Array.isArray(supplied.pilotForms) ? supplied.pilotForms.slice() : [];
  var pollSeconds = Number(supplied.pollSeconds);

  global.ERP_FIELD_SYNC_CONFIG = Object.freeze({
    enabled: supplied.enabled === true,
    shadowMode: supplied.shadowMode !== false,
    pilotForms: Object.freeze(pilotForms.filter(function (item) { return typeof item === 'string' && item.trim(); })),
    pollSeconds: Number.isFinite(pollSeconds) && pollSeconds >= 30 ? Math.floor(pollSeconds) : 120,
    metadataBaseUrl: typeof supplied.metadataBaseUrl === 'string' ? supplied.metadataBaseUrl.replace(/\/+$/, '') : ''
  });
})(window);
