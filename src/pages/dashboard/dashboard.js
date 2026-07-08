/**
 * DashboardPage — refactored dùng component
 * CompareBadge, MetricCard, SparklineChart, KVTable, HallGauge, SectionPanel
 */
var DashboardPage = (function () {

  var _refs = {}; // lưu các element ref để update sau
  var _period = { revenue: 'week', biz: 'month', payment: 'month', weekly: 'week' };

  // ── Format helpers ─────────────────────────────────────────────
  function _fmtShort(n) {
    if (typeof n !== 'number') return '--';
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
    if (n >= 1e6) return (n / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
    return n.toLocaleString('vi-VN');
  }
  function _now() {
    var d = new Date();
    return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()+
           ' - '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
  }

  // ── Mock data ──────────────────────────────────────────────────
  function _todayData() {
    return { revenueForecast:185000000, collected:142000000,
             hallTotal:5, hallDone:2, hallOngoing:3,
             contractsPaid:3, contractsPaidAmt:95000000,
             ongoing:3, ongoingGuests:280,
             upcoming:2, upcomingTime:'18:00 & 19:30',
             cancelled:0 };
  }
  function _revenueData(p) {
    var base={week:485e6,month:2100e6,quarter:6300e6};
    var prev={week:412e6,month:1880e6,quarter:5900e6};
    var c={week:12,month:48,quarter:145}, g={week:890,month:3650,quarter:10800};
    var r=base[p]||base.week, pr=prev[p]||prev.week;
    var pie = p === 'quarter' ? [55, 25, 12, 8] : (p === 'month' ? [58, 22, 10, 10] : [62, 20, 10, 8]);
    return { revenue:r, prevRevenue:pr, revPct:(r-pr)/pr*100,
             contracts:c[p]||12, prevContracts:Math.round((c[p]||12)*0.82),
             avgContract:Math.round(r/(c[p]||12)),
             cost:Math.round(r*0.38), prevCost:Math.round(pr*0.40),
             guests:g[p]||890, prevGuests:Math.round((g[p]||890)*0.87),
             avgGuest:Math.round(r/(g[p]||890)),
             profit:Math.round(r*0.62), prevProfit:Math.round(pr*0.60),
             sparkline:_spark(),
             pieLabels: ['Hành chính', 'Kế toán', 'Kỹ thuật', 'Khác'],
             pieValues: pie };
  }
  function _spark() {
    var a=[], v=50;
    for(var i=0;i<14;i++){v+=(Math.random()-0.45)*18;v=Math.max(15,Math.min(95,v));a.push(Math.round(v));}
    return a;
  }
  function _bizData(p) {
    var f={quarter:3,year:12}[p]||1;
    return { revenue:2100e6*f, cost:798e6*f, discount:42e6*f, profit:1260e6*f };
  }
  function _payData(p) {
    var f=p==='quarter'?3:1;
    return { deposit:420e6*f, paid:1512e6*f, debt:168e6*f, total:2100e6*f };
  }
  function _weeklyData(p) {
    var vals = p==='lastweek'?[280,195,320,410,520,780,650]:[310,225,290,480,610,850,720];
    return { labels:['T2','T3','T4','T5','T6','T7','CN'],
             values:vals.map(function(v){return v*100000;}) };
  }

  // ── Bar chart (dùng Chart.js nếu có, fallback canvas) ─────────
  function _drawBar(canvas, labels, values) {
    if (!canvas) return;
    // Dùng Chart.js CDN nếu đã load
    if (typeof Chart !== 'undefined') {
      if (canvas._chartInstance) canvas._chartInstance.destroy();
      var isDark = document.body.classList.contains('dark-theme');
      var color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#4F46E5';
      canvas._chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{ data: values, backgroundColor: color+'CC', borderRadius: 4,
                       borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            callbacks: { label: function(c){ return _fmtShort(c.raw); } }
          }},
          scales: {
            x: { grid: { display: false },
                 ticks: { color: isDark?'#94A3B8':'#64748B', font: { size: 11 } } },
            y: { grid: { color: isDark?'rgba(51,65,85,0.5)':'rgba(226,232,240,0.8)' },
                 ticks: { color: isDark?'#94A3B8':'#64748B', font: { size: 11 },
                          callback: function(v){ return _fmtShort(v); } } }
          }
        }
      });
      return;
    }
    // Fallback canvas thủ công (giống SparklineChart nhưng bar)
    var dpr = window.devicePixelRatio||1;
    var W = canvas.parentElement.offsetWidth||300, H = 180;
    canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    var ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);
    var isDark=document.body.classList.contains('dark-theme');
    var tc=isDark?'rgba(148,163,184,0.8)':'rgba(100,116,139,0.9)';
    var gc=isDark?'rgba(51,65,85,0.5)':'rgba(226,232,240,0.8)';
    var pL=40,pR=12,pT=12,pB=28, cW=W-pL-pR, cH=H-pT-pB;
    var max=Math.max.apply(null,values)*1.15||1;
    var bW=(cW/labels.length)*0.55, gap=(cW/labels.length)*0.45;
    var pc=getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()||'#4F46E5';
    ctx.font='10px sans-serif'; ctx.textAlign='right'; ctx.fillStyle=tc;
    for(var g=1;g<=4;g++){
      var yp=pT+cH-(g/4)*cH;
      ctx.strokeStyle=gc; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(pL,yp); ctx.lineTo(W-pR,yp); ctx.stroke();
      ctx.fillText(_fmtShort(max*g/4),pL-4,yp+3);
    }
    labels.forEach(function(lb,i){
      var x=pL+i*(cW/labels.length)+gap/2, bH=(values[i]/max)*cH, y=pT+cH-bH;
      var gr=ctx.createLinearGradient(x,y,x,pT+cH);
      gr.addColorStop(0,pc); gr.addColorStop(1,pc+'66');
      ctx.beginPath();
      var r=Math.min(4,bW/2);
      ctx.moveTo(x+r,y); ctx.lineTo(x+bW-r,y);
      ctx.quadraticCurveTo(x+bW,y,x+bW,y+r);
      ctx.lineTo(x+bW,pT+cH); ctx.lineTo(x,pT+cH);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath(); ctx.fillStyle=gr; ctx.fill();
      ctx.fillStyle=tc; ctx.textAlign='center';
      ctx.fillText(lb,x+bW/2,H-pB+14);
    });
  }

  // ── Pie chart ──────────────────────────────────────────────────
  function _drawPie(canvas, labels, values) {
    if (!canvas) return;
    if (typeof Chart !== 'undefined') {
      if (canvas._chartInstance) canvas._chartInstance.destroy();
      var isDark = document.body.classList.contains('dark-theme');
      var colors = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#F43F5E', '#8B5CF6'];
      canvas._chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: values, backgroundColor: colors, borderWidth: isDark ? 2 : 1, borderColor: isDark ? '#1e293b' : '#ffffff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '65%',
          plugins: { 
            legend: { display: false }, 
            tooltip: { callbacks: { label: function(c){ return ' ' + c.label + ': ' + c.raw + '%'; } } }
          }
        }
      });
      return;
    }
    // Fallback Canvas
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.parentElement.offsetWidth || 110, H = canvas.parentElement.offsetHeight || 110;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    var total = values.reduce(function(a,b){return a+b}, 0);
    var colors = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9'];
    var cx = W/2, cy = H/2, r = Math.min(cx, cy) - 4;
    var startAngle = -Math.PI/2;
    var isDark = document.body.classList.contains('dark-theme');
    
    values.forEach(function(val, i) {
      var sliceAngle = (val / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.stroke();
      startAngle += sliceAngle;
    });
    // Hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.65, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fill();
  }

  // ── Warning Banner ─────────────────────────────────────────────
  function _buildWarningBanner(container) {
    // Mock data for warnings (e.g. from API)
    var overdue = 3;
    var upcoming = 2;
    if (overdue === 0 && upcoming === 0) return;

    var banner = document.createElement('div');
    banner.className = 'db-warning-banner';
    
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined db-warning-icon';
    icon.textContent = 'notification_important';

    var text = document.createElement('div');
    text.className = 'db-warning-text';
    text.innerHTML = '<strong>Lưu ý:</strong> Hệ thống ghi nhận có <span class="text-danger font-semibold">' + overdue + ' hợp đồng quá hạn</span> và <span class="text-warning font-semibold">' + upcoming + ' hợp đồng sắp đến hạn thanh toán</span> trong 7 ngày tới.';

    var btn = document.createElement('button');
    btn.className = 'btn btn-outline db-warning-btn';
    btn.innerHTML = 'Xem chi tiết <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span>';
    btn.onclick = function() {
      window.location.hash = '#/hop-dong';
    };

    banner.appendChild(icon);
    banner.appendChild(text);
    banner.appendChild(btn);

    container.appendChild(banner);
  }

  // ── Section builders ───────────────────────────────────────────
  function _buildToday(container) {
    var d = _todayData();
    var sp = SectionPanel.create({
      icon: 'calendar_today',
      title: 'HOẠT ĐỘNG TRONG NGÀY',
      trailing: '('+_now()+')',
      actions: [{ type:'refresh', onClick: function(){ _refreshToday(); } }]
    });
    _refs.todayPanel = sp.panel;

    var grid = document.createElement('div');
    grid.className = 'db-today-grid';

    // MetricCards
    _refs.mcRevenue = MetricCard.create({
      icon:'payments', iconColor:'#4F46E5', iconBg:'rgba(79,70,229,0.08)',
      label:'Doanh thu ước tính', value:_fmtShort(d.revenueForecast), size:'large'
    });
    _refs.mcCollected = MetricCard.create({
      icon:'account_balance_wallet', iconColor:'#10B981', iconBg:'rgba(16,185,129,0.08)',
      label:'Tiền thu trong ngày', value:_fmtShort(d.collected), size:'large'
    });
    _refs.hallGauge = HallGauge.create({
      total:d.hallTotal, done:d.hallDone, ongoing:d.hallOngoing,
      label:'sảnh hoạt động'
    });
    _refs.mcContractsPaid = MetricCard.create({
      icon:'contract', iconColor:'#10B981', iconBg:'rgba(16,185,129,0.08)',
      label:'HĐ đã thanh toán',
      value:d.contractsPaid, subValue:_fmtShort(d.contractsPaidAmt)
    });
    _refs.mcOngoing = MetricCard.create({
      icon:'restaurant', iconColor:'#F59E0B', iconBg:'rgba(245,158,11,0.08)',
      label:'Nhân viên đang làm việc',
      value:d.ongoing, subValue:d.ongoingGuests+' khách'
    });
    _refs.mcUpcoming = MetricCard.create({
      icon:'event', iconColor:'#0EA5E9', iconBg:'rgba(14,165,233,0.08)',
      label:'Nhân viên nghỉ phép',
      value:d.upcoming, subValue:d.upcomingTime
    });
    _refs.mcCancelled = MetricCard.create({
      icon:'cancel', iconColor:'#F43F5E', iconBg:'rgba(244,63,94,0.08)',
      label:'Hợp đồng hủy',
      value:d.cancelled===0?'0':d.cancelled, subValue:d.cancelled===0?'Không có':''
    });

    // Wrap hall-gauge trong div có border-right
    var hallWrap = document.createElement('div');
    hallWrap.className = 'db-today-hall-cell';
    hallWrap.appendChild(_refs.hallGauge);

    [_refs.mcRevenue, _refs.mcCollected, hallWrap,
     _refs.mcContractsPaid, _refs.mcOngoing, _refs.mcUpcoming, _refs.mcCancelled
    ].forEach(function(el){ grid.appendChild(el); });

    sp.body.appendChild(grid);
    container.appendChild(sp.panel);
  }

  function _buildRevenue(container) {
    var d = _revenueData(_period.revenue);
    var sp = SectionPanel.create({
      icon: 'bar_chart', title: 'TỔNG QUAN DOANH THU',
      actions: [
        { type:'select', id:'period-revenue',
          options:[{value:'week',label:'Tuần này'},{value:'month',label:'Tháng này'},{value:'quarter',label:'Quý này'}],
          defaultValue:'week',
          onChange: function(v){ _period.revenue=v; _updateRevenue(); }
        },
        { type:'refresh', onClick: function(){ _updateRevenue(); } }
      ]
    });

    var grid = document.createElement('div');
    grid.className = 'db-revenue-grid';

    // Left: big revenue + Pie Chart
    var left = document.createElement('div');
    left.className = 'db-revenue-main';
    left.style.cssText = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: nowrap; gap: 8px;';

    // Info column
    var infoCol = document.createElement('div');
    infoCol.style.cssText = 'display: flex; flex-direction: column; gap: 4px; flex: 1 1 50%; min-width: 110px;';
    infoCol.innerHTML = '<div class="db-revenue-label">Doanh thu</div>';

    var revVal = document.createElement('div');
    revVal.className = 'db-revenue-value';
    revVal.dataset.revValue = '1';
    revVal.textContent = _fmtShort(d.revenue);
    infoCol.appendChild(revVal);

    var cmpRow = document.createElement('div');
    cmpRow.className = 'db-revenue-compare';
    _refs.badgeRevenue = CompareBadge.create(d.revPct);
    var cmpText = document.createElement('span');
    cmpText.className = 'db-compare-text';
    cmpText.style.whiteSpace = 'normal';
    cmpText.style.lineHeight = '1.2';
    cmpText.textContent = 'so với kỳ trước';
    cmpRow.appendChild(_refs.badgeRevenue);
    cmpRow.appendChild(cmpText);
    infoCol.appendChild(cmpRow);

    _refs.sparkCanvas = SparklineChart.create({ data:d.sparkline, width:260, height:65 });
    _refs.sparkCanvas.style.marginTop = '10px';
    _refs.sparkCanvas.style.width = '100%';
    _refs.sparkCanvas.style.maxWidth = '260px';
    _refs.sparkCanvas.style.height = 'auto';
    infoCol.appendChild(_refs.sparkCanvas);
    
    left.appendChild(infoCol);

    // Pie chart column
    var pieCol = document.createElement('div');
    pieCol.style.cssText = 'flex: 1 1 50%; max-width: 140px; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin: 0 auto;';
    
    var pieWrap = document.createElement('div');
    pieWrap.style.cssText = 'width: 100%; aspect-ratio: 1/1; max-width: 130px; position: relative;';
    _refs.pieCanvas = document.createElement('canvas');
    _refs.pieCanvas.style.width = '100%';
    _refs.pieCanvas.style.height = '100%';
    pieWrap.appendChild(_refs.pieCanvas);
    pieCol.appendChild(pieWrap);

    var pieLabel = document.createElement('div');
    pieLabel.style.cssText = 'font-size: 11px; color: var(--color-text-secondary); margin-top: 10px; font-weight: 500; text-align: center; line-height: 1.3;';
    pieLabel.textContent = 'Phân bổ nhân sự';
    pieCol.appendChild(pieLabel);

    left.appendChild(pieCol);

    // Mid: contracts + cost
    var mid = document.createElement('div');
    mid.className = 'db-revenue-stat-col';
    mid.innerHTML =
      '<div class="db-rev-stat-item">' +
        '<div class="db-rev-stat-label">Hợp đồng</div>' +
        '<div class="db-rev-stat-value" data-rv="contracts">'+d.contracts+'</div>' +
        '<div class="db-rev-stat-compare" data-rv-cmp="contracts"></div>' +
        '<div class="db-rev-stat-sub" data-rv="avgContract">Trung bình: '+_fmtShort(d.avgContract)+'/HĐ</div>' +
      '</div><div class="db-rev-stat-divider"></div>' +
      '<div class="db-rev-stat-item">' +
        '<div class="db-rev-stat-label">Tổng chi phí</div>' +
        '<div class="db-rev-stat-value" data-rv="cost">'+_fmtShort(d.cost)+'</div>' +
        '<div class="db-rev-stat-compare" data-rv-cmp="cost"></div>' +
      '</div>';

    // Right: guests + profit
    var right = document.createElement('div');
    right.className = 'db-revenue-stat-col';
    right.innerHTML =
      '<div class="db-rev-stat-item">' +
        '<div class="db-rev-stat-label">Số khách</div>' +
        '<div class="db-rev-stat-value" data-rv="guests">'+d.guests.toLocaleString('vi-VN')+'</div>' +
        '<div class="db-rev-stat-compare" data-rv-cmp="guests"></div>' +
        '<div class="db-rev-stat-sub" data-rv="avgGuest">Trung bình: '+_fmtShort(d.avgGuest)+'/khách</div>' +
      '</div><div class="db-rev-stat-divider"></div>' +
      '<div class="db-rev-stat-item">' +
        '<div class="db-rev-stat-label">Lợi nhuận ước tính</div>' +
        '<div class="db-rev-stat-value success" data-rv="profit">'+_fmtShort(d.profit)+'</div>' +
        '<div class="db-rev-stat-compare" data-rv-cmp="profit"></div>' +
      '</div>';

    grid.appendChild(left);
    grid.appendChild(mid);
    grid.appendChild(right);
    sp.body.appendChild(grid);
    _refs.revenuePanel = sp.panel;
    _refs.revenuePanelBody = grid;

    // Render CompareBadge vào các slot
    _renderCompareBadges(grid, d);
    container.appendChild(sp.panel);

    // Vẽ biểu đồ tròn sau khi DOM mount
    setTimeout(function(){ _drawPie(_refs.pieCanvas, d.pieLabels, d.pieValues); }, 100);
  }

  function _renderCompareBadges(grid, d) {
    function set(sel, pct, opts) {
      var el = grid.querySelector(sel);
      if (!el) return;
      el.innerHTML = '';
      el.appendChild(CompareBadge.create(pct, opts));
      var text = document.createElement('span');
      text.style.cssText = 'font-size:11px;color:var(--color-text-secondary);margin-left:4px;';
      text.textContent = 'so với kỳ trước';
      el.appendChild(text);
    }
    var cPct = (d.contracts-d.prevContracts)/d.prevContracts*100;
    var costPct = (d.cost-d.prevCost)/d.prevCost*100;
    var gPct = (d.guests-d.prevGuests)/d.prevGuests*100;
    var prPct = (d.profit-d.prevProfit)/d.prevProfit*100;
    set('[data-rv-cmp="contracts"]', cPct, {size:'sm'});
    set('[data-rv-cmp="cost"]', costPct, {size:'sm', reverse:true});
    set('[data-rv-cmp="guests"]', gPct, {size:'sm'});
    set('[data-rv-cmp="profit"]', prPct, {size:'sm'});
  }

  function _buildBottom(container) {
    var bottom = document.createElement('div');
    bottom.className = 'db-bottom-grid';

    // 1. Kết quả KD — KVTable
    var bizSP = SectionPanel.create({
      icon:'trending_up', title:'KẾT QUẢ KINH DOANH',
      actions:[
        { type:'select', id:'period-biz',
          options:[{value:'month',label:'Tháng này'},{value:'quarter',label:'Quý này'},{value:'year',label:'Năm này'}],
          onChange: function(v){ _period.biz=v; _updateBiz(); }
        }
      ]
    });
    var bd = _bizData(_period.biz);
    _refs.bizTable = KVTable.create({ rows:[
      { label:'', value:'Số tiền', isHeader:true },
      { label:'Quỹ lương bộ phận', value:_fmtShort(bd.revenue) },
      { label:'Chi phí dịch vụ', value:_fmtShort(bd.cost), color:'danger' },
      { label:'Khuyến mãi / Giảm giá', value:_fmtShort(bd.discount), color:'warning' },
      { label:'Quỹ khen thưởng', value:_fmtShort(bd.profit), color:'success', isTotal:true }
    ]});
    // Fix header row label
    var headerRow = _refs.bizTable.querySelector('.kvtable__row--header .kvtable__label');
    if (headerRow) headerRow.textContent = 'Chỉ tiêu';
    bizSP.body.appendChild(_refs.bizTable);
    bottom.appendChild(bizSP.panel);

    // 2. Báo cáo thanh toán — KVTable
    var paySP = SectionPanel.create({
      icon:'account_balance', title:'BÁO CÁO THANH TOÁN',
      actions:[
        { type:'select', id:'period-payment',
          options:[{value:'month',label:'Tháng này'},{value:'quarter',label:'Quý này'}],
          onChange: function(v){ _period.payment=v; _updatePayment(); }
        }
      ]
    });
    var pd = _payData(_period.payment);
    _refs.payTable = KVTable.create({ rows:[
      { label:'Khoản mục', value:'Số tiền', isHeader:true },
      { label:'Đã thu (đặt cọc)', value:_fmtShort(pd.deposit), color:'success', dot:'#10B981' },
      { label:'Đã thu (thanh toán)', value:_fmtShort(pd.paid), dot:'#0EA5E9' },
      { label:'Còn nợ', value:_fmtShort(pd.debt), color:'warning', dot:'#F59E0B' },
      { label:'Tổng doanh thu kỳ', value:_fmtShort(pd.total), isTotal:true }
    ]});
    paySP.body.appendChild(_refs.payTable);
    bottom.appendChild(paySP.panel);

    // 3. Biểu đồ tuần
    var chartSP = SectionPanel.create({
      icon:'calendar_month', title:'DOANH THU THEO THỨ TRONG TUẦN',
      actions:[
        { type:'select', id:'period-weekly',
          options:[{value:'week',label:'Tuần này'},{value:'lastweek',label:'Tuần trước'}],
          onChange: function(v){ _period.weekly=v; _updateWeekly(); }
        }
      ]
    });
    var barWrap = document.createElement('div');
    barWrap.style.cssText = 'padding:12px 16px 8px; height:210px; position:relative;';
    _refs.barCanvas = document.createElement('canvas');
    barWrap.appendChild(_refs.barCanvas);
    chartSP.body.appendChild(barWrap);
    bottom.appendChild(chartSP.panel);

    container.appendChild(bottom);

    // Vẽ bar chart sau khi DOM mount
    setTimeout(function(){ _updateWeekly(); }, 100);
  }

  // ── Update functions ───────────────────────────────────────────
  function _refreshToday() {
    var d = _todayData();
    MetricCard.update(_refs.mcRevenue,   { value:_fmtShort(d.revenueForecast) });
    MetricCard.update(_refs.mcCollected, { value:_fmtShort(d.collected) });
    HallGauge.update(_refs.hallGauge, { total:d.hallTotal, done:d.hallDone, ongoing:d.hallOngoing });
    MetricCard.update(_refs.mcContractsPaid, { value:d.contractsPaid, subValue:_fmtShort(d.contractsPaidAmt) });
    MetricCard.update(_refs.mcOngoing,   { value:d.ongoing, subValue:d.ongoingGuests+' khách' });
    MetricCard.update(_refs.mcUpcoming,  { value:d.upcoming, subValue:d.upcomingTime });
    if (_refs.todayPanel) SectionPanel.setTrailing(_refs.todayPanel, '('+_now()+')');
  }

  function _updateRevenue() {
    var d = _revenueData(_period.revenue);
    var grid = _refs.revenuePanelBody;
    if (!grid) return;
    var rv = grid.querySelector('[data-rv-value]') || grid.querySelector('.db-revenue-value');
    if (rv) rv.textContent = _fmtShort(d.revenue);
    CompareBadge.update(_refs.badgeRevenue, d.revPct);
    SparklineChart.redraw(_refs.sparkCanvas, d.sparkline);
    _drawPie(_refs.pieCanvas, d.pieLabels, d.pieValues);
    
    var update = function(sel, val){ var el=grid.querySelector(sel); if(el) el.textContent=val; };
    update('[data-rv="contracts"]', d.contracts);
    update('[data-rv="avgContract"]', 'Trung bình: '+_fmtShort(d.avgContract)+'/HĐ');
    update('[data-rv="cost"]', _fmtShort(d.cost));
    update('[data-rv="guests"]', d.guests.toLocaleString('vi-VN'));
    update('[data-rv="avgGuest"]', 'Trung bình: '+_fmtShort(d.avgGuest)+'/khách');
    update('[data-rv="profit"]', _fmtShort(d.profit));
    _renderCompareBadges(grid, d);
  }

  function _updateBiz() {
    var d = _bizData(_period.biz);
    KVTable.setRows(_refs.bizTable, [
      { label:'Chỉ tiêu', value:'Số tiền', isHeader:true },
      { label:'Quỹ lương bộ phận', value:_fmtShort(d.revenue) },
      { label:'Chi phí dịch vụ', value:_fmtShort(d.cost), color:'danger' },
      { label:'Khuyến mãi / Giảm giá', value:_fmtShort(d.discount), color:'warning' },
      { label:'Quỹ khen thưởng', value:_fmtShort(d.profit), color:'success', isTotal:true }
    ]);
  }

  function _updatePayment() {
    var d = _payData(_period.payment);
    KVTable.setRows(_refs.payTable, [
      { label:'Khoản mục', value:'Số tiền', isHeader:true },
      { label:'Đã thu (đặt cọc)', value:_fmtShort(d.deposit), color:'success', dot:'#10B981' },
      { label:'Đã thu (thanh toán)', value:_fmtShort(d.paid), dot:'#0EA5E9' },
      { label:'Còn nợ', value:_fmtShort(d.debt), color:'warning', dot:'#F59E0B' },
      { label:'Tổng doanh thu kỳ', value:_fmtShort(d.total), isTotal:true }
    ]);
  }

  function _updateWeekly() {
    var d = _weeklyData(_period.weekly);
    _drawBar(_refs.barCanvas, d.labels, d.values);
  }

  // ── Render ─────────────────────────────────────────────────────
  function render(container) {
    Router.fetchTemplate('src/pages/dashboard/dashboard.html')
      .then(function(html){
        container.innerHTML = html;
        var inner = container.querySelector('#dashboard-root');
        if (!inner) { inner = document.createElement('div'); container.appendChild(inner); }

        window.DashboardController = { refresh: _refreshToday };

        setTimeout(function(){
          _buildWarningBanner(inner);
          _buildToday(inner);
          _buildRevenue(inner);
          _buildBottom(inner);
          if (window._dbTimer) clearInterval(window._dbTimer);
          window._dbTimer = setInterval(function(){
            if(_refs.todayPanel) SectionPanel.setTrailing(_refs.todayPanel,'('+_now()+')');
          }, 60000);
        }, 80);
      })
      .catch(function(){ container.innerHTML='<p style="color:red">Lỗi tải dashboard</p>'; });
  }

  return { render: render };
})();
