window.ModuleDefinition = (function () {
  function cloneObject(value) {
    return Object.assign({}, value || {});
  }

  function create(options) {
    options = options || {};
    if (!options.id) throw new Error('ModuleDefinition.id is required');

    return {
      id: String(options.id),
      base: options.base || 'dynamic-crud',
      capabilities: Array.isArray(options.capabilities) ? options.capabilities.slice() : [],
      config: cloneObject(options.config),
      actions: Array.isArray(options.actions) ? options.actions.slice() : [],
      hooks: cloneObject(options.hooks)
    };
  }

  return { create: create };
})();

