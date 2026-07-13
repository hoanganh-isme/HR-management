window.ShiftActions = (function () {
  function autoAssignById(sapCaID, callerBtn) {
    if (!sapCaID) {
      if (typeof Alert !== 'undefined') Alert.warning('Chưa lưu', 'Vui lòng Lưu thay đổi trước khi chạy Sắp ca tự động');
      return;
    }
    var originalHtml = callerBtn ? callerBtn.innerHTML : '';
    if (callerBtn) {
      callerBtn.disabled = true;
      callerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
    }
    return ApiClient.post('/api/HR_CaLamViec_SapCaStp', { SapCaID: sapCaID })
      .then(function (res) {
        if (res && res.code === 0) {
          if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã sắp ca tự động thành công');
          var refreshBtn = document.querySelector('.btn-refresh-tab');
          if (refreshBtn) refreshBtn.click();
          else if (window.DynamicFormEngine && typeof window.DynamicFormEngine.reloadDetailTabs === 'function') window.DynamicFormEngine.reloadDetailTabs();
        } else if (typeof Alert !== 'undefined') {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Chạy sắp ca thất bại');
        }
        return res;
      })
      .catch(function (error) {
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi hệ thống khi gọi API sắp ca');
        throw error;
      })
      .finally(function () {
        if (callerBtn) {
          callerBtn.disabled = false;
          callerBtn.innerHTML = originalHtml;
        }
      });
  }

  function autoAssignFromForm() {
    var form = document.querySelector('.df-master-wrapper, .split-master-detail-container');
    if (!form) {
      if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không tìm thấy form');
      return;
    }
    var sapCaInput = form.querySelector('[name="SapCaID"]');
    var button = form.querySelector('button[onclick="window.SapCaTuDong()"]');
    return autoAssignById(sapCaInput ? sapCaInput.value : '', button);
  }

  FormActionRegistry.register('ShiftActions.autoAssign', function (context) {
    return autoAssignById(context.sapCaID, context.callerBtn);
  });
  FieldRendererRegistry.register('SHIFT_AUTO_ASSIGN_BUTTON', function () {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary';
    button.style.marginTop = '28px';
    button.style.width = '100%';
    button.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;">auto_fix_high</span> Sắp ca tự động';
    button.addEventListener('click', autoAssignFromForm);
    return button;
  });
  return { autoAssignById: autoAssignById, autoAssignFromForm: autoAssignFromForm };
})();

window.SapCaTuDong_ByID = window.ShiftActions.autoAssignById;
window.SapCaTuDong = window.ShiftActions.autoAssignFromForm;
