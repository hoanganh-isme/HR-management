import express from 'express';
import { resolveFieldSyncContext } from './field-sync.auth.js';
import { FieldSyncCache } from './field-sync.cache.js';
import { normalizeGridCompare, normalizeGridSchema, normalizeLookupSchema, normalizeRegisteredLookup } from './field-sync.resolver.js';

const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_LOOKUP_KEY = /^[A-Fa-f0-9]{64}$/;

function badRequest(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function validateFormName(value) {
    const formName = String(value || '').trim();
    if (!SAFE_FORM.test(formName)) throw badRequest('FormName không hợp lệ.');
    return formName;
}

function resolveFormNames(config, formName, requestedValue) {
    const aliases = config.aliases || {};
    const aliasKey = Object.keys(aliases).find((key) => key.toLowerCase() === formName.toLowerCase());
    const webFormName = aliasKey || formName;
    const erpFormName = (aliasKey && aliases[aliasKey]) || webFormName;
    if (requestedValue !== undefined && requestedValue !== null && requestedValue !== '') {
        const requested = validateFormName(requestedValue);
        if (requested.toLowerCase() !== erpFormName.toLowerCase()) {
            const error = new Error('Alias ERP không khớp cấu hình backend.');
            error.statusCode = 409;
            throw error;
        }
    }
    return { webFormName, erpFormName };
}

function cacheKey(kind, context, formName, extra = '') {
    return [kind, context.userName, context.branchId, formName, extra].join('|');
}

export function createFieldSyncRouter({ gateway, config, cache = new FieldSyncCache(config.cacheTtlMs, undefined, config.cacheMaxEntries) }) {
    const router = express.Router();

    router.use((req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });

    router.get('/grid-schema/:formName', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const names = resolveFormNames(config, validateFormName(req.params.formName), req.query.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('schema', context, formName, erpFormName);
            let schema = cache.get(key);
            if (!schema) {
                const rows = await gateway.gridSchema({ FormName: formName, ERPFormID: erpFormName }, context);
                schema = cache.set(key, normalizeGridSchema(rows, formName, erpFormName));
            }
            return res.json({ success: true, schema });
        } catch (error) {
            return next(error);
        }
    });

    router.get('/grid-schema/:formName/compare', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const names = resolveFormNames(config, validateFormName(req.params.formName), req.query.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('compare', context, formName, erpFormName);
            let comparison = cache.get(key);
            if (!comparison) {
                const rows = await gateway.gridCompare({ FormName: formName, ERPFormID: erpFormName }, context);
                comparison = cache.set(key, normalizeGridCompare(rows, formName, erpFormName));
            }
            return res.json({ success: true, comparison });
        } catch (error) {
            return next(error);
        }
    });

    router.post('/lookups/:lookupKey/search', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const lookupKey = String(req.params.lookupKey || '').trim();
            if (!SAFE_LOOKUP_KEY.test(lookupKey)) throw badRequest('LookupKey không hợp lệ.');
            const names = resolveFormNames(config, validateFormName(req.body?.formName), req.body?.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const keyword = String(req.body?.keyword || '').trim().slice(0, 200);
            const page = Math.max(1, Math.trunc(Number(req.body?.page) || 1));
            const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(req.body?.pageSize) || 30)));
            const params = { FormName: formName, ERPFormID: erpFormName, LookupKey: lookupKey, Keyword: keyword, Page: page, PageSize: pageSize };
            const rows = await gateway.lookupSchema(params, context);
            const descriptor = normalizeLookupSchema(rows);
            if (descriptor.mode === 'BLOCKED') {
                return res.status(409).json({ success: false, code: descriptor.diagnosticCode, message: 'Lookup này chưa có nguồn đọc an toàn được đăng ký.' });
            }
            let options = descriptor.options || [];
            if (descriptor.mode === 'REGISTERED_API') {
                const lookupRows = await gateway.registeredLookup(descriptor.registeredList, params, context);
                options = normalizeRegisteredLookup(lookupRows, descriptor);
                if (!options) {
                    return res.status(409).json({ success: false, code: 'LOOKUP_COLUMNS_MISMATCH', message: 'Lookup không trả đúng cột đã đăng ký.' });
                }
                options = options.slice(0, pageSize);
            }
            return res.json({ success: true, options, page, pageSize });
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
