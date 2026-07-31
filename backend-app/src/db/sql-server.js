import sql from 'mssql';

let sharedPool = null;
let sharedPoolPromise = null;
let sharedConfigKey = '';

function readBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createConfig(env) {
    const server = String(env.SQL_SERVER || '').trim();
    const database = String(env.SQL_DATABASE || '').trim();
    const user = String(env.SQL_USER || '').trim();
    const password = String(env.SQL_PASSWORD || '');
    if (!server || !database || !user || !password) {
        const error = new Error(
            'Thiếu SQL_SERVER, SQL_DATABASE, SQL_USER hoặc SQL_PASSWORD cho Bulk Import.'
        );
        error.code = 'EXCEL_IMPORT_SQL_CONFIG_MISSING';
        error.statusCode = 503;
        throw error;
    }
    return {
        server,
        port: positiveInteger(env.SQL_PORT, 1433),
        database,
        user,
        password,
        options: {
            encrypt: readBoolean(env.SQL_ENCRYPT, true),
            trustServerCertificate: readBoolean(env.SQL_TRUST_SERVER_CERTIFICATE, false)
        },
        pool: {
            max: positiveInteger(env.SQL_POOL_MAX, 10),
            min: 0,
            idleTimeoutMillis: 30_000
        },
        connectionTimeout: positiveInteger(env.SQL_CONNECT_TIMEOUT_MS, 15_000),
        requestTimeout: positiveInteger(env.SQL_REQUEST_TIMEOUT_MS, 300_000)
    };
}

export function createSqlServer(env = process.env) {
    async function getPool() {
        const config = createConfig(env);
        const key = JSON.stringify({
            server: config.server,
            port: config.port,
            database: config.database,
            user: config.user
        });
        if (sharedPool && sharedConfigKey === key && sharedPool.connected) return sharedPool;
        if (sharedPoolPromise && sharedConfigKey === key) return sharedPoolPromise;
        if (sharedPool && sharedConfigKey !== key) {
            await close();
        }
        sharedConfigKey = key;
        const pool = new sql.ConnectionPool(config);
        pool.on('error', (error) => {
            console.error('[SQL_SERVER] Pool lỗi:', error.code || error.message);
            if (sharedPool === pool) {
                sharedPool = null;
                sharedPoolPromise = null;
            }
        });
        sharedPoolPromise = pool.connect()
            .then((connected) => {
                sharedPool = connected;
                return connected;
            })
            .catch((error) => {
                sharedPool = null;
                sharedPoolPromise = null;
                throw error;
            });
        return sharedPoolPromise;
    }

    async function close() {
        const pool = sharedPool;
        sharedPool = null;
        sharedPoolPromise = null;
        sharedConfigKey = '';
        if (pool) await pool.close();
    }

    return Object.freeze({ driver: sql, getPool, close });
}
