/**
 * Màn hình Quản lý Danh mục (Master Data)
 * Hiển thị cấu trúc dạng Cây (Tree) bên trái và DataGrid bên phải.
 */
var CategoriesPage = (function () {
  var $container;

  // Dữ liệu giả lập Danh mục
  var treeData = [
    {
      id: "time",
      text: "Quản lý Thời gian",
      icon: "calendar_month",
      expanded: true,
      children: [
        { id: "time_solar", text: "Tạo Ngày tháng", icon: "event" },
        { id: "time_lunar", text: "Danh mục Năm Âm Lịch", icon: "brightness_3" }
      ]
    },
    {
      id: "location",
      text: "Quản lý Khu vực",
      icon: "map",
      expanded: true,
      children: [
        { id: "loc_q1", text: "Quận 1", icon: "location_on" },
        { id: "loc_q2", text: "Quận 2", icon: "location_on" },
        { id: "loc_pn", text: "Phú Nhuận", icon: "location_on" }
      ]
    },
    {
      id: "goods",
      text: "Hàng hóa & Dịch vụ",
      icon: "inventory_2",
      expanded: true,
      children: [
        { id: "goods_dv", text: "Dịch vụ (DV)", icon: "room_service" },
        { id: "goods_hh", text: "Hàng hóa / Món ăn (HH)", icon: "restaurant" },
        { id: "goods_tu", text: "Thức uống (TU)", icon: "local_bar" }
      ]
    },
    {
      id: "customer",
      text: "Đối tượng & Ý kiến",
      icon: "contact_page",
      expanded: false,
      children: [
        { id: "cust_feedback", text: "Ý kiến Khách tham quan", icon: "feedback" }
      ]
    }
  ];

  function toUnsigned(str) {
    if (!str) return "";
    // Sử dụng chuẩn Unicode (NFD) để tách các dấu diacritic ra khỏi ký tự gốc
    // sau đó xoá sạch các dấu diacritic đi.
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D");
  }

  // --- MODULES ---
  var TimeSolarModule = {
    render: function(node, $contentElement) {
      $contentElement.innerHTML = `
        <div style="padding: 24px; border-bottom: 1px solid var(--color-border); display: flex; gap: 16px; align-items: center; background: var(--color-surface);">
          <span style="font-weight: 600; font-size: 15px; color: var(--color-text);">Tháng/Năm tạo lịch: </span>
          <div style="position: relative; display: flex; align-items: center;">
            <input type="month" id="ts-month" class="form-control" style="width: 200px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--color-border-strong); box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 15px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--color-border-strong)'" value="2026-07">
          </div>
          ${UIButton.createHTML({
            text: 'Sinh danh sách ngày',
            icon: 'calendar_month',
            type: 'primary',
            className: 'btn-sm',
            onClick: "CategoriesPage.openModal('sinhngay')"
          })}
        </div>
        <div class="table-wrapper" style="flex: 1; overflow-y: auto; padding: 0;">
          <table class="data-table" id="time-solar-grid">
            <thead>
              <tr>
                <th style="width: 50px; text-align:center;">STT</th>
                <th>Ngày Dương</th>
                <th>Thứ</th>
                <th>Ngày Âm Lịch</th>
                <th>Can Chi Âm Lịch</th>
                <th style="width: 100px; text-align: center;">Nhuận</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="6" style="text-align: center; padding: 30px; color: #888;">Hãy chọn tháng và bấm <b>Sinh danh sách ngày</b></td></tr>
            </tbody>
          </table>
        </div>
      `;
    },
    generate: function() {
      var monthVal = document.getElementById('ts-month').value;
      if(!monthVal) { UIToast.show('Vui lòng chọn tháng năm', 'error'); return; }
      
      var parts = monthVal.split('-');
      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      var daysInMonth = new Date(year, month, 0).getDate();
      
      var daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      
      var html = '';
      for(var i=1; i<=daysInMonth; i++) {
        var date = new Date(year, month - 1, i);
        var dayName = daysOfWeek[date.getDay()];
        
        // Mock lunar date: (Dương + 15)
        var alDay = (i + 15) % 30; if (alDay===0) alDay = 30;
        var alMonth = month - 1; if(alMonth===0) { alMonth = 12; }
        
        html += `
          <tr tabindex="0" onclick="CategoriesPage.selectRow(this, '${i}')">
            <td style="text-align: center;">${i}</td>
            <td style="font-weight: 600;">${i.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}</td>
            <td>${dayName}</td>
            <td>
              <input type="text" class="form-control" value="${alDay.toString().padStart(2, '0')}/${alMonth.toString().padStart(2, '0')}/${year}" style="width: 120px; padding: 4px;">
            </td>
            <td><input type="text" class="form-control" value="Năm dự kiến" style="width: 150px; padding: 4px;"></td>
            <td style="text-align: center;">
               <label class="custom-checkbox">
                 <input type="checkbox" class="ui-checkbox">
                 <span class="checkmark"></span>
               </label>
            </td>
          </tr>
        `;
      }
      document.querySelector('#time-solar-grid tbody').innerHTML = html;
      UIToast.show('Đã tạo thành công lịch cho tháng ' + monthVal);
    }
  };

  var GoodsModule = {
    render: function(node, $contentElement) {
      $contentElement.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;">
          <!-- Khối lưới Master -->
          <div class="table-wrapper" style="flex: 1; overflow-y: auto; padding: 0; min-height: 250px; border-bottom: 2px solid var(--color-border); box-shadow: 0 4px 6px -4px rgba(0,0,0,0.05); z-index: 1;">
            <table class="data-table" id="goods-grid">
              <thead style="position: sticky; top: 0; z-index: 2;">
                <tr>
                  <th style="width: 50px;">STT</th>
                  <th>Mã Hàng</th>
                  <th>Tên Hàng (có dấu)</th>
                  <th>Tên Hàng (không dấu)</th>
                  <th>Đơn Vị Tính</th>
                </tr>
              </thead>
              <tbody id="goods-tbody">
              </tbody>
            </table>
          </div>
          
          <!-- Khối Tabs Detail -->
          <div style="flex: 1; display: flex; flex-direction: column; background: var(--color-surface); overflow: hidden; min-height: 0;">
            <div class="tabs-header" style="border-bottom: 1px solid var(--color-border); display: flex; padding-top: 5px; background: var(--color-surface);">
               <div class="tab-item active" onclick="CategoriesPage.switchTab(this, 'tab-gia-ban')">Lịch sử Giá Bán</div>
               <div class="tab-item" onclick="CategoriesPage.switchTab(this, 'tab-dinh-luong')">Định lượng món ăn</div>
            </div>
            
            <div class="tabs-content" style="flex: 1; padding: 0; overflow-y: auto; background: var(--color-surface);">
              <div id="tab-gia-ban" class="tab-pane active" style="display: block; padding: 0;">
                 <table class="data-table">
                    <thead style="background: rgba(148, 163, 184, 0.1);"><tr><th>Ngày Áp Dụng</th><th>Đơn giá</th><th style="text-align: right;">Thao tác</th></tr></thead>
                    <tbody id="price-history-body">
                       <tr><td colspan="3" style="text-align:center; padding: 30px; color:#aaa;">(Chưa chọn Hàng hoá)</td></tr>
                    </tbody>
                 </table>
              </div>
              <div id="tab-dinh-luong" class="tab-pane" style="display: none; padding: 0;">
                 <table class="data-table">
                    <thead style="background: rgba(148, 163, 184, 0.1);"><tr><th>Mã NVL</th><th>Tên Nguyên Vật Liệu</th><th>ĐVT</th><th>Định mức</th></tr></thead>
                    <tbody id="inventory-parts-body">
                       <tr><td colspan="4" style="text-align:center; padding: 30px; color:#aaa;">(Chưa chọn Hàng hoá)</td></tr>
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        </div>
      `;
      this.loadMockTable(node);
    },
    loadMockTable: function(node) {
      var html = '';
      var cat = node.id.split('_')[1].toUpperCase(); // HH, DV, TU
      for(var i=1; i<=12; i++) {
        var tenCoDau = cat === 'HH' ? (`Súp bào ngư vi cá ${i}`) : (cat === 'DV' ? `Gói trang trí cơ bản ${i}` : `Bia Heineken lon ${i}`);
        var tenKhongDau = toUnsigned(tenCoDau).toLowerCase();
        html += `
          <tr tabindex="0" onclick="CategoriesPage.selectRow(this, '${cat}_${i}')">
            <td style="text-align: center;">${i}</td>
            <td style="font-weight: 500; color: var(--color-primary);">${cat}00${i}</td>
            <td style="font-weight: 600;">${tenCoDau}</td>
            <td style="color: #666; font-size: 13px;">${tenKhongDau}</td>
            <td>${cat === 'TU' ? 'Lon' : 'Phần'}</td>
          </tr>
        `;
      }
      document.getElementById('goods-tbody').innerHTML = html;
    },
    onSelectRow: function(id) {
       var basePrice = Math.floor(Math.random() * 500) * 1000 + 50000;
       document.getElementById('price-history-body').innerHTML = `
          <tr><td>01/01/2026</td><td style="color:#666;">${(basePrice).toLocaleString()} ₫</td><td style="text-align:right;">${UIIcon.createHTML('edit', 'font-size:18px;cursor:pointer;color:#888;')}</td></tr>
          <tr><td>15/10/2026</td><td style="font-weight: 600; color: var(--color-success);">${(basePrice + 20000).toLocaleString()} ₫ ${UIBadge.createHTML('Hiện hành', 'success', 'background:#def7ec;color:#03543f;font-size:10px;')}</td><td style="text-align:right;">${UIIcon.createHTML('edit', 'font-size:18px;cursor:pointer;color:#888;')}</td></tr>
       `;

       document.getElementById('inventory-parts-body').innerHTML = `
          <tr><td style="color:var(--color-primary);">NVL_001</td><td>Gà ác nguyên con</td><td>Con</td><td>1.0</td></tr>
          <tr><td style="color:var(--color-primary);">NVL_052</td><td>Nấm đông cô (Khô)</td><td>Kg</td><td>0.05</td></tr>
          <tr><td style="color:var(--color-primary);">NVL_104</td><td>Gia vị tổng hợp</td><td>Gói</td><td>2.0</td></tr>
       `;
    }
  };

  var SimpleModule = {
    render: function(node, $contentElement) {
      $contentElement.innerHTML = `
        <div class="table-wrapper" style="flex: 1; overflow-y: auto; padding: 0;">
          <table class="data-table" id="simple-grid">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">STT</th>
                <th>Mã ${node.text}</th>
                <th>Tên / Diễn giải</th>
                <th>Trạng thái sử dụng</th>
              </tr>
            </thead>
            <tbody>
              ${this.getMockRows(node)}
            </tbody>
          </table>
        </div>
      `;
    },
    getMockRows: function(node) {
      var html = '';
      for(var i=1; i<=8; i++) {
        html += `
          <tr tabindex="0" onclick="CategoriesPage.selectRow(this, '${node.id}_${i}')">
            <td style="text-align: center;">${i}</td>
            <td style="font-weight: 500;">${node.id.toUpperCase()}_${i.toString().padStart(3, '0')}</td>
            <td>Dữ liệu mô phỏng cho ${node.text} số ${i}</td>
            <td>${UIBadge.createHTML('Kích hoạt', 'success')}</td>
          </tr>
        `;
      }
      return html;
    }
  };


  // --- MAIN LOGIC ---
  var currentNode = null;
  var selectedRowId = null;

  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/categories/categories.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _injectCategoriesStyles();
        _renderTree();
      });
  }

  function _injectCategoriesStyles() {
    if (document.getElementById('categories-layout-style')) return;
    var style = document.createElement('style');
    style.id = 'categories-layout-style';
    style.textContent = [
      '@media(min-width:769px){#btn-mobile-open-tree,#btn-mobile-close-tree{display:none !important;}}',
      '@media(max-width:768px){#btn-mobile-open-tree,#btn-mobile-close-tree{display:block !important;}.categories-layout>.tree-column{display:none;}.categories-layout.show-tree>.tree-column{display:flex !important;position:absolute;z-index:10;background: var(--color-surface);width:100%;height:100%;border-right:none;}}',
      '.categories-layout .tab-item{padding:10px 20px;cursor:pointer;color:var(--color-text-secondary);border-bottom:2px solid transparent;font-weight:600;font-size:14px;transition:all 0.2s;}',
      '.categories-layout .tab-item:hover{color:var(--color-primary);background:var(--color-primary-light);}',
      '.categories-layout .tab-item.active{color:var(--color-primary);border-bottom:2px solid var(--color-primary);background: var(--color-surface);}',
      '.categories-layout .tab-pane{display:none;}',
      '.categories-layout .tab-pane.active{display:block;animation:fadeIn 0.3s ease;}',
      '.categories-layout .row-selected{background:var(--color-bg) !important;position:relative;}',
      '.categories-layout .row-selected td{border-bottom:1px solid var(--color-primary) !important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    if (typeof UIActionToolbar !== 'undefined') {
      var toolbar = UIActionToolbar.create({
        onAdd: true, onEdit: true, onDelete: true, onFilter: true, onPrint: true, onClose: true,
        extras: []
      });
      globalActions.appendChild(toolbar);

      // Attach events to standard toolbar buttons
      var addBtn = globalActions.querySelector('.btn-tool-add');
      if (addBtn) addBtn.onclick = function() { CategoriesPage.add(); };
      
      var editBtn = globalActions.querySelector('.btn-tool-edit');
      if (editBtn) editBtn.onclick = function() { CategoriesPage.edit(); };
      
      var deleteBtn = globalActions.querySelector('.btn-tool-delete');
      if (deleteBtn) deleteBtn.onclick = function() { CategoriesPage.remove(); };
      
      var filterBtn = globalActions.querySelector('.btn-tool-filter');
      if (filterBtn) filterBtn.onclick = function() { UIToast.show('Mở form Lọc chi tiết'); };
      
      var printBtn = globalActions.querySelector('.btn-tool-print');
      if (printBtn) printBtn.onclick = function() { UIToast.show('In dữ liệu danh mục hiện hành'); };
      
      var closeBtn = globalActions.querySelector('.btn-tool-close');
      if (closeBtn) closeBtn.onclick = function() { window.location.hash='#/dashboard'; };
    }
  }

  // --- TREE VIEW ---
  function _renderTree() {
    var $treeContainer = document.getElementById('categories-tree-container');
    $treeContainer.innerHTML = '';
    $treeContainer.appendChild(_buildTreeRecursive(treeData));
    
    // Auto select first leaf node for convenience
    // setTimeout(() => { document.querySelector('.ui-tree-node[data-id="time_solar"]').click(); }, 100);
  }

  function _buildTreeRecursive(nodes) {
    var ul = document.createElement('ul');
    ul.className = 'ui-tree';

    nodes.forEach(function(node) {
      var li = document.createElement('li');
      var html = `
        <div class="ui-tree-node" data-id="${node.id}">
        <div class="ui-tree-toggle ${node.children ? '' : 'empty'}">
          ${node.children ? UIIcon.createHTML(node.expanded ? 'arrow_drop_down' : 'arrow_right') : ''}
        </div>
        ${UIIcon.createHTML(node.icon || 'folder', node.children ? 'color:var(--color-warning);' : 'color:var(--color-primary);', 'ui-tree-icon')}
        <span class="ui-tree-label">${node.text}</span>
        </div>
      `;
      li.innerHTML = html;

      if (node.children && node.children.length > 0) {
        var childrenUl = _buildTreeRecursive(node.children);
        if (node.expanded) childrenUl.classList.add('open');
        li.appendChild(childrenUl);

        var toggleBtn = li.querySelector('.ui-tree-toggle');
        toggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          node.expanded = !node.expanded;
          toggleBtn.querySelector('span').innerText = node.expanded ? 'arrow_drop_down' : 'arrow_right';
          if (node.expanded) childrenUl.classList.add('open');
          else childrenUl.classList.remove('open');
        });
      }

      var nodeEl = li.querySelector('.ui-tree-node');
      nodeEl.addEventListener('click', function() {
        document.querySelectorAll('.ui-tree-node').forEach(el => { el.style.fontWeight = '400'; el.style.color = 'var(--color-text)'; el.style.background = 'transparent'; });
        nodeEl.style.fontWeight = '600';
        nodeEl.style.color = '#fff';
        nodeEl.style.background = 'var(--color-primary)';
        nodeEl.style.borderRadius = '4px';
        
        _loadCategoryData(node);
        document.querySelector('.categories-layout').classList.remove('show-tree');
      });

      ul.appendChild(li);
    });

    return ul;
  }

  // --- ROUTING LOGIC TỚI MODULES ---
  function _loadCategoryData(node) {
    currentNode = node;
    selectedRowId = null; 
    document.getElementById('current-category-title').innerText = node.text;
    var $content = document.getElementById('category-content-container');

    // Nút Cha (Chứa con)
    if(node.children && node.children.length > 0) {
      $content.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--color-text-secondary);">Thư mục góc. Vui lòng sổ mũi tên để chọn các danh mục con.</div>`;
      return;
    }

    if (node.id === 'time_solar') {
      TimeSolarModule.render(node, $content);
    } else if (node.id.startsWith('goods_')) {
      GoodsModule.render(node, $content);
    } else {
      SimpleModule.render(node, $content);
    }
  }

  function selectRow(tr, id) {
    var allRows = tr.parentElement.querySelectorAll('tr');
    allRows.forEach(r => { r.classList.remove('row-selected'); r.style.background = ''; });
    
    tr.style.background = 'var(--color-bg)';
    tr.classList.add('row-selected');
    selectedRowId = id;

    if (currentNode && currentNode.id.startsWith('goods_')) {
       GoodsModule.onSelectRow(id);
    }
  }

  function switchTab(btn, targetId) {
    var tabs = btn.parentElement.querySelectorAll('.tab-item');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    var panes = btn.parentElement.parentElement.querySelectorAll('.tab-pane');
    panes.forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
    
    var target = document.getElementById(targetId);
    if(target) {
      target.style.display = 'block';
      setTimeout(()=> target.classList.add('active'), 10);
    }
  }

  function triggerModuleAction(actionName) {
    if(currentNode && currentNode.id === 'time_solar' && actionName === 'generate') {
      TimeSolarModule.generate();
    }
  }

  // --- CRUD ACTIONS ---
  function add() {
    if (!currentNode || (currentNode.children && currentNode.children.length > 0)) {
      UIToast.show('Vui lòng chọn cụ thể 1 danh mục lẻ ở cây bên trái', 'warning');
      return;
    }

    var html = '';
    var saveCustom = null;

    if (currentNode.id.startsWith('goods_')) {
      html = `
        <div class="form-group mb-3">
          <label>Nhóm Hàng Hoá</label>
          <input type="text" class="form-control bg-light" value="${currentNode.text}" readonly>
        </div>
        <div class="form-group mb-3">
          <label>Tên hàng (Có dấu) <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="modal-tenkh" placeholder="VD: Gà tiềm thảo mộc" onkeyup="CategoriesPage.updateSlug(this.value)">
        </div>
        <div class="form-group mb-3">
          <label>Tên không dấu (Auto mapping)</label>
          <input type="text" class="form-control bg-light" id="modal-tenkhongdau" readonly>
        </div>
        <div class="form-row d-flex gap-3">
           <div class="flex-1">
             <label>Đơn vị tính</label>
             <select class="form-control"><option>Phần</option><option>Bàn</option><option>Khách</option><option>Lon</option><option>Chai</option></select>
           </div>
           <div class="flex-1">
             <label>Giá áp dụng (VNĐ)</label>
             <input type="number" class="form-control" value="0">
           </div>
        </div>
        <div class="mt-3" style="font-size: 13px; color: var(--color-warning);">
          ${UIIcon.createHTML('info', 'font-size: 16px; width: 16px; vertical-align: text-bottom;')} Định lượng NVL thiết lập trong mục Sửa sau.
        </div>
      `;
    } else if (currentNode.id === 'time_solar') {
      UIToast.show('Dùng nút [Sinh danh sách ngày] phía trên thay vì nút Thêm', 'info');
      return;
    } else {
      var nextId = `${currentNode.id.toUpperCase()}_011`;
      html = `
        <div class="form-group mb-3">
          <label>Mã Danh Mục <span class="text-danger">*</span></label>
          <input type="text" class="form-control" value="${nextId}">
        </div>
        <div class="form-group mb-3">
          <label>Tên hiển thị <span class="text-danger">*</span></label>
          <input type="text" class="form-control" placeholder="Nhập tên...">
        </div>
        <div class="form-group mb-2">
           <label class="custom-checkbox">
             <input type="checkbox" class="ui-checkbox" checked>
             <span class="checkmark"></span>
             Kích hoạt sử dụng
           </label>
        </div>
      `;
    }

    if(html) {
      Modal.show({
        title: 'Thêm mới dòng - ' + currentNode.text,
        content: html,
        width: '500px',
        onConfirm: function(modalEl) {
           UIToast.show('Thêm mới bản ghi vào danh mục thành công!', 'success');
           if(saveCustom) saveCustom(modalEl);
           return true; 
        }
      });
    }
  }

  function edit() {
    if (!selectedRowId) {
      ConfirmModal.show({ title: 'Chưa chọn dòng', message: 'Vui lòng chọn bấm chuột vào 1 dòng lưới phía dưới để tiến hành hiệu chỉnh!' });
      return;
    }
    
    // Giả lập form Edit là gọi lại hàm Add nhưng nhồi Data vào
    add();
    setTimeout(() => {
      var modalTitle = document.querySelector('.modal-title');
      if(modalTitle) modalTitle.innerText = 'Cập nhật dòng: ' + selectedRowId;
    }, 100);
  }

  function remove() {
    if (!selectedRowId) {
      ConfirmModal.show({ title: 'Xoá lỗi', message: 'Bạn chưa chọc mục nào trên Grid.' });
      return;
    }
    ConfirmModal.show({ 
      title: 'Khẳng định Xóa dữ liệu', 
      message: `Thao tác này sẽ xoá bản ghi với ID: <b>${selectedRowId}</b>. Các phiếu liên quan có thể sẽ mất refer. Bạn có chắn chắn?`,
      onConfirm: function() { 
        UIToast.show('Đã xoá ID: ' + selectedRowId, 'success'); 
        selectedRowId = null;
      }
    });
  }

  function updateSlug(val) {
     document.getElementById('modal-tenkhongdau').value = toUnsigned(val).replace(/\\s+/g, ' ').trim().toLowerCase();
  }

  return {
    render: render,
    selectRow: selectRow,
    switchTab: switchTab,
    triggerModuleAction: triggerModuleAction,
    updateSlug: updateSlug,
    add: add,
    edit: edit,
    remove: remove
  };
})();
