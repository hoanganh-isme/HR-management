window.RouteRegistry = (function () {
  var routes = {};
  function register(path, definition) { routes[String(path)] = definition; }
  function get(path) { return routes[String(path)] || null; }
  function has(path) { return !!get(path); }
  function getAll() { return Object.assign({}, routes); }
  return { register: register, get: get, has: has, getAll: getAll };
})();

