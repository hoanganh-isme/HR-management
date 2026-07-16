/** Small per-form state store. It knows only state and legacy storage keys. */
window.DynamicFormState = (function () {
  var STORAGE_KEY = (window.AppSession && window.AppSession.keys.formStates) || 'DynamicFormEngine_States';

  function readStates() {
    try { return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function writeStates(states) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(states)); } catch (e) { }
  }

  function create(formName) {
    var key = String(formName || '');
    var state = {
      keyword: '',
      sortCol: '',
      sortDir: '',
      page: 1,
      limit: 15,
      filters: null,
      selectedRows: [],
      activeDetailTab: 0
    };

    function restore() {
      var saved = readStates()[key];
      if (saved) state = Object.assign({}, state, saved);
      try {
        var selectedKey = ((window.AppSession && window.AppSession.keys.selectedRowsPrefix) || 'selectedRows_') + key;
        var selected = JSON.parse(window.sessionStorage.getItem(selectedKey) || '[]');
        if (Array.isArray(selected)) state.selectedRows = selected;
      } catch (e) { }
      return Object.assign({}, state);
    }

    function persist(next) {
      if (next) state = Object.assign({}, state, next);
      var states = readStates();
      states[key] = Object.assign({}, state);
      writeStates(states);
      try {
        var selectedKey = ((window.AppSession && window.AppSession.keys.selectedRowsPrefix) || 'selectedRows_') + key;
        window.sessionStorage.setItem(selectedKey, JSON.stringify(state.selectedRows || []));
      } catch (e) { }
      return Object.assign({}, state);
    }

    return {
      restore: restore,
      persist: persist,
      get: function () { return Object.assign({}, state); },
      setFilter: function (filters) { state.filters = filters || null; return state.filters; },
      setSelectedRows: function (rows) { state.selectedRows = Array.isArray(rows) ? rows : []; return state.selectedRows; },
      resetPaging: function () { state.page = 1; return state.page; }
    };
  }

  return { create: create };
})();
