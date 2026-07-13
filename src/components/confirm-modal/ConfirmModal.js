/**
 * Confirm Modal Component
 * Hộp thoại hỏi ý kiến (Xóa/Lưu dữ liệu)
 */
var ConfirmModal = (function () {
  var modalOverlay = null;

  function init() {
    if (document.getElementById('confirm-modal-overlay')) return;

    modalOverlay = document.createElement('div');
    modalOverlay.id = 'confirm-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';

    var html = `
      <div class="modal-content" style="width: 400px;">
        <div class="modal-header">
          <h3 id="confirm-modal-title">Xác nhận</h3>
          <button class="btn-close-modal" id="confirm-modal-btn-close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="card-body">
          <p id="confirm-modal-message" style="margin-bottom: 24px; color: var(--color-text-secondary);"></p>
          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button class="btn btn-secondary" id="confirm-modal-btn-cancel">Hủy bỏ</button>
            <button class="btn btn-primary" id="confirm-modal-btn-confirm">Đồng ý</button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.innerHTML = html;
    document.body.appendChild(modalOverlay);
  }

  /**
   * Mở hộp thoại xác nhận
   * @param {Object} options - { title, message, confirmText, confirmClass, onConfirm }
   */
  function show(options) {
    if (!modalOverlay) init();

    document.getElementById('confirm-modal-title').innerText = options.title || 'Xác nhận';
    document.getElementById('confirm-modal-message').innerHTML = options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?';

    var btnConfirm = document.getElementById('confirm-modal-btn-confirm');
    btnConfirm.innerText = options.confirmText || 'Đồng ý';
    btnConfirm.className = 'btn ' + (options.confirmClass || 'btn-primary');

    var btnCancel = document.getElementById('confirm-modal-btn-cancel');
    var btnClose = document.getElementById('confirm-modal-btn-close');

    // Remove old listeners using clone node trick
    var newBtnConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

    var newBtnCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

    var newBtnClose = btnClose.cloneNode(true);
    btnClose.parentNode.replaceChild(newBtnClose, btnClose);

    // Add new listeners
    newBtnConfirm.addEventListener('click', function () {
      hide();
      if (typeof options.onConfirm === 'function') options.onConfirm();
    });

    newBtnCancel.addEventListener('click', hide);
    newBtnClose.addEventListener('click', hide);

    modalOverlay.style.display = 'flex';
    history.pushState({ modalId: 'confirm-modal' }, null, "");
  }

  function hide() {
    if (modalOverlay && modalOverlay.style.display !== 'none') {
      modalOverlay.style.display = 'none';
      if (history.state && history.state.modalId === 'confirm-modal') {
        history.back();
      }
    }
  }

  return {
    show: show,
    hide: hide
  };
})();

window.ConfirmModal = ConfirmModal;

// Xử lý nút Back của trình duyệt/điện thoại
window.addEventListener('popstate', function (e) {
  var overlay = document.getElementById('confirm-modal-overlay');
  if (overlay && overlay.style.display !== 'none') {
    overlay.style.display = 'none';
  }
});
