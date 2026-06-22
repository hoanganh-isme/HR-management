/**
 * Format Utility
 * Các hàm tiện ích dùng chung (Tiền tệ, Thời gian, Số)
 */
var FormatUtils = (function () {

  /**
   * Định dạng tiền tệ VNĐ (VD: 1500000 -> 1.500.000 VNĐ)
   */
  function currency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 VNĐ';
    return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
  }

  /**
   * Định dạng số có dấy tách thập phân (VD: 1500 -> 1.500)
   */
  function number(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString('vi-VN');
  }

  /**
   * Định dạng ngày tháng VN (VD: YYYY-MM-DD -> DD/MM/YYYY)
   */
  function date(dateString) {
    if (!dateString) return '';
    var d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    var day = ('0' + d.getDate()).slice(-2);
    var month = ('0' + (d.getMonth() + 1)).slice(-2);
    return day + '/' + month + '/' + d.getFullYear();
  }

  return {
    currency: currency,
    number: number,
    date: date
  };
})();
