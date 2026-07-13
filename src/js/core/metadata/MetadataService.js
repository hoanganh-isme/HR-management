window.MetadataService = {
  loadFields: function (formName) {
    return GatewayClient.execute('API_LayCacTruongGiaoDien', { FormName: formName });
  },
  getFieldBehavior: function (formName, fieldName) {
    return MetadataModuleConfig.getFieldConfig(fieldName, formName);
  }
};

