/**
 * WorkflowTransferPlugin
 * ─────────────────────────────────────────────────────────────────────
 * Plugin dùng để chuyển dữ liệu từ các màn hình này sang màn hình khác.
 * Ví dụ: Khách tham quan -> Biên nhận cọc (Auto-fill)
 */
var WorkflowTransferPlugin = (function () {

    function _autoClickAdd() {
        setTimeout(function () {
            var btnAdd = document.querySelector('button[title*="Thêm bản ghi mới"], button[title="Thêm"], .btn-primary:not(.btn-tool)');
            if (btnAdd) btnAdd.click();
        }, 800);
    }

    // --- CẤU HÌNH CÁC NÚT TRANSFER ---
    var FORM_CONFIG = {
        'frmKhachThamQuan': {
            id: 'btn-transfer-booking',
            text: 'Tạo Cọc',
            icon: 'monetization_on',
            targetHash: '#/booking',
            storageKey: 'transfer_VisitorToBooking',
            getTransferData: function (row) {
                var data = Object.assign({}, row);
                delete data.Id; delete data.AutoID; delete data.Sohopdong;
                return data;
            }
        },
        'frmHopDong': {
            id: 'btn-transfer-checkout',
            text: 'Quyết Toán',
            icon: 'receipt_long',
            targetHash: '#/checkout',
            storageKey: 'transfer_ContractToCheckout',
            getTransferData: function (row) {
                var data = Object.assign({}, row);
                delete data.Id; delete data.AutoID;
                return data;
            }
        }
    };

    function getExtraButtons(formName, getSelectedRows) {
        var config = FORM_CONFIG[formName];
        if (!config) return [];

        return [{
            id: config.id,
            text: config.text,
            icon: config.icon,
            type: 'tool',
            onClick: function () {
                var selectedRows = getSelectedRows();
                if (!selectedRows || selectedRows.length !== 1) {
                    if (window.Alert) Alert.warning('Chưa chọn dữ liệu', 'Vui lòng chọn 1 dòng duy nhất để ' + config.text + '.');
                    else alert('Vui lòng chọn 1 dòng!');
                    return;
                }

                var transferData = config.getTransferData(selectedRows[0]);
                sessionStorage.setItem(config.storageKey, JSON.stringify(transferData));
                window.location.hash = config.targetHash;
                _autoClickAdd();
            }
        }];
    }

    // --- XỬ LÝ AUTO-FILL KHI MỞ FORM THÊM MỚI ---
    var _observer = null;

    function _handleAutoFill() {
        var modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        var modalTitle = modalContent.querySelector('.modal-title');
        if (!modalTitle || modalTitle.innerText.indexOf('Thêm') === -1) return;

        var dataV2B = sessionStorage.getItem('transfer_VisitorToBooking');
        if (dataV2B) {
            _fillData(JSON.parse(dataV2B), 'Khách Tham Quan');
            sessionStorage.removeItem('transfer_VisitorToBooking');
            return;
        }

        var dataC2C = sessionStorage.getItem('transfer_ContractToCheckout');
        if (dataC2C) {
            _fillData(JSON.parse(dataC2C), 'Hợp Đồng Tiệc');
            sessionStorage.removeItem('transfer_ContractToCheckout');
            return;
        }
    }

    function _fillData(data, sourceName) {
        setTimeout(function () {
            var modalContent = document.querySelector('.modal-content');
            if (!modalContent) return;
            var filled = false;

            var tryFill = function (selectors, value) {
                if (!value) return;
                var els = modalContent.querySelectorAll(selectors);
                if (els.length > 0) {
                    els.forEach(function (el) {
                        el.value = value;
                        el.style.backgroundColor = '#f0fdf4';
                        el.style.borderColor = '#10b981';
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    filled = true;
                }
            };

            // Duyệt qua mapping động từ JSON data (keys chính là tên trường của form đích)
            Object.keys(data).forEach(function (fieldName) {
                var value = data[fieldName];
                if (!value) return; // Bỏ qua nếu không có giá trị

                // Tự động tạo selector thông minh bao phủ input, select, textarea
                var selector = 'input[name="' + fieldName + '"], ' +
                    'select[name="' + fieldName + '"], ' +
                    'textarea[name="' + fieldName + '"]';

                tryFill(selector, value);
            });

            if (filled && window.Toast) {
                Toast.success('Đã tự động điền thông tin từ ' + sourceName + '!');
            }
        }, 300);
    }

    function init() {
        if (_observer) _observer.disconnect();

        // Chỉ observe để auto-fill (chờ modal xuất hiện)
        _observer = new MutationObserver(function () {
            _handleAutoFill();
        });

        _observer.observe(document.body, { childList: true, subtree: true });
    }

    // Đăng ký Plugin vào hệ thống
    window.FormActionPlugins = window.FormActionPlugins || [];
    window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

    // Tự khởi động MutationObserver khi load (giống DocumentExportPlugin)
    init();

    return { getExtraButtons: getExtraButtons };
})();
