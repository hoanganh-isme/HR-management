window.LegacyCompatibility = (function () {
  var blockedTags = ['script', 'iframe', 'object', 'embed'];

  function sanitizeHtml(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html || '');
    blockedTags.forEach(function (tag) {
      Array.from(template.content.querySelectorAll(tag)).forEach(function (node) { node.remove(); });
    });
    Array.from(template.content.querySelectorAll('*')).forEach(function (node) {
      Array.from(node.attributes).forEach(function (attribute) {
        var name = attribute.name.toLowerCase();
        var value = String(attribute.value || '').trim().toLowerCase();
        if (name.indexOf('on') === 0 || ((name === 'href' || name === 'src') && value.indexOf('javascript:') === 0)) {
          node.removeAttribute(attribute.name);
        }
      });
    });
    return template.innerHTML;
  }

  function renderLegacyHtml(container, html, fieldName) {
    console.warn('[Deprecated] Legacy HTML renderer used for field ' + (fieldName || 'unknown'));
    container.innerHTML = sanitizeHtml(html);
    if (String(html || '').indexOf('SapCaTuDong') !== -1) {
      var shiftButton = container.querySelector('button');
      if (shiftButton) shiftButton.addEventListener('click', function () { window.SapCaTuDong(); });
    }
    return container;
  }

  return {
    sanitizeHtml: sanitizeHtml,
    renderLegacyHtml: renderLegacyHtml,
    storage: AppStorage
  };
})();
