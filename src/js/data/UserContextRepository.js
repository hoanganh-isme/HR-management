/**
 * Resolves the authoritative user context when the login endpoint only returns tokens.
 */
window.UserContextRepository = (function () {
  function _rows(response) {
    return Array.isArray(response)
      ? response
      : ((response && (response.data || response.list || response.records || response.Data || response.List || response.Records)) || []);
  }

  function _userName(row) {
    return String((row && (row.UserName || row.Username || row.username || row.userName)) || '').trim();
  }

  function _withoutSecrets(row) {
    var safe = {};
    Object.keys(row || {}).forEach(function (key) {
      if (!/password|token|secret/i.test(key)) safe[key] = row[key];
    });
    return safe;
  }

  function _responseContext(response) {
    if (!response || typeof response !== 'object' || Array.isArray(response)) return {};
    var context = {};
    Object.keys(response).forEach(function (key) {
      var value = response[key];
      if (!Array.isArray(value) && value !== null && typeof value !== 'object') context[key] = value;
    });
    return context;
  }

  function resolveCurrent() {
    var current = AppContext.getCurrentUser();
    var userName = AppContext.getUserName();
    if (!userName) return Promise.resolve(current);

    return GatewayClient.view('WA_NguoiDungFrm', {
      keyword: userName,
      limit: 50,
      payload: { UserName: userName }
    }).then(function (response) {
      var normalizedName = userName.toLowerCase();
      var row = _rows(response).find(function (item) {
        return _userName(item).toLowerCase() === normalizedName;
      });
      // Gateway fields are authoritative. Some legacy APIs also return a partial
      // records[0], which must not overwrite the user's BranchID or group.
      var resolved = Object.assign({}, row || {}, _responseContext(response));
      return _userName(resolved)
        ? AppContext.setResolvedUser(_withoutSecrets(resolved))
        : current;
    });
  }

  return { resolveCurrent: resolveCurrent };
})();
