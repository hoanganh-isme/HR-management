window.ResponsiveDataRenderer = (function () {
  function visibleFields(schema) {
    return (schema || []).filter(function (field) { return field.MobileVisible !== false && field.mobileVisible !== false; })
      .sort(function (left, right) { return (left.MobileOrder || left.mobileOrder || 999) - (right.MobileOrder || right.mobileOrder || 999); });
  }

  function render(options) {
    options = options || {};
    var config = Object.assign({ desktop: 'table', mobile: 'card', breakpoint: 768 }, options.moduleConfig && options.moduleConfig.responsive || {});
    if (window.innerWidth >= config.breakpoint || config.mobile !== 'card') return false;
    var fields = visibleFields(options.schema);
    options.container.innerHTML = '';
    var list = document.createElement('div');
    list.className = 'responsive-data-cards';
    (options.rows || []).forEach(function (row) {
      var card = document.createElement('article');
      card.className = 'responsive-data-card';
      fields.forEach(function (field) {
        var item = document.createElement('div');
        item.className = 'responsive-data-card__field';
        var label = document.createElement('span');
        label.className = 'responsive-data-card__label';
        label.textContent = field.label || field.CaptionVN || field.name || field.FieldName;
        var value = document.createElement('strong');
        value.className = 'responsive-data-card__value';
        var key = field.name || field.FieldName;
        value.textContent = row[key] == null ? '' : String(row[key]);
        item.appendChild(label); item.appendChild(value); card.appendChild(item);
      });
      if (typeof options.onView === 'function') card.addEventListener('click', function () { options.onView(row); });
      list.appendChild(card);
    });
    options.container.appendChild(list);
    return true;
  }
  return { render: render };
})();

