window.GatewayClient = (function () {
  function endpoint(options) {
    return (options && options.endpoint) || '/api/API_Gateway_Router';
  }

  function request(listName, func, data, options) {
    options = options || {};
    var payload = Object.assign({}, options.payload || {}, {
      List: listName,
      FormName: options.formName || listName,
      Func: func
    });
    if (options.limit !== undefined) payload.Limit = options.limit;
    if (options.page !== undefined) payload.Page = options.page;
    if (options.keyword !== undefined) payload.Keyword = options.keyword;
    if (data !== undefined) payload.JsonData = typeof data === 'string' ? data : JSON.stringify(data || {});
    return ApiClient.post(endpoint(options), payload);
  }

  return {
    view: function (listName, options) { return request(listName, 'View', undefined, options); },
    save: function (listName, data, options) { return request(listName, 'Save', data, options); },
    delete: function (listName, ids, options) { return request(listName, 'Delete', ids, options); },
    execute: function (listName, data, options) {
      options = options || {};
      return request(listName, options.func || 'View', data, options);
    }
  };
})();

