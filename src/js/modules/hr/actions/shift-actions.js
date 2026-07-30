(function (global) {
  var ACTION_NAME = 'hr.shift.auto';

  function currentUser() {
    if (!global.AppSession) return '';
    return typeof AppSession.getUserName === 'function'
      ? AppSession.getUserName()
      : (AppSession.userName || '');
  }

  function currentBranch() {
    if (!global.AppSession) return '';
    return typeof AppSession.getBranchId === 'function'
      ? AppSession.getBranchId()
      : (AppSession.branchId || '');
  }

  function gateway(moduleConfig) {
    return moduleConfig && moduleConfig.ApiSearch
      || global.AppConfig && AppConfig.apiGateway
      || '/api/API_Gateway_Router';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function responseData(response) {
    if (Array.isArray(response)) return response[0] || {};
    if (response && Array.isArray(response.records) && response.records.length) return response.records[0];
    if (response && Array.isArray(response.list) && response.list.length) return response.list[0];
    return response || {};
  }

  function responseCode(response) {
    var data = responseData(response);
    return data.code !== undefined ? data.code : data.Code;
  }

  function responseMessage(response, fallback) {
    var data = responseData(response);
    return data.msg || data.Msg || data.message || data.Message || fallback;
  }

  function configOf(context) {
    var moduleConfig = context.MODULE_CONFIG || context.moduleConfig || {};
    return Object.assign({
      list: moduleConfig.FormName || 'WA_CaLamViecFrm',
      func: moduleConfig.ShiftProcessFunc || 'HR_CaLamViec_SapCaStp',
      idField: moduleConfig.PrimaryKey || 'SapCaID',
      saveBeforeRun: true
    }, moduleConfig.ShiftProcess || {}, context.actionConfig || {});
  }

  function valueFromForm(context, fieldName) {
    var input = context.body && context.body.querySelector
      ? context.body.querySelector('[name="' + fieldName + '"]')
      : null;
    if (input && input.value !== undefined) return input.value;
    return context.row && context.row[fieldName] !== undefined
      ? context.row[fieldName]
      : '';
  }

  function shiftIdOf(context, config) {
    return context.shiftId
      || context.value
      || valueFromForm(context, config.idField)
      || '';
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button._shiftOriginalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
    } else {
      button.disabled = false;
      if (button._shiftOriginalHtml !== undefined) {
        button.innerHTML = button._shiftOriginalHtml;
        delete button._shiftOriginalHtml;
      }
    }
  }

  function invoke(context, config, shiftId) {
    if (!shiftId) {
      if (global.Alert) Alert.warning('Chưa lưu', 'Vui lòng lưu bảng ca trước khi chạy sắp ca tự động.');
      return Promise.resolve(null);
    }

    var moduleConfig = context.MODULE_CONFIG || context.moduleConfig || {};
    var data = {};
    data[config.idField] = shiftId;
    var payload = {
      List: config.list || moduleConfig.FormName,
      Func: config.func,
      JsonData: JSON.stringify(data),
      UserName: currentUser(),
      User: currentUser(),
      BranchID: currentBranch()
    };
    // API_Gateway_Router hỗ trợ thay thế trực tiếp {SapCaID} trong WA_API.
    payload[config.idField] = shiftId;

    setButtonLoading(context.button, true);
    return ApiClient.post(gateway(moduleConfig), payload).then(function (response) {
      var code = responseCode(response);
      if (code === undefined || code === null || code == 0) {
        if (global.Alert) {
          Alert.success(
            config.successTitle || 'Sắp ca thành công',
            responseMessage(response, config.successMessage || 'Bảng ca chi tiết đã được cập nhật.')
          );
        }
        if (global.DynamicFormEngine && typeof DynamicFormEngine.reloadDetailTabs === 'function') {
          DynamicFormEngine.reloadDetailTabs();
        } else {
          var refresh = document.querySelector('.btn-refresh-tab');
          if (refresh) refresh.click();
        }
      } else if (global.Alert) {
        Alert.error(config.errorTitle || 'Không thể sắp ca', responseMessage(response, 'Procedure trả về lỗi.'));
      }
      return response;
    }).catch(function (error) {
      if (global.Alert) {
        Alert.error(
          config.errorTitle || 'Không thể sắp ca',
          error && error.message || 'Không thể kết nối đến máy chủ.'
        );
      }
      return null;
    }).finally(function () {
      setButtonLoading(context.button, false);
    });
  }

  function saveThenInvoke(context, config) {
    if (!context.btnSave) {
      if (global.Alert) Alert.error('Không thể sắp ca', 'Không tìm thấy nút Lưu của biểu mẫu.');
      return;
    }

    var moduleConfig = context.MODULE_CONFIG || context.moduleConfig || {};
    var expectedForm = moduleConfig.FormName || config.list;
    var timeoutId;
    var saveHandler = function (event) {
      if (!event.detail || event.detail.formName !== expectedForm) return;
      document.removeEventListener('dynamicFormSaved', saveHandler);
      if (timeoutId) clearTimeout(timeoutId);
      if (context.body) context.body._keepOpenAfterSave = false;
      var savedData = event.detail.data || {};
      var shiftId = savedData[config.idField]
        || context.row && context.row[config.idField]
        || '';
      invoke(context, config, shiftId);
    };

    document.addEventListener('dynamicFormSaved', saveHandler);
    if (context.body) context.body._keepOpenAfterSave = true;
    timeoutId = setTimeout(function () {
      document.removeEventListener('dynamicFormSaved', saveHandler);
      if (context.body) context.body._keepOpenAfterSave = false;
    }, 120000);
    context.btnSave.click();
  }

  function confirmRun(context, config) {
    var fromDate = valueFromForm(context, config.fromDateField || 'TuNgay');
    var toDate = valueFromForm(context, config.toDateField || 'DenNgay');
    var message = config.confirmMessage || 'Bạn có chắc chắn muốn chạy sắp ca tự động';
    if (fromDate && toDate) {
      message += ' từ ngày <b>' + escapeHtml(fromDate) + '</b> đến ngày <b>' + escapeHtml(toDate) + '</b>?';
    } else {
      message += '?';
    }

    var needsSave = !context.isViewMode && config.saveBeforeRun !== false;
    if (needsSave) {
      message += '<br><br><span style="color:#b45309;">Dữ liệu master và nhân viên sẽ được lưu trước khi chạy.</span>';
    }
    if (config.leaveMessage) {
      message += '<br><span style="color:var(--color-text-secondary);">' + escapeHtml(config.leaveMessage) + '</span>';
    }

    var proceed = function () {
      if (needsSave) saveThenInvoke(context, config);
      else invoke(context, config, shiftIdOf(context, config));
    };

    if (global.ConfirmModal && typeof ConfirmModal.show === 'function') {
      ConfirmModal.show({
        title: config.confirmTitle || 'Xác nhận sắp ca tự động',
        message: message,
        confirmText: config.confirmText || 'Sắp ca',
        confirmClass: 'btn-primary',
        onConfirm: proceed
      });
    } else if (global.confirm(message.replace(/<[^>]*>?/gm, ''))) {
      proceed();
    }
  }

  function run(context) {
    context = context || {};
    confirmRun(context, configOf(context));
    return Promise.resolve();
  }

  function runFromLegacyButton() {
    var form = document.querySelector('.df-master-wrapper, .split-master-detail-container, .full-page-detail');
    if (!form) {
      if (global.Alert) Alert.error('Lỗi', 'Không tìm thấy form.');
      return Promise.resolve();
    }
    var input = form.querySelector('[name="SapCaID"]');
    var button = form.querySelector('button[onclick="window.SapCaTuDong()"]');
    return FormActionRegistry.execute(ACTION_NAME, {
      shiftId: input ? input.value : '',
      button: button,
      isViewMode: true,
      moduleConfig: {
        FormName: 'WA_CaLamViecFrm',
        PrimaryKey: 'SapCaID'
      }
    });
  }

  function register() {
    if (!global.FormActionRegistry) return;
    FormActionRegistry.register(ACTION_NAME, run);
  }

  global.ShiftActions = {
    register: register,
    run: run,
    invoke: invoke,
    runFromLegacyButton: runFromLegacyButton
  };
  register();
  global.SapCaTuDong_ByID = function (shiftId, button) {
    return FormActionRegistry.execute(ACTION_NAME, {
      shiftId: shiftId,
      button: button,
      isViewMode: true,
      moduleConfig: {
        FormName: 'WA_CaLamViecFrm',
        PrimaryKey: 'SapCaID'
      }
    });
  };
  global.SapCaTuDong = runFromLegacyButton;
})(window);
