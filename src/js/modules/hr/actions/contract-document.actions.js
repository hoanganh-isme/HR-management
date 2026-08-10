var ContractDocumentActions = (function (global) {
  'use strict';

  var onlyOfficeLoader = null;

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function notify(type, title, message) {
    var titleStr = title || (type === 'error' ? 'Lỗi' : 'Thành công');
    var msgStr = message || '';
    if (global.Alert && typeof global.Alert[type] === 'function') {
      global.Alert[type](titleStr, msgStr);
      return;
    }
    if (global.Swal && typeof global.Swal.fire === 'function') {
      global.Swal.fire({
        icon: type === 'error' ? 'error' : 'success',
        title: titleStr,
        text: msgStr,
        timer: 2500,
        showConfirmButton: false
      });
      return;
    }
    if (global.UIToast && typeof global.UIToast.show === 'function') {
      global.UIToast.show((titleStr ? titleStr + ': ' : '') + msgStr, type === 'error' ? 'error' : type);
      return;
    }
    global.alert((titleStr ? titleStr + ': ' : '') + msgStr);
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
  }

  function checkBackend() {
    return ContractDocumentApi.health().catch(function (error) {
      if (error && error.code === 'AUTH_SESSION_MISSING') throw error;
      var message = 'Không kết nối được Document API. Hãy mở backend-app và chạy npm run dev.';
      error.message = message + (error.message ? ' Chi tiết: ' + error.message : '');
      throw error;
    });
  }

  function loadOnlyOffice(publicUrl) {
    if (global.DocsAPI && global.DocsAPI.DocEditor) return Promise.resolve();
    if (onlyOfficeLoader) return onlyOfficeLoader;
    onlyOfficeLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = String(publicUrl).replace(/\/$/, '') + '/web-apps/apps/api/documents/api.js';
      script.async = true;
      script.onload = function () {
        if (global.DocsAPI && global.DocsAPI.DocEditor) resolve();
        else reject(new Error('OnlyOffice đã phản hồi nhưng không có DocsAPI.'));
      };
      script.onerror = function () { reject(new Error('Không tải được OnlyOffice API.')); };
      document.head.appendChild(script);
    }).catch(function (error) {
      onlyOfficeLoader = null;
      throw error;
    });
    return onlyOfficeLoader;
  }

  function createButton(text, action, primary) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = primary ? 'contract-doc-btn is-primary' : 'contract-doc-btn';
    button.textContent = text;
    button.dataset.action = action;
    return button;
  }

  function chooseTemplate(templates, row, title) {
    return new Promise(function (resolve) {
      var available = (templates || []).filter(function (item) { return item.available; });
      if (!available.length) {
        notify('error', 'Thiếu mẫu DOCX', 'Không có mẫu đã đăng ký nào tồn tại trong backend-app/samples.');
        resolve(null);
        return;
      }

      var overlay = document.createElement('div');
      overlay.className = 'contract-doc-overlay';
      var modal = document.createElement('div');
      modal.className = 'contract-doc-picker';
      var heading = document.createElement('h3');
      heading.textContent = title;
      var description = document.createElement('p');
      description.textContent = 'Chọn đúng file mẫu DOCX đã đăng ký trong HR_HopDongAddfile.';
      var list = document.createElement('div');
      list.className = 'contract-doc-template-list';
      var rowType = String((row && (row.LoaiHD || row.LoaiHopDong)) || '').toLowerCase();
      var selected = available.find(function (item) {
        return rowType && String(item.loaiHD || '').toLowerCase() === rowType;
      }) || available[0];

      available.forEach(function (item) {
        var label = document.createElement('label');
        label.className = 'contract-doc-template-option';
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'contract-doc-template';
        radio.value = item.templateFile;
        radio.checked = item.templateFile === selected.templateFile;
        var text = document.createElement('span');
        var itemTitle = item.description || item.loaiHD || item.templateFile;
        text.textContent = itemTitle === item.templateFile
          ? item.templateFile
          : itemTitle + ' — ' + item.templateFile;
        label.appendChild(radio);
        label.appendChild(text);
        list.appendChild(label);
      });

      var actions = document.createElement('div');
      actions.className = 'contract-doc-picker-actions';
      var cancel = createButton('Hủy', 'cancel');
      var confirm = createButton('Tiếp tục', 'confirm', true);
      actions.appendChild(cancel);
      actions.appendChild(confirm);
      modal.appendChild(heading);
      modal.appendChild(description);
      modal.appendChild(list);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      function close(value) {
        overlay.remove();
        resolve(value);
      }
      cancel.onclick = function (event) { event.preventDefault(); event.stopPropagation(); close(null); };
      confirm.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var checked = list.querySelector('input:checked');
        close(checked ? checked.value : null);
      };
    });
  }

  function openFilePicker(onFile) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = function () {
      if (input.files && input.files[0]) onFile(input.files[0]);
    };
    input.click();
  }

  function download(url) {
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }

  function retryAfterOnlyOfficeSave(action, remaining) {
    return action().catch(function (error) {
      if (error.status === 409 && remaining > 0) {
        return delay(1500).then(function () { return retryAfterOnlyOfficeSave(action, remaining - 1); });
      }
      throw error;
    });
  }

  function showEditor(initialData, options) {
    var state = { data: initialData, editor: null, closed: false };
    // Keep the SPA route stable while OnlyOffice is mounted. Menu/permission
    // synchronization can otherwise render the same route again underneath it.
    global.__contractDocumentEditorOpen = true;
    var overlay = document.createElement('div');
    overlay.className = 'contract-doc-editor-overlay';
    var shell = document.createElement('div');
    shell.className = 'contract-doc-editor-shell';
    var header = document.createElement('div');
    header.className = 'contract-doc-editor-header';
    var title = document.createElement('strong');
    title.textContent = options.title;
    var toolbar = document.createElement('div');
    toolbar.className = 'contract-doc-toolbar';
    var status = document.createElement('div');
    status.className = 'contract-doc-status';
    var editorArea = document.createElement('div');
    editorArea.className = 'contract-doc-editor-area';
    editorArea.id = 'contract-doc-editor-' + Date.now();

    toolbar.appendChild(createButton('Phóng to / Thu nhỏ', 'fullscreen'));
    toolbar.appendChild(createButton('Xem trước', 'preview'));
    toolbar.appendChild(createButton('Tải DOCX', 'download'));
    toolbar.appendChild(createButton('Tải bản đã sửa lên', 'upload'));
    if (options.kind === 'draft') toolbar.appendChild(createButton('Lưu vào hợp đồng', 'finalize', true));
    if (options.kind === 'template') {
      toolbar.appendChild(createButton('Kiểm tra mẫu', 'validate'));
      toolbar.appendChild(createButton('Áp dụng mẫu', 'apply', true));
    }
    var retryEditorButton = createButton('Kết nối lại', 'retry');
    retryEditorButton.hidden = true;
    toolbar.appendChild(retryEditorButton);
    toolbar.appendChild(createButton('Đóng', 'close'));
    header.appendChild(title);
    header.appendChild(toolbar);
    shell.appendChild(header);
    shell.appendChild(status);
    shell.appendChild(editorArea);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);

    function setStatus(message, error) {
      status.textContent = message || '';
      status.classList.toggle('is-error', Boolean(error));
      status.classList.toggle('is-active', Boolean(message && !error && message.indexOf('sẵn sàng') === -1));
    }

    function showLoadingOverlay(titleText, subtitleText) {
      hideLoadingOverlay();
      var loader = document.createElement('div');
      loader.className = 'contract-doc-loading-overlay';
      loader.id = 'contract-doc-loading-overlay';
      loader.innerHTML = '<div class="contract-doc-loading-box">' +
        '<div class="contract-doc-spinner"></div>' +
        '<div class="contract-doc-loading-title">' + escapeHTML(titleText || 'Đang xử lý...') + '</div>' +
        '<div class="contract-doc-loading-sub">' + escapeHTML(subtitleText || 'Vui lòng chờ trong giây lát...') + '</div>' +
        '</div>';
      shell.appendChild(loader);
    }

    function hideLoadingOverlay() {
      var existing = shell.querySelector('#contract-doc-loading-overlay');
      if (existing) existing.remove();
    }

    function destroyEditor() {
      if (state.editor && typeof state.editor.destroyEditor === 'function') {
        try { state.editor.destroyEditor(); } catch (ignore) { /* no-op */ }
      }
      state.editor = null;
    }

    function mountEditor() {
      destroyEditor();
      editorArea.innerHTML = '';
      setStatus('Đang khởi tạo trình soạn thảo hợp đồng...', false);
      showLoadingOverlay('Đang tải văn bản...', 'Vui lòng chờ trình soạn thảo nạp nội dung hợp đồng...');
      return loadOnlyOffice(state.data.onlyOfficePublicUrl).then(function () {
        if (state.closed) return;
        retryEditorButton.hidden = true;
        var editorCfg = state.data.editorConfig || {};
        var existingEvents = editorCfg.events || {};
        editorCfg.events = Object.assign({}, existingEvents, {
          onAppReady: function () {
            hideLoadingOverlay();
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
            if (existingEvents.onAppReady) existingEvents.onAppReady();
          },
          onDocumentReady: function () {
            hideLoadingOverlay();
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
            if (existingEvents.onDocumentReady) existingEvents.onDocumentReady();
          }
        });
        state.editor = new global.DocsAPI.DocEditor(editorArea.id, editorCfg);
        setStatus('Trình soạn thảo đã sẵn sàng. Bạn có thể chỉnh sửa trực tiếp hoặc tải file DOCX về máy.', false);
        setTimeout(hideLoadingOverlay, 3500);
      }).catch(function (error) {
        hideLoadingOverlay();
        retryEditorButton.hidden = false;
        var serviceUrl = String(state.data.onlyOfficePublicUrl || '').replace(/\/$/, '');
        editorArea.innerHTML = '<div class="contract-doc-offline"><strong>OnlyOffice chưa chạy tại ' + escapeHTML(serviceUrl) + '.</strong><span>Hãy khởi động Docker Desktop và dịch vụ OnlyOffice, sau đó bấm “Kết nối lại”. Bạn vẫn có thể tải DOCX, sửa bằng Microsoft Word / WPS Office rồi tải lên lại.</span></div>';
        setStatus((error && error.message ? error.message + ' ' : '') + 'Không kết nối được dịch vụ OnlyOffice.', true);
      });
    }

    function refreshEditor() {
      return options.loadEditor().then(function (data) {
        state.data = data;
        return mountEditor();
      });
    }

    function close() {
      state.closed = true;
      destroyEditor();
      hideLoadingOverlay();
      overlay.remove();
      global.__contractDocumentEditorOpen = false;
    }

    toolbar.onclick = function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      var action = button.dataset.action;
      if (action === 'fullscreen') {
        overlay.classList.toggle('is-fullscreen');
        return;
      }
      if (action === 'preview') return global.open(state.data.previewUrl, '_blank', 'noopener');
      if (action === 'download') return download(state.data.downloadUrl);
      if (action === 'close') return close();
      if (action === 'retry') {
        button.disabled = true;
        return mountEditor().finally(function () { button.disabled = false; });
      }
      if (action === 'upload') {
        return openFilePicker(function (file) {
          button.disabled = true;
          setStatus('Đang tải bản tài liệu mới...', false);
          showLoadingOverlay('Đang tải file lên...', 'Vui lòng chờ hệ thống cập nhật tài liệu mới.');
          options.upload(file).then(function () {
            hideLoadingOverlay();
            notify('success', 'Thành công', 'Đã cập nhật bản tài liệu mới.');
            return refreshEditor();
          }).catch(function (error) {
            hideLoadingOverlay();
            notify('error', 'Không tải được file', error.message);
            setStatus(error.message, true);
          }).finally(function () { button.disabled = false; });
        });
      }
      if (action === 'validate') {
        button.disabled = true;
        return options.validate().then(function (result) {
          var valid = result.valid.length ? result.valid.join(', ') : '(không có)';
          var unknown = result.unknown.length ? result.unknown.join(', ') : '(không có)';
          global.alert('Trường dữ liệu hợp lệ:\n' + valid + '\n\nTrường chưa xác định:\n' + unknown);
        }).catch(function (error) { notify('error', 'Kiểm tra thất bại', error.message); })
          .finally(function () { button.disabled = false; });
      }
      if (action === 'finalize' || action === 'apply') {
        button.disabled = true;
        var loadingTitle = action === 'finalize' ? 'Đang lưu hợp đồng...' : 'Đang áp dụng mẫu...';
        var loadingSub = action === 'finalize'
          ? 'Hệ thống đang đồng bộ phiên bản hợp đồng vừa chỉnh sửa...'
          : 'Hệ thống đang đồng bộ và cập nhật mẫu mới...';
        setStatus('Đang đồng bộ dữ liệu...', false);
        showLoadingOverlay(loadingTitle, loadingSub);

        // Kích hoạt OnlyOffice đẩy bản ghi chỉnh sửa mới nhất về backend
        if (state.editor && typeof state.editor.serviceCommand === 'function') {
          try {
            state.editor.serviceCommand('forcesave');
          } catch (e) {
            console.warn('[OnlyOffice] forcesave:', e);
          }
        }

        // Đóng trình biên tập để OnlyOffice gửi callback lưu phiên làm việc cuối cùng
        destroyEditor();

        // Chờ 1.5s để backend hoàn tất tải file DOCX mới nhất ghi vào ổ đĩa trước khi áp dụng
        return delay(1500).then(function () {
          return options.complete();
        }).then(function (result) {
          hideLoadingOverlay();
          close();
          var successMsg = action === 'finalize'
            ? 'Hợp đồng đã được lưu thành công vào CSDL và danh sách tài liệu đính kèm!'
            : 'Mẫu hợp đồng mới đã được áp dụng thành công!';
          notify('success', 'Thành công', successMsg);
          if (action === 'finalize') {
            if (global.DynamicFormEngine && typeof global.DynamicFormEngine.reloadDetailTabs === 'function') {
              global.DynamicFormEngine.reloadDetailTabs();
            } else if (typeof options.onReload === 'function') {
              options.onReload();
            }
          }
        }).catch(function (error) {
          hideLoadingOverlay();
          notify('error', action === 'finalize' ? 'Không thể lưu hợp đồng' : 'Không thể áp dụng mẫu', error.message);
          setStatus(error.message, true);
          button.disabled = false;
          return refreshEditor();
        });
      }
    };

    mountEditor();
  }

  function exportContract(row, documentOptions, onReload) {
    var primaryKey = documentOptions.primaryKey || 'MaHopDong';
    var maHopDong = row && row[primaryKey];
    if (!maHopDong) {
      notify('error', 'Thiếu mã hợp đồng', 'Dòng được chọn không có ' + primaryKey + '.');
      return Promise.resolve();
    }
    return checkBackend()
      .then(function () { return ContractDocumentApi.templates(); })
      .then(function (templates) { return chooseTemplate(templates, row, 'Chọn mẫu xuất hợp đồng'); })
      .then(function (templateFile) {
        if (!templateFile) return null;
        return ContractDocumentApi.createDraft({ maHopDong: maHopDong, templateFile: templateFile });
      })
      .then(function (draft) {
        if (!draft) return null;
        return ContractDocumentApi.draftEditor(draft.draftId).then(function (editor) {
          showEditor(editor, {
            kind: 'draft',
            title: 'Bản nháp hợp đồng ' + maHopDong,
            loadEditor: function () { return ContractDocumentApi.draftEditor(draft.draftId); },
            upload: function (file) { return ContractDocumentApi.uploadDraft(draft.draftId, file); },
            complete: function () { return ContractDocumentApi.finalizeDraft(draft.draftId); },
            onReload: onReload
          });
        });
      })
      .catch(function (error) { notify('error', 'Không thể xuất hợp đồng', error.message); });
  }

  function editTemplateDocument(selectedTemplateFile) {
    return checkBackend()
      .then(function () { return ContractDocumentApi.templates(); })
      .then(function (templates) {
        if (selectedTemplateFile) return selectedTemplateFile;
        return chooseTemplate(templates, null, 'Sửa tài liệu hợp đồng');
      })
      .then(function (templateFile) {
        if (!templateFile) return null;
        return ContractDocumentApi.createTemplateWorkspace(templateFile);
      })
      .then(function (workspace) {
        if (!workspace) return null;
        return ContractDocumentApi.templateWorkspaceEditor(workspace.workspaceId).then(function (editor) {
          showEditor(editor, {
            kind: 'template',
            title: 'Sửa tài liệu hợp đồng — ' + workspace.templateFile,
            loadEditor: function () { return ContractDocumentApi.templateWorkspaceEditor(workspace.workspaceId); },
            upload: function (file) { return ContractDocumentApi.uploadTemplateWorkspace(workspace.workspaceId, file); },
            validate: function () { return ContractDocumentApi.validateTemplateWorkspace(workspace.workspaceId); },
            complete: function () { return ContractDocumentApi.applyTemplateWorkspace(workspace.workspaceId); }
          });
        });
      })
      .catch(function (error) { notify('error', 'Không thể sửa tài liệu hợp đồng', error.message); });
  }

  function manageTemplateRegistry() {
    return checkBackend().then(function () {
      if (!global.ContractTemplateManager) {
        throw new Error('Chức năng quản lý hợp đồng chưa được tải. Hãy tải lại bundle frontend.');
      }
      return global.ContractTemplateManager.open({
        api: ContractDocumentApi,
        editDocument: function (item) { return editTemplateDocument(item.templateFile); }
      });
    }).catch(function (error) {
      notify('error', 'Không thể mở quản lý hợp đồng', error.message);
    });
  }

  return {
    exportContract: exportContract,
    editTemplateDocument: editTemplateDocument,
    manageTemplateRegistry: manageTemplateRegistry,
    manageTemplates: editTemplateDocument
  };
})(window);
