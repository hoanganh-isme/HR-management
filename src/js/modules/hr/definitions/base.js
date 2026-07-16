(function (global) {
  var gateway = global.AppConfig.apiGateway;
  global.HRCrudDefaults = Object.freeze({
    ApiSearch: gateway,
    ApiSave: gateway,
    ApiDelete: gateway,
    capabilities: ['crud'],
    mobile: { enabled: true }
  });
})(window);
