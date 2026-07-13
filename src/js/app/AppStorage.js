window.AppStorage = (function () {
  var currentPrefix = 'hrm_';
  var legacyPrefix = 'pmql_';

  function currentKey(key) { return currentPrefix + key; }
  function legacyKey(key) { return legacyPrefix + key; }
  function read(storage, key, fallback) {
    var value = storage.getItem(currentKey(key));
    if (value === null) value = storage.getItem(legacyKey(key));
    return value === null ? fallback : value;
  }
  function write(storage, key, value) { storage.setItem(currentKey(key), value); return value; }
  function remove(storage, key) { storage.removeItem(currentKey(key)); storage.removeItem(legacyKey(key)); }

  return {
    getStored: function (key, fallback) { return read(localStorage, key, fallback); },
    setStored: function (key, value) { return write(localStorage, key, value); },
    removeStored: function (key) { remove(localStorage, key); },
    getSession: function (key, fallback) { return read(sessionStorage, key, fallback); },
    setSession: function (key, value) { return write(sessionStorage, key, value); },
    removeSession: function (key) { remove(sessionStorage, key); },
    currentKey: currentKey,
    legacyKey: legacyKey
  };
})();

