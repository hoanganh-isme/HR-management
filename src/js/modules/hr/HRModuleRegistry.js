(function (global) {
  var registry = {
    install: function () {
      global.APP_MODULES = global.APP_MODULES || {};
      var buckets = global.HRModuleDefinitions || {};
      Object.keys(buckets).forEach(function (bucket) {
        Object.keys(buckets[bucket] || {}).forEach(function (key) {
          var value = buckets[bucket][key];
          global.APP_MODULES[key] = (global.ModuleDefinition && typeof global.ModuleDefinition.create === 'function')
            ? global.ModuleDefinition.create(global.HRCrudDefaults, value)
            : value;
        });
      });
      return global.APP_MODULES;
    },
    get: function (key) {
      return (global.APP_MODULES || {})[String(key || '').toUpperCase()] || null;
    },
    keys: function () {
      return Object.keys(global.APP_MODULES || {});
    }
  };
  global.HRModuleRegistry = registry;
  registry.install();
})(window);
