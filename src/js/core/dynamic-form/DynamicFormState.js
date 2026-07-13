window.DynamicFormState = function (initialState) {
  this.reset(initialState);
};
DynamicFormState.prototype.reset = function (state) {
  state = state || {};
  this.page = state.page || 1;
  this.limit = state.limit || 15;
  this.filters = Object.assign({}, state.filters || {});
  this.selected = [];
};
DynamicFormState.prototype.setFilters = function (filters) { this.filters = Object.assign({}, filters || {}); this.page = 1; };

