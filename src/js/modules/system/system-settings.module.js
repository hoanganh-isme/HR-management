window.SystemSettingsConfig = ModuleConfigNormalizer.normalize({
  FormName: 'API_HR_SystemSettings',
  operations: {
    read: { sp: 'API_HR_SystemSettings', func: 'View' }
  }
});

window.SystemSettingsService = (function () {
  var FIELDS = [
    'CompanyName', 'CompanyLogo', 'Locale', 'Timezone', 'Currency',
    'EmployeeCodeLength', 'EmployeePrefixMode', 'MaxUploadSizeMB'
  ];
  var cache = null;

  function fallback() {
    var configured = window.APP_SETTINGS && window.APP_SETTINGS.systemSettingsFallback || {};
    return Object.assign({
      CompanyName: '',
      CompanyLogo: '',
      Locale: window.navigator && window.navigator.language || '',
      Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      Currency: '',
      EmployeeCodeLength: 0,
      EmployeePrefixMode: '',
      MaxUploadSizeMB: 10,
      isFallback: true
    }, configured);
  }

  function normalize(response) {
    var rows = Array.isArray(response) ? response : response && (response.records || response.list || response.data) || [];
    var source = rows[0] || {};
    if (!Object.keys(source).length) return fallback();
    var settings = {};
    FIELDS.forEach(function (field) {
      settings[field] = source[field] !== undefined ? source[field] : fallback()[field];
    });
    settings.isFallback = false;
    return settings;
  }

  function load(options) {
    options = options || {};
    if (cache && !options.force) return Promise.resolve(cache);
    return GatewayClient.runModuleOperation(SystemSettingsConfig, 'read')
      .then(function (response) {
        cache = normalize(response);
        return cache;
      })
      .catch(function () {
        cache = fallback();
        return cache;
      });
  }

  function applyToDocument(settings) {
    settings = settings || cache || fallback();
    if (settings.Locale) document.documentElement.lang = settings.Locale;
    if (settings.Timezone) document.documentElement.dataset.timezone = settings.Timezone;
    if (settings.Currency) document.documentElement.dataset.currency = settings.Currency;
    if (settings.CompanyName) document.title = settings.CompanyName;
    if (settings.CompanyLogo) {
      document.querySelectorAll('.app-logo-light, .app-logo-dark').forEach(function (image) {
        image.src = settings.CompanyLogo;
      });
    }
    window.APP_SYSTEM_SETTINGS = settings;
    return settings;
  }

  return { fields: FIELDS.slice(), fallback: fallback, load: load, applyToDocument: applyToDocument };
})();
