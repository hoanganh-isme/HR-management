window.BranchRepository = (function () {
  function _rows(response) {
    return Array.isArray(response)
      ? response
      : ((response && (response.data || response.list || response.records || response.Data || response.List || response.Records)) || []);
  }

  function getAccessible() {
    var user = AppContext.getCurrentUser();
    var scope = BranchAccessPolicy.getScope(user);
    var userName = AppContext.getUserName();
    if (!userName) return Promise.resolve([]);

    var filter = scope.isAdmin ? {} : { BranchID: scope.branchIds.join(',') };
    return GatewayClient.execute('CF_BranchListFrm', filter, {
      limit: 1000,
      payload: { UserName: userName }
    }).then(function (response) {
      var rows = _rows(response);
      if (!scope.isAdmin && scope.branchIds.length === 0) return [];
      return BranchAccessPolicy.filterBranches(rows, user);
    });
  }

  return { getAccessible: getAccessible, getAll: getAccessible };
})();
