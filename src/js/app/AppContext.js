window.AppContext = {
  _resolvedUser: null,
  getRawSession: function () {
    try { return JSON.parse(AppStorage.getStored('user', '{}') || '{}'); } catch (error) { return {}; }
  },
  getCurrentUser: function () {
    var session = this.getRawSession();
    if (!session || typeof session !== 'object') return {};
    var candidates = [session.user, session.User, session.data, session.Data, session.records, session.Records];
    for (var i = 0; i < candidates.length; i++) {
      var candidate = Array.isArray(candidates[i]) ? candidates[i][0] : candidates[i];
      if (candidate && typeof candidate === 'object') {
        return Object.assign({}, session, candidate, this._resolvedUser || {});
      }
    }
    return Object.assign({}, session, this._resolvedUser || {});
  },
  setResolvedUser: function (user) {
    this._resolvedUser = user && typeof user === 'object' ? Object.assign({}, user) : null;
    return this.getCurrentUser();
  },
  getUserName: function () {
    var user = this.getCurrentUser();
    return user.UserName || user.Username || user.username || user.userName ||
      user.LoginName || user.loginName || user.Account || user.account ||
      AppStorage.getStored('auth_username', '') || '';
  }
};
