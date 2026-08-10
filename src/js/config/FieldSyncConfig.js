/** Runtime configuration for Field Contract V2 metadata. */
(function (global) {
  var runtimeRoot = global.HRM_RUNTIME_CONFIG && typeof global.HRM_RUNTIME_CONFIG === 'object'
    ? global.HRM_RUNTIME_CONFIG
    : {};
  var supplied = runtimeRoot.FIELD_SYNC && typeof runtimeRoot.FIELD_SYNC === 'object'
    ? runtimeRoot.FIELD_SYNC
    : {};
  var cacheSeconds = Number(supplied.cacheSeconds);

  global.ERP_FIELD_SYNC_CONFIG = Object.freeze({
    enabled: supplied.enabled !== false,
    metadataBaseUrl: typeof supplied.metadataBaseUrl === 'string'
      ? supplied.metadataBaseUrl.replace(/\/+$/, '')
      : '',
    cacheSeconds: Number.isFinite(cacheSeconds) && cacheSeconds > 0
      ? Math.floor(cacheSeconds)
      : 120,
    failClosed: true,
    allowLastKnownReadOnly: true
  });
})(window);
