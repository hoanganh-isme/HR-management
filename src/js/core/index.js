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

  AppBootstrap.start();
});

