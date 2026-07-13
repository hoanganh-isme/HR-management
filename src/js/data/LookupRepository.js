window.LookupRepository = {
  load: function (listName, options) {
    return GatewayClient.view(listName, Object.assign({ limit: 1000 }, options || {}));
  }
};

