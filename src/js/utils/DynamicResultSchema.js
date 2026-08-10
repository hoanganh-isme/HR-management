/**
 * Builds a read-only grid schema from a stored-procedure result.
 *
 * The backend may return an explicit `columns`/`_columns`/`schema` array. When
 * it does not, the first result row is used as the schema source. Existing UI
 * metadata is used only for labels, formatting and a stable default order.
 */
(function (global) {
  function columnName(column) {
    if (typeof column === 'string') return column.trim();
    if (!column || typeof column !== 'object') return '';
    return String(
      column.field
      || column.name
      || column.FieldName
      || column.ColumnName
      || ''
    ).trim();
  }

  function textValue(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim();
  }

  function localizedCaption(source) {
    if (!source || typeof source !== 'object') return '';
    return textValue(
      source.CaptionVN
      || source.captionVN
      || source.captionVn
      || source.vietnameseCaption
    );
  }

  function configuredLabel(source) {
    if (!source || typeof source !== 'object') return '';
    return textValue(source.label || source.title || source.Caption || source.caption);
  }

  function columnLabel(column, fieldName, fallback) {
    /*
     * Caption precedence is deliberately metadata-first. Gateways frequently
     * expose `title`/`label` as a mechanically humanized field name (for
     * example `Phong Ban`). Letting that overwrite the configured Vietnamese
     * caption made both the grid header and the column chooser regress.
     */
    var explicitVietnamese = localizedCaption(column);
    if (explicitVietnamese) return explicitVietnamese;

    var fallbackVietnamese = localizedCaption(fallback);
    if (fallbackVietnamese) return fallbackVietnamese;

    var fallbackLabel = configuredLabel(fallback);
    if (fallbackLabel) return fallbackLabel;

    if (column && typeof column === 'object') {
      var label = column.title || column.label || column.caption || column.Caption || column.Header;
      if (textValue(label)) return textValue(label);
    }

    return String(fieldName || '')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim() || String(fieldName || '');
  }

  function descriptorsFrom(result, rows, existingGrid) {
    var explicitColumns = result && (
      result.columns
      || result._columns
      || result.schema
      || result._schema
    );
    var descriptors = Array.isArray(explicitColumns)
      ? explicitColumns.map(function (column, index) {
        return { column: column, name: columnName(column), index: index };
      }).filter(function (item) { return item.name; })
      : [];

    if (!Array.isArray(rows) || rows.length === 0) return descriptors;

    var rowKeys = Object.keys(rows[0] || {});
    var rowKeyByName = {};
    rowKeys.forEach(function (name) {
      rowKeyByName[String(name).toLowerCase()] = name;
    });

    /*
     * Some gateway versions expose a short `columns` list sourced from table
     * metadata while each stored-procedure record contains additional dynamic
     * columns. Keep useful descriptors/labels, discard descriptors that are not
     * in the result row, then append every missing result key. The result set is
     * therefore authoritative for the generated runtime schema.
     */
    descriptors = descriptors.filter(function (descriptor) {
      var actualName = rowKeyByName[descriptor.name.toLowerCase()];
      if (!actualName) return false;
      descriptor.name = actualName;
      return true;
    });

    var descriptorNames = {};
    descriptors.forEach(function (descriptor) {
      descriptorNames[descriptor.name.toLowerCase()] = true;
    });

    var dynamicOffset = descriptors.length;
    rowKeys.forEach(function (name, index) {
      if (descriptorNames[name.toLowerCase()]) return;
      descriptors.push({ column: null, name: name, index: dynamicOffset + index });
      descriptorNames[name.toLowerCase()] = true;
    });

    var existingOrder = {};
    (existingGrid || []).forEach(function (field, index) {
      if (field && field.name) existingOrder[String(field.name).toLowerCase()] = index;
    });

    descriptors.sort(function (a, b) {
      var aKnown = Object.prototype.hasOwnProperty.call(existingOrder, a.name.toLowerCase());
      var bKnown = Object.prototype.hasOwnProperty.call(existingOrder, b.name.toLowerCase());
      if (aKnown && bKnown) return existingOrder[a.name.toLowerCase()] - existingOrder[b.name.toLowerCase()];
      if (aKnown !== bKnown) return aKnown ? -1 : 1;

      // JavaScript enumerates integer-like object keys before text keys. Keep
      // dynamically generated day columns in calendar order.
      var aDay = /^\d+$/.test(a.name);
      var bDay = /^\d+$/.test(b.name);
      if (aDay !== bDay) return aDay ? 1 : -1;
      if (aDay && bDay) return Number(a.name) - Number(b.name);
      return a.index - b.index;
    });

    return descriptors;
  }

  function build(options) {
    options = options || {};
    var existingGrid = Array.isArray(options.existingGrid) ? options.existingGrid : [];
    var descriptors = descriptorsFrom(options.result, options.rows, existingGrid);
    if (descriptors.length === 0) return [];

    var existingByName = {};
    existingGrid.forEach(function (field) {
      if (field && field.name) existingByName[String(field.name).toLowerCase()] = field;
    });

    return descriptors.map(function (descriptor, index) {
      var fieldName = descriptor.name;
      var existing = existingByName[fieldName.toLowerCase()] || {};
      var next = Object.assign({}, existing);
      next.name = fieldName;
      next.label = columnLabel(descriptor.column, fieldName, existing);
      next.captionVN = localizedCaption(descriptor.column)
        || localizedCaption(existing)
        || next.label;
      next.position = 'grid';
      next.orderNo = index + 1;
      next.showInAdd = false;
      next.showInEdit = false;
      next.isReadOnlyAdd = true;
      next.isReadOnlyEdit = true;
      return next;
    });
  }

  global.DynamicResultSchema = {
    build: build
  };
})(window);
