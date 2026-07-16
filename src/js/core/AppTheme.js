/** Applies the existing font, theme and accent-color preferences. */
window.AppTheme = (function () {
  var COLORS = [
    { id: 'indigo', primary: '#4F46E5', hover: '#4338CA', dark: '#3730A3', light: 'rgba(79, 70, 229, 0.1)' },
    { id: 'emerald', primary: '#10B981', hover: '#059669', dark: '#047857', light: 'rgba(16, 185, 129, 0.1)' },
    { id: 'rose', primary: '#E11D48', hover: '#BE123C', dark: '#9F1239', light: 'rgba(225, 29, 72, 0.1)' },
    { id: 'amber', primary: '#F59E0B', hover: '#D97706', dark: '#B45309', light: 'rgba(245, 158, 11, 0.1)' },
    { id: 'sky', primary: '#0EA5E9', hover: '#0284C7', dark: '#0369A1', light: 'rgba(14, 165, 233, 0.1)' }
  ];

  function applyTheme() {
    var storage = window.localStorage;
    var keys = window.AppSession ? AppSession.keys : { fontFamily: 'pmql_font_family', theme: 'pmql_theme', accentColor: 'pmql_color' };
    var font = storage.getItem(keys.fontFamily);
    if (font) document.documentElement.style.setProperty('--font-family', '"' + font + '", sans-serif');

    var theme = storage.getItem(keys.theme) || 'auto';
    var dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark-theme', dark);

    var color = COLORS.find(function (item) { return item.id === storage.getItem(keys.accentColor); });
    if (color) {
      document.documentElement.style.setProperty('--color-primary', color.primary);
      document.documentElement.style.setProperty('--color-primary-hover', color.hover);
      document.documentElement.style.setProperty('--color-primary-dark', color.dark);
      document.documentElement.style.setProperty('--color-primary-light', color.light);
    }
  }

  function initialize() {
    applyTheme();
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    if (media && media.addEventListener) {
      media.addEventListener('change', function (event) {
        var themeKey = window.AppSession ? AppSession.keys.theme : 'pmql_theme';
        if ((window.localStorage.getItem(themeKey) || 'auto') === 'auto') {
          document.body.classList.toggle('dark-theme', event.matches);
        }
      });
    }
  }

  return Object.freeze({ initialize: initialize, apply: applyTheme });
})();
