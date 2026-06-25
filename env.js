/**
 * ============================================================
 *  HR MANAGEMENT — CẤU HÌNH HỆ THỐNG
 *  File này là nơi định nghĩa toàn bộ cấu hình API của hệ thống
 * ============================================================
 */

// 1. Tham số môi trường (Environment Variables)
const ENV_VARS = {
    API_BASE: 'http://nhansu2.bms79.com', // Domain backend thực tế

    // Tự động phát hiện HOST chạy (Local dev vs Production)
    get BACKEND_HOST() {
        if (typeof window !== 'undefined' && window.location) {
            // Nếu chạy trên HTTPS (production), dùng IP máy chủ
            if (window.location.protocol === 'https:') return '103.190.38.46';
            
            var hostname = window.location.hostname;
            // Kiểm tra xem có phải chạy local hay không (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
            var isLocal = hostname === 'localhost' || 
                          hostname === '127.0.0.1' || 
                          hostname === '::1' || 
                          hostname.startsWith('192.168.') || 
                          hostname.startsWith('10.');
            if (hostname.startsWith('172.')) {
                var parts = hostname.split('.');
                if (parts.length >= 2) {
                    var sec = parseInt(parts[1], 10);
                    if (sec >= 16 && sec <= 31) {
                        isLocal = true;
                    }
                }
            }
            // Nếu không phải chạy local (ví dụ chạy qua domain net), dùng IP máy chủ thực tế
            if (!isLocal) {
                return '103.190.38.46';
            }
            return hostname;
        }
        return '103.190.38.46';
    },

    get ONLYOFFICE_HOST() {
        return this.BACKEND_HOST;
    }
};

// 2. Cấu hình API chi tiết
window.API_CONFIG = {
    BASE_URL: ENV_VARS.API_BASE,

    ENDPOINTS: {
        ROUTER: '/api/API_Gateway_Router',
        AUTH: {
            LOGIN: '/api/login',
            LOGOUT: '/logout',
            USER_INFO: '/api/API_UserInfo',
        },

        DOCUMENT_MANAGER: {
            NODE_IP: ENV_VARS.BACKEND_HOST,
            get BASE_API() {
                var isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
                return isHttps 
                    ? ENV_VARS.API_BASE + '/docserver/api/documents'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8081/api/documents';
            },
            get ONLYOFFICE_API() {
                var isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
                return isHttps
                    ? ENV_VARS.API_BASE + '/onlyoffice/web-apps/apps/api/documents/api.js'
                    : 'http://' + ENV_VARS.ONLYOFFICE_HOST + ':8082/web-apps/apps/api/documents/api.js';
            },
            get UPLOADS_URL() {
                var isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
                return isHttps
                    ? ENV_VARS.API_BASE + '/docserver/uploads/'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8081/uploads/';
            },
            get SAMPLES_URL() {
                var isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
                return isHttps
                    ? ENV_VARS.API_BASE + '/docserver/samples/'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8081/samples/';
            },
            get UPLOAD_LOGO_API() {
                var isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
                return isHttps
                    ? ENV_VARS.API_BASE + '/docserver/api/upload-logo'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8081/api/upload-logo';
            }
        },

        PERMISSIONS: {
            SYNC: '/api/API_DongBoQuyenTruyCap',
            GET_MENU_BY_GROUP: '/api/API_LayMenuTheoNhomQuyen',
            GET_ALL_MENUS_FOR_GROUP: '/api/API_LayQuyenNhomDayDu',
            SAVE_GROUP_PERMISSIONS: '/api/API_LuuQuyenCuaNhom',
            GET_GROUP_LIST: '/api/API_LayDanhSachNhom',
            GET_VERSION: '/api/API_LayPhienBanQuyen',
            GET_MY_PERMISSIONS: '/api/API_LayQuyenCuaToi',
        },

        BOOKING: {
            LIST: '/api/API_DanhSachPhieuCoc',
            SAVE: '/api/API_LuuPhieuCoc',
            CANCEL: '/api/API_HuyPhieuCoc',
            DELETE: '/api/API_XoaPhieuCoc',
        },
        CUSTOMER: {
            SEARCH: '/api/API_DanhSachKhachHang',
            SAVE: '/api/API_LuuKhachHang',
        },
        SYSTEM: {
            HALLS: '/api/API_DanhSachSanh',
            SHIFTS: '/api/API_DanhSachCaLam',
            BANQUET_TYPES: '/api/API_DanhSachLoaiHinhTiec',
            SETUP_VALUE: '/api/API_LayGiaTriSetup',
            GET_UI_DICTIONARY: '/api/API_LayCacTruongGiaoDien',
            GET_FIELDS_LIST: '/api/API_DanhSachTruongGiaoDien',
            SAVE_FIELD: '/api/API_LuuTruongGiaoDien',
            DELETE_FIELD: '/api/API_XoaTruongGiaoDien'
        },
        CONTRACT: {
            LIST: '/api/API_DanhSachHopDong',
            SAVE: '/api/API_LuuHopDong',
        },
        FOODS: {
            LIST: '/api/API_DanhSachThucDon',
        },
        CALENDAR: {
            LIST: '/api/API_DanhSachLich',
            SAVE: '/api/API_LuuLich',
            LEGEND: '/api/API_LayChuThichLich'
        },
        REPORTS: {
            SALES_STATS: '/api/API_Report_SalesStats',
            REVENUE: '/api/API_Report_Revenue',
            COST: '/api/API_Report_Cost',
        },
        VISITOR: {
            LIST: '/api/API_DanhSachKhachDen',
            SAVE: '/api/API_LuuKhachDen',
        },
        STAFF: {
            LIST: '/api/API_DanhSachNhanVien',
            SAVE: '/api/API_LuuNhanVien',
        },
        CHECKOUT: {
            LIST: '/api/API_DanhSachQuyetToan',
            SAVE: '/api/API_LuuQuyenToan',
            CONTRACT_LIST: '/api/API_DanhSachHopDong',
        },
        MENUS: {
            GET_ALL: '/api/API_LayDanhSachMenuTatCa',
            SAVE: '/api/API_LuuMenu',
            DELETE: '/api/API_XoaMenu',
            UPDATE_ORDER: '/api/API_LuuThuTuMenu',
        }
    }
};

// Đảm bảo biến có thể truy cập trực tiếp bằng tên trong tất cả các scope
var API_CONFIG = window.API_CONFIG;

// Đóng băng config trong runtime
Object.freeze(window.API_CONFIG);
Object.freeze(window.API_CONFIG.ENDPOINTS);
