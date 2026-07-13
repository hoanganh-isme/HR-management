/**
 * Shared metadata-first helpers for dynamic HR modules.
 * Business values stay in database metadata; JavaScript only supplies behavior.
 */
window.MetadataModuleConfig = (function () {
  var BRANCH_PREFIX_FIELDS = [
    'PersonIDPrefix', 'EmployeePrefix', 'BranchPrefix',
    'MaVietTat', 'ShortCode', 'BranchCode'
  ];

  var FIELD_CONFIG_FACTORIES = {
    usergroupid: function () {
      return {
        renderRule: 'sl',
        dataSource: getEndpoint('PERMISSIONS.GET_GROUP_LIST'),
        dataSourceMethod: 'GET',
        valueField: 'id',
        labelField: 'name',
        allowCustomValue: false
      };
    }
  };

  var FORM_FIELD_CONFIG_FACTORIES = {
    'wa_nguoidungfrm.branchid': function () {
      return {
        renderRule: 'ms',
        dataSource: 'CF_BranchListFrm',
        dataSourceMethod: 'POST',
        valueField: 'BranchID',
        labelField: 'BranchName',
        allowCustomValue: false,
        multiple: true
      };
    }
  };

  function _readStoredBranches() {
    try {
      var raw = window.APP_SETTINGS
        ? window.APP_SETTINGS.getStored('sys_branches', '[]')
        : window.localStorage.getItem('pmql_sys_branches');
      var rows = JSON.parse(raw || '[]');
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return [];
    }
  }

  function _readValueIgnoreCase(row, fieldName) {
    if (!row) return '';
    var key = Object.keys(row).find(function (candidate) {
      return candidate.toLowerCase() === fieldName.toLowerCase();
    });
    return key && row[key] != null ? String(row[key]).trim() : '';
  }

  function getEndpoint(path) {
    var value = window.API_CONFIG && window.API_CONFIG.ENDPOINTS;
    String(path || '').split('.').forEach(function (segment) {
      value = value && value[segment];
    });
    return typeof value === 'string' ? value : '';
  }

  function getFieldConfig(fieldName, formName) {
    var normalizedField = String(fieldName || '').trim().toLowerCase();
    var formFieldKey = String(formName || '').trim().toLowerCase() + '.' + normalizedField;
    var factory = FORM_FIELD_CONFIG_FACTORIES[formFieldKey] || FIELD_CONFIG_FACTORIES[normalizedField];
    return factory ? factory() : {};
  }

  function getUserGroupId(user) {
    var source = user || {};
    return String(
      source.UserGroupID || source.userGroupID || source.userGroupId ||
      source.GroupID || source.Group || source.GroupUser || source.NhomQuyen || ''
    ).trim();
  }

  function isAdminUser(user) {
    var source = user || {};
    if (source.IsAdmin === true || source.IsAdmin === 1 || String(source.IsAdmin).toLowerCase() === 'true') {
      return true;
    }
    var groupId = getUserGroupId(source).toLowerCase();
    var configuredGroups = window.APP_SETTINGS && Array.isArray(window.APP_SETTINGS.adminGroupIds)
      ? window.APP_SETTINGS.adminGroupIds
      : [];
    return configuredGroups.some(function (configuredId) {
      return String(configuredId).trim().toLowerCase() === groupId;
    });
  }

  function resolveBranchPrefix(branchId) {
    var normalizedId = String(branchId || '').trim();
    if (!normalizedId) return '';

    var branch = _readStoredBranches().find(function (row) {
      return _readValueIgnoreCase(row, 'BranchID').toUpperCase() === normalizedId.toUpperCase();
    });

    for (var i = 0; branch && i < BRANCH_PREFIX_FIELDS.length; i++) {
      var prefix = _readValueIgnoreCase(branch, BRANCH_PREFIX_FIELDS[i]);
      if (prefix) return prefix;
    }

    return '';
  }

  function _derivePrefix(rows, idField) {
    var counts = {};
    (rows || []).forEach(function (row) {
      var value = _readValueIgnoreCase(row, idField).toUpperCase();
      var match = value.match(/^[^0-9]+/);
      var prefix = match ? match[0].trim() : '';
      if (prefix) counts[prefix] = (counts[prefix] || 0) + 1;
    });

    return Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b);
    })[0] || '';
  }

  function createSequentialIdResolver(options) {
    var config = options || {};
    return function (branchId, apiUrl, currentUser, callback) {
      var metadataPrefix = typeof config.resolvePrefix === 'function'
        ? config.resolvePrefix(branchId)
        : resolveBranchPrefix(branchId);
      var normalizedBranchId = String(branchId || '').trim();

      if (!normalizedBranchId) {
        callback(null, '', new Error('Khong tim thay ma viet tat cua chi nhanh'));
        return;
      }

      var filter = {};
      if (metadataPrefix) {
        filter[config.prefixFilter || 'PersonIDPrefix'] = metadataPrefix;
      } else {
        filter[config.branchFilter || 'BranchID'] = normalizedBranchId;
      }
      window.ApiClient.post(apiUrl, {
        List: config.formName,
        FormName: config.formName,
        Func: 'View',
        Limit: config.limit || 9999,
        UserName: currentUser,
        JsonData: JSON.stringify(filter)
      }).then(function (res) {
        var list = res.list || res.records || res.data || [];
        var idField = config.idField || 'PersonID';
        var prefix = metadataPrefix || _derivePrefix(list, idField) || normalizedBranchId;
        var usedNumbers = [];

        list.forEach(function (row) {
          var value = _readValueIgnoreCase(row, idField).toUpperCase();
          if (value.indexOf(prefix.toUpperCase()) !== 0) return;
          var sequence = parseInt(value.substring(prefix.length), 10);
          if (!isNaN(sequence) && sequence > 0) usedNumbers.push(sequence);
        });

        usedNumbers.sort(function (a, b) { return a - b; });
        var next = 1;
        for (var i = 0; i < usedNumbers.length; i++) {
          if (usedNumbers[i] === next) next++;
          else if (usedNumbers[i] > next) break;
        }

        callback(prefix + String(next).padStart(config.sequenceLength || 3, '0'), prefix, null);
      }).catch(function (error) {
        callback(null, prefix, error);
      });
    };
  }

  return {
    getEndpoint: getEndpoint,
    getFieldConfig: getFieldConfig,
    getUserGroupId: getUserGroupId,
    isAdminUser: isAdminUser,
    resolveBranchPrefix: resolveBranchPrefix,
    createSequentialIdResolver: createSequentialIdResolver
  };
})();
