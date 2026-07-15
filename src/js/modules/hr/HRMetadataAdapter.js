/**
 * Bộ nối metadata HR, chỉ đọc và không ghi ngược về cơ sở dữ liệu.
 * Ưu tiên: SY_FormatFields theo form -> dictionary theo form -> dictionary chung -> fallback cục bộ.
 */
window.HRMetadataAdapter = (function () {
  function keyOf(value) { return String(value || '').trim().toLowerCase(); }

  function fieldName(row) {
    return row && (row.FieldName || row.fieldName || row.name || row.Name);
  }

  function asRows(value) {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.list)) return value.list;
    if (value && Array.isArray(value.records)) return value.records;
    return [];
  }

  function mergeFields(specific, formDictionary, globalDictionary, fallback) {
    var result = [];
    var seen = Object.create(null);
    [specific, formDictionary, globalDictionary, fallback].forEach(function (source) {
      asRows(source).forEach(function (row) {
        var name = fieldName(row);
        var key = keyOf(name);
        if (!key || seen[key]) return;
        seen[key] = true;
        result.push(row);
      });
    });
    return result;
  }

  function resolve(response, formName, localConfig) {
    var payload = response || {};
    var specific = asRows(
      payload.specificFields || payload.syFormatFields || payload.formatFields ||
      payload.SY_FormatFields || payload.list || payload.records
    );
    var formDictionary = asRows(
      payload.formDictionary || payload.formFieldsDictionary ||
      payload.formSpecificFmtFldTbl || payload.formSpecificDictionary ||
      payload.SY_FmtFldTblForm
    );
    var globalDictionary = asRows(
      payload.globalDictionary || payload.dictionary ||
      payload.globalFmtFldTbl || payload.globalFieldsDictionary ||
      payload.SY_FmtFldTblGlobal
    );
    var fallback = localConfig && (localConfig.FormFields || localConfig.fields);
    var fields = mergeFields(specific, formDictionary, globalDictionary, fallback);

    if (!specific.length && fields.length) {
      console.warn('[HRMetadataAdapter] Không có SY_FormatFields riêng cho form:', formName, '- dùng dictionary/fallback chỉ đọc.');
    }
    if (!fields.length) {
      console.warn('[HRMetadataAdapter] Không có metadata field cho form:', formName);
    }
    return { fields: fields, source: specific.length ? 'SY_FormatFields' : 'fallback' };
  }

  return { resolve: resolve, mergeFields: mergeFields };
})();
