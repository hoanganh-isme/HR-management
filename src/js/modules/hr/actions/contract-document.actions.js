var ContractDocumentActions = (function (global) {
  'use strict';

  var onlyOfficeLoader = null;

  function notify(type, title, message) {
    if (global.Alert && typeof global.Alert[type] === 'function') {
      global.Alert[type](title, message);
      return;
    }
    if (global.UIToast && typeof global.UIToast.show === 'function') {
      global.UIToast.show(message, type === 'error' ? 'error' : type);
      return;
    }
    global.alert((title ? title + ': ' : '') + message);
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
        text.textContent = (item.description || item.templateFile) + ' — ' + item.templateFile;
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

    toolbar.appendChild(createButton('Xem trước', 'preview'));
    toolbar.appendChild(createButton('Tải DOCX', 'download'));
    toolbar.appendChild(createButton('Tải bản đã sửa lên', 'upload'));
    if (options.kind === 'draft') toolbar.appendChild(createButton('Lưu vào hợp đồng', 'finalize', true));
    if (options.kind === 'template') {
      toolbar.appendChild(createButton('Kiểm tra placeholder', 'validate'));
      toolbar.appendChild(createButton('Áp dụng mẫu', 'apply', true));
    }
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
      setStatus('Đang kết nối OnlyOffice...', false);
      return loadOnlyOffice(state.data.onlyOfficePublicUrl).then(function () {
        if (state.closed) return;
        state.editor = new global.DocsAPI.DocEditor(editorArea.id, state.data.editorConfig);
        setStatus('OnlyOffice đã sẵn sàng. Bạn cũng có thể tải DOCX để sửa bằng WPS/Word.', false);
      }).catch(function () {
        editorArea.innerHTML = '<div class="contract-doc-offline"><strong>OnlyOffice chưa sẵn sàng.</strong><span>Bạn vẫn có thể tải DOCX, sửa bằng WPS/Word rồi tải lại.</span></div>';
        setStatus('Không mở được OnlyOffice tại ' + state.data.onlyOfficePublicUrl + '.', true);
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
      overlay.remove();
      global.__contractDocumentEditorOpen = false;
    }

    toolbar.onclick = function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      var action = button.dataset.action;
      if (action === 'preview') return global.open(state.data.previewUrl, '_blank', 'noopener');
      if (action === 'download') return download(state.data.downloadUrl);
      if (action === 'close') return close();
      if (action === 'upload') {
        return openFilePicker(function (file) {
          button.disabled = true;
          setStatus('Đang tải file DOCX lên workspace...', false);
          options.upload(file).then(function () {
            notify('success', 'Thành công', 'Đã cập nhật bản DOCX trong workspace, chưa lưu vào DB.');
            return refreshEditor();
          }).catch(function (error) {
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
          global.alert('Placeholder hợp lệ:\n' + valid + '\n\nPlaceholder chưa xác định:\n' + unknown);
        }).catch(function (error) { notify('error', 'Kiểm tra thất bại', error.message); })
          .finally(function () { button.disabled = false; });
      }
      if (action === 'finalize' || action === 'apply') {
        button.disabled = true;
        destroyEditor();
        setStatus('Đang chờ OnlyOffice lưu phiên bản mới nhất...', false);
        return delay(1200).then(function () {
          return retryAfterOnlyOfficeSave(options.complete, 6);
        }).then(function (result) {
          if (action === 'finalize') {
            notify('success', 'Đã lưu', 'DOCX đã được lưu vào tài liệu đính kèm của hợp đồng.');
          } else {
            notify('success', 'Đã áp dụng mẫu', 'Mẫu cũ đã được backup thành ' + result.backupName + '.');
          }
          close();
          if (action === 'finalize') {
            if (global.DynamicFormEngine && typeof global.DynamicFormEngine.reloadDetailTabs === 'function') {
              global.DynamicFormEngine.reloadDetailTabs();
            } else if (typeof options.onReload === 'function') {
              options.onReload();
            }
          }
        }).catch(function (error) {
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

  function manageTemplates() {
    return checkBackend()
      .then(function () { return ContractDocumentApi.templates(); })
      .then(function (templates) { return chooseTemplate(templates, null, 'Quản lý mẫu hợp đồng'); })
      .then(function (templateFile) {
        if (!templateFile) return null;
        return ContractDocumentApi.createTemplateWorkspace(templateFile);
      })
      .then(function (workspace) {
        if (!workspace) return null;
        return ContractDocumentApi.templateWorkspaceEditor(workspace.workspaceId).then(function (editor) {
          showEditor(editor, {
            kind: 'template',
            title: 'Chỉnh sửa bản copy của ' + workspace.templateFile,
            loadEditor: function () { return ContractDocumentApi.templateWorkspaceEditor(workspace.workspaceId); },
            upload: function (file) { return ContractDocumentApi.uploadTemplateWorkspace(workspace.workspaceId, file); },
            validate: function () { return ContractDocumentApi.validateTemplateWorkspace(workspace.workspaceId); },
            complete: function () { return ContractDocumentApi.applyTemplateWorkspace(workspace.workspaceId); }
          });
        });
      })
      .catch(function (error) { notify('error', 'Không thể quản lý mẫu', error.message); });
  }

  return { exportContract: exportContract, manageTemplates: manageTemplates };
})(window);
