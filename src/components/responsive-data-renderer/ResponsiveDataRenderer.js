/**
 * Metadata-aware table/card renderer used by HR list modules.
 * Desktop keeps a table; mobile receives the same records as stacked cards.
 */
window.ResponsiveDataRenderer = (function () {
  function columns(metadata) {
    return (metadata || []).filter(function (field) { return field && field.MobileVisible !== false; }).sort(function (a, b) {
      return (a.MobileOrder == null ? 9999 : a.MobileOrder) - (b.MobileOrder == null ? 9999 : b.MobileOrder);
    });
  }

  function render(container, records, metadata) {
    if (!container) return null;
    var rows = records || [];
    var fields = columns(metadata);
    var semantics = fields.map(function (field) {
      var key = field.name || field.field;
      var samples = rows.slice(0, 20).map(function (record) { return record ? record[key] : undefined; });
      return typeof TableSemantic !== 'undefined'
        ? TableSemantic.resolveColumn(field, {
          field: key,
          label: field.MobileLabel || field.label || key
        }, samples)
        : null;
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'responsive-data-renderer';
    var table = document.createElement('table');
    table.className = 'data-table responsive-data-renderer__table';

    var head = document.createElement('thead');
    var headRow = document.createElement('tr');
    fields.forEach(function (field) {
      var cell = document.createElement('th');
      cell.textContent = field.label || field.MobileLabel || field.name || field.field || '';
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);

    var body = document.createElement('tbody');
    rows.forEach(function (record) {
      var row = document.createElement('tr');
      fields.forEach(function (field, index) {
        var key = field.name || field.field;
        var value = record[key];
        var cell = document.createElement('td');
        cell.setAttribute('data-label', field.MobileLabel || field.label || key);

        var semanticColumn = semantics[index];
        if (semanticColumn && typeof TableSemantic !== 'undefined') {
          var semanticCell = TableSemantic.resolveCell(semanticColumn, value, record);
          semanticCell.classNames.forEach(function (className) { cell.classList.add(className); });
          cell.appendChild(TableSemantic.createContent(semanticCell, value, record));
        } else {
          cell.textContent = value == null ? '' : String(value);
        }
        row.appendChild(cell);
      });
      body.appendChild(row);
    });

    table.appendChild(head);
    table.appendChild(body);
    wrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(wrapper);
    return wrapper;
  }

  return { render: render };
})();
