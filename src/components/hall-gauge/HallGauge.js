/**
 * HallGauge Component
 * ─────────────────────────────────────────────
 * Hiển thị tình trạng sảnh/phòng với progress bar + số liệu
 * Dùng cho: Dashboard "Hoạt động trong ngày", trang Hall Status
 *
 * Usage:
 *   var el = HallGauge.create({
 *     total: 5,
 *     done: 2,
 *     ongoing: 3,
 *     label: 'sảnh hoạt động',
 *     doneLabel: 'Đã phục vụ xong',    // optional
 *     ongoingLabel: 'Đang phục vụ',    // optional
 *     color: '#4F46E5'                  // optional
 *   });
 *
 *   // Cập nhật không re-render
 *   HallGauge.update(el, { done: 3, ongoing: 2 });
 */
var HallGauge = (function () {

  /**
   * Tính phần trăm và đảm bảo [0, 100]
   */
  function _pct(part, total) {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((part / total) * 100));
  }

  /**
   * Tạo HallGauge element
   * @param {Object} opts
   * @param {number} opts.total
   * @param {number} opts.done
   * @param {number} opts.ongoing
   * @param {string} [opts.label='sảnh hoạt động']
   * @param {string} [opts.doneLabel='Đã phục vụ xong']
   * @param {string} [opts.ongoingLabel='Đang phục vụ']
   * @param {string} [opts.color] - CSS color, default = --color-primary
   * @returns {HTMLElement}
   */
  function create(opts) {
    opts = opts || {};
    var total   = opts.total   || 0;
    var done    = opts.done    || 0;
    var ongoing = opts.ongoing || 0;
    var label       = opts.label       || 'đang hoạt động';
    var doneLabel    = opts.doneLabel    || 'Đã phục vụ xong';
    var ongoingLabel = opts.ongoingLabel || 'Đang phục vụ';
    var color = opts.color || 'var(--color-primary)';

    var activePct = _pct(ongoing, total);

    var wrap = document.createElement('div');
    wrap.className = 'hall-gauge';

    wrap.innerHTML =
      '<div class="hall-gauge__title">' +
        '<span class="material-symbols-outlined hall-gauge__icon">location_city</span>' +
        (opts.titleText || 'Trạng thái nhân sự hôm nay') +
      '</div>' +
      '<div class="hall-gauge__count">' +
        '<span class="hall-gauge__count-num" data-hg-total>' + total + '</span>' +
        '<span class="hall-gauge__count-label">' + label + '</span>' +
      '</div>' +
      '<div class="hall-gauge__bar-row">' +
        '<div class="hall-gauge__bar">' +
          '<div class="hall-gauge__fill" data-hg-fill' +
            ' style="width:0%; background:' + color + '"></div>' +
        '</div>' +
        '<span class="hall-gauge__pct" data-hg-pct style="color:' + color + '">0%</span>' +
      '</div>' +
      '<div class="hall-gauge__sub">' +
        '<span>' + doneLabel + ': <strong data-hg-done>' + done + '</strong></span>' +
        '<span>' + ongoingLabel + ': <strong data-hg-ongoing>' + ongoing + '</strong></span>' +
      '</div>';

    // Animate fill sau 1 frame để CSS transition hoạt động
    setTimeout(function () {
      var fill = wrap.querySelector('[data-hg-fill]');
      var pctEl = wrap.querySelector('[data-hg-pct]');
      if (fill) fill.style.width = activePct + '%';
      if (pctEl) pctEl.textContent = activePct + '%';
    }, 80);

    return wrap;
  }

  /**
   * Cập nhật HallGauge không re-render
   * @param {HTMLElement} el - element tạo bởi create()
   * @param {Object} patch - { total, done, ongoing }
   */
  function update(el, patch) {
    if (!el || !patch) return;

    var total   = parseInt(el.querySelector('[data-hg-total]').textContent)   || 0;
    var done    = parseInt(el.querySelector('[data-hg-done]').textContent)    || 0;
    var ongoing = parseInt(el.querySelector('[data-hg-ongoing]').textContent) || 0;

    if (patch.total   !== undefined) total   = patch.total;
    if (patch.done    !== undefined) done    = patch.done;
    if (patch.ongoing !== undefined) ongoing = patch.ongoing;

    var activePct = _pct(ongoing, total);

    var totalEl   = el.querySelector('[data-hg-total]');
    var doneEl    = el.querySelector('[data-hg-done]');
    var ongoingEl = el.querySelector('[data-hg-ongoing]');
    var fillEl    = el.querySelector('[data-hg-fill]');
    var pctEl     = el.querySelector('[data-hg-pct]');

    if (totalEl)   totalEl.textContent   = total;
    if (doneEl)    doneEl.textContent    = done;
    if (ongoingEl) ongoingEl.textContent = ongoing;
    if (fillEl)    fillEl.style.width    = activePct + '%';
    if (pctEl)     pctEl.textContent     = activePct + '%';
  }

  return {
    create: create,
    update: update
  };
})();
