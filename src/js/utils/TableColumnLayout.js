/**
 * Cầu nối giữa bố cục cột Tabulator và các tính năng dùng field theo thứ tự UI.
 * Chỉ field name chuẩn được sử dụng để ghi dữ liệu; nhãn/vị trí chỉ là ưu tiên
 * hiển thị phía frontend.
 */
(function (global) {
  'use strict';

  var TECHNICAL_FIELDS = {
    '__action__': true,
    'row_select': true
  };

  function text(value) {
    return String(value === undefined || value === null ? '' : value).trim();
  }

  function key(value) {
    return text(value).toLowerCase();
  }

  function safeLabel(value, fallback) {
    var label = text(value);
    return label && label.indexOf('<') === -1 ? label : fallback;
  }

  function capture(tabulator) {
    if (!tabulator || typeof tabulator.getColumns !== 'function') return [];
    var layout = [];

    function visit(column) {
      if (!column) return;
      var children = typeof column.getSubColumns === 'function'
        ? column.getSubColumns()
        : [];
      if (Array.isArray(children) && children.length) {
        children.forEach(visit);
        return;
      }

      var name = text(typeof column.getField === 'function' ? column.getField() : '');
      if (!name || TECHNICAL_FIELDS[key(name)]) return;
      var definition = typeof column.getDefinition === 'function'
        ? (column.getDefinition() || {})
        : {};
      layout.push(Object.freeze({
        name: name,
        label: safeLabel(definition.title, name),
        visible: typeof column.isVisible === 'function' ? column.isVisible() !== false : definition.visible !== false
      }));
    }

    tabulator.getColumns().forEach(visit);
    return layout;
  }

  function arrangeFields(fields, layout) {
    var sourceFields = Array.isArray(fields) ? fields.filter(function (field) {
      return field && text(field.name);
    }) : [];
    var requestedLayout = Array.isArray(layout) ? layout : [];
    var byName = Object.create(null);
    var used = Object.create(null);
    var all = [];
    var positional = [];

    sourceFields.forEach(function (field) {
      byName[key(field.name)] = field;
    });

    requestedLayout.forEach(function (column) {
      var field = byName[key(column && column.name)];
      if (!field || used[key(field.name)]) return;
      used[key(field.name)] = true;
      var arranged = Object.assign({}, field, {
        uiLabel: safeLabel(column && column.label, field.label || field.name),
        visibleInTable: !column || column.visible !== false
      });
      all.push(arranged);
      if (arranged.visibleInTable) positional.push(arranged);
    });

    sourceFields.forEach(function (field) {
      if (used[key(field.name)]) return;
      var arranged = Object.assign({}, field, {
        uiLabel: field.label || field.name,
        visibleInTable: requestedLayout.length ? false : true
      });
      all.push(arranged);
      if (!requestedLayout.length) positional.push(arranged);
    });

    return Object.freeze({
      all: Object.freeze(all),
      positional: Object.freeze(positional),
      hasLayout: requestedLayout.length > 0 && positional.length > 0
    });
  }

  /**
   * Sắp xếp các cột nguồn đã map theo thứ tự field hiện tại của bảng.
   * sourceIndex luôn giữ vị trí thật trong file để việc đọc dữ liệu không đổi.
   */
  function orderMappedSources(headers, mapping, orderedFields) {
    var sourceHeaders = Array.isArray(headers) ? headers : [];
    var sourceMapping = mapping && typeof mapping === 'object' ? mapping : {};
    var fields = Array.isArray(orderedFields) ? orderedFields : [];
    var rankByField = Object.create(null);
    var mappedByHeader = Object.create(null);

    fields.forEach(function (field, index) {
      var fieldName = key(field && field.name);
      if (fieldName && rankByField[fieldName] === undefined) rankByField[fieldName] = index;
    });
    Object.keys(sourceMapping).forEach(function (header) {
      mappedByHeader[key(header)] = text(sourceMapping[header]);
    });

    return sourceHeaders.map(function (header, sourceIndex) {
      var targetName = mappedByHeader[key(header)] || '';
      var targetRank = rankByField[key(targetName)];
      return {
        header: text(header),
        sourceIndex: sourceIndex,
        targetName: targetName,
        targetRank: targetRank === undefined ? Number.MAX_SAFE_INTEGER : targetRank
      };
    }).sort(function (left, right) {
      return left.targetRank - right.targetRank || left.sourceIndex - right.sourceIndex;
    });
  }

  global.TableColumnLayout = Object.freeze({
    capture: capture,
    arrangeFields: arrangeFields,
    orderMappedSources: orderMappedSources
  });
})(window);
