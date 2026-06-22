/**
 * KeyboardManager — Quản lý phím tắt tập trung
 * Hỗ trợ các phím chuyên dụng: F2, F3, F4, Space, Enter, Esc
 */
var KeyboardManager = (function () {

  function init() {
    document.addEventListener('keydown', function (e) {
      var target = document.activeElement;
      if (!target || target.tagName === 'BODY') return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          _dispatch(target, 'kb:new');       // Thêm mới danh mục
          break;
        case 'F3':
          e.preventDefault();
          _dispatch(target, 'kb:lookup');    // Mở danh sách tra cứu
          break;
        case 'F4':
          e.preventDefault();
          _dispatch(target, 'kb:open');      // Mở dropdown
          break;
        case ' ': // Space bar
          if (target.type === 'checkbox') {
            e.preventDefault();
            target.checked = !target.checked;
            target.dispatchEvent(new Event('change', { bubbles: true }));
          }
          break;
        case 'Escape':
          _dispatch(target, 'kb:close');
          break;
      }
    });

    // Support trigger by right-clicking checkboxes
    document.addEventListener('contextmenu', function (e) {
      if (e.target && e.target.type === 'checkbox') {
        e.preventDefault();
        e.target.checked = !e.target.checked;
        e.target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  // Bubble custom event lên DOM để component tự lắng nghe
  function _dispatch(el, eventName) {
    el.dispatchEvent(new CustomEvent(eventName, { bubbles: true, cancelable: true }));
  }

  return { init: init };
})();
