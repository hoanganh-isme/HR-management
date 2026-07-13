window.DynamicFormRuntime = function (moduleConfig) {
  this.config = moduleConfig || {};
  this.state = new DynamicFormState();
  this.repository = new DynamicFormRepository(this.config);
};

