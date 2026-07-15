/**
 * Bootstraps the application layout & interactions
 */
document.addEventListener('DOMContentLoaded', function () {
  // 0. Global Auth Logic
  window.logoutApp = function () {
    // Gọi API đăng xuất (background)
    if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
      ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).catch(function () { });
    }

    localStorage.removeItem('pmql_user');
    if (typeof ApiClient !== 'undefined' && ApiClient.deleteCookie) {
      ApiClient.deleteCookie('auth_token');
    }

    window.location.href = 'login.html';
  };

  // 0.5 Kiểm tra đăng nhập (Auth Guard)
  var token = typeof ApiClient !== 'undefined' && ApiClient.getCookie ? ApiClient.getCookie('auth_token') : null;
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 0.6 Khởi tạo hệ thống Phân quyền (RBAC)
  window.AppPermissions = {
    _cache: null,

    _init: function () {
      try {
        var navCache = JSON.parse(sessionStorage.getItem('pmql_nav_cache') || 'null');
        var userCache = JSON.parse(localStorage.getItem('pmql_user') || 'null');

        var isAdmin = (userCache && (userCache.UserGroupID === 'Admin' || userCache.userGroupID === 'Admin'));

        this._cache = {
          isAdmin: isAdmin,
          dict: {}
        };

        if (navCache && navCache.rawRecords) {
          navCache.rawRecords.forEach(function (r) {
            if (r.formName) {
              this._cache.dict[r.formName.toLowerCase()] = r;
            }
          }.bind(this));
        }
      } catch (e) {
        console.error('Error init AppPermissions', e);
      }
    },

    hasPermission: function (formName, action) {
      if (!this._cache) this._init();
      if (!this._cache) return false;

      if (this._cache.isAdmin) return true; // Admin bypass

      if (!formName) return true; // Các module ko định danh thì cho phép qua
      var perm = this._cache.dict[formName.toLowerCase()];
      if (!perm) return false; // Không có trong phân quyền thì tịt

      // action có thể là 'IsAdd', 'IsUpdate', 'IsDelete', 'IsRun', v.v.
      return (perm[action] == 1 || perm[action] === true);
    }
  };
  // 1. Khởi tạo trình quản lý phím tắt
  if (typeof KeyboardManager !== 'undefined') {
    KeyboardManager.init();
  }

  // 2. Khởi tạo Router
  // Cấu hình các form có DetailTabs (Master-Detail)

  // Các module HR được nạp từ HRModuleRegistry trước bootstrap.
  if (window.HRModuleRegistry && typeof window.HRModuleRegistry.install === 'function') {
    window.HRModuleRegistry.install();
  }
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

            ApiClient.post('/api/API_Gateway_Router', {
              List: 'SY_Period',
              Func: 'View',
              Limit: 1000
            }).then(function (res) {
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

                    ApiClient.post('/api/API_Gateway_Router', {
                      List: 'WA_PayRoll_Process_Stp',
                      Func: 'View',
                      JsonData: JSON.stringify({ PeriodID: selectedPeriod })
                    }).then(function (result) {
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

            ApiClient.post('/api/API_Gateway_Router', {
              List: 'SY_Period',
              Func: 'View',
              Limit: 1000
            }).then(function (res) {
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
              ApiClient.post('/api/API_Gateway_Router', {
                List: 'API_DanhSachChiNhanh',
                Func: 'View',
                Limit: 1000
              }).then(function (branchRes) {
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

                      ApiClient.post('/api/API_Gateway_Router', {
                        List: 'WA_TimeSheetDay_Process_Stp',
                        Func: 'View',
                        JsonData: JSON.stringify({ PeriodID: selectedPeriod, BranchID: selectedBranch })
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

  if (typeof Router !== 'undefined') {
    var currentUser = localStorage.getItem('pmql_user');
    if (currentUser && typeof ApiClient !== 'undefined') {
      ApiClient.post('/api/API_Gateway_Router', {
        List: 'CF_BranchListFrm',
        FormName: 'CF_BranchListFrm',
        Func: 'View',
        Limit: 1000
      }).then(function (res) {
        var branchList = Array.isArray(res) ? res : (res.data || res.list || res.records || []);
        localStorage.setItem('pmql_sys_branches', JSON.stringify(branchList));
        Router.init();
      }).catch(function () {
        Router.init();
      });
    } else {
      Router.init();
    }
  }

  // 3. Khởi tạo Navbar (chỉ render nếu đã đăng nhập)
  var currentUser = localStorage.getItem('pmql_user');
  if (currentUser && typeof Navbar !== 'undefined') {
    Navbar.render('navbar-container');

    // Nếu mode là vertical, chuyển #app-content vào vertical-main
    if (Navbar.getLayout() === 'vertical') {
      var $vertMain = document.getElementById('vertical-main');
      var $content = document.getElementById('app-content');
      if ($vertMain && $content && !$vertMain.contains($content)) {
        $vertMain.appendChild($content);
      }
    }
  }

  // 4. Khởi tạo cấu hình giao diện
  var savedFont = localStorage.getItem('pmql_font_family');
  if (savedFont) {
    document.documentElement.style.setProperty('--font-family', '"' + savedFont + '", sans-serif');
  }

  var savedTheme = localStorage.getItem('pmql_theme') || 'auto';
  if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Lắng nghe sự thay đổi giao diện từ hệ thống (khi chuyển qua chế độ tiết kiệm pin hoặc Dark Mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var currentTheme = localStorage.getItem('pmql_theme') || 'auto';
    if (currentTheme === 'auto') {
      if (e.matches) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  });

  var savedColor = localStorage.getItem('pmql_color');
  if (savedColor) {
    var COLORS = [
      { id: 'indigo', primary: '#4F46E5', hover: '#4338CA', dark: '#3730A3', light: 'rgba(79, 70, 229, 0.1)' },
      { id: 'emerald', primary: '#10B981', hover: '#059669', dark: '#047857', light: 'rgba(16, 185, 129, 0.1)' },
      { id: 'rose', primary: '#E11D48', hover: '#BE123C', dark: '#9F1239', light: 'rgba(225, 29, 72, 0.1)' },
      { id: 'amber', primary: '#F59E0B', hover: '#D97706', dark: '#B45309', light: 'rgba(245, 158, 11, 0.1)' },
      { id: 'sky', primary: '#0EA5E9', hover: '#0284C7', dark: '#0369A1', light: 'rgba(14, 165, 233, 0.1)' }
    ];
    var colorDef = COLORS.find(function (c) { return c.id === savedColor; });
    if (colorDef) {
      document.documentElement.style.setProperty('--color-primary', colorDef.primary);
      document.documentElement.style.setProperty('--color-primary-hover', colorDef.hover);
      document.documentElement.style.setProperty('--color-primary-dark', colorDef.dark);
      document.documentElement.style.setProperty('--color-primary-light', colorDef.light);
    }
  }

});

// --- CUSTOM FUNCTIONS FOR WA_CaLamViecFrm ---

// Hàm lõi: nhận SapCaID trực tiếp, không cần query DOM
window.SapCaTuDong_ByID = function (sapCaID, callerBtn) {
  if (!sapCaID) {
    if (typeof Alert !== 'undefined') Alert.warning('Chưa lưu', 'Vui lòng Lưu thay đổi trước khi chạy Sắp ca tự động');
    return;
  }

  var originalHtml = callerBtn ? callerBtn.innerHTML : '';
  if (callerBtn) {
    callerBtn.disabled = true;
    callerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
  }

  var payload = {
    SapCaID: sapCaID
  };

  ApiClient.post('/api/HR_CaLamViec_SapCaStp', payload)
    .then(function (res) {
      if (res && res.code === 0) {
        if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã sắp ca tự động thành công');
        // Reload detail grid (Bảng ca chi tiết)
        var refreshBtn = document.querySelector('.btn-refresh-tab');
        if (refreshBtn) {
          refreshBtn.click();
        } else if (typeof window.DynamicFormEngine !== 'undefined' && typeof window.DynamicFormEngine.reloadDetailTabs === 'function') {
          window.DynamicFormEngine.reloadDetailTabs();
        }
      } else {
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', res && res.msg ? res.msg : 'Chạy sắp ca thất bại');
      }
    })
    .catch(function (err) {
      if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi hệ thống khi gọi API sắp ca');
    })
    .finally(function () {
      if (callerBtn) {
        callerBtn.disabled = false;
        callerBtn.innerHTML = originalHtml;
      }
    });
};

// Backward compat: nút "Sắp ca tự động" cũ trong FormFields vẫn hoạt động
window.SapCaTuDong = function () {
  var form = document.querySelector('.df-master-wrapper, .split-master-detail-container');
  if (!form) { if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không tìm thấy form'); return; }
  var sapCaInput = form.querySelector('[name="SapCaID"]');
  var btn = form.querySelector('button[onclick="window.SapCaTuDong()"]');
  window.SapCaTuDong_ByID(sapCaInput ? sapCaInput.value : '', btn);
};
