(function (global) {
  var PROCESS_ACTION = 'hr.timesheet.process';
  var UPDATE_STATUS_ACTION = 'hr.timesheet.update_status';

  function gateway() { return AppConfig.apiGateway; }
  function rowsOf(response) { return response ? (response.list || response.records || (Array.isArray(response) ? response : [])) : []; }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]; }); }

  // 1. Chức năng Tạo bảng chấm công hàng ngày (HR_TimeSheetDay_Process_Stp)
  function runProcessDay(context) {
    var loading = global.UIToast ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;
    return ApiClient.post(gateway(), { List: 'SY_Period', Func: 'View', Limit: 1000 }).then(function (periodResponse) {
      var periods = rowsOf(periodResponse).sort(function (a, b) { return String(b.PeriodID).localeCompare(String(a.PeriodID)); });
      if (!periods.length) {
        if (loading && global.UIToast) UIToast.hide(loading);
        if (global.Alert) Alert.warning('Cảnh báo', 'Không tìm thấy kỳ chấm công nào trong hệ thống!');
        return;
      }

      var userBranchId = global.AppSession ? global.AppSession.getBranchId() : '';
      var cachedBranches = global.AppSession ? global.AppSession.getBranches() : [];

      var fetchBranches = (cachedBranches && cachedBranches.length > 0)
        ? Promise.resolve(cachedBranches)
        : (function () {
            var branchPayload = global.AppSession && typeof global.AppSession.withActorContext === 'function'
              ? global.AppSession.withActorContext({ List: 'CF_BranchListFrm', Func: 'View', Limit: 1000 })
              : { List: 'CF_BranchListFrm', Func: 'View', Limit: 1000 };
            return ApiClient.post(gateway(), branchPayload).then(rowsOf);
          })();

      return fetchBranches.then(function (branchRows) {
        if (loading && global.UIToast) UIToast.hide(loading);

        var branches = branchRows || [];
        var activeFilters = global.currentFilters || {};
        var selectedPeriod = activeFilters.PeriodID || (periods[0] && periods[0].PeriodID);
        var selectedBranch = activeFilters.BranchID || userBranchId || (branches.length === 1 ? (branches[0].BranchID || branches[0].branchID) : '');

        var periodOptions = periods.map(function (period) { 
          var isSelected = String(period.PeriodID) === String(selectedPeriod) ? ' selected' : '';
          return '<option value="' + escapeHtml(period.PeriodID) + '"' + isSelected + '>' + escapeHtml(period.PeriodID) + ' (' + escapeHtml(period.PeriodName || period.PeriodID) + ')</option>'; 
        }).join('');

        var branchOptions = '<option value="">-- Tất cả Chi nhánh --</option>' + branches.map(function (branch) { 
          var bId = branch.BranchID || branch.branchID || branch.Branch || '';
          var bName = branch.BranchName || branch.branchName || bId;
          var isSelected = String(bId) === String(selectedBranch) ? ' selected' : '';
          return '<option value="' + escapeHtml(bId) + '"' + isSelected + '>' + escapeHtml(bName) + '</option>'; 
        }).join('');

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
            if (global.LoadingSpinner) LoadingSpinner.show('Đang tạo bảng chấm công kỳ ' + periodId + '...');
            
            var processPayload = global.AppSession && typeof global.AppSession.withActorContext === 'function'
              ? global.AppSession.withActorContext({ List: 'HR_TimeSheetDay_Process_Stp', Func: 'View', JsonData: JSON.stringify({ Period: periodId, PeriodID: periodId, BranchID: branchId }) })
              : { List: 'HR_TimeSheetDay_Process_Stp', Func: 'View', JsonData: JSON.stringify({ Period: periodId, PeriodID: periodId, BranchID: branchId }) };

            ApiClient.post(gateway(), processPayload).then(function (result) {
              if (global.LoadingSpinner) LoadingSpinner.hide();
              var data = Array.isArray(result) ? result[0] : (result.records && result.records[0] || result);
              var code = data && (data.code !== undefined ? data.code : (data.Code !== undefined ? data.Code : 0));
              var message = data && (data.msg || data.Msg || data.message) || ('Tạo bảng chấm công thành công cho kỳ ' + periodId + '!');
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

  // 2. Chức năng Xử lý chấm công (HR_TimeSheet_UpdateDailyStatus_Stp)
  function runUpdateDailyStatus(context) {
    var loading = global.UIToast ? UIToast.show('Đang tải danh sách kỳ...', 'info') : null;
    return ApiClient.post(gateway(), { List: 'SY_Period', Func: 'View', Limit: 1000 }).then(function (periodResponse) {
      var periods = rowsOf(periodResponse).sort(function (a, b) { return String(b.PeriodID).localeCompare(String(a.PeriodID)); });
      if (loading && global.UIToast) UIToast.hide(loading);

      if (!periods.length) {
        if (global.Alert) Alert.warning('Cảnh báo', 'Không tìm thấy kỳ chấm công nào trong hệ thống!');
        return;
      }

      var activeFilters = global.currentFilters || {};
      var selectedPeriod = activeFilters.PeriodID || (periods[0] && periods[0].PeriodID);

      var periodOptions = periods.map(function (period) {
        var isSelected = String(period.PeriodID) === String(selectedPeriod) ? ' selected' : '';
        return '<option value="' + escapeHtml(period.PeriodID) + '"' + isSelected + '>' + escapeHtml(period.PeriodID) + ' (' + escapeHtml(period.PeriodName || period.PeriodID) + ')</option>';
      }).join('');

      ConfirmModal.show({
        title: 'Xử lý Chấm Công Tổng Hợp',
        message: '<div style="text-align:left;margin-top:10px;"><label style="font-weight:600;display:block;margin-bottom:8px;">Chọn kỳ chấm công cần xử lý:</label><select id="timesheet-updatestatus-period" class="ui-input" style="width:100%;height:38px;">' + periodOptions + '</select></div>',
        confirmText: 'Xử lý',
        confirmClass: 'btn-warning',
        onConfirm: function () {
          var periodSelect = document.getElementById('timesheet-updatestatus-period');
          var periodId = periodSelect && periodSelect.value;
          if (!periodId) return;

          if (global.LoadingSpinner) LoadingSpinner.show('Đang xử lý chấm công kỳ ' + periodId + '...');

          var payload = global.AppSession && typeof global.AppSession.withActorContext === 'function'
            ? global.AppSession.withActorContext({
                List: 'HR_TimeSheet_UpdateDailyStatus_Stp',
                Func: 'View',
                Period: periodId,
                PeriodID: periodId,
                JsonData: JSON.stringify({ Period: periodId, PeriodID: periodId })
              })
            : {
                List: 'HR_TimeSheet_UpdateDailyStatus_Stp',
                Func: 'View',
                Period: periodId,
                PeriodID: periodId,
                JsonData: JSON.stringify({ Period: periodId, PeriodID: periodId })
              };

          ApiClient.post(gateway(), payload).then(function (result) {
            if (global.LoadingSpinner) LoadingSpinner.hide();
            var data = Array.isArray(result) ? result[0] : (result.records && result.records[0] || result);
            var code = data && (data.code !== undefined ? data.code : (data.Code !== undefined ? data.Code : 0));
            var message = data && (data.msg || data.Msg || data.message) || ('Xử lý chấm công thành công cho kỳ ' + periodId + '!');

            if (code == 0) {
              if (global.Alert) Alert.success('Thành công', message);
              global.currentFilters = Object.assign({}, global.currentFilters || {}, { PeriodID: periodId });
              if (typeof context.onReload === 'function') context.onReload();
            } else if (global.Alert) Alert.error('Lỗi xử lý chấm công', message);
          }).catch(function (error) {
            if (global.LoadingSpinner) LoadingSpinner.hide();
            if (global.Alert) Alert.error('Lỗi kết nối', error.message || 'Không thể kết nối đến máy chủ.');
          });
        }
      });
    }).catch(function () {
      if (loading && global.UIToast) UIToast.hide(loading);
      if (global.Alert) Alert.error('Lỗi', 'Không thể tải danh sách kỳ chấm công.');
    });
  }

  function register() {
    if (!global.FormActionRegistry) return;
    FormActionRegistry.register(PROCESS_ACTION, runProcessDay);
    FormActionRegistry.register(UPDATE_STATUS_ACTION, runUpdateDailyStatus);

    global.FormActionPlugins = (global.FormActionPlugins || []).filter(function (plugin) { return plugin.id !== 'timesheet_day_plugin'; });
    global.FormActionPlugins.push({
      id: 'timesheet_day_plugin',
      getExtraButtons: function (formName, getSelected, config, onReload) {
        var fName = String(formName || (config && config.FormName) || '').toLowerCase();
        var buttons = [];

        // Trang Xử lý chấm công hàng ngày (WA_TimeSheetDayFrm) -> Nút "Tạo bảng chấm công"
        if (fName === 'wa_timesheetdayfrm' || (config && config.ProcessAction && !config.UpdateStatusAction)) {
          buttons.push({
            text: 'Tạo bảng chấm công',
            icon: 'today',
            type: 'primary',
            onClick: function () {
              FormActionRegistry.execute(PROCESS_ACTION, { config: config, onReload: onReload });
            }
          });
        }

        // Trang Bảng chấm công tổng hợp (WA_TimeSheetFrm) -> Nút "Xử lý chấm công"
        if (fName === 'wa_timesheetfrm' || (config && config.UpdateStatusAction && !config.ProcessAction)) {
          buttons.push({
            text: 'Xử lý chấm công',
            icon: 'settings',
            type: 'warning',
            onClick: function () {
              FormActionRegistry.execute(UPDATE_STATUS_ACTION, { config: config, onReload: onReload });
            }
          });
        }

        return buttons;
      }
    });
  }

  global.TimesheetActions = { register: register, run: runProcessDay, runUpdateDailyStatus: runUpdateDailyStatus };
  register();
})(window);
