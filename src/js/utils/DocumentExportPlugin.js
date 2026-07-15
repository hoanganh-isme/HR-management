/**
 * DocumentExportPlugin (HR-management Version)
 * ─────────────────────────────────────────────────────────────────────
 * Plugin cấu hình nút "Xuất tài liệu" cho các form quản lý nhân sự:
 *   WA_HopDongLaoDongFrm → Hợp đồng lao động & Thử việc (PK: MaHopDong)
 */
var DocumentExportPlugin = (function () {
  var DOC_API_BASE = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.BASE_API;

  var FORM_CONFIG = {
    'WA_HopDongLaoDongFrm': {
      docType: 'HR_HopDongLaoDongReport',
      label: 'Xuất Hợp Đồng',
      icon: 'description',
      altKeys: ['MaHopDong', 'maHopDong'],
      sqlListName: 'WA_HopDongLaoDongFrm',
      convertFields: []
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

  function _showTemplateSelectModal(row, config, onConfirm) {
    // Gọi API Gateway để lấy danh sách file mẫu cấu hình dưới CSDL
    var endpoint = (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.ROUTER)
      ? window.API_CONFIG.ENDPOINTS.ROUTER
      : '/api/API_Gateway_Router';

    var payload = {
      List: 'HR_HopDongAddfile',
      Func: 'View',
      Keyword: config.sqlListName || 'WA_HopDongLaoDongFrm'
    };

    // Tạo overlay nền mờ chờ tải dữ liệu (loading overlay)
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.45)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';

    var loadingText = document.createElement('div');
    loadingText.style.color = '#ffffff';
    loadingText.style.fontSize = '16px';
    loadingText.style.fontWeight = '600';
    loadingText.innerText = 'Đang tải danh sách mẫu...';
    overlay.appendChild(loadingText);
    document.body.appendChild(overlay);

    // Dùng ApiClient hoặc Fetch để lấy data
    var headers = { 'Content-Type': 'application/json' };
    var token = '';
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') {
      token = ApiClient.getCookie('auth_token');
    } else {
      var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    var fetchUrl = endpoint.startsWith('http') ? endpoint : (window.API_CONFIG.BASE_URL + endpoint);

    fetch(fetchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        // Gỡ loading text
        overlay.removeChild(loadingText);

        var records = [];
        if (res && res.records) records = res.records;
        else if (res && res.data) records = res.data;
        else if (Array.isArray(res)) records = res;

        var templates = [];
        if (records.length > 0) {
          templates = records.map(function (r) {
            return {
              id: r.TemplateFile || r.templateFile || r.templatefile,
              name: r.GhiChu || r.ghiChu || r.ghichu || r.TemplateFile || r.templateFile || r.templatefile,
              loaiHD: r.LoaiHD || r.loaiHD || r.loaihd
            };
          });
        } else {
          // Không có mẫu cấu hình dưới CSDL, hiển thị thông báo lỗi
          var errBox = document.createElement('div');
          errBox.style.backgroundColor = '#ffffff';
          errBox.style.padding = '24px';
          errBox.style.borderRadius = '12px';
          errBox.style.textAlign = 'center';
          errBox.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
          errBox.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';
          
          var errMsg = document.createElement('p');
          errMsg.innerText = 'Không tìm thấy mẫu hợp đồng nào được cấu hình trong CSDL (bảng HR_HopDongAddfile).';
          errMsg.style.color = '#ef4444';
          errMsg.style.fontSize = '14px';
          errMsg.style.fontWeight = '500';
          errMsg.style.margin = '0 0 16px 0';
          errBox.appendChild(errMsg);
          
          var btnClose = document.createElement('button');
          btnClose.innerText = 'Đóng';
          btnClose.style.padding = '8px 18px';
          btnClose.style.borderRadius = '8px';
          btnClose.style.border = 'none';
          btnClose.style.backgroundColor = '#64748b';
          btnClose.style.color = '#ffffff';
          btnClose.style.fontSize = '14px';
          btnClose.style.fontWeight = '600';
          btnClose.style.cursor = 'pointer';
          btnClose.addEventListener('click', function () {
            document.body.removeChild(overlay);
          });
          errBox.appendChild(btnClose);
          overlay.appendChild(errBox);
          return;
        }

        // --- XÂY DỰNG MODAL GIAO DIỆN CHỌN MẪU ---
        var container = document.createElement('div');
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '28px';
        container.style.borderRadius = '12px';
        container.style.width = '460px';
        container.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        container.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

        var title = document.createElement('h3');
        title.innerText = 'Chọn mẫu in Hợp đồng';
        title.style.margin = '0 0 8px 0';
        title.style.fontSize = '18px';
        title.style.fontWeight = '600';
        title.style.color = '#0f172a';
        container.appendChild(title);

        var desc = document.createElement('p');
        desc.innerText = 'Chọn một trong các mẫu hợp đồng dưới đây để xuất file:';
        desc.style.margin = '0 0 20px 0';
        desc.style.fontSize = '14px';
        desc.style.color = '#64748b';
        container.appendChild(desc);

        var radioGroup = document.createElement('div');
        radioGroup.style.display = 'flex';
        radioGroup.style.flexDirection = 'column';
        radioGroup.style.gap = '10px';
        radioGroup.style.margin = '0 0 24px 0';

        // Xác định mẫu được đề xuất dựa trên LoaiHD / LoaiHopDong từ dòng dữ liệu
        var rowLoaiHD = (row.LoaiHD || row.LoaiHopDong || '').toString().toLowerCase();

        var selectedId = templates[0].id;
        var matched = null;

        // Ưu tiên khớp chính xác theo LoaiHD/LoaiHopDong cấu hình CSDL
        for (var i = 0; i < templates.length; i++) {
          var tLoai = (templates[i].loaiHD || '').toLowerCase();
          if (tLoai && (rowLoaiHD.includes(tLoai) || tLoai.includes(rowLoaiHD))) {
            matched = templates[i];
            break;
          }
        }

        if (matched) {
          selectedId = matched.id;
        }

        templates.forEach(function (tpl) {
          var label = document.createElement('label');
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.gap = '12px';
          label.style.cursor = 'pointer';
          label.style.fontSize = '14px';
          label.style.color = '#334155';
          label.style.padding = '12px 14px';
          label.style.borderRadius = '8px';
          label.style.border = '1px solid #e2e8f0';
          label.style.transition = 'all 0.15s ease';
          
          var radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'tplSelect';
          radio.value = tpl.id;
          radio.style.cursor = 'pointer';
          radio.style.margin = '0';
          
          var textSpan = document.createElement('span');
          textSpan.innerText = tpl.name;
          textSpan.style.fontWeight = '500';

          if (tpl.id === selectedId) {
            radio.checked = true;
            label.style.borderColor = '#3b82f6';
            label.style.backgroundColor = '#eff6ff';
            textSpan.style.color = '#1d4ed8';
            
            var badge = document.createElement('span');
            badge.innerText = 'Đề xuất';
            badge.style.marginLeft = 'auto';
            badge.style.fontSize = '11px';
            badge.style.backgroundColor = '#dbeafe';
            badge.style.color = '#1e40af';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '9999px';
            badge.style.fontWeight = '600';
            
            label.appendChild(radio);
            label.appendChild(textSpan);
            label.appendChild(badge);
          } else {
            label.appendChild(radio);
            label.appendChild(textSpan);
          }

          radio.addEventListener('change', function () {
            var labels = radioGroup.querySelectorAll('label');
            labels.forEach(function (l) {
              l.style.borderColor = '#e2e8f0';
              l.style.backgroundColor = 'transparent';
              var span = l.querySelector('span:not([style*="margin-left"])');
              if (span) span.style.color = '#334155';
              var bg = l.querySelector('span[style*="margin-left"]');
              if (bg) l.removeChild(bg);
            });

            if (radio.checked) {
              label.style.borderColor = '#3b82f6';
              label.style.backgroundColor = '#eff6ff';
              textSpan.style.color = '#1d4ed8';
            }
          });

          radioGroup.appendChild(label);
        });
        container.appendChild(radioGroup);

        var actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '12px';

        var btnCancel = document.createElement('button');
        btnCancel.innerText = 'Hủy';
        btnCancel.style.padding = '10px 18px';
        btnCancel.style.borderRadius = '8px';
        btnCancel.style.border = '1px solid #cbd5e1';
        btnCancel.style.backgroundColor = '#ffffff';
        btnCancel.style.cursor = 'pointer';
        btnCancel.style.fontSize = '14px';
        btnCancel.style.fontWeight = '600';
        btnCancel.style.color = '#475569';
        btnCancel.addEventListener('click', function () {
          document.body.removeChild(overlay);
        });

        var btnConfirm = document.createElement('button');
        btnConfirm.innerText = 'Xuất Hợp Đồng';
        btnConfirm.style.padding = '10px 18px';
        btnConfirm.style.borderRadius = '8px';
        btnConfirm.style.border = 'none';
        btnConfirm.style.backgroundColor = '#3b82f6';
        btnConfirm.style.cursor = 'pointer';
        btnConfirm.style.fontSize = '14px';
        btnConfirm.style.fontWeight = '600';
        btnConfirm.style.color = '#ffffff';
        btnConfirm.addEventListener('click', function () {
          var selectedRadio = radioGroup.querySelector('input[name="tplSelect"]:checked');
          if (selectedRadio) {
            onConfirm(selectedRadio.value);
          }
          document.body.removeChild(overlay);
        });

        actions.appendChild(btnCancel);
        actions.appendChild(btnConfirm);
        container.appendChild(actions);

        overlay.appendChild(container);
      })
      .catch(function (err) {
        console.error('[DocumentExportPlugin] Lỗi tải mẫu CSDL:', err);
        overlay.removeChild(loadingText);
        
        // Hiện thông báo lỗi và tự động gỡ overlay
        var errBox = document.createElement('div');
        errBox.style.backgroundColor = '#ffffff';
        errBox.style.padding = '24px';
        errBox.style.borderRadius = '8px';
        errBox.style.textAlign = 'center';
        
        var errMsg = document.createElement('p');
        errMsg.innerText = 'Không thể kết nối đến máy chủ hoặc tải danh sách mẫu từ CSDL.';
        errMsg.style.color = '#ef4444';
        errMsg.style.margin = '0 0 16px 0';
        errBox.appendChild(errMsg);
        
        var btnClose = document.createElement('button');
        btnClose.innerText = 'Đóng';
        btnClose.style.padding = '8px 16px';
        btnClose.style.borderRadius = '6px';
        btnClose.style.border = 'none';
        btnClose.style.backgroundColor = '#6b7280';
        btnClose.style.color = '#ffffff';
        btnClose.style.cursor = 'pointer';
        btnClose.addEventListener('click', function () {
          document.body.removeChild(overlay);
        });
        errBox.appendChild(btnClose);
        overlay.appendChild(errBox);
      });
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

    // Đọc tên file mẫu từ dữ liệu dòng hoặc cấu hình
    var actualDocType = config.docType;
    if (row.TemplateFile && !config.ignoreTemplateFile) {
      actualDocType = row.TemplateFile;
    } else if (typeof config.getDocType === 'function') {
      actualDocType = config.getDocType(row);
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

    var headers = { 'Content-Type': 'application/json' };
    var token = '';
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') {
      token = ApiClient.getCookie('auth_token');
    } else {
      var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    fetch(DOC_API_BASE + '/generate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        templateType: actualDocType,
        // documentId is the internal HR-neutral name. Keep customerId as a
        // compatibility alias because the document API still accepts it.
        documentId: docId,
        customerId: docId,
        outputFileName: actualDocType + '_' + docId,
        rowData: row,
        sqlListName: config.sqlListName,
        convertFields: config.convertFields || [],
        // branchId từ localStorage (backend sẽ tự xác thực lại bằng SY_User)
        branchId: (function() {
          try { return (JSON.parse(localStorage.getItem('pmql_user') || '{}')).BranchID || null; } catch(e) { return null; }
        })()
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

    var buttons = [{
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
        _showTemplateSelectModal(row, config, function (selectedTemplate) {
          var customConfig = Object.assign({}, config, {
            docType: selectedTemplate,
            ignoreTemplateFile: true
          });
          _generateDocument(row, customConfig);
        });
      }
    }];

    // Thêm nút xem kho lưu trữ hợp đồng
    buttons.push({
      id: 'btn-view-docmgr',
      text: 'Quản lý Hợp Đồng',
      icon: 'folder_open',
      type: 'tool',
      onClick: function () {
        window.location.hash = '#/document-manager';
      }
    });

    return buttons;
  }

  // Đăng ký Plugin vào hệ thống
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return { getExtraButtons: getExtraButtons };
})();
