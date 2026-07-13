(function () {
  'use strict';

  // Cấu hình Plugin Button "Tạo bảng chấm công" cho trang WA_TimeSheetDayFrm
  if (!window.FormActionPlugins) window.FormActionPlugins = [];
  window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'timesheet_day_plugin'; });
  window.FormActionPlugins.push({
    id: 'timesheet_day_plugin',
    getExtraButtons: function (formName, getSelected, config, onReload) {
      if (formName !== 'WA_TimeSheetDayFrm') return [];
      return [
        {
          text: 'Tạo bảng chấm công',
          icon: 'today',
          type: 'primary',
          onClick: function () {
            if (typeof ApiClient === 'undefined') return;

            var loadingToast = typeof UIToast !== 'undefined' ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;

            GatewayClient.view('SY_Period', { limit: 1000 }).then(function (res) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);

              var records = res.records || (Array.isArray(res) ? res : []);
              if (records.length === 0) {
                if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Không tìm thấy kỳ chấm công nào trong hệ thống!');
                return;
              }

              // Sắp xếp kỳ giảm dần
              records.sort(function (a, b) {
                return String(b.PeriodID).localeCompare(String(a.PeriodID));
              });

              var selectOptions = records.map(function (p) {
                return '<option value="' + p.PeriodID + '">' + p.PeriodID + ' (' + (p.PeriodName || p.PeriodID) + ')</option>';
              }).join('');

              // Tải thêm danh sách chi nhánh phục vụ việc chọn chi nhánh khi tạo
              GatewayClient.view('API_DanhSachChiNhanh', { limit: 1000 }).then(function (branchRes) {
                var branches = branchRes.list || branchRes.records || [];
                var branchOptions = '<option value="">-- Tất cả Chi nhánh --</option>';
                if (branches && branches.length > 0) {
                  branchOptions += branches.map(function (b) {
                    return '<option value="' + b.BranchID + '">' + (b.BranchName || b.BranchID) + '</option>';
                  }).join('');
                }

                var selectHtml =
                  '<div style="text-align: left; margin-top: 10px;">' +
                  '  <div class="mb-3">' +
                  '    <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn kỳ chấm công:</label>' +
                  '    <select id="timesheet-process-period" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                  selectOptions +
                  '    </select>' +
                  '  </div>' +
                  '  <div class="mb-2">' +
                  '    <label style="font-weight: 600; font-size: 13px; color: var(--color-text-secondary); display: block; margin-bottom: 8px;">Chọn chi nhánh:</label>' +
                  '    <select id="timesheet-process-branch" class="ui-input" style="width: 100%; height: 38px; border: 1px solid var(--color-border-strong); border-radius: 8px; background: var(--color-surface); color: var(--color-text); font-size: 14px; outline: none; padding: 0 10px;">' +
                  branchOptions +
                  '    </select>' +
                  '  </div>' +
                  '</div>';

                if (typeof ConfirmModal !== 'undefined') {
                  ConfirmModal.show({
                    title: 'Tạo Bảng Chấm Công Hàng Ngày',
                    message: selectHtml,
                    confirmText: 'Tạo Bảng',
                    confirmClass: 'btn-primary',
                    onConfirm: function () {
                      var selectedPeriod = document.getElementById('timesheet-process-period').value;
                      var selectedBranch = document.getElementById('timesheet-process-branch').value;
                      if (!selectedPeriod) return;

                      if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.show(true, 'Đang tạo bảng chấm công kỳ ' + selectedPeriod + '...');

                      GatewayClient.execute('WA_TimeSheetDay_Process_Stp', {
                        PeriodID: selectedPeriod,
                        BranchID: selectedBranch
                      }).then(function (result) {
                        if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();

                        var resData = Array.isArray(result) ? result[0] : (result.records && result.records[0] ? result.records[0] : result);
                        var code = resData.code !== undefined ? resData.code : (resData.Code !== undefined ? resData.Code : 0);
                        var msg = resData.msg || resData.Msg || resData.message || 'Thành công';

                        if (code == 0) {
                          if (typeof Alert !== 'undefined') Alert.success('Thành công', msg);
                          if (window.currentFilters) {
                            window.currentFilters['PeriodID'] = selectedPeriod;
                            window.currentFilters['BranchID'] = selectedBranch;
                          } else {
                            window.currentFilters = { PeriodID: selectedPeriod, BranchID: selectedBranch };
                          }
                          if (typeof onReload === 'function') onReload();
                        } else {
                          if (typeof Alert !== 'undefined') Alert.error('Lỗi tạo bảng', msg);
                        }
                      }).catch(function (err) {
                        if (typeof LoadingSpinner !== 'undefined') LoadingSpinner.hide();
                        console.error('Lỗi tạo bảng chấm công:', err);
                        if (typeof Alert !== 'undefined') Alert.error('Lỗi kết nối', err.message || 'Không thể kết nối đến máy chủ.');
                      });
                    }
                  });
                }
              }).catch(function (err) {
                if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
                console.error('Lỗi tải danh sách chi nhánh:', err);
                if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách chi nhánh.');
              });
            }).catch(function (err) {
              if (loadingToast && typeof UIToast !== 'undefined') UIToast.hide(loadingToast);
              console.error('Lỗi tải kỳ chấm công:', err);
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không thể tải danh sách kỳ.');
            });
          }
        }
      ];
    }
  });
})();

