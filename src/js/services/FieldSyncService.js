/** Grid Schema V2 shadow/pilot service. Add, Edit và Filter luôn dùng schema legacy ở Phase 1. */
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
    var manager = global.API_CONFIG && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
    var serviceBase = manager && manager.SERVICE_BASE ? String(manager.SERVICE_BASE).replace(/\/+$/, '') : '';
    return serviceBase ? serviceBase + '/api/metadata' : '/api/metadata';
  }

  function requestHeaders() {
    return {
      Username: global.AppSession ? AppSession.getUserName() : '',
      BranchID: global.AppSession ? AppSession.getBranchId() : ''
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
      var rawDependsOn = rawLookup
        ? (Array.isArray(rawLookup.dependsOn) ? rawLookup.dependsOn.join(',') : String(rawLookup.dependsOn || '').trim())
        : '';
      // Lookup phụ thuộc không có contract truyền giá trị cha ở Phase 2.
      // Giữ lookup legacy để tránh hiển thị danh sách sai; không âm thầm gọi V2.
      var lookup = rawLookup && !rawDependsOn
        ? rawLookup
        : null;
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

  function isPhase2Managed(formName) {
    var registry = global.Phase2MigrationRegistry;
    return Boolean(registry && typeof registry.isManagedForm === 'function' && registry.isManagedForm(formName));
  }

  function hasCriticalParity(schema, comparison, formName) {
    var allowNewV2Fields = isPhase2Managed(formName);
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
    var userName = global.AppSession ? AppSession.getUserName() : '';
    var branchId = global.AppSession ? AppSession.getBranchId() : '';
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

  function requestMetadata(formName) {
    var headers = requestHeaders();
    var encodedForm = encodeURIComponent(formName);
    var base = metadataBaseUrl() + '/grid-schema/' + encodedForm;
    var expectedErpFormId = erpFormId(formName);
    var aliasQuery = '?erpFormId=' + encodeURIComponent(expectedErpFormId);
    return Promise.all([
      ApiClient.get(base + aliasQuery, { headers: headers }),
      ApiClient.get(base + '/compare' + aliasQuery, { headers: headers })
    ]).then(function (responses) {
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

  function fetchState(formName, legacySchema, force) {
    if (!isPilot(formName)) {
      clearFormTimers(formName);
      return Promise.resolve({
        status: 'not-pilot',
        active: false,
        contextKey: stateKey(formName),
        runtimeSchemas: createRuntimeSchemas(legacySchema, [], false)
      });
    }

    var key = stateKey(formName);
    var current = states[key];
    var ttlMs = config().pollSeconds * 1000;
    if (!force && current && current.loadedAt && Date.now() - current.loadedAt < ttlMs) {
      current.runtimeSchemas = createRuntimeSchemas(legacySchema, current.schema && current.schema.gridFields, current.active === true);
      return Promise.resolve(current);
    }
    if (!force && current && current.pending) return current.pending;

    var requestedActive = config().enabled === true && config().shadowMode === false;
    var pending = requestMetadata(formName).then(function (metadata) {
      var schema = metadata.schema;
      var comparison = metadata.comparison;
      var expectedErpFormId = metadata.expectedErpFormId;
      if (!schema || !Array.isArray(schema.gridFields)) throw new Error('Grid Schema V2 không hợp lệ');
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
      var fallback = {
        status: 'legacy-fallback',
        active: false,
        contextKey: key,
        runtimeSchemas: createRuntimeSchemas(legacySchema, [], false),
        loadedAt: Date.now(),
        error: error && error.message ? error.message : 'Không tải được Grid Schema V2'
      };
      states[key] = fallback;
      dispatchUpdate(formName, fallback);
      return fallback;
    });

    states[key] = { status: 'loading', active: false, contextKey: key, pending: pending, runtimeSchemas: createRuntimeSchemas(legacySchema, [], false) };
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
      fetchState(formName, legacySchema, true);
    }, config().pollSeconds * 1000);
  }

  function observeForm(formName, legacySchema) {
    ensurePolling(formName, legacySchema);
    return fetchState(formName, legacySchema, false);
  }

  function searchLookup(formName, lookupKey, keyword, page, pageSize) {
    if (!isPilot(formName) || !/^[A-Fa-f0-9]{64}$/.test(String(lookupKey || ''))) {
      return Promise.reject(new Error('Lookup V2 không hợp lệ'));
    }
    var endpoint = metadataBaseUrl() + '/lookups/' + encodeURIComponent(lookupKey) + '/search';
    return ApiClient.post(endpoint, {
      formName: formName,
      erpFormId: erpFormId(formName),
      keyword: String(keyword || '').slice(0, 200),
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 30))
    }, { headers: requestHeaders() }).then(function (response) {
      return response && Array.isArray(response.options) ? response.options : [];
    });
  }

  function getState(formName) {
    return states[stateKey(formName)] || null;
  }

  function inspectForm(formName) {
    var registry = global.Phase2MigrationRegistry;
    if (!registry || typeof registry.isManagedForm !== 'function' || !registry.isManagedForm(formName)) {
      return Promise.reject(new Error('Form không nằm trong registry Phase 2'));
    }
    return requestMetadata(formName).then(function (metadata) {
      if (!metadata.schema || !metadata.comparison) throw new Error('Metadata compare V2 không hợp lệ');
      return {
        status: 'compare-only',
        schema: metadata.schema,
        comparison: metadata.comparison,
        active: false
      };
    });
  }

  return Object.freeze({
    observeForm: observeForm,
    searchLookup: searchLookup,
    getState: getState,
    getContextKey: function (formName) { return stateKey(formName); },
    inspectForm: inspectForm,
    isPilot: isPilot,
    createRuntimeSchemas: createRuntimeSchemas
  });
})(window);
