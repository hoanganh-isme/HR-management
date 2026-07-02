/**
 * Router — Hash-based SPA routing cho Quản lý Nhân sự
 * ─────────────────────────────────────────────────────
 * Kiến trúc: Mảng ROUTES cấu hình → Dynamic script loading → pageFn.render()
 * Template do Page Module tự fetch (Router cung cấp cache layer)
 * Tham khảo: Medstand Router v9
 */
var Router = (function () {

  // ── Route definitions ──────────────────────────────────────────────────
  var ROUTES = [
    { path: '/dashboard', template: 'src/pages/dashboard/dashboard.html', script: 'src/pages/dashboard/dashboard.js', perm: 'tongquan', title: 'Tổng quan', pageFn: 'DashboardPage', hideHeader: true },
    { path: '/components-demo', template: 'src/pages/components-demo/components-demo.html', script: 'src/pages/components-demo/components-demo.js', perm: 'uidemo', title: 'Bản test Component', pageFn: 'ComponentsDemoPage' },
    { path: '/appearance', template: 'src/pages/appearance/appearance.html', script: 'src/pages/appearance/appearance.js', perm: '', title: 'Cấu hình Giao diện', pageFn: 'AppearancePage' },
    { path: '/document-manager', template: 'src/pages/document-manager/document-manager.html', script: 'src/pages/document-manager/document-manager.js', perm: '', title: 'Workspace Tài Liệu', pageFn: 'DocumentManagerPage', hideHeader: true },
    { path: '/categories', template: 'src/pages/categories/categories.html', script: 'src/pages/categories/categories.js', perm: '', title: '', pageFn: 'CategoriesPage' },
    { path: '/inventory', template: 'src/pages/inventory/inventory.html', script: 'src/pages/inventory/inventory.js', perm: '', title: 'Kho & Định lượng', pageFn: 'InventoryPage' },
    { path: '/cash-flow', template: 'src/pages/cash-flow/cash-flow.html', script: 'src/pages/cash-flow/cash-flow.js', perm: '', title: 'Kế toán & Quỹ tiền mặt', pageFn: 'CashFlowPage' },
    { path: '/calendar', template: 'src/pages/calendar/calendar.html', script: 'src/pages/calendar/calendar.js', perm: '', title: '', pageFn: 'CalendarPage' },
    { path: '/menus', template: 'src/pages/menus/menus.html', script: 'src/pages/menus/menus.js', perm: '', title: '', pageFn: 'MenusPage' },
    { path: '/promotions', template: 'src/pages/promotions/promotions.html', script: 'src/pages/promotions/promotions.js', perm: '', title: '', pageFn: 'PromotionsPage' },
    { path: '/report-revenue', template: 'src/pages/report-revenue/report-revenue.html', script: 'src/pages/report-revenue/report-revenue.js', perm: '', title: '', pageFn: 'ReportRevenuePage' },
    { path: '/report-cost', template: 'src/pages/report-cost/report-cost.html', script: 'src/pages/report-cost/report-cost.js', perm: '', title: '', pageFn: 'ReportCostPage' },
    { path: '/report-other', template: 'src/pages/report-other/report-other.html', script: 'src/pages/report-other/report-other.js', perm: '', title: '', pageFn: 'ReportOtherPage' },
    { path: '/survey', template: 'src/pages/survey/survey.html', script: 'src/pages/survey/survey.js', perm: '', title: '', pageFn: 'SurveyPage' },
    { path: '/hall-status', template: 'src/pages/hall-status/hall-status.html', script: 'src/pages/hall-status/hall-status.js', perm: '', title: '', pageFn: 'HallStatusPage' },
    { path: '/settings', template: 'src/pages/settings/settings.html', script: 'src/pages/settings/settings.js', perm: '', title: '', pageFn: 'SettingsPage' },
    { path: '/permissions', template: 'src/pages/permissions/permissions.html', script: 'src/pages/permissions/permissions.js', perm: '', title: '', pageFn: 'PermissionsPage' },
    { path: '/detail', template: 'src/pages/detail/detail.html', script: 'src/pages/detail/detail.js', perm: '', title: 'Chi tiết', pageFn: 'DetailPage', hideHeader: true }
  ];

  function addDynamicRoutes(menus) {
    if (!menus || !Array.isArray(menus)) return;

    var currentHash = window.location.hash.replace('#', '').split('?')[0] || '/dashboard';
    var needsReload = false;

    menus.forEach(function (m) {
      // url có thể nằm ở URLPara hoặc urlPara
      var rawUrl = m.URLPara || m.urlPara || '';
      if (!rawUrl || rawUrl.trim() === '') return;

      // Chỉnh sửa: Loại bỏ dấu '#' và '/' thừa nếu người dùng lỡ nhập vào DB (vd: '#/customers' -> 'customers')
      var url = rawUrl.trim().replace(/^#\/?/, '').replace(/^\//, '');
      if (url === '') return;

      var path = '/' + url;

      var existingRoute = ROUTES.find(function (r) { return r.path === path; });

      if (existingRoute) {
        // Cập nhật thông tin từ database nếu route custom đã được định nghĩa cứng
        existingRoute.perm = m.FormName || m.formName || existingRoute.perm;
        existingRoute.title = m.MenuName || m.VN || m.label || existingRoute.title || '';
        existingRoute.subTitle = m.SubTitle || m.subTitle || existingRoute.subTitle || '';
        if (m.HideHeader || m.hideHeader) existingRoute.hideHeader = true;

        _routeMap[path] = existingRoute;
        if (path === currentHash) needsReload = true;
        return;
      }

      var route = {
        path: path,
        perm: m.FormName || m.formName,
        title: m.MenuName || m.VN || m.label || '',
        subTitle: m.SubTitle || m.subTitle || '',
        hideHeader: m.HideHeader || m.hideHeader || false
      };

      var formKey = m.FormKey || m.formKey;
      var formName = m.FormName || m.formName || '';

      var existingConfig = null;

      // 1. Tìm config dựa vào FormKey hoặc FormName
      if (window.APP_MODULES) {
        if (formKey && window.APP_MODULES[formKey]) {
          existingConfig = window.APP_MODULES[formKey];
        } else if (formName) {
          var targetName = formName.toLowerCase();
          for (var k in window.APP_MODULES) {
            if (window.APP_MODULES[k].FormName && window.APP_MODULES[k].FormName.toLowerCase() === targetName) {
              existingConfig = window.APP_MODULES[k];
              formKey = k;
              break;
            }
          }
        }

        // 2. Fallback: tự suy luận từ urlPara (vd: form-builder -> FORM_BUILDER)
        if (!existingConfig) {
          var deducedKey = url.trim().replace(/-/g, '_').toUpperCase();
          if (window.APP_MODULES[deducedKey]) {
            existingConfig = window.APP_MODULES[deducedKey];
            formKey = deducedKey;
          }
        }
      }

      // Đã loại bỏ nhánh custom vì toàn bộ custom đã nằm trong ROUTES
      // Mặc định những route mới từ DB không nằm trong ROUTES sẽ dùng DynamicFormEngine
      route.script = 'src/js/core/DynamicFormEngine.js';
      route.pageFn = 'DynamicFormEngine';
      route.config = Object.assign({ FormName: formName, PageTitle: route.title, PageSubtitle: route.subTitle }, existingConfig || {});

      ROUTES.push(route);
      _routeMap[path] = route; // Update Map

      if (path === currentHash) {
        needsReload = true;
      }
    });

    if (needsReload) {
      if (!_currentRoute || _currentRoute.path !== currentHash) {
        // Delay slightly to allow Navbar to finish rendering before we trigger routing
        setTimeout(function () {
          _handleRoute();
        }, 50);
      }
    }
  }

  // ── State ──────────────────────────────────────────────────────────────
  var _currentRoute = null;
  var _loadedScripts = {};
  var _templateCache = {};
  var _appVersion = '2.14'; // Bump để làm mới cache html/script động
  var _navId = 0; // Token chặn race-condition

  // ── Template cache (dùng chung cho cả Router lẫn Page modules) ─────────
  function fetchTemplate(url) {
    if (_templateCache[url]) return Promise.resolve(_templateCache[url]);
    return fetch(url + '?v=' + _appVersion)
      .then(function (res) {
        if (!res.ok) throw new Error('Template not found: ' + url);
        return res.text();
      })
      .then(function (html) {
        _templateCache[url] = html;
        return html;
      });
  }

  // ── Preload templates phổ biến (tải trước nền) ─────────────────────────
  function _preloadTemplates() {
    var priority = ['/dashboard', '/visitor', '/booking'];
    priority.forEach(function (p) {
      var r = _findRoute(p);
      if (r && r.template) fetchTemplate(r.template).catch(function () { });
    });
  }

  // ── Dynamic Script Loading ─────────────────────────────────────────────
  function _loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (_loadedScripts[src]) { resolve(); return; }
      var el = document.createElement('script');
      // Thêm cache-buster để đảm bảo luôn tải file JS mới nhất
      el.src = src + '?v=' + Date.now();
      el.onload = function () { _loadedScripts[src] = true; resolve(); };
      el.onerror = function () { reject(new Error('Script load failed: ' + src)); };
      document.body.appendChild(el);
    });
  }

  // ── Route matching (dùng Map nội bộ cho O(1) lookup) ───────────────────
  var _routeMap = {};
  ROUTES.forEach(function (r) { _routeMap[r.path] = r; });

  function _findRoute(path) {
    return _routeMap[path] || null;
  }

  // ── Page Transition ────────────────────────────────────────────────────
  function _fadeOut($el) {
    return new Promise(function (resolve) {
      $el.style.opacity = '0';
      $el.style.transition = 'opacity 120ms ease';
      setTimeout(resolve, 120);
    });
  }

  function _fadeIn($el) {
    $el.style.opacity = '1';
    $el.style.transition = 'opacity 180ms ease';
  }

  // ── Trang lỗi ──────────────────────────────────────────────────────────
  function _render404($el, path) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:48px 24px;">' +
      '<span class="material-symbols-outlined" style="font-size:72px;color:var(--color-border-strong);margin-bottom:16px;">search_off</span>' +
      '<h2 style="font-size:2rem;font-weight:700;margin:0 0 8px;">404</h2>' +
      '<p style="color:var(--color-text-secondary);margin:0 0 24px;">Trang <code style="background: rgba(148, 163, 184, 0.1);padding:2px 8px;border-radius:4px;">' + path + '</code> không tồn tại</p>' +
      '<a href="#/dashboard" class="btn btn-primary" style="text-decoration:none;">Về trang chủ</a>' +
      '</div>';
  }

  function _renderAccessDenied($el) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:48px 24px;">' +
      '<span class="material-symbols-outlined" style="font-size:72px;color:var(--color-danger);margin-bottom:16px;">lock</span>' +
      '<p style="color:var(--color-danger);font-size:1.1rem;font-weight:500;">Bạn không có quyền xem trang này</p>' +
      '</div>';
  }

  function _renderPlaceholder($el, title) {
    $el.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:40vh;text-align:center;padding:48px;">' +
      '<span class="material-symbols-outlined" style="font-size:64px;color:var(--color-border-strong);opacity:0.4;margin-bottom:16px;">construction</span>' +
      '<h3 style="margin:0 0 8px;font-weight:600;">' + title + '</h3>' +
      '<p style="color:var(--color-text-secondary);margin:0;">Trang này đang được phát triển...</p>' +
      '</div>';
  }

  function _renderError($el, message) {
    $el.innerHTML =
      '<div class="card"><div class="card-body" style="color:var(--color-danger);">' +
      '<span class="material-symbols-outlined" style="vertical-align:middle;margin-right:8px;">error</span>' + message +
      '</div></div>';
  }

  // ── Cập nhật navigation UI ─────────────────────────────────────────────
  function _updateNavActive(hash) {
    // Sidebar nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('href') === '#' + hash) el.classList.add('active');
    });
    // Navbar (nếu đang dùng layout ngang)
    document.querySelectorAll('.main-nav .nav-link, .sub-menu-item').forEach(function (el) {
      el.classList.remove('active');
      if (el.getAttribute('href') === '#' + hash) el.classList.add('active');
    });
  }

  // ── Main Route Handler ─────────────────────────────────────────────────
  function _handleRoute() {
    _navId++;
    var currentNav = _navId;

    var rawHash = window.location.hash.replace('#', '') || '/dashboard';
    var hashParts = rawHash.split('?');
    var pathOnly = hashParts[0];
    var route = _findRoute(pathOnly);

    // Kéo quyền động nếu máy khác vừa cập nhật (Đảm bảo Realtime)
    _syncPermissionsIfNeeded().then(function () {
      if (currentNav !== _navId) return;

      var $content = document.getElementById('app-content');
      var $pageTitle = document.getElementById('page-title');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Cập nhật nav UI
      _updateNavActive(pathOnly);

      // 404
      if (!route) {
        if ($pageTitle) $pageTitle.innerText = '404 — Không tìm thấy';
        document.title = '404 | Quản lý Nhân sự';
        _render404($content, rawHash);
        return;
      }

      // Kiểm tra quyền
      var targetPerm = route.perm || route.module;
      if (targetPerm && !Permission.canView(targetPerm)) {
        if ($pageTitle) $pageTitle.innerText = 'Từ chối truy cập';
        _renderAccessDenied($content);
        return;
      }

      // Cập nhật title
      if ($pageTitle) $pageTitle.innerText = route.title;
      document.title = route.title + ' | Quản lý Nhân sự';
      document.body.setAttribute('data-page', pathOnly.replace('/', ''));

      // ── Trường hợp 1: Có script → load script → pageFn.render() ──
      // (Page module tự fetch template bên trong render nếu cần)
      if (route.pageFn) {
        _fadeOut($content)
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            if (route.script) {
              return _loadScript(route.script);
            }
            return Promise.resolve();
          })
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            var mod = window[route.pageFn];
            if (mod && typeof mod.render === 'function') {
              // Xóa sạch nội dung cũ
              $content.innerHTML = '';

              // 1. Dựng Global Header (Lấy Title/Subtitle từ Router/Menu)
              if (!route.hideHeader) {
                var headerHtml =
                  '<div class="page-title-bar" id="global-header">' +
                  '<div class="page-title-info">' +
                  '<h1 class="page-title-heading">' + (route.title || 'Quản lý Dữ liệu') + '</h1>' +
                  (route.subTitle ? '<span class="page-title-sub">' + route.subTitle + '</span>' : '') +
                  '</div>' +
                  '<div class="page-title-actions" id="global-page-actions"></div>' +
                  '</div>';
                $content.insertAdjacentHTML('beforeend', headerHtml);
              }

              // 2. Dựng wrapper
              var wrapper = document.createElement('div');
              wrapper.className = 'page-wrapper';
              $content.appendChild(wrapper);

              // 3. Render trang vào wrapper
              mod.render(wrapper, route.config || null);
            } else {
              _renderError($content, 'Không tìm thấy module: ' + route.pageFn);
            }
            _fadeIn($content);
            _currentRoute = route;
          })
          .catch(function (err) {
            if (err.message === 'ABORTED') return; // Bỏ qua nếu là thao tác hủy do click liên tục
            console.error('[Router]', err);
            _renderError($content, 'Lỗi tải module: ' + err.message);
            _fadeIn($content);
          });
        return;
      }

      // ── Trường hợp 2: Chỉ có template (dashboard, trang tĩnh) ──
      if (route.template) {
        _fadeOut($content)
          .then(function () {
            if (currentNav !== _navId) throw new Error('ABORTED');
            return fetchTemplate(route.template);
          })
          .then(function (html) {
            if (currentNav !== _navId) throw new Error('ABORTED');
            $content.innerHTML = html;
            _fadeIn($content);
            _currentRoute = route;
          })
          .catch(function (err) {
            if (err.message === 'ABORTED') return;
            console.error('[Router]', err);
            _renderError($content, 'Lỗi tải template: ' + err.message);
            _fadeIn($content);
          });
        return;
      }

      // ── Trường hợp 3: Trang chưa code ──
      _renderPlaceholder($content, route.title);
    }); // End of _syncPermissionsIfNeeded
  }

  function _syncPermissionsIfNeeded() {
    if (typeof ApiClient === 'undefined' || typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.PERMISSIONS.GET_VERSION) {
      return Promise.resolve();
    }
    return ApiClient.get(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_VERSION, { silent: true }).then(function (res) {
      var localVer = localStorage.getItem('pmql_permission_ver');
      var records = res.list || res.records || [];
      var svVersion = records.length > 0 ? records[0].version : (res.version || '');

      if (svVersion && svVersion !== localVer) {
        var userJson = localStorage.getItem('pmql_user');
        var userObj = userJson ? JSON.parse(userJson) : {};
        return ApiClient.post(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_MY_PERMISSIONS, { Username: userObj.UserName }, { silent: true }).then(function (permRes) {
          var permMap = {};
          var permList = permRes.list || permRes.records || [];
          if (permList.length > 0) { localStorage.setItem('debug_perm_row', JSON.stringify(permList[0])); }
          function _isTrue(v) { return v === 1 || v === '1' || v === true || v === 'true' || String(v).toLowerCase() === 'true'; }
          permList.forEach(function (p) {
            var fname = p.FormName || p.formName || p.formname || p.FORMNAME;
            if (fname) {
              permMap[fname] = {
                CanView: _isTrue(p.CanView) || _isTrue(p.canView) || _isTrue(p.canview) || _isTrue(p.CANVIEW),
                CanAdd: _isTrue(p.CanAdd) || _isTrue(p.canAdd) || _isTrue(p.canadd) || _isTrue(p.CANADD),
                CanEdit: _isTrue(p.CanEdit) || _isTrue(p.canEdit) || _isTrue(p.canedit) || _isTrue(p.CANEDIT),
                CanDelete: _isTrue(p.CanDelete) || _isTrue(p.canDelete) || _isTrue(p.candelete) || _isTrue(p.CANDELETE)
              };
            }
          });
          localStorage.setItem('pmql_permissions', JSON.stringify(permMap));
          localStorage.setItem('pmql_permission_ver', svVersion);
        }).catch(function (e) {
          console.error('[Router] Lỗi tải quyền mới:', e);
        });
      }
    }).catch(function (e) {
      console.error('[Router] Lỗi kiểm tra version quyền:', e);
      return Promise.resolve();
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function init() {
    window.addEventListener('hashchange', _handleRoute);

    // BẢO MẬT: Kiểm tra Version Quyền 1 lần duy nhất lúc F5 tải lại màn hình
    _syncPermissionsIfNeeded().then(function () {
      _finishInit();
    }).catch(function (e) {
      console.error(e);
      _finishInit();
    });
  }

  function _finishInit() {
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      _handleRoute();
    }
    setTimeout(_preloadTemplates, 500);
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    init: init,
    ROUTES: ROUTES,
    addDynamicRoutes: addDynamicRoutes,
    fetchTemplate: fetchTemplate   // Cho page modules dùng chung cache layer
  };
})();
