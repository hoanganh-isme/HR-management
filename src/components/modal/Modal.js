/**
 * Generic Modal Builder
 * Mở các Pop-up Window Nhập liệu / Báo cáo không cần code cứng HTML
 */
var UIModal = (function () {
  
  /**
   * Mở một form Modal bất kỳ
   * @param {Object} config - { id, title, width, content (Node/String), footer (Node), onClose }
   */
  function show(config) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    if (config.id) overlay.id = config.id;

    var contentWidth = config.width || '600px';

    var html = `
      <div class="modal-content" style="width: ${contentWidth}; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; animation: fadeIn 0.2s ease;">
        <div class="modal-header" style="flex-shrink: 0;">
          <h3>${config.title || 'Tiêu đề'}</h3>
          <button class="btn-close-modal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="card-body ui-modal-body" style="overflow-y: auto; padding: 16px;"></div>
        <div class="modal-footer" style="flex-shrink: 0; padding: 16px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 12px; background: var(--color-surface); border-radius: 0 0 var(--radius-lg) var(--radius-lg);"></div>
      </div>
    `;
    overlay.innerHTML = html;

    var bodyWrapper = overlay.querySelector('.ui-modal-body');
    if (typeof config.content === 'string') {
      bodyWrapper.innerHTML = config.content;
    } else if (config.content instanceof Node) {
      bodyWrapper.appendChild(config.content);
    }

    var footerWrapper = overlay.querySelector('.modal-footer');
    if (typeof config.footer === 'string') {
      footerWrapper.innerHTML = config.footer;
    } else if (config.footer instanceof Node) {
      footerWrapper.appendChild(config.footer);
    } else {
      footerWrapper.style.display = 'none';
    }

    document.getElementById('modal-container').appendChild(overlay);

    var modalId = config.id || 'modal-' + Date.now();
    // Dùng URL hiện tại (giữ nguyên hash) để không làm mất route
    history.pushState({ modalId: modalId }, null, window.location.href);

    var _closed = false;

    // Đóng modal VÀ gọi history.back() (dùng cho nút X, nút Hủy)
    function close() {
      if (_closed) return;
      _closed = true;
      overlay.remove();
      if (history.state && history.state.modalId === modalId) {
        history.back();
      }
      if (typeof config.onClose === 'function') config.onClose();
    }

    // Đóng modal KHÔNG gọi history.back() (dùng khi lưu thành công)
    function closeNow() {
      if (_closed) return;
      _closed = true;
      overlay.remove();
      if (typeof config.onClose === 'function') config.onClose();
    }

    overlay.querySelector('.btn-close-modal').addEventListener('click', close);

    return {
      close: close,
      closeNow: closeNow,
      node: overlay
    };
  }

  return {
    show: show
  };
})();

// Xử lý nút Back của trình duyệt/điện thoại
window.addEventListener('popstate', function (e) {
  // Chỉ đóng modal nếu state KHÔNG phải là modal (tránh xóa khi router hashchange)
  if (!e.state || !e.state.modalId) {
    document.querySelectorAll('#modal-container .modal-overlay').forEach(function(m) {
      m.remove();
    });
  }
});

