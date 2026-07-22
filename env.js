/**
 * ============================================================
 *  HR MANAGEMENT — CẤU HÌNH HỆ THỐNG
 *  File này là nơi định nghĩa toàn bộ cấu hình API của hệ thống
 * ============================================================
 */

function isLocalDocumentDevelopment() {
    if (typeof window === 'undefined' || !window.location) return false;
    return window.location.protocol === 'file:' ||
        window.location.port === '5500' ||
        window.location.port === '4173';
}

var HRM_RUNTIME_CONFIG = (typeof window !== 'undefined' && window.HRM_RUNTIME_CONFIG) || {};
var HRM_FRONTEND_ORIGIN = (typeof window !== 'undefined' && window.location && /^https?:$/.test(window.location.protocol))
    ? window.location.origin
    : '';
var HRM_LOCAL_DOCUMENT_DEVELOPMENT = isLocalDocumentDevelopment();
var HRM_DOCUMENT_SERVICE_BASE = HRM_RUNTIME_CONFIG.DOCUMENT_SERVICE_BASE ||
    (HRM_LOCAL_DOCUMENT_DEVELOPMENT ? 'http://127.0.0.1:8081' : HRM_FRONTEND_ORIGIN + '/docserver');

/*
 * Phase 2 pilot: dùng Form Contract V2 cho đúng một form.
 * Cấu hình được inject từ môi trường vẫn có quyền override các giá trị này,
 * kể cả enabled:false để rollback khẩn cấp.
 */
HRM_RUNTIME_CONFIG.FIELD_SYNC = Object.assign({
    enabled: true,
    shadowMode: false,
    pilotForms: ['WA_BangThueTNCNFrm'],
    pollSeconds: 30,
    metadataBaseUrl: HRM_DOCUMENT_SERVICE_BASE.replace(/\/+$/, '') + '/api/metadata'
}, HRM_RUNTIME_CONFIG.FIELD_SYNC || {});

if (typeof window !== 'undefined') {
    window.HRM_RUNTIME_CONFIG = HRM_RUNTIME_CONFIG;
}

// 1. Tham số môi trường (Environment Variables)
const ENV_VARS = {
    API_BASE: 'http://nhansu2.bms79.com', // Domain backend thực tế
    DOCUMENT_SERVICE_BASE: HRM_DOCUMENT_SERVICE_BASE,
    ONLYOFFICE_PUBLIC_URL: HRM_RUNTIME_CONFIG.ONLYOFFICE_PUBLIC_URL || (HRM_LOCAL_DOCUMENT_DEVELOPMENT ? 'http://127.0.0.1:8001' : HRM_FRONTEND_ORIGIN + '/onlyoffice'),

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
        return this.BACKEND_HOST + ':8001';
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
            USER_INFO: '/api/userinfo',
        },

        DOCUMENT_MANAGER: {
            SERVICE_BASE: ENV_VARS.DOCUMENT_SERVICE_BASE,
            CONTRACT_API_BASE: ENV_VARS.DOCUMENT_SERVICE_BASE + '/api',
            LEGACY_DOCUMENT_API_BASE: ENV_VARS.DOCUMENT_SERVICE_BASE + '/api/documents',
            ONLYOFFICE_PUBLIC_URL: ENV_VARS.ONLYOFFICE_PUBLIC_URL,
            NODE_IP: '127.0.0.1',
            get BASE_API() { return this.LEGACY_DOCUMENT_API_BASE; },
            get ONLYOFFICE_API() {
                return this.ONLYOFFICE_PUBLIC_URL + '/web-apps/apps/api/documents/api.js';
            },
            get UPLOADS_URL() {
                return this.SERVICE_BASE + '/uploads/';
            },
            get SAMPLES_URL() {
                return this.SERVICE_BASE + '/samples/';
            },
            get UPLOAD_LOGO_API() {
                return this.SERVICE_BASE + '/api/upload-logo';
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
