/**
 * Màn hình Biên nhận Cọc chỗ (Booking)
 * HTML Template: src/pages/booking.html
 */
var BookingPage = (function () {
  var $container;
  var bookingPanel = null;

  function render(containerElement) {
    $container = containerElement;

    if (typeof DynamicFormEngine === 'undefined') {
      var script = document.createElement('script');
      script.src = './src/js/core/DynamicFormEngine.js?v=' + Date.now();
      script.onload = function () { _doRender(); };
      document.body.appendChild(script);
    } else {
      _doRender();
    }
  }

  function _doRender() {
    fetch('./src/pages/booking/booking.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        $container.innerHTML = html;
        var listContainer = $container.querySelector('#booking-list-view');

        // Đăng ký Plugin Toolbar cho DynamicFormEngine
        if (!window.FormActionPlugins) window.FormActionPlugins = [];
        window.FormActionPlugins = window.FormActionPlugins.filter(function (p) { return p.id !== 'booking_plugin'; });
        window.FormActionPlugins.push({
          id: 'booking_plugin',
          getExtraButtons: function (formName, getSelected) {
            if (formName !== 'frmBiennhancoccho') return [];
            return [
              {
                text: 'Thêm Cọc Lần 1', icon: 'add_circle', type: 'tool',
                onClick: function () { openForm('add1', null); }
              },
              {
                text: 'Thay đổi Cọc', icon: 'edit', type: 'tool',
                onClick: function () {
                  var selected = getSelected();
                  if (!selected || selected.length === 0) return (typeof UIToast !== 'undefined' ? UIToast.show('Vui lòng chọn 1 Biên nhận!', 'warning') : alert('Vui lòng chọn 1 Biên nhận!'));
                  openForm('edit', selected[0]);
                }
              },
              {
                text: 'Cọc Lần 2', icon: 'payments', type: 'tool',
                onClick: function () {
                  var selected = getSelected();
                  if (!selected || selected.length === 0) return (typeof UIToast !== 'undefined' ? UIToast.show('Vui lòng chọn Biên nhận để cọc lần 2!', 'warning') : alert('Chọn Biên nhận!'));
                  openForm('add2', selected[0]);
                }
              },
              {
                text: 'Hủy Cọc', icon: 'cancel', type: 'tool',
                onClick: function () {
                  var selected = getSelected();
                  if (!selected || selected.length === 0) return (typeof UIToast !== 'undefined' ? UIToast.show('Vui lòng chọn Biên nhận để hủy!', 'warning') : alert('Chọn Biên nhận!'));
                  var docId = selected[0].MaChungTu || selected[0].id;
                  if (typeof ConfirmModal !== 'undefined') {
                    ConfirmModal.show({
                      title: 'Hủy Phiếu Cọc',
                      message: 'Bạn có chắc chắn muốn hủy phiếu cọc <b>' + docId + '</b> không?',
                      onConfirm: function () {
                        if (API_CONFIG && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.BOOKING && API_CONFIG.ENDPOINTS.BOOKING.CANCEL) {
                          BookingService.cancel({ DocumentID: docId, Lydohuy: 'Khách yêu cầu hủy' }).then(function () {
                            if (typeof UIToast !== 'undefined') UIToast.show('Hủy phiếu cọc thành công', 'success');
                            _refreshGrid();
                          }).catch(function () { if (typeof UIToast !== 'undefined') UIToast.show('Lỗi hủy phiếu', 'danger'); });
                        } else {
                          if (typeof UIToast !== 'undefined') UIToast.show('Chưa cấu hình API CANCEL', 'warning');
                        }
                      }
                    });
                  }
                }
              },
              {
                text: 'Xóa Cọc', icon: 'delete', type: 'tool',
                onClick: function () {
                  var selected = getSelected();
                  if (!selected || selected.length === 0) return (typeof UIToast !== 'undefined' ? UIToast.show('Vui lòng chọn ít nhất 1 Biên nhận để xóa!', 'warning') : alert('Chọn Biên nhận!'));
                  
                  if (typeof ConfirmModal !== 'undefined') {
                    ConfirmModal.show({
                      title: 'Xóa Phiếu Cọc',
                      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn <b>' + selected.length + '</b> phiếu cọc đã chọn không? Hành động này không thể hoàn tác.',
                      onConfirm: function () {
                        if (API_CONFIG && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER) {
                          // Gom tất cả ID lại thành chuỗi phân cách bằng dấu phẩy
                          var docIds = selected.map(function(item) { return item.MaChungTu || item.id; }).join(',');
                          
                          BookingService.remove({ DocumentIDs: docIds })
                            .then(function() {
                              if (typeof UIToast !== 'undefined') UIToast.show('Xóa ' + selected.length + ' phiếu cọc thành công', 'success');
                              _refreshGrid();
                            })
                            .catch(function(err) {
                              if (typeof UIToast !== 'undefined') UIToast.show('Lỗi xóa phiếu: ' + (err.message || 'Có lỗi xảy ra'), 'danger'); 
                            });
                        } else {
                          if (typeof UIToast !== 'undefined') UIToast.show('Chưa cấu hình API DELETE (ROUTER)', 'warning');
                        }
                      }
                    });
                  }
                }
              },
              {
                text: 'Lập Hợp Đồng', icon: 'description', type: 'tool',
                onClick: function () {
                  var selected = getSelected();
                  if (!selected || selected.length === 0) return (typeof UIToast !== 'undefined' ? UIToast.show('Vui lòng chọn Biên nhận!', 'warning') : alert('Chọn Biên nhận!'));
                  var docId = selected[0].MaChungTu || selected[0].id;
                  window.location.hash = '#/contract?bookingId=' + docId;
                }
              }
            ];
          }
        });

        if (typeof DynamicFormEngine !== 'undefined') {
          DynamicFormEngine.render(listContainer, {
            FormName: 'frmBiennhancoccho',
            PageTitle: 'Biên Nhận Cọc Chỗ',
            PageSubtitle: 'Quản lý đặt cọc và lịch đặt tiệc',
            HideAddBtn: true,
            HideEditBtn: true,
            HideDeleteBtn: true,
            HideFilterBtn: true,
            onRowDblClick: function (rData) {
              openForm('edit', rData);
            }
          });
        }

        _bindFormEvents();
        _loadDropdownData();

        // Xử lý Autofill nếu chuyển từ màn hình khác sang (Khách Tham Quan)
        var v2b = sessionStorage.getItem('transfer_VisitorToBooking');
        if (v2b) {
          try {
            var transferData = JSON.parse(v2b);
            sessionStorage.removeItem('transfer_VisitorToBooking');

            // Mở form thêm mới
            openForm('add1', null);

            // Đợi side panel load xong rồi điền
            setTimeout(function () {
              if (transferData.Tenkh) {
                var names = transferData.Tenkh.split('&');
                $container.querySelector('#inp-tenchure').value = names[0] ? names[0].trim() : transferData.Tenkh;
                if (names[1]) $container.querySelector('#inp-tencodau').value = names[1].trim();
              }
              if (transferData.Dienthoai) {
                $container.querySelector('#inp-dtchure').value = transferData.Dienthoai;
              }
              if (transferData.Ngaytochuc) {
                var dateVal = transferData.Ngaytochuc.toString().trim();
                if (dateVal.includes('T')) dateVal = dateVal.split('T')[0];
                else if (dateVal.includes(' ')) dateVal = dateVal.split(' ')[0];

                if (dateVal.includes('/')) {
                  var parts = dateVal.split('/');
                  if (parts.length === 3) dateVal = parts[2] + '-' + parts[1] + '-' + parts[0];
                }
                $container.querySelector('#inp-ngaytochuc').value = dateVal;
              }
              if (window.Toast) Toast.success('Đã tự động điền thông tin khách hàng!');
              else if (typeof UIToast !== 'undefined') UIToast.show('Đã tự động điền thông tin khách hàng!', 'success');
            }, 400);
          } catch (e) { }
        }
      });
  }

  function _refreshGrid() {
    var listContainer = $container.querySelector('#booking-list-view');
    if (listContainer && typeof DynamicFormEngine !== 'undefined') {
      DynamicFormEngine.render(listContainer, {
        FormName: 'frmBiennhancoccho',
        PageTitle: 'Biên Nhận Cọc Chỗ',
        PageSubtitle: 'Quản lý đặt cọc và lịch đặt tiệc',
        HideAddBtn: true,
        HideEditBtn: true,
        HideDeleteBtn: true,
        HideFilterBtn: true,
        onRowDblClick: function (rData) {
          openForm('edit', rData);
        }
      });
    }
  }

  var hallRecords = [];

  function _renderSanhPhu(sanhChinhId, selectedIds) {
    var container = $container.querySelector('#container-sanh-phu');
    if (!container) return;
    container.innerHTML = '';

    if (!sanhChinhId) {
      container.innerHTML = '<span class="text-secondary" style="font-size: 12px; margin: auto; font-style: italic;">Vui lòng chọn Sảnh Chính trước</span>';
      return;
    }

    var filtered = hallRecords.filter(function (r) { return r.Sanhtiecid !== sanhChinhId; });
    if (filtered.length === 0) {
      container.innerHTML = '<span class="text-secondary" style="font-size: 12px; margin: auto; font-style: italic;">Không có sảnh phụ nào khác</span>';
      return;
    }

    filtered.forEach(function (h) {
      var isChecked = (selectedIds || []).includes(h.Sanhtiecid) ? 'checked' : '';
      container.innerHTML += `
      <label class="modern-checkbox-wrapper mb-0" style="font-size: 13px; background: var(--color-surface); padding: 8px 14px; border-radius: 8px; border: 1px solid var(--color-border); min-width: 160px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s;">
        <div class="d-flex align-items-center gap-2">
          <input type="checkbox" class="modern-checkbox chk-sanh-phu" value="${h.Sanhtiecid}" ${isChecked}>
          <span style="font-weight: 600; color: var(--color-primary);">${h.Tensanhtiec}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-text-secondary); margin-left: 26px; margin-top: 2px;">Max: ${h.Succhua || 0} bàn</div>
      </label>
      `;
    });
  }

  function _loadDropdownData() {
    // Load Sảnh Tiệc
    if (typeof SystemDataService !== 'undefined') {
      SystemDataService.getHalls().then(function (records) {
        hallRecords = records;
        var selSanh = $container.querySelector('#sel-sanh');
        if (selSanh && records.length > 0) {
          selSanh.innerHTML = '<option value="">-- Chọn Sảnh --</option>';
          records.forEach(function (h) {
            selSanh.innerHTML += '<option value="' + h.Sanhtiecid + '">' + h.Tensanhtiec + ' (Max: ' + (h.Succhua || 0) + ')</option>';
          });

          selSanh.addEventListener('change', function () {
            _renderSanhPhu(this.value, []);
          });
        }
      }).catch(function (e) { console.warn('Không load được sảnh', e); });

      // Load Loại Tiệc
      SystemDataService.getBanquetTypes().then(function (records) {
        var selLoaiTiec = $container.querySelector('#sel-loaitiec');
        if (selLoaiTiec && records.length > 0) {
          selLoaiTiec.innerHTML = '<option value="">-- Chọn Loại Tiệc --</option>';
          records.forEach(function (lt) {
            var isHoiNghiFlag = (String(lt.isHoiNghi) === '1' || String(lt.isHoiNghi).toLowerCase() === 'true') ? '1' : '0';
            var tenLoai = lt.Tenloaihinhtiec || lt.Tenloaitiec || lt.Tenloaihinh || 'Không xác định';
            var idLoai = lt.Loaihinhtiecid || lt.Loaitiecid || '';
            selLoaiTiec.innerHTML += '<option value="' + idLoai + '" data-ishoinghi="' + isHoiNghiFlag + '">' + tenLoai + '</option>';
          });
        }
      }).catch(function (e) { console.warn('Không load được loại tiệc', e); });

      // Load Ca Tiệc
      SystemDataService.getShifts().then(function (records) {
        var selCaTiec = $container.querySelector('#sel-catiec');
        if (selCaTiec && records.length > 0) {
          selCaTiec.innerHTML = '<option value="">-- Chọn Ca Tiệc --</option>';
          records.forEach(function (ca) {
            selCaTiec.innerHTML += '<option value="' + ca.Thoigianid + '">' + (ca.Tenthoigian || ca.Thoigianid) + '</option>';
          });
        }
      }).catch(function (e) { console.warn('Không load được ca tiệc', e); });
    }
  }

  function _bindFormEvents() {
    // Form events - using the new UISidePanel component
    if (window.UISidePanel) {
      var panelEl = $container.querySelector('#booking-form-panel');
      if (panelEl) bookingPanel = new UISidePanel(panelEl);
    }

    // Customer search using integrated UI Component
    var searchContainer = $container.querySelector('#customer-search-container');
    if (searchContainer && window.UIControls && UIControls.createSearchDropdown) {
      searchContainer.appendChild(UIControls.createSearchDropdown({
        placeholder: 'SĐT / Tên...',
        width: '320px',
        requireKeyword: true,
        onSearch: function (keyword, renderResults, hideDropdown) {
          if (API_CONFIG && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.CUSTOMER && API_CONFIG.ENDPOINTS.CUSTOMER.SEARCH) {
            BookingService.searchCustomer(keyword)
              .then(function (result) {
                renderResults(result.list);
              })
              .catch(function () {
                renderResults([]);
                if (window.UIToast) UIToast.show('Lỗi kết nối khi tìm khách hàng!', 'error');
              });
          } else {
            if (window.UIToast) UIToast.show('Đang mô phỏng tìm KH: ' + keyword, 'success');
            hideDropdown();
          }
        },
        renderItem: function (kh) {
          var tenKhach = [kh.Tenchure, kh.Tencodau].filter(Boolean).join(' & ');
          if (!tenKhach) tenKhach = kh.Tenkh || 'Chưa có tên';

          return `
            <div class="fw-bold" style="font-size: 13px; color: var(--color-text);">${tenKhach}</div>
            <div class="text-secondary mt-1" style="font-size: 12px; display: flex; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span>${UIIcon.createHTML('call', 'font-size:12px;vertical-align:middle;')} ${kh.Dienthoai || '---'}</span>
              <span>${UIIcon.createHTML('pin_drop', 'font-size:12px;vertical-align:middle;')} ${kh.Diachi || '---'}</span>
            </div>
          `;
        },
        onSelect: function (kh) {
          var tenKhach = [kh.Tenchure, kh.Tencodau].filter(Boolean).join(' & ');
          if (!tenKhach) tenKhach = kh.Tenkh || 'Chưa có tên';

          $container.querySelector('#inp-tenchure').value = kh.Tenchure || '';
          $container.querySelector('#inp-dtchure').value = kh.DTchure || kh.Dienthoai || '';
          $container.querySelector('#inp-tencodau').value = kh.Tencodau || '';
          $container.querySelector('#inp-dtcodau').value = kh.DTcodau || '';
          $container.querySelector('#inp-diachi').value = kh.Diachi || '';
          $container.querySelector('#inp-nguoigd').value = kh.Nguoigd || '';
          $container.querySelector('#inp-dtdai-dien').value = kh.DienThoaiDaiDien || '';
          $container.querySelector('#inp-email').value = kh.Mail || '';
          if (window.UIToast) UIToast.show('Đã chọn: ' + tenKhach, 'success');
        }
      }));
    }

    $container.querySelector('#btn-save-booking').addEventListener('click', function () {
      var machungtu = $container.querySelector('#inp-machungtu').value;
      if (machungtu === 'BNCC-AUTO') machungtu = null; // Null để Server tự sinh mới

      var tenchure = $container.querySelector('#inp-tenchure').value;
      var dtchure = $container.querySelector('#inp-dtchure').value;
      var tencodau = $container.querySelector('#inp-tencodau').value;
      var dtcodau = $container.querySelector('#inp-dtcodau').value;
      var diachi = $container.querySelector('#inp-diachi').value;
      var nguoigd = $container.querySelector('#inp-nguoigd').value;
      var dtdaidien = $container.querySelector('#inp-dtdai-dien').value;
      var email = $container.querySelector('#inp-email').value;
      var eventDate = $container.querySelector('#inp-ngaytochuc').value;
      if (!eventDate) {
        if (typeof UIToast !== 'undefined') UIToast.show('Vui lòng chọn Ngày tổ chức!', 'warning');
        else alert('Vui lòng chọn Ngày tổ chức!');
        return;
      }
      if (window.PeriodManager && window.PeriodManager.isDateLocked(eventDate)) {
        if (typeof UIToast !== 'undefined') UIToast.show('Kỳ kế toán của ngày ' + eventDate + ' đã bị khóa. Không thể lưu dữ liệu!', 'danger');
        return;
      }

      var caTiec = $container.querySelector('#sel-catiec').value;
      if (!caTiec) {
        if (typeof UIToast !== 'undefined') UIToast.show('Vui lòng chọn Ca Tiệc!', 'warning');
        else alert('Vui lòng chọn Ca Tiệc!');
        return;
      }

      var loaitiec = $container.querySelector('#sel-loaitiec').value;
      if (!loaitiec) {
        if (typeof UIToast !== 'undefined') UIToast.show('Vui lòng chọn Loại Tiệc!', 'warning');
        else alert('Vui lòng chọn Loại Tiệc!');
        return;
      }

      var banMan = parseInt($container.querySelector('#inp-ban-man').value) || 0;
      var banManDp = parseInt($container.querySelector('#inp-ban-man-dp').value) || 0;
      var banChay = parseInt($container.querySelector('#inp-ban-chay').value) || 0;
      var banChayDp = parseInt($container.querySelector('#inp-ban-chay-dp').value) || 0;
      var sanhId = $container.querySelector('#sel-sanh').value;
      if (!sanhId) {
        if (typeof UIToast !== 'undefined') UIToast.show('Vui lòng chọn Sảnh Tiệc chính!', 'warning');
        else alert('Vui lòng chọn Sảnh Tiệc chính!');
        return;
      }
      var dsSanh = [];
      if (sanhId) dsSanh.push({ Sanhtiecid: sanhId, IsSanhchinh: 1 });

      var chkPhu = $container.querySelectorAll('.chk-sanh-phu:checked');
      Array.from(chkPhu).forEach(function (chk) {
        dsSanh.push({ Sanhtiecid: chk.value, IsSanhchinh: 0 });
      });

      var tienCocRaw = $container.querySelector('#inp-tiencoc').value || '0';
      var tienCoc = parseFloat(tienCocRaw.replace(/\D/g, '')) || 0;
      var ghiChu = $container.querySelector('#inp-ghichu').value;
      var loaitiec = $container.querySelector('#sel-loaitiec').value;

      var isCocLan2 = $container.querySelector('#booking-form-title').textContent.includes('Lần 2');

      var payload = {
        DocumentID: machungtu,
        Tenchure: tenchure,
        Tencodau: tencodau,
        DTchure: dtchure,
        DTcodau: dtcodau,
        Diachi: diachi,
        Nguoigd: nguoigd,
        DienThoaiDaiDien: dtdaidien,
        Mail: email,
        Ngaytochuc: eventDate,
        _Ngaytochuc: eventDate, // Truyền thêm cho Router của API_Gateway_Router
        Loaitiecid: loaitiec,
        Thoigianid: caTiec,
        SobanManchinhthuc: banMan,
        SobanManduphong: banManDp,
        SobanChaychinhthuc: banChay,
        SobanChayduphong: banChayDp,
        Tongtien: tienCoc,
        Solan: isCocLan2 ? 2 : 1,
        Ghichu: ghiChu,
        JsonSanhTiec: JSON.stringify(dsSanh)
      };

      // Đã bắt buộc nhập ở trên, không cần delete nữa, payload chắc chắn có giá trị hợp lệ.

      // Kiểm tra và sử dụng ENDPOINT từ env.js
      if (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.BOOKING && API_CONFIG.ENDPOINTS.BOOKING.SAVE) {
        BookingService.save(payload)
          .then(function (res) {
            if (typeof UIToast !== 'undefined') UIToast.show('Lưu Biên nhận cọc thành công!', 'success');
            closeForm();
            _refreshGrid();
          })
          .catch(function (err) {
            console.error('Lỗi lưu Cọc:', err);
            UIToast.show('Lỗi khi lưu: ' + (err.message || 'Có lỗi xảy ra'), 'danger');
          });
      } else {
        console.warn('Thiếu cấu hình API_CONFIG.ENDPOINTS.BOOKING.SAVE');
        UIToast.show('Đang mô phỏng lưu...', 'success');
      }
    });

    // Format Tiền Cọc
    var inpTienCoc = $container.querySelector('#inp-tiencoc');
    var vnTienCoc = $container.querySelector('#vn-tiencoc');
    if (typeof UIInput !== 'undefined' && UIInput.setupMoneyInput) {
      UIInput.setupMoneyInput(inpTienCoc, vnTienCoc);
    }

    // Removed auto calculate total tables as the UI uses dp fields now

    // Dynamic Form Loại Tiệc
    var selLoaiTiec = $container.querySelector('#sel-loaitiec');
    if (selLoaiTiec) {
      selLoaiTiec.addEventListener('change', function () {
        var selectedOption = this.options[this.selectedIndex];
        var isHoiNghi = selectedOption ? selectedOption.getAttribute('data-ishoinghi') : '0';

        var colCodau = $container.querySelector('#bk-col-ten-codau');
        var colDtCodau = $container.querySelector('#bk-col-dt-codau');
        var colChure = $container.querySelector('#bk-col-ten-chure');
        var colDtChure = $container.querySelector('#bk-col-dt-chure');
        var lblChure = $container.querySelector('#bk-lbl-ten-chure');
        var lblDtChure = $container.querySelector('#bk-lbl-dt-chure');
        var inpChure = $container.querySelector('#inp-tenchure');
        var inpDtChure = $container.querySelector('#inp-dtchure');
        var inpCodau = $container.querySelector('#inp-tencodau');

        if (isHoiNghi !== '1') {
          if (colCodau) colCodau.style.display = 'block';
          if (colDtCodau) colDtCodau.style.display = 'block';
          if (colChure) colChure.className = 'col-md-6';
          if (colDtChure) colDtChure.className = 'col-md-6';
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
            inpCodau.value = '';
          }
          if (lblChure) lblChure.innerHTML = 'Tên KH / Đơn vị <span style="color:var(--color-danger)">*</span>';
          if (inpChure) inpChure.placeholder = 'Nhập tên khách hàng...';
          if (lblDtChure) lblDtChure.innerText = 'SĐT Khách Hàng';
          if (inpDtChure) inpDtChure.placeholder = 'SĐT khách hàng';
        }
      });
    }
  }

  function openForm(mode, data) {
    var title = $container.querySelector('#booking-form-title');
    if (mode === 'add1') {
      title.textContent = 'Thêm Biên nhận Cọc Lần 1';
      _clearForm();
    } else if (mode === 'edit') {
      title.textContent = 'Thay đổi Biên nhận Cọc';
      _fillForm(data);
    } else if (mode === 'add2') {
      title.textContent = 'Tiếp nhận Cọc Lần 2';
      _fillForm(data);
    }

    if (bookingPanel) {
      bookingPanel.show();
    }
  }

  function closeForm() {
    if (bookingPanel) {
      bookingPanel.hide();
    }
  }

  function _clearForm() {
    $container.querySelector('#inp-machungtu').value = 'BNCC-AUTO';
    $container.querySelector('#inp-tenchure').value = '';
    $container.querySelector('#inp-dtchure').value = '';
    $container.querySelector('#inp-tencodau').value = '';
    $container.querySelector('#inp-dtcodau').value = '';
    $container.querySelector('#inp-diachi').value = '';
    $container.querySelector('#inp-nguoigd').value = '';
    $container.querySelector('#inp-dtdai-dien').value = '';
    $container.querySelector('#inp-email').value = '';
    $container.querySelector('#inp-ngaytochuc').value = '';
    var ltSel = $container.querySelector('#sel-loaitiec');
    if (ltSel) {
      ltSel.value = '';
      ltSel.dispatchEvent(new Event('change'));
    }
    $container.querySelector('#sel-catiec').value = '';
    $container.querySelector('#inp-ban-man').value = '';
    var manDp = $container.querySelector('#inp-ban-man-dp');
    if (manDp) manDp.value = '';
    $container.querySelector('#inp-ban-chay').value = '';
    var chayDp = $container.querySelector('#inp-ban-chay-dp');
    if (chayDp) chayDp.value = '';
    $container.querySelector('#sel-sanh').value = '';
    $container.querySelector('#inp-tiencoc').value = '';
    $container.querySelector('#inp-ghichu').value = '';
  }

  function _fillForm(data) {
    if (!data) return;
    $container.querySelector('#inp-machungtu').value = data.MaChungTu || data.id || '';
    var names = (data.TenKhachHang || data.customerName || '').split('&');
    $container.querySelector('#inp-tenchure').value = data.Tenchure || (names[0] ? names[0].trim() : '');
    $container.querySelector('#inp-dtchure').value = data.DTchure || data.DienThoai || data.phone || '';
    $container.querySelector('#inp-tencodau').value = data.Tencodau || (names[1] ? names[1].trim() : '');
    $container.querySelector('#inp-dtcodau').value = data.DTcodau || '';

    $container.querySelector('#inp-diachi').value = data.Diachi || '';
    $container.querySelector('#inp-nguoigd').value = data.Nguoigd || '';
    $container.querySelector('#inp-dtdai-dien').value = data.DienThoaiDaiDien || '';
    $container.querySelector('#inp-email').value = data.Mail || '';

    var eventDate = data._Ngaytochuc || data.Ngaytochuc || data.NgayToChuc || data.eventDate || '';
    if (eventDate) {
      eventDate = eventDate.toString().trim();
      if (eventDate.includes('T')) eventDate = eventDate.split('T')[0];
      else if (eventDate.includes(' ')) eventDate = eventDate.split(' ')[0];
    }

    if (eventDate.includes('/')) {
      var parts = eventDate.split('/');
      if (parts.length === 3) {
        $container.querySelector('#inp-ngaytochuc').value = parts[2] + '-' + parts[1] + '-' + parts[0];
      }
    } else if (eventDate.includes('-')) {
      $container.querySelector('#inp-ngaytochuc').value = eventDate;
    } else {
      $container.querySelector('#inp-ngaytochuc').value = '';
    }

    // Trigger update for Loaihinhtiec
    var ltSel = $container.querySelector('#sel-loaitiec');
    if (ltSel) {
      ltSel.value = data.Loaihinhtiecid || '';
      ltSel.dispatchEvent(new Event('change'));
    }

    $container.querySelector('#sel-catiec').value = data.Thoigianid || '';
    $container.querySelector('#inp-ban-man').value = data.SobanManchinhthuc != null ? data.SobanManchinhthuc : (data.SoBan != null ? data.SoBan : data.totalTables);
    var manDp = $container.querySelector('#inp-ban-man-dp');
    if (manDp) manDp.value = data.SobanManduphong || 0;

    $container.querySelector('#inp-ban-chay').value = data.SobanChaychinhthuc || 0;
    var chayDp = $container.querySelector('#inp-ban-chay-dp');
    if (chayDp) chayDp.value = data.SobanChayduphong || 0;

    $container.querySelector('#sel-sanh').value = ''; // Reset select
    _renderSanhPhu('', []);
    var currentHall = data.SanhDat || data.hall || '';

    // Nếu có data.JsonSanhTiec, decode ra để fill sảnh chính và sảnh phụ
    var dsSanh = [];
    try {
      if (data._JsonSanhTiec) dsSanh = JSON.parse(data._JsonSanhTiec);
      else if (data.JsonSanhTiec) dsSanh = JSON.parse(data.JsonSanhTiec);
    } catch (e) { }

    if (dsSanh.length > 0) {
      var sanhChinh = dsSanh.find(s => s.IsSanhchinh === 1 || s.IsSanhchinh === true);
      if (sanhChinh) {
        $container.querySelector('#sel-sanh').value = sanhChinh.Sanhtiecid;
        var phuIds = dsSanh.filter(s => s.IsSanhchinh === 0 || s.IsSanhchinh === false).map(s => s.Sanhtiecid);
        _renderSanhPhu(sanhChinh.Sanhtiecid, phuIds);
      }
    } else {
      if (currentHall.includes('Diamond')) $container.querySelector('#sel-sanh').value = 'S01';
      else if (currentHall.includes('Ruby')) $container.querySelector('#sel-sanh').value = 'S02';
      else if (currentHall.includes('Queen')) $container.querySelector('#sel-sanh').value = 'S03';
      _renderSanhPhu($container.querySelector('#sel-sanh').value, []);
    }

    var depositStr = (data.DaCocVND != null ? data.DaCocVND : data.deposit).toString();
    var inpTienCoc = $container.querySelector('#inp-tiencoc');
    var vnTienCoc = $container.querySelector('#vn-tiencoc');
    if (inpTienCoc) {
      if (depositStr) {
        var val = depositStr.replace(/\D/g, '');
        if (val) {
          var raw = parseInt(val, 10);
          inpTienCoc.value = raw.toLocaleString('vi-VN');
          if (vnTienCoc) vnTienCoc.innerText = UIInput.docSoTienVN(raw);
        } else {
          inpTienCoc.value = '';
          if (vnTienCoc) vnTienCoc.innerText = '';
        }
      } else {
        inpTienCoc.value = '';
        if (vnTienCoc) vnTienCoc.innerText = '';
      }
    }

    $container.querySelector('#inp-ghichu').value = data.Ghichu || '';
  }

  return { render: render };
})();
