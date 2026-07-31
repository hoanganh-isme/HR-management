import express from 'express';
import { resolveFieldSyncContext } from '../field-sync/field-sync.auth.js';
import { getDashboardQuery } from './dashboard.contract.js';

const SAFE_BRANCH = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_PERIOD = /^[A-Za-z0-9_.-]{1,20}$/;

function badRequest(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function normalizeRequestedBranch(value) {
    const branchId = String(value || '').trim();
    if (!branchId) return '';
    if (!SAFE_BRANCH.test(branchId)) throw badRequest('BranchID không hợp lệ.');
    return branchId.toUpperCase();
}

function normalizeQueryParams(query, input) {
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const result = {};

    if (query.period) {
        const periodId = String(source.PeriodID || source.periodId || '').trim();
        if (periodId && !SAFE_PERIOD.test(periodId)) throw badRequest('PeriodID không hợp lệ.');
        if (periodId) result.PeriodID = periodId;
    }

    if (query.days) {
        const rawDays = source.Days ?? source.days;
        if (rawDays !== undefined && rawDays !== null && rawDays !== '') {
            const days = Number(rawDays);
            if (!Number.isInteger(days) || days < 1 || days > 366) {
                throw badRequest('Số ngày thống kê không hợp lệ.');
            }
            result.Days = days;
        }
    }

    return result;
}

export function createDashboardRouter({ gateway, repository }) {
    if (!gateway || !repository) throw new TypeError('Thiếu dịch vụ bắt buộc cho dashboard.');
    const router = express.Router();

    router.use((_req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });

    router.post('/query', async (req, res, next) => {
        try {
            const list = String(req.body?.list || '').trim();
            const query = getDashboardQuery(list);
            if (!query) throw badRequest('Dashboard query chưa được đăng ký.');

            const context = resolveFieldSyncContext(req);
            const requestedBranch = normalizeRequestedBranch(req.body?.branchId);
            const params = normalizeQueryParams(query, req.body?.params);
            await gateway.verifySession(context);
            const records = await repository.query(list, {
                ...params,
                /*
                 * Đây chỉ là phạm vi người dùng yêu cầu. Stored procedure tiếp
                 * tục giao với SY_User.BranchID và không tin quyền từ client.
                 */
                branchId: requestedBranch
            }, context);

            return res.json({ success: true, records });
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
