/** Alias Web -> ERP đã được xác nhận bằng TableName, khóa chính và artifact ERP. */
window.ErpFormAliases = (function () {
  var aliases = Object.freeze({
    WA_BangThueTNCNFrm: 'HR_BangThueTNCNFrm'
  });

  function resolve(formName) {
    return aliases[formName] || formName;
  }

  return Object.freeze({ aliases: aliases, resolve: resolve });
})();

