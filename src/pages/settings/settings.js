/**
 * Màn hình Thiết lập Hệ thống (Settings)
 * HTML Template: src/pages/settings.html
 */
var SettingsPage = (function () {

  function render($container) {
    fetch('./src/pages/settings/settings.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _mountTabs();
      });
  }

  function _mountTabs() {
    var tabsContainer = document.getElementById('settings-tabs-container');
    if (!tabsContainer) return;

    var tabs = UITabs.create([
      { title: 'Thông tin Công ty', icon: 'business', content: _buildCompanyInfoTab() },
      { title: 'Kỳ Kế Toán', icon: 'calendar_month', content: _buildPeriodTab() },
      { title: 'Bảo mật & Dữ liệu', icon: 'security', content: _buildSecurityTab() }
    ]);

    tabsContainer.appendChild(tabs);
    setTimeout(_attachFileUploadLogic, 100);
  }

  function _buildCompanyInfoTab() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<div class="p-4"><div style="font-size:var(--font-size-lg); font-weight:600; margin-bottom:24px;">Thông tin Công ty / Hệ thống</div><div class="row g-4"><div class="col-md-6"><div class="form-group mb-4"><label>Tên Công ty</label><input type="text" class="ui-input w-100" value="CÔNG TY QUẢN LÝ NHÂN SỰ" placeholder="Nhập tên doanh nghiệp..."></div><div class="form-group mb-4"><label>Địa chỉ</label><input type="text" class="ui-input w-100" value="123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM" placeholder="Địa chỉ cơ sở..."></div><div class="row g-3 mb-4"><div class="col-6"><div class="form-group"><label>Số điện thoại</label><input type="text" class="ui-input w-100" value="0909.123.456"></div></div><div class="col-6"><div class="form-group"><label>Quỹ tiền mặt ban đầu</label><input type="text" class="ui-input w-100 text-end" value="500,000,000"></div></div></div></div><div class="col-md-6"><div class="form-group mb-4"><label>Logo Doanh Nghiệp (Dùng trên Phiếu/Hợp đồng)</label><div id="logo-upload-wrapper"></div><small style="color:var(--color-text-secondary); display:block; margin-top:8px;">Hệ thống sẽ lưu file thành logo.jpg trong thư mục mặc định.</small></div><div class="p-3" style="background: var(--color-background); border:1px dashed var(--color-border-strong); border-radius:8px;"><div class="fw-semibold mb-2">Ghi chú hệ thống</div><ul style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin:0; padding-left:16px; line-height:1.6;"><li>Thông tin liên hệ này sẽ được in trực tiếp lên các biểu mẫu Hợp đồng & Phiếu thu.</li><li>Logo nên dùng ảnh PNG nền trong suốt, kích thước 400x400px.</li></ul></div></div></div><div class="d-flex gap-2 pt-3 mt-4" style="border-top:1px solid var(--color-border);">' + UIButton.createHTML({ text: 'Cập Nhật Thông Tin', type: 'primary', onClick: "UIToast.show('Đã lưu thông tin doanh nghiệp.')" }) + '</div></div>';

    var uploadNode = UIFileUpload.create({
      accept: 'image/jpeg, image/png',
      onFileSelect: function(file) {
        if (window.UIToast) UIToast.show('Đang tải lên logo...', 'info');
        var reader = new FileReader();
        reader.onload = function(e) {
          var base64Data = e.target.result;
          fetch(API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.UPLOAD_LOGO_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: 'logo.jpg', base64: base64Data })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.success) {
              if (window.UIToast) UIToast.show('Đã cập nhật Logo thành công!', 'success');
            } else {
              if (window.UIToast) UIToast.show('Lỗi: ' + data.message, 'danger');
            }
          })
          .catch(function(err) {
            console.error(err);
            if (window.UIToast) UIToast.show('Không thể kết nối máy chủ Document', 'danger');
          });
        };
        reader.readAsDataURL(file);
      }
    });
    wrapper.querySelector('#logo-upload-wrapper').appendChild(uploadNode);
    return wrapper;
  }

  function _attachFileUploadLogic() {}

  function _buildPeriodTab() {
    var wrapper = document.createElement('div');
    var monthsHtml = '';
    var lockedPeriods = window.PeriodManager ? window.PeriodManager.getLockedPeriods() : {};
    var currentYear = '2026'; 

    for (var i = 1; i <= 12; i++) {
      var key = i + '/' + currentYear;
      var isLocked = lockedPeriods[key] === true;
      var statusHtml = isLocked ? UIBadge.createHTML('Đã Khóa', 'warning', '', 'status-badge') : UIBadge.createHTML('Đang Mở', 'success', '', 'status-badge');
      var checked = isLocked ? 'checked' : '';
      monthsHtml += '<tr><td>Tháng ' + (i < 10 ? '0' : '') + i + '/' + currentYear + '</td><td>Quý ' + Math.ceil(i/3) + '</td><td class="status-cell">' + statusHtml + '</td><td class="text-end"><label class="ui-checkbox-container" style="display:inline-flex;width:auto;margin:0;"><input type="checkbox" class="chk-lock-period" data-month="'+i+'" data-year="'+currentYear+'" ' + checked + '><span class="checkmark"></span> Khóa dữ liệu</label></td></tr>';
    }

    wrapper.innerHTML = '<div class="p-4"><div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"><div style="font-size:var(--font-size-lg); font-weight:600;">Quản lý Năm Sử Dụng & Kỳ Kế Toán</div><div class="d-flex gap-2 flex-wrap">' + UIButton.createHTML({ text: 'Chuyển tới Kỳ Khác', type: 'secondary', onClick: "ConfirmModal.show({title:'Chuyển Kỳ',message:'Chuyển đổi dữ liệu sang kỳ làm việc khác?'})" }) + UIButton.createHTML({ text: 'Tạo Mới Năm 2027', icon: 'add', type: 'primary', iconStyle: 'font-size:18px;margin-right:6px', onClick: "UIToast.show('Đã sinh thành công dữ liệu cho Năm 2027.')" }) + '</div></div><div class="row g-4"><div class="col-md-3"><label class="fw-semibold d-block mb-2">Năm Làm Việc</label><ul style="list-style:none;padding:0;margin:0;" class="d-flex flex-column gap-2"><li class="year-item active" onclick="SettingsPage.selectYear(this,\'2026\')">Năm 2026 (Hiện tại)</li><li class="year-item" onclick="SettingsPage.selectYear(this,\'2025\')">Năm 2025</li><li class="year-item" onclick="SettingsPage.selectYear(this,\'2024\')">Năm 2024</li></ul></div><div class="col-md-9"><div class="d-flex justify-content-between flex-wrap gap-2 align-items-center mb-3"><span class="fw-semibold" id="period-header-year">Tháng / Kỳ trong năm 2026</span>' + UIBadge.createHTML('Kỳ hiện hành: T10/2026', 'success', '', 'status-badge') + '</div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Kỳ (Tháng)</th><th>Phân Quý</th><th>Trạng Thái</th><th class="text-end">Khóa / Mở Kỳ</th></tr></thead><tbody>' + monthsHtml + '</tbody></table></div></div></div></div>';

    wrapper.addEventListener('change', function(e) {
      if (e.target.classList.contains('chk-lock-period')) {
         var isChecked = e.target.checked;
         var m = e.target.getAttribute('data-month');
         var y = e.target.getAttribute('data-year');
         if (window.PeriodManager) {
           window.PeriodManager.setLockedPeriod(m, y, isChecked);
           var tr = e.target.closest('tr');
           var cell = tr.querySelector('.status-cell');
           if (cell) {
             cell.innerHTML = isChecked ? UIBadge.createHTML('Đã Khóa', 'warning', '', 'status-badge') : UIBadge.createHTML('Đang Mở', 'success', '', 'status-badge');
           }
           if (window.UIToast) UIToast.show((isChecked ? 'Đã khóa' : 'Đã mở khóa') + ' dữ liệu tháng ' + m + '/' + y, isChecked ? 'warning' : 'success');
         }
      }
    });

    // Inject year-item style
    if (!document.getElementById('year-item-style')) {
      var style = document.createElement('style');
      style.id = 'year-item-style';
      style.textContent = '.year-item{padding:10px 16px;background: var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);border-radius:6px;cursor:pointer;transition:all 0.2s;}.year-item:hover{border-color:var(--color-primary);}.year-item.active{background: var(--color-background);border:1px solid var(--color-primary);color:var(--color-primary);font-weight:600;}';
      document.head.appendChild(style);
    }
    return wrapper;
  }

  function _buildSecurityTab() {
    var wrapper = document.createElement('div');
    var container = document.createElement('div');
    container.className = 'p-4';
    
    var row = document.createElement('div');
    row.className = 'row g-5';

    // --- Cột trái: Đổi mật khẩu ---
    var colLeft = document.createElement('div');
    colLeft.className = 'col-md-6';

    var title = document.createElement('div');
    title.style.cssText = 'font-size:var(--font-size-lg); font-weight:600; margin-bottom:24px;';
    title.textContent = 'Đổi Mật Khẩu (Admin)';
    colLeft.appendChild(title);

    var pw1 = UIInput.createPassword({ label: 'Mật khẩu hiện tại', placeholder: '***' });
    pw1.classList.add('mb-3');
    colLeft.appendChild(pw1);

    var pw2 = UIInput.createPassword({ label: 'Mật khẩu mới', placeholder: '***' });
    pw2.classList.add('mb-3');
    colLeft.appendChild(pw2);

    var pw3 = UIInput.createPassword({ label: 'Nhập lại mật khẩu mới', placeholder: '***' });
    pw3.classList.add('mb-4');
    colLeft.appendChild(pw3);

    var saveBtn = document.createElement('div');
    saveBtn.innerHTML = UIButton.createHTML({ text: 'Lưu Thay Đổi', type: 'primary', onClick: "UIToast.show('Đã cập nhật mật khẩu mới thành công.')" });
    colLeft.appendChild(saveBtn.firstElementChild);

    row.appendChild(colLeft);

    // --- Cột phải: Sao lưu ---
    var colRight = document.createElement('div');
    colRight.className = 'col-md-6';
    colRight.style.cssText = 'border-left:1px solid var(--color-border); padding-left:32px;';
    colRight.innerHTML = '<div class="d-flex align-items-center gap-2 mb-3" style="font-size:var(--font-size-lg); font-weight:600;">' + UIIcon.createHTML('cloud_download', 'color:var(--color-primary)') + 'Sao lưu dữ liệu hệ thống</div><p style="font-size:14px; color:var(--color-text-secondary); margin-bottom:24px; line-height:1.5;">Hệ thống sẽ nén toàn bộ CSDL hiện tại thành file .bak hoặc .sql để tải xuống.<br>Tên file được tạo theo mã hệ thống và thời điểm sao lưu.</p>' + UIButton.createHTML({ text: 'Tải file sao lưu ngay', icon: 'save', type: 'secondary', className: 'w-100 d-flex justify-content-center gap-2', onClick: "Alert.success('Backup thành công!')" });
    row.appendChild(colRight);

    container.appendChild(row);
    wrapper.appendChild(container);
    return wrapper;
  }

  return {
    render: render,
    selectYear: function(el, year) {
      if (!el) return;
      var items = el.parentElement.querySelectorAll('.year-item');
      items.forEach(function(item) { item.classList.remove('active'); });
      el.classList.add('active');
      UIToast.show('Đã chuyển sang xem Kỳ Kế Toán Năm ' + year);
      var headerText = document.getElementById('period-header-year');
      if (headerText) headerText.innerText = 'Tháng / Kỳ trong năm ' + year;
    }
  };
})();
