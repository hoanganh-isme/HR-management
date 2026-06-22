/**
 * CompareBadge Component
 * ─────────────────────────────────────────────
 * Hiển thị badge so sánh kỳ trước: +12.5% ▲ / -3.2% ▼
 *
 * Usage:
 *   CompareBadge.create(12.5)                      // HTMLElement, green ▲
 *   CompareBadge.create(-3.2)                       // HTMLElement, red ▼
 *   CompareBadge.create(5.0, { reverse: true })     // tăng = xấu (chi phí)
 *   CompareBadge.create(12.5, { size: 'sm' })       // size nhỏ
 *   CompareBadge.createHTML(-3.2, { size: 'sm' })   // HTML string
 *   CompareBadge.update(el, -5.0)                   // cập nhật element
 */
var CompareBadge = (function () {

  /**
   * Tính trạng thái badge (up/down/neutral) từ phần trăm và reverse flag
   * @param {number} pct
   * @param {boolean} reverse - true = tăng là xấu (vd: chi phí)
   * @returns {'up'|'down'|'neutral'}
   */
  function _getDirection(pct, reverse) {
    if (pct === 0 || isNaN(pct)) return 'neutral';
    var isPositive = pct > 0;
    return (isPositive !== reverse) ? 'up' : 'down';
  }

  /**
   * Build nội dung badge
   * @param {number} pct
   * @param {Object} opts - { reverse, size, showSign, decimalPlaces }
   * @returns {{ direction, className, html }}
   */
  function _build(pct, opts) {
    opts = opts || {};
    var reverse = !!opts.reverse;
    var size = opts.size || 'md'; // 'sm' | 'md'
    var places = opts.decimalPlaces !== undefined ? opts.decimalPlaces : 1;
    var direction = _getDirection(pct, reverse);

    var icon = direction === 'up'
      ? '<span class="material-symbols-outlined cb-icon">arrow_upward</span>'
      : direction === 'down'
        ? '<span class="material-symbols-outlined cb-icon">arrow_downward</span>'
        : '<span class="material-symbols-outlined cb-icon">remove</span>';

    var sign = pct > 0 ? '+' : '';
    var absVal = Math.abs(pct);
    var text = sign + (isNaN(pct) ? '--' : pct.toFixed(places)) + '%';

    var cls = 'compare-badge compare-badge--' + direction + ' compare-badge--' + size;

    return {
      direction: direction,
      className: cls,
      contentHTML: icon + '<span class="cb-text">' + text + '</span>'
    };
  }

  /**
   * Tạo HTMLElement badge
   * @param {number} pct - Phần trăm thay đổi (vd: 12.5, -3.2)
   * @param {Object} [opts]
   * @param {boolean} [opts.reverse=false] - Nếu true, tăng = xấu
   * @param {'sm'|'md'} [opts.size='md']
   * @param {number} [opts.decimalPlaces=1]
   * @returns {HTMLElement}
   */
  function create(pct, opts) {
    var b = _build(pct, opts);
    var el = document.createElement('span');
    el.className = b.className;
    el.innerHTML = b.contentHTML;
    return el;
  }

  /**
   * Tạo HTML string badge
   * @param {number} pct
   * @param {Object} [opts]
   * @returns {string}
   */
  function createHTML(pct, opts) {
    var b = _build(pct, opts);
    return '<span class="' + b.className + '">' + b.contentHTML + '</span>';
  }

  /**
   * Cập nhật element badge đã tồn tại (không re-render toàn bộ DOM)
   * @param {HTMLElement} el - element được tạo bởi create()
   * @param {number} pct
   * @param {Object} [opts]
   */
  function update(el, pct, opts) {
    if (!el) return;
    var b = _build(pct, opts);
    el.className = b.className;
    el.innerHTML = b.contentHTML;
  }

  return {
    create: create,
    createHTML: createHTML,
    update: update
  };
})();
