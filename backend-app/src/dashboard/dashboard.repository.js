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

export function createDashboardRepository({ sqlServer }) {
    if (!sqlServer) throw new TypeError('Thiếu SQL Server cho dashboard.');

    return Object.freeze({
        async query(queryName, params, context) {
            const definition = getDashboardQuery(queryName);
            if (!definition) {
                const error = new Error('Dashboard query chưa được đăng ký.');
                error.statusCode = 400;
                throw error;
            }

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
                console.error('[DASHBOARD_DB]', {
                    code: String(error?.code || 'SQL_ERROR'),
                    number: Number.isInteger(error?.number) ? error.number : undefined
                });
                throw new DashboardDataError();
            }
        }
    });
}
