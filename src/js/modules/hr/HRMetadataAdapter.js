/** Normalize the Field Contract V2 document returned by the metadata backend. */
window.HRMetadataAdapter = (function () {
  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (value && typeof value === 'object') {
      var result = {};
      Object.keys(value).forEach(function (key) { result[key] = copy(value[key]); });
      return result;
    }
    return value;
  }

  function safeName(value) {
    return /^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/.test(String(value || ''));
  }

  function normalizeField(field, index) {
    if (!field || !safeName(field.name)) {
      throw new Error('Field Contract V2 chứa tên trường không hợp lệ.');
    }
    var normalized = copy(field);
    normalized.name = String(field.name);
    normalized.label = String(field.label || field.name);
    normalized.orderNo = Number(field.orderNo) || index + 1;
    normalized.metadataSource = 'FIELD_CONTRACT_V2';
    return normalized;
  }

  function selectFields(fields, supplied, predicate) {
    var byName = Object.create(null);
    fields.forEach(function (field) { byName[field.name.toLowerCase()] = field; });
    var selected = Array.isArray(supplied) ? supplied : fields.filter(predicate);
    return selected.map(function (field) {
      var complete = byName[String(field && field.name || '').toLowerCase()];
      if (!complete) throw new Error('Field Contract V2 tham chiếu trường không tồn tại.');
      return copy(complete);
    });
  }

  function normalizeContract(payload) {
    var schema = payload && payload.schema ? payload.schema : payload;
    if (!schema || String(schema.schemaVersion || '') !== '2.0') {
      throw new Error('Field Contract V2 không đúng phiên bản schema.');
    }
    if (!schema.formName || !schema.tableName || !schema.primaryKey || !Array.isArray(schema.fields)) {
      throw new Error('Field Contract V2 thiếu định danh bắt buộc.');
    }

    var seen = Object.create(null);
    var fields = schema.fields.map(normalizeField).sort(function (left, right) {
      return left.orderNo - right.orderNo;
    });
    fields.forEach(function (field) {
      var key = field.name.toLowerCase();
      if (seen[key]) throw new Error('Field Contract V2 chứa trường trùng tên.');
      seen[key] = true;
    });

    var normalized = copy(schema);
    normalized.fields = fields;
    normalized.gridFields = selectFields(fields, schema.gridFields, function (field) {
      return field.showInGrid !== false;
    });
    normalized.addFields = selectFields(fields, schema.addFields, function (field) {
      return field.showInAdd === true;
    });
    normalized.editFields = selectFields(fields, schema.editFields, function (field) {
      return field.showInEdit === true;
    });
    normalized.filterFields = selectFields(fields, schema.filterFields, function (field) {
      return field.showInFilter === true && field.supportsFilter === true;
    });
    return normalized;
  }

  return Object.freeze({ normalizeContract: normalizeContract });
})();
