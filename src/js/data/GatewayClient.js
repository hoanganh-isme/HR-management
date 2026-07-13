window.GatewayClient = (function () {
  var DEFAULT_ENDPOINT = '/api/API_Gateway_Router';
  var CONTRACT_GROUPS = ['operations', 'actions', 'lookups', 'details'];

  function firstDefined() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] !== undefined) return arguments[i];
    }
    return undefined;
  }

  function endpoint(operation, options) {
    return firstDefined(options && options.endpoint, operation && operation.endpoint, DEFAULT_ENDPOINT);
  }

  function normalizeOperation(operation) {
    if (typeof operation === 'string') return { sp: operation };
    return Object.assign({}, operation || {});
  }

  function buildPayload(operation, data, options) {
    operation = normalizeOperation(operation);
    options = options || {};

    if (operation.transport === 'direct') {
      var directPayload = Object.assign({}, operation.payload || {}, data || {}, options.payload || {});
      var directLimit = firstDefined(options.limit, operation.limit);
      var directPage = firstDefined(options.page, operation.page);
      var directKeyword = firstDefined(options.keyword, operation.keyword);
      if (directLimit !== undefined) directPayload.Limit = directLimit;
      if (directPage !== undefined) directPayload.Page = directPage;
      if (directKeyword !== undefined) directPayload.Keyword = directKeyword;
      return directPayload;
    }

    var sp = firstDefined(options.sp, operation.sp, operation.list, operation.formName);
    if (!sp) throw new Error('GatewayClient operation.sp is required');

    var payload = Object.assign({}, operation.payload || {}, options.payload || {});
    payload.List = sp;
    payload.FormName = firstDefined(options.formName, operation.formName, sp);
    payload.Func = firstDefined(options.func, operation.func, 'View');

    var limit = firstDefined(options.limit, operation.limit);
    var page = firstDefined(options.page, operation.page);
    var keyword = firstDefined(options.keyword, operation.keyword);
    if (limit !== undefined) payload.Limit = limit;
    if (page !== undefined) payload.Page = page;
    if (keyword !== undefined) payload.Keyword = keyword;

    var jsonData = data !== undefined ? data : options.data;
    if (jsonData !== undefined) {
      payload.JsonData = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData || {});
    }

    return payload;
  }

  function validateRequiredFields(operation, data) {
    var requiredFields = operation.requiredFields || [];
    if (!requiredFields.length) return;
    var source = data || {};
    var missing = requiredFields.filter(function (field) {
      return source[field] === undefined || source[field] === null || source[field] === '';
    });
    if (missing.length) {
      throw new Error('Missing required fields for ' + operation.sp + ': ' + missing.join(', '));
    }
  }

  function run(operation, data, options) {
    operation = normalizeOperation(operation);
    validateRequiredFields(operation, data);
    return ApiClient.post(endpoint(operation, options), buildPayload(operation, data, options));
  }

  function findInGroup(config, groupName, operationName) {
    var group = config && config[groupName];
    return group && group[operationName] ? group[operationName] : null;
  }

  function resolveModuleOperation(moduleConfig, operationName) {
    var config = moduleConfig || {};
    if (window.ModuleConfigNormalizer && typeof window.ModuleConfigNormalizer.normalize === 'function') {
      config = window.ModuleConfigNormalizer.normalize(config);
    }

    var parts = String(operationName || '').split('.');
    if (parts.length === 2 && CONTRACT_GROUPS.indexOf(parts[0]) !== -1) {
      return findInGroup(config, parts[0], parts[1]);
    }

    for (var i = 0; i < CONTRACT_GROUPS.length; i++) {
      var operation = findInGroup(config, CONTRACT_GROUPS[i], operationName);
      if (operation) return operation;
    }
    return null;
  }

  function runModuleOperation(moduleConfig, operationName, data, options) {
    var operation = resolveModuleOperation(moduleConfig, operationName);
    if (!operation) throw new Error('Unknown module operation: ' + operationName);
    return run(operation, data, options);
  }

  return {
    buildPayload: buildPayload,
    resolveModuleOperation: resolveModuleOperation,
    run: run,
    runModuleOperation: runModuleOperation,
    view: function (listName, options) {
      options = options || {};
      return run({ sp: listName, func: 'View' }, options.data, options);
    },
    save: function (listName, data, options) {
      return run({ sp: listName, func: 'Save' }, data, options);
    },
    delete: function (listName, ids, options) {
      return run({ sp: listName, func: 'Delete' }, ids, options);
    },
    execute: function (listName, data, options) {
      options = options || {};
      return run({ sp: listName, func: options.func || 'View' }, data, options);
    }
  };
})();
