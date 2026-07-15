/** Small async action registry for metadata-driven forms. */
window.FormActionRegistry = (function () {
  var actions = Object.create(null);

  function register(name, handler) {
    if (!name || typeof handler !== 'function') throw new TypeError('Form action requires a name and handler');
    actions[String(name)] = handler;
    return handler;
  }

  function has(name) { return typeof actions[String(name)] === 'function'; }

  function execute(name, context) {
    if (!has(name)) return Promise.reject(new Error('Unknown form action: ' + name));
    try { return Promise.resolve(actions[String(name)](context || {})); }
    catch (error) { return Promise.reject(error); }
  }

  return { register: register, has: has, execute: execute };
})();
