/**
 * Button Component
 * Sinh Nút bấm (Button) bằng DOM manipulation.
 */
var UIButton = (function () {

  /**
   * Tạo Nút bấm mới
   * @param {Object} config - { id, text, icon, type, className, onClick, disabled, tooltip }
   */
  function create(config) {
    var btn = document.createElement('button');
    btn.type = 'button'; // Prevent form submission
    
    // Base class
    var typeClass = config.type ? 'btn-' + config.type : 'btn-primary';
    if (config.type === 'tool') typeClass = 'btn-tool'; // Special case for toolbar
    
    btn.className = 'btn ' + typeClass + (config.className ? ' ' + config.className : '');
    
    if (config.id) btn.id = config.id;
    if (config.disabled) btn.disabled = true;
    if (config.tooltip) btn.title = config.tooltip;

    // Raw attribute string support (e.g. 'data-tooltip="..."')
    if (config.attrs) {
      var tempEl = document.createElement('div');
      tempEl.innerHTML = '<span ' + config.attrs + '></span>';
      var tempSpan = tempEl.firstChild;
      if (tempSpan && tempSpan.attributes) {
        for (var i = 0; i < tempSpan.attributes.length; i++) {
          btn.setAttribute(tempSpan.attributes[i].name, tempSpan.attributes[i].value);
        }
      }
    }

    // Build nội dung
    var innerHTML = '';
    if (config.icon) {
      innerHTML += '<span class="material-symbols-outlined">' + config.icon + '</span>';
    }
    if (config.text) {
      innerHTML += '<span>' + config.text + '</span>';
    }
    btn.innerHTML = innerHTML;

    // Gắn sự kiện
    if (typeof config.onClick === 'function') {
      btn.addEventListener('click', function(e) {
        if (!btn.disabled) {
          config.onClick(e);
        }
      });
    }

    return btn;
  }

  /**
   * Tạo Bar chứa danh sách các nút
   * @param {Array} buttonsConfig - Mảng config của các nút
   */
  function createBar(buttonsConfig) {
    // ===== DESKTOP BUTTON BAR =====
    var bar = document.createElement('div');
    // btn-bar-desktop: bi class CSS ẩn trên mobile
    bar.className = 'button-bar btn-bar-desktop';

    buttonsConfig.forEach(function(cfg) {
      if (cfg === '|') {
        var div = document.createElement('div');
        div.className = 'divider';
        bar.appendChild(div);
      } else {
        bar.appendChild(create(cfg));
      }
    });

    // ===== MOBILE ACTION SHEET =====
    // Panel & Overlay được gắn vào body để tránh bị nhốt bởi overflow/transform của các thần chứa
    var panel = document.createElement('div');
    panel.className = 'mobile-action-panel';

    buttonsConfig.forEach(function(cfg) {
      if (cfg === '|' || !cfg.text) return;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'mobile-action-item' + (cfg.disabled ? ' is-disabled' : '');
      if (cfg.disabled) item.disabled = true;
      item.innerHTML =
        (cfg.icon ? '<span class="material-symbols-outlined">' + cfg.icon + '</span>' : '') +
        '<span>' + cfg.text + '</span>';
      item.addEventListener('click', function(e) {
        closePanel();
        if (!cfg.disabled && typeof cfg.onClick === 'function') cfg.onClick(e);
      });
      panel.appendChild(item);
    });

    var overlay = document.createElement('div');
    overlay.className = 'mobile-action-overlay';

    // Gắn panel + overlay vào body ngay khi DOM sẵn sàng
    function mountToBody() {
      if (document.body) {
        document.body.appendChild(overlay);
        document.body.appendChild(panel);
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(overlay);
          document.body.appendChild(panel);
        });
      }
    }
    mountToBody();

    function openPanel() {
      // Show first to get dimensions if needed
      panel.classList.add('open');
      overlay.classList.add('open');
      trigger.classList.add('active');
      
      var rect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      
      var top = rect.bottom + 4;
      if (top + panelRect.height > window.innerHeight && rect.top > panelRect.height) {
        top = rect.top - panelRect.height - 4; // pop upwards
        panel.style.transformOrigin = 'bottom left';
      } else {
        panel.style.transformOrigin = 'top left';
      }
      
      panel.style.top = top + 'px';
      
      // Smart positioning for left/right
      if (rect.left < window.innerWidth / 2) {
        // Button is on the left, anchor to the left
        panel.style.left = rect.left + 'px';
        panel.style.right = 'auto';
        panel.style.transformOrigin = panel.style.transformOrigin.replace('right', 'left');
      } else {
        // Button is on the right, anchor to the right
        var rightSpace = window.innerWidth - rect.right;
        panel.style.right = rightSpace + 'px';
        panel.style.left = 'auto';
        panel.style.transformOrigin = panel.style.transformOrigin.replace('left', 'right');
      }
    }
    function closePanel() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      trigger.classList.remove('active');
    }

    overlay.addEventListener('click', closePanel);

    // Nút trigger chỉ hiện trên mobile
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'btn mobile-action-trigger';
    trigger.innerHTML =
      '<span class="material-symbols-outlined">settings</span>' +
      '<span>Thao tác</span>' +
      '<span class="material-symbols-outlined mobile-action-chevron">expand_more</span>';
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      panel.classList.contains('open') ? closePanel() : openPanel();
    });

    // Wrapper đơn giản
    var wrapper = document.createElement('div');
    wrapper.className = 'mobile-action-wrapper';
    wrapper.appendChild(bar);
    wrapper.appendChild(trigger);

    // API công khai: cho phép thêm button config vào action sheet sau khi tạo
    wrapper.addToMobilePanel = function(cfg, insertFirst) {
      // Thêm vào desktop bar
      var btn = create(cfg);
      if (insertFirst) {
        bar.insertBefore(btn, bar.firstChild);
      } else {
        bar.appendChild(btn);
      }

      // Thêm vào mobile panel
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'mobile-action-item' + (cfg.disabled ? ' is-disabled' : '');
      if (cfg.disabled) item.disabled = true;
      item.innerHTML =
        (cfg.icon ? '<span class="material-symbols-outlined">' + cfg.icon + '</span>' : '') +
        '<span>' + cfg.text + '</span>';
      item.addEventListener('click', function(e) {
        closePanel();
        if (!cfg.disabled && typeof cfg.onClick === 'function') cfg.onClick(e);
      });
      if (insertFirst) {
        panel.insertBefore(item, panel.firstChild);
      } else {
        panel.appendChild(item);
      }
    };

    return wrapper;

  }

  /**
   * Sinh HTML chuỗi cho Button
   */
  function createHTML(config) {
    var typeClass = config.type ? 'btn-' + config.type : 'btn-primary';
    if (config.type === 'tool') typeClass = 'btn-tool';
    
    var className = 'btn ' + typeClass + (config.className ? ' ' + config.className : '');
    var idAttr = config.id ? ` id="${config.id}"` : '';
    var disabledAttr = config.disabled ? ' disabled' : '';
    var titleAttr = config.tooltip ? ` title="${config.tooltip}"` : '';
    var onClickAttr = config.onClick ? ` onclick="${config.onClick}"` : '';
    var styleAttr = config.style ? ` style="${config.style}"` : '';
    
    var dataAttrs = '';
    if (config.data) {
      for (var key in config.data) {
        dataAttrs += ` data-${key}="${config.data[key]}"`;
      }
    }
    
    var innerHTML = '';
    if (config.icon) {
      var iconStyle = config.iconStyle ? ` style="${config.iconStyle}"` : '';
      innerHTML += `<span class="material-symbols-outlined"${iconStyle}>${config.icon}</span>`;
    }
    if (config.text) {
      var textStyle = config.textStyle ? ` style="${config.textStyle}"` : '';
      innerHTML += config.icon ? ` <span${textStyle}>${config.text}</span>` : `<span${textStyle}>${config.text}</span>`;
    }

    return `<button type="button" class="${className}"${idAttr}${disabledAttr}${titleAttr}${onClickAttr}${styleAttr}${dataAttrs}>${innerHTML}</button>`;
  }

  return {
    create: create,
    createBar: createBar,
    createHTML: createHTML
  };
})();
