window.ModuleRegistry = (function () {
  var definitions = {};
  var NESTED_CONFIG_KEYS = [
    'operations', 'actions', 'lookups', 'details',
    'attachments', 'responsive', 'messages'
  ];
  var bases = {
    'dynamic-crud': {
      ApiSearch: '/api/API_Gateway_Router',
      ApiSave: '/api/API_Gateway_Router',
      ApiDelete: '/api/API_Gateway_Router',
      responsive: { desktop: 'table', mobile: 'card', breakpoint: 768 }
    },
    'master-detail': {
      ApiSearch: '/api/API_Gateway_Router',
      ApiSave: '/api/API_Gateway_Router',
      ApiDelete: '/api/API_Gateway_Router',
      responsive: { desktop: 'split', mobile: 'stack', breakpoint: 768 }
    },
    'approval-document': {
      ApiSearch: '/api/API_Gateway_Router',
      ApiSave: '/api/API_Gateway_Router',
      ApiDelete: '/api/API_Gateway_Router',
      responsive: { desktop: 'split', mobile: 'stack', breakpoint: 768 }
    }
  };

  function keyOf(formName) {
    return String(formName || '').trim().toUpperCase();
  }

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function mergeNested(baseValue, overrideValue) {
    var result = Object.assign({}, isObject(baseValue) ? baseValue : {});
    Object.keys(isObject(overrideValue) ? overrideValue : {}).forEach(function (key) {
      if (isObject(result[key]) && isObject(overrideValue[key])) {
        result[key] = Object.assign({}, result[key], overrideValue[key]);
      } else {
        result[key] = overrideValue[key];
      }
    });
    return result;
  }

  function shouldAppend(config, key) {
    var mergeMode = config && config.mergeMode;
    return mergeMode === 'append' || (isObject(mergeMode) && mergeMode[key] === 'append');
  }

  function mergeConfig(baseConfig, moduleConfig) {
    var result = Object.assign({}, baseConfig || {}, moduleConfig || {});
    NESTED_CONFIG_KEYS.forEach(function (key) {
      var baseValue = baseConfig && baseConfig[key];
      var overrideValue = moduleConfig && moduleConfig[key];
      if (overrideValue === undefined) {
        if (isObject(baseValue)) result[key] = mergeNested({}, baseValue);
        else if (Array.isArray(baseValue)) result[key] = baseValue.slice();
        return;
      }
      if (Array.isArray(overrideValue)) {
        result[key] = shouldAppend(moduleConfig, key) && Array.isArray(baseValue)
          ? baseValue.concat(overrideValue)
          : overrideValue.slice();
      } else if (isObject(overrideValue)) {
        result[key] = mergeNested(baseValue, overrideValue);
      }
    });
    return result;
  }

  function registerBase(code, config) {
    bases[String(code || '').trim().toLowerCase()] = Object.assign({}, config || {});
  }

  function resolveConfig(definition) {
    var baseConfig = bases[String(definition.base || '').toLowerCase()] || {};
    var config = mergeConfig(baseConfig, definition.config || {});
    if (!config.FormName) config.FormName = definition.id;
    if (definition.capabilities.length) config.capabilities = definition.capabilities.slice();
    if (definition.actions.length) config.registeredActions = definition.actions.slice();
    if (Object.keys(definition.hooks).length) config.hooks = Object.assign({}, definition.hooks);
    return window.ModuleConfigNormalizer.normalize(config);
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

  function getConfig(formName) {
    var definition = get(formName);
    return definition ? resolveConfig(definition) : null;
  }

  function has(formName) {
    return !!get(formName);
  }

  function getAll() {
    return Object.keys(definitions).map(function (key) { return definitions[key]; });
  }

  return {
    mergeConfig: mergeConfig,
    registerBase: registerBase,
    register: register,
    registerMany: registerMany,
    get: get,
    getConfig: getConfig,
    has: has,
    getAll: getAll,
    toLegacyMap: syncLegacyMap
  };
})();
