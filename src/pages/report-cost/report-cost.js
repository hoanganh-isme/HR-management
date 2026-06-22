/**
 * Màn hình Báo cáo Chi phí Tiệc
 * HTML Template: src/pages/report-cost.html
 */
var ReportCostPage = (function () {
  var $container;
  var costData = [];
  var revenueDataCache = []; // Để tính lợi nhuận gộp

  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/report-cost/report-cost.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _renderFilter();
        
        // Mặc định load tháng hiện tại
        var today = new Date();
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        
        _loadData(firstDay, lastDay, '');
        _bindEvents();
      })
      .catch(function(err) {
        $container.innerHTML = '<div class="card"><div class="card-body text-danger">Lỗi tải template: ' + err.message + '</div></div>';
      });
  }

  function _loadData(from, to, keyword) {
    if (typeof ReportService !== 'undefined') {
      // Tải chi phí
      ReportService.getCost(from, to).then(function(data) {
        // Lọc thêm theo keyword nếu có (nếu API không support thì lọc ở JS)
        if (keyword) {
          keyword = keyword.toLowerCase();
          data = data.filter(function(x) { return x.id.toLowerCase().includes(keyword); });
        }
        costData = data;
        _renderTable();
      }).catch(function(err) {
        UIToast.show('Lỗi tải dữ liệu chi phí!', 'error');
        costData = [];
        _renderTable();
      });

      // Tiện thể tải luôn doanh thu để lát xuất Excel có cái mà đối chiếu tính Lợi Nhuận
      ReportService.getRevenue(from, to).then(function(data) {
        revenueDataCache = data;
      });
    }
  }

  function _renderFilter() {
    var filterContainer = $container.querySelector('#filter-wrapper-cost');
    var filterEl = FilterComponent.create([
      { id: 'fc-from', label: 'Từ ngày', type: 'date' },
      { id: 'fc-to', label: 'Đến ngày', type: 'date' },
      { id: 'fc-code', label: 'Mã HĐ', type: 'text', placeholder: 'Nhập mã HĐ...' }
    ], function(values) {
      _loadData(values['fc-from'], values['fc-to'], values['fc-code']);
    });

    var cardFilter = document.createElement('div');
    cardFilter.className = 'card';
    var cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.appendChild(filterEl);
    cardFilter.appendChild(cardBody);
    filterContainer.appendChild(cardFilter);
  }

  function _renderTable() {
    var tbody = $container.querySelector('#cost-table tbody');
    tbody.innerHTML = '';

    var sumFood = 0, sumService = 0, sumStaff = 0, sumTotal = 0;

    costData.forEach(function(item) {
      sumFood += item.foodCost;
      sumService += item.serviceCost;
      sumStaff += item.staffCost;
      sumTotal += item.totalCost;

      var tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-medium" style="color: var(--color-primary);">${item.id}</td>
        <td>${item.customer}</td>
        <td class="text-center">${item.date}</td>
        <td class="text-end">${item.foodCost.toLocaleString('vi-VN')}</td>
        <td class="text-end">${item.serviceCost.toLocaleString('vi-VN')}</td>
        <td class="text-end">${item.staffCost.toLocaleString('vi-VN')}</td>
        <td class="text-end fw-semibold" style="color: var(--color-danger);">${item.totalCost.toLocaleString('vi-VN')}</td>
      `;
      tbody.appendChild(tr);
    });

    var totalBarContainer = $container.querySelector('#total-bar-wrapper-cost');
    if (window.TotalBar) {
      var totalBar = new TotalBar({ container: totalBarContainer });
      totalBar.addTotal('Số lượng HĐ', costData.length);
      totalBar.addTotal('TỔNG CHI PHÍ', sumTotal.toLocaleString('vi-VN') + ' VNĐ', true);
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
          { id: 'btn-export-cost', text: 'Xuất Excel', icon: 'download', type: 'tool' },
          { id: 'btn-print-cost', text: 'In Báo Cáo', icon: 'print', type: 'tool' }
        ]
      });
      globalActions.appendChild(toolbar);
    }
  }

  function _bindEvents() {
    var btnPrint = document.getElementById('btn-print-cost');
    if (btnPrint) btnPrint.addEventListener('click', function() {
      window.print();
    });

    var btnExport = document.getElementById('btn-export-cost');
    if (btnExport) btnExport.addEventListener('click', function() {
      var revData = revenueDataCache || [];
      var cData = costData || [];
      
      // Calculate totals
      var totalRev = 0;
      var totalCount = 0;
      revData.forEach(function(item) {
        totalRev += (item.revenue || 0);
        totalCount += 1;
      });
      
      var sumFood = 0, sumService = 0, sumStaff = 0, totalCost = 0;
      cData.forEach(function(item) {
        sumFood += (item.foodCost || 0);
        sumService += (item.serviceCost || 0);
        sumStaff += (item.staffCost || 0);
        totalCost += (item.totalCost || 0);
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
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 150px; padding: 10px;">Mã Hợp Đồng</th>';
      html += '<th style="background-color: #f1f5f9; font-weight: bold; width: 200px; padding: 10px;">Doanh thu (VNĐ)</th>';
      html += '</tr></thead><tbody>';
      
      revData.forEach(function(item, idx) {
        html += '<tr>';
        html += '<td style="text-align: center; padding: 8px;">' + (idx + 1) + '</td>';
        html += '<td style="text-align: center; padding: 8px;">' + item.id + '</td>';
        html += '<td style="text-align: right; padding: 8px;">' + (item.revenue || 0).toLocaleString('vi-VN') + '</td>';
        html += '</tr>';
      });
      html += '</tbody><tfoot><tr>';
      html += '<td style="font-weight: bold; text-align: center; background-color: #e2e8f0; padding: 10px;">TỔNG CỘNG</td>';
      html += '<td style="font-weight: bold; text-align: center; background-color: #e2e8f0; padding: 10px;">' + totalCount + '</td>';
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
