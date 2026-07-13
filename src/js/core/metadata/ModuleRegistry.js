window.ModuleRegistry = (function () {
  var definitions = {};
  var bases = {
    'dynamic-crud': {
      ApiSearch: '/api/API_Gateway_Router',
      responsive: { desktop: 'table', mobile: 'card', breakpoint: 768 }
    }
  };

  function keyOf(formName) {
    return String(formName || '').trim().toUpperCase();
  }

  function registerBase(code, config) {
    bases[String(code || '').trim().toLowerCase()] = Object.assign({}, config || {});
  }

  function resolveConfig(definition) {
    var baseConfig = bases[String(definition.base || '').toLowerCase()] || {};
    var config = Object.assign({}, baseConfig, definition.config || {});
    if (!config.FormName) config.FormName = definition.id;
    if (definition.capabilities.length) config.capabilities = definition.capabilities.slice();
    if (definition.actions.length) config.actions = definition.actions.slice();
    if (Object.keys(definition.hooks).length) config.hooks = Object.assign({}, definition.hooks);
    return config;
  }

  function syncLegacyMap() {
    var legacy = window.APP_MODULES || {};
    Object.keys(definitions).forEach(function (key) {
      legacy[key] = resolveConfig(definitions[key]);
    });
    window.APP_MODULES = legacy;
    return legacy;
  }

  function register(moduleDefinition) {
    var definition = window.ModuleDefinition.create(moduleDefinition);
    definitions[keyOf(definition.id)] = definition;
    syncLegacyMap();
    return definition;
  }

  function registerMany(moduleDefinitions) {
    (moduleDefinitions || []).forEach(register);
    return getAll();
  }

  function get(formName) {
    return definitions[keyOf(formName)] || null;
  }

  function has(formName) {
    return !!get(formName);
  }

  function getAll() {
    return Object.keys(definitions).map(function (key) { return definitions[key]; });
  }

  function toLegacyMap() {
    return syncLegacyMap();
  }

  return {
    registerBase: registerBase,
    register: register,
    registerMany: registerMany,
    get: get,
    has: has,
    getAll: getAll,
    toLegacyMap: toLegacyMap
  };
})();

