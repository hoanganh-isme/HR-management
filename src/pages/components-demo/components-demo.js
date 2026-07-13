/**
 * Trang minh họa TOÀN BỘ UI Components trong hệ thống
 * HTML Template: src/pages/components-demo.html
 */
var ComponentsDemoPage = (function () {

  function render($container) {
    fetch('./src/pages/components-demo/components-demo.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _mountAll();
      });
  }

  function _mountAll() {
    _mountCheckboxes();
    _mountComboBox();
    _mountGridDropdown();
    _mountButtons();
    _mountBadges();
    _mountAlerts();
    _mountToasts();
    _mountModals();
    _mountTabs();
    _mountNestedTabs();
    _mountNestedTabsVertical();
    _mountAccordion();
    _mountStepper();
    _mountTimeline();
    _mountCalendar();
    _mountSlider();
    _mountFileUpload();
    _mountPagination();
    _mountEmptyState();
    _mountSpinner();
    _mountPopover();
    _mountContextMenu();
    _mountCharts();
    _mountInputs();
    _mountTreeView();
    _mountCard();
    _mountTable();
    _mountActionToolbar();
    _mountTotalBar();
    _mountFilter();
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = `
      <span class="status-badge primary" style="white-space: nowrap;">34 Components</span>
    `;
  }

  // ── 1. CHECKBOX ──
  function _mountCheckboxes() {
    var el = document.getElementById('demo-checkbox-group');
    if (!el) return;
    el.appendChild(UIControls.createCheckbox({ label: 'Khách hàng', checked: true }));
    el.appendChild(UIControls.createCheckbox({ label: 'Nhà cung cấp', checked: true }));
    el.appendChild(UIControls.createCheckbox({ label: 'Nhân viên', checked: false }));
    el.appendChild(UIControls.createCheckbox({ label: 'Vô hiệu hóa (disabled)', checked: false }));
  }

  // ── 2. COMBOBOX ──
  function _mountComboBox() {
    var el = document.getElementById('demo-combobox-wrapper');
    var elDisabled = document.getElementById('demo-combobox-disabled-wrapper');
    var nvData = window.MockData ? window.MockData.demoEmployees : [];
    
    if (el) {
      el.appendChild(UIControls.createDataComboBox({
        placeholder: 'Chọn nhân viên...',
        headers: ['Mã nhân viên', 'Tên nhân viên', 'Điện thoại'],
        data: nvData, colFilterIndex: 1, colHighlightIndex: 1,
        onSelect: function (row) { UIToast.show('Đã chọn: ' + row[1]); },
        onF2: function () { alert('Mở form Thêm nhân viên (F2)'); },
        onF3: function () { alert('Mở form Tra cứu nhân viên (F3)'); }
      }));
    }

    if (elDisabled) {
      elDisabled.appendChild(UIControls.createDataComboBox({
        placeholder: 'Đã bị khóa (không thể tương tác)',
        headers: ['Mã', 'Tên'],
        data: [],
        disabled: true
      }));
    }

    var elReadonly = document.getElementById('demo-combobox-readonly-wrapper');
    if (elReadonly) {
      elReadonly.appendChild(UIControls.createDataComboBox({
        placeholder: 'Click để chọn (không thể gõ)...',
        headers: ['Mã nhân viên', 'Tên nhân viên', 'Điện thoại'],
        data: nvData, colFilterIndex: 1, colHighlightIndex: 1,
        readonlyInput: true,
        onSelect: function (row) { UIToast.show('Đã chọn: ' + row[1]); }
      }));
    }
  }

  // ── 3. GRID DROPDOWN ──
  function _mountGridDropdown() {
    var hhData = window.MockData ? window.MockData.demoItems : [];
    var td1 = document.getElementById('td-grid-dropdown-1');
    var td2 = document.getElementById('td-grid-dropdown-2');
    var opts = { placeholder: 'Gõ mã hàng...', headers: ['Mã hàng', 'Tên hàng', 'ĐVT', 'Quy đổi', 'Chẵn', 'Lẻ', 'SL Tồn'], data: hhData, colFilterIndex: 0, colHighlightIndex: 0 };
    if (td1) td1.appendChild(UIControls.createGridDropdown(Object.assign({}, opts, {
      onSelect: function (row) { document.getElementById('lbl-tenhang-1').innerText = row[1]; document.getElementById('lbl-dvt-1').innerText = row[2]; }
    })));
    if (td2) td2.appendChild(UIControls.createGridDropdown(Object.assign({}, opts, {
      onSelect: function (row) { document.getElementById('lbl-tenhang-2').innerText = row[1]; document.getElementById('lbl-dvt-2').innerText = row[2]; }
    })));
  }

  // ── 4. BUTTONS ──
  function _mountButtons() {
    var el = document.getElementById('demo-buttons');
    if (!el) return;
    el.innerHTML = [
      UIButton.createHTML({ text: 'Primary', type: 'primary' }),
      UIButton.createHTML({ text: 'Secondary', type: 'secondary' }),
      UIButton.createHTML({ icon: 'edit', text: 'Tool Button', type: 'tool' }),
      UIButton.createHTML({ text: 'Disabled', type: 'primary', disabled: true }),
      UIButton.createHTML({ text: 'Success', style: 'background:var(--color-success); color:#fff;' }),
      UIButton.createHTML({ text: 'Danger', style: 'background:var(--color-danger); color:#fff;' }),
      UIButton.createHTML({ text: 'Warning', style: 'background:var(--color-warning); color:#fff;' }),
      UIButton.createHTML({ icon: 'settings', className: 'icon-btn' }),
      UIButton.createHTML({ icon: 'delete', className: 'icon-btn' })
    ].join('');
  }

  // ── 5. BADGES ──
  function _mountBadges() {
    var el = document.getElementById('demo-badges');
    if (!el) return;
    el.innerHTML = [
      UIBadge.createHTML('Hoàn tất', 'success', 'status-badge'),
      UIBadge.createHTML('Đang xử lý', 'warning', 'status-badge'),
      UIBadge.createHTML('Đã ký HĐ', 'primary', 'status-badge'),
      UIBadge.createHTML('Bản nháp', 'secondary', 'status-badge'),
      UIBadge.createHTML('Hủy bỏ', '', 'status-badge', 'background:var(--color-danger); color:#fff;')
    ].join(' ');
  }

  // ── 6. ALERTS ──
  function _mountAlerts() {
    var el = document.getElementById('demo-alerts');
    if (!el) return;
    el.innerHTML = [
      UIButton.createHTML({ text: 'Alert Success', type: 'primary', onClick: "Alert.success('Thành công!', 'Dữ liệu đã được lưu.')" }),
      UIButton.createHTML({ text: 'Alert Error', style: 'background:var(--color-danger);color:#fff;', onClick: "Alert.error('Lỗi!', 'Không thể kết nối máy chủ.')" }),
      UIButton.createHTML({ text: 'Alert Warning', style: 'background:var(--color-warning);color:#fff;', onClick: "Alert.warning('Cảnh báo!', 'Dữ liệu chưa được lưu.')" }),
      UIButton.createHTML({ text: 'Alert Info', type: 'secondary', onClick: "Alert.info('Thông tin', 'Phiên bản hệ thống: v2.0.1')" })
    ].join('');
  }

  // ── 7. TOAST ──
  function _mountToasts() {
    var el = document.getElementById('demo-toasts');
    if (!el) return;
    el.innerHTML = [
      UIButton.createHTML({ text: 'Toast Default', type: 'primary', onClick: "UIToast.show('Đây là thông báo mặc định')" }),
      UIButton.createHTML({ text: 'Toast Success', style: 'background:var(--color-success);color:#fff;', onClick: "UIToast.show('Lưu thành công!', 'success')" }),
      UIButton.createHTML({ text: 'Toast Error', style: 'background:var(--color-danger);color:#fff;', onClick: "UIToast.show('Có lỗi xảy ra!', 'error')" }),
      UIButton.createHTML({ text: 'Toast Warning', style: 'background:var(--color-warning);color:#fff;', onClick: "UIToast.show('Cảnh báo dữ liệu', 'warning')" })
    ].join('');
  }

  // ── 8. MODAL & CONFIRM ──
  function _mountModals() {
    var confirmEl = document.getElementById('demo-confirm-modal');
    if (confirmEl) {
      confirmEl.innerHTML = UIButton.createHTML({ text: 'Confirm Dialog', type: 'secondary', onClick: "ConfirmModal.show({ title: 'Xác nhận xóa?', message: 'Bạn có chắc muốn xóa bản ghi này? Thao tác không thể hoàn tác.', onConfirm: function() { UIToast.show('Đã xóa!', 'success'); } })" });
    }
    
    var uiEl = document.getElementById('demo-ui-modal');
    if (uiEl) {
      uiEl.innerHTML = '';
      var btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'Mở Modal';
      btn.onclick = function() {
        var footer = document.createElement('div');
        footer.className = 'd-flex justify-content-end gap-2';
        footer.innerHTML = UIButton.createHTML({ text: 'Hủy', className: 'btn-cancel' }) + UIButton.createHTML({ text: 'Xác nhận', type: 'primary', className: 'btn-confirm' });
        
        var m = UIModal.show({
          title: 'Modal Demo',
          width: '500px',
          content: '<div class="p-4"><p>Đây là nội dung bên trong Modal.</p><div class="form-group"><label>Tên khách</label><input type="text" class="ui-input w-100" placeholder="Nhập..."></div></div>',
          footer: footer
        });
        
        footer.querySelector('.btn-cancel').onclick = function() { m.close(); };
        footer.querySelector('.btn-confirm').onclick = function() { 
          UIToast.show('Đã xác nhận', 'success'); 
          m.close(); 
        };
      };
      uiEl.appendChild(btn);
    }
  }

  // ── 9. TABS ──
  function _mountTabs() {
    var el = document.getElementById('demo-tabs');
    if (!el) return;
    var tabs = UITabs.create([
      { title: 'Tab Thông tin', icon: 'info', content: '<div class="p-4"><p>Nội dung <b>Tab Thông tin</b>. Có thể chứa form, bảng dữ liệu, biểu đồ...</p></div>' },
      { title: 'Tab Lịch sử', icon: 'history', content: '<div class="p-4"><p>Nội dung <b>Tab Lịch sử</b> hiển thị timeline hoặc datagrid.</p></div>' },
      { title: 'Tab Cài đặt', icon: 'settings', content: '<div class="p-4"><p>Nội dung <b>Tab Cài đặt</b> với các tùy chọn cấu hình.</p></div>' }
    ]);
    el.appendChild(tabs);
  }

  // ── 9b. NESTED TABS ──
  function _mountNestedTabs() {
    var el = document.getElementById('demo-nested-tabs');
    if (!el) return;
    if (typeof UINestedTabs === 'undefined') {
      el.innerHTML = '<p style="color:var(--color-text-secondary)">UINestedTabs chưa được khai báo.</p>';
      return;
    }

    // Dữ liệu mock mô phỏng WA_Menu (parent rỗng = tab cha, có parent = tab con)
    var mockMenuData = [
      // Tab Cha: Biên nhận (12)
      { id: '12',   parent: '',   label: 'Biên nhận',         icon: 'receipt_long' },
      { id: '1201', parent: '12', label: 'Biên nhận cọc lần 1' },
      { id: '1217', parent: '12', label: 'Biên nhận cọc lần 2' },
      { id: '1218', parent: '12', label: 'Cọc hội nghị' },
      { id: '1219', parent: '12', label: 'Hợp đồng hội nghị' },
      { id: '1222', parent: '12', label: 'Thay đổi - Bổ sung HĐ' },

      // Tab Cha: Báo cáo (14)
      { id: '14',   parent: '',   label: 'Báo cáo',           icon: 'bar_chart' },
      { id: '1401', parent: '14', label: 'Báo cáo thống kê' },
      { id: '140101', parent: '14', label: 'BC Khách tham quan' },
      { id: '140103', parent: '14', label: 'BC Khách cọc chỗ' },
      { id: '140112', parent: '14', label: 'TK Tiền cọc - coc hội' },
      { id: '140115', parent: '14', label: 'TK Tiến trình nhân sự' },
      { id: '1402',   parent: '14', label: 'Báo cáo dịch vụ' },

      // Tab Cha: Hệ thống (10)
      { id: '10',   parent: '',   label: 'Hệ thống',          icon: 'settings' },
      { id: '1001', parent: '10', label: 'Người dùng' },
      { id: '1002', parent: '10', label: 'Nhóm quyền' },
      { id: '1003', parent: '10', label: 'Danh mục Menu' },

      // Tab Cha: Danh mục (11) - không có con (panel độc lập)
      { id: '11',   parent: '',   label: 'Danh mục',          icon: 'category' }
    ];

    var nestedEl = UINestedTabs.create(mockMenuData, {
      onTabChange: function(parentId, childId) {
        UIToast.show(
          'Parent: ' + parentId + (childId ? '  →  Child: ' + childId : ''),
          'info'
        );
      },
      onReorder: function(type, orderedIds, parentId) {
        var msg = (type === 'parent')
          ? 'Sắp xếp cha: [' + orderedIds.join(', ') + ']'
          : 'Sắp xếp con (nhóm ' + parentId + '): [' + orderedIds.join(', ') + ']';
        UIToast.show(msg, 'success');
      },
      renderContent: function(item) {
        // Mô phỏng: nếu item có formName thì load form, còn không thì placeholder
        var icon = item.icon || 'article';
        return [
          '<div style="display:flex; align-items:center; gap:16px; padding:20px 0;">',
            UIIcon.createHTML(icon, 'font-size:48px; opacity:0.15;'),
            '<div>',
              '<div style="font-size:15px; font-weight:700; margin-bottom:4px;">', item.label, '</div>',
              '<code style="font-size:11px; opacity:0.4; background:rgba(0,0,0,0.05); padding:2px 8px; border-radius:4px;">',
                'MenuID: ', item.id,
              '</code>',
              '<div style="margin-top:10px; font-size:13px; color:var(--color-text-secondary);">',
                'Nội dung trang/form tương ứng <b>', item.label, '</b> sẽ được render tại đây.',
              '</div>',
            '</div>',
          '</div>'
        ].join('');
      }
    });

    el.appendChild(nestedEl);
  }

  // ── 9c. NESTED TABS VERTICAL ──
  function _mountNestedTabsVertical() {
    var el = document.getElementById('demo-nested-tabs-v');
    if (!el || typeof UINestedTabs === 'undefined') return;

    var mockMenuData = [
      { id: '12', parent: '',   label: 'Biên nhận',  icon: 'receipt_long' },
      { id: '1201', parent: '12', label: 'Cọc lần 1' },
      { id: '1217', parent: '12', label: 'Cọc lần 2 (thay đổi)' },
      { id: '1218', parent: '12', label: 'Cọc hội nghị' },
      { id: '1219', parent: '12', label: 'Hợp đồng hội nghị' },
      { id: '14', parent: '',   label: 'Báo cáo',    icon: 'bar_chart' },
      { id: '1401', parent: '14', label: 'Thống kê chung' },
      { id: '140101', parent: '14', label: 'BC Khách tham quan' },
      { id: '140103', parent: '14', label: 'BC Cọc chỗ' },
      { id: '140115', parent: '14', label: 'TK Tiến trình nhân sự' },
      { id: '10', parent: '',   label: 'Hệ thống',   icon: 'settings' },
      { id: '1001', parent: '10', label: 'Người dùng' },
      { id: '1002', parent: '10', label: 'Phân quyền' },
      { id: '11', parent: '',   label: 'Danh mục',   icon: 'category' }
    ];

    var vEl = UINestedTabs.create(mockMenuData, {
      vertical:  true,
      draggable: true,
      onTabChange: function(parentId, childId) {
        UIToast.show('→ ' + (childId || parentId), 'info');
      },
      onReorder: function(type, ids) {
        UIToast.show('Sắp xếp: [' + ids.join(', ') + ']', 'success');
      },
      renderContent: function(item) {
        return '<div style="padding:8px 0;display:flex;align-items:center;gap:12px;">'
          + UIIcon.createHTML(item.icon || 'article', 'font-size:36px;opacity:0.15;')
          + '<div>'
          + '<div style="font-weight:700;font-size:15px;">' + item.label + '</div>'
          + '<code style="font-size:11px;opacity:0.35;background:rgba(0,0,0,0.05);padding:2px 8px;border-radius:4px;display:inline-block;margin-top:4px;">MenuID: ' + item.id + '</code>'
          + '</div></div>';
      }
    });

    el.appendChild(vEl);
  }

  // ── 10. ACCORDION ──
  function _mountAccordion() {
    var el = document.getElementById('demo-accordion');
    if (!el) return;
    if (typeof UIAccordion !== 'undefined') {
      el.appendChild(UIAccordion.create([
        { title: 'Điều khoản Thanh toán', content: 'Khách hàng thanh toán 50% tiền cọc khi ký hợp đồng. Phần còn lại thanh toán trước ngày tổ chức.' },
        { title: 'Chính sách Nghỉ phép', content: 'Nghỉ có lương: cần xin phép trước 3 ngày. Nghỉ không lương: cần sự đồng ý của trưởng phòng.' },
        { title: 'Dịch vụ bổ sung', content: 'MC, Vũ đoàn, Trang trí hoa tươi, Chụp ảnh sự kiện... được tính phí phát sinh ngoài hợp đồng.' }
      ]));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UIAccordion chưa được khai báo.</p>'; }
  }

  // ── 11. STEPPER ──
  function _mountStepper() {
    var el = document.getElementById('demo-stepper');
    if (!el) return;
    if (typeof UIStepper !== 'undefined') {
      el.appendChild(UIStepper.create([
        { label: 'Khách tham quan', completed: true },
        { label: 'Đặt cọc lần 1', completed: true },
        { label: 'Ký hợp đồng', active: true },
        { label: 'Đánh giá năng lực' },
        { label: 'Quyết toán' }
      ]));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UIStepper chưa được khai báo.</p>'; }
  }

  // ── 12. TIMELINE ──
  function _mountTimeline() {
    var el = document.getElementById('demo-timeline');
    if (!el) return;
    if (typeof UITimeline !== 'undefined') {
      el.appendChild(UITimeline.create([
        { time: '09:00', title: 'Khách đến tham quan', desc: 'Trương Tuấn Anh & Trần Thủy Tiên', type: 'info' },
        { time: '10:30', title: 'Ký biên nhận cọc lần 1', desc: 'Cọc 20,000,000 VNĐ', type: 'success' },
        { time: '14:00', title: 'Ký hợp đồng lao động', desc: 'HĐ-260101 — Nhân sự mới', type: 'primary' },
        { time: '16:00', title: 'In phiếu giao khách', desc: 'Hoàn tất quy trình', type: 'warning' }
      ]));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UITimeline chưa được khai báo.</p>'; }
  }

  // ── 13. CALENDAR MINI ──
  function _mountCalendar() {
    var el = document.getElementById('demo-calendar');
    if (!el) return;
    if (typeof UICalendar !== 'undefined') {
      el.appendChild(UICalendar.create({
        events: {
          15: [{ type: 'primary', label: 'Sảnh Kim Cương (30)' }],
          22: [{ type: 'primary', label: 'Sảnh Ngọc Trai (45)' }, { type: 'success', label: 'Sảnh B (X)' }]
        },
        onSelect: function (date, events) { 
          UIToast.show('Đã chọn ngày: ' + date + ' - Sự kiện: ' + (events ? events.length : 0)); 
        }
      }));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UICalendar chưa được khai báo.</p>'; }
  }

  // ── 14. SLIDER ──
  function _mountSlider() {
    var el = document.getElementById('demo-slider');
    if (!el) return;
    if (typeof UISlider !== 'undefined') {
      el.appendChild(UISlider.create({ min: 0, max: 100, value: 65, label: 'Mức giảm giá (%)' }));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UISlider chưa được khai báo.</p>'; }
  }

  // ── 15. FILE UPLOAD ──
  function _mountFileUpload() {
    var el = document.getElementById('demo-file-upload');
    if (!el) return;
    if (typeof UIFileUpload !== 'undefined') {
      el.appendChild(UIFileUpload.create({
        accept: 'image/*,.pdf,.xlsx',
        onFileSelect: function (file) { UIToast.show('Đã chọn: ' + file.name); }
      }));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UIFileUpload chưa được khai báo.</p>'; }
  }

  // ── 16. PAGINATION ──
  function _mountPagination() {
    var el = document.getElementById('demo-pagination');
    if (!el) return;
    if (typeof Pagination !== 'undefined') {
      el.appendChild(Pagination.create({
        totalItems: 120, itemsPerPage: 10, currentPage: 3,
        onPageChange: function (page) { UIToast.show('Chuyển sang trang ' + page); }
      }));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">Pagination chưa được khai báo.</p>'; }
  }

  // ── 17. EMPTY STATE ──
  function _mountEmptyState() {
    var el = document.getElementById('demo-empty-state');
    if (!el) return;
    if (typeof UIEmptyState !== 'undefined') {
      el.appendChild(UIEmptyState.create({
        icon: 'inbox', title: 'Chưa có dữ liệu',
        desc: 'Chưa có biên nhận cọc nào trong tháng này. Hãy bắt đầu bằng cách thêm khách tham quan mới.'
      }));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UIEmptyState chưa được khai báo.</p>'; }
  }

  // ── 18. LOADING SPINNER ──
  function _mountSpinner() {
    var el = document.getElementById('demo-spinner');
    if (!el) return;
    if (typeof LoadingSpinner !== 'undefined') {
      var btnShow = document.createElement('button');
      btnShow.className = 'btn btn-primary';
      btnShow.textContent = 'Hiện Loading Spinner (2 giây)';
      btnShow.onclick = function () {
        LoadingSpinner.show('Đang tải dữ liệu từ máy chủ...');
        setTimeout(function () { LoadingSpinner.hide(); }, 2000);
      };
      el.appendChild(btnShow);
      var label = document.createElement('span');
      label.textContent = 'Bấm nút để xem overlay loading toàn màn hình';
      label.style.cssText = 'color:var(--color-text-secondary); font-size:14px;';
      el.appendChild(label);
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">LoadingSpinner chưa được khai báo.</p>'; }
  }

  // ── 19. POPOVER ──
  function _mountPopover() {
    var el = document.getElementById('demo-popover');
    if (!el) return;
    if (typeof UIPopover !== 'undefined') {
      var btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'Click để xem Popover';
      btn.onclick = function () {
        UIPopover.show(btn, { title: 'Ghi chú nhanh', content: '<p>Đây là nội dung popover.<br>Hỗ trợ <b>HTML</b> bên trong.</p>' });
      };
      el.appendChild(btn);
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UIPopover chưa được khai báo.</p>'; }
  }

  // ── 20. CONTEXT MENU ──
  function _mountContextMenu() {
    var area = document.getElementById('ctx-menu-area');
    if (!area || typeof UIContextMenu === 'undefined') return;
    area.addEventListener('contextmenu', function (e) {
      UIContextMenu.show(e, [
        { icon: 'edit', label: 'Sửa bản ghi', onClick: function () { UIToast.show('Mở form Sửa'); } },
        { icon: 'content_copy', label: 'Sao chép dòng', onClick: function () { UIToast.show('Đã sao chép'); } },
        '|',
        { icon: 'delete', label: 'Xóa', onClick: function () { UIToast.show('Đã xóa!', 'error'); } }
      ]);
    });
  }

  // ── 21. CHART ──
  function _mountCharts() {
    if (typeof UIChart === 'undefined') return;
    var barWrap = document.getElementById('demo-chart-bar');
    var pieWrap = document.getElementById('demo-chart-pie');
    if (barWrap) {
      barWrap.parentNode.replaceChild(UIChart.create({
        title: 'Doanh thu theo tháng',
        type: 'bar',
        data: {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
          datasets: [{ label: 'Doanh thu (Triệu)', data: [120, 190, 300, 250, 220, 350], backgroundColor: 'rgba(79,70,229,0.6)' }]
        }
      }), barWrap);
    }
    if (pieWrap) {
      pieWrap.parentNode.replaceChild(UIChart.create({
        title: 'Tỷ lệ doanh thu theo Sảnh',
        type: 'pie',
        data: {
          labels: ['Diamond', 'Ruby', 'Sapphire', 'Pearl'],
          datasets: [{ data: [35, 25, 20, 20], backgroundColor: ['#6366f1', '#ef4444', '#3b82f6', '#f59e0b'] }]
        }
      }), pieWrap);
    }
  }

  // ── 22. INPUT ──
  function _mountInputs() {
    var el = document.getElementById('demo-inputs');
    if (!el) return;
    el.innerHTML = '<div class="row g-3"><div class="col-md-4"><div class="form-group"><label class="form-label">Text Input</label><input type="text" class="ui-input w-100" placeholder="Nhập văn bản..."></div></div><div class="col-md-4"><div class="form-group"><label class="form-label">Number Input</label><input type="number" class="ui-input w-100" placeholder="0" value="100"></div></div><div class="col-md-4"><div class="form-group"><label class="form-label">Date Input</label><input type="date" class="ui-input w-100"></div></div><div class="col-md-4"><div class="form-group"><label class="form-label">Select</label><select class="ui-input w-100"><option>Phòng Kỹ thuật</option><option>Phòng Nhân sự</option><option>Phòng Kế toán</option></select></div></div><div class="col-md-4" id="demo-pw-slot"></div><div class="col-md-4"><div class="form-group"><label class="form-label">Readonly</label><input type="text" class="ui-input w-100" value="Không thể sửa" readonly style="background: rgba(148, 163, 184, 0.1);"></div></div><div class="col-12"><div class="form-group"><label class="form-label">Textarea</label><textarea class="ui-input w-100" rows="3" placeholder="Nhập ghi chú..." style="resize:vertical;"></textarea></div></div></div>';
    // Chèn Password component (DOM) vào slot
    var pwSlot = el.querySelector('#demo-pw-slot');
    if (pwSlot) {
      pwSlot.appendChild(UIInput.createPassword({ label: 'Password', placeholder: '***' }));
    }
  }

  // ── 23. TREE VIEW ──
  function _mountTreeView() {
    var el = document.getElementById('demo-treeview');
    if (!el) return;
    if (typeof UITreeView !== 'undefined') {
      el.appendChild(UITreeView.create([
        {
          text: 'Quản lý Thời gian', icon: 'calendar_month', expanded: true, children: [
            { text: 'Tạo Ngày tháng', icon: 'event' },
            { text: 'Danh mục Năm Âm Lịch', icon: 'brightness_3' }
          ]
        },
        {
          text: 'Quản lý Khu vực', icon: 'map', expanded: false, children: [
            { text: 'Quận 1', icon: 'location_on' },
            { text: 'Quận 2', icon: 'location_on' },
            { text: 'Phú Nhuận', icon: 'location_on' }
          ]
        },
        {
          text: 'Hàng hóa & Dịch vụ', icon: 'inventory_2', children: [
            { text: 'Dịch vụ (DV)', icon: 'room_service' },
            { text: 'Hàng hóa / Món ăn (HH)', icon: 'restaurant' },
            { text: 'Thức uống (TU)', icon: 'local_bar' }
          ]
        }
      ]));
    } else { el.innerHTML = '<p style="color:var(--color-text-secondary)">UITreeView chưa được khai báo.</p>'; }
  }

  // ── 24. CARD ──
  function _mountCard() {
    var el = document.getElementById('demo-card');
    if (!el || typeof UICard === 'undefined') { if (el) el.innerHTML = '<p style="color:var(--color-text-secondary)">UICard chưa được khai báo.</p>'; return; }
    var card = UICard.create({
      title: 'Thông tin Hợp đồng #HD-260101',
      bodyContent: '<div class="p-3"><p><b>Nhân viên:</b> Nguyễn Văn An</p><p><b>Phòng ban:</b> Nhân sự</p><p><b>Ngày hiệu lực:</b> 25/11/2026</p><p><b>Trạng thái:</b> <span style="color:var(--color-success); font-weight:600;">Đang làm việc</span></p></div>'
    });
    el.appendChild(card);
  }

  // ── 25. TABLE ──
  function _mountTable() {
    var el = document.getElementById('demo-table');
    if (!el || typeof UITable === 'undefined') { if (el) el.innerHTML = '<p class="p-4" style="color:var(--color-text-secondary)">UITable chưa được khai báo.</p>'; return; }
    var table = UITable.create({
      headers: [
        { label: 'STT', width: '60px', align: 'center' },
        { label: 'Mã HĐ' },
        { label: 'Khách hàng' },
        { label: 'Sảnh' },
        { label: 'Số bàn', align: 'right' },
        { label: 'Trạng thái' }
      ],
      columns: [
        { field: 'stt', align: 'center' },
        { field: 'maHD', render: function (v) { return '<span style="color:var(--color-primary); font-weight:600;">' + v + '</span>'; } },
        { field: 'khach' },
        { field: 'sanh' },
        { field: 'soBan', align: 'right' },
        { field: 'status', render: function (v) { return UIBadge.createHTML(v, v === 'Đã ký' ? 'success' : 'warning'); } }
      ],
      data: [
        { stt: 1, maHD: 'HDLD-260101', khach: 'Nguyễn Văn An', sanh: 'Phòng Nhân sự', soBan: 1, status: 'Hiệu lực' },
        { stt: 2, maHD: 'HDLD-260102', khach: 'Trần Thị Bình', sanh: 'Phòng Kế toán', soBan: 1, status: 'Sắp hết hạn' },
        { stt: 3, maHD: 'HDLD-260103', khach: 'Lê Minh Châu', sanh: 'Phòng Vận hành', soBan: 1, status: 'Hiệu lực' }
      ]
    });
    el.appendChild(table);
  }

  // ── 26. ACTION TOOLBAR ──
  function _mountActionToolbar() {
    var el = document.getElementById('demo-action-toolbar');
    if (!el || typeof UIActionToolbar === 'undefined') { if (el) el.innerHTML = '<p style="color:var(--color-text-secondary)">UIActionToolbar chưa được khai báo.</p>'; return; }
    el.appendChild(UIActionToolbar.create({
      onAdd: function () { UIToast.show('Nút Thêm mới'); },
      onEdit: function () { UIToast.show('Nút Sửa'); },
      onDelete: function () { UIToast.show('Nút Xóa', 'error'); },
      onFilter: function () { UIToast.show('Nút Lọc'); },
      onPrint: function () { UIToast.show('Nút In'); },
      onClose: function () { UIToast.show('Nút Đóng'); }
    }));
  }

  // ── 27. TOTAL BAR ──
  function _mountTotalBar() {
    var el = document.getElementById('demo-total-bar');
    if (!el || typeof UITotalBar === 'undefined') { if (el) el.innerHTML = '<p class="p-4" style="color:var(--color-text-secondary)">UITotalBar chưa được khai báo.</p>'; return; }
    el.appendChild(UITotalBar.create({ label: 'Tổng doanh thu tháng 10/2026', valueStr: '₫3,540,000,000' }));
    el.appendChild(UITotalBar.create({ label: 'Tổng chi phí phát sinh', valueStr: '₫850,000,000' }));
  }

  // ── 28. FILTER COMPONENT ──
  function _mountFilter() {
    var el = document.getElementById('demo-filter');
    if (!el || typeof FilterComponent === 'undefined') { if (el) el.innerHTML = '<p style="color:var(--color-text-secondary)">FilterComponent chưa được khai báo.</p>'; return; }
    el.appendChild(FilterComponent.create(
      [
        { id: 'f-name', label: 'Tên khách hàng', type: 'text', placeholder: 'Nhập tên...' },
        { id: 'f-from', label: 'Từ ngày', type: 'date' },
        { id: 'f-to', label: 'Đến ngày', type: 'date' }
      ],
      function (values) { UIToast.show('Lọc: ' + JSON.stringify(values)); }
    ));
  }

  return { render: render };
})();
