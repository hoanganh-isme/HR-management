/**
 * FormBuilderPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin dành riêng cho trang Thiết kế Giao diện (Form Builder).
 * Chứa logic của nút "Thiết kế Layout" (Visual Drag & Drop) và "Đồng bộ từ DB".
 */
var FormBuilderPlugin = (function () {

  // ── Helper: Set Loading State ────────────────────────────────────────────
  function _setBtnLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
      if (!btn.hasAttribute('data-original-html')) {
        btn.setAttribute('data-original-html', btn.innerHTML);
      }
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
      btn.disabled = true;
    } else {
      if (btn.hasAttribute('data-original-html')) {
        btn.innerHTML = btn.getAttribute('data-original-html');
        btn.removeAttribute('data-original-html');
      }
      btn.disabled = false;
    }
  }

  // ── Lấy Nút Cấu Hình Toolbar ──────────────────────────────────────────────
  function getExtraButtons(formName, getSelectedRows, moduleConfig, onReloadFormEngine) {
    if ((window.location.hash || '').indexOf('/system/form-builder') === -1) return [];

    return [
      {
        id: 'btn-form-builder-layout',
        text: 'Thiết kế Layout',
        icon: 'design_services',
        type: 'tool',
        onClick: function() { _promptLayoutBuilder(moduleConfig, onReloadFormEngine); }
      },
      {
        id: 'btn-form-builder-sync',
        text: 'Đồng bộ từ DB',
        icon: 'sync',
        type: 'tool',
        onClick: function () {
          _openSyncModal(moduleConfig, onReloadFormEngine);
        }
      }
    ];
  }

  // ── Logic Đồng Bộ DB ─────────────────────────────────────────────────────
  function _openSyncModal(moduleConfig, onReloadFormEngine) {
    var body = document.createElement('div');
    body.className = 'p-3';
    body.innerHTML = `
      <div class="form-group mb-3">
        <label class="form-label fw-bold">Tên Form (FormName):</label>
        <input type="text" id="syncFormName" class="ui-input" placeholder="Ví dụ: frmCustomer">
        <small class="text-muted d-block mt-1">Form giao diện mà bạn muốn đồng bộ cấu hình.</small>
      </div>
      <div class="form-group mb-3">
        <label class="form-label fw-bold">Tên Bảng/View trong DB (ObjectName):</label>
        <input type="text" id="syncTableName" class="ui-input" placeholder="Ví dụ: HR_PersonView">
        <small class="text-muted d-block mt-1">Tên bảng hoặc View thực tế dưới Database.</small>
      </div>
    `;

    var modal = UIModal.show({
      title: 'Đồng bộ cấu hình từ Database',
      width: '500px',
      content: body,
      footer: UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-outline', onclick: 'this.closest(\'.modal-overlay\').remove()' }) +
        UIButton.createHTML({ text: 'Chạy Đồng Bộ', type: 'primary', className: 'btn-run-sync', icon: 'play_arrow' })
    });

    var btnRun = modal.node.querySelector('.btn-run-sync');
    btnRun.onclick = function () {
      var fName = document.getElementById('syncFormName').value.trim();
      var tName = document.getElementById('syncTableName').value.trim();

      if (!fName || !tName) {
        return Alert.warning('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên Form và tên Bảng!');
      }

      _setBtnLoading(btnRun, true);
      var payload = {
        FormName: fName,
        ObjectName: tName
      };

      ApiClient.post('/api/API_DongBoTruongGiaoDien', payload).then(function (res) {
        if (res && res.code === 0) {
          Alert.success('Thành công', 'Đồng bộ trường giao diện hoàn tất!');
          modal.closeNow();
          if (typeof onReloadFormEngine === 'function') onReloadFormEngine();
        } else {
          Alert.error('Lỗi', res.msg || 'Đồng bộ thất bại');
          _setBtnLoading(btnRun, false);
        }
      }).catch(function (err) {
        Alert.error('Lỗi mạng', err.message || 'Không thể kết nối đến server');
        _setBtnLoading(btnRun, false);
      });
    };
  }

  // ── Logic Thiết Kế Layout ────────────────────────────────────────────────
  function _promptLayoutBuilder(moduleConfig, onReloadFormEngine) {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var targetFormInput = UIInput.createText({
      label: 'Nhập Tên Form cần thiết kế layout (*)',
      required: true,
      placeholder: 'Ví dụ: frmCustomer'
    });
    body.appendChild(targetFormInput);

    var footerNode = document.createElement('div');
    footerNode.style.cssText = 'display: flex; gap: 12px;';
    footerNode.innerHTML =
      UIButton.createHTML({ text: 'Hủy', className: 'btn-close-prompt', type: 'secondary' }) +
      UIButton.createHTML({ text: 'Mở thiết kế', className: 'btn-submit-prompt', type: 'primary' });

    var modalPrompt = UIModal.show({
      title: 'Thiết kế Layout trực quan',
      content: body,
      footer: footerNode
    });

    footerNode.querySelector('.btn-close-prompt').onclick = function () {
      modalPrompt.closeNow();
    };

    footerNode.querySelector('.btn-submit-prompt').onclick = function () {
      var formName = targetFormInput.querySelector('input').value.trim();
      if (!formName) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form');
      modalPrompt.closeNow();
      _openVisualLayoutBuilder(formName, moduleConfig, onReloadFormEngine);
    };

    // Bắt sự kiện phím Enter
    var inputEl = targetFormInput.querySelector('input');
    if (inputEl) {
      setTimeout(function () { inputEl.focus(); }, 100);
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var formName = inputEl.value.trim();
          if (!formName) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form');
          modalPrompt.closeNow();
          _openVisualLayoutBuilder(formName, moduleConfig, onReloadFormEngine);
        }
      });
    }
  }

  function _openVisualLayoutBuilder(targetFormName, moduleConfig, onReloadFormEngine) {
    var loadingModal = UIModal.show({ title: 'Đang tải layout...', content: '<div class="text-center p-4">Đang tải cấu hình form...</div>', buttons: [] });

    var fetchEndpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.SYSTEM && window.API_CONFIG.ENDPOINTS.SYSTEM.GET_FIELDS_LIST) || moduleConfig.ApiSearch || '/api/API_Gateway_Router';

    GatewayClient.run({ sp: 'frmFormBuilder', func: 'View' }, { FormName: targetFormName }, {
      endpoint: fetchEndpoint,
      keyword: targetFormName,
      limit: 1000
    })
      .then(function (res) {
        loadingModal.closeNow();
        var fields = res.list || res.records || [];
        if (fields.length === 0) {
          return Alert.warning('Cảnh báo', 'Không tìm thấy trường nào cho form ' + targetFormName);
        }

        // Sắp xếp
        fields.sort(function (a, b) { return (a.OrderNo || 0) - (b.OrderNo || 0); });

        var body = document.createElement('div');
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        body.style.gap = '12px';

        var help = document.createElement('div');
        help.className = 'alert alert-info py-2 mb-0 d-flex align-items-center gap-2';
        help.innerHTML = '<span class="material-symbols-outlined">info</span> Kéo thả các khối để sắp xếp thứ tự. Bấm các nút phần trăm để chỉnh độ rộng. Layout hiển thị đúng tỷ lệ khung màn hình.';
        body.appendChild(help);

        var dropZone = document.createElement('div');
        dropZone.style.display = 'flex';
        dropZone.style.flexWrap = 'wrap';
        dropZone.style.gap = '10px 10px';
        dropZone.style.padding = '15px';
        dropZone.style.border = '2px dashed var(--color-border)';
        dropZone.style.borderRadius = '8px';
        dropZone.style.background = 'var(--color-background)';
        dropZone.style.minHeight = '300px';
        dropZone.style.position = 'relative';

        var draggedEl = null;

        fields.forEach(function (f) {
          var card = document.createElement('div');
          var span = f.FormPosition || 'body';
          if (span === 'grid') span = '6';
          if (span === 'body') span = '12';
          if (!['12', '8', '6', '4', '3'].includes(span)) span = '12';

          card.className = 'layout-card';
          card.draggable = true;
          card.dataset.id = f.FieldName;
          card.dataset.span = span;
          card.dataset.orig = JSON.stringify(f);

          card.style.border = '1px solid var(--color-border)';
          card.style.borderRadius = '6px';
          card.style.background = 'var(--color-surface)';
          card.style.padding = '12px';
          card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          card.style.cursor = 'grab';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '10px';
          card.style.transition = 'width 0.2s ease, opacity 0.2s ease, transform 0.1s ease';

          var fieldNameStr = f.FieldName || f.fieldname || f.FIELDNAME || f.name || '';
          var captionStr = f.CaptionVN || f.captionvn || f.CAPTIONVN || f.label || fieldNameStr;

          var _bool = function(camel, pascal) {
            return String(camel) === '1' || camel === true || String(pascal) === '1' || pascal === true;
          };

          var showAdd = _bool(f.showInAdd, f.ShowInAdd);
          var showEdit = _bool(f.showInEdit, f.ShowInEdit);
          var isReq = _bool(f.required, f.IsRequired);

          card.innerHTML = `
             <div style="font-weight:600; font-size:14px; color:var(--color-primary); pointer-events:none; display:flex; align-items:center; gap:6px;">
               <span class="material-symbols-outlined" style="font-size:18px; color:#888;">drag_indicator</span> 
               <span class="text-truncate">${captionStr}</span>
               <small style="color:#aaa; font-weight:400;">(${fieldNameStr})</small>
             </div>
             
             <div style="display:flex; gap:10px; font-size:11px; color:#555; margin-top:2px;">
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-add" ${showAdd ? 'checked' : ''}> Hiện khi Thêm</label>
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-edit" ${showEdit ? 'checked' : ''}> Hiện khi Sửa</label>
                <label style="display:flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="chk-req" ${isReq ? 'checked' : ''}> Bắt buộc</label>
             </div>

             <div class="d-flex gap-1 mt-auto">
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="3">25%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="4">33%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="6">50%</button>
               <button type="button" class="btn btn-sm btn-outline-secondary btn-span py-0 px-2" style="font-size:11px;" data-val="12">100%</button>
             </div>
           `;

          function applyWidth(sp) {
            card.dataset.span = sp;
            card.className = card.className.replace(/df-col-\d+/g, '').trim() + ' df-col-' + sp;

            var btns = card.querySelectorAll('.btn-span');
            var label = sp === '12' ? '100%' : sp === '6' ? '50%' : sp === '4' ? '33%' : '25%';
            btns.forEach(function (b) {
              if (b.innerText.includes(label)) {
                b.classList.remove('btn-outline-secondary');
                b.classList.add('btn-primary');
                b.style.color = '#fff';
              } else {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
                b.style.color = '';
              }
            });
          }

          applyWidth(span);

          card.querySelectorAll('.btn-span').forEach(function (b) {
            b.onclick = function () { applyWidth(b.dataset.val); };
          });

          card.addEventListener('dragstart', function (e) {
            draggedEl = card;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', card.innerHTML);
            setTimeout(function () { card.style.opacity = '0.4'; card.style.transform = 'scale(0.98)'; }, 0);
          });
          card.addEventListener('dragend', function (e) {
            draggedEl = null;
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            dropZone.querySelectorAll('.layout-card').forEach(function (c) { c.style.border = '1px solid var(--color-border)'; });
          });
          card.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedEl && draggedEl !== card) {
              var rect = card.getBoundingClientRect();
              var midY = rect.top + rect.height / 2;
              var midX = rect.left + rect.width / 2;
              var isAfter = e.clientY > midY || (Math.abs(e.clientY - midY) < 30 && e.clientX > midX);
              if (isAfter) dropZone.insertBefore(draggedEl, card.nextSibling);
              else dropZone.insertBefore(draggedEl, card);
            }
          });

          dropZone.appendChild(card);
        });

        body.appendChild(dropZone);

        var footerNode = document.createElement('div');
        footerNode.style.cssText = 'display: flex; gap: 12px;';
        footerNode.innerHTML =
          UIButton.createHTML({ text: 'Đóng', className: 'btn-close-layout', type: 'secondary' }) +
          UIButton.createHTML({ text: 'Lưu Layout', className: 'btn-save-layout', type: 'primary', icon: 'save' });

        var modalLayout = UIModal.show({
          title: 'Thiết kế Layout: ' + targetFormName,
          content: body,
          width: '900px',
          footer: footerNode
        });

        footerNode.querySelector('.btn-close-layout').onclick = function () {
          modalLayout.closeNow();
        };

        footerNode.querySelector('.btn-save-layout').onclick = function () {
          var cards = dropZone.querySelectorAll('.layout-card');
          var payloads = [];

          cards.forEach(function (c, index) {
            var fieldName = c.dataset.id;
            var orig = fields.find(function (item) {
              return (item.name || item.FieldName || item.FIELDNAME || item.fieldname) === fieldName;
            });
            if (!orig) orig = {};

            var savedSpan = c.dataset.span;
            if (savedSpan === '12') savedSpan = 'body';
            if (savedSpan === '6') savedSpan = 'grid';

            var isAddChecked = c.querySelector('.chk-add') ? c.querySelector('.chk-add').checked : true;
            var isEditChecked = c.querySelector('.chk-edit') ? c.querySelector('.chk-edit').checked : true;
            var isReqChecked = c.querySelector('.chk-req') ? c.querySelector('.chk-req').checked : false;

            payloads.push({
              FormName: targetFormName,
              FieldName: fieldName,
              FormPosition: savedSpan,
              OrderNo: index + 1,
              CaptionVN: orig.label || orig.CaptionVN || orig.CAPTIONVN || orig.captionvn || fieldName,
              FormatID: orig.renderRule || orig.FormatID || orig.FORMATID || orig.formatid || '',
              DataSource: orig.dataSource || orig.DataSource || orig.DATASOURCE || orig.datasource || '',
              IsRequired: isReqChecked ? 1 : 0,
              ShowInAdd: isAddChecked ? 1 : 0,
              ShowInEdit: isEditChecked ? 1 : 0,
              ShowInFilter: orig.showInFilter !== undefined ? orig.showInFilter : (orig.ShowInFilter !== undefined ? orig.ShowInFilter : 0),
              IsReadOnlyAdd: orig.isReadOnlyAdd !== undefined ? orig.isReadOnlyAdd : (orig.IsReadOnlyAdd !== undefined ? orig.IsReadOnlyAdd : 0),
              IsReadOnlyEdit: orig.isReadOnlyEdit !== undefined ? orig.isReadOnlyEdit : (orig.IsReadOnlyEdit !== undefined ? orig.IsReadOnlyEdit : 0),
              ValidateRule: orig.validateRule || orig.ValidateRule || orig.VALIDATERULE || '',
              DependsOn: orig.dependsOn || orig.DependsOn || orig.DEPENDSON || '',
              VisibleRule: orig.visibleRule || orig.VisibleRule || orig.VISIBLERULE || ''
            });
          });

          if (payloads.length === 0) return;

          var btn = this;
          var origTxt = btn.innerHTML;
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';
          btn.disabled = true;

          var saveEndpoint = window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.SYSTEM
            ? window.API_CONFIG.ENDPOINTS.SYSTEM.SAVE_FIELD
            : moduleConfig.ApiSave;

          if (!saveEndpoint) {
            Alert.error('Lỗi', 'Chưa cấu hình API Save endpoint');
            btn.innerHTML = origTxt;
            btn.disabled = false;
            return;
          }

          _sendSequentialToDB(saveEndpoint, payloads)
            .then(function() {
              modalLayout.closeNow();
              Alert.success('Thành công', 'Đã cập nhật xong cấu hình Layout!');
              if (typeof onReloadFormEngine === 'function') onReloadFormEngine();
            })
            .catch(function(err) {
              console.error(err);
              btn.innerHTML = origTxt;
              btn.disabled = false;
            });
        };

      })
      .catch(function (e) {
        if (loadingModal) loadingModal.closeNow();
        Alert.error('Lỗi', 'Không thể tải cấu hình form: ' + e.message);
      });
  }

  // Chạy tuần tự các promises
  function _sendSequentialToDB(endpoint, payloads) {
    return payloads.reduce(function(promise, payload) {
      return promise.then(function() {
        var operation = { sp: payload.FormName, func: 'Save', endpoint: endpoint };
        if (endpoint && endpoint !== ApiEndpoints.gateway) operation.transport = 'direct';
        return GatewayClient.run(operation, payload).then(function(res) {
            if (res && res.code !== 0) throw new Error(res.msg || 'Lỗi lưu trường ' + payload.FieldName);
        });
      });
    }, Promise.resolve());
  }

  // Đăng ký Plugin vào hệ thống
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return {
    getExtraButtons: getExtraButtons
  };

})();
