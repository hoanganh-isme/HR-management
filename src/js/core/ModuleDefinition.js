/**
 * Normalizes metadata-driven module definitions while preserving API fields.
 * Modules may opt into small capabilities instead of copying CRUD logic.
 */
window.ModuleDefinition = (function () {
  var DEFAULT_CAPABILITIES = ['responsive'];

  function unique(values) {
    var seen = {};
    return (values || []).filter(function (value) {
      var key = String(value || '').trim();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function mergeObject(base, overrides) {
    if (!base && !overrides) return undefined;
    return Object.assign({}, base || {}, overrides || {});
  }

  function create(baseDefinition, overrides) {
    var hasBase = arguments.length > 1;
    var base = hasBase ? (baseDefinition || {}) : {};
    var input = hasBase ? (overrides || {}) : (baseDefinition || {});
    var config = Object.assign({}, base, input);
    config.api = mergeObject(base.api, input.api);
    config.mobile = mergeObject(base.mobile, input.mobile);
    config.defaults = mergeObject(base.defaults, input.defaults);
    var baseCapabilities = base.capabilities;
    var inputCapabilities = input.capabilities;
    if ((baseCapabilities && !Array.isArray(baseCapabilities)) || (inputCapabilities && !Array.isArray(inputCapabilities))) {
      config.capabilities = Object.assign({}, Array.isArray(baseCapabilities) ? {} : (baseCapabilities || {}), Array.isArray(inputCapabilities) ? {} : (inputCapabilities || {}));
      if (config.capabilities.responsive === undefined) config.capabilities.responsive = true;
    } else {
      config.capabilities = unique(DEFAULT_CAPABILITIES.concat(baseCapabilities || [], inputCapabilities || []));
    }
    if (Array.isArray(config.FormFields)) {
      config.FormFields = config.FormFields.map(function (field) {
        var next = Object.assign({}, field);
        if (next.MobileVisible === undefined) next.MobileVisible = true;
        if (next.MobileOrder === undefined && next.orderNo !== undefined) next.MobileOrder = next.orderNo;
        if (!next.MobileLabel && next.label) next.MobileLabel = next.label;
        return next;
      });
    }
    return config;
  }

  return { create: create };
})();
