/**
 * Quản lý Kế Toán & Quỹ Tiền Mặt (Cash Flow)
 */
var CashFlowPage = (function () {

  function render(containerElement) {
    if (!containerElement) return;

    if (typeof DynamicFormEngine === 'undefined') {
      var script = document.createElement('script');
      script.src = './src/js/core/DynamicFormEngine.js?v=' + Date.now();
      script.onload = function() { _loadTemplate(containerElement); };
      document.body.appendChild(script);
    } else {
      _loadTemplate(containerElement);
    }
  }

  function _loadTemplate(containerElement) {
    fetch('./src/pages/cash-flow/cash-flow.html?v=' + Date.now())
      .then(function(res) { return res.text(); })
      .then(function(html) {
        containerElement.innerHTML = html;
        _bindEvents(containerElement);
        _loadSummaryData();
        
        // Render mặc định tab đầu tiên
        var firstTab = document.getElementById('tab-thu-btn');
        if (firstTab) firstTab.click();
      })
      .catch(function(err) {
        console.error('Failed to load cash-flow template', err);
        containerElement.innerHTML = '<div class="text-danger p-4">Lỗi tải giao diện Kế toán: ' + (err.stack || err.message || err) + '</div>';
      });
  }

  function _loadSummaryData() {
    if (typeof GatewayClient !== 'undefined' && typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS.ROUTER) {
      // Gọi API thực tế thông qua Gateway Router lấy danh sách Phiếu Thu
      GatewayClient.run({ sp: 'frmPhieuThu', func: 'View' }, undefined, {
        endpoint: API_CONFIG.ENDPOINTS.ROUTER,
        limit: 10000
      }).then(function(res) {
        console.log('--- RAW API RESPONSE ---', res); // Debug log để xem format thật
        var records = res.list || res.records || res.data || res.Data || [];
        var totalIn = 0;
        
        // Cộng dồn tiền từ dữ liệu thật
        records.forEach(function(row) {
          // Xử lý case-sensitive: DB có thể trả về TONGTIEN, Tongtien, hoặc tongtien
          var amount = parseFloat(row.TONGTIEN || row.Tongtien || row.tongtien || 0);
          if (!isNaN(amount)) totalIn += amount;
        });
        
        var totalOut = 0; // Tạm gán 0 chờ hoàn thiện bảng Phiếu Chi
        // Quỹ hiện tại = Tổng thực thu - Tổng thực chi (Bỏ 500 triệu tồn quỹ tĩnh đi)
        var balance = totalIn - totalOut;
        
        var elIn = document.getElementById('cf-total-in');
        var elOut = document.getElementById('cf-total-out');
        var elBal = document.getElementById('cf-balance');
        
        if (elIn) elIn.innerHTML = '+ ' + totalIn.toLocaleString('vi-VN') + ' ₫';
        if (elOut) elOut.innerHTML = '- ' + totalOut.toLocaleString('vi-VN') + ' ₫';
        if (elBal) elBal.innerHTML = balance.toLocaleString('vi-VN') + ' ₫';
        
      }).catch(function(err) {
        console.error('Lỗi tải dữ liệu Cash Flow thật:', err);
        var elIn = document.getElementById('cf-total-in');
        if (elIn) elIn.innerHTML = 'Lỗi tải data';
      });
    }
  }

  function _bindEvents(containerElement) {
    var tabs = [
      { id: 'tab-thu-btn', paneId: 'tab-thu-pane', containerId: 'thu-list-view', formName: 'frmPhieuThu', title: 'Danh sách Phiếu Thu' },
      { id: 'tab-chi-btn', paneId: 'tab-chi-pane', containerId: 'chi-list-view', formName: 'frmPhieuChi', title: 'Danh sách Phiếu Chi' },
      { id: 'tab-danhmuc-btn', paneId: 'tab-danhmuc-pane', containerId: 'danhmuc-list-view', formName: 'frmLoaiThuChi', title: 'Danh mục Loại Thu/Chi' }
    ];

    function resetTabs() {
      tabs.forEach(function(t) {
        var btn = document.getElementById(t.id);
        var pane = document.getElementById(t.paneId);
        if (btn) {
          btn.classList.remove('active');
          btn.style.color = 'var(--color-text-secondary)';
          btn.style.borderBottomColor = 'transparent';
        }
        if (pane) {
          pane.style.display = 'none';
          var gridContainer = document.getElementById(t.containerId);
          if (gridContainer) gridContainer.innerHTML = '';
        }
      });
    }

    tabs.forEach(function(t) {
      var btn = document.getElementById(t.id);
      if (!btn) return;
      btn.onclick = function() {
        resetTabs();
        btn.classList.add('active');
        btn.style.color = 'var(--color-primary)';
        btn.style.borderBottomColor = 'var(--color-primary)';
        
        var pane = document.getElementById(t.paneId);
        if (pane) pane.style.display = 'block';

        var gridContainer = document.getElementById(t.containerId);
        if (gridContainer && typeof DynamicFormEngine !== 'undefined') {
          // Render the grid dynamically via the core engine!
          DynamicFormEngine.render(gridContainer, {
            FormName: t.formName,
            PageTitle: t.title
          });
        }
      };
    });
  }

  return {
    render: render
  };
})();
