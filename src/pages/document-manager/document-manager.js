/**
 * Kho tài liệu legacy.
 * Luồng xuất/chỉnh sửa hợp đồng mới dùng ContractDocumentActions và draft workspace.
 */
var DocumentManagerPage = (function (global) {
  'use strict';

  var container = null;
  var documents = [];

  function config() {
    return global.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
  }

  function token() {
    if (global.ApiClient && typeof global.ApiClient.getCookie === 'function') return global.ApiClient.getCookie('auth_token') || '';
    var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function request(url, options) {
    var init = Object.assign({}, options || {});
    init.headers = Object.assign({}, init.headers || {});
    var authToken = token();
    if (authToken) init.headers.Authorization = 'Bearer ' + authToken;
    return fetch(url, init).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok || body.success === false) throw new Error(body.message || 'Document API trả lỗi.');
        return body.data || [];
      });
    });
  }

  function fileUrl(fileName) {
    return config().UPLOADS_URL + String(fileName).split('/').map(encodeURIComponent).join('/');
  }

  function renderLayout() {
    container.innerHTML = '';
    var page = document.createElement('div');
    page.className = 'docmgr-page';
    page.innerHTML = [
      '<div class="docmgr-header">',
      '  <div><h2>Kho tài liệu legacy</h2><p>Chức năng Xuất Hợp Đồng mới lưu qua draft và attachment; trang này chỉ xem file cũ trong uploads.</p></div>',
      '  <button type="button" class="btn btn-outline-secondary" id="docmgr-reload">Tải lại</button>',
      '</div>',
      '<div class="docmgr-content">',
      '  <div class="docmgr-sidebar"><div id="docmgr-list"></div></div>',
      '  <div class="docmgr-editor" id="docmgr-view"><div class="docmgr-empty">Chọn một tài liệu để tải hoặc quản lý.</div></div>',
      '</div>'
    ].join('');
    page.querySelector('#docmgr-reload').onclick = loadDocuments;
    container.appendChild(page);
  }

  function renderList() {
    var list = container.querySelector('#docmgr-list');
    list.innerHTML = '';
    if (!documents.length) {
      list.innerHTML = '<div class="docmgr-empty">Không có tài liệu legacy.</div>';
      return;
    }
    documents.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'docmgr-file-item';
      var name = document.createElement('strong');
      name.textContent = item.fileName;
      var detail = document.createElement('span');
      detail.textContent = (item.branch || '') + (item.size ? ' · ' + item.size : '');
      button.appendChild(name);
      button.appendChild(detail);
      button.onclick = function () { showDocument(item); };
      list.appendChild(button);
    });
  }

  function showDocument(item) {
    var view = container.querySelector('#docmgr-view');
    view.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = item.fileName;
    var info = document.createElement('p');
    info.textContent = 'File legacy được giữ để tương thích; không dùng file này làm template hợp đồng.';
    var actions = document.createElement('div');
    actions.className = 'docmgr-actions';
    var download = document.createElement('a');
    download.className = 'btn btn-primary';
    download.href = fileUrl(item.fileName);
    download.download = item.fileName.split('/').pop();
    download.textContent = 'Tải DOCX';
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-outline-danger';
    remove.textContent = 'Xóa file legacy';
    remove.onclick = function () { deleteDocument(item); };
    actions.appendChild(download);
    actions.appendChild(remove);
    view.appendChild(title);
    view.appendChild(info);
    view.appendChild(actions);
  }

  function deleteDocument(item) {
    if (!global.confirm('Xóa file "' + item.fileName + '"?')) return;
    var endpoint = config().LEGACY_DOCUMENT_API_BASE + '/' + String(item.fileName).split('/').map(encodeURIComponent).join('/');
    request(endpoint, { method: 'DELETE' })
      .then(loadDocuments)
      .catch(function (error) {
        if (global.Alert) global.Alert.error('Không thể xóa', error.message);
        else global.alert(error.message);
      });
  }

  function loadDocuments() {
    var list = container.querySelector('#docmgr-list');
    if (list) list.innerHTML = '<div class="docmgr-empty">Đang tải...</div>';
    return request(config().LEGACY_DOCUMENT_API_BASE)
      .then(function (items) {
        documents = items;
        renderList();
      })
      .catch(function (error) {
        if (list) list.innerHTML = '<div class="docmgr-empty">' + error.message + '</div>';
      });
  }

  function render(target) {
    container = target;
    documents = [];
    renderLayout();
    loadDocuments();
  }

  return { render: render };
})(window);
