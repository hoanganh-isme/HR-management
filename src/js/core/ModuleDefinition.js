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

  function create(input) {
    var config = Object.assign({}, input || {});
    config.capabilities = unique(DEFAULT_CAPABILITIES.concat(config.capabilities || []));
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
