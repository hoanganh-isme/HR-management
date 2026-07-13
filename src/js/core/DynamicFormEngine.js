/**
 * Dynamic Form Engine - Generic Metadata-Driven UI Engine
 */
window.DynamicFormEngine = (function () {

  var $container = null;
  var gridData = [];
  var selectedRows = [];
  var lastSelectedIdx = -1;
  var activeDetailTabIdx = 0;
  var _inlineEditMode = false;
  var _lastDetailRowId = null;

  var currentKeyword = '';
  var currentSortCol = '';
  var currentSortDir = '';
  var currentPage = 1;
  var currentLimit = 15;
  var totalRecords = 0;
  var totalPagesFromApi = 0;
  var lastTimestamp = '';

  // Lưu trữ state (page, sort, filter) theo từng FormName để giữ vết khi chuyển lại
  var moduleStates = {};
  var currentFormName = '';

  // Dữ liệu Từ điển lấy từ API (Database)
  var globalDictionary = {};
  var globalFormSchema = [];
  var globalRenderers = {};

  var defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";

  // Khôi phục moduleStates từ sessionStorage nếu có (để giữ filter khi F5)
  try {
    var cachedStates = sessionStorage.getItem('DynamicFormEngine_States');
    if (cachedStates) moduleStates = JSON.parse(cachedStates);
  } catch (e) { }

  function _saveModuleStates() {
    try {
      sessionStorage.setItem('DynamicFormEngine_States', JSON.stringify(moduleStates));
    } catch (e) { }
  }

  var MODULE_CONFIG = {};

  // ── Helpers ──────────────────────────────────────────────
  function _currentGroup() {
    var u = AppContext.getCurrentUser();
    return MetadataModuleConfig.getUserGroupId(u);
  }

  function _currentUser() {
    var u = AppContext.getCurrentUser();
    return u.Username || u.UserName || u.username || '';
  }

  function _readActionValues(body, row) {
    var values = Object.assign({}, row || {});
    if (!body) return values;
    body.querySelectorAll('[name]').forEach(function (element) {
      var name = element.getAttribute('name');
      if (!name) return;
      if (element.type === 'checkbox') values[name] = element.checked ? 1 : 0;
      else values[name] = element.value;
    });
    return values;
  }

  function _notifyAction(message, type) {
    if (typeof UIToast !== 'undefined') return UIToast.show(message, type || 'info');
    if (typeof Alert !== 'undefined') {
      var method = type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'success');
      return Alert[method](type === 'error' ? 'Lá»—i' : 'ThÃ´ng bÃ¡o', message);
    }
  }

  function _confirmAction(options) {
    options = typeof options === 'string' ? { message: options } : (options || {});
    return new Promise(function (resolve) {
      if (typeof ConfirmModal !== 'undefined') {
        ConfirmModal.show(Object.assign({}, options, {
          onConfirm: function () { resolve(true); },
          onCancel: function () { resolve(false); }
        }));
      } else {
        resolve(window.confirm(String(options.message || '')));
      }
    });
  }

  function _createActionContext(options) {
    options = options || {};
    var values = options.values || Object.assign({}, options.row || {});
    var context = {
      row: options.row || {},
      values: values,
      config: MODULE_CONFIG,
      getValue: function (field) { return values[field]; },
      setValue: function (field, value) {
        values[field] = value;
        if (options.row) options.row[field] = value;
        if (typeof options.onSetValue === 'function') options.onSetValue(field, value);
      },
      save: options.save || function () { return Promise.resolve(options.row || {}); },
      reload: function () { return _loadData(); },
      reloadDetails: options.reloadDetails || function () { return Promise.resolve(); },
      notify: _notifyAction,
      confirm: _confirmAction
    };
    return Object.assign(context, options.compatibility || {});
  }

  /**
   * Lấy danh sách chi nhánh được gán cho user hiện tại.
   * Đọc từ user hiện tại (lưu trong bảng SY_User).
   * BranchID có thể là 1 giá trị hoặc comma-separated: "COBI, DONGDU, ESTELLA".
   * Nếu BranchID = NULL/rỗng và user là admin → trả về toàn bộ chi nhánh.
   * Trả về Array<{ id: string, name: string }>
   */
  function _getUserBranches() {
    try {
      var u = AppContext.getCurrentUser();
      var branchRaw = (u.BranchID || u.branchID || u.branchId || u.Branch || '').toString().trim();
      var isAdmin = MetadataModuleConfig.isAdminUser(u);

      // Load ALL_BRANCHES từ local storage
      var sysBranches = JSON.parse(AppStorage.getStored('sys_branches', '[]') || '[]');
      var ALL_BRANCHES = sysBranches.map(function (b) {
        return {
          id: (b.BranchID || b.branchID || b.branchId || '').toString().trim(),
          name: (b.BranchName || b.branchName || b.BranchName || b.BranchID || '').toString().trim()
        };
      }).filter(function (b) { return !!b.id; });

      // Nếu là Admin, trả về toàn bộ chi nhánh.
      if (isAdmin) return ALL_BRANCHES;

      // NẾU TÀI KHOẢN KHÔNG PHẢI ADMIN MÀ BRANCH BỊ RỖNG:
      // Tức là API chưa trả về hoặc DB chưa gán. Không được phép trả về ALL_BRANCHES!
      if (!branchRaw) return [];

      // Parse BranchID: "COBI, DONGDU, ESTELLA" → [{ id, name }, ...]
      return branchRaw
        .split(',')
        .map(function (s) { return s.trim().toUpperCase(); })
        .filter(function (s) { return !!s; })
        .map(function (id) {
          var found = ALL_BRANCHES.find(function (b) { return b.id.toUpperCase() === id; });
          return found ? found : { id: id, name: id };
        });
    } catch (e) {
      return [];
    }
  }


  /**
   * Đọc giá trị boolean từ API field có thể trả về camelCase hoặc PascalCase
   * và có thể là '1'/true/1 hoặc '0'/false/0
   * @param {*} camel  - item.showInAdd, item.required ...
   * @param {*} pascal - item.ShowInAdd, item.IsRequired ...
   */
  function _bool(camel, pascal) {
    return String(camel) === '1' || camel === true || String(pascal) === '1' || pascal === true;
  }

  /**
   * Gọi API tuần tự cho mảng payload (tránh sập API khi gửi đồng loạt)
   * @param {string}   endpoint  - API URL
   * @param {Array}    payloads  - Mảng payload cần gọi lần lượt
   * @param {Function} onDone    - Gọi khi tất cả xong, nhận (successCount)
   * @param {Function} [onError] - Gọi khi 1 payload lỗi, nhận (err, payload, index)
   *                               Nếu return false → dừng chuỗi. Mặc định tiếp tục.
   */
  function _sendSequential(operation, payloads, options, onDone, onError) {
    var successCount = 0;
    function _next(i) {
      if (i >= payloads.length) { onDone(successCount); return; }
      GatewayClient.run(operation, payloads[i], options)
        .then(function (res) {
          if (res && res.code === 0) successCount++;
          _next(i + 1);
        })
        .catch(function (err) {
          var stop = typeof onError === 'function' && onError(err, payloads[i], i) === false;
          if (!stop) _next(i + 1);
        });
    }
    _next(0);
  }

  /** Kiểm tra form hiện tại có phải Form Builder không */
  function _isFormBuilder() {
    return MODULE_CONFIG.isFormBuilder === true;
  }

  /**
   * Bật/tắt trạng thái loading trên nút bấm
   * @param {HTMLElement} btn
   * @param {boolean}     loading
   * @param {string}      [originalHTML] - HTML gốc để restore khi loading=false
   */
  function _setBtnLoading(btn, loading, originalHTML) {
    if (loading) {
      btn._originalHTML = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';
      btn.disabled = true;
    } else {
      btn.innerHTML = originalHTML || btn._originalHTML || btn.innerHTML;
      btn.disabled = false;
    }
  }

  /**
   * Áp giá trị mặc định cho object — chỉ ghi nếu chưa có (giống pattern X = X || default)
   * @param {Object} obj      - Object cần áp mặc định (ví dụ: MODULE_CONFIG)
   * @param {Object} defaults - Các giá trị mặc định { key: value }
   */
  function _setDefaults(obj, defaults) {
    Object.keys(defaults).forEach(function (k) {
      if (!obj[k]) obj[k] = defaults[k];
    });
  }

  /** Lưu selectedRows vào sessionStorage (silent fail) */
  function _saveSelectedRows() {
    try {
      sessionStorage.setItem('selectedRows_' + MODULE_CONFIG.FormName, JSON.stringify(selectedRows));
    } catch (e) { }
  }

  /** Đọc selectedRows từ sessionStorage (silent fail, trả mảng rỗng nếu lỗi) */
  function _loadSelectedRows() {
    selectedRows = [];
  }

  /**
   * Phóng to hình ảnh trong một lightbox overlay đẹp mắt
   * @param {string} imgSrc - URL hoặc Base64 của ảnh
   */
  function _showImageZoom(imgSrc) {
    if (!imgSrc || imgSrc.indexOf('data:image/svg+xml') === 0) return;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:zoom-out;opacity:0;transition:opacity 0.2s ease-out;';

    var zoomImg = document.createElement('img');
    zoomImg.src = imgSrc;
    zoomImg.style.cssText = 'max-width:88vw;max-height:88vh;object-fit:contain;border-radius:10px;box-shadow:0 16px 56px rgba(0,0,0,0.7);transform:scale(0.88);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);';

    overlay.appendChild(zoomImg);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      zoomImg.style.transform = 'scale(1)';
    });

    overlay.onclick = function () {
      overlay.style.opacity = '0';
      zoomImg.style.transform = 'scale(0.88)';
      setTimeout(function () { overlay.remove(); }, 220);
    };
  }

  function _renderAttachmentsTab(tabDef, container, isEditable, row) {
    container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải tệp đính kèm...</div>';
    var attachmentConfig = (MODULE_CONFIG.attachments && (MODULE_CONFIG.attachments[tabDef.code] || MODULE_CONFIG.attachments.default)) || {};
    var pkField = tabDef.ownerField || attachmentConfig.ownerField || MODULE_CONFIG.PrimaryKey || 'id';
    var pkVal = row[pkField] || '';
    var filterData = {};
    filterData[tabDef.filterField || pkField] = pkVal;

    function _getContentAsBlobUrl(fileItem) {
      var content = fileItem.Content || fileItem.content || fileItem.Base64Content || fileItem.base64Content || '';
      if (!content) return '';

      var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
      var mime = 'application/octet-stream';
      if (ext === 'pdf') mime = 'application/pdf';
      else if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'webp') mime = 'image/webp';

      try {
        if (/^0x/i.test(content)) {
          var hexStr = content.replace(/^0x/i, '').replace(/\s/g, '');
          var bytes = new Uint8Array(hexStr.length / 2);
          for (var bi = 0; bi < bytes.length; bi++) {
            bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        } else {
          var cleanBase64 = content.trim();
          if (cleanBase64.indexOf(';base64,') > -1) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
          }
          var binaryStr = window.atob(cleanBase64);
          var bytes = new Uint8Array(binaryStr.length);
          for (var i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.error('[ATTACHMENT ERROR] Failed to convert content to blob url:', e);
        return '';
      }
    }

    function _loadAttachments() {
      GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterData, {
        endpoint: MODULE_CONFIG.ApiSearch,
        limit: 500
      }).then(function (res) {
        var data = res.list || res.records || [];
        container.innerHTML = '';

        // 1. Container cho danh sách tệp đính kèm
        var listWrap = document.createElement('div');
        listWrap.className = 'attachments-list';
        listWrap.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto;';

        if (data.length === 0) {
          var empty = document.createElement('div');
          empty.style.cssText = 'color: var(--color-text-secondary); text-align: center; padding: 20px; font-size: 13px; border: 1px dashed var(--color-border); border-radius: 8px;';
          empty.textContent = 'Chưa có tệp hay ảnh đính kèm nào cho hợp đồng này.';
          listWrap.appendChild(empty);
        } else {
          data.forEach(function (fileItem) {
            var card = document.createElement('div');
            card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; background: var(--color-surface);';

            // Left: Icon/Thumbnail + Info
            var leftArea = document.createElement('div');
            leftArea.style.cssText = 'display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;';

            var iconWrap = document.createElement('div');
            iconWrap.style.cssText = 'width: 40px; height: 40px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--color-background, #f1f5f9); flex-shrink: 0;';

            var blobUrl = _getContentAsBlobUrl(fileItem);
            var isImage = parseInt(fileItem.FileType) === 1 || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileItem.FileName);
            if (isImage && blobUrl) {
              // Hiển thị ảnh thumbnail thực tế từ Blob URL
              var thumb = document.createElement('img');
              thumb.src = blobUrl;
              thumb.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: zoom-in;';
              thumb.addEventListener('click', function () { _showImageZoom(blobUrl); });
              iconWrap.appendChild(thumb);
            } else {
              var icon = document.createElement('span');
              icon.className = 'material-symbols-outlined';
              icon.style.fontSize = '24px';
              icon.style.color = isImage ? 'var(--color-success)' : 'var(--color-primary)';
              icon.innerText = isImage ? 'image' : (/\.(pdf)$/i.test(fileItem.FileName) ? 'picture_as_pdf' : 'description');
              iconWrap.appendChild(icon);
            }

            var infoArea = document.createElement('div');
            infoArea.style.cssText = 'display: flex; flex-direction: column; gap: 2px; min-width: 0;';

            var nameSpan = document.createElement('span');
            nameSpan.textContent = fileItem.FileName || 'Chưa đặt tên';
            nameSpan.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';

            var metaSpan = document.createElement('span');
            var kbSize = fileItem.FileSize ? (parseFloat(fileItem.FileSize) / 1024).toFixed(1) + ' KB' : '—';
            metaSpan.textContent = kbSize + ' | STT: ' + (fileItem.STT || '—');
            metaSpan.style.cssText = 'font-size: 11px; color: var(--color-text-secondary);';

            infoArea.appendChild(nameSpan);
            infoArea.appendChild(metaSpan);

            leftArea.appendChild(iconWrap);
            leftArea.appendChild(infoArea);

            // Right: Actions (Download & Preview & Delete)
            var actions = document.createElement('div');
            actions.style.cssText = 'display: flex; gap: 4px;';

            if (blobUrl) {
              // Icon mắt (Xem trước/Preview) cho Ảnh hoặc PDF
              var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
              var isPdf = ext === 'pdf';
              if (isImage || isPdf) {
                var btnPreview = document.createElement('button');
                btnPreview.type = 'button';
                btnPreview.className = 'btn btn-icon';
                btnPreview.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-success); display: flex; align-items: center;';
                btnPreview.title = 'Xem trực tiếp';
                btnPreview.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>';
                btnPreview.onclick = function () {
                  if (isImage) {
                    _showImageZoom(blobUrl);
                  } else if (isPdf) {
                    window.open(blobUrl, '_blank');
                  }
                };
                actions.appendChild(btnPreview);
              }

              var btnDownload = document.createElement('button');
              btnDownload.type = 'button';
              btnDownload.className = 'btn btn-icon';
              btnDownload.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-primary); display: flex; align-items: center;';
              btnDownload.title = 'Tải xuống';
              btnDownload.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">download</span>';
              btnDownload.onclick = function () {
                var a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileItem.FileName || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              };
              actions.appendChild(btnDownload);
            }

            // CHỈ HIỂN THỊ NÚT XÓA KHI ĐƯỢC PHÉP CHỈNH SỬA
            if (isEditable) {
              var btnDelete = document.createElement('button');
              btnDelete.type = 'button';
              btnDelete.className = 'btn btn-icon';
              btnDelete.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-danger); display: flex; align-items: center;';
              btnDelete.title = 'Xóa tệp';
              btnDelete.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">delete</span>';
              btnDelete.onclick = function () {
                if (typeof ConfirmModal !== 'undefined') {
                  ConfirmModal.show({
                    title: 'Xóa tệp đính kèm',
                    message: 'Bạn có chắc chắn muốn xóa tệp "' + fileItem.FileName + '" không?',
                    onConfirm: function () {
                      GatewayClient.run({ sp: tabDef.api, func: 'Delete' }, {
                        rowId: fileItem[tabDef.rowIdField || attachmentConfig.rowIdField || 'id']
                      }, { payload: { Ids: fileItem[tabDef.rowIdField || attachmentConfig.rowIdField || 'id'] } }).then(function (delRes) {
                        if (delRes.code === 0 || delRes.code === '0') {
                          UIToast.show('Xóa tệp thành công!', 'success');
                          _loadAttachments();
                        } else {
                          Alert.error('Lỗi', delRes.msg || 'Không thể xóa tệp');
                        }
                      }).catch(function (err) {
                        Alert.error('Lỗi', 'Không thể kết nối máy chủ');
                      });
                    }
                  });
                }
              };
              actions.appendChild(btnDelete);
            }

            card.appendChild(leftArea);
            card.appendChild(actions);
            listWrap.appendChild(card);
          });
        }
        container.appendChild(listWrap);

        // CHỈ HIỂN THỊ VÙNG TẢI LÊN KHI ĐƯỢC PHÉP CHỈNH SỬA
        if (isEditable) {
          var uploadZoneWrap = document.createElement('div');
          uploadZoneWrap.style.cssText = 'border: 1px dashed var(--color-border-strong); border-radius: 8px; padding: 16px; background: var(--color-surface); display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;';

          if (typeof UIFileUpload !== 'undefined') {
            var fileUploadEl = UIFileUpload.create({
              id: 'attach-upload-input',
              text: 'Kéo thả tệp/ảnh hoặc click để tải lên',
              hint: 'Hỗ trợ: PDF, JPG, PNG... Tối đa 10MB',
              onChange: function (file) {
                _uploadFileToServer(file);
              }
            });
            uploadZoneWrap.appendChild(fileUploadEl);
          }
          container.appendChild(uploadZoneWrap);
        }
      }).catch(function (err) {
        container.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải danh sách tệp đính kèm</div>';
      });
    }

    function _uploadFileToServer(file) {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        Alert.error('Tệp quá lớn', 'Hệ thống chỉ hỗ trợ tệp tối đa 10MB.');
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var arrayBuffer = e.target.result;
        var bytes = new Uint8Array(arrayBuffer);
        var hexArray = [];
        for (var i = 0; i < bytes.length; i++) {
          var hexVal = bytes[i].toString(16);
          if (hexVal.length < 2) hexVal = '0' + hexVal;
          hexArray.push(hexVal);
        }
        var hexStr = '0x' + hexArray.join('');

        var base64Reader = new FileReader();
        base64Reader.onload = function (bEvent) {
          var dataUrl = bEvent.target.result;
          var base64Content = dataUrl.split(',')[1] || dataUrl;

          var ext = file.name.split('.').pop().toLowerCase();
          var isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) >= 0;
          var fileTypeNum = isImg ? 1 : 0;

          var previewHtml = '';
          if (isImg) {
            previewHtml = `
              <div style="margin: 12px 0; text-align: center;">
                <img src="${dataUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/>
              </div>
            `;
          } else {
            var iconName = ext === 'pdf' ? 'picture_as_pdf' : 'description';
            var iconColor = ext === 'pdf' ? 'var(--color-danger)' : 'var(--color-primary)';
            previewHtml = `
              <div style="margin: 12px 0; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--color-background, #f8fafc); border-radius: 6px; border: 1px solid var(--color-border);">
                <span class="material-symbols-outlined" style="font-size: 32px; color: ${iconColor};">${iconName}</span>
                <span style="font-weight: 500; font-size: 13px; color: var(--color-text); word-break: break-all;"> Định dạng: ${ext.toUpperCase()} </span>
              </div>
            `;
          }

          var kbSize = (file.size / 1024).toFixed(1) + ' KB';
          var confirmMessage = `
            <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; text-align: left;">
              Bạn có chắc chắn muốn tải tệp này lên không?
              <div style="margin-top: 10px; padding: 10px; background: var(--color-background, #f1f5f9); border-radius: 6px; border: 1px solid var(--color-border); font-family: monospace; font-size: 12px; color: var(--color-text); word-break: break-all;">
                <strong>Tên file:</strong> ${file.name}<br/>
                <strong>Dung lượng:</strong> ${kbSize}
              </div>
              ${previewHtml}
            </div>
          `;

          ConfirmModal.show({
            title: 'Xác nhận tải tệp lên',
            message: confirmMessage,
            confirmText: 'Tải lên',
            confirmClass: 'btn-primary',
            onConfirm: function () {
              _executeUpload(file, hexStr, base64Content, fileTypeNum);
            }
          });
        };
        base64Reader.readAsDataURL(file);
      };
      reader.readAsArrayBuffer(file);
    }

    function _executeUpload(file, hexStr, base64Content, fileTypeNum) {
      GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterData, {
        endpoint: MODULE_CONFIG.ApiSearch,
        limit: 500
      }).then(function (cntRes) {
        var currentItems = cntRes.list || cntRes.records || [];
        var nextSTT = currentItems.length + 1;

        var attachmentData = {
            IsEdit: 0,
            FileName: file.name,
            FileType: fileTypeNum,
            STT: nextSTT,
            FileSize: file.size,
            Base64Content: base64Content,
            Content: hexStr
        };
        attachmentData[pkField] = pkVal;

        container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang lưu tài liệu lên máy chủ...</div>';
        GatewayClient.run({ sp: tabDef.api, func: 'Save' }, attachmentData).then(function (saveRes) {
          if (saveRes.code === 0 || saveRes.code === '0') {
            UIToast.show('Tải tệp đính kèm lên thành công!', 'success');
            _loadAttachments();
          } else {
            Alert.error('Lỗi lưu tệp', saveRes.msg || 'Không thể lưu tệp lên CSDL.');
            _loadAttachments();
          }
        }).catch(function (err) {
          Alert.error('Lỗi', 'Không thể kết nối đến máy chủ.');
          _loadAttachments();
        });
      }).catch(function () {
        _loadAttachments();
      });
    }

    _loadAttachments();
  }

  /**
   * Khởi tạo payload chuẩn cho API: clone base, áp user + isEdit flag
   * @param {Object}  base   - Dữ liệu gốc (formInputData hoặc targetRow)
   * @param {boolean} isEdit - true = edit, false = add
   * @returns {Object} payload đã gắn UserName, UserCreate, IsEdit
   */
  function _buildPayload(base, isEdit) {
    var p = Object.assign({}, base);
    var hasBusinessUserName = globalFormSchema.some(function (field) {
      if (String(field.name || '').toLowerCase() !== 'username') return false;
      return isEdit ? _bool(field.showInEdit) : _bool(field.showInAdd);
    });
    if (!hasBusinessUserName) p.UserName = _currentUser();
    p.UserCreate = _currentUser();
    p.IsEdit = isEdit ? 1 : 0;
    return p;
  }

  function _findFieldKey(keys, configuredName) {
    if (!configuredName) return '';
    var normalized = String(configuredName).toLowerCase();
    return keys.find(function (key) { return key.toLowerCase() === normalized; }) || '';
  }

  function _normalizeRenderRule(rule) {
    var normalized = String(rule || '').toLowerCase().trim();
    var aliases = {
      cb: 'sl',
      combo: 'sl',
      dropdown: 'sl',
      dropcheck: 'ms'
    };
    return aliases[normalized] || normalized;
  }

  function _buildOptionTable(dataList, field, maxCols) {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      return { keys: [], headers: ['Mã', 'Tên'], data: [], valueIndex: 0, colFilterIndex: 1 };
    }

    var keys = Object.keys(dataList[0]);
    if (field.hiddenColumns && Array.isArray(field.hiddenColumns)) {
      var hidden = field.hiddenColumns.map(function (name) { return String(name).toLowerCase(); });
      keys = keys.filter(function (key) { return hidden.indexOf(key.toLowerCase()) === -1; });
    }

    var valueKey = _findFieldKey(keys, field.valueField) || keys[0];
    var labelKey = _findFieldKey(keys, field.labelField) || keys.find(function (key) {
      return /name|tên|ten|label|desc|title/i.test(key) && key !== valueKey;
    }) || keys.find(function (key) { return key !== valueKey; }) || valueKey;

    var orderedKeys = [valueKey];
    if (labelKey !== valueKey) orderedKeys.push(labelKey);
    keys.forEach(function (key) {
      if (orderedKeys.indexOf(key) === -1) orderedKeys.push(key);
    });
    if (maxCols > 0) orderedKeys = orderedKeys.slice(0, maxCols);

    var headers = orderedKeys.map(function (key) {
      if (typeof currentDictionary !== 'undefined') {
        var dictionaryKey = Object.keys(currentDictionary).find(function (candidate) {
          return candidate.toLowerCase() === key.toLowerCase();
        });
        if (dictionaryKey && currentDictionary[dictionaryKey]) {
          return currentDictionary[dictionaryKey].CaptionVN || currentDictionary[dictionaryKey];
        }
      }
      return key;
    });

    return {
      keys: orderedKeys,
      headers: headers,
      data: dataList.map(function (row) {
        return orderedKeys.map(function (key) {
          return row[key] !== null && row[key] !== undefined ? row[key] : '';
        });
      }),
      valueIndex: 0,
      colFilterIndex: Math.max(0, orderedKeys.indexOf(labelKey))
    };
  }

  function _hasPermission(action) {
    if (typeof window.AppPermissions !== 'undefined') {
      var module = MODULE_CONFIG.FormName;
      if (action === 'ADD') return window.AppPermissions.hasPermission(module, 'IsAdd');
      if (action === 'EDIT') return window.AppPermissions.hasPermission(module, 'IsUpdate');
      if (action === 'DELETE') return window.AppPermissions.hasPermission(module, 'IsDelete');
      if (action === 'EXPORT') return window.AppPermissions.hasPermission(module, 'isExportExcel');
    }

    if (typeof Permission !== 'undefined') {
      var module = MODULE_CONFIG.FormName;
      if (action === 'ADD') return Permission.canAdd(module);
      if (action === 'EDIT') return Permission.canEdit(module);
      if (action === 'DELETE') return Permission.canDelete(module);
    }

    return true; // Fallback an toàn nếu chưa cấu hình
  }

  // ── Render ────────────────────────────────────────────────
  function render(container, config) {
    if (!container || !config) {
      console.error('DynamicFormEngine: Missing container or config');
      return;
    }

    // 1. Lưu lại state của module hiện tại trước khi chuyển sang module mới
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
    }

    $container = container;
    MODULE_CONFIG = ModuleConfigNormalizer.normalize(config);
    currentFormName = MODULE_CONFIG.FormName;

    // 2. Khôi phục state của module mới (nếu đã từng vào trước đó)
    var savedState = moduleStates[currentFormName];
    if (savedState) {
      currentKeyword = savedState.keyword;
      currentSortCol = savedState.sortCol;
      currentSortDir = savedState.sortDir;
      currentPage = savedState.page;
      window.currentFilters = savedState.filters;
    } else {
      // Nếu chưa từng vào thì reset về mặc định
      currentKeyword = '';
      currentSortCol = '';
      currentSortDir = '';
      currentPage = 1;
      window.currentFilters = null;
    }

    // Reset sạch sẽ Dictionary & Schema của Form cũ để tránh lây nhiễm (ví dụ API form mới bị lỗi thì không hiện rác của form cũ)
    globalDictionary = {};
    globalFormSchema = [];
    globalRenderers = {};

    // API defaults: FormBuilder dùng API chuyên biệt, các form khác dùng generic No-Code API
    _setDefaults(MODULE_CONFIG, { ApiDictionary: '/api/API_LayCacTruongGiaoDien' });

    _loadSelectedRows();


    // 1. Lấy Từ điển UI từ Database trước (Cơ chế Caching siêu tốc)
    var configEndpoint = MODULE_CONFIG.ApiDictionary;
    var cacheKey = 'FormConfigCache_' + MODULE_CONFIG.FormName + '_v' + (MODULE_CONFIG.SchemaVersion || 1);
    var cachedData = null;

    // RAM Cache cho giao diện
    if (!_isFormBuilder()) {
      try { cachedData = window._uiConfigCache ? window._uiConfigCache[cacheKey] : null; } catch (e) { }
    }

    var pConfig;
    if (cachedData) {
      pConfig = Promise.resolve(JSON.parse(cachedData));
    } else {
      pConfig = configEndpoint ? ApiClient.post(configEndpoint, { FormName: MODULE_CONFIG.FormName }).then(function (res) {
        if (res && res.code === 0 && !_isFormBuilder()) {
          window._uiConfigCache = window._uiConfigCache || {};
          window._uiConfigCache[cacheKey] = JSON.stringify(res);
        }
        return res;
      }) : Promise.resolve(null);
    }

    pConfig.then(function (resConfig) {

      // 2. Lưu Từ điển vào biến toàn cục
      var dataList = resConfig ? (resConfig.list || resConfig.records) : null;
      if (resConfig && resConfig.code === 0 && dataList) {

        // --- NO-CODE MAGIC: Đọc cấu hình cấp Form từ Record đầu tiên ---
        if (dataList.length > 0) {
          var firstRow = dataList[0];

          // Map API fields → MODULE_CONFIG (chỉ ghi nếu API trả về giá trị)
          var _rowMap = { primaryKey: 'PrimaryKey' }; // Ngừng lấy formTitle và formSubtitle để ưu tiên router
          Object.keys(_rowMap).forEach(function (src) {
            if (firstRow[src]) MODULE_CONFIG[_rowMap[src]] = firstRow[src];
          });

          // WA_API is the source of truth for form capabilities. Explicit module
          // flags may hide more actions, but they cannot enable a missing route.
          if (firstRow.canAdd !== undefined || firstRow.CanAdd !== undefined) {
            MODULE_CONFIG.CanAddOperation = _bool(firstRow.canAdd, firstRow.CanAdd);
            if (!MODULE_CONFIG.CanAddOperation) MODULE_CONFIG.HideAddBtn = true;
          }
          if (firstRow.canEdit !== undefined || firstRow.CanEdit !== undefined) {
            MODULE_CONFIG.CanEditOperation = _bool(firstRow.canEdit, firstRow.CanEdit);
            if (!MODULE_CONFIG.CanEditOperation) MODULE_CONFIG.HideEditBtn = true;
          }
          if (firstRow.canDelete !== undefined || firstRow.CanDelete !== undefined) {
            MODULE_CONFIG.CanDeleteOperation = _bool(firstRow.canDelete, firstRow.CanDelete);
            if (!MODULE_CONFIG.CanDeleteOperation) MODULE_CONFIG.HideDeleteBtn = true;
          }

          // A copied or stale detail URL must not bypass the operation contract.
          if (MODULE_CONFIG.IsDetailForceEdit && MODULE_CONFIG.CanEditOperation === false) {
            MODULE_CONFIG.IsDetailForceEdit = false;
          }

          // Sinh nhãn mặc định — caller có thể override từ config
          _setDefaults(MODULE_CONFIG, {
            TitleAdd: '➕ Thêm ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || 'Mới'),
            TitleEdit: '✏️ Sửa ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || ''),
            BtnSaveAdd: 'Thêm mới',
            BtnSaveEdit: 'Lưu thay đổi',
            BtnSaveAll: 'Lưu Tất Cả',
            BtnCancel: 'Hủy bỏ',
            BtnSaveSaving: 'Đang lưu...',
            ToastAdd: 'Đã thêm mới thành công!',
            ToastEdit: 'Đã cập nhật thành công!',
            ToastDelete: 'Xóa thành công!',
            WarnMissingInfo: 'Thiếu thông tin',
            WarnMissingInput: 'Vui lòng điền đầy đủ thông tin: {0}',
            WarnSelectEdit: 'Vui lòng chọn dữ liệu cần sửa',
            WarnSelectDelete: 'Vui lòng chọn dữ liệu cần xóa',
            ConfirmDelete: 'Bạn có chắc muốn xóa {0}?',
            TextDeleteFallback: 'dòng này',
            AlertTitleConfirm: 'Xác nhận xóa',
            AlertTitleWarning: 'Cảnh báo',
            AlertTitleError: 'Lỗi',
            AlertTitleInfo: 'Thông báo',
            AlertApiMissing: 'Chưa cấu hình API lưu',
            AlertSaveFailed: 'Lưu dữ liệu thất bại',
            AlertDeleteFailed: 'Xóa dữ liệu thất bại',
            AlertNetworkError: 'Lỗi kết nối mạng',
            ModalWidth: '600px'
          });
        }

        dataList.forEach(function (item) {
          // Xây Dictionary cho Table
          globalDictionary[item.name] = item.label;


          // Xây dựng Custom Renderers Động từ cấu hình DB (FormatID hoặc renderRule)
          var format = (item.formatId || item.FormatID || item.renderRule || '').toLowerCase();
          if (format === 'n' || format === 'c' || item.renderRule) {
            globalRenderers[item.name] = function (v) {
              if (format === 'n') {
                var n = parseFloat(v);
                return isNaN(n) ? (v || '') : n.toLocaleString('vi-VN');
              }
              if (format === 'c') {
                var isChecked = (v === true || v === 1 || String(v) === '1' || String(v).toLowerCase() === 'true');
                return isChecked
                  ? '<span style="color:var(--color-success); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span></span>'
                  : '<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span></span>';
              }
              if (item.renderRule) {
                var rule = item.renderRule.toLowerCase();
                if (rule === 'sw' || rule === 'boolean') {
                  var isChecked = (String(v) === '1' || String(v).toLowerCase() === 'true');
                  return isChecked
                    ? '<span style="color:var(--color-success);"><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">check_circle</span></span>'
                    : '<span style="color:var(--color-text-tertiary);">-</span>';
                }
                if (!v || v === '0' || v === 0) return (rule.indexOf('badge:') === 0 || rule === 'bg' || rule === 'br' || rule === 'bw') ? '-' : v;
                if (rule === 'bg') return '<span class="status-badge success">' + v + '</span>';
                if (rule === 'br') return '<span class="status-badge danger">' + v + '</span>';
                if (rule === 'bw') return '<span class="status-badge warning">' + v + '</span>';
                if (rule === 'cr') return '<span style="color:var(--color-danger);font-weight:600;">' + v + '</span>';
                if (rule === 'cg') return '<span style="color:var(--color-success);font-weight:600;">' + v + '</span>';
                if (rule === 'cb') return '<span style="color:var(--color-primary);font-weight:600;">' + v + '</span>';
                if (item.renderRule.indexOf('Badge:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  return '<span class="status-badge ' + color + '">' + v + '</span>';
                } else if (item.renderRule.indexOf('Color:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  var safeVal = String(v).replace(/"/g, '&quot;');
                  return '<span title="' + safeVal + '" style="color:var(--color-' + color + ');font-weight:600;">' + safeVal + '</span>';
                }
              }
              return v;
            };
          }

          // Xây Schema cho Form (Lưu toàn bộ để lấy Khóa chính)
          var rawValidate = (item.validateRule || item.ValidateRule || '').trim();
          var rawVisible = (item.visibleRule || item.VisibleRule || '').trim();

          var formulaMatch = rawValidate.match(/formula:([^|]+)/i) || rawVisible.match(/formula:([^|]+)/i);
          var triggerMatch = rawValidate.match(/trigger:([^|]+)/i) || rawVisible.match(/trigger:([^|]+)/i);

          var fieldName = item.name || item.FieldName;
          var isReadOnlyEditVal = _bool(item.isReadOnlyEdit, item.IsReadOnlyEdit);
          var isReadOnlyAddVal = _bool(item.isReadOnlyAdd, item.IsReadOnlyAdd);
          var hiddenColsVal = [];

          var finalPosition = item.FormPosition || item.formPosition || item.position || 'grid';
          var finalRenderRule = _normalizeRenderRule(item.renderRule || item.formatId || item.FormatID);
          var finalLabel = item.label || item.CaptionVN;

          var inheritedOverrides = MetadataModuleConfig.getFieldConfig(fieldName, MODULE_CONFIG.FormName);
          var moduleOverrides = {};
          if (MODULE_CONFIG.fieldOverrides) {
            var overrideKey = Object.keys(MODULE_CONFIG.fieldOverrides).find(function (k) {
              return k.toLowerCase() === fieldName.toLowerCase();
            });
            if (overrideKey) moduleOverrides = MODULE_CONFIG.fieldOverrides[overrideKey];
          }
          var overrides = Object.assign({}, inheritedOverrides, moduleOverrides);
          if (Object.keys(overrides).length > 0) {
            if (overrides.isReadOnlyEdit !== undefined) isReadOnlyEditVal = overrides.isReadOnlyEdit;
            if (overrides.isReadOnlyAdd !== undefined) isReadOnlyAddVal = overrides.isReadOnlyAdd;
            if (overrides.showInAdd !== undefined) item.showInAdd = overrides.showInAdd;
            if (overrides.showInEdit !== undefined) item.showInEdit = overrides.showInEdit;
            if (overrides.required !== undefined) item.required = overrides.required;
            if (overrides.IsRequired !== undefined) item.IsRequired = overrides.IsRequired;
            if (overrides.hiddenColumns !== undefined) hiddenColsVal = overrides.hiddenColumns;
            if (overrides.renderRule !== undefined) finalRenderRule = _normalizeRenderRule(overrides.renderRule);
            if (overrides.dataSource !== undefined) item.dataSource = overrides.dataSource;
            if (overrides.dataSourceMethod !== undefined) item.dataSourceMethod = overrides.dataSourceMethod;
            if (overrides.valueField !== undefined) item.valueField = overrides.valueField;
            if (overrides.labelField !== undefined) item.labelField = overrides.labelField;
            if (overrides.allowCustomValue !== undefined) item.allowCustomValue = overrides.allowCustomValue;
            if (overrides.multiple !== undefined) item.multiple = overrides.multiple;
            if (overrides.position !== undefined) finalPosition = overrides.position;
            if (overrides.label !== undefined) finalLabel = overrides.label;
          }

          if (MODULE_CONFIG.FormFields && Array.isArray(MODULE_CONFIG.FormFields)) {
            var ff = MODULE_CONFIG.FormFields.find(function (f) { return f.name.toLowerCase() === fieldName.toLowerCase(); });
            if (ff) {
              if (ff.isReadOnlyEdit !== undefined) isReadOnlyEditVal = ff.isReadOnlyEdit;
              if (ff.isReadOnlyAdd !== undefined) isReadOnlyAddVal = ff.isReadOnlyAdd;
              if (ff.showInAdd !== undefined) item.showInAdd = ff.showInAdd;
              if (ff.showInEdit !== undefined) item.showInEdit = ff.showInEdit;
              if (ff.required !== undefined) item.required = ff.required;
              if (ff.IsRequired !== undefined) item.IsRequired = ff.IsRequired;
              if (ff.hiddenColumns !== undefined) hiddenColsVal = ff.hiddenColumns;
              if (ff.renderRule !== undefined) finalRenderRule = _normalizeRenderRule(ff.renderRule);
              if (ff.dataSource !== undefined) item.dataSource = ff.dataSource;
              if (ff.dataSourceMethod !== undefined) item.dataSourceMethod = ff.dataSourceMethod;
              if (ff.valueField !== undefined) item.valueField = ff.valueField;
              if (ff.labelField !== undefined) item.labelField = ff.labelField;
              if (ff.allowCustomValue !== undefined) item.allowCustomValue = ff.allowCustomValue;
              if (ff.multiple !== undefined) item.multiple = ff.multiple;
              if (ff.position !== undefined) finalPosition = ff.position;
              if (ff.label !== undefined) finalLabel = ff.label;
              if (ff.html !== undefined) item.html = ff.html;
            }
          }

          globalFormSchema.push({
            name: fieldName,
            label: finalLabel,
            required: _bool(item.required, item.IsRequired),
            showInAdd: _bool(item.showInAdd, item.ShowInAdd),
            showInEdit: _bool(item.showInEdit, item.ShowInEdit),
            showInFilter: _bool(item.showInFilter, item.ShowInFilter),
            isReadOnlyEdit: isReadOnlyEditVal,
            isReadOnlyAdd: isReadOnlyAddVal,
            position: finalPosition,
            orderNo: item.OrderNo || item.orderNo || 0,
            renderRule: finalRenderRule,
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            dataSourceMethod: String(item.dataSourceMethod || item.DataSourceMethod || 'POST').toUpperCase(),
            valueField: item.valueField || item.ValueField || '',
            labelField: item.labelField || item.LabelField || '',
            allowCustomValue: item.allowCustomValue !== false,
            multiple: item.multiple === true || finalRenderRule === 'ms',
            validateRule: rawValidate,
            dependsOn: (item.dependsOn || item.DependsOn || '').trim(),
            visibleRule: rawVisible,
            formulaRule: formulaMatch ? formulaMatch[1].trim() : '',
            triggerApi: triggerMatch ? triggerMatch[1].trim() : '',
            hiddenColumns: hiddenColsVal,
            html: item.html
          });
        });

        // Hỗ trợ CHÈN THÊM TRƯỜNG TỰ DO (ví dụ nút bấm) từ FormFields (Chỉ chèn những trường chưa có trong DB)
        if (MODULE_CONFIG.FormFields && Array.isArray(MODULE_CONFIG.FormFields)) {
          MODULE_CONFIG.FormFields.forEach(function (cf) {
            if (!globalFormSchema.find(function (sf) { return sf.name.toLowerCase() === cf.name.toLowerCase(); })) {
              globalFormSchema.push({
                name: cf.name,
                label: cf.label || '',
                required: cf.required || false,
                showInAdd: cf.showInAdd !== false,
                showInEdit: cf.showInEdit !== false,
                showInFilter: false,
                isReadOnlyEdit: cf.isReadOnlyEdit || false,
                isReadOnlyAdd: cf.isReadOnlyAdd || false,
                position: cf.position || 'grid',
                orderNo: cf.orderNo || 999, // Xếp cuối theo mặc định
                renderRule: (cf.renderRule || '').toLowerCase().trim(),
                dataSource: cf.dataSource || '',
                dataSourceMethod: String(cf.dataSourceMethod || 'POST').toUpperCase(),
                valueField: cf.valueField || '',
                labelField: cf.labelField || '',
                allowCustomValue: cf.allowCustomValue !== false,
                multiple: cf.multiple === true || cf.renderRule === 'ms',
                html: cf.html || ''
              });
            }
          });

          // Sắp xếp lại globalFormSchema đúng theo thứ tự khai báo trong FormFields
          globalFormSchema.sort(function (a, b) {
            var idxA = MODULE_CONFIG.FormFields.findIndex(function (f) { return f.name.toLowerCase() === a.name.toLowerCase(); });
            var idxB = MODULE_CONFIG.FormFields.findIndex(function (f) { return f.name.toLowerCase() === b.name.toLowerCase(); });
            if (idxA === -1) idxA = 9999;
            if (idxB === -1) idxB = 9999;
            return idxA - idxB;
          });
        }

        if (Object.keys(globalDictionary).length === 0) {
          console.warn('API returned no fields for FormName:', MODULE_CONFIG.FormName);
        }
      } else {
        console.warn('API Dictionary fetch failed or empty', resConfig);
      }
      // Tự động sinh mã HTML (Không cần file .html rời nữa)
      if (MODULE_CONFIG.UseSplitLayout && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
        var defaultDetailTitle = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
        var defaultSelectText = MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết';
        var detailWidth = MODULE_CONFIG.SplitLayoutDetailWidth || '450px';
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div class="split-master-detail-container form-${MODULE_CONFIG.FormName}">
                <div id="dynamic-grid-container"></div>
                <div id="dynamic-detail-container" style="width: ${detailWidth}; max-width: calc(100% - 320px); flex-shrink: 0; border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; background: var(--color-surface);">
                  <button type="button" class="detail-back-btn" style="display: none; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-primary); font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 14px; align-self: flex-start; transition: all 0.2s ease;">
                    <span class="material-symbols-outlined" style="font-size: 18px; font-weight: 600;">arrow_back</span>
                    <span>Quay lại danh sách</span>
                  </button>
                  <div class="detail-header" style="margin-bottom: 12px; font-weight: 600; font-size: 15px; color: var(--color-primary); border-bottom: 2px solid var(--color-primary-light); padding: 0 4px 8px 4px;">
                    ${defaultDetailTitle}
                  </div>
                  <div id="dynamic-detail-content" style="flex: 1; overflow-y: auto;">
                    <div class="empty-detail-state">
                      <div class="empty-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div class="empty-text-main">Chưa có thông tin</div>
                      <div class="empty-text-sub">${defaultSelectText}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>
            /* Desktop / Tablet defaults */
            .split-master-detail-container {
              display: flex;
              gap: 16px;
              align-items: stretch;
            }
            #dynamic-grid-container {
              flex: 1;
              min-width: 0;
            }
            
            /* Hide detail container by default on Desktop too */
            .split-master-detail-container:not(.show-detail) #dynamic-detail-container {
              display: none !important;
            }

            .detail-back-btn {
              display: none !important;
            }
            .detail-tabs-mobile-select-wrapper {
              display: none !important;
            }

            /* Responsive styles (Mobile < 768px) */
            @media (max-width: 768px) {
              .split-master-detail-container {
                height: auto !important;
                flex-direction: column !important;
                gap: 0 !important;
              }
              
              /* Hide detail container by default on mobile */
              .split-master-detail-container #dynamic-detail-container {
                display: none !important;
              }
              .split-master-detail-container #dynamic-grid-container {
                display: block !important;
              }

              /* When a row is selected and we show detail */
              .split-master-detail-container.show-detail #dynamic-detail-container {
                display: flex !important;
                width: 100% !important;
                max-width: none !important;
                border: none !important;
                padding: 12px 16px !important;
                box-sizing: border-box !important;
                overflow: visible !important;
              }
              .split-master-detail-container.show-detail #dynamic-detail-content {
                overflow: visible !important;
              }
              .split-master-detail-container.show-detail #dynamic-grid-container {
                display: none !important;
              }

              /* Show back button when detail is shown on mobile */
              .split-master-detail-container.show-detail .detail-back-btn {
                display: inline-flex !important;
              }

              /* Hide desktop tabs and show mobile select menu */
              .split-master-detail-container .detail-tabs-bar {
                display: none !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select-wrapper {
                display: block !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select {
                appearance: none !important;
                -webkit-appearance: none !important;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
                background-repeat: no-repeat !important;
                background-position: right 14px center !important;
                background-size: 16px !important;
                padding-right: 40px !important;
                border: 1px solid var(--color-border) !important;
                background-color: var(--color-surface) !important;
                color: var(--color-text) !important;
                font-family: inherit !important;
              }

              /* Single column layout for detail fields */
              .split-master-detail-container .detail-fields-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
                padding: 16px !important;
                width: 100% !important;
                max-width: 440px !important;
                margin: 0 auto !important;
              }

              /* Put photo box on top of form columns */
              .split-master-detail-container .detail-form-wrap {
                flex-direction: column-reverse !important;
                align-items: center !important;
                gap: 20px !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper {
                width: auto !important;
                max-width: none !important;
                margin-bottom: 0 !important;
                align-self: center !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper .detail-img-frame {
                width: 120px !important;
                height: 120px !important;
              }
            }
          </style>
        `;
      } else {
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div id="dynamic-grid-container"></div>
            </div>
          </div>
        `;
      }

      // Action Toolbar (Gắn vào Global Header thay vì cục bộ)
      var globalActions = document.getElementById('global-page-actions');
      var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');

      // Xóa các nút cũ trong global header nếu có để tránh duplicate khi re-render
      if (globalActions) globalActions.innerHTML = '';

      if (btnContainer && typeof UIActionToolbar !== 'undefined') {
        var extraBtns = [];
        if (window.FormActionPlugins) {
          window.FormActionPlugins.forEach(function (plugin) {
            if (typeof plugin.getExtraButtons === 'function') {
              var getSelected = function () { return selectedRows; };
              var onReload = function () {
                _loadData();
              };
              var btns = plugin.getExtraButtons(MODULE_CONFIG.FormName, getSelected, MODULE_CONFIG, onReload);
              if (btns && btns.length > 0) extraBtns = extraBtns.concat(btns);
            }
          });
        }

        // Menu Tùy chọn bảng
        var tabulatorActionWrapper = document.createElement('div');
        tabulatorActionWrapper.className = 'tabulator-action-wrapper';
        tabulatorActionWrapper.style.cssText = 'position: relative; display: inline-flex; margin-left: auto; align-items: center;';

        var tabulatorActionBtn = document.createElement('button');
        tabulatorActionBtn.type = 'button';
        // Giao diện mềm mại, không có viền cứng, màu nền nhạt như phong cách hiện đại
        tabulatorActionBtn.className = 'btn';
        tabulatorActionBtn.style.cssText = 'display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; height: 36px; background: rgba(79, 70, 229, 0.08); color: #4f46e5; border: none; transition: background 0.2s;';
        tabulatorActionBtn.onmouseover = function () { this.style.background = 'rgba(79, 70, 229, 0.15)'; };
        tabulatorActionBtn.onmouseout = function () { this.style.background = 'rgba(79, 70, 229, 0.08)'; };
        tabulatorActionBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">table_chart</span> <span>Tùy chọn bảng</span> <span class="material-symbols-outlined" style="font-size:18px;">expand_more</span>';

        var tabulatorActionMenu = document.createElement('div');
        tabulatorActionMenu.style.cssText = 'display: none; position: absolute; right: 0; top: calc(100% + 4px); min-width: 200px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #ccc); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-radius: 8px; z-index: 9999; padding: 8px;';

        // Helper tạo item
        function createMenuItem(icon, text, action) {
          var item = document.createElement('div');
          item.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; font-size: 14px; border-radius: 6px; color: var(--color-text); transition: background 0.2s;';
          item.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px; color:var(--color-text-secondary);">' + icon + '</span><span>' + text + '</span>';
          item.onmouseover = function () { item.style.backgroundColor = 'var(--color-background, #f1f5f9)'; };
          item.onmouseout = function () { item.style.backgroundColor = 'transparent'; };
          item.onclick = function (e) {
            tabulatorActionMenu.style.display = 'none';
            action(e);
          };
          return item;
        }


        tabulatorActionMenu.appendChild(createMenuItem('view_column', 'Tùy chọn hiển thị cột', function (e) {
          var menu = document.getElementById('tabulator-col-menu');
          if (menu) {
            menu.remove();
            return;
          }

          // Backdrop để che nền (làm mờ hoặc không tùy ý, giúp click out dễ dàng)
          var backdrop = document.createElement('div');
          backdrop.id = 'tabulator-col-backdrop';
          backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.2); z-index: 10000;';

          menu = document.createElement('div');
          menu.id = 'tabulator-col-menu';
          // Modal hiển thị chính giữa màn hình
          menu.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--color-surface, #fff); border-radius: 12px; padding: 20px; z-index: 10001; box-shadow: 0 12px 32px rgba(0,0,0,0.2); width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column;';

          var headerTop = document.createElement('div');
          headerTop.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border, #eee); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;';

          var title = document.createElement('div');
          title.textContent = 'Ẩn / Hiện Cột';
          title.style.cssText = 'font-weight: 600; font-size: 16px;';
          headerTop.appendChild(title);

          var actionBtns = document.createElement('div');
          actionBtns.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; flex: 1; justify-content: flex-end;';

          var btnSelectAll = document.createElement('button');
          btnSelectAll.type = 'button';
          btnSelectAll.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('check_box', 'font-size:16px; margin-right:4px;') : '') + 'Chọn tất cả';
          btnSelectAll.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px solid var(--color-border-strong, #e2e8f0); border-radius: 6px; background: transparent; color: var(--color-text, #1e293b); cursor: pointer; transition: all 0.2s;';
          btnSelectAll.onmouseover = function () { this.style.borderColor = 'var(--color-primary, #4338ca)'; this.style.color = 'var(--color-primary, #4338ca)'; this.style.background = 'var(--color-primary-light, rgba(79, 70, 229, 0.05))'; };
          btnSelectAll.onmouseout = function () { this.style.borderColor = 'var(--color-border-strong, #e2e8f0)'; this.style.color = 'var(--color-text, #1e293b)'; this.style.background = 'transparent'; };

          var btnDeselectAll = document.createElement('button');
          btnDeselectAll.type = 'button';
          btnDeselectAll.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('check_box_outline_blank', 'font-size:16px; margin-right:4px;') : '') + 'Bỏ chọn';
          btnDeselectAll.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px solid var(--color-border-strong, #e2e8f0); border-radius: 6px; background: transparent; color: var(--color-text-secondary, #64748b); cursor: pointer; transition: all 0.2s;';
          btnDeselectAll.onmouseover = function () { this.style.borderColor = 'var(--color-text-secondary, #64748b)'; this.style.background = 'var(--color-border, #f1f5f9)'; };
          btnDeselectAll.onmouseout = function () { this.style.borderColor = 'var(--color-border-strong, #e2e8f0)'; this.style.background = 'transparent'; };

          var btnReset = document.createElement('button');
          btnReset.type = 'button';
          btnReset.innerHTML = (typeof UIIcon !== 'undefined' ? UIIcon.createHTML('restart_alt', 'font-size:16px; margin-right:4px;') : '') + 'Mặc định';
          btnReset.title = 'Khôi phục cột về mặc định ban đầu';
          btnReset.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px dashed var(--color-danger, #f43f5e); border-radius: 6px; background: transparent; color: var(--color-danger, #f43f5e); cursor: pointer; transition: all 0.2s; margin-left: auto;';
          btnReset.onmouseover = function () { this.style.background = 'var(--color-danger, #f43f5e)'; this.style.color = '#fff'; };
          btnReset.onmouseout = function () { this.style.background = 'transparent'; this.style.color = 'var(--color-danger, #f43f5e)'; };

          actionBtns.appendChild(btnSelectAll);
          actionBtns.appendChild(btnDeselectAll);
          actionBtns.appendChild(btnReset);
          headerTop.appendChild(actionBtns);
          menu.appendChild(headerTop);

          var content = document.createElement('div');
          content.style.cssText = 'overflow-y: auto; flex: 1; padding-right: 8px; margin-bottom: 16px; column-width: 200px; column-gap: 16px; display: block;';
          menu.appendChild(content);

          function _saveColState() {
            if (!window.tabulatorInstance) return;
            var cols = window.tabulatorInstance.getColumns();
            var visibilityState = {};
            cols.forEach(function (c) {
              var fld = c.getField();
              if (fld && fld !== '__action__' && fld !== 'row_select') {
                visibilityState[fld] = c.isVisible();
              }
            });
            var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
            var formName = MODULE_CONFIG.FormName || 'default_form';
            localStorage.setItem('tabulator_cols_' + userName + '_' + formName, JSON.stringify(visibilityState));
          }

          btnSelectAll.onclick = function () {
            var checkboxes = content.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (cb) { cb.checked = true; });
            if (window.tabulatorInstance) {
              var columns = window.tabulatorInstance.getColumns();
              columns.forEach(function (col) {
                var field = col.getField();
                if (field && field !== '__action__' && field !== 'row_select') {
                  col.show();
                }
              });
              _saveColState();
            }
          };

          btnDeselectAll.onclick = function () {
            var checkboxes = content.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (cb) { cb.checked = false; });
            if (window.tabulatorInstance) {
              var columns = window.tabulatorInstance.getColumns();
              columns.forEach(function (col) {
                var field = col.getField();
                if (field && field !== '__action__' && field !== 'row_select') {
                  col.hide();
                }
              });
              _saveColState();
            }
          };

          btnReset.onclick = function () {
            var msg = 'Khôi phục hiển thị cột về trạng thái mặc định của hệ thống?';
            if (typeof ConfirmModal !== 'undefined') {
              ConfirmModal.show({
                title: 'Khôi phục Mặc định',
                message: msg,
                onConfirm: function () {
                  var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                  var formName = MODULE_CONFIG.FormName || 'default_form';
                  localStorage.removeItem('tabulator_cols_' + userName + '_' + formName);
                  localStorage.removeItem('tabulator_col_order_' + userName + '_' + formName);
                  _renderTable();
                  backdrop.remove();
                }
              });
            } else {
              if (confirm(msg)) {
                var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                var formName = MODULE_CONFIG.FormName || 'default_form';
                localStorage.removeItem('tabulator_cols_' + userName + '_' + formName);
                localStorage.removeItem('tabulator_col_order_' + userName + '_' + formName);
                _renderTable();
                backdrop.remove();
              }
            }
          };

          if (window.tabulatorInstance) {
            var columns = window.tabulatorInstance.getColumns();
            columns.forEach(function (col) {
              var field = col.getField();
              if (field && field !== '__action__' && field !== 'row_select') {
                var def = col.getDefinition();
                var label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; cursor: grab; font-size: 14px; padding: 4px 6px; border-radius: 6px; transition: background 0.2s; break-inside: avoid; page-break-inside: avoid; margin-bottom: 4px;';
                label.onmouseover = function () { label.style.background = 'rgba(0,0,0,0.03)'; };
                label.onmouseout = function () { label.style.background = 'transparent'; };

                // Drag & Drop cho nhãn
                label.draggable = true;
                label.dataset.field = field;

                label.ondragstart = function (e) {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', field);
                  this.style.opacity = '0.4';
                  window.__draggingColField = field;
                };

                label.ondragend = function (e) {
                  this.style.opacity = '1';
                  var labels = content.querySelectorAll('label');
                  labels.forEach(function (l) {
                    l.style.boxShadow = 'none';
                    l.style.background = 'transparent';
                  });
                  window.__draggingColField = null;
                };

                label.ondragover = function (e) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  return false;
                };

                label.ondragenter = function (e) {
                  e.preventDefault();
                  if (window.__draggingColField && window.__draggingColField !== field) {
                    this.style.boxShadow = '0 -2px 0 var(--color-primary, #4338ca)';
                    this.style.background = 'rgba(67, 56, 202, 0.05)';
                  }
                };

                label.ondragleave = function (e) {
                  this.style.boxShadow = 'none';
                  this.style.background = 'transparent';
                };

                label.ondrop = function (e) {
                  e.stopPropagation();
                  this.style.boxShadow = 'none';
                  this.style.background = 'transparent';
                  var draggingField = e.dataTransfer.getData('text/plain') || window.__draggingColField;
                  if (draggingField && draggingField !== field) {
                    var draggingNode = content.querySelector('label[data-field="' + draggingField + '"]');
                    if (draggingNode) {
                      content.insertBefore(draggingNode, this);
                      if (window.tabulatorInstance) {
                        window.tabulatorInstance.moveColumn(draggingField, field, false);
                        var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
                        var formName = MODULE_CONFIG.FormName || 'default_form';
                        var currentCols = window.tabulatorInstance.getColumns();
                        var colOrder = [];
                        currentCols.forEach(function (c) {
                          var fld = c.getField();
                          if (fld) colOrder.push(fld);
                        });
                        localStorage.setItem('tabulator_col_order_' + userName + '_' + formName, JSON.stringify(colOrder));
                      }
                    }
                  }
                  return false;
                };

                // Thêm icon drag để người dùng biết có thể kéo thả
                var dragIcon = document.createElement('span');
                dragIcon.className = 'material-symbols-outlined';
                dragIcon.style.cssText = 'font-size: 16px; color: var(--color-text-secondary, #94a3b8); margin-right: 6px; cursor: grab;';
                dragIcon.innerText = 'drag_indicator';
                label.appendChild(dragIcon);

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = col.isVisible();
                checkbox.style.cssText = 'margin-right: 10px; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; pointer-events: none;';
                checkbox.onchange = function () {
                  col.toggle();
                  _saveColState();
                };

                // Cho phép click vào label để toggle checkbox do pointer-events: none
                label.onclick = function (e) {
                  if (e.target !== checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    col.toggle();
                    _saveColState();
                  }
                };

                label.appendChild(checkbox);
                var spanText = document.createElement('span');
                spanText.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;';
                spanText.textContent = def.title || field;
                spanText.title = def.title || field; // tooltip for long names
                label.appendChild(spanText);

                content.appendChild(label);
              }
            });
          }

          var closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'btn btn-primary w-100';
          closeBtn.textContent = 'Hoàn tất';
          closeBtn.onclick = function () {
            backdrop.remove();
          };
          menu.appendChild(closeBtn);

          backdrop.appendChild(menu);
          document.body.appendChild(backdrop);

          // Click ra ngoài modal để đóng
          backdrop.onclick = function (evt) {
            if (evt.target === backdrop) {
              backdrop.remove();
            }
          };
        }));

        if (_hasPermission('EXPORT')) {
          tabulatorActionMenu.appendChild(createMenuItem('download', 'Xuất dữ liệu Excel', function () {
            if (window.tabulatorInstance) {
              try {
                // Xuất Excel có style (Màu nền, chữ đậm cho tiêu đề, hiển thị đúng thứ tự kéo thả)
                var columns = window.tabulatorInstance.getColumns().filter(function (c) {
                  return c.isVisible() && c.getField();
                });
                var data = window.tabulatorInstance.getData('active');
                var title = MODULE_CONFIG.PageTitle || "Danh_sach_du_lieu";

                var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
                html += '<head><meta charset="utf-8"></head><body>';
                html += '<h3 style="font-family: Arial, sans-serif;">' + title + '</h3>';
                html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px;">';

                function escapeHtml(text) {
                  if (text == null) return '';
                  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                // Tạo dòng Header với CSS inline
                html += '<tr>';
                columns.forEach(function (col) {
                  var colTitle = col.getDefinition().title || '';
                  html += '<th style="background-color: #f1f5f9; color: #1e293b; font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">' + escapeHtml(colTitle) + '</th>';
                });
                html += '</tr>';

                // Tạo các dòng Dữ liệu
                data.forEach(function (row) {
                  html += '<tr>';
                  columns.forEach(function (col) {
                    var field = col.getField();
                    var val = row[field];

                    // Map riêng cột PersonStatus sang chữ giống như UI đã xử lý
                    if (field.toLowerCase() === 'personstatus') {
                      val = row.PersonStatusName || row.personstatusname || val;
                    }

                    // Giữ định dạng chuỗi cho các số dễ bị Excel biến dạng (VD: Số điện thoại, CCCD)
                    var valStr = escapeHtml(val);
                    var tdStyle = 'border: 1px solid #e2e8f0; vertical-align: middle;';
                    if (String(val).match(/^0[0-9]{8,11}$/)) {
                      tdStyle += ' mso-number-format:"\\@";'; // Ép kiểu text cho số 0 ở đầu
                    }

                    html += '<td style="' + tdStyle + '">' + valStr + '</td>';
                  });
                  html += '</tr>';
                });

                html += '</table></body></html>';

                var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = title + ".xls";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error("Lỗi xuất Excel tùy chỉnh:", e);
                // Fallback lại cách cũ nếu có lỗi
                window.tabulatorInstance.download("xlsx", (MODULE_CONFIG.PageTitle || "Data") + ".xlsx", { sheetName: "Du_Lieu" });
              }
            } else {
              if (typeof Alert !== 'undefined') Alert.info('Thông báo', 'Bảng chưa được tải.');
            }
          }));

          tabulatorActionMenu.appendChild(createMenuItem('picture_as_pdf', 'Xuất dữ liệu PDF', function () {
            if (window.tabulatorInstance) {
              try {
                // Dùng Native Browser Print để khắc phục triệt để lỗi Font Tiếng Việt của thư viện jsPDF
                var title = "Báo cáo " + (MODULE_CONFIG.PageTitle || "Dữ liệu");
                var columns = window.tabulatorInstance.getColumns().filter(function (c) { return c.isVisible() && c.getField() !== '__action__'; });
                var data = window.tabulatorInstance.getData("active");

                var html = '<!DOCTYPE html><html><head><title>' + title + '</title>';
                html += '<style>';
                html += '@page { size: landscape; margin: 15mm; }';
                html += 'body { font-family: "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; }';
                html += 'h2 { text-align: center; color: #0f172a; text-transform: uppercase; margin-bottom: 24px; font-size: 22px; letter-spacing: 0.5px; }';
                html += 'table { width: 100%; border-collapse: collapse; font-size: 11px; }';
                html += 'th, td { border: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; vertical-align: middle; word-wrap: break-word; }';
                html += 'th { background-color: #f8fafc; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 10px; }';
                html += 'tr:nth-child(even) { background-color: #fbfcfd; }';
                html += '</style></head><body>';
                html += '<h2>' + title + '</h2>';
                html += '<table><thead><tr>';

                function escapeHtml(text) {
                  if (text == null) return '';
                  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                columns.forEach(function (col) {
                  html += '<th>' + escapeHtml(col.getDefinition().title || '') + '</th>';
                });
                html += '</tr></thead><tbody>';

                data.forEach(function (row) {
                  html += '<tr>';
                  columns.forEach(function (col) {
                    var field = col.getField();
                    var val = row[field];
                    if (field && field.toLowerCase() === 'personstatus') {
                      val = row.PersonStatusName || row.personstatusname || val;
                    }
                    html += '<td>' + escapeHtml(val) + '</td>';
                  });
                  html += '</tr>';
                });
                html += '</tbody></table>';
                html += '</body></html>';

                // Tạo iframe ẩn để kích hoạt trình in PDF native của trình duyệt
                var iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);

                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(html);
                iframe.contentWindow.document.close();

                setTimeout(function () {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                  setTimeout(function () { document.body.removeChild(iframe); }, 1500);
                }, 500);

              } catch (e) {
                console.error("Lỗi xuất PDF tuỳ chỉnh:", e);
                // Fallback
                window.tabulatorInstance.download("pdf", (MODULE_CONFIG.PageTitle || "Data") + ".pdf", { orientation: "landscape" });
              }
            } else {
              if (typeof Alert !== 'undefined') Alert.info('Thông báo', 'Bảng chưa được tải.');
            }
          }));
        }

        tabulatorActionWrapper.appendChild(tabulatorActionBtn);
        // Append menu to body to avoid overflow hidden clipping from parents
        document.body.appendChild(tabulatorActionMenu);

        // Bật/tắt menu
        tabulatorActionBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isVisible = tabulatorActionMenu.style.display === 'block';
          document.querySelectorAll('.dropdown-menu-custom').forEach(function (el) { el.style.display = 'none'; });

          if (!isVisible) {
            var rect = tabulatorActionBtn.getBoundingClientRect();
            tabulatorActionMenu.style.top = (rect.bottom + 5) + 'px';
            // Đẩy sang trái một chút nếu nút nằm ở góc phải
            tabulatorActionMenu.style.left = (rect.right - 200) + 'px';
            // Nếu bị tràn cạnh trái màn hình thì đẩy sát lề trái
            if (parseInt(tabulatorActionMenu.style.left) < 10) {
              tabulatorActionMenu.style.left = '10px';
            }
            tabulatorActionMenu.style.display = 'block';
          } else {
            tabulatorActionMenu.style.display = 'none';
          }
        });

        // Đóng menu khi click bên ngoài
        document.addEventListener('click', function (e) {
          if (!tabulatorActionWrapper.contains(e.target) && !tabulatorActionMenu.contains(e.target)) {
            tabulatorActionMenu.style.display = 'none';
          }
        });


        var formNameLower = (MODULE_CONFIG.FormName || '').toLowerCase();
        var isReport = formNameLower.endsWith('report');
        var isFrm = formNameLower.endsWith('frm') || formNameLower.startsWith('frm');
        var hasWritableAddFields = globalFormSchema.some(function (field) {
          var isVisible = String(field.showInAdd) === '1' || field.showInAdd === true;
          return isVisible && !field.isReadOnlyAdd;
        });
        var canOpenAddForm = hasWritableAddFields || MODULE_CONFIG.AllowAddWithoutWritableFields === true;

        var toolbar = UIActionToolbar.create({
          onAdd: (isFrm && !MODULE_CONFIG.HideAddBtn && canOpenAddForm) ? (_hasPermission('ADD') ? _openAddForm : 'DISABLED') : false,
          onView: (isFrm && !MODULE_CONFIG.HideViewBtn) ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Vui lòng chọn dữ liệu cần xem');
            if (selectedRows.length > 1) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Chỉ có thể xem chi tiết từng dòng một.');
            _openViewForm(selectedRows[0]);
          } : false,
          onEdit: (isFrm && !MODULE_CONFIG.HideEditBtn) ? (_hasPermission('EDIT') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectEdit);

            // CHẶN CHỈNH SỬA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký');
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Không thể sửa hợp đồng/phiếu đã chốt (Đã ký). Vui lòng dùng chức năng Phụ lục nếu muốn thay đổi!');
            }

            if (selectedRows.length > 1) {
              return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Chỉ có thể sửa chi tiết từng dòng một.');
            } else {
              _openEditForm(selectedRows[0]);
            }
          } : 'DISABLED') : false,
          onDelete: (isFrm && !MODULE_CONFIG.HideDeleteBtn) ? (_hasPermission('DELETE') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectDelete);

            // CHẶN XÓA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký') || st.includes('quyết toán') || st === 'signed' || st === 'completed';
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Tuyệt đối không được xóa hợp đồng/phiếu đã chốt (Đã ký / Đã quyết toán). Hệ thống yêu cầu lưu trữ chứng từ pháp lý!');
            }

            // Hàm thực thi xóa gọi API
            var performDelete = function () {
              if (!MODULE_CONFIG.ApiDelete) {
                return Alert.info(MODULE_CONFIG.AlertTitleInfo, MODULE_CONFIG.InfoDeleteDev);
              }

              // Xử lý từng dòng một (Vì API Gateway C# map JSON sang Model, thiếu field sẽ bị NULL update)
              var deletePromises = selectedRows.map(function (row) {
                // Bơm toàn bộ dữ liệu gốc của row vào để C# binding không bị mất các cột Not Null (như Ngaytochuc)
                var rowData = Object.assign({}, row);
                rowData.IsDeleted = 1; // Flag xóa mềm

                return GatewayClient.runModuleOperation(MODULE_CONFIG, 'delete', rowData, {
                  payload: { UserName: _currentUser() }
                });
              });

              Promise.all(deletePromises).then(function (results) {
                var allSuccess = results.every(function (res) { return res && res.code === 0; });
                if (allSuccess) {
                  if (typeof UIToast !== 'undefined') UIToast.show(MODULE_CONFIG.ToastDelete, 'success');
                  selectedRows = [];
                  if (_isFormBuilder()) window._uiConfigCache = {};
                  _updateSelectionCounter();
                  _loadData();
                } else {
                  Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertDeleteFailed);
                }
              }).catch(function (err) {
                Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
              });
            };

            // Xóa hàng loạt
            if (selectedRows.length > 1) {
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: `Bạn có chắc muốn xóa ${selectedRows.length} dòng đã chọn?`,
                  onConfirm: performDelete
                });
              }
            } else {
              var deleteName = selectedRows[0][MODULE_CONFIG.RowNameField] || MODULE_CONFIG.TextDeleteFallback;
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: MODULE_CONFIG.ConfirmDelete.replace('{0}', deleteName),
                  onConfirm: performDelete
                });
              }
            }
          } : false) : false,
          onFilter: MODULE_CONFIG.HideFilterBtn ? false : function () {
            var filterContainer = $container.querySelector('#dynamic-filter-container');
            if (filterContainer) {
              if (filterContainer.style.display === 'none' || filterContainer.style.display === '') {
                filterContainer.style.display = 'flex';
                var inputKeyword = filterContainer.querySelector('#keyword');
                if (inputKeyword) inputKeyword.focus();
              } else {
                filterContainer.style.display = 'none';
              }
            }
          },
          onPrint: false, // Ẩn nút In theo yêu cầu UX
          onClose: false,
          extras: extraBtns
        });
        toolbar.style.display = 'inline-flex';
        toolbar.style.width = 'auto';

        // // Custom Buttons
        // var hasAdd = _hasPermission('ADD');
        // if (isFrm && !MODULE_CONFIG.HideAddBtn) {
        //   var bulkAddConfig = {
        //     text: 'Thêm nhiều',
        //     icon: 'post_add',
        //     type: 'tool',
        //     disabled: !hasAdd,
        //     onClick: function () {
        //       if (!hasAdd) return typeof Alert !== 'undefined' ? Alert.warning('Từ chối', 'Bạn không có quyền thao tác chức năng này!') : null;
        //       var emptyRows = [];
        //       for (var i = 0; i < 3; i++) emptyRows.push({});
        //       _openBulkGridEditForm(emptyRows, true);
        //     }
        //   };
        //   // Dùng API addToMobilePanel để thêm vào cả desktop bar lẫn mobile action sheet
        //   if (typeof toolbar.addToMobilePanel === 'function') {
        //     toolbar.addToMobilePanel(bulkAddConfig, true); // insertFirst = true
        //   } else {
        //     // Fallback: chèn trực tiếp vào bar (trường hợp không dùng mobile wrapper)
        //     var btnBulkAdd = UIButton.create(bulkAddConfig);
        //     toolbar.insertBefore(btnBulkAdd, toolbar.firstChild);
        //   }
        // }

        // Thanh tìm kiếm nhanh (Quick Search) trên Toolbar
        var searchWrapper = document.createElement('div');
        searchWrapper.className = 'quick-search-wrapper';
        searchWrapper.style.cssText = 'flex: 1; display: flex; justify-content: flex-end; margin: 0 16px; min-width: 200px;';

        var quickSearchInput = document.createElement('input');
        quickSearchInput.type = 'text';
        quickSearchInput.className = 'ui-input';
        quickSearchInput.id = 'toolbar-quick-search';
        quickSearchInput.placeholder = MODULE_CONFIG.SearchPlaceholder || 'Tìm kiếm...';
        quickSearchInput.style.cssText = `width: 100%; max-width: 350px; padding: 8px 16px 8px 36px; border-radius: 20px; border: 1px solid var(--color-border, #e2e8f0); outline: none; transition: all 0.2s; font-size: 14px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 12px center var(--color-surface, #fff);`;

        quickSearchInput.addEventListener('focus', function () {
          this.style.borderColor = 'var(--color-primary, #3b82f6)';
          this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });
        quickSearchInput.addEventListener('blur', function () {
          this.style.borderColor = 'var(--color-border, #e2e8f0)';
          this.style.boxShadow = 'none';
        });

        var _searchTimer = null;
        quickSearchInput.addEventListener('input', function () {
          clearTimeout(_searchTimer);
          _searchTimer = setTimeout(function () {
            currentKeyword = quickSearchInput.value;
            window.currentFilters = window.currentFilters || {};
            window.currentFilters.keyword = currentKeyword;
            currentPage = 1;
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          }, 500); // Tự động tìm sau 0.5s
        });

        searchWrapper.appendChild(quickSearchInput);

        // Để 2 nút đối xứng nhau, ta sẽ gom chúng vào chung 1 flex container
        btnContainer.style.display = 'flex';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.alignItems = 'center';

        btnContainer.appendChild(toolbar);
        btnContainer.appendChild(searchWrapper); // Nằm ở giữa, đẩy Tùy chọn bảng sang phải
        btnContainer.appendChild(tabulatorActionWrapper);
      }

      // Search bar (FilterComponent)
      var filterContainer = $container.querySelector('#dynamic-filter-container');
      if (filterContainer && typeof FilterComponent !== 'undefined') {
        filterContainer.innerHTML = ''; // Xóa placeholder nếu có

        // 1. Tự động lấy các trường cấu hình ShowInFilter từ Database
        var dynamicFilters = globalFormSchema
          .filter(function (f) { return f.showInFilter; })
          .map(function (f) {
            // Chuyển đổi định dạng từ FormEngine sang FilterComponent
            var filterType = 'text';
            if (f.renderRule === 'dt' || f.renderRule === 'd') filterType = 'date';
            if (f.renderRule === 'nm' || f.renderRule === 'n') filterType = 'number';

            var filterObj = {
              id: f.name,
              label: f.label,
              type: filterType,
              placeholder: f.label
            };

            // Parse DataSource cho trường Select/Dropdown
            if (f.renderRule === 'sl' || f.renderRule === 'sw') {
              filterObj.type = 'select';
              filterObj.options = [];
              if (f.renderRule === 'sw') {
                filterObj.options = [{ value: 1, label: 'Có' }, { value: 0, label: 'Không' }];
              } else if (f.dataSource && f.dataSource.indexOf('STATIC:') === 0) {
                var parts = f.dataSource.replace('STATIC:', '').split(',');
                parts.forEach(function (p) {
                  var kv = p.split('|');
                  filterObj.options.push({ value: kv[0], label: kv[1] || kv[0] });
                });
              } else if (f.dataSource) {
                filterObj.dataSource = f.dataSource;
                // Tải dữ liệu động từ API (ví dụ: 'CF_BranchListFrm' hoặc 'SY_Period')
                GatewayClient.run({ sp: f.dataSource, func: 'View' }, undefined, {
                  endpoint: MODULE_CONFIG.ApiSearch,
                  limit: 1000,
                  payload: { UserName: _currentUser() }
                }).then(function (res) {
                  var dataList = res.list || res.records || [];
                  var options = [];
                  if (dataList && dataList.length > 0) {
                    var keys = Object.keys(dataList[0]);
                    var valKey = keys[0];
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = keys.find(function (k) { return labelRegex.test(k); }) || keys[1] || keys[0];
                    dataList.forEach(function (row) {
                      options.push({ value: row[valKey], label: row[displayKey] });
                    });
                  }

                  // Tìm phần tử select tương ứng để cập nhật các option mới tải về
                  var selectEl = document.getElementById(f.name);
                  if (selectEl) {
                    var hasSavedValue = window.currentFilters && window.currentFilters[f.name] !== undefined;
                    var currentValue = hasSavedValue ? window.currentFilters[f.name] : '';

                    selectEl.innerHTML = '<option value="">-- Tất cả --</option>';
                    options.forEach(function (opt) {
                      var optionNode = document.createElement('option');
                      optionNode.value = opt.value;
                      optionNode.innerText = opt.label;
                      if (opt.value == currentValue) optionNode.selected = true;
                      selectEl.appendChild(optionNode);
                    });

                    // Tự động chọn kỳ gần nhất nếu chưa có filter được thiết lập
                    if (!hasSavedValue && options.length > 0 && (f.name.toLowerCase().indexOf('period') >= 0 || f.name.toLowerCase().indexOf('ky') >= 0)) {
                      var now = new Date();
                      var cy = now.getFullYear();
                      var cm = now.getMonth() + 1;
                      var bestOpt = null;
                      var minDiff = Infinity;

                      function parseYearMonth(str) {
                        var clean = String(str);
                        var m1 = clean.match(/(\d{4})[-_\/\s]?(\d{1,2})/);
                        if (m1) {
                          var y = parseInt(m1[1], 10);
                          var m = parseInt(m1[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        var m2 = clean.match(/(\d{1,2})[-_\/\s]?(\d{4})/);
                        if (m2) {
                          var m = parseInt(m2[1], 10);
                          var y = parseInt(m2[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        return null;
                      }

                      options.forEach(function (opt) {
                        var parsed = parseYearMonth(opt.value) || parseYearMonth(opt.label);
                        if (parsed) {
                          var diff = Math.abs((parsed.year - cy) * 12 + (parsed.month - cm));
                          if (diff < minDiff) {
                            minDiff = diff;
                            bestOpt = opt;
                          }
                        }
                      });

                      if (!bestOpt) {
                        bestOpt = options[0];
                      }

                      if (bestOpt) {
                        currentValue = bestOpt.value;
                        selectEl.value = currentValue;
                        if (!window.currentFilters) window.currentFilters = {};
                        window.currentFilters[f.name] = currentValue;
                        // Reload data với kỳ mặc định mới chọn
                        setTimeout(function () {
                          _loadData();
                        }, 50);
                      }
                    }
                  }
                  filterObj.options = options;
                }).catch(function (err) {
                  console.error('Lỗi tải dữ liệu lọc cho ' + f.name, err);
                });
              }
            }
            return filterObj;
          });

        // 2. Gom với cấu hình cứng trong AppModules.js (nếu có)
        // Lưu ý: Đã đưa 'Từ khóa' ra ngoài thanh công cụ dưới dạng Quick Search Bar
        var filters = [];

        if (dynamicFilters.length > 0) {
          filters = filters.concat(dynamicFilters);
        } else if (MODULE_CONFIG.Filters && MODULE_CONFIG.Filters.length > 0) {
          filters = filters.concat(MODULE_CONFIG.Filters);
        }

        var filterNode = FilterComponent.create(filters, function (values) {
          console.log('[DynamicFormEngine] Filter values callback received:', values);

          // Lấy giá trị keyword từ ô Quick Search Bar để tránh bị đè mất
          var quickSearch = document.getElementById('toolbar-quick-search');
          if (quickSearch) {
            values.keyword = quickSearch.value;
          }

          // Lưu lại toàn bộ các giá trị filter
          window.currentFilters = values;
          currentKeyword = values.keyword || '';
          currentPage = 1; // Reset về trang 1 khi lọc mới
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        });
        filterContainer.appendChild(filterNode);
        filterContainer.style.display = 'none'; // Ẩn mặc định, ấn Lọc mới hiện
      }

      if (!MODULE_CONFIG.NoAutoLoad) {
        if (MODULE_CONFIG.IsDetailAdd) {
          if (MODULE_CONFIG.CanAddOperation === false) {
            $container.innerHTML = '<div class="alert alert-warning m-4">Form này không được đăng ký thao tác Thêm mới.</div>';
            return;
          }
          _openModal(false, null);
        } else if (MODULE_CONFIG.action === 'detail' || MODULE_CONFIG.Action === 'detail') {
          _openModal(true, MODULE_CONFIG.DetailRowData, true);
        } else {
          _loadData();
        }
      }
    })
      .catch(function (err) {
        var prefix = MODULE_CONFIG.TextLoadingError || 'Lỗi tải dữ liệu: ';
        $container.innerHTML = '<div class="p-4 text-danger">' + prefix + err.message + '</div>';
      });
  }

  // ── Load Data ─────────────────────────────────────────────
  var savedScrollY = 0; // Lưu vị trí scroll

  function _loadData() {
    // Đồng bộ state hiện tại vào cache để tránh mất filter khi F5
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
      _saveModuleStates();
    }

    if (MODULE_CONFIG.IsFullPageDetail && MODULE_CONFIG.DetailRowData) {
      _openModal(true, MODULE_CONFIG.DetailRowData, !MODULE_CONFIG.IsDetailForceEdit);
      return;
    }

    var gridContainer = $container ? $container.querySelector('#dynamic-grid-container') : null;
    var existingTable = gridContainer ? gridContainer.querySelector('.table-wrapper') : null;

    if (existingTable && typeof existingTable.showLoading === 'function') {
      savedScrollY = window.scrollY;
      existingTable.showLoading(MODULE_CONFIG.TextLoading);
    } else if (gridContainer) {
      gridContainer.innerHTML = '<div class="p-4 text-center" style="color:var(--color-text-secondary);">' + MODULE_CONFIG.TextLoading + '</div>';
    }

    if (MODULE_CONFIG.ApiSearch) {
      // Gom các bộ lọc đang active (bỏ các trường rỗng)
      var activeFilters = {};
      if (window.currentFilters) {
        for (var k in window.currentFilters) {
          if (window.currentFilters[k] !== '' && window.currentFilters[k] !== null) {
            activeFilters[k] = window.currentFilters[k];
          }
        }
      }
      // Thêm Keyword vào filter JSON
      if (currentKeyword) activeFilters['Keyword'] = currentKeyword;

      // Đổi màu nút Lọc nếu có dữ liệu lọc
      var actionsContainer = document.getElementById('global-page-actions') || $container;
      if (actionsContainer) {
        var btns = actionsContainer.querySelectorAll('button');
        var filterBtn = null;
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
            filterBtn = btns[i];
            break;
          }
        }
        if (filterBtn) {
          var hasFilter = Object.keys(activeFilters).length > 0;
          if (hasFilter) {
            filterBtn.classList.remove('btn-outline-secondary');
            filterBtn.classList.remove('text-dark');
            filterBtn.classList.add('btn-primary');
            filterBtn.classList.add('text-white');

            filterBtn.style.setProperty('color', '#fff', 'important');
            filterBtn.style.setProperty('background-color', 'var(--color-primary, #3b82f6)', 'important');
            filterBtn.style.setProperty('border-color', 'var(--color-primary, #3b82f6)', 'important');
          } else {
            filterBtn.classList.remove('btn-primary');
            filterBtn.classList.remove('text-white');
            if (filterBtn.className.indexOf('btn-') === -1) {
              filterBtn.classList.add('btn-outline-secondary');
            }
            filterBtn.style.color = '';
            filterBtn.style.backgroundColor = '';
            filterBtn.style.borderColor = '';
            // Xóa dấu chấm đỏ nếu có
            var badge = filterBtn.querySelector('.filter-badge');
            if (badge) badge.remove();
          }
        }
      }

      // Đọc BranchID từ session user (backend dùng để lọc theo chi nhánh)
      var _sessionUser = {};
      try { _sessionUser = AppContext.getCurrentUser(); } catch (e) { }
      var _branchID = (_sessionUser.BranchID || '').toString().trim();

      var queryOptions = {
        UserName: _currentUser(),
        User: _currentUser(),
        SortColumn: currentSortCol || '',
        SortDir: currentSortDir || ''
      };

      // Gửi BranchID vào JsonData để backend API Gateway mapping thành tham số SP
      if (_branchID) {
        // Chỉ thêm nếu user chưa chủ động filter chi nhánh
        if (!activeFilters.BranchID && !activeFilters.ChiNhanhID) {
          activeFilters.BranchID = _branchID;
        }
      }

      if (MODULE_CONFIG.IsFullPageDetail) {
        currentLimit = 1;
        currentPage = 1;
        // Ghi đè bộ lọc để chỉ lấy 1 bản ghi
        var detailFilter = {};
        detailFilter[MODULE_CONFIG.PrimaryKey] = MODULE_CONFIG.DetailRowId;
        activeFilters = detailFilter;
      }

      GatewayClient.runModuleOperation(MODULE_CONFIG, 'list', activeFilters, {
        page: currentPage,
        limit: currentLimit,
        keyword: currentKeyword || '',
        payload: queryOptions
      }).then(function (result) {
        // Trả lại quyền sinh sát (tính phân trang) cho C# Backend
        totalRecords = result._recordtotal || 0;
        totalPagesFromApi = result._pagetotal || 0;

        lastTimestamp = result._timestamp || '';
        var dataList = result.list || result.records || [];
        gridData = dataList.map(function (item) {
          // Lấy khóa chính từ cấu hình, nếu không có thì tự động lấy cột đầu tiên của dữ liệu
          var firstKey = Object.keys(item).length > 0 ? Object.keys(item)[0] : null;
          item.id = item[MODULE_CONFIG.PrimaryKey] || (firstKey ? item[firstKey] : null) || Math.random();
          return item;
        });

        // Bỏ đồng bộ Kỳ (PeriodID) tự động để tránh tự động lọc ngoài ý muốn khi lưu/cập nhật dữ liệu

        if (MODULE_CONFIG.IsFullPageDetail) {
          var row = gridData.length > 0 ? gridData[0] : {};
          _openModal(true, row, true);
        } else {
          _renderTable();
        }
      }).catch(function (err) {
        console.error('Lỗi tải danh sách:', err);
        if (typeof Alert !== 'undefined') Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        gridData = [];
        totalRecords = 0;
        totalPagesFromApi = 0;
        lastTimestamp = '';
        selectedRows = [];
        _updateSelectionCounter();
        _renderTable();
      });
    }
  }

  // ── Render Table ──────────────────────────────────────────
  function _renderTable() {
    var gridContainer = $container.querySelector('#dynamic-grid-container');
    if (!gridContainer) return;

    // Tạo wrapper cho tabulator nếu chưa có
    var tableWrapper = gridContainer.querySelector('.tabulator-wrapper');
    if (!tableWrapper) {
      gridContainer.innerHTML = '';
      gridContainer.style.display = 'flex';
      gridContainer.style.flexDirection = 'column';

      tableWrapper = document.createElement('div');
      tableWrapper.className = 'tabulator-wrapper';
      tableWrapper.style.flex = '1';
      tableWrapper.style.minHeight = '0';
      gridContainer.appendChild(tableWrapper);
    }

    lastSelectedIdx = -1;

    if (typeof Tabulator !== 'undefined') {
      var dictionary = {};
      if (globalFormSchema && globalFormSchema.length > 0) {
        globalFormSchema.forEach(function (schema) {
          var pos = (schema.position || 'grid').toLowerCase();
          if (pos.indexOf('grid') > -1) {
            dictionary[schema.name] = schema.label;
          }
        });
      } else {
        dictionary = globalDictionary; // Fallback
      }

      var customRenderers = globalRenderers;
      globalFormSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });
      var renderers = Object.assign({}, customRenderers);




      var tabulatorColumns = [];
      var isMobile = window.innerWidth <= 768;

      // Đọc cấu hình cột đã lưu từ LocalStorage
      var userName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
      var formName = MODULE_CONFIG.FormName || 'default_form';
      var savedVisibility = null;
      var savedOrder = null;
      try {
        var storedStr = localStorage.getItem('tabulator_cols_' + userName + '_' + formName);
        if (storedStr) savedVisibility = JSON.parse(storedStr);

        var storedOrderStr = localStorage.getItem('tabulator_col_order_' + userName + '_' + formName);
        if (storedOrderStr) savedOrder = JSON.parse(storedOrderStr);
      } catch (e) { }

      // Cột Checkbox của Tabulator
      tabulatorColumns.push({
        formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 50, resizable: false, frozen: !isMobile
      });

      var sampleRow = gridData && gridData.length > 0 ? gridData[0] : {};
      var rowKeys = Object.keys(sampleRow);

      globalFormSchema.forEach(function (f) {
        var pos = (f.position || 'grid').toLowerCase();
        if (pos.indexOf('grid') > -1) {
          var fieldName = f.name;
          // Tìm key trong data có chữ hoa/thường khớp với fieldName (case-insensitive search)
          var actualField = rowKeys.find(function (k) { return k.toLowerCase() === fieldName.toLowerCase(); }) || fieldName;

          var isDateField = actualField.toLowerCase().indexOf('ngay') >= 0 || actualField.toLowerCase().indexOf('date') >= 0 || f.renderRule === 'dt' || f.renderRule === 'date' || f.renderRule === 'd';

          var customDateEditor = function (cell, onRendered, success, cancel) {
            var cellValue = cell.getValue();
            var input = document.createElement("input");
            input.type = "text";
            input.style.padding = "4px";
            input.style.width = "100%";
            input.style.boxSizing = "border-box";
            input.style.border = "none";
            input.style.outline = "none";
            input.style.background = "transparent";

            var parsedDate = null;
            if (cellValue) {
              if (typeof cellValue === 'string' && cellValue.indexOf('/') === 2) {
                var parts = cellValue.split(/[\s/]/);
                if (parts.length >= 3) {
                  parsedDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                }
              } else if (typeof cellValue === 'string' && cellValue.length >= 10 && cellValue.indexOf('-') === 4) {
                var parts = cellValue.substring(0, 10).split('-');
                parsedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
              } else {
                var d = new Date(cellValue);
                if (!isNaN(d.getTime())) parsedDate = d;
              }
            }

            onRendered(function () {
              if (typeof window.flatpickr !== 'undefined') {
                var fp = window.flatpickr(input, {
                  defaultDate: parsedDate,
                  dateFormat: "d/m/Y",
                  allowInput: true,
                  onClose: function (selectedDates, dateStr, instance) {
                    if (dateStr !== cellValue) {
                      success(dateStr);
                    } else {
                      cancel();
                    }
                  }
                });
                setTimeout(function () { fp.open(); }, 10);
              } else {
                // Fallback
                input.type = "date";
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                  var y = parsedDate.getFullYear();
                  var m = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
                  var d = parsedDate.getDate().toString().padStart(2, '0');
                  input.value = y + '-' + m + '-' + d;
                }
                input.focus();
                input.addEventListener("blur", function () {
                  var v = input.value;
                  if (v) {
                    var p = v.split('-');
                    if (p.length === 3) v = p[2] + '/' + p[1] + '/' + p[0];
                    if (v !== cellValue) success(v); else cancel();
                  } else {
                    if (cellValue !== "") success(""); else cancel();
                  }
                });
              }
            });

            return input;
          };

          var hasCombo = f.dataSource || f.api || f.listName || f.queryName || (f.renderRule && f.renderRule.toLowerCase() === 'combo');

          var customComboEditor = function (cell, onRendered, success, cancel) {
            var cellValue = cell.getValue();
            var rowData = cell.getRow().getData();

            var endpointRaw = f.dataSource || f.api || f.listName || f.queryName || '';
            var maxCols = 4;
            if (endpointRaw.indexOf('|') > -1) {
              var dsParts = endpointRaw.split('|');
              endpointRaw = dsParts[0];
              var parsedCols = parseInt(dsParts[1], 10);
              if (!isNaN(parsedCols) && parsedCols > 0) maxCols = parsedCols;
            }
            var finalUrl = '';
            var isGatewaySource = endpointRaw.indexOf('/') === -1 && !endpointRaw.startsWith('http');
            var fetchPayload = {};
            if (!isGatewaySource) {
              var endpoint = endpointRaw.startsWith('http') ? endpointRaw : ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + endpointRaw);
              finalUrl = endpoint;
              if (endpoint.indexOf('?') > -1) {
                var parts = endpoint.split('?');
                finalUrl = parts[0];
                var searchParams = new URLSearchParams(parts[1]);
                searchParams.forEach(function (value, key) { fetchPayload[key] = value; });
              }
            }
            if (!fetchPayload.UserName) fetchPayload.UserName = (typeof _currentUser === 'function' ? _currentUser() : 'default');

            var searchApiCall = function (q, page) {
              var payload = Object.assign({}, fetchPayload);
              var dynamicFilters = {};
              if (f.dependsOn) {
                var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
                parents.forEach(function (p) {
                  if (rowData[p] !== undefined && rowData[p] !== null) {
                    dynamicFilters[p] = rowData[p];
                  }
                });
              }
              if (!isGatewaySource) payload = Object.assign(payload, dynamicFilters);

              var request = isGatewaySource
                ? GatewayClient.run({ sp: endpointRaw, func: 'View' }, dynamicFilters, {
                  keyword: q || '', page: page, payload: { UserName: fetchPayload.UserName }
                })
                : GatewayClient.run({ endpoint: finalUrl, transport: 'direct' }, payload, {
                  keyword: q || '', page: page
                });

              return request.then(function (res) {
                var comboData = [];
                var dataList = res.list || res.records;
                var headers = ['Mã', 'Tên'];
                var colFilterIndex = 1;
                if (dataList && dataList.length > 0) {
                  var keys = Object.keys(dataList[0]);
                  if (keys.length > 0) {
                    var displayKeysFull = keys;
                    if (f.hiddenColumns && Array.isArray(f.hiddenColumns)) {
                      var hcols = f.hiddenColumns.map(function (c) { return c.toUpperCase(); });
                      displayKeysFull = keys.filter(function (k) { return hcols.indexOf(k.toUpperCase()) === -1; });
                    }
                    var displayKeys = displayKeysFull.slice(0, maxCols);
                    headers = displayKeys.map(function (k) {
                      if (typeof globalDictionary !== 'undefined') {
                        var kLower = k.toLowerCase();
                        var matchKey = Object.keys(globalDictionary).find(function (dk) { return dk.toLowerCase() === kLower; });
                        if (matchKey) return globalDictionary[matchKey].CaptionVN;
                      }
                      return k;
                    });
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = displayKeys.find(function (k) { return labelRegex.test(k); });
                    if (displayKey) {
                      colFilterIndex = displayKeys.indexOf(displayKey);
                    } else {
                      var hideRegex = /^(ghichu|mota|description|mô tả|ngaytao|nguoitao)$/i;
                      var validIdx = -1;
                      for (var i = 1; i < displayKeys.length; i++) {
                        if (!hideRegex.test(displayKeys[i])) { validIdx = i; break; }
                      }
                      colFilterIndex = validIdx !== -1 ? validIdx : 0;
                    }
                    if (f.name === MODULE_CONFIG.PrimaryKey) colFilterIndex = 0;
                    if (f.name === 'PeriodKeyID') {
                      var keyIdx = displayKeys.findIndex(function (k) { return k.toLowerCase() === 'keyid'; });
                      if (keyIdx > -1) colFilterIndex = keyIdx;
                    }
                    dataList.forEach(function (d) {
                      var rData = [];
                      displayKeysFull.forEach(function (k) { rData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
                      comboData.push(rData);
                    });
                  } else {
                    dataList.forEach(function (d) { comboData.push(['', '']); });
                  }
                }
                return { headers: headers, data: comboData, colFilterIndex: colFilterIndex };
              });
            };

            var lazyCombo = UIControls.createDataComboBox({
              placeholder: '-- Chọn --',
              headers: ['Mã', 'Tên'],
              showAddNew: false,
              onSearch: searchApiCall,
              onChange: function (val) { },
              onSelect: function (row) {
                success(lazyCombo.querySelector('.ui-input').value);
              }
            });

            lazyCombo.style.margin = "0";
            lazyCombo.style.width = "100%";
            var inputEl = lazyCombo.querySelector('.ui-input');
            inputEl.style.border = "none";
            inputEl.style.background = "transparent";
            inputEl.style.padding = "4px";
            inputEl.value = cellValue || '';

            onRendered(function () {
              inputEl.focus();
              inputEl.click();
            });

            return lazyCombo;
          };

          var isEditable = true;
          if (typeof MODULE_CONFIG !== 'undefined') {
            if ((MODULE_CONFIG.FormType || '').toUpperCase() === 'REPORT') isEditable = false;
            if ((MODULE_CONFIG.FormName || '').toUpperCase().indexOf('REPORT') > -1) isEditable = false;
          }
          if (f.ShowInEdit == 0 || f.IsReadOnlyEdit == 1) isEditable = false;

          var isNumeric = (f.formatId || f.FormatID || '').toLowerCase() === 'n';

          var colDef = {
            title: dictionary[fieldName] || fieldName,
            field: actualField,
            editor: isEditable ? (isDateField ? customDateEditor : (hasCombo ? customComboEditor : "input")) : false,
            maxWidth: 400, // UX: Giới hạn độ rộng tối đa để text dài (như Mô tả) không đẩy vỡ khung Grid
            tooltip: true  // UX: Cho phép xem đầy đủ text khi hover chuột vào ô bị cắt chữ (...)
            // Đã loại bỏ headerFilter: "input" để header gọn gàng, người dùng sẽ xài Popup lọc dữ liệu thay thế
          };

          if (isNumeric) {
            colDef.bottomCalc = "sum";
            colDef.bottomCalcFormatter = function (cell) {
              var val = cell.getValue();
              var n = parseFloat(val);
              return isNaN(n) ? (val || '') : n.toLocaleString('vi-VN');
            };
            colDef.hozAlign = "right"; // Canh lề phải cho cột số
          }

          // Apply trạng thái ẩn/hiện cột nếu đã được lưu
          if (savedVisibility && savedVisibility[actualField] !== undefined) {
            colDef.visible = savedVisibility[actualField];
          }



          // Fix: Cột PersonStatus ưu tiên hiển thị chữ (PersonStatusName) thay vì số
          if (actualField.toLowerCase() === 'personstatus') {
            colDef.formatter = function (cell) {
              var data = cell.getData();
              var val = cell.getValue();
              var text = data.PersonStatusName || data.personstatusname || val;
              if (!text && !val) return '';

              var badgeClass = 'badge-info';
              var textLower = String(text).toLowerCase();
              if (String(val) === '1' || textLower.includes('chính thức') || textLower.includes('hoạt động') || textLower.includes('thành công')) badgeClass = 'badge-active';
              else if (String(val) === '4' || String(val) === '8' || String(val) === '9' || textLower.includes('nghỉ') || textLower.includes('thôi việc') || textLower.includes('hủy') || textLower.includes('xóa')) badgeClass = 'badge-danger';
              else if (String(val) === '2' || textLower.includes('thử việc') || textLower.includes('tạm hoãn') || textLower.includes('chờ')) badgeClass = 'badge-warning';
              else if (String(val) === '3' || textLower.includes('thực tập') || textLower.includes('mới')) badgeClass = 'badge-info';

              return '<span class="badge-status ' + badgeClass + '">' + (text || '') + '</span>';
            };
          }

          // Smart UI/UX Defaults (Kế thừa cho toàn bộ lưới nếu không bị ghi đè)
          if (!colDef.formatter) {
            var fName = actualField.toLowerCase();
            var title = (colDef.title || '').toLowerCase();

            if (fName.includes('manhanvien') || fName === 'macode' || fName === 'employeeid' || fName === 'personid' || title.includes('mã nhân viên')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
            } else if (fName.includes('dienthoai') || fName.includes('phone') || fName.includes('sdt') || title.includes('điện thoại')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
            } else if (fName.includes('email') || title.includes('email')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-primary';
              colDef.formatter = function (cell) {
                var v = cell.getValue();
                if (!v) return '';
                return '<a href="mailto:' + v + '">' + v + '</a>';
              };
            } else if (fName.includes('cmnd') || fName.includes('cccd') || fName.includes('idcard') || title.includes('cmnd') || title.includes('cccd')) {
              colDef.cssClass = (colDef.cssClass ? colDef.cssClass + ' ' : '') + 'col-highlight-danger';
            } else if (fName.includes('trangthai') || fName.includes('status') || title.includes('trạng thái')) {
              colDef.formatter = function (cell) {
                var v = cell.getValue();
                if (!v && v !== 0) return '';
                var textLower = String(v).toLowerCase();
                var badgeClass = 'badge-info';

                if (textLower.includes('chính thức') || textLower.includes('đã ký') || textLower.includes('hoàn thành') || textLower.includes('success') || textLower.includes('active') || textLower.includes('đạt') || textLower.includes('duyệt') || textLower.includes('đồng ý')) {
                  badgeClass = 'badge-active';
                } else if (textLower.includes('nghỉ') || textLower.includes('hủy') || textLower.includes('từ chối') || textLower.includes('khóa') || textLower.includes('fail') || textLower.includes('lỗi') || textLower.includes('không đạt')) {
                  badgeClass = 'badge-danger';
                } else if (textLower.includes('thử việc') || textLower.includes('chờ') || textLower.includes('pending') || textLower.includes('tạm') || textLower.includes('đang')) {
                  badgeClass = 'badge-warning';
                }

                return '<span class="badge-status ' + badgeClass + '">' + v + '</span>';
              };
            }
          }

          if (renderers[fieldName]) {
            colDef.formatter = function (cell) {
              return renderers[fieldName](cell.getValue(), cell.getData());
            };
          }
          tabulatorColumns.push(colDef);
        }
      });

      // Khôi phục vị trí cột nếu đã có dữ liệu lưu
      if (savedOrder && savedOrder.length > 0) {
        // tabulatorColumns[0] là checkbox, tách riêng ra
        var checkboxCol = tabulatorColumns.shift();
        tabulatorColumns.sort(function (a, b) {
          var idxA = savedOrder.indexOf(a.field);
          var idxB = savedOrder.indexOf(b.field);
          // Nếu cột mới không có trong danh sách lưu, đưa xuống cuối
          if (idxA === -1) idxA = 9999;
          if (idxB === -1) idxB = 9999;
          return idxA - idxB;
        });
        tabulatorColumns.unshift(checkboxCol);
      }

      // Tạo thanh Pagination trước
      var paginationEl = null;
      if (typeof Pagination !== 'undefined') {
        paginationEl = Pagination.create({
          totalItems: totalRecords,
          totalPages: totalPagesFromApi,
          timestamp: lastTimestamp,
          itemsPerPage: currentLimit,
          currentPage: currentPage,
          onPageChange: function (page) {
            currentPage = page;
            _loadData();
          },
          onLimitChange: function (newLimit) {
            currentLimit = newLimit;
            currentPage = 1;
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          },
          onRefresh: function () {
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          }
        });
      }

      if (window.tabulatorInstance) {
        window.tabulatorInstance.destroy();
      }

      var tabulatorConfig = {
        data: gridData,
        columns: tabulatorColumns,
        layout: "fitDataFill",
        selectableRows: true, // bật chọn dòng
        selectableRowsRangeMode: "click", // Shift + click range
        height: "100%", // Chiếm 100% chiều cao của flex container
        movableColumns: true, // Cho phép kéo thả cột
        editTriggerEvent: "dblclick", // Nhấp đúp để chỉnh sửa ô
        // rowHeight: 45, // Đã xóa bỏ để Tabulator tự tính lại chiều cao theo text nhỏ
      };

      // Đẩy pagination vào footer cố định của Tabulator
      if (paginationEl) {
        tabulatorConfig.footerElement = paginationEl;
      }

      window.tabulatorInstance = new Tabulator(tableWrapper, tabulatorConfig);

      // Bắt sự kiện chọn dòng để update biến selectedRows
      window.tabulatorInstance.on("rowSelectionChanged", function (data, rows) {
        selectedRows = data;
        _updateSelectionCounter();
      });

      // Bắt sự kiện kéo thả cột để lưu vị trí mới vào LocalStorage
      window.tabulatorInstance.on("columnMoved", function (column) {
        var currentCols = window.tabulatorInstance.getColumns();
        var colOrder = [];
        currentCols.forEach(function (c) {
          var field = c.getField();
          if (field) colOrder.push(field);
        });
        localStorage.setItem('tabulator_col_order_' + userName + '_' + formName, JSON.stringify(colOrder));
      });

      // Hack cho Mobile/Touch: Cho phép click vào bất kỳ đâu trên dòng để CHỌN NHIỀU (Toggle) mà không cần giữ Ctrl
      tableWrapper.addEventListener('click', function (e) {
        if (e.target.closest('.tabulator-header')) return;
        // Bỏ qua nếu click vào nút, link, hoặc input (như checkbox của Tabulator)
        if (e.target.closest('button, a, input, select, textarea')) return;

        var rowEl = e.target.closest('.tabulator-row');
        if (rowEl) {
          var row = window.tabulatorInstance.getRow(rowEl);
          if (row && typeof row.toggleSelect === 'function') {
            e.stopPropagation(); // Ngăn Tabulator clear các dòng khác
            row.toggleSelect();
          }
        }
      }, true);

      // Bắt sự kiện chỉnh sửa ô để lưu tự động vào DB
      window.tabulatorInstance.on("cellEdited", function (cell) {
        var rowData = cell.getRow().getData();
        var field = cell.getField();
        var newVal = cell.getValue();

        var endpoint = MODULE_CONFIG.ApiSave;
        if (!endpoint) return;

        var schema = null;
        if (globalFormSchema) {
          schema = globalFormSchema.find(function (s) { return s.name.toLowerCase() === field.toLowerCase(); });
        }

        var isReport = false;
        if (typeof MODULE_CONFIG !== 'undefined') {
          if ((MODULE_CONFIG.FormType || '').toUpperCase() === 'REPORT') isReport = true;
          if ((MODULE_CONFIG.FormName || '').toUpperCase().indexOf('REPORT') > -1) isReport = true;
        }

        // Chặn chỉnh sửa và thông báo thân thiện đối với Form dạng REPORT
        if (isReport) {
          if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Dữ liệu trên báo cáo (REPORT) chỉ hỗ trợ xem, không được phép chỉnh sửa trực tiếp!');
          cell.restoreOldValue();
          return;
        }

        // Chặn chỉnh sửa đối với các cột được cấu hình khóa (Read-Only) hoặc cột động không có cấu hình
        if (!schema || schema.ShowInEdit == 0 || schema.IsReadOnlyEdit == 1) {
          if (typeof Alert !== 'undefined') Alert.warning('Cảnh báo', 'Trường dữ liệu này đã được cấu hình khóa hoặc chỉ đọc, không được phép chỉnh sửa!');
          cell.restoreOldValue();
          return;
        }

        // Validate riêng cho các cột kiểu Date để chống lỗi SQL khi nhập thiếu năm (VD: "20/10")
        var isDateCol = field.toLowerCase().indexOf('ngay') >= 0;
        if (!isDateCol && globalFormSchema) {
          var schema = globalFormSchema.find(function (s) { return s.name.toLowerCase() === field.toLowerCase(); });
          if (schema && (schema.renderRule === 'dt' || schema.formatId === 'd' || schema.FormatID === 'd')) {
            isDateCol = true;
          }
        }

        if (isDateCol) {
          if (newVal && String(newVal).trim() !== '') {
            // Chỉ chấp nhận DD/MM/YYYY (đủ 4 số năm) hoặc YYYY-MM-DD
            var isValidDate = String(newVal).match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/) || String(newVal).match(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}/);
            if (!isValidDate) {
              if (typeof Alert !== 'undefined') {
                Alert.error('Lỗi nhập liệu', 'Vui lòng nhập đầy đủ ngày/tháng/năm cho cột "' + (dictionary[field] || field) + '"');
              }
              cell.restoreOldValue();
              return; // Chặn không cho gọi API
            }
          }
        }

        // Xây dựng payload để lưu
        var payloadObj = Object.assign({}, rowData);
        payloadObj.UserName = (typeof _currentUser === 'function' ? _currentUser() : 'default');
        payloadObj.IsEdit = 1;

        // Chuẩn hóa định dạng ngày tháng từ DD/MM/YYYY sang YYYY-MM-DD để SQL Server hiểu được
        Object.keys(payloadObj).forEach(function (k) {
          var val = payloadObj[k];
          if (typeof val === 'string' && val.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/)) {
            var parts = val.substring(0, 10).replace(/-/g, '/').split('/');
            var newDateStr = parts[2] + '-' + parts[1] + '-' + parts[0];
            if (val.length > 10) newDateStr += val.substring(10);
            payloadObj[k] = newDateStr;
          }
        });

        GatewayClient.runModuleOperation(MODULE_CONFIG, 'save', payloadObj, {
          payload: { UserName: _currentUser() }
        })
          .then(function (res) {
            if (res && res.code === 0) {
              if (typeof Alert !== 'undefined') Alert.success('Thành công', 'Đã lưu giá trị mới cho cột "' + (dictionary[field] || field) + '"');
            } else {
              if (typeof Alert !== 'undefined') Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
              cell.restoreOldValue();
            }
          })
          .catch(function () {
            if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Lỗi kết nối khi lưu dữ liệu');
            cell.restoreOldValue();
          });
      });

      // Bắt sự kiện click header để sort
      window.tabulatorInstance.on("headerClick", function (e, column) {
        var field = column.getField();
        if (field !== "__action__" && field) {
          var currentDir = column.getDir() === "asc" ? "desc" : "asc";
          currentSortCol = field;
          currentSortDir = currentDir;
          currentPage = 1;
          selectedRows = [];
          _updateSelectionCounter();
          _loadData(); // Load lại data từ server
        }
      });

      // Xóa container cũ ở ngoài vì đã dùng footer của Tabulator
      var oldPaginationContainer = gridContainer.querySelector('.pagination-wrapper');
      if (oldPaginationContainer) {
        oldPaginationContainer.remove();
      }

      // Phục hồi vị trí cuộn trang
      if (savedScrollY > 0) {
        setTimeout(function () { window.scrollTo(0, savedScrollY); }, 10);
      }

      _updateSelectionCounter();
    }
  }

  function _clearSelection() {
    selectedRows = [];
    _updateSelectionCounter();

    if (window.tabulatorInstance) {
      window.tabulatorInstance.deselectRow();
    } else {
      var checkboxes = $container.querySelectorAll('tbody .form-check-input');
      if (checkboxes) checkboxes.forEach(function (cb) { cb.checked = false; });
      var checkAll = $container.querySelector('thead .form-check-input');
      if (checkAll) checkAll.checked = false;
      var allTrs = $container.querySelectorAll('tbody tr');
      if (allTrs) allTrs.forEach(function (tr) { tr.classList.remove('active', 'selected', 'table-active', 'table-primary'); });
    }

    var splitContainer = $container.querySelector('.split-master-detail-container');
    if (splitContainer) {
      splitContainer.classList.remove('show-detail');
    }
  }

  function _updateSelectionCounter() {
    _saveSelectedRows();

    if (!window.tabulatorInstance) {
      // Đồng bộ trạng thái checkbox
      var allTrs = $container.querySelectorAll('#dynamic-grid-container tbody tr');
      if (allTrs) {
        allTrs.forEach(function (tr) {
          var checkbox = tr.querySelector('.df-row-checkbox');
          if (checkbox) checkbox.checked = tr.classList.contains('active');
        });
      }
    }

    var globalActions = document.getElementById('global-page-actions');
    var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');
    if (!btnContainer) return;

    var actualToolbar = btnContainer.firstElementChild; // .button-bar
    if (!actualToolbar) return;

    var counter = actualToolbar.querySelector('#selection-counter');
    if (!counter) {
      // Bọc các nút bấm hiện tại vào một vùng cuộn riêng để bảo toàn background trắng của toolbar gốc
      if (!actualToolbar.querySelector('.btn-scroll-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'btn-scroll-wrapper';
        while (actualToolbar.firstChild) {
          wrapper.appendChild(actualToolbar.firstChild);
        }
        actualToolbar.appendChild(wrapper);
      }

      if (!document.getElementById('selection-counter-style')) {
        var style = document.createElement('style');
        style.id = 'selection-counter-style';
        style.innerHTML = `
          /* Toolbar gốc: Cho phép rớt dòng để chứa counter ở dưới trên mobile */
          #dynamic-btn-container .button-bar,
          .page-title-actions .button-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
          }
          /* Wrapper chứa nút bấm: Cuộn ngang, không rớt dòng */
          .btn-scroll-wrapper {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            flex: 1 1 auto;
            min-width: 0;
            gap: 8px;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding-bottom: 2px;
          }
          .btn-scroll-wrapper::-webkit-scrollbar {
            display: none;
          }
          /* Badge Đã chọn */
          #selection-counter {
            margin-left: auto;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-primary);
            background: var(--color-primary-light);
            padding: 4px 8px 4px 12px;
            border-radius: 20px;
            white-space: nowrap;
            flex-shrink: 0;
            display: none;
            align-items: center;
            gap: 4px;
          }
          @media (max-width: 768px) {
            .btn-scroll-wrapper {
              flex: 1 1 100%;
              width: 100%;
            }
            #selection-counter {
              display: none !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
      counter = document.createElement('div');
      counter.id = 'selection-counter';
      actualToolbar.appendChild(counter);
    }

    if (selectedRows.length > 0) {
      counter.style.display = 'inline-flex';
      counter.innerHTML = `
        <span>Đã chọn ${selectedRows.length} dòng</span>
        <span class="material-symbols-outlined btn-clear-selection" title="Bỏ chọn" style="font-size: 16px; cursor: pointer; border-radius: 50%; padding: 2px;">close</span>
      `;
      var btnClear = counter.querySelector('.btn-clear-selection');
      if (btnClear) {
        btnClear.onmouseover = function () { this.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
        btnClear.onmouseout = function () { this.style.backgroundColor = 'transparent'; };
        btnClear.onclick = _clearSelection;
      }
    } else {
      counter.style.display = 'none';
      counter.innerHTML = '';
    }

    if (MODULE_CONFIG.UseSplitLayout) {
      _updateDetailView();
    }
  }

  function _updateDetailView() {
    var detailContent = $container.querySelector('#dynamic-detail-content');
    if (!detailContent) return;

    var splitContainer = $container.querySelector('.split-master-detail-container');

    if (!selectedRows || selectedRows.length === 0) {
      if (splitContainer) {
        splitContainer.classList.remove('show-detail');
      }
      var selectText = MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết';
      detailContent.innerHTML = '<div class="empty-detail-state">' +
        '<div class="empty-icon-wrapper">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
        '</div>' +
        '<div class="empty-text-main">Chưa có thông tin</div>' +
        '<div class="empty-text-sub">' + selectText + '</div>' +
        '</div>';
      var detailHeader = $container.querySelector('.detail-header');
      if (detailHeader) {
        detailHeader.textContent = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
      }
      return;
    }

    if (splitContainer) {
      splitContainer.classList.add('show-detail');
    }

    // Set up mobile back button click handler
    var backBtn = $container.querySelector('.detail-back-btn');
    if (backBtn) {
      backBtn.onclick = _clearSelection;
    }

    var row = selectedRows[0];
    var currentRowId = row[MODULE_CONFIG.PrimaryKey] || '';
    if (currentRowId !== _lastDetailRowId) {
      _inlineEditMode = false;
      _lastDetailRowId = currentRowId;
    }

    detailContent.innerHTML = '';

    var detailHeader = $container.querySelector('.detail-header');
    if (detailHeader) {
      var defaultDetailTitle = MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết';
      var nameVal = row.PersonName || row.TenPhuCap || row[MODULE_CONFIG.PrimaryKey] || '';

      detailHeader.style.display = 'flex';
      detailHeader.style.justifyContent = 'space-between';
      detailHeader.style.alignItems = 'center';

      var titleSpan = document.createElement('span');
      titleSpan.textContent = defaultDetailTitle + ': ' + nameVal;

      detailHeader.innerHTML = '';
      detailHeader.appendChild(titleSpan);

      var currentTabDef = MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0 ? MODULE_CONFIG.DetailTabs[activeDetailTabIdx || 0] : null;
      if (currentTabDef && currentTabDef.type === 'form' && !MODULE_CONFIG.HideEditBtn && (typeof _hasPermission !== 'function' || _hasPermission('EDIT'))) {
        var hdrActions = document.createElement('div');
        hdrActions.style.cssText = 'display: flex; gap: 8px; font-weight: normal; margin-right: 4px;';
        if (_inlineEditMode) {
          var btnSave = document.createElement('button');
          btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
          btnSave.style.cssText = 'padding: 6px 16px; background: var(--color-success, #10b981); color: white; border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); outline: none; transition: all 0.2s;';
          btnSave.onmouseover = function () { this.style.transform = 'translateY(-1px)'; this.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)'; };
          btnSave.onmouseout = function () { this.style.transform = 'none'; this.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'; };
          btnSave.onclick = function () { _saveInlineEdit(row, currentTabDef, btnSave); };

          var btnCancel = document.createElement('button');
          btnCancel.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">close</span> Hủy';
          btnCancel.style.cssText = 'padding: 6px 16px; background: var(--color-surface-elevated, #f1f5f9); color: var(--color-text-secondary, #64748b); border: 1px solid var(--color-border); border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; outline: none; transition: all 0.2s;';
          btnCancel.onmouseover = function () { this.style.background = 'var(--color-border-subtle, #e2e8f0)'; };
          btnCancel.onmouseout = function () { this.style.background = 'var(--color-surface-elevated, #f1f5f9)'; };
          btnCancel.onclick = function () { _inlineEditMode = false; _updateDetailView(); };

          hdrActions.appendChild(btnCancel);
          hdrActions.appendChild(btnSave);
        } else {
          var btnEdit = document.createElement('button');
          btnEdit.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">edit</span> Sửa';
          btnEdit.style.cssText = 'padding: 6px 16px; background: var(--color-primary-light, #e0e7ff); color: var(--color-primary, #4338ca); border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; outline: none; transition: all 0.2s;';
          btnEdit.onmouseover = function () { this.style.background = 'var(--color-primary, #4338ca)'; this.style.color = 'white'; };
          btnEdit.onmouseout = function () { this.style.background = 'var(--color-primary-light, #e0e7ff)'; this.style.color = 'var(--color-primary, #4338ca)'; };
          btnEdit.onclick = function () { _openEditForm(row); };
          hdrActions.appendChild(btnEdit);
        }
        detailHeader.appendChild(hdrActions);
      }
    }

    if (MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
      // 1. Render master fields card if DetailFormFields is defined
      var masterGrid = null;
      if (MODULE_CONFIG.DetailFormFields && (!MODULE_CONFIG.DetailTabs || MODULE_CONFIG.DetailTabs.length === 0)) {
        masterGrid = document.createElement('div');
        masterGrid.className = 'detail-master-grid';
        masterGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; margin-bottom: 20px; padding: 14px; background: var(--color-background, #f8fafc); border-radius: 8px; border: 1px solid var(--color-border, #e2e8f0);';

        MODULE_CONFIG.DetailFormFields.forEach(function (f) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';
          if (f.format === 'boolean') {
            fldDiv.style.flexDirection = 'row';
            fldDiv.style.alignItems = 'center';
            fldDiv.style.gap = '8px';
            fldDiv.style.padding = '4px 0';
          }

          var label = document.createElement('span');
          label.textContent = f.label;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[f.name];
          var valFormatted = '';
          if (rawVal === null || rawVal === undefined) {
            valFormatted = '—';
          } else if (f.format === 'money') {
            var n = parseFloat(rawVal);
            valFormatted = isNaN(n) ? rawVal : n.toLocaleString('vi-VN');
            valSpan.style.fontFamily = 'monospace';
            valSpan.style.fontWeight = '600';
          } else if (f.format === 'boolean') {
            var isTrue = (rawVal === true || rawVal === 1 || String(rawVal) === '1' || String(rawVal).toLowerCase() === 'true');
            valFormatted = isTrue
              ? `<span style="color:var(--color-success); display:inline-flex; align-items:center; gap:4px; font-weight:600;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span>Có</span>`
              : `<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span>Không</span>`;
          } else {
            valFormatted = rawVal;
          }

          if (f.format === 'boolean') {
            fldDiv.innerHTML = valFormatted + `<span style="font-size: 12px; font-weight: 500; color: var(--color-text);">${f.label}</span>`;
          } else {
            valSpan.innerHTML = valFormatted;
            valSpan.style.fontSize = '13px';
            valSpan.style.color = 'var(--color-text, #1e293b)';
            valSpan.style.fontWeight = '500';
            fldDiv.appendChild(label);
            fldDiv.appendChild(valSpan);
          }
          masterGrid.appendChild(fldDiv);
        });
        detailContent.appendChild(masterGrid);
      }

      // 2. Render Tabs Bar if there are multiple tabs
      if (MODULE_CONFIG.DetailTabs.length > 1) {
        var tabsBar = document.createElement('div');
        tabsBar.className = 'detail-tabs-bar';
        tabsBar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border);';

        if (typeof activeDetailTabIdx === 'undefined' || activeDetailTabIdx >= MODULE_CONFIG.DetailTabs.length) {
          activeDetailTabIdx = 0;
        }

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var tabBtn = document.createElement('button');
          tabBtn.type = 'button';
          tabBtn.textContent = tab.label;
          var isActive = (idx === activeDetailTabIdx);

          tabBtn.style.cssText = 'padding: 8px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; font-family: inherit;';

          if (isActive) {
            tabBtn.style.backgroundColor = 'var(--color-primary)';
            tabBtn.style.color = '#ffffff';
            tabBtn.style.fontWeight = '600';
            tabBtn.style.boxShadow = 'var(--shadow-sm)';
          } else {
            tabBtn.style.backgroundColor = 'transparent';
            tabBtn.style.color = 'var(--color-text-secondary)';

            tabBtn.onmouseover = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'var(--color-surface)';
                this.style.color = 'var(--color-text)';
              }
            };
            tabBtn.onmouseout = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'transparent';
                this.style.color = 'var(--color-text-secondary)';
              }
            };
          }

          tabBtn.onclick = function () {
            activeDetailTabIdx = idx;
            _updateDetailView();
          };
          tabsBar.appendChild(tabBtn);
        });
        detailContent.appendChild(tabsBar);

        // --- Custom Mobile Dropdown ---
        var selectWrapper = document.createElement('div');
        selectWrapper.className = 'detail-tabs-mobile-select-wrapper custom-dropdown-wrapper';
        selectWrapper.style.cssText = 'margin-bottom: 16px; width: 100%; position: relative;';

        var triggerBtn = document.createElement('button');
        triggerBtn.type = 'button';
        triggerBtn.className = 'custom-dropdown-trigger';
        triggerBtn.innerHTML = '<span>' + (MODULE_CONFIG.DetailTabs[activeDetailTabIdx] ? MODULE_CONFIG.DetailTabs[activeDetailTabIdx].label : 'Select Tab') + '</span><span class="material-symbols-outlined" style="font-size: 20px; color: var(--color-text-secondary); transition: transform 0.25s ease;">expand_more</span>';
        triggerBtn.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width: 100%; padding: 10px 14px; font-size: 14px; font-weight: 600; border: 1px solid var(--color-border); border-radius: 8px; background-color: var(--color-surface); color: var(--color-text); cursor: pointer; height: 44px; transition: all 0.2s ease; outline: none;';

        var dropdownPanel = document.createElement('div');
        dropdownPanel.className = 'custom-dropdown-panel';
        dropdownPanel.style.cssText = 'position: absolute; background: var(--color-surface); border-radius: var(--radius-md, 8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 999999; max-height: 280px; overflow-y: auto; display: none; flex-direction: column; padding: 8px 0; border: 1px solid var(--color-border);';

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var optBtn = document.createElement('button');
          optBtn.type = 'button';
          optBtn.textContent = tab.label;
          var isSelected = idx === activeDetailTabIdx;

          optBtn.style.cssText = 'width: 100%; display: flex; align-items: center; padding: 10px 16px; font-size: 14px; text-align: left; border: none; background: ' + (isSelected ? 'rgba(var(--color-primary-rgb, 60,80,224), 0.08)' : 'transparent') + '; color: ' + (isSelected ? 'var(--color-primary)' : 'var(--color-text)') + '; font-weight: ' + (isSelected ? '600' : '500') + '; cursor: pointer; transition: background 0.15s ease; font-family: inherit;';

          optBtn.onmouseover = function () {
            if (!isSelected) this.style.background = 'var(--color-surface-hover, rgba(0, 0, 0, 0.04))';
          };
          optBtn.onmouseout = function () {
            if (!isSelected) this.style.background = 'transparent';
          };

          optBtn.onclick = function (e) {
            e.stopPropagation();
            activeDetailTabIdx = idx;
            dropdownPanel.style.display = 'none';
            _updateDetailView();
          };
          dropdownPanel.appendChild(optBtn);
        });

        triggerBtn.onclick = function (e) {
          e.stopPropagation();
          var isOpen = dropdownPanel.style.display === 'flex';

          if (!isOpen) {
            dropdownPanel.style.display = 'flex';
            var rect = triggerBtn.getBoundingClientRect();
            dropdownPanel.style.top = (rect.bottom + window.scrollY + 4) + 'px';
            dropdownPanel.style.left = (rect.left + window.scrollX) + 'px';
            dropdownPanel.style.width = rect.width + 'px';

            triggerBtn.style.background = 'var(--color-primary)';
            triggerBtn.style.color = '#fff';
            triggerBtn.style.borderColor = 'var(--color-primary)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = '#fff';
              icon.style.transform = 'rotate(180deg)';
            }
          } else {
            dropdownPanel.style.display = 'none';
            triggerBtn.style.background = 'var(--color-surface)';
            triggerBtn.style.color = 'var(--color-text)';
            triggerBtn.style.borderColor = 'var(--color-border)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = 'var(--color-text-secondary)';
              icon.style.transform = 'rotate(0deg)';
            }
          }
        };

        // Click outside to close
        var clickOutsideHandler = function (e) {
          if (!selectWrapper.contains(e.target) && !dropdownPanel.contains(e.target)) {
            dropdownPanel.style.display = 'none';
            triggerBtn.style.background = 'var(--color-surface)';
            triggerBtn.style.color = 'var(--color-text)';
            triggerBtn.style.borderColor = 'var(--color-border)';
            var icon = triggerBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.color = 'var(--color-text-secondary)';
              icon.style.transform = 'rotate(0deg)';
            }
          }
        };
        document.addEventListener('click', clickOutsideHandler);

        // Clean up event listener and body element when selectWrapper is removed
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            Array.from(mutation.removedNodes).forEach(function (node) {
              if (node === selectWrapper || node.contains(selectWrapper)) {
                document.removeEventListener('click', clickOutsideHandler);
                if (dropdownPanel && dropdownPanel.parentNode) {
                  dropdownPanel.parentNode.removeChild(dropdownPanel);
                }
                observer.disconnect();
              }
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        selectWrapper.appendChild(triggerBtn);
        // Append dropdownPanel to body so it completely escapes any overflow: hidden
        document.body.appendChild(dropdownPanel);
        detailContent.appendChild(selectWrapper);
      }

      // 3. Render active tab content
      var currentTabIdx = (typeof activeDetailTabIdx !== 'undefined' && activeDetailTabIdx < MODULE_CONFIG.DetailTabs.length) ? activeDetailTabIdx : 0;
      var tabDef = MODULE_CONFIG.DetailTabs[currentTabIdx];

      var tabContentContainer = document.createElement('div');
      tabContentContainer.className = 'detail-tab-content';
      detailContent.appendChild(tabContentContainer);

      if (tabDef.type === 'form') {
        // Form-type tab (personal details form next to employee photo box)
        var formWrap = document.createElement('div');
        formWrap.className = 'detail-form-wrap';
        formWrap.style.cssText = 'display: flex; gap: 16px; align-items: flex-start;';

        var fieldsGrid = document.createElement('div');
        fieldsGrid.className = 'detail-fields-grid';
        fieldsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px 24px; flex: 1; background: var(--color-surface, #fff); padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid var(--color-border, #e2e8f0);';

        if (_inlineEditMode && !document.getElementById('inline-edit-style-override')) {
          var inlineStyle = document.createElement('style');
          inlineStyle.id = 'inline-edit-style-override';
          inlineStyle.innerHTML = `
            .inline-edit-field { width: 100%; display: flex; align-items: center; position: relative; }
            .inline-edit-field .form-inline-input {
              width: 100%;
              border: 1px dashed transparent;
              border-bottom: 1px dashed var(--color-border, #cbd5e1);
              padding: 4px;
              margin-left: -4px;
              border-radius: 4px 4px 0 0;
              font-size: 14px;
              font-weight: 600;
              color: var(--color-text, #0f172a);
              background: transparent;
              outline: none;
              font-family: inherit;
              transition: all 0.2s;
            }
            .inline-edit-field .form-inline-input:hover {
              background: rgba(0,0,0,0.02);
            }
            .inline-edit-field .form-inline-input:focus {
              border-bottom: 1px solid var(--color-primary, #3c50e0);
              background: var(--color-primary-light, #e0e7ff);
            }
            .inline-edit-field .ui-input:disabled {
              border: none !important;
              background: transparent !important;
              color: var(--color-text-secondary, #64748b);
              font-weight: 600;
            }
            .inline-edit-field select.form-inline-input {
              appearance: none;
              background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 4px center;
              background-size: 16px;
            }
            .inline-edit-field input[type="date"].form-inline-input::-webkit-calendar-picker-indicator {
              cursor: pointer;
              opacity: 0.5;
              transition: 0.2s;
              padding: 4px;
            }
            .inline-edit-field input[type="date"].form-inline-input:hover::-webkit-calendar-picker-indicator {
              opacity: 1;
            }
          `;
          document.head.appendChild(inlineStyle);
        }

        var fieldsToRender = tabDef.fields || [];
        fieldsToRender.forEach(function (fName) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 2px; padding-bottom: 6px; border-bottom: 1px dashed var(--color-border-subtle, #f1f5f9);';

          var labelText = (tabDef.headers && tabDef.headers[fName]) ? tabDef.headers[fName] : (globalDictionary[fName] || fName);
          if (typeof labelText === 'string') {
            labelText = labelText.replace(/\s*:\s*$/, '');
          }

          var label = document.createElement('span');
          label.textContent = labelText;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-tertiary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[fName];
          var valFormatted = '';

          if (_inlineEditMode) {
            valSpan = document.createElement('div');
            valSpan.className = 'inline-edit-field';

            var fieldSchema = globalFormSchema.find(function (s) { return s.name === fName; });
            var isReadOnly = fieldSchema ? fieldSchema.isReadOnlyEdit : fName === MODULE_CONFIG.PrimaryKey;
            var isDate = fName.toLowerCase().indexOf('ngay') >= 0 || (fieldSchema && fieldSchema.renderRule === 'dt');

            if (isReadOnly) {
              var roInput = document.createElement('input');
              roInput.type = 'text';
              roInput.value = rawVal || '';
              roInput.disabled = true;
              roInput.className = 'ui-input form-inline-input';
              valSpan.appendChild(roInput);
            } else if (isDate) {
              var dInput = document.createElement('input');
              dInput.type = 'date';
              dInput.name = fName;
              dInput.className = 'ui-input form-inline-input';
              if (rawVal) {
                try {
                  var d = new Date(rawVal);
                  if (!isNaN(d.getTime())) dInput.value = d.toISOString().split('T')[0];
                } catch (e) { }
              }
              valSpan.appendChild(dInput);
            } else if (fName === 'GioiTinh') {
              var sel = document.createElement('select');
              sel.name = fName;
              sel.className = 'ui-input form-inline-input';
              var opts = ['Nam', 'Nữ', 'Khác'];
              opts.forEach(function (o) {
                var option = document.createElement('option');
                option.value = o; option.textContent = o;
                if (rawVal === o) option.selected = true;
                sel.appendChild(option);
              });
              valSpan.appendChild(sel);
            } else if (fName === 'PersonStatus') {
              var selStatus = document.createElement('select');
              selStatus.name = fName;
              selStatus.className = 'ui-input form-inline-input';
              var statuses = [{ v: '1', t: 'Thử việc' }, { v: '4', t: 'Chính thức' }, { v: '8', t: 'Nghỉ việc' }];
              statuses.forEach(function (s) {
                var option = document.createElement('option');
                option.value = s.v; option.textContent = s.t;
                if (String(rawVal) === s.v) option.selected = true;
                selStatus.appendChild(option);
              });
              valSpan.appendChild(selStatus);
            } else {
              var txtInput = document.createElement('input');
              txtInput.type = 'text';
              txtInput.name = fName;
              txtInput.value = rawVal || '';
              txtInput.className = 'ui-input form-inline-input';
              valSpan.appendChild(txtInput);
            }
          } else {
            if (rawVal === null || rawVal === undefined) {
              valFormatted = '—';
            } else {
              if (fName.toLowerCase().indexOf('ngay') >= 0 && rawVal) {
                try {
                  var d = new Date(rawVal);
                  if (!isNaN(d.getTime())) {
                    valFormatted = d.toLocaleDateString('vi-VN');
                  } else {
                    valFormatted = rawVal;
                  }
                } catch (e) {
                  valFormatted = rawVal;
                }
              } else if (fName === 'PersonStatus') {
                var statusMap = {
                  '1': 'Thử việc',
                  '4': 'Chính thức',
                  '8': 'Nghỉ việc'
                };
                valFormatted = statusMap[String(rawVal)] || rawVal;
              } else {
                valFormatted = rawVal;
              }
            }

            valSpan.innerHTML = valFormatted;
            valSpan.style.fontSize = '14px';
            valSpan.style.color = 'var(--color-text, #0f172a)';
            valSpan.style.fontWeight = '600';
          }

          fldDiv.appendChild(label);
          fldDiv.appendChild(valSpan);
          fieldsGrid.appendChild(fldDiv);
        });

        formWrap.appendChild(fieldsGrid);

        var isPersonForm = !!MODULE_CONFIG.isPersonForm;
        var isCandidateForm = !!MODULE_CONFIG.isCandidateForm;
        if (isPersonForm || isCandidateForm) {
          console.log('[PHOTO DEBUG] Detail View - row:', row);
          var photoBox = document.createElement('div');
          photoBox.className = 'photo-box-wrapper';
          photoBox.style.cssText = 'width: 180px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; border: none; padding: 0; background: transparent;';

          var imgFrame = document.createElement('div');
          imgFrame.className = 'detail-img-frame';
          imgFrame.style.cssText = 'width: 160px; height: 160px; border: 4px solid var(--color-surface, #fff); border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative;';

          var img = document.createElement('img');
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

          var defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";
          var rawContent = '';
          var fileNameVal = '';
          if (row) {
            for (var key in row) {
              var keyLower = key.toLowerCase();
              if (keyLower === 'content') {
                rawContent = row[key];
              } else if (keyLower === 'filename') {
                fileNameVal = row[key];
              }
            }
          }

          var attachmentConfig = MODULE_CONFIG.attachments && MODULE_CONFIG.attachments.default || {};
          var attachmentOwnerField = attachmentConfig.ownerField || MODULE_CONFIG.PrimaryKey;
          var imgIdVal = row ? (row[attachmentOwnerField] || '') : '';
          var isLoadingHex = false;

          if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
            var mimeType = 'image/jpeg';
            if (fileNameVal) {
              var ext = fileNameVal.split('.').pop().toLowerCase();
              if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';
            }
            try {
              if (/^0x/i.test(rawContent)) {
                // Chuỗi hex dạng 0xFFD8FF...
                var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
                var bytes = new Uint8Array(hexStr.length / 2);
                for (var bi = 0; bi < bytes.length; bi++) {
                  bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
                }
                var blob = new Blob([bytes], { type: mimeType });
                img.src = URL.createObjectURL(blob);
              } else {
                // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
                img.src = 'data:' + mimeType + ';base64,' + rawContent;
              }
              isLoadingHex = true;
            } catch (err) {
              console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
            }
          }

          var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

          if (!isLoadingHex) {
            if (imgIdVal) {
              var subFolder = attachmentConfig.imageFolder || '';
              img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
            } else {
              img.src = defaultPhoto;
            }
          }

          img.onerror = function () {
            if (isLoadingBase64) {
              isLoadingBase64 = false;
              if (imgIdVal) {
                var subFolder = attachmentConfig.imageFolder || '';
                img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
                return;
              }
            }

            // Dynamic API fetch fallback
            if (imgIdVal) {
              var self = this;
              var attachQuery = {};
              attachQuery[attachmentOwnerField] = imgIdVal;
              GatewayClient.run({ sp: attachmentConfig.sp, func: 'View' }, attachQuery, {
                payload: { UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown' }
              })
                .then(function (data) {
                  if (data && data.code === 0 && data.records && data.records.length > 0) {
                    var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                    if (b64 && b64.length > 10) {
                      if (b64.startsWith('data:image')) {
                        self.src = b64;
                      } else {
                        var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                        self.src = 'data:' + mimeType + ';base64,' + b64;
                      }
                    } else {
                      if (self.src !== defaultPhoto) self.src = defaultPhoto;
                    }
                  } else {
                    if (self.src !== defaultPhoto) self.src = defaultPhoto;
                  }
                })
                .catch(function (err) {
                  if (self.src !== defaultPhoto) self.src = defaultPhoto;
                });
            } else {
              if (img.src !== defaultPhoto) img.src = defaultPhoto;
            }
          };

          imgFrame.appendChild(img);

          if (_inlineEditMode) {
            var avatarOverlay = document.createElement('div');
            avatarOverlay.className = 'avatar-edit-overlay';
            avatarOverlay.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; text-align: center; padding: 6px 0; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; transition: 0.2s;';
            avatarOverlay.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">add_a_photo</span> Thay ảnh';
            if (isViewMode) avatarOverlay.style.display = 'none';

            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';

            fileInput.onchange = function (e) {
              var file = e.target.files[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                if (typeof Alert !== 'undefined') Alert.error('Tệp quá lớn', 'Hệ thống chỉ hỗ trợ ảnh tối đa 10MB.');
                return;
              }

              var reader = new FileReader();
              reader.onload = function (e_ab) {
                var bytes = new Uint8Array(e_ab.target.result);
                var hexArray = [];
                for (var i = 0; i < bytes.length; i++) {
                  var hexVal = bytes[i].toString(16);
                  if (hexVal.length < 2) hexVal = '0' + hexVal;
                  hexArray.push(hexVal);
                }
                var hexStr = '0x' + hexArray.join('');

                var base64Reader = new FileReader();
                base64Reader.onload = function (e_b64) {
                  var dataUrl = e_b64.target.result;
                  var base64Content = dataUrl.split(',')[1] || dataUrl;

                  // Preview immediately
                  img.src = dataUrl;

                  // Save to window for _saveInlineEdit
                  window._pendingAvatar = {
                    file: file,
                    hexStr: hexStr,
                    base64Content: base64Content,
                    dataUrl: dataUrl // Store the full dataUrl for the backend
                  };
                };
                base64Reader.readAsDataURL(file);
              };
              reader.readAsArrayBuffer(file);
            };

            avatarOverlay.onclick = function () { fileInput.click(); };

            imgFrame.appendChild(avatarOverlay);
            imgFrame.appendChild(fileInput);
          }

          photoBox.appendChild(imgFrame);
          formWrap.appendChild(photoBox);
        }

        tabContentContainer.appendChild(formWrap);
      } else if (tabDef.type === 'kv-form') {
        // KV-Form tab: gọi API riêng và hiển thị từng record dướng form nhãn-giá trị
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải dữ liệu...</div>';
        var pkFieldKV = MODULE_CONFIG.PrimaryKey || 'id';
        var pkValKV = row[pkFieldKV] || '';
        var filterKV = {};
        filterKV[tabDef.filterField || pkFieldKV] = pkValKV;
        var MONEY_KV = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
        var DATE_KV = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];

        GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterKV, {
          endpoint: MODULE_CONFIG.ApiSearch,
          limit: 500
        }).then(function (resKV) {
          var dataKV = resKV.list || resKV.records || [];
          tabContentContainer.innerHTML = '';
          if (dataKV.length === 0) {
            var emptyKV = document.createElement('div');
            emptyKV.style.cssText = 'color:var(--color-text-secondary);padding:24px;text-align:center;font-size:13px;';
            emptyKV.textContent = tabDef.emptyText || 'Chưa có dữ liệu';
            tabContentContainer.appendChild(emptyKV);
            return;
          }
          var rowIdFieldKV = tabDef.rowIdField || 'id';
          var fieldsKV = tabDef.fields || Object.keys(dataKV[0]).filter(function (k) {
            return !k.startsWith('_') && k !== rowIdFieldKV && k !== pkFieldKV;
          });
          dataKV.forEach(function (rec, idx) {
            var card = document.createElement('div');
            card.style.cssText = 'background:var(--color-background,#f8fafc);border:1px solid var(--color-border);border-radius:8px;padding:14px 16px;margin-bottom:12px;';
            if (dataKV.length > 1) {
              var cardHdr = document.createElement('div');
              cardHdr.style.cssText = 'font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--color-border);';
              cardHdr.textContent = (tabDef.cardTitle || 'Bản ghi') + ' ' + (idx + 1);
              card.appendChild(cardHdr);
            }
            var grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 20px;';
            fieldsKV.forEach(function (fk) {
              var fldDiv = document.createElement('div');
              fldDiv.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
              var lbl = document.createElement('span');
              var lblTxt = (tabDef.headers && tabDef.headers[fk]) ? tabDef.headers[fk] : (globalDictionary[fk] || fk);
              if (typeof lblTxt === 'string') { lblTxt = lblTxt.replace(/\s*:\s*$/, ''); }
              lbl.textContent = lblTxt;
              lbl.style.cssText = 'font-size:11px;font-weight:600;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:0.5px;';
              var val = document.createElement('span');
              var rawV = rec[fk];
              var displayV = '';
              if (rawV === null || rawV === undefined || rawV === '') {
                displayV = '—';
                val.style.color = 'var(--color-text-secondary)';
              } else if (DATE_KV.indexOf(fk) >= 0) {
                try { var dkv = new Date(rawV); displayV = !isNaN(dkv.getTime()) ? dkv.toLocaleDateString('vi-VN') : rawV; } catch (e) { displayV = rawV; }
                val.style.color = 'var(--color-text)';
              } else if (MONEY_KV.indexOf(fk) >= 0) {
                var nkv = parseFloat(rawV);
                displayV = (!isNaN(nkv) ? nkv.toLocaleString('vi-VN') : rawV) + ' đ';
                val.style.cssText = 'font-family:monospace;font-weight:600;font-size:14px;color:var(--color-primary);';
              } else {
                displayV = rawV;
                val.style.color = 'var(--color-text)';
              }
              val.textContent = displayV;
              val.style.fontSize = '13px';
              val.style.fontWeight = val.style.fontWeight || '500';
              fldDiv.appendChild(lbl);
              fldDiv.appendChild(val);
              grid.appendChild(fldDiv);
            });
            card.appendChild(grid);
            tabContentContainer.appendChild(card);
          });
        }).catch(function () {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu</div>';
        });
      } else if (tabDef.type === 'attachments') {
        _renderAttachmentsTab(tabDef, tabContentContainer, false, row);
      } else {
        // Table tab
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải chi tiết...</div>';
        var pkField = MODULE_CONFIG.PrimaryKey || 'id';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterData, {
          endpoint: MODULE_CONFIG.ApiSearch,
          limit: 500
        }).then(function (res) {
          var data = res.list || res.records || [];
          // Lọc bỏ hàng trống: nếu tất cả field hiển thị đều là null/''/'0'/0 thì bỏ qua
          if (tabDef.fields && tabDef.fields.length > 0) {
            var SKIP_KEYS = [tabDef.rowIdField || 'id', MODULE_CONFIG.PrimaryKey, tabDef.filterField];
            var displayKeys = tabDef.fields.filter(function (k) { return SKIP_KEYS.indexOf(k) < 0; });
            data = data.filter(function (r) {
              return displayKeys.some(function (k) {
                var v = r[k];
                if (v === null || v === undefined || v === '') return false;
                if (String(v).trim() === '0' || String(v).trim() === '0.00') return false;
                return true;
              });
            });
          }
          tabContentContainer.innerHTML = '';

          if (data.length === 0) {
            var emptyText = tabDef.emptyText || MODULE_CONFIG.SplitLayoutEmptyText || 'Không có dữ liệu chi tiết';
            var emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'color:var(--color-text-secondary);padding:12px;text-align:center;';
            emptyDiv.textContent = emptyText;
            tabContentContainer.appendChild(emptyDiv);
            return;
          }

          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });

          // Xác định kiểu cột 1 lần duy nhất để căn chỉnh đồng nhất header & cell
          var MONEY_FIELDS = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
          var DATE_FIELDS = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'TuNgay', 'DenNgay', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];
          var NUMBER_FIELDS = ['SoNgay', 'SoNgayDaSuDung', 'SoNgayConLai', 'PhepThamNien', 'PhepTonNamTruoc', 'SoNgayPhepTet', 'SoNgayPhepOm', 'Nam', 'SoLuong', 'SoNgayNghi'];
          var TEXT_WRAP_FIELDS = ['NoiDung', 'GhiChu', 'NoiDungKTKL', 'NoiDungPhuCap', 'Notes'];
          var colType = {};
          keys.forEach(function (k) {
            if (NUMBER_FIELDS.indexOf(k) >= 0) { colType[k] = 'number'; }
            else if (DATE_FIELDS.indexOf(k) >= 0) { colType[k] = 'date'; }
            else if (MONEY_FIELDS.indexOf(k) >= 0) { colType[k] = 'money'; }
            else if (TEXT_WRAP_FIELDS.indexOf(k) >= 0) { colType[k] = 'textwrap'; }
            else {
              var kl = k.toLowerCase();
              // Tránh match SoNgay* (số ngày) thành kiểu date
              if ((kl.indexOf('ngay') >= 0 && !kl.startsWith('so')) || kl.indexOf('date') >= 0) { colType[k] = 'date'; }
              else if (kl.indexOf('tien') >= 0 || kl.indexOf('luong') >= 0 || kl === 'mucdong' || kl === 'mucluong') { colType[k] = 'money'; }
              else if (kl.indexOf('noidung') >= 0 || kl.indexOf('ghichu') >= 0 || kl === 'notes') { colType[k] = 'textwrap'; }
              else { colType[k] = 'text'; }
            }
          });

          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;table-layout:auto;';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            if (typeof label === 'string') { label = label.replace(/\s*:\s*$/, ''); }
            th.textContent = label;
            var thAlign = (colType[k] === 'money') ? 'right' : 'left';
            th.style.cssText = 'padding:8px 10px;border-bottom:2px solid var(--color-border);background:var(--color-surface-elevated);position:sticky;top:0;text-align:' + thAlign + ';white-space:nowrap;color:var(--color-text);font-weight:700;';
            if (colType[k] === 'textwrap') { th.style.minWidth = '140px'; }
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r, rIdx) {
            var tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom:1px solid var(--color-border);' + (rIdx % 2 === 1 ? 'background:var(--color-background,#f8fafc);' : '');
            keys.forEach(function (k) {
              var td = document.createElement('td');
              var val = r[k];
              var ct = colType[k];
              if (ct === 'date' && val) {
                try { var dv = new Date(val); if (!isNaN(dv.getTime())) { val = dv.toLocaleDateString('vi-VN'); } } catch (e) { }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              } else if (ct === 'money') {
                var n = parseFloat(val);
                if (!isNaN(n) && val !== '' && val != null) { val = n.toLocaleString('vi-VN'); }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;font-weight:500;color:var(--color-text);';
              } else if (ct === 'number') {
                var nv = parseFloat(val);
                if (!isNaN(nv) && val !== '' && val != null) {
                  // Hiển thị số nguyên gọn (12.00 → 12), thập phân giữ max 2 chữ số
                  val = Number.isInteger(nv) ? nv.toLocaleString('vi-VN') : nv.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
                }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;color:var(--color-text);';
              } else if (ct === 'textwrap') {
                td.style.cssText = 'padding:8px 10px;white-space:normal;word-break:break-word;min-width:140px;max-width:240px;color:var(--color-text);';
              } else {
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              }
              td.textContent = val != null ? val : '';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          tabContentContainer.appendChild(wrap);
        }).catch(function (err) {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu chi tiết</div>';
        });
      }
    }
  }

  // ── Modal Form ────────────────────────────────────────────
  function _openBulkAddForm() {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    // Form đích
    var targetFormInput = UIInput.createText({
      label: 'Nhập cho Tên Form nào? (*)',
      required: true,
      placeholder: 'Ví dụ: frmCustomer'
    });
    body.appendChild(targetFormInput);

    // Vùng cuộn chứa Table
    var tableWrap = document.createElement('div');
    tableWrap.style.overflowX = 'auto';
    tableWrap.style.border = '1px solid var(--color-border)';
    tableWrap.style.borderRadius = '8px';

    var table = document.createElement('table');
    table.className = 'table table-hover mb-0';
    table.style.minWidth = '800px';

    var thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:140px;">Tên Cột (Database) *</th>
        <th style="width:160px;">Tiêu đề (Tiếng Việt)</th>
        <th style="width:120px;">Loại Input</th>
        <th style="width:70px; text-align:center;">Bắt buộc</th>
        <th style="width:160px;">Nguồn dữ liệu (API/STATIC)</th>
        <th style="width:80px;">Vị trí</th>
        <th style="width:150px;" title="Ví dụ: TrangThai=huy|doi">VisibleRule</th>
        <th style="width:60px; text-align:center;">Thêm</th>
        <th style="width:60px; text-align:center;">Sửa</th>
        <th style="width:60px; text-align:center;">Lọc</th>
        <th style="width:40px;"></th>
      </tr>
    `;
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);

    // Nút thêm dòng
    var btnAddRow = document.createElement('button');
    btnAddRow.className = 'btn btn-outline-primary d-flex align-items-center mt-2';
    btnAddRow.style.width = 'fit-content';
    btnAddRow.innerHTML = '<span class="material-symbols-outlined me-1" style="font-size:18px;">add</span> Thêm dòng mới';

    // Logic đẻ ra dòng mới
    function addRow() {
      var tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-1"><input type="text" class="ui-input" name="FieldName" placeholder="Ví dụ: CustomerID"></td>
        <td class="p-1"><input type="text" class="ui-input" name="CaptionVN" placeholder="Tiêu đề hiển thị"></td>
        <td class="p-1">
          <select class="ui-input" name="FormatID">
            <option value="">Chữ (Text)</option>
            <option value="nm">Số (Number)</option>
            <option value="dt">Ngày tháng (Date)</option>
            <option value="sw">Công tắc (Switch)</option>
            <option value="sl">Dropdown (Select)</option>
          </select>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-ch
            
            
            eckbox" name="IsRequired" value="1" style="cursor: pointer; margin-top: 0;">
          </div>
        </td>
        <td class="p-1"><input type="text" class="ui-input" name="DataSource" placeholder="/api/... hoặc STATIC:..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="FormPosition" placeholder="grid/6/4/12..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="VisibleRule" placeholder="VD: TrangThai=huy|doi"></td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInAdd" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Thêm Mới">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInEdit" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Chỉnh Sửa">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInFilter" value="1" style="cursor: pointer; margin-top: 0;" title="Hiển thị bộ lọc">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <button class="btn btn-sm btn-tool text-danger p-1 mt-1" onclick="this.closest('tr').remove()" title="Xóa dòng">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Mặc định tạo sẵn 3 dòng
    addRow(); addRow(); addRow();

    btnAddRow.onclick = addRow;
    body.appendChild(btnAddRow);

    var footerNode = document.createElement('div');
    footerNode.style.cssText = 'display: flex; gap: 12px;';
    footerNode.innerHTML =
      UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-close-bulk', type: 'secondary' }) +
      UIButton.createHTML({ text: 'Lưu toàn bộ', className: 'btn-submit-bulk', type: 'primary', icon: 'save' });

    var modalBulk = UIModal.show({
      title: 'Thêm Nhiều Trường (Lưới nhập liệu động)',
      content: body,
      width: '1200px', // Cho modal rộng ra để chứa bảng nhiều cột hơn
      footer: footerNode
    });

    footerNode.querySelector('.btn-close-bulk').onclick = function () {
      modalBulk.closeNow();
    };

    footerNode.querySelector('.btn-submit-bulk').onclick = function () {
      var targetForm = targetFormInput.querySelector('input').value.trim();
      if (!targetForm) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form đích!');

      var rows = tbody.querySelectorAll('tr');
      var payloads = [];

      rows.forEach(function (tr) {
        var fieldName = tr.querySelector('[name="FieldName"]').value.trim();
        var captionVN = tr.querySelector('[name="CaptionVN"]').value.trim() || fieldName;
        var formatID = tr.querySelector('[name="FormatID"]').value;
        var isRequired = tr.querySelector('[name="IsRequired"]').checked ? 1 : 0;
        var dataSource = tr.querySelector('[name="DataSource"]').value.trim();
        var formPosition = tr.querySelector('[name="FormPosition"]').value.trim();
        var visibleRule = tr.querySelector('[name="VisibleRule"]').value.trim();
        var showInAdd = tr.querySelector('[name="ShowInAdd"]').checked ? 1 : 0;
        var showInEdit = tr.querySelector('[name="ShowInEdit"]').checked ? 1 : 0;

        if (fieldName) {
          payloads.push({
            AutoID: '',
            FormName: targetForm,
            FieldName: fieldName,
            CaptionVN: captionVN,
            FormatID: formatID,
            IsRequired: isRequired,
            DataSource: dataSource,
            ShowInAdd: showInAdd,
            ShowInEdit: showInEdit,
            FormPosition: formPosition,
            VisibleRule: visibleRule,
            OrderNo: 0
          });
        }
      });

      if (payloads.length === 0) return Alert.warning('Lỗi', 'Chưa có dòng dữ liệu nào hợp lệ!');

      _setBtnLoading(btn, true);

      // Gọi API tuần tự
      _sendSequential(
        GatewayClient.resolveModuleOperation(MODULE_CONFIG, 'save'),
        payloads,
        { payload: { UserName: _currentUser() } },
        function () {                // onDone
          modalBulk.closeNow();
          Alert.success('Thành công', 'Đã lưu thành công ' + payloads.length + ' trường!');
          if (_isFormBuilder()) window._uiConfigCache = {};
          _loadData();
        },
        function (err, payload) {   // onError → return false để dừng chuỗi
          Alert.error('Lỗi ở dòng: ' + payload.FieldName, err.message);
          _setBtnLoading(btn, false);
          return false;
        }
      );
    };
  }

  function _openAddForm() {
    if (MODULE_CONFIG.CanAddOperation === false) {
      return Alert.warning(MODULE_CONFIG.AlertTitleWarning, 'Form này không được đăng ký thao tác Thêm mới.');
    }

    // Neu co WizardSteps -> dung Wizard multi-step, nguoc lai dung detail full page
    if (MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0 && typeof WizardForm !== 'undefined') {
      WizardForm.open({
        steps: MODULE_CONFIG.WizardSteps,
        formSchema: globalFormSchema,
        moduleConfig: MODULE_CONFIG,
        currentUser: _currentUser(),
        userBranches: _getUserBranches(),   // Danh sách chi nhánh của user
        saveData: _saveData
      });
    } else if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&action=add';
    } else {
      _openModal(false, null, false);
    }
  }



  function _openEditForm(row) {
    if (MODULE_CONFIG.CanEditOperation === false) {
      return _openViewForm(row);
    }

    if (!row || !row[MODULE_CONFIG.PrimaryKey]) {
      _openModal(true, row, true);
      return;
    }

    if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      // Save row data to session storage for faster and accurate load
      sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(row));
      // Redirect to detail page
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&id=' + encodeURIComponent(row[MODULE_CONFIG.PrimaryKey]) + '&action=edit';
    } else {
      _openModal(true, row, false);
    }
  }

  function _openViewForm(row) {
    if (!row || !row[MODULE_CONFIG.PrimaryKey]) {
      _openModal(true, row, true);
      return;
    }

    if (window.APP_MODULES && window.APP_MODULES[(MODULE_CONFIG.FormName || '').toUpperCase()]) {
      // Save row data to session storage for faster and accurate load
      sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(row));
      // Redirect to detail page without &action=edit to trigger View mode
      window.location.hash = '#/detail?module=' + encodeURIComponent(MODULE_CONFIG.FormName) + '&id=' + encodeURIComponent(row[MODULE_CONFIG.PrimaryKey]);
    } else {
      _openModal(true, row, true); // true for forceDetail (view mode)
    }
  }

  function _openBulkEditForm() {
    _openBulkGridEditForm(selectedRows, false);
  }

  function _openBulkGridEditForm(rows, isAdd) {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var alertBox = document.createElement('div');
    alertBox.className = 'alert alert-info py-2 mb-0 d-flex align-items-center gap-2';
    alertBox.style.fontSize = '13px';
    var isEdit = !isAdd;

    if (isAdd) {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">playlist_add</span>' +
        '<strong>Chế độ Thêm Hàng Loạt:</strong> Nhập dữ liệu để tạo mới nhiều dòng cùng lúc. Để trống dòng nếu không muốn thêm.';
    } else {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">grid_on</span>' +
        '<strong>Chế độ Sửa Từng Dòng:</strong> Chỉnh sửa dữ liệu trực tiếp trên bảng.';
    }
    body.appendChild(alertBox);

    var tableContainer = document.createElement('div');
    tableContainer.style.overflowX = 'auto';
    tableContainer.style.maxHeight = '65vh';

    var styleNode = document.createElement('style');
    styleNode.innerHTML = `
        .table-bulk-edit { margin-bottom: 0; border-collapse: separate; border-spacing: 0; }
        .table-bulk-edit thead th { position: sticky; top: 0; z-index: 2; background: var(--color-surface); border-bottom: 2px solid var(--color-border); }
        .table-bulk-edit tbody td { padding: 0 !important; vertical-align: middle; border-bottom: 1px solid var(--color-border); border-right: 1px solid var(--color-border); position: relative; }
        .table-bulk-edit tbody td:first-child { padding: 0 8px !important; }
        .table-bulk-edit tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .table-bulk-edit .form-group { margin-bottom: 0 !important; height: 100%; display: flex; align-items: center; width: 100%; }
        .table-bulk-edit input.ui-input, .table-bulk-edit .dropdown-wrapper, .table-bulk-edit .dropdown-wrapper input {
            border: none !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
            width: 100%; height: 100%; min-height: 40px; padding: 0 12px !important; outline: none !important;
        }
        .table-bulk-edit input.ui-input:focus { background: rgba(255,255,255,0.05) !important; }
        .table-bulk-edit .switch { justify-content: center; padding: 0; margin: 0; width: 100%; height: 100%; display: flex; align-items: center; min-height: 40px; }
        .table-bulk-edit .dropdown-wrapper .material-symbols-outlined { right: 8px; }
        
        /* Custom Scrollbar cho bảng */
        .table-bulk-edit-container::-webkit-scrollbar { width: 8px; height: 8px; }
        .table-bulk-edit-container::-webkit-scrollbar-track { background: transparent; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .table-bulk-edit-container::-webkit-scrollbar-corner { background: transparent; }
    `;
    tableContainer.appendChild(styleNode);
    tableContainer.classList.add('table-bulk-edit-container');

    var table = document.createElement('table');
    table.className = 'table table-bordered table-hover table-bulk-edit';
    table.style.width = 'max-content';
    table.style.minWidth = '100%';

    var formSchema = globalFormSchema;
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    var editableFields = [];
    var thead = document.createElement('thead');
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '1';
    thead.style.background = 'var(--color-surface)';
    var trHead = document.createElement('tr');

    var thStt = document.createElement('th');
    thStt.innerText = '#';
    thStt.style.width = '50px';
    thStt.style.textAlign = 'center';
    trHead.appendChild(thStt);

    formSchema.forEach(function (field) {
      if (String(field.showInEdit) === '1' || field.showInEdit === true) {
        editableFields.push(field);
        var th = document.createElement('th');
        th.innerText = field.label || field.name;
        if (field.required) {
          var req = document.createElement('span');
          req.innerText = ' *';
          req.style.color = 'var(--color-danger)';
          th.appendChild(req);
        }
        th.style.whiteSpace = 'nowrap';
        th.style.padding = '10px';
        trHead.appendChild(th);
      }
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var currentRowCount = rows.length;

    function appendRow(row, rowIdx) {
      var tr = document.createElement('tr');

      var tdStt = document.createElement('td');
      tdStt.innerText = rowIdx + 1;
      tdStt.style.textAlign = 'center';
      tdStt.style.verticalAlign = 'middle';
      tr.appendChild(tdStt);

      // Hidden PK
      var hiddenPK = document.createElement('input');
      hiddenPK.type = 'hidden';
      hiddenPK.name = MODULE_CONFIG.PrimaryKey + '_' + rowIdx;
      hiddenPK.value = row[MODULE_CONFIG.PrimaryKey] || '';
      hiddenPK.setAttribute('data-row-index', rowIdx);
      hiddenPK.setAttribute('data-field-name', MODULE_CONFIG.PrimaryKey);
      tr.appendChild(hiddenPK);

      // Hidden OrderNo
      var hiddenOrder = document.createElement('input');
      hiddenOrder.type = 'hidden';
      hiddenOrder.name = 'OrderNo_' + rowIdx;
      hiddenOrder.value = row.OrderNo || 0;
      hiddenOrder.setAttribute('data-row-index', rowIdx);
      hiddenOrder.setAttribute('data-field-name', 'OrderNo');
      tr.appendChild(hiddenOrder);

      editableFields.forEach(function (fieldTemplate) {
        var td = document.createElement('td');
        td.style.verticalAlign = 'middle';
        td.style.minWidth = '200px';
        td.style.padding = '0'; // Đã CSS trong class

        var field = Object.assign({}, fieldTemplate);
        field.value = row[field.name] !== undefined && row[field.name] !== null ? row[field.name] : '';
        var originalName = field.name;
        field.name = originalName + '_' + rowIdx;

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select' || field.renderRule === 'ms') {
          inputEl = document.createElement('div');
          inputEl.className = 'form-group';
          inputEl.style.marginBottom = '0';

          var hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.value || '';
          hiddenInput.setAttribute('data-row-index', rowIdx);
          hiddenInput.setAttribute('data-field-name', originalName);
          inputEl.appendChild(hiddenInput);

          var comboLoading = UIControls.createDataComboBox({ placeholder: 'Đang tải...', disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) });
          inputEl.appendChild(comboLoading);

          if (field.dataSource) {
            if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
              var staticStr = field.dataSource.substring(7);
              var staticData = staticStr.split(',').map(function (s) {
                var parts = s.split('|');
                return [parts[0], parts[1] || parts[0]];
              });
              var newCombo = UIControls.createDataComboBox({
                placeholder: '-- Chọn --',
                headers: ['ID', 'Tên'],
                data: staticData,
                multiple: field.multiple === true || field.renderRule === 'ms',
                initialValue: field.value,
                valueIndex: 0,
                forceMultiColumn: field.multiple === true || field.renderRule === 'ms',
                readonlyInput: field.allowCustomValue === false || field.multiple === true || field.renderRule === 'ms',
                colFilterIndex: 1,
                onSelect: function (r) {
                  hiddenInput.value = (field.multiple === true || field.renderRule === 'ms') ? r : r[0];
                }
              });
              var newDisplayInput = newCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return r[0] == field.value; });
              if (matched && newDisplayInput) newDisplayInput.value = matched[1];
              inputEl.replaceChild(newCombo, comboLoading);
            } else {
              var optionRequest;
              if (field.dataSourceMethod === 'GET') {
                optionRequest = ApiClient.get(field.dataSource);
              } else if (field.dataSource.indexOf('/') > -1 || field.dataSource.indexOf('http') === 0) {
                optionRequest = ApiClient.post(field.dataSource, { UserName: _currentUser() });
              } else {
                optionRequest = GatewayClient.run({ sp: field.dataSource, func: 'View' }, undefined, {
                  endpoint: MODULE_CONFIG.ApiSearch,
                  limit: 1000,
                  payload: { UserName: _currentUser() }
                });
              }
              optionRequest.then(function (res) {
                var dataList = res.list || res.records || [];
                var optionTable = _buildOptionTable(dataList, field, 0);
                var newCombo = UIControls.createDataComboBox({
                  placeholder: '-- Chọn --', headers: optionTable.headers, data: optionTable.data, colFilterIndex: optionTable.colFilterIndex,
                  multiple: field.multiple === true || field.renderRule === 'ms',
                  initialValue: field.value,
                  valueIndex: optionTable.valueIndex,
                  forceMultiColumn: field.multiple === true || field.renderRule === 'ms',
                  showAddNew: field.allowCustomValue !== false && !(typeof MODULE_CONFIG !== 'undefined' && MODULE_CONFIG.HideAddNewInDropdowns),
                  readonlyInput: field.allowCustomValue === false || field.multiple === true || field.renderRule === 'ms',
                  onF2: function () {
                    newCombo.querySelector('.ui-input').focus();
                  },
                  onSelect: function (r) {
                    hiddenInput.value = (field.multiple === true || field.renderRule === 'ms') ? r : r[0];
                  },
                  onChange: function (val) {
                    hiddenInput.value = (field.multiple === true || field.renderRule === 'ms')
                      ? val
                      : (field.allowCustomValue === false ? '' : val);
                  }
                });
                var newDisplayInput = newCombo.querySelector('input.ui-input');
                var matched = optionTable.data.find(function (r) { return r[0] == field.value; });
                if (matched && newDisplayInput) newDisplayInput.value = matched[optionTable.colFilterIndex];
                inputEl.replaceChild(newCombo, comboLoading);
              }).catch(function (err) {
                var displayInput = comboLoading.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }
          } else {
            var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
            inputEl.replaceChild(comboEmpty, comboLoading);
          }
        } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
          inputEl = UIInput.createNumber(field);
        } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
          var wrapper = document.createElement('div');
          wrapper.className = 'form-group';
          var flexDiv = document.createElement('div');
          flexDiv.style.display = 'flex';
          flexDiv.style.gap = '8px';

          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'ui-input';
          input.name = field.name;
          input.value = field.value || '';
          input.placeholder = 'Click nút Thiết lập...';
          input.readOnly = true;
          input.style.flex = '1';

          var btnWrapper = document.createElement('div');
          btnWrapper.innerHTML = UIButton.createHTML({ text: '', type: 'secondary', icon: 'settings', className: 'btn-icon-only' });
          var btn = btnWrapper.firstElementChild;
          btn.style.height = '100%';
          btn.onclick = function (e) {
            e.preventDefault();
            if (typeof RuleBuilderDialog !== 'undefined') {
              var formNameVal = row.FormName || row.formName || row.FORMNAME || '';
              RuleBuilderDialog.open({
                currentRule: input.value,
                targetFormName: formNameVal,
                onSave: function (newRule) {
                  input.value = newRule;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            } else {
              Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
            }
          };
          flexDiv.appendChild(input);
          flexDiv.appendChild(btn);
          wrapper.appendChild(flexDiv);
          inputEl = wrapper;
        } else {
          inputEl = UIInput.createText(field);
        }

        if (inputEl) {
          var lbl = inputEl.querySelector('label');
          if (lbl && !inputEl.classList.contains('switch')) {
            lbl.style.display = 'none';
          }
          if (inputEl.classList && inputEl.classList.contains('form-group')) {
            inputEl.style.marginBottom = '0';
          }
          var allInputs = inputEl.querySelectorAll('input, select, textarea');
          allInputs.forEach(function (i) {
            i.setAttribute('data-row-index', rowIdx);
            i.setAttribute('data-field-name', originalName);
            if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) i.disabled = true;
          });
          if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) inputEl.classList.add('ui-input-disabled');
          td.appendChild(inputEl);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    rows.forEach(function (row, rowIdx) {
      appendRow(row, rowIdx);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    body.appendChild(tableContainer);

    if (isAdd) {
      var btnAddMore = document.createElement('button');
      btnAddMore.className = 'btn btn-outline-primary btn-sm';
      btnAddMore.style.alignSelf = 'flex-start';
      btnAddMore.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; vertical-align:bottom;">add</span> Thêm 1 dòng nữa';
      btnAddMore.onclick = function () {
        appendRow({}, currentRowCount);
        currentRowCount++;
        // scroll to bottom
        setTimeout(function () { tableContainer.scrollTop = tableContainer.scrollHeight; }, 50);
      };
      body.appendChild(btnAddMore);
    }

    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = MODULE_CONFIG.BtnSaveAll;

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);

    var modal = UIModal.show({
      title: isAdd ? 'Thêm hàng loạt (' + rows.length + ' dòng)' : 'Sửa hàng loạt (' + rows.length + ' dòng)',
      width: '90%',
      content: body,
      footer: footer
    });

    btnCancel.onclick = function () { modal.close(); };
    btnSave.onclick = function () { _saveGridData(rows, modal, body, btnSave, isAdd); };
  }

  function _openModal(isEdit, row, isViewMode) {
    if (isEdit && !row) return;
    if (!row) row = {};

    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var currentModalFormState = {}; // Trạng thái form để truyền cho các Combobox gọi API

    var masterWrapper = document.createElement('div');
    masterWrapper.className = 'df-master-wrapper';
    masterWrapper.style.display = 'flex';
    masterWrapper.style.gap = '16px';
    masterWrapper.style.alignItems = 'flex-start';
    body.appendChild(masterWrapper);

    var grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.flexWrap = 'wrap';
    grid.style.gap = '12px 10px'; // Dòng cách dòng 12px, ô cách ô 10px
    grid.style.flex = '1';
    masterWrapper.appendChild(grid);

    var isGrouped = MODULE_CONFIG.IsFullPageDetail && MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0;
    var groupContainers = {};
    var ungroupedGrid = grid;

    if (isGrouped) {
      grid.style.flexDirection = 'column';
      grid.style.flexWrap = 'nowrap';
      grid.style.gap = '20px';

      MODULE_CONFIG.WizardSteps.forEach(function (step) {
        if (!step.fields || step.fields.length === 0) return;

        var groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.style.cssText = 'border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; background: var(--color-surface, #fff); box-shadow: 0 1px 3px rgba(0,0,0,0.05);';

        var groupTitle = document.createElement('h6');
        groupTitle.innerHTML = (step.icon ? '<span class="material-symbols-outlined" style="vertical-align:bottom; margin-right:6px; font-size:18px;">' + step.icon + '</span>' : '') + step.label;
        groupTitle.style.cssText = 'margin-top: 0; margin-bottom: 16px; color: var(--color-primary); font-weight: 600; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;';
        groupCard.appendChild(groupTitle);

        var groupGrid = document.createElement('div');
        groupGrid.style.display = 'flex';
        groupGrid.style.flexWrap = 'wrap';
        groupGrid.style.gap = '12px 10px';
        groupCard.appendChild(groupGrid);

        grid.appendChild(groupCard);

        step.fields.forEach(function (fName) {
          groupContainers[fName.toLowerCase()] = groupGrid;
        });
      });

      // Container for fields not explicitly defined in steps
      var ungroupedCard = document.createElement('div');
      ungroupedCard.className = 'group-card-other';
      ungroupedCard.style.cssText = 'border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; background: var(--color-surface, #fff); box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
      ungroupedCard.style.display = 'none'; // hidden by default until something is added

      ungroupedGrid = document.createElement('div');
      ungroupedGrid.style.display = 'flex';
      ungroupedGrid.style.flexWrap = 'wrap';
      ungroupedGrid.style.gap = '12px 10px';
      ungroupedCard.appendChild(ungroupedGrid);

      grid.appendChild(ungroupedCard);
    }

    var isPersonForm = !!MODULE_CONFIG.isPersonForm;
    var isCandidateForm = !!MODULE_CONFIG.isCandidateForm;
    if (isPersonForm || isCandidateForm) {
      console.log('[PHOTO DEBUG] Edit Modal - row:', row);
      var photoBox = document.createElement('div');
      photoBox.className = 'photo-box-wrapper';
      photoBox.style.width = '160px';
      photoBox.style.flexShrink = '0';
      photoBox.style.display = 'flex';
      photoBox.style.flexDirection = 'column';
      photoBox.style.alignItems = 'center';
      photoBox.style.marginTop = '16px';

      var imgFrame = document.createElement('div');
      imgFrame.style.width = '120px';
      imgFrame.style.height = '120px';
      imgFrame.style.borderRadius = '50%';
      imgFrame.style.border = '3px solid var(--color-primary)';
      imgFrame.style.overflow = 'hidden';
      imgFrame.style.display = 'flex';
      imgFrame.style.alignItems = 'center';
      imgFrame.style.justifyContent = 'center';
      imgFrame.style.background = '#f1f5f9';
      imgFrame.style.position = 'relative';
      imgFrame.style.cursor = 'pointer';
      imgFrame.title = 'Bấm để thay đổi ảnh đại diện';
      imgFrame.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

      var img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';

      var rawContent = '';
      var fileNameVal = '';
      if (row) {
        for (var key in row) {
          var keyLower = key.toLowerCase();
          if (keyLower === 'content') {
            rawContent = row[key];
          } else if (keyLower === 'filename') {
            fileNameVal = row[key];
          }
        }
      }

      var attachmentConfig = MODULE_CONFIG.attachments && MODULE_CONFIG.attachments.default || {};
      var attachmentOwnerField = attachmentConfig.ownerField || MODULE_CONFIG.PrimaryKey;
      var imgIdVal = row ? (row[attachmentOwnerField] || '') : '';
      var isLoadingHex = false;

      if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
        var mimeType = 'image/jpeg';
        if (fileNameVal) {
          var ext = fileNameVal.split('.').pop().toLowerCase();
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }
        try {
          if (/^0x/i.test(rawContent)) {
            // Chuỗi hex dạng 0xFFD8FF...
            var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
            var bytes = new Uint8Array(hexStr.length / 2);
            for (var bi = 0; bi < bytes.length; bi++) {
              bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
            }
            var blob = new Blob([bytes], { type: mimeType });
            img.src = URL.createObjectURL(blob);
          } else {
            // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
            img.src = 'data:' + mimeType + ';base64,' + rawContent;
          }
          isLoadingHex = true;
        } catch (err) {
          console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
        }
      }

      var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

      if (!isLoadingHex) {
        if (imgIdVal) {
          var subFolder = attachmentConfig.imageFolder || '';
          img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg?t=' + new Date().getTime();
        } else {
          img.src = defaultPhoto;
        }
      }
      img.onerror = function () {
        if (isLoadingBase64) {
          isLoadingBase64 = false;
          if (imgIdVal) {
            var subFolder = attachmentConfig.imageFolder || '';
            img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg?t=' + new Date().getTime();
            return;
          }
        }

        // Dynamic API fetch fallback
        if (imgIdVal) {
          var self = this;
          var attachQuery = {};
          attachQuery[attachmentOwnerField] = imgIdVal;
          GatewayClient.run({ sp: attachmentConfig.sp, func: 'View' }, attachQuery, {
            payload: { UserName: (typeof _currentUser === 'function') ? _currentUser() : 'Unknown' }
          })
            .then(function (data) {
              if (data && data.code === 0 && data.records && data.records.length > 0) {
                var b64 = data.records[0].Base64Content || data.records[0].Content || data.records[0].HinhAnh || '';
                if (b64 && b64.length > 10) {
                  if (b64.startsWith('data:image')) {
                    self.src = b64;
                  } else {
                    var mimeType = b64.startsWith('iVBORw') ? 'image/png' : 'image/jpeg';
                    self.src = 'data:' + mimeType + ';base64,' + b64;
                  }
                } else {
                  if (self.src !== defaultPhoto) self.src = defaultPhoto;
                }
              } else {
                if (self.src !== defaultPhoto) self.src = defaultPhoto;
              }
            })
            .catch(function (err) {
              if (self.src !== defaultPhoto) self.src = defaultPhoto;
            });
        } else {
          if (img.src !== defaultPhoto) img.src = defaultPhoto;
        }
      };

      imgFrame.appendChild(img);

      if (!isViewMode) {
        var overlay = document.createElement('div');
        overlay.innerHTML = '<span class="material-symbols-outlined" style="color:white; font-size: 20px;">photo_camera</span>';
        overlay.style.position = 'absolute';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.height = '36px';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'flex-start';
        overlay.style.paddingTop = '4px';
        imgFrame.appendChild(overlay);

        imgFrame.onclick = function () {
          var fileInp = document.createElement('input');
          fileInp.type = 'file';
          fileInp.accept = 'image/*';
          fileInp.onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
              var imgObj = new Image();
              imgObj.onload = function () {
                var MAX_WIDTH = 600;
                var MAX_HEIGHT = 600;
                var width = imgObj.width;
                var height = imgObj.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height = Math.round(height * MAX_WIDTH / width);
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width = Math.round(width * MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                  }
                }
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(imgObj, 0, 0, width, height);

                var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                var base64Content = dataUrl.split(',')[1];

                var binStr = atob(base64Content);
                var hexArray = [];
                for (var i = 0; i < binStr.length; i++) {
                  var hexVal = binStr.charCodeAt(i).toString(16);
                  if (hexVal.length < 2) hexVal = '0' + hexVal;
                  hexArray.push(hexVal);
                }
                var hexStr = '0x' + hexArray.join('');

                img.src = dataUrl;
                if (row) {
                  row.PhotoBase64 = dataUrl;
                }

                window._pendingWizardAvatar = {
                  file: file,
                  hexStr: hexStr,
                  base64Content: base64Content,
                  dataUrl: dataUrl
                };
              };
              imgObj.src = URL.createObjectURL(file);
            }
          };
          fileInp.click();
        };
      } // End if (!isViewMode)

      photoBox.appendChild(imgFrame);

      var targetCard = isGrouped && grid.firstChild ? grid.firstChild : null;
      if (targetCard) {
        var cardBody = targetCard.children[1]; // groupGrid
        if (cardBody) {
          var flexWrapper = document.createElement('div');
          flexWrapper.className = 'df-avatar-group-wrapper';
          flexWrapper.style.display = 'flex';
          flexWrapper.style.gap = '20px';
          flexWrapper.style.alignItems = 'flex-start';

          targetCard.insertBefore(flexWrapper, cardBody);
          photoBox.style.marginTop = '0'; // Xóa margin cũ

          flexWrapper.appendChild(photoBox);
          flexWrapper.appendChild(cardBody);
          cardBody.style.flex = '1';
        } else {
          masterWrapper.insertBefore(photoBox, grid);
        }
      } else {
        masterWrapper.insertBefore(photoBox, grid);
      }
    }

    // KHAI BÁO CẤU TRÚC FORM (SCHEMA-DRIVEN UI LẤY TỪ DB)
    var formSchema = globalFormSchema;

    // Sắp xếp lại theo OrderNo (Nếu có)
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    // ENGINE VẼ FORM TỰ ĐỘNG
    // -- TỰ ĐỘNG GỘP NHÓM CÁC TRƯỜNG CÓ LIÊN QUAN (Kinh nghiệm UI/UX Nhân sự) --
    var parentFields = {};
    var childToParent = {};
    var parentWrappers = {};

    formSchema.forEach(function (f) {
      var rule = (f.renderRule || f.formatId || f.FormatID || '').toLowerCase();
      if (rule === 'sw' || rule === 'boolean') {
        var children = formSchema.filter(function (cf) {
          return cf.name !== f.name && cf.name.indexOf(f.name) > -1;
        });
        if (children.length > 0) {
          parentFields[f.name] = children;
          children.forEach(function (c) { childToParent[c.name] = f.name; });
        }
      }
    });

    var normalAndParentFields = formSchema.filter(function (f) { return !childToParent[f.name]; });
    var childFields = formSchema.filter(function (f) { return childToParent[f.name]; });
    var orderedSchema = normalAndParentFields.concat(childFields);

    orderedSchema.forEach(function (field) {
      var isVisible = isEdit ? field.showInEdit : field.showInAdd;
      if (!(String(isVisible) === '1' || isVisible === true)) {
        // Vẽ input ẩn cho các Khóa chính (Ví dụ Makh) để Auto-Serializer thu thập được
        var hiddenEl = document.createElement('input');
        hiddenEl.type = 'hidden';
        hiddenEl.name = field.name;
        hiddenEl.value = row ? (row[field.name] || '') : '';
        body.appendChild(hiddenEl);
        return;
      }

      // Tự động gán giá trị cũ (nếu đang Sửa 1 dòng).
      field.value = (isEdit && row) ? (row[field.name] || '') : '';

      // Khởi tạo Ô nhập liệu tuỳ thuộc vào quy tắc renderRule
      var inputEl;
      if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
        inputEl = UIInput.createSwitch(field);
      } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
        inputEl = UIInput.createDate(field);
      } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
        inputEl = UIInput.createTime(field);
      } else if (field.renderRule === 'sl' || field.renderRule === 'select' || field.renderRule === 'ms') {
        var formGroupWrapper = document.createElement('div');
        formGroupWrapper.className = 'form-group';

        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          if (field.required) {
            var req = document.createElement('span');
            req.innerText = ' *';
            req.style.color = 'var(--color-danger)';
            lbl.appendChild(req);
          }
          formGroupWrapper.appendChild(lbl);
        }

        // Hidden input lưu giá trị thực (ID) để hàm Auto Serialize nhặt được
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = field.name;
        hiddenInput.value = field.value || '';
        formGroupWrapper.appendChild(hiddenInput);

        if (field.dataSource) {
          if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
            var staticStr = field.dataSource.substring(7);
            var staticData = staticStr.split(',').map(function (s) {
              var parts = s.split('|');
              return [parts[0], parts[1] || parts[0], parts[2] || ''];
            });

            var lazyStaticCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              multiple: field.multiple === true || field.renderRule === 'ms',
              initialValue: field.value,
              valueIndex: 0,
              colFilterIndex: 1,
              forceMultiColumn: field.multiple === true || field.renderRule === 'ms',
              readonlyInput: field.allowCustomValue === false || field.multiple === true || field.renderRule === 'ms',
              disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              onSearch: function (q, page) {
                return new Promise(function (resolve) {
                  var filtered = staticData;
                  if (field.dependsOn) {
                    var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                    filtered = staticData.filter(function (r) {
                      if (!r[2]) return true; // Ko cấu hình parent => luôn hiện
                      var parentValueNow = currentModalFormState[parents[0]] || '';
                      return String(r[2]) === String(parentValueNow);
                    });
                  }
                  if (q) {
                    filtered = filtered.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; });
                  }
                  resolve({
                    headers: ['Mã', 'Tên'],
                    data: filtered,
                    valueIndex: 0,
                    colFilterIndex: 1,
                    forceMultiColumn: field.multiple === true || field.renderRule === 'ms'
                  });
                });
              },
              onSelect: function (row) {
                hiddenInput.value = (field.multiple === true || field.renderRule === 'ms') ? row : row[0];
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            var displayInput = lazyStaticCombo.querySelector('input.ui-input');
            if (field.multiple === true || field.renderRule === 'ms') {
              var selectedStaticIds = String(field.value || '').split(',').map(function (value) { return value.trim(); }).filter(Boolean);
              var selectedStaticLabels = selectedStaticIds.map(function (value) {
                var selectedRow = staticData.find(function (r) { return String(r[0]) === value; });
                return selectedRow ? selectedRow[1] : value;
              });
              if (displayInput) displayInput.value = selectedStaticLabels.join(', ');
            } else {
              var matched = staticData.find(function (r) { return r[0] == field.value; });
              if (matched && displayInput) displayInput.value = matched[1];
            }

            hiddenInput.fetchDataForValue = function () {
              var displayInp = lazyStaticCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
              if (matched && displayInp) displayInp.value = matched[1];
              else if (displayInp) displayInp.value = hiddenInput.value || '';
            };

            formGroupWrapper.appendChild(lazyStaticCombo);
            inputEl = formGroupWrapper;
          } else {
            // Hiển thị tạm lúc đang tải
            var comboLoading = UIControls.createDataComboBox({
              placeholder: 'Đang tải...',
              headers: ['Mã', 'Tên'],
              data: [],
              colFilterIndex: 1
            });
            formGroupWrapper.appendChild(comboLoading);
            inputEl = formGroupWrapper;

            var endpointRaw = field.dataSource;
            var maxCols = 4; // Mặc định hiển thị 4 cột
            if (endpointRaw.indexOf('|') > -1) {
              var dsParts = endpointRaw.split('|');
              endpointRaw = dsParts[0];
              var parsedCols = parseInt(dsParts[1], 10);
              if (!isNaN(parsedCols) && parsedCols > 0) maxCols = parsedCols;
            }
            var finalUrl = '';
            var isGatewaySource = endpointRaw.indexOf('/') === -1 && !endpointRaw.startsWith('http');
            var fetchPayload = {};
            if (isGatewaySource) {
              // Nếu dataSource chỉ là tên danh mục (không chứa slash), tự động dùng Gateway Router
              fetchPayload = {};
            } else {
              var endpoint = endpointRaw.startsWith('http') ? endpointRaw : ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + endpointRaw);
              finalUrl = endpoint;
              if (endpoint.indexOf('?') > -1) {
                var parts = endpoint.split('?');
                finalUrl = parts[0];
                var searchParams = new URLSearchParams(parts[1]);
                searchParams.forEach(function (value, key) { fetchPayload[key] = value; });
              }
            }
            if (!fetchPayload.UserName) fetchPayload.UserName = _currentUser();

            var searchApiCall = function (q, page) {
              var payload = Object.assign({}, fetchPayload);
              var dynamicFilters = {};

              if (typeof currentModalFormState !== 'undefined') {
                var activeFilters = {};
                if (field.dependsOn) {
                  var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                  parents.forEach(function (p) {
                    if (currentModalFormState[p] !== undefined && currentModalFormState[p] !== null) {
                      activeFilters[p] = currentModalFormState[p];
                    }
                  });
                }
                if (isGatewaySource) {
                  dynamicFilters = Object.assign({}, activeFilters);
                } else {
                  payload = Object.assign(payload, activeFilters);
                }
              }

              var request = isGatewaySource
                ? GatewayClient.run({ sp: endpointRaw, func: 'View' }, dynamicFilters, {
                  keyword: q || '', page: page, payload: { UserName: fetchPayload.UserName }
                })
                : (field.dataSourceMethod === 'GET'
                  ? ApiClient.get(finalUrl)
                  : GatewayClient.run({ endpoint: finalUrl, transport: 'direct' }, payload, {
                    keyword: q || '', page: page
                  }));

              return request.then(function (res) {
                var dataList = res.list || res.records;
                var optionTable = _buildOptionTable(dataList || [], field, maxCols);
                comboLoading.dataset.lastKeys = JSON.stringify(optionTable.keys);
                optionTable.forceMultiColumn = optionTable.keys.length > 1;
                return optionTable;
              });
            };

            var lazyCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              multiple: field.multiple === true || field.renderRule === 'ms',
              initialValue: field.value,
              valueIndex: 0,
              forceMultiColumn: field.multiple === true || field.renderRule === 'ms',
              disabled: (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              showAddNew: field.allowCustomValue !== false && !(typeof MODULE_CONFIG !== 'undefined' && MODULE_CONFIG.HideAddNewInDropdowns),
              readonlyInput: field.allowCustomValue === false || field.multiple === true || field.renderRule === 'ms',
              onF2: function () {
                lazyCombo.querySelector('.ui-input').focus();
              },
              onSearch: searchApiCall,
              onChange: function (val) {
                hiddenInput.value = (field.multiple === true || field.renderRule === 'ms')
                  ? val
                  : (field.allowCustomValue === false ? '' : val);
              },
              onSelect: function (row) {
                if (field.multiple === true || field.renderRule === 'ms') {
                  hiddenInput.value = row;
                  hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                  return;
                }
                hiddenInput.value = row[0];

                // === AUTO FILL LOGIC ===
                // Lấy lại danh sách keys đã lưu
                var savedKeysStr = comboLoading.dataset.lastKeys;
                if (savedKeysStr) {
                  var keys = JSON.parse(savedKeysStr);
                  // Duyệt qua các cột trả về từ API
                  keys.forEach(function (keyName, index) {
                    // Tìm xem trong Form hiện tại có Input nào tên trùng với tên Cột không (case-insensitive)
                    var form = body;
                    if (form) {
                      var targetInput = form.querySelector('[name="' + keyName + '" i]');
                      if (targetInput && targetInput !== hiddenInput) {
                        // CHẶN AUTO FILL CHO KHÓA CHÍNH (HOẶC MÃ NHÂN VIÊN) KHI ĐANG Ở CHẾ ĐỘ SỬA (EDIT)
                        if (isEdit && (
                          keyName.toUpperCase() === (MODULE_CONFIG.PrimaryKey || '').toUpperCase() ||
                          keyName.toUpperCase() === 'PERSONID' ||
                          keyName.toUpperCase() === 'NEWPERSONID'
                        )) {
                          return; // Bỏ qua không tự động ghi đè mã
                        }

                        // Điền giá trị
                        targetInput.value = row[index] || '';
                        // Kích hoạt sự kiện để UI update (nếu là ô chọn ngày, số lượng...)
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                        // Nếu trường được Auto-Fill là một Combobox khác, ta cần gọi nó tải lại text hiển thị!
                        if (typeof targetInput.fetchDataForValue === 'function') {
                          targetInput.fetchDataForValue();
                        }
                      }
                    }
                  });
                }
                // =======================

                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            if (field.value) {
              searchApiCall('', 1).then(function (res) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (field.multiple === true || field.renderRule === 'ms') {
                  var selectedIds = String(field.value).split(',').map(function (value) { return value.trim(); }).filter(Boolean);
                  var selectedLabels = selectedIds.map(function (value) {
                    var selectedRow = res.data.find(function (r) { return String(r[0]) === value; });
                    return selectedRow ? selectedRow[res.colFilterIndex !== undefined ? res.colFilterIndex : 1] : value;
                  });
                  if (displayInput) displayInput.value = selectedLabels.join(', ');
                  return;
                }
                var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
                if (matched && displayInput) displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                else if (displayInput) displayInput.value = field.value; // Fallback
              }).catch(function (err) {
                console.error('[DynamicFormEngine] DataComboBox initial fetch error:', err);
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }

            // Expose hàm để Auto-Fill gọi lại nhằm cập nhật Text
            hiddenInput.fetchDataForValue = function () {
              if (hiddenInput.value) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = 'Đang tải...';
                searchApiCall('', 1).then(function (res) {
                  var displayInp = lazyCombo.querySelector('input.ui-input');
                  var matched = res.data.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
                  if (matched && displayInp) displayInp.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                  else if (displayInp) displayInp.value = hiddenInput.value; // Fallback
                });
              } else {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = '';
              }
            };

            formGroupWrapper.replaceChild(lazyCombo, comboLoading);
          }
        } else {
          var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
          formGroupWrapper.appendChild(comboEmpty);
          inputEl = formGroupWrapper;
        }
      } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
        inputEl = UIInput.createNumber(field);
      } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
        var wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          wrapper.appendChild(lbl);
        }
        var flexDiv = document.createElement('div');
        flexDiv.style.display = 'flex';
        flexDiv.style.gap = '8px';

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ui-input';
        input.name = field.name;
        input.value = field.value || '';
        input.placeholder = 'Click [Thiết lập] để chọn điều kiện';
        input.readOnly = true;
        input.style.flex = '1';

        var btnWrapper = document.createElement('div');
        btnWrapper.innerHTML = UIButton.createHTML({ text: 'Thiết lập', type: 'secondary', icon: 'settings' });
        var btn = btnWrapper.firstElementChild;
        btn.onclick = function (e) {
          e.preventDefault();
          if (typeof RuleBuilderDialog !== 'undefined') {
            var formNameVal = row ? (row.FormName || row.formName || row.FORMNAME) : '';
            if (!formNameVal && typeof currentModalFormState !== 'undefined') formNameVal = currentModalFormState['FormName'] || '';
            if (!formNameVal) {
              var fnInput = document.querySelector('input[name="FormName"], select[name="FormName"]');
              if (fnInput) formNameVal = fnInput.value;
            }

            RuleBuilderDialog.open({
              currentRule: input.value,
              targetFormName: formNameVal,
              onSave: function (newRule) {
                input.value = newRule;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          } else {
            Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
          }
        };

        flexDiv.appendChild(input);
        flexDiv.appendChild(btn);
        wrapper.appendChild(flexDiv);
        inputEl = wrapper;
      } else if (field.renderRule === 'html' || field.renderRule === 'component') {
        var htmlWrapper = document.createElement('div');
        htmlWrapper.style.width = '100%';
        var componentCode = field.componentCode || field.ComponentCode;
        if (componentCode && FieldRendererRegistry.has(componentCode)) {
          var renderedComponent = DynamicFormRenderer.renderComponent(componentCode, { field: field, row: row, container: htmlWrapper });
          if (renderedComponent && renderedComponent.nodeType) htmlWrapper.appendChild(renderedComponent);
        } else {
          LegacyCompatibility.renderLegacyHtml(htmlWrapper, field.html || '', field.name);
        }
        inputEl = htmlWrapper;
      } else {
        inputEl = UIInput.createText(field);
      }

      // Áp dụng kích thước FlexBox từ field.position
      if (isViewMode || (isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) {
        var innerFields = inputEl.querySelectorAll('input, select, textarea, button');
        if (innerFields.length > 0) {
          innerFields.forEach(function (el) { el.disabled = true; });
        } else if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(inputEl.tagName)) {
          inputEl.disabled = true;
        }
        inputEl.classList.add('ui-input-disabled');
      }
      var span = String(field.position || 'body');
      if (span.indexOf('|') > -1) {
        span = span.split('|')[1] || '12';
      }
      if (MODULE_CONFIG.IsFullPageDetail && (span === 'grid' || span === '6')) {
        span = '3';
      } else if (span === 'grid') {
        span = '6';
      }
      if (span === 'body') span = '12';
      if (!['12', '8', '6', '4', '3', '2', '1-7'].includes(span)) span = '12';

      var targetGrid = grid;
      if (isGrouped) {
        targetGrid = groupContainers[field.name.toLowerCase()];
        if (!targetGrid) {
          targetGrid = ungroupedGrid;
          targetGrid.parentElement.style.display = 'block'; // show the "other" card if needed
        }
      }

      if (childToParent[field.name]) {
        var parentName = childToParent[field.name];
        var parentFlexGroup = parentWrappers[parentName];
        if (parentFlexGroup) {
          var childWrapper = document.createElement('div');
          childWrapper.className = 'child-field-wrapper';
          childWrapper.style.flex = '1';
          childWrapper.style.minWidth = '0'; // Bù chiều ngang cho các Combobox
          childWrapper.style.transition = 'all 0.25s cubic-bezier(0.16,1,0.3,1)';

          // Ẩn label để form gọn gàng, đưa label vào placeholder (Không hardcode, hỗ trợ kế thừa)
          var labels = inputEl.querySelectorAll('label');
          labels.forEach(function (l) { l.style.display = 'none'; });

          var fGroups = inputEl.querySelectorAll('.form-group');
          fGroups.forEach(function (fg) { fg.style.marginBottom = '0'; });
          if (inputEl.classList && inputEl.classList.contains('form-group')) {
            inputEl.style.marginBottom = '0';
          }

          var isSelect = field.renderRule === 'sl' || field.renderRule === 'select' || field.dataSource;
          var prefix = isSelect ? 'Chọn ' : 'Nhập ';
          var inps = inputEl.querySelectorAll('input:not([type="hidden"]), select, textarea');
          inps.forEach(function (inp) {
            if (inp.placeholder === '-- Vui lòng chọn --' || inp.placeholder === 'Nhập...' || !inp.placeholder) {
              // Xóa chữ "Vui lòng chọn" thay bằng "Chọn [Tên field]"
              var lblText = (field.label || '').trim().toLowerCase();
              if (lblText) {
                inp.placeholder = prefix + lblText;
              }
            }
          });

          childWrapper.appendChild(inputEl);
          parentFlexGroup.appendChild(childWrapper);
        }
      } else if (parentFields[field.name]) {
        var wrapper = document.createElement('div');
        wrapper.className = 'df-col-' + span;
        if (field.visibleRule) wrapper.dataset.visibleRule = field.visibleRule;

        var flexGroup = document.createElement('div');
        flexGroup.style.display = 'flex';
        flexGroup.style.flexWrap = 'nowrap';
        flexGroup.style.gap = '12px';
        flexGroup.style.alignItems = 'center';
        flexGroup.style.width = '100%';
        flexGroup.style.padding = '8px 12px';
        flexGroup.style.background = 'var(--color-surface, #fff)';
        flexGroup.style.border = '1px solid var(--color-border, #e2e8f0)';
        flexGroup.style.borderRadius = '8px';

        var parentInputWrapper = document.createElement('div');
        parentInputWrapper.style.flexShrink = '0';
        parentInputWrapper.style.minWidth = '90px';
        parentInputWrapper.appendChild(inputEl);
        flexGroup.appendChild(parentInputWrapper);

        parentWrappers[field.name] = flexGroup;
        wrapper.appendChild(flexGroup);
        targetGrid.appendChild(wrapper);

        setTimeout(function () {
          var parentCb = parentInputWrapper.querySelector('input[type="checkbox"]');
          if (parentCb) {
            var toggleChildren = function (isAutoChange) {
              var isChecked = parentCb.checked;
              var childEls = flexGroup.querySelectorAll('.child-field-wrapper');
              childEls.forEach(function (ce) {
                if (isChecked) {
                  ce.style.opacity = '1';
                  ce.style.pointerEvents = 'auto';
                } else {
                  ce.style.opacity = '0.4';
                  ce.style.pointerEvents = 'none';
                  if (isAutoChange === true && !isViewMode) {
                    var select = ce.querySelector('select');
                    if (select) { select.value = ''; select.dispatchEvent(new Event('change')); }
                    var input = ce.querySelector('input:not([type="hidden"])');
                    if (input) { input.value = ''; input.dispatchEvent(new Event('change')); }
                    var select2 = ce.querySelector('.select2-hidden-accessible');
                    if (select2 && window.$) { $(select2).val('').trigger('change'); }
                  }
                }
              });
            };
            parentCb.addEventListener('change', function () { toggleChildren(true); });
            toggleChildren(false);
          }
        }, 100);

      } else {
        var wrapper = document.createElement('div');
        wrapper.className = 'df-col-' + span;
        if (field.visibleRule) wrapper.dataset.visibleRule = field.visibleRule;
        wrapper.appendChild(inputEl);
        targetGrid.appendChild(wrapper);
      }

      // Gán giá trị mặc định vào currentModalFormState
      currentModalFormState[field.name] = field.value || '';
    });

    // Áp VisibleRule: show/hide fields theo cấu hình trong SY_FormatFields.VisibleRule
    if (typeof UIControls !== 'undefined' && UIControls.utils && UIControls.utils.applyVisibleRules) {
      UIControls.utils.applyVisibleRules(body);
    }

    // Xử lý Disable ban đầu cho các trường có DependsOn nếu BẤT KỲ trường cha nào đang trống
    globalFormSchema.forEach(function (f) {
      if (f.dependsOn) {
        var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
        var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
        if (hasEmptyParent) {
          var childInput = body.querySelector('input[name="' + f.name + '"]');
          if (childInput) {
            var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
            if (comboWrap) {
              var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
              allInps.forEach(function (el) { el.disabled = true; });
              comboWrap.classList.add('ui-input-disabled');
            }
          }
        }
      }
    });

    // Lắng nghe sự kiện thay đổi để xử lý Phụ thuộc (Dependencies)
    body.addEventListener('change', function (e) {
      var changedName = e.target.name;
      if (changedName) {
        currentModalFormState[changedName] = e.target.value;

        // 1. Tính toán giá trị tự động (FormulaRule)
        globalFormSchema.forEach(function (f) {
          if (f.formulaRule) {
            try {
              var result = SafeFormulaEvaluator.evaluate(f.formulaRule, currentModalFormState);
              if (!isNaN(result) && isFinite(result)) {
                var targetInput = body.querySelector('input[name="' + f.name + '"]');
                if (targetInput && targetInput.value != result) {
                  targetInput.value = result;
                  currentModalFormState[f.name] = result;
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            } catch (formulaError) {
              console.warn('[DynamicForm] Unsupported FormulaRule for ' + f.name, formulaError.message);
            }
          }
        });

        // 2. Trigger API (Gọi API ngoài)
        var changedSchema = globalFormSchema.find(function (s) { return s.name === changedName; });
        if (changedSchema && changedSchema.triggerApi && e.target.value) {
          var apiEndpoint = changedSchema.triggerApi;
          var payload = Object.assign({}, currentModalFormState);
          ApiClient.post(apiEndpoint, payload).then(function (res) {
            var dataList = res.list || res.records || [];
            if (dataList && dataList.length > 0) {
              var row = dataList[0];
              Object.keys(row).forEach(function (keyName) {
                var targetInput = body.querySelector('[name="' + keyName + '" i]');
                if (targetInput && targetInput.name !== changedName) {
                  targetInput.value = row[keyName] || '';
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          }).catch(function () { });
        }

        // 3. Tìm các trường phụ thuộc vào trường vừa đổi (DependsOn)
        globalFormSchema.forEach(function (f) {
          if (f.dependsOn) {
            var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
            if (parents.includes(changedName)) {
              currentModalFormState[f.name] = ''; // Reset state
              var childInput = body.querySelector('input[name="' + f.name + '"]');
              if (childInput) {
                childInput.value = ''; // Xóa value ẩn
                // Xóa luôn giá trị hiển thị trên màn hình nếu là combobox
                var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
                if (comboWrap) {
                  var displayInp = comboWrap.querySelector('input.ui-input');
                  if (displayInp) displayInp.value = '';

                  // Khóa/Mở khóa ô con dựa trên việc CÓ BẤT KỲ ô cha nào đang trống hay không
                  var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
                  var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
                  allInps.forEach(function (el) { el.disabled = hasEmptyParent; });

                  if (hasEmptyParent) comboWrap.classList.add('ui-input-disabled');
                  else comboWrap.classList.remove('ui-input-disabled');
                }
                // Kích hoạt tiếp sự kiện change của thằng con để trigger chuỗi phụ thuộc (nếu có thằng cháu)
                childInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
        });
      }
    });

    // ── DETAIL TABS (Master-Detail panel) ──────────────────────────────────
    // Khi MODULE_CONFIG.DetailTabs được cấu hình, tự động vẽ thêm tab chi tiết bên dưới form master
    var hasEditableTab = MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.some(function (t) { return t.editable; });
    if (row && !MODULE_CONFIG.hideDetailTabsInEditMode && (!MODULE_CONFIG.HideDetailTabsInModal || MODULE_CONFIG.IsFullPageDetail) && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0 && (isEdit || hasEditableTab)) {
      var tabsContainer = document.createElement('div');
      tabsContainer.className = 'detail-tabs-container';
      tabsContainer.style.marginTop = '16px';
      tabsContainer.style.borderTop = '1px solid var(--color-border)';
      tabsContainer.style.paddingTop = '12px';

      // Tab nav bar
      var tabNav = document.createElement('div');
      tabNav.className = 'hide-scrollbar';
      tabNav.style.cssText = 'display: flex; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border); overflow-x: auto; -webkit-overflow-scrolling: touch;';

      // Tab content panels
      var tabPanels = [];
      body._detailPanels = [];

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        // Tab button
        var tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.textContent = tab.label;
        tabBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; font-family: inherit;';

        var isActive = (idx === 0);
        if (isActive) {
          tabBtn.style.backgroundColor = 'var(--color-primary)';
          tabBtn.style.color = '#ffffff';
          tabBtn.style.fontWeight = '600';
          tabBtn.style.boxShadow = 'var(--shadow-sm)';
        } else {
          tabBtn.style.backgroundColor = 'transparent';
          tabBtn.style.color = 'var(--color-text-secondary)';

          tabBtn.onmouseover = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'var(--color-surface)';
            this.style.color = 'var(--color-text)';
          };
          tabBtn.onmouseout = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'transparent';
            this.style.color = 'var(--color-text-secondary)';
          };
        }

        // Tab panel
        var panel = document.createElement('div');
        panel.style.display = idx === 0 ? 'block' : 'none';
        panel.style.minHeight = '120px';
        panel.style.overflowX = 'auto';
        panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';

        tabPanels.push({ btn: tabBtn, panel: panel });
        body._detailPanels.push(panel);

        tabBtn.onclick = function () {
          tabPanels.forEach(function (t, i) {
            var isNowActive = (i === idx);
            t.panel.style.display = isNowActive ? 'block' : 'none';
            if (isNowActive) {
              t.btn.style.backgroundColor = 'var(--color-primary)';
              t.btn.style.color = '#ffffff';
              t.btn.style.fontWeight = '600';
              t.btn.style.boxShadow = 'var(--shadow-sm)';
            } else {
              t.btn.style.backgroundColor = 'transparent';
              t.btn.style.color = 'var(--color-text-secondary)';
              t.btn.style.fontWeight = '500';
              t.btn.style.boxShadow = 'none';
            }
          });
        };

        tabNav.appendChild(tabBtn);
        tabPanels[tabPanels.length - 1]._loaded = false;
      });

      tabsContainer.appendChild(tabNav);

      // Render Editable Grid inside Tab Panel
      function _renderEditableGrid(tabDef, panel) {
        panel.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.style.cssText = 'overflow-x: auto; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; background: var(--color-surface);';

        var t = document.createElement('table');
        t.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto;';

        var thead = document.createElement('thead');
        var trH = document.createElement('tr');
        trH.style.cssText = 'background: var(--color-background); border-bottom: 2px solid var(--color-border);';

        var keys = tabDef.fields;

        // Headers
        keys.forEach(function (k) {
          var th = document.createElement('th');
          var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
          th.textContent = label;
          th.style.cssText = 'padding: 10px 12px; font-weight: 700; color: var(--color-text); background-color: var(--color-surface-elevated); text-align: left; white-space: nowrap;';
          trH.appendChild(th);
        });

        // Add action header (for Delete button)
        var thAction = document.createElement('th');
        thAction.style.cssText = 'padding: 10px 12px; width: 50px; text-align: center;';
        if (!isViewMode) {
          trH.appendChild(thAction);
        }
        thead.appendChild(trH);
        t.appendChild(thead);

        var tbody = document.createElement('tbody');

        panel._currentRows.forEach(function (currRow, rIdx) {
          var tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid var(--color-border); transition: background-color 0.2s;';
          tr.onmouseover = function () { this.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'; };
          tr.onmouseout = function () { this.style.backgroundColor = ''; };

          // Pass 1: Tạo tất cả các td và lưu vào cellMap để closure onSelect có thể tham chiếu trực tiếp
          var cellMap = {};
          keys.forEach(function (k) {
            var td = document.createElement('td');
            td.style.cssText = 'padding: 6px 12px; vertical-align: middle; position: relative;';
            td.setAttribute('data-field', k);
            cellMap[k] = td;
            tr.appendChild(td);
          });

          // Pass 2: Điền nội dung vào từng td
          keys.forEach(function (fName) {
            var td = cellMap[fName];

            var lConf = (tabDef.lookupConfig && tabDef.lookupConfig[fName]) || null;

            if (lConf) {
              var lookupRecords = [];

              var combo = UIControls.createDataComboBox({
                placeholder: 'Chọn...',
                headers: lConf.headers || ['Mã', 'Tên'],
                colFilterIndex: lConf.colFilterIndex || 0,
                forceMultiColumn: lConf.forceMultiColumn !== false,
                onSearch: function (q) {
                  var lookupContext = _createActionContext({
                    row: currRow,
                    values: Object.assign({}, row || {}, currRow || {}),
                    compatibility: { masterRow: row, panel: panel, tabDef: tabDef }
                  });
                  var lookupData = {};
                  if (typeof lConf.getPayload === 'function') {
                    Object.assign(lookupData, lConf.getPayload(lookupContext) || {});
                  }

                  var lookupRequest = lConf.operation
                    ? GatewayClient.runModuleOperation(MODULE_CONFIG, lConf.operation, lookupData, { keyword: q })
                    : GatewayClient.run({ sp: lConf.apiList, func: 'View' }, lookupData, { keyword: q });
                  return lookupRequest.then(function (res) {
                    var list = res ? (res.list || res.records || (Array.isArray(res) ? res : [])) : [];
                    lookupRecords = list;
                    var dataList = list.map(function (d) {
                      if (typeof lConf.mapData === 'function') return lConf.mapData(d, {}, true);
                      var columns = lConf.columns || [fName];
                      return columns.map(function (field) { return d[field] !== undefined ? d[field] : ''; });
                    });

                    return {
                      headers: lConf.headers || ['Mã', 'Tên'],
                      data: dataList,
                      colFilterIndex: lConf.colFilterIndex || 0
                    };
                  });
                },
                onSelect: function (selectedData) {
                  var selectedVal = selectedData[lConf.colFilterIndex || 0];

                  // Kiểm tra trùng lặp
                  var isDuplicate = panel._currentRows.some(function (row, index) {
                    return index !== rIdx && row[fName] === selectedVal;
                  });

                  if (isDuplicate) {
                    if (typeof Alert !== 'undefined') {
                      Alert.warning('Trùng lặp', 'Dữ liệu này đã được chọn trong danh sách!');
                    } else if (typeof UIToast !== 'undefined') {
                      UIToast.show('Dữ liệu này đã được chọn!', 'warning');
                    } else {
                      alert('Dữ liệu này đã được chọn!');
                    }
                    if (displayInp) displayInp.value = '';
                    currRow[fName] = '';

                    Object.keys(lConf.fieldMapping || {}).forEach(function (targetField) {
                      currRow[targetField] = '';
                      if (cellMap[targetField]) cellMap[targetField].textContent = '';
                    });
                    return;
                  }

                  // Cập nhật dữ liệu hàng
                  currRow[fName] = selectedVal;

                  if (lConf.fieldMapping) {
                    var selectedRecord = lookupRecords.find(function (item) {
                      return String(item[lConf.keyField || fName]) === String(selectedVal);
                    }) || {};
                    Object.keys(lConf.fieldMapping).forEach(function (targetField) {
                      var value = selectedRecord[lConf.fieldMapping[targetField]];
                      currRow[targetField] = value !== undefined ? value : '';
                      if (!cellMap[targetField]) return;
                      var mappedInput = cellMap[targetField].querySelector('input');
                      if (mappedInput) mappedInput.value = currRow[targetField];
                      else cellMap[targetField].textContent = currRow[targetField];
                    });
                  } else if (typeof lConf.mapData === 'function') {
                    var gridRow = { _tr: tr };
                    lConf.mapData(selectedData, gridRow, false);
                    for (var key in gridRow) {
                      if (key !== '_tr') currRow[key] = gridRow[key];
                    }
                  }
                }
              });

              var displayInp = combo.querySelector('input.ui-input');
              if (displayInp) {
                displayInp.value = currRow[fName] || '';
                displayInp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
                if (isViewMode) displayInp.disabled = true;
              }
              combo.style.width = '160px';
              if (isViewMode) combo.style.pointerEvents = 'none';
              td.appendChild(combo);

            } else if (['PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon'].includes(fName)) {
              // Chỉ đọc — không cho chỉnh sửa, tự động điền khi chọn nhân viên
              td.textContent = currRow[fName] != null ? currRow[fName] : '';
              td.style.cssText += 'color: var(--color-text-secondary); font-style: italic;';

            } else {
              // Input text cho các trường còn lại
              var inp = document.createElement('input');
              inp.type = 'text';
              inp.value = currRow[fName] != null ? currRow[fName] : '';
              inp.placeholder = 'Nhập...';
              inp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
              if (isViewMode) inp.disabled = true;
              inp.addEventListener('input', function () {
                currRow[fName] = this.value;
              });

              // Hỗ trợ tính toán động nếu có cấu hình fieldEvents
              if (tabDef.fieldEvents && tabDef.fieldEvents[fName] && typeof tabDef.fieldEvents[fName].onChange === 'function') {
                inp.addEventListener('change', function () {
                  var actionContext = _createActionContext({
                    row: currRow,
                    values: Object.assign({}, row || {}, currRow || {}, { value: this.value, field: fName }),
                    reloadDetails: function () {
                      _renderEditableGrid(tabDef, panel);
                      return Promise.resolve(panel._currentRows);
                    },
                    compatibility: { masterRow: row, panel: panel, tabDef: tabDef }
                  });
                  tabDef.fieldEvents[fName].onChange(actionContext);
                });
              }

              td.appendChild(inp);
            }
          });

          // Cột hành động (Xóa dòng)
          var tdAction = document.createElement('td');
          tdAction.style.cssText = 'padding: 6px 12px; text-align: center; vertical-align: middle;';

          var btnDel = document.createElement('button');
          btnDel.type = 'button';
          btnDel.className = 'btn btn-sm btn-tool text-danger';
          btnDel.style.cssText = 'padding: 4px; border: none; background: transparent; cursor: pointer; border-radius: 4px;';
          btnDel.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">delete</span>';
          btnDel.onclick = function () {
            if (typeof ConfirmModal !== 'undefined') {
              ConfirmModal.show({
                title: 'Xác nhận xóa',
                message: 'Bạn có chắc muốn xóa dòng này không?',
                onConfirm: function () {
                  var detailPK = tabDef.rowIdField || 'id';
                  if (currRow[detailPK]) {
                    panel._deletedRows.push(currRow);
                  }
                  panel._currentRows.splice(rIdx, 1);
                  _renderEditableGrid(tabDef, panel);
                }
              });
            } else {
              var detailPK = tabDef.rowIdField || 'id';
              if (currRow[detailPK]) {
                panel._deletedRows.push(currRow);
              }
              panel._currentRows.splice(rIdx, 1);
              _renderEditableGrid(tabDef, panel);
            }
          };

          tdAction.appendChild(btnDel);
          if (!isViewMode) {
            tr.appendChild(tdAction);
          }
          tbody.appendChild(tr);
        });

        t.appendChild(tbody);
        wrap.appendChild(t);
        panel.appendChild(wrap);

        // Add Row Button below the grid
        if (!isViewMode) {
          var btnAddRow = document.createElement('button');
          btnAddRow.type = 'button';
          btnAddRow.className = 'btn btn-sm btn-outline-primary';
          btnAddRow.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer;';
          btnAddRow.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">add</span> Thêm dòng mới';
          btnAddRow.onclick = function () {
            var newRow = {};
            newRow[tabDef.filterField] = row[MODULE_CONFIG.PrimaryKey] || '';
            panel._currentRows.push(newRow);
            _renderEditableGrid(tabDef, panel);
          };
          panel.appendChild(btnAddRow);

          if (tabDef.customButtons && tabDef.customButtons.length > 0) {
            tabDef.customButtons.forEach(function (btnDef) {
              var cBtn = document.createElement('button');
              cBtn.type = 'button';
              cBtn.className = 'btn btn-sm ' + (btnDef.className || 'btn-outline-secondary');
              cBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer; margin-left: 10px;';
              if (btnDef.icon) {
                cBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">' + btnDef.icon + '</span> ' + (btnDef.label || '');
              } else {
                cBtn.textContent = btnDef.label || '';
              }
              cBtn.onclick = function () {
                if (typeof btnDef.onClick === 'function') {
                  btnDef.onClick(_createActionContext({
                    row: row,
                    values: Object.assign({}, row || {}, { detailRows: panel._currentRows }),
                    reloadDetails: function () {
                      _renderEditableGrid(tabDef, panel);
                      return Promise.resolve(panel._currentRows);
                    },
                    compatibility: {
                      panel: panel,
                      tabDef: tabDef,
                      MODULE_CONFIG: MODULE_CONFIG,
                      renderGrid: _renderEditableGrid
                    }
                  }));
                }
              };
              panel.appendChild(cBtn);
            });
          }
        }
      }

      // Load data function for each tab
      function _loadTabData(tabDef, panel) {
        if (tabDef.type === 'attachments') {
          _renderAttachmentsTab(tabDef, panel, true, row);
          return;
        }
        if (tabDef.editable) {
          panel._tabDef = tabDef;
          panel._initialRows = [];
          panel._currentRows = [];
          panel._deletedRows = [];

          var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
          var pkVal = row[pkField] || '';

          if (pkVal) {
            var filterData = {};
            filterData[tabDef.filterField || pkField] = pkVal;
            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';
            GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterData, {
              endpoint: MODULE_CONFIG.ApiSearch,
              limit: 500
            }).then(function (res) {
              var data = res.list || res.records || [];
              panel._initialRows = JSON.parse(JSON.stringify(data));
              panel._currentRows = JSON.parse(JSON.stringify(data));
              _renderEditableGrid(tabDef, panel);
            }).catch(function () {
              panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu chi tiết</div>';
            });
          } else {
            _renderEditableGrid(tabDef, panel);
          }
          return;
        }

        if (!tabDef.api) {
          panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;">(Chưa cấu hình API)</div>';
          return;
        }
        var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        GatewayClient.run({ sp: tabDef.api, func: 'View' }, filterData, {
          endpoint: MODULE_CONFIG.ApiSearch,
          limit: 500
        }).then(function (res) {
          var data = res.list || res.records || [];
          if (data.length === 0) {
            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Không có dữ liệu</div>';
            return;
          }
          // Build mini table
          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });
          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.maxHeight = '260px';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.width = '100%';
          t.style.borderCollapse = 'collapse';
          t.style.fontSize = '12px';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            th.textContent = label;
            th.style.cssText = 'padding:6px 8px;border-bottom:2px solid var(--color-border);background:var(--color-surface-elevated);position:sticky;top:0;text-align:left;white-space:nowrap;color:var(--color-text);font-weight:700;';
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--color-border)';
            keys.forEach(function (k) {
              var td = document.createElement('td');
              td.textContent = r[k] != null ? r[k] : '';
              td.style.cssText = 'padding:5px 8px;white-space:nowrap;';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          panel.innerHTML = '';
          panel.appendChild(wrap);
        }).catch(function () {
          panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu</div>';
        });
      }

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        var panel = tabPanels[idx].panel;
        tabsContainer.appendChild(panel);
        // Load first tab immediately, rest lazy
        if (idx === 0) {
          _loadTabData(tab, panel);
        } else {
          // Lazy load when tab is clicked
          tabPanels[idx].btn.addEventListener('click', function () {
            if (!tabPanels[idx]._loaded) {
              tabPanels[idx]._loaded = true;
              _loadTabData(tab, panel);
            }
          }, { once: true });
        }
      });

      body.appendChild(tabsContainer);
    }
    // ── END DETAIL TABS ──────────────────────────────────────────────────────

    // Footer buttons
    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = isViewMode ? 'Quay lại' : MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = isEdit ? MODULE_CONFIG.BtnSaveEdit : MODULE_CONFIG.BtnSaveAdd;

    var hasWritableFields = globalFormSchema.some(function (field) {
      var isVisible = isEdit ? (String(field.showInEdit) === '1' || field.showInEdit === true) : (String(field.showInAdd) === '1' || field.showInAdd === true);
      var isReadOnly = isViewMode || (isEdit ? field.isReadOnlyEdit : field.isReadOnlyAdd);
      return isVisible && !isReadOnly;
    });

    if (!hasWritableFields && !isViewMode) {
      btnSave.style.display = 'none';
      btnCancel.textContent = 'Đóng';
    }

    footer.appendChild(btnCancel);

    // Render custom footer buttons (khai báo trong MODULE_CONFIG.customFooterButtons)
    // Đây là extension point cho các form muốn thêm nút vào thanh thao tác mà không sửa Engine
    if (MODULE_CONFIG.customFooterButtons && MODULE_CONFIG.customFooterButtons.length > 0) {
      MODULE_CONFIG.customFooterButtons.forEach(function (btnDef) {
        var customBtn = document.createElement('button');
        customBtn.type = 'button';
        customBtn.className = 'btn ' + (btnDef.className || 'btn-outline-secondary');
        if (btnDef.icon) {
          customBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px; vertical-align: middle;">' + btnDef.icon + '</span> ' + (btnDef.label || '');
        } else {
          customBtn.textContent = btnDef.label || '';
        }
        if (typeof btnDef.onClick === 'function') {
          customBtn.onclick = function () {
            var values = _readActionValues(body, row);
            btnDef.onClick(_createActionContext({
              row: row,
              values: values,
              onSetValue: function (field, value) {
                var input = body.querySelector('[name="' + field + '"]');
                if (input) input.value = value;
              },
              save: function () {
                return new Promise(function (resolve) {
                  var handler = function (event) {
                    if (!event.detail || event.detail.formName !== MODULE_CONFIG.FormName) return;
                    document.removeEventListener('dynamicFormSaved', handler);
                    resolve(event.detail.data || row || {});
                  };
                  document.addEventListener('dynamicFormSaved', handler);
                  _saveData(isEdit, row, modal, body, btnSave);
                });
              },
              compatibility: { isEdit: isEdit, button: customBtn }
            }));
          };
        }
        footer.appendChild(customBtn);
      });
    }

    if (isViewMode && MODULE_CONFIG.CanEditOperation !== false) {
      var btnSwitchEdit = document.createElement('button');
      btnSwitchEdit.className = 'btn btn-primary';
      btnSwitchEdit.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px; vertical-align: middle;">edit</span> Sửa';
      footer.appendChild(btnSwitchEdit);
    } else {
      footer.appendChild(btnSave);
    }

    if (MODULE_CONFIG.IsFullPageDetail) {
      $container.innerHTML = '';

      var pageWrap = document.createElement('div');
      pageWrap.className = 'full-page-detail';
      pageWrap.style.cssText = 'padding: 24px; background: var(--color-surface, #fff); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); min-height: calc(100vh - 100px);';

      var header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);';
      var defaultTitle = 'Thông tin chi tiết';
      var baseTitle = MODULE_CONFIG.TitleView || MODULE_CONFIG.FormTitle || defaultTitle;
      var titleAddFallback = 'Thêm mới ' + baseTitle.toLowerCase();
      var titleEditFallback = 'Cập nhật ' + baseTitle.toLowerCase();

      var pageTitle = isViewMode ? baseTitle : (isEdit ? (MODULE_CONFIG.TitleEdit || titleEditFallback) : (MODULE_CONFIG.TitleAdd || titleAddFallback));
      header.innerHTML = '<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">' + pageTitle + '</h2>';

      footer.style.padding = '0';
      footer.style.border = 'none';
      header.appendChild(footer);

      pageWrap.appendChild(header);
      pageWrap.appendChild(body);
      $container.appendChild(pageWrap);

      var globalActions = document.getElementById('global-page-actions');
      if (globalActions) globalActions.style.display = 'none';

      var dummyModal = {
        close: function () {
          if (globalActions) globalActions.style.display = '';
          MODULE_CONFIG.DetailRowData = null;
          $container.innerHTML = '';
          if (window.location.hash.indexOf('#/detail') === 0) {
            window.history.back();
          } else {
            _loadData();
          }
        },
        closeNow: function (savedRowData) {
          if (globalActions) globalActions.style.display = '';
          if (savedRowData) {
            MODULE_CONFIG.DetailRowData = Object.assign({}, MODULE_CONFIG.DetailRowData || {}, savedRowData);
            try {
              sessionStorage.setItem('HR_Detail_Row_' + MODULE_CONFIG.FormName, JSON.stringify(MODULE_CONFIG.DetailRowData));
            } catch (e) { }
          } else {
            MODULE_CONFIG.DetailRowData = null;
          }
          $container.innerHTML = '';
          _loadData();
        }
      };
      btnCancel.onclick = function () {
        if (isViewMode) {
          dummyModal.close();
        } else if (isEdit) {
          _openModal(true, row, true); // Switch back to View mode
        } else {
          dummyModal.close();
        }
      };
      btnSave.onclick = function () { _saveData(isEdit, row, dummyModal, body, btnSave); };
      if (isViewMode && btnSwitchEdit) {
        btnSwitchEdit.onclick = function () { _openModal(true, row, false); };
      }
    } else {
      var defaultTitle = 'Thông tin chi tiết';
      var baseTitle = MODULE_CONFIG.TitleView || MODULE_CONFIG.FormTitle || defaultTitle;
      var titleAddFallback = 'Thêm mới ' + baseTitle.toLowerCase();
      var titleEditFallback = 'Cập nhật ' + baseTitle.toLowerCase();

      var modalTitle = isViewMode ? baseTitle : (isEdit ? (MODULE_CONFIG.TitleEdit || titleEditFallback) : (MODULE_CONFIG.TitleAdd || titleAddFallback));
      var modal = UIModal.show({
        title: modalTitle,
        width: MODULE_CONFIG.ModalWidth,
        content: body,
        footer: footer
      });

      btnCancel.onclick = function () { modal.close(); };
      btnSave.onclick = function () {
        _saveData(isEdit, row, modal, body, btnSave);
      };
      if (isViewMode && btnSwitchEdit) {
        btnSwitchEdit.onclick = function () { modal.closeNow(); _openModal(true, row, false); };
      }
    }

    // Focus ô nhập liệu đầu tiên (không bị ẩn)
    setTimeout(function () {
      var first = body.querySelector('input:not([type="hidden"])');
      if (first) first.focus();
    }, 100);
  }

  function _saveGridData(rows, modal, body, btnSave, isAdd) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    btnSave.disabled = true;
    btnSave.textContent = MODULE_CONFIG.BtnSaveSaving;

    var payloads = [];
    rows.forEach(function (targetRow, rowIdx) {
      var payload = _buildPayload(targetRow, !isAdd);

      var inputs = body.querySelectorAll('input[data-row-index="' + rowIdx + '"], select[data-row-index="' + rowIdx + '"], textarea[data-row-index="' + rowIdx + '"]');
      var hasData = false;
      inputs.forEach(function (el) {
        var fieldName = el.getAttribute('data-field-name');
        var val = el.value.trim();
        if (fieldName) {
          payload[fieldName] = val;
          if (val && fieldName !== MODULE_CONFIG.PrimaryKey && fieldName !== 'OrderNo') {
            hasData = true;
          }
        }
      });

      if (isAdd) {
        if (hasData) payloads.push(payload);
      } else {
        payloads.push(payload);
      }
    });

    if (payloads.length === 0) {
      Alert.warning(MODULE_CONFIG.AlertTitleInfo, 'Không có dữ liệu hợp lệ để lưu.');
      _setBtnLoading(btnSave, false);
      return;
    }

    // Gọi API tuần tự
    _sendSequential(
      GatewayClient.resolveModuleOperation(MODULE_CONFIG, 'save'),
      payloads,
      { payload: { UserName: _currentUser() } },
      function (count) {             // onDone
        modal.closeNow();
        Alert.success('Thành công', 'Đã lưu xong ' + count + ' dòng!');
        if (!isAdd) selectedRows = [];
        if (_isFormBuilder()) {
          window._uiConfigCache = {};
          $container.innerHTML = '';
          render($container, MODULE_CONFIG);
        } else {
          _updateSelectionCounter();
          _loadData();
        }
      },
      function (err) {               // onError → tiếp tục
        console.error('Grid Edit Error', err);
      }
    );
  }

  // ── Save ──────────────────────────────────────────────────
  function _saveData(isEdit, rowData, modal, body, btnSave) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    // 1.4 Kiểm tra các trường bắt buộc trong lưới chi tiết (Detail Tabs) trước khi lưu
    if (body._detailPanels) {
      var isDetailInvalid = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var tabDef = panel._tabDef;
          var keyField = tabDef.requiredFields && tabDef.requiredFields[0] || tabDef.fields[0];
          for (var r = 0; r < panel._currentRows.length; r++) {
            var val = panel._currentRows[r][keyField];
            if (val === undefined || val === null || String(val).trim() === '') {
              var label = tabDef.label || 'Danh sách chi tiết';
              var headerLabel = (tabDef.headers && tabDef.headers[keyField]) || keyField;
              if (typeof Alert !== 'undefined') {
                Alert.warning('Thiếu thông tin', 'Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              } else {
                alert('Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              }
              isDetailInvalid = true;
              break;
            }
          }
        }
        if (isDetailInvalid) break;
      }
      if (isDetailInvalid) return;
    }

    // 1.5 Kiểm tra trùng lặp trong lưới chi tiết trước khi tiến hành lưu
    if (body._detailPanels) {
      var hasDuplicate = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var duplicateKeys = panel._tabDef.duplicateKeys || [];
          var seen = {};
          for (var r = 0; r < panel._currentRows.length && duplicateKeys.length; r++) {
            var duplicateValue = duplicateKeys.map(function (field) {
              return String(panel._currentRows[r][field] || '').trim().toLowerCase();
            }).join('|');
            if (!duplicateValue) continue;
            if (seen[duplicateValue]) { hasDuplicate = true; break; }
            seen[duplicateValue] = true;
          }
        }
        if (hasDuplicate) break;
      }
      if (hasDuplicate) return;
    }

    // 1. Quét Form: Thu thập các giá trị người dùng vừa gõ vào, loại bỏ các input thuộc lưới chi tiết
    var formInputData = {};
    var inputs = body.querySelectorAll('input, select, textarea');
    inputs.forEach(function (el) {
      if (el.name) {
        if (el.closest('.detail-tabs-container') || el.closest('.detail-tab-content') || el.closest('table')) {
          if (!el.closest('.detail-form-wrap')) {
            return;
          }
        }
        formInputData[el.name] = el.value.trim();
      }
    });

    // 2. Validate Required và ValidateRule
    var isInvalid = false;
    for (var i = 0; i < globalFormSchema.length; i++) {
      var field = globalFormSchema[i];
      var val = formInputData[field.name];

      // Hỗ trợ Partial Update (ví dụ từ WizardForm truyền fakeBody chỉ chứa các trường thay đổi)
      // Nếu trường không có trong formInputData nhưng có trong rowData (dữ liệu cũ), ta dùng tạm để pass Validate
      if (val === undefined && isEdit && rowData && rowData[field.name] !== undefined) {
        val = rowData[field.name];
      }

      if (field.required && !val) {
        Alert.warning(MODULE_CONFIG.WarnMissingInfo, MODULE_CONFIG.WarnMissingInput.replace('{0}', field.label));
        isInvalid = true;
        break;
      }
      if (val && field.validateRule) {
        var rules = field.validateRule.split('|').map(function (r) { return r.trim(); });
        for (var j = 0; j < rules.length; j++) {
          var rawRule = rules[j];
          var rule = rawRule.toLowerCase();
          if (!rule || rule.startsWith('formula:') || rule.startsWith('trigger:')) continue;

          if (rule.startsWith('min:')) {
            var min = parseInt(rule.split(':')[1]);
            if (val.length < min) { Alert.warning('Lỗi nhập liệu', field.label + ' phải có ít nhất ' + min + ' ký tự'); isInvalid = true; break; }
          } else if (rule.startsWith('max:')) {
            var max = parseInt(rule.split(':')[1]);
            if (val.length > max) { Alert.warning('Lỗi nhập liệu', field.label + ' không được vượt quá ' + max + ' ký tự'); isInvalid = true; break; }
          } else if (rule === 'email') {
            var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng Email'); isInvalid = true; break; }
          } else if (rule === 'phone') {
            var phoneRe = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
            if (!phoneRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng số điện thoại'); isInvalid = true; break; }
          } else if (rule === 'number') {
            var numRe = /^\d+$/;
            if (!numRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' chỉ được phép nhập số'); isInvalid = true; break; }
          } else if (rule === 'cccd') {
            var cccdRe = /^\d{9}(\d{3})?$/;
            if (!cccdRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 9 hoặc 12 số (CMND/CCCD)'); isInvalid = true; break; }
          } else if (rule === 'url') {
            var urlRe = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng đường dẫn trang web'); isInvalid = true; break; }
          } else if (rule === 'taxcode') {
            var taxRe = /^\d{10}(-\d{3})?$/;
            if (!taxRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 10 hoặc 13 số (Mã số thuế)'); isInvalid = true; break; }
          } else if (rule.startsWith('minval:')) {
            var minVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) < minVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ' + minVal); isInvalid = true; break; }
          } else if (rule.startsWith('maxval:')) {
            var maxVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) > maxVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ' + maxVal); isInvalid = true; break; }
          } else if (rule.startsWith('regex:')) {
            var reStr = rawRule.substring(6); // Dùng rawRule để không bị mất chữ Hoa/Thường của Regex
            try {
              var re = new RegExp(reStr);
              if (!re.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng yêu cầu'); isInvalid = true; break; }
            } catch (e) { console.error('Lỗi Regex:', e); }
          } else if (rule.startsWith('gt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) <= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) >= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('gte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) < parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) > parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          }
        }
        if (isInvalid) break;
      }
    }
    if (isInvalid) return;

    // 3. Lưu — bật loading, tắt khi xong (dùng _setBtnLoading thóat khỏi duplicate)
    _setBtnLoading(btnSave, true);
    var _restoreSaveBtn = function () { _setBtnLoading(btnSave, false); };

    // 4. Xây dựng danh sách Payload
    var payloads = [];
    var singlePayload = _buildPayload(formInputData, isEdit);
    singlePayload.OrderNo = rowData && rowData.OrderNo ? rowData.OrderNo : 0;

    if (isEdit && rowData && MODULE_CONFIG.PrimaryKey) {
      var pkKey = MODULE_CONFIG.PrimaryKey;
      if (singlePayload[pkKey] !== undefined && singlePayload[pkKey] !== rowData[pkKey]) {
        singlePayload['Old' + pkKey] = rowData[pkKey];
      }
      if (!singlePayload[pkKey]) {
        singlePayload[pkKey] = rowData[pkKey];
      }
    }
    payloads.push(singlePayload);

    if (payloads.length === 0) { modal.closeNow(); return; }

    // Helper finalize save
    function _finalizeSave(isEdit, modal) {
      if (window._pendingWizardAvatar) {
        if (!MODULE_CONFIG.AttachmentApi) {
          Alert.success('Thành công', 'Cập nhật hồ sơ thành công (chưa cấu hình lưu ảnh)!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
          return;
        }

        var attachmentConfig = MODULE_CONFIG.attachments.default;
        var attachmentOwnerField = attachmentConfig.ownerField || MODULE_CONFIG.PrimaryKey;
        var masterKeyVal = formInputData[attachmentOwnerField] || (rowData && rowData[attachmentOwnerField]);
        var attachApi = attachmentConfig.sp;

        var avatarData = {
            IsEdit: 0,
            FileName: window._pendingWizardAvatar.file.name,
            FileType: 1, // 1 = Avatar
            STT: 2,
            FileSize: window._pendingWizardAvatar.file.size,
            Base64Content: window._pendingWizardAvatar.base64Content,
            Content: window._pendingWizardAvatar.hexStr
        };
        avatarData[attachmentOwnerField] = masterKeyVal;

        GatewayClient.run({ sp: attachApi, func: 'SaveAvatar' }, avatarData, {
          payload: { UserName: _currentUser() }
        }).then(function () {
          if (singlePayload && window._pendingWizardAvatar) {
            singlePayload.Content = window._pendingWizardAvatar.hexStr;
            singlePayload.FileName = window._pendingWizardAvatar.file.name;
          }
          window._pendingWizardAvatar = null;
          Alert.success('Thành công', 'Cập nhật hồ sơ và ảnh đại diện thành công!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
        }).catch(function () {
          window._pendingWizardAvatar = null;
          Alert.warning('Cảnh báo', 'Lưu hồ sơ thành công nhưng không lưu được ảnh!');
          modal.closeNow(singlePayload);
          _postFinalizeSave();
        });
      } else {
        Alert.success('Thành công', isEdit ? MODULE_CONFIG.ToastEdit : MODULE_CONFIG.ToastAdd);
        modal.closeNow(singlePayload);
        _postFinalizeSave();
      }

      function _postFinalizeSave() {
        // Broadcast sự kiện lưu thành công để các form có thể hook vào (ví dụ: chạy SP ngay sau khi lưu)
        document.dispatchEvent(new CustomEvent('dynamicFormSaved', {
          detail: { formName: MODULE_CONFIG.FormName, data: singlePayload, isEdit: isEdit }
        }));

        if (MODULE_CONFIG.IsFullPageDetail) return; // Không cần load lại dữ liệu nếu là trang Detail (vì nó sẽ tự navigate back về Grid)
        if (_isFormBuilder()) {
          window._uiConfigCache = {}; // Cache Invalidate
          selectedRows = [];
          $container.innerHTML = '';
          render($container, MODULE_CONFIG);
        } else {
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        }
      }
    }

    // 5. Gọi API Lưu
    GatewayClient.runModuleOperation(MODULE_CONFIG, 'save', payloads[0], {
      payload: { UserName: _currentUser() }
    })
      .then(function (res) {
        if (res && res.code === 0) {
          // Master save succeeded! Now save/delete details.
          var detailApiCalls = [];

          if (body._detailPanels) {
            body._detailPanels.forEach(function (panel) {
              if (panel._tabDef && panel._tabDef.editable) {
                var tabDef = panel._tabDef;
                var masterKeyVal = formInputData[MODULE_CONFIG.PrimaryKey] || (rowData && rowData[MODULE_CONFIG.PrimaryKey]);

                // 1. Process deleted rows
                if (panel._deletedRows && panel._deletedRows.length > 0) {
                  var detailRowIdField = tabDef.rowIdField || 'id';
                  var deletedIds = panel._deletedRows.map(function (r) { return r[detailRowIdField]; }).filter(Boolean).join(',');
                  if (deletedIds) {
                    detailApiCalls.push(function () {
                      return GatewayClient.run({ sp: tabDef.api, func: 'Delete' }, { Ids: deletedIds }, {
                        endpoint: MODULE_CONFIG.ApiSave,
                        payload: { Ids: deletedIds, UserName: _currentUser() }
                      });
                    });
                  }
                }

                // 2. Process current (added/modified) rows
                if (panel._currentRows && panel._currentRows.length > 0) {
                  panel._currentRows.forEach(function (currRow) {
                    currRow[tabDef.filterField] = masterKeyVal;
                    var isRowEdit = !!currRow[tabDef.rowIdField || 'id'];
                    var rowPayload = Object.assign({}, currRow);
                    rowPayload.UserName = _currentUser();
                    rowPayload.UserCreate = _currentUser();
                    rowPayload.IsEdit = isRowEdit ? 1 : 0;

                    detailApiCalls.push(function () {
                      return GatewayClient.run({ sp: tabDef.api, func: 'Save' }, rowPayload, {
                        endpoint: MODULE_CONFIG.ApiSave,
                        payload: { UserName: _currentUser() }
                      });
                    });
                  });
                }
              }
            });
          }

          if (detailApiCalls.length > 0) {
            var detailResults = [];
            var chain = Promise.resolve();
            detailApiCalls.forEach(function (apiCall) {
              chain = chain.then(function () {
                return apiCall().then(function (res) {
                  detailResults.push(res);
                });
              });
            });
            chain.then(function () {
              var allOk = detailResults.every(function (dr) { return dr && dr.code === 0; });
              if (allOk) {
                _finalizeSave(isEdit, modal);
              } else {
                var firstErr = detailResults.find(function (dr) { return dr && dr.code !== 0; });
                var dMsg = firstErr && firstErr.msg ? firstErr.msg : 'Lưu chi tiết thất bại';
                if (dMsg.indexOf('Violation of PRIMARY KEY constraint') !== -1 || dMsg.indexOf('Cannot insert duplicate key') !== -1) {
                  dMsg = 'Lỗi: Có dữ liệu bị trùng lặp. Vui lòng kiểm tra lại mã hoặc thông tin!';
                }
                Alert.error(MODULE_CONFIG.AlertTitleError, dMsg);
                _restoreSaveBtn();
              }
            }).catch(function (err) {
              Alert.error(MODULE_CONFIG.AlertTitleError, 'Lỗi lưu thông tin chi tiết: ' + err.message);
              _restoreSaveBtn();
            });
          } else {
            _finalizeSave(isEdit, modal);
          }
        } else {
          var mMsg = res && res.msg ? res.msg : MODULE_CONFIG.AlertSaveFailed;
          if (mMsg.indexOf('Violation of PRIMARY KEY constraint') !== -1 || mMsg.indexOf('Cannot insert duplicate key') !== -1) {
            mMsg = 'Lỗi: Mã này đã tồn tại trong hệ thống. Vui lòng kiểm tra và nhập mã khác!';
          }
          Alert.error(MODULE_CONFIG.AlertTitleError, mMsg);
          _restoreSaveBtn();
        }
      })
      .catch(function () {
        Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        _restoreSaveBtn();
      });
  }

  function _saveInlineEdit(originalRow, tabDef, btnSave) {
    var detailContent = $container.querySelector('#dynamic-detail-content');
    if (!detailContent) return;

    var formInputData = {};
    var inputs = detailContent.querySelectorAll('.form-inline-input');
    inputs.forEach(function (el) {
      if (el.name) {
        formInputData[el.name] = el.value;
      }
    });

    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    // Merge với original row
    var payloadObj = Object.assign({}, originalRow, formInputData);
    payloadObj.UserName = _currentUser();
    payloadObj.IsEdit = 1;

    if (btnSave) {
      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';
    }

    GatewayClient.runModuleOperation(MODULE_CONFIG, 'save', payloadObj, {
      payload: { UserName: _currentUser() }
    })
      .then(function (res) {
        if (res && res.code === 0) {
          // Main save successful. Check if there's a pending avatar to upload.
          if (window._pendingAvatar) {
            if (!MODULE_CONFIG.AttachmentApi) {
              UIToast.show('Đã cập nhật thông tin thành công (chưa cấu hình lưu ảnh)', 'success');
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
              return;
            }

            var attachmentConfig = MODULE_CONFIG.attachments.default;
            var attachmentOwnerField = attachmentConfig.ownerField || MODULE_CONFIG.PrimaryKey;
            var ownerId = originalRow[attachmentOwnerField];
            var attachApi = attachmentConfig.sp;

            var avatarData = {
                IsEdit: 0,
                FileName: window._pendingAvatar.file.name,
                FileType: 1, // 1 = Avatar
                STT: 2,
                FileSize: window._pendingAvatar.file.size,
                Base64Content: window._pendingAvatar.base64Content,
                Content: window._pendingAvatar.hexStr
            };
            avatarData[attachmentOwnerField] = ownerId;

            GatewayClient.run({ sp: attachApi, func: 'SaveAvatar' }, avatarData, {
              payload: { UserName: _currentUser() }
            }).then(function (resAvatar) {
              if (resAvatar && (resAvatar.code === 0 || resAvatar.code === "0")) {
                UIToast.show('Đã cập nhật thông tin và ảnh đại diện thành công!', 'success');
              } else {
                Alert.error('Lỗi lưu ảnh', 'Lưu thông tin thành công nhưng ảnh bị từ chối: ' + (resAvatar.msg || ''));
              }
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
            }).catch(function (errAvatar) {
              Alert.error('Lỗi mạng', 'Lưu thông tin thành công nhưng không kết nối được để lưu ảnh.');
              window._pendingAvatar = null;
              _inlineEditMode = false;
              _loadData();
            });

          } else {
            // No avatar to upload
            UIToast.show(MODULE_CONFIG.ToastEdit || 'Đã cập nhật thông tin thành công', 'success');
            _inlineEditMode = false;
            _loadData();
          }
        } else {
          Alert.error(MODULE_CONFIG.AlertTitleError, res && res.msg ? res.msg : MODULE_CONFIG.AlertSaveFailed);
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
          }
        }
      })
      .catch(function () {
        Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu';
        }
      });
  }

  return {
    render: render,
    openAdd: _openAddForm,
    openEdit: _openEditForm,
    openView: _openViewForm,
    save: function (data, options) {
      return GatewayClient.runModuleOperation(MODULE_CONFIG, 'save', data, options).then(function (response) {
        _loadData();
        return response;
      });
    },
    delete: function (data, options) {
      return GatewayClient.runModuleOperation(MODULE_CONFIG, 'delete', data, options).then(function (response) {
        _loadData();
        return response;
      });
    },
    reload: _loadData,
    reloadDetailTabs: _loadData,
    lifecycle: function (name) {
      var hook = MODULE_CONFIG.hooks && MODULE_CONFIG.hooks[name];
      if (typeof hook !== 'function') return undefined;
      return hook.apply(null, Array.prototype.slice.call(arguments, 1));
    },
    services: {
      Runtime: window.DynamicFormRuntime,
      State: window.DynamicFormState,
      Repository: window.DynamicFormRepository,
      Schema: window.DynamicFormSchemaService,
      Validator: window.DynamicFormValidator,
      Renderer: window.DynamicFormRenderer,
      Details: window.DynamicDetailManager,
      Attachments: window.DynamicAttachmentManager
    }
  };
})();
