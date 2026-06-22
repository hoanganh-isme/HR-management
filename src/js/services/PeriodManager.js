// Quản lý Kỳ kế toán (Period Manager) - Tích hợp Real DB (SY_Period)
(function() {
  window.PeriodManager = {
    _cache: {},
    init: function() {
      var _this = this;
      if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.ROUTER) {
        ApiClient.post(API_CONFIG.ENDPOINTS.ROUTER, {
          List: 'SY_Period',
          Func: 'View'
        }).then(function(res) {
          var records = res.records || (Array.isArray(res) ? res : []);
          records.forEach(function(r) {
            var m = parseInt(r.PeriodNo);
            var y = parseInt(r.YearID);
            var isLocked = (r.isLock === true || r.isLock === 1 || r.isLock === '1' || r.isLock === 'True');
            if (m && y) _this._cache[m + '/' + y] = isLocked;
          });
        }).catch(function(e) { console.error('Lỗi tải SY_Period:', e); });
      }
    },
    getLockedPeriods: function() {
      return this._cache;
    },
    setLockedPeriod: function(month, year, isLocked) {
      var m = parseInt(month);
      var y = parseInt(year);
      this._cache[m + '/' + y] = isLocked;

      if (typeof ApiClient !== 'undefined' && window.API_CONFIG && window.API_CONFIG.ENDPOINTS.ROUTER) {
        var periodId = String(y) + (m < 10 ? '0' + m : m); // YYYYMM format, vd: 201801
        ApiClient.post(API_CONFIG.ENDPOINTS.ROUTER, {
          List: 'SY_Period',
          Func: 'Edit', // hoặc Update tùy cấu hình router DB
          Data: {
            PeriodID: periodId,
            isLock: isLocked ? 1 : 0
          }
        }).catch(function(e) { console.error('Lỗi update Khóa Kỳ:', e); });
      }
    },
    isDateLocked: function(dateString) {
      if (!dateString) return false;
      var dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        var parts = dateString.split('/');
        if (parts.length === 3) dateObj = new Date(parts[2], parts[1]-1, parts[0]);
      }
      if (isNaN(dateObj.getTime())) return false;
      var month = dateObj.getMonth() + 1;
      var year = dateObj.getFullYear();
      return this._cache[month + '/' + year] === true;
    }
  };

  // Khởi động load data từ API ngay khi script được nạp
  window.PeriodManager.init();
})();
