/**
 * SparklineChart Component
 * ─────────────────────────────────────────────
 * Vẽ mini sparkline chart trên Canvas (không cần Chart.js)
 * Nhẹ, tự động responsive, hỗ trợ animation
 *
 * Usage:
 *   // Option 1: Vẽ vào canvas có sẵn
 *   SparklineChart.draw({
 *     canvas: document.getElementById('my-canvas'),
 *     data: [40, 55, 48, 70, 65, 80, 75],
 *     color: '#4F46E5'   // optional, default = --color-primary
 *   });
 *
 *   // Option 2: Tạo canvas mới + container
 *   var el = SparklineChart.create({
 *     data: [40, 55, 48, 70, 65],
 *     color: '#10B981',
 *     width: 160,
 *     height: 48
 *   });
 *   document.getElementById('chart-wrap').appendChild(el);
 */
var SparklineChart = (function () {

  var _dpr = window.devicePixelRatio || 1;

  /**
   * Lấy màu primary từ CSS variable
   */
  function _getPrimaryColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim() || '#4F46E5';
  }

  /**
   * Core render function — vẽ sparkline lên canvas context
   * @param {CanvasRenderingContext2D} ctx
   * @param {number[]} data
   * @param {number} W - logical width
   * @param {number} H - logical height
   * @param {string} color
   */
  function _render(ctx, data, W, H, color) {
    if (!data || data.length < 2) return;
    ctx.clearRect(0, 0, W, H);

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var pad = 4;
    var stepX = (W - pad * 2) / (data.length - 1);

    // Helper: data[i] → canvas y
    function yOf(v) {
      return pad + (1 - (v - min) / range) * (H - pad * 2);
    }

    // Gradient fill
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    var hex = color.trim();
    // Convert hex / named color → rgba với opacity
    grad.addColorStop(0, _hexToRgba(hex, 0.18));
    grad.addColorStop(1, _hexToRgba(hex, 0.0));

    // Draw fill path
    ctx.beginPath();
    data.forEach(function (v, i) {
      var x = pad + i * stepX;
      var y = yOf(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(pad + (data.length - 1) * stepX, H);
    ctx.lineTo(pad, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach(function (v, i) {
      var x = pad + i * stepX;
      var y = yOf(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = _hexToRgba(hex, 0.9);
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    var lastX = pad + (data.length - 1) * stepX;
    var lastY = yOf(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /**
   * Chuyển hex color → rgba string
   * Hỗ trợ: #RGB, #RRGGBB, rgba(...) trực tiếp
   */
  function _hexToRgba(hex, alpha) {
    if (!hex) return 'rgba(79,70,229,' + alpha + ')';
    hex = hex.trim();
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
      // Đã là rgba, chỉ cần thêm alpha
      return hex.replace(/[\d.]+\)$/, alpha + ')').replace(/^rgb\(/, 'rgba(');
    }
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /**
   * Setup canvas size theo DPR để sharp trên Retina
   * @param {HTMLCanvasElement} canvas
   * @param {number} W - logical width
   * @param {number} H - logical height
   */
  function _setupCanvas(canvas, W, H) {
    canvas.width  = W * _dpr;
    canvas.height = H * _dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(_dpr, _dpr);
    return ctx;
  }

  /**
   * Vẽ sparkline vào canvas có sẵn
   * @param {Object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {number[]} opts.data
   * @param {string} [opts.color]
   * @param {number} [opts.width=220]
   * @param {number} [opts.height=60]
   */
  function draw(opts) {
    var canvas = opts.canvas;
    if (!canvas || !canvas.getContext) return;

    var W = opts.width || parseInt(canvas.style.width) || 220;
    var H = opts.height || parseInt(canvas.style.height) || 60;
    var color = opts.color || _getPrimaryColor();
    var ctx = _setupCanvas(canvas, W, H);
    _render(ctx, opts.data || [], W, H, color);
  }

  /**
   * Tạo canvas element mới với sparkline đã vẽ
   * @param {Object} opts
   * @param {number[]} opts.data
   * @param {string} [opts.color]
   * @param {number} [opts.width=220]
   * @param {number} [opts.height=60]
   * @param {string} [opts.className]   - thêm CSS class vào canvas
   * @returns {HTMLCanvasElement}
   */
  function create(opts) {
    var canvas = document.createElement('canvas');
    if (opts.className) canvas.className = opts.className;
    else canvas.className = 'sparkline-canvas';

    var W = opts.width || 220;
    var H = opts.height || 60;
    var color = opts.color || _getPrimaryColor();
    var ctx = _setupCanvas(canvas, W, H);
    _render(ctx, opts.data || [], W, H, color);
    return canvas;
  }

  /**
   * Redraw sparkline trên canvas — dùng khi data thay đổi
   * @param {HTMLCanvasElement} canvas
   * @param {number[]} data
   * @param {string} [color]
   */
  function redraw(canvas, data, color) {
    if (!canvas || !canvas.getContext) return;
    var W = Math.round(parseInt(canvas.style.width) || 220);
    var H = Math.round(parseInt(canvas.style.height) || 60);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
    _render(ctx, data || [], W, H, color || _getPrimaryColor());
  }

  return {
    draw: draw,
    create: create,
    redraw: redraw
  };
})();
