/**
 * Shared UI Utilities for Components
 */
var UIControls = window.UIControls || {};

UIControls.utils = (function () {
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
    dropdownElement.style.position = 'fixed';
    dropdownElement.style.zIndex = '10000000';
    dropdownElement.style.transition = 'opacity 0.15s ease, visibility 0.15s ease';
    dropdownElement.style.minWidth = rect.width + 'px';

    var isActive = dropdownElement.classList.contains('active');
    if (!isActive) {
      dropdownElement.style.maxHeight = '300px';
      dropdownElement.style.visibility = 'hidden';
      dropdownElement.classList.add('active');
    }

    var dropWidth = dropdownElement.offsetWidth;
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
  function createDropdownTableHTML(headers, data, colHighlightIndex, options) {
    options = options || {};
    var visibleIndexes = [];
    var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;

    // Bước 1: Lọc bỏ tất cả các cột rác (ghi chú, mô tả...)
    headers.forEach(function (h, idx) {
      if (hideRegex.test(h)) return;
      visibleIndexes.push(idx);
    });

    // Bước 2: Ép về giao diện 1 cột chuẩn Mobile List (Trừ khi cấu hình yêu cầu giữ nguyên bảng nhiều cột)
    if (visibleIndexes.length > 1 && !options.forceMultiColumn) {
      // Cố gắng giữ lại cột Highlight (do DynamicFormEngine.js chọn) nếu nó không bị loại
      var highlightValid = visibleIndexes.indexOf(colHighlightIndex) !== -1;

      if (highlightValid && colHighlightIndex !== 0) {
        // Nếu Highlight hợp lệ và không phải cột Mã (0)
        visibleIndexes = [colHighlightIndex];
      } else {
        // Mặc định bỏ cột Mã (index 0) đi nếu còn cột khác
        var withoutZero = visibleIndexes.filter(function (i) { return i !== 0; });
        if (withoutZero.length > 0) {
          visibleIndexes = [withoutZero[0]];
        } else {
          visibleIndexes = [visibleIndexes[0]];
        }
      }
    }

    // Bước 3: Fallback an toàn nếu tất cả bị loại
    if (visibleIndexes.length === 0) {
      var firstValid = headers.findIndex(function (h) { return !hideRegex.test(h); });
      visibleIndexes.push(firstValid !== -1 ? firstValid : 0);
    }

    var theadHTML = visibleIndexes.map(idx => `<th>${headers[idx]}</th>`).join('');
    var tbodyHTML = data.map(function (row, rIdx) {
      var cells = visibleIndexes.map(function (idx) {
        var cls = (idx === colHighlightIndex && visibleIndexes.length > 1) ? 'highlight-col' : '';
        return `<td class="${cls}">${row[idx] || ''}</td>`;
      }).join('');
      return `<tr data-index="${rIdx}">${cells}</tr>`;
    }).join('');

    var isSingleCol = visibleIndexes.length <= 1;
    var headerStyle = isSingleCol ? ' style="display:none;"' : '';
    var tblClass = isSingleCol ? 'dropdown-table single-column' : 'dropdown-table';

    return `
      <table class="${tblClass}">
        <thead${headerStyle}><tr>${theadHTML}</tr></thead>
        <tbody>${tbodyHTML}</tbody>
      </table>
    `;
  }

  /**
   * Hiển thị modal chọn nhiều dòng cho grid
   * @param {Object} options 
   * - title: Tiêu đề modal
   * - dataList: Mảng dữ liệu
   * - headers: Mảng tiêu đề cột ['Mã', 'Tên', ...]
   * - fields: Mảng key tương ứng ['PersonID', 'PersonName', ...]
   * - keyField: Field dùng để check trùng (ví dụ 'PersonID')
   * - ctx: Context của detail grid (ctx.panel, ctx.row, ctx.tabDef, ctx.MODULE_CONFIG)
   * - onRowRender(rData, isDuplicate): Callback (tùy chọn) trả về { styleClass, warningText, warningStyle }
   * - mapRow(rData): Hàm trả về object chứa dữ liệu dòng mới để add vào lưới
   * - onConfirm(selectedRows): Callback (tùy chọn) chạy trước khi đóng modal
   */
  function showMultiSelectGridModal(options) {
    var dataList = options.dataList || [];
    var ctx = options.ctx;

    var mWrap = document.createElement('div');
    mWrap.className = 'ui-modal-overlay';
    mWrap.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center;';

    var mBox = document.createElement('div');
    mBox.className = 'ui-modal-content';
    mBox.style.cssText = 'background: #fff; width: 900px; max-width: 95%; max-height: 90%; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 4px 24px rgba(0,0,0,0.2);';

    var mHeader = document.createElement('div');
    mHeader.style.cssText = 'padding: 16px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: var(--color-surface); border-radius: 8px 8px 0 0;';
    mHeader.innerHTML = '<h3 style="margin: 0; font-size: 16px;">' + (options.title || 'Chọn dữ liệu') + '</h3><button type="button" class="btn-close" style="background: transparent; border: none; font-size: 20px; cursor: pointer;">&times;</button>';
    mHeader.querySelector('.btn-close').onclick = function () { document.body.removeChild(mWrap); };

    var mBody = document.createElement('div');
    mBody.style.cssText = 'padding: 16px; overflow-y: auto; flex: 1;';

    var tableHTML = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    tableHTML += '<thead style="background: var(--color-surface-elevated);"><tr style="border-bottom: 2px solid var(--color-border);">';
    tableHTML += '<th style="padding: 10px; text-align: center; width: 40px;"><input type="checkbox" id="chkAllMulti" /></th>';
    options.headers.forEach(function (h) {
      tableHTML += '<th style="padding: 10px; text-align: left;">' + h + '</th>';
    });
    tableHTML += '</tr></thead><tbody>';

    dataList.forEach(function (rData, idx) {
      var isDuplicate = ctx.panel._currentRows.some(function (r) { return r[options.keyField] === rData[options.keyField]; });
      var chkDisabled = isDuplicate ? 'disabled' : '';
      var styleClass = isDuplicate ? 'opacity: 0.5; background: #f9f9f9;' : '';
      var warningText = isDuplicate ? 'Đã có trên form' : '';
      var warningStyle = isDuplicate ? 'color: red;' : '';

      if (typeof options.onRowRender === 'function') {
        var rowRender = options.onRowRender(rData, isDuplicate);
        if (rowRender) {
          if (rowRender.styleClass) styleClass = rowRender.styleClass;
          if (rowRender.warningText) warningText = rowRender.warningText;
          if (rowRender.warningStyle) warningStyle = rowRender.warningStyle;
        }
      }

      tableHTML += '<tr style="border-bottom: 1px solid var(--color-border); ' + styleClass + '">';
      tableHTML += '<td style="padding: 8px; text-align: center;"><input type="checkbox" class="chk-item-multi" data-idx="' + idx + '" ' + chkDisabled + ' /></td>';
      options.fields.forEach(function (f) {
        if (f === '_warning_') {
          tableHTML += '<td style="padding: 8px; ' + warningStyle + '">' + warningText + '</td>';
        } else {
          tableHTML += '<td style="padding: 8px;">' + (rData[f] || '') + '</td>';
        }
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    mBody.innerHTML = tableHTML;

    var mFooter = document.createElement('div');
    mFooter.style.cssText = 'padding: 16px; border-top: 1px solid var(--color-border); text-align: right; background: var(--color-surface); border-radius: 0 0 8px 8px;';

    var btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'btn btn-light';
    btnCancel.textContent = 'Đóng';
    btnCancel.style.marginRight = '8px';
    btnCancel.onclick = function () { document.body.removeChild(mWrap); };

    var btnSelect = document.createElement('button');
    btnSelect.type = 'button';
    btnSelect.className = 'btn btn-primary';
    btnSelect.textContent = 'Chọn & tiếp tục';
    btnSelect.onclick = function () {
      var chks = mBody.querySelectorAll('.chk-item-multi:checked');
      var selectedRows = [];
      chks.forEach(function (chk) {
        var idx = parseInt(chk.getAttribute('data-idx'));
        var rowData = dataList[idx];
        if (rowData) selectedRows.push(rowData);
      });

      if (typeof options.onConfirm === 'function') {
        options.onConfirm(selectedRows);
      } else {
        var added = false;
        selectedRows.forEach(function (rowData) {
          if (typeof options.mapRow === 'function') {
            var newRow = options.mapRow(rowData);
            ctx.panel._currentRows.push(newRow);
            added = true;
          }
        });
        if (added && typeof ctx.renderGrid === 'function') {
          ctx.renderGrid(options.ctx.tabDef, options.ctx.panel);
        }
      }
      document.body.removeChild(mWrap);
    };

    mFooter.appendChild(btnCancel);
    mFooter.appendChild(btnSelect);

    mBox.appendChild(mHeader);
    mBox.appendChild(mBody);
    mBox.appendChild(mFooter);
    mWrap.appendChild(mBox);

    document.body.appendChild(mWrap);

    var chkAll = mBody.querySelector('#chkAllMulti');
    if (chkAll) {
      chkAll.onclick = function () {
        var chks = mBody.querySelectorAll('.chk-item-multi:not([disabled])');
        var isChecked = this.checked;
        chks.forEach(function (chk) { chk.checked = isChecked; });
      };
    }
  }

  return {
    showMultiSelectGridModal: showMultiSelectGridModal,
    computeDropdownPosition: computeDropdownPosition,
    getScrollableAncestors: getScrollableAncestors,
    createDropdownTableHTML: createDropdownTableHTML,
    /**
     * Setup single row selection for a table
     */
    setupTableSelection: function (tableBody, onSelect) {
      if (!tableBody) return;
      tableBody.addEventListener('click', function (e) {
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
    applyVisibleRules: function (container, rowSelector, fieldSelector) {
      rowSelector = rowSelector || '[data-visible-rule]';
      var rows = Array.from(container.querySelectorAll(rowSelector));
      if (!rows.length) return;

      function _parseRule(ruleStr) {
        return ruleStr.split('&').map(function (part) {
          part = part.trim();
          var op = part.indexOf('!=') !== -1 ? '!=' : '=';
          var sides = part.split(op === '!=' ? '!=' : '=');
          return {
            field: sides[0].trim(),
            op: op,
            values: (sides[1] || '').split('|').map(function (v) { return v.trim().toLowerCase(); })
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
        return _parseRule(ruleStr).every(function (cond) {
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
        row.querySelectorAll('input, select, textarea').forEach(function (inp) {
          inp.disabled = !visible;
        });
      }

      // Áp trạng thái ban đầu
      rows.forEach(function (row) { _applyRow(row); });

      // Tìm trigger fields và đăng ký change listener
      var triggerMap = {};
      rows.forEach(function (row) {
        _parseRule(row.dataset.visibleRule || '').forEach(function (cond) {
          if (!triggerMap[cond.field]) triggerMap[cond.field] = [];
          triggerMap[cond.field].push(row);
        });
      });

      Object.keys(triggerMap).forEach(function (fieldName) {
        var triggerEl = container.querySelector('[data-field-name="' + fieldName + '"]')
          || container.querySelector('[name="' + fieldName + '"]');
        if (!triggerEl) return;
        var handler = function () {
          triggerMap[fieldName].forEach(function (row) { _applyRow(row); });
        };
        triggerEl.addEventListener('change', handler);
        triggerEl.addEventListener('input', handler);
      });
    }
  };
})();

