import { getDashboardQuery } from './dashboard.contract.js';

class DashboardDataError extends Error {
    constructor() {
        super('Không thể tải dữ liệu dashboard.');
        this.name = 'DashboardDataError';
        this.statusCode = 503;
    }
}

function normalizeRecordsets(result) {
    const recordsets = Array.isArray(result?.recordsets)
        ? result.recordsets.filter(Array.isArray)
        : [];
    if (recordsets.length <= 1) return recordsets[0] || [];
    return recordsets;
}

export function createDashboardRepository({ sqlServer, gateway }) {
    if (!sqlServer && !gateway) throw new TypeError('Thiếu SQL Server hoặc Gateway cho dashboard.');

    return Object.freeze({
        async query(queryName, params, context) {
            const definition = getDashboardQuery(queryName);
            if (!definition) {
                const error = new Error('Dashboard query chưa được đăng ký.');
                error.statusCode = 400;
                throw error;
            }

            if (sqlServer) {
                try {
                    const pool = await sqlServer.getPool();
                    const request = pool.request()
                        .input('UserName', sqlServer.driver.VarChar(50), context.userName)
                        .input('BranchID', sqlServer.driver.NVarChar(sqlServer.driver.MAX), params.branchId || '');

                    if (definition.period) {
                        request.input('PeriodID', sqlServer.driver.VarChar(20), params.PeriodID || null);
                    }
                    if (definition.days) {
                        request.input('Days', sqlServer.driver.Int, params.Days || 30);
                    }

                    const result = await request.execute(definition.procedure);
                    return normalizeRecordsets(result);
                } catch (error) {
                    console.warn('[DASHBOARD_DB_FALLBACK]', {
                        queryName,
                        code: String(error?.code || 'SQL_ERROR'),
                        message: error?.message || String(error)
                    });
                }
            }

            if (gateway && typeof gateway.postGateway === 'function') {
                try {
                    const payload = {
                        UserName: context.userName,
                        BranchID: params.branchId || context.branchId || '',
                        PeriodID: params.PeriodID || null,
                        Days: params.Days || 30
                    };
                    const records = await gateway.postGateway(queryName, context, payload, { func: 'View' });
                    return records || [];
                } catch (gwErr) {
                    console.error('[DASHBOARD_GATEWAY_ERROR]', gwErr?.message || gwErr);
                }
            }

            return [];
        }
    });
}
