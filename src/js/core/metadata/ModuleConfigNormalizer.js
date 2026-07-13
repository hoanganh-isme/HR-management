window.ModuleConfigNormalizer = (function () {
  function cloneMap(value) {
    return Object.assign({}, value || {});
  }

  function legacyOperation(config, func, endpoint) {
    var operation = {
      sp: config.FormName,
      func: func,
      formName: config.FormName,
      endpoint: endpoint
    };
    if (endpoint && endpoint !== '/api/API_Gateway_Router') operation.transport = 'direct';
    return operation;
  }

  function normalizeDetails(config) {
    var details = cloneMap(config.details);
    (config.DetailTabs || []).forEach(function (tab, index) {
      if (!tab || !tab.api) return;
      var key = tab.code || tab.id || ('detail' + (index + 1));
      if (details[key]) return;
      details[key] = {
        sp: tab.api,
        func: 'View',
        filterField: tab.filterField,
        rowIdField: tab.rowIdField || 'UserAutoID',
        requiredFields: tab.requiredFields || [],
        duplicateKeys: tab.duplicateKeys || []
      };
    });
    return details;
  }

  function normalize(config) {
    config = Object.assign({}, config || {});
    if (!config.ApiSearch) config.ApiSearch = '/api/API_Gateway_Router';
    if (!config.ApiSave) config.ApiSave = '/api/API_Gateway_Router';
    if (!config.ApiDelete) config.ApiDelete = '/api/API_Gateway_Router';
    if (String(config.FormName || '').toLowerCase() === 'frmformbuilder') config.isFormBuilder = true;
    var operations = cloneMap(config.operations);

    if (config.FormName) {
      if (!operations.list) operations.list = legacyOperation(config, 'View', config.ApiSearch);
      if (!operations.save) operations.save = legacyOperation(config, 'Save', config.ApiSave);
      if (!operations.delete) operations.delete = legacyOperation(config, 'Delete', config.ApiDelete || config.ApiSave);
    }

    config.operations = operations;
    config.actions = cloneMap(config.actions);
    config.lookups = cloneMap(config.lookups);
    config.details = normalizeDetails(config);
    config.attachments = cloneMap(config.attachments);
    if (config.AttachmentApi && !config.attachments.default) {
      config.attachments.default = {
        sp: config.AttachmentApi,
        ownerField: config.PrimaryKey,
        rowIdField: 'UserAutoID'
      };
    }
    if (!config.AttachmentApi && config.attachments.default) config.AttachmentApi = config.attachments.default.sp;
    config.responsive = cloneMap(config.responsive);
    config.messages = cloneMap(config.messages);
    return config;
  }

  return { normalize: normalize };
})();
