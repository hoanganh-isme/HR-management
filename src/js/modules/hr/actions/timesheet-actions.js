(function (global) {
  var ACTION_NAME = 'hr.timesheet.process';

  function gateway() { return AppConfig.apiGateway; }
  function rowsOf(response) { return response ? (response.list || response.records || (Array.isArray(response) ? response : [])) : []; }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]; }); }

  function run(context) {
    var loading = global.UIToast ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;
    return ApiClient.post(gateway(), { List: 'SY_Period', Func: 'View', Limit: 1000 }).then(function (periodResponse) {
      var periods = rowsOf(periodResponse).sort(function (a, b) { return String(b.PeriodID).localeCompare(String(a.PeriodID)); });
      if (!periods.length) {
        if (loading && global.UIToast) UIToast.hide(loading);
        if (global.Alert) Alert.warning('Cảnh báo', 'Không tìm thấy kỳ chấm công nào trong hệ thống!');
        return;
      }
      return ApiClient.post(gateway(), { List: 'API_DanhSachChiNhanh', Func: 'View', Limit: 1000 }).then(function (branchResponse) {
        if (loading && global.UIToast) UIToast.hide(loading);
        var periodOptions = periods.map(function (period) { return '<option value="' + escapeHtml(period.PeriodID) + '">' + escapeHtml(period.PeriodID) + ' (' + escapeHtml(period.PeriodName || period.PeriodID) + ')</option>'; }).join('');
        var branchOptions = '<option value="">-- Tất cả Chi nhánh --</option>' + rowsOf(branchResponse).map(function (branch) { return '<option value="' + escapeHtml(branch.BranchID) + '">' + escapeHtml(branch.BranchName || branch.BranchID) + '</option>'; }).join('');
        ConfirmModal.show({
          title: 'Tạo Bảng Chấm Công Hàng Ngày',
          message: '<div style="text-align:left;margin-top:10px;"><label style="font-weight:600;display:block;margin-bottom:8px;">Chọn kỳ chấm công:</label><select id="timesheet-process-period" class="ui-input" style="width:100%;height:38px;">' + periodOptions + '</select><label style="font-weight:600;display:block;margin:12px 0 8px;">Chọn chi nhánh:</label><select id="timesheet-process-branch" class="ui-input" style="width:100%;height:38px;">' + branchOptions + '</select></div>',
          confirmText: 'Tạo Bảng',
          confirmClass: 'btn-primary',
          onConfirm: function () {
            var period = document.getElementById('timesheet-process-period');
            var branch = document.getElementById('timesheet-process-branch');
            var periodId = period && period.value;
            var branchId = branch && branch.value;
            if (!periodId) return;
            if (global.LoadingSpinner) LoadingSpinner.show(true, 'Đang tạo bảng chấm công kỳ ' + periodId + '...');
            ApiClient.post(gateway(), { List: 'WA_TimeSheetDay_Process_Stp', Func: 'View', JsonData: JSON.stringify({ PeriodID: periodId, BranchID: branchId }) }).then(function (result) {
              if (global.LoadingSpinner) LoadingSpinner.hide();
              var data = Array.isArray(result) ? result[0] : (result.records && result.records[0] || result);
              var code = data && (data.code !== undefined ? data.code : data.Code);
              var message = data && (data.msg || data.Msg || data.message) || 'Thành công';
              if (code == 0) {
                if (global.Alert) Alert.success('Thành công', message);
                global.currentFilters = Object.assign({}, global.currentFilters || {}, { PeriodID: periodId, BranchID: branchId });
                if (typeof context.onReload === 'function') context.onReload();
              } else if (global.Alert) Alert.error('Lỗi tạo bảng', message);
            }).catch(function (error) {
              if (global.LoadingSpinner) LoadingSpinner.hide();
              if (global.Alert) Alert.error('Lỗi kết nối', error.message || 'Không thể kết nối đến máy chủ.');
            });
          }
        });
      });
    }).catch(function () {
      if (loading && global.UIToast) UIToast.hide(loading);
      if (global.Alert) Alert.error('Lỗi', 'Không thể tải dữ liệu tạo bảng chấm công.');
    });
  }

  function register() {
    if (!global.FormActionRegistry) return;
    FormActionRegistry.register(ACTION_NAME, run);
    global.FormActionPlugins = (global.FormActionPlugins || []).filter(function (plugin) { return plugin.id !== 'timesheet_day_plugin'; });
    global.FormActionPlugins.push({
      id: 'timesheet_day_plugin',
      getExtraButtons: function (formName, getSelected, config, onReload) {
        if (!config || config.ProcessAction !== ACTION_NAME) return [];
        return [{ text: 'Tạo bảng chấm công', icon: 'today', type: 'primary', onClick: function () { FormActionRegistry.execute(ACTION_NAME, { config: config, onReload: onReload }); } }];
      }
    });
  }

  global.TimesheetActions = { register: register, run: run };
  register();
})(window);
