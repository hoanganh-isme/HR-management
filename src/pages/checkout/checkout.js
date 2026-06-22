/**
 * Màn hình Quyết toán tiệc
 * Dùng hoàn toàn các component có sẵn: UICard, UIBadge, UIButton, UIInput, UITable, KVTable, UITabs
 */
window.CheckoutPage = (function () {
  var $container;
  var _selectedContract = null;
  // Reference để cập nhật badge không cần re-render
  var _statusBadgeEl = null;
  // Reference KVTable để cập nhật giá trị
  var _kvRevTableEl = null;
  // Reference KVTable footer (cọc / phải thu)
  var _kvFooterTableEl = null;

  function render(containerElement) {
    if (!containerElement) return;
    $container = containerElement;

    if (typeof DynamicFormEngine === 'undefined') {
      var script = document.createElement('script');
      script.src = './src/js/core/DynamicFormEngine.js?v=' + Date.now();
      script.onload = function () { _doRender(); };
      document.body.appendChild(script);
    } else {
      _doRender();
    }
  }

  function _doRender() {
    Router.fetchTemplate('src/pages/checkout/checkout.html').then(function (html) {
      $container.innerHTML = html;

      var listContainer = $container.querySelector('#checkout-list-view');

      var tabListBtn = document.getElementById('checkout-tab-list-btn');
      var tabDetailBtn = document.getElementById('checkout-tab-detail-btn');
      if (tabListBtn) tabListBtn.addEventListener('click', function () { _switchTabUI('list'); });
      if (tabDetailBtn) tabDetailBtn.addEventListener('click', function () {
        var detailView = document.getElementById('checkout-detail-view');
        if (detailView && detailView.innerHTML.trim() === '') {
          _showDetailView();
        } else {
          _switchTabUI('detail');
        }
      });

      // Plugin toolbar cho DynamicFormEngine
      if (!window.FormActionPlugins) window.FormActionPlugins = [];
      window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'checkout_plugin'; });
      window.FormActionPlugins.push({
        id: 'checkout_plugin',
        getExtraButtons: function (formName, getSelected) {
          if (formName !== 'frmQuyetToan') return [];
          return [
            {
              text: 'Lập Quyết Toán',
              icon: 'add_circle',
              type: 'tool',
              onClick: function () { _showDetailView(); }
            },
            {
              text: 'Xem Chi Tiết',
              icon: 'visibility',
              type: 'tool',
              onClick: function () {
                var selected = getSelected();
                if (!selected || selected.length === 0) {
                  if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Vui lòng chọn 1 phiếu quyết toán!');
                  return;
                }
                _showDetailView(selected[0]);
              }
            }
          ];
        }
      });

      DynamicFormEngine.render(listContainer, {
        FormName: 'frmQuyetToan',
        hideActionToolbar: false,
        onRowClick: function (rowData) { }
      });

    }).catch(function (err) {
      $container.innerHTML = '<div class="p-4 text-danger">Lỗi tải giao diện checkout: ' + err.message + '</div>';
    });
  }

  // ─── Tab switcher (Danh sách / Chi tiết) ─────────────────────────────────
  function _switchTabUI(mode) {
    var tabListBtn = document.getElementById('checkout-tab-list-btn');
    var tabDetailBtn = document.getElementById('checkout-tab-detail-btn');
    var tabListPane = document.getElementById('checkout-tab-list-pane');
    var tabDetailPane = document.getElementById('checkout-tab-detail-pane');
    if (!tabListBtn || !tabDetailBtn || !tabListPane || !tabDetailPane) return;

    var isDetail = (mode === 'detail');
    [tabDetailBtn, tabListBtn].forEach(function (btn, i) {
      var active = (i === 0) === isDetail;
      btn.classList.toggle('active', active);
      btn.style.color = active ? 'var(--color-primary)' : 'var(--color-text-secondary)';
      btn.style.borderBottomColor = active ? 'var(--color-primary)' : 'transparent';
    });
    tabListPane.style.display = isDetail ? 'none' : 'block';
    tabDetailPane.style.display = isDetail ? 'block' : 'none';
  }

  // ─── Màn hình Chi tiết Quyết toán ────────────────────────────────────────
  function _showDetailView(dataToLoad) {
    var detailView = document.getElementById('checkout-detail-view');
    if (!detailView) return;
    detailView.innerHTML = '';

    // Reset refs
    _statusBadgeEl = null;
    _kvRevTableEl = null;
    _kvFooterTableEl = null;

    // ── Layout 2 cột: Chọn HĐ (3/12) + Chi tiết (9/12) ──
    var row = document.createElement('div');
    row.className = 'row g-4';

    // ── Cột trái: Chọn Hợp Đồng ──────────────────────────
    var colLeft = document.createElement('div');
    colLeft.className = 'col-12 col-xl-3';

    // UICard.create() trả về HTMLElement trực tiếp
    var cardLeft = UICard.create({
      title: 'Chọn Hợp Đồng',
      className: 'h-100'
    });
    var cardLeftBody = cardLeft.querySelector('.card-body');

    // Search bar: UIInput + UIButton
    var searchWrap = document.createElement('div');
    searchWrap.className = 'd-flex gap-2 mb-3';

    // UIInput.createText() trả về div.form-group → lấy input bên trong
    var searchGroup = UIInput.createText({ id: 'search-contract-inp', placeholder: 'Nhập mã HĐ hoặc tên KH...' });
    var searchInput = searchGroup.querySelector('input') || searchGroup;
    searchInput.style.flex = '1';
    searchInput.style.margin = '0';

    var searchBtn = UIButton.create({
      icon: 'search',
      type: 'primary',
      id: 'btn-search-contract',
      onClick: function () { _loadContracts(); }
    });

    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(searchBtn);

    var contractList = document.createElement('div');
    contractList.id = 'checkout-contract-list';
    contractList.className = 'd-flex flex-column gap-2 overflow-auto';
    contractList.style.maxHeight = '500px';
    contractList.innerHTML = '<div class="text-center p-4 text-muted" style="font-size:13px">Gõ tìm kiếm Hợp đồng...</div>';

    cardLeftBody.appendChild(searchWrap);
    cardLeftBody.appendChild(contractList);
    colLeft.appendChild(cardLeft);

    // ── Cột phải: Chi tiết Quyết toán ────────────────────
    var colRight = document.createElement('div');
    colRight.className = 'col-12 col-xl-9';

    // Card wrapper thủ công để có header + footer tùy chỉnh
    var cardRight = document.createElement('div');
    cardRight.className = 'card h-100';
    cardRight.style.minHeight = '600px';

    // Header card phải
    var cardRightHeader = document.createElement('div');
    cardRightHeader.className = 'card-header d-flex justify-content-between align-items-center';
    var cardRightTitle = document.createElement('h5');
    cardRightTitle.className = 'mb-0 fw-bold';
    cardRightTitle.textContent = 'Chi tiết Quyết toán';
    _statusBadgeEl = UIBadge.create('Chưa thanh toán', 'warning');
    cardRightHeader.appendChild(cardRightTitle);
    cardRightHeader.appendChild(_statusBadgeEl);

    // Body card phải → chứa UITabs
    var cardRightBody = document.createElement('div');
    cardRightBody.className = 'card-body p-0';
    var tabsContainer = document.createElement('div');
    tabsContainer.id = 'checkout-tabs-container';
    cardRightBody.appendChild(tabsContainer);

    // Footer card phải → KVTable tóm tắt + nút action
    var cardRightFooter = document.createElement('div');
    cardRightFooter.className = 'card-footer d-flex justify-content-between align-items-center p-3';

    _kvFooterTableEl = KVTable.create({
      rows: [
        { label: 'Cọc đã nhận:', value: '0 ₫', color: 'success' },
        { label: 'Phải thu thêm:', value: '0 ₫', color: 'danger' }
      ]
    });

    var footerBtns = document.createElement('div');
    footerBtns.className = 'd-flex gap-2 flex-shrink-0';

    var btnPrint = UIButton.create({
      id: 'btn-print-checkout',
      text: 'In Phiếu',
      icon: 'print',
      type: 'secondary',
      onClick: function () {
        if (typeof Alert !== 'undefined') Alert.info('In phiếu', 'Tính năng đang hoàn thiện.');
      }
    });
    btnPrint.style.whiteSpace = 'nowrap';

    var btnSave = UIButton.create({
      id: 'btn-save-checkout',
      text: 'Lưu Quyết Toán & Giải Phóng Sảnh',
      icon: 'save',
      type: 'primary',
      onClick: _onSave
    });
    btnSave.style.whiteSpace = 'nowrap';

    footerBtns.appendChild(btnPrint);
    footerBtns.appendChild(btnSave);
    cardRightFooter.appendChild(_kvFooterTableEl);
    cardRightFooter.appendChild(footerBtns);

    cardRight.appendChild(cardRightHeader);
    cardRight.appendChild(cardRightBody);
    cardRight.appendChild(cardRightFooter);
    colRight.appendChild(cardRight);

    row.appendChild(colLeft);
    row.appendChild(colRight);
    detailView.appendChild(row);

    _switchTabUI('detail');
    _initTabs();

    if (dataToLoad) {
      _loadContracts(dataToLoad.Sohopdong || dataToLoad.MaHopDong);
    } else {
      _loadContracts();
    }
  }

  // ─── Tabs nội dung ────────────────────────────────────────────────────────
  function _initTabs() {
    var $tongHop = document.createElement('div'); $tongHop.id = 'checkout-tab-tong-hop';
    var $phatSinh = document.createElement('div'); $phatSinh.id = 'checkout-tab-phat-sinh';
    var $giamGia = document.createElement('div'); $giamGia.id = 'checkout-tab-giam-gia';

    var tabs = UITabs.create([
      { title: 'Bảng Tổng Hợp', content: $tongHop },
      { title: 'Dịch vụ Phát Sinh', content: $phatSinh },
      { title: 'Giảm giá / Ưu đãi', content: $giamGia }
    ]);

    var tabsContainer = document.getElementById('checkout-tabs-container');
    if (tabsContainer) {
      tabsContainer.innerHTML = '';
      tabsContainer.appendChild(tabs);
    }

    _renderTongHop();
    _renderPhatSinh();
    _renderGiamGia();
  }

  // ─── Tab 1: Bảng Tổng Hợp ────────────────────────────────────────────────
  function _renderTongHop() {
    var el = document.getElementById('checkout-tab-tong-hop');
    if (!el) return;
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'p-4';

    // Tiêu đề section
    var h5 = document.createElement('h5');
    h5.className = 'fw-bold mb-3';
    h5.textContent = 'Thông tin Tiệc';
    wrap.appendChild(h5);

    // KVTable thông tin hợp đồng
    var kvInfo = KVTable.create({
      rows: [
        { label: 'Mã Hợp Đồng', value: '---' },
        { label: 'Khách hàng', value: '---' },
        { label: 'Sảnh tiệc', value: '---' },
        { label: 'Ngày tiệc', value: '---' },
        { label: 'Tổng bàn', value: '0' }
      ],
      className: 'mb-4'
    });
    kvInfo.id = 'kv-info-table';
    wrap.appendChild(kvInfo);

    // Tiêu đề doanh thu
    var h5Rev = document.createElement('h5');
    h5Rev.className = 'fw-bold mb-3 mt-4';
    h5Rev.textContent = 'Doanh thu dự kiến ban đầu';
    wrap.appendChild(h5Rev);

    // KVTable doanh thu
    _kvRevTableEl = KVTable.create({
      rows: [
        { label: 'Tiền bàn tiệc (Mặn + Chay)', value: '0' },
        { label: 'Tiền thức uống', value: '0' },
        { label: 'Tiền dịch vụ', value: '0' },
        { label: 'Tổng cộng Hợp đồng', value: '0', color: 'primary', isTotal: true }
      ]
    });
    _kvRevTableEl.id = 'kv-rev-table';
    wrap.appendChild(_kvRevTableEl);

    el.appendChild(wrap);
  }

  // ─── Tab 2: Dịch vụ Phát Sinh ────────────────────────────────────────────
  function _renderPhatSinh() {
    var el = document.getElementById('checkout-tab-phat-sinh');
    if (!el) return;
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'p-4';

    // Header hàng tiêu đề + nút thêm
    var header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-4';

    var title = document.createElement('h5');
    title.className = 'fw-bold mb-0';
    title.textContent = 'Các Dịch vụ / Thức uống gọi thêm lúc đãi tiệc';

    var btnAdd = UIButton.create({
      text: 'Thêm mục phát sinh',
      icon: 'add',
      type: 'primary',
      onClick: function () {
        if (typeof Alert !== 'undefined') Alert.info('Thông báo', 'Tính năng đang hoàn thiện.');
      }
    });

    header.appendChild(title);
    header.appendChild(btnAdd);
    wrap.appendChild(header);

    // UITable danh sách phát sinh (rỗng)
    var tableEl = UITable.create({
      headers: [
        { label: 'Loại', field: 'loai', width: '120px' },
        { label: 'Diễn giải', field: 'dienGiai', width: '200px' },
        { label: 'Số lượng', field: 'soLuong', align: 'center', width: '100px' },
        { label: 'Đơn giá', field: 'donGia', align: 'right', width: '130px' },
        { label: 'Thành tiền', field: 'thanhTien', align: 'right', width: '130px' }
      ],
      columns: [
        { field: 'loai' },
        { field: 'dienGiai' },
        { field: 'soLuong', align: 'center' },
        { field: 'donGia', align: 'right' },
        { field: 'thanhTien', align: 'right' }
      ],
      data: []
    });
    tableEl.id = 'table-phat-sinh';
    wrap.appendChild(tableEl);

    // Tổng phát sinh (KVTable 1 dòng)
    var kvPhatSinh = KVTable.create({
      rows: [
        { label: 'Tổng Phát sinh', value: '0 ₫', color: 'danger', isTotal: true }
      ],
      className: 'mt-3'
    });
    wrap.appendChild(kvPhatSinh);

    el.appendChild(wrap);
  }

  // ─── Tab 3: Giảm giá / Ưu đãi ────────────────────────────────────────────
  function _renderGiamGia() {
    var el = document.getElementById('checkout-tab-giam-gia');
    if (!el) return;
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'p-4';

    var h5 = document.createElement('h5');
    h5.className = 'fw-bold mb-4';
    h5.textContent = 'Áp dụng Giảm Giá (3 cách)';
    wrap.appendChild(h5);

    var row = document.createElement('div');
    row.className = 'row g-4 mb-4';

    // Giảm theo tiền
    var col1 = document.createElement('div'); col1.className = 'col-md-4';
    col1.appendChild(UIInput.createNumber({ id: 'inp-discount-amount', label: 'Giảm theo Tiền (VNĐ)', placeholder: '0', min: 0 }));
    row.appendChild(col1);

    // Giảm theo %
    var col2 = document.createElement('div'); col2.className = 'col-md-4';
    col2.appendChild(UIInput.createNumber({ id: 'inp-discount-percent', label: 'Giảm theo % Bill', placeholder: '0', min: 0, max: 100 }));
    row.appendChild(col2);

    // Voucher
    var col3 = document.createElement('div'); col3.className = 'col-md-4';
    var voucherWrap = UIInput.createText({ id: 'inp-discount-code', label: 'Voucher / Mã giảm giá', placeholder: 'Mã voucher...' });
    var btnApply = UIButton.create({
      text: 'Áp dụng',
      type: 'primary',
      onClick: function () {
        if (typeof Alert !== 'undefined') Alert.info('Voucher', 'Tính năng đang hoàn thiện.');
      }
    });
    btnApply.style.marginTop = '6px';
    voucherWrap.appendChild(btnApply);
    col3.appendChild(voucherWrap);
    row.appendChild(col3);

    wrap.appendChild(row);

    var hr = document.createElement('hr');
    wrap.appendChild(hr);

    // Tổng mức giảm (KVTable)
    var kvDiscount = KVTable.create({
      rows: [
        { label: 'Tổng mức giảm', value: '0 ₫', color: 'success', isTotal: true }
      ],
      className: 'mt-3'
    });
    kvDiscount.id = 'kv-discount-table';
    wrap.appendChild(kvDiscount);

    el.appendChild(wrap);
  }

  // ─── Xử lý lưu quyết toán ────────────────────────────────────────────────
  // ─── Xử lý lưu quyết toán ────────────────────────────────────────────────
  function _onSave() {
    if (!_selectedContract) {
      if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Vui lòng chọn hợp đồng để quyết toán!');
      return;
    }
    
    if (window.PeriodManager && window.PeriodManager.isDateLocked(_selectedContract.NgayToChuc)) {
      if (typeof UIToast !== 'undefined') UIToast.show('Kỳ kế toán của ngày ' + _selectedContract.NgayToChuc + ' đã bị khóa. Không thể lưu Quyết toán!', 'danger');
      return;
    }

    if (typeof CheckoutService !== 'undefined') {
      var btn = document.getElementById('btn-save-checkout');
      var oldHtml = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = '<i class="material-icons rotating">sync</i> Đang lưu...';

      var total = parseFloat(_selectedContract.TongTien) || 0;
      var deposit = total * 0.3; // mock tạm 30% nếu dữ liệu HĐ ko có
      var payload = {
        Sohopdong: _selectedContract.Sohopdong,
        Nguoinop: _selectedContract.TenKhachHang,
        Tongtiencoc: deposit,
        TongtienHoaDon: total,
        Thanhtoan: total - deposit,
        Conlai: 0,
        IsKetthuc: 1, // Đánh dấu HĐ hoàn tất
        Ghichu: 'Quyết toán từ hệ thống'
      };

      CheckoutService.save(payload).then(function(res) {
        if (typeof Alert !== 'undefined') {
          Alert.success('Thành công', 'Đã lưu quyết toán thành công!<br/>Sảnh <b>' + (_selectedContract.SanhDat || '') + '</b> đã được giải phóng về trạng thái <b>Trống</b>.');
        }
        if (_statusBadgeEl) {
          _statusBadgeEl.className = 'status-badge success';
          _statusBadgeEl.textContent = 'Đã thanh toán';
        }
        if (btn) btn.innerHTML = oldHtml;

        setTimeout(function () {
          var grid = document.querySelector('#checkout-list-view .dx-datagrid');
          if (grid && window.jQuery && window.jQuery(grid).dxDataGrid('instance')) {
             window.jQuery(grid).dxDataGrid('instance').refresh();
          }
          _switchTabUI('list'); 
        }, 1800);
      }).catch(function(err) {
        if (btn) btn.innerHTML = oldHtml;
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi lưu quyết toán: ' + (err.message || err));
      });
    }
  }

  // ─── Danh sách hợp đồng (từ API) ───────────────────────────────────────────
  function _loadContracts(forceId) {
    var list = document.getElementById('checkout-contract-list');
    var input = document.getElementById('search-contract-inp');
    if (!list) return;
    
    var keyword = input ? input.value : '';
    list.innerHTML = '<div class="text-center p-4 text-muted"><i class="material-icons rotating">sync</i> Đang tải...</div>';

    if (typeof CheckoutService !== 'undefined') {
      CheckoutService.searchContracts(keyword).then(function(data) {
        _renderContractList(data, forceId);
      }).catch(function(err) {
        list.innerHTML = '<div class="text-center p-4 text-danger">Lỗi tải danh sách HĐ</div>';
      });
    } else {
      list.innerHTML = '<div class="text-center p-4 text-danger">Chưa tải CheckoutService</div>';
    }
  }

  function _renderContractList(data, forceId) {
    var list = document.getElementById('checkout-contract-list');
    if (!list) return;
    list.innerHTML = '';

    if (!data || data.length === 0) {
      list.innerHTML = '<div class="text-center p-4 text-muted" style="font-size:13px">Không có hợp đồng nào chưa quyết toán.</div>';
      return;
    }

    if (forceId) {
      var match = data.find(function(d) { return d.Sohopdong === forceId; });
      if (match) _selectContract(match);
      else _selectContract(data[0]);
    }

    data.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'card p-3';
      card.style.cursor = 'pointer';
      card.style.transition = 'border-color 0.15s, box-shadow 0.15s';

      var rowTop = document.createElement('div');
      rowTop.className = 'd-flex justify-content-between align-items-center mb-2';

      var mHd = document.createElement('span');
      mHd.className = 'fw-bold';
      mHd.style.color = 'var(--color-primary)';
      mHd.textContent = item.Sohopdong;

      var badge = UIBadge.create('Chưa QT', 'danger');

      rowTop.appendChild(mHd);
      rowTop.appendChild(badge);
      card.appendChild(rowTop);

      var nameEl = document.createElement('div');
      nameEl.className = 'fw-bold mb-1';
      nameEl.textContent = item.TenKhachHang;
      card.appendChild(nameEl);

      var kvMeta = KVTable.create({
        rows: [
          { label: '📅 Ngày tiệc', value: item.NgayToChuc || '---' },
          { label: '🏛️ Sảnh', value: item.SanhDat || 'Chưa xếp' }
        ],
        className: 'mt-1'
      });
      kvMeta.style.fontSize = '12px';
      card.appendChild(kvMeta);

      card.addEventListener('click', function () {
        Array.from(list.children).forEach(function (c) {
          c.style.borderColor = 'var(--color-border)';
          c.style.boxShadow = '';
        });
        card.style.borderColor = 'var(--color-primary)';
        card.style.boxShadow = '0 0 0 2px rgba(var(--color-primary-rgb, 79,70,229),0.25)';

        _selectContract(item);
      });

      list.appendChild(card);
    });
  }

  // ─── Cập nhật chi tiết khi chọn hợp đồng ────────────────────────────────
  function _selectContract(item) {
    _selectedContract = item;

    var fmtVND = function (n) { return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'; };

    // Cập nhật KVTable thông tin hợp đồng
    var kvInfo = document.getElementById('kv-info-table');
    if (kvInfo) {
      KVTable.updateRow(kvInfo, 0, { value: item.Sohopdong });
      KVTable.updateRow(kvInfo, 1, { value: item.TenKhachHang });
      KVTable.updateRow(kvInfo, 2, { value: item.SanhDat || '---' });
      KVTable.updateRow(kvInfo, 3, { value: item.NgayToChuc || '---' });
      KVTable.updateRow(kvInfo, 4, { value: (item.SoBan || 0) + ' bàn' });
    }

    // Cập nhật KVTable doanh thu
    var total = parseFloat(item.TongTien) || 0;
    if (_kvRevTableEl) {
      KVTable.updateRow(_kvRevTableEl, 0, { value: fmtVND(total * 0.5) });
      KVTable.updateRow(_kvRevTableEl, 1, { value: fmtVND(total * 0.3) });
      KVTable.updateRow(_kvRevTableEl, 2, { value: fmtVND(total * 0.2) });
      KVTable.updateRow(_kvRevTableEl, 3, { value: fmtVND(total) });
    }

    // Cập nhật KVTable footer (cọc / phải thu)
    if (_kvFooterTableEl) {
      var deposit = total * 0.3; // Tạm mock cọc 30%
      KVTable.updateRow(_kvFooterTableEl, 0, { value: fmtVND(deposit) });
      KVTable.updateRow(_kvFooterTableEl, 1, { value: fmtVND(total - deposit) });
    }

    // Cập nhật badge trạng thái
    if (_statusBadgeEl) {
      _statusBadgeEl.className = 'status-badge warning';
      _statusBadgeEl.textContent = 'Chưa thanh toán';
    }
  }

  return { render: render };
})();
