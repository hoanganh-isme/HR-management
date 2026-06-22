/**
 * DocumentManagerPage — Workspace Tài Liệu (OnlyOffice)
 * ──────────────────────────────────────────────────────
 * Refactored từ manager.html → dùng component pattern của project.
 * Route: #/document-manager
 */
var DocumentManagerPage = (function () {

  // ── Config ────────────────────────────────────────────────────────────
  var DOC_CONFIG = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;

  var API_BASE = DOC_CONFIG.BASE_API;
  var HOST_IP = DOC_CONFIG.NODE_IP;
  var ONLYOFFICE_API = DOC_CONFIG.ONLYOFFICE_API;

  // ── State ─────────────────────────────────────────────────────────────
  var _container = null;   // page-wrapper div từ Router
  var _currentFile = null;   // tên file đang mở
  var _docEditor = null;   // DocsAPI instance

  // ── Helpers ───────────────────────────────────────────────────────────
  function _qs(sel) { return _container ? _container.querySelector(sel) : null; }

  // ── Đảm bảo ONLYOFFICE API đã load ───────────────────────────────────
  function _ensureOnlyOfficeApi() {
    return new Promise(function (resolve, reject) {
      if (window.DocsAPI) { resolve(); return; }
      var el = document.getElementById('__onlyoffice_api__');
      if (el) {
        // Đã inject, chờ load
        var t = 0;
        var iv = setInterval(function () {
          if (window.DocsAPI) { clearInterval(iv); resolve(); }
          else if (++t > 50) { clearInterval(iv); reject(new Error('OnlyOffice API timeout')); }
        }, 200);
        return;
      }
      var script = document.createElement('script');
      script.id = '__onlyoffice_api__';
      script.src = ONLYOFFICE_API;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Không thể tải OnlyOffice API')); };
      document.head.appendChild(script);
    });
  }

  // ── Build layout ──────────────────────────────────────────────────────
  function _buildLayout() {
    _container.innerHTML = '';

    // Inject scoped CSS (1 lần)
    if (!document.getElementById('__docmgr_css__')) {
      var style = document.createElement('style');
      style.id = '__docmgr_css__';
      style.textContent = [
        '/* Ghi đè padding của .app-content để document-manager full màn hình */',
        'body[data-page="document-manager"] .app-content { padding: 0 !important; }',
        '.docmgr-wrap{display:flex;height:calc(100vh - var(--navbar-height, 56px));overflow:hidden;background:var(--color-surface,#ffffff);}',
        '.docmgr-sidebar{width:300px;flex-shrink:0;display:flex;flex-direction:column;background:var(--color-surface,rgba(15,23,42,.95));border-right:1px solid var(--color-border,rgba(255,255,255,.08));z-index:10;}',
        '.docmgr-sidebar-hd{padding:1.25rem 1rem;border-bottom:1px solid var(--color-border,rgba(255,255,255,.08));background:transparent;}',
        '.docmgr-brand{font-size:1.05rem;font-weight:700;background:linear-gradient(135deg,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:flex;align-items:center;justify-content:center;gap:.5rem;}',
        '.docmgr-list{flex:1;overflow-y:auto;padding:.75rem;}',
        '.docmgr-list::-webkit-scrollbar{width:5px;}',
        '.docmgr-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:10px;}',
        '.docmgr-item{padding:.85rem 1rem;background:var(--color-surface, #ffffff);border:1px solid var(--color-border, #e2e8f0);border-radius:12px;margin-bottom:.6rem;cursor:pointer;transition:all .18s ease;position:relative;overflow:hidden;}',
        '.docmgr-item:hover{background:var(--color-surface-elevated, #f8fafc);border-color:var(--color-border-strong, #cbd5e1);transform:translateX(3px);}',
        '.docmgr-item.active{background:var(--color-primary-light, rgba(79,70,229,.1));border-color:var(--color-primary, #4f46e5);}',
        '.docmgr-item.active::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--color-primary,#4f46e5);border-radius:4px 0 0 4px;}',
        '.docmgr-item-title{font-weight:500;font-size:.9rem;display:flex;align-items:flex-start;gap:.4rem;color:var(--color-text,#e2e8f0);margin-bottom:.35rem;line-height:1.4;}',
        '.docmgr-item-meta{font-size:.75rem;color:var(--color-text-secondary,#94a3b8);display:flex;justify-content:space-between;margin-bottom:.3rem;}',
        '.docmgr-item-actions{display:flex;gap:.35rem;opacity:0;transition:opacity .18s ease;}',
        '.docmgr-item:hover .docmgr-item-actions{opacity:1;}',
        '.docmgr-download{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:rgba(99,102,241,.15);color:#818cf8;text-decoration:none;transition:all .18s ease;}',
        '.docmgr-download:hover{background:#4f46e5;color:#fff;}',
        '.docmgr-del{background:rgba(239,68,68,.15);color:#ef4444;border:none;width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s ease;padding:0;}',
        '.docmgr-del:hover{background:#ef4444;color:#fff;}',
        '.docmgr-workspace{flex:1;position:relative;display:flex;flex-direction:column;background:var(--color-surface,#ffffff);}',
        '.docmgr-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--color-surface,#ffffff);color:var(--color-text-secondary,#94a3b8);z-index:5;}',
        '.docmgr-empty-icon{width:90px;height:90px;background:rgba(99,102,241,.06);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;}',
        '.docmgr-empty h2{color:var(--color-text,#f8fafc);font-weight:500;margin-bottom:.4rem;font-size:1.3rem;}',
        '#docmgr-editor-area{flex:1;width:100%;height:100%;}',
        '.docmgr-onerror{display:flex;align-items:center;justify-content:center;height:100%;font-size:1rem;color:#ef4444;padding:2rem;text-align:center;}'
      ].join('');
      document.head.appendChild(style);
    }

    var html = [
      '<div class="docmgr-wrap">',

      // ── Sidebar ──
      '<aside class="docmgr-sidebar">',
      '<div class="docmgr-sidebar-hd">',
      '<div class="docmgr-brand">',
      '<span class="material-symbols-outlined">folder_open</span>',
      'Workspace Tài Liệu',
      '</div>',
      '</div>',
      '<div class="docmgr-list" id="docmgr-list">',
      '<div style="text-align:center;padding:2rem;color:#94a3b8">Đang tải dữ liệu...</div>',
      '</div>',
      '</aside>',

      // ── Workspace ──
      '<main class="docmgr-workspace">',
      '<div class="docmgr-empty" id="docmgr-empty">',
      '<div class="docmgr-empty-icon">',
      '<span class="material-symbols-outlined" style="font-size:40px;color:var(--color-primary,#4f46e5);">description</span>',
      '</div>',
      '<h2>Chưa chọn tài liệu</h2>',
      '<p>Chọn một tài liệu bên trái hoặc tạo mới để bắt đầu chỉnh sửa</p>',
      '</div>',
      '<div id="docmgr-editor-area"></div>',
      '</main>',

      '</div>',

      // (Đã xóa modal template raw html, chuyển sang dùng OnlyOffice)
    ].join('');

    _container.innerHTML = html;
    _loadDocuments();
  }


  // ── Load danh sách tài liệu ───────────────────────────────────────────
  function _loadDocuments() {
    fetch(API_BASE)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        var list = _qs('#docmgr-list');
        if (!list) return;
        if (!json.data || json.data.length === 0) {
          list.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8;">Chưa có tài liệu nào</div>';
          return;
        }
        list.innerHTML = '';
        json.data.forEach(function (doc) {
          var dateStr = new Date(doc.updatedAt).toLocaleDateString('vi-VN');
          var div = document.createElement('div');
          div.className = 'docmgr-item' + (_currentFile === doc.fileName ? ' active' : '');
          div.innerHTML =
            '<div class="docmgr-item-title" title="' + _escHtml(doc.fileName) + '">' +
            '<span class="material-symbols-outlined" style="font-size:16px;color:#818cf8;flex-shrink:0;margin-top:2px;">description</span>' +
            '<span style="word-break:break-all;">' + _escHtml(doc.fileName) + '</span>' +
            '</div>' +
            '<div class="docmgr-item-meta">' +
            '<span>' + _escHtml(doc.size || '') + '</span>' +
            '<span>' + dateStr + '</span>' +
            '</div>' +
            '<div class="docmgr-item-actions">' +
            '<a class="docmgr-download" href="' + DOC_CONFIG.UPLOADS_URL + encodeURIComponent(doc.fileName) + '" download="' + _escHtml(doc.fileName) + '" title="Tải xuống" onclick="event.stopPropagation()">' +
            '<span class="material-symbols-outlined" style="font-size:16px;">download</span>' +
            '</a>' +
            '<button class="docmgr-del" title="Xóa tài liệu">' +
            '<span class="material-symbols-outlined" style="font-size:16px;">delete</span>' +
            '</button>' +
            '</div>';

          div.addEventListener('click', function () { _openEditor(doc.fileName); });
          var delBtn = div.querySelector('.docmgr-del');
          if (delBtn) delBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            _deleteDocument(doc.fileName);
          });

          list.appendChild(div);
        });
      })
      .catch(function (err) {
        console.error('[DocumentManager]', err);
        var list = _qs('#docmgr-list');
        if (list) list.innerHTML = '<div style="text-align:center;padding:2rem;color:#ef4444;">Lỗi kết nối Server!</div>';
      });
  }

  // ── Xem tài liệu (iframe — file .doc là HTML) ─────────────────────────
  function _openEditor(fileName) {
    _currentFile = fileName;
    _loadDocuments(); // Re-render list để cập nhật class .active

    var empty = _qs('#docmgr-empty');
    if (empty) empty.style.display = 'none';

    var area = _qs('#docmgr-editor-area');
    if (!area) return;

    // Destroy OnlyOffice instance cũ nếu có
    if (_docEditor && typeof _docEditor.destroyEditor === 'function') {
      try { _docEditor.destroyEditor(); } catch (e) { /* ignore */ }
      _docEditor = null;
    }

    var fileUrl = DOC_CONFIG.UPLOADS_URL + encodeURIComponent(fileName);

    // File .doc của hệ thống là HTML-based → dùng iframe render trực tiếp
    // Không cần OnlyOffice, không cần Docker
    area.innerHTML =
      '<div style="display:flex;flex-direction:column;height:100%;">' +
      // Toolbar nhỏ phía trên
      '<div style="display:flex;align-items:center;justify-content:space-between;' +
      'padding:.6rem 1rem;background:var(--color-surface, #ffffff);border-bottom:1px solid var(--color-border, #e2e8f0);">' +
      '<span style="color:var(--color-text-secondary, #64748b);font-size:.82rem;font-family:monospace;">' +
      '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">description</span> ' +
      fileName +
      '</span>' +
      '<div style="display:flex;gap:.5rem;">' +
      '<a href="' + fileUrl + '" download="' + fileName + '" ' +
      'style="display:flex;align-items:center;gap:.3rem;padding:.35rem .8rem;border-radius:6px;' +
      'background:var(--color-primary-light, rgba(79,70,229,0.1));color:var(--color-primary, #4f46e5);text-decoration:none;font-size:.8rem;">' +
      '<span class="material-symbols-outlined" style="font-size:14px;">download</span> Tải về' +
      '</a>' +
      '<button id="docmgr-btn-edit-tpl" ' +
      'style="display:flex;align-items:center;gap:.3rem;padding:.35rem .8rem;border-radius:6px;' +
      'background:var(--color-surface-elevated, #f1f5f9);color:var(--color-text, #1e293b);border:1px solid var(--color-border, #e2e8f0);cursor:pointer;font-size:.8rem;">' +
      '<span class="material-symbols-outlined" style="font-size:14px;">edit</span> Chỉnh sửa template' +
      '</button>' +
      '</div>' +
      '</div>' +
      // Container cho Iframe (srcdoc sẽ được inject bằng fetch bên dưới)
      '<iframe id="docmgr-iframe" ' +
      'style="flex:1;width:100%;border:none;background:#fff;" ' +
      'sandbox="allow-same-origin">' +
      '</iframe>' +
      '</div>';

    // Fetch file content (HTML) và render vào iframe
    // Tránh việc browser tự động download file .doc
    fetch(fileUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then(function (htmlText) {
        var iframe = _qs('#docmgr-iframe');
        if (iframe) iframe.srcdoc = htmlText;
      })
      .catch(function (err) {
        console.error('Error fetching document content:', err);
        var iframe = _qs('#docmgr-iframe');
        if (iframe) {
          iframe.outerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#ef4444;">⚠️ Không thể hiển thị nội dung tài liệu.</div>';
        }
      });

    // Gắn sự kiện cho nút Chỉnh sửa Template
    var btnEditTpl = _qs('#docmgr-btn-edit-tpl');
    if (btnEditTpl) {
      btnEditTpl.addEventListener('click', function () {
        _openTemplateEditor(fileName);
      });
    }
  }

  // ── Chỉnh sửa Template ────────────────────────────────────────────────
  function _openTemplateEditor(fileName) {
    var type = fileName.includes('hop_dong') ? 'hop_dong' : (fileName.includes('dat_coc') ? 'dat_coc' : 'quyet_toan');
    var templateName = type + '.html';

    // Đóng giao diện xem tài liệu cũ
    var area = _qs('#docmgr-editor-area');
    if (!area) return;

    if (_docEditor && typeof _docEditor.destroyEditor === 'function') {
      try { _docEditor.destroyEditor(); } catch (e) { /* ignore */ }
      _docEditor = null;
    }

    area.innerHTML = '<div id="docmgr-oo-placeholder" style="width:100%;height:100%;"></div>';

    _ensureOnlyOfficeApi()
      .then(function () {
        // [QUAN TRỌNG] Trỏ tới Node.js Backend từ OnlyOffice (Document Server).
        // Trên production có thể sử dụng trực tiếp IP Server thay vì host.docker.internal.
        var fileUrl = DOC_CONFIG.SAMPLES_URL + templateName;
        var callbackUrl = DOC_CONFIG.BASE_API + '/callback?isTemplate=1&fileName=' + templateName;

        var config = {
          document: {
            fileType: 'html',
            key: type + '_' + Date.now(),
            title: templateName,
            url: fileUrl,
            permissions: {
              edit: true,
              download: true,
              print: true,
              copy: true
            }
          },
          documentType: 'word',
          editorConfig: {
            mode: 'edit',
            callbackUrl: callbackUrl,
            lang: 'vi',
            user: {
              id: 'admin_' + Math.floor(Math.random() * 9999),
              name: _getCurrentUserName() + ' (Admin)'
            },
            customization: {
              compactHeader: false, // Mở full header để dễ edit template
              toolbarNoTabs: false,
              hideRightMenu: false
            }
          }
        };

        console.log('[OO Template Config]', JSON.stringify(config));
        var placeholder = _qs('#docmgr-oo-placeholder');
        if (placeholder) {
          _docEditor = new DocsAPI.DocEditor('docmgr-oo-placeholder', config);
          if (typeof Toast !== 'undefined') Toast.show({ message: 'Đang mở trình chỉnh sửa Template...', type: 'info' });

          // Inject Floating UI cho Drag & Drop Field
          _injectDragDropUI(type, area);
        }
      })
      .catch(function (err) {
        if (area) area.innerHTML = '<div class="docmgr-onerror">⚠️ Lỗi OnlyOffice: ' + err.message + '</div>';
      });
  }

  // ── Xóa tài liệu ──────────────────────────────────────────────────────
  function _deleteDocument(fileName) {
    var msg = 'Bạn có chắc chắn muốn xóa file "' + fileName + '" không?';

    function _doDelete() {
      fetch(API_BASE + '/' + encodeURIComponent(fileName), { method: 'DELETE' })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            if (_currentFile === fileName) {
              _currentFile = null;
              if (_docEditor && typeof _docEditor.destroyEditor === 'function') {
                try { _docEditor.destroyEditor(); } catch (e) { /* ignore */ }
                _docEditor = null;
              }
              var area = _qs('#docmgr-editor-area');
              if (area) area.innerHTML = '';
              var empty = _qs('#docmgr-empty');
              if (empty) empty.style.display = '';
            }
            _loadDocuments();
            if (typeof Toast !== 'undefined') {
              Toast.show({ message: 'Đã xóa tài liệu!', type: 'success' });
            }
          } else {
            if (typeof Toast !== 'undefined') {
              Toast.show({ message: 'Lỗi: ' + (json.message || ''), type: 'error' });
            } else {
              alert('Lỗi: ' + json.message);
            }
          }
        })
        .catch(function () {
          if (typeof Toast !== 'undefined') {
            Toast.show({ message: 'Lỗi kết nối!', type: 'error' });
          } else {
            alert('Lỗi kết nối!');
          }
        });
    }

    // Dùng ConfirmModal nếu có, fallback confirm()
    if (typeof ConfirmModal !== 'undefined') {
      ConfirmModal.show({
        title: 'Xóa tài liệu',
        message: msg,
        confirmText: 'Xóa',
        danger: true,
        onConfirm: _doDelete
      });
    } else {
      if (confirm(msg)) _doDelete();
    }
  }

  // ── Drag & Drop Template Fields ─────────────────────────────────────────
  function _injectDragDropUI(type, area) {
    if (document.getElementById('docmgr-fields-panel')) return;

    fetch(DOC_CONFIG.BASE_API + '/fields/' + type)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) {
          console.error('Lỗi lấy biến:', data.message);
          return;
        }
        var fields = data.fields || [];

        // Hàm tạo thông báo nổi nhỏ (Toast) thay vì dùng alert() làm gián đoạn drag
        var showToast = function (msg) {
          var t = document.createElement('div');
          t.innerHTML = msg;
          t.style.cssText = 'position:fixed; bottom:30px; right:30px; background:#10b981; color:white; padding:10px 20px; border-radius:6px; box-shadow:0 4px 10px rgba(0,0,0,0.2); z-index:10000; font-size:13px; font-weight:500; transition:all 0.3s; transform:translateY(20px); opacity:0;';
          document.body.appendChild(t);
          setTimeout(function () { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; }, 10);
          setTimeout(function () { t.style.transform = 'translateY(20px)'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2500);
        };

        // Gắn hàm showToast vào window để inline onclick gọi được
        window._docMgrShowToast = showToast;

        var fieldsHtml = fields.map(function (f) {
          var clickHandler = "navigator.clipboard.writeText('" + f + "').then(function(){ window._docMgrShowToast('Đã copy <b>" + f + "</b>. Nhấn Ctrl+V để dán!'); });";

          return '<div onclick="' + clickHandler + '" ' +
            'title="Click để Copy" ' +
            'style="padding:6px 10px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:4px; ' +
            'font-size:12px; cursor:pointer; user-select:none; color:#334155; font-family:monospace; transition:all 0.2s;" ' +
            'onmouseover="this.style.background=\'#e2e8f0\';this.style.borderColor=\'#4f46e5\';this.style.color=\'#4f46e5\';this.style.transform=\'translateY(-1px)\'" ' +
            'onmouseout="this.style.background=\'#f8fafc\';this.style.borderColor=\'#cbd5e1\';this.style.color=\'#334155\';this.style.transform=\'translateY(0)\'">' +
            f + '</div>';
        }).join('');

        var btn = document.createElement('button');
        btn.id = 'docmgr-btn-toggle-fields';
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">extension</span> Chèn Biến Dữ Liệu';
        btn.style.cssText = 'position:absolute; top:20px; right:20px; z-index:9998; display:flex; align-items:center; gap:6px; ' +
          'padding:8px 14px; background:var(--color-primary, #4f46e5); color:white; border:none; ' +
          'border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer; font-weight:500; font-size:13px; transition:all 0.2s;';
        btn.onmouseover = function () { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'; };
        btn.onmouseout = function () { this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; };

        var panel = document.createElement('div');
        panel.id = 'docmgr-fields-panel';
        panel.style.cssText = 'position:absolute; top:70px; right:20px; width:300px; background:rgba(255,255,255,0.95); ' +
          'border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.15); ' +
          'z-index:9999; display:none; flex-direction:column; max-height:80vh; backdrop-filter:blur(8px);';

        panel.innerHTML =
          '<div style="padding:12px 16px; background:var(--color-primary, #4f46e5); color:white; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span class="material-symbols-outlined" style="font-size:18px;">content_copy</span>' +
          '<span style="font-weight:600; font-size:14px; letter-spacing:0.3px;">Click để Copy</span>' +
          '</div>' +
          '<span id="docmgr-fields-close" style="cursor:pointer; opacity:0.8; transition:opacity 0.2s;" class="material-symbols-outlined" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.8\'">close</span>' +
          '</div>' +
          '<div style="padding:14px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px; align-content:flex-start;">' +
          fieldsHtml +
          '</div>';

        area.style.position = 'relative';
        area.appendChild(btn);
        area.appendChild(panel);

        btn.addEventListener('click', function () {
          var isHidden = panel.style.display === 'none';
          panel.style.display = isHidden ? 'flex' : 'none';
        });

        document.getElementById('docmgr-fields-close').addEventListener('click', function () {
          panel.style.display = 'none';
        });
      })
      .catch(function (err) {
        console.error('Lỗi khi fetch fields:', err);
      });
  }

  // ── Utils ──────────────────────────────────────────────────────────────
  function _escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _getCurrentUserName() {
    try {
      var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
      return u.FullName || u.UserName || 'Nhân viên Wedding';
    } catch (e) {
      return 'Nhân viên Wedding';
    }
  }

  // ── Render (được Router gọi) ──────────────────────────────────────────
  function render(container) {
    _container = container;
    _currentFile = null;
    _docEditor = null;

    Router.fetchTemplate('src/pages/document-manager/document-manager.html')
      .then(function (html) {
        container.innerHTML = html;
        _buildLayout();
      })
      .catch(function () {
        _container = container;
        _buildLayout();
      });
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return { render: render };
})();
