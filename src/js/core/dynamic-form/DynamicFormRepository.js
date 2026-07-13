window.DynamicFormRepository = function (moduleConfig) {
  this.config = moduleConfig || {};
};
DynamicFormRepository.prototype.view = function (options) { return GatewayClient.view(this.config.FormName, Object.assign({ endpoint: this.config.ApiSearch }, options || {})); };
DynamicFormRepository.prototype.save = function (data) { return GatewayClient.save(this.config.FormName, data, { endpoint: this.config.ApiSave }); };
DynamicFormRepository.prototype.delete = function (ids) { return GatewayClient.delete(this.config.FormName, ids, { endpoint: this.config.ApiDelete }); };

