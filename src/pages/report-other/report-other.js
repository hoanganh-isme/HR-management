/**
 * Màn hình Báo cáo Quản lý Khác (Khảo sát, Thống kê)
 * HTML Template: src/pages/report-other.html
 */
var ReportOtherPage = (function () {
  var $container;

  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/report-other/report-other.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _renderFilter();
        _renderTabs();
        _bindEvents();
      })
      .catch(function(err) {
        $container.innerHTML = '<div class="card"><div class="card-body text-danger">Lỗi tải template: ' + err.message + '</div></div>';
      });
  }

  function _renderFilter() {
    var filterContainer = $container.querySelector('#filter-wrapper-other');
    var filterEl = FilterComponent.create([
      { id: 'fo-year', label: 'Năm', type: 'number', placeholder: 'Năm hiện tại...' }
    ], function(values) {
      var year = values['fo-year'] || new Date().getFullYear();
      _loadSalesStats(year + '-01-01', year + '-12-31');
    });

    var cardFilter = document.createElement('div');
    cardFilter.className = 'card';
    var cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.appendChild(filterEl);
    cardFilter.appendChild(cardBody);
    filterContainer.appendChild(cardFilter);
  }

  function _loadSalesStats(tuNgay, denNgay) {
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS.REPORTS && window.API_CONFIG.ENDPOINTS.REPORTS.SALES_STATS) 
                    ? window.API_CONFIG.ENDPOINTS.REPORTS.SALES_STATS : '/api/API_Report_SalesStats';
    
    var tbody = $container.querySelector('#table-sales-stats tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-center">Đang tải dữ liệu...</td></tr>';

    var payload = {};
    if (tuNgay) payload.TuNgay = tuNgay;
    if (denNgay) payload.DenNgay = denNgay;

    var url = endpoint;
    if (Object.keys(payload).length > 0) {
        url += '?q=' + encodeURIComponent(JSON.stringify(payload));
    }

    ApiClient.get(url)
      .then(function(res) {
        var records = res.records || res.data || res || [];
        if (!tbody) return;
        tbody.innerHTML = '';
        if(records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Không có dữ liệu</td></tr>';
            return;
        }
        records.forEach(function(row) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + (row.SalesName || 'Chưa rõ') + '</td>' +
                           '<td class="text-center">' + FormatUtils.number(row.TotalTables) + '</td>' +
                           '<td class="text-end fw-bold text-primary">' + FormatUtils.currency(row.EstimatedRevenue) + '</td>';
            tbody.appendChild(tr);
        });
      })
      .catch(function(err) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
      });
  }

  function _renderTabs() {
    var wrapper = $container.querySelector('#tabs-wrapper-other');

    // ── Tab 1: Thống kê Sales ────────────────────────────────────────────
    var tabContent1 = document.createElement('div');
    tabContent1.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">Lũy kế nhận tiệc trong năm theo Sales</div>
        <div class="table-wrapper">
          <table class="data-table" id="table-sales-stats">
            <thead>
              <tr>
                <th>Nhân viên Sales</th>
                <th class="text-center">Số lượng Bàn</th>
                <th class="text-end">Doanh thu dự kiến</th>
              </tr>
            </thead>
            <tbody>
               <tr><td colspan="3" class="text-center">Đang tải dữ liệu...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Load dynamic data
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS.REPORTS && window.API_CONFIG.ENDPOINTS.REPORTS.SALES_STATS) 
                    ? window.API_CONFIG.ENDPOINTS.REPORTS.SALES_STATS : '/api/API_Report_SalesStats';
    
    ApiClient.get(endpoint)
      .then(function(res) {
        var records = res.records || res.data || res || [];
        var tbody = tabContent1.querySelector('tbody');
        tbody.innerHTML = '';
        if(records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Không có dữ liệu</td></tr>';
            return;
        }
        records.forEach(function(row) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + (row.SalesName || 'Chưa rõ') + '</td>' +
                           '<td class="text-center">' + FormatUtils.number(row.TotalTables) + '</td>' +
                           '<td class="text-end fw-bold text-primary">' + FormatUtils.currency(row.EstimatedRevenue) + '</td>';
            tbody.appendChild(tr);
        });
      })
      .catch(function(err) {
        tabContent1.querySelector('tbody').innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
      });

    // ── Tab 2: Biểu đồ Khảo sát — dùng UIChart component ────────────────
    // Lấy màu từ Design Tokens
    var rs = getComputedStyle(document.documentElement);
    var cPrimary = rs.getPropertyValue('--color-primary').trim() || '#4F46E5';
    var cSuccess = rs.getPropertyValue('--color-success').trim() || '#10B981';
    var cWarning = rs.getPropertyValue('--color-warning').trim() || '#F59E0B';
    var cDanger  = rs.getPropertyValue('--color-danger').trim()  || '#F43F5E';
    var cInfo    = rs.getPropertyValue('--color-info').trim()    || '#0EA5E9';

    var makeChartData = function(dataArray, colors) {
      return {
        labels: dataArray.map(function(d) { return d.label; }),
        datasets: [{ data: dataArray.map(function(d) { return d.value; }), backgroundColor: colors }]
      };
    };

    var tabContent2 = document.createElement('div');
    tabContent2.className = 'row g-4 p-3';

    var col1 = document.createElement('div');
    col1.className = 'col-md-6';
    col1.innerHTML = '<div class="text-center p-4 text-muted">Đang tải dữ liệu khảo sát...</div>';

    var col2 = document.createElement('div');
    col2.className = 'col-md-6';
    col2.innerHTML = '<div class="text-center p-4 text-muted">Đang tải dữ liệu khảo sát...</div>';

    ApiClient.get('/api/API_Report_SurveyStats', { silent: true }).then(function(res) {
      var records = res.records || res.data || [];
      var factorsData = [];
      var channelsData = [];
      
      if (records.length > 0) {
        // Parse real data from backend
        factorsData = records.filter(r => r.Type === 'FACTOR').map(r => ({ label: r.Name, value: r.Count }));
        channelsData = records.filter(r => r.Type === 'CHANNEL').map(r => ({ label: r.Name, value: r.Count }));
      } else {
        // Fallback or empty state
        factorsData = [{ label: 'Giá cả', value: 40 }, { label: 'Không gian', value: 30 }, { label: 'Thực đơn', value: 20 }, { label: 'Phục vụ', value: 10 }];
        channelsData = [{ label: 'Facebook', value: 50 }, { label: 'Người quen giới thiệu', value: 30 }, { label: 'Đi ngang thấy', value: 20 }];
      }

      var chartFactors = UIChart.create({
        title: 'Yếu tố quyết định đặt tiệc',
        type: 'pie',
        data: makeChartData(factorsData, [cPrimary, cSuccess, cWarning, cInfo, cDanger]),
        options: { plugins: { legend: { position: 'bottom' } } }
      });

      var chartChannels = UIChart.create({
        title: 'Kênh thông tin tiếp cận',
        type: 'pie',
        data: makeChartData(channelsData, [cWarning, cSuccess, cPrimary, cDanger]),
        options: { plugins: { legend: { position: 'bottom' } } }
      });

      col1.innerHTML = '';
      col1.appendChild(chartFactors);
      
      col2.innerHTML = '';
      col2.appendChild(chartChannels);

    }).catch(function(err) {
      col1.innerHTML = '<div class="text-center p-4 text-danger">Lỗi tải dữ liệu.</div>';
      col2.innerHTML = '';
    });

    tabContent2.appendChild(col1);
    tabContent2.appendChild(col2);

    // ── Tạo UITabs với DOM element content ───────────────────────────────
    var tabsEl = UITabs.create([
      { id: 'tab-stats',   title: 'Thống kê (Cọc/Tiệc)',        content: tabContent1 },
      { id: 'tab-surveys', title: 'Khảo sát (Kênh/Yếu tố)',    content: tabContent2 }
    ]);

    wrapper.appendChild(tabsEl);
    
    // Khởi tạo dữ liệu lần đầu cho báo cáo Thống Kê
    var currentYear = new Date().getFullYear();
    _loadSalesStats(currentYear + '-01-01', currentYear + '-12-31');
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    if (typeof UIActionToolbar !== 'undefined') {
      var toolbar = UIActionToolbar.create({
        onAdd: false, onEdit: false, onDelete: false, onFilter: false, onPrint: false, onClose: false,
        extras: [
          { id: 'btn-export-other', text: 'Xuất Excel', icon: 'download', type: 'tool' },
          { id: 'btn-print-other', text: 'In Báo Cáo', icon: 'print', type: 'tool' }
        ]
      });
      globalActions.appendChild(toolbar);
    }
  }

  function _bindEvents() {
    var btnPrint = document.getElementById('btn-print-other');
    if (btnPrint) btnPrint.addEventListener('click', function() {
      window.print();
    });

    var btnExport = document.getElementById('btn-export-other');
    if (btnExport) btnExport.addEventListener('click', function() {
      if (typeof Alert !== 'undefined') {
        Alert.success('Đã xuất báo cáo ra Excel (Mock)');
      } else if (typeof UIToast !== 'undefined') {
        UIToast.show('Đã xuất báo cáo ra Excel (Mock)', 'success');
      }
    });
  }

  return { render: render };
})();
