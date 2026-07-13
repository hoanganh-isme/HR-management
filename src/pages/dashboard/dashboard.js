/**
 * DashboardPage — Kiến trúc Đa mẫu (Multi-Template) & Kế thừa
 * Hỗ trợ lấy dữ liệu bất đồng bộ (Async API calls) từ Stored Procedures.
 */
var DashboardPage = (function () {

  var _container = null;
  var _innerRoot = null;
  var _currentTemplate = null;
  var _currentBranch = ''; // State lưu trữ Chi nhánh đang chọn để lọc
  var _accessScope = null;

  function _readCurrentUser() {
    try {
      var raw = window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user');
      return JSON.parse(raw || '{}');
    } catch (e) {
      return {};
    }
  }

  function _getAccessScope() {
    var user = _readCurrentUser();
    var group = (user.UserGroupID || user.userGroupID || user.userGroupId || user.Group || user.GroupID || user.NhomQuyen || '').toString().trim().toLowerCase();
    var isAdmin = group === 'admin';
    var rawBranches = user.BranchID || user.branchID || user.branchId || user.Branches || user.BranchCodes || '';
    var branchIds = [];

    if (Array.isArray(rawBranches)) {
      rawBranches.forEach(function (branch) {
        var id = typeof branch === 'object' ? (branch.BranchID || branch.branchID || branch.Code || branch.id || '') : branch;
        id = (id || '').toString().trim();
        if (id && branchIds.indexOf(id) === -1) branchIds.push(id);
      });
    } else {
      rawBranches.toString().split(',').forEach(function (id) {
        id = id.trim();
        if (id && branchIds.indexOf(id) === -1) branchIds.push(id);
      });
    }

    return { isAdmin: isAdmin, branchIds: branchIds, defaultBranch: isAdmin ? '' : branchIds.join(',') };
  }

  // ── Format helpers ─────────────────────────────────────────────
  function _fmtShort(n) {
    if (typeof n !== 'number') return '--';
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
    if (n >= 1e6) return (n / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
    return n.toLocaleString('vi-VN');
  }

  function _now() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear() +
      ' - ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  // ── Async Data Service (Lấy dữ liệu từ SP hoặc Fallback Mock) ──
  var HRDataService = {
    _getVal: function (obj, key, defaultVal) {
      if (!obj) return defaultVal;
      if (obj[key] !== undefined) return obj[key];
      var lowerKey = key.toLowerCase();
      for (var k in obj) {
        if (k.toLowerCase() === lowerKey) return obj[k];
      }
      return defaultVal;
    },

    _mapArray: function (arr, labelKey, valueKey) {
      var res = { labels: [], values: [] };
      if (!arr || !arr.length) return res;
      arr.forEach(function (item) {
        res.labels.push(HRDataService._getVal(item, labelKey, ''));
        res.values.push(HRDataService._getVal(item, valueKey, 0));
      });
      return res;
    },

    _fetchAPI: function (spName, params, mockFallback) {
      return new Promise(function (resolve) {
        if (typeof ApiClient !== 'undefined') {
          var user = _readCurrentUser();
          var userName = user.UserName || user.Username || user.username || '';
          var requestParams = Object.assign({}, params || {});
          var payload = {
            Func: 'View',
            List: spName,
            FormName: spName,
            UserName: userName,
            User: userName,
            Limit: 1000,
            JsonData: JSON.stringify(requestParams)
          };
          ApiClient.post('/api/API_Gateway_Router', payload)
            .then(function (res) {
              var data = null;
              if (Array.isArray(res)) {
                data = res;
              } else if (res && typeof res === 'object') {
                data = res.data || res.list || res.records || res.Data || res.List || res.Records;
                if (!data && res.totalHeadcount !== undefined) {
                  data = [res];
                }
              }

              if (!data || !Array.isArray(data) || data.length === 0 || (data.length === 1 && Object.keys(data[0]).length === 0)) {
                console.warn('[' + spName + '] API trả về rỗng. Dùng dữ liệu mẫu (Mock).', res);
                return resolve(mockFallback);
              }
              resolve(data);
            })
            .catch(function (err) {
              console.error('[' + spName + '] Lỗi gọi API:', err);
              resolve(mockFallback);
            });
        } else {
          setTimeout(function () { resolve(mockFallback); }, 300);
        }
      });
    },

    getBranches: function () {
      var mock = [{ value: 'COBI', label: 'COBI' }, { value: 'DONGDU', label: 'DONGDU' }];
      return this._fetchAPI('API_HR_Dashboard_GetBranches', { BranchID: _currentBranch }, mock);
    },

    getOverviewToday: function () {
      var mock = { totalHeadcount: 245, present: 230, late: 8, absent: 7, newHires: 12, probationExpiring: 4 };
      return this._fetchAPI('API_HR_Dashboard_OverviewToday', { BranchID: _currentBranch }, [mock]).then(function (data) {
        var raw = Array.isArray(data) ? data[0] : data;
        if (!raw) raw = mock;
        return {
          totalHeadcount: HRDataService._getVal(raw, 'totalHeadcount', 0),
          present: HRDataService._getVal(raw, 'present', 0),
          late: HRDataService._getVal(raw, 'late', 0),
          absent: HRDataService._getVal(raw, 'absent', 0),
          newHires: HRDataService._getVal(raw, 'newHires', 0),
          probationExpiring: HRDataService._getVal(raw, 'probationExpiring', 0)
        };
      });
    },

    getDemographicsData: function () {
      var mock = [
        { groupType: 'Gender', label: 'Nam', value: 120 }, { groupType: 'Gender', label: 'Nữ', value: 125 },
        { groupType: 'Age', label: 'Dưới 25 tuổi', value: 50 }, { groupType: 'Age', label: '25-35 tuổi', value: 100 }, { groupType: 'Age', label: '36-45 tuổi', value: 80 }, { groupType: 'Age', label: 'Trên 45 tuổi', value: 15 },
        { groupType: 'Contract', label: 'Có thời hạn', value: 180 }, { groupType: 'Contract', label: 'Không thời hạn', value: 50 }, { groupType: 'Contract', label: 'Thử việc', value: 15 }
      ];
      return this._fetchAPI('API_HR_Dashboard_Demographics', { BranchID: _currentBranch }, mock).then(function (data) {
        var isMock = (data === mock);
        var rsGender = data.filter(function (x) { return x.groupType === 'Gender'; });
        var rsAge = data.filter(function (x) { return x.groupType === 'Age'; });
        var rsContract = data.filter(function (x) { return x.groupType === 'Contract'; });

        return {
          gender: HRDataService._mapArray(rsGender, 'label', 'value'),
          age: HRDataService._mapArray(rsAge, 'label', 'value'),
          contract: HRDataService._mapArray(rsContract, 'label', 'value')
        };
      });
    },

    getDepartmentHeadcount: function () {
      var mock = [
        { groupType: 'Dept', label: 'Phòng Kinh Doanh', value: 120 }, { groupType: 'Dept', label: 'Phòng Kỹ Thuật', value: 85 },
        { groupType: 'Branch', label: 'COBI', value: 100 }, { groupType: 'Branch', label: 'DONGDU', value: 105 }
      ];
      return this._fetchAPI('API_HR_Dashboard_Department', { BranchID: _currentBranch }, mock).then(function (data) {
        var isMock = (data === mock);
        var rsDept = data.filter(function (x) { return x.groupType === 'Dept'; });
        var rsBranch = data.filter(function (x) { return x.groupType === 'Branch'; });
        return {
          dept: HRDataService._mapArray(rsDept, 'label', 'value'),
          branch: HRDataService._mapArray(rsBranch, 'label', 'value')
        };
      });
    },

    getBirthdays: function () {
      var mock = [
        { empName: 'Trần Văn Demo (Kinh Doanh)', birthdayDate: '15/07', birthDay: 15 },
        { empName: 'Lê Thị Mẫu (Kế Toán)', birthdayDate: '22/07', birthDay: 22 }
      ];
      return this._fetchAPI('API_HR_Dashboard_Birthdays', { BranchID: _currentBranch }, mock).then(function (data) {
        var rows = [];
        data.forEach(function (item) {
          rows.push({
            empName: HRDataService._getVal(item, 'empName', 'Vô danh'),
            birthdayDate: HRDataService._getVal(item, 'birthdayDate', '--/--'),
            birthDay: HRDataService._getVal(item, 'birthDay', 1)
          });
        });
        return rows.length > 0 ? rows : mock;
      });
    },

    getPayrollData: function (period) {
      var mock = {
        totalSalary: 2100e6, prevTotalSalary: 1880e6, pctChange: 11.7,
        bonus: 210e6, prevBonus: 188e6, insurance: 451500000, prevInsurance: 404200000,
        avgSalary: 8571400, sparkline: [40, 50, 45, 60, 55, 70, 65],
        deptLabels: ['Kinh doanh', 'Kế toán', 'Kỹ thuật', 'Hành chính'],
        deptValues: [45, 15, 30, 10]
      };
      return this._fetchAPI('API_HR_Dashboard_Payroll', { PeriodID: period, BranchID: _currentBranch }, null).then(function (data) {
        if (!data || !Array.isArray(data) || data.length === 0) return mock;
        var raw = Array.isArray(data[0]) ? data[0][0] : data[0];
        if (!raw) return mock;

        var main = {
          totalSalary: HRDataService._getVal(raw, 'totalSalary', mock.totalSalary),
          prevTotalSalary: HRDataService._getVal(raw, 'prevTotalSalary', mock.prevTotalSalary),
          bonus: HRDataService._getVal(raw, 'bonus', mock.bonus),
          prevBonus: HRDataService._getVal(raw, 'prevBonus', mock.prevBonus),
          insurance: HRDataService._getVal(raw, 'insurance', mock.insurance),
          prevInsurance: HRDataService._getVal(raw, 'prevInsurance', mock.prevInsurance)
        };

        main.avgSalary = main.totalSalary / 245;
        main.pctChange = main.prevTotalSalary ? ((main.totalSalary - main.prevTotalSalary) / main.prevTotalSalary * 100) : 0;
        main.sparkline = mock.sparkline;

        var deptData = Array.isArray(data[1]) ? data[1] : (data.length > 1 ? data : []);
        if (deptData.length > 0) {
          var mappedDept = HRDataService._mapArray(deptData, 'label', 'value');
          main.deptLabels = mappedDept.labels;
          main.deptValues = mappedDept.values;
        } else {
          main.deptLabels = mock.deptLabels;
          main.deptValues = mock.deptValues;
        }
        return main;
      });
    },

    getContractsExpiring: function () {
      var mock = [
        { empName: 'Nguyễn Văn A (Kỹ thuật)', expireDate: '12/08/2026', statusLevel: 'danger' },
        { empName: 'Trần Thị B (Kế toán)', expireDate: '15/08/2026', statusLevel: 'warning' }
      ];
      return this._fetchAPI('API_HR_Dashboard_ContractsExpiring', { Days: 30, BranchID: _currentBranch }, mock).then(function (data) {
        if (!data || data === mock || !Array.isArray(data)) return mock;
        var rows = [];
        data.forEach(function (item) {
          rows.push({
            empName: HRDataService._getVal(item, 'empName', 'Vô danh'),
            expireDate: HRDataService._getVal(item, 'expireDate', '--/--/----'),
            statusLevel: HRDataService._getVal(item, 'statusLevel', 'info')
          });
        });
        return rows.length > 0 ? rows : mock;
      });
    }
  };

  // ── Biểu đồ phụ trợ (Bar / Pie) ─────────────────────────────────
  function _drawBar(canvas, labels, values, horizontal) {
    if (!canvas) return;
    if (typeof Chart !== 'undefined') {
      if (canvas._chartInstance) canvas._chartInstance.destroy();
      var isDark = document.body.classList.contains('dark-theme');
      var color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#4F46E5';
      var chartCfg = {
        type: 'bar',
        data: { labels: labels, datasets: [{ data: values, backgroundColor: color + 'CC', borderRadius: 4 }] },
        options: {
          indexAxis: horizontal ? 'y' : 'x',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { autoSkip: false } },
            y: { grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' }, ticks: { autoSkip: false } }
          }
        }
      };
      if (horizontal) {
        chartCfg.options.scales.x.grid.color = chartCfg.options.scales.y.grid.color;
        chartCfg.options.scales.y.grid.display = false;
      }
      canvas._chartInstance = new Chart(canvas, chartCfg);
    }
  }

  function _drawPie(canvas, labels, values) {
    if (!canvas) return;
    if (typeof Chart !== 'undefined') {
      if (canvas._chartInstance) canvas._chartInstance.destroy();
      var isDark = document.body.classList.contains('dark-theme');
      var isMobile = window.innerWidth <= 600;
      var colors = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#F43F5E', '#8B5CF6'];
      canvas._chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: isDark ? 2 : 1, borderColor: isDark ? '#1e293b' : '#ffffff' }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: isMobile ? 8 : 10,
                boxHeight: isMobile ? 8 : 10,
                padding: isMobile ? 6 : 10,
                font: { size: isMobile ? 9 : 11 },
                // Wrap legend nếu text quá dài
                usePointStyle: true
              }
            }
          },
          layout: {
            padding: { left: 4, right: 4, top: 0, bottom: 0 }
          }
        }
      });
    }
  }

  // ── Base Dashboard Template ───────────────────
  function BaseDashboardTemplate(root) {
    this.root = root;
    this.refs = {};
  }
  BaseDashboardTemplate.prototype.clear = function () { this.root.innerHTML = ''; };
  BaseDashboardTemplate.prototype.render = function () { };
  BaseDashboardTemplate.prototype.buildWarningBanner = function (msg) {
    var banner = document.createElement('div');
    banner.className = 'db-warning-banner';
    banner.innerHTML = '<span class="material-symbols-outlined db-warning-icon">notification_important</span><div class="db-warning-text">' + msg + '</div>';
    this.root.appendChild(banner);
  };
  BaseDashboardTemplate.prototype.renderCompareBadges = function (grid, configs) {
    configs.forEach(function (cfg) {
      var el = grid.querySelector(cfg.selector);
      if (!el) return;
      el.innerHTML = '';
      el.appendChild(CompareBadge.create(cfg.pct, { size: 'sm', reverse: cfg.reverse }));
      el.insertAdjacentHTML('beforeend', '<span class="db-compare-text" style="font-size:11px;color:var(--color-text-secondary);margin-left:4px;">so với kỳ trước</span>');
    });
  };

  // ── Mẫu 1: Tổng quan Nhân sự (HR Overview) ───────────────────────
  function HROverviewTemplate(root) {
    BaseDashboardTemplate.call(this, root);
  }
  HROverviewTemplate.prototype = Object.create(BaseDashboardTemplate.prototype);
  HROverviewTemplate.prototype.constructor = HROverviewTemplate;

  HROverviewTemplate.prototype.render = function () {
    this.clear();
    this.buildWarningBanner('Đang tải dữ liệu từ API...');

    var self = this;
    HRDataService.getOverviewToday().then(function (overviewData) {
      self.clear();
      if (overviewData.probationExpiring > 0) {
        self.buildWarningBanner('Có <span class="text-warning font-semibold">' + overviewData.probationExpiring + ' hợp đồng</span> cần tái ký trong 7 ngày tới.');
      }
      self.buildTodaySection(overviewData);
      self.buildDemographicsSection();
      self.buildDepartmentSection();
      self.buildEventsSection();
    });
  };

  HROverviewTemplate.prototype.buildTodaySection = function (d) {
    var sp = SectionPanel.create({
      icon: 'groups', title: 'TÌNH HÌNH NHÂN SỰ HÔM NAY', trailing: '(' + _now() + ')',
      actions: [{ type: 'refresh', onClick: function () { DashboardPage.render(_container); } }]
    });

    var grid = document.createElement('div');
    grid.className = 'db-today-grid';

    grid.appendChild(MetricCard.create({ icon: 'badge', iconColor: '#4F46E5', iconBg: 'rgba(79,70,229,0.08)', label: 'Tổng nhân sự', value: d.totalHeadcount, size: 'large' }));
    grid.appendChild(MetricCard.create({ icon: 'how_to_reg', iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.08)', label: 'Đi làm', value: d.present, size: 'large' }));
    grid.appendChild(MetricCard.create({ icon: 'schedule', iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.08)', label: 'Đi trễ', value: d.late, subValue: 'Cần chú ý' }));
    grid.appendChild(MetricCard.create({ icon: 'person_off', iconColor: '#F43F5E', iconBg: 'rgba(244,63,94,0.08)', label: 'Vắng mặt', value: d.absent }));
    grid.appendChild(MetricCard.create({ icon: 'person_add', iconColor: '#0EA5E9', iconBg: 'rgba(14,165,233,0.08)', label: 'Tuyển mới trong tháng', value: d.newHires }));

    sp.body.appendChild(grid);
    this.root.appendChild(sp.panel);
  };

  HROverviewTemplate.prototype.buildDemographicsSection = function () {
    var self = this;
    var sp = SectionPanel.create({ icon: 'pie_chart', title: 'CƠ CẤU NHÂN SỰ' });
    // Dùng CSS class — không hard code inline style
    var grid = document.createElement('div');
    grid.className = 'db-demographics-grid';

    // ── Giới tính
    var genderCol = document.createElement('div');
    genderCol.className = 'hr-widget-card';
    genderCol.innerHTML = '<h4 class="db-chart-title">Theo Giới tính</h4>';
    var genderWrap = document.createElement('div');
    genderWrap.className = 'db-chart-wrap';
    this.refs.genderCanvas = document.createElement('canvas');
    genderWrap.appendChild(this.refs.genderCanvas);
    genderCol.appendChild(genderWrap);

    // ── Độ tuổi
    var ageCol = document.createElement('div');
    ageCol.className = 'hr-widget-card';
    ageCol.innerHTML = '<h4 class="db-chart-title">Theo Độ tuổi</h4>';
    var ageWrap = document.createElement('div');
    ageWrap.className = 'db-chart-wrap';
    this.refs.ageCanvas = document.createElement('canvas');
    ageWrap.appendChild(this.refs.ageCanvas);
    ageCol.appendChild(ageWrap);

    // ── Loại Hợp Đồng
    var typeCol = document.createElement('div');
    typeCol.className = 'hr-widget-card';
    typeCol.innerHTML = '<h4 class="db-chart-title">Theo Loại Hợp Đồng</h4>';
    var typeWrap = document.createElement('div');
    typeWrap.className = 'db-chart-wrap';
    this.refs.typeCanvas = document.createElement('canvas');
    typeWrap.appendChild(this.refs.typeCanvas);
    typeCol.appendChild(typeWrap);

    grid.appendChild(genderCol);
    grid.appendChild(ageCol);
    grid.appendChild(typeCol);
    sp.body.appendChild(grid);
    this.root.appendChild(sp.panel);

    HRDataService.getDemographicsData().then(function (d) {
      _drawPie(self.refs.genderCanvas, d.gender.labels, d.gender.values);
      _drawPie(self.refs.ageCanvas, d.age.labels, d.age.values);
      _drawPie(self.refs.typeCanvas, d.contract.labels, d.contract.values);
    });
  };

  HROverviewTemplate.prototype.buildDepartmentSection = function () {
    var self = this;
    var sp = SectionPanel.create({ icon: 'corporate_fare', title: 'PHÂN BỔ THEO PHÒNG BAN & CHI NHÁNH' });

    // Dùng CSS class — không hard code inline style
    var grid = document.createElement('div');
    grid.className = 'db-department-grid';

    // ── Theo Phòng Ban
    var deptCol = document.createElement('div');
    deptCol.className = 'hr-widget-card';
    deptCol.innerHTML = '<h4 class="db-chart-title">Theo Phòng Ban</h4>';
    var deptWrap = document.createElement('div');
    deptWrap.className = 'db-chart-wrap--tall';
    this.refs.deptCanvas = document.createElement('canvas');
    deptWrap.appendChild(this.refs.deptCanvas);
    deptCol.appendChild(deptWrap);

    // ── Theo Chi Nhánh
    var branchCol = document.createElement('div');
    branchCol.className = 'hr-widget-card';
    branchCol.innerHTML = '<h4 class="db-chart-title">Theo Chi Nhánh</h4>';
    var branchWrap = document.createElement('div');
    branchWrap.className = 'db-chart-wrap--tall';
    this.refs.branchCanvas = document.createElement('canvas');
    branchWrap.appendChild(this.refs.branchCanvas);
    branchCol.appendChild(branchWrap);

    grid.appendChild(deptCol);
    grid.appendChild(branchCol);

    sp.body.appendChild(grid);
    this.root.appendChild(sp.panel);

    HRDataService.getDepartmentHeadcount().then(function (d) {
      _drawBar(self.refs.deptCanvas, d.dept.labels, d.dept.values, true);
      _drawBar(self.refs.branchCanvas, d.branch.labels, d.branch.values, true);
    });
  };

  HROverviewTemplate.prototype.buildEventsSection = function () {
    var self = this;
    var bottom = document.createElement('div');
    bottom.className = 'db-bottom-grid';

    var bdaySP = SectionPanel.create({ icon: 'cake', title: 'SINH NHẬT TRONG THÁNG' });
    this.refs.bdayTableContainer = document.createElement('div');
    this.refs.bdayTableContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">Đang tải dữ liệu...</div>';
    bdaySP.body.appendChild(this.refs.bdayTableContainer);
    bottom.appendChild(bdaySP.panel);

    var contractSP = SectionPanel.create({ icon: 'contact_page', title: 'HỢP ĐỒNG SẮP HẾT HẠN' });
    this.refs.contractTableContainer = document.createElement('div');
    this.refs.contractTableContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#888;">Đang tải dữ liệu...</div>';
    contractSP.body.appendChild(this.refs.contractTableContainer);
    bottom.appendChild(contractSP.panel);

    this.root.appendChild(bottom);

    HRDataService.getBirthdays().then(function (rows) {
      self.refs.bdayTableContainer.innerHTML = '';
      var tableData = [{ label: 'Nhân sự', value: 'Ngày sinh', isHeader: true }];
      rows.forEach(function (r) {
        tableData.push({ label: r.empName, value: r.birthdayDate, dot: '#F43F5E' });
      });
      self.refs.bdayTableContainer.appendChild(KVTable.create({ rows: tableData }));
    });

    HRDataService.getContractsExpiring().then(function (rows) {
      self.refs.contractTableContainer.innerHTML = '';
      var tableData = [{ label: 'Nhân sự', value: 'Ngày hết hạn', isHeader: true }];
      rows.forEach(function (r) {
        var dotColor = r.statusLevel === 'danger' ? '#F43F5E' : (r.statusLevel === 'warning' ? '#F59E0B' : '#0EA5E9');
        tableData.push({ label: r.empName, value: r.expireDate, color: r.statusLevel, dot: dotColor });
      });
      self.refs.contractTableContainer.appendChild(KVTable.create({ rows: tableData }));
    });
  };

  // ── Mẫu 2: Tiền Lương (Payroll) ──────────────────────────────────
  function PayrollTemplate(root) {
    BaseDashboardTemplate.call(this, root);
    this.period = { payroll: 'month' };
  }
  PayrollTemplate.prototype = Object.create(BaseDashboardTemplate.prototype);
  PayrollTemplate.prototype.constructor = PayrollTemplate;

  PayrollTemplate.prototype.render = function () {
    this.clear();
    this.buildPayrollSection();
  };

  PayrollTemplate.prototype.buildPayrollSection = function () {
    var self = this;
    var sp = SectionPanel.create({
      icon: 'account_balance_wallet', title: 'TỔNG QUAN QUỸ LƯƠNG & PHÚC LỢI',
      actions: [{ type: 'select', id: 'period-payroll', options: [{ value: 'week', label: 'Kỳ 1' }, { value: 'month', label: 'Tháng này' }], defaultValue: 'month', onChange: function (v) { self.period.payroll = v; self.updatePayroll(); } }]
    });

    var grid = document.createElement('div'); grid.className = 'db-revenue-grid';
    var left = document.createElement('div'); left.className = 'db-revenue-main';
    left.style.cssText = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: nowrap; gap: 8px;';

    var infoCol = document.createElement('div'); infoCol.style.cssText = 'display: flex; flex-direction: column; gap: 4px; flex: 1 1 50%; min-width: 110px;';
    infoCol.innerHTML = '<div class="db-revenue-label">Tổng quỹ lương</div>';
    var val = document.createElement('div'); val.className = 'db-revenue-value'; val.dataset.rv = 'totalSalary'; val.textContent = '...'; infoCol.appendChild(val);

    var cmpRow = document.createElement('div'); cmpRow.className = 'db-revenue-compare'; cmpRow.dataset.rvCmp = 'totalSalary'; infoCol.appendChild(cmpRow);

    this.refs.sparkCanvas = SparklineChart.create({ data: [], width: 260, height: 65 });
    this.refs.sparkCanvas.style.cssText = 'margin-top:10px; width:100%; max-width:260px; height:auto;'; infoCol.appendChild(this.refs.sparkCanvas); left.appendChild(infoCol);

    var pieCol = document.createElement('div'); pieCol.style.cssText = 'flex: 1 1 50%; max-width: 140px; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto;';
    var pieWrap = document.createElement('div'); pieWrap.style.cssText = 'width: 100%; aspect-ratio: 1/1; max-width: 130px; position: relative;';
    this.refs.pieCanvas = document.createElement('canvas'); pieWrap.appendChild(this.refs.pieCanvas); pieCol.appendChild(pieWrap);
    pieCol.insertAdjacentHTML('beforeend', '<div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 10px; font-weight: 500;">Phân bổ quỹ lương</div>'); left.appendChild(pieCol);

    var mid = document.createElement('div'); mid.className = 'db-revenue-stat-col';
    mid.innerHTML = '<div class="db-rev-stat-item"><div class="db-rev-stat-label">Bảo hiểm (BHXH, BHYT)</div><div class="db-rev-stat-value" data-rv="insurance">...</div><div data-rv-cmp="insurance"></div></div><div class="db-rev-stat-divider"></div><div class="db-rev-stat-item"><div class="db-rev-stat-label">Khen thưởng / Phúc lợi</div><div class="db-rev-stat-value" data-rv="bonus">...</div><div data-rv-cmp="bonus"></div></div>';

    var right = document.createElement('div'); right.className = 'db-revenue-stat-col';
    right.innerHTML = '<div class="db-rev-stat-item"><div class="db-rev-stat-label">Trung bình Lương/NV</div><div class="db-rev-stat-value success" data-rv="avgSalary">...</div></div><div class="db-rev-stat-divider"></div><div class="db-rev-stat-item"><div class="db-rev-stat-label">Độ hài lòng (eNPS)</div><div class="db-rev-stat-value success">78%</div></div>';

    grid.appendChild(left); grid.appendChild(mid); grid.appendChild(right);
    sp.body.appendChild(grid); this.refs.payrollGrid = grid; this.root.appendChild(sp.panel);

    this.updatePayroll();
  };

  PayrollTemplate.prototype.updatePayroll = function () {
    var self = this;
    HRDataService.getPayrollData(this.period.payroll).then(function (d) {
      var grid = self.refs.payrollGrid;
      if (!grid) return;
      grid.querySelector('[data-rv="totalSalary"]').textContent = _fmtShort(d.totalSalary);
      grid.querySelector('[data-rv="insurance"]').textContent = _fmtShort(d.insurance);
      grid.querySelector('[data-rv="bonus"]').textContent = _fmtShort(d.bonus);
      grid.querySelector('[data-rv="avgSalary"]').textContent = _fmtShort(d.avgSalary);

      self.renderCompareBadges(grid, [
        { selector: '[data-rv-cmp="totalSalary"]', pct: d.pctChange, reverse: true },
        { selector: '[data-rv-cmp="insurance"]', pct: (d.insurance - d.prevInsurance) / d.prevInsurance * 100, reverse: true },
        { selector: '[data-rv-cmp="bonus"]', pct: (d.bonus - d.prevBonus) / d.prevBonus * 100, reverse: false }
      ]);
      SparklineChart.redraw(self.refs.sparkCanvas, d.sparkline);
      _drawPie(self.refs.pieCanvas, d.deptLabels, d.deptValues);
    });
  };

  // ── Mẫu 3: Tuyển dụng (Recruitment) ──────────────────────────────
  function RecruitmentTemplate(root) { BaseDashboardTemplate.call(this, root); }
  RecruitmentTemplate.prototype = Object.create(BaseDashboardTemplate.prototype);
  RecruitmentTemplate.prototype.constructor = RecruitmentTemplate;

  RecruitmentTemplate.prototype.render = function () {
    this.clear();
    var placeholder = document.createElement('div');
    placeholder.style.cssText = 'padding: 40px; text-align: center; color: var(--color-text-secondary); opacity: 0.7;';
    placeholder.innerHTML = '<span class="material-symbols-outlined" style="font-size:48px;">construction</span><p>Biểu đồ Phễu tuyển dụng & Phân tích kênh ứng viên sẽ nằm ở đây</p>';
    this.root.appendChild(placeholder);
  };

  // ── Template Switcher & Global Filters UI ────────────────────────
  function _buildHeaderControls(container) {
    var headerRow = document.createElement('div');
    // Dùng CSS class — không hard code inline style
    headerRow.className = 'db-header-controls';

    // Switcher Tabs
    var switcher = document.createElement('div');
    switcher.className = 'db-tab-switcher';

    var templates = [
      { id: 'overview', name: 'Tổng quan', icon: 'dashboard', classRef: HROverviewTemplate },
      { id: 'payroll', name: 'Tiền lương', icon: 'payments', classRef: PayrollTemplate },
      { id: 'recruitment', name: 'Tuyển dụng', icon: 'group_add', classRef: RecruitmentTemplate }
    ];

    templates.forEach(function (tpl) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (tpl.id === 'overview' ? 'btn-primary' : 'btn-outline');
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; margin-right:6px; vertical-align:middle;">' + tpl.icon + '</span>' + tpl.name;

      btn.onclick = function () {
        Array.from(switcher.children).forEach(function (c) { c.classList.remove('btn-primary'); c.classList.add('btn-outline'); });
        btn.classList.remove('btn-outline'); btn.classList.add('btn-primary');
        _currentTemplate = new tpl.classRef(_innerRoot);
        _currentTemplate.render();
      };
      switcher.appendChild(btn);
    });
    headerRow.appendChild(switcher);

    // Filter Branch Dropdown
    var filterWrap = document.createElement('div');
    filterWrap.className = 'db-filter-wrap';
    var filterLabel = document.createElement('span');
    filterLabel.className = 'db-filter-label';
    filterLabel.textContent = 'Lọc chi nhánh:';
    filterWrap.appendChild(filterLabel);

    var branchSelect = document.createElement('select');
    branchSelect.className = 'form-control db-filter-select';
    var scope = _accessScope || _getAccessScope();
    if (scope.isAdmin) {
      branchSelect.innerHTML = '<option value="">Tất cả Chi nhánh</option>';
    } else {
      branchSelect.innerHTML = '';
      if (scope.branchIds.length > 1) {
        branchSelect.add(new Option('Tất cả chi nhánh được phân quyền', scope.branchIds.join(',')));
      }
      scope.branchIds.forEach(function (id) { branchSelect.add(new Option(id, id)); });
      branchSelect.value = _currentBranch;
      if (scope.branchIds.length === 1) branchSelect.disabled = true;
    }

    branchSelect.onchange = function (e) {
      _currentBranch = e.target.value;
      if (_currentTemplate) _currentTemplate.render();
    };
    filterWrap.appendChild(branchSelect);
    headerRow.appendChild(filterWrap);

    container.insertBefore(headerRow, _innerRoot);

    // Populate branches
    HRDataService.getBranches().then(function (data) {
      if (Array.isArray(data)) {
        data.forEach(function (b) {
          var opt = document.createElement('option');
          opt.value = HRDataService._getVal(b, 'value', '');
          opt.textContent = HRDataService._getVal(b, 'label', '');
          var isAllowed = scope.isAdmin || scope.branchIds.some(function (id) {
            return id.toLowerCase() === opt.value.toString().toLowerCase();
          });
          var existing = Array.from(branchSelect.options).find(function (item) {
            return item.value.toLowerCase() === opt.value.toString().toLowerCase();
          });
          if (existing) existing.textContent = opt.textContent;
          else if (opt.value && isAllowed) branchSelect.appendChild(opt);
        });
        branchSelect.value = _currentBranch;
      }
    });
  }

  // ── Main Render function for Router ────────────────────────────
  function render(container) {
    _container = container;
    _accessScope = _getAccessScope();
    _currentBranch = _accessScope.defaultBranch;
    Router.fetchTemplate('src/pages/dashboard/dashboard.html')
      .then(function (html) {
        _container.innerHTML = html;
        _innerRoot = _container.querySelector('#dashboard-root');
        if (!_innerRoot) { _innerRoot = document.createElement('div'); _container.appendChild(_innerRoot); }

        if (!_accessScope.isAdmin && _accessScope.branchIds.length === 0) {
          _innerRoot.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">location_off</span><h3>Chưa được gán chi nhánh</h3><p>Tài khoản của bạn chưa có quyền xem dữ liệu dashboard. Vui lòng liên hệ quản trị viên.</p></div>';
          return;
        }

        _buildHeaderControls(_container);

        _currentTemplate = new HROverviewTemplate(_innerRoot);
        _currentTemplate.render();
      })
      .catch(function () { _container.innerHTML = '<p style="color:red">Lỗi tải dashboard</p>'; });
  }

  return { render: render };
})();
