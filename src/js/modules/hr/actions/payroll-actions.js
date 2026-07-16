(function (global) {
  var ACTION_NAME = 'hr.payroll.process';

  function gateway() {
    return AppConfig.apiGateway;
  }

  function rowsOf(response) {
    return response ? (response.records || response.list || (Array.isArray(response) ? response : [])) : [];
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function run(context) {
    var loading = global.UIToast ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;
    return ApiClient.post(gateway(), { List: 'SY_Period', Func: 'View', Limit: 1000 }).then(function (response) {
      if (loading && global.UIToast) UIToast.hide(loading);
      var periods = rowsOf(response).sort(function (a, b) { return String(b.PeriodID).localeCompare(String(a.PeriodID)); });
      if (!periods.length) {
        if (global.Alert) Alert.warning('Cảnh báo', 'Không tìm thấy kỳ lương nào trong hệ thống!');
        return;
      }
      var options = periods.map(function (period) {
        return '<option value="' + escapeHtml(period.PeriodID) + '">' + escapeHtml(period.PeriodID) + ' (' + escapeHtml(period.PeriodName || period.PeriodID) + ')</option>';
      }).join('');
      ConfirmModal.show({
        title: 'Tạo Bảng Lương Tháng',
        message: '<div style="text-align:left;margin-top:10px;"><label style="font-weight:600;font-size:13px;display:block;margin-bottom:8px;">Chọn kỳ lương cần tính toán:</label><select id="payroll-process-period" class="ui-input" style="width:100%;height:38px;">' + options + '</select></div>',
        confirmText: 'Tính Lương',
        confirmClass: 'btn-primary',
        onConfirm: function () {
          var input = document.getElementById('payroll-process-period');
          var periodId = input && input.value;
          if (!periodId) return;
          if (global.LoadingSpinner) LoadingSpinner.show(true, 'Đang tính toán bảng lương kỳ ' + periodId + '...');
          ApiClient.post(gateway(), { List: 'WA_PayRoll_Process_Stp', Func: 'View', JsonData: JSON.stringify({ PeriodID: periodId }) }).then(function (result) {
            if (global.LoadingSpinner) LoadingSpinner.hide();
            var data = Array.isArray(result) ? result[0] : (result.records && result.records[0] || result);
            var code = data && (data.code !== undefined ? data.code : data.Code);
            var message = data && (data.msg || data.Msg || data.message) || 'Thành công';
            if (code == 0) {
              if (global.Alert) Alert.success('Thành công', message);
              global.currentFilters = Object.assign({}, global.currentFilters || {}, { PeriodID: periodId });
              if (typeof context.onReload === 'function') context.onReload();
            } else if (global.Alert) Alert.error('Lỗi tính lương', message);
          }).catch(function (error) {
            if (global.LoadingSpinner) LoadingSpinner.hide();
            if (global.Alert) Alert.error('Lỗi kết nối', error.message || 'Không thể kết nối đến máy chủ.');
          });
        }
      });
    }).catch(function () {
      if (loading && global.UIToast) UIToast.hide(loading);
      if (global.Alert) Alert.error('Lỗi', 'Không thể tải danh sách kỳ lương.');
    });
  }

  function register() {
    if (!global.FormActionRegistry) return;
    FormActionRegistry.register(ACTION_NAME, run);
    global.FormActionPlugins = (global.FormActionPlugins || []).filter(function (plugin) { return plugin.id !== 'payroll_plugin'; });
    global.FormActionPlugins.push({
      id: 'payroll_plugin',
      getExtraButtons: function (formName, getSelected, config, onReload) {
        if (!config || config.ProcessAction !== ACTION_NAME) return [];
        return [{ text: 'Tạo bảng lương tháng', icon: 'calculate', type: 'primary', onClick: function () { FormActionRegistry.execute(ACTION_NAME, { config: config, onReload: onReload }); } }];
      }
    });
  }

  global.PayrollActions = { register: register, run: run };
  register();
})(window);
