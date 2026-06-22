/**
 * DocumentExportPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin cấu hình nút "Xuất tài liệu" cho các form:
 *   frmHopDong   → Hợp đồng tiệc     (PK: Sohopdong)
 *   frmBiennhancoccho    → Biên nhận đặt cọc (PK: MaChungTu)
 *   frmQuyetToan → Quyết toán        (PK: Sohopdong)
 */
var DocumentExportPlugin = (function () {
  var DOC_API_BASE = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.BASE_API;

  var FORM_CONFIG = {
    'frmHopDong': {
      docType: 'hop_dong',
      label: 'Xuất Hợp Đồng',
      icon: 'description',
      altKeys: ['Sohopdong', 'sohopdong', 'SoHopDong']
    },
    'frmBiennhancoccho': {
      docType: 'dat_coc',
      label: 'Xuất Biên Nhận Cọc',
      icon: 'receipt_long',
      altKeys: ['MaChungTu', 'maChungTu', 'DocumentID', 'SoPhieu']
    },
    'frmQuyetToan': {
      docType: 'quyet_toan',
      label: 'Xuất Quyết Toán',
      icon: 'receipt',
      altKeys: ['Sohopdong', 'sohopdong', 'SoHopDong']
    }
  };

  function _getPrimaryKey(row, config) {
    if (!row) return null;
    for (var i = 0; i < config.altKeys.length; i++) {
      var v = row[config.altKeys[i]];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return null;
  }

  function _generateDocument(row, config) {
    var docId = _getPrimaryKey(row, config);
    if (!docId) {
      if (typeof Alert !== 'undefined') {
        Alert.error('Lỗi', 'Không tìm thấy mã chứng từ của dòng này. Kiểm tra lại cấu hình primaryKey.');
      } else {
        alert('Không tìm thấy ID của dòng này!');
      }
      return;
    }

    var btn = document.getElementById('btn-export-doc-' + config.docType);
    var originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;animation:spin 1s linear infinite;">autorenew</span><span class="d-none d-md-inline">Đang xuất...</span>';
    }

    if (!document.getElementById('__dep_spin__')) {
      var ks = document.createElement('style');
      ks.id = '__dep_spin__';
      ks.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
      document.head.appendChild(ks);
    }

    fetch(DOC_API_BASE + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: config.docType,
        customerId: docId,
        outputFileName: config.docType + '_' + docId,
        rowData: row
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          if (typeof Toast !== 'undefined') {
            Toast.show({ message: 'Đã tạo tài liệu: ' + json.fileName, type: 'success' });
          }
          sessionStorage.setItem('docmgr_open_file', json.fileName);
          window.location.hash = '#/document-manager';
        } else {
          if (typeof Alert !== 'undefined') {
            Alert.error('Lỗi xuất tài liệu', json.message || 'Không xác định');
          }
        }
      })
      .catch(function (err) {
        if (typeof Alert !== 'undefined') {
          Alert.error('Lỗi kết nối', 'Không thể kết nối tới Document Server.');
        }
        console.error('[DocumentExportPlugin]', err);
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
        }
      });
  }

  function getExtraButtons(formName, getSelectedRows) {
    var config = FORM_CONFIG[formName];
    if (!config) return [];

    return [{
      id: 'btn-export-doc-' + config.docType,
      text: config.label,
      icon: config.icon,
      type: 'tool',
      onClick: function () {
        var selectedRows = getSelectedRows();
        if (!selectedRows || selectedRows.length !== 1) {
          if (typeof Alert !== 'undefined') {
            Alert.warning('Chưa chọn dữ liệu', 'Vui lòng chọn 1 dòng duy nhất để xuất tài liệu.');
          } else {
            alert('Vui lòng chọn 1 dòng để xuất tài liệu!');
          }
          return;
        }

        var row = selectedRows[0];
        var st = (row.Status || row.TrangThai || '').toString().toLowerCase();
        if (st.includes('đã ký')) {
          if (typeof Alert !== 'undefined') {
            Alert.warning('Bị khóa', 'Không thể xuất lại file cho Hợp đồng/Phiếu đã chốt (Đã ký).');
          } else {
            alert('Không thể xuất lại file cho Hợp đồng/Phiếu đã chốt (Đã ký).');
          }
          return;
        }

        _generateDocument(row, config);
      }
    }];
  }

  // Đăng ký Plugin vào hệ thống
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return { getExtraButtons: getExtraButtons };
})();
