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
    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper ' + (config.className || '');
    // Bỏ viền 2 bên
    wrapper.style.borderRadius = '0';
    wrapper.style.borderTop = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderBottom = '1px solid var(--color-border, #e2e8f0)';
    wrapper.style.borderLeft = 'none';
    wrapper.style.borderRight = 'none';
    wrapper.style.overflow = 'auto'; // Cho phép scroll ngang nếu bị tràn

    var table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = 'max-content'; // Chống kéo giãn, các cột sẽ nằm gần nhau
    table.style.whiteSpace = 'nowrap'; // Đảm bảo nội dung không bị rớt dòng làm cột bị giãn
    table.style.tableLayout = 'auto';

    // Tbody & Thead
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Ép style thu gọn khoảng cách (Compact Density)
    var styleDensity = document.createElement('style');
    styleDensity.innerHTML = `
      .table-wrapper .data-table th,
      .table-wrapper .data-table td {
         padding: 6px 10px !important;
         height: 36px !important;
         font-size: 13px !important;
      }
      @media (max-width: 768px) {
        .dynamic-grid-card .table-wrapper {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
        }
        .table-wrapper .data-table th:first-child,
        .table-wrapper .data-table td:first-child {
          padding-left: 16px !important;
        }
      }
    `;
    wrapper.appendChild(styleDensity);

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

              var val = row[col.field];
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
            row.forEach(function (cellStr) {
              var td = document.createElement('td');
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
          var labelText = h.label || h;
          if (typeof labelText === 'string') {
            labelText = labelText.replace(/\s*:\s*$/, '');
          }
          spanTxt.innerText = labelText;
          spanTxt.style.pointerEvents = 'none'; // Prevent child interference
          th.appendChild(spanTxt);

          if (h.width) {
            th.style.width = h.width;
            th.style.minWidth = h.width; // Ép cứng chiều rộng ban đầu
          }
          if (h.align) th.style.textAlign = h.align;

          // --- COLUMN RESIZING LOGIC ---
          th.style.position = 'relative'; // Cần thiết để neo resizer

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

    // Lấy keys từ data hoặc orderedFields, nếu data rỗng thì lấy từ dictionary
    var keys = [];
    if (options.orderedFields && options.orderedFields.length > 0) {
      var rowKeys = data && data.length > 0 ? Object.keys(data[0]) : [];
      keys = options.orderedFields.filter(function (k) {
        return rowKeys.indexOf(k) >= 0 || (dictionary && dictionary[k] !== undefined);
      });
    } else if (data && data.length > 0) {
      keys = Object.keys(data[0]);
    } else if (dictionary && Object.keys(dictionary).length > 0) {
      keys = Object.keys(dictionary);
    }


    if (keys.length > 0) {
      keys.forEach(function (key) {
        if (key === 'id' || key === 'Id') return;
        if (key.startsWith('_')) return;

        var headerLabel = dictionary[key] || key;
        var header = { label: headerLabel, sortable: true, field: key };
        var col = { field: key };

        // Default render: Tooltip
        col.render = function (v) {
          if (v == null || v === '') return '';
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
        if (keyLower.indexOf('date') >= 0 || keyLower.indexOf('ngày') >= 0) {
          header.align = 'center';
          col.align = 'center';
          col.render = function (v) { return typeof FormatUtils !== 'undefined' ? FormatUtils.date(v) : v; };
        } else if (keyLower.startsWith('is') || keyLower.indexOf('trangthai') >= 0 || keyLower.indexOf('trạng thái') >= 0) {
          header.align = 'center';
          col.align = 'center';
        } else if (keyLower.indexOf('tien') >= 0 || keyLower.indexOf('tiền') >= 0 || keyLower.indexOf('luong') >= 0 || keyLower.indexOf('lương') >= 0 || keyLower.indexOf('mucdong') >= 0 || keyLower.indexOf('mức đóng') >= 0 || keyLower.indexOf('sotien') >= 0) {
          header.align = 'right';
          col.align = 'right';
        }

        // Custom renderer (nếu truyền vào)
        if (options.actionRenderers && options.actionRenderers[key]) {
          var customRender = options.actionRenderers[key];
          col.render = function (v) { return customRender(v, key); };
        } else if (options.actionRenderers && options.actionRenderers[headerLabel]) {
          // Hoặc kiểm tra theo label tiếng Việt nếu dev truyền key là label
          var customRenderLabel = options.actionRenderers[headerLabel];
          col.render = function (v) { return customRenderLabel(v, key); };
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
      className: options.className
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
