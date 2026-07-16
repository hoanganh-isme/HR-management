var ContractDocumentApi = (function (global) {
  'use strict';

  function config() {
    var manager = global.API_CONFIG && global.API_CONFIG.ENDPOINTS && global.API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER;
    if (!manager) throw new Error('Thiếu API_CONFIG.ENDPOINTS.DOCUMENT_MANAGER.');
    return manager;
  }

  function normalizeToken(value) {
    return String(value || '').trim().replace(/^Bearer\s+/i, '').trim();
  }

  function appStorageSession() {
    var storage = global.AppStorage;
    if (!storage) return null;
    var methods = ['getAuthToken', 'getToken', 'getSessionUser', 'getUser', 'getSession'];
    for (var i = 0; i < methods.length; i += 1) {
      if (typeof storage[methods[i]] === 'function') {
        try {
          var value = storage[methods[i]]();
          if (value) return value;
        } catch (e) { }
      }
    }
    if (typeof storage.get === 'function') {
      try {
        return storage.get('auth_token') || storage.get('pmql_user') || storage.get('user') || null;
      } catch (e) { }
    }
    return null;
  }

  function sessionUser() {
    var stored = appStorageSession();
    if (stored) return stored;
    if (global.AppSession && typeof global.AppSession.getUser === 'function') {
      var appSessionUser = global.AppSession.getUser();
      if (appSessionUser) return appSessionUser;
    }
    try {
      return JSON.parse(global.localStorage.getItem('pmql_user') || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function tokenCandidates(session) {
    if (!session || typeof session !== 'object') return [];
    return [session, session.user, session.User, session.data, session.session, session.session && session.session.user]
      .filter(function (candidate) { return candidate && typeof candidate === 'object'; });
  }

  function tokenFromSession(session) {
    if (typeof session === 'string') return normalizeToken(session);
    var candidates = tokenCandidates(session);
    var fields = ['access_token', 'accessToken', 'AccessToken', 'token', 'Token'];
    for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
      for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
        var value = normalizeToken(candidates[candidateIndex][fields[fieldIndex]]);
        if (value) return value;
      }
    }
    return '';
  }

  function token() {
    if (global.ApiClient && typeof global.ApiClient.getCookie === 'function') {
      var cookieToken = normalizeToken(global.ApiClient.getCookie('auth_token'));
      if (cookieToken) return cookieToken;
    }
    return tokenFromSession(sessionUser());
  }

  function userName(session) {
    if (global.AppSession && typeof global.AppSession.getUserName === 'function') {
      var appSessionName = String(global.AppSession.getUserName() || '').trim();
      if (appSessionName) return appSessionName;
    }
    var candidates = tokenCandidates(session);
    var fields = ['Username', 'UserName', 'username', 'TaiKhoan', 'taiKhoan', 'LoginName', 'loginName'];
    for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
      for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
        var value = String(candidates[candidateIndex][fields[fieldIndex]] || '').trim();
        if (value) return value;
      }
    }
    return '';
  }

  function headers(extra) {
    var result = Object.assign({}, extra || {});
    var authToken = token();
    if (!authToken) {
      var missingSessionError = new Error('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
      missingSessionError.code = 'AUTH_SESSION_MISSING';
      throw missingSessionError;
    }
    result.Authorization = 'Bearer ' + authToken;
    var currentUserName = userName(sessionUser());
    if (currentUserName) result.Username = currentUserName;
    return result;
  }

  function request(url, options) {
    var init = Object.assign({}, options || {});
    try {
      init.headers = headers(init.headers);
    } catch (error) {
      return Promise.reject(error);
    }
    return fetch(url, init).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok || body.success === false) {
          var error = new Error(body.message || ('Document API trả HTTP ' + response.status + '.'));
          error.status = response.status;
          throw error;
        }
        return body.data !== undefined ? body.data : body;
      });
    });
  }

  function api(path, options) {
    return request(config().CONTRACT_API_BASE.replace(/\/$/, '') + path, options);
  }

  function json(method, path, data) {
    return api(path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
  }

  return {
    config: config,
    health: function () { return request(config().SERVICE_BASE.replace(/\/$/, '') + '/health'); },
    templates: function () { return api('/contract-templates'); },
    createDraft: function (data) { return json('POST', '/contract-drafts', data); },
    draftEditor: function (draftId) { return api('/contract-drafts/' + encodeURIComponent(draftId) + '/editor'); },
    uploadDraft: function (draftId, file) {
      return api('/contract-drafts/' + encodeURIComponent(draftId) + '/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        body: file
      });
    },
    finalizeDraft: function (draftId) { return json('POST', '/contract-drafts/' + encodeURIComponent(draftId) + '/finalize', {}); },
    createTemplateWorkspace: function (templateFile) { return json('POST', '/contract-template-workspaces', { templateFile: templateFile }); },
    templateWorkspaceEditor: function (workspaceId) { return api('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/editor'); },
    uploadTemplateWorkspace: function (workspaceId, file) {
      return api('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        body: file
      });
    },
    validateTemplateWorkspace: function (workspaceId) { return api('/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/placeholders'); },
    applyTemplateWorkspace: function (workspaceId) { return json('POST', '/contract-template-workspaces/' + encodeURIComponent(workspaceId) + '/apply', {}); },
    closeTemplateWorkspace: function (workspaceId) { return api('/contract-template-workspaces/' + encodeURIComponent(workspaceId), { method: 'DELETE' }); }
  };
})(window);
