/**
 * Dịch vụ Báo cáo (ReportService)
 */
var ReportService = (function () {

  function getRevenue(fromDate, toDate) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.REPORTS || !API_CONFIG.ENDPOINTS.REPORTS.REVENUE) {
        return reject('Missing API_CONFIG.ENDPOINTS.REPORTS.REVENUE');
      }
      
      var payload = {};
      if (fromDate) payload.TuNgay = fromDate;
      if (toDate) payload.DenNgay = toDate;
      
      var endpoint = API_CONFIG.ENDPOINTS.REPORTS.REVENUE + '?q=' + encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ReportService] Lỗi tải báo cáo doanh thu:', err);
          reject(err);
        });
    });
  }

  function getCost(fromDate, toDate) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.REPORTS || !API_CONFIG.ENDPOINTS.REPORTS.COST) {
        return reject('Missing API_CONFIG.ENDPOINTS.REPORTS.COST');
      }
      
      var payload = {};
      if (fromDate) payload.TuNgay = fromDate;
      if (toDate) payload.DenNgay = toDate;
      
      var endpoint = API_CONFIG.ENDPOINTS.REPORTS.COST + '?q=' + encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ReportService] Lỗi tải báo cáo chi phí:', err);
          reject(err);
        });
    });
  }

  return {
    getRevenue: getRevenue,
    getCost: getCost
  };
})();
