/** Field Contract V2. Phase 1 giữ Grid-only; registry Phase 3 dùng unified Grid/Add/Edit/Filter. */
window.FieldSyncService = (function (global) {
  var states = Object.create(null);
  var timers = Object.create(null);
  var lookupKeyAliases = Object.create(null);
  var listenersInstalled = false;

  function config() {
    return global.ERP_FIELD_SYNC_CONFIG || {
      enabled: false,
      shadowMode: true,
      rolloutMode: 'registry',
      includeForms: [],
      excludeForms: [],
      fallbackToLegacy: false,
      pollSeconds: 120
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

  function cloneSchema(schema) {
    return Array.isArray(schema) ? schema.map(cloneValue) : [];
  }

  function isMetadataContractForm(formName) {
    return /(?:Frm|Report)$/i.test(String(formName || '').trim());
  }

  function isPilot(formName) {
    // Form CRUD và report động đều dùng cùng nguồn metadata V2.
    if (!isMetadataContractForm(formName)) return false;
    var target = normalizeName(formName);
    var settings = config();
    var excluded = Array.isArray(settings.excludeForms) ? settings.excludeForms : [];
    if (excluded.some(function (item) { return normalizeName(item) === target; })) return false;
    var included = Array.isArray(settings.includeForms) ? settings.includeForms : [];
    if (included.some(function (item) { return normalizeName(item) === target; })) return true;
    var legacyPilotForms = Array.isArray(settings.pilotForms) ? settings.pilotForms : [];
    if (settings.rolloutMode === 'pilot') {
      return legacyPilotForms.some(function (item) { return normalizeName(item) === target; });
    }
    return settings.rolloutMode === 'registry';
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
    var state = states[stateKey(formName)];
    return state ? state.managed === true : isPilot(formName);
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
    var expectedErpFormId = erpFormId(formName);
    var stateUrl = metadataBaseUrl() + '/contract-state/' + encodedForm
      + (forceRefresh === true ? '?refresh=1' : '');
    return global.ApiClient.get(stateUrl, metadataRequestOptions).then(function (contractState) {
      var control = contractState && contractState.contract;
      if (!contractState || contractState.metadataEnabled !== true) {
        return {
          schema: null,
          comparison: null,
          control: control || null,
          registered: Boolean(contractState && contractState.registered === true),
          metadataEnabled: false,
          backendActive: false,
          reasonCode: String(
            contractState && (
              contractState.metadataReasonCode
              || contractState.reasonCode
            ) || ''
          ).trim().toUpperCase(),
          expectedErpFormId: expectedErpFormId
        };
      }

      var base = metadataBaseUrl() + '/grid-schema/' + encodedForm;
      var aliasQuery = '?erpFormId=' + encodeURIComponent(expectedErpFormId)
        + (forceRefresh === true ? '&refresh=1' : '');
      var requests = [global.ApiClient.get(base + aliasQuery, metadataRequestOptions)];
      if (includeComparison !== false) {
        requests.push(global.ApiClient.get(base + '/compare' + aliasQuery, metadataRequestOptions));
      }
      return Promise.all(requests).then(function (responses) {
        return {
          schema: responses[0] && responses[0].schema,
          comparison: responses[1] && responses[1].comparison,
          control: (responses[0] && responses[0].contract) || control,
          registered: true,
          metadataEnabled: true,
          backendActive: Boolean(responses[0] && responses[0].active === true),
          reasonCode: null,
          expectedErpFormId: expectedErpFormId
        };
      });
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
      metadataActive: false,
      active: false,
      writeAvailable: false,
      deleteAvailable: false,
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
      metadataActive: false,
      active: false,
      writeAvailable: false,
      deleteAvailable: false,
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
    var metadataRequested = isPilot(formName) && config().enabled === true;
    var requestedActive = metadataRequested && config().shadowMode === false;
    var ttlMs = Math.max(5, Number(config().pollSeconds) || 120) * 1000;
    var resolvedLegacySchema = Array.isArray(legacySchema) && legacySchema.length
      ? legacySchema
      : ((current && current.runtimeMode === 'LEGACY_FULL' && current.runtimeSchemas && current.runtimeSchemas.grid) || []);

    if (!metadataRequested) {
      clearFormTimers(formName);
      var legacyDisabled = legacyFullState(
        formName,
        resolvedLegacySchema,
        'legacy-disabled'
      );
      legacyDisabled.managed = false;
      states[key] = legacyDisabled;
      return Promise.resolve(legacyDisabled);
    }

    if (current && current.pending) return current.pending;
    if (!force && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      current.runtimeSchemas = current.metadataActive === true
        ? createUnifiedRuntimeSchemas(current.schema || [], current.writeAvailable === true, entry)
        : createRuntimeSchemas(resolvedLegacySchema, [], false);
      return Promise.resolve(current);
    }

    var lastKnownV2 = current && current.schema && current.metadataActive === true ? current : null;
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

      var contractReady = isUnifiedContractReady(schema, formName, metadata.expectedErpFormId);
      var blocked = !contractReady || hasBlockingDiagnostics(schema);
      if ((!viewRouteReady && !legacyViewRegistered) || blocked) {
        var cutoverError = errorState(
          formName,
          'cutover-contract-error',
          !viewRouteReady && !legacyViewRegistered ? 'VIEW_ROUTE_UNEXPECTED' : 'FIELD_CONTRACT_INVALID',
          !viewRouteReady && !legacyViewRegistered
            ? 'Route xem dữ liệu không khớp contract đã đăng ký.'
            : 'Metadata V2 không đạt điều kiện an toàn.',
          schema
        );
        states[key] = cutoverError;
        dispatchUpdate(formName, cutoverError);
        return cutoverError;
      }

      var active = requestedActive && viewRouteReady;
      var writeAvailable = entry.enableSave === true && Boolean(registeredSave);
      var deleteAvailable = entry.enableDelete === true && Boolean(registeredDelete);
      var writeActive = active && normalizeName(registeredSave) === normalizeName(entry.saveV2);
      var deleteActive = active && managedDeleteReady(entry, registeredDelete, deleteMode);
      var next = {
        status: active
          ? (writeActive ? 'unified-active' : 'unified-readonly')
          : 'metadata-v2-current-business',
        runtimeMode: active ? 'V2_FULL' : 'V2_METADATA_CURRENT_BUSINESS',
        managed: true,
        metadataActive: true,
        active: active,
        writeAvailable: writeAvailable,
        deleteAvailable: deleteAvailable,
        writeActive: writeActive,
        deleteActive: deleteActive,
        contextKey: key,
        schema: schema,
        comparison: null,
        runtimeSchemas: createUnifiedRuntimeSchemas(schema, writeAvailable, entry),
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
          metadataActive: true,
          active: true,
          writeAvailable: false,
          deleteAvailable: false,
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
      metadataActive: Boolean(current && current.metadataActive),
      active: Boolean(current && current.active),
      writeAvailable: false,
      deleteAvailable: false,
      writeActive: false,
      deleteActive: false,
      contextKey: key,
      pending: pending,
      schema: current && current.schema ? current.schema : null,
      runtimeSchemas: current && current.runtimeSchemas ? current.runtimeSchemas : createUnifiedRuntimeSchemas([], false, entry)
    };
    return pending;
  }

  function fetchRegistryState(formName, legacySchema, force) {
    var key = stateKey(formName);
    var current = states[key];
    var settings = config();
    var ttlSeconds = Number(settings.pollSeconds);
    var ttlMs = Math.max(30, Number.isFinite(ttlSeconds) ? ttlSeconds : 120) * 1000;
    var resolvedLegacySchema = Array.isArray(legacySchema) && legacySchema.length
      ? legacySchema
      : ((current && current.runtimeMode === 'LEGACY_FULL' && current.runtimeSchemas && current.runtimeSchemas.grid) || []);

    if (!isPilot(formName) || settings.enabled !== true) {
      clearFormTimers(formName);
      var disabled = legacyFullState(formName, resolvedLegacySchema, 'legacy-disabled');
      disabled.managed = false;
      disabled.rolloutStatus = 'DISABLED';
      disabled.pollAllowed = false;
      states[key] = disabled;
      return Promise.resolve(disabled);
    }
    if (!force && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      current.runtimeSchemas = current.metadataActive === true
        ? createUnifiedRuntimeSchemas(current.schema || {}, current.writeAvailable === true, current.registryEntry || {})
        : createRuntimeSchemas(resolvedLegacySchema, [], false);
      return Promise.resolve(current);
    }
    if (current && current.pending) return current.pending;

    var lastKnownMetadata = current && current.metadataActive === true && current.schema ? current : null;
    var pending = requestMetadata(formName, false, force === true).then(function (metadata) {
      var schema = metadata.schema;
      var control = metadata.control || {};
      var reasonStatus = String(metadata.reasonCode || '').replace(/^FIELD_CONTRACT_/, '');
      var rolloutStatus = String(control.rolloutStatus || reasonStatus || 'NOT_REGISTERED').toUpperCase();
      if (metadata.metadataEnabled !== true) {
        clearFormTimers(formName);
        var blockedMetadata = errorState(
          formName,
          'metadata-contract-blocked',
          metadata.reasonCode || 'FIELD_CONTRACT_METADATA_UNAVAILABLE',
          'Form chưa đủ thông tin để tạo metadata V2.'
        );
        blockedMetadata.managed = metadata.registered === true;
        blockedMetadata.contract = metadata.control || null;
        blockedMetadata.rolloutStatus = rolloutStatus;
        blockedMetadata.pollAllowed = false;
        blockedMetadata.reasonCode = metadata.reasonCode || null;
        blockedMetadata.failClosed = true;
        states[key] = blockedMetadata;
        dispatchUpdate(formName, blockedMetadata);
        return blockedMetadata;
      }
      if (!schema || !Array.isArray(schema.gridFields) || !rolloutStatus) {
        var invalid = new Error('Unified Field Contract không hợp lệ.');
        invalid.code = 'FIELD_CONTRACT_INVALID';
        throw invalid;
      }
      var backendActive = metadata.backendActive === true && control.active === true;
      var active = backendActive && settings.shadowMode !== true;
      var writeAvailable = String(control.contractType || '').toUpperCase() !== 'READ_ONLY'
        && Boolean(schema.runtimeRoutes && schema.runtimeRoutes.save && schema.runtimeRoutes.save.registeredProcedure);
      var deleteAvailable = String(control.contractType || '').toUpperCase() !== 'READ_ONLY'
        && Boolean(schema.runtimeRoutes && schema.runtimeRoutes.delete && schema.runtimeRoutes.delete.registeredProcedure);
      var writeActive = active && writeAvailable;
      var deleteActive = active && deleteAvailable;
      var next = {
        status: active ? (writeActive ? 'unified-active' : 'unified-readonly') : 'metadata-v2-current-business',
        runtimeMode: active ? 'V2_FULL' : 'V2_METADATA_CURRENT_BUSINESS',
        managed: true,
        metadataActive: true,
        active: active,
        writeAvailable: writeAvailable,
        deleteAvailable: deleteAvailable,
        writeActive: writeActive,
        deleteActive: deleteActive,
        contextKey: key,
        schema: schema,
        comparison: metadata.comparison || null,
        contract: control,
        rolloutStatus: rolloutStatus,
        registryEntry: {},
        pollAllowed: rolloutStatus === 'ACTIVE' || rolloutStatus === 'SHADOW',
        runtimeSchemas: createUnifiedRuntimeSchemas(schema, writeAvailable, {}),
        loadedAt: Date.now(),
        errorCode: null,
        error: null
      };
      states[key] = next;
      if (metadata.comparison) storeParity(formName, metadata.comparison);
      dispatchUpdate(formName, next);
      return next;
    }).catch(function (error) {
      var status = Number(error && error.status) || 0;
      var code = String(
        (error && error.data && error.data.code)
        || (error && error.code)
        || ''
      ).trim().toUpperCase();
      if (status === 401) {
        return verifyPrimarySession().then(function (verification) {
          var sessionState = errorState(
            formName,
            verification.expired ? 'metadata-session-expired' : 'metadata-session-error',
            verification.expired ? 'PRIMARY_SESSION_EXPIRED' : 'METADATA_UNAUTHORIZED',
            verification.expired ? 'Phiên đăng nhập đã hết hạn.' : 'Metadata từ chối xác thực.'
          );
          sessionState.failClosed = true;
          states[key] = sessionState;
          if (verification.expired) expirePrimarySession();
          dispatchUpdate(formName, sessionState);
          return sessionState;
        });
      }
      if (status === 403) {
        /*
         * Từ chối quyền phải dừng tại metadata V2. Không dùng schema cũ hoặc
         * dữ liệu cache vì như vậy có thể làm sai phạm vi chi nhánh của tài khoản.
         */
        var forbidden = errorState(
          formName,
          'metadata-forbidden',
          code || 'FIELD_METADATA_PERMISSION_DENIED',
          'Bạn không có quyền xem dữ liệu của trang trong phạm vi chi nhánh hiện tại.'
        );
        forbidden.failClosed = true;
        forbidden.pollAllowed = false;
        states[key] = forbidden;
        dispatchUpdate(formName, forbidden);
        return forbidden;
      }
      if (lastKnownMetadata && (status === 0 || status >= 500)) {
        var readOnly = Object.assign({}, lastKnownMetadata, {
          status: 'unified-last-known-readonly',
          runtimeMode: 'V2_READONLY',
          metadataActive: true,
          writeAvailable: false,
          deleteAvailable: false,
          writeActive: false,
          deleteActive: false,
          runtimeSchemas: createUnifiedRuntimeSchemas(lastKnownMetadata.schema, false, {}),
          loadedAt: Date.now(),
          errorCode: code || 'METADATA_UNAVAILABLE_LAST_KNOWN'
        });
        states[key] = readOnly;
        dispatchUpdate(formName, readOnly);
        return readOnly;
      }
      var unavailable = errorState(
        formName,
        'cutover-contract-error',
        code || 'FIELD_CONTRACT_METADATA_UNAVAILABLE',
        'Metadata V2 của form không sẵn sàng.'
      );
      unavailable.failClosed = true;
      unavailable.pollAllowed = true;
      states[key] = unavailable;
      dispatchUpdate(formName, unavailable);
      return unavailable;
    });

    states[key] = {
      status: 'loading',
      runtimeMode: current && current.runtimeMode ? current.runtimeMode : 'LOADING',
      managed: true,
      metadataActive: Boolean(current && current.metadataActive),
      active: Boolean(current && current.active),
      writeAvailable: false,
      deleteAvailable: false,
      writeActive: false,
      deleteActive: false,
      contextKey: key,
      pending: pending,
      schema: current && current.schema ? current.schema : null,
      runtimeSchemas: current && current.runtimeSchemas
        ? current.runtimeSchemas
        : createRuntimeSchemas(resolvedLegacySchema, [], false)
    };
    return pending;
  }

  function fetchState(formName, legacySchema, force) {
    if (config().rolloutMode === 'registry') {
      return fetchRegistryState(formName, legacySchema, force);
    }
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
    var current = states[key];
    if (!current || current.pollAllowed !== true) {
      clearFormTimers(formName);
      return;
    }
    if (timers[key]) return;
    var pollSeconds = Number(config().pollSeconds);
    var intervalMs = Math.max(30, Number.isFinite(pollSeconds) ? pollSeconds : 120) * 1000;
    timers[key] = global.setInterval(function () {
      if (!isPilot(formName) || stateKey(formName) !== key) {
        if (typeof global.clearInterval === 'function') global.clearInterval(timers[key]);
        delete timers[key];
        return;
      }
      var current = states[key];
      if (!current || current.pollAllowed !== true) {
        if (typeof global.clearInterval === 'function') global.clearInterval(timers[key]);
        delete timers[key];
        return;
      }
      var effectiveLegacySchema = Array.isArray(legacySchema) && legacySchema.length
        ? legacySchema
        : ((current && current.runtimeMode === 'LEGACY_FULL' && current.runtimeSchemas && current.runtimeSchemas.grid) || []);
      fetchState(formName, effectiveLegacySchema, true);
    }, intervalMs);
  }

  function observeForm(formName, legacySchema) {
    var activePrefix = normalizeName(formName) + '|';
    Object.keys(timers).forEach(function (key) {
      if (key.indexOf(activePrefix) === 0) return;
      if (typeof global.clearInterval === 'function') global.clearInterval(timers[key]);
      delete timers[key];
    });
    installRefreshListeners();
    return fetchState(formName, legacySchema, false).then(function (state) {
      ensurePolling(formName, legacySchema);
      return state;
    });
  }

  function refreshForm(formName, legacySchema) {
    return fetchState(formName, Array.isArray(legacySchema) ? legacySchema : [], true);
  }

  function installRefreshListeners() {
    if (listenersInstalled || !global.addEventListener) return;
    listenersInstalled = true;
    function refreshVisibleContracts() {
      if (global.document && global.document.visibilityState === 'hidden') return;
      Object.keys(states).forEach(function (key) {
        var state = states[key];
        if (!state || state.pollAllowed !== true || state.pending) return;
        var formName = state.contract && state.contract.webFormName;
        if (!formName) return;
        fetchState(formName, state.runtimeMode === 'LEGACY_FULL' ? state.runtimeSchemas.grid : [], true)
          .then(function () { ensurePolling(formName, []); });
      });
    }
    global.addEventListener('focus', refreshVisibleContracts);
    if (global.document && global.document.addEventListener) {
      global.document.addEventListener('visibilitychange', refreshVisibleContracts);
    }
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

  function normalizeLookupError(error) {
    var safeError = error instanceof Error ? error : new Error('Không tải được danh mục.');
    var data = safeError.data && typeof safeError.data === 'object' ? safeError.data : {};
    var code = String(data.code || safeError.code || 'LOOKUP_LOAD_FAILED').trim().toUpperCase();
    var messages = {
      LOOKUP_KEY_NOT_FOUND: 'Danh mục chưa được đồng bộ. Vui lòng liên hệ quản trị viên.',
      LOOKUP_CONTRACT_NOT_UNIQUE: 'Cấu hình danh mục chưa đồng nhất. Vui lòng liên hệ quản trị viên.',
      LOOKUP_SOURCE_NOT_REGISTERED: 'Nguồn danh mục chưa được đăng ký.',
      LOOKUP_COLUMNS_NOT_CONFIGURED: 'Danh mục chưa cấu hình đủ cột mã và tên.',
      LOOKUP_COLUMNS_MISMATCH: 'Dữ liệu danh mục không khớp cấu hình.',
      LOOKUP_DEPENDENCY_REQUIRED: 'Vui lòng chọn trường liên quan trước.',
      LOOKUP_LOAD_FAILED: 'Không tải được danh sách. Vui lòng thử lại.'
    };
    safeError.code = code;
    safeError.userMessage = messages[code] || messages.LOOKUP_LOAD_FAILED;
    return safeError;
  }

  function declaredLookupDependencies(names, values) {
    var source = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
    var result = {};
    var declared = Array.isArray(names)
      ? names
      : String(names || '').split(',');
    declared.slice(0, 20).forEach(function (name) {
      var safeName = String(name || '').trim();
      if (!safeName || !Object.prototype.hasOwnProperty.call(source, safeName)) return;
      result[safeName] = source[safeName];
    });
    return result;
  }

  function searchLookup(formName, lookupKey, keyword, page, pageSize, dependencies) {
    var requestedLookupKey = String(lookupKey || '');
    var aliasPrefix = stateKey(formName) + '|';
    var aliasKey = aliasPrefix + requestedLookupKey.toLowerCase();
    var effectiveLookupKey = lookupKeyAliases[aliasKey] || requestedLookupKey;
    var currentState = getState(formName);
    if (!currentState || currentState.metadataActive !== true || !/^[A-Fa-f0-9]{64}$/.test(effectiveLookupKey)) {
      return Promise.reject(normalizeLookupError(new Error('Lookup V2 không hợp lệ')));
    }
    var endpoint = metadataBaseUrl() + '/lookups/' + encodeURIComponent(effectiveLookupKey) + '/search';
    return global.ApiClient.post(endpoint, {
      formName: formName,
      erpFormId: erpFormId(formName),
      keyword: String(keyword || '').slice(0, 200),
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 30)),
      dependencies: lookupDependencies(dependencies)
    }, { headers: requestHeaders(), logoutOnUnauthorized: false }).then(function (response) {
      var resolvedLookupKey = String(response && response.lookupKey || '');
      if (/^[A-Fa-f0-9]{64}$/.test(resolvedLookupKey)) {
        lookupKeyAliases[aliasKey] = resolvedLookupKey;
      }
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
      var dependencies = declaredLookupDependencies(settings.dependsOn, values);
      return searchLookup(
        settings.formName,
        settings.lookupKey,
        keyword,
        page,
        pageSize,
        dependencies
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

  function getState(formName) {
    return states[stateKey(formName)] || null;
  }

  function inspectForm(formName) {
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

  function getJoinSchema(
    formName,
    detailKey,
    forceRefresh
  ) {
    var safeFormName =
      String(formName || '').trim();

    var safeDetailKey =
      String(detailKey || '').trim();

    if (
      !/^[A-Za-z0-9_.-]{1,100}$/.test(
        safeFormName
      )
    ) {
      return Promise.reject(
        new Error(
          'FormName của JOIN contract không hợp lệ.'
        )
      );
    }

    if (
      !/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(
        safeDetailKey
      )
    ) {
      return Promise.reject(
        new Error(
          'DetailKey của JOIN contract không hợp lệ.'
        )
      );
    }

    var endpoint =
      metadataBaseUrl()
      + '/join-schema/'
      + encodeURIComponent(safeFormName)
      + '/'
      + encodeURIComponent(safeDetailKey);

    if (forceRefresh === true) {
      endpoint += '?refresh=1';
    }

    return global.ApiClient.get(
      endpoint,
      {
        headers: requestHeaders(),
        logoutOnUnauthorized: false
      }
    ).then(function (response) {
      if (
        response
        && response.success === true
        && response.schema
        && Array.isArray(response.schema.fields)
      ) {
        return response.schema;
      }

      throw new Error(
        response && response.message
          ? response.message
          : 'JOIN Field Contract không hợp lệ.'
      );
    });
  }

  function clearCache(formName) {
    if (formName) {
      delete states[stateKey(formName)];
      var aliasPrefix = stateKey(formName) + '|';
      Object.keys(lookupKeyAliases).forEach(function (key) {
        if (key.indexOf(aliasPrefix) === 0) delete lookupKeyAliases[key];
      });
    } else {
      states = Object.create(null);
      lookupKeyAliases = Object.create(null);
    }
  }

  return Object.freeze({
    observeForm: observeForm,
    refreshForm: refreshForm,
    searchLookup: searchLookup,
    createLookupDataSource: createLookupDataSource,
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
    getJoinSchema: getJoinSchema,
    clearCache: clearCache
  });
})(window);
