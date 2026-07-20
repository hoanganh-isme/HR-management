const SAFE_USER = /^[A-Za-z0-9_.@-]{1,50}$/;
const SAFE_BRANCH_ITEM = /^[A-Za-z0-9_.-]{1,100}$/;

export class FieldSyncAuthError extends Error {
    constructor(message, statusCode = 401) {
        super(message);
        this.name = 'FieldSyncAuthError';
        this.statusCode = statusCode;
    }
}

function decodeJwtUser(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return '';
    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        return String(payload.UserName || payload.username || payload.unique_name || payload.preferred_username || payload.sub || '').trim();
    } catch {
        throw new FieldSyncAuthError('Token xác thực không hợp lệ.');
    }
}

export function resolveFieldSyncContext(req) {
    const authorization = String(req.headers.authorization || '').trim();
    if (!authorization.toLowerCase().startsWith('bearer ') || authorization.length <= 7) {
        throw new FieldSyncAuthError('Thiếu token xác thực.');
    }

    const token = authorization.slice(7).trim();
    const headerUser = String(req.headers.username || '').trim();
    const jwtUser = decodeJwtUser(token);
    if (jwtUser && headerUser && jwtUser.toLowerCase() !== headerUser.toLowerCase()) {
        throw new FieldSyncAuthError('Người dùng không khớp với token.', 403);
    }

    const userName = jwtUser || headerUser;
    if (!SAFE_USER.test(userName)) throw new FieldSyncAuthError('Thiếu hoặc sai ngữ cảnh người dùng.');

    const rawBranch = String(req.headers.branchid || '').trim();
    if (rawBranch.length > 1000) throw new FieldSyncAuthError('Ngữ cảnh chi nhánh không hợp lệ.', 400);
    const branches = [...new Set(rawBranch.split(',').map((item) => item.trim()).filter(Boolean))];
    if (branches.some((item) => !SAFE_BRANCH_ITEM.test(item))) {
        throw new FieldSyncAuthError('Ngữ cảnh chi nhánh không hợp lệ.', 400);
    }
    const branchId = branches.sort((left, right) => left.localeCompare(right)).join(',');

    return Object.freeze({ authorization, userName, branchId });
}
