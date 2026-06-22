/**
 * Màn hình Báo cáo Doanh Thu Tiệc
 * HTML Template: src/pages/report-revenue.html
 */
var ReportRevenuePage = (function () {
  var $container;
  var revenueData = [];
  var charts = {};

  function render(containerElement) {
    $container = containerElement;

    // Load HTML template rồi mới init logic
    fetch('./src/pages/report-revenue/report-revenue.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _renderFilter();
        
        // Gọi API lần đầu (mặc định lấy tháng hiện tại hoặc lấy tất cả tuỳ logic, ở đây lấy tháng này)
        var today = new Date();
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        
        _loadData(firstDay, lastDay);
        _bindEvents();
      })
      .catch(function(err) {
        $container.innerHTML = '<div class="card"><div class="card-body text-danger">Lỗi tải template: ' + err.message + '</div></div>';
      });
  }

  function _loadData(from, to) {
    if (typeof ReportService !== 'undefined') {
      ReportService.getRevenue(from, to).then(function(data) {
        revenueData = data;
        
        var chartTitle = $container.querySelector('#chart-title');
        if (chartTitle) {
          if (from && to) {
            chartTitle.innerText = 'Biểu đồ Doanh thu từ ' + new Date(from).toLocaleDateString('vi-VN') + ' đến ' + new Date(to).toLocaleDateString('vi-VN');
          } else {
            chartTitle.innerText = 'Biểu đồ Doanh thu';
          }
        }
        
        _renderChartTabs();
        _renderTable();
      }).catch(function(err) {
        UIToast.show('Lỗi tải dữ liệu báo cáo!', 'error');
        revenueData = [];
        _renderChartTabs();
        _renderTable();
      });
    }
  }

  function _renderFilter() {
    var filterContainer = $container.querySelector('#filter-wrapper');
    var filterEl = FilterComponent.create([
      { id: 'f-from', label: 'Từ ngày', type: 'date' },
      { id: 'f-to', label: 'Đến ngày', type: 'date' }
    ], function(values) {
      if (values['f-from'] && values['f-to']) {
        _loadData(values['f-from'], values['f-to']);
      } else {
        _loadData(null, null);
      }
    });

    var cardFilter = document.createElement('div');
    cardFilter.className = 'card';
    var cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.appendChild(filterEl);
    cardFilter.appendChild(cardBody);
    filterContainer.appendChild(cardFilter);
  }

  function _renderChartTabs() {
    var wrapper = $container.querySelector('#chart-tabs-wrapper');

    var tabsEl = UITabs.create([
      { id: 'tab-bar', title: 'Biểu đồ Cột', content: '<div class="p-3" style="height: 380px; position: relative;"><canvas id="revenue-chart-bar"></canvas></div>' },
      { id: 'tab-line', title: 'Biểu đồ Đường', content: '<div class="p-3" style="height: 380px; position: relative;"><canvas id="revenue-chart-line"></canvas></div>' },
      { id: 'tab-hbar', title: 'Cột Ngang', content: '<div class="p-3" style="height: 380px; position: relative;"><canvas id="revenue-chart-hbar"></canvas></div>' },
      { id: 'tab-donut', title: 'Biểu đồ Tròn', content: '<div class="p-3" style="height: 380px; position: relative; display: flex; justify-content: center;"><canvas id="revenue-chart-donut"></canvas></div>' }
    ]);

    wrapper.innerHTML = '';
    wrapper.appendChild(tabsEl);
    if (charts['bar']) charts['bar'].destroy();
    if (charts['line']) charts['line'].destroy();
    if (charts['hbar']) charts['hbar'].destroy();
    if (charts['donut']) charts['donut'].destroy();
    charts['bar'] = _initChart('revenue-chart-bar', 'bar');
    charts['line'] = _initChart('revenue-chart-line', 'line');
    charts['hbar'] = _initChart('revenue-chart-hbar', 'hbar');
    charts['donut'] = _initChart('revenue-chart-donut', 'doughnut');
  }

  function _initChart(canvasId, type) {
    var ctx = $container.querySelector('#' + canvasId).getContext('2d');
    
    // Gom nhóm dữ liệu
    var groupMap = {};
    var isDonut = type === 'doughnut';
    
    revenueData.forEach(function(r) {
      // Biểu đồ tròn -> Phân tích Tỷ trọng Doanh thu theo Sảnh
      // Các biểu đồ còn lại -> Phân tích Xu hướng Doanh thu theo Ngày
      var key = isDonut ? (r.hall || 'Chưa xếp sảnh') : r.date; 
      if (!groupMap[key]) groupMap[key] = 0;
      groupMap[key] += (r.revenue || 0);
    });
    var labels = Object.keys(groupMap);
    var data = Object.values(groupMap);

    var rootStyles = getComputedStyle(document.documentElement);
    var primaryColor = rootStyles.getPropertyValue('--color-primary').trim() || '#4F46E5';
    var primaryLight = rootStyles.getPropertyValue('--color-primary-light').trim() || 'rgba(79, 70, 229, 0.1)';
    var textColor = rootStyles.getPropertyValue('--color-text-secondary').trim() || '#64748B';
    var gridColor = 'rgba(100, 116, 139, 0.2)';
    var surfaceColor = rootStyles.getPropertyValue('--color-surface').trim() || '#ffffff';

    var chartType = type === 'hbar' ? 'bar' : type;
    var isDonut = type === 'doughnut';
    
    var bgColors = type === 'line' ? primaryLight : primaryColor;
    var borderColors = primaryColor;
    var borderWidth = type === 'line' ? 2 : 0;
    
    if (isDonut) {
      bgColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'];
      borderColors = surfaceColor;
      borderWidth = 2;
    }

    var config = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: data,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: borderWidth,
          fill: type === 'line',
          tension: 0.4,
          borderRadius: (chartType === 'bar' && !isDonut) ? 4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          y: { duration: 1200, easing: 'easeOutQuart', from: 1000 }
        },
        plugins: { 
          legend: { 
            display: isDonut,
            position: 'right',
            labels: { color: textColor }
          } 
        }
      }
    };

    if (!isDonut) {
      config.options.scales = {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor, drawBorder: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) { return (value / 1000000) + ' Tr'; }
          },
          grid: { color: gridColor, drawBorder: false }
        }
      };

      if (type === 'hbar') {
        config.options.indexAxis = 'y';
        var tempX = config.options.scales.x;
        config.options.scales.x = config.options.scales.y;
        config.options.scales.y = tempX;
      }
    }

    return new Chart(ctx, config);
  }

  function _renderTable() {
    var tbody = $container.querySelector('#revenue-table tbody');
    tbody.innerHTML = '';

    var totalRev = 0;
    var totalCount = 0;

    revenueData.forEach(function(item, idx) {
      totalRev += (item.revenue || 0);
      totalCount += 1;

      var tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center">${idx + 1}</td>
        <td class="fw-semibold" style="color: var(--color-primary);">${item.id}</td>
        <td class="fw-medium">${item.customer}</td>
        <td class="text-center">${item.date}</td>
        <td class="text-center"><span class="badge" style="background:rgba(79, 70, 229, 0.1); color:var(--color-primary); padding:4px 8px; border-radius:6px;">${item.hall || 'Chưa xếp sảnh'}</span></td>
        <td class="text-end">${item.tables || 0} bàn</td>
        <td class="text-end fw-semibold" style="color: var(--color-danger);">${(item.revenue || 0).toLocaleString('vi-VN')} đ</td>
      `;
      tbody.appendChild(tr);
    });

    var totalBarContainer = $container.querySelector('#total-bar-wrapper');
    if (window.TotalBar) {
      var totalBar = new TotalBar({ container: totalBarContainer });
      totalBar.addTotal('Tổng số tiệc', totalCount);
      totalBar.addTotal('TỔNG DOANH THU', totalRev.toLocaleString('vi-VN') + ' VNĐ', true);
    }
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    if (typeof UIActionToolbar !== 'undefined') {
      var toolbar = UIActionToolbar.create({
        onAdd: false, onEdit: false, onDelete: false, onFilter: false, onPrint: false, onClose: false,
        extras: [
          { id: 'btn-export', text: 'Xuất Excel', icon: 'download', type: 'tool' },
          { id: 'btn-print', text: 'In Báo Cáo', icon: 'print', type: 'tool' }
        ]
      });
      globalActions.appendChild(toolbar);
    }
  }

  function _bindEvents() {
    var btnPrint = document.getElementById('btn-print');
    if (btnPrint) btnPrint.addEventListener('click', function() {
      window.print();
    });

    var btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.addEventListener('click', function() {
      var revData = revenueData || [];
      var cData = []; // Báo cáo doanh thu chỉ quan tâm doanh thu
      
      // Calculate totals
      var totalRev = 0;
      var totalCount = 0;
      revData.forEach(function(item) {
        totalRev += item.revenue;
        totalCount += item.count;
      });
      
      var sumFood = 0, sumService = 0, sumStaff = 0, totalCost = 0;
      cData.forEach(function(item) {
        sumFood += item.foodCost;
        sumService += item.serviceCost;
        sumStaff += item.staffCost;
        totalCost += item.totalCost;
      });
      
      var profit = totalRev - totalCost;

      var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      html += '<head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif;">';
      
      html += '<h2 style="text-align: center; color: #4F46E5; font-size: 24px;">BÁO CÁO TỔNG HỢP DOANH THU & CHI PHÍ</h2>';
      html += '<p style="text-align: center; font-style: italic; color: #64748b;">(Xuất tự động từ hệ thống quản lý)</p><br>';

      // TỔNG QUAN LỢI NHUẬN
      html += '<table border="1" style="border-collapse: collapse; margin-bottom: 30px; width: 600px; border: 2px solid #000;">';
      html += '<thead><tr><th colspan="2" style="background-color: #F59E0B; color: white; padding: 15px; font-size: 18px;">TỔNG QUAN KẾT QUẢ KINH DOANH</th></tr></thead>';
      html += '<tbody>';
      html += '<tr><td style="padding: 12px; font-weight: bold; font-size: 16px;">Tổng Doanh Thu</td><td style="padding: 12px; text-align: right; color: #10B981; font-weight: bold; font-size: 16px;">' + totalRev.toLocaleString('vi-VN') + ' VNĐ</td></tr>';
      html += '<tr><td style="padding: 12px; font-weight: bold; font-size: 16px;">Tổng Chi Phí</td><td style="padding: 12px; text-align: right; color: #EF4444; font-weight: bold; font-size: 16px;">' + totalCost.toLocaleString('vi-VN') + ' VNĐ</td></tr>';
      html += '<tr><td style="padding: 15px; font-weight: bold; background-color: #f1f5f9; font-size: 18px;">LỢI NHUẬN TỊNH</td><td style="padding: 15px; text-align: right; color: #4F46E5; font-weight: bold; font-size: 18px; background-color: #f1f5f9;">' + profit.toLocaleString('vi-VN') + ' VNĐ</td></tr>';
      html += '</tbody></table><br><br>';

      // BẢNG DOANH THU
      html += '<table border="1" style="border-collapse: collapse; margin-bottom: 30px;">';
      html += '<thead>';
      html += '<tr><th colspan="3" style="font-size: 16px; font-weight: bold; text-align: left; background-color: #10B981; color: white; padding: 12px;">1. CHI TIẾT DOANH THU (' + totalCount + ' tiệc)</th></tr>';
      html += '<tr>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 60px; padding: 10px;">STT</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 120px; padding: 10px;">Mã HĐ</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 200px; padding: 10px;">Khách Hàng</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 120px; padding: 10px;">Ngày Tổ Chức</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 150px; padding: 10px;">Sảnh Tiệc</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 100px; padding: 10px;">Số Bàn</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 150px; padding: 10px;">Doanh Thu (VNĐ)</th>';
      html += '</tr></thead><tbody>';
      
      revData.forEach(function(item, idx) {
        html += '<tr>';
        html += '<td style="text-align: center; padding: 8px;">' + (idx + 1) + '</td>';
        html += '<td style="padding: 8px;">' + item.id + '</td>';
        html += '<td style="padding: 8px;">' + item.customer + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + item.date + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + (item.hall || 'Chưa xếp sảnh') + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + (item.tables || 0) + '</td>';
        html += '<td style="text-align: right; padding: 8px;">' + (item.revenue || 0).toLocaleString('vi-VN') + '</td>';
        html += '</tr>';
      });
      html += '</tbody><tfoot><tr>';
      html += '<td colspan="6" style="font-weight: bold; text-align: center; background-color: #e2e8f0; padding: 10px;">TỔNG CỘNG (' + totalCount + ' tiệc)</td>';
      html += '<td style="font-weight: bold; color: #10B981; text-align: right; background-color: #e2e8f0; padding: 10px;">' + totalRev.toLocaleString('vi-VN') + '</td>';
      html += '</tr></tfoot></table><br><br>';

      // BẢNG CHI PHÍ
      html += '<table border="1" style="border-collapse: collapse;">';
      html += '<thead>';
      html += '<tr><th colspan="7" style="font-size: 16px; font-weight: bold; text-align: left; background-color: #EF4444; color: white; padding: 12px;">2. CHI TIẾT CHI PHÍ</th></tr>';
      html += '<tr>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Mã HĐ</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Khách hàng</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Ngày tổ chức</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Chi phí Thực đơn</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Chi phí Dịch vụ</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Chi phí Nhân sự</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; padding: 10px;">Tổng Chi Phí</th>';
      html += '</tr></thead><tbody>';
      
      cData.forEach(function(item) {
        html += '<tr>';
        html += '<td style="text-align: center; padding: 8px;">' + item.id + '</td>';
        html += '<td style="padding: 8px;">' + item.customer + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + item.date + '</td>';
        html += '<td style="text-align: right; padding: 8px;">' + item.foodCost.toLocaleString('vi-VN') + '</td>';
        html += '<td style="text-align: right; padding: 8px;">' + item.serviceCost.toLocaleString('vi-VN') + '</td>';
        html += '<td style="text-align: right; padding: 8px;">' + item.staffCost.toLocaleString('vi-VN') + '</td>';
        html += '<td style="text-align: right; padding: 8px; color: #EF4444; font-weight: bold;">' + item.totalCost.toLocaleString('vi-VN') + '</td>';
        html += '</tr>';
      });
      html += '</tbody><tfoot><tr>';
      html += '<td colspan="3" style="font-weight: bold; text-align: center; background-color: #e2e8f0; padding: 10px;">TỔNG CỘNG</td>';
      html += '<td style="font-weight: bold; text-align: right; background-color: #e2e8f0; padding: 10px;">' + sumFood.toLocaleString('vi-VN') + '</td>';
      html += '<td style="font-weight: bold; text-align: right; background-color: #e2e8f0; padding: 10px;">' + sumService.toLocaleString('vi-VN') + '</td>';
      html += '<td style="font-weight: bold; text-align: right; background-color: #e2e8f0; padding: 10px;">' + sumStaff.toLocaleString('vi-VN') + '</td>';
      html += '<td style="font-weight: bold; color: #EF4444; text-align: right; background-color: #e2e8f0; padding: 10px;">' + totalCost.toLocaleString('vi-VN') + '</td>';
      html += '</tr></tfoot></table>';
      
      html += '</body></html>';

      var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      var link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", "Bao_Cao_Tong_Hop_Kinh_Doanh.xls");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.success('Đã xuất Báo Cáo Tổng Hợp ra Excel thành công!');
    });
  }

  return { render: render };
})();
