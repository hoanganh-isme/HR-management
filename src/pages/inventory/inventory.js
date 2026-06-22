/**
 * Quản lý Kho & Định lượng (Inventory & Recipe Costing)
 * Phase 1: Danh mục Kho, Nguyên vật liệu, Định lượng Món ăn
 */
var InventoryPage = (function () {

  function render(containerElement) {
    if (!containerElement) return;

    // Đảm bảo DynamicFormEngine được tải để hiển thị lưới dữ liệu động
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
    fetch('./src/pages/inventory/inventory.html?v=' + Date.now())
      .then(function(res) { return res.text(); })
      .then(function(html) {
        containerElement.innerHTML = html;
        _bindEvents(containerElement);
        
        // Render mặc định tab đầu tiên
        var firstTab = document.getElementById('tab-kho-btn');
        if (firstTab) firstTab.click();
      })
      .catch(function(err) {
        console.error('Failed to load inventory template', err);
        containerElement.innerHTML = '<div class="text-danger p-4">Lỗi tải giao diện Inventory: ' + (err.stack || err.message || err) + '</div>';
      });
  }

  function _bindEvents(containerElement) {
    var tabs = [
      { id: 'tab-kho-btn', paneId: 'tab-kho-pane', containerId: 'kho-list-view', formName: 'frmKho', title: 'Danh Mục Kho' },
      { id: 'tab-nvl-btn', paneId: 'tab-nvl-pane', containerId: 'nvl-list-view', formName: 'frmHanghoa', title: 'Nguyên Vật Liệu' },
      { id: 'tab-bom-btn', paneId: 'tab-bom-pane', containerId: 'bom-list-view', formName: 'frmHanghoadinhluong', title: 'Định Lượng (BOM)' },
      { id: 'tab-nhap-btn', paneId: 'tab-nhap-pane', containerId: 'nhap-list-view', formName: 'frmNhapKho', title: 'Nhập Kho' },
      { id: 'tab-xuat-btn', paneId: 'tab-xuat-pane', containerId: 'xuat-list-view', formName: 'frmXuatKho', title: 'Xuất Kho' }
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
          // Clear previous DynamicFormEngine DOM to avoid conflicts
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
