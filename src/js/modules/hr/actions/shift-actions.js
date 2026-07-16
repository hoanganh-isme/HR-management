(function (global) {
  var ACTION_NAME = 'hr.shift.auto';

  function run(context) {
    var shiftId = context && context.shiftId;
    var button = context && context.button;
    if (!shiftId) {
      if (global.Alert) Alert.warning('Chưa lưu', 'Vui lòng Lưu thay đổi trước khi chạy Sắp ca tự động');
      return Promise.resolve();
    }
    var originalHtml = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
    }
    return ApiClient.post('/api/HR_CaLamViec_SapCaStp', { SapCaID: shiftId }).then(function (response) {
      if (response && response.code === 0) {
        if (global.Alert) Alert.success('Thành công', 'Đã sắp ca tự động thành công');
        var refresh = document.querySelector('.btn-refresh-tab');
        if (refresh) refresh.click();
        else if (global.DynamicFormEngine && typeof DynamicFormEngine.reloadDetailTabs === 'function') DynamicFormEngine.reloadDetailTabs();
      } else if (global.Alert) Alert.error('Lỗi', response && response.msg || 'Chạy sắp ca thất bại');
      return response;
    }).catch(function (error) {
      if (global.Alert) Alert.error('Lỗi', 'Lỗi hệ thống khi gọi API sắp ca');
      return null;
    }).finally(function () {
      if (button) { button.disabled = false; button.innerHTML = originalHtml; }
    });
  }

  function runFromLegacyButton() {
    var form = document.querySelector('.df-master-wrapper, .split-master-detail-container');
    if (!form) {
      if (global.Alert) Alert.error('Lỗi', 'Không tìm thấy form');
      return Promise.resolve();
    }
    var input = form.querySelector('[name="SapCaID"]');
    var button = form.querySelector('button[onclick="window.SapCaTuDong()"]');
    return FormActionRegistry.execute(ACTION_NAME, { shiftId: input ? input.value : '', button: button });
  }

  function register() {
    if (!global.FormActionRegistry) return;
    FormActionRegistry.register(ACTION_NAME, run);
  }

  global.ShiftActions = { register: register, run: run, runFromLegacyButton: runFromLegacyButton };
  register();
  global.SapCaTuDong_ByID = function (shiftId, button) { return FormActionRegistry.execute(ACTION_NAME, { shiftId: shiftId, button: button }); };
  global.SapCaTuDong = runFromLegacyButton;
})(window);
