/** Application startup. Implementation details stay in focused helpers/modules. */
(function (global) {
  function registerLogout() {
    global.logoutApp = function () {
      if (global.ApiClient && global.API_CONFIG && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
        ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).catch(function () { });
      }
      if (global.AppSession) AppSession.remove(AppSession.keys.user);
      else global.localStorage.removeItem('pmql_user');
      if (global.ApiClient && ApiClient.deleteCookie) ApiClient.deleteCookie('auth_token');
      global.location.href = 'login.html';
    };
  }

  function requireAuthentication() {
    var token = global.ApiClient && ApiClient.getCookie ? ApiClient.getCookie('auth_token') : null;
    if (token) return true;
    global.location.href = 'login.html';
    return false;
  }

  function initializePermissions() {
    global.AppPermissions = {
      _cache: null,
      _init: function () {
        var navigation = global.AppSession
          ? AppSession.readJSON(global.sessionStorage, AppSession.keys.navigationCache, null)
          : null;
        var isAdmin = global.AppSession ? AppSession.isAdmin() : false;
        this._cache = { isAdmin: isAdmin, dict: {} };
        (navigation && navigation.rawRecords || []).forEach(function (record) {
          if (record.formName) this._cache.dict[String(record.formName).toLowerCase()] = record;
        }.bind(this));
      },
      hasPermission: function (formName, action) {
        if (!this._cache) this._init();
        if (!this._cache) return false;
        if (this._cache.isAdmin) return true;
        if (!formName) return true;
        var permission = this._cache.dict[String(formName).toLowerCase()];
        return !!(permission && (permission[action] == 1 || permission[action] === true));
      }
    };
    global.AppPermissions._init();
  }

  function initializeModules() {
    if (global.HRModuleRegistry && typeof HRModuleRegistry.install === 'function') HRModuleRegistry.install();
    if (global.PayrollActions && typeof PayrollActions.register === 'function') PayrollActions.register();
    if (global.TimesheetActions && typeof TimesheetActions.register === 'function') TimesheetActions.register();
    if (global.ShiftActions && typeof ShiftActions.register === 'function') ShiftActions.register();
  }

  function initializeNavigation() {
    if (!global.Router) return;
    var user = global.AppSession ? AppSession.getUser() : {};
    if (!Object.keys(user).length || !global.ApiClient) {
      Router.init();
      return;
    }
    AppSession.loadSystemBranches(ApiClient, AppConfig.apiGateway)
      .then(function () { Router.init(); })
      .catch(function () { Router.init(); });
  }

  function initializeUserInterface() {
    var hasUser = global.AppSession ? Object.keys(AppSession.getUser()).length > 0 : !!global.localStorage.getItem('pmql_user');
    if (hasUser && global.Navbar) {
      Navbar.render('navbar-container');
      if (Navbar.getLayout() === 'vertical') {
        var verticalMain = document.getElementById('vertical-main');
        var content = document.getElementById('app-content');
        if (verticalMain && content && !verticalMain.contains(content)) verticalMain.appendChild(content);
      }
    }
    if (global.AppTheme && typeof AppTheme.initialize === 'function') AppTheme.initialize();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (global.__hrAppInitialized) return;
    global.__hrAppInitialized = true;
    registerLogout();
    if (!requireAuthentication()) return;
    initializePermissions();
    initializeModules();
    if (global.KeyboardManager) KeyboardManager.init();
    initializeNavigation();
    initializeUserInterface();
  });
})(window);
