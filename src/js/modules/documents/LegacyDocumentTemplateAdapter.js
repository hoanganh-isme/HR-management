window.LegacyDocumentTemplateAdapter = {
  resolve: function (documentRecord) {
    var fileName = String((documentRecord && (documentRecord.fileName || documentRecord.FileName)) || '').toLowerCase();
    var code = fileName.indexOf('hop_dong') !== -1
      ? 'hop_dong'
      : (fileName.indexOf('dat_coc') !== -1 ? 'dat_coc' : 'quyet_toan');
    console.warn('[Deprecated] Document template inferred from legacy file name: ' + fileName);
    return { templateCode: code, templateFile: code + '.html', fileType: 'html', legacy: true };
  }
};

