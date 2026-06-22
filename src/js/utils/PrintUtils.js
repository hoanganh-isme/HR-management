/**
 * Print Utility
 * Phục vụ nghiệp vụ IN phiếu và IN lưới từ ứng dụng CSR (Client Side Render)
 */
var PrintUtils = (function () {

  /**
   * Mở cửa sổ in một vùng giao diện (DOM Node)
   * @param {Node} element - DOM Node cần in
   * @param {string} title - Tiêu đề trang in
   */
  function printElement(element, title) {
    var win = window.open('', '', 'height=700,width=900');
    if (!win) {
      Alert.error('Lỗi', 'Trình duyệt bị chặn mở cửa sổ (Popup blocked). Vui lòng cho phép!');
      return;
    }

    win.document.write('<html><head><title>' + (title || 'In tài liệu') + '</title>');
    
    // Nạp toàn bộ style hiện tại vào bản in
    var styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(function(s) {
      win.document.write(s.outerHTML);
    });

    win.document.write('<style> @media print { body { padding: 20px; background: var(--color-surface); } .btn-tool { display: none; } } </style>');
    win.document.write('</head><body >');
    win.document.write(element.outerHTML);
    win.document.write('</body></html>');

    win.document.close();
    win.focus();

    setTimeout(function() {
      win.print();
      win.close();
    }, 500); // Đợi CSS load
  }

  return {
    printElement: printElement
  };
})();
