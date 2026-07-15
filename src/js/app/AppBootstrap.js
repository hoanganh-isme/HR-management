window.AppBootstrap = (function () {
  function startRouter() {
    if (typeof Router === 'undefined') return;
    if (!AppStorage.getStored('user', null)) { Router.init(); return; }
    AppStorage.setStored('sys_branches', '[]');
    UserContextRepository.resolveCurrent().catch(function (error) {
      console.warn('[AppBootstrap] Unable to resolve user profile; branch gateway fallback will be used.', error);
      return AppContext.getCurrentUser();
    }).then(function (user) {
      var scope = BranchAccessPolicy.getScope(user);
      AppStorage.setStored('branch_scope', JSON.stringify({
        UserName: AppContext.getUserName(),
        UserGroupID: user && (user.UserGroupID || user.userGroupID || user.GroupID || ''),
        BranchID: scope.branchIds.join(','),
        IsAdmin: scope.isAdmin
      }));
      return BranchRepository.getAccessible();
    }).then(function (branches) {
      AppStorage.setStored('sys_branches', JSON.stringify(branches));
      Router.init();
    }).catch(function (error) {
      console.error('[AppBootstrap] Unable to load branch scope.', error);
      Router.init();
    });
  }

  function renderNavbar() {
    if (!AppStorage.getStored('user', null) || typeof Navbar === 'undefined') return;
    Navbar.render('navbar-container');
    if (Navbar.getLayout() !== 'vertical') return;
    var verticalMain = document.getElementById('vertical-main');
    var content = document.getElementById('app-content');
    if (verticalMain && content && !verticalMain.contains(content)) verticalMain.appendChild(content);
  }

  function applyTheme() {
    var savedFont = AppStorage.getStored('font_family', null);
    if (savedFont) document.documentElement.style.setProperty('--font-family', '"' + savedFont + '", sans-serif');
    function applyColorMode() {
      var theme = AppStorage.getStored('theme', null) || ThemeConfig.defaultTheme;
      var dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.body.classList.toggle('dark-theme', dark);
    }
    applyColorMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if ((AppStorage.getStored('theme', null) || 'auto') === 'auto') applyColorMode();
    });
    var colors = {
      indigo: ['#4F46E5', '#4338CA', '#3730A3', 'rgba(79, 70, 229, 0.1)'],
      emerald: ['#10B981', '#059669', '#047857', 'rgba(16, 185, 129, 0.1)'],
      rose: ['#E11D48', '#BE123C', '#9F1239', 'rgba(225, 29, 72, 0.1)'],
      amber: ['#F59E0B', '#D97706', '#B45309', 'rgba(245, 158, 11, 0.1)'],
      sky: ['#0EA5E9', '#0284C7', '#0369A1', 'rgba(14, 165, 233, 0.1)']
    };
    var selected = colors[AppStorage.getStored('color', null)];
    if (selected) {
      ['--color-primary', '--color-primary-hover', '--color-primary-dark', '--color-primary-light'].forEach(function (name, index) {
        document.documentElement.style.setProperty(name, selected[index]);
      });
    }
  }

  function start() {
    window.APP_MODULES = ModuleRegistry.toLegacyMap();
    if (typeof KeyboardManager !== 'undefined') KeyboardManager.init();
    startRouter();
    renderNavbar();
    applyTheme();
  }
  return { start: start };
})();
