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
     * Hàm gọi API cốt lõi
     */
    async function request(endpoint, options = {}) {
        const baseUrl = getBaseUrl();
        // Nếu endpoint đã là URL đầy đủ thì không nối BaseUrl nữa
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

        // Thiết lập Headers mặc định
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        // Gắn Bearer Token nếu có
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            // Xử lý status 401 (Hết hạn token / Chưa đăng nhập)
            if (response.status === 401) {
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
                    errorData = await response.json();
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
                return textResponse ? JSON.parse(textResponse) : {};
            } catch (err) {
                // Trả về text nguyên bản nếu trả v\u1ec1 \u0111\u1ecbnh d\u1ea1ng kh\u00e1c (plain text)
                return textResponse;
            }

        } catch (error) {
            // Catch error network hoặc error tự throw ở trên
            console.error(`[API Error] ${options.method || 'GET'} ${url} :`, error);
            throw error; // Ném lỗi ra ngoài cho component/page xử lý hiện Toast báo lỗi
        }
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

        // Expose cookie helpers to be used globally (e.g., in login and logout)
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie
    };
})();

// Xuất ra để có thể dùng toàn cục trong file JS khác
window.ApiClient = ApiClient;
