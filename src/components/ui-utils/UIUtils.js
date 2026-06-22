/**
 * Shared UI Utilities for Components
 */
var UIControls = window.UIControls || {};

UIControls.utils = (function() {
  /**
   * Tính toán vụ trí Dropdown thông minh (Tránh tràn màn hình)
   */
  function computeDropdownPosition(inputElement, dropdownElement) {
    var rect = inputElement.getBoundingClientRect();

    // Navbar: giới hạn top khi mở lên trên
    var navbarBottom = 0;
    var navbar = document.querySelector('.app-navbar');
    if (navbar) navbarBottom = navbar.getBoundingClientRect().bottom;

    // position:fixed — tọa độ viewport, không bị ảnh hưởng bởi overflow:hidden
    dropdownElement.style.position   = 'fixed';
    dropdownElement.style.zIndex     = '10000000';
    dropdownElement.style.transition = 'opacity 0.15s ease, visibility 0.15s ease';
    dropdownElement.style.minWidth   = rect.width + 'px';

    var isActive = dropdownElement.classList.contains('active');
    if (!isActive) {
      dropdownElement.style.maxHeight  = '300px';
      dropdownElement.style.visibility = 'hidden';
      dropdownElement.classList.add('active');
    }

    var dropWidth  = dropdownElement.offsetWidth;
    var dropHeight = dropdownElement.offsetHeight;

    // --- Tính toán Left ---
    var leftPos = rect.left;
    if (leftPos + dropWidth > window.innerWidth - 10) {
      // Nếu tràn phải -> Căn lề phải với input
      leftPos = rect.right - dropWidth;
    }
    // Đảm bảo không tràn trái
    leftPos = Math.max(10, leftPos);
    dropdownElement.style.left = leftPos + 'px';

    // --- Tính toán Top ---
    var spaceBelow = window.innerHeight - rect.bottom;
    var spaceAbove = rect.top - navbarBottom;

    if (spaceBelow < dropHeight && spaceAbove > spaceBelow) {
      if (spaceAbove < dropHeight) {
        dropdownElement.style.maxHeight = (spaceAbove - 4) + 'px';
        dropHeight = dropdownElement.offsetHeight;
      }
      var topPos = Math.max(rect.top - dropHeight, navbarBottom + 4);
      dropdownElement.style.top = topPos + 'px';
    } else {
      if (spaceBelow < dropHeight) {
        dropdownElement.style.maxHeight = (spaceBelow - 4) + 'px';
      }
      dropdownElement.style.top = rect.bottom + 'px';
    }

    if (!isActive) {
      dropdownElement.classList.remove('active');
      dropdownElement.style.visibility = '';
    }
  }

  /**
   * Tìm tất cả scrollable ancestors từ một element
   */
  function getScrollableAncestors(el) {
    var ancestors = [];
    var node = el.parentElement;
    while (node && node !== document.documentElement) {
      var style = window.getComputedStyle(node);
      var ov = style.overflow + style.overflowY + style.overflowX;
      if (/auto|scroll/.test(ov)) {
        ancestors.push(node);
      }
      node = node.parentElement;
    }
    ancestors.push(window);
    return ancestors;
  }




  /**
   * Sinh HTML cho Dropdown Table List
   */
  function createDropdownTableHTML(headers, data, colHighlightIndex) {
    var theadHTML = headers.map(h => `<th>${h}</th>`).join('');
    var tbodyHTML = data.map(function(row, rIdx) {
      // Chỉ render số lượng cột bằng với số lượng headers, các cột thừa sẽ bị ẩn (để dùng cho Auto-fill)
      var displayRow = row.slice(0, headers.length);
      var cells = displayRow.map(function(cell, cIdx) {
        var cls = (cIdx === colHighlightIndex) ? 'highlight-col' : '';
        return `<td class="${cls}">${cell}</td>`;
      }).join('');
      return `<tr data-index="${rIdx}">${cells}</tr>`;
    }).join('');

    return `
      <table class="dropdown-table">
        <thead><tr>${theadHTML}</tr></thead>
        <tbody>${tbodyHTML}</tbody>
      </table>
    `;
  }

  return {
    computeDropdownPosition: computeDropdownPosition,
    getScrollableAncestors: getScrollableAncestors,
    createDropdownTableHTML: createDropdownTableHTML,
    /**
     * Setup single row selection for a table
     */
    setupTableSelection: function(tableBody, onSelect) {
      if (!tableBody) return;
      tableBody.addEventListener('click', function(e) {
        var tr = e.target.closest('tr');
        if (!tr) return;
        
        var isAlreadyActive = tr.classList.contains('active');
        
        // Remove active from all rows
        Array.from(tableBody.querySelectorAll('tr')).forEach(r => r.classList.remove('active'));
        
        // If it wasn't active, make it active
        if (!isAlreadyActive) {
          tr.classList.add('active');
          if (typeof onSelect === 'function') onSelect(tr);
        } else {
          // If it was already active, we just removed it above, so we pass null to onSelect
          if (typeof onSelect === 'function') onSelect(null);
        }
      });
    },

    /**
     * Áp VisibleRule cho các field trong một container (form modal hoặc filter dialog)
     *
     * Syntax (lưu trong SY_FormatFields.VisibleRule):
     *   "fieldA=val"           → hiện khi fieldA = val
     *   "fieldA=v1|v2"         → hiện khi fieldA = v1 HOẶC v2
     *   "fieldA!=val"          → hiện khi fieldA KHÁC val
     *   "fieldA=v1&fieldB=v2"  → hiện khi CẢ HAI đúng (AND)
     *
     * @param {HTMLElement} container  - Phần tử chứa các field (form body, dialog body)
     * @param {string} [rowSelector]   - CSS selector của "row" cần show/hide
     *                                   Mặc định '[data-visible-rule]'
     * @param {string} [fieldSelector] - Cách tìm input theo fieldName
     *                                   'data'  → dùng [data-field-name="x"]  (ReportFilterDialog)
     *                                   'name'  → dùng [name="x"]             (DynamicFormEngine)
     *                                   Mặc định: thử data-field-name trước, fallback name
     */
    applyVisibleRules: function(container, rowSelector, fieldSelector) {
      rowSelector = rowSelector || '[data-visible-rule]';
      var rows = Array.from(container.querySelectorAll(rowSelector));
      if (!rows.length) return;

      function _parseRule(ruleStr) {
        return ruleStr.split('&').map(function(part) {
          part = part.trim();
          var op = part.indexOf('!=') !== -1 ? '!=' : '=';
          var sides = part.split(op === '!=' ? '!=' : '=');
          return {
            field: sides[0].trim(),
            op: op,
            values: (sides[1] || '').split('|').map(function(v) { return v.trim().toLowerCase(); })
          };
        });
      }

      function _getFieldValue(fieldName) {
        // Thử data-field-name trước (ReportFilterDialog), fallback sang name (DynamicFormEngine)
        var el = container.querySelector('[data-field-name="' + fieldName + '"]')
               || container.querySelector('[name="' + fieldName + '"]');
        return el ? (el.value || '').toLowerCase() : '';
      }

      function _evaluate(ruleStr) {
        return _parseRule(ruleStr).every(function(cond) {
          var current = _getFieldValue(cond.field);
          var match = cond.values.indexOf(current) !== -1;
          return cond.op === '=' ? match : !match;
        });
      }

      function _applyRow(row) {
        var rule = row.dataset.visibleRule;
        if (!rule) return;
        var visible = _evaluate(rule);
        row.style.display = visible ? '' : 'none';
        // Disable input ẩn để không bị validate và không serialize vào payload
        row.querySelectorAll('input, select, textarea').forEach(function(inp) {
          inp.disabled = !visible;
        });
      }

      // Áp trạng thái ban đầu
      rows.forEach(function(row) { _applyRow(row); });

      // Tìm trigger fields và đăng ký change listener
      var triggerMap = {};
      rows.forEach(function(row) {
        _parseRule(row.dataset.visibleRule || '').forEach(function(cond) {
          if (!triggerMap[cond.field]) triggerMap[cond.field] = [];
          triggerMap[cond.field].push(row);
        });
      });

      Object.keys(triggerMap).forEach(function(fieldName) {
        var triggerEl = container.querySelector('[data-field-name="' + fieldName + '"]')
                      || container.querySelector('[name="' + fieldName + '"]');
        if (!triggerEl) return;
        var handler = function() {
          triggerMap[fieldName].forEach(function(row) { _applyRow(row); });
        };
        triggerEl.addEventListener('change', handler);
        triggerEl.addEventListener('input', handler);
      });
    }
  };
})();

