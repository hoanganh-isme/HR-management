window.PluginRegistry = (function () {
  var plugins = {};
  function register(code, plugin) { plugins[String(code)] = plugin; return plugin; }
  function get(code) { return plugins[String(code)] || null; }
  function getAll() { return Object.keys(plugins).map(function (code) { return plugins[code]; }); }
  return { register: register, get: get, getAll: getAll };
})();

