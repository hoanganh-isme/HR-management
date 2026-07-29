/**
 * Lớp tương thích cho các màn hình còn gọi UIToast.
 * Mọi thông báo được chuyển về Alert để toàn hệ thống chỉ dùng popup phía trên.
 */
var UIToast = (function () {
  var TYPE_CONFIG = {
    success: { method: 'success', title: 'Thành công' },
    error: { method: 'error', title: 'Lỗi' },
    danger: { method: 'error', title: 'Lỗi' },
    warning: { method: 'warning', title: 'Cảnh báo' },
    info: { method: 'info', title: 'Thông báo' }
  };

  function show(message, type, duration) {
    var normalizedType = String(type || 'success').trim().toLowerCase();
    var config = TYPE_CONFIG[normalizedType] || TYPE_CONFIG.info;
    if (!window.Alert || typeof Alert[config.method] !== 'function') return null;
    var t = Alert[config.method](config.title, String(message || ''), duration);
    if (t && typeof t.close !== 'function') {
      t.close = function () { hide(t); };
    }
    return t;
  }

  function hide(notification) {
    if (!window.Alert || typeof Alert.hide !== 'function') return;
    Alert.hide(notification);
  }

  return {
    show: show,
    hide: hide
  };
})();
