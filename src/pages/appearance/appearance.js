/**
 * Màn hình Cài đặt Giao diện
 * HTML Template: src/pages/appearance/appearance.html
 */
var AppearancePage = (function () {

  var COLORS = [
    { id: 'indigo', name: 'Indigo (Mặc định)', primary: '#4F46E5', hover: '#4338CA', dark: '#3730A3', light: 'rgba(79, 70, 229, 0.1)' },
    { id: 'emerald', name: 'Emerald', primary: '#10B981', hover: '#059669', dark: '#047857', light: 'rgba(16, 185, 129, 0.1)' },
    { id: 'rose', name: 'Rose', primary: '#E11D48', hover: '#BE123C', dark: '#9F1239', light: 'rgba(225, 29, 72, 0.1)' },
    { id: 'amber', name: 'Amber', primary: '#F59E0B', hover: '#D97706', dark: '#B45309', light: 'rgba(245, 158, 11, 0.1)' },
    { id: 'sky', name: 'Sky', primary: '#0EA5E9', hover: '#0284C7', dark: '#0369A1', light: 'rgba(14, 165, 233, 0.1)' }
  ];

  var THEMES = [
    { id: 'auto', name: 'Theo hệ thống', desc: 'Tự động Sáng/Tối theo thiết bị.', icon: 'brightness_auto' },
    { id: 'light', name: 'Bản Phát triển (Sáng)', desc: 'Giao diện hiện đại, tươi sáng.', icon: 'light_mode' },
    { id: 'dark', name: 'Bản Phát triển (Tối)', desc: 'Giao diện hiện đại, nền tối dịu mắt.', icon: 'dark_mode' }
  ];

  var FONTS = [
    { id: 'Plus Jakarta Sans', desc: 'Sang trọng, sắc nét', isDefault: true },
    { id: 'Inter', desc: 'Hiện đại, dễ đọc' },
    { id: 'Roboto', desc: 'Tiêu chuẩn cổ điển' },
    { id: 'Nunito', desc: 'Bo tròn, thân thiện' },
    { id: 'Arial', desc: 'Dễ nhìn cho kế toán' }
  ];

  function render($container) {
    fetch('./src/pages/appearance/appearance.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        $container.innerHTML = html;
        _renderLayoutOptions();
        _renderFontOptions();
        _renderThemeOptions();
        _renderColorOptions();
      });
  }

  function _renderLayoutOptions() {
    var container = document.getElementById('layout-options-container');
    if (!container) return;
    var currentMode = (typeof Navbar !== 'undefined' && Navbar.getLayout) ? Navbar.getLayout() : 'horizontal';

    container.innerHTML = _buildLayoutCard('horizontal', 'view_agenda', 'Giao diện Ngang (Navbar)', 'Menu ngang gọn gàng trên cùng.', currentMode)
      + _buildLayoutCard('vertical', 'view_sidebar', 'Giao diện Dọc (Sidebar)', 'Thanh công cụ dọc bên trái quen thuộc.', currentMode);
  }

  function _buildLayoutCard(mode, icon, title, desc, currentMode) {
    var isActive = currentMode === mode;
    return '<div class="layout-option" onclick="AppearancePage.changeLayout(\'' + mode + '\', this)" style="border:2px solid ' + (isActive ? 'var(--color-primary)' : 'var(--color-border)') + '; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.2s; background:' + (isActive ? 'var(--color-primary-light)' : 'var(--color-surface)') + '; position:relative; overflow:hidden; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 210px;">'
      + (isActive ? '<div class="layout-check-wrapper" style="position:absolute; top:10px; right:10px; color:var(--color-primary);">' + UIIcon.createHTML('check_circle', 'font-size:20px;') + '</div>' : '')
      + UIIcon.createHTML(icon, 'font-size:40px; color:' + (isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)') + '; margin-bottom:12px; display: block;')
      + '<h3 style="margin:0 0 6px 0; font-size:15px; font-weight:600; width: 100%;">' + title + '</h3>'
      + '<p style="font-size:13px; color:var(--color-text-secondary); margin:0; line-height:1.5; width: 100%;">' + desc + '</p></div>';
  }

  function _renderFontOptions() {
    var container = document.getElementById('font-options-container');
    if (!container) return;
    var currentFont = (window.APP_SETTINGS ? APP_SETTINGS.getStored('font_family', null) : localStorage.getItem('pmql_font_family')) || 'Plus Jakarta Sans';

    var html = '';
    FONTS.forEach(function(fontDef) {
       html += _buildFontCard(fontDef.id, fontDef.desc, currentFont, fontDef.isDefault);
    });
    container.innerHTML = html;
  }

  function _buildFontCard(fontName, desc, currentFont, isDefault) {
    var isActive = currentFont === fontName;
    return '<div class="font-option" onclick="AppearancePage.changeFont(\'' + fontName + '\', this)" style="border:2px solid ' + (isActive ? 'var(--color-primary)' : 'var(--color-border)') + '; border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; background:' + (isActive ? 'var(--color-primary-light)' : 'var(--color-surface)') + '; position:relative; height: 100%; box-sizing: border-box;">'
      + (isActive ? '<div class="font-check-wrapper" style="position:absolute; top:10px; right:10px; color:var(--color-primary);">' + UIIcon.createHTML('check_circle', 'font-size:18px;') + '</div>' : '')
      + '<h3 style="margin:0 0 4px 0; font-size:16px; font-weight:600; font-family:\'' + fontName + '\', sans-serif;">Aa Bb Cc</h3>'
      + '<div style="font-size:14px; font-weight:600; margin-bottom:4px;">' + fontName + (isDefault ? ' (Mặc định)' : '') + '</div>'
      + '<p style="font-size:12px; color:var(--color-text-secondary); margin:0;">' + desc + '</p></div>';
  }

  function _renderThemeOptions() {
    var container = document.getElementById('theme-options-container');
    if (!container) return;
    var currentTheme = (window.APP_SETTINGS ? APP_SETTINGS.getStored('theme', null) : localStorage.getItem('pmql_theme')) || 'auto';

    var html = '';
    THEMES.forEach(function(themeDef) {
      var isActive = currentTheme === themeDef.id;
      html += '<div class="theme-option" onclick="AppearancePage.changeTheme(\'' + themeDef.id + '\', this)" style="border:2px solid ' + (isActive ? 'var(--color-primary)' : 'var(--color-border)') + '; border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; background:' + (isActive ? 'var(--color-primary-light)' : 'var(--color-surface)') + '; position:relative; height: 100%; box-sizing: border-box;">'
        + (isActive ? '<div class="theme-check-wrapper" style="position:absolute; top:10px; right:10px; color:var(--color-primary);">' + UIIcon.createHTML('check_circle', 'font-size:18px;') + '</div>' : '')
        + UIIcon.createHTML(themeDef.icon, 'font-size:32px; color:' + (isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)') + '; margin-bottom:12px;')
        + '<h3 style="margin:0 0 4px 0; font-size:16px; font-weight:600;">' + themeDef.name + '</h3>'
        + '<p style="font-size:12px; color:var(--color-text-secondary); margin:0;">' + themeDef.desc + '</p></div>';
    });
    container.innerHTML = html;
  }

  function _renderColorOptions() {
    var container = document.getElementById('color-options-container');
    if (!container) return;
    var currentColor = (window.APP_SETTINGS ? APP_SETTINGS.getStored('color', null) : localStorage.getItem('pmql_color')) || 'indigo';

    var html = '';
    COLORS.forEach(function(colorDef) {
      var isActive = currentColor === colorDef.id;
      html += '<div class="color-option" onclick="AppearancePage.changeColor(\'' + colorDef.id + '\', this)" style="width:50px; height:50px; border-radius:50%; background:' + colorDef.primary + '; cursor:pointer; position:relative; transition:all 0.2s; border:3px solid ' + (isActive ? colorDef.primary : 'transparent') + '; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin:5px; padding:2px; background-clip:content-box; transform: scale(' + (isActive ? '1.1' : '1') + ');">'
        + (isActive ? '<div class="color-check-wrapper" style="position:absolute; top:-5px; right:-5px; color:' + colorDef.primary + '; background: var(--color-surface); border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 5px rgba(0,0,0,0.2);">' + UIIcon.createHTML('check', 'font-size:14px; font-weight:bold;') + '</div>' : '')
        + '</div>';
    });
    container.innerHTML = html;
  }

  function changeLayout(mode, el) {
    if (typeof Navbar === 'undefined' || typeof Navbar.setLayout === 'undefined') return;
    var currentMode = Navbar.getLayout();
    if (currentMode === mode) return;
    Navbar.setLayout(mode);
    Navbar.moveContentToApp();
    Navbar.render('navbar-container');
    if (mode === 'vertical') Navbar.moveContentToVerticalMain();

    setTimeout(function () {
      var allOptions = document.querySelectorAll('.layout-option');
      allOptions.forEach(function (opt) {
        opt.style.borderColor = 'var(--color-border)';
        opt.style.background = 'var(--color-surface)';
        var icon = opt.querySelector('span.material-symbols-outlined');
        if (icon) icon.style.color = 'var(--color-text-secondary)';
        var checkMark = opt.querySelector('.layout-check-wrapper');
        if (checkMark) checkMark.remove();
      });
      if (el) {
        el.style.borderColor = 'var(--color-primary)';
        el.style.background = 'var(--color-primary-light)';
        var icon = el.querySelector('span.material-symbols-outlined');
        if (icon) icon.style.color = 'var(--color-primary)';
        var checkWrap = document.createElement('div');
        checkWrap.className = 'layout-check-wrapper';
        checkWrap.style = 'position:absolute; top:10px; right:10px; color:var(--color-primary);';
        checkWrap.innerHTML = UIIcon.createHTML('check_circle', 'font-size:20px;');
        el.appendChild(checkWrap);
      }
      if (typeof UIToast !== 'undefined') UIToast.show('Đã chuyển đổi giao diện thành công');
    }, 50);
  }

  function changeFont(fontFamily, el) {
    var currentFont = (window.APP_SETTINGS ? APP_SETTINGS.getStored('font_family', null) : localStorage.getItem('pmql_font_family')) || 'Plus Jakarta Sans';
    if (currentFont === fontFamily) return;
    if (window.APP_SETTINGS) APP_SETTINGS.setStored('font_family', fontFamily); else localStorage.setItem('pmql_font_family', fontFamily);
    document.documentElement.style.setProperty('--font-family', '"' + fontFamily + '", sans-serif');

    var allOptions = document.querySelectorAll('.font-option');
    allOptions.forEach(function (opt) {
      opt.style.borderColor = 'var(--color-border)';
      opt.style.background = 'var(--color-surface)';
      var checkMark = opt.querySelector('.font-check-wrapper');
      if (checkMark) checkMark.remove();
    });
    if (el) {
      el.style.borderColor = 'var(--color-primary)';
      el.style.background = 'var(--color-primary-light)';
      var checkWrap = document.createElement('div');
      checkWrap.className = 'font-check-wrapper';
      checkWrap.style = 'position:absolute; top:10px; right:10px; color:var(--color-primary);';
      checkWrap.innerHTML = UIIcon.createHTML('check_circle', 'font-size:18px;');
      el.appendChild(checkWrap);
    }
    if (typeof UIToast !== 'undefined') UIToast.show('Đã đổi phông chữ sang ' + fontFamily);
  }

  function changeTheme(themeId, el) {
    var currentTheme = (window.APP_SETTINGS ? APP_SETTINGS.getStored('theme', null) : localStorage.getItem('pmql_theme')) || 'auto';
    if (currentTheme === themeId && el) return;
    if (window.APP_SETTINGS) APP_SETTINGS.setStored('theme', themeId); else localStorage.setItem('pmql_theme', themeId);
    
    var isDark = themeId === 'dark' || (themeId === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    var allOptions = document.querySelectorAll('.theme-option');
    allOptions.forEach(function (opt) {
      opt.style.borderColor = 'var(--color-border)';
      opt.style.background = 'var(--color-surface)';
      var icon = opt.querySelector('span.material-symbols-outlined');
      if (icon) icon.style.color = 'var(--color-text-secondary)';
      var checkMark = opt.querySelector('.theme-check-wrapper');
      if (checkMark) checkMark.remove();
    });
    if (el) {
      el.style.borderColor = 'var(--color-primary)';
      el.style.background = 'var(--color-primary-light)';
      var icon = el.querySelector('span.material-symbols-outlined');
      if (icon) icon.style.color = 'var(--color-primary)';
      var checkWrap = document.createElement('div');
      checkWrap.className = 'theme-check-wrapper';
      checkWrap.style = 'position:absolute; top:10px; right:10px; color:var(--color-primary);';
      checkWrap.innerHTML = UIIcon.createHTML('check_circle', 'font-size:18px;');
      el.appendChild(checkWrap);
    }
    if (typeof UIToast !== 'undefined') UIToast.show('Đã đổi chủ đề hệ thống');
  }

  function changeColor(colorId, el) {
    var currentColor = (window.APP_SETTINGS ? APP_SETTINGS.getStored('color', null) : localStorage.getItem('pmql_color')) || 'indigo';
    if (currentColor === colorId) return;
    
    var colorDef = COLORS.find(function(c) { return c.id === colorId; });
    if (!colorDef) return;

    if (window.APP_SETTINGS) APP_SETTINGS.setStored('color', colorId); else localStorage.setItem('pmql_color', colorId);
    document.documentElement.style.setProperty('--color-primary', colorDef.primary);
    document.documentElement.style.setProperty('--color-primary-hover', colorDef.hover);
    document.documentElement.style.setProperty('--color-primary-dark', colorDef.dark);
    document.documentElement.style.setProperty('--color-primary-light', colorDef.light);

    var allOptions = document.querySelectorAll('.color-option');
    allOptions.forEach(function (opt) {
      opt.style.borderColor = 'transparent';
      opt.style.transform = 'scale(1)';
      var checkMark = opt.querySelector('.color-check-wrapper');
      if (checkMark) checkMark.remove();
    });
    if (el) {
      el.style.borderColor = colorDef.primary;
      el.style.transform = 'scale(1.1)';
      var checkWrap = document.createElement('div');
      checkWrap.className = 'color-check-wrapper';
      checkWrap.style = 'position:absolute; top:-5px; right:-5px; color:' + colorDef.primary + '; background: var(--color-surface); border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 5px rgba(0,0,0,0.2);';
      checkWrap.innerHTML = UIIcon.createHTML('check', 'font-size:14px; font-weight:bold;');
      el.appendChild(checkWrap);
    }
    if (typeof UIToast !== 'undefined') UIToast.show('Đã đổi màu chủ đạo thành ' + colorDef.name);
  }

  return { 
    render: render, 
    changeLayout: changeLayout, 
    changeFont: changeFont,
    changeTheme: changeTheme,
    changeColor: changeColor
  };
})();
