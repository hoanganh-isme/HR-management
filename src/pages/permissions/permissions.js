/**
 * Màn hình Phân quyền Cán bộ (Sử dụng Tree Table & Role Tabs)
 * HTML Template: src/pages/permissions/permissions.html
 */
var PermissionsPage = (function () {
  var $container;

  var groups = [];
  var modules = window.MockData ? window.MockData.permissionModules : [];
  var currentSelectedGroup = null;

  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/permissions/permissions.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        try {
          $container.innerHTML = html;

          // CSS nhỏ cho tree table và role tabs
          var style = document.createElement('style');
          style.innerHTML = `
            .tree-row { transition: background 0.2s; }
            .tree-row:hover { background: rgba(148, 163, 184, 0.05); }
            .tree-cell { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
            .tree-toggle { font-size: 20px; transition: transform 0.2s; color: var(--color-text-secondary); width: 20px; text-align: center; }
            .tree-toggle.open { transform: rotate(90deg); }
            .tree-toggle.empty { opacity: 0; pointer-events: none; }
            .tree-icon { font-size: 20px; color: var(--color-primary); }
            .tree-row[data-hidden="true"] { display: none; }

            .role-tab { padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--color-text); }
            .role-tab:hover { background: rgba(148, 163, 184, 0.1); }
            .role-tab.active { background: rgba(60, 80, 224, 0.1); color: var(--color-primary); }

            #perm-ctx-menu { position: fixed; z-index: 9999; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); padding: 4px 0; min-width: 240px; max-height: 80vh; overflow-y: auto; display: none; }
            #perm-ctx-menu .ctx-item { padding: 6px 14px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px; color: var(--color-text, #333); transition: background 0.15s; }
            #perm-ctx-menu .ctx-item:hover { background: rgba(var(--color-primary-rgb, 99,102,241), 0.08); color: var(--color-primary, #6366f1); }
            #perm-ctx-menu .ctx-item.danger { color: var(--color-danger, #ef4444); }
            #perm-ctx-menu .ctx-item.danger:hover { background: rgba(239,68,68,0.08); }
            #perm-ctx-menu .ctx-divider { border: none; border-top: 1px solid var(--color-border, #e2e8f0); margin: 3px 0; }

            /* Tối ưu Responsive cho màn hình nhỏ (Mobile 320px - 768px) */
            @media (max-width: 767.98px) {
              /* Biến danh sách nhóm thành thanh cuộn ngang để tiết kiệm chiều cao */
              #role-list-container {
                display: flex;
                flex-direction: row;
                overflow-x: auto;
                gap: 8px;
                padding: 8px !important;
                white-space: nowrap;
                /* Ẩn scrollbar để đẹp hơn trên mobile */
                scrollbar-width: none; 
              }
              #role-list-container::-webkit-scrollbar { display: none; }
              .role-tab {
                flex: 0 0 auto;
                margin-bottom: 0;
                padding: 8px 16px;
                font-size: 13px;
                border: 1px solid var(--color-border);
              }
              
              /* Sửa header card bên phải để rớt dòng thay vì ép ngang */
              .card-header.d-flex.justify-content-between {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 12px;
              }
              .card-header h3 {
                font-size: 14px !important;
                white-space: normal;
                line-height: 1.4;
              }
              #btn-sync-permission {
                width: 100%;
              }

              /* Thu gọn padding của bảng và kích thước icon */
              .data-table th, .data-table td {
                padding: 8px 4px !important;
                font-size: 12px !important;
              }
              .tree-cell {
                gap: 4px;
              }
              .tree-icon, .tree-toggle {
                font-size: 16px !important;
              }
              .tree-toggle {
                width: 16px;
              }
            }
          `;
          $container.appendChild(style);

          // Tạo context menu element (attach vào body để tránh bị clip)
          var ctxMenu = document.getElementById('perm-ctx-menu');
          if (!ctxMenu) {
            ctxMenu = document.createElement('div');
            ctxMenu.id = 'perm-ctx-menu';
            document.body.appendChild(ctxMenu);
          }

          _renderRoleTabs();
          _setupTreeToggle();
          _setupAutoSave();
          _setupContextMenu();

          var btnSync = $container.querySelector('#btn-sync-permission');
          if (btnSync) btnSync.addEventListener('click', _syncPermissions);

          _fetchGroups();
        } catch (e) {
          $container.innerHTML = '<div style="color:red; padding: 20px;">Lỗi lập trình viên: ' + e.message + '<br>' + e.stack + '</div>';
        }
      });
  }

  function _fetchGroups() {
    var container = $container.querySelector('#role-list-container');
    if (container) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-text-secondary);">Đang tải dữ liệu...</div>';
    }

    PermissionsService.getGroups()
      .then(function (records) {
        if (records.length > 0) {
          groups = records;
          _renderRoleTabs();
        } else {
          if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không lấy được danh sách nhóm quyền');
          if (container) container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-danger);">Lỗi tải dữ liệu</div>';
        }
      })
      .catch(function (err) {
        console.error(err);
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi kết nối máy chủ');
        if (container) container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--color-danger);">Lỗi kết nối</div>';
      });
  }

  function _renderRoleTabs() {
    var container = $container.querySelector('#role-list-container');
    container.innerHTML = '';

    groups.forEach(function (g, idx) {
      var div = document.createElement('div');
      div.className = 'role-tab';
      if (idx === 0) div.classList.add('active');
      div.innerHTML = `${UIIcon.createHTML('group')} ${g.name}`;

      div.addEventListener('click', function () {
        container.querySelectorAll('.role-tab').forEach(function (el) { el.classList.remove('active'); });
        div.classList.add('active');
        currentSelectedGroup = g;
        _renderTreeTableForGroup(g);
      });

      container.appendChild(div);

      if (idx === 0) {
        currentSelectedGroup = g;
      }
    });

    if (currentSelectedGroup) {
      _renderTreeTableForGroup(currentSelectedGroup);
    }
  }

  function _renderTreeTableForGroup(group) {
    var roleNameEl = $container.querySelector('#current-role-name');
    if (roleNameEl) roleNameEl.innerText = group.name;

    var tbody = $container.querySelector('#permission-tree-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 16px;">Đang tải cấu trúc quyền...</td></tr>';

    PermissionsService.getFullMenusByGroup(group.id)
      .then(function (records) {
        // DEBUG: Xem API trả về gì — xóa log này sau khi fix xong
        console.log('[Permissions DEBUG] Group:', group.id, '| Total records:', records.length);
        if (records.length > 0) {
          console.log('[Permissions DEBUG] Sample record:', JSON.stringify(records[0]));
          console.log('[Permissions DEBUG] IsRun values (first 5):', records.slice(0, 5).map(function(r) { return r.id + '=' + r.IsRun; }));
        }
        _buildTreeTableFromApi(group, records);
      })
      .catch(function (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Lỗi kết nối khi tải quyền</td></tr>';
      });
  }

  function _buildTreeTableFromApi(group, records) {
    var tbody = $container.querySelector('#permission-tree-table tbody');
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" class="text-center" style="padding:24px;color:var(--color-text-secondary);">Chưa có dữ liệu phân quyền cho nhóm này</td></tr>';
      return;
    }

    // Inject Root Node for global batch granting
    var hasRoot = records.some(function(r) { return r.id === '00_ROOT' || r.Id === '00_ROOT' || r.MenuId === '00_ROOT'; });
    if (!hasRoot) {
      records.forEach(function(item) {
        if (!item.parent && !item.Parent) {
          item.parent = '00_ROOT';
        }
      });
      records.push({
        id: '00_ROOT',
        label: 'Tất cả chức năng hệ thống',
        icon: 'account_tree',
        parent: ''
      });
    }

    // ── Bước 1: Build map id → item để tra cứu nhanh ──
    var map = {};
    records.forEach(function (item) {
      var id = String(item.id || item.Id || item.MenuId || '');
      item._id = id;
      map[id] = item;
    });

    // ── Bước 2: Xác định folder (có ít nhất 1 item con trỏ vào) ──
    var folderIds = {};
    records.forEach(function (item) {
      var parent = String(item.parent || item.Parent || '');
      if (parent && map[parent]) folderIds[parent] = true;
    });

    // ── Bước 3: Tính level động theo chuỗi parent (đệ quy) ──
    function getLevel(item, depth) {
      if (!depth) depth = 0;
      if (depth > 10) return depth;
      var parent = String(item.parent || item.Parent || '');
      if (!parent || !map[parent]) return depth;
      return getLevel(map[parent], depth + 1);
    }

    // ── Bước 4: Sắp xếp để parent luôn render trước con ──
    records.sort(function (a, b) {
      if (a._id === '00_ROOT') return -1;
      if (b._id === '00_ROOT') return 1;
      return (a._id || '').localeCompare(b._id || '');
    });

    // ── Bước 5: Render từng dòng ──
    records.forEach(function (item) {
      var modId  = item._id;
      var modName = item.label || item.Label || item.VN || item.TenMenu || modId;
      var parent  = String(item.parent || item.Parent || '');
      var parentId = parent || null;
      var level    = getLevel(item);
      var isFolder = !!folderIds[modId];

      // Icon: ưu tiên dùng trực tiếp từ DB (Material Symbol name), fallback theo loại
      var rawIcon = String(item.icon || item.IconClass || '').toLowerCase().trim();
      var parsedIcon = isFolder ? 'folder' : 'description';
      if (rawIcon && rawIcon.indexOf(' ') === -1 && rawIcon.indexOf('-') === -1) {
        parsedIcon = rawIcon; // Tên Material Symbol hợp lệ
      }

      // Chỉ leaf node mới có checkbox, folder chỉ là tiêu đề nhóm
      var perms = isFolder ? null : {
        xem:          item.IsRun        == 1,
        them:         item.IsAdd        == 1,
        sua:          item.IsUpdate     == 1,
        xoa:          item.IsDelete     == 1,
        isManager:    item.isManager    == 1,
        isAdmin:      item.isAdmin      == 1,
        isAutoLock:   item.isAutoLock   == 1,
        isHideAmount: item.isHideAmount == 1,
        isLockDoc:    item.isLockDoc    == 1,
        isUnLockDoc:  item.isUnLockDoc  == 1,
        isExportExcel:item.isExportExcel== 1
      };

      _appendRow(tbody, {
        id:       modId,
        parentId: parentId,
        level:    level,
        label:    modName,
        icon:     parsedIcon,
        isFolder: isFolder,
        expanded: true,
        hidden:   false,
        perms:    perms
      });
    });
  }

  function _setupTreeToggle() {
    var tbody = $container.querySelector('#permission-tree-table tbody');
    tbody.addEventListener('click', function (e) {
      var cell = e.target.closest('.tree-cell');
      if (!cell) return;
      var tr = cell.closest('tr');
      var isFolder = tr.getAttribute('data-is-folder') === 'true';
      if (!isFolder) return;

      var id = tr.getAttribute('data-id');
      var isExpanded = tr.getAttribute('data-expanded') === 'true';
      var toggleIcon = tr.querySelector('.tree-toggle');
      var folderIcon = tr.querySelector('.tree-icon');

      isExpanded = !isExpanded;
      tr.setAttribute('data-expanded', isExpanded);
      if (toggleIcon) {
        if (isExpanded) toggleIcon.classList.add('open');
        else toggleIcon.classList.remove('open');
      }
      if (folderIcon) {
        folderIcon.innerText = isExpanded ? 'folder_open' : 'folder';
      }

      // Hide/show children recursively
      _toggleChildren(tbody, id, isExpanded);
    });
  }

  function _setupAutoSave() {
    var tbody = $container.querySelector('#permission-tree-table tbody');
    tbody.addEventListener('change', function(e) {
      if (e.target.classList.contains('perm-chk')) {
         var tr = e.target.closest('tr');
         if(tr) _saveSingleRowPermission(tr);
      }
    });
  }

  function _toggleChildren(tbody, parentId, show) {
    var children = tbody.querySelectorAll('tr[data-parent="' + parentId + '"]');
    children.forEach(function (childTr) {
      childTr.setAttribute('data-hidden', !show);

      var childId = childTr.getAttribute('data-id');
      var childExpanded = childTr.getAttribute('data-expanded') === 'true';
      if (!show) {
        _toggleChildren(tbody, childId, false);
      } else if (childExpanded) {
        _toggleChildren(tbody, childId, true);
      }
    });
  }

  function _appendRow(tbody, data) {
    var tr = document.createElement('tr');
    tr.className = 'tree-row';
    tr.setAttribute('data-id', data.id);
    tr.setAttribute('data-parent', data.parentId || '');
    tr.setAttribute('data-level', data.level);
    tr.setAttribute('data-is-folder', data.isFolder);
    tr.setAttribute('data-expanded', data.expanded);
    tr.setAttribute('data-hidden', data.hidden ? 'true' : 'false');

    // Create First Column (Tree)
    var tdTree = document.createElement('td');
    tdTree.style.whiteSpace = 'nowrap';
    tdTree.style.minWidth = '220px';
    var paddingLeft = data.level * 20 + 8;

    var toggleHtml = data.isFolder
      ? UIIcon.createHTML('chevron_right', '', `tree-toggle ${data.expanded ? 'open' : ''}`)
      : UIIcon.createHTML('chevron_right', '', 'tree-toggle empty');

    tdTree.innerHTML = `
      <div class="tree-cell" style="padding-left: ${paddingLeft}px;">
        ${toggleHtml}
        ${UIIcon.createHTML(data.icon, '', 'tree-icon')}
        <span class="tree-label" style="font-weight: ${data.isFolder ? '500' : '400'};">${data.label}</span>
      </div>
    `;
    tr.appendChild(tdTree);

    // Create Checkbox Columns
    if (data.perms) {
      tr.appendChild(_createCheckboxTd(data.perms.xem, 'xem'));
      tr.appendChild(_createCheckboxTd(data.perms.them, 'them'));
      tr.appendChild(_createCheckboxTd(data.perms.sua, 'sua'));
      tr.appendChild(_createCheckboxTd(data.perms.xoa, 'xoa'));
      
      tr.appendChild(_createCheckboxTd(data.perms.isManager, 'isManager'));
      tr.appendChild(_createCheckboxTd(data.perms.isAdmin, 'isAdmin'));
      tr.appendChild(_createCheckboxTd(data.perms.isAutoLock, 'isAutoLock'));
      tr.appendChild(_createCheckboxTd(data.perms.isHideAmount, 'isHideAmount'));
      tr.appendChild(_createCheckboxTd(data.perms.isLockDoc, 'isLockDoc'));
      tr.appendChild(_createCheckboxTd(data.perms.isUnLockDoc, 'isUnLockDoc'));
      tr.appendChild(_createCheckboxTd(data.perms.isExportExcel, 'isExportExcel'));
    } else {
      // Empty cells for folder rows
      for (var i = 0; i < 11; i++) {
        var td = document.createElement('td');
        tr.appendChild(td);
      }
    }

    tbody.appendChild(tr);
  }

  function _createCheckboxTd(checked, action) {
    var td = document.createElement('td');
    td.className = 'text-center';
    td.style.padding = '4px 0';
    var wrap = UIControls.createCheckbox({ label: '', checked: checked });
    wrap.style.justifyContent = 'center';
    wrap.style.padding = '0';
    wrap.style.background = 'none';
    var chk = wrap.querySelector('input[type="checkbox"]');
    if (chk && action) {
      chk.classList.add('perm-chk');
      chk.setAttribute('data-action', action);
    }
    td.appendChild(wrap);
    return td;
  }

  function _saveSingleRowPermission(tr, suppressToast) {
    if (!currentSelectedGroup) return Promise.resolve();



    var id = tr.getAttribute('data-id');
    var xem = tr.querySelector('.perm-chk[data-action="xem"]')?.checked || false;
    var them = tr.querySelector('.perm-chk[data-action="them"]')?.checked || false;
    var sua = tr.querySelector('.perm-chk[data-action="sua"]')?.checked || false;
    var xoa = tr.querySelector('.perm-chk[data-action="xoa"]')?.checked || false;
    
    var isManager = tr.querySelector('.perm-chk[data-action="isManager"]')?.checked || false;
    var isAdmin = tr.querySelector('.perm-chk[data-action="isAdmin"]')?.checked || false;
    var isAutoLock = tr.querySelector('.perm-chk[data-action="isAutoLock"]')?.checked || false;
    var isHideAmount = tr.querySelector('.perm-chk[data-action="isHideAmount"]')?.checked || false;
    var isLockDoc = tr.querySelector('.perm-chk[data-action="isLockDoc"]')?.checked || false;
    var isUnLockDoc = tr.querySelector('.perm-chk[data-action="isUnLockDoc"]')?.checked || false;
    var isExportExcel = tr.querySelector('.perm-chk[data-action="isExportExcel"]')?.checked || false;

    var payload = {
      NhomNguoiDangThaoTac: (function() {
        var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
        return u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';
      })(),
      UserGroupID: currentSelectedGroup.id,
      MenuID: id,
      IsRun: xem ? 1 : 0,
      IsAdd: them ? 1 : 0,
      IsUpdate: sua ? 1 : 0,
      IsDelete: xoa ? 1 : 0,
      isManager: isManager ? 1 : 0,
      isAdmin: isAdmin ? 1 : 0,
      isAutoLock: isAutoLock ? 1 : 0,
      isHideAmount: isHideAmount ? 1 : 0,
      isLockDoc: isLockDoc ? 1 : 0,
      isUnLockDoc: isUnLockDoc ? 1 : 0,
      isExportExcel: isExportExcel ? 1 : 0
    };


    
    var label = tr.querySelector('.tree-label') ? tr.querySelector('.tree-label').innerText : id;

    return PermissionsService.savePermission(payload).then(function(res) {
        if (res && res.code === 0) {
           if (!suppressToast) UIToast.show('Đã cập nhật quyền: <b>' + label + '</b>', 'success');
        } else {
           if (!suppressToast) UIToast.show(res.msg || 'Lỗi cập nhật quyền', 'error');
        }
        return res;
    }).catch(function() {
        if (!suppressToast) UIToast.show('Lỗi kết nối khi cập nhật quyền', 'error');
        return null;
    });
  }

  function _syncPermissions() {
    var btn = $container.querySelector('#btn-sync-permission');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${UIIcon.createHTML('sync', 'font-size: 16px; margin-right: 4px; animation: spin 1s linear infinite;')} Đang đồng bộ...`;
    }



    PermissionsService.sync()
      .then(function (res) {
        if (res && res.code === 0) {
          if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã đồng bộ quyền hệ thống');
          // Xóa cache nav để menu mới hiện ngay trên thanh điều hướng
          if (window.Navbar) Navbar.clearMenuCache();
          if (currentSelectedGroup) {
            _renderTreeTableForGroup(currentSelectedGroup);
          }
        } else {
          if (typeof Alert !== 'undefined') Alert.error('Lỗi', res.msg || 'Không thể đồng bộ quyền');
        }
      })
      .catch(function (err) {
        console.error(err);
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi kết nối khi đồng bộ');
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Đồng Bộ';
        }
      });
  }

  function _setupContextMenu() {
    var ctxMenu = document.getElementById('perm-ctx-menu');
    if (!ctxMenu) return;

    var PRESETS = [
      { label: 'Cấm truy cập',                       icon: 'block',           cls: 'danger', p: { xem:0, them:0, sua:0, xoa:0, isManager:0, isAdmin:0, isAutoLock:0, isHideAmount:0, isLockDoc:0, isUnLockDoc:0, isExportExcel:0 } },
      { divider: true },
      { label: 'Cho quyền xem',                       icon: 'visibility',      p: { xem:1, them:0, sua:0, xoa:0, isManager:0, isAdmin:0 } },
      { label: 'Cho quyền thêm',                      icon: 'add_circle',      p: { xem:1, them:1, sua:0, xoa:0, isManager:0, isAdmin:0 } },
      { label: 'Cho quyền sửa',                       icon: 'edit',            p: { xem:1, them:0, sua:1, xoa:0, isManager:0, isAdmin:0 } },
      { label: 'Cho quyền xóa',                       icon: 'delete',          p: { xem:1, them:0, sua:0, xoa:1, isManager:0, isAdmin:0 } },
      { label: 'Cho quyền xem + thêm + sửa + xóa',   icon: 'done_all',        p: { xem:1, them:1, sua:1, xoa:1, isManager:0, isAdmin:0 } },
      { divider: true },
      { label: 'Cho quyền Manager',                   icon: 'manage_accounts', p: { xem:1, them:1, sua:1, xoa:1, isManager:1, isAdmin:0, isExportExcel:1 } },
      { label: 'Cho quyền Admin (tất cả)',             icon: 'shield',          p: { xem:1, them:1, sua:1, xoa:1, isManager:1, isAdmin:1, isAutoLock:1, isHideAmount:1, isLockDoc:1, isUnLockDoc:1, isExportExcel:1 } },
      { divider: true },
      { label: 'Tắt/Mở tự động khóa sau In phiếu',   icon: 'lock_clock',      toggle: 'isAutoLock' },
      { label: 'Cho/Cấm xem cột số tiền',             icon: 'attach_money',    toggle: 'isHideAmount' },
      { label: 'Quyền khóa / Mở khóa chứng từ',      icon: 'lock',            toggle: 'isLockDoc', alsoToggle: 'isUnLockDoc' },
      { label: 'Quyền xuất Excel',                    icon: 'file_download',   toggle: 'isExportExcel' },
    ];

    // Build menu HTML
    ctxMenu.innerHTML = PRESETS.map(function(item, idx) {
      if (item.divider) return '<hr class="ctx-divider">';
      var icon = item.icon
        ? '<span class="material-symbols-outlined" style="font-size:18px; flex-shrink:0;">' + item.icon + '</span>'
        : '<span style="width:18px; flex-shrink:0;"></span>';
      return '<div class="ctx-item ' + (item.cls || '') + '" data-idx="' + idx + '">' + icon + item.label + '</div>';
    }).join('');

    // Hide on click outside (left click)
    document.addEventListener('click', function() { ctxMenu.style.display = 'none'; });
    // Hide on right-click outside — but skip if inside the table (table listener handles it)
    document.addEventListener('contextmenu', function(e) {
      if (!e.target.closest('#perm-ctx-menu') && !e.target.closest('#permission-tree-table')) {
        ctxMenu.style.display = 'none';
      }
    });

    // Show menu on right-click on a leaf row (has checkboxes)
    var tbody = $container.querySelector('#permission-tree-table tbody');
    tbody.addEventListener('contextmenu', function(e) {
      var tr = e.target.closest('tr.tree-row');
      if (!tr) return;
      e.preventDefault();
      e.stopPropagation(); // Chặn bubble lên document listener để tránh menu bị ẩn ngay lập tức

      // Position menu — smart placement
      var x = e.clientX, y = e.clientY;
      // Hiện tạm để đo kích thước thực
      ctxMenu.style.visibility = 'hidden';
      ctxMenu.style.display    = 'block';
      var menuW = ctxMenu.offsetWidth  || 280;
      var menuH = ctxMenu.offsetHeight || 360;
      ctxMenu.style.visibility = '';
      // Nếu gần mép phải → hiện sang trái con trỏ
      if (x + menuW > window.innerWidth  - 8) x = x - menuW;
      // Nếu gần mép dưới → dịch lên trên con trỏ
      if (y + menuH > window.innerHeight - 8) y = y - menuH;
      // Đảm bảo không âm
      x = Math.max(4, x);
      y = Math.max(4, y);
      ctxMenu.style.left    = x + 'px';
      ctxMenu.style.top     = y + 'px';
      ctxMenu.style.display = 'block';
      ctxMenu._targetRow    = tr;
    });

    // Handle menu item click
    ctxMenu.addEventListener('click', function(e) {
      var item = e.target.closest('.ctx-item');
      if (!item) return;
      var idx    = parseInt(item.getAttribute('data-idx'));
      var preset = PRESETS[idx];
      var tr     = ctxMenu._targetRow;
      if (!preset || !tr) return;
      ctxMenu.style.display = 'none';
      _applyPreset(tr, preset);
    });
  }

  function _applyPreset(tr, preset) {
    var isFolder = tr.getAttribute('data-is-folder') === 'true';
    var targetRows = [];
    
    if (isFolder) {
      var level = parseInt(tr.getAttribute('data-level') || '0', 10);
      var nextTr = tr.nextElementSibling;
      while (nextTr && nextTr.classList.contains('tree-row')) {
        var nextLevel = parseInt(nextTr.getAttribute('data-level') || '0', 10);
        if (nextLevel <= level) break;
        if (nextTr.getAttribute('data-is-folder') !== 'true') {
          targetRows.push(nextTr);
        }
        nextTr = nextTr.nextElementSibling;
      }
    } else {
      targetRows.push(tr);
    }

    var suppressToast = targetRows.length > 1;
    var promises = [];

    targetRows.forEach(function(targetTr) {
      function setChk(action, val) {
        var chk = targetTr.querySelector('.perm-chk[data-action="' + action + '"]');
        if (chk) chk.checked = !!val;
      }
      function getChk(action) {
        var chk = targetTr.querySelector('.perm-chk[data-action="' + action + '"]');
        return chk ? chk.checked : false;
      }

      if (preset.toggle) {
        var newVal = !getChk(preset.toggle);
        setChk(preset.toggle, newVal);
        if (preset.alsoToggle) setChk(preset.alsoToggle, newVal);
      } else if (preset.p) {
        Object.keys(preset.p).forEach(function(k) { setChk(k, preset.p[k]); });
      }

      promises.push(_saveSingleRowPermission(targetTr, suppressToast));
    });

    if (suppressToast && promises.length > 0) {
      Promise.all(promises).then(function() {
        var label = tr.querySelector('.tree-label') ? tr.querySelector('.tree-label').innerText : 'Nhóm này';
        UIToast.show('Đã cập nhật quyền hàng loạt cho: <b>' + label + '</b>', 'success');
      });
    }
  }

  return { render: render };
})();
