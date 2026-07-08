/**
 * Sidebar Component
 * Cấu trúc thanh điều hướng bên trái
 * Đã được nâng cấp để lấy Menu động từ Database giống Navbar
 */
var Sidebar = (function () {

  var CACHE_KEY = 'pmql_nav_cache';
  var NAV_CONFIG = [];

  function _buildConfigFromDB(dbMenus) {
    var config = [];
    var parents = dbMenus.filter(function (m) { return !m.parent || String(m.parent).trim() === ''; });
    parents.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });

    parents.forEach(function (p) {
      var children = dbMenus.filter(function (m) { return m.parent === p.id; });
      if (children.length > 0) {
        children.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
        var items = children.map(function (c) {
          return {
            href: c.URLPara || c.urlPara || c.FormKey || '',
            icon: c.icon || c.IconClass || 'circle',
            label: c.label || c.TenMenu || c.VN || ''
          };
        });
        config.push({
          type: 'group',
          icon: p.icon || p.IconClass || 'folder',
          label: p.label || p.TenMenu || p.VN || '',
          items: items
        });
      } else {
        config.push({
          type: 'link',
          href: p.URLPara || p.urlPara || p.FormKey || '',
          icon: p.icon || p.IconClass || 'link',
          label: p.label || p.TenMenu || p.VN || ''
        });
      }
    });
    return config;
  }

  function _buildSidebarNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="nav-item">
            <span class="material-symbols-outlined icon">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="nav-group-title">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="nav-item">
            <span class="material-symbols-outlined icon">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    var groupId = u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';

    // Thử load từ cache giống Navbar
    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
        NAV_CONFIG = cached.config;
        _doRender(container);
        return;
      }
    } catch (e) { }

    // Nếu không có cache, gọi API fetch
    _fetchAndRender(container, groupId);
  }

  function _fetchAndRender(container, groupId) {
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MENU_BY_GROUP : null;

    if (endpoint && window.ApiClient) {
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: groupId,
        UserGroupID: groupId
      }).then(function (res) {
        var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
        if (records && records.length > 0) {
          NAV_CONFIG = _buildConfigFromDB(records);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records
            }));
          } catch (e) { }
        }
        _doRender(container);
      }).catch(function (err) {
        console.error('[Sidebar] Lỗi tải menu từ DB:', err);
        _doRender(container); // Fallback render empty
      });
    } else {
      _doRender(container);
    }
  }

  function _doRender(container) {
    var navHtml = _buildSidebarNavHTML();

    // Fallback HTML nếu DB rỗng
    if (!navHtml) {
      navHtml = `
        <div class="nav-group-title">Hệ Thống</div>
        <a href="#/dashboard" class="nav-item active">
          <span class="material-symbols-outlined icon">dashboard</span>
          Tổng quan
        </a>
      `;
    }

    var html = `
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div style="display:flex; align-items:center; justify-content:flex-start; width:100%; margin: 16px 0; padding-left: 16px;">
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
          </div>
          <!-- Nút đóng Sidebar trên Mobile -->
          <button class="btn-close-sidebar" id="btn-close-sidebar">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav">
          ${navHtml}
        </nav>
      </aside>

      <!-- Overlay mờ khi mở Sidebar trên Mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    container.innerHTML = html;
    _attachEvents();
  }

  function _attachEvents() {
    var $sidebar = document.getElementById('app-sidebar');
    var $btnCloseSidebar = document.getElementById('btn-close-sidebar');
    var $sidebarOverlay = document.getElementById('sidebar-overlay');

    function closeSidebar() {
      if ($sidebar) $sidebar.classList.remove('open');
      if ($sidebarOverlay) $sidebarOverlay.classList.remove('active');
    }

    if ($btnCloseSidebar) {
      $btnCloseSidebar.addEventListener('click', closeSidebar);
    }

    if ($sidebarOverlay) {
      $sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Auto highlight active nav item based on hash
    _highlightActiveNav();
    window.addEventListener('hashchange', _highlightActiveNav);
  }

  function _highlightActiveNav() {
    var currentHash = window.location.hash || '#/dashboard';
    var navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('href') === currentHash) {
        item.classList.add('active');
      }
    });
  }

  return {
    render: render
  };
})();
