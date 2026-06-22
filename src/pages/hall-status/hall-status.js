/**
 * Trang Trạng thái Sảnh Tiệc
 */
window.HallStatusPage = (function () {
  
  function render(container) {
    if (!container) return;

    Router.fetchTemplate('src/pages/hall-status/hall-status.html').then(function(html) {
      container.innerHTML = html;

      var dateInput = container.querySelector('#hall-status-date');
      if (dateInput) {
        var today = new Date();
        
        if (typeof flatpickr !== 'undefined') {
          flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            defaultDate: today,
            onChange: function() {
              _renderHalls(container);
            }
          });
        } else {
          dateInput.valueAsDate = today;
          dateInput.addEventListener('change', function() {
            _renderHalls(container);
          });
        }
      }

      _renderHalls(container);
    }).catch(function(err) {
      container.innerHTML = '<div style="padding: 20px; color: red;">Lỗi tải giao diện: ' + err.message + '</div>';
    });
  }

  function _renderHalls(container) {
    var grid = container.querySelector('#hall-status-grid');
    if (!grid) return;

    // Show skeleton while loading
    grid.innerHTML = [1,2,3,4,5,6].map(function() {
      return '<div style="border:1px solid var(--color-border); border-radius:8px; padding:16px; background:var(--color-surface);">' +
        '<div class="skeleton skeleton-title" style="width:60%; margin-bottom:10px;"></div>' +
        '<div class="skeleton skeleton-text" style="width:40%;"></div>' +
        '<div class="skeleton skeleton-text" style="width:80%; margin-top:12px;"></div>' +
        '</div>';
    }).join('');

    var rawDate = container.querySelector('#hall-status-date').value;
    var formattedDate = rawDate ? rawDate.split('T')[0] : new Date().toISOString().split('T')[0];

    ApiClient.post('/api/API_Gateway_Router', {
      List: 'frmHallStatus',
      Func: 'View',
      NgayToChuc: formattedDate
    }).then(function(res) {
      var halls = res.records || res.data || [];
      if (halls.length === 0) {
        if (typeof UIEmptyState !== 'undefined') {
          grid.innerHTML = '';
          grid.appendChild(UIEmptyState.create({
            icon: 'inbox', title: 'Không có dữ liệu', desc: 'Chưa có thông tin sảnh cho ngày này.'
          }));
        } else {
          grid.innerHTML = '<div style="color:var(--color-text-secondary); padding: 20px;">Không có dữ liệu sảnh.</div>';
        }
        var statContainer = container.querySelector('#hall-stats-container');
        if (statContainer) statContainer.innerHTML = '';
        return;
      }

      var countTrong = 0, countCoc = 0, countKy = 0, countBaoTri = 0;
      halls.forEach(function(h) {
        if (h.status === 'TRONG') countTrong++;
        else if (h.status === 'DA_COC') countCoc++;
        else if (h.status === 'DA_KY') countKy++;
        else countBaoTri++;
      });
      
      var statContainer = container.querySelector('#hall-stats-container');
      if (statContainer) {
        statContainer.innerHTML = 
          '<div style="background:var(--color-surface); padding: 12px 24px; border-radius:12px; border:1px solid var(--color-border); box-shadow:var(--shadow-sm); display:flex; gap:32px;">' +
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<span style="font-size:12px; color:var(--color-text-secondary); font-weight:600; text-transform:uppercase;">Trống</span>' +
              '<span style="font-size:24px; font-weight:700; color:var(--color-success); line-height:1;">' + countTrong + '</span>' +
            '</div>' +
            '<div style="width:1px; background:var(--color-border);"></div>' +
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<span style="font-size:12px; color:var(--color-text-secondary); font-weight:600; text-transform:uppercase;">Đã cọc</span>' +
              '<span style="font-size:24px; font-weight:700; color:var(--color-warning); line-height:1;">' + countCoc + '</span>' +
            '</div>' +
            '<div style="width:1px; background:var(--color-border);"></div>' +
            '<div style="display:flex; flex-direction:column; gap:4px;">' +
              '<span style="font-size:12px; color:var(--color-text-secondary); font-weight:600; text-transform:uppercase;">Đã ký HĐ</span>' +
              '<span style="font-size:24px; font-weight:700; color:var(--color-danger); line-height:1;">' + countKy + '</span>' +
            '</div>' +
          '</div>';
      }

      var html = '';
      halls.forEach(function(hall) {
        var color = '';
        var bgGradient = '';
        var statusText = '';
        var icon = '';
        
        if (hall.status === 'TRONG') { 
          color = '#10B981'; 
          bgGradient = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
          statusText = 'Trống - Sẵn sàng'; 
          icon = 'check_circle';
        } else if (hall.status === 'DA_COC') { 
          color = '#F59E0B'; 
          bgGradient = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
          statusText = 'Đã đặt cọc'; 
          icon = 'monetization_on';
        } else if (hall.status === 'DA_KY') { 
          color = '#EF4444'; 
          bgGradient = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
          statusText = 'Đã ký Hợp đồng'; 
          icon = 'contract';
        } else { 
          color = '#64748B'; 
          bgGradient = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
          statusText = 'Đang bảo trì'; 
          icon = 'build';
        }

        var details = '';
        if (hall.status === 'DA_COC' || hall.status === 'DA_KY') {
          details = '<div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">' +
                      '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">' +
                        '<span style="color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px;"><span class="material-symbols-outlined" style="font-size: 16px;">person</span> Khách hàng:</span>' +
                        '<span style="font-weight: 600; color: var(--color-text-primary); text-align: right; max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + (hall.customer || 'N/A') + '">' + (hall.customer || 'N/A') + '</span>' +
                      '</div>' +
                      '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">' +
                        '<span style="color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px;"><span class="material-symbols-outlined" style="font-size: 16px;">schedule</span> Ca tiệc:</span>' +
                        '<span style="font-weight: 600; color: ' + color + '; background: ' + color + '15; padding: 2px 10px; border-radius: 12px;">' + (hall.session || 'N/A') + '</span>' +
                      '</div>' +
                    '</div>';
        } else {
          details = '<div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">' +
                      '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">' +
                        '<span style="color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px;"><span class="material-symbols-outlined" style="font-size: 16px;">groups</span> Sức chứa:</span>' +
                        '<span style="font-weight: 600; color: var(--color-text-primary);">' + (hall.capacity || 0) + ' bàn</span>' +
                      '</div>' +
                    '</div>';
        }

        var escapedName = hall.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        var escapedCus = (hall.customer || 'Chưa cập nhật').replace(/'/g, "\\'").replace(/"/g, "&quot;");
        
        var clickAction = "";
        if (hall.status === 'TRONG') {
          clickAction = "window.location.hash = '#/booking?sanhId=' + encodeURIComponent('" + hall.id + "') + '&date=' + encodeURIComponent('" + formattedDate + "');";
        } else if (hall.status === 'DA_COC' || hall.status === 'DA_KY') {
          var msg = "<div style=\\'text-align:left;\\'><b>Khách hàng:</b> " + escapedCus + "<br><b>Sức chứa:</b> " + (hall.capacity || 0) + " bàn<br><b>Trạng thái:</b> " + statusText + "</div>";
          clickAction = "if(window.Alert) { Alert.info('Chi tiết Sảnh " + escapedName + "', '" + msg + "'); }";
        } else {
           clickAction = "if(window.Alert) { Alert.info('Bảo trì', 'Sảnh " + escapedName + " đang trong thời gian bảo trì.'); }";
        }

        var isDark = document.body.classList.contains('dark-theme');
        if (isDark) bgGradient = 'var(--color-surface)';

        var cardHtml = 
          '<div class="hall-card" style="background: ' + bgGradient + '; border: 1px solid ' + (isDark ? 'var(--color-border)' : 'rgba(0,0,0,0.03)') + '; border-radius: 16px; padding: 20px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);" ' +
          'onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.boxShadow=\'0 12px 20px -5px rgba(0,0,0,0.08), 0 8px 10px -5px rgba(0,0,0,0.04)\'; this.style.borderColor=\'' + color + '40\'" ' +
          'onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)\'; this.style.borderColor=\'' + (isDark ? 'var(--color-border)' : 'rgba(0,0,0,0.03)') + '\'" ' +
          'onclick="' + clickAction + '">' +
            
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">' +
              '<div style="display: flex; align-items: center; gap: 6px; background: ' + color + (isDark ? '25' : '15') + '; color: ' + color + '; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">' +
                '<span style="width: 6px; height: 6px; border-radius: 50%; background: ' + color + '; box-shadow: 0 0 0 2px ' + color + '40;"></span>' +
                statusText + 
              '</div>' +
              '<div style="width: 36px; height: 36px; border-radius: 10px; background: ' + color + (isDark ? '25' : '15') + '; color: ' + color + '; display: flex; align-items: center; justify-content: center;">' +
                '<span class="material-symbols-outlined" style="font-size: 20px;">' + icon + '</span>' +
              '</div>' +
            '</div>' +

            '<div>' +
              '<h3 style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.01em;">' + hall.name + '</h3>' +
            '</div>' +
            
            '<div style="height: 1px; width: 100%; background: var(--color-border); margin: 16px 0 0; opacity: ' + (isDark ? '1' : '0.6') + ';"></div>' +

            details +
          '</div>';
          
        html += cardHtml;
      });
    grid.innerHTML = html;
    }).catch(function(err) {
      console.error(err);
      grid.innerHTML = '<div style="color:var(--color-danger); padding: 20px;">Lỗi tải dữ liệu sảnh.</div>';
    });
  }

  return {
    render: render
  };
})();
