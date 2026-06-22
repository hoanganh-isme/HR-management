/**
 * MetricCard Component
 * ─────────────────────────────────────────────
 * Thẻ số liệu KPI với icon + label + value lớn + sub text
 * Dùng cho: Dashboard "Hoạt động trong ngày", trang báo cáo, KPI panels
 *
 * Usage:
 *   var el = MetricCard.create({
 *     icon: 'payments',
 *     iconColor: '#4F46E5',
 *     iconBg: 'rgba(79,70,229,0.08)',
 *     label: 'Doanh thu ước tính',
 *     value: '185M',
 *     subValue: '₫185.000.000',     // optional
 *     size: 'large',                // 'large' | 'normal' (default)
 *     onClick: function() { ... }   // optional
 *   });
 *
 *   MetricCard.update(el, { value: '192M', subValue: '₫192.000.000' });
 */
var MetricCard = (function () {

  /**
   * Tạo MetricCard element
   * @param {Object} opts
   * @param {string}   opts.icon       - Material Symbol icon name
   * @param {string}   [opts.iconColor]  - CSS color string
   * @param {string}   [opts.iconBg]    - CSS background string cho icon wrapper
   * @param {string}   opts.label      - Nhãn mô tả (nhỏ, trên value)
   * @param {string|number} opts.value - Giá trị chính (to, đậm)
   * @param {string}   [opts.subValue]  - Giá trị phụ (nhỏ hơn, bên dưới)
   * @param {'large'|'normal'} [opts.size='normal'] - 'large' tăng cỡ value
   * @param {Function} [opts.onClick]  - click handler
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var size = opts.size || 'normal';

    var card = document.createElement('div');
    card.className = 'metric-card metric-card--' + size;
    if (typeof opts.onClick === 'function') {
      card.classList.add('metric-card--clickable');
      card.addEventListener('click', opts.onClick);
    }

    // Icon wrapper
    var iconWrap = document.createElement('div');
    iconWrap.className = 'metric-card__icon';
    if (opts.iconColor) iconWrap.style.color = opts.iconColor;
    if (opts.iconBg)    iconWrap.style.background = opts.iconBg;

    var iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-outlined';
    iconEl.textContent = opts.icon || 'info';
    iconWrap.appendChild(iconEl);

    // Content wrapper
    var content = document.createElement('div');
    content.className = 'metric-card__content';

    var label = document.createElement('div');
    label.className = 'metric-card__label';
    label.textContent = opts.label || '';

    var valueEl = document.createElement('div');
    valueEl.className = 'metric-card__value';
    valueEl.dataset.metricValue = '1'; // selector hook for update()
    valueEl.textContent = opts.value !== undefined ? String(opts.value) : '--';

    content.appendChild(label);
    content.appendChild(valueEl);

    if (opts.subValue !== undefined) {
      var sub = document.createElement('div');
      sub.className = 'metric-card__sub';
      sub.dataset.metricSub = '1';
      sub.textContent = String(opts.subValue);
      content.appendChild(sub);
    }

    card.appendChild(iconWrap);
    card.appendChild(content);
    return card;
  }

  /**
   * Cập nhật giá trị của MetricCard mà không re-render
   * @param {HTMLElement} el - element tạo bởi create()
   * @param {Object} patch - { value, subValue, icon, iconColor, iconBg }
   */
  function update(el, patch) {
    if (!el || !patch) return;
    if (patch.value !== undefined) {
      var v = el.querySelector('[data-metric-value]');
      if (v) v.textContent = String(patch.value);
    }
    if (patch.subValue !== undefined) {
      var s = el.querySelector('[data-metric-sub]');
      if (s) {
        s.textContent = String(patch.subValue);
      } else {
        // Tạo mới nếu ban đầu không có subValue
        var content = el.querySelector('.metric-card__content');
        if (content) {
          var newSub = document.createElement('div');
          newSub.className = 'metric-card__sub';
          newSub.dataset.metricSub = '1';
          newSub.textContent = String(patch.subValue);
          content.appendChild(newSub);
        }
      }
    }
    if (patch.icon !== undefined) {
      var iconEl = el.querySelector('.metric-card__icon .material-symbols-outlined');
      if (iconEl) iconEl.textContent = patch.icon;
    }
    if (patch.iconColor !== undefined) {
      var iconWrap = el.querySelector('.metric-card__icon');
      if (iconWrap) iconWrap.style.color = patch.iconColor;
    }
    if (patch.iconBg !== undefined) {
      var iconWrap2 = el.querySelector('.metric-card__icon');
      if (iconWrap2) iconWrap2.style.background = patch.iconBg;
    }
  }

  /**
   * Mount MetricCard vào container (helper tiện lợi)
   * @param {string|HTMLElement} target - selector string hoặc element
   * @param {Object} opts - như create()
   * @returns {HTMLElement} card element
   */
  function mount(target, opts) {
    var container = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!container) return null;
    var card = create(opts);
    container.innerHTML = '';
    container.appendChild(card);
    return card;
  }

  return {
    create: create,
    update: update,
    mount: mount
  };
})();
