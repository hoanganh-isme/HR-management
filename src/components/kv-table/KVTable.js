/**
 * KVTable Component (Key-Value Table)
 * ─────────────────────────────────────────────
 * Bảng 2 cột: label ↔ value — dùng cho tóm tắt tài chính, báo cáo
 *
 * Usage:
 *   var el = KVTable.create({
 *     rows: [
 *       { label: 'Doanh thu', value: '2.1 tỷ' },
 *       { label: 'Chi phí', value: '798M', color: 'danger' },
 *       { label: 'Khuyến mãi', value: '42M', color: 'warning',
 *         dot: '#F59E0B' },           // dot màu trước label
 *       { label: 'Lợi nhuận', value: '1.26 tỷ', color: 'success',
 *         isTotal: true }             // highlight row tổng
 *     ]
 *   });
 *
 *   // Cập nhật 1 row không re-render toàn bộ
 *   KVTable.updateRow(el, 2, { value: '1.30 tỷ' });
 */
var KVTable = (function () {

  var _COLOR_MAP = {
    success: 'var(--color-success)',
    danger:  'var(--color-danger)',
    warning: 'var(--color-warning)',
    info:    'var(--color-info)',
    primary: 'var(--color-primary)'
  };

  /**
   * Tạo 1 row element
   */
  function _buildRow(row, index) {
    var div = document.createElement('div');
    div.className = 'kvtable__row'
      + (row.isHeader ? ' kvtable__row--header' : '')
      + (row.isTotal  ? ' kvtable__row--total'  : '');
    div.dataset.kvRowIndex = index;

    // Label side
    var labelEl = document.createElement('span');
    labelEl.className = 'kvtable__label';

    if (row.dot) {
      var dot = document.createElement('span');
      dot.className = 'kvtable__dot';
      dot.style.background = row.dot;
      labelEl.appendChild(dot);
    }

    var labelText = document.createTextNode(row.label || '');
    labelEl.appendChild(labelText);

    // Value side
    var valueEl = document.createElement('span');
    valueEl.className = 'kvtable__value';
    valueEl.dataset.kvValue = '1';
    valueEl.textContent = row.value !== undefined ? String(row.value) : '--';

    if (row.color && _COLOR_MAP[row.color]) {
      valueEl.style.color = _COLOR_MAP[row.color];
    }

    div.appendChild(labelEl);
    div.appendChild(valueEl);
    return div;
  }

  /**
   * Tạo KVTable element
   * @param {Object} opts
   * @param {Array}  opts.rows - mảng row objects
   * @param {string} [opts.className] - thêm class vào wrapper
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var rows = opts.rows || [];

    var wrapper = document.createElement('div');
    wrapper.className = 'kvtable' + (opts.className ? ' ' + opts.className : '');

    rows.forEach(function (row, i) {
      wrapper.appendChild(_buildRow(row, i));
    });

    return wrapper;
  }

  /**
   * Cập nhật value của 1 row theo index
   * @param {HTMLElement} tableEl - element tạo bởi create()
   * @param {number} rowIndex
   * @param {Object} patch - { value, color }
   */
  function updateRow(tableEl, rowIndex, patch) {
    if (!tableEl || !patch) return;
    var row = tableEl.querySelector('[data-kv-row-index="' + rowIndex + '"]');
    if (!row) return;
    if (patch.value !== undefined) {
      var valEl = row.querySelector('[data-kv-value]');
      if (valEl) valEl.textContent = String(patch.value);
    }
    if (patch.color !== undefined) {
      var valEl2 = row.querySelector('[data-kv-value]');
      if (valEl2) valEl2.style.color = _COLOR_MAP[patch.color] || patch.color;
    }
  }

  /**
   * Re-render toàn bộ table với rows mới
   * @param {HTMLElement} tableEl
   * @param {Array} rows
   */
  function setRows(tableEl, rows) {
    if (!tableEl) return;
    tableEl.innerHTML = '';
    (rows || []).forEach(function (row, i) {
      tableEl.appendChild(_buildRow(row, i));
    });
  }

  return {
    create: create,
    updateRow: updateRow,
    setRows: setRows
  };
})();
