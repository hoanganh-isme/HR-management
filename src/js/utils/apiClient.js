/**
 * API Client Helper
 * Gói gọn logic gọi Fetch API, tự động gắn Base URL, Token, và xử lý lỗi chung.
 * Yêu cầu: Phải load sau env.js đ\u1ec3 s\u1eed d\u1ee5ng \u0111\u01b0\u1ee3c window.API_CONFIG
 */

const ApiClient = (function () {
    // Lấy Base URL từ env.js
    const getBaseUrl = () => {
        return window.API_CONFIG ? window.API_CONFIG.BASE_URL : '';
    };

    /**
     * Cookie helpers (Tương tự Medstand)
     */
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict${isSecure ? ';Secure' : ''}`;
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : '';
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }

    /**
     * Lấy auth token từ Cookie
     */
    function getAuthToken() {
        return getCookie('auth_token') || null;
    }

    /**
     * Một số SQL API response có thể chứa U+0000 trong giá trị chuỗi.
     * NUL thô làm JSON.parse thất bại; NUL đã escape vẫn gây lỗi cho Grid/export.
     * Chỉ loại đúng NUL, không trim khoảng trắng hoặc tab/newline hợp lệ.
     */
    function parseJsonResponse(text) {
        let nulCount = 0;
        const withoutRawNul = String(text || '').replace(/\u0000/g, function () {
            nulCount += 1;
            return '';
        });
        const parsed = JSON.parse(withoutRawNul, function (_key, value) {
            if (typeof value !== 'string' || value.indexOf('\u0000') === -1) return value;
            return value.replace(/\u0000/g, function () {
                nulCount += 1;
                return '';
            });
        });
        if (nulCount > 0) {
            console.warn('[ApiClient] Đã loại ' + nulCount + ' ký tự NUL khỏi JSON response.');
        }
        return parsed;
    }

    /**
     * Hàm gọi API cốt lõi
     */
    async function request(endpoint, options = {}) {
        const baseUrl = getBaseUrl();
        const logoutOnUnauthorized = options.logoutOnUnauthorized !== false;
        const requestOptions = { ...options };
        delete requestOptions.logoutOnUnauthorized;
        // Nếu endpoint đã là URL đầy đủ thì không nối BaseUrl nữa
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

        // Thiết lập Headers mặc định
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(requestOptions.headers || {})
        };

        // Gắn Bearer Token nếu có
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...requestOptions,
            headers
        };

        try {
            const response = await fetch(url, config);

            // Xử lý status 401 (Hết hạn token / Chưa đăng nhập)
            if (response.status === 401 && logoutOnUnauthorized) {
                console.warn('[ApiClient] 401 Unauthorized. Token expired?');
                if (typeof window.logoutApp === 'function') {
                    window.logoutApp();
                } else {
                    deleteCookie('auth_token');
                    localStorage.removeItem('pmql_user');
                    window.location.href = 'login.html';
                }
            }

            // Nếu response code không phải 2xx (Tức là bị lỗi Backend trả về)
            if (!response.ok) {
                let errorData;
                try {
                    const errorText = await response.text();
                    errorData = errorText ? parseJsonResponse(errorText) : {};
                } catch (e) {
                    errorData = { message: response.statusText || 'Lỗi kết nối Server' };
                }
                const error = new Error(errorData.message || 'Lỗi Server');
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            // Parse k\u1ebft qu\u1ea3
            const textResponse = await response.text();
            try {
                // Trả về Object nếu JSON hợp lệ
                return textResponse ? parseJsonResponse(textResponse) : {};
            } catch (err) {
                const contentType = response.headers && typeof response.headers.get === 'function'
                    ? String(response.headers.get('content-type') || '').toLowerCase()
                    : '';
                if (contentType.indexOf('json') !== -1) {
                    const parseError = new Error('Phản hồi JSON từ Server không hợp lệ.');
                    parseError.code = 'INVALID_JSON_RESPONSE';
                    parseError.cause = err;
                    throw parseError;
                }
                // Trả về text nguyên bản nếu trả v\u1ec1 \u0111\u1ecbnh d\u1ea1ng kh\u00e1c (plain text)
                return textResponse.replace(/\u0000/g, '');
            }

        } catch (error) {
            // Catch error network hoặc error tự throw ở trên
            console.error(`[API Error] ${options.method || 'GET'} ${url} :`, error);
            throw error; // Ném lỗi ra ngoài cho component/page xử lý hiện Toast báo lỗi
        }
    }

    /**
     * Normalize the response envelopes used by existing HR endpoints without
     * changing the wire contract. Consumers can safely handle records/list/data
     * and still inspect the original payload when they need status metadata.
     */
    function normalizeResponse(payload) {
        if (Array.isArray(payload)) return { records: payload, raw: payload };
        if (!payload || typeof payload !== 'object') return { records: [], raw: payload };
        var records = payload.records || payload.list || payload.data || payload.Records || payload.List || payload.Data;
        return { records: Array.isArray(records) ? records : [], raw: payload };
    }

    function requestRecords(endpoint, options) {
        return request(endpoint, options).then(normalizeResponse);
    }

    return {
        /**
         * G\u1eedi request GET
         */
        get: function (endpoint, options = {}) {
            return request(endpoint, { ...options, method: 'GET' });
        },

        /**
         * G\u1eedi request POST (Dữ liệu truyền vào th\u00f4ng qua body)
         */
        post: function (endpoint, data, options = {}) {
            return request(endpoint, {
                ...options,
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        /**
         * G\u1eedi request PUT (Th\u01b0\u1eddng d\u00f9ng \u0111\u1ec3 update)
         */
        put: function (endpoint, data, options = {}) {
            return request(endpoint, {
                ...options,
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        /**
         * G\u1eedi request DELETE
         */
        delete: function (endpoint, options = {}) {
            return request(endpoint, { ...options, method: 'DELETE' });
        },

        normalizeResponse: normalizeResponse,
        requestRecords: requestRecords,

        // Expose cookie helpers to be used globally (e.g., in login and logout)
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie
    };
})();

// Xuất ra để có thể dùng toàn cục trong file JS khác
window.ApiClient = ApiClient;
