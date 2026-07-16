/** Shared session/local storage access. Keeps legacy keys unchanged. */
window.AppSession = (function () {
  var KEYS = Object.freeze({
    user: 'pmql_user',
    navigationCache: 'pmql_nav_cache',
    systemBranches: 'pmql_sys_branches',
    formStates: 'DynamicFormEngine_States',
    selectedRowsPrefix: 'selectedRows_',
    detailRowPrefix: 'HR_Detail_Row_',
    fontFamily: 'pmql_font_family',
    theme: 'pmql_theme',
    accentColor: 'pmql_color'
  });

  function readJSON(storage, key, fallback) {
    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getUser() {
    return readJSON(window.localStorage, KEYS.user, {}) || {};
  }

  function getUserName() {
    var user = getUser();
    return user.Username || user.UserName || user.username || '';
  }

  function getGroupId() {
    var user = getUser();
    return user.UserGroupID || user.userGroupID || user.userGroupId || user.Group || user.GroupUser || user.GroupID || user.group || user.NhomQuyen || '';
  }

  function isAdmin() {
    return String(getGroupId()).toLowerCase() === 'admin';
  }

  function getBranchId() {
    var user = getUser();
    return user.BranchID || user.branchID || user.branchId || user.Branch || '';
  }

  function getBranches() {
    return readJSON(window.localStorage, KEYS.systemBranches, []) || [];
  }

  function loadSystemBranches(apiClient, endpoint) {
    if (!apiClient || typeof apiClient.post !== 'function') return Promise.resolve(getBranches());
    return apiClient.post(endpoint, { List: 'CF_BranchListFrm', FormName: 'CF_BranchListFrm', Func: 'View', Limit: 1000 }).then(function (response) {
      var branches = Array.isArray(response) ? response : (response.data || response.list || response.records || []);
      setJSON(window.localStorage, KEYS.systemBranches, branches);
      return branches;
    });
  }

  function setJSON(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); } catch (e) { }
  }

  function remove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { }
  }

  return Object.freeze({
    keys: KEYS,
    readJSON: readJSON,
    setJSON: setJSON,
    remove: remove,
    getUser: getUser,
    getUserName: getUserName,
    getGroupId: getGroupId,
    isAdmin: isAdmin,
    getBranchId: getBranchId,
    getBranches: getBranches,
    loadSystemBranches: loadSystemBranches
  });
})();
