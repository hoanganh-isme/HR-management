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
    var isAdmin = MetadataModuleConfig.isAdminUser(user);
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

  // ── Async Data Service ──
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

    _fetchAPI: function (operationName, params) {
      if (typeof GatewayClient === 'undefined') return Promise.reject(new Error('GatewayClient is unavailable'));
      var user = _readCurrentUser();
      var userName = user.UserName || user.Username || user.username || '';
      return GatewayClient.runModuleOperation(DashboardModuleConfig, operationName, params || {}, {
        limit: 1000,
        payload: { UserName: userName, User: userName }
      }).then(function (response) {
        if (response && response.code !== undefined && Number(response.code) !== 0) {
          throw new Error(response.msg || 'Dashboard API failed');
        }
        if (Array.isArray(response)) return response;
        var data = response && (response.data || response.list || response.records || response.Data || response.List || response.Records);
        if (!data && response && response.totalHeadcount !== undefined) data = [response];
        return Array.isArray(data) ? data : [];
      });
    },

    getBranches: function () {
      return this._fetchAPI('branches', { BranchID: _currentBranch }).then(function (rows) {
        return rows.map(function (row) {
          return {
            value: HRDataService._getVal(row, 'value', HRDataService._getVal(row, 'BranchID', '')),
            label: HRDataService._getVal(row, 'label', HRDataService._getVal(row, 'BranchName', ''))
          };
        });
      });
    },

    getOverviewToday: function () {
      return this._fetchAPI('overview', { BranchID: _currentBranch }).then(function (data) {
        var raw = Array.isArray(data) ? data[0] : data;
        if (!raw) return { empty: true };
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
      return this._fetchAPI('demographics', { BranchID: _currentBranch }).then(function (data) {
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
      return this._fetchAPI('department', { BranchID: _currentBranch }).then(function (data) {
        var rsDept = data.filter(function (x) { return x.groupType === 'Dept'; });
        var rsBranch = data.filter(function (x) { return x.groupType === 'Branch'; });
        return {
          dept: HRDataService._mapArray(rsDept, 'label', 'value'),
          branch: HRDataService._mapArray(rsBranch, 'label', 'value')
        };
      });
    },

    getBirthdays: function () {
      return this._fetchAPI('birthdays', { BranchID: _currentBranch }).then(function (data) {
        var rows = [];
        data.forEach(function (item) {
          rows.push({
            empName: HRDataService._getVal(item, 'empName', 'Vô danh'),
            birthdayDate: HRDataService._getVal(item, 'birthdayDate', '--/--'),
            birthDay: HRDataService._getVal(item, 'birthDay', 1)
          });
        });
        return rows;
      });
    },

    getPayrollData: function (period) {
      return this._fetchAPI('payroll', { PeriodID: period, BranchID: _currentBranch }).then(function (data) {
        if (!data || !Array.isArray(data) || data.length === 0) return { empty: true };
        var raw = Array.isArray(data[0]) ? data[0][0] : data[0];
        if (!raw) return { empty: true };

        var main = {
          totalSalary: Number(HRDataService._getVal(raw, 'totalSalary', 0)) || 0,
          headcount: Number(HRDataService._getVal(raw, 'headcount', 0)) || 0,
          prevTotalSalary: Number(HRDataService._getVal(raw, 'prevTotalSalary', 0)) || 0,
          bonus: Number(HRDataService._getVal(raw, 'bonus', 0)) || 0,
          prevBonus: Number(HRDataService._getVal(raw, 'prevBonus', 0)) || 0,
          insurance: Number(HRDataService._getVal(raw, 'insurance', 0)) || 0,
          prevInsurance: Number(HRDataService._getVal(raw, 'prevInsurance', 0)) || 0
        };

        var avgSalary = HRDataService._getVal(raw, 'avgSalary', null);
        main.avgSalary = avgSalary !== null ? Number(avgSalary) || 0 : (main.headcount > 0 ? main.totalSalary / main.headcount : 0);
        main.pctChange = main.prevTotalSalary ? ((main.totalSalary - main.prevTotalSalary) / main.prevTotalSalary * 100) : 0;
        main.sparkline = HRDataService._getVal(raw, 'sparkline', []);

        var deptData = Array.isArray(data[1]) ? data[1] : (data.length > 1 ? data : []);
        if (deptData.length > 0) {
          var mappedDept = HRDataService._mapArray(deptData, 'label', 'value');
          main.deptLabels = mappedDept.labels;
          main.deptValues = mappedDept.values;
        } else {
          main.deptLabels = [];
          main.deptValues = [];
        }
        return main;
      });
    },

    getContractsExpiring: function () {
      return this._fetchAPI('contractsExpiring', { Days: 30, BranchID: _currentBranch }).then(function (data) {
        if (!data || !Array.isArray(data)) return [];
        var rows = [];
        data.forEach(function (item) {
          rows.push({
            empName: HRDataService._getVal(item, 'empName', 'Vô danh'),
            expireDate: HRDataService._getVal(item, 'expireDate', '--/--/----'),
            statusLevel: HRDataService._getVal(item, 'statusLevel', 'info')
          });
        });
        return rows;
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
  BaseDashboardTemplate.prototype.renderState = function (type, message) {
    var state = document.createElement('div');
    state.className = 'empty-state';
    state.innerHTML = '<span class="material-symbols-outlined">' + (type === 'error' ? 'error' : 'inbox') + '</span><h3>' + message + '</h3>';
    this.root.appendChild(state);
  };
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
      if (overviewData.empty) {
        self.renderState('empty', 'Không có dữ liệu dashboard');
        return;
      }
      if (overviewData.probationExpiring > 0) {
        self.buildWarningBanner('Có <span class="text-warning font-semibold">' + overviewData.probationExpiring + ' hợp đồng</span> cần tái ký trong 7 ngày tới.');
      }
      self.buildTodaySection(overviewData);
      self.buildDemographicsSection();
      self.buildDepartmentSection();
      self.buildEventsSection();
    }).catch(function () {
      self.clear();
      self.renderState('error', 'Không thể tải dữ liệu dashboard');
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
      if (!d.gender.labels.length && !d.age.labels.length && !d.contract.labels.length) {
        grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inbox</span><p>Không có dữ liệu</p></div>';
        return;
      }
      _drawPie(self.refs.genderCanvas, d.gender.labels, d.gender.values);
      _drawPie(self.refs.ageCanvas, d.age.labels, d.age.values);
      _drawPie(self.refs.typeCanvas, d.contract.labels, d.contract.values);
    }).catch(function () {
      grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Không thể tải dữ liệu</p></div>';
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
      if (!d.dept.labels.length && !d.branch.labels.length) {
        grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inbox</span><p>Không có dữ liệu</p></div>';
        return;
      }
      _drawBar(self.refs.deptCanvas, d.dept.labels, d.dept.values, true);
      _drawBar(self.refs.branchCanvas, d.branch.labels, d.branch.values, true);
    }).catch(function () {
      grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Không thể tải dữ liệu</p></div>';
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
      if (!rows.length) {
        self.refs.bdayTableContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inbox</span><p>Không có dữ liệu</p></div>';
        return;
      }
      var tableData = [{ label: 'Nhân sự', value: 'Ngày sinh', isHeader: true }];
      rows.forEach(function (r) {
        tableData.push({ label: r.empName, value: r.birthdayDate, dot: '#F43F5E' });
      });
      self.refs.bdayTableContainer.appendChild(KVTable.create({ rows: tableData }));
    }).catch(function () {
      self.refs.bdayTableContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Không thể tải dữ liệu</p></div>';
    });

    HRDataService.getContractsExpiring().then(function (rows) {
      self.refs.contractTableContainer.innerHTML = '';
      if (!rows.length) {
        self.refs.contractTableContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inbox</span><p>Không có dữ liệu</p></div>';
        return;
      }
      var tableData = [{ label: 'Nhân sự', value: 'Ngày hết hạn', isHeader: true }];
      rows.forEach(function (r) {
        var dotColor = r.statusLevel === 'danger' ? '#F43F5E' : (r.statusLevel === 'warning' ? '#F59E0B' : '#0EA5E9');
        tableData.push({ label: r.empName, value: r.expireDate, color: r.statusLevel, dot: dotColor });
      });
      self.refs.contractTableContainer.appendChild(KVTable.create({ rows: tableData }));
    }).catch(function () {
      self.refs.contractTableContainer.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Không thể tải dữ liệu</p></div>';
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
      if (d.empty) {
        grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inbox</span><p>Không có dữ liệu quỹ lương</p></div>';
        return;
      }
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
    }).catch(function () {
      if (self.refs.payrollGrid) {
        self.refs.payrollGrid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">error</span><p>Không thể tải dữ liệu quỹ lương</p></div>';
      }
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
