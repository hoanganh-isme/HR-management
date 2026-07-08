/**
 * MenusPage — Quản lý Danh mục Menu hệ thống
 * Layout: UINestedTabs (trái) + Chi tiết / Thống kê (phải)
 */
var MenusPage = (function () {
  var $container;
  var allMenus = [];   // flat list từ API
  var _scrollState = { windowTop: 0, sidebarTop: 0, contentTop: 0, tableLeft: 0 };

  function _getPermKey() {
    var hash = window.location.hash.replace('#', '').split('?')[0] || '/menus';
    if (window.Router && window.Router.ROUTES) {
      var r = window.Router.ROUTES.find(function (rt) { return rt.path === hash; });
      if (r && r.perm) return r.perm;
      if (r && r.module) return r.module;
    }
    // Nếu không tìm thấy route tĩnh, thử lấy module từ permissions
    var perms = JSON.parse(localStorage.getItem('pmql_permissions') || '{}');
    if (perms['menus'] || perms['quanlymenu']) return 'menus';
    return 'QuanTriHeThong';
  }

  // ════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════
  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/menus/menus.html?v=' + new Date().getTime())
      .then(function (res) { return res.text(); })
      .then(function (html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _bindStaticEvents();
        _loadMenus();
      });
  }

  // ════════════════════════════════════════════════════════
  //  PLUGIN HÀNH ĐỘNG (Bơm nút bấm lên Global Header)
  // ════════════════════════════════════════════════════════
  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    
    if (typeof UIActionToolbar !== 'undefined') {
      var permKey = _getPermKey();
      var hasAdd = Permission.canAdd(permKey);
      
      var toolbar = UIActionToolbar.create({
        onAdd: hasAdd ? function () { _openModal(false); } : 'DISABLED',
        onEdit: false,
        onDelete: false,
        onFilter: false,
        onPrint: false,
        onClose: false,
        extras: [
          {
            id: 'btn-refresh-menus',
            text: 'Làm mới',
            icon: 'refresh',
            type: 'tool',
            onClick: function () { _loadMenus(); }
          }
        ]
      });
      
      // Override text for "Thêm"
      var btnAdd = toolbar.querySelector('.btn-primary, [title*="Thêm"]');
      if (btnAdd) {
        btnAdd.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">add</span><span class="d-none d-sm-inline">Thêm Nhóm Cha</span>';
      }
      
      globalActions.appendChild(toolbar);
    }
  }

  // ════════════════════════════════════════════════════════
  //  EVENTS
  // ════════════════════════════════════════════════════════
  function _bindStaticEvents() {
    // Lưu ý: Các nút bấm giờ nằm ở global-page-actions và được tạo bởi UIActionToolbar.


    $container.querySelector('#btn-close-modal').addEventListener('click', _closeModal);
    $container.querySelector('#btn-cancel-modal').addEventListener('click', _closeModal);
    $container.querySelector('#btn-save-menu').addEventListener('click', _saveMenu);

  }

  // ════════════════════════════════════════════════════════
  //  LOAD & RENDER MENUS
  // ════════════════════════════════════════════════════════
  function _loadMenus() {
    var container = $container.querySelector('#menus-nested-tabs-container');

    // Lưu lại vị trí scroll trước khi render lại
    var sidebar = container.querySelector('.ui-nested-tabs__sidebar');
    var content = container.querySelector('.ui-nested-tabs__vertical-content');
    var tableWrapper = container.querySelector('.table-wrapper');
    var appContent = document.getElementById('app-content');

    _scrollState.windowTop = appContent ? appContent.scrollTop : (window.scrollY || document.documentElement.scrollTop);
    _scrollState.sidebarTop = sidebar ? sidebar.scrollTop : 0;
    _scrollState.contentTop = content ? content.scrollTop : 0;
    _scrollState.tableLeft = tableWrapper ? tableWrapper.scrollLeft : 0;

    container.innerHTML = '<div id="menus-tabs-loading" style="text-align:center;padding:60px 0;color:var(--color-text-secondary);">'
      + UIIcon.renderHtml('menu_book', 'font-size:40px;opacity:0.2;display:block;margin-bottom:12px;')
      + 'Đang tải danh sách...</div>';

    MenusService.getAll()
      .then(function (records) {
        allMenus = records;
        _renderNestedTabs();
      })
      .catch(function () {
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--color-danger);">Lỗi kết nối máy chủ</div>';
      });
  }

  function _renderNestedTabs() {
    var container = $container.querySelector('#menus-nested-tabs-container');
    container.innerHTML = '';

    var validIds = new Set(allMenus.map(function (m) { return m.id ? String(m.id).trim().toUpperCase() : ''; }));

    // Chuẩn hóa records cho UINestedTabs
    var records = allMenus.map(function (m) {
      var safeParent = m.parent ? String(m.parent).trim().toUpperCase() : '';
      // Nếu ID cha không hề tồn tại trong DB -> Ép nó ra Root để không bị tàng hình
      if (safeParent !== '' && !validIds.has(safeParent)) {
        safeParent = '';
      }

      return {
        id: m.id ? String(m.id).trim().toUpperCase() : '',
        parent: safeParent,
        label: m.label || '(Không tên)',
        labelEN: m.en || '',
        subTitle: m.subTitle || '',
        icon: m.icon || '',
        formName: m.formName || '',
        isDisable: m.isDisable
      };
    });

    // Cập nhật badge đếm
    var countBadge = $container.querySelector('#menus-count-badge');
    if (countBadge) countBadge.textContent = allMenus.length + ' Menu';

    if (records.length === 0) {
      container.innerHTML = UIEmptyState.createHTML({
        icon: 'menu_book',
        title: 'Chưa có Menu nào.',
        desc: 'Hãy thêm menu mới để quản lý.'
      });
      return;
    }

    // ── GIAO DIỆN CHỈ HIỂN THỊ CÁC THƯ MỤC CÓ CHỨA CON BÊN TRÁI ───────────────────
    // Tìm các Menu thực sự đóng vai trò là "Nhóm/Thư mục" (có menu con trỏ tới)
    var folderIds = new Set();
    records.forEach(function (r) {
      if (r.parent && r.parent.trim() !== '') {
        folderIds.add(r.parent);
      }
      if (!r.parent || r.parent.trim() === '') {
        folderIds.add(r.id); // Giữ lại cả Root dù chưa có con
      }
    });

    var folderRecords = records.filter(function (r) {
      // Chỉ lấy các Menu là Thư mục, giữ nguyên .parent gốc để NestedTabs tự động lồng ghép (Accordion)
      return folderIds.has(r.id);
    });

    container.innerHTML = '';

    var savedTabId = sessionStorage.getItem('menus_active_tab');
    var defParentId = null;
    var defChildId = null;
    if (savedTabId) {
      var savedRecord = folderRecords.find(function (r) { return r.id === savedTabId; });
      if (savedRecord) {
        if (savedRecord.parent && savedRecord.parent.trim() !== '') {
          defParentId = savedRecord.parent;
          defChildId = savedRecord.id;
        } else {
          defParentId = savedRecord.id;
        }
      }
    }

    var nestedEl = UINestedTabs.create(folderRecords, {
      vertical: true,
      draggable: false, // Tắt kéo thả ở sidebar dọc để giao diện gọn gàng như bản cũ
      defaultParentId: defParentId,
      defaultChildId: defChildId,
      onTabChange: function (nodeId, childId) {
        // nodeId is the clicked node in vertical mode (could be parent or child)
        if (nodeId) sessionStorage.setItem('menus_active_tab', nodeId);
      },
      onReorder: function (type, orderedIds, parentId) {
        MenusService.updateOrder({ type: type, orderedIds: orderedIds, parentId: parentId })
          .then(function (res) {
            if (res && res.code === 0) {
              UIToast.show('Đã cập nhật thứ tự ' + (type === 'parent' ? 'nhóm' : 'menu'), 'success');
            } else {
              UIToast.show('Lỗi cập nhật: ' + (res.msg || 'Không rõ nguyên nhân'), 'error');
              _loadMenus();
            }
          })
          .catch(function () {
            UIToast.show('Lỗi kết nối khi cập nhật thứ tự', 'error');
            _loadMenus();
          });
      },
      renderContent: function (item) {
        // Dù click vào Nhóm Gốc hay Nhóm Con trên thanh dọc,
        // luôn hiển thị BẢNG DANH SÁCH (Bảng Explorer) của nhánh đó ở bên phải
        return _buildParentContent(item);
      }
    });

    container.appendChild(nestedEl);

    // Phục hồi lại vị trí scroll
    setTimeout(function () {
      var sidebar = container.querySelector('.ui-nested-tabs__sidebar');
      var content = container.querySelector('.ui-nested-tabs__vertical-content');
      var tableWrapper = container.querySelector('.table-wrapper');
      var appContent = document.getElementById('app-content');

      if (sidebar && _scrollState.sidebarTop > 0) sidebar.scrollTop = _scrollState.sidebarTop;
      if (content && _scrollState.contentTop > 0) content.scrollTop = _scrollState.contentTop;
      if (tableWrapper && _scrollState.tableLeft > 0) tableWrapper.scrollLeft = _scrollState.tableLeft;

      if (_scrollState.windowTop > 0) {
        if (appContent) appContent.scrollTop = _scrollState.windowTop;
        else window.scrollTo(0, _scrollState.windowTop);
      }
    }, 10);
  }

  // ── Nội dung panel tab CHA: bảng danh sách con ──────────
  function _buildParentContent(parentItem) {
    var children = allMenus.filter(function (m) { return m.parent === parentItem.id; });
    var wrapper = document.createElement('div');

    // Lấy raw item từ DB gốc để hiển thị đúng những thông tin gõ nhầm (ví dụ ID cha bị mồ côi)
    var rawParentItem = allMenus.find(function (m) { return m.id === parentItem.id; }) || parentItem;

    var permKey = _getPermKey();
    var canEdit = Permission.canEdit(permKey);
    var canDelete = Permission.canDelete(permKey);
    var canAdd = Permission.canAdd(permKey);

    var pIsHidden = (rawParentItem.isDisable == 1 || rawParentItem.isDisable === '1' || rawParentItem.isDisable === true);
    var pBadgeHTML = pIsHidden ? ' <span style="background:var(--color-danger,#f43f5e);color:#fff;font-size:9px;padding:2px 4px;border-radius:4px;vertical-align:middle;margin-left:4px;" title="Menu này đang bị ẩn khỏi thanh điều hướng">ĐÃ ẨN</span>' : '';

    var btnEditParentHTML = canEdit ? ('  ' + UIButton.createHTML({ icon: 'edit', type: 'tool', className: 'btn-edit-menu-inline', data: { id: rawParentItem.id }, style: 'padding:2px 5px;', tooltip: 'Sửa', iconStyle: 'font-size:13px;' })) : '';
    var btnDelParentHTML = canDelete ? ('  ' + UIButton.createHTML({ icon: 'delete', type: 'tool', className: 'btn-delete-menu-inline', data: { id: rawParentItem.id }, style: 'padding:2px 5px;color:var(--color-danger);', tooltip: 'Xóa', iconStyle: 'font-size:13px;' })) : '';

    // ── BẢNG THÔNG TIN CỦA CHÍNH THƯ MỤC CHA (TRÊN CÙNG) ĐỂ EDIT INLINE ──
    var parentRowHTML = '<tr data-id="' + rawParentItem.id + '" style="background:rgba(var(--color-primary-rgb), 0.05);">'
      + '<td style="text-align:center;padding:5px 2px;">' + UIIcon.renderHtml('star', 'font-size:14px;color:#f59e0b;') + '</td>'
      + '<td class="editable-cell" data-field="id" data-val="' + rawParentItem.id + '" title="Nhấp đúp để sửa" style="padding:5px 4px;"><code style="background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;font-size:11px;cursor:text;font-weight:700;">' + rawParentItem.id + '</code></td>'
      + '<td class="editable-cell" data-field="parent" data-val="' + (rawParentItem.parent || '') + '" title="Nhấp đúp để sửa" style="padding:5px 4px;"><code style="background:rgba(0,0,0,0.03);padding:1px 5px;border-radius:4px;font-size:11px;cursor:text;">' + (rawParentItem.parent || '') + '</code></td>'
      + '<td class="editable-cell" data-field="icon" data-val="' + (rawParentItem.icon || '') + '" title="Nhấp đúp để chọn Icon" style="cursor:text;text-align:center;padding:5px 2px;">' + UIIcon.renderHtml(rawParentItem.icon || 'horizontal_rule', 'font-size:15px;color:var(--color-primary);vertical-align:middle;user-select:none;-webkit-user-select:none;') + '</td>'
      + '<td class="editable-cell" data-field="label" data-val="' + rawParentItem.label + '" title="Nhấp đúp để sửa" style="cursor:text;color:var(--color-primary);padding:5px 4px;"><b>' + rawParentItem.label + '</b>' + pBadgeHTML + '</td>'
      + '<td class="editable-cell" data-field="en" data-val="' + (rawParentItem.en || '') + '" title="Nhấp đúp để sửa tên EN" style="cursor:text;color:var(--color-text-secondary);padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (rawParentItem.en || '') + '</td>'
      + '<td class="editable-cell" data-field="subTitle" data-val="' + (rawParentItem.subTitle || '') + '" title="Nhấp đúp để sửa Phụ đề" style="cursor:text;color:var(--color-text-secondary);padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (rawParentItem.subTitle || '') + '</td>'
      + '<td class="editable-cell" data-field="formName" data-val="' + (rawParentItem.formName || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (rawParentItem.formName || '') + '</td>'
      + '<td class="editable-cell" data-field="formKey" data-val="' + (rawParentItem.formKey || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (rawParentItem.formKey || '') + '</td>'
      + '<td class="editable-cell" data-field="urlPara" data-val="' + (rawParentItem.urlPara || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (rawParentItem.urlPara || '') + '</td>'
      + '<td style="white-space:nowrap; user-select:none; -webkit-user-select:none; text-align:center;padding:5px 2px;">'
      + btnEditParentHTML
      + btnDelParentHTML
      + '</td>'
      + '</tr>';

    var COL_P = '<colgroup><col style="width:4%"><col style="width:8%"><col style="width:8%"><col style="width:4%"><col style="width:16%"><col style="width:10%"><col style="width:10%"><col style="width:14%"><col style="width:9%"><col style="width:7%"><col style="width:10%"></colgroup>';
    var parentTableHTML = '<div style="margin-bottom:20px;">'
      + '<div style="font-weight:700; color:var(--color-text-primary); margin-bottom:8px; font-size:13px; text-transform:uppercase;">' + UIIcon.renderHtml('folder_open', 'vertical-align:bottom;font-size:16px;') + ' Thông tin Thư mục hiện tại (Nhấp đúp để sửa)</div>'
      + '<div class="table-wrapper" style="border-radius:10px;border:1px solid var(--color-primary); overflow-x: auto; -webkit-overflow-scrolling: touch;">'
      + '<table class="data-table no-mobile-stack" style="margin:0; table-layout:fixed; min-width:950px; font-size:11px;">'
      + COL_P
      + '<thead style="background:rgba(var(--color-primary-rgb), 0.1);">'
      + '<tr>'
      + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Root</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Menu ID</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Parent ID</th>'
      + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Icon</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên Menu</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên EN</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Phụ đề</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên Form</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Form Key</th>'
      + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">URL</th>'
      + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Thao tác</th>'
      + '</tr>'
      + '</thead>'
      + '<tbody>' + parentRowHTML + '</tbody>'
      + '</table></div></div>';
    var contentHTML = '';

    if (children.length === 0) {
      contentHTML = UIEmptyState.createHTML({
        icon: 'folder_off',
        title: 'Thư mục này hiện chưa có menu con',
        actionHtml: '<div style="margin-top:12px;">' + UIButton.createHTML({
          text: 'Thêm Menu Con Mới',
          icon: 'add',
          type: 'primary',
          className: 'btn-add-child-inline',
          style: 'padding:6px 16px; border-radius:6px;',
          data: { parent: parentItem.id }
        }) + '</div>'
      });
    } else {
      var rows = children.map(function (c, i) {
        var cIsHidden = (c.isDisable == 1 || c.isDisable === '1' || c.isDisable === true);
        var cBadgeHTML = cIsHidden ? ' <span style="background:var(--color-danger,#f43f5e);color:#fff;font-size:9px;padding:2px 4px;border-radius:4px;vertical-align:middle;margin-left:4px;" title="Menu này đang bị ẩn khỏi thanh điều hướng">ĐÃ ẨN</span>' : '';

        var btnEditChildHTML = canEdit ? ('  ' + UIButton.createHTML({ icon: 'edit', type: 'tool', className: 'btn-edit-menu-inline', data: { id: c.id }, style: 'padding:2px 5px;', tooltip: 'Sửa', iconStyle: 'font-size:13px;' })) : '';
        var btnDelChildHTML = canDelete ? ('  ' + UIButton.createHTML({ icon: 'delete', type: 'tool', className: 'btn-delete-menu-inline', data: { id: c.id }, style: 'padding:2px 5px;color:var(--color-danger);', tooltip: 'Xóa', iconStyle: 'font-size:13px;' })) : '';

        return '<tr class="draggable-child-row" data-id="' + c.id + '">'
          + '<td style="color:var(--color-text-secondary);text-align:center;padding:5px 2px;">'
          + '  <span class="drag-handle" style="font-size:14px; opacity:0.3; cursor:grab; user-select:none; -webkit-user-select:none;" title="Kéo để di chuyển">' + UIIcon.renderHtml('drag_indicator', 'vertical-align:middle;') + '</span>'
          + '  ' + (i + 1)
          + '</td>'
          + '<td class="editable-cell" data-field="id" data-val="' + c.id + '" title="Nhấp đúp để sửa" style="padding:5px 4px;"><code style="background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;font-size:11px;cursor:text;">' + c.id + '</code></td>'
          + '<td class="editable-cell" data-field="parent" data-val="' + (c.parent || '') + '" title="Nhấp đúp để sửa" style="padding:5px 4px;"><code style="background:rgba(0,0,0,0.03);padding:1px 5px;border-radius:4px;font-size:11px;cursor:text;">' + (c.parent || '') + '</code></td>'
          + '<td class="editable-cell" data-field="icon" data-val="' + (c.icon || '') + '" title="Nhấp đúp để chọn Icon" style="cursor:text;text-align:center;padding:5px 2px;">' + UIIcon.renderHtml(c.icon || 'horizontal_rule', 'font-size:15px;color:var(--color-primary);vertical-align:middle;user-select:none;-webkit-user-select:none;') + '</td>'
          + '<td class="editable-cell" data-field="label" data-val="' + c.label + '" title="Nhấp đúp để sửa" style="cursor:text;padding:5px 4px;"><b>' + c.label + '</b>' + cBadgeHTML + '</td>'
          + '<td class="editable-cell" data-field="en" data-val="' + (c.labelEN || '') + '" title="Nhấp đúp để sửa tên EN" style="cursor:text;color:var(--color-text-secondary);padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (c.labelEN || '') + '</td>'
          + '<td class="editable-cell" data-field="subTitle" data-val="' + (c.subTitle || '') + '" title="Nhấp đúp để sửa Phụ đề" style="cursor:text;color:var(--color-text-secondary);padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (c.subTitle || '') + '</td>'
          + '<td class="editable-cell" data-field="formName" data-val="' + (c.formName || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (c.formName || '') + '</td>'
          + '<td class="editable-cell" data-field="formKey" data-val="' + (c.formKey || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (c.formKey || '') + '</td>'
          + '<td class="editable-cell" data-field="urlPara" data-val="' + (c.urlPara || '') + '" style="color:var(--color-text-secondary);cursor:text;padding:5px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Nhấp đúp để sửa">' + (c.urlPara || '') + '</td>'
          + '<td style="white-space:nowrap; user-select:none; -webkit-user-select:none; text-align:center;padding:5px 2px;">'
          + btnEditChildHTML
          + btnDelChildHTML
          + '</td>'
          + '</tr>';
      }).join('');

      var COL_C = '<colgroup><col style="width:6%"><col style="width:8%"><col style="width:8%"><col style="width:4%"><col style="width:14%"><col style="width:10%"><col style="width:10%"><col style="width:14%"><col style="width:9%"><col style="width:7%"><col style="width:10%"></colgroup>';
      var table = '<div class="table-wrapper" style="border-radius:10px;border:1px solid var(--color-border); overflow-x: auto; -webkit-overflow-scrolling: touch;">'
        + '<table class="data-table child-drag-table no-mobile-stack" style="margin:0; table-layout:fixed; min-width:950px; font-size:11px;">'
        + COL_C
        + '<thead><tr>'
        + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Kéo/STT</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Menu ID</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Parent ID</th>'
        + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Icon</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên Menu</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên EN</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Phụ đề</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Tên Form</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">Form Key</th>'
        + '<th style="padding:5px 4px;white-space:nowrap;overflow:hidden;">URL</th>'
        + '<th style="text-align:center;padding:5px 3px;white-space:nowrap;overflow:hidden;">Thao tác</th>'
        + '</tr></thead>'
        + '<tbody>' + rows + '</tbody>'
        + '</table></div>'
        + (canAdd ? ('<div style="margin-top:12px; text-align:center;">'
          + UIButton.createHTML({
            text: 'Thêm Menu Con Mới',
            icon: 'add',
            type: 'outline-primary',
            className: 'btn-add-child-inline',
            style: 'padding:8px 20px; font-weight:600; border-style:dashed; width:100%; border-radius:8px;',
            data: { parent: parentItem.id }
          })
          + '</div>') : '');

      contentHTML = '<div style="margin-top:24px; font-weight:700; color:var(--color-text-primary); margin-bottom:8px; font-size:14px; text-transform:uppercase;">'
        + UIIcon.renderHtml('list', 'vertical-align:bottom;font-size:18px;') + ' Danh sách Menu con</div>'
        + table;
    }

    // Gộp chung Bảng Cha và Danh sách Cọn
    wrapper.innerHTML = parentTableHTML + contentHTML;

    // Bind event cho nút sửa/xóa inline
    wrapper.querySelectorAll('.btn-edit-menu-inline').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var menu = allMenus.find(function (m) { return m.id === btn.dataset.id; });
        if (menu) _openModal(true, menu);
      });
    });

    // Bind event cho nút Thêm Menu Con inline (trực tiếp trên table)
    wrapper.querySelectorAll('.btn-add-child-inline').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tbody = wrapper.querySelector('tbody');
        if (!tbody) {
          // Bảng trống nên tbody nằm trong wrapper.querySelector('.child-drag-table tbody'); 
          // Nhưng khoan, nếu rỗng thì chưa render '<table class="child-drag-table">'.
          // Tuy nhiên, ở bản HTML ta có <div> rỗng nếu list rỗng, nhưng mình vừa thấy ở code (khoảng line 219)
          // `contentHTML` rỗng nếu list rỗng, đâm ra không có bảng.
          // Để giải quyết, ta cứ gọi `_openModal` nếu ko có bảng, hoặc ép nó render bảng.
          // Nhưng để an toàn cứ thử lấy bảng:
        }
        var tableWrapper = wrapper.querySelector('.child-drag-table tbody');
        if (!tableWrapper) {
          // Nếu trống không có table thì cứ mở Modal cho gọn
          _openModal(false, { parent: parentItem.id, isDisable: false });
          return;
        }

        var baseInputStyle = "width:100%; box-sizing:border-box; padding:6px 8px; font-size:13px; border-radius:6px; border:1px solid var(--color-border); outline:none; transition:all 0.2s; background:#fff;";
        var focusInputStyle = "width:100%; box-sizing:border-box; padding:6px 8px; font-size:13px; border-radius:6px; border:1px solid var(--color-primary); outline:none; transition:all 0.2s; background:#fff;";
        var idInputStyle = "width:100%; box-sizing:border-box; padding:6px 8px; font-size:13px; border-radius:6px; border:2px solid var(--color-primary); outline:none; text-align:center; font-weight:700; font-family:monospace; background:#fff;";

        var tr = document.createElement('tr');
        tr.style.background = 'rgba(var(--color-primary-rgb), 0.04)';
        tr.style.boxShadow = 'inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.2)';
        tr.innerHTML = '<td style="color:var(--color-text-secondary);text-align:center;">' + UIIcon.renderHtml('add_circle', 'font-size:18px; color:var(--color-primary);') + '</td>'
          + '<td><input type="text" class="form-control inline-new-id" placeholder="VD: 0305" style="' + idInputStyle + '" autofocus></td>'
          + '<td style="text-align:center;"><code style="background:rgba(0,0,0,0.05);padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;color:var(--color-text-secondary);">' + parentItem.id + '</code></td>'
          + '<td><input type="text" class="form-control inline-new-icon" value="horizontal_rule" style="width:32px; height:32px; padding:0; font-size:20px; font-family:\'Material Symbols Outlined\'; margin:0 auto; text-align:center; border-radius:6px; border:1px solid var(--color-border); outline:none; display:block; color:var(--color-primary); background:#fff;" title="Gõ tên Icon"></td>'
          + '<td><input type="text" class="form-control inline-new-label" placeholder="VD: Báo cáo mới..." style="' + focusInputStyle + '"></td>'
          + '<td><input type="text" class="form-control inline-new-en" placeholder="VD: New Report" style="' + baseInputStyle + '"></td>'
          + '<td><input type="text" class="form-control inline-new-subtitle" placeholder="Phụ đề" style="' + baseInputStyle + '"></td>'
          + '<td><input type="text" class="form-control inline-new-formname" placeholder="Tên Form" style="' + baseInputStyle + '"></td>'
          + '<td><input type="text" class="form-control inline-new-formkey" placeholder="Key" style="' + baseInputStyle + '"></td>'
          + '<td><input type="text" class="form-control inline-new-urlpara" placeholder="?url=" style="' + baseInputStyle + '"></td>'
          + '<td style="text-align:center; white-space:nowrap;">'
          + '  <div style="display:flex; gap:6px; justify-content:center;">'
          + '    ' + UIButton.createHTML({ text: 'Lưu', icon: 'save', type: 'primary', className: 'btn-save-inline-new', style: 'padding:6px 12px;font-size:13px;border-radius:6px;display:flex;align-items:center;gap:4px;font-weight:600;', iconStyle: 'font-size:16px;' })
          + '    ' + UIButton.createHTML({ icon: 'close', type: 'light', className: 'btn-cancel-inline-new', style: 'padding:6px 8px;font-size:13px;border-radius:6px;border:1px solid var(--color-border);display:flex;align-items:center;', tooltip: 'Hủy bỏ', iconStyle: 'font-size:16px;color:var(--color-text-secondary);' })
          + '  </div>'
          + '</td>';

        tableWrapper.appendChild(tr);

        // Hiệu ứng focus cho icon
        var iconInput = tr.querySelector('.inline-new-icon');
        iconInput.addEventListener('focus', function () {
          this.style.borderColor = 'var(--color-primary)';
          if (document.querySelector('.inline-icon-picker')) return;

          var picker = document.createElement('div');
          picker.className = 'inline-icon-picker';
          picker.style.cssText = 'position:fixed; transform:translateX(-50%); width:220px; background:#fff; border:1px solid var(--color-border); box-shadow:0 10px 25px rgba(0,0,0,0.15); border-radius:8px; padding:8px; z-index:9999; display:flex; flex-wrap:wrap; gap:4px; justify-content:center; cursor:default;';

          var updatePickerPos = function () {
            if (!document.body.contains(picker)) {
              window.removeEventListener('scroll', updatePickerPos, true);
              window.removeEventListener('resize', updatePickerPos);
              return;
            }
            var rect = iconInput.getBoundingClientRect();
            var pickerHeight = 240;
            var topPos = rect.bottom + 4;
            if (topPos + pickerHeight > window.innerHeight && rect.top - pickerHeight > 0) topPos = rect.top - pickerHeight - 4;
            picker.style.top = topPos + 'px';
            picker.style.left = (rect.left + rect.width / 2) + 'px';
          };

          var icons = ['article', 'dashboard', 'people', 'bar_chart', 'settings', 'receipt', 'restaurant', 'point_of_sale', 'calendar_month', 'inventory_2', 'assignment', 'group', 'local_shipping', 'local_dining', 'category', 'notifications', 'monitoring', 'event', 'attach_money', 'print', 'folder', 'home', 'description', 'list', 'add', 'edit', 'delete', 'search', 'event_note', 'storefront'];
          icons.forEach(function (ico) {
            var btn = document.createElement('div');
            btn.style.cssText = 'width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:4px; transition:background 0.2s;';
            btn.innerHTML = UIIcon.renderHtml(ico, 'font-size:20px;color:var(--color-primary);');
            btn.title = ico;
            btn.onmouseenter = function () { btn.style.background = 'rgba(0,0,0,0.05)'; };
            btn.onmouseleave = function () { btn.style.background = 'transparent'; };
            btn.onmousedown = function (e) {
              e.preventDefault();
              iconInput.value = ico;
              if (document.querySelector('.inline-icon-picker')) document.querySelector('.inline-icon-picker').remove();
            };
            picker.appendChild(btn);
          });

          document.body.appendChild(picker);
          updatePickerPos();
          window.addEventListener('scroll', updatePickerPos, true);
          window.addEventListener('resize', updatePickerPos);
        });

        iconInput.addEventListener('blur', function () {
          this.style.borderColor = 'var(--color-border)';
          if (document.querySelector('.inline-icon-picker')) document.querySelector('.inline-icon-picker').remove();
        });

        iconInput.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && document.querySelector('.inline-icon-picker')) {
            document.querySelector('.inline-icon-picker').remove();
          }
        });

        // Nút hủy
        tr.querySelector('.btn-cancel-inline-new').addEventListener('click', function () { tr.remove(); });

        // Nút lưu
        tr.querySelector('.btn-save-inline-new').addEventListener('click', function () {
          var btnSave = this;
          var id = tr.querySelector('.inline-new-id').value.trim();
          var label = tr.querySelector('.inline-new-label').value.trim();
          var formName = tr.querySelector('.inline-new-formname').value.trim();
          if (!id || !label || !formName) {
            UIToast.show('Vui lòng nhập ID, Tên Menu và Tên Form', 'error'); return;
          }

          var payload = {
            NhomNguoiDangThaoTac: MenusService.currentGroupId(),
            MenuID: id,
            OldMenuID: '',
            ParentID: parentItem.id,
            Label: label,
            EN: tr.querySelector('.inline-new-en').value.trim(),
            SubTitle: tr.querySelector('.inline-new-subtitle').value.trim(),
            FormName: tr.querySelector('.inline-new-formname').value.trim(),
            FormKey: tr.querySelector('.inline-new-formkey').value.trim(),
            URLPara: tr.querySelector('.inline-new-urlpara').value.trim(),
            Icon: tr.querySelector('.inline-new-icon').value.trim() || 'horizontal_rule',
            IsDisable: 0,
            IsEdit: 0
          };

          btnSave.disabled = true;
          btnSave.innerHTML = '...';

          MenusService.save(payload).then(function (res) {
            if (res && res.code === 0) {
              UIToast.show('Thêm mới thành công!', 'success');
              if (window.Navbar) Navbar.clearMenuCache();
              _loadMenus();
            } else {
              UIToast.show(res.msg || 'Lỗi', 'error');
              btnSave.disabled = false;
              btnSave.innerHTML = 'Lưu';
            }
          }).catch(function () {
            UIToast.show('Lỗi kết nối', 'error');
            btnSave.disabled = false;
            btnSave.innerHTML = 'Lưu';
          });
        });
      });
    });
    wrapper.querySelectorAll('.btn-delete-menu-inline').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var menu = allMenus.find(function (m) { return m.id === btn.dataset.id; });
        if (!menu) return;
        ConfirmModal.show({
          title: 'Xóa Menu',
          message: 'Bạn có chắc muốn xóa menu "' + menu.label + '" không?',
          onConfirm: function () { _deleteMenu(menu.id); }
        });
      });
    });

    // Bind sự kiện kéo thả cho các dòng (Drag & Drop HTML5)
    var dragRows = wrapper.querySelectorAll('.draggable-child-row');
    var dragSrcEl = null;

    dragRows.forEach(function (row) {
      // Chỉ cho phép kéo khi chuột ở vùng tay cầm (drag-handle) để có thể bôi đen chữ copy
      var handle = row.querySelector('.drag-handle');
      if (handle) {
        handle.addEventListener('mouseenter', function () { row.setAttribute('draggable', 'true'); });
        handle.addEventListener('mouseleave', function () { row.removeAttribute('draggable'); });
      }

      row.addEventListener('dragstart', function (e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.style.opacity = '0.5';
        this.style.background = 'var(--color-surface-hover)';
      });

      row.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.style.borderTop = '2px solid var(--color-primary)';
        return false;
      });

      row.addEventListener('dragleave', function (e) {
        this.style.borderTop = '';
      });

      row.addEventListener('drop', function (e) {
        e.stopPropagation();
        this.style.borderTop = '';
        if (dragSrcEl !== this) {
          // Hoán đổi phần tử DOM
          this.parentNode.insertBefore(dragSrcEl, this);

          // Gửi API Cập nhật thứ tự toàn bộ
          var newOrderRows = wrapper.querySelectorAll('.draggable-child-row');
          var orderedIds = [];
          newOrderRows.forEach(function (tr) {
            orderedIds.push(tr.dataset.id);
          });

          MenusService.updateOrder({ type: 'child', orderedIds: orderedIds, parentId: parentItem.id })
            .then(function (res) {
              if (res && res.code === 0) {
                UIToast.show('Đã cập nhật tự động mã Menu thành công', 'success');
                _loadMenus(); // Tải lại vì ID vừa bị hoán đổi (swap) trên database!
              } else {
                UIToast.show('Lỗi cập nhật: ' + (res.msg || ''), 'error');
                _loadMenus();
              }
            }).catch(function () {
              UIToast.show('Lỗi kết nối máy chủ', 'error');
            });
        }
        return false;
      });

      row.addEventListener('dragend', function (e) {
        this.style.opacity = '1';
        this.style.background = '';
        dragRows.forEach(function (r) { r.style.borderTop = ''; });
      });
    });

    // --- Inline Editing ---
    wrapper.querySelectorAll('.editable-cell').forEach(function (td) {
      // Giả lập double tap cho mobile
      var lastTap = 0;
      td.addEventListener('touchend', function (e) {
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
          e.preventDefault(); // Ngăn zoom
          td.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
        }
        lastTap = currentTime;
      });

      td.addEventListener('dblclick', function () {
        if (!Permission.canEdit(_getPermKey())) {
          UIToast.show('Bạn không có quyền sửa Menu.', 'warning');
          return;
        }
        if (this.querySelector('input')) return; // Đang sửa rồi
        var originalHtml = this.innerHTML;
        var val = this.dataset.val;
        var field = this.dataset.field;
        var rowId = this.closest('tr').dataset.id;

        var input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.className = 'form-control ui-input-base';
        if (field === 'id' || field === 'parent') {
          input.style.cssText = 'width:100%; box-sizing:border-box; min-width:70px; padding:6px 8px; font-size:13px; margin:0; border-radius:6px; border:2px solid var(--color-primary); outline:none; text-align:center; font-weight:600; font-family:monospace;';
        }

        if (field === 'icon') {
          input.style.cssText = 'width:32px; height:32px; padding:0; font-size:20px; font-family:"Material Symbols Outlined"; margin:0 auto; text-align:center; border-radius:6px; display:block; color:var(--color-primary);';
          input.placeholder = '...';
        }

        this.innerHTML = '';
        this.appendChild(input);

        if (field === 'icon') {
          var picker = document.createElement('div');
          picker.className = 'inline-icon-picker';
          picker.style.cssText = 'position:fixed; transform:translateX(-50%); width:220px; background:#fff; border:1px solid var(--color-border); box-shadow:0 10px 25px rgba(0,0,0,0.15); border-radius:8px; padding:8px; z-index:9999; display:flex; flex-wrap:wrap; gap:4px; justify-content:center; cursor:default;';

          var cell = this;
          var updatePickerPos = function () {
            if (!document.body.contains(picker)) {
              window.removeEventListener('scroll', updatePickerPos, true);
              window.removeEventListener('resize', updatePickerPos);
              return;
            }
            var rect = cell.getBoundingClientRect();
            var pickerHeight = 240;
            var topPos = rect.bottom + 4;
            if (topPos + pickerHeight > window.innerHeight && rect.top - pickerHeight > 0) {
              topPos = rect.top - pickerHeight - 4;
            }
            picker.style.top = topPos + 'px';
            picker.style.left = (rect.left + rect.width / 2) + 'px';
          };
          var icons = ['article', 'dashboard', 'people', 'bar_chart', 'settings', 'receipt', 'restaurant', 'point_of_sale', 'calendar_month', 'inventory_2', 'assignment', 'group', 'local_shipping', 'local_dining', 'category', 'notifications', 'monitoring', 'event', 'attach_money', 'print', 'folder', 'home', 'description', 'list', 'add', 'edit', 'delete', 'search', 'event_note', 'storefront'];

          icons.forEach(function (ico) {
            var btn = document.createElement('div');
            btn.style.cssText = 'width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:4px; transition:background 0.2s;';
            btn.innerHTML = UIIcon.renderHtml(ico, 'font-size:20px;color:var(--color-primary);');
            btn.title = ico;
            btn.onmouseenter = function () { btn.style.background = 'rgba(0,0,0,0.05)'; };
            btn.onmouseleave = function () { btn.style.background = 'transparent'; };
            btn.onmousedown = function (e) {
              e.preventDefault(); // Giữ focus cho thẻ input để ko kích hoạt blur
              input.value = ico;
              saveInline();
            };
            picker.appendChild(btn);
          });
          document.body.appendChild(picker);
          updatePickerPos();
          window.addEventListener('scroll', updatePickerPos, true);
          window.addEventListener('resize', updatePickerPos);
        }
        input.focus();

        // Chọn dòng chữ
        input.setSelectionRange(0, input.value.length);

        var saveInline = function () {
          var newVal = input.value.trim();
          if (newVal === val || (field === 'id' && newVal === '')) {
            // Hủy sửa
            td.innerHTML = originalHtml;
            if (document.querySelector('.inline-icon-picker')) document.querySelector('.inline-icon-picker').remove();
            return;
          }

          td.innerHTML = '<span style="opacity:0.5;">Đang lưu...</span>';
          if (document.querySelector('.inline-icon-picker')) document.querySelector('.inline-icon-picker').remove();

          var menu = allMenus.find(function (m) { return m.id === rowId; });
          if (!menu) return;

          var payload = {
            NhomNguoiDangThaoTac: MenusService.currentGroupId(),
            MenuID: field === 'id' ? newVal : menu.id,
            OldMenuID: menu.id,
            ParentID: field === 'parent' ? newVal : (menu.parent || ''),
            Label: field === 'label' ? newVal : menu.label,
            EN: field === 'en' ? newVal : (menu.en || ''),
            SubTitle: field === 'subTitle' ? newVal : (menu.subTitle || ''),
            FormName: field === 'formName' ? newVal : menu.formName,
            FormKey: field === 'formKey' ? newVal : (menu.formKey || ''),
            URLPara: field === 'urlPara' ? newVal : (menu.urlPara || ''),
            Icon: field === 'icon' ? newVal : menu.icon,
            IsDisable: (menu.isDisable == 1 || menu.isDisable === '1' || menu.isDisable === true) ? 1 : 0,
            IsEdit: 1
          };

          MenusService.save(payload)
            .then(function (res) {
              if (res && res.code === 0) {
                UIToast.show('Lưu thành công', 'success');
                _loadMenus();
              } else {
                UIToast.show(res.msg || 'Lỗi lưu dữ liệu', 'error');
                td.innerHTML = originalHtml;
              }
            })
            .catch(function () {
              UIToast.show('Lỗi mạng', 'error');
              td.innerHTML = originalHtml;
            });
        };

        // Bắt Enter và Blur
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            input.blur(); // Tự trỏ ra Blur để kích hoạt hàm phía dưới
          } else if (e.key === 'Escape') {
            td.innerHTML = originalHtml; // Hủy
            if (document.querySelector('.inline-icon-picker')) document.querySelector('.inline-icon-picker').remove();
          }
        });

        input.addEventListener('blur', function () {
          saveInline();
        });
      });
    });

    return wrapper;
  }

  // ── Nội dung panel tab CON: Form chỉnh sửa Premium ──
  function _buildChildContent(item) {
    var wrapper = document.createElement('div');
    wrapper.className = 'quick-edit-panel';
    wrapper.style.cssText = 'max-width: 600px; padding: 20px; animation: fadeIn 0.4s ease;';

    // 1. Header
    var header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: 16px; margin-bottom: 30px;';

    var iconBox = document.createElement('div');
    iconBox.className = 'quick-edit-icon-box';
    iconBox.style.cssText = 'width: 64px; height: 64px; background: linear-gradient(135deg, var(--color-primary), #6366f1); color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content:center; box-shadow: 0 8px 16px rgba(var(--color-primary-rgb), 0.2);';
    iconBox.appendChild(UIIcon.create(item.icon || 'article'));
    iconBox.querySelector('span, i').style.fontSize = '32px';

    var titleInfo = document.createElement('div');
    titleInfo.innerHTML = '<div style="font-size: 20px; font-weight: 800; color: var(--color-text-primary);">Cấu hình Menu</div>'
      + '<div style="font-size: 13px; color: var(--color-text-secondary); opacity: 0.7;">Tùy chỉnh thông tin hiển thị và chức năng</div>';

    header.appendChild(iconBox);
    header.appendChild(titleInfo);
    wrapper.appendChild(header);

    // 2. Form Body
    var formBody = document.createElement('div');
    formBody.className = 'quick-edit-form';

    // Tên Menu (VN)
    var inputLabel = UIInput.createText({
      label: 'Tên hiển thị (Tiếng Việt)',
      value: item.label,
      placeholder: 'VD: Báo cáo doanh thu...',
      required: true,
      className: 'mb-4'
    });
    formBody.appendChild(inputLabel);

    var inputSubTitle = UIInput.createText({
      label: 'Phụ đề trang',
      value: item.subTitle || '',
      placeholder: 'VD: Quản lý danh sách...',
      className: 'mb-4'
    });
    formBody.appendChild(inputSubTitle);

    // Grid cho ID và Form
    var grid2 = document.createElement('div');
    grid2.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 1.5rem;';

    var inputId = UIInput.createText({
      label: 'Mã Menu (ID)',
      value: item.id,
      placeholder: 'VD: 14 hoặc 1401'
    });
    inputId.querySelector('input').classList.add('edit-id');
    grid2.appendChild(inputId);

    var inputForm = UIInput.createText({
      label: 'Tên Form / Module',
      value: item.formName,
      placeholder: 'VD: WB_BaoCaoDoanhThu'
    });
    grid2.appendChild(inputForm);
    formBody.appendChild(grid2);

    var grid3 = document.createElement('div');
    grid3.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 1.5rem;';

    var inputFormKey = UIInput.createText({
      label: 'Form Key',
      value: item.formKey || '',
      placeholder: 'Khóa phụ'
    });
    grid3.appendChild(inputFormKey);

    var inputUrlPara = UIInput.createText({
      label: 'URL',
      value: item.urlPara || '',
      placeholder: 'VD: ?type=1'
    });
    grid3.appendChild(inputUrlPara);
    formBody.appendChild(grid3);

    // Icon và Trạng thái
    var inputIcon = UIInput.createText({
      label: 'Icon đại diện (Material Symbol)',
      value: item.icon,
      placeholder: 'VD: bar_chart, settings...',
      className: 'mb-4'
    });
    formBody.appendChild(inputIcon);

    // Toggle ẩn hiện
    var switchWrapper = document.createElement('div');
    switchWrapper.style.cssText = 'background: rgba(0,0,0,0.03); padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;';

    var switchInfo = document.createElement('div');
    switchInfo.innerHTML = '<div style="font-weight: 700; font-size: 14px;">Trạng thái ẩn</div>'
      + '<div style="font-size: 11px; opacity: 0.6;">Tạm thời không hiển thị menu này trên thanh điều hướng</div>';

    var switchInput = document.createElement('div');
    switchInput.className = 'form-check form-switch';
    switchInput.style.padding = '0';
    switchInput.style.margin = '0';
    var isHidden = (item.isDisable == 1 || item.isDisable === '1' || item.isDisable === true);
    switchInput.innerHTML = '<input class="form-check-input" type="checkbox" style="width: 40px; height: 20px; background-size: 16px;" ' + (isHidden ? 'checked' : '') + '>';

    switchWrapper.appendChild(switchInfo);
    switchWrapper.appendChild(switchInput);

    formBody.appendChild(switchWrapper);

    wrapper.appendChild(formBody);

    // 3. Footer / Button
    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.style.cssText = 'width: 100%; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);';
    btnSave.innerHTML = UIIcon.renderHtml('save', 'font-size: 20px;') + ' Cập nhật ngay';

    btnSave.addEventListener('click', function () {
      var formNameVal = inputForm.querySelector('input').value.trim();
      if (!formNameVal) {
        UIToast.show('Vui lòng nhập Tên Form hệ thống', 'error');
        return;
      }
      var updatedData = {
        id: inputId.querySelector('input').value,
        label: inputLabel.querySelector('input').value,
        en: item.labelEN || item.en || '',
        subTitle: inputSubTitle.querySelector('input').value,
        formName: inputForm.querySelector('input').value,
        formKey: inputFormKey.querySelector('input').value,
        urlPara: inputUrlPara.querySelector('input').value,
        icon: inputIcon.querySelector('input').value,
        isDisable: switchInput.querySelector('input').checked,
        isEdit: true,
        oldId: item.id
      };
      _saveMenuDirect(updatedData, btnSave);
    });

    wrapper.appendChild(btnSave);

    // Realtime icon preview
    var iconInputEl = inputIcon.querySelector('input');
    iconInputEl.addEventListener('input', function () {
      iconBox.innerHTML = '';
      var newIcon = UIIcon.create(this.value || 'article');
      if (newIcon) {
        newIcon.style.fontSize = '32px';
        iconBox.appendChild(newIcon);
      }
    });

    return wrapper;
  }

  /**
   * Hàm lưu dữ liệu trực tiếp từ panel
   */
  function _saveMenuDirect(data, btn) {
    var originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = UIIcon.renderHtml('sync', 'font-size:18px; animation: rotation 2s infinite linear;') + ' Đang lưu...';

    var payload = {
      NhomNguoiDangThaoTac: MenusService.currentGroupId(),
      MenuID: data.id,
      OldMenuID: data.oldId,
      Label: data.label,
      SubTitle: data.subTitle,
      FormName: data.formName,
      Icon: data.icon,
      IsDisable: data.isDisable ? 1 : 0,
      IsEdit: 1
    };

    MenusService.save(payload)
      .then(function (res) {
        if (res && res.code === 0) {
          UIToast.show('Đã cập nhật Menu thành công!', 'success');
          if (window.Navbar) Navbar.clearMenuCache();
          _loadMenus(); // Tải lại để cập nhật label trên cây menu bên trái
        } else {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
        }
      })
      .catch(function () {
        Alert.error('Lỗi', 'Không thể kết nối máy chủ');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      });
  }


  // ════════════════════════════════════════════════════════
  //  MODAL
  // ════════════════════════════════════════════════════════
  function _openModal(isEdit, menu) {
    menu = menu || null;
    var modal = $container.querySelector('#modal-menu-form');
    var title = $container.querySelector('#modal-menu-title');
    var isEditInp = $container.querySelector('#menu-is-edit');
    var oldIdInp = $container.querySelector('#menu-old-id');
    var selectParent = $container.querySelector('#menu-parent');

    // Render dropdown Parent (chỉ tab cha)
    var parentNodes = allMenus.filter(function (m) { return !m.parent || m.parent.trim() === ''; });
    var opts = '<option value="">— Là Nhóm Cha (Root) —</option>';
    parentNodes.forEach(function (n) {
      if (isEdit && menu && n.id === menu.id) return;
      opts += '<option value="' + n.id + '">' + n.label + ' (' + n.id + ')</option>';
    });
    selectParent.innerHTML = opts;

    // Render Icon Grid picker
    var iconGrid = $container.querySelector('#modal-icon-picker-grid');
    if (iconGrid && iconGrid.children.length === 0) {
      var icons = ['article', 'dashboard', 'people', 'bar_chart', 'settings', 'receipt', 'restaurant', 'point_of_sale', 'calendar_month', 'inventory_2', 'assignment', 'group', 'local_shipping', 'local_dining', 'category', 'notifications', 'monitoring', 'event', 'attach_money', 'print', 'folder', 'home', 'description', 'list', 'add', 'edit', 'delete', 'search', 'event_note', 'storefront'];
      icons.forEach(function (ico) {
        var btn = document.createElement('div');
        btn.style.cssText = 'width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:4px; transition:background 0.2s;';
        btn.innerHTML = UIIcon.renderHtml(ico, 'font-size:24px;color:var(--color-primary);');
        btn.title = ico;
        btn.onmouseenter = function () { btn.style.background = 'rgba(0,0,0,0.06)'; };
        btn.onmouseleave = function () { btn.style.background = 'transparent'; };
        btn.onclick = function () {
          $container.querySelector('#menu-icon').value = ico;
          $container.querySelector('#menu-icon-preview').textContent = ico;
        };
        iconGrid.appendChild(btn);
      });
    }

    if (isEdit && menu) {
      title.textContent = 'Sửa Menu: ' + menu.label;
      isEditInp.value = '1';
      oldIdInp.value = menu.id;
      $container.querySelector('#menu-id').value = menu.id || '';
      $container.querySelector('#menu-parent').value = menu.parent || '';
      $container.querySelector('#menu-label').value = menu.label || '';
      $container.querySelector('#menu-en').value = menu.en || '';
      $container.querySelector('#menu-subtitle').value = menu.subTitle || '';
      $container.querySelector('#menu-formname').value = menu.formName || '';
      $container.querySelector('#menu-formkey').value = menu.formKey || '';
      $container.querySelector('#menu-urlpara').value = menu.urlPara || '';
      $container.querySelector('#menu-icon').value = menu.icon || '';
      $container.querySelector('#menu-icon-preview').textContent = menu.icon || 'label';
      $container.querySelector('#menu-is-disable').checked = (menu.isDisable == 1 || menu.isDisable === '1' || menu.isDisable === true);
    } else {
      title.textContent = 'Thêm mới Menu';
      isEditInp.value = '0';
      oldIdInp.value = '';
      $container.querySelector('#menu-id').value = '';
      $container.querySelector('#menu-parent').value = '';
      $container.querySelector('#menu-label').value = '';
      $container.querySelector('#menu-en').value = '';
      $container.querySelector('#menu-subtitle').value = '';
      $container.querySelector('#menu-formname').value = '';
      $container.querySelector('#menu-formkey').value = '';
      $container.querySelector('#menu-urlpara').value = '';
      $container.querySelector('#menu-icon').value = '';
      $container.querySelector('#menu-icon-preview').textContent = 'label';
      $container.querySelector('#menu-is-disable').checked = false;
    }

    modal.style.display = 'flex';
    setTimeout(function () { $container.querySelector('#menu-id').focus(); }, 100);
  }

  function _closeModal() {
    $container.querySelector('#modal-menu-form').style.display = 'none';
  }

  // ════════════════════════════════════════════════════════
  //  SAVE
  // ════════════════════════════════════════════════════════
  function _saveMenu() {
    var id = $container.querySelector('#menu-id').value.trim();
    var label = $container.querySelector('#menu-label').value.trim();
    var en = $container.querySelector('#menu-en').value.trim();
    var subtitle = $container.querySelector('#menu-subtitle').value.trim();
    var parent = $container.querySelector('#menu-parent').value;
    var formName = $container.querySelector('#menu-formname').value.trim();
    var formKey = $container.querySelector('#menu-formkey').value.trim();
    var urlPara = $container.querySelector('#menu-urlpara').value.trim();
    var icon = $container.querySelector('#menu-icon').value.trim();
    var isDisable = $container.querySelector('#menu-is-disable').checked ? 1 : 0;
    var isEdit = $container.querySelector('#menu-is-edit').value === '1';
    var oldId = $container.querySelector('#menu-old-id').value;

    if (!id || !label || !formName) {
      Alert.error('Thiếu thông tin', 'Vui lòng nhập Menu ID, Tên Menu (VN) và Tên Form hệ thống');
      return;
    }

    var payload = {
      NhomNguoiDangThaoTac: MenusService.currentGroupId(),
      MenuID: id,
      OldMenuID: oldId,
      ParentID: parent,
      Label: label,
      EN: en,
      SubTitle: subtitle,
      FormName: formName,
      FormKey: formKey,
      URLPara: urlPara,
      Icon: icon,
      IsDisable: isDisable,
      IsEdit: isEdit ? 1 : 0
    };

    var btn = $container.querySelector('#btn-save-menu');
    btn.disabled = true;
    btn.textContent = 'Đang lưu...';

    MenusService.save(payload)
      .then(function (res) {
        if (res && res.code === 0) {
          Alert.success('Thành công', 'Đã lưu Menu thành công!');
          _closeModal();
          if (window.Navbar) Navbar.clearMenuCache();
          _loadMenus();
        } else {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
        }
      })
      .catch(function () {
        Alert.error('Lỗi', 'Kết nối máy chủ bị gián đoạn');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = UIIcon.renderHtml('save', 'font-size:16px;vertical-align:middle;margin-right:4px;') + ' Lưu Thông Tin';
      });
  }

  // ════════════════════════════════════════════════════════
  //  DELETE
  // ════════════════════════════════════════════════════════
  function _deleteMenu(menuId) {
    MenusService.deleteMenu(menuId)
      .then(function (res) {
        if (res && res.code === 0) {
          Alert.success('Thành công', 'Đã xóa Menu!');
          if (window.Navbar) Navbar.clearMenuCache();
          _loadMenus();
        } else {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Xóa thất bại');
        }
      })
      .catch(function () {
        Alert.error('Lỗi', 'Kết nối máy chủ bị gián đoạn');
      });
  }

  return { render: render };
})();
