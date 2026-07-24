import axios from 'axios';
import crypto from 'node:crypto';
import { FIELD_SYNC_CONTRACTS } from './field-sync.config.js';

const SAFE_REGISTERED_LIST = /^[A-Za-z0-9_]{1,50}$/;

export class FieldSyncGatewayError extends Error {
    constructor(message = 'Không thể đọc metadata ERP.', statusCode = 502, diagnosticCode = 'ERP_GATEWAY_ERROR', details = {}) {
        super(message);
        this.name = 'FieldSyncGatewayError';
        this.statusCode = statusCode;
        this.diagnosticCode = diagnosticCode;
        const safeInput = details && typeof details === 'object' ? details : {};
        this.details = Object.freeze({
            upstreamStatus: Number.isInteger(safeInput.upstreamStatus) && safeInput.upstreamStatus >= 100 && safeInput.upstreamStatus <= 599
                ? safeInput.upstreamStatus
                : undefined,
            upstreamCode: Number.isInteger(safeInput.upstreamCode) && safeInput.upstreamCode >= -2147483648 && safeInput.upstreamCode <= 2147483647
                ? safeInput.upstreamCode
                : undefined,
            errorNumber: Number.isInteger(safeInput.errorNumber) && safeInput.errorNumber >= 0 && safeInput.errorNumber <= 2147483647
                ? safeInput.errorNumber
                : undefined
        });
    }
}

export function extractGatewayRecords(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    const records = payload.records || payload.list || payload.data || payload.Records || payload.List || payload.Data;
    if (Array.isArray(records)) return records;
    if (payload.FieldName || payload.fieldName || payload.LookupMode || payload.lookupMode) return [payload];
    return [];
}

function assertGatewaySuccess(payload, records) {
    const envelopeCode = Number(payload && payload.code);
    const recordCode = Number(records[0] && records[0].code);
    const upstreamCode = Number.isInteger(envelopeCode) ? envelopeCode : Number.isInteger(recordCode) ? recordCode : undefined;
    const errorNumber = Number(payload?.error_number ?? records[0]?.error_number);
    const explicitFailure = payload && (payload.success === false || payload.Success === false || payload.error === true || payload.Error === true);
    const invalidEnvelopeCode = payload && payload.code !== undefined && !Number.isFinite(envelopeCode) && records.length === 0;
    if (invalidEnvelopeCode) throw new FieldSyncGatewayError(undefined, 502, 'ERP_GATEWAY_ENVELOPE_INVALID');
    if (explicitFailure || (Number.isFinite(envelopeCode) && envelopeCode < 0) || (Number.isFinite(recordCode) && recordCode < 0)) {
        throw new FieldSyncGatewayError(undefined, 502, 'ERP_GATEWAY_ENVELOPE_REJECTED', {
            upstreamCode,
            errorNumber: Number.isInteger(errorNumber) ? errorNumber : undefined
        });
    }
}

function assertAuthSuccess(payload) {
    const code = Number(payload && payload.code);
    const explicitFailure = payload && (payload.success === false || payload.Success === false || payload.error === true || payload.Error === true);
    const invalidCode = payload && payload.code !== undefined && (!Number.isFinite(code) || code < 0);
    if (explicitFailure || invalidCode) throw new FieldSyncGatewayError('Phiên đăng nhập không hợp lệ.', 401);
}

export function createFieldSyncGateway(config, httpClient = axios) {
    const authCache = new Map();
    const authInflight = new Map();
    const authCacheMaxEntries = Number.isInteger(config.authCacheMaxEntries) && config.authCacheMaxEntries > 0
        ? config.authCacheMaxEntries
        : 1_000;
    const authCacheTtlMs = Number.isInteger(config.authCacheTtlMs) && config.authCacheTtlMs > 0
        ? config.authCacheTtlMs
        : 60_000;

    function authenticatedUser(payload) {
        const candidates = [
            payload,
            payload && payload.user,
            payload && payload.data && !Array.isArray(payload.data) ? payload.data : null,
            payload && Array.isArray(payload.data) ? payload.data[0] : null,
            payload && Array.isArray(payload.records) ? payload.records[0] : null,
            payload && Array.isArray(payload.list) ? payload.list[0] : null
        ].filter(Boolean);
        for (const candidate of candidates) {
            const user = candidate.UserName || candidate.userName || candidate.Username || candidate.username
                || candidate.unique_name || candidate.LoginName || candidate.TaiKhoan;
            if (user) return String(user).trim();
        }
        return '';
    }

    async function requestAuthenticatedUser(context) {
        try {
            const response = await httpClient.post(config.authVerifyUrl, {}, {
                timeout: config.requestTimeoutMs,
                headers: { Authorization: context.authorization }
            });
            const payload = response && response.data;
            assertAuthSuccess(payload);
            const userName = authenticatedUser(payload);
            if (!userName) throw new FieldSyncGatewayError('Không xác minh được phiên đăng nhập.', 401);
            return userName;
        } catch (error) {
            if (error instanceof FieldSyncGatewayError) throw error;
            const status = error && error.response && error.response.status;
            if (status === 401 || status === 403) throw new FieldSyncGatewayError('Phiên đăng nhập không hợp lệ.', status);
            throw new FieldSyncGatewayError('Không thể xác minh phiên đăng nhập.', 503, 'ERP_AUTH_UNAVAILABLE');
        }
    }

    function pruneAuthCache(now) {
        for (const [key, item] of authCache) {
            if (item.expiresAt <= now) authCache.delete(key);
        }
    }

    function cacheAuthenticatedUser(cacheKey, userName, now) {
        pruneAuthCache(now);
        authCache.delete(cacheKey);
        while (authCache.size >= authCacheMaxEntries) authCache.delete(authCache.keys().next().value);
        authCache.set(cacheKey, { userName, expiresAt: now + authCacheTtlMs });
    }

    async function verifySession(context) {
        const cacheKey = crypto.createHash('sha256').update(context.authorization).digest('hex');
        const now = Date.now();
        const cached = authCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            authCache.delete(cacheKey);
            authCache.set(cacheKey, cached);
            if (cached.userName.toLowerCase() !== context.userName.toLowerCase()) {
                throw new FieldSyncGatewayError('Người dùng không khớp với phiên đăng nhập.', 403);
            }
            return;
        }
        if (cached) authCache.delete(cacheKey);

        let pending = authInflight.get(cacheKey);
        if (!pending) {
            pending = requestAuthenticatedUser(context);
            authInflight.set(cacheKey, pending);
        }
        let userName;
        try {
            userName = await pending;
        } finally {
            if (authInflight.get(cacheKey) === pending) authInflight.delete(cacheKey);
        }
        if (userName.toLowerCase() !== context.userName.toLowerCase()) {
            throw new FieldSyncGatewayError('Người dùng không khớp với phiên đăng nhập.', 403);
        }
        cacheAuthenticatedUser(cacheKey, userName, Date.now());
    }

    async function postGateway(list, context, jsonData, extra = {}) {
        await verifySession(context);
        const keyword = String(extra.keyword || jsonData?.Keyword || '');
        const page = Number(extra.page || jsonData?.Page || 1);
        const pageSize = Number(extra.limit || jsonData?.PageSize || 50);
        /*
         * API_Gateway_Router has a fixed wire contract.  FormName, ERPFormID,
         * LookupKey and PageSize are deliberately carried in JsonData because
         * they are not parameters of the router procedure itself.  Sending
         * arbitrary top-level properties makes stricter HTTP model binders
         * reject the request before SQL is reached.
         */
        const payload = {
            List: list,
            Func: String(extra.func || 'View'),
            UserName: context.userName,
            Keyword: keyword,
            Page: page,
            Limit: pageSize,
            JsonData: JSON.stringify({ ...jsonData, BranchID: context.branchId, UserName: context.userName })
        };

        try {
            const response = await httpClient.post(config.sqlGatewayUrl, payload, {
                timeout: config.requestTimeoutMs,
                headers: {
                    Authorization: context.authorization,
                    Username: context.userName,
                    BranchID: context.branchId
                }
            });
            const body = response && response.data;
            const records = extractGatewayRecords(body);
            assertGatewaySuccess(body, records);
            return records;
        } catch (error) {
            if (error instanceof FieldSyncGatewayError) throw error;
            if (error && (error.response?.status === 401 || error.response?.status === 403)) {
                throw new FieldSyncGatewayError('Không có quyền đọc metadata ERP.', error.response.status, 'ERP_GATEWAY_AUTH_REJECTED');
            }
            const upstreamStatus = Number(error?.response?.status);
            if (Number.isInteger(upstreamStatus) && upstreamStatus >= 100 && upstreamStatus <= 599) {
                throw new FieldSyncGatewayError(undefined, 502, 'ERP_GATEWAY_HTTP_ERROR', { upstreamStatus });
            }
            if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || /timeout/i.test(String(error?.message || ''))) {
                throw new FieldSyncGatewayError(undefined, 504, 'ERP_GATEWAY_TIMEOUT');
            }
            if (['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'ERR_NETWORK'].includes(error?.code)) {
                throw new FieldSyncGatewayError(undefined, 502, 'ERP_GATEWAY_NETWORK');
            }
            throw new FieldSyncGatewayError(undefined, 502, 'ERP_GATEWAY_UNKNOWN');
        }
    }

    return Object.freeze({
        verifySession,
        gridSchema(params, context) {
            return postGateway(FIELD_SYNC_CONTRACTS.gridSchema, context, params);
        },
        gridCompare(params, context) {
            return postGateway(FIELD_SYNC_CONTRACTS.gridCompare, context, params);
        },
        lookupSchema(params, context) {
            return postGateway(FIELD_SYNC_CONTRACTS.lookupSchema, context, params, {
                keyword: params.Keyword,
                page: params.Page,
                limit: params.PageSize
            });
        },
        joinSchema(params, context) {
            return postGateway(FIELD_SYNC_CONTRACTS.joinSchema, context, params);
        },
        registeredLookup(list, params, context) {
            if (!SAFE_REGISTERED_LIST.test(String(list || ''))) throw new FieldSyncGatewayError('Lookup chưa được đăng ký.', 409);
            return postGateway(list, context, params, {
                keyword: params.Keyword,
                page: params.Page,
                limit: params.PageSize
            });
        },
        async updateFieldFormat(params, context) {
            return await postGateway(FIELD_SYNC_CONTRACTS.updateFieldFormat, context, params, { func: 'View' });
        },
        formatList(context) {
            return postGateway(FIELD_SYNC_CONTRACTS.formatList, context, {});
        }
    });
}
