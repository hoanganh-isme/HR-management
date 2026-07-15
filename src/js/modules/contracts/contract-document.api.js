/** Contract document API client. */
window.ContractDocumentApi = (function () {
  var documentConfig = window.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;

  function layToken() {
    if (typeof ApiClient !== 'undefined' && typeof ApiClient.getCookie === 'function') return ApiClient.getCookie('auth_token') || '';
    var match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function goi(path, options) {
    options = options || {};
    var url = documentConfig.CONTRACT_API_BASE + path;
    var headers = Object.assign({}, options.headers || {}, { 'Content-Type': 'application/json' });
    var token = layToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    return fetch(url, {
      method: options.method || 'GET',
      headers: headers,
      credentials: 'include',
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }).catch(function (networkError) {
      var error = new Error('Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c Contract Document API t\u1ea1i ' + documentConfig.SERVICE_BASE + '. H\u00e3y ki\u1ec3m tra backend-app \u0111\u00e3 ch\u1ea1y ch\u01b0a.');
      error.code = 'DOCUMENT_API_UNREACHABLE';
      error.cause = networkError;
      throw error;
    }).then(function (response) {
      var contentType = response.headers.get('content-type') || '';
      if (contentType.toLowerCase().indexOf('application/json') === -1) {
        return response.text().then(function (text) {
          var error = new Error('Contract Document API tr\u1ea3 v\u1ec1 n\u1ed9i dung kh\u00f4ng h\u1ee3p l\u1ec7 (HTTP ' + response.status + ', URL: ' + url + ').');
          error.code = 'DOCUMENT_API_NON_JSON';
          error.status = response.status;
          error.url = url;
          error.responseText = text.slice(0, 500);
          throw error;
        });
      }
      return response.json().then(function (json) {
        if (!response.ok || json.success === false) {
          var error = new Error(json.message || 'Contract Document API tr\u1ea3 v\u1ec1 l\u1ed7i.');
          error.status = response.status;
          error.code = json.code;
          error.url = url;
          throw error;
        }
        return json;
      });
    });
  }

  function health() {
    var url = documentConfig.SERVICE_BASE + '/health';
    return fetch(url, { method: 'GET', credentials: 'include' }).catch(function (networkError) {
      var error = new Error('Document API ch\u01b0a ch\u1ea1y t\u1ea1i ' + documentConfig.SERVICE_BASE + '.');
      error.code = 'DOCUMENT_API_UNREACHABLE';
      error.cause = networkError;
      throw error;
    }).then(function (response) {
      return response.json().then(function (json) {
        if (!response.ok || json.status !== 'ok') {
          var error = new Error(json.message || 'Document API health check th\u1ea5t b\u1ea1i (HTTP ' + response.status + ').');
          error.code = 'DOCUMENT_API_HEALTH_FAILED';
          error.status = response.status;
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
    listSavedAttachments: function (maHopDong) { return goi('/contract-attachments' + (maHopDong ? '?maHopDong=' + encodeURIComponent(maHopDong) : '')); },
    attachmentMetadata: function (userAutoID) { return goi('/contract-attachments/' + encodeURIComponent(userAutoID)); },
    createTemplateWorkspace: function (templateFile) { return goi('/contract-template-workspaces', { method: 'POST', body: { templateFile: templateFile } }); },
    templateEditorConfig: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/editor-config'); },
    templateWorkspaceStatus: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/status'); },
    templatePlaceholders: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/placeholders'); },
    applyTemplateWorkspace: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/apply', { method: 'POST', body: {} }); },
    deleteTemplateWorkspace: function (workspaceId) { return goi('/contract-template-workspaces/' + encodeURIComponent(workspaceId), { method: 'DELETE' }); },
    attachmentFileUrl: function (userAutoID, download) { return documentConfig.CONTRACT_API_BASE + '/contract-attachments/' + encodeURIComponent(userAutoID) + '/file' + (download ? '?download=1' : ''); },
    health: health
  };
})();
