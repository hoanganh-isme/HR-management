/**
 * Icon Component
 * Quản lý và render Icon (Hỗ trợ cả Material Symbols và Icon font riêng biệt)
 */
var UIIcon = (function () {
  
  /**
   * Sinh ra mã HTML của Icon
   * @param {string} iconName - Tên icon (VD: 'home', 'bar_chart', 'icon-grid')
   * @param {string} style - (Tùy chọn) Style inline bổ sung (VD: 'font-size: 18px;')
   * @param {string} className - (Tùy chọn) Class name bổ sung (VD: 'nav-icon')
   */
  function createHTML(iconName, style, className, onClick) {
    if (!iconName) return '';
    var styleAttr = style ? ' style="' + style + '"' : '';
    var extraClass = className ? ' ' + className : '';
    var onClickAttr = onClick ? ' onclick="' + onClick + '"' : '';
    
    // Nếu có chứa "icon-" hoặc dấu cách, hoặc dấu gạch ngang -> Dùng thẻ <i> cho Icon font
    if (iconName.indexOf('icon-') >= 0 || iconName.indexOf(' ') >= 0 || iconName.indexOf('-') > 0) {
      return '<i class="' + iconName + extraClass + '"' + styleAttr + onClickAttr + '></i>';
    } else {
      // Mặc định: Google Material Symbols Outlined
      return '<span class="material-symbols-outlined' + extraClass + '"' + styleAttr + onClickAttr + '>' + iconName + '</span>';
    }
  }

  /**
   * Tạo DOM Element của Icon
   * @param {string} iconName 
   * @param {string} className 
   */
  function create(iconName, className) {
    if (!iconName) return null;
    var el;
    if (iconName.indexOf('icon-') >= 0 || iconName.indexOf(' ') >= 0 || iconName.indexOf('-') > 0) {
      el = document.createElement('i');
      el.className = iconName + (className ? ' ' + className : '');
    } else {
      el = document.createElement('span');
      el.className = 'material-symbols-outlined' + (className ? ' ' + className : '');
      el.innerText = iconName;
    }
    return el;
  }

  return {
    createHTML: createHTML,
    renderHtml: createHTML, // Keep for backward compatibility
    create: create
  };
})();
