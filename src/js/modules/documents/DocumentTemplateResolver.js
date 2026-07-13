window.DocumentTemplateResolver = (function () {
  function read(record, names) {
    for (var index = 0; index < names.length; index += 1) {
      if (record && record[names[index]] != null && record[names[index]] !== '') return String(record[names[index]]);
    }
    return '';
  }

  function resolve(documentRecord) {
    var record = documentRecord || {};
    var templateCode = read(record, ['TemplateCode', 'templateCode']);
    var templateFile = read(record, ['TemplateFile', 'templateFile']);
    var documentType = read(record, ['DocumentType', 'documentType', 'FormName', 'formName']);
    var fileType = read(record, ['FileType', 'fileType']) || 'html';

    if (!templateCode && documentType) templateCode = documentType;
    if (!templateFile && templateCode) templateFile = templateCode + '.' + fileType.replace(/^\./, '');
    if (!templateFile) return LegacyDocumentTemplateAdapter.resolve(record);

    return {
      templateCode: templateCode || templateFile.replace(/\.[^.]+$/, ''),
      templateFile: templateFile,
      documentType: documentType,
      fileType: fileType,
      legacy: false
    };
  }

  return { resolve: resolve };
})();

