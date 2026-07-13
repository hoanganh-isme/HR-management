window.DynamicFormSchemaService = {
  getFieldBehavior: function (fieldName, formName) {
    return window.MetadataModuleConfig ? MetadataModuleConfig.getFieldConfig(fieldName, formName) : {};
  }
};

