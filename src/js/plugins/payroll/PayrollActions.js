(function () {
  'use strict';

  // Cấu hình Plugin Button "Tạo bảng lương tháng"
  if (!window.FormActionPlugins) window.FormActionPlugins = [];
  window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'payroll_plugin'; });
  window.FormActionPlugins.push({
    id: 'payroll_plugin',
    getExtraButtons: function (formName, getSelected, config, onReload) {
      if (formName !== 'WA_PayrollFrm') return [];
      return [
        {
          text: 'Tạo bảng lương tháng',
          icon: 'calculate',
          type: 'primary',
          onClick: function () {
            if (typeof ApiClient === 'undefined') return;

            var loadingToast = typeof UIToast !== 'undefined' ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;

            GatewayClient.view('SY_Period', { limit: 1000 }).then(function (res) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);

              var records = res.records || (Array.isArray(res) ? res : []);
              if (records.length === 0) {
                if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Không tìm thấy kỳ lương nào trong hệ thống!');
                return;
              }

              // Sắp xếp kỳ giảm dần
              records.sort(function (a, b) {
                return String(b.PeriodID).localeCompare(String(a.PeriodID));
              });

              var selectOptions = records.map(function (p) {
                return '<option value="' + p.PeriodID + '">' + p.PeriodID + ' (' + (p.PeriodName || p.PeriodID) + ')</option>';
              }).join('');

              var selectHtml =
                '<div style="text-align: left; margin-top: 10px;">' +
                '  <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn kỳ lương cần tính toán:</label>' +
                '  <select id="payroll-process-period" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                selectOptions +
                '  </select>' +
                '</div>';

              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: 'Tạo Bảng Lương Tháng',
                  message: selectHtml,
                  confirmText: 'Tính Lương',
                  confirmClass: 'btn-primary',
                  onConfirm: function () {
                    var selectedPeriod = document.getElementById('payroll-process-period').value;
                    if (!selectedPeriod) return;

                    if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.show(true, 'Đang tính toán bảng lương kỳ ' + selectedPeriod + '...');

                    GatewayClient.execute('WA_PayRoll_Process_Stp', { PeriodID: selectedPeriod }).then(function (result) {
                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();

                      var resData = Array.isArray(result) ? result[0] : (result.records && result.records[0] ? result.records[0] : result);
                      var code = resData.code !== undefined ? resData.code : (resData.Code !== undefined ? resData.Code : 0);
                      var msg = resData.msg || resData.Msg || resData.message || 'Thành công';

                      if (code == 0) {
                        if (typeof Alert !== 'undefined') Alert.success('Thành công', msg);
                        if (window.currentFilters) {
                          window.currentFilters['PeriodID'] = selectedPeriod;
                        } else {
                          window.currentFilters = { PeriodID: selectedPeriod };
                        }
                        if (typeof onReload === 'function') onReload();
                      } else {
                        if (typeof Alert !== 'undefined') Alert.error('Lỗi tính lương', msg);
                      }
                    }).catch(function (err) {
                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();
                      console.error('Lỗi tính lương:', err);
                      if (typeof Alert !== 'undefined') Alert.error('Lỗi kết nối', err.message || 'Không thể kết nối đến máy chủ.');
                    });
                  }
                });
              }
            }).catch(function (err) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
              console.error('Lỗi tải kỳ lương:', err);
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách kỳ lương.');
            });
          }
        }
      ];
    }
  });
})();

