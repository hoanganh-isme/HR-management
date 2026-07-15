/**
 * Trách nhiệm: gọi Contract Document API từ frontend.
 * Đầu vào: mã hợp đồng, draftId và thao tác tài liệu.
 * Đầu ra: JSON hoặc lỗi nghiệp vụ đã đọc.
 * Nơi gọi: ContractDocumentActions và Workspace tài liệu.
 */
window.ContractDocumentApi = (function () {
  var documentConfig = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;

  function layToken() {
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') return ApiClient.getCookie('auth_token') || '';
    var ketQua = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    return ketQua ? decodeURIComponent(ketQua[1]) : '';
  }

  function goi(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    headers['Content-Type'] = 'application/json';
    var token = layToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    return fetch(documentConfig.CONTRACT_API_BASE + path, {
      method: options.method || 'GET',
      headers: headers,
      credentials: 'include',
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (json) {
        if (!response.ok || json.success === false) {
          var error = new Error(json.message || 'Contract Document API trả về lỗi.');
          error.status = response.status;
          error.code = json.code;
          throw error;
        }
        return json;
      });
    });
  }

  return {
    listTemplates: function () { return goi('/contract-templates'); },
    createDraft: function (payload) { return goi('/contract-drafts', { method: 'POST', body: payload }); },
    listDrafts: function () { return goi('/contract-drafts'); },
    editorConfig: function (draftId) { return goi('/contract-drafts/' + encodeURIComponent(draftId) + '/editor-config'); },
    draftStatus: function (draftId) { return goi('/contract-drafts/' + encodeURIComponent(draftId) + '/status'); },
    finalizeDraft: function (draftId) { return goi('/contract-drafts/' + encodeURIComponent(draftId) + '/finalize', { method: 'POST', body: {} }); },
    deleteDraft: function (draftId) { return goi('/contract-drafts/' + encodeURIComponent(draftId), { method: 'DELETE' }); },
    listSavedAttachments: function (maHopDong) {
      var query = maHopDong ? '?maHopDong=' + encodeURIComponent(maHopDong) : '';
      return goi('/contract-attachments' + query);
    },
    attachmentMetadata: function (userAutoID) { return goi('/contract-attachments/' + encodeURIComponent(userAutoID)); },
    createTemplateWorkspace: function (templateFile) { return goi('/contract-template-workspaces', { method: 'POST', body: { templateFile: templateFile } }); },
    templateEditorConfig: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/editor-config'); },
    templateWorkspaceStatus: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/status'); },
    templatePlaceholders: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/placeholders'); },
    applyTemplateWorkspace: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/apply', { method: 'POST', body: {} }); },
    deleteTemplateWorkspace: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId), { method: 'DELETE' }); },
    attachmentFileUrl: function (userAutoID, download) {
      return documentConfig.CONTRACT_API_BASE + '/contract-attachments/' + encodeURIComponent(userAutoID) + '/file' + (download ? '?download=1' : '');
    }
  };
})();
