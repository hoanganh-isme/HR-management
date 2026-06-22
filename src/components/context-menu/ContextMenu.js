/**
 * Context Menu Component
 * Bắt sự kiện Click Chuột Phải -> Hiện Menu thả xuống tùy chỉnh (Ví dụ: Tick/Bỏ Tick dòng, Đổi trạng thái)
 */
var UIContextMenu = (function () {
  
  var currentMenu = null;
  var activeTrigger = null;

  /**
   * Khởi tạo Menu 
   * @param {Event} e - Sự kiện chuột phải (Dùng để lấy toạ độ X, Y)
   * @param {Array} items - [{ label, icon, onClick }, '|' ]
   */
  function show(e, items) {
    var trigger = e ? (e.currentTarget || e.target) : null;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Toggle: Nếu bấm lại chính nút đang mở menu -> chỉ cần đóng menu
    if (currentMenu && activeTrigger && trigger && (activeTrigger === trigger || activeTrigger.contains(trigger))) {
      hide();
      return;
    }

    hide();
    activeTrigger = trigger;

    var menu = document.createElement('div');
    menu.className = 'ui-context-menu';
    
    // Đặt visibility hidden và vị trí 0 để đo kích thước chuẩn, tránh bị trình duyệt ép nhỏ khi đặt ở sát mép phải
    menu.style.visibility = 'hidden';
    menu.style.top = '0px';
    menu.style.left = '0px';

    items.forEach(function(item) {
      if (item === '|') {
        var div = document.createElement('div');
        div.className = 'context-menu-divider';
        menu.appendChild(div);
      } else {
        var btn = document.createElement('div');
        btn.className = 'context-menu-item';
        
        var iconHtml = item.icon ? '<span class="material-symbols-outlined">' + item.icon + '</span>' : '';
        btn.innerHTML = iconHtml + '<span style="white-space: nowrap;">' + item.label + '</span>';
        
        btn.onclick = function() {
          hide();
          if (typeof item.onClick === 'function') item.onClick();
        };

        menu.appendChild(btn);
      }
    });

    document.body.appendChild(menu);
    currentMenu = menu;

    // Tính toán và điều chỉnh vị trí để không bị khuất màn hình (Edge detection)
    requestAnimationFrame(function() {
      var rect = menu.getBoundingClientRect();
      var left, top;

      var isMobile = window.innerWidth <= 768;

      // Nếu là click chuột phải (contextmenu) trên Desktop, luôn mở tại vị trí chuột
      // Trên Mobile hoặc khi click nút, mở dưới nút/phần tử để không bị ngón tay che khuất
      if (e && e.type === 'contextmenu' && !isMobile) {
        left = e.pageX;
        top = e.pageY;
      } else if (activeTrigger) {
        var triggerRect = activeTrigger.getBoundingClientRect();
        top = triggerRect.bottom + window.scrollY + 8; // Cách nút 8px
        left = triggerRect.right + window.scrollX - rect.width; // Căn phải với nút
      } else if (e) {
        // Fallback: Mở theo vị trí con trỏ chuột
        left = e.pageX;
        top = e.pageY + 12;
      } else {
        left = 10;
        top = 10;
      }

      // Tràn lề phải (dùng viewport-relative để check)
      var viewLeft = left - window.scrollX;
      if (viewLeft < 10) {
        left = window.scrollX + 10;
      } else if (viewLeft + rect.width > window.innerWidth) {
        left = window.scrollX + window.innerWidth - rect.width - 10;
      }

      // Tràn lề dưới (trừ khi trang rất dài, thì tính theo scroll)
      if (top - window.scrollY + rect.height > window.innerHeight) {
        if (e && e.type === 'contextmenu') {
           top = e.pageY - rect.height; // Lật lên trên con trỏ chuột
        } else if (activeTrigger) {
           var triggerRect = activeTrigger.getBoundingClientRect();
           top = triggerRect.top + window.scrollY - rect.height - 8; // Lật lên trên nút
        } else if (e) {
           top = e.pageY - rect.height - 8; // Lật lên trên con trỏ chuột
        }
      }

      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.visibility = 'visible';
    });

    // Nghe sự kiện click và pointerdown ngoài -> Đóng menu
    document.addEventListener('click', hideOnOutsideClick);
    document.addEventListener('pointerdown', hideOnOutsideClick);
  }

  function hide() {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
      activeTrigger = null;
    }
  }

  function hideOnOutsideClick(e) {
    if (currentMenu && !currentMenu.contains(e.target)) {
      hide();
      document.removeEventListener('click', hideOnOutsideClick);
      document.removeEventListener('pointerdown', hideOnOutsideClick);
    }
  }

  return {
    show: show,
    hide: hide
  };
})();
