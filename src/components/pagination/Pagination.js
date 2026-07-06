/**
 * Pagination Component
 * Trình phân trang cho DataGrid
 */
var Pagination = (function () {
  /**
   * Tạo component phân trang
   * @param {Object} options - { totalItems, itemsPerPage, currentPage, onPageChange }
   * @returns {HTMLElement} wrapper
   */
  function create(options) {
    var wrapper = document.createElement('div');
    wrapper.className = 'pagination-wrapper datagrid-pager';

    var totalPages = Math.ceil(options.totalItems / (options.itemsPerPage || 10));
    var currentPage = options.currentPage || 1;

    var startItem = (currentPage - 1) * options.itemsPerPage + 1;
    var endItem = Math.min(currentPage * options.itemsPerPage, options.totalItems);
    if (options.totalItems === 0) { startItem = 0; endItem = 0; }

    // 1. Cụm Page Size Dropdown
    var sizeSelector = document.createElement('div');
    sizeSelector.className = 'pager-size-selector';
    var select = document.createElement('select');
    var pageSizes = [10, 15, 20, 50, 100, 200, 500, 1000, { label: "Tất cả", value: 100000 }];
    pageSizes.forEach(function (valObj) {
      var val = typeof valObj === 'object' ? valObj.value : valObj;
      var label = typeof valObj === 'object' ? valObj.label : val;
      var opt = document.createElement('option');
      opt.value = val;
      opt.text = label;
      if (val === options.itemsPerPage || (val === 100000 && options.itemsPerPage >= 100000)) {
         opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.onchange = function (e) {
      if (typeof options.onLimitChange === 'function') {
        options.onLimitChange(parseInt(e.target.value, 10));
      }
    };
    sizeSelector.appendChild(select);

    // 2. Cụm Điều Hướng (Navigation)
    var controls = document.createElement('div');
    controls.className = 'pager-controls';

    function createBtn(icon, disabled, onClick) {
      var btn = document.createElement('button');
      btn.className = 'pager-btn';
      btn.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
      btn.disabled = disabled;
      if (!disabled && typeof onClick === 'function') {
        btn.onclick = onClick;
      }
      return btn;
    }

    var btnFirst = createBtn('first_page', currentPage === 1, function () { options.onPageChange(1); });
    var btnPrev = createBtn('chevron_left', currentPage === 1, function () { options.onPageChange(currentPage - 1); });
    var btnNext = createBtn('chevron_right', currentPage === totalPages || totalPages === 0, function () { options.onPageChange(currentPage + 1); });
    var btnLast = createBtn('last_page', currentPage === totalPages || totalPages === 0, function () { options.onPageChange(totalPages); });
    var btnRefresh = createBtn('refresh', false, function () {
      if (typeof options.onRefresh === 'function') options.onRefresh();
      else if (typeof options.onPageChange === 'function') options.onPageChange(currentPage);
    });
    var btnCapture = createBtn('photo_camera', false, function () {
      if (typeof ScreenCapture !== 'undefined') {
        ScreenCapture.start();
      } else {
        if (typeof UIToast !== 'undefined') UIToast.show('Công cụ chụp ảnh chưa sẵn sàng!', 'warning');
      }
    });
    btnCapture.title = "Chụp vùng màn hình";
    btnCapture.style.color = "var(--color-primary)";
    btnCapture.classList.add('pager-btn-capture');

    var pageInputWrapper = document.createElement('span');
    pageInputWrapper.className = 'pager-input-wrapper';
    pageInputWrapper.innerHTML = 'Trang ';
    var pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.className = 'pager-input';
    pageInput.value = currentPage;
    pageInput.min = 1;
    pageInput.max = totalPages || 1;
    pageInput.onkeydown = function (e) {
      if (e.key === 'Enter') {
        var p = parseInt(pageInput.value, 10);
        if (p >= 1 && p <= totalPages && p !== currentPage) {
          options.onPageChange(p);
        } else {
          pageInput.value = currentPage; // reset if invalid
        }
      }
    };
    pageInputWrapper.appendChild(pageInput);
    pageInputWrapper.appendChild(document.createTextNode(` / ${totalPages}`));

    // Vách ngăn
    function createSeparator() {
      var sep = document.createElement('div');
      sep.className = 'pager-separator';
      return sep;
    }

    controls.appendChild(btnFirst);
    controls.appendChild(btnPrev);
    controls.appendChild(createSeparator());
    controls.appendChild(pageInputWrapper);
    controls.appendChild(createSeparator());
    controls.appendChild(btnNext);
    controls.appendChild(btnLast);
    controls.appendChild(createSeparator());
    controls.appendChild(btnRefresh);
    controls.appendChild(btnCapture);

    // 3. Cụm Info
    var info = document.createElement('div');
    info.className = 'pager-info';
    info.innerText = `Hiển thị ${startItem} - ${endItem} / ${options.totalItems} dòng`;

    // Lắp ráp
    wrapper.appendChild(sizeSelector);
    wrapper.appendChild(createSeparator());
    wrapper.appendChild(controls);
    wrapper.appendChild(info);

    return wrapper;
  }

  return {
    create: create
  };
})();
