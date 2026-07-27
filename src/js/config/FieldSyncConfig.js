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
  var legacyPilotForms = Array.isArray(supplied.pilotForms) ? supplied.pilotForms.slice() : [];
  var includeForms = Array.isArray(supplied.includeForms)
    ? supplied.includeForms.slice()
    : legacyPilotForms;
  var excludeForms = Array.isArray(supplied.excludeForms) ? supplied.excludeForms.slice() : [];
  var rolloutMode = supplied.rolloutMode === 'pilot'
    || (!supplied.rolloutMode && legacyPilotForms.length > 0)
    ? 'pilot'
    : 'registry';
  var pollSeconds = Number(supplied.pollSeconds);

  global.ERP_FIELD_SYNC_CONFIG = Object.freeze({
    enabled: supplied.enabled === true,
    shadowMode: supplied.shadowMode !== false,
    rolloutMode: rolloutMode,
    includeForms: Object.freeze(includeForms.filter(function (item) { return typeof item === 'string' && item.trim(); })),
    excludeForms: Object.freeze(excludeForms.filter(function (item) { return typeof item === 'string' && item.trim(); })),
    // Giữ cấu hình cũ để production có thể rollback trong giai đoạn chuyển tiếp.
    pilotForms: Object.freeze(legacyPilotForms.filter(function (item) { return typeof item === 'string' && item.trim(); })),
    fallbackToLegacy: supplied.fallbackToLegacy !== false,
    pollSeconds: Number.isFinite(pollSeconds) && pollSeconds >= 30 ? Math.floor(pollSeconds) : 120,
    metadataBaseUrl: typeof supplied.metadataBaseUrl === 'string' ? supplied.metadataBaseUrl.replace(/\/+$/, '') : ''
  });
})(window);
