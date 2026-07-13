/**
 * Navbar Component
 * Thanh điều hướng ngang trên cùng — thay thế sidebar dọc.
 * Có dropdown xổ xuống cho từng nhóm menu.
 * Hỗ trợ chuyển đổi layout ngang ↔ dọc (sidebar mode).
 */
var Navbar = (function () {

  /* ─────────────────────────────────────────
     Layout Mode (lưu vào localStorage)
  ───────────────────────────────────────── */
  var LAYOUT_KEY = window.APP_SETTINGS ? APP_SETTINGS.storageKey('layout_mode') : 'pmql_layout_mode';
  var LAYOUT_HORIZONTAL = 'horizontal';
  var LAYOUT_VERTICAL = 'vertical';

  function getLayout() {
    return localStorage.getItem(LAYOUT_KEY) || LAYOUT_HORIZONTAL;
  }

  function setLayout(mode) {
    localStorage.setItem(LAYOUT_KEY, mode);
  }

  /* Áp dụng layout lên <body> */
  function applyLayout(mode) {
    document.body.setAttribute('data-layout', mode);

    var $app = document.getElementById('app');
    if (!$app) return;

    if (mode === LAYOUT_VERTICAL) {
      $app.classList.add('layout-vertical');
      $app.classList.remove('layout-horizontal');
    } else {
      $app.classList.add('layout-horizontal');
      $app.classList.remove('layout-vertical');
    }
  }

  /* ─────────────────────────────────────────
     Cấu hình menu — load từ DB (100% dynamic)
  ───────────────────────────────────────── */
  var NAV_CONFIG = [];

  function _buildConfigFromDB(dbMenus) {
    var config = [];
    // API trả về: id, parent, label, icon, URLPara
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

  /* ─────────────────────────────────────────
     Build HTML helpers
  ───────────────────────────────────────── */
  function _buildMenuHTML() {
    return NAV_CONFIG.map(function (item) {
      if (item.type === 'link') {
        return `
          <a href="${item.href}" class="nav-link" data-href="${item.href}">
            <span class="material-symbols-outlined nav-icon">${item.icon}</span>
            ${item.label}
          </a>`;
      }

      var dropdownItems = item.items.map(function (di) {
        return `
          <a href="${di.href}" class="dropdown-item" data-href="${di.href}">
            <span class="material-symbols-outlined drop-icon">${di.icon}</span>
            ${di.label}
          </a>`;
      }).join('');

      return `
        <div class="nav-group" data-group>
          <button class="nav-group-btn">
            <span class="material-symbols-outlined nav-icon">${item.icon}</span>
            ${item.label}
            <span class="material-symbols-outlined chevron">expand_more</span>
          </button>
          <div class="nav-dropdown">
            ${dropdownItems}
          </div>
        </div>`;
    }).join('');
  }

  /* Sidebar nav items (for vertical mode) */
  function _buildSidebarNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="nav-item" data-href="${item.href}">
            <span class="material-symbols-outlined icon">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="nav-group-title">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="nav-item" data-href="${di.href}">
            <span class="material-symbols-outlined icon">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  /* Mobile drawer nav */
  function _buildMobileNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function (item) {
      if (item.type === 'link') {
        html += `
          <a href="${item.href}" class="mobile-nav-item" data-href="${item.href}">
            <span class="material-symbols-outlined">${item.icon}</span>
            ${item.label}
          </a>`;
        return;
      }
      html += `<div class="mobile-nav-divider"></div>
               <div class="mobile-nav-section-label">${item.label}</div>`;
      item.items.forEach(function (di) {
        html += `
          <a href="${di.href}" class="mobile-nav-item" data-href="${di.href}">
            <span class="material-symbols-outlined">${di.icon}</span>
            ${di.label}
          </a>`;
      });
    });
    return html;
  }

  /* ── Layout switcher buttons HTML ── */

  /* ─────────────────────────────────────────
     Render — Horizontal (Navbar) mode
  ───────────────────────────────────────── */
  function _renderHorizontal(container) {
    var layout = getLayout();
    var html = `
      <!-- ═══ TOP NAVBAR ═══ -->
      <nav class="app-navbar" id="app-navbar">

        <!-- Hamburger (mobile only) -->
        <button class="navbar-hamburger" id="navbar-hamburger">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Brand / Logo -->
        <div class="navbar-brand" onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; cursor: pointer;">
          <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; margin-left: 16px;">
          <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px; margin-left: 16px;">
        </div>

        <!-- Desktop Menu with scroll arrows -->
        <div class="navbar-menu-wrapper" id="navbar-menu-wrapper">
          <button class="navbar-scroll-arrow navbar-scroll-left" id="navbar-scroll-left" title="Cuộn trái">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <ul class="navbar-menu" id="navbar-menu">
            ${_buildMenuHTML()}
          </ul>
          <button class="navbar-scroll-arrow navbar-scroll-right" id="navbar-scroll-right" title="Cuộn phải">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- Right Actions -->
        <div class="navbar-right">
          <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); if (window.APP_SETTINGS) { APP_SETTINGS.setStored('theme', isDark ? 'dark' : 'light'); } else { localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); } this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
            <span class="material-symbols-outlined" id="header-theme-icon-horizontal">dark_mode</span>
          </div>
          <div class="navbar-icon-btn" id="navbar-btn-notif" title="Thông báo">
            <span class="material-symbols-outlined">notifications</span>
            <span class="badge-dot"></span>
          </div>
          <div class="navbar-user" id="navbar-user">
            <div class="user-avatar-nav">
              <img id="nav-avatar-img" src="https://ui-avatars.com/api/?name=User&background=3C50E0&color=fff" alt="User">
            </div>
            <div class="user-info-nav">
              <div class="user-name-nav" id="nav-user-name">Người dùng</div>
              <div class="user-role-nav" id="nav-user-role">Nhân viên</div>
            </div>
            <span class="material-symbols-outlined expand-icon">expand_more</span>

            <!-- User dropdown -->
            <div class="user-dropdown" id="user-dropdown">
              <!-- No Header (Admin/Role removed) -->

              <div class="user-dropdown-item">
                <span class="material-symbols-outlined">person</span>
                Hồ sơ cá nhân
              </div>
              <a href="#/appearance" class="user-dropdown-item" style="text-decoration: none;">
                <span class="material-symbols-outlined">palette</span>
                Cài đặt Giao diện
              </a>

              <div class="dropdown-divider"></div>

              <div class="user-dropdown-item danger" onclick="ConfirmModal.show({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất khỏi hệ thống?', onConfirm: window.logoutApp })">
                <span class="material-symbols-outlined">logout</span>
                Đăng xuất
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- ═══ MOBILE DRAWER ═══ -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay"></div>
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-header">
          <div class="mobile-drawer-brand" onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; justify-content:center; width:100%; margin: 12px 0; cursor: pointer;">
            <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; border-radius: 6px;">
            <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
          </div>
          <button class="mobile-drawer-close" id="mobile-drawer-close">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <nav class="mobile-drawer-nav" id="mobile-drawer-nav">
          ${_buildMobileNavHTML()}
        </nav>
      </div>
    `;
    container.innerHTML = html;
    _attachHorizontalEvents();
  }

  /* ─────────────────────────────────────────
     Render — Vertical (Sidebar) mode
  ───────────────────────────────────────── */
  function _renderVertical(container) {
    var layout = getLayout();
    var html = `
      <!-- ════ VERTICAL LAYOUT: Sidebar + Header ════ -->
      <div class="vertical-layout-shell" id="vertical-layout-shell">

        <!-- Sidebar -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-header">
            <div onclick="window.location.hash='#/dashboard'" style="display:flex; align-items:center; justify-content:flex-start; width:100%; margin: 16px 0; padding-left: 16px; cursor: pointer;">
              <img src="./src/assets/logo-full-cropped.png" class="app-logo-light" alt="Nhân sự Logo" style="width: 45px; height: 45px; border-radius: 6px;">
              <img src="./src/assets/logo-full-cropped-dark.png" class="app-logo-dark" alt="Nhân sự Logo" style="width: 45px; height: 45px;">
            </div>
            <button class="btn-close-sidebar" id="btn-close-sidebar">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          <nav class="sidebar-nav" id="sidebar-nav">
            ${_buildSidebarNavHTML()}
          </nav>
        </aside>

        <!-- Sidebar overlay (mobile) -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <!-- Main area (header + content) -->
        <div class="vertical-main" id="vertical-main">

          <!-- Vertical Header -->
          <header class="app-header" id="app-header">
            <div class="header-left">
              <button class="btn-hamburger" id="btn-hamburger">
                <span class="material-symbols-outlined">menu</span>
              </button>
              <div class="search-box">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Type to search...">
              </div>
            </div>

            <div class="header-right">
              <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); if (window.APP_SETTINGS) { APP_SETTINGS.setStored('theme', isDark ? 'dark' : 'light'); } else { localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); } this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
                <span class="material-symbols-outlined" id="header-theme-icon-vertical">dark_mode</span>
              </div>
              <div class="navbar-icon-btn" onclick="Alert.info('Thông báo', 'Bạn không có thông báo mới')">
                <span class="material-symbols-outlined">notifications</span>
                <span class="badge-dot"></span>
              </div>
              <div class="navbar-user" id="vertical-user-profile">
                <div class="user-avatar-nav">
                  <img id="vert-nav-avatar-img" src="https://ui-avatars.com/api/?name=User&background=3C50E0&color=fff" alt="User">
                </div>
                <div class="user-info-nav">
                  <div class="user-name-nav" id="vert-nav-user-name">Người dùng</div>
                  <div class="user-role-nav" id="vert-nav-user-role">Nhân viên</div>
                </div>
                <span class="material-symbols-outlined expand-icon">expand_more</span>

                <!-- Vertical user dropdown -->
                <div class="user-dropdown" id="vertical-user-dropdown">
                  <!-- No Header (Admin/Role removed) -->
                  <div class="user-dropdown-item">
                    <span class="material-symbols-outlined">person</span>
                    Hồ sơ cá nhân
                  </div>
                  <a href="#/appearance" class="user-dropdown-item" style="text-decoration: none;">
                    <span class="material-symbols-outlined">palette</span>
                    Cài đặt Giao diện
                  </a>

                  <div class="dropdown-divider"></div>

                  <div class="user-dropdown-item danger" onclick="ConfirmModal.show({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất?', onConfirm: window.logoutApp })">
                    <span class="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </div>
                </div>
              </div>
            </div>
          </header>

        </div><!-- /vertical-main -->
      </div><!-- /vertical-layout-shell -->
    `;
    container.innerHTML = html;
    _attachVerticalEvents();
  }

  var CACHE_KEY = window.APP_SETTINGS ? APP_SETTINGS.storageKey('nav_cache') : 'pmql_nav_cache';

  function render(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var currentUser = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    var groupId = MetadataModuleConfig.getUserGroupId(currentUser);
    var userName = currentUser.HoTen || currentUser.FullName || currentUser.UserName || currentUser.username || currentUser.TaiKhoan || 'Người dùng';

    // Check version server trước — nếu khác cache thì tự clear (bắt được thay đổi từ máy Admin)
    if (window.SystemDataService && SystemDataService.getMenuSyncVersion) {
      SystemDataService.getMenuSyncVersion().then(function (serverVer) {
        try {
          var cached = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem(CACHE_KEY)) || 'null');
          var cacheVer = cached && cached.syncVer ? cached.syncVer : null;
          // Nếu server version khác với cache version → xóa cache, fetch lại
          if (serverVer && cacheVer && serverVer !== cacheVer) {
            if (window.APP_SETTINGS) APP_SETTINGS.removeSession('nav_cache'); else sessionStorage.removeItem(CACHE_KEY);
            cached = null;
          }
          if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
            NAV_CONFIG = cached.config;
            if (cached.rawRecords && window.Router && typeof Router.addDynamicRoutes === 'function') {
              Router.addDynamicRoutes(cached.rawRecords);
            }
            _doRender(container);
            return;
          }
        } catch (e) { }
        _fetchAndRender(container, groupId, serverVer);
      }).catch(function () {
        // Lỗi API → dùng cache nếu có, không thì fetch nav
        _fetchAndRender(container, groupId, null);
      });
    } else {
      // Fallback: không có SystemDataService → dùng cache như cũ
      try {
        var cached = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getSession('nav_cache', 'null') : sessionStorage.getItem(CACHE_KEY)) || 'null');
        if (cached && cached.groupId === groupId && cached.config && cached.config.length > 0) {
          NAV_CONFIG = cached.config;
          if (cached.rawRecords && window.Router && typeof Router.addDynamicRoutes === 'function') {
            Router.addDynamicRoutes(cached.rawRecords);
          }
          _doRender(container);
          return;
        }
      } catch (e) { }
      _fetchAndRender(container, groupId, null);
    }
  }

  function _fetchAndRender(container, groupId, syncVer) {
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
          if (window.Router && typeof Router.addDynamicRoutes === 'function') {
            Router.addDynamicRoutes(records);
          }
          // Lưu cache kèm syncVer để lần sau so sánh
          try {
            var cachePayload = JSON.stringify({
              groupId: groupId,
              config: NAV_CONFIG,
              rawRecords: records,
              syncVer: syncVer || ''
            });
            if (window.APP_SETTINGS) APP_SETTINGS.setSession('nav_cache', cachePayload); else sessionStorage.setItem(CACHE_KEY, cachePayload);
          } catch (e) { }
        }
        _doRender(container);
      }).catch(function (err) {
        console.error('[Navbar] Lỗi tải menu từ DB:', err);
        _doRender(container);
      });
    } else {
      _doRender(container);
    }
  }

  /* Xóa cache khi logout hoặc đổi nhóm quyền */
  function clearMenuCache() {
    if (window.APP_SETTINGS) APP_SETTINGS.removeSession('nav_cache'); else sessionStorage.removeItem(CACHE_KEY);
    NAV_CONFIG = [];
  }

  /* Lắng nghe EventBus để tự động clear cache */
  if (window.EventBus) {
    EventBus.on('user:logout', clearMenuCache); // khi đăng xuất
    EventBus.on('permissions:changed', clearMenuCache); // khi admin đổi quyền
    EventBus.on('menu:changed', clearMenuCache); // khi menu được chỉnh sửa
  }

  function _doRender(container) {
    var mode = getLayout();
    applyLayout(mode);
    _adjustAppLayout(mode);

    if (mode === LAYOUT_VERTICAL) {
      _renderVertical(container);
    } else {
      _renderHorizontal(container);
    }

    // UPDATE USER INFO IN DOM AFTER RENDER
    var currentUser = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    var userName = currentUser.HoTen || currentUser.FullName || currentUser.UserName || currentUser.username || currentUser.TaiKhoan || 'Người dùng';
    var navUserName = document.getElementById('nav-user-name');
    var vertNavUserName = document.getElementById('vert-nav-user-name');
    var navAvatar = document.getElementById('nav-avatar-img');
    var vertNavAvatar = document.getElementById('vert-nav-avatar-img');

    if (navUserName) navUserName.textContent = userName;
    if (vertNavUserName) vertNavUserName.textContent = userName;
    if (navAvatar) navAvatar.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=3C50E0&color=fff";
    if (vertNavAvatar) vertNavAvatar.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=3C50E0&color=fff";

    // Fetch and update Com1 setup value for user roles (outer nav only)
    if (window.SystemDataService && window.SystemDataService.getSetupValue) {
      SystemDataService.getSetupValue('Com1').then(function (val) {
        if (val) {
          document.querySelectorAll('.user-role-nav').forEach(function (el) {
            el.innerText = val;
          });
        }
      }).catch(function (err) {
        console.error('[Navbar] Lỗi tải SetupValue Com1:', err);
      });
    }
  }

  /* Adjust #app and #app-content structure per mode */
  function _adjustAppLayout(mode) {
    var $app = document.getElementById('app');
    var $content = document.getElementById('app-content');
    if (!$app) return;

    // Reset any inline styles that might interfere
    $app.style.flexDirection = '';
  }

  /* ─────────────────────────────────────────
     Move #app-content into vertical-main
     (only for vertical mode)
  ───────────────────────────────────────── */
  function _moveContentToVerticalMain() {
    var $vertMain = document.getElementById('vertical-main');
    var $content = document.getElementById('app-content');
    if ($vertMain && $content && !$vertMain.contains($content)) {
      $vertMain.appendChild($content);
    }
  }

  /* Move #app-content back to #app (horizontal mode) */
  function _moveContentToApp() {
    var $app = document.getElementById('app');
    var $content = document.getElementById('app-content');
    if ($app && $content && $content.parentNode !== $app) {
      $app.appendChild($content);
    }
  }

  /* ─────────────────────────────────────────
     Events — Horizontal mode
  ───────────────────────────────────────── */
  function _attachHorizontalEvents() {
    var groups = document.querySelectorAll('.nav-group[data-group]');

    function _positionDropdown(group) {
      var btn = group.querySelector('.nav-group-btn');
      var dropdown = group.querySelector('.nav-dropdown');
      if (!btn || !dropdown) return;
      var rect = btn.getBoundingClientRect();
      var left = rect.left;
      var top = rect.bottom + 8;
      // Đảm bảo không tràn phải
      var dropW = dropdown.offsetWidth || 220;
      if (left + dropW > window.innerWidth - 10) {
        left = window.innerWidth - dropW - 10;
      }
      if (left < 5) left = 5;
      dropdown.style.left = left + 'px';
      dropdown.style.top = top + 'px';
    }

    groups.forEach(function (group) {
      var btn = group.querySelector('.nav-group-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = group.classList.contains('open');
          groups.forEach(function (g) { g.classList.remove('open'); });
          _closeUserDropdown();
          if (!isOpen) {
            group.classList.add('open');
            _positionDropdown(group);
          }
        });
      }
    });

    var $user = document.getElementById('navbar-user');
    if ($user) {
      $user.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = $user.classList.contains('open');
        groups.forEach(function (g) { g.classList.remove('open'); });
        if (isOpen) {
          _closeUserDropdown();
        } else {
          $user.classList.add('open');
        }
      });
    }

    var $notif = document.getElementById('navbar-btn-notif');
    if ($notif) {
      $notif.addEventListener('click', function () {
        Alert.info('Thông báo', 'Bạn không có thông báo mới');
      });
    }

    document.addEventListener('click', function () {
      groups.forEach(function (g) { g.classList.remove('open'); });
      _closeUserDropdown();
    });

    // Mobile drawer
    var $hamburger = document.getElementById('navbar-hamburger');
    var $overlay = document.getElementById('mobile-drawer-overlay');
    var $drawer = document.getElementById('mobile-drawer');
    var $drawerClose = document.getElementById('mobile-drawer-close');

    function openDrawer() { if ($drawer) $drawer.classList.add('open'); if ($overlay) $overlay.classList.add('active'); }
    function closeDrawer() { if ($drawer) $drawer.classList.remove('open'); if ($overlay) $overlay.classList.remove('active'); }

    if ($hamburger) $hamburger.addEventListener('click', openDrawer);
    if ($drawerClose) $drawerClose.addEventListener('click', closeDrawer);
    if ($overlay) $overlay.addEventListener('click', closeDrawer);

    document.querySelectorAll('.mobile-nav-item').forEach(function (item) {
      item.addEventListener('click', function () { setTimeout(closeDrawer, 150); });
    });

    // ── Scroll arrows cho navbar-menu ──
    var $menu = document.getElementById('navbar-menu');
    var $scrollLeft = document.getElementById('navbar-scroll-left');
    var $scrollRight = document.getElementById('navbar-scroll-right');

    function updateScrollArrows() {
      if (!$menu || !$scrollLeft || !$scrollRight) return;
      var scrollable = $menu.scrollWidth > $menu.clientWidth + 2;
      $scrollLeft.style.display = (scrollable && $menu.scrollLeft > 5) ? 'flex' : 'none';
      $scrollRight.style.display = (scrollable && $menu.scrollLeft < $menu.scrollWidth - $menu.clientWidth - 5) ? 'flex' : 'none';
    }

    if ($menu && $scrollLeft && $scrollRight) {
      $scrollLeft.addEventListener('click', function (e) {
        e.stopPropagation();
        $menu.scrollBy({ left: -200, behavior: 'smooth' });
      });
      $scrollRight.addEventListener('click', function (e) {
        e.stopPropagation();
        $menu.scrollBy({ left: 200, behavior: 'smooth' });
      });
      $menu.addEventListener('scroll', updateScrollArrows);
      window.addEventListener('resize', updateScrollArrows);
      setTimeout(updateScrollArrows, 100);
    }

    _highlightActive();
    window.addEventListener('hashchange', _highlightActive);
  }

  /* ─────────────────────────────────────────
     Events — Vertical mode
  ───────────────────────────────────────── */
  function _attachVerticalEvents() {
    // Move content into vertical-main
    _moveContentToVerticalMain();

    // Sidebar toggle
    var $sidebar = document.getElementById('app-sidebar');
    var $overlay = document.getElementById('sidebar-overlay');
    var $btnOpen = document.getElementById('btn-hamburger');
    var $btnClose = document.getElementById('btn-close-sidebar');

    function openSidebar() { if ($sidebar) $sidebar.classList.add('open'); if ($overlay) $overlay.classList.add('active'); }
    function closeSidebar() { if ($sidebar) $sidebar.classList.remove('open'); if ($overlay) $overlay.classList.remove('active'); }

    if ($btnOpen) $btnOpen.addEventListener('click', openSidebar);
    if ($btnClose) $btnClose.addEventListener('click', closeSidebar);
    if ($overlay) $overlay.addEventListener('click', closeSidebar);

    // Auto-close sidebar on mobile when a nav item is clicked
    if ($sidebar) {
      $sidebar.querySelectorAll('.nav-item').forEach(function (item) {
        item.addEventListener('click', function () {
          if (window.innerWidth <= 768) {
            setTimeout(closeSidebar, 150);
          }
        });
      });
    }

    // User dropdown in vertical header
    var $uProf = document.getElementById('vertical-user-profile');
    var $uDrop = document.getElementById('vertical-user-dropdown');
    if ($uProf && $uDrop) {
      $uProf.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = $uProf.classList.contains('open');
        $uProf.classList.toggle('open', !isOpen);

        // Also toggle 'open' on dropdown if needed by other CSS
        $uDrop.classList.toggle('open', !isOpen);

        var expandIcon = $uProf.querySelector('.expand-icon');
        if (expandIcon) {
          expandIcon.textContent = isOpen ? 'expand_more' : 'expand_less';
        }
      });
    }

    document.addEventListener('click', function () {
      if ($uDrop) $uDrop.classList.remove('open');
      if ($uProf) $uProf.classList.remove('open');
    });

    _highlightActive();
    window.addEventListener('hashchange', _highlightActive);
  }

  /* ─────────────────────────────────────────
     Helpers
  ───────────────────────────────────────── */
  function _closeUserDropdown() {
    var $user = document.getElementById('navbar-user');
    if ($user) $user.classList.remove('open');
  }

  function _highlightActive() {
    var hash = window.location.hash || '#/dashboard';

    // Horizontal: nav-links & dropdown items
    document.querySelectorAll('.navbar-menu .nav-link').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
    document.querySelectorAll('.navbar-menu .dropdown-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });

    // Vertical: sidebar items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-href') === hash);
    });
  }

  return {
    render: render,
    getLayout: getLayout,
    setLayout: setLayout,
    applyLayout: applyLayout,
    clearMenuCache: clearMenuCache,
    moveContentToApp: _moveContentToApp,
    moveContentToVerticalMain: _moveContentToVerticalMain
  };
})();
