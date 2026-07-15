/**
 * Central branch scope policy. The database remains the source of assigned BranchID values;
 * this module only normalizes and applies that scope consistently in the browser.
 */
window.BranchAccessPolicy = (function () {
  function _read(source, names) {
    source = source || {};
    for (var i = 0; i < names.length; i++) {
      if (source[names[i]] !== undefined && source[names[i]] !== null) return source[names[i]];
    }
    return '';
  }

  function _normalizeId(value) {
    return String(value == null ? '' : value).trim().toUpperCase();
  }

  function getAssignedBranchIds(user) {
    var raw = _read(user, ['BranchID', 'branchID', 'branchId', 'Branches', 'BranchCodes']);
    var values = Array.isArray(raw) ? raw : String(raw || '').split(',');
    var seen = {};
    var result = [];

    values.forEach(function (value) {
      var rawId = value && typeof value === 'object'
        ? _read(value, ['BranchID', 'branchID', 'branchId', 'Code', 'id', 'value'])
        : value;
      var id = _normalizeId(rawId);
      if (id && !seen[id]) {
        seen[id] = true;
        result.push(id);
      }
    });
    return result;
  }

  function isAdmin(user) {
    var source = user || {};
    var groupId = _normalizeId(_read(source, [
      'UserGroupID', 'userGroupID', 'userGroupId', 'GroupID', 'Group', 'GroupUser', 'NhomQuyen'
    ]));
    var configured = window.APP_SETTINGS && Array.isArray(window.APP_SETTINGS.adminGroupIds)
      ? window.APP_SETTINGS.adminGroupIds
      : [];
    if (groupId) {
      return configured.some(function (id) { return _normalizeId(id) === groupId; });
    }

    // Keep compatibility with APIs that do not return a group, while preventing
    // a generic IsAdmin flag from promoting a known non-admin group.
    var explicit = _read(source, ['IsAdmin', 'isAdmin']);
    return explicit === true || explicit === 1 || String(explicit).toLowerCase() === 'true';
  }

  function getScope(user) {
    var source = user || (window.AppContext ? AppContext.getCurrentUser() : {});
    var admin = isAdmin(source);
    var branchIds = getAssignedBranchIds(source);
    return {
      isAdmin: admin,
      branchIds: branchIds,
      defaultBranch: admin ? '' : branchIds.join(',')
    };
  }

  function _branchIdFromRow(row) {
    return _read(row, ['BranchID', 'branchID', 'branchId', 'BranchCode', 'Code', 'id', 'value']);
  }

  function filterBranches(rows, user) {
    var list = Array.isArray(rows) ? rows : [];
    var scope = getScope(user);
    if (scope.isAdmin) return list.slice();
    if (scope.branchIds.length === 0) return [];

    var allowed = {};
    scope.branchIds.forEach(function (id) { allowed[id] = true; });
    return list.filter(function (row) { return !!allowed[_normalizeId(_branchIdFromRow(row))]; });
  }

  function isBranchLookup(field) {
    var source = field || {};
    var fieldName = _normalizeId(_read(source, ['name', 'FieldName', 'fieldName']));
    var valueField = _normalizeId(_read(source, ['valueField', 'ValueField']));
    var dataSource = _normalizeId(_read(source, ['dataSource', 'DataSource', 'api', 'listName']));
    return fieldName === 'BRANCHID' || valueField === 'BRANCHID' || dataSource.indexOf('CF_BRANCHLISTFRM') > -1;
  }

  function filterLookupRows(rows, field, user) {
    return isBranchLookup(field) ? filterBranches(rows, user) : (Array.isArray(rows) ? rows : []);
  }

  function applyScopeToFilter(filter, user, fieldName) {
    var result = Object.assign({}, filter || {});
    var scope = getScope(user);
    var key = fieldName || 'BranchID';
    if (scope.isAdmin) return result;

    var requested = getAssignedBranchIds({ BranchID: result[key] || result.ChiNhanhID || '' });
    var allowed = {};
    scope.branchIds.forEach(function (id) { allowed[id] = true; });
    var effective = requested.length > 0
      ? requested.filter(function (id) { return !!allowed[id]; })
      : scope.branchIds;

    delete result.ChiNhanhID;
    result[key] = effective.join(',');
    return result;
  }

  function filterScopedRows(rows, user) {
    var list = Array.isArray(rows) ? rows : [];
    var scope = getScope(user);
    if (scope.isAdmin) return list.slice();

    var allowed = {};
    scope.branchIds.forEach(function (id) { allowed[id] = true; });
    return list.filter(function (row) {
      if (!row || typeof row !== 'object') return true;
      var hasBranchField = Object.keys(row).some(function (key) {
        return key.toLowerCase() === 'branchid';
      });
      if (!hasBranchField) return true;
      if (scope.branchIds.length === 0) return false;
      return getAssignedBranchIds({ BranchID: _branchIdFromRow(row) }).some(function (id) {
        return !!allowed[id];
      });
    });
  }

  function applyResponseScope(response, user) {
    if (!response || typeof response !== 'object') return response;
    if (Array.isArray(response)) return filterScopedRows(response, user);

    var result = Object.assign({}, response);
    var arrayKeys = ['records', 'list', 'data', 'Records', 'List', 'Data'];
    var scopedKey = '';
    arrayKeys.some(function (key) {
      if (Array.isArray(response[key])) {
        scopedKey = key;
        return true;
      }
      return false;
    });
    if (!scopedKey) return response;

    var originalRows = response[scopedKey];
    var scopedRows = filterScopedRows(originalRows, user);
    result[scopedKey] = scopedRows;
    if (scopedRows.length !== originalRows.length) {
      if (result._recordtotal !== undefined) result._recordtotal = scopedRows.length;
      if (result._pagetotal !== undefined) result._pagetotal = scopedRows.length > 0 ? 1 : 0;
    }
    return result;
  }

  return {
    getAssignedBranchIds: getAssignedBranchIds,
    isAdmin: isAdmin,
    getScope: getScope,
    filterBranches: filterBranches,
    isBranchLookup: isBranchLookup,
    filterLookupRows: filterLookupRows,
    applyScopeToFilter: applyScopeToFilter,
    filterScopedRows: filterScopedRows,
    applyResponseScope: applyResponseScope
  };
})();
