/**
 * Trách nhiệm: điều phối giao diện chọn mẫu, OnlyOffice và finalize hợp đồng.
 * Đầu vào: dòng hợp đồng từ form WA_HopDongLaoDongFrm.
 * Đầu ra: draft được lưu chính thức hoặc thông báo lỗi để thử lại.
 * Nơi gọi: DocumentExportPlugin và nút xuất hợp đồng.
 */
window.ContractDocumentActions = (function () {
  var editorInstance = null;
  var activeDraftId = null;
  var activeEditorConfig = null;
  var activeTemplateWorkspaceId = null;

  function layMaHopDong(row) {
    return row && (row.MaHopDong || row.maHopDong) ? String(row.MaHopDong || row.maHopDong) : '';
  }

  function thongBao(message, type) {
    if (typeof Toast !== 'undefined') Toast.show({ message: message, type: type || 'info' });
    else if (typeof Alert !== 'undefined') (type === 'error' ? Alert.error('Lỗi', message) : Alert.warning('Thông báo', message));
  }

  function dongEditor() {
    if (editorInstance && typeof editorInstance.destroyEditor === 'function') {
      try { editorInstance.destroyEditor(); } catch (error) { /* OnlyOffice đã tự đóng */ }
    }
    editorInstance = null;
    var overlay = document.getElementById('contract-document-editor-overlay');
    if (overlay) overlay.remove();
    activeDraftId = null;
    activeTemplateWorkspaceId = null;
    activeEditorConfig = null;
  }

  function taiOnlyOfficeApi(documentServerUrl) {
    return new Promise(function (resolve, reject) {
      if (window.DocsAPI) { resolve(); return; }
      var currentScript = document.getElementById('__contract_onlyoffice_api__');
      if (currentScript) {
        var attempts = 0;
        var interval = setInterval(function () {
          if (window.DocsAPI) { clearInterval(interval); resolve(); }
          else if (++attempts > 60) { clearInterval(interval); reject(new Error('Không tải được OnlyOffice API.')); }
        }, 250);
        return;
      }
      var script = document.createElement('script');
      script.id = '__contract_onlyoffice_api__';
      script.src = String(documentServerUrl).replace(/\/+$/, '') + '/web-apps/apps/api/documents/api.js';
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Không thể kết nối OnlyOffice Document Server.')); };
      document.head.appendChild(script);
    });
  }

  function taoKhungEditor(draft) {
    var overlay = document.createElement('div');
    overlay.id = 'contract-document-editor-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#f8fafc;z-index:100000;display:flex;flex-direction:column;';
    overlay.innerHTML = [
      '<div style="height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:#fff;border-bottom:1px solid #e2e8f0;gap:12px;">',
      '<div style="min-width:0;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">',
      '<span class="material-symbols-outlined" style="vertical-align:middle;color:#4f46e5;">description</span> ',
      'Chỉnh sửa hợp đồng: <span id="contract-document-editor-title"></span></div>',
      '<div style="display:flex;align-items:center;gap:8px;">',
      '<button type="button" id="contract-document-preview" class="btn btn-outline-secondary"><span class="material-symbols-outlined">visibility</span> Xem bản nháp</button>',
      '<button type="button" id="contract-document-finalize" class="btn btn-primary"><span class="material-symbols-outlined">save</span> Lưu hợp đồng</button>',
      '<button type="button" id="contract-document-close" class="btn btn-icon" title="Đóng"><span class="material-symbols-outlined">close</span></button>',
      '</div></div>',
      '<div id="contract-document-editor-area" style="flex:1;min-height:0;"></div>'
    ].join('');
    document.body.appendChild(overlay);
    document.getElementById('contract-document-editor-title').textContent = draft.fileName || draft.maHopDong;
    return overlay;
  }

  function choPhepLuu() {
    var button = document.getElementById('contract-document-finalize');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="material-symbols-outlined">sync</span> Đang đồng bộ...';
    }
  }

  function doiCallbackCuoi(draftId, soLanThu) {
    return ContractDocumentApi.draftStatus(draftId).then(function (response) {
      if (response.draft && response.draft.finalCallbackCompleted) return response.draft;
      if (soLanThu >= 15) throw new Error('OnlyOffice chưa hoàn tất callback cuối. Bản nháp vẫn được giữ lại.');
      return new Promise(function (resolve) { setTimeout(resolve, 2000); }).then(function () { return doiCallbackCuoi(draftId, soLanThu + 1); });
    });
  }

  function finalizeDraft() {
    if (!activeDraftId) return;
    choPhepLuu();
    if (editorInstance && typeof editorInstance.requestClose === 'function') {
      try { editorInstance.requestClose(); } catch (error) { /* tiếp tục chờ callback */ }
    }
    doiCallbackCuoi(activeDraftId, 0)
      .then(function () { return ContractDocumentApi.finalizeDraft(activeDraftId); })
      .then(function (response) {
        thongBao('Đã lưu hợp đồng vào tài liệu đính kèm. ID: ' + response.attachment.UserAutoID, 'success');
        if (typeof EventBus !== 'undefined') EventBus.emit('contract:attachment-saved', { maHopDong: activeEditorConfig.draft.maHopDong });
        dongEditor();
      })
      .catch(function (error) {
        thongBao(error.message || 'Không thể lưu hợp đồng. Bản nháp vẫn được giữ lại.', 'error');
        var button = document.getElementById('contract-document-finalize');
        if (button) { button.disabled = false; button.innerHTML = '<span class="material-symbols-outlined">save</span> Lưu hợp đồng'; }
      });
  }

  function moTrinhSuaHopDong(draft) {
    activeDraftId = draft.draftId;
    return ContractDocumentApi.editorConfig(activeDraftId).then(function (config) {
      activeEditorConfig = config;
      var overlay = taoKhungEditor(config.draft);
      document.getElementById('contract-document-preview').addEventListener('click', function () {
        window.open(config.previewUrl, '_blank', 'noopener');
      });
      document.getElementById('contract-document-finalize').addEventListener('click', finalizeDraft);
      document.getElementById('contract-document-close').addEventListener('click', function () {
        ContractDocumentApi.deleteDraft(activeDraftId).finally(dongEditor);
      });
      return taiOnlyOfficeApi(config.documentServerUrl).then(function () {
        editorInstance = new DocsAPI.DocEditor('contract-document-editor-area', config.editorConfig);
        return overlay;
      });
    });
  }

  function chonMau(row, templates) {
    return new Promise(function (resolve, reject) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
      var box = document.createElement('div');
      box.style.cssText = 'width:min(520px,100%);background:#fff;border-radius:10px;padding:22px;box-shadow:0 16px 48px rgba(15,23,42,.2);';
      box.innerHTML = '<h3 style="margin:0 0 6px;color:#1e293b;">Chọn mẫu hợp đồng</h3><p style="margin:0 0 16px;color:#64748b;font-size:13px;">Mẫu được đọc từ HR_HopDongAddfile.</p>';
      var list = document.createElement('div');
      list.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-height:340px;overflow:auto;';
      var firstRadio = null;
      templates.filter(function (template) { return template.available; }).forEach(function (template, index) {
        var label = document.createElement('label');
        label.style.cssText = 'display:flex;gap:10px;align-items:flex-start;border:1px solid #e2e8f0;border-radius:8px;padding:11px;cursor:pointer;';
        label.innerHTML = '<input type="radio" name="contract-template" value="' + String(template.templateFile).replace(/"/g, '&quot;') + '"><span><strong>' + (template.ghiChu || template.templateFile) + '</strong><br><small style="color:#64748b;">' + template.templateFile + '</small></span>';
        list.appendChild(label);
        if (index === 0) { firstRadio = label.querySelector('input'); firstRadio.checked = true; }
      });
      box.appendChild(list);
      var actions = document.createElement('div');
      actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px;';
      actions.innerHTML = '<button type="button" class="btn btn-outline-secondary" data-cancel>Hủy</button><button type="button" class="btn btn-primary" data-confirm>Tiếp tục</button>';
      box.appendChild(actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      actions.querySelector('[data-cancel]').onclick = function () { overlay.remove(); reject(new Error('CANCELLED')); };
      actions.querySelector('[data-confirm]').onclick = function () {
        var selected = box.querySelector('input[name="contract-template"]:checked');
        if (!selected) { thongBao('Chưa có mẫu hợp đồng khả dụng.', 'error'); return; }
        overlay.remove();
        resolve(selected.value);
      };
      if (!firstRadio) thongBao('Không có file mẫu khả dụng trên máy chủ.', 'error');
    });
  }

  function xuatHopDong(row) {
    var maHopDong = layMaHopDong(row);
    if (!maHopDong) { thongBao('Không tìm thấy mã hợp đồng.', 'error'); return Promise.reject(new Error('MISSING_CONTRACT_ID')); }
    return ContractDocumentApi.listTemplates()
      .then(function (response) { return chonMau(row, response.data || []); })
      .then(function (templateFile) {
        thongBao('Đang tạo bản nháp hợp đồng...', 'info');
        return ContractDocumentApi.createDraft({ maHopDong: maHopDong, templateFile: templateFile });
      })
      .then(function (response) { return moTrinhSuaHopDong(response.draft); })
      .catch(function (error) {
        if (error && error.message !== 'CANCELLED') thongBao(error.message || 'Không thể tạo bản nháp hợp đồng.', 'error');
        throw error;
      });
  }

  function doiCallbackMau(workspaceId, soLanThu) {
    return ContractDocumentApi.templateWorkspaceStatus(workspaceId).then(function (response) {
      if (response.workspace && response.workspace.finalCallbackCompleted) return response.workspace;
      if (soLanThu >= 15) throw new Error('OnlyOffice chưa hoàn tất callback cuối của mẫu. Workspace vẫn được giữ lại.');
      return new Promise(function (resolve) { setTimeout(resolve, 2000); }).then(function () { return doiCallbackMau(workspaceId, soLanThu + 1); });
    });
  }

  function apDungMauHopDong() {
    var button = document.getElementById('contract-document-finalize');
    if (button) { button.disabled = true; button.innerHTML = '<span class="material-symbols-outlined">sync</span> Đang kiểm tra...'; }
    if (editorInstance && typeof editorInstance.requestClose === 'function') {
      try { editorInstance.requestClose(); } catch (error) { /* tiếp tục chờ callback */ }
    }
    doiCallbackMau(activeTemplateWorkspaceId, 0)
      .then(function () { return ContractDocumentApi.templatePlaceholders(activeTemplateWorkspaceId); })
      .then(function (response) {
        var placeholders = response.data || [];
        var dongY = window.confirm('Mẫu có ' + placeholders.length + ' placeholder. Áp dụng mẫu mới và tạo backup mẫu cũ?');
        if (!dongY) throw new Error('CANCELLED');
        return ContractDocumentApi.applyTemplateWorkspace(activeTemplateWorkspaceId);
      })
      .then(function (response) {
        thongBao('Đã áp dụng mẫu. Backup: ' + response.result.backupFile, 'success');
        if (typeof EventBus !== 'undefined') EventBus.emit('contract:template-applied', response.result);
        dongEditor();
      })
      .catch(function (error) {
        if (error.message !== 'CANCELLED') thongBao(error.message || 'Không thể áp dụng mẫu hợp đồng.', 'error');
        if (button) { button.disabled = false; button.innerHTML = '<span class="material-symbols-outlined">published_with_changes</span> Áp dụng mẫu'; }
      });
  }

  function moTrinhSuaMau(templateFile) {
    thongBao('Đang tạo workspace chỉnh sửa mẫu...', 'info');
    return ContractDocumentApi.createTemplateWorkspace(templateFile)
      .then(function (response) {
        activeTemplateWorkspaceId = response.workspace.workspaceId;
        return ContractDocumentApi.templateEditorConfig(activeTemplateWorkspaceId);
      })
      .then(function (config) {
        activeEditorConfig = config;
        var overlay = taoKhungEditor({ fileName: config.workspace.templateFile });
        document.getElementById('contract-document-editor-title').textContent = 'Mẫu: ' + config.workspace.templateFile;
        var saveButton = document.getElementById('contract-document-finalize');
        saveButton.innerHTML = '<span class="material-symbols-outlined">published_with_changes</span> Áp dụng mẫu';
        saveButton.addEventListener('click', apDungMauHopDong);
        document.getElementById('contract-document-preview').addEventListener('click', function () { window.open(config.previewUrl, '_blank', 'noopener'); });
        document.getElementById('contract-document-close').addEventListener('click', function () {
          ContractDocumentApi.deleteTemplateWorkspace(activeTemplateWorkspaceId).finally(dongEditor);
        });
        return taiOnlyOfficeApi(config.documentServerUrl).then(function () {
          editorInstance = new DocsAPI.DocEditor('contract-document-editor-area', config.editorConfig);
          return overlay;
        });
      });
  }

  return { xuatHopDong: xuatHopDong, moBanNhap: moTrinhSuaHopDong, moTrinhSuaHopDong: moTrinhSuaHopDong, moTrinhSuaMau: moTrinhSuaMau, dongEditor: dongEditor };
})();
