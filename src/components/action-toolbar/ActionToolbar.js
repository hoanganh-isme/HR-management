/**
 * Action Toolbar Component
 * Thanh công cụ chuẩn 6 nút: Thêm, Sửa, Xóa, Lọc, In, Đóng theo REQUIREMENT.md
 */
var UIActionToolbar = (function () {

  /**
   * Sinh thanh Toolbar nghiệp vụ
   * @param {Object} actions - { onAdd, onEdit, onDelete, onFilter, onPrint, onClose }
   */
  function create(actions) {
    actions = actions || {};
    
    var buttons = [
      { text: 'Thêm',  icon: 'add',        type: 'tool', onClick: actions.onAdd,    attrs: 'data-tooltip="Thêm bản ghi mới (Ins)"' },
      { text: 'Sửa',   icon: 'edit',       type: 'tool', onClick: actions.onEdit,   attrs: 'data-tooltip="Sửa bản ghi đã chọn (F2)"' },
      { text: 'Xóa',   icon: 'delete',     type: 'tool', onClick: actions.onDelete, attrs: 'data-tooltip="Xóa bản ghi đã chọn (Del)"' },
      { text: 'Lọc',   icon: 'filter_alt', type: 'tool', onClick: actions.onFilter, attrs: 'data-tooltip="Lọc / Tìm kiếm dữ liệu"' },
      { text: 'In',    icon: 'print',      type: 'tool', onClick: actions.onPrint,  attrs: 'data-tooltip="In danh sách (Ctrl+P)"' },
      { text: 'Đóng',  icon: 'close',      type: 'tool', onClick: actions.onClose,  attrs: 'data-tooltip="Đóng trang hiện tại"' }
    ];

    if (actions.extras && Array.isArray(actions.extras)) {
      actions.extras.forEach(function (btn) {
        buttons.push(btn);
      });
    }

    var filteredButtons = [];
    buttons.forEach(function(b) {
      if (b.onClick === false) return; // Hide button
      if (b.onClick === 'DISABLED' || b.onClick === 'disabled') {
        b.disabled = true;
        b.onClick = function() {
          if (typeof Alert !== 'undefined') Alert.warning('Từ chối', 'Bạn không có quyền thao tác chức năng này!');
        };
      }
      filteredButtons.push(b);
    });

    return UIButton.createBar(filteredButtons);
  }

  return {
    create: create
  };
})();
