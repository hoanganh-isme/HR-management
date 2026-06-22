/**
 * Global Event Bus - Lõi Pub/Sub để các component giao tiếp với nhau
 * Giúp đồng bộ dữ liệu toàn hệ thống mà không cần truyền biến phức tạp
 */
var EventBus = (function() {
  var listeners = {};

  return {
    // Đăng ký lắng nghe sự kiện
    on: function(event, callback) {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    // Bỏ đăng ký lắng nghe
    off: function(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(function(cb) {
        return cb !== callback;
      });
    },

    // Phát sự kiện toàn cục kèm theo dữ liệu (nếu có)
    emit: function(event, data) {
      console.debug('[EventBus] emit:', event, data ? data : '');
      if (listeners[event]) {
        listeners[event].forEach(function(callback) {
          callback(data);
        });
      }
    }
  };
})();
