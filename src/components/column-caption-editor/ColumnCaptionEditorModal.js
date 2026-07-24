/**
 * ColumnCaptionEditorModal Component
 * Hộp thoại chỉnh sửa Tiêu đề & Định dạng Cột (ERP SY_FmtFldTbl Editor)
 * Giao diện Tối Giản (Minimal Desktop Style), Tự động nạp cấu hình thực tế từ CSDL/Tabulator
 */
var ColumnCaptionEditorModal = (function () {
  var modalOverlay = null;
  var currentFormName = '';
  var currentFieldName = '';
  var _lastSaved = Object.create(null);

  function init() {
    if (document.getElementById('column-caption-modal-overlay')) return;

    modalOverlay = document.createElement('div');
    modalOverlay.id = 'column-caption-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';

    var html = `
      <div class="modal-content column-caption-modal minimal-erp-modal">
        <div class="modal-header">
          <h3 id="col-editor-title">Thay đổi tiêu đề cột / Column caption</h3>
          <button class="btn-close-modal" id="col-editor-btn-close" title="Đóng (Esc)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="field-row">
            <label for="col-editor-fieldname-input">Mã biến CSDL (FieldName)</label>
            <input type="text" id="col-editor-fieldname-input" readonly class="input-readonly" />
          </div>

          <div class="field-row">
            <label for="col-editor-caption-vn">Tiếng Việt</label>
            <input type="text" id="col-editor-caption-vn" placeholder="Nhập tiêu đề Tiếng Việt..." autofocus />
          </div>

          <div class="field-grid-2">
            <div class="field-row">
              <label for="col-editor-caption-en">English</label>
              <input type="text" id="col-editor-caption-en" placeholder="English..." />
            </div>
            <div class="field-row">
              <label for="col-editor-caption-ch">中文 (Trung Quốc)</label>
              <input type="text" id="col-editor-caption-ch" placeholder="中文..." />
            </div>
          </div>

          <div class="field-grid-2">
            <div class="field-row">
              <label for="col-editor-format">Định dạng / Format</label>
              <select id="col-editor-format">
                <option value="">-- Mặc định (Text) --</option>
                <option value="N0">N0 - Số nguyên (1.000.000)</option>
                <option value="N2">N2 - Số tiền thập phân (1.000.000,00)</option>
                <option value="CURRENCY">CURRENCY - Tiền tệ (1.000.000 ₫)</option>
                <option value="PERCENT">PERCENT - Tỷ lệ phần trăm (10.5%)</option>
                <option value="DATE">DATE - Ngày tháng (dd/MM/yyyy)</option>
              </select>
            </div>
            <div class="field-row">
              <label for="col-editor-align">Canh lề / Alignment</label>
              <select id="col-editor-align">
                <option value="">-- Mặc định --</option>
                <option value="left">Trái (Left)</option>
                <option value="center">Giữa (Center)</option>
                <option value="right">Phải (Right)</option>
              </select>
            </div>
          </div>

          <div class="field-grid-2">
            <div class="field-row">
              <label for="col-editor-minwidth">Grid col MinWidth (px)</label>
              <input type="number" id="col-editor-minwidth" value="0" min="0" placeholder="0 = Tự động" />
            </div>
            <div class="field-row">
              <label for="col-editor-maxwidth">Grid col MaxWidth (px)</label>
              <input type="number" id="col-editor-maxwidth" value="0" min="0" placeholder="0 = Tự động" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="tip-note">
            <span class="material-symbols-outlined" style="font-size: 15px;">info</span>
            <span>Lưu thay đổi vào bảng SY_FmtFldTbl</span>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" id="col-editor-btn-cancel">Hủy bỏ</button>
            <button class="btn btn-primary" id="col-editor-btn-save">
              <span class="material-symbols-outlined" style="font-size: 16px;">check</span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.innerHTML = html;
    document.body.appendChild(modalOverlay);

    // Event handlers
    document.getElementById('col-editor-btn-close').addEventListener('click', hide);
    document.getElementById('col-editor-btn-cancel').addEventListener('click', hide);

    modalOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hide();
      } else if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        document.getElementById('col-editor-btn-save').click();
      }
    });
  }

  function loadFormatOptions(selectedFormatId) {
    var selectEl = document.getElementById('col-editor-format');
    if (!selectEl) return;

    if (window.FieldSyncService && typeof window.FieldSyncService.getFormats === 'function') {
      window.FieldSyncService.getFormats().then(function (formats) {
        if (!formats || !formats.length) return;
        formats.forEach(function (fmt) {
          var exists = Array.from(selectEl.options).some(function (opt) { return opt.value === fmt.formatId; });
          if (!exists) {
            var opt = document.createElement('option');
            opt.value = fmt.formatId;
            opt.innerText = fmt.formatId + (fmt.description ? ' - ' + fmt.description : '');
            selectEl.appendChild(opt);
          }
        });
        if (selectedFormatId) selectEl.value = selectedFormatId;
      }).catch(function () {
        if (selectedFormatId) selectEl.value = selectedFormatId;
      });
    } else {
      if (selectedFormatId) selectEl.value = selectedFormatId;
    }
  }

  /**
   * Truy vấn cấu hình cột hiện tại từ Tabulator hoặc cache
   */
  function findExistingColDef(fieldName) {
    if (!fieldName) return {};
    if (window.tabulatorInstance) {
      try {
        var col = window.tabulatorInstance.getColumn(fieldName);
        if (col && typeof col.getDefinition === 'function') {
          return col.getDefinition() || {};
        }
      } catch (e) { }
    }
    return {};
  }

  /**
   * Mở modal chỉnh sửa tiêu đề cột
   * @param {Object} opts - { formName, fieldName, captionVN, captionEN, captionCH, formatId, alignX, minWidth, maxWidth, onSuccess }
   */
  function show(opts) {
    init();
    opts = opts || {};

    currentFormName = opts.formName || window._currentFormName || '';
    currentFieldName = opts.fieldName || '';

    if (!currentFieldName) {
      if (typeof UIToast !== 'undefined') UIToast.show('Thiếu thông tin FieldName', 'warning');
      return;
    }

    // Nạp cấu hình thực tế từ Tabulator / DB nếu opts thiếu
    var existingDef = findExistingColDef(currentFieldName);
    var savedCache = _lastSaved[currentFormName + '_' + currentFieldName] || _lastSaved['GLOBAL_' + currentFieldName] || {};

    var captionVN = savedCache.captionVN || opts.captionVN || opts.caption || opts.label || existingDef.title || existingDef.label || currentFieldName;
    var captionEN = savedCache.captionEN || opts.captionEN || existingDef.captionEN || currentFieldName;
    var captionCH = savedCache.captionCH || opts.captionCH || existingDef.captionCH || currentFieldName;

    var formatId = savedCache.formatId || opts.formatId || opts.FormatID || existingDef.formatId || existingDef.FormatID || existingDef.renderRule || '';

    // Đọc chính xác Align từ DB / Definition / Cache
    var rawAlign = savedCache.alignX || opts.alignX || opts.align || existingDef.alignX || existingDef.align || existingDef.hozAlign || '';
    rawAlign = String(rawAlign).toLowerCase().trim();
    if (rawAlign === 'r') rawAlign = 'right';
    if (rawAlign === 'l') rawAlign = 'left';
    if (rawAlign === 'c') rawAlign = 'center';
    if (['left', 'center', 'right'].indexOf(rawAlign) === -1) rawAlign = '';

    var minWidth = savedCache.minWidth !== undefined ? savedCache.minWidth : (opts.minWidth !== undefined ? opts.minWidth : (existingDef.minWidth || 0));
    var maxWidth = savedCache.maxWidth !== undefined ? savedCache.maxWidth : (opts.maxWidth !== undefined ? opts.maxWidth : (existingDef.maxWidth || 0));

    // Gán dữ liệu lên Form
    document.getElementById('col-editor-title').innerText = 'Thay đổi tiêu đề cột: ' + currentFieldName;
    document.getElementById('col-editor-fieldname-input').value = currentFieldName;

    document.getElementById('col-editor-caption-vn').value = captionVN;
    document.getElementById('col-editor-caption-en').value = captionEN;
    document.getElementById('col-editor-caption-ch').value = captionCH;

    document.getElementById('col-editor-align').value = rawAlign;
    document.getElementById('col-editor-minwidth').value = minWidth;
    document.getElementById('col-editor-maxwidth').value = maxWidth;

    loadFormatOptions(formatId);

    var btnSave = document.getElementById('col-editor-btn-save');
    btnSave.disabled = false;
    btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span> Lưu thay đổi';
    var newBtnSave = btnSave.cloneNode(true);
    btnSave.parentNode.replaceChild(newBtnSave, btnSave);

    newBtnSave.addEventListener('click', function () {
      var payload = {
        formName: currentFormName,
        fieldName: currentFieldName,
        captionVN: document.getElementById('col-editor-caption-vn').value.trim(),
        captionEN: document.getElementById('col-editor-caption-en').value.trim(),
        captionCH: document.getElementById('col-editor-caption-ch').value.trim(),
        formatId: document.getElementById('col-editor-format').value,
        alignX: document.getElementById('col-editor-align').value,
        minWidth: parseInt(document.getElementById('col-editor-minwidth').value) || 0,
        maxWidth: parseInt(document.getElementById('col-editor-maxwidth').value) || 0
      };

      newBtnSave.disabled = true;
      newBtnSave.innerText = 'Đang lưu...';

      if (window.FieldSyncService && typeof window.FieldSyncService.updateFieldConfig === 'function') {
        window.FieldSyncService.updateFieldConfig(payload)
          .then(function (res) {
            _lastSaved[currentFormName + '_' + currentFieldName] = payload;
            _lastSaved['GLOBAL_' + currentFieldName] = payload;
            newBtnSave.disabled = false;
            newBtnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span> Lưu thay đổi';
            hide();
            if (typeof UIToast !== 'undefined') {
              UIToast.show('Lưu tiêu đề thành công', 'success');
            }
            if (typeof opts.onSuccess === 'function') {
              opts.onSuccess(payload);
            }
          })
          .catch(function (err) {
            newBtnSave.disabled = false;
            newBtnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span> Lưu thay đổi';
            if (typeof UIToast !== 'undefined') {
              UIToast.show(err.message || 'Lỗi khi lưu tiêu đề', 'danger');
            }
          });
      } else {
        newBtnSave.disabled = false;
        newBtnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span> Lưu thay đổi';
        hide();
      }
    });

    modalOverlay.style.display = 'flex';
    setTimeout(function () {
      var inputVn = document.getElementById('col-editor-caption-vn');
      if (inputVn) { inputVn.focus(); inputVn.select(); }
    }, 100);
  }

  function hide() {
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  }

  return {
    show: show,
    hide: hide
  };
})();

window.ColumnCaptionEditorModal = ColumnCaptionEditorModal;
