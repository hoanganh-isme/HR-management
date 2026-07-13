window.BranchRepository = {
  getAll: function () {
    return GatewayClient.view('CF_BranchListFrm', { limit: 1000 });
  }
};

