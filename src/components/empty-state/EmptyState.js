/**
 * EmptyState Component
 * Trạng thái trống (VD: Chưa có khách hàng, chưa có hợp đồng)
 */
var UIEmptyState = (function () {

  /**
   * Tạo màn hình rỗng
   * @param {Object} config - { icon, title, desc, action (DOM Node) }
   */
  function create(config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ui-empty-state';

    var iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined ui-empty-icon';
    iconSpan.innerText = config.icon || 'inbox';
    wrapper.appendChild(iconSpan);

    var titleDiv = document.createElement('div');
    titleDiv.className = 'ui-empty-title';
    titleDiv.innerText = config.title || 'Không có dữ liệu';
    wrapper.appendChild(titleDiv);

    if (config.desc) {
      var descDiv = document.createElement('div');
      descDiv.className = 'ui-empty-desc';
      descDiv.innerText = config.desc;
      wrapper.appendChild(descDiv);
    }

    if (config.action instanceof Node) {
      wrapper.appendChild(config.action);
    }

    return wrapper;
  }

  /**
   * Sinh chuỗi HTML trạng thái trống (Dùng cho innerHTML)
   * @param {Object} config - { icon, title, desc, actionHtml }
   */
  function createHTML(config) {
    var icon = config.icon || 'inbox';
    var title = config.title || 'Không có dữ liệu';
    var descHtml = config.desc ? `<div class="ui-empty-desc">${config.desc}</div>` : '';
    var actionHtml = config.actionHtml ? config.actionHtml : '';

    return `
      <div class="ui-empty-state">
        <span class="material-symbols-outlined ui-empty-icon">${icon}</span>
        <div class="ui-empty-title">${title}</div>
        ${descHtml}
        ${actionHtml}
      </div>
    `;
  }

  /**
   * Sinh chuỗi HTML trạng thái trống cho Table Row
   * @param {Object} config - { colspan, text, actionHtml }
   */
  function createTableRowHTML(config) {
    var colspan = config.colspan || 1;
    var text = config.text || 'Chưa có dữ liệu';
    var actionHtml = config.actionHtml ? ` <span class="ms-1">${config.actionHtml}</span>` : '';

    return `
      <tr>
        <td colspan="${colspan}" class="text-center py-4 text-muted">
          ${text}${actionHtml}
        </td>
      </tr>
    `;
  }

  return {
    create: create,
    createHTML: createHTML,
    createTableRowHTML: createTableRowHTML
  };
})();
