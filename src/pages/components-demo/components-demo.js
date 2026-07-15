/** Generic UI component gallery with HR-shaped sample records only. */
var ComponentsDemoPage = (function () {
  function render(container) {
    Router.fetchTemplate('src/pages/components-demo/components-demo.html').then(function (html) {
      container.innerHTML = html;
      _mountCard();
      _mountTable();
      _mountChart();
      _mountFilter();
    });
  }

  function _mountCard() {
    var el = document.getElementById('demo-card');
    if (!el || typeof UICard === 'undefined') return;
    el.appendChild(UICard.create({
      title: 'Hồ sơ nhân viên NV0001',
      bodyContent: '<div class="p-3"><p><b>Nhân sự:</b> Nhân viên mẫu 01</p><p><b>Phòng ban:</b> Nhân sự</p><p><b>Ngày vào làm:</b> 04/03/2024</p><p><b>Trạng thái:</b> <span class="status-badge success">Đang làm việc</span></p></div>'
    }));
  }

  function _mountTable() {
    var el = document.getElementById('demo-table');
    if (!el || typeof UITable === 'undefined') return;
    el.appendChild(UITable.create({
      headers: [
        { label: 'STT', width: '60px', align: 'center' },
        { label: 'Mã nhân sự' }, { label: 'Họ tên' },
        { label: 'Phòng ban' }, { label: 'Trạng thái' }
      ],
      columns: [
        { field: 'stt', align: 'center' },
        { field: 'code' }, { field: 'name' }, { field: 'department' },
        { field: 'status', render: function (value) { return UIBadge.createHTML(value, 'success'); } }
      ],
      data: [
        { stt: 1, code: 'NV0001', name: 'Nhân viên mẫu 01', department: 'Nhân sự', status: 'Đang làm việc' },
        { stt: 2, code: 'NV0002', name: 'Nhân viên mẫu 02', department: 'Kế toán', status: 'Đang làm việc' },
        { stt: 3, code: 'NV0003', name: 'Nhân viên mẫu 03', department: 'Kinh doanh', status: 'Thử việc' }
      ]
    }));
  }

  function _mountChart() {
    var el = document.getElementById('demo-chart-bar');
    if (!el || typeof UIChart === 'undefined') return;
    el.parentNode.replaceChild(UIChart.create({
      title: 'Quỹ lương theo tháng', type: 'bar',
      data: { labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], datasets: [{ label: 'Quỹ lương (triệu)', data: [120, 135, 142, 151, 158, 165], backgroundColor: 'rgba(79,70,229,0.6)' }] }
    }), el);
    var pie = document.getElementById('demo-chart-pie');
    if (pie) pie.parentNode.replaceChild(UIChart.create({
      title: 'Nhân sự theo phòng ban', type: 'pie',
      data: { labels: ['Nhân sự', 'Kế toán', 'Kinh doanh', 'Vận hành'], datasets: [{ data: [35, 25, 25, 15], backgroundColor: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'] }] }
    }), pie);
  }

  function _mountFilter() {
    var el = document.getElementById('demo-filter');
    if (!el || typeof FilterComponent === 'undefined') return;
    el.appendChild(FilterComponent.create([
      { id: 'f-name', label: 'Tên nhân sự', type: 'text', placeholder: 'Nhập tên...' },
      { id: 'f-from', label: 'Từ ngày', type: 'date' },
      { id: 'f-to', label: 'Đến ngày', type: 'date' }
    ], function (values) { if (typeof UIToast !== 'undefined') UIToast.show('Lọc: ' + JSON.stringify(values)); }));
  }

  return { render: render };
})();
