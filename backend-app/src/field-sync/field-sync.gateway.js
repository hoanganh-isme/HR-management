import axios from 'axios';
import crypto from 'node:crypto';
import { FIELD_SYNC_CONTRACTS } from './field-sync.config.js';

const SAFE_REGISTERED_LIST = /^[A-Za-z0-9_]{1,50}$/;

export class FieldSyncGatewayError extends Error {
    constructor(message = 'Không thể đọc metadata ERP.', statusCode = 502) {
        super(message);
        this.name = 'FieldSyncGatewayError';
        this.statusCode = statusCode;
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
    const explicitFailure = payload && (payload.success === false || payload.Success === false || payload.error === true || payload.Error === true);
    const invalidEnvelopeCode = payload && payload.code !== undefined && !Number.isFinite(envelopeCode) && records.length === 0;
    if (explicitFailure || invalidEnvelopeCode || (Number.isFinite(envelopeCode) && envelopeCode < 0) || (Number.isFinite(recordCode) && recordCode < 0)) {
        throw new FieldSyncGatewayError();
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
            throw new FieldSyncGatewayError('Không thể xác minh phiên đăng nhập.', 503);
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
        const payload = {
            List: list,
            Func: 'View',
            UserName: context.userName,
            Keyword: extra.keyword || '',
            Page: extra.page || 1,
            Limit: extra.limit || 50,
            JsonData: JSON.stringify({ ...jsonData, BranchID: context.branchId })
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
                throw new FieldSyncGatewayError('Không có quyền đọc metadata ERP.', error.response.status);
            }
            throw new FieldSyncGatewayError();
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
        registeredLookup(list, params, context) {
            if (!SAFE_REGISTERED_LIST.test(String(list || ''))) throw new FieldSyncGatewayError('Lookup chưa được đăng ký.', 409);
            return postGateway(list, context, params, {
                keyword: params.Keyword,
                page: params.Page,
                limit: params.PageSize
            });
        }
    });
}
