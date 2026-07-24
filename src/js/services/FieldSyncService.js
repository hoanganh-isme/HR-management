/** Field Contract V2. Phase 1 giữ Grid-only; registry Phase 3 dùng unified Grid/Add/Edit/Filter. */
window.FieldSyncService = (function (global) {
  var states = Object.create(null);
  var timers = Object.create(null);

  function config() {
    return global.ERP_FIELD_SYNC_CONFIG || { enabled: false, shadowMode: true, pilotForms: [], pollSeconds: 120 };
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

  function cloneSchema(schema) {
    return Array.isArray(schema) ? schema.map(cloneValue) : [];
  }

  function isPilot(formName) {
    var target = normalizeName(formName);
    var pilotForms = Array.isArray(config().pilotForms) ? config().pilotForms : [];
    return pilotForms.some(function (item) { return normalizeName(item) === target; });
  }

  function metadataBaseUrl() {
    var configured = config().metadataBaseUrl;
    if (configured) return configured;
    var manager = global.API_CONFIG && global.API_CONFIG.ENDPOINTS && global.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
    var serviceBase = manager && manager.SERVICE_BASE ? String(manager.SERVICE_BASE).replace(/\/+$/, '') : '';
    return serviceBase ? serviceBase + '/api/metadata' : '/api/metadata';
  }

  function requestHeaders() {
    return {
      Username: global.AppSession ? global.AppSession.getUserName() : '',
      BranchID: global.AppSession ? global.AppSession.getBranchId() : ''
    };
  }

  function erpFormId(formName) {
    return global.ErpFormAliases && typeof global.ErpFormAliases.resolve === 'function'
      ? global.ErpFormAliases.resolve(formName)
      : formName;
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

  function adaptGridFields(v2Fields, legacySchema) {
    var legacyByName = Object.create(null);
    (legacySchema || []).forEach(function (field) { legacyByName[normalizeName(field.name)] = field; });

    return (v2Fields || []).map(function (field, index) {
      var legacyKey = normalizeName(field.name);
      var hasLegacyField = Object.prototype.hasOwnProperty.call(legacyByName, legacyKey);
      var legacy = legacyByName[legacyKey] || {};
      var editable = legacy.showInEdit === true || String(legacy.showInEdit) === '1';
      var rawLookup = field.lookup && field.lookup.disabled !== true ? field.lookup : null;
      var lookup = rawLookup;
      return {
        name: field.name,
        label: field.label || field.name,
        orderNo: field.orderNo || index + 1,
        position: 'grid',
        renderRule: engineRule(field.renderRule || legacy.renderRule || legacy.FormatID),
        formatId: field.formatId || legacy.formatId || legacy.FormatID || '',
        FormatID: field.formatId || legacy.formatId || legacy.FormatID || '',
        formatType: field.formatType || legacy.formatType || legacy.FormatType || '',
        metadataSource: 'FIELD_SYNC_V2',
        // Field chỉ có ở V2 được hiển thị read-only và không gửi server-sort cho tới khi API có contract tương ứng.
        serverSortable: hasLegacyField,
        showInAdd: legacy.showInAdd,
        showInEdit: legacy.showInEdit,
        showInFilter: false,
        isReadOnlyAdd: legacy.isReadOnlyAdd,
        isReadOnlyEdit: legacy.isReadOnlyEdit,
        ShowInEdit: editable ? 1 : 0,
        IsReadOnlyEdit: legacy.isReadOnlyEdit ? 1 : 0,
        dataSource: field.dataSource || legacy.dataSource || legacy.DataSource || '',
        lookupKey: lookup && lookup.key ? lookup.key : (legacy.lookupKey || legacy.LookupKey || ''),
        minWidth: field.minWidth !== undefined ? field.minWidth : legacy.minWidth,
        maxWidth: field.maxWidth !== undefined ? field.maxWidth : legacy.maxWidth,
        maxLength: field.maxLength !== undefined ? field.maxLength : legacy.maxLength,
        minValue: field.minValue !== undefined ? field.minValue : legacy.minValue,
        maxValue: field.maxValue !== undefined ? field.maxValue : legacy.maxValue,
        align: field.align || legacy.align || legacy.Align,
        numberDecimal: field.numberDecimal !== undefined ? field.numberDecimal : legacy.numberDecimal,
        formatString: field.formatString || legacy.formatString || legacy.FormatString,
        maskString: field.maskString || legacy.maskString || legacy.MaskString,
        dependsOn: lookup && Array.isArray(lookup.dependsOn) ? lookup.dependsOn.join(',') : (legacy.dependsOn || legacy.DependsOn || '')
      };
    });
  }

  function createRuntimeSchemas(legacySchema, v2Fields, activateGrid) {
    var legacy = Array.isArray(legacySchema) ? legacySchema : [];
    return {
      grid: activateGrid && Array.isArray(v2Fields) && v2Fields.length ? adaptGridFields(v2Fields, legacy) : cloneSchema(legacy),
      edit: cloneSchema(legacy),
      add: cloneSchema(legacy),
      filters: cloneSchema(legacy)
    };
  }

  function registryEntry(formName) {
    var registry = global.FieldContractMigrationRegistry || global.Phase2MigrationRegistry;
    return registry && typeof registry.get === 'function' ? registry.get(formName) : null;
  }

  function usesUnifiedSchema(formName) {
    var registry = global.FieldContractMigrationRegistry || global.Phase2MigrationRegistry;
    if (registry && typeof registry.usesUnifiedSchema === 'function') return registry.usesUnifiedSchema(formName);
    var entry = registryEntry(formName);
    return Boolean(entry && (entry.enableGrid === true || entry.schemaPolicy === 'UNIFIED_V2'));
  }

  function adaptUnifiedField(field, index, writeActive, contextName) {
    var rawLookup = field.lookup && field.lookup.disabled !== true ? field.lookup : null;
    var lookup = rawLookup;
    var filterMeta = field.filter && typeof field.filter === 'object' ? field.filter : null;
    var isFilterContext = contextName === 'filters';
    var contextLabel = isFilterContext && filterMeta && filterMeta.label
      ? filterMeta.label
      : (field.label || field.name);
    var contextOrder = isFilterContext && filterMeta && Number(filterMeta.keyId)
      ? Number(filterMeta.keyId)
      : (field.orderNo || index + 1);
    var showInAdd = field.showInAdd === true;
    var showInEdit = field.showInEdit === true;
    var supportsInsert = field.supportsInsert === true;
    var supportsUpdate = field.supportsUpdate === true;
    var readOnlyAdd = !writeActive || !supportsInsert;
    var readOnlyEdit = !writeActive || !supportsUpdate;
    var mobileClass = String(field.mobileClass || 'OPTIONAL').toUpperCase();
    if (['CORE', 'OPTIONAL', 'ADVANCED', 'HIDDEN'].indexOf(mobileClass) === -1) mobileClass = 'OPTIONAL';
    var mobileOrder = Number(field.mobileOrder)
      || ((mobileClass === 'CORE' ? 0 : mobileClass === 'OPTIONAL' ? 10000 : mobileClass === 'ADVANCED' ? 20000 : 30000) + index + 1);
    return {
      name: field.name,
      label: contextLabel,
      orderNo: contextOrder,
      position: 'grid',
      renderRule: engineRule(field.renderRule),
      formatId: field.formatId || '',
      FormatID: field.formatId || '',
      formatType: field.formatType || '',
      sqlType: field.sqlType || '',
      nullable: field.nullable === true,
      required: field.requiredOnInsert === true,
      metadataSource: 'FIELD_CONTRACT_V2',
      serverSortable: field.supportsSort === true,
      showInGrid: field.showInGrid !== false,
      showInAdd: showInAdd,
      showInEdit: showInEdit,
      showInFilter: field.showInFilter === true && field.supportsFilter === true,
      isReadOnlyAdd: readOnlyAdd,
      isReadOnlyEdit: readOnlyEdit,
      ShowInEdit: showInEdit ? 1 : 0,
      IsReadOnlyEdit: readOnlyEdit ? 1 : 0,
      supportsInsert: supportsInsert,
      supportsUpdate: supportsUpdate,
      supportsFilter: field.supportsFilter === true,
      supportsKeyword: field.supportsKeyword === true,
      filterSourceFormId: filterMeta ? filterMeta.sourceFormId : '',
      filterKeyId: filterMeta ? filterMeta.keyId : '',
      filterControlType: filterMeta ? filterMeta.controlType : null,
      filterOperator: filterMeta ? filterMeta.operator : null,
      filterUseLikeOperator: filterMeta ? filterMeta.useLikeOperator === true : false,
      filterControlWidth: filterMeta ? filterMeta.controlWidth : null,
      filterValueField: filterMeta ? filterMeta.valueField : '',
      filterDisplayField: filterMeta ? filterMeta.displayField : '',
      filterDisplayColumns: filterMeta && Array.isArray(filterMeta.displayColumns)
        ? filterMeta.displayColumns.slice()
        : [],
      filterDefaultValue: filterMeta ? filterMeta.defaultValue : '',
      filterRememberLastValue: filterMeta ? filterMeta.rememberLastValue === true : false,
      filterReload: filterMeta ? filterMeta.reload === true : false,
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

  function mergeContractFields(allFields, selectedFields, predicate) {
    var source = Array.isArray(allFields) ? allFields : [];
    var byName = Object.create(null);
    source.forEach(function (field) { byName[normalizeName(field && field.name)] = field; });
    var selected = Array.isArray(selectedFields) ? selectedFields : source.filter(predicate);
    return selected.map(function (field) {
      var complete = byName[normalizeName(field && field.name)] || {};
      return Object.assign({}, complete, field || {});
    });
  }

  function createUnifiedRuntimeSchemas(contractOrFields, writeActive, entry) {
    var contract = Array.isArray(contractOrFields) ? { fields: contractOrFields } : (contractOrFields || {});
    var allFields = Array.isArray(contract.fields) ? contract.fields : (Array.isArray(contract.gridFields) ? contract.gridFields : []);
    var enabled = entry || {};
    var collections = {
      grid: mergeContractFields(allFields, contract.gridFields, function (field) { return field.showInGrid !== false; }),
      add: mergeContractFields(allFields, contract.addFields, function (field) { return field.showInAdd === true; }),
      edit: mergeContractFields(allFields, contract.editFields, function (field) { return field.showInEdit === true; }),
      filters: mergeContractFields(allFields, contract.filterFields, function (field) { return field.showInFilter === true && field.supportsFilter === true; })
    };
    function adapt(collection, contextName) {
      return collection.map(function (field, index) {
        return adaptUnifiedField(field, index, writeActive === true, contextName);
      });
    }
    return {
      grid: enabled.enableGrid === false ? [] : cloneSchema(adapt(collections.grid, 'grid')),
      edit: enabled.enableEdit === false ? [] : cloneSchema(adapt(collections.edit, 'edit')),
      add: enabled.enableAdd === false ? [] : cloneSchema(adapt(collections.add, 'add')),
      filters: enabled.enableFilter === false ? [] : cloneSchema(adapt(collections.filters, 'filters'))
    };
  }

  function isManagedForm(formName) {
    var registry = global.FieldContractMigrationRegistry || global.Phase2MigrationRegistry;
    return Boolean(registry && typeof registry.isManagedForm === 'function' && registry.isManagedForm(formName));
  }

  function hasBlockingDiagnostics(schema) {
    return Boolean(schema && Array.isArray(schema.diagnostics) && schema.diagnostics.some(function (item) {
      var severity = normalizeName(item && item.severity);
      var code = normalizeName(item && item.code);
      return severity === 'critical' || severity === 'error'
        || code === 'resultset_fallback_to_table'
        || code === 'shadow_view_not_registered';
    }));
  }

  function isUnifiedContractReady(schema, formName, expectedErpFormId) {
    if (!schema || schema.schemaVersion !== '2.0' || schema.capabilityVersion !== '1.0') return false;
    if (normalizeName(schema.formName) !== normalizeName(formName)) return false;
    if (normalizeName(schema.erpFormId) !== normalizeName(expectedErpFormId)) return false;
    var entry = registryEntry(formName) || {};
    if (entry.expectedTableName && normalizeName(schema.tableName) !== normalizeName(entry.expectedTableName)) return false;
    if (entry.expectedPrimaryKey && normalizeName(schema.primaryKey) !== normalizeName(entry.expectedPrimaryKey)) return false;
    if (normalizeName(schema.sourceKind) !== 'result_set' && normalizeName(schema.sourceKind) !== 'main_table') return false;
    var fields = Array.isArray(schema.fields) ? schema.fields : [];
    if (!fields.length || !Array.isArray(schema.gridFields) || !schema.gridFields.length) return false;
    if (!Array.isArray(schema.addFields) || !Array.isArray(schema.editFields) || !Array.isArray(schema.filterFields)) return false;
    var names = Object.create(null);
    var previousOrder = 0;
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i] || {};
      var key = normalizeName(field.name);
      var orderNo = Number(field.orderNo);
      if (!safeFieldName(field.name) || names[key] || !Number.isInteger(orderNo) || orderNo <= previousOrder) return false;
      if (typeof field.showInGrid !== 'boolean'
        || typeof field.supportsInsert !== 'boolean'
        || typeof field.supportsUpdate !== 'boolean'
        || typeof field.supportsFilter !== 'boolean'
        || typeof field.supportsSort !== 'boolean') return false;
      names[key] = true;
      previousOrder = orderNo;
    }
    var primaryKeys = primaryKeyParts(schema.primaryKey);
    if (primaryKeys.length !== 1 || !names[normalizeName(primaryKeys[0])]) return false;
    return Boolean(schema.runtimeRoutes && schema.runtimeRoutes.view && schema.runtimeRoutes.save && schema.runtimeRoutes.delete);
  }

  function hasCriticalParity(schema, comparison, formName) {
    var allowNewV2Fields = isManagedForm(formName);
    if (schema && Array.isArray(schema.diagnostics) && schema.diagnostics.some(function (item) {
      var severity = normalizeName(item && item.severity);
      var code = normalizeName(item && item.code);
      return severity === 'critical' || severity === 'error'
        || code === 'resultset_fallback_to_table'
        || code === 'shadow_view_not_registered';
    })) return true;
    if (comparison && comparison.primaryKey && normalizeName(comparison.primaryKey.status) === 'critical') return true;
    return Boolean(comparison && Array.isArray(comparison.items) && comparison.items.some(function (item) {
      var status = normalizeName(item && (item.severity || item.status));
      return status === 'critical' || status === 'only_legacy' || (status === 'only_v2' && !allowNewV2Fields);
    }));
  }

  function safeFieldName(value) {
    var name = String(value || '');
    var lower = name.toLowerCase();
    return /^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/.test(name)
      && lower !== '__proto__' && lower !== 'prototype' && lower !== 'constructor';
  }

  function primaryKeyParts(value) {
    return String(value || '').split(/[,;+]/).map(function (part) {
      return part.trim().replace(/^\[|\]$/g, '');
    }).filter(Boolean);
  }

  function isActivationContractReady(schema, comparison, formName, expectedErpFormId) {
    if (!schema || !comparison || schema.schemaVersion !== '2.0' || comparison.schemaVersion !== '2.0') return false;
    if (normalizeName(schema.formName) !== normalizeName(formName) || normalizeName(comparison.formName) !== normalizeName(formName)) return false;
    if (normalizeName(schema.erpFormId) !== normalizeName(expectedErpFormId) || normalizeName(comparison.erpFormId) !== normalizeName(expectedErpFormId)) return false;
    if (normalizeName(schema.sourceKind) !== 'result_set') return false;
    if (!Array.isArray(schema.gridFields) || !schema.gridFields.length || !Array.isArray(schema.lookups)) return false;

    var fieldNames = Object.create(null);
    var previousOrder = 0;
    for (var i = 0; i < schema.gridFields.length; i++) {
      var field = schema.gridFields[i] || {};
      var fieldName = String(field.name || '');
      var fieldKey = normalizeName(fieldName);
      var orderNo = Number(field.orderNo);
      if (!safeFieldName(fieldName) || fieldNames[fieldKey] || !Number.isInteger(orderNo) || orderNo <= previousOrder) return false;
      fieldNames[fieldKey] = true;
      previousOrder = orderNo;
    }

    var primaryKeys = primaryKeyParts(schema.primaryKey);
    if (!primaryKeys.length || primaryKeys.some(function (key) { return !safeFieldName(key) || !fieldNames[normalizeName(key)]; })) return false;
    var parityKey = comparison.primaryKey || {};
    if (normalizeName(parityKey.status) !== 'match' || !normalizeName(parityKey.legacy) || !normalizeName(parityKey.v2)) return false;
    if (normalizeName(parityKey.legacy) !== normalizeName(parityKey.v2) || normalizeName(parityKey.v2) !== normalizeName(schema.primaryKey)) return false;

    if (!Array.isArray(comparison.items)) return false;
    var allowedStatuses = { match: true, caption_diff: true, format_diff: true, lookup_diff: true, critical: true, only_v2: true, only_legacy: true };
    var comparedFields = Object.create(null);
    for (var j = 0; j < comparison.items.length; j++) {
      var item = comparison.items[j] || {};
      var comparedName = normalizeName(item.fieldName);
      var status = normalizeName(item.status);
      if (!safeFieldName(item.fieldName) || comparedFields[comparedName] || !allowedStatuses[status]) return false;
      comparedFields[comparedName] = true;
    }
    if (Object.keys(fieldNames).some(function (fieldKey) { return !comparedFields[fieldKey]; })) return false;

    var lookupKeys = Object.create(null);
    for (var k = 0; k < schema.lookups.length; k++) {
      var lookup = schema.lookups[k] || {};
      if (lookup.disabled === true) continue;
      var lookupKey = String(lookup.key || '').toLowerCase();
      if (!/^[a-f0-9]{64}$/.test(lookupKey) || lookupKeys[lookupKey] || !fieldNames[normalizeName(lookup.fieldName)]) return false;
      lookupKeys[lookupKey] = true;
    }
    return true;
  }

  function stateKey(formName) {
    var userName = global.AppSession ? global.AppSession.getUserName() : '';
    var branchId = global.AppSession ? global.AppSession.getBranchId() : '';
    return [normalizeName(formName), normalizeName(erpFormId(formName)), normalizeName(userName), normalizeName(branchId)].join('|');
  }

  function storeParity(formName, comparison) {
    try {
      global.sessionStorage.setItem('ERP_FIELD_SYNC_PARITY:' + stateKey(formName), JSON.stringify(comparison));
    } catch (ignore) { }
  }

  function dispatchUpdate(formName, state) {
    if (!global.document || typeof global.CustomEvent !== 'function') return;
    global.document.dispatchEvent(new global.CustomEvent('erpFieldSyncUpdated', {
      detail: { formName: formName, contextKey: state && state.contextKey ? state.contextKey : stateKey(formName), state: state }
    }));
  }

  function requestMetadata(formName, includeComparison, forceRefresh) {
    var headers = requestHeaders();
    var metadataRequestOptions = { headers: headers, logoutOnUnauthorized: false };
    var encodedForm = encodeURIComponent(formName);
    var base = metadataBaseUrl() + '/grid-schema/' + encodedForm;
    var expectedErpFormId = erpFormId(formName);
    var aliasQuery = '?erpFormId=' + encodeURIComponent(expectedErpFormId)
      + (forceRefresh === true ? '&refresh=1' : '');
    var requests = [global.ApiClient.get(base + aliasQuery, metadataRequestOptions)];
    if (includeComparison !== false) requests.push(global.ApiClient.get(base + '/compare' + aliasQuery, metadataRequestOptions));
    return Promise.all(requests).then(function (responses) {
      return {
        schema: responses[0] && responses[0].schema,
        comparison: responses[1] && responses[1].comparison,
        expectedErpFormId: expectedErpFormId
      };
    });
  }

  function clearFormTimers(formName) {
    var prefix = normalizeName(formName) + '|';
    Object.keys(timers).forEach(function (key) {
      if (key.indexOf(prefix) !== 0) return;
      if (typeof global.clearInterval === 'function') global.clearInterval(timers[key]);
      delete timers[key];
    });
  }

  function legacyFullState(formName, legacySchema, status, schema, errorCode, errorMessage) {
    return {
      status: status || 'legacy-full',
      runtimeMode: 'LEGACY_FULL',
      managed: true,
      active: false,
      writeActive: false,
      deleteActive: false,
      contextKey: stateKey(formName),
      schema: schema || null,
      comparison: null,
      runtimeSchemas: createRuntimeSchemas(legacySchema, [], false),
      loadedAt: Date.now(),
      errorCode: errorCode || null,
      error: errorMessage || null
    };
  }

  function errorState(formName, status, errorCode, errorMessage, schema) {
    return {
      status: status,
      runtimeMode: status === 'cutover-contract-error' ? 'CUTOVER_CONTRACT_ERROR' : 'METADATA_ERROR',
      managed: true,
      active: false,
      writeActive: false,
      deleteActive: false,
      contextKey: stateKey(formName),
      schema: schema || null,
      comparison: null,
      runtimeSchemas: createUnifiedRuntimeSchemas([], false, registryEntry(formName) || {}),
      loadedAt: Date.now(),
      errorCode: errorCode,
      error: errorMessage
    };
  }

  function authVerifyEndpoint() {
    var auth = global.API_CONFIG && global.API_CONFIG.ENDPOINTS && global.API_CONFIG.ENDPOINTS.AUTH;
    return auth && auth.USER_INFO ? auth.USER_INFO : '/api/userinfo';
  }

  function verifyPrimarySession() {
    return global.ApiClient.get(authVerifyEndpoint(), { logoutOnUnauthorized: false }).then(function () {
      return { expired: false };
    }).catch(function (error) {
      return { expired: Boolean(error && error.status === 401), error: error };
    });
  }

  function expirePrimarySession() {
    if (typeof global.logoutApp === 'function') {
      global.logoutApp();
      return;
    }
    if (global.ApiClient && typeof global.ApiClient.deleteCookie === 'function') global.ApiClient.deleteCookie('auth_token');
    try { global.localStorage.removeItem('pmql_user'); } catch (ignore) { }
    if (global.location) global.location.href = 'login.html';
  }

  function managedDeleteReady(entry, registeredDelete, deleteMode) {
    if (!entry || entry.enableDelete !== true) return false;
    if (normalizeName(registeredDelete) !== normalizeName(entry.deleteV2)) return false;
    var policy = String(entry.deletePolicy || 'BLOCKED_NO_SOFT_DELETE').toUpperCase();
    if (policy === 'AUTO_SCHEMA') {
      return deleteMode === 'soft' || deleteMode === 'hard' || deleteMode === 'hard_approved';
    }
    if (policy === 'SOFT') return deleteMode === 'soft';
    if (policy === 'HARD_APPROVED') return deleteMode === 'hard_approved';
    return false;
  }

  function fetchManagedState(formName, legacySchema, force) {
    var key = stateKey(formName);
    var entry = registryEntry(formName) || {};
    var current = states[key];
    var requestedActive = isPilot(formName) && config().enabled === true && config().shadowMode === false;
    var ttlMs = Math.max(5, Number(config().pollSeconds) || 120) * 1000;
    var resolvedLegacySchema = Array.isArray(legacySchema) && legacySchema.length
      ? legacySchema
      : ((current && current.runtimeMode === 'LEGACY_FULL' && current.runtimeSchemas && current.runtimeSchemas.grid) || []);

    if (!requestedActive) {
      clearFormTimers(formName);
      var legacyDisabled = legacyFullState(
        formName,
        resolvedLegacySchema,
        config().enabled === true && config().shadowMode === true ? 'legacy-shadow' : 'legacy-disabled'
      );
      states[key] = legacyDisabled;
      return Promise.resolve(legacyDisabled);
    }

    if (current && current.pending) return current.pending;
    if (!force && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      current.runtimeSchemas = current.runtimeMode === 'LEGACY_FULL'
        ? createRuntimeSchemas(resolvedLegacySchema, [], false)
        : createUnifiedRuntimeSchemas(current.schema || [], current.writeActive === true, entry);
      return Promise.resolve(current);
    }

    var lastKnownV2 = current && current.schema && current.active === true ? current : null;
    var lastKnownLegacy = current && current.runtimeMode === 'LEGACY_FULL' ? current : null;
    var pending = requestMetadata(formName, false, force === true).then(function (metadata) {
      var schema = metadata.schema;
      if (!schema || !Array.isArray(schema.gridFields)) {
        var invalid = new Error('Unified Field Contract không hợp lệ.');
        invalid.code = 'FIELD_CONTRACT_INVALID';
        throw invalid;
      }

      var routes = schema.runtimeRoutes || {};
      var registeredView = routes.view && routes.view.registeredProcedure;
      var registeredSave = routes.save && routes.save.registeredProcedure;
      var registeredDelete = routes.delete && routes.delete.registeredProcedure;
      var deleteMode = normalizeName(routes.delete && routes.delete.mode);
      var viewRouteReady = normalizeName(registeredView) === normalizeName(entry.viewV2);
      var legacyViewRegistered = !viewRouteReady && (
        normalizeName(registeredView) === normalizeName(entry.oldView) || !registeredView
      );

      if (legacyViewRegistered) {
        var legacy = legacyFullState(formName, resolvedLegacySchema, 'legacy-view-not-cutover', schema, 'VIEW_V2_NOT_ACTIVE', null);
        states[key] = legacy;
        dispatchUpdate(formName, legacy);
        return legacy;
      }

      var contractReady = isUnifiedContractReady(schema, formName, metadata.expectedErpFormId);
      var blocked = !contractReady || hasBlockingDiagnostics(schema);
      if (!viewRouteReady || blocked) {
        var cutoverError = errorState(
          formName,
          'cutover-contract-error',
          !viewRouteReady ? 'VIEW_ROUTE_UNEXPECTED' : 'FIELD_CONTRACT_INVALID_AFTER_CUTOVER',
          !viewRouteReady ? 'Route View không khớp registry migration.' : 'View V2 đã cutover nhưng Unified Field Contract không đạt gate.',
          schema
        );
        states[key] = cutoverError;
        dispatchUpdate(formName, cutoverError);
        return cutoverError;
      }

      var writeActive = entry.enableSave === true && normalizeName(registeredSave) === normalizeName(entry.saveV2);
      var deleteActive = managedDeleteReady(entry, registeredDelete, deleteMode);
      var next = {
        status: writeActive ? 'unified-active' : 'unified-readonly',
        runtimeMode: 'V2_FULL',
        managed: true,
        active: true,
        writeActive: writeActive,
        deleteActive: deleteActive,
        contextKey: key,
        schema: schema,
        comparison: null,
        runtimeSchemas: createUnifiedRuntimeSchemas(schema, writeActive, entry),
        loadedAt: Date.now(),
        errorCode: null,
        error: null
      };
      states[key] = next;
      dispatchUpdate(formName, next);
      return next;
    }).catch(function (error) {
      var status = Number(error && error.status) || 0;
      var upstreamCode = String((error && error.data && error.data.code) || (error && error.code) || '').trim().toUpperCase();
      if (status === 401) {
        return verifyPrimarySession().then(function (verification) {
          var sessionState;
          if (verification.expired) {
            sessionState = errorState(formName, 'metadata-session-expired', 'PRIMARY_SESSION_EXPIRED', 'Phiên đăng nhập đã hết hạn.');
            expirePrimarySession();
          } else {
            sessionState = errorState(formName, 'metadata-session-error', 'METADATA_UNAUTHORIZED', 'Metadata từ chối xác thực nhưng phiên chính vẫn còn hiệu lực.');
          }
          states[key] = sessionState;
          dispatchUpdate(formName, sessionState);
          return sessionState;
        });
      }
      if (status === 403) {
        var denied = errorState(formName, 'metadata-permission-error', 'METADATA_FORBIDDEN', 'Tài khoản không có quyền đọc metadata của form này.');
        states[key] = denied;
        dispatchUpdate(formName, denied);
        return denied;
      }
      var isContractFailure = status === 409 || upstreamCode.indexOf('FIELD_CONTRACT_') === 0;
      if (isContractFailure) {
        var rejected = errorState(
          formName,
          'cutover-contract-error',
          upstreamCode || 'FIELD_CONTRACT_REJECTED',
          error && error.message ? error.message : 'Unified Field Contract bị backend từ chối.'
        );
        states[key] = rejected;
        dispatchUpdate(formName, rejected);
        return rejected;
      }
      var isTransientMetadataFailure = status === 0 || status === 500 || status === 502 || status === 503 || status === 504;
      if (isTransientMetadataFailure && lastKnownV2) {
        var readOnly = {
          status: 'unified-last-known-readonly',
          runtimeMode: 'V2_READONLY',
          managed: true,
          active: true,
          writeActive: false,
          deleteActive: false,
          contextKey: key,
          schema: lastKnownV2.schema,
          comparison: null,
          runtimeSchemas: createUnifiedRuntimeSchemas(lastKnownV2.schema, false, entry),
          loadedAt: Date.now(),
          errorCode: 'METADATA_UNAVAILABLE_LAST_KNOWN',
          error: error && error.message ? error.message : 'Không làm mới được Unified Field Contract.'
        };
        states[key] = readOnly;
        dispatchUpdate(formName, readOnly);
        return readOnly;
      }
      if (isTransientMetadataFailure && lastKnownLegacy) {
        var fallbackLegacySchema = Array.isArray(legacySchema) && legacySchema.length
          ? legacySchema
          : ((lastKnownLegacy.runtimeSchemas && lastKnownLegacy.runtimeSchemas.grid) || []);
        var legacyFallback = legacyFullState(formName, fallbackLegacySchema, 'legacy-last-known', lastKnownLegacy.schema, 'METADATA_UNAVAILABLE_LEGACY', error && error.message);
        states[key] = legacyFallback;
        dispatchUpdate(formName, legacyFallback);
        return legacyFallback;
      }
      var unavailable = errorState(
        formName,
        'metadata-unavailable',
        upstreamCode || (isTransientMetadataFailure ? 'METADATA_UNAVAILABLE_UNKNOWN_STATE' : 'METADATA_REQUEST_REJECTED'),
        error && error.message ? error.message : 'Không thể đọc metadata ERP.'
      );
      states[key] = unavailable;
      dispatchUpdate(formName, unavailable);
      return unavailable;
    });

    states[key] = {
      status: 'loading',
      runtimeMode: current && current.runtimeMode ? current.runtimeMode : 'LOADING',
      managed: true,
      active: Boolean(current && current.active),
      writeActive: false,
      deleteActive: false,
      contextKey: key,
      pending: pending,
      schema: current && current.schema ? current.schema : null,
      runtimeSchemas: current && current.runtimeSchemas ? current.runtimeSchemas : createUnifiedRuntimeSchemas([], false, entry)
    };
    return pending;
  }

  function fetchState(formName, legacySchema, force) {
    var unified = usesUnifiedSchema(formName);
    if (unified) return fetchManagedState(formName, legacySchema, force);
    if (!isPilot(formName)) {
      clearFormTimers(formName);
      return Promise.resolve({
        status: unified ? 'unified-disabled' : 'not-pilot',
        active: false,
        writeActive: false,
        deleteActive: false,
        contextKey: stateKey(formName),
        runtimeSchemas: unified ? createUnifiedRuntimeSchemas([], false) : createRuntimeSchemas(legacySchema, [], false)
      });
    }

    var key = stateKey(formName);
    var current = states[key];
    var ttlMs = config().pollSeconds * 1000;
    if (!force && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      current.runtimeSchemas = unified
        ? createUnifiedRuntimeSchemas(current.schema && (current.schema.fields || current.schema.gridFields), current.writeActive === true)
        : createRuntimeSchemas(legacySchema, current.schema && current.schema.gridFields, current.active === true);
      return Promise.resolve(current);
    }
    if (!force && current && current.pending) return current.pending;

    var requestedActive = config().enabled === true && config().shadowMode === false;
    var lastKnown = current && current.schema && current.active === true ? current : null;
    var pending = requestMetadata(formName, !unified, force === true).then(function (metadata) {
      var schema = metadata.schema;
      var comparison = metadata.comparison;
      var expectedErpFormId = metadata.expectedErpFormId;
      if (!schema || !Array.isArray(schema.gridFields)) throw new Error('Grid Schema V2 không hợp lệ');

      if (unified) {
        var entry = registryEntry(formName) || {};
        var contractReady = isUnifiedContractReady(schema, formName, expectedErpFormId);
        var routes = schema.runtimeRoutes || {};
        var registeredView = routes.view && routes.view.registeredProcedure;
        var registeredSave = routes.save && routes.save.registeredProcedure;
        var registeredDelete = routes.delete && routes.delete.registeredProcedure;
        var deleteMode = normalizeName(routes.delete && routes.delete.mode);
        var viewRouteReady = normalizeName(registeredView) === normalizeName(entry.viewV2);
        var saveRouteReady = normalizeName(registeredSave) === normalizeName(entry.saveV2);
        var deleteRouteReady = normalizeName(registeredDelete) === normalizeName(entry.deleteV2)
          && (deleteMode === 'soft' || deleteMode === 'hard' || deleteMode === 'hard_approved');
        var blocked = !contractReady || hasBlockingDiagnostics(schema);
        var active = requestedActive && !blocked && viewRouteReady;
        var writeActive = active && saveRouteReady;
        var deleteActive = active && deleteRouteReady;
        var fields = schema.fields || schema.gridFields;
        var nextUnified = {
          status: active
            ? (writeActive ? 'unified-active' : 'unified-readonly')
            : (requestedActive ? 'unified-blocked' : 'shadow'),
          active: active,
          writeActive: writeActive,
          deleteActive: deleteActive,
          contextKey: key,
          schema: schema,
          comparison: null,
          runtimeSchemas: active ? createUnifiedRuntimeSchemas(fields, writeActive) : createUnifiedRuntimeSchemas([], false),
          loadedAt: Date.now(),
          error: active ? null : 'Form Contract V2 chưa được kích hoạt hoặc route View V2 chưa đúng.'
        };
        states[key] = nextUnified;
        dispatchUpdate(formName, nextUnified);
        return nextUnified;
      }

      var contractReady = isActivationContractReady(schema, comparison, formName, expectedErpFormId);
      var critical = hasCriticalParity(schema, comparison, formName) || !contractReady;
      var parityReady = contractReady && comparison && comparison.primaryKey && normalizeName(comparison.primaryKey.status) === 'match';
      var active = requestedActive && !critical && parityReady;
      var next = {
        status: active ? 'pilot-active' : (requestedActive && critical ? 'pilot-blocked-critical' : (requestedActive ? 'pilot-blocked-parity' : 'shadow')),
        active: active,
        contextKey: key,
        schema: schema,
        comparison: comparison || null,
        runtimeSchemas: createRuntimeSchemas(legacySchema, schema.gridFields, active),
        loadedAt: Date.now(),
        error: null
      };
      states[key] = next;
      if (comparison) storeParity(formName, comparison);
      dispatchUpdate(formName, next);
      return next;
    }).catch(function (error) {
      if (unified && lastKnown) {
        var readOnly = {
          status: 'unified-last-known-readonly',
          active: true,
          writeActive: false,
          deleteActive: false,
          contextKey: key,
          schema: lastKnown.schema,
          comparison: null,
          runtimeSchemas: createUnifiedRuntimeSchemas(lastKnown.schema.fields || lastKnown.schema.gridFields, false),
          loadedAt: Date.now(),
          error: error && error.message ? error.message : 'Không làm mới được Form Contract V2'
        };
        states[key] = readOnly;
        dispatchUpdate(formName, readOnly);
        return readOnly;
      }
      var fallback = {
        status: unified ? 'unified-error' : 'legacy-fallback',
        active: false,
        writeActive: false,
        deleteActive: false,
        contextKey: key,
        runtimeSchemas: unified ? createUnifiedRuntimeSchemas([], false) : createRuntimeSchemas(legacySchema, [], false),
        loadedAt: Date.now(),
        error: error && error.message ? error.message : 'Không tải được Form Contract V2'
      };
      states[key] = fallback;
      dispatchUpdate(formName, fallback);
      return fallback;
    });

    states[key] = {
      status: 'loading',
      active: false,
      writeActive: false,
      deleteActive: false,
      contextKey: key,
      pending: pending,
      runtimeSchemas: unified ? createUnifiedRuntimeSchemas([], false) : createRuntimeSchemas(legacySchema, [], false)
    };
    return pending;
  }

  function ensurePolling(formName, legacySchema) {
    if (!isPilot(formName) || typeof global.setInterval !== 'function') return;
    var key = stateKey(formName);
    if (timers[key]) return;
    timers[key] = global.setInterval(function () {
      if (!isPilot(formName) || stateKey(formName) !== key) {
        if (typeof global.clearInterval === 'function') global.clearInterval(timers[key]);
        delete timers[key];
        return;
      }
      var current = states[key];
      var effectiveLegacySchema = Array.isArray(legacySchema) && legacySchema.length
        ? legacySchema
        : ((current && current.runtimeMode === 'LEGACY_FULL' && current.runtimeSchemas && current.runtimeSchemas.grid) || []);
      fetchState(formName, effectiveLegacySchema, true);
    }, config().pollSeconds * 1000);
  }

  function observeForm(formName, legacySchema) {
    ensurePolling(formName, legacySchema);
    return fetchState(formName, legacySchema, usesUnifiedSchema(formName));
  }

  function refreshForm(formName, legacySchema) {
    return fetchState(formName, Array.isArray(legacySchema) ? legacySchema : [], true);
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

  function searchLookup(formName, lookupKey, keyword, page, pageSize, dependencies) {
    if (!isPilot(formName) || !/^[A-Fa-f0-9]{64}$/.test(String(lookupKey || ''))) {
      return Promise.reject(new Error('Lookup V2 không hợp lệ'));
    }
    var endpoint = metadataBaseUrl() + '/lookups/' + encodeURIComponent(lookupKey) + '/search';
    return global.ApiClient.post(endpoint, {
      formName: formName,
      erpFormId: erpFormId(formName),
      keyword: String(keyword || '').slice(0, 200),
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 30)),
      dependencies: lookupDependencies(dependencies)
    }, { headers: requestHeaders(), logoutOnUnauthorized: false }).then(function (response) {
      return response && Array.isArray(response.options) ? response.options : [];
    });
  }

  function getState(formName) {
    return states[stateKey(formName)] || null;
  }

  function inspectForm(formName) {
    var registry = global.FieldContractMigrationRegistry || global.Phase2MigrationRegistry;
    if (!registry || typeof registry.isManagedForm !== 'function' || !registry.isManagedForm(formName)) {
      return Promise.reject(new Error('Form không nằm trong Unified Field Contract registry'));
    }
    return requestMetadata(formName, true, true).then(function (metadata) {
      if (!metadata.schema || !metadata.comparison) throw new Error('Metadata compare V2 không hợp lệ');
      return {
        status: 'compare-only',
        schema: metadata.schema,
        comparison: metadata.comparison,
        active: false
      };
    });
  }

  function updateFieldConfig(params) {
    var endpoint = metadataBaseUrl() + '/field-config';
    return global.ApiClient.post(endpoint, params, { headers: requestHeaders(), logoutOnUnauthorized: false })
      .then(function (res) {
        clearCache(params && params.formName);
        if (global._uiConfigCache) {
          global._uiConfigCache = Object.create(null);
        }
        if (typeof global.EventBus !== 'undefined' && typeof global.EventBus.emit === 'function') {
          global.EventBus.emit('fieldCaptionUpdated', params);
        }
        return res;
      });
  }

  function getFormats() {
    var endpoint = metadataBaseUrl() + '/formats';
    return global.ApiClient.get(endpoint, { headers: requestHeaders(), logoutOnUnauthorized: false })
      .then(function (res) {
        return res && Array.isArray(res.formats) ? res.formats : [];
      }).catch(function () {
        return [
          { formatId: '', type: 'Text', description: 'Văn bản mặc định (Text)' },
          { formatId: 'D', type: 'Date', description: 'Ngày (dd/MM/yyyy)' },
          { formatId: 'DT', type: 'DateTime', description: 'Ngày giờ (dd/MM/yyyy HH:mm)' },
          { formatId: 'H', type: 'Time', description: 'Giờ (HH:mm)' },
          { formatId: 'B', type: 'Money', description: 'Tiền tệ (Money)' },
          { formatId: 'N', type: 'Number', description: 'Số nguyên (Number)' },
          { formatId: 'Q', type: 'Decimal', description: 'Số thập phân (Decimal)' },
          { formatId: 'C', type: 'Checkbox', description: 'Hộp chọn (Checkbox)' }
        ];
      });
  }

  function clearCache(formName) {
    if (formName) {
      delete states[stateKey(formName)];
    } else {
      states = Object.create(null);
    }
  }

  return Object.freeze({
    observeForm: observeForm,
    refreshForm: refreshForm,
    searchLookup: searchLookup,
    getState: getState,
    getContextKey: function (formName) { return stateKey(formName); },
    inspectForm: inspectForm,
    isPilot: isPilot,
    isManagedForm: isManagedForm,
    createRuntimeSchemas: createRuntimeSchemas,
    createUnifiedRuntimeSchemas: createUnifiedRuntimeSchemas,
    usesUnifiedSchema: usesUnifiedSchema,
    updateFieldConfig: updateFieldConfig,
    getFormats: getFormats,
    clearCache: clearCache
  });
})(window);
