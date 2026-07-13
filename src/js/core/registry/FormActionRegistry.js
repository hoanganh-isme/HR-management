window.FormActionRegistry = (function () {
  var handlers = {};
  function register(code, handler) {
    if (!code || typeof handler !== 'function') throw new Error('Action code and handler are required');
    handlers[String(code)] = handler;
  }
  function registerMany(map) {
    Object.keys(map || {}).forEach(function (code) { register(code, map[code]); });
  }
  function get(code) { return handlers[String(code)] || null; }
  function run(code, context) {
    var handler = get(code);
    if (!handler) throw new Error('Action handler is not registered: ' + code);
    return handler(context || {});
  }
  return { register: register, registerMany: registerMany, get: get, run: run };
})();

