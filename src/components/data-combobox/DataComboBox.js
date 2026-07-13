/**
 * Data ComboBox Component
 */
var UIControls = window.UIControls || {};

UIControls.createDataComboBox = function (options) {
  options = options || {};
  var isMultiple = options.multiple === true;
  var valueIndex = options.valueIndex !== undefined ? options.valueIndex : 0;

  function parseValues(value) {
    if (Array.isArray(value)) return value.map(String).map(function (item) { return item.trim(); }).filter(Boolean);
    return String(value || '').split(',').map(function (item) { return item.trim(); }).filter(Boolean);
  }

  var committedValues = parseValues(options.initialValue);
  var selectedValues = committedValues.slice();
  var container = document.createElement('div');
  container.className = 'combo-box-container';

  // Input
  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'ui-input';
  input.placeholder = (options.placeholder !== undefined) ? options.placeholder : 'Tìm kiếm...';
  if (options.id) input.id = options.id;
  if (isMultiple) input.value = committedValues.join(', ');

  // Actions block – chỉ giữ nút mũi tên
  var actions = document.createElement('div');
  actions.className = 'combo-box-actions';

  var btnArrow = document.createElement('button');
  btnArrow.className = 'combo-action-btn';
  btnArrow.innerHTML = '<span class="material-symbols-outlined">arrow_drop_down</span>';
  btnArrow.title = 'Mở danh sách (F4)';
  btnArrow.type = 'button';

  if (options.disabled) {
    input.disabled = true;
    btnArrow.disabled = true;
    container.classList.add('ui-input-disabled');
    btnArrow.innerHTML = '<span class="material-symbols-outlined">lock</span>';
  } else if (options.readonlyInput || isMultiple) {
    input.readOnly = true;
    input.style.cursor = 'pointer';
    input.style.background = 'var(--color-background)'; // slight gray background to indicate read-only
    input.style.caretColor = 'transparent';
    input.style.userSelect = 'none';
  }

  actions.appendChild(btnArrow);

  // ── Dropdown Panel ──────────────────────────────────────────────
  var dropdown = document.createElement('div');
  dropdown.className = 'data-dropdown-menu';

  // Search bar bên trong dropdown
  var searchWrapper = document.createElement('div');
  searchWrapper.className = 'dd-search-wrapper';

  var searchIcon = document.createElement('span');
  searchIcon.className = 'material-symbols-outlined dd-search-icon';
  searchIcon.textContent = 'search';

  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'dd-search-input';
  searchInput.placeholder = 'Tìm kiếm...';

  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(searchInput);

  // Table wrapper (scrollable)
  var tableWrapper = document.createElement('div');
  tableWrapper.className = 'dd-table-wrapper';

  // Footer "+ Thêm mới" & Phân trang
  var footer = document.createElement('div');
  footer.className = 'dd-footer';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';

  var btnAddNew = document.createElement('button');
  btnAddNew.type = 'button';
  btnAddNew.className = 'dd-footer-add-btn';
  btnAddNew.innerHTML = '<span class="material-symbols-outlined">add</span> Thêm mới';

  // Mặc định là ẩn, chỉ hiện khi có yêu cầu từ options
  btnAddNew.style.display = options.showAddNew ? 'flex' : 'none';

  btnAddNew.addEventListener('click', function (e) {
    e.stopPropagation();
    hideDropdown();
    if (typeof options.onF2 === 'function') options.onF2();
  });

  var leftFooter = document.createElement('div');
  leftFooter.appendChild(btnAddNew);

  var multiActions = document.createElement('div');
  multiActions.style.cssText = 'display:' + (isMultiple ? 'flex' : 'none') + ';gap:8px;align-items:center;';

  var btnCancel = document.createElement('button');
  btnCancel.type = 'button';
  btnCancel.className = 'btn btn-light';
  btnCancel.textContent = 'Hủy';

  var btnConfirm = document.createElement('button');
  btnConfirm.type = 'button';
  btnConfirm.className = 'btn btn-primary';
  btnConfirm.textContent = 'Chọn';

  multiActions.appendChild(btnCancel);
  multiActions.appendChild(btnConfirm);

  // Pagination Elements
  var currentPage = 1;
  var currentQuery = '';

  var paginationWrapper = document.createElement('div');
  paginationWrapper.className = 'dd-pagination';
  paginationWrapper.style.display = 'none';
  paginationWrapper.style.gap = '12px';
  paginationWrapper.style.alignItems = 'center';
  paginationWrapper.style.padding = '2px 8px';

  var btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.className = 'btn-icon-sm';
  btnPrev.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span>';
  btnPrev.style.cssText = 'border:1px solid var(--color-border); background:var(--color-surface); cursor:pointer; border-radius:6px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; color:var(--color-text-secondary); transition:all 0.2s;';

  var lblPage = document.createElement('span');
  lblPage.textContent = 'Trang 1';
  lblPage.style.cssText = 'font-size:13px; font-weight:600; color:var(--color-text); min-width:60px; text-align:center;';

  var btnNext = document.createElement('button');
  btnNext.type = 'button';
  btnNext.className = 'btn-icon-sm';
  btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>';
  btnNext.style.cssText = 'border:1px solid var(--color-border); background:var(--color-surface); cursor:pointer; border-radius:6px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; color:var(--color-text-secondary); transition:all 0.2s;';

  // Hover effects
  [btnPrev, btnNext].forEach(function (btn) {
    btn.onmouseover = function () { this.style.borderColor = 'var(--color-primary)'; this.style.color = 'var(--color-primary)'; this.style.background = 'rgba(251, 191, 36, 0.05)'; };
    btn.onmouseout = function () { this.style.borderColor = 'var(--color-border)'; this.style.color = 'var(--color-text-secondary)'; this.style.background = 'var(--color-surface)'; };
  });

  btnPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentPage > 1) {
      currentPage--;
      loadData(currentQuery, currentPage);
    }
  });

  btnNext.addEventListener('click', function (e) {
    e.stopPropagation();
    currentPage++;
    loadData(currentQuery, currentPage);
  });

  paginationWrapper.appendChild(btnPrev);
  paginationWrapper.appendChild(lblPage);
  paginationWrapper.appendChild(btnNext);

  footer.appendChild(leftFooter);
  footer.appendChild(paginationWrapper);
  footer.appendChild(multiActions);

  dropdown.appendChild(searchWrapper);
  dropdown.appendChild(tableWrapper);
  dropdown.appendChild(footer);

  // ── Data & Render ───────────────────────────────────────────────
  var fullData = options.data || [];

  function getRowValue(row) {
    return row && row[valueIndex] !== undefined && row[valueIndex] !== null ? String(row[valueIndex]) : '';
  }

  function syncDisplayValue() {
    if (!isMultiple) return;
    var labels = committedValues.map(function (value) {
      var matched = fullData.find(function (row) { return getRowValue(row) === value; });
      return matched ? String(matched[options.colFilterIndex || 0] || value) : value;
    });
    input.value = labels.join(', ');
    input.title = labels.join(', ');
  }

  syncDisplayValue();

  function renderTable(displayData) {
    if (UIControls.utils) {
      tableWrapper.innerHTML = UIControls.utils.createDropdownTableHTML(
        options.headers || [], displayData, options.colHighlightIndex !== undefined ? options.colHighlightIndex : (options.colFilterIndex || 0), options
      );
      var rows = tableWrapper.querySelectorAll('tbody tr');
      var currentInputVal = input.value.trim().toLowerCase();

      rows.forEach(function (row) {
        var dataRow = displayData[row.getAttribute('data-index')];
        var rowVal = (dataRow[options.colFilterIndex || 0] || '').toString().toLowerCase();
        var dataValue = getRowValue(dataRow);

        if (isMultiple) {
          var checked = selectedValues.indexOf(dataValue) !== -1;
          row.classList.toggle('active', checked);
          var checkbox = row.querySelector('.cb-multi-item');
          if (checkbox) checkbox.checked = checked;
        }

        if (currentInputVal && rowVal === currentInputVal) {
          row.classList.add('active');
        }

        row.addEventListener('click', function (event) {
          event.stopPropagation();
          if (isMultiple) {
            var selectedIndex = selectedValues.indexOf(dataValue);
            if (selectedIndex === -1) selectedValues.push(dataValue);
            else selectedValues.splice(selectedIndex, 1);
            renderTable(displayData);
            return;
          }
          input.value = dataRow[options.colFilterIndex || 0];
          hideDropdown();
          if (typeof options.onSelect === 'function') {
            options.onSelect(dataRow);
          }
        });
      });

      if (isMultiple) {
        var selectAll = tableWrapper.querySelector('.cb-multi-all');
        if (selectAll) {
          var visibleValues = displayData.map(getRowValue).filter(Boolean);
          selectAll.checked = visibleValues.length > 0 && visibleValues.every(function (value) {
            return selectedValues.indexOf(value) !== -1;
          });
          selectAll.addEventListener('click', function (event) {
            event.stopPropagation();
            visibleValues.forEach(function (value) {
              var index = selectedValues.indexOf(value);
              if (selectAll.checked && index === -1) selectedValues.push(value);
              if (!selectAll.checked && index !== -1) selectedValues.splice(index, 1);
            });
            renderTable(displayData);
          });
        }
      }
    }
  }

  // ── Scroll listeners trên đúng container đang scroll ───────────
  var _scrollTargets = [];
  var _scrollHandler = null;

  function attachScrollListeners() {
    if (_scrollHandler) return;
    _scrollHandler = function () {
      if (UIControls.utils) {
        UIControls.utils.computeDropdownPosition(container, dropdown);
      }
    };
    _scrollTargets = UIControls.utils
      ? UIControls.utils.getScrollableAncestors(container)
      : [window];
    _scrollTargets.forEach(function (target) {
      target.addEventListener('scroll', _scrollHandler, { passive: true, capture: false });
    });
    window.addEventListener('resize', _scrollHandler, { passive: true });
  }

  function detachScrollListeners() {
    if (!_scrollHandler) return;
    _scrollTargets.forEach(function (target) {
      target.removeEventListener('scroll', _scrollHandler, { capture: false });
    });
    window.removeEventListener('resize', _scrollHandler);
    _scrollHandler = null;
    _scrollTargets = [];
  }

  function loadData(q, page) {
    currentQuery = q;
    currentPage = page;
    if (typeof options.onSearch === 'function') {
      tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:var(--muted,#94a3b8);font-size:13px">Đang tải...</div>';
      Promise.resolve(options.onSearch(q, page)).then(function (result) {
        if (result && !Array.isArray(result) && result.data) {
          if (result.headers) options.headers = result.headers;
          if (result.colFilterIndex !== undefined) options.colFilterIndex = result.colFilterIndex;
          if (result.valueIndex !== undefined) valueIndex = result.valueIndex;
          if (result.forceMultiColumn !== undefined) options.forceMultiColumn = result.forceMultiColumn;
          result = result.data;
        }
        if (Array.isArray(result)) {
          fullData = result;
          syncDisplayValue();
          renderTable(fullData);
          if (options.enablePagination) {
            paginationWrapper.style.display = 'flex';
            lblPage.textContent = 'Trang ' + page + ' (' + result.length + ')';
            btnPrev.disabled = (page <= 1);
            btnPrev.style.opacity = (page <= 1) ? '0.5' : '1';
            btnNext.disabled = (result.length < 200);
            btnNext.style.opacity = (result.length < 200) ? '0.5' : '1';
          }
          if (UIControls.utils) {
            UIControls.utils.computeDropdownPosition(container, dropdown);
          }
        }
      }).catch(function () {
        tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:#ef4444;font-size:13px">Lỗi tải dữ liệu</div>';
      });
    } else {
      var lval = q.toLowerCase();
      var filtered = lval ? fullData.filter(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(lval);
      }) : fullData;
      renderTable(filtered);
      if (UIControls.utils) {
        UIControls.utils.computeDropdownPosition(container, dropdown);
      }
    }
  }

  function showDropdown() {
    // Đóng các dropdown khác trước khi mở
    document.dispatchEvent(new CustomEvent('close-other-comboboxes', { detail: dropdown }));

    if (dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }
    searchInput.value = '';
    if (isMultiple) selectedValues = committedValues.slice();

    loadData('', 1);

    if (UIControls.utils) {
      UIControls.utils.computeDropdownPosition(container, dropdown);
    }
    dropdown.classList.add('active');
    attachScrollListeners();
    setTimeout(function () {
      if (document.activeElement !== input) {
        searchInput.focus();
      }
    }, 50);
  }

  function hideDropdown() {
    detachScrollListeners();
    dropdown.classList.remove('active');
    if (dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
  }

  btnCancel.addEventListener('click', function (event) {
    event.stopPropagation();
    selectedValues = committedValues.slice();
    hideDropdown();
  });

  btnConfirm.addEventListener('click', function (event) {
    event.stopPropagation();
    committedValues = selectedValues.slice();
    syncDisplayValue();
    var value = committedValues.join(',');
    if (typeof options.onChange === 'function') options.onChange(value);
    if (typeof options.onSelect === 'function') {
      var rows = fullData.filter(function (row) { return committedValues.indexOf(getRowValue(row)) !== -1; });
      options.onSelect(value, rows);
    }
    hideDropdown();
  });

  // ── Search bên trong dropdown ───────────────────────────────────
  var _searchDebounce = null;

  searchInput.addEventListener('input', function () {
    var val = searchInput.value;

    if (typeof options.onSearch === 'function') {
      // Server-side: debounce 300ms rồi gọi API
      clearTimeout(_searchDebounce);
      tableWrapper.innerHTML = '<div style="padding:12px;text-align:center;color:var(--muted,#94a3b8);font-size:13px">Đang tìm...</div>';
      _searchDebounce = setTimeout(function () {
        loadData(val, 1);
      }, 300);
    } else {
      // Client-side: filter local fullData
      var lval = val.toLowerCase();
      if (!lval) { renderTable(fullData); return; }
      var filtered = fullData.filter(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase().includes(lval);
      });
      renderTable(filtered);
    }
  });

  searchInput.addEventListener('click', function (e) { e.stopPropagation(); });

  // ── Events ──────────────────────────────────────────────────────
  btnArrow.addEventListener('click', function (e) {
    e.preventDefault();
    dropdown.classList.contains('active') ? hideDropdown() : showDropdown();
  });

  input.addEventListener('click', function (e) {
    if (options.readonlyInput || isMultiple) {
      e.preventDefault();
      dropdown.classList.contains('active') ? hideDropdown() : showDropdown();
    }
  });

  input.addEventListener('mousedown', function (e) {
    if (options.readonlyInput || isMultiple) {
      e.preventDefault(); // Prevent focus and blinking cursor
    }
  });

  input.addEventListener('input', function (e) {
    var val = e.target.value;
    if (typeof options.onChange === 'function') {
      options.onChange(val);
    }

    if (!options.hideDropdownOnInput && !dropdown.classList.contains('active')) {
      showDropdown();
    }
    // Ghi chú: Đã bỏ logic filter và onSearch ở đây theo yêu cầu của user. 
    // Chỉ ô tìm kiếm bên trong dropdown (searchInput) mới thực hiện filter.
  });

  function _onDocClick(e) {
    if (!document.body.contains(container)) {
      _cleanupListeners();
      return;
    }
    if (!container.contains(e.target) && !dropdown.contains(e.target)) hideDropdown();
  }

  function _onCloseOthers(e) {
    if (!document.body.contains(container)) {
      _cleanupListeners();
      return;
    }
    if (e.detail !== dropdown) hideDropdown();
  }

  function _cleanupListeners() {
    document.removeEventListener('click', _onDocClick);
    document.removeEventListener('close-other-comboboxes', _onCloseOthers);
    hideDropdown();
  }

  document.addEventListener('click', _onDocClick);
  document.addEventListener('close-other-comboboxes', _onCloseOthers);


  input.addEventListener('blur', function () {
    if (isMultiple) return;
    var val = input.value.trim().toLowerCase();
    if (val && fullData.length > 0) {
      var exactMatch = fullData.find(function (row) {
        return (row[options.colFilterIndex || 0] || '').toString().toLowerCase() === val;
      });
      if (exactMatch) {
        input.value = exactMatch[options.colFilterIndex || 0];
        if (typeof options.onSelect === 'function') {
          options.onSelect(exactMatch);
        }
      }
    }
  });

  input.addEventListener('kb:open', function () { dropdown.classList.contains('active') ? hideDropdown() : showDropdown(); });
  input.addEventListener('kb:new', function () { if (options.onF2) options.onF2(); });
  input.addEventListener('kb:lookup', function () { if (options.onF3) options.onF3(); });
  input.addEventListener('kb:close', function () { hideDropdown(); });

  container.appendChild(input);
  container.appendChild(actions);

  container.setValue = function (value) {
    if (!isMultiple) {
      input.value = value || '';
      return;
    }
    committedValues = parseValues(value);
    selectedValues = committedValues.slice();
    syncDisplayValue();
  };

  return container;
};
