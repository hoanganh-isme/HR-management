/** Alias Web -> ERP đã được xác nhận bằng TableName, khóa chính và artifact ERP. */
window.ErpFormAliases = (function () {
  var registry = window.FieldContractMigrationRegistry;
  var aliases = registry ? registry.aliases : Object.freeze({});

  function resolve(formName) {
    return registry && typeof registry.resolveErpFormId === 'function'
      ? registry.resolveErpFormId(formName)
      : formName;
  }

  return Object.freeze({ aliases: aliases, resolve: resolve });
})();
