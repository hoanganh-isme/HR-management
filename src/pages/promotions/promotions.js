/**
 * Module Chương Trình Ưu Đãi / Combo (Promotions Page)
 * Route: #/promotions | Module: DanhMuc
 * HTML Template: src/pages/promotions/promotions.html
 */
var PromotionsPage = (function () {
  var _benefitRowCount = 2; // Số dòng ưu đãi hiện có

  function render($container) {
    fetch('./src/pages/promotions/promotions.html?v=' + Date.now())
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        if (typeof DynamicFormEngine === 'undefined') {
          var script = document.createElement('script');
          script.src = './src/js/core/DynamicFormEngine.js?v=' + Date.now();
          script.onload = function() { _initEngine(); };
          document.body.appendChild(script);
        } else {
          _initEngine();
        }
      });
  }

  function _initEngine() {
    var listView = document.getElementById('promo-list-view');
    if (!listView) return;

    // Cấu hình Nút bấm Custom (Chèn đè lên thư viện DynamicFormEngine)
    if (!window.FormActionPlugins) window.FormActionPlugins = [];
    window.FormActionPlugins = window.FormActionPlugins.filter(function(p) { return p.id !== 'promo_plugin'; });
    window.FormActionPlugins.push({
      id: 'promo_plugin',
      getExtraButtons: function(formName, getSelected) {
        if (formName !== 'frmUuDai') return [];
        return [
          {
            text: 'Thêm Ưu Đãi', icon: 'add_circle', type: 'tool',
            onClick: function() { _openPanel(true); }
          },
          {
            text: 'Xem / Sửa', icon: 'edit', type: 'tool',
            onClick: function() {
              var selected = getSelected();
              if (!selected || selected.length === 0) {
                if(typeof UIToast!=='undefined') UIToast.show('Vui lòng chọn 1 mục để xem/sửa!', 'warning');
                return;
              }
              _openPanel(false, selected[0]);
            }
          }
        ];
      }
    });

    var MODULE_CONFIG = {
      FormName: 'frmUuDai', 
      PrimaryKey: 'Khuyenmaiid',
      RowNameField: 'Ghichu',
      ApiSearch: (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS.ROUTER) ? API_CONFIG.ENDPOINTS.ROUTER : '/api/API_Gateway_Router',
      ApiSave: (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS.ROUTER) ? API_CONFIG.ENDPOINTS.ROUTER : '/api/API_Gateway_Router',
      ApiDelete: (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS.ROUTER) ? API_CONFIG.ENDPOINTS.ROUTER : '/api/API_Gateway_Router',
      SearchPlaceholder: 'Tìm kiếm ưu đãi...',
      HideAddBtn: true, // Ẩn mặc định để dùng nút Custom bên trên
      HideEditBtn: true, // Ẩn mặc định
      HideDeleteBtn: false // Vẫn xài nút Xóa tự động
    };

    DynamicFormEngine.render(listView, MODULE_CONFIG);
    _bindEvents();
  }

  // ── Mở / Đóng Panel ──────────────────────────────────────────────────
  function _openPanel(isNew, data) {
    var overlay = document.getElementById('promo-form-overlay');
    var panel   = document.getElementById('promo-form-panel');
    var subtitle = document.getElementById('promo-panel-subtitle');
    
    if (isNew) {
      if(subtitle) subtitle.textContent = 'Thêm gói ưu đãi mới';
      // Reset form
      document.getElementById('promo-inp-name').value = '';
    } else {
      if(subtitle) subtitle.textContent = 'Chỉnh sửa gói ưu đãi: ' + data.Khuyenmaiid;
      // Đổ dữ liệu
      document.getElementById('promo-inp-name').value = data.Ghichu || '';
      // TODO: Gắn API tải dữ liệu tbKhuyenmaict vào đây
    }

    if (overlay) overlay.classList.add('active');
    if (panel)   panel.style.right = '0';
  }

  function _closePanel() {
    var overlay = document.getElementById('promo-form-overlay');
    var panel   = document.getElementById('promo-form-panel');
    if (overlay) overlay.classList.remove('active');
    if (panel)   panel.style.right = '-840px';
  }

  function _addBenefitRow() {
    _benefitRowCount++;
    var tbody = document.getElementById('promo-benefits-body');
    if (!tbody) return;
    var tr = document.createElement('tr');
    tr.setAttribute('data-row', _benefitRowCount);
    tr.innerHTML =
      '<td style="color: var(--color-text-secondary); font-size: 13px;">' + _benefitRowCount + '</td>' +
      '<td><input type="text" class="ui-input w-100" placeholder="Tên ưu đãi..." style="border: none; background: transparent;"></td>' +
      '<td><input type="text" class="ui-input w-100" placeholder="Số lượng / đơn vị" style="border: none; background: transparent;"></td>' +
      '<td><input type="number" class="ui-input w-100" placeholder="0" style="border: none; background: transparent;" min="0"></td>' +
      '<td>' + (typeof UIButton !== 'undefined' ? UIButton.createHTML({ icon: 'delete', type: 'tool', className: 'btn-remove-benefit', style: 'color: var(--color-danger);', iconStyle: 'font-size: 18px;' }) : '<button class="btn-remove-benefit text-danger">Xóa</button>') + '</td>';
    tbody.appendChild(tr);
    _bindRemoveBenefit(tr.querySelector('.btn-remove-benefit'));
  }

  function _bindRemoveBenefit(btn) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      if (row) row.remove();
      _renumberRows();
    });
  }

  function _renumberRows() {
    var rows = document.querySelectorAll('#promo-benefits-body tr');
    rows.forEach(function (row, idx) {
      var firstTd = row.querySelector('td:first-child');
      if (firstTd) firstTd.textContent = idx + 1;
    });
    _benefitRowCount = rows.length;
  }

  function _bindEvents() {
    var overlay    = document.getElementById('promo-form-overlay');
    var btnClose   = document.getElementById('btn-close-promo-form');
    var btnCancel  = document.getElementById('btn-cancel-promo-form');
    var btnSave    = document.getElementById('btn-save-promo');
    var btnAddRow  = document.getElementById('btn-add-benefit');

    if (btnClose)  btnClose.addEventListener('click', _closePanel);
    if (btnCancel) btnCancel.addEventListener('click', _closePanel);
    if (overlay)   overlay.addEventListener('click', _closePanel);

    if (btnAddRow) btnAddRow.addEventListener('click', _addBenefitRow);

    document.querySelectorAll('.btn-remove-benefit').forEach(function (btn) {
      _bindRemoveBenefit(btn);
    });

    if (btnSave) {
      btnSave.addEventListener('click', function () {
        if(typeof UIToast!=='undefined') UIToast.show('Sẽ kết nối API lưu bảng Cha và bảng Con sau!', 'info');
        _closePanel();
      });
    }
  }

  return { render: render };
})();
