/** Authoritative browser runtime for Field Contract V2 metadata. */
window.FieldSyncService = (function (global) {
  var states = Object.create(null);
  var lastKnownV2 = Object.create(null);
  var lookupKeyAliases = Object.create(null);

  function config() {
    return global.ERP_FIELD_SYNC_CONFIG || {
      enabled: true,
      metadataBaseUrl: '',
      cacheSeconds: 120,
      failClosed: true,
      allowLastKnownReadOnly: true
    };
  }

  function normalizeName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (value && typeof value === 'object') {
      var copy = {};
      Object.keys(value).forEach(function (key) { copy[key] = cloneValue(value[key]); });
      return copy;
    }
    return value;
  }

  function metadataBaseUrl() {
    var configured = config().metadataBaseUrl;
    if (configured) return configured;
    var manager = global.API_CONFIG && global.API_CONFIG.ENDPOINTS && global.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
    var serviceBase = manager && manager.SERVICE_BASE
      ? String(manager.SERVICE_BASE).replace(/\/+$/, '')
      : '';
    return serviceBase ? serviceBase + '/api/metadata' : '/api/metadata';
  }

  function requestHeaders() {
    return {
      Username: global.AppSession ? global.AppSession.getUserName() : '',
      BranchID: global.AppSession ? global.AppSession.getBranchId() : ''
    };
  }

  function stateKey(formName) {
    var userName = global.AppSession ? global.AppSession.getUserName() : '';
    var branchId = global.AppSession ? global.AppSession.getBranchId() : '';
    return [normalizeName(formName), normalizeName(userName), normalizeName(branchId)].join('|');
  }

  function dispatchUpdate(formName, state) {
    if (!global.document || typeof global.CustomEvent !== 'function') return;
    global.document.dispatchEvent(new global.CustomEvent('erpFieldSyncUpdated', {
      detail: { formName: formName, contextKey: state.contextKey, state: state }
    }));
  }

  function engineRule(renderRule) {
    var rule = normalizeName(renderRule);
    if (rule === 'date') return 'd';
    if (rule === 'datetime') return 'dt';
    if (rule === 'time') return 'tm';
    if (rule === 'boolean') return 'sw';
    if (rule === 'number' || rule === 'money' || rule === 'decimal') return 'n';
    if (rule === 'lookup') return 'combo';
    return rule || 'text';
  }

  function adaptField(field, index, writable, contextName) {
    var lookup = field.lookup && field.lookup.disabled !== true ? field.lookup : null;
    var filter = field.filter && typeof field.filter === 'object' ? field.filter : null;
    var isFilter = contextName === 'filters';
    var label = isFilter && filter && filter.label ? filter.label : (field.label || field.name);
    var orderNo = isFilter && filter && Number(filter.keyId)
      ? Number(filter.keyId)
      : (Number(field.orderNo) || index + 1);
    var supportsInsert = writable && field.supportsInsert === true;
    var supportsUpdate = writable && field.supportsUpdate === true;
    var mobileClass = String(field.mobileClass || 'OPTIONAL').toUpperCase();
    if (['CORE', 'OPTIONAL', 'ADVANCED', 'HIDDEN'].indexOf(mobileClass) === -1) mobileClass = 'OPTIONAL';
    var mobileOrder = Number(field.mobileOrder)
      || ((mobileClass === 'CORE' ? 0 : mobileClass === 'OPTIONAL' ? 10000 : mobileClass === 'ADVANCED' ? 20000 : 30000) + index + 1);

    return {
      name: field.name,
      label: label,
      captionVN: field.captionVN || field.CaptionVN || label,
      orderNo: orderNo,
      position: 'grid',
      renderRule: engineRule(field.renderRule),
      semanticRenderRule: field.semanticRenderRule || field.renderRule || '',
      formatId: field.formatId || '',
      FormatID: field.formatId || '',
      formatType: field.formatType || '',
      sqlType: field.sqlType || '',
      semanticRole: field.semanticRole || '',
      displayVariant: field.displayVariant || '',
      toneMap: cloneValue(field.toneMap || null),
      statusMap: cloneValue(field.statusMap || null),
      avatarField: field.avatarField || '',
      secondaryField: field.secondaryField || '',
      nullable: field.nullable === true,
      required: field.requiredOnInsert === true,
      metadataSource: 'FIELD_CONTRACT_V2',
      serverSortable: field.supportsSort === true,
      showInGrid: field.showInGrid !== false,
      showInAdd: field.showInAdd === true,
      showInEdit: field.showInEdit === true,
      showInFilter: field.showInFilter === true && field.supportsFilter === true,
      isReadOnlyAdd: !supportsInsert,
      isReadOnlyEdit: !supportsUpdate,
      ShowInEdit: field.showInEdit === true ? 1 : 0,
      IsReadOnlyEdit: supportsUpdate ? 0 : 1,
      supportsInsert: field.supportsInsert === true,
      supportsUpdate: field.supportsUpdate === true,
      supportsFilter: field.supportsFilter === true,
      supportsKeyword: field.supportsKeyword === true,
      filterSourceFormId: filter ? filter.sourceFormId : '',
      filterKeyId: filter ? filter.keyId : '',
      filterControlType: filter ? filter.controlType : null,
      filterOperator: filter ? filter.operator : null,
      filterUseLikeOperator: filter ? filter.useLikeOperator === true : false,
      filterControlWidth: filter ? filter.controlWidth : null,
      filterValueField: filter ? filter.valueField : '',
      filterDisplayField: filter ? filter.displayField : '',
      filterDisplayColumns: filter && Array.isArray(filter.displayColumns) ? filter.displayColumns.slice() : [],
      filterDefaultValue: filter ? filter.defaultValue : '',
      filterRememberLastValue: filter ? filter.rememberLastValue === true : false,
      filterReload: filter ? filter.reload === true : false,
      isPrimaryKey: field.isPrimaryKey === true,
      isIdentity: field.isIdentity === true,
      isComputed: field.isComputed === true,
      isServerManaged: field.isServerManaged === true,
      isSensitiveOrDenied: field.isSensitiveOrDenied === true,
      mobileClass: mobileClass,
      mobileOrder: mobileOrder,
      mobileSection: mobileClass === 'OPTIONAL' ? 'Thông tin bổ sung' : (mobileClass === 'ADVANCED' ? 'Nâng cao' : ''),
      MobileVisible: mobileClass !== 'HIDDEN',
      MobileOrder: mobileOrder,
      reasonCodes: Array.isArray(field.reasonCodes) ? field.reasonCodes.slice() : [],
      dataSource: '',
      lookupKey: lookup && lookup.key ? lookup.key : '',
      minWidth: field.minWidth,
      maxWidth: field.maxWidth,
      maxLength: field.maxLength !== null && field.maxLength !== undefined ? field.maxLength : field.dbMaxLength,
      minValue: field.minValue,
      maxValue: field.maxValue,
      align: field.align,
      numberDecimal: field.numberDecimal,
      formatString: field.formatString,
      maskString: field.maskString,
      dependsOn: lookup && Array.isArray(lookup.dependsOn) ? lookup.dependsOn.join(',') : ''
    };
  }

  function mergeFields(allFields, selectedFields, predicate) {
    var source = Array.isArray(allFields) ? allFields : [];
    var byName = Object.create(null);
    source.forEach(function (field) { byName[normalizeName(field && field.name)] = field; });
    var selected = Array.isArray(selectedFields) ? selectedFields : source.filter(predicate);
    return selected.map(function (field) {
      return Object.assign({}, byName[normalizeName(field && field.name)] || {}, field || {});
    });
  }

  function createRuntimeSchemas(schema, writable) {
    var contract = schema || {};
    var fields = Array.isArray(contract.fields) ? contract.fields : [];
    var collections = {
      grid: mergeFields(fields, contract.gridFields, function (field) { return field.showInGrid !== false; }),
      add: mergeFields(fields, contract.addFields, function (field) { return field.showInAdd === true; }),
      edit: mergeFields(fields, contract.editFields, function (field) { return field.showInEdit === true; }),
      filters: mergeFields(fields, contract.filterFields, function (field) {
        return field.showInFilter === true && field.supportsFilter === true;
      })
    };
    function adapt(collection, contextName) {
      return collection.map(function (field, index) {
        return adaptField(field, index, writable === true, contextName);
      });
    }
    return {
      grid: adapt(collections.grid, 'grid'),
      edit: adapt(collections.edit, 'edit'),
      add: adapt(collections.add, 'add'),
      filters: adapt(collections.filters, 'filters')
    };
  }

  function normalizeContract(schema) {
    if (global.HRMetadataAdapter && typeof global.HRMetadataAdapter.normalizeContract === 'function') {
      return global.HRMetadataAdapter.normalizeContract(schema);
    }
    if (!schema || String(schema.schemaVersion || '') !== '2.0' || !Array.isArray(schema.fields)) {
      throw new Error('Field Contract V2 không hợp lệ.');
    }
    return cloneValue(schema);
  }

  function blockingDiagnostic(schema) {
    return Boolean(schema && Array.isArray(schema.diagnostics) && schema.diagnostics.some(function (item) {
      var severity = normalizeName(item && item.severity);
      return severity === 'error' || severity === 'critical';
    }));
  }

  function assertContract(schema, formName, contract) {
    if (!schema || String(schema.schemaVersion || '') !== '2.0') throw new Error('Field Contract V2 không đúng phiên bản.');
    if (normalizeName(schema.formName) !== normalizeName(formName)) throw new Error('Field Contract V2 không khớp FormName.');
    if (contract && contract.erpFormId && normalizeName(schema.erpFormId) !== normalizeName(contract.erpFormId)) {
      throw new Error('Field Contract V2 không khớp ERPFormID trong DB registry.');
    }
    if (contract && contract.expectedTableName && normalizeName(schema.tableName) !== normalizeName(contract.expectedTableName)) {
      throw new Error('Field Contract V2 không khớp TableName trong DB registry.');
    }
    if (contract && contract.expectedPrimaryKey && normalizeName(schema.primaryKey) !== normalizeName(contract.expectedPrimaryKey)) {
      throw new Error('Field Contract V2 không khớp PrimaryKey trong DB registry.');
    }
    if (!schema.tableName || !schema.primaryKey || !Array.isArray(schema.fields) || !schema.fields.length) {
      throw new Error('Field Contract V2 thiếu bảng, khóa chính hoặc danh sách trường.');
    }
    if (!Array.isArray(schema.gridFields) || !Array.isArray(schema.addFields)
      || !Array.isArray(schema.editFields) || !Array.isArray(schema.filterFields)) {
      throw new Error('Field Contract V2 thiếu runtime schema.');
    }
    if (blockingDiagnostic(schema)) throw new Error('Field Contract V2 có diagnostic chặn runtime.');
  }

  function errorDetails(error) {
    var data = error && error.data && typeof error.data === 'object' ? error.data : {};
    return {
      status: Number(error && error.status) || 0,
      code: String(data.code || (error && error.code) || 'METADATA_REQUEST_FAILED').trim().toUpperCase(),
      message: String((error && error.message) || data.message || 'Không thể đọc metadata ERP.'),
      diagnostic: data.diagnostic || null
    };
  }

  function failClosedState(formName, details) {
    return {
      status: 'metadata-error',
      runtimeMode: 'METADATA_ERROR',
      metadataActive: false,
      active: false,
      writeAvailable: false,
      deleteAvailable: false,
      writeActive: false,
      deleteActive: false,
      failClosed: true,
      readOnly: true,
      contextKey: stateKey(formName),
      schema: null,
      contract: null,
      runtimeSchemas: { grid: [], edit: [], add: [], filters: [] },
      loadedAt: Date.now(),
      errorCode: details.code,
      error: details.message,
      diagnostic: details.diagnostic || null
    };
  }

  function readOnlyState(formName, previous, details) {
    return {
      status: 'metadata-last-known-readonly',
      runtimeMode: 'V2_READONLY',
      metadataActive: true,
      active: previous.active === true,
      writeAvailable: false,
      deleteAvailable: false,
      writeActive: false,
      deleteActive: false,
      failClosed: false,
      readOnly: true,
      contextKey: stateKey(formName),
      schema: previous.schema,
      contract: previous.contract,
      runtimeSchemas: createRuntimeSchemas(previous.schema, false),
      loadedAt: Date.now(),
      errorCode: details.code || 'METADATA_UNAVAILABLE_LAST_KNOWN_V2',
      error: details.message,
      diagnostic: details.diagnostic || null
    };
  }

  function requestMetadata(formName, forceRefresh) {
    var headers = requestHeaders();
    var options = { headers: headers, logoutOnUnauthorized: false };
    var encodedForm = encodeURIComponent(formName);
    var refreshQuery = forceRefresh === true ? '?refresh=1' : '';
    var contractUrl = metadataBaseUrl() + '/contract-state/' + encodedForm + refreshQuery;

    return global.ApiClient.get(contractUrl, options).then(function (contractState) {
      if (!contractState || contractState.registered !== true || contractState.metadataEnabled !== true || !contractState.contract) {
        var blocked = new Error('Field Contract V2 chưa được đăng ký hoặc không cho phép đọc metadata.');
        blocked.status = 409;
        blocked.code = String(contractState && (contractState.metadataReasonCode || contractState.reasonCode) || 'FIELD_CONTRACT_NOT_REGISTERED');
        throw blocked;
      }
      var schemaUrl = metadataBaseUrl() + '/grid-schema/' + encodedForm + refreshQuery;
      return global.ApiClient.get(schemaUrl, options).then(function (response) {
        if (!response || response.success !== true || !response.schema) {
          var invalid = new Error('Backend không trả Field Contract V2 hợp lệ.');
          invalid.status = 409;
          invalid.code = 'FIELD_CONTRACT_INVALID';
          throw invalid;
        }
        var schema = normalizeContract(response.schema);
        assertContract(schema, formName, contractState.contract);
        return {
          schema: schema,
          contract: response.contract || contractState.contract,
          active: response.active === true && contractState.active === true
        };
      });
    });
  }

  function fetchState(formName, forceRefresh) {
    var safeFormName = String(formName || '').trim();
    var key = stateKey(safeFormName);
    var current = states[key];
    var ttlMs = Math.max(1, Number(config().cacheSeconds) || 120) * 1000;

    if (!safeFormName || config().enabled !== true) {
      var disabled = failClosedState(safeFormName, {
        code: 'FIELD_METADATA_DISABLED',
        message: 'Field Contract V2 đang bị tắt.'
      });
      states[key] = disabled;
      return Promise.resolve(disabled);
    }
    if (current && current.pending) return current.pending;
    if (forceRefresh !== true && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      return Promise.resolve(current);
    }

    var pending = requestMetadata(safeFormName, forceRefresh === true).then(function (metadata) {
      var routes = metadata.schema.runtimeRoutes || {};
      var readOnlyContract = String(metadata.contract && metadata.contract.contractType || '').toUpperCase() === 'READ_ONLY';
      var writeAvailable = !readOnlyContract && Boolean(routes.save && routes.save.registeredProcedure);
      var deleteAvailable = !readOnlyContract && Boolean(routes.delete && routes.delete.registeredProcedure);
      var next = {
        status: metadata.active ? 'metadata-v2-active' : 'metadata-v2-current-business',
        runtimeMode: metadata.active ? 'V2_FULL' : 'V2_METADATA_CURRENT_BUSINESS',
        metadataActive: true,
        active: metadata.active,
        writeAvailable: writeAvailable,
        deleteAvailable: deleteAvailable,
        writeActive: metadata.active && writeAvailable,
        deleteActive: metadata.active && deleteAvailable,
        failClosed: false,
        readOnly: !writeAvailable,
        contextKey: key,
        schema: metadata.schema,
        contract: metadata.contract,
        runtimeSchemas: createRuntimeSchemas(metadata.schema, writeAvailable),
        loadedAt: Date.now(),
        errorCode: null,
        error: null,
        diagnostic: null
      };
      states[key] = next;
      lastKnownV2[key] = next;
      dispatchUpdate(safeFormName, next);
      return next;
    }).catch(function (error) {
      var details = errorDetails(error);
      var transient = details.status === 0 || details.status >= 500;
      var previous = lastKnownV2[key];
      var next = transient && previous && config().allowLastKnownReadOnly === true
        ? readOnlyState(safeFormName, previous, details)
        : failClosedState(safeFormName, details);
      states[key] = next;
      dispatchUpdate(safeFormName, next);
      return next;
    });

    states[key] = {
      status: 'loading',
      runtimeMode: 'LOADING',
      metadataActive: false,
      active: false,
      writeAvailable: false,
      deleteAvailable: false,
      writeActive: false,
      deleteActive: false,
      failClosed: true,
      readOnly: true,
      contextKey: key,
      pending: pending,
      schema: null,
      runtimeSchemas: { grid: [], edit: [], add: [], filters: [] }
    };
    return pending;
  }

  function observeForm(formName) {
    return fetchState(formName, false);
  }

  function refreshForm(formName) {
    return fetchState(formName, true);
  }

  function getState(formName) {
    return states[stateKey(formName)] || null;
  }

  function getFilterSchema(formName) {
    var current = getState(formName);
    var pending = current && current.metadataActive === true
      ? Promise.resolve(current)
      : observeForm(formName);
    return pending.then(function (state) {
      if (!state || state.metadataActive !== true || !state.runtimeSchemas) {
        var error = new Error(state && state.error ? state.error : 'Không thể tải cấu hình bộ lọc.');
        error.code = state && state.errorCode ? state.errorCode : 'FIELD_METADATA_UNAVAILABLE';
        throw error;
      }
      return cloneValue(state.runtimeSchemas.filters || []);
    });
  }

  function lookupDependencies(values) {
    var result = {};
    if (!values || typeof values !== 'object' || Array.isArray(values)) return result;
    Object.keys(values).slice(0, 20).forEach(function (key) {
      if (!/^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/.test(key) || /^(?:__proto__|prototype|constructor)$/i.test(key)) return;
      var value = values[key];
      if (value === undefined || value === null || typeof value === 'object') return;
      result[key] = String(value).slice(0, 500);
    });
    return result;
  }

  function declaredLookupDependencies(names, values) {
    var source = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
    var result = {};
    var declared = Array.isArray(names) ? names : String(names || '').split(',');
    declared.slice(0, 20).forEach(function (name) {
      var safeName = String(name || '').trim();
      if (safeName && Object.prototype.hasOwnProperty.call(source, safeName)) result[safeName] = source[safeName];
    });
    return result;
  }

  function normalizeLookupError(error) {
    var safeError = error instanceof Error ? error : new Error('Không tải được danh mục.');
    var data = safeError.data && typeof safeError.data === 'object' ? safeError.data : {};
    var code = String(data.code || safeError.code || 'LOOKUP_LOAD_FAILED').trim().toUpperCase();
    var messages = {
      LOOKUP_KEY_NOT_FOUND: 'Danh mục chưa được đồng bộ. Vui lòng liên hệ quản trị viên.',
      LOOKUP_CONTRACT_NOT_FOUND: 'Danh mục không thuộc contract hiện tại.',
      LOOKUP_DEPENDENCY_CONFLICT: 'Các trường dùng chung danh mục có dependency không đồng nhất.',
      LOOKUP_DEPENDENCY_REQUIRED: 'Vui lòng chọn trường liên quan trước.',
      LOOKUP_LOAD_FAILED: 'Không tải được danh sách. Vui lòng thử lại.'
    };
    safeError.code = code;
    safeError.userMessage = messages[code] || messages.LOOKUP_LOAD_FAILED;
    return safeError;
  }

  function searchLookup(formName, lookupKey, keyword, page, pageSize, dependencies, detailKey) {
    var requestedKey = String(lookupKey || '');
    var aliasPrefix = stateKey(formName) + '|';
    var aliasKey = aliasPrefix + requestedKey.toLowerCase();
    var effectiveKey = lookupKeyAliases[aliasKey] || requestedKey;
    var current = getState(formName);
    if (!current || current.metadataActive !== true || !/^[A-Fa-f0-9]{64}$/.test(effectiveKey)) {
      return Promise.reject(normalizeLookupError(new Error('Lookup V2 không hợp lệ.')));
    }
    var endpoint = metadataBaseUrl() + '/lookups/' + encodeURIComponent(effectiveKey) + '/search';
    return global.ApiClient.post(endpoint, {
      formName: formName,
      keyword: String(keyword || '').slice(0, 200),
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 30)),
      dependencies: lookupDependencies(dependencies),
      detailKey: /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(String(detailKey || '').trim()) ? String(detailKey).trim() : ''
    }, { headers: requestHeaders(), logoutOnUnauthorized: false }).then(function (response) {
      var resolvedKey = String(response && response.lookupKey || '');
      if (/^[A-Fa-f0-9]{64}$/.test(resolvedKey)) lookupKeyAliases[aliasKey] = resolvedKey;
      var aliases = response && response.lookupAliases && typeof response.lookupAliases === 'object'
        ? response.lookupAliases
        : {};
      Object.keys(aliases).forEach(function (staleKey) {
        var currentKey = String(aliases[staleKey] || '');
        if (/^[A-Fa-f0-9]{64}$/.test(staleKey) && /^[A-Fa-f0-9]{64}$/.test(currentKey)) {
          lookupKeyAliases[aliasPrefix + staleKey.toLowerCase()] = currentKey;
        }
      });
      return response && Array.isArray(response.options) ? response.options : [];
    }).catch(function (error) {
      throw normalizeLookupError(error);
    });
  }

  function createLookupDataSource(options) {
    var settings = options && typeof options === 'object' ? options : {};
    var pageSize = Math.min(100, Math.max(1, Number(settings.pageSize) || 30));
    return function (keyword, page) {
      var values = typeof settings.getDependencyValues === 'function'
        ? settings.getDependencyValues()
        : settings.dependencyValues;
      return searchLookup(
        settings.formName,
        settings.lookupKey,
        keyword,
        page,
        pageSize,
        declaredLookupDependencies(settings.dependsOn, values),
        settings.detailKey
      ).then(function (optionsList) {
        return {
          headers: [settings.valueHeader || 'Mã', settings.displayHeader || 'Tên'],
          data: optionsList.map(function (item) { return [item.value, item.label]; }),
          colFilterIndex: 1,
          forceMultiColumn: settings.forceMultiColumn === true,
          hasMore: optionsList.length === pageSize
        };
      });
    };
  }

  function updateFieldConfig(params) {
    return global.ApiClient.post(metadataBaseUrl() + '/field-config', params, {
      headers: requestHeaders(),
      logoutOnUnauthorized: false
    }).then(function (response) {
      clearCache(params && params.formName);
      if (global.EventBus && typeof global.EventBus.emit === 'function') {
        global.EventBus.emit('fieldCaptionUpdated', params);
      }
      return response;
    });
  }

  function getFormats() {
    return global.ApiClient.get(metadataBaseUrl() + '/formats', {
      headers: requestHeaders(),
      logoutOnUnauthorized: false
    }).then(function (response) {
      return response && Array.isArray(response.formats) ? response.formats : [];
    });
  }

  function getJoinSchema(formName, detailKey, forceRefresh) {
    var safeFormName = String(formName || '').trim();
    var safeDetailKey = String(detailKey || '').trim();
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(safeFormName)) {
      return Promise.reject(new Error('FormName của JOIN contract không hợp lệ.'));
    }
    if (!/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(safeDetailKey)) {
      return Promise.reject(new Error('DetailKey của JOIN contract không hợp lệ.'));
    }
    var endpoint = metadataBaseUrl() + '/join-schema/' + encodeURIComponent(safeFormName)
      + '/' + encodeURIComponent(safeDetailKey) + (forceRefresh === true ? '?refresh=1' : '');
    return global.ApiClient.get(endpoint, {
      headers: requestHeaders(),
      logoutOnUnauthorized: false
    }).then(function (response) {
      if (response && response.success === true && response.schema && Array.isArray(response.schema.fields)) {
        return response.schema;
      }
      throw new Error(response && response.message ? response.message : 'JOIN Field Contract không hợp lệ.');
    });
  }

  function clearCache(formName) {
    if (!formName) {
      states = Object.create(null);
      lastKnownV2 = Object.create(null);
      lookupKeyAliases = Object.create(null);
      return;
    }
    var prefix = normalizeName(formName) + '|';
    Object.keys(states).forEach(function (key) {
      if (key.indexOf(prefix) === 0) delete states[key];
    });
    Object.keys(lastKnownV2).forEach(function (key) {
      if (key.indexOf(prefix) === 0) delete lastKnownV2[key];
    });
    Object.keys(lookupKeyAliases).forEach(function (key) {
      if (key.indexOf(prefix) === 0) delete lookupKeyAliases[key];
    });
  }

  return Object.freeze({
    observeForm: observeForm,
    refreshForm: refreshForm,
    clearCache: clearCache,
    getState: getState,
    getContextKey: stateKey,
    getFilterSchema: getFilterSchema,
    searchLookup: searchLookup,
    createLookupDataSource: createLookupDataSource,
    updateFieldConfig: updateFieldConfig,
    getFormats: getFormats,
    getJoinSchema: getJoinSchema
  });
})(window);
