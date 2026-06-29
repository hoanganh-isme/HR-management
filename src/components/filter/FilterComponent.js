/**
 * Filter Component
 * Thanh công cụ lọc dữ liệu
 */
var FilterComponent = (function () {
  /**
   * Tạo component bộ lọc đè lên UI (Overlay Panel gắn vào document.body để chống vỡ layout)
   */
  function create(filters, onSearch) {
    // Xóa các panel lọc cũ tránh bị trùng lặp ID phần tử trên DOM khi chuyển trang SPA
    document.querySelectorAll('.filter-overlay-panel').forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll('.filter-backdrop').forEach(function (el) {
      el.remove();
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'filter-backdrop';
    backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 999998; display: none; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);';
    document.body.appendChild(backdrop);


    // 1. Tạo Panel thực sự và gắn thẳng vào body (Tránh bị cắt bởi thẻ cha có overflow: hidden hoặc transform)
    var wrapper = document.createElement('div');
    wrapper.className = 'filter-overlay-panel';
    // Chỉnh lại bóng đổ (box-shadow) mỏng, mịn và sang trọng hơn
    wrapper.style.cssText = 'position: fixed; left: -9999px; top: -9999px; z-index: 999999; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 12px); box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05); padding: 20px; min-width: 250px; max-width: calc(100vw - 20px); display: none; flex-direction: column; gap: 16px; opacity: 0; transform: translateY(-10px); transition: opacity 0.2s ease, transform 0.2s ease;';
    document.body.appendChild(wrapper);

    // Tiêu đề popup
    var title = document.createElement('div');
    title.innerText = 'Lọc dữ liệu';
    title.style.cssText = 'font-size: 16px; font-weight: 600; color: var(--color-text, #1e293b); margin: 0; padding-bottom: 12px; border-bottom: 1px solid var(--color-border, #f1f5f9);';
    wrapper.appendChild(title);

    // Grid Container cho Filters
    var gridContainer = document.createElement('div');
    // Dùng CSS class để tự động responsive (1 cột trên mobile, 2 cột trên desktop)
    gridContainer.className = 'filter-grid' + (filters.length > 2 ? ' multi-col' : '');
    gridContainer.style.cssText = 'display: grid; gap: 16px;';
    wrapper.appendChild(gridContainer);

    var inputs = {};

    filters.forEach(function (f) {
      var controlWrapper;
      var config = { id: f.id, label: f.label, placeholder: f.placeholder };

      if (f.type === 'select') {
        if (f.dataSource) {
          controlWrapper = document.createElement('div');
          controlWrapper.className = 'form-group';

          if (config.label) {
            var lbl = document.createElement('label');
            lbl.innerText = config.label;
            controlWrapper.appendChild(lbl);
          }

          var hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.id = f.id;
          hiddenInput.name = f.id;

          if (typeof window !== 'undefined' && window.currentFilters && window.currentFilters[f.id] !== undefined) {
            hiddenInput.value = window.currentFilters[f.id];
          } else {
            hiddenInput.value = '';
          }
          controlWrapper.appendChild(hiddenInput);

          var comboLoading = UIControls.createDataComboBox({ placeholder: 'Đang tải...' });
          controlWrapper.appendChild(comboLoading);

          var collectedOptions = [];
          var rebuildTimeout = null;

          var valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

          function rebuildCombo() {
            var comboData = collectedOptions.map(function (opt) {
              return [opt.value, opt.label];
            });

            var newCombo = UIControls.createDataComboBox({
              placeholder: f.placeholder || '-- Tất cả --',
              headers: ['Mã', 'Tên'],
              data: comboData,
              colFilterIndex: 1,
              onSelect: function (r) {
                valueDescriptor.set.call(hiddenInput, r[0]);
              },
              onChange: function (val) {
                valueDescriptor.set.call(hiddenInput, val);
              }
            });

            var currentCombo = controlWrapper.querySelector('.combo-box-container');
            if (currentCombo) {
              controlWrapper.replaceChild(newCombo, currentCombo);
            } else {
              var currentLoading = controlWrapper.querySelector('.combo-box-container') || controlWrapper.lastChild;
              if (currentLoading && currentLoading !== hiddenInput && currentLoading !== controlWrapper.querySelector('label')) {
                controlWrapper.replaceChild(newCombo, currentLoading);
              } else {
                controlWrapper.appendChild(newCombo);
              }
            }

            var currentVal = valueDescriptor.get.call(hiddenInput);
            var matched = comboData.find(function (r) { return r[0] == currentVal; });
            var displayInput = newCombo.querySelector('input.ui-input');
            if (matched && displayInput) {
              displayInput.value = matched[1];
            } else if (displayInput) {
              displayInput.value = currentVal;
            }
          }

          Object.defineProperty(hiddenInput, 'innerHTML', {
            get: function () { return ''; },
            set: function (val) { collectedOptions = []; }
          });

          hiddenInput.appendChild = function (node) {
            if (node.tagName === 'OPTION') {
              collectedOptions.push({ value: node.value, label: node.innerText });
              clearTimeout(rebuildTimeout);
              rebuildTimeout = setTimeout(rebuildCombo, 50);
            }
            return node;
          };

          Object.defineProperty(hiddenInput, 'value', {
            get: function () {
              return valueDescriptor.get.call(hiddenInput);
            },
            set: function (val) {
              valueDescriptor.set.call(hiddenInput, val);
              var displayInput = controlWrapper.querySelector('.combo-box-container input.ui-input');
              if (displayInput) {
                var displayVal = val;
                if (collectedOptions && collectedOptions.length > 0) {
                  var matched = collectedOptions.find(function (opt) { return opt.value == val; });
                  if (matched) displayVal = matched.label;
                }
                displayInput.value = displayVal;
              }
            }
          });

        } else {
          var opts = f.options ? f.options.map(function (o) { return { value: o.value !== undefined ? o.value : o, label: o.label || o }; }) : [];
          controlWrapper = UIInput.createSelect(config, opts);
        }
      } else if (f.type === 'date') {
        controlWrapper = UIInput.createDate(config);
      } else if (f.type === 'number') {
        controlWrapper = UIInput.createNumber(config);
      } else {
        controlWrapper = UIInput.createText(config);
      }

      controlWrapper.className = '';

      // Thiết kế lại Control theo dạng Stacked (Label nằm trên Input)
      controlWrapper.style.display = 'flex';
      controlWrapper.style.flexDirection = 'column';
      controlWrapper.style.alignItems = 'flex-start';
      controlWrapper.style.margin = '0';
      controlWrapper.style.gap = '6px';

      var lbl = controlWrapper.querySelector('label');
      if (lbl) {
        lbl.style.width = '100%';
        lbl.style.margin = '0';
        lbl.style.fontSize = '13px';
        lbl.style.fontWeight = '600';
        lbl.style.color = 'var(--color-text-secondary, #475569)';
        lbl.style.display = 'block';
        lbl.style.textAlign = 'left';
      }

      var inp = controlWrapper.querySelector('input, select');
      if (inp) {
        if (inp.type !== 'hidden') {
          inp.style.width = '100%';
          inp.style.minWidth = '0';
          inp.style.padding = '8px 12px';
          inp.style.fontSize = '14px';
          inp.style.border = '1px solid var(--color-border, #cbd5e1)';
          inp.style.background = 'var(--color-surface, #fff)';
          inp.style.color = 'var(--color-text, #1e293b)';
          inp.style.borderRadius = '6px';
          inp.style.outline = 'none';
          inp.style.transition = 'border-color 0.2s, box-shadow 0.2s';
          
          // Hiệu ứng focus
          inp.addEventListener('focus', function() {
              this.style.borderColor = 'var(--color-primary, #3b82f6)';
              this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          });
          inp.addEventListener('blur', function() {
              this.style.borderColor = 'var(--color-border, #cbd5e1)';
              this.style.boxShadow = 'none';
          });
        }

        if (typeof window !== 'undefined' && window.currentFilters && window.currentFilters[f.id] !== undefined) {
          inp.value = window.currentFilters[f.id];
        }

        inputs[f.id] = inp;
      }

      gridContainer.appendChild(controlWrapper);
    });

    // ── Lọc live khi gõ vào ô Từ khóa ──────────────────────────────────
    // Chỉ áp dụng cho ô có id='keyword'; các ô khác vẫn dùng nút bấm
    var keywordInput = inputs['keyword'];
    if (keywordInput && typeof onSearch === 'function') {
      var _liveTimer = null;
      keywordInput.addEventListener('input', function () {
        clearTimeout(_liveTimer);
        _liveTimer = setTimeout(function () {
          var values = {};
          for (var k in inputs) { values[k] = inputs[k].value; }
          onSearch(values);
          // KHÔNG đóng panel — để người dùng tiếp tục tinh chỉnh
        }, 400);
      });
      // Enter → tìm ngay không chờ debounce
      keywordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          clearTimeout(_liveTimer);
          var values = {};
          for (var k in inputs) { values[k] = inputs[k].value; }
          onSearch(values);
        }
      });
    }

    var actions = document.createElement('div');
    actions.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--color-border, #f1f5f9);';

    var btnReset = document.createElement('button');
    btnReset.className = 'btn btn-light';
    btnReset.innerText = 'Xóa bộ lọc';
    btnReset.style.cssText = 'font-weight: 500; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; padding: 8px 16px; background: var(--color-surface, #fff); color: var(--color-text-secondary, #64748b); cursor: pointer; transition: all 0.2s;';
    btnReset.onmouseover = function() { this.style.background = 'var(--color-surface-elevated, #f8fafc)'; this.style.color = 'var(--color-text, #0f172a)'; };
    btnReset.onmouseout = function() { this.style.background = 'var(--color-surface, #fff)'; this.style.color = 'var(--color-text-secondary, #64748b)'; };
    btnReset.onclick = function () {
      for (var key in inputs) {
        inputs[key].value = '';
        var wrapper = inputs[key].closest('.form-group') || inputs[key].parentElement;
        if (wrapper) {
          var displayInput = wrapper.querySelector('.combo-box-container input.ui-input');
          if (displayInput) {
            displayInput.value = '';
          }
        }
      }
      if (typeof onSearch === 'function') onSearch({});
    };

    var btnSearch = document.createElement('button');
    btnSearch.className = 'btn btn-primary d-flex align-items-center gap-2';
    btnSearch.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">search</span> Lọc dữ liệu';
    btnSearch.style.cssText = 'font-weight: 600; border-radius: 6px; padding: 8px 16px; border: none; cursor: pointer; transition: all 0.2s;';
    btnSearch.onclick = function () {
      if (typeof onSearch === 'function') {
        var values = {};
        for (var key in inputs) {
          values[key] = inputs[key].value;
        }
        console.log('[FilterComponent] Submitting values:', values);
        onSearch(values);

        // Đóng popup sau khi Lọc
        if (dummyContainer.parentElement) {
          dummyContainer.parentElement.style.display = 'none';
        }
      }
    };

    actions.appendChild(btnReset);
    actions.appendChild(btnSearch);
    wrapper.appendChild(actions);

    // Mũi tên (Caret) nối lên trên
    var arrowBorder = document.createElement('div');
    arrowBorder.style.cssText = 'position: absolute; top: -9px; left: 30px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 9px solid var(--color-border, #e2e8f0); pointer-events: none;';

    var arrowBg = document.createElement('div');
    arrowBg.style.cssText = 'position: absolute; top: -8px; left: 31px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid var(--color-surface, #fff); pointer-events: none;';

    wrapper.appendChild(arrowBorder);
    wrapper.appendChild(arrowBg);

    // 2. Dummy Container trả về cho hệ thống cũ (DynamicFormEngine) để không làm vỡ code cũ
    var dummyContainer = document.createElement('div');
    dummyContainer.style.display = 'none';

    // Căn chỉnh vị trí
    function alignPopup() {
      var btns = document.querySelectorAll('button');
      var btnLoc = null;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
          btnLoc = btns[i];
          break;
        }
      }

      if (btnLoc) {
        var btnRect = btnLoc.getBoundingClientRect();

        // Cập nhật vị trí Top
        wrapper.style.top = (btnRect.bottom + 10) + 'px';

        var centerBtnX = btnRect.left + (btnRect.width / 2);
        var panelWidth = wrapper.offsetWidth || 250;
        var panelLeft = centerBtnX - 40; // Default offset

        // Lấy chính xác chiều rộng hiển thị của trình duyệt (trừ đi scrollbar)
        var clientWidth = document.documentElement.clientWidth || window.innerWidth;

        // Chống tràn màn hình bên phải
        var maxLeft = clientWidth - panelWidth - 10; 
        if (panelLeft > maxLeft) panelLeft = maxLeft;

        // Chống tràn màn hình bên trái
        if (panelLeft < 10) panelLeft = 10;

        wrapper.style.left = panelLeft + 'px';

        // Căn mũi tên chĩa đúng tâm nút bấm
        var arrowPos = centerBtnX - panelLeft;
        
        // Chặn không cho mũi tên bay ra khỏi ranh giới của popup
        if (arrowPos < 20) arrowPos = 20;
        if (arrowPos > panelWidth - 20) arrowPos = panelWidth - 20;

        arrowBorder.style.left = (arrowPos - 9) + 'px';
        arrowBg.style.left = (arrowPos - 8) + 'px';
      }
    }

    // Theo dõi trạng thái của Container gốc để đồng bộ hiển thị
    setTimeout(function () {
      var parent = dummyContainer.parentElement; // Đây chính là #dynamic-filter-container
      if (parent) {
        // Tiêu diệt không gian của thẻ cha để không đẩy lưới xuống
        parent.style.marginBottom = '0';
        parent.style.padding = '0';
        parent.style.height = '0';

        var observer = new MutationObserver(function () {
          if (parent.style.display !== 'none') {
            backdrop.style.display = 'block';
            wrapper.style.display = 'flex';
            setTimeout(function() {
              backdrop.style.opacity = '1';
              wrapper.style.opacity = '1';
              wrapper.style.transform = 'translateY(0)';
            }, 10);
            alignPopup();

            // Focus vào ô đầu tiên
            var firstInput = wrapper.querySelector('input');
            if (firstInput) firstInput.focus();
          } else {
            backdrop.style.opacity = '0';
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateY(-10px)';
            setTimeout(function() {
              if (parent.style.display === 'none') {
                backdrop.style.display = 'none';
                wrapper.style.display = 'none';
              }
            }, 200);
          }
        });
        observer.observe(parent, { attributes: true, attributeFilter: ['style'] });
      }
    }, 50);

    // Auto dóng lại khi Resize
    window.addEventListener('resize', function () {
      if (wrapper.style.display !== 'none') alignPopup();
    });

    // Click bên ngoài thì tự đóng Panel
    document.addEventListener('click', function (e) {
      if (wrapper.style.display !== 'none') {
        var isInsidePanel = wrapper.contains(e.target);
        var isDropdownClick = e.target.closest('.data-dropdown-menu'); // allow clicking combobox dropdown
        var isClickOnButton = false;
        var clickedBtn = e.target.closest('button');
        if (clickedBtn && (clickedBtn.innerHTML.indexOf('filter_alt') !== -1 || clickedBtn.innerText.trim() === 'Lọc' || clickedBtn.getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu')) {
          isClickOnButton = true;
        }

        if (!isInsidePanel && !isClickOnButton && !isDropdownClick && dummyContainer.parentElement) {
          dummyContainer.parentElement.style.display = 'none'; // Ẩn cha đi thì Observer sẽ ẩn Panel
        }
      }
    });

    return dummyContainer; // Trả về thẻ rỗng để lừa DynamicFormEngine
  }

  return {
    create: create
  };
})();
