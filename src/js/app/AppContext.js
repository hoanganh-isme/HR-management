window.AppContext = {
  getCurrentUser: function () {
    try { return JSON.parse(AppStorage.getStored('user', '{}') || '{}'); } catch (error) { return {}; }
  },
  getUserName: function () {
    var user = this.getCurrentUser();
    return user.UserName || user.username || user.userName || '';
  }
};

