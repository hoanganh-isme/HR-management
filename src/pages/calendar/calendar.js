/**
 * Màn hình Xem Lịch Tiệc Trong Tháng (Calendar)
 * HTML Template: src/pages/calendar/calendar.html
 */
var CalendarPage = (function () {
  var $container;
  var uiCalendarInstance;
  // Khôi phục tháng/năm đã xem lần trước từ sessionStorage (nếu có)
  var _savedState = (function () {
    try { return JSON.parse(sessionStorage.getItem('calendarState') || 'null'); } catch (e) { return null; }
  })();
  var currentYear = (_savedState && _savedState.year) ? _savedState.year : new Date().getFullYear();
  var currentMonth = (_savedState && _savedState.month != null) ? _savedState.month : new Date().getMonth();

  function _saveState() {
    try { sessionStorage.setItem('calendarState', JSON.stringify({ year: currentYear, month: currentMonth })); } catch (e) { }
  }

  function invalidateCache() {
    CalendarService.invalidateCache();
  }

  function _loadEvents(forceRefresh = false) {
    CalendarService.fetchEvents(currentYear, currentMonth, forceRefresh)
      .then(function (eventsData) {
        if (uiCalendarInstance) {
          uiCalendarInstance.updateEvents(eventsData);
        }
      })
      .catch(function (err) {
        console.error('Lỗi khi tải lịch từ Service:', err);
      });
  }

  // Tự động làm mới UI trang Lịch nếu nghe thấy có người sửa/tạo Tiệc mới
  if (typeof EventBus !== 'undefined') {
    EventBus.on('BANQUET_MUTATED', function () {
      console.info('[CalendarPage] BANQUET_MUTATED — làm mới lịch.');
      _loadEvents(true); // Buộc tải lại lịch từ API (lúc này service đã tự xóa cache)
    });
  }

  function renderLegend() {
    var container = document.getElementById('calendar-legend-container');
    if (!container) return;

    CalendarService.getLegend().then(function (config) {
      if (!config || config.length === 0) {
        return; // Không có dữ liệu từ API thì không render
      }
      container.innerHTML = '';
      config.forEach(function (item) {
        var type = item.Type || item.type;
        var color = item.Color || item.color;
        var label = item.Label || item.label;
        var icon = item.Icon || item.icon;

        // Xác định route điều hướng khi click
        var route = null;
        if (color === 'success') route = '#/booking';
        else if (color === 'danger') route = '#/contract';
        else if (color === 'secondary') route = '#/contract';

        var chip = document.createElement('div');
        chip.className = 'd-flex align-items-center gap-1 px-2 animate-pop';
        chip.style.height = '28px';
        chip.style.borderRadius = '20px';
        chip.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        chip.style.userSelect = 'none';
        chip.style.flexShrink = '0';
        chip.style.whiteSpace = 'nowrap';

        if (route) {
          chip.style.cursor = 'pointer';
          chip.title = 'Nhấn để chuyển đến danh sách';
          chip.addEventListener('click', function () {
            window.location.hash = route;
          });
          chip.addEventListener('mouseenter', function () {
            chip.style.transform = 'translateY(-1px)';
            chip.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
            chip.style.filter = 'brightness(0.97)';
          });
          chip.addEventListener('mouseleave', function () {
            chip.style.transform = 'translateY(0)';
            chip.style.boxShadow = 'none';
            chip.style.filter = 'none';
          });
          chip.addEventListener('mousedown', function () {
            chip.style.transform = 'translateY(1px)';
            chip.style.boxShadow = 'none';
          });
          chip.addEventListener('mouseup', function () {
            chip.style.transform = 'translateY(-1px)';
          });
        }

        if (type === 'dot') {
          var bgMap = { 'success': 'rgba(16, 185, 129, 0.1)', 'danger': 'rgba(239, 68, 68, 0.1)' };
          var borderMap = { 'success': 'rgba(16, 185, 129, 0.25)', 'danger': 'rgba(239, 68, 68, 0.25)' };
          chip.style.background = bgMap[color] || 'var(--color-bg-subtle)';
          chip.style.border = '1px solid ' + (borderMap[color] || 'var(--color-border)');
          chip.style.color = 'var(--color-' + color + ')';
          chip.style.fontWeight = '600';

          var dot = document.createElement('div');
          dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:var(--color-' + color + ');box-shadow:0 0 0 2px ' + (borderMap[color] || 'var(--color-border)') + '; transition: transform 0.2s ease;';
          chip.appendChild(dot);

          if (route) {
            chip.addEventListener('mouseenter', function () { dot.style.transform = 'scale(1.2)'; });
            chip.addEventListener('mouseleave', function () { dot.style.transform = 'scale(1)'; });
          }
        } else {
          chip.style.background = 'var(--color-surface)';
          chip.style.border = '1px solid var(--color-border-strong)';
          chip.style.color = 'var(--color-text-secondary)';
          chip.style.fontWeight = '600';

          var ico = document.createElement('span');
          ico.className = 'material-symbols-outlined';
          ico.style.cssText = 'font-size:15px;margin-right:-2px; transition: transform 0.2s ease;';
          ico.innerText = icon;
          chip.appendChild(ico);

          if (route) {
            chip.addEventListener('mouseenter', function () { ico.style.transform = 'scale(1.1) rotate(-5deg)'; });
            chip.addEventListener('mouseleave', function () { ico.style.transform = 'scale(1) rotate(0)'; });
          }
        }

        var txt = document.createElement('span');
        txt.style.letterSpacing = '0.3px';
        txt.innerText = label;
        chip.appendChild(txt);
        container.appendChild(chip);
      });
    });
  }

  function render(containerElement) {
    $container = containerElement;

    fetch('./src/pages/calendar/calendar.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        renderLegend();
        var calendarContainer = $container.querySelector('#calendar-component-container');
        if (calendarContainer) {
          var _monthSummary = {};
          uiCalendarInstance = UICalendar.create({
            year: currentYear,
            month: currentMonth,
            events: {},
            monthSummary: _monthSummary,
            onLoadYearSummary: function(year) {
              return CalendarService.getYearlySummary(year).then(function(s) {
                _monthSummary[year] = s;
                return s;
              });
            },
            onChangeMonth: function (y, m) {
              currentYear = y;
              currentMonth = m;
              _saveState();
              _loadEvents();
            },
            onSelect: function (dateStr, evts) {
              var displayDate = dateStr.split('-').reverse().join('/');
              if (evts && evts.length > 0) {
                var evtsBySanh = {};
                evts.forEach(function (e) {
                  var sanh = e.rawData.TenSanh || 'Chưa chọn sảnh';
                  if (!evtsBySanh[sanh]) evtsBySanh[sanh] = [];
                  evtsBySanh[sanh].push(e);
                });

                var contentStr = '<div class="calendar-modal-content d-flex flex-column gap-4" style="padding: 8px;">';

                Object.keys(evtsBySanh).forEach(function (sanh) {
                  contentStr += `
                      <div class="sanh-group">
                        <div class="d-flex align-items-center gap-2 mb-3">
                          ${UIIcon.createHTML('storefront', 'color: var(--color-primary); font-size: 22px;')}
                          <h6 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.5px;">SẢNH: ${sanh}</h6>
                        </div>
                        <div class="row g-3">
                    `;

                  evtsBySanh[sanh].forEach(function (e, idx) {
                    var rd = e.rawData;
                    var lp = rd.LoaiPhieu !== undefined ? rd.LoaiPhieu : rd.loaiPhieu;
                    var laSanhChinh = rd.LaSanhChinh !== undefined ? rd.LaSanhChinh : rd.laSanhChinh;
                    var soBan = rd.SoBan !== undefined ? rd.SoBan : rd.soBan;
                    var maChungTu = rd.MaChungTu || rd.maChungTu || '';
                    var tenKhachHang = rd.TenKhachHang || rd.tenKhachHang || '';

                    var typeName = lp == 1 ? 'Mới Cọc' : 'Đã Ký HĐ';
                    var statusColor = lp == 1 ? 'var(--color-success)' : 'var(--color-danger)';
                    var bgSoft = lp == 1 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(220, 38, 38, 0.08)';
                    var btnClass = lp == 1 ? 'btn-outline-success' : 'btn-outline-danger';
                    var hashRoute = lp == 1 ? '#/booking' : '#/contract';

                    contentStr += `
                          <div class="col-12 col-md-6 col-lg-4">
                            <div class="card h-100 position-relative" style="border: 1px solid var(--color-border); border-radius: var(--radius-md); transition: all 0.3s ease; background: var(--color-surface); overflow: hidden;">
                              <!-- Accent Top Bar -->
                              <div style="height: 4px; width: 100%; background: ${statusColor};"></div>
                              
                              <div class="card-body p-3 d-flex flex-column gap-3">
                                <div class="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div style="font-weight: 700; font-size: 15px; color: var(--color-text); margin-bottom: 4px;">
                                      ${tenKhachHang}
                                    </div>
                                    <span style="display: inline-flex; padding: 4px 10px; border-radius: 6px; background: ${bgSoft}; color: ${statusColor}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                                      ${typeName}
                                    </span>
                                  </div>
                                  <div style="background: ${statusColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
                                    ${idx + 1}
                                  </div>
                                </div>
                                
                                <div style="font-size: 13px; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
                                  <div class="d-flex align-items-center gap-2">
                                    ${UIIcon.createHTML('table_restaurant', 'font-size: 16px; opacity: 0.7;')}
                                    <span>${laSanhChinh === 1 ? soBan + ' Bàn (Sảnh Chính)' : 'Sảnh Phụ / Ghép'}</span>
                                  </div>
                                  <div class="d-flex align-items-center gap-2">
                                    ${UIIcon.createHTML('receipt_long', 'font-size: 16px; opacity: 0.7;')}
                                    <span>Mã: <strong>${maChungTu}</strong></span>
                                  </div>
                                </div>
                                
                                ${UIButton.createHTML({ text: 'Chi Tiết', icon: 'arrow_forward', type: btnClass.replace('btn-outline-', 'outline-'), className: 'w-100 d-flex justify-content-center align-items-center gap-2', style: 'padding: 6px 12px; font-weight: 600; font-size: 13px; border-radius: var(--radius-sm);', iconStyle: 'font-size: 18px;', onClick: `window.location.hash = '${hashRoute}?id=${maChungTu}'; document.querySelector('.btn-close-modal').click();` })}
                              </div>
                            </div>
                          </div>
                        `;
                  });

                  contentStr += `
                        </div>
                      </div>
                    `;
                });

                // Thêm nút bấm lập thêm hợp đồng cho ngày này ở chân modal
                contentStr += `
                    <div class="d-flex justify-content-end mt-3 pt-3" style="border-top: 1px solid var(--color-border); width: 100%;">
                      ${UIButton.createHTML({ text: 'Lập Thêm Hợp Đồng Ngày Này', icon: 'add', type: 'primary', className: 'd-flex align-items-center gap-2 rounded-pill px-4', iconStyle: 'font-size: 20px;', onClick: `document.querySelector('.btn-close-modal').click(); setTimeout(function(){ window.showCreateBanquetModal('${dateStr}'); }, 150);` })}
                    </div>
                  `;
                contentStr += '</div>';

                UIModal.show({
                  title: 'Chi Tiết Lịch Tiệc - ' + displayDate,
                  width: '1000px', // Thu bé lại cho gọn gàng
                  content: contentStr
                });
              } else {
                window.showCreateBanquetModal(dateStr);
              }
            }
          });
          calendarContainer.appendChild(uiCalendarInstance);

          _loadEvents(); // Gọi API ngay lần đầu render
          // Preload năm hiện tại để dots hiển thị ngay
          CalendarService.getYearlySummary(currentYear).then(function(s) {
            _monthSummary[currentYear] = s;
          });
        }
      });
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    if (typeof UIActionToolbar !== 'undefined') {
      globalActions.appendChild(UIActionToolbar.create({
        onAdd: function() { window.showCreateBanquetModal(); },
        onEdit: false, onDelete: false, onFilter: false, onPrint: false, onClose: false
      }));
    }
  }

  return { render: render };
})();

// Hàm Mở Modal Tạo Tiệc Mới (Thay thế cho Mock cũ)
window.showCreateBanquetModal = function (prefillDate) {
  var contentHtml = `
    <form id="form-create-banquet">
      <div class="row g-4 p-2">
        <!-- Phân loại hình thức -->
        <div class="col-12">
          <h6 class="fw-bold mb-3" style="color: var(--color-primary); border-bottom: 2px solid var(--color-border); padding-bottom: 8px;">0. Phân loại hình thức</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Loại Tiệc <span style="color:var(--color-danger)">*</span></label>
              <select class="ui-input w-100" name="Loaihinhtiecid" id="modal-sel-loaitiec" required style="font-weight: 600; color: var(--color-primary); border-color: var(--color-primary);">
                <option value="">-- Đang tải... --</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Khách Hàng -->
        <div class="col-12">
          <h6 class="fw-bold mb-3" style="color: var(--color-primary); border-bottom: 2px solid var(--color-border); padding-bottom: 8px;">1. Thông tin Khách hàng</h6>
          <div class="row g-3">
            <div class="col-md-3" id="col-ten-chure">
              <label class="form-label" id="lbl-ten-chure" style="font-size: 13px; font-weight: 600;">Tên Chú Rể <span style="color:var(--color-danger)">*</span></label>
              <input type="text" class="ui-input w-100" name="Tenchure" id="inp-ten-chure" placeholder="Nhập tên chú rể" required>
            </div>
            <div class="col-md-3" id="col-dt-chure">
              <label class="form-label" id="lbl-dt-chure" style="font-size: 13px; font-weight: 600;">ĐT Chú Rể</label>
              <input type="text" class="ui-input w-100" name="DTchure" id="inp-dt-chure" placeholder="SĐT chú rể">
            </div>
            <div class="col-md-3" id="col-ten-codau">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Tên Cô Dâu</label>
              <input type="text" class="ui-input w-100" name="Tencodau" id="inp-ten-codau" placeholder="Nhập tên cô dâu">
            </div>
            <div class="col-md-3" id="col-dt-codau">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">ĐT Cô Dâu</label>
              <input type="text" class="ui-input w-100" name="DTcodau" placeholder="SĐT cô dâu">
            </div>
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Địa chỉ</label>
              <input type="text" class="ui-input w-100" name="Diachi" placeholder="Địa chỉ khách hàng">
            </div>
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Người Đại Diện</label>
              <input type="text" class="ui-input w-100" name="Nguoigd" placeholder="Tên người đại diện">
            </div>
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">ĐT Người Đại Diện</label>
              <input type="text" class="ui-input w-100" name="DienThoaiDaiDien" placeholder="SĐT người đại diện">
            </div>
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Email</label>
              <input type="text" class="ui-input w-100" name="Mail" placeholder="Email nhận thông báo">
            </div>
          </div>
        </div>
        
        <!-- Thời gian & Không gian -->
        <div class="col-12">
          <h6 class="fw-bold mb-3" style="color: var(--color-primary); border-bottom: 2px solid var(--color-border); padding-bottom: 8px;">2. Thời gian & Địa điểm</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Ngày Tổ Chức</label>
              <input type="text" class="ui-input w-100" name="Ngaytochuc" id="modal-ngaytochuc" placeholder="Chọn ngày..." required>
            </div>
            <div class="col-md-4">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Ca Tiệc</label>
              <select class="ui-input w-100" name="Thoigianid" id="modal-sel-catiec" required>
                <option value="">-- Đang tải ca tiệc... --</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Sảnh Chính <span style="color:var(--color-danger)">*</span></label>
              <select class="ui-input w-100" name="Sanhtiecid" id="modal-sel-sanh" required>
                <option value="">-- Đang tải sảnh... --</option>
              </select>
            </div>
            <div class="col-12 mt-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Sảnh Phụ (Ghép sảnh)</label>
              <div id="modal-container-sanh-phu" class="d-flex flex-wrap gap-3 mt-1 p-3" style="border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface); min-height: 60px;">
                <span class="text-secondary" style="font-size: 12px; margin: auto;">Vui lòng chọn Sảnh Chính trước</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Số lượng & Thanh toán -->
        <div class="col-12">
          <h6 class="fw-bold mb-3" style="color: var(--color-primary); border-bottom: 2px solid var(--color-border); padding-bottom: 8px;">3. Quy mô & Tiền cọc</h6>
          <div class="row g-3">
            <!-- Cặp: Số Bàn Mặn + Dự Phòng Mặn -->
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600; display:block;">Bàn Mặn <span style="font-weight:400; color:var(--color-text-secondary);">(Chính + Dự phòng)</span></label>
              <div class="d-flex gap-2">
                <div style="flex:1">
                  <input type="number" class="ui-input w-100" name="SobanManchinhthuc" value="0" min="0" onfocus="this.select()" placeholder="Chính thức">
                  <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px; text-align:center;">Chính thức</div>
                </div>
                <div style="flex:1">
                  <input type="number" class="ui-input w-100" name="SobanManduphong" value="0" min="0" onfocus="this.select()" placeholder="Dự phòng">
                  <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px; text-align:center;">Dự phòng</div>
                </div>
              </div>
            </div>
            <!-- Cặp: Số Bàn Chay + Dự Phòng Chay -->
            <div class="col-md-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600; display:block;">Bàn Chay <span style="font-weight:400; color:var(--color-text-secondary);">(Chính + Dự phòng)</span></label>
              <div class="d-flex gap-2">
                <div style="flex:1">
                  <input type="number" class="ui-input w-100" name="SobanChaychinhthuc" value="0" min="0" onfocus="this.select()" placeholder="Chính thức">
                  <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px; text-align:center;">Chính thức</div>
                </div>
                <div style="flex:1">
                  <input type="number" class="ui-input w-100" name="SobanChayduphong" value="0" min="0" onfocus="this.select()" placeholder="Dự phòng">
                  <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px; text-align:center;">Dự phòng</div>
                </div>
              </div>
            </div>
            <!-- Tiền Cọc -->
            <div class="col-md-6">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Tiền Đặt Cọc <span style="color:var(--color-danger)">*</span></label>
              <input type="text" inputmode="numeric" class="ui-input w-100" id="inp-tiencoc-modal" name="Sotiencoccho" value="0" autocomplete="off" onfocus="this.select()" required>
              <div id="vn-tiencoc" style="font-size:11px; color:var(--color-success); margin-top:3px; min-height:16px; font-style:italic;"></div>
            </div>
            <div class="col-12 mt-3">
              <label class="form-label" style="font-size: 13px; font-weight: 600;">Ghi chú</label>
              <textarea class="ui-input w-100" name="Ghichu" rows="2" placeholder="Ghi chú thêm..."></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 mt-4 pt-3" style="border-top: 1px solid var(--color-border);">
        ${UIButton.createHTML({ text: 'Hủy Bỏ', type: 'outline', onClick: "document.querySelector('.btn-close-modal').click()" })}
        ${UIButton.createHTML({ text: 'Lưu Biên Nhận Cọc', icon: 'save', type: 'primary', className: 'd-flex align-items-center gap-2', iconStyle: 'font-size: 20px;', onClick: 'window.submitCreateBanquet(this)' })}
      </div>
    </form>
  `;

  // Dùng chung UIInput component
  function _initMoneyInput(inputId, displayId) {
    var inp = document.getElementById(inputId);
    var disp = document.getElementById(displayId);
    if (typeof UIInput !== 'undefined' && UIInput.setupMoneyInput) {
      UIInput.setupMoneyInput(inp, disp);
    }
  }

  window._createBanquetModal = UIModal.show({
    title: 'Đặt Cọc Lịch Tiệc Mới',
    width: '900px',
    content: contentHtml,
    onClose: function () { window._createBanquetModal = null; }
  });

  // Khởi tạo format tiền sau khi modal render
  setTimeout(function () {
    _initMoneyInput('inp-tiencoc-modal', 'vn-tiencoc');
  }, 50);

  // Khởi tạo Flatpickr cho ô Chọn Ngày (nếu thư viện đã load)
  if (typeof flatpickr !== 'undefined') {
    flatpickr("#modal-ngaytochuc", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      allowInput: true,
      defaultDate: prefillDate || null,
      minDate: prefillDate ? prefillDate : "today", // Cọc ngày trong quá khứ/tương lai linh hoạt
      disableMobile: true, // Ép buộc dùng giao diện đẹp của Flatpickr trên mọi thiết bị (kể cả máy tính có màn hình cảm ứng)
      locale: "vn"
    });
  }

  // Tải danh sách Sảnh từ SystemDataService
  if (typeof SystemDataService !== 'undefined') {
    SystemDataService.getHalls().then(function (records) {
      var selSanh = document.getElementById('modal-sel-sanh');
      if (selSanh && records.length > 0) {
        selSanh.innerHTML = '<option value="">-- Chọn Sảnh --</option>';
        records.forEach(function (h) {
          selSanh.innerHTML += '<option value="' + h.Sanhtiecid + '">' + h.Tensanhtiec + ' (Max: ' + (h.Succhua || 0) + ' bàn)</option>';
        });
        
        selSanh.addEventListener('change', function() {
            var sanhChinhId = this.value;
            var container = document.getElementById('modal-container-sanh-phu');
            if (!container) return;
            container.innerHTML = '';
            
            if (!sanhChinhId) {
              container.innerHTML = '<span class="text-secondary" style="font-size: 12px; margin: auto; font-style: italic;">Vui lòng chọn Sảnh Chính trước</span>';
              return;
            }
            
            var filtered = records.filter(function(r) { return r.Sanhtiecid !== sanhChinhId; });
            if (filtered.length === 0) {
              container.innerHTML = '<span class="text-secondary" style="font-size: 12px; margin: auto; font-style: italic;">Không có sảnh phụ nào khác</span>';
              return;
            }
            
            filtered.forEach(function(h) {
              container.innerHTML += `
              <label class="modern-checkbox-wrapper mb-0" style="font-size: 13px; background: white; padding: 8px 14px; border-radius: 8px; border: 1px solid var(--color-border); min-width: 160px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s;">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" class="modern-checkbox chk-sanh-phu-modal" value="${h.Sanhtiecid}">
                  <span style="font-weight: 600; color: var(--color-primary);">${h.Tensanhtiec}</span>
                </div>
                <div style="font-size: 11px; color: var(--color-text-secondary); margin-left: 26px; margin-top: 2px;">Max: ${h.Succhua || 0} bàn</div>
              </label>
              `;
            });
        });
      } else if (selSanh) {
        selSanh.innerHTML = '<option value="">-- Không có dữ liệu sảnh --</option>';
      }
    }).catch(function (e) {
      console.warn('Lỗi tải sảnh:', e);
      var selSanh = document.getElementById('modal-sel-sanh');
      if (selSanh) selSanh.innerHTML = '<option value="">-- Lỗi tải sảnh --</option>';
    });

    // Tải danh sách Ca Tiệc từ SystemDataService
    SystemDataService.getShifts().then(function (records) {
      var selCaTiec = document.getElementById('modal-sel-catiec');
      if (selCaTiec && records.length > 0) {
        selCaTiec.innerHTML = '<option value="">-- Chọn Ca Tiệc --</option>';
        records.forEach(function (c) {
          selCaTiec.innerHTML += '<option value="' + c.Thoigianid + '">' + (c.Thoigianid.includes('SANG') ? 'Buổi Sáng' : c.Thoigianid.includes('CHIEU') ? 'Buổi Chiều' : 'Cả Ngày') + ' (' + c.Thoigian + ')</option>';
        });
      } else if (selCaTiec) {
        selCaTiec.innerHTML = '<option value="">-- Không có dữ liệu ca tiệc --</option>';
      }
    }).catch(function (e) {
      console.warn('Lỗi tải ca tiệc:', e);
      var selCaTiec = document.getElementById('modal-sel-catiec');
      if (selCaTiec) selCaTiec.innerHTML = '<option value="">-- Lỗi tải ca tiệc --</option>';
    });

    // Tải danh sách Loại Hình Tiệc từ SystemDataService
    SystemDataService.getBanquetTypes().then(function (records) {
      var selLoaiTiec = document.getElementById('modal-sel-loaitiec');
      if (selLoaiTiec && records.length > 0) {
        selLoaiTiec.innerHTML = '<option value="">-- Chọn Loại Tiệc --</option>';
        records.forEach(function (t) {
          var isHoiNghiFlag = (String(t.isHoiNghi) === '1' || String(t.isHoiNghi).toLowerCase() === 'true') ? '1' : '0';
          var tenLoai = t.Tenloaihinhtiec || t.Tenloaitiec || t.Tenloaihinh || 'Không xác định';
          var idLoai = t.Loaihinhtiecid || t.Loaitiecid || '';
          selLoaiTiec.innerHTML += '<option value="' + idLoai + '" data-ishoinghi="' + isHoiNghiFlag + '">' + tenLoai + '</option>';
        });

        // Bắt sự kiện đổi loại tiệc để thay đổi giao diện Chú rể / Cô dâu
        selLoaiTiec.addEventListener('change', function () {
          var isHoiNghi = this.options[this.selectedIndex].getAttribute('data-ishoinghi') === '1';
          var isWedding = !isHoiNghi;

          var colCodau = document.getElementById('col-ten-codau');
          var colDtCodau = document.getElementById('col-dt-codau');
          var colChure = document.getElementById('col-ten-chure');
          var colDtChure = document.getElementById('col-dt-chure');
          var inpCodau = document.getElementById('inp-ten-codau');
          var lblChure = document.getElementById('lbl-ten-chure');
          var inpChure = document.getElementById('inp-ten-chure');
          var lblDtChure = document.getElementById('lbl-dt-chure');
          var inpDtChure = document.getElementById('inp-dt-chure');

          if (isWedding) {
            if (colCodau) colCodau.style.display = '';
            if (colDtCodau) colDtCodau.style.display = '';
            if (colChure) colChure.className = 'col-md-3';
            if (colDtChure) colDtChure.className = 'col-md-3';
            if (inpCodau) inpCodau.required = true;
            if (lblChure) lblChure.innerHTML = 'Tên Chú Rể <span style="color:var(--color-danger)">*</span>';
            if (inpChure) inpChure.placeholder = 'Nhập tên chú rể';
            if (lblDtChure) lblDtChure.innerText = 'ĐT Chú Rể';
            if (inpDtChure) inpDtChure.placeholder = 'SĐT chú rể';
          } else {
            if (colCodau) colCodau.style.display = 'none';
            if (colDtCodau) colDtCodau.style.display = 'none';
            if (colChure) colChure.className = 'col-md-6';
            if (colDtChure) colDtChure.className = 'col-md-6';
            if (inpCodau) {
              inpCodau.required = false;
              inpCodau.value = ''; // Xóa value khi ẩn đi
            }
            if (lblChure) lblChure.innerHTML = 'Tên KH / Đơn vị <span style="color:var(--color-danger)">*</span>';
            if (inpChure) inpChure.placeholder = 'Nhập tên khách hàng...';
            if (lblDtChure) lblDtChure.innerText = 'SĐT Khách Hàng';
            if (inpDtChure) inpDtChure.placeholder = 'SĐT khách hàng';
          }
        });
      } else if (selLoaiTiec) {
        selLoaiTiec.innerHTML = '<option value="">-- Không có dữ liệu --</option>';
      }
    }).catch(function (e) {
      var selLoaiTiec = document.getElementById('modal-sel-loaitiec');
      if (selLoaiTiec) selLoaiTiec.innerHTML = '<option value="">-- Lỗi tải loại tiệc --</option>';
    });
  }
};

window.submitCreateBanquet = function (btn) {
  var form = document.getElementById('form-create-banquet');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  var btnOriginalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';
  btn.disabled = true;

  var formData = new FormData(form);

  // Format payload cho API_Booking_Save (Biên nhận cọc chỗ)
  var payload = {
    Tenchure:           formData.get('Tenchure'),
    Tencodau:           formData.get('Tencodau'),
    DTchure:            formData.get('DTchure'),
    DTcodau:            formData.get('DTcodau'),
    Diachi:             formData.get('Diachi'),
    Nguoigd:            formData.get('Nguoigd'),
    DienThoaiDaiDien:   formData.get('DienThoaiDaiDien'),
    Mail:               formData.get('Mail'),
    Ngaytochuc:         formData.get('Ngaytochuc'),
    Loaitiecid:         formData.get('Loaihinhtiecid'),
    Thoigianid:         formData.get('Thoigianid'),
    SobanManchinhthuc:  parseInt(formData.get('SobanManchinhthuc')) || 0,
    SobanManduphong:    parseInt(formData.get('SobanManduphong')) || 0,
    SobanChaychinhthuc: parseInt(formData.get('SobanChaychinhthuc')) || 0,
    SobanChayduphong:   parseInt(formData.get('SobanChayduphong')) || 0,
    // API_Booking_Save dùng Tongtien = tiền cọc
    Tongtien:           parseInt((formData.get('Sotiencoccho') || '0').replace(/\./g, ''), 10) || 0,
    Solan:              1, // Cọc lần 1
    Ghichu:             formData.get('Ghichu'),
    UserCreate:         'Admin'
  };

  // Convert Sanhtiecid to JsonSanhTiec
  var sanhId = formData.get('Sanhtiecid');
  var dsSanh = [];
  if (sanhId) {
    dsSanh.push({ Sanhtiecid: sanhId, IsSanhchinh: 1 });
  }
  
  var chkPhu = document.querySelectorAll('.chk-sanh-phu-modal:checked');
  Array.from(chkPhu).forEach(function(chk) {
      dsSanh.push({ Sanhtiecid: chk.value, IsSanhchinh: 0 });
  });
  
  if (dsSanh.length > 0) {
    payload.JsonSanhTiec = JSON.stringify(dsSanh);
  }

  CalendarService.save(payload)
    .then(function (res) {
      var responseObj = Array.isArray(res) ? res[0] : res;
      function _isOk(v) { return v == 1 || v === true || v === 'true'; }
      var isSuccess = responseObj && (
        _isOk(responseObj.Success) || _isOk(responseObj.success) ||
        _isOk(responseObj.Result)  || _isOk(responseObj.code)
      );

      if (isSuccess) {
        document.querySelectorAll('#modal-container .modal-overlay').forEach(function(m) { m.remove(); });
        window._createBanquetModal = null;
        UIToast.show(responseObj.Message || responseObj.message || (responseObj.DocumentID && ('Đã đặt cọc ' + responseObj.DocumentID + ' thành công!')) || 'Đặt cọc lịch tiệc thành công!', 'success');

        if (typeof EventBus !== 'undefined') {
          EventBus.emit('BANQUET_MUTATED', { type: 'create' });
        }
      } else {
        var errMsg = responseObj ? (responseObj.Message || responseObj.message || responseObj.msg || 'Lỗi lưu hợp đồng') : 'Lỗi lưu hợp đồng';
        UIToast.show(errMsg, 'error');
      }
    })
    .catch(function (err) {
      console.error(err);
      if (err === 'Chưa cấu hình API CALENDAR.SAVE') {
        UIToast.show(err, 'danger');
      } else {
        UIToast.show('Có lỗi xảy ra khi lưu!', 'danger');
      }
    })
    .finally(function () {
      btn.innerHTML = btnOriginalText;
      btn.disabled = false;
    });
};



