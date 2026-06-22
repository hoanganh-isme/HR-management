/**
 * SectionPanel Component
 * ─────────────────────────────────────────────
 * Wrapper card có header: icon + tiêu đề + actions (period select, refresh)
 * Dùng cho: Mọi section trên dashboard, báo cáo, bảng tóm tắt
 *
 * Usage:
 *   var result = SectionPanel.create({
 *     icon: 'calendar_today',
 *     title: 'HOẠT ĐỘNG TRONG NGÀY',
 *     trailing: '(22/05/2026 - 10:28)',   // optional
 *     actions: [
 *       {
 *         type: 'select',
 *         id: 'period-revenue',
 *         options: [
 *           { value: 'week', label: 'Tuần này' },
 *           { value: 'month', label: 'Tháng này' }
 *         ],
 *         defaultValue: 'week',
 *         onChange: function(val) { ... }
 *       },
 *       {
 *         type: 'refresh',
 *         onClick: function() { ... }
 *       },
 *       {
 *         type: 'custom',
 *         element: HTMLElement    // bất kỳ element nào
 *       }
 *     ]
 *   });
 *
 *   // result.panel  = toàn bộ wrapper (để appendChild vào container)
 *   // result.body   = nơi để append nội dung bên trong
 *
 *   result.body.appendChild(myContent);
 *   document.getElementById('some-wrap').appendChild(result.panel);
 *
 *   // Cập nhật trailing text (vd: timestamp)
 *   SectionPanel.setTrailing(result.panel, '(22/05/2026 - 10:30)');
 */
var SectionPanel = (function () {

  /**
   * Build 1 action element từ config
   */
  function _buildAction(action) {
    if (!action) return null;

    if (action.type === 'refresh') {
      var btn = document.createElement('button');
      // Kế thừa .btn (cursor, transition, font) + .btn-tool (compact, transparent)
      btn.className = 'btn btn-tool section-panel__refresh-btn';
      btn.title = 'Làm mới';
      if (action.id) btn.id = action.id;
      btn.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
      if (typeof action.onClick === 'function') {
        btn.addEventListener('click', action.onClick);
      }
      return btn;
    }

    if (action.type === 'select') {
      var sel = document.createElement('select');
      sel.className = 'section-panel__period-select';
      if (action.id) sel.id = action.id;
      (action.options || []).forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === action.defaultValue) o.selected = true;
        sel.appendChild(o);
      });
      if (typeof action.onChange === 'function') {
        sel.addEventListener('change', function () {
          action.onChange(sel.value);
        });
      }
      return sel;
    }

    if (action.type === 'custom' && action.element) {
      return action.element;
    }

    return null;
  }

  /**
   * Tạo SectionPanel
   * @param {Object} opts
   * @param {string}  [opts.icon]       - Material Symbol name
   * @param {string}  opts.title        - Tiêu đề (uppercase)
   * @param {string}  [opts.trailing]   - text sau tiêu đề (vd: timestamp)
   * @param {Array}   [opts.actions]    - mảng action objects
   * @param {string}  [opts.id]         - id cho wrapper panel
   * @param {string}  [opts.className]  - thêm class vào wrapper
   * @returns {{ panel: HTMLElement, body: HTMLElement, header: HTMLElement }}
   */
  function create(opts) {
    opts = opts || {};

    // Wrapper
    var panel = document.createElement('div');
    // Kế thừa .card (background, border, shadow, border-radius, overflow)
    panel.className = 'card section-panel' + (opts.className ? ' ' + opts.className : '');
    if (opts.id) panel.id = opts.id;

    // ── Header ──
    var header = document.createElement('div');
    // Kế thừa .card-header (border-bottom, flex, align-items)
    header.className = 'card-header section-panel__header';

    // Title group (icon + title + trailing)
    var titleGroup = document.createElement('span');
    titleGroup.className = 'section-panel__title';

    if (opts.icon) {
      var iconEl = document.createElement('span');
      iconEl.className = 'material-symbols-outlined section-panel__icon';
      iconEl.textContent = opts.icon;
      titleGroup.appendChild(iconEl);
    }

    var titleText = document.createElement('span');
    titleText.className = 'section-panel__title-text';
    titleText.textContent = opts.title || '';
    titleGroup.appendChild(titleText);

    if (opts.trailing) {
      var trailing = document.createElement('span');
      trailing.className = 'section-panel__trailing';
      trailing.dataset.spTrailing = '1';
      trailing.textContent = opts.trailing;
      titleGroup.appendChild(trailing);
    }

    header.appendChild(titleGroup);

    // Actions group
    if (opts.actions && opts.actions.length > 0) {
      var actionsGroup = document.createElement('div');
      actionsGroup.className = 'section-panel__actions';
      opts.actions.forEach(function (action) {
        var el = _buildAction(action);
        if (el) actionsGroup.appendChild(el);
      });
      header.appendChild(actionsGroup);
    }

    // ── Body ──
    var body = document.createElement('div');
    body.className = 'section-panel__body';

    panel.appendChild(header);
    panel.appendChild(body);

    return { panel: panel, body: body, header: header };
  }

  /**
   * Cập nhật trailing text (vd: timestamp thay đổi)
   * @param {HTMLElement} panelEl - panel element từ create()
   * @param {string} text
   */
  function setTrailing(panelEl, text) {
    if (!panelEl) return;
    var el = panelEl.querySelector('[data-sp-trailing]');
    if (el) {
      el.textContent = text;
    } else {
      // Tạo mới nếu chưa có
      var titleGroup = panelEl.querySelector('.section-panel__title');
      if (titleGroup) {
        var trailing = document.createElement('span');
        trailing.className = 'section-panel__trailing';
        trailing.dataset.spTrailing = '1';
        trailing.textContent = text;
        titleGroup.appendChild(trailing);
      }
    }
  }

  return {
    create: create,
    setTrailing: setTrailing
  };
})();
