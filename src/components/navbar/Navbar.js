/**
 * Navbar / Sidebar Component
 * Tách biệt hoàn toàn trách nhiệm: Sidebar & Header render độc lập trong container riêng.
 * KHÔNG BAO GIỜ chạm, append hay reparent #app-content.
 */
var Navbar = (function () {

  var LAYOUT_KEY = 'pmql_layout_mode';
  var LAYOUT_VERTICAL = 'vertical';
  var LAYOUT_HORIZONTAL = 'horizontal';

  var CACHE_KEY = 'pmql_nav_cache';
  var CACHE_CONTRACT_VERSION = 3;
  var SESSION_OPEN_GROUPS_KEY = 'pmql_sidebar_open_groups';

  var NAV_CONFIG_TREE = [];
  var RAW_MENU_RECORDS = [];
  var _listenersBound = false;

  function getLayout() {
    return localStorage.getItem(LAYOUT_KEY) || LAYOUT_VERTICAL;
  }

  function setLayout(mode) {
    localStorage.setItem(LAYOUT_KEY, mode);
  }

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

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ─────────────────────────────────────────
     Menu Normalization & Tree Builder (Section 6)
  ───────────────────────────────────────── */
  function normalizeMenuRecords(records) {
    if (!Array.isArray(records)) return [];
    var seen = {};
    var normalized = [];
    records.forEach(function (r) {
      if (!r) return;
      var id = String(r.MenuID || r.id || r.ID || r.MenuId || '').trim();
      if (!id || seen[id]) return;
      seen[id] = true;

      var parentId = String(r.Parent || r.parent || r.ParentID || r.parentId || '').trim();
      var label = String(r.VN || r.label || r.TenMenu || r.Title || r.VN || '').trim();
      var icon = String(r.icon || r.IconIndex || r.IconClass || 'circle').trim();
      var href = String(r.URLPara || r.urlPara || r.FormKey || r.href || '').trim();

      if (href && !href.startsWith('#/')) {
        if (href.startsWith('/')) href = '#' + href;
        else if (!href.startsWith('#')) href = '#/' + href;
      }

      normalized.push({
        id: id,
        parentId: parentId,
        label: label,
        icon: icon,
        href: href
      });
    });
    return normalized;
  }

  function buildMenuTree(records) {
    var normalized = normalizeMenuRecords(records);
    var itemMap = {};
    normalized.forEach(function (item) {
      item.children = [];
      itemMap[item.id] = item;
    });

    var tree = [];
    normalized.forEach(function (item) {
      if (item.parentId && itemMap[item.parentId] && item.parentId !== item.id) {
        itemMap[item.parentId].children.push(item);
      } else {
        tree.push(item);
      }
    });
    return tree;
  }

  /* ─────────────────────────────────────────
     Active Route Helpers (Section 13)
  ───────────────────────────────────────── */
  function normalizeRouteHref(href) {
    if (!href) return '';
    var hash = href.split('?')[0].split('&')[0];
    return hash.trim();
  }

  function isRouteActive(menuHref, currentHash) {
    if (!menuHref || !currentHash) return false;
    var normMenu = normalizeRouteHref(menuHref);
    var normCurrent = normalizeRouteHref(currentHash);
    return normMenu === normCurrent;
  }

  function getStoredOpenGroups() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_OPEN_GROUPS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setStoredOpenGroups(groups) {
    try {
      sessionStorage.setItem(SESSION_OPEN_GROUPS_KEY, JSON.stringify(groups));
    } catch (e) { }
  }

  /* ─────────────────────────────────────────
     HTML Rendering Helpers
  ───────────────────────────────────────── */
  function renderSidebarTreeHTML(tree, currentHash) {
    var openGroups = getStoredOpenGroups();
    var html = '';

    tree.forEach(function (item) {
      var isLink = !item.children || item.children.length === 0;

      if (isLink) {
        var activeClass = isRouteActive(item.href, currentHash) ? 'sidebar-menu__item--active active' : '';
        html += `
          <a href="${escapeHTML(item.href)}" class="sidebar-menu__item nav-item ${activeClass}" data-href="${escapeHTML(item.href)}" title="${escapeHTML(item.label)}">
            <span class="material-symbols-outlined sidebar-menu__icon icon">${escapeHTML(item.icon)}</span>
            <span class="sidebar-menu__label nav-text">${escapeHTML(item.label)}</span>
          </a>`;
      } else {
        var hasActiveChild = item.children.some(function (child) { return isRouteActive(child.href, currentHash); });
        var isOpen = hasActiveChild || openGroups.indexOf(item.id) !== -1;
        var groupOpenClass = isOpen ? 'sidebar-group--open open' : '';

        var subItemsHtml = item.children.map(function (child) {
          var childActive = isRouteActive(child.href, currentHash) ? 'sidebar-menu__item--active active' : '';
          var iconName = (child.icon && child.icon !== 'remove' && child.icon !== '-') ? child.icon : 'fiber_manual_record';
          var iconClass = iconName === 'fiber_manual_record' ? 'sidebar-menu__icon--bullet' : '';
          return `
            <a href="${escapeHTML(child.href)}" class="sidebar-menu__item nav-item sub-item ${childActive}" data-href="${escapeHTML(child.href)}" title="${escapeHTML(child.label)}">
              <span class="material-symbols-outlined sidebar-menu__icon icon ${iconClass}">${escapeHTML(iconName)}</span>
              <span class="sidebar-menu__label nav-text">${escapeHTML(child.label)}</span>
            </a>`;
        }).join('');

        html += `
          <div class="sidebar-group nav-group-accordion ${groupOpenClass}" data-group-id="${escapeHTML(item.id)}">
            <button type="button" class="sidebar-group__trigger nav-group-accordion-btn" title="${escapeHTML(item.label)}">
              <div class="sidebar-group__left nav-group-left">
                <span class="material-symbols-outlined sidebar-menu__icon icon">${escapeHTML(item.icon)}</span>
                <span class="sidebar-menu__label nav-group-text">${escapeHTML(item.label)}</span>
              </div>
              <span class="material-symbols-outlined sidebar-menu__chevron chevron">expand_more</span>
            </button>
            <div class="sidebar-group__children nav-group-accordion-content">
              ${subItemsHtml}
            </div>
          </div>`;
      }
    });

    return html;
  }

  /* ─────────────────────────────────────────
     Render Sidebar Component (Section 5)
  ───────────────────────────────────────── */
  function renderSidebar(containerId) {
    var id = containerId || 'sidebar-container';
    var container = document.getElementById(id);
    if (!container) return;

    var currentHash = window.location.hash || '#/dashboard';
    var html = `
      <aside class="app-sidebar" id="app-sidebar">
        <!-- Sidebar Header / Brand -->
        <div class="sidebar-header">
          <button type="button" class="sidebar-brand-link" data-sidebar-home aria-label="Về trang tổng quan">
            <span class="sidebar-brand-mark" aria-hidden="true">
              <img class="sidebar-brand-logo" src="./src/assets/logo-full-cropped.png" alt="" />
            </span>
            <span class="sidebar-brand-title">HRM</span>
          </button>
          <button type="button" class="btn-close-sidebar" id="btn-close-sidebar" title="Đóng menu" aria-label="Đóng menu">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <div class="sidebar-section-label">Main Menu</div>

        <!-- Scrollable Navigation -->
        <nav class="sidebar-nav" id="sidebar-nav">
          ${renderSidebarTreeHTML(NAV_CONFIG_TREE, currentHash)}
        </nav>

        <!-- Fixed Footer -->
        <div class="sidebar-footer">
          <div class="widget-meeting">
            <div class="widget-header">
              <div class="widget-icon">
                <span class="material-symbols-outlined">groups</span>
              </div>
              <div>
                <div class="widget-title">Hệ thống HRM</div>
                <div class="widget-sub">Phiên bản 2.15 • Enterprise</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Sidebar Overlay (Mobile) -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    container.innerHTML = html;
    _bindSidebarEvents(container);
  }

  /* ─────────────────────────────────────────
     Render Header Component (Section 5)
  ───────────────────────────────────────── */
  function renderHeader(containerId) {
    var id = containerId || 'header-container';
    var container = document.getElementById(id);
    if (!container) return;

    var currentUser = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    var userName = currentUser.HoTen || currentUser.FullName || currentUser.UserName || currentUser.username || currentUser.TaiKhoan || 'Admin';

    var html = `
      <header class="app-header" id="app-header">
        <div class="header-left">
          <button type="button" class="btn-hamburger" id="btn-hamburger" title="Mở menu" aria-label="Mở menu" aria-controls="app-sidebar" aria-expanded="false">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <button type="button" class="mobile-header-brand" data-header-home aria-label="Về trang tổng quan">
            <img src="./src/assets/logo-full-cropped.png" alt="HRM" />
          </button>
          <div class="header-welcome d-none d-md-block">
            <span>Xin chào, <strong id="header-user-greeting">${escapeHTML(userName)}</strong> 👋</span>
          </div>
          <div class="search-box ms-md-3" data-global-search-container>
            <span class="material-symbols-outlined">search</span>
            <input type="search" data-global-search aria-label="Tìm kiếm dữ liệu" autocomplete="off" placeholder="Tìm kiếm dữ liệu...">
          </div>
        </div>

        <div class="header-right">
          <div class="header-lang-btn" title="Ngôn ngữ">
            <span class="material-symbols-outlined" style="font-size:18px;">language</span>
            <span class="lang-code">VN</span>
          </div>
          <div class="navbar-icon-btn" onclick="var isDark = document.body.classList.toggle('dark-theme'); localStorage.setItem('pmql_theme', isDark ? 'dark' : 'light'); this.querySelector('span').innerText = isDark ? 'light_mode' : 'dark_mode';" title="Chuyển giao diện">
            <span class="material-symbols-outlined" id="header-theme-icon-vertical">dark_mode</span>
          </div>
          <div class="navbar-icon-btn" onclick="if(window.Alert) Alert.info('Thông báo', 'Bạn không có thông báo mới')">
            <span class="material-symbols-outlined">notifications</span>
            <span class="badge-dot"></span>
          </div>
          <div class="navbar-user" id="vertical-user-profile">
            <div class="user-avatar-nav">
              <img id="vert-nav-avatar-img" src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3C50E0&color=fff" alt="User">
            </div>
            <div class="user-info-nav">
              <div class="user-name-nav" id="vert-nav-user-name">${escapeHTML(userName)}</div>
              <div class="user-role-nav" id="vert-nav-user-role">Quản trị hệ thống</div>
            </div>
            <span class="material-symbols-outlined expand-icon">expand_more</span>

            <!-- Vertical user dropdown -->
            <div class="user-dropdown" id="vertical-user-dropdown">
              <div class="user-dropdown-item">
                <span class="material-symbols-outlined">person</span>
                Hồ sơ cá nhân
              </div>
              <a href="#/appearance" class="user-dropdown-item" style="text-decoration: none;">
                <span class="material-symbols-outlined">palette</span>
                Cài đặt Giao diện
              </a>
              <div class="dropdown-divider"></div>
              <div class="user-dropdown-item danger" onclick="if(window.ConfirmModal) ConfirmModal.show({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất?', onConfirm: window.logoutApp }); else if(window.logoutApp) window.logoutApp();">
                <span class="material-symbols-outlined">logout</span>
                Đăng xuất
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    container.innerHTML = html;
    _bindHeaderEvents(container);
  }

  /* ─────────────────────────────────────────
     Event Binding (Delegation ONCE, Section 7)
  ───────────────────────────────────────── */
  function _bindSidebarEvents(container) {
    container.onclick = function (e) {
      var homeBtn = e.target.closest('[data-sidebar-home]');
      if (homeBtn) {
        e.preventDefault();
        window.location.hash = '#/dashboard';
        if (window.innerWidth <= 1024) _closeMobileDrawer();
        return;
      }

      var trigger = e.target.closest('.sidebar-group__trigger, .nav-group-accordion-btn');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        var group = trigger.closest('.sidebar-group, .nav-group-accordion');
        if (group) {
          var isNowOpen = !group.classList.contains('sidebar-group--open') && !group.classList.contains('open');
          group.classList.toggle('sidebar-group--open', isNowOpen);
          group.classList.toggle('open', isNowOpen);

          var groupId = group.getAttribute('data-group-id');
          if (groupId) {
            var openGroups = getStoredOpenGroups();
            var idx = openGroups.indexOf(groupId);
            if (isNowOpen && idx === -1) openGroups.push(groupId);
            else if (!isNowOpen && idx !== -1) openGroups.splice(idx, 1);
            setStoredOpenGroups(openGroups);
          }
        }
        return;
      }

      var closeBtn = e.target.closest('#btn-close-sidebar');
      var overlay = e.target.closest('#sidebar-overlay');
      if (closeBtn || overlay) {
        _closeMobileDrawer();
        return;
      }

      var linkItem = e.target.closest('.sidebar-menu__item, .nav-item');
      if (linkItem && window.innerWidth <= 1024) {
        setTimeout(_closeMobileDrawer, 150);
      }
    };
  }

  function _getQuickSearchInput() {
    return document.getElementById('toolbar-quick-search') ||
      document.querySelector('#dynamic-filter-container input[type="search"], #dynamic-filter-container input[type="text"]');
  }

  function _filterVisibleTableRows(keyword) {
    var normalized = String(keyword || '').trim().toLocaleLowerCase();
    document.querySelectorAll('#app-content .data-table tbody tr').forEach(function (row) {
      var matches = !normalized || String(row.textContent || '').toLocaleLowerCase().indexOf(normalized) !== -1;
      row.hidden = !matches;
    });
  }

  function _applyGlobalSearch(value) {
    var keyword = String(value || '').trim();
    window.__globalSearchKeyword = keyword;

    var quickSearchInput = _getQuickSearchInput();
    if (quickSearchInput) {
      if (quickSearchInput.value !== keyword) quickSearchInput.value = keyword;
      quickSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (window.tabulatorInstance && typeof window.tabulatorInstance.setFilter === 'function') {
      var table = window.tabulatorInstance;
      if (!keyword && typeof table.clearFilter === 'function') {
        table.clearFilter();
      } else {
        var lowered = keyword.toLocaleLowerCase();
        table.setFilter(function (data) {
          if (!lowered) return true;
          return Object.keys(data || {}).some(function (key) {
            return String(data[key] == null ? '' : data[key]).toLocaleLowerCase().indexOf(lowered) !== -1;
          });
        });
      }
    } else {
      _filterVisibleTableRows(keyword);
    }

    document.dispatchEvent(new CustomEvent('app:global-search', {
      detail: { keyword: keyword }
    }));
  }

  function _resetGlobalSearch() {
    window.__globalSearchKeyword = '';
    var headerInput = document.querySelector('[data-global-search]');
    if (headerInput) headerInput.value = '';
    var quickSearchInput = _getQuickSearchInput();
    if (quickSearchInput && quickSearchInput.value) {
      quickSearchInput.value = '';
      quickSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (window.tabulatorInstance && typeof window.tabulatorInstance.clearFilter === 'function') {
      window.tabulatorInstance.clearFilter();
    } else {
      _filterVisibleTableRows('');
    }
  }

  function _bindHeaderEvents(container) {
    var headerHome = container.querySelector('[data-header-home]');
    if (headerHome) {
      headerHome.onclick = function () {
        window.location.hash = '#/dashboard';
      };
    }

    var btnOpen = container.querySelector('#btn-hamburger');
    if (btnOpen) {
      btnOpen.onclick = function (e) {
        e.stopPropagation();
        _openMobileDrawer();
      };
    }

    var globalSearchInput = container.querySelector('[data-global-search]');
    if (globalSearchInput) {
      var searchTimer;
      globalSearchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          _applyGlobalSearch(globalSearchInput.value);
        }, 250);
      });
      globalSearchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          globalSearchInput.value = '';
          _applyGlobalSearch('');
        }
      });
    }

    var uProf = container.querySelector('#vertical-user-profile');
    var uDrop = container.querySelector('#vertical-user-dropdown');
    if (uProf && uDrop) {
      var userTriggers = uProf.querySelectorAll('.user-avatar-nav, .user-info-nav, .expand-icon');
      var toggleUserDropdown = function (e) {
        e.stopPropagation();
        var isOpen = uProf.classList.contains('open');
        uProf.classList.toggle('open', !isOpen);
        uDrop.classList.toggle('open', !isOpen);
      };
      if (userTriggers.length) {
        userTriggers.forEach(function (trigger) {
          trigger.addEventListener('click', toggleUserDropdown);
        });
      } else {
        uProf.addEventListener('click', toggleUserDropdown);
      }
      uDrop.addEventListener('click', function (e) { e.stopPropagation(); });
    }
  }

  function _openMobileDrawer() {
    var sidebar = document.querySelector('.app-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var trigger = document.getElementById('btn-hamburger');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sidebar-drawer-open');
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(function () {
      var closeBtn = document.getElementById('btn-close-sidebar');
      if (closeBtn) closeBtn.focus();
    });
  }

  function _closeMobileDrawer() {
    var sidebar = document.querySelector('.app-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var trigger = document.getElementById('btn-hamburger');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sidebar-drawer-open');
    document.body.style.overflow = '';
  }

  function _bindGlobalOnce() {
    if (_listenersBound) return;
    _listenersBound = true;

    window.addEventListener('hashchange', function () {
      updateActiveRoute();
      _resetGlobalSearch();
      if (window.innerWidth <= 1024) _closeMobileDrawer();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) _closeMobileDrawer();
    });

    document.addEventListener('click', function (e) {
      var uProf = document.getElementById('vertical-user-profile');
      var uDrop = document.getElementById('vertical-user-dropdown');
      if (uProf && uDrop && !uProf.contains(e.target)) {
        uProf.classList.remove('open');
        uDrop.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        _closeMobileDrawer();
        var uProf = document.getElementById('vertical-user-profile');
        var uDrop = document.getElementById('vertical-user-dropdown');
        if (uProf && uDrop) {
          uProf.classList.remove('open');
          uDrop.classList.remove('open');
        }
      }
    });
  }

  /* ─────────────────────────────────────────
     Update Active Route (Section 13)
  ───────────────────────────────────────── */
  function updateActiveRoute() {
    var currentHash = window.location.hash || '#/dashboard';

    document.querySelectorAll('.sidebar-nav .sidebar-menu__item, .sidebar-nav .nav-item').forEach(function (el) {
      var href = el.getAttribute('data-href') || el.getAttribute('href');
      var isActive = isRouteActive(href, currentHash);
      el.classList.toggle('sidebar-menu__item--active', isActive);
      el.classList.toggle('active', isActive);

      if (isActive) {
        var group = el.closest('.sidebar-group, .nav-group-accordion');
        if (group) {
          group.classList.add('sidebar-group--open');
          group.classList.add('open');
          var groupId = group.getAttribute('data-group-id');
          if (groupId) {
            var openGroups = getStoredOpenGroups();
            if (openGroups.indexOf(groupId) === -1) {
              openGroups.push(groupId);
              setStoredOpenGroups(openGroups);
            }
          }
        }
      }
    });
  }

  /* ─────────────────────────────────────────
     Cache & Fetch Logic (Section 14)
  ───────────────────────────────────────── */
  function clearMenuCache() {
    sessionStorage.removeItem(CACHE_KEY);
    NAV_CONFIG_TREE = [];
    RAW_MENU_RECORDS = [];
  }

  function refreshMenu() {
    clearMenuCache();
    return renderSidebar();
  }

  function _loadMenuData(callback) {
    var currentUser = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    var groupId = currentUser.UserGroupID || currentUser.userGroupID || currentUser.Group || currentUser.GroupID || currentUser.NhomQuyen || 'Admin';

    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.contractVersion === CACHE_CONTRACT_VERSION && cached.groupId === groupId && Array.isArray(cached.rawRecords) && cached.rawRecords.length > 0) {
        RAW_MENU_RECORDS = cached.rawRecords;
        NAV_CONFIG_TREE = buildMenuTree(RAW_MENU_RECORDS);
        if (window.Router && typeof Router.addDynamicRoutes === 'function') {
          Router.addDynamicRoutes(RAW_MENU_RECORDS);
        }
        callback();
        return;
      }
    } catch (e) { }

    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MENU_BY_GROUP : null;

    if (endpoint && window.ApiClient) {
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: groupId,
        UserGroupID: groupId
      }).then(function (res) {
        var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
        if (records && records.length > 0) {
          RAW_MENU_RECORDS = records;
          NAV_CONFIG_TREE = buildMenuTree(records);
          if (window.Router && typeof Router.addDynamicRoutes === 'function') {
            Router.addDynamicRoutes(records);
          }
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              groupId: groupId,
              rawRecords: records,
              contractVersion: CACHE_CONTRACT_VERSION
            }));
          } catch (e) { }
        }
        callback();
      }).catch(function (err) {
        console.error('[Navbar] Lỗi tải menu từ DB:', err);
        callback();
      });
    } else {
      callback();
    }
  }

  /* ─────────────────────────────────────────
     Public API Method Navbar.render() (Section 5)
  ───────────────────────────────────────── */
  function render(sidebarContainerId, headerContainerId) {
    applyLayout(getLayout());
    _bindGlobalOnce();

    _loadMenuData(function () {
      renderSidebar(sidebarContainerId || 'sidebar-container');
      renderHeader(headerContainerId || 'header-container');
      updateActiveRoute();
    });
  }

  /* Lắng nghe EventBus để tự động clear cache */
  if (window.EventBus) {
    EventBus.on('user:logout', clearMenuCache);
    EventBus.on('permissions:changed', clearMenuCache);
    EventBus.on('menu:changed', refreshMenu);
  }

  return {
    render: render,
    renderSidebar: renderSidebar,
    renderHeader: renderHeader,
    refreshMenu: refreshMenu,
    updateActiveRoute: updateActiveRoute,
    clearMenuCache: clearMenuCache,
    getLayout: getLayout,
    setLayout: setLayout,
    applyLayout: applyLayout,
    normalizeMenuRecords: normalizeMenuRecords,
    buildMenuTree: buildMenuTree
  };
})();
