/**
 * UITooltip — JS-driven tooltip dùng position: fixed
 * Không bị clip bởi overflow:hidden/auto của bất kỳ container nào.
 * Tự động gắn vào mọi [data-tooltip] khi DOM thay đổi.
 */
var UITooltip = (function () {
  var _el = null;
  var _hideTimer = null;

  function _getEl() {
    if (!_el) {
      _el = document.createElement('div');
      _el.id = 'ui-tooltip';
      document.body.appendChild(_el);
    }
    return _el;
  }

  function show(text, anchorEl) {
    clearTimeout(_hideTimer);
    var tip = _getEl();
    tip.textContent = text;
    tip.classList.remove('visible');

    // Tính vị trí: bên dưới anchor
    var rect = anchorEl.getBoundingClientRect();
    var tipLeft = rect.left + rect.width / 2;
    var tipTop = rect.bottom + 8;

    tip.style.left = tipLeft + 'px';
    tip.style.top = tipTop + 'px';
    tip.style.transform = 'translateX(-50%)';

    // Kiểm tra có tràn ra phải màn hình không
    requestAnimationFrame(function () {
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.right > window.innerWidth - 8) {
        tip.style.left = (window.innerWidth - tipRect.width - 8) + 'px';
        tip.style.transform = 'none';
      }
      tip.classList.add('visible');
    });
  }

  function hide() {
    _hideTimer = setTimeout(function () {
      var tip = _getEl();
      tip.classList.remove('visible');
    }, 100);
  }

  function init() {
    // Dùng event delegation trên document để bắt tất cả [data-tooltip]
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('[data-tooltip]');
      if (target) {
        show(target.getAttribute('data-tooltip'), target);
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('[data-tooltip]');
      if (target) {
        hide();
      }
    });

    document.addEventListener('scroll', hide, true);
    document.addEventListener('click', hide, true);
  }

  // Tự khởi động khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { show: show, hide: hide };
})();
