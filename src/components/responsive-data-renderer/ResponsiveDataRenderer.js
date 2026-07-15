/**
 * Metadata-aware table/card renderer used by HR list modules.
 * Desktop keeps a table; mobile receives the same records as stacked cards.
 */
window.ResponsiveDataRenderer = (function () {
  function escape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function columns(metadata) {
    return (metadata || []).filter(function (field) { return field && field.MobileVisible !== false; }).sort(function (a, b) {
      return (a.MobileOrder == null ? 9999 : a.MobileOrder) - (b.MobileOrder == null ? 9999 : b.MobileOrder);
    });
  }

  function render(container, records, metadata) {
    if (!container) return null;
    var fields = columns(metadata);
    var wrapper = document.createElement('div');
    wrapper.className = 'responsive-data-renderer';
    var table = document.createElement('table');
    table.className = 'data-table responsive-data-renderer__table';
    var head = document.createElement('thead');
    head.innerHTML = '<tr>' + fields.map(function (field) { return '<th>' + escape(field.label || field.MobileLabel || field.name) + '</th>'; }).join('') + '</tr>';
    var body = document.createElement('tbody');
    (records || []).forEach(function (record) {
      var row = document.createElement('tr');
      row.innerHTML = fields.map(function (field) {
        var key = field.name || field.field;
        return '<td data-label="' + escape(field.MobileLabel || field.label || key) + '">' + escape(record[key]) + '</td>';
      }).join('');
      body.appendChild(row);
    });
    table.appendChild(head); table.appendChild(body); wrapper.appendChild(table);
    container.innerHTML = ''; container.appendChild(wrapper);
    return wrapper;
  }

  return { render: render };
})();
