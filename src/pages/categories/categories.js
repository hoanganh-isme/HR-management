/**
 * HR master-data landing page.
 *
 * The actual CRUD is still owned by DynamicFormEngine and the server metadata
 * registry. This page only provides a discoverable HR grouping; it does not
 * carry business data or create a second CRUD implementation.
 */
var CategoriesPage = (function () {
  var definitions = [
    { id: 'departments', label: 'Phòng ban', icon: 'account_tree', formKey: 'WA_PHONGBANFRM' },
    { id: 'titles', label: 'Chức danh & vị trí', icon: 'badge', formKey: 'WA_CHUCDANHFRM' },
    { id: 'shifts', label: 'Ca làm việc', icon: 'schedule', formKey: 'WA_CALAMVIECFRM' },
    { id: 'banks', label: 'Ngân hàng', icon: 'account_balance', formKey: 'WA_NGANHANGFRM' },
    { id: 'hospitals', label: 'Cơ sở khám chữa bệnh', icon: 'local_hospital', formKey: 'WA_BENHVIENFRM' }
  ];

  function render(container) {
    Router.fetchTemplate('src/pages/categories/categories.html').then(function (html) {
      container.innerHTML = html;
      _renderTree();
      _select(definitions[0]);
    });
  }

  function _renderTree() {
    var tree = document.getElementById('categories-tree-container');
    if (!tree) return;
    tree.innerHTML = definitions.map(function (item) {
      return '<button type="button" class="ui-tree-node hr-master-node" data-id="' + item.id + '" style="display:flex;align-items:center;gap:8px;width:100%;padding:10px;border:0;background:transparent;text-align:left;cursor:pointer;">' +
        '<span class="material-symbols-outlined">' + item.icon + '</span><span>' + item.label + '</span></button>';
    }).join('');
    tree.querySelectorAll('.hr-master-node').forEach(function (node) {
      node.addEventListener('click', function () {
        var item = definitions.find(function (d) { return d.id === node.dataset.id; });
        _select(item);
        document.querySelector('.categories-layout').classList.remove('show-tree');
      });
    });
  }

  function _select(item) {
    if (!item) return;
    document.querySelectorAll('.hr-master-node').forEach(function (node) {
      node.classList.toggle('active', node.dataset.id === item.id);
      node.style.background = node.dataset.id === item.id ? 'var(--color-primary-light)' : 'transparent';
      node.style.color = node.dataset.id === item.id ? 'var(--color-primary)' : 'var(--color-text)';
    });
    var title = document.getElementById('current-category-title');
    var content = document.getElementById('category-content-container');
    if (title) title.textContent = item.label;
    if (!content) return;

    var config = window.APP_MODULES && window.APP_MODULES[item.formKey];
    if (config && window.DynamicFormEngine) {
      content.innerHTML = '';
      DynamicFormEngine.render(content, Object.assign({
        FormName: config.FormName || item.formKey,
        PageTitle: item.label,
        capabilities: ['responsive', 'lookup']
      }, config));
      return;
    }
    content.innerHTML = '<div class="empty-state" style="margin:auto;text-align:center;padding:32px;max-width:520px;">' +
      '<span class="material-symbols-outlined" style="font-size:48px;color:var(--color-primary);">tune</span>' +
      '<h3>' + item.label + '</h3>' +
      '<p style="color:var(--color-text-secondary);">Mục này sẽ dùng metadata HR từ máy chủ khi menu/form tương ứng được cấp quyền.</p>' +
      '</div>';
  }

  return { render: render };
})();
