window.DynamicFormRenderer = {
  renderComponent: function (code, context) {
    return FieldRendererRegistry.render(code, context);
  }
};

