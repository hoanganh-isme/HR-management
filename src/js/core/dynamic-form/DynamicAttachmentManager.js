/** Attachment tab orchestration. Business keys come only from tab configuration. */
window.DynamicAttachmentManager = (function () {
  function endpoint(moduleConfig) {
    return moduleConfig.apiGateway || AppConfig.apiGateway;
  }

  function recordsOf(response) {
    return response ? (response.list || response.records || response.data || (Array.isArray(response) ? response : [])) : [];
  }

  function codeOf(response) {
    return response && (response.code !== undefined ? response.code : response.Code);
  }

  function showImageZoom(src) {
    if (!src) return;
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:zoom-out;padding:6vh 6vw;';
    var image = document.createElement('img');
    image.src = src;
    image.style.cssText = 'max-width:88vw;max-height:88vh;object-fit:contain;border-radius:10px;box-shadow:0 16px 56px rgba(0,0,0,.7);';
    overlay.appendChild(image);
    document.body.appendChild(overlay);
    overlay.onclick = function () { overlay.remove(); };
  }

  function contentBytes(item) {
    var content = item.Content || item.content || item.Base64Content || item.base64Content || '';
    if (!content) return null;
    try {
      if (/^0x[0-9a-f]+$/i.test(String(content).trim())) {
        var hex = String(content).trim().slice(2);
        var bytes = new Uint8Array(hex.length / 2);
        for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return bytes;
      }
      var base64 = String(content).trim().replace(/^data:[^;]+;base64,/, '');
      var binary = window.atob(base64);
      var data = new Uint8Array(binary.length);
      for (var j = 0; j < binary.length; j++) data[j] = binary.charCodeAt(j);
      return data;
    } catch (e) {
      return null;
    }
  }

  function hasPrefix(bytes, values) {
    if (!bytes || bytes.length < values.length) return false;
    for (var i = 0; i < values.length; i++) {
      if (bytes[i] !== values[i]) return false;
    }
    return true;
  }

  function attachmentInfo(item) {
    var bytes = contentBytes(item);
    if (!bytes) return null;
    var originalName = String(item.FileName || '').trim();
    var lowerName = originalName.toLowerCase();
    var isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(originalName);
    var isPdf = lowerName.endsWith('.pdf') || hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46]);
    // DOCX is a ZIP package. Legacy attachment rows may have only a UUID as
    // FileName, so infer .docx from the package signature for a useful name.
    var isDocx = lowerName.endsWith('.docx') || (!isImage && !isPdf && hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04]));
    var mime = isPdf ? 'application/pdf' : (lowerName.match(/\.(png|gif|webp)$/) ? 'image/' + lowerName.split('.').pop() : (lowerName.match(/\.(jpg|jpeg)$/) ? 'image/jpeg' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
    var fileName = originalName || 'tai-lieu';
    if (isDocx && !/\.docx$/i.test(fileName)) fileName += '.docx';
    return {
      url: URL.createObjectURL(new Blob([bytes], { type: mime })),
      fileName: fileName,
      isImage: isImage,
      isPdf: isPdf,
      isDocx: isDocx
    };
  }

  function downloadBlob(info) {
    var link = document.createElement('a');
    link.href = info.url;
    link.download = info.fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(info.url); }, 1000);
  }

  function create(options) {
    var moduleConfig = options.moduleConfig || {};
    var api = options.apiClient || window.ApiClient;
    var gateway = endpoint(moduleConfig);
    var currentUser = options.currentUser || function () { return window.AppSession ? AppSession.getUserName() : ''; };

    function notify(kind, title, message) {
      if (window.Alert && typeof Alert[kind] === 'function') Alert[kind](title, message);
      else if (window.UIToast && typeof UIToast.show === 'function') UIToast.show(message, kind === 'error' ? 'danger' : kind);
    }

    function load(tabDef, row) {
      var keyField = tabDef.filterField || moduleConfig.PrimaryKey;
      var keyValue = row && row[moduleConfig.PrimaryKey];
      var filter = {};
      filter[keyField] = keyValue || '';
      return api.post(gateway, { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filter) });
    }

    function render(tabDef, container, isEditable, row) {
      container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải tệp đính kèm...</div>';
      load(tabDef, row).then(function (response) {
        var items = recordsOf(response);
        container.innerHTML = '';
        var list = document.createElement('div');
        list.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:16px;max-height:300px;overflow-y:auto;';
        if (!items.length) {
          var empty = document.createElement('div');
          empty.style.cssText = 'color:var(--color-text-secondary);text-align:center;padding:20px;font-size:13px;border:1px dashed var(--color-border);border-radius:8px;';
          empty.textContent = 'Chưa có tệp đính kèm cho bản ghi này.';
          list.appendChild(empty);
        }
        items.forEach(function (item) {
          var card = document.createElement('div');
          card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;background:var(--color-surface);';
          var left = document.createElement('div');
          left.style.cssText = 'display:flex;align-items:center;gap:12px;min-width:0;flex:1;';
          var icon = document.createElement('span');
          icon.className = 'material-symbols-outlined';
          icon.textContent = /\.(jpg|jpeg|png|gif|webp)$/i.test(item.FileName || '') ? 'image' : (/\.pdf$/i.test(item.FileName || '') ? 'picture_as_pdf' : 'description');
          icon.style.cssText = 'font-size:24px;color:var(--color-primary);';
          var attachment = attachmentInfo(item);
          var blobUrl = attachment && attachment.url;
          if (blobUrl && attachment.isImage) {
            var thumb = document.createElement('img');
            thumb.src = blobUrl;
            thumb.style.cssText = 'width:40px;height:40px;object-fit:cover;border-radius:6px;cursor:zoom-in;';
            thumb.onclick = function () { showImageZoom(blobUrl); };
            left.appendChild(thumb);
          } else {
            left.appendChild(icon);
          }
          var info = document.createElement('div');
          info.style.cssText = 'display:flex;flex-direction:column;gap:2px;min-width:0;';
          var name = document.createElement('span');
          name.textContent = item.FileName || 'Tệp đính kèm';
          name.style.cssText = 'font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px;';
          var meta = document.createElement('small');
          meta.textContent = item.FileSize ? Math.round(Number(item.FileSize) / 1024) + ' KB' : '';
          meta.style.color = 'var(--color-text-secondary)';
          info.appendChild(name);
          info.appendChild(meta);
          left.appendChild(info);
          card.appendChild(left);

          var attachmentKey = tabDef.primaryKey && item[tabDef.primaryKey];
          var actions = document.createElement('div');
          actions.style.cssText = 'display:flex;gap:6px;';
          if (blobUrl) {
            var open = document.createElement('button');
            open.type = 'button';
            open.className = 'btn btn-sm btn-outline-primary';
            open.textContent = attachment.isDocx ? 'Tải DOCX' : 'Mở';
            open.onclick = function () {
              if (attachment.isDocx) downloadBlob(attachment);
              else window.open(blobUrl, '_blank', 'noopener');
            };
            actions.appendChild(open);
          }
          if (isEditable && tabDef.primaryKey && attachmentKey) {
            var remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'btn btn-sm btn-outline-danger';
            remove.textContent = 'Xóa';
            remove.onclick = function () {
              var payload = { List: tabDef.api, Func: 'Delete', Ids: attachmentKey, JsonData: JSON.stringify((function () { var o = {}; o[tabDef.primaryKey] = attachmentKey; return o; })()), UserName: currentUser() };
              api.post(gateway, payload).then(function (result) {
                if (codeOf(result) === 0 || codeOf(result) === '0') { notify('success', 'Thành công', 'Xóa tệp thành công!'); render(tabDef, container, isEditable, row); }
                else notify('error', 'Lỗi', result && (result.msg || result.Msg) || 'Không thể xóa tệp');
              }).catch(function () { notify('error', 'Lỗi', 'Không thể kết nối máy chủ'); });
            };
            actions.appendChild(remove);
          }
          card.appendChild(actions);
          list.appendChild(card);
        });
        container.appendChild(list);
        if (isEditable) renderUpload(tabDef, container, row, items.length + 1, function () { render(tabDef, container, isEditable, row); });
      }).catch(function () {
        container.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải danh sách tệp đính kèm</div>';
      });
    }

    function renderUpload(tabDef, container, row, nextOrder, reload) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'border:1px dashed var(--color-border-strong);border-radius:8px;padding:16px;background:var(--color-surface);display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center;';

      function processFile(file) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          notify('error', 'Tệp quá lớn', 'Hệ thống chỉ hỗ trợ tệp tối đa 10MB.');
          return;
        }
        var keyField = tabDef.filterField || moduleConfig.PrimaryKey;
        var keyValue = row && row[moduleConfig.PrimaryKey];
        var reader = new FileReader();
        reader.onload = function (event) {
          var bytes = new Uint8Array(event.target.result);
          var hex = '0x' + Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
          var base64Reader = new FileReader();
          base64Reader.onload = function (base64Event) {
            var data = { IsEdit: 0, FileName: file.name, FileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) ? 1 : 0, STT: nextOrder, FileSize: file.size, Base64Content: String(base64Event.target.result).split(',')[1] || '', Content: hex };
            data[keyField] = keyValue || '';
            wrap.innerHTML = '<span style="color:var(--color-text-secondary);">Đang lưu tài liệu lên máy chủ...</span>';
            api.post(gateway, { List: tabDef.saveApi || tabDef.api, Func: tabDef.saveFunc || 'Save', JsonData: JSON.stringify(data), UserName: currentUser() }).then(function (result) {
              if (codeOf(result) === 0 || codeOf(result) === '0') { notify('success', 'Thành công', 'Tải tệp đính kèm lên thành công!'); reload(); }
              else { notify('error', 'Lỗi lưu tệp', result && (result.msg || result.Msg) || 'Không thể lưu tệp lên CSDL.'); reload(); }
            }).catch(function () { notify('error', 'Lỗi', 'Không thể kết nối đến máy chủ.'); reload(); });
          };
          base64Reader.readAsDataURL(file);
        };
        reader.readAsArrayBuffer(file);
      }

      if (window.UIFileUpload && typeof UIFileUpload.create === 'function') {
        wrap.appendChild(UIFileUpload.create({
          id: 'attach-upload-input',
          text: 'Kéo thả tệp/ảnh hoặc click để tải lên',
          hint: 'Hỗ trợ: PDF, JPG, PNG... Tối đa 10MB',
          onChange: processFile
        }));
      } else {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = tabDef.accept || '*/*';
        input.onchange = function () { processFile(input.files && input.files[0]); };
        wrap.appendChild(input);
      }
      container.appendChild(wrap);
    }

    return { load: load, render: render };
  }

  return { create: create };
})();
