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
            if (window.location.protocol === 'https:') return '103.232.122.205';

            var hostname = window.location.hostname;
            // Kiểm tra xem có phải chạy local hay không (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x, hoặc mở trực tiếp file://)
            var isLocal = hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname === '::1' ||
                hostname === '' ||
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
            // Nếu không phải chạy local (ví dụ chạy qua domain kyhoa.bms7.net hoặc IP remote khác), dùng hostname hiện tại
            if (!isLocal) {
                return hostname || '103.232.122.205';
            }
            return hostname || '10.10.10.254';
        }
        return '103.232.122.205';
    },

    get ONLYOFFICE_HOST() {
        return this.BACKEND_HOST + ':8000';
    }
};

// 2. Cấu hình API chi tiết
// Shared application settings. Keep product identity and storage keys in one
// place so old base-code names do not leak across the HR app.
window.APP_SETTINGS = {
    appCode: 'hrm',
    legacyAppCode: 'pmql',
    productName: 'Quản lý Nhân sự',
    productTitle: 'HR Management',
    adminGroupIds: ['Admin'],
    documentDefaultUserName: 'Nhân viên nhân sự',
    disabledLegacyRoutes: [
        '/categories',
        '/inventory',
        '/cash-flow',
        '/calendar',
        '/promotions',
        '/report-revenue',
        '/report-cost',
        '/report-other',
        '/survey',
        '/hall-status'
    ],
    storageKey: function (name) {
        return this.appCode + '_' + name;
    },
    legacyStorageKey: function (name) {
        return this.legacyAppCode + '_' + name;
    },
    getStored: function (name, fallback) {
        var value = localStorage.getItem(this.storageKey(name));
        if (value === null || value === undefined) {
            value = localStorage.getItem(this.legacyStorageKey(name));
        }
        return value !== null && value !== undefined ? value : fallback;
    },
    setStored: function (name, value) {
        localStorage.setItem(this.storageKey(name), value);
    },
    removeStored: function (name) {
        localStorage.removeItem(this.storageKey(name));
        localStorage.removeItem(this.legacyStorageKey(name));
    },
    getSession: function (name, fallback) {
        var value = sessionStorage.getItem(this.storageKey(name));
        if (value === null || value === undefined) {
            value = sessionStorage.getItem(this.legacyStorageKey(name));
        }
        return value !== null && value !== undefined ? value : fallback;
    },
    setSession: function (name, value) {
        sessionStorage.setItem(this.storageKey(name), value);
    },
    removeSession: function (name) {
        sessionStorage.removeItem(this.storageKey(name));
        sessionStorage.removeItem(this.legacyStorageKey(name));
    },
    isLegacyRouteDisabled: function (path) {
        return this.disabledLegacyRoutes.indexOf(path) !== -1;
    }
};

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
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/docserver/api/documents'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8083/api/documents';
            },
            get CONTRACT_API_BASE() {
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/docserver/api'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8083/api';
            },
            get ONLYOFFICE_API() {
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/onlyoffice/web-apps/apps/api/documents/api.js'
                    : 'http://' + ENV_VARS.ONLYOFFICE_HOST + '/web-apps/apps/api/documents/api.js';
            },
            get UPLOADS_URL() {
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/docserver/uploads/'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8083/uploads/';
            },
            get SAMPLES_URL() {
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/docserver/samples/'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8083/samples/';
            },
            get UPLOAD_LOGO_API() {
                var useProxy = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
                var origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                return useProxy
                    ? origin + '/docserver/api/upload-logo'
                    : 'http://' + ENV_VARS.BACKEND_HOST + ':8083/api/upload-logo';
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

        SYSTEM: {
            SHIFTS: '/api/API_DanhSachCaLam',
            SETUP_VALUE: '/api/API_LayGiaTriSetup',
            GET_UI_DICTIONARY: '/api/API_LayCacTruongGiaoDien',
            GET_FIELDS_LIST: '/api/API_DanhSachTruongGiaoDien',
            SAVE_FIELD: '/api/API_LuuTruongGiaoDien',
            DELETE_FIELD: '/api/API_XoaTruongGiaoDien'
        },
        CALENDAR: {
            LIST: '/api/API_DanhSachLich',
            SAVE: '/api/API_LuuLich',
            LEGEND: '/api/API_LayChuThichLich'
        },
        STAFF: {
            LIST: '/api/API_DanhSachNhanVien',
            SAVE: '/api/API_LuuNhanVien',
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
