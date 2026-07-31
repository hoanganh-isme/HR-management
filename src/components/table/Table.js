/**
 * Table Component
 * Sinh ra DataGrid Table với JS.
 */
var UITable = (function () {

  /**
   * Tạo Datagrid Table
   * @param {Object} config - { headers (Array), data (Array), columns (Array of mappings), className }
   */
  function create(config) {
    var isMobile = window.innerWidth <= 768;

    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper ' + (config.className || '');
    // Bỏ viền 2 bên
    wrapper.style.borderRadius = '0';
    wrapper.style.borderTop = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderBottom = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderLeft = 'none';
    wrapper.style.borderRight = 'none';
    // Hỗ trợ scroll ngang trên cả mobile và desktop để xem toàn bộ cột
    wrapper.style.overflowX = 'auto';
    wrapper.style.overflowY = 'auto';

    var table = document.createElement('table');
    table.className = 'data-table';
    // Mobile: để bảng co lại trong viewport; Desktop: bảng rộng theo nội dung
    table.style.width = isMobile ? '100%' : 'max-content';
    table.style.whiteSpace = isMobile ? 'normal' : 'nowrap';
    table.style.tableLayout = isMobile ? 'fixed' : 'auto';

    // Tbody & Thead
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Cập nhật lại style khi resize cửa sổ (responsive)
    window.addEventListener('resize', function () {
      var nowMobile = window.innerWidth <= 768;
      wrapper.style.overflowX = 'auto';
      table.style.width = nowMobile ? '100%' : 'max-content';
      table.style.whiteSpace = nowMobile ? 'normal' : 'nowrap';
      table.style.tableLayout = nowMobile ? 'fixed' : 'auto';
    });

    // Ép style thu gọn khoảng cách (Compact Density) + Sticky Columns
    var styleDensity = document.createElement('style');
    styleDensity.innerHTML = `
      .table-wrapper .data-table th {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
         font-weight: 700 !important;
         background-color: var(--color-surface-elevated, #f1f5f9) !important;
         color: var(--color-text, #1e293b) !important;
      }
      .table-wrapper .data-table td {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
      }
      .table-wrapper .data-table.no-mobile-stack {
        width: max-content !important;
        white-space: nowrap !important;
        table-layout: auto !important;
      }
      /* ── Sticky Columns ── */
      .table-wrapper.has-sticky-cols .data-table td.sticky-col {
        position: sticky !important;
        z-index: 2 !important;
        background: var(--color-surface, #fff);
      }
      /* Header sticky-col cần z-index cao hơn th thường (z-index:10) để không bị che khuất khi scroll */
      .table-wrapper.has-sticky-cols .data-table thead th.sticky-col {
        position: sticky !important;
        z-index: 30 !important;  /* > 10 (th thường) và > resizer z-index: 10 */
        background: var(--color-surface-elevated, #f1f5f9) !important;
      }
      .table-wrapper.has-sticky-cols .data-table th.sticky-col-last,
      .table-wrapper.has-sticky-cols .data-table td.sticky-col-last {
        box-shadow: 2px 0 6px -2px rgba(0,0,0,0.12);
        border-right: 1px solid var(--color-border, #e2e8f0) !important;
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table th.sticky-col,
      body.dark-theme .table-wrapper.has-sticky-cols .data-table td.sticky-col {
        background: var(--color-surface, #1e293b);
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table tbody tr:hover td.sticky-col {
        background: rgba(255,255,255,0.05);
      }
      body.dark-theme .table-wrapper.has-sticky-cols .data-table tbody tr.active td.sticky-col {
        background-color: var(--color-surface, #1e293b) !important;
        background-image: linear-gradient(var(--color-primary-light, rgba(67,97,238,0.18)), var(--color-primary-light, rgba(67,97,238,0.18))) !important;
      }
      .table-wrapper.has-sticky-cols .data-table tbody tr:hover td.sticky-col {
        background: var(--color-surface-elevated, #f8fafc);
      }
      .table-wrapper.has-sticky-cols .data-table tbody tr.active td.sticky-col {
        background-color: var(--color-surface, #fff) !important;
        background-image: linear-gradient(var(--color-primary-light, rgba(67,97,238,0.06)), var(--color-primary-light, rgba(67,97,238,0.06))) !important;
      }
      @media (max-width: 768px) {
        .table-wrapper .data-table th,
        .table-wrapper .data-table td {
          white-space: normal !important;
          word-break: break-word !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .table-wrapper .data-table.no-mobile-stack th,
        .table-wrapper .data-table.no-mobile-stack td {
          white-space: nowrap !important;
          word-break: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
        .dynamic-grid-card .table-wrapper {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          overflow-x: auto !important;
        }
        .dynamic-grid-card .datagrid-pager {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
        }
        .table-wrapper .data-table th:first-child,
        .table-wrapper .data-table td:first-child {
          padding-left: 16px !important;
        }
        /* Tắt sticky trên mobile để không bị chồng lấp */
        .table-wrapper.has-sticky-cols .data-table th.sticky-col,
        .table-wrapper.has-sticky-cols .data-table td.sticky-col {
          position: static !important;
          box-shadow: none !important;
          border-right: none !important;
        }
      }
    `;
    wrapper.appendChild(styleDensity);

    // Số cột cần sticky (mặc định 0 = tắt)
    var stickyCount = (typeof config.stickyColumns === 'number' && config.stickyColumns > 0) ? config.stickyColumns : 0;
    if (stickyCount > 0) {
      wrapper.classList.add('has-sticky-cols');
    }

    // Tính trước left offset cho từng sticky column từ config width
    // Cach này đồng bộ, không cần đo offsetWidth sau render
    var _stickyOffsets = [];
    if (stickyCount > 0 && config.headers) {
      var _acc = 0;
      for (var _si = 0; _si < Math.min(stickyCount, config.headers.length); _si++) {
        _stickyOffsets.push(_acc);
        var _hdr = config.headers[_si];
        var _w = (_hdr && _hdr.width) ? (parseInt(_hdr.width) || 150) : 150;
        _acc += _w;
      }
    }

    // Hàm cập nhật left offset khi chiều rộng cột thay đổi (VD: column resize)
    function _applyStickyOffsets() {
      if (stickyCount <= 0) return;
      var stickyThs = thead.querySelectorAll('th.sticky-col');
      // Cập nhật _stickyOffsets từ offsetWidth thực tế sau khi user resize cột
      var acc = 0;
      for (var si = 0; si < stickyThs.length; si++) {
        _stickyOffsets[si] = acc;
        stickyThs[si].style.left = acc + 'px';
        stickyThs[si].style.top = '0'; // đảm bảo top luôn có giá trị inline
        acc += stickyThs[si].offsetWidth;
      }
      // Cập nhật left cho tất cả td sticky
      var rows = tbody.querySelectorAll('tr');
      for (var ri = 0; ri < rows.length; ri++) {
        var stickyTds = rows[ri].querySelectorAll('td.sticky-col');
        for (var ci = 0; ci < stickyTds.length; ci++) {
          if (_stickyOffsets[ci] !== undefined) {
            stickyTds[ci].style.left = _stickyOffsets[ci] + 'px';
          }
        }
      }
    }

    var currentData = config.data ? config.data.slice() : [];
    var currentSort = config.currentSort ? { field: config.currentSort.field, dir: config.currentSort.dir } : { field: null, dir: 'asc' };

    function renderBody() {
      tbody.innerHTML = '';
      if (currentData && currentData.length > 0) {
        currentData.forEach(function (row) {
          var tr = document.createElement('tr');

          if (config.columns) {
            config.columns.forEach(function (col, idx) {
              var td = document.createElement('td');
              if (col.align) td.style.textAlign = col.align;

              if (config.headers && config.headers[idx] && config.headers[idx].label) {
                td.setAttribute('data-label', config.headers[idx].label);
              }

              // Sticky column: gắn class + left ngay khi tạo td (không cần đợi rAF)
              if (stickyCount > 0 && idx < stickyCount) {
                td.classList.add('sticky-col');
                if (idx === stickyCount - 1) td.classList.add('sticky-col-last');
                td.style.left = (_stickyOffsets[idx] || 0) + 'px';
              }

              var val = row[col.field];
              var fieldName = (col.field || '').toLowerCase();
              var headerLabel = (config.headers && config.headers[idx] && config.headers[idx].label ? config.headers[idx].label : '').toLowerCase();

              // Tự động map trạng thái nếu là PersonStatus (để tránh hiển thị số 4, 1, 8 trên lưới)
              if (fieldName === 'personstatus' || headerLabel.includes('trạng thái')) {
                var statusMap = { '1': 'Thử việc', '4': 'Chính thức', '8': 'Nghỉ việc' };
                val = statusMap[String(val)] || val;
              }

              if (fieldName.includes('cmnd') || fieldName.includes('cccd') || fieldName.includes('dienthoai') || fieldName.includes('sohopdong') || fieldName.includes('personid') || fieldName.includes('manhanvien') || fieldName === 'id' || fieldName === 'manv' || headerLabel.includes('cccd') || headerLabel.includes('mã nhân viên') || headerLabel.includes('điện thoại') || headerLabel.includes('hợp đồng')) {
                td.style.color = 'var(--color-primary)';
                td.style.fontWeight = '600';
                td.style.fontVariantNumeric = 'tabular-nums';
              } else if (fieldName.includes('ngay') || fieldName.includes('date') || headerLabel.includes('ngày') || headerLabel.includes('date')) {
                td.style.color = '#475569'; // Slate 600 - subtle and premium for dates
                td.style.fontWeight = '500';
                td.style.fontVariantNumeric = 'tabular-nums'; // Ensures numbers align vertically without looking like a typewriter
              } else if (fieldName.includes('status') || fieldName.includes('trangthai') || headerLabel.includes('trạng thái')) {
                td.style.color = '#10b981';
                td.style.fontWeight = '700';
              }
              if (col.render) {
                var rendered = col.render(val, row);
                if (typeof rendered === 'string') td.innerHTML = rendered;
                else if (rendered instanceof Node) td.appendChild(rendered);
              } else {
                td.innerText = val !== undefined && val !== null ? val : '';
              }
              tr.appendChild(td);
            });
          } else {
            row.forEach(function (cellStr, idx) {
              var td = document.createElement('td');
              if (stickyCount > 0 && idx < stickyCount) {
                td.classList.add('sticky-col');
                if (idx === stickyCount - 1) td.classList.add('sticky-col-last');
                td.style.left = (_stickyOffsets[idx] || 0) + 'px';
              }
              if (typeof cellStr === 'string' && cellStr.indexOf('<') > -1) {
                td.innerHTML = cellStr;
              } else {
                td.innerText = cellStr;
              }
              tr.appendChild(td);
            });
          }

          tbody.appendChild(tr);
        });
      } else {
        var trEmpty = document.createElement('tr');
        trEmpty.className = 'empty-row';
        trEmpty.style.border = 'none';
        trEmpty.style.background = 'transparent';
        trEmpty.style.boxShadow = 'none';

        var tdEmpty = document.createElement('td');
        tdEmpty.colSpan = config.headers ? config.headers.length : 1;
        tdEmpty.style.display = 'block';
        tdEmpty.style.textAlign = 'center';
        tdEmpty.style.padding = '32px 16px';
        tdEmpty.style.color = 'var(--color-text-secondary)';
        tdEmpty.style.borderBottom = 'none';
        tdEmpty.innerText = 'Không có dữ liệu';

        trEmpty.appendChild(tdEmpty);
        tbody.appendChild(trEmpty);
      }
    }

    // Thead
    function renderHead() {
      thead.innerHTML = '';
      if (config.headers && config.headers.length > 0) {
        var trHead = document.createElement('tr');

        config.headers.forEach(function (h, idx) {
          var th = document.createElement('th');
          th.draggable = true; // Enable drag
          th.style.cursor = 'grab'; // Add grab cursor to indicate draggable
          th.style.userSelect = 'none'; // Prevent text selection during drag

          // Drag and Drop Logic
          th.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(idx));
            setTimeout(function () { th.style.opacity = '0.5'; }, 0);
          });
          th.addEventListener('dragend', function (e) {
            th.style.opacity = '1';
            th.style.cursor = 'grab';
          });
          th.addEventListener('dragenter', function (e) {
            e.preventDefault();
          });
          th.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            th.style.borderLeft = '2px solid var(--color-primary)';
          });
          th.addEventListener('dragleave', function (e) {
            th.style.borderLeft = '';
          });
          th.addEventListener('drop', function (e) {
            e.preventDefault();
            th.style.borderLeft = '';
            var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            var toIdx = idx;
            if (!isNaN(fromIdx) && fromIdx !== toIdx) {
              // Swap headers
              var movedHeader = config.headers.splice(fromIdx, 1)[0];
              config.headers.splice(toIdx, 0, movedHeader);
              // Swap columns
              if (config.columns) {
                var movedCol = config.columns.splice(fromIdx, 1)[0];
                config.columns.splice(toIdx, 0, movedCol);
              }
              renderAll(); // Re-render head and body
            }
          });

          var spanTxt = document.createElement('span');
          spanTxt.innerText = h.label || h;
          spanTxt.style.pointerEvents = 'none'; // Prevent child interference
          th.appendChild(spanTxt);

          // Ctrl + Double Click vào tiêu đề cột để mở modal chỉnh sửa (WinForms ERP style)
          th.addEventListener('dblclick', function (e) {
            if (e.ctrlKey || e.metaKey) {
              e.stopPropagation();
              e.preventDefault();
              var fieldName = h.field || h.name || (config.columns && config.columns[idx] && config.columns[idx].field) || '';
              if (fieldName && typeof ColumnCaptionEditorModal !== 'undefined') {
                ColumnCaptionEditorModal.show({
                  formName: config.formName || window._currentFormName || '',
                  fieldName: fieldName,
                  captionVN: typeof h === 'object' ? (h.label || h.caption) : h,
                  alignX: h.align,
                  formatId: h.formatId,
                  minWidth: parseInt(h.minWidth) || 0,
                  maxWidth: parseInt(h.maxWidth) || 0,
                  onSuccess: function (updated) {
                    if (updated.captionVN) {
                      h.label = updated.captionVN;
                      spanTxt.innerText = updated.captionVN;
                    }
                  }
                });
              }
            }
          });

          if (h.width) {
            th.style.width = h.width;
            th.style.minWidth = h.width; // Ép cứng chiều rộng ban đầu
          }
          if (h.align) th.style.textAlign = h.align;

          // Sticky column: gắn class + set left và top inline ngay khi tạo th
          // left được tính từ config width (đồng bộ), không cần đợi rAF
          if (stickyCount > 0 && idx < stickyCount) {
            th.classList.add('sticky-col');
            if (idx === stickyCount - 1) th.classList.add('sticky-col-last');
            // Disable drag-to-reorder trên sticky columns
            th.draggable = false;
            th.style.cursor = 'default';
            // Set left và top inline để đảm bảo sticky hoạt động đúng, không bị CSS cascade ảnh hưởng
            th.style.left = (_stickyOffsets[idx] || 0) + 'px';
            th.style.top = '0';
          }

          // --- COLUMN RESIZING LOGIC ---
          th.style.position = 'sticky'; // Cần thiết cho sticky header & neo resizer

          var resizer = document.createElement('div');
          resizer.className = 'col-resizer';
          resizer.style.cssText = 'position: absolute; right: -8px; top: 0; bottom: 0; width: 16px; cursor: col-resize; z-index: 10; display: flex; justify-content: center; touch-action: none;';

          var resizerLine = document.createElement('div');
          resizerLine.style.cssText = 'width: 2px; height: 100%; background: transparent; transition: background 0.2s;';
          resizer.appendChild(resizerLine);

          resizer.addEventListener('mouseenter', function () { resizerLine.style.background = 'var(--color-primary, #4361ee)'; });
          resizer.addEventListener('mouseleave', function () { resizerLine.style.background = 'transparent'; });

          resizer.addEventListener('pointerdown', function (e) {
            e.stopPropagation(); // Ngăn sự kiện drag and drop cột
            e.preventDefault();

            var startX = e.clientX;
            var startWidth = th.offsetWidth;

            document.body.style.cursor = 'col-resize';
            window._isResizingColumn = true;

            function onPointerMove(ev) {
              var newWidth = startWidth + (ev.clientX - startX);
              if (newWidth > 40) { // Giới hạn nhỏ nhất là 40px
                th.style.width = newWidth + 'px';
                th.style.minWidth = newWidth + 'px';
                h.width = newWidth + 'px'; // Lưu lại config để khi re-render (sort/drag) không bị mất
              }
            }

            function onPointerUp(ev) {
              document.body.style.cursor = '';
              document.removeEventListener('pointermove', onPointerMove);
              document.removeEventListener('pointerup', onPointerUp);
              setTimeout(function () { window._isResizingColumn = false; }, 100);
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
          });

          // Cực kỳ quan trọng: Ngăn event click bong bóng lên <th> sau khi thả chuột (nếu không sẽ bị kích hoạt Sort)
          resizer.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
          });

          // Tự động điều chỉnh độ rộng cột khi double click vào viền
          resizer.addEventListener('dblclick', function (e) {
            e.stopPropagation();
            e.preventDefault();

            var maxWidth = spanTxt.scrollWidth + 36; // Căn chỉnh cho icon sort và padding header

            var rows = tbody.querySelectorAll('tr');
            for (var i = 0; i < rows.length; i++) {
              var cell = rows[i].children[idx];
              if (cell) {
                var originalWs = cell.style.whiteSpace;
                cell.style.whiteSpace = 'nowrap';
                var cellWidth = cell.scrollWidth;

                // Thêm khoảng đệm tương ứng (khoảng 20px - padding td: 6px 10px)
                if (cellWidth + 20 > maxWidth) {
                  maxWidth = cellWidth + 20;
                }
                cell.style.whiteSpace = originalWs;
              }
            }

            maxWidth = Math.min(maxWidth, 800); // Giới hạn không cho cột bị giãn to vô lý

            th.style.width = maxWidth + 'px';
            th.style.minWidth = maxWidth + 'px';
            h.width = maxWidth + 'px'; // Cập nhật config để giữ lại kích thước
          });

          th.appendChild(resizer);

          // Nếu header có sortable
          if (h.sortable && h.field) {

            var icon = document.createElement('span');
            icon.className = 'material-symbols-outlined sort-icon';
            icon.style.pointerEvents = 'none'; // Prevent child interference

            if (currentSort.field === h.field) {
              icon.innerText = currentSort.dir === 'asc' ? 'expand_less' : 'expand_more';
              icon.style.color = 'var(--color-primary)';
            } else {
              icon.innerText = 'unfold_more';
              icon.style.color = 'var(--color-text-secondary)';
            }

            icon.style.fontSize = '14px';
            icon.style.verticalAlign = 'middle';
            icon.style.marginLeft = '4px';
            th.appendChild(icon);

            th.addEventListener('click', function (e) {
              if (window._isResizingColumn) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }

              // Reset all icons
              trHead.querySelectorAll('.sort-icon').forEach(function (i) {
                i.innerText = 'unfold_more';
                i.style.color = 'var(--color-text-secondary)';
              });

              if (currentSort.field === h.field) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.field = h.field;
                currentSort.dir = 'asc';
              }

              icon.innerText = currentSort.dir === 'asc' ? 'expand_less' : 'expand_more';
              icon.style.color = 'var(--color-primary)';

              if (typeof config.onSort === 'function') {
                // Server-side sort callback
                config.onSort(currentSort.field, currentSort.dir);
              } else {
                // Client-side sort
                currentData.sort(function (a, b) {
                  var v1 = a[h.field];
                  var v2 = b[h.field];
                  if (v1 === v2) return 0;
                  if (v1 == null) return currentSort.dir === 'asc' ? -1 : 1;
                  if (v2 == null) return currentSort.dir === 'asc' ? 1 : -1;

                  if (typeof v1 === 'string') v1 = v1.toLowerCase();
                  if (typeof v2 === 'string') v2 = v2.toLowerCase();

                  if (v1 < v2) return currentSort.dir === 'asc' ? -1 : 1;
                  return currentSort.dir === 'asc' ? 1 : -1;
                });
                renderBody();
              }
              // Re-trigger re-selection logic if needed (handled by external click listener on tbody)
            });
          }

          trHead.appendChild(th);
        });
        thead.appendChild(trHead);
      }
    }

    function renderAll() {
      renderHead();
      renderBody();
      // left đã được áp dụng đồng bộ trong renderHead/renderBody.
      // Chỉ gọi _applyStickyOffsets khi cần cập nhật sau resize cột.
    }

    renderAll();
    wrapper.appendChild(table);

    wrapper.updateData = function (newData) {
      currentData = newData ? newData.slice() : [];
      renderBody();
      wrapper.hideLoading();
    };

    wrapper.showLoading = function (text) {
      wrapper.style.position = 'relative';
      var loader = wrapper.querySelector('.table-loader');
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'table-loader';
        loader.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;z-index:10;font-weight:600;color:var(--color-primary);border-radius:8px;backdrop-filter:blur(2px);';
        wrapper.appendChild(loader);
      }
      loader.innerText = text || 'Đang tải dữ liệu...';
      loader.style.display = 'flex';
    };

    wrapper.hideLoading = function () {
      var loader = wrapper.querySelector('.table-loader');
      if (loader) loader.style.display = 'none';
    };

    return wrapper;
  }

  /**
   * Tạo Datagrid Table động từ dữ liệu SQL
   * @param {Array} data - Dữ liệu thô từ API
   * @param {Object} dictionary - Map tên cột { 'Makh': 'Mã KH' }
   * @param {Object} options - { onSort, currentSort, actionRenderers }
   */
  function createDynamic(data, dictionary, options) {
    dictionary = dictionary || {};
    options = options || {};

    var dynamicHeaders = [];
    var dynamicColumns = [];

    // Lấy keys: ưu tiên lọc theo dictionary nếu dictionary không rỗng để chỉ hiện các cột được cấu hình.
    // Nếu dictionary rỗng hoặc không khớp khóa nào, ta mới lấy toàn bộ keys từ data.
    var keys = [];
    var hasDictionary = dictionary && Object.keys(dictionary).length > 0;
    if (hasDictionary) {
      var dataKeys = (data && data.length > 0) ? Object.keys(data[0]) : [];
      Object.keys(dictionary).forEach(function (key) {
        if (dataKeys.length === 0 || dataKeys.indexOf(key) >= 0) {
          keys.push(key);
        }
      });
      if (keys.length === 0) {
        keys = dataKeys;
      }
    } else if (data && data.length > 0) {
      keys = Object.keys(data[0]);
    }

    if (keys.length > 0) {
      keys.forEach(function (key) {
        if (key === 'id' || key === 'Id') return;
        if (key.startsWith('_')) return;

        var headerLabel = dictionary[key] || key;
        var header = { label: headerLabel, sortable: true, field: key };
        var col = { field: key };

        // Default render: JSON-aware or Tooltip
        col.render = function (v) {
          if (v == null || v === '') return '';
          var str = String(v).trim();
          if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
            try {
              var parsed = JSON.parse(str);
              if (parsed && typeof parsed === 'object') {
                return (function renderParsedJson(parsed) {
                  if (Array.isArray(parsed)) {
                    if (parsed.length === 0) return '<span style="color: var(--color-text-muted, #94a3b8); font-style: italic;">Trống</span>';

                    // Check if it's a generic schedule (time + content)
                    var isSchedule = parsed.some(function (item) {
                      return item && (item.BatDau !== undefined || item.KetThuc !== undefined || item.NoiDung !== undefined);
                    });

                    // Check if it's payment (STT/SoTien/Ngay/NoiDung)
                    var isPayment = parsed.some(function (item) {
                      return item && (item.STT !== undefined || item.SoTien !== undefined || item.Ngay !== undefined || item.NoiDung !== undefined);
                    });

                    if (isSchedule) {
                      var html = '<div class="json-schedule-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; padding: 2px 0;">';
                      parsed.forEach(function (item) {
                        var timeStr = (item.BatDau || '') + (item.KetThuc ? ' - ' + item.KetThuc : '');
                        var timeBadge = timeStr ? '<span style="background: rgba(16, 185, 129, 0.18); color: var(--color-success, #10b981); border-radius: 4px; padding: 1px 4px; font-weight: 600; margin-right: 4px; white-space: nowrap;">' + timeStr + '</span>' : '';
                        var contentStr = item.NoiDung ? '<span style="color: var(--color-text, inherit); font-weight: 500;">' + item.NoiDung + '</span>' : '';
                        html += '<div class="schedule-row" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">' + timeBadge + contentStr + '</div>';
                      });
                      html += '</div>';
                      return html;
                    }

                    if (isPayment) {
                      var html = '<div class="json-payment-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; padding: 2px 0;">';
                      parsed.forEach(function (item) {
                        var sttStr = item.STT ? '<span style="background: rgba(124, 58, 237, 0.18); color: var(--color-secondary, #7c3aed); border-radius: 4px; padding: 1px 4px; font-weight: 600; margin-right: 4px;">Đợt ' + item.STT + '</span>' : '';
                        var moneyStr = item.SoTien ? '<span style="color: var(--color-danger, #ef4444); font-weight: 600; margin-right: 4px;">' + item.SoTien + '</span>' : '';
                        var dateStr = item.Ngay ? '<span style="color: var(--color-text-secondary); margin-right: 4px;">(' + item.Ngay + ')</span>' : '';
                        var contentStr = item.NoiDung ? '<span style="color: var(--color-text, inherit); font-style: italic;">' + item.NoiDung + '</span>' : '';
                        html += '<div class="payment-row" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">' + sttStr + moneyStr + dateStr + contentStr + '</div>';
                      });
                      html += '</div>';
                      return html;
                    }

                    // Generic simple array
                    var isSimpleArray = parsed.every(function (item) {
                      return typeof item !== 'object';
                    });
                    if (isSimpleArray) {
                      return parsed.join(', ');
                    }

                    // Generic complex array
                    var html = '<div class="json-generic-table" style="font-size: 11px; display: flex; flex-direction: column; gap: 2px; color: var(--color-text, inherit);">';
                    parsed.forEach(function (item) {
                      var itemHtml = [];
                      for (var k in item) {
                        if (item.hasOwnProperty(k)) {
                          itemHtml.push('<strong>' + k + ':</strong> ' + item[k]);
                        }
                      }
                      html += '<div style="border-bottom: 1px dashed var(--color-border); padding-bottom: 2px;">' + itemHtml.join(' | ') + '</div>';
                    });
                    html += '</div>';
                    return html;
                  } else {
                    // Single object
                    var html = '<div class="json-generic-object" style="font-size: 11px; display: flex; flex-direction: column; gap: 2px;">';
                    for (var k in parsed) {
                      if (parsed.hasOwnProperty(k)) {
                        html += '<div><strong>' + k + ':</strong> ' + parsed[k] + '</div>';
                      }
                    }
                    html += '</div>';
                    return html;
                  }
                })(parsed);
              }
            } catch (e) {
              // Ignore and fallback
            }
          }
          var safeVal = String(v).replace(/"/g, '&quot;');
          return '<span title="' + safeVal + '">' + safeVal + '</span>';
        };

        // Heuristic Width
        var keyLower = key.toLowerCase();
        if (keyLower.indexOf('dt') >= 0 || keyLower.indexOf('dienthoai') >= 0 || keyLower.indexOf('date') >= 0 || keyLower.indexOf('user') >= 0 || keyLower.indexOf('ma') === 0) {
          header.width = '120px';
        } else if (keyLower.indexOf('so') === 0 || keyLower.indexOf('sl') === 0 || keyLower.indexOf('số') === 0) {
          header.width = '90px';
        } else if (keyLower.indexOf('mail') >= 0) {
          header.width = '160px';
        } else if (keyLower.indexOf('diachi') >= 0 || keyLower.indexOf('địa chỉ') >= 0) {
          header.width = '200px';
        } else {
          header.width = '150px';
        }

        // Heuristic Format
        if ((keyLower.indexOf('date') >= 0 || keyLower.indexOf('ngày') >= 0 || keyLower.indexOf('ngay') >= 0) && keyLower.indexOf('songay') === -1 && keyLower.indexOf('so_ngay') === -1) {
          header.align = 'center';
          col.align = 'center';
          col.render = function (v) { return typeof FormatUtils !== 'undefined' ? FormatUtils.date(v) : v; };
        }

        // Custom renderer (nếu truyền vào)
        if (options.actionRenderers && options.actionRenderers[key]) {
          var customRender = options.actionRenderers[key];
          col.render = function (v, row) { return customRender(v, row, key); };
        } else if (options.actionRenderers && options.actionRenderers[headerLabel]) {
          // Hoặc kiểm tra theo label tiếng Việt nếu dev truyền key là label
          var customRenderLabel = options.actionRenderers[headerLabel];
          col.render = function (v, row) { return customRenderLabel(v, row, key); };
        }

        dynamicHeaders.push(header);
        dynamicColumns.push(col);
      });
    }

    var tableConfig = {
      headers: dynamicHeaders,
      columns: dynamicColumns,
      data: data,
      currentSort: options.currentSort,
      onSort: options.onSort,
      className: options.className,
      // Mặc định sticky 2 cột đầu (Mã NV + Họ tên), có thể override qua options.stickyColumns
      stickyColumns: (typeof options.stickyColumns === 'number') ? options.stickyColumns : 2
    };

    return create(tableConfig);
  }

  // =========================================================================
  // GLOBAL ADVANCED FEATURES (Drag Select & Context Menu)
  // Tự động áp dụng cho TẤT CẢ các thẻ table trong toàn hệ thống
  // =========================================================================
  (function setupGlobalTableFeatures() {
    if (typeof window === 'undefined') return;

    function showContextMenuForEvent(e, triggerTd, triggerTr) {
      if (typeof UIContextMenu === 'undefined') return;
      var getRowText = function (rowEl) {
        if (!rowEl) return '';
        var cells = rowEl.querySelectorAll('td');
        var textArr = [];
        for (var i = 0; i < cells.length; i++) {
          var clone = cells[i].cloneNode(true);
          var btns = clone.querySelectorAll('button, .btn, .material-symbols-outlined, .material-icons');
          btns.forEach(function (b) { b.remove(); });
          var text = clone.innerText.trim();
          if (text) textArr.push(text);
        }
        return textArr.join(' | ');
      };

      var tbody = triggerTr ? triggerTr.closest('tbody') : null;
      var activeRows = tbody ? Array.from(tbody.querySelectorAll('tr.active')) : [];
      var isMultiple = activeRows.length > 1;

      var menuItems = [];

      if (triggerTd) {
        menuItems.push({
          icon: 'content_copy',
          label: 'Copy ô (Cell)',
          onClick: function () {
            navigator.clipboard.writeText(triggerTd.innerText.trim());
            if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ô', 'success');
          }
        });
      }

      if (isMultiple) {
        menuItems.push({
          icon: 'library_books',
          label: 'Copy ' + activeRows.length + ' dòng đã chọn',
          onClick: function () {
            var allText = activeRows.map(function (r) { return getRowText(r); }).join('\n');
            navigator.clipboard.writeText(allText);
            if (typeof UIToast !== 'undefined') UIToast.show('Đã copy ' + activeRows.length + ' dòng', 'success');
          }
        });
      }

      if (triggerTr && !isMultiple) {
        menuItems.push({
          icon: 'file_copy',
          label: 'Copy dòng (Row)',
          onClick: function () {
            if (triggerTr) {
              navigator.clipboard.writeText(getRowText(triggerTr));
              if (typeof UIToast !== 'undefined') UIToast.show('Đã copy dữ liệu dòng', 'success');
            }
          }
        });
      }

      menuItems.push({
        icon: 'edit_note',
        label: 'Sửa tiêu đề & định dạng cột...',
        onClick: function () {
          var targetTh = e.target ? e.target.closest('th') : null;
          if (!targetTh && triggerTd && triggerTr) {
            var idx = Array.from(triggerTr.children).indexOf(triggerTd);
            var thead = triggerTr.closest('table') ? triggerTr.closest('table').querySelector('thead') : null;
            if (thead && thead.rows[0] && idx >= 0) {
              targetTh = thead.rows[0].children[idx];
            }
          }
          var caption = targetTh ? targetTh.innerText.trim() : (triggerTd ? triggerTd.innerText.trim() : '');
          var fieldName = targetTh ? (targetTh.dataset.field || caption) : caption;
          if (typeof ColumnCaptionEditorModal !== 'undefined') {
              var colDef = {};
              if (window.tabulatorInstance && fieldName) {
                try {
                  var c = window.tabulatorInstance.getColumn(fieldName);
                  if (c && typeof c.getDefinition === 'function') colDef = c.getDefinition() || {};
                } catch (err) {}
              }
              ColumnCaptionEditorModal.show({
                formName: window._currentFormName || '',
                fieldName: fieldName,
                captionVN: colDef.title || caption,
                captionEN: colDef.captionEN || '',
                captionCH: colDef.captionCH || '',
                alignX: colDef.alignX || colDef.align || colDef.hozAlign || '',
                formatId: colDef.formatId || colDef.FormatID || '',
                minWidth: colDef.minWidth || 0,
                maxWidth: colDef.maxWidth || 0,
                onSuccess: function (updated) {
                  if (!updated) return;
                  if (typeof h === 'object') {
                    if (updated.captionVN) h.label = h.title = h.captionVN = updated.captionVN;
                    if (updated.captionEN !== undefined) h.captionEN = updated.captionEN;
                    if (updated.captionCH !== undefined) h.captionCH = updated.captionCH;
                    if (updated.alignX !== undefined) h.alignX = h.align = h.hozAlign = updated.alignX;
                    if (updated.formatId !== undefined) h.formatId = h.FormatID = updated.formatId;
                    if (updated.minWidth !== undefined) h.minWidth = updated.minWidth;
                    if (updated.maxWidth !== undefined) h.maxWidth = updated.maxWidth;
                  }
                  if (colDef) {
                    if (updated.captionVN) colDef.title = colDef.captionVN = updated.captionVN;
                    if (updated.captionEN !== undefined) colDef.captionEN = updated.captionEN;
                    if (updated.captionCH !== undefined) colDef.captionCH = updated.captionCH;
                    if (updated.alignX !== undefined) colDef.alignX = colDef.align = colDef.hozAlign = updated.alignX;
                    if (updated.formatId !== undefined) colDef.formatId = colDef.FormatID = updated.formatId;
                    if (updated.minWidth !== undefined) colDef.minWidth = updated.minWidth;
                    if (updated.maxWidth !== undefined) colDef.maxWidth = updated.maxWidth;
                  }
                }
              });
          }
        }
      });

      UIContextMenu.show(e, menuItems);
    }

    // 1. GLOBAL CONTEXT MENU
    document.addEventListener('contextmenu', function (e) {
      if ((typeof isDragSelecting !== 'undefined' && isDragSelecting) || (typeof lastDragEndTime !== 'undefined' && Date.now() - lastDragEndTime < 500)) {
        e.preventDefault();
        return;
      }

      var table = e.target.closest('table');
      if (!table || table.classList.contains('no-advanced-features')) return;

      var td = e.target.closest('td');
      var tr = e.target.closest('tr');
      if (!td && !tr) return;
      if (td && (td.querySelector('.btn') || td.querySelector('button'))) return;

      e.preventDefault();
      showContextMenuForEvent(e, td, tr);
    });

    // 2. GLOBAL DRAG SELECT
    var isDragSelecting = false;
    var dragAction = null;
    var dragTimer = null;
    var lastDragRowIdx = -1;
    var lastPointerX = -1;
    var lastPointerY = -1;
    var autoScrollFrame = null;
    var activeTbody = null;
    var lastDragEndTime = 0;

    document.addEventListener('touchmove', function (e) {
      if (isDragSelecting) e.preventDefault();
    }, { passive: false });

    function toggleGlobalRow(tr, tbody, forceAction) {
      var isActive = tr.classList.contains('active');
      var changed = false;
      if (forceAction === 'add' && !isActive) {
        tr.classList.add('active');
        changed = true;
      } else if (forceAction === 'remove' && isActive) {
        tr.classList.remove('active');
        changed = true;
      }

      if (changed) {
        var checkbox = tr.querySelector('.df-row-checkbox');
        if (checkbox) checkbox.checked = tr.classList.contains('active');

        var idx = Array.from(tbody.children).indexOf(tr);
        // Dispatch custom event for frameworks (like DynamicFormEngine) to catch
        tbody.dispatchEvent(new CustomEvent('rowSelectionToggled', {
          bubbles: true,
          detail: { tr: tr, rowIndex: idx, action: forceAction }
        }));
      }
    }

    function updateGlobalSelectionAtPoint(x, y) {
      var el = document.elementFromPoint(x, y);
      if (el && activeTbody) {
        var moveTr = el.closest('tr');
        if (moveTr && moveTr.parentNode === activeTbody) {
          var moveIdx = Array.from(activeTbody.children).indexOf(moveTr);
          if (moveIdx !== lastDragRowIdx) {
            toggleGlobalRow(moveTr, activeTbody, dragAction);
            lastDragRowIdx = moveIdx;
          }
        }
      }
    }

    function handleGlobalAutoScroll() {
      if (!isDragSelecting) return;
      var scrollArea = document.querySelector('.app-content') || document.documentElement;
      var rect = scrollArea.getBoundingClientRect ? scrollArea.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      var edgeSize = 80;
      var scrollAmount = 0;

      if (lastPointerY > 0 && lastPointerY < rect.top + edgeSize) {
        scrollAmount = -15;
      } else if (lastPointerY > 0 && lastPointerY > rect.bottom - edgeSize) {
        scrollAmount = 15;
      }

      if (scrollAmount !== 0) {
        scrollArea.scrollTop += scrollAmount;
        updateGlobalSelectionAtPoint(lastPointerX, lastPointerY);
      }
      autoScrollFrame = requestAnimationFrame(handleGlobalAutoScroll);
    }

    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // Không vuốt chọn bằng cảm ứng để nhường cho cuộn tự nhiên trên mobile

      var tr = e.target.closest('tr');
      var table = e.target.closest('table');

      if (!table || table.classList.contains('no-advanced-features') || table.classList.contains('no-drag-select')) return;
      if (!tr || tr.closest('thead') || tr.children.length <= 1 || e.button !== 0 || e.target.closest('.btn') || e.target.closest('button')) return;

      var tbody = tr.closest('tbody');
      if (!tbody) return;

      var startX = e.clientX, startY = e.clientY;
      var idx = Array.from(tbody.children).indexOf(tr);

      lastDragRowIdx = idx;
      activeTbody = tbody;
      isDragSelecting = false;

      dragTimer = setTimeout(function () {
        isDragSelecting = true;
        activeTbody.isDragSelectingFlag = true;
        var isActive = tr.classList.contains('active');
        dragAction = isActive ? 'remove' : 'add';

        document.body.style.userSelect = 'none';
        activeTbody.style.touchAction = 'none';

        if (navigator.vibrate) navigator.vibrate(50);

        lastPointerX = startX;
        lastPointerY = startY;
        autoScrollFrame = requestAnimationFrame(handleGlobalAutoScroll);

        toggleGlobalRow(tr, activeTbody, dragAction);
      }, 350);

      function onPointerMove(ev) {
        if (!isDragSelecting) {
          if (Math.abs(ev.clientX - startX) > 10 || Math.abs(ev.clientY - startY) > 10) {
            clearTimeout(dragTimer);
          }
        } else {
          ev.preventDefault();
          lastPointerX = ev.clientX;
          lastPointerY = ev.clientY;
          updateGlobalSelectionAtPoint(lastPointerX, lastPointerY);
        }
      }

      function onPointerUp(ev) {
        clearTimeout(dragTimer);
        if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
        document.body.style.userSelect = '';
        if (activeTbody) activeTbody.style.touchAction = '';

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);

        if (isDragSelecting) {
          lastDragEndTime = Date.now();
          var cachedTbody = activeTbody;
          var preventClick = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            document.removeEventListener('click', preventClick, true);
          };
          document.addEventListener('click', preventClick, true);
          setTimeout(function () {
            document.removeEventListener('click', preventClick, true);
            if (cachedTbody) cachedTbody.isDragSelectingFlag = false;
          }, 50);

          // Tự động bật menu copy sau khi kéo chọn xong (hoặc nhấn giữ lâu)
          if (tr) {
            // Chỉ hiển thị menu copy nếu thao tác vừa rồi không phải là bỏ chọn (hoặc vẫn còn dòng đang được chọn)
            var hasSelected = activeTbody && activeTbody.querySelectorAll('tr.active').length > 0;
            if (hasSelected) {
              // Fake event type thành contextmenu để UIContextMenu dùng tọa độ thay vì fallback
              var finalPageX = ev.pageX || (lastPointerX + window.scrollX);
              var finalPageY = ev.pageY || (lastPointerY + window.scrollY);
              var fakeEvent = {
                type: 'contextmenu',
                pageX: finalPageX,
                pageY: finalPageY,
                target: ev.target,
                preventDefault: function () { },
                stopPropagation: function () { }
              };
              showContextMenuForEvent(fakeEvent, tr.querySelector('td') || tr.children[0], tr);
            }
          }

          isDragSelecting = false;
        }
      }

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    });
  })();

  return {
    create: create,
    createDynamic: createDynamic
  };
})();
