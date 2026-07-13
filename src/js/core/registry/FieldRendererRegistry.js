window.FieldRendererRegistry = (function () {
  var renderers = {};
  function register(code, renderer) { renderers[String(code)] = renderer; }
  function has(code) { return typeof renderers[String(code)] === 'function'; }
  function render(code, context) {
    if (!has(code)) throw new Error('Field renderer is not registered: ' + code);
    return renderers[String(code)](context || {});
  }
  return { register: register, has: has, render: render };
})();

