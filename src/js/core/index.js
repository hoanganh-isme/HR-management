/**
 * Bootstraps the application layout & interactions
 */
document.addEventListener('DOMContentLoaded', function () {
  // 0. Global Auth Logic
  window.logoutApp = function () {
    // Gọi API đăng xuất (background)
    if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
      ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).catch(function () { });
    }

    AppStorage.removeStored('user');
    if (typeof ApiClient !== 'undefined' && ApiClient.deleteCookie) {
      ApiClient.deleteCookie('auth_token');
    }

    window.location.href = 'login.html';
  };

  // 0.5 Kiểm tra đăng nhập (Auth Guard)
  var token = typeof ApiClient !== 'undefined' && ApiClient.getCookie ? ApiClient.getCookie('auth_token') : null;
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 0.6 Khởi tạo hệ thống Phân quyền (RBAC)
  window.AppPermissions = {
    _cache: null,

    _init: function () {
      try {
        var navCache = JSON.parse(AppStorage.getSession('nav_cache', 'null') || 'null');
        var userCache = JSON.parse(AppStorage.getStored('user', 'null') || 'null');

        var isAdmin = MetadataModuleConfig.isAdminUser(userCache);

        this._cache = {
          isAdmin: isAdmin,
          dict: {}
        };

        if (navCache && navCache.rawRecords) {
          navCache.rawRecords.forEach(function (r) {
            if (r.formName) {
              this._cache.dict[r.formName.toLowerCase()] = r;
            }
          }.bind(this));
        }
      } catch (e) {
        console.error('Error init AppPermissions', e);
      }
    },

    hasPermission: function (formName, action) {
      if (!this._cache) this._init();
      if (!this._cache) return false;

      if (this._cache.isAdmin) return true; // Admin bypass

      if (!formName) return true; // Các module ko định danh thì cho phép qua
      var perm = this._cache.dict[formName.toLowerCase()];
      if (!perm) return false; // Không có trong phân quyền thì tịt

      // action có thể là 'IsAdd', 'IsUpdate', 'IsDelete', 'IsRun', v.v.
      return (perm[action] == 1 || perm[action] === true);
    }
  };
  // 1. Khởi tạo trình quản lý phím tắt
  if (typeof KeyboardManager !== 'undefined') {
    KeyboardManager.init();
  }

  // 2. Khởi tạo Router
  // Cấu hình các form có DetailTabs (Master-Detail)
  window.APP_MODULES = window.APP_MODULES || {};


  if (typeof Router !== 'undefined') {
    var currentUser = AppStorage.getStored('user', null);
    if (currentUser && typeof ApiClient !== 'undefined') {
      ApiClient.post('/api/API_Gateway_Router', {
        List: 'CF_BranchListFrm',
        FormName: 'CF_BranchListFrm',
        Func: 'View',
        Limit: 1000
      }).then(function (res) {
        var branchList = Array.isArray(res) ? res : (res.data || res.list || res.records || []);
        AppStorage.setStored('sys_branches', JSON.stringify(branchList));
        Router.init();
      }).catch(function () {
        Router.init();
      });
    } else {
      Router.init();
    }
  }

  // 3. Khởi tạo Navbar (chỉ render nếu đã đăng nhập)
  var currentUser = AppStorage.getStored('user', null);
  if (currentUser && typeof Navbar !== 'undefined') {
    Navbar.render('navbar-container');

    // Nếu mode là vertical, chuyển #app-content vào vertical-main
    if (Navbar.getLayout() === 'vertical') {
      var $vertMain = document.getElementById('vertical-main');
      var $content = document.getElementById('app-content');
      if ($vertMain && $content && !$vertMain.contains($content)) {
        $vertMain.appendChild($content);
      }
    }
  }

  // 4. Khởi tạo cấu hình giao diện
  var savedFont = AppStorage.getStored('font_family', null);
  if (savedFont) {
    document.documentElement.style.setProperty('--font-family', '"' + savedFont + '", sans-serif');
  }

  var savedTheme = AppStorage.getStored('theme', null) || 'auto';
  if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Lắng nghe sự thay đổi giao diện từ hệ thống (khi chuyển qua chế độ tiết kiệm pin hoặc Dark Mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var currentTheme = AppStorage.getStored('theme', null) || 'auto';
    if (currentTheme === 'auto') {
      if (e.matches) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  });

  var savedColor = AppStorage.getStored('color', null);
  if (savedColor) {
    var COLORS = [
      { id: 'indigo', primary: '#4F46E5', hover: '#4338CA', dark: '#3730A3', light: 'rgba(79, 70, 229, 0.1)' },
      { id: 'emerald', primary: '#10B981', hover: '#059669', dark: '#047857', light: 'rgba(16, 185, 129, 0.1)' },
      { id: 'rose', primary: '#E11D48', hover: '#BE123C', dark: '#9F1239', light: 'rgba(225, 29, 72, 0.1)' },
      { id: 'amber', primary: '#F59E0B', hover: '#D97706', dark: '#B45309', light: 'rgba(245, 158, 11, 0.1)' },
      { id: 'sky', primary: '#0EA5E9', hover: '#0284C7', dark: '#0369A1', light: 'rgba(14, 165, 233, 0.1)' }
    ];
    var colorDef = COLORS.find(function (c) { return c.id === savedColor; });
    if (colorDef) {
      document.documentElement.style.setProperty('--color-primary', colorDef.primary);
      document.documentElement.style.setProperty('--color-primary-hover', colorDef.hover);
      document.documentElement.style.setProperty('--color-primary-dark', colorDef.dark);
      document.documentElement.style.setProperty('--color-primary-light', colorDef.light);
    }
  }

});

