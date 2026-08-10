function createError(message, statusCode = 500, code = '') {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (code) error.code = code;
    return error;
}

function rowsOf(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.records)) return response.records;
    if (Array.isArray(response?.list)) return response.list;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.records)) return response.data.records;
    if (Array.isArray(response?.result)) return response.result;
    return [];
}

function normalizeRow(row) {
    return {
        formName: row?.FormName || row?.formName || '',
        loaiHD: row?.LoaiHD || row?.loaiHD || '',
        templateFile: row?.TemplateFile || row?.templateFile || '',
        description: row?.GhiChu || row?.ghiChu || row?.description || '',
        referenceCount: Number(row?.ReferenceCount ?? row?.referenceCount ?? 0)
    };
}

export function createContractTemplateRepository({ config }) {
    const gatewayUrl = `${config.sqlApiBase}/api/API_Gateway_Router`;
    const apiListName = config.templateRegistry.apiListName;

    function headers(context) {
        const result = { 'Content-Type': 'application/json', Connection: 'close' };
        if (context?.authorization) result.Authorization = context.authorization;
        return result;
    }

    async function execute(action, data, context) {
        let response;
        try {
            response = await fetch(gatewayUrl, {
                method: 'POST',
                headers: headers(context),
                body: JSON.stringify({
                    List: apiListName,
                    Func: 'Execute',
                    UserName: context?.userName || config.sqlApiUser || '',
                    JsonData: JSON.stringify({ action, ...data })
                }),
                signal: AbortSignal.timeout(20000)
            });
        } catch (error) {
            throw createError(`SQL API không phản hồi: ${error.message}`, 502, 'CONTRACT_TEMPLATE_GATEWAY_UNAVAILABLE');
        }

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw createError(body.msg || body.message || `SQL API trả HTTP ${response.status}.`, response.status);
        }
        const code = body?.code ?? body?.Code ?? body?.result?.code ?? body?.result?.Code;
        if (body?.success === false || (code !== undefined && String(code) !== '0')) {
            const message = body.msg || body.message || 'SQL API từ chối cập nhật mẫu hợp đồng.';
            const normalized = String(message).toLowerCase();
            const status = normalized.includes('đã tồn tại') || normalized.includes('duplicate') ? 409
                : normalized.includes('không tồn tại') ? 404
                    : String(code) === '2' ? 401 : 502;
            throw createError(message, status, 'CONTRACT_TEMPLATE_GATEWAY_REJECTED');
        }
        return rowsOf(body).map(normalizeRow);
    }

    async function list(formName, context) {
        return execute('LIST', { formName }, context);
    }

    async function find(formName, loaiHD, context) {
        const rows = await execute('GET', { formName, loaiHD }, context);
        return rows[0] || null;
    }

    async function create(record, context) {
        const rows = await execute('CREATE', record, context);
        if (!rows[0]) throw createError('SQL API không trả lại cấu hình vừa thêm.', 502);
        return rows[0];
    }

    async function update(formName, originalLoaiHD, record, context) {
        const rows = await execute('UPDATE', { ...record, formName, originalLoaiHD }, context);
        if (!rows[0]) throw createError('Cấu hình mẫu hợp đồng không còn tồn tại.', 404);
        return rows[0];
    }

    async function remove(formName, loaiHD, context) {
        const rows = await execute('DELETE', { formName, loaiHD }, context);
        if (!rows[0]) throw createError('Cấu hình mẫu hợp đồng không còn tồn tại.', 404);
        return rows[0];
    }

    async function countByFile(formName, templateFile, context) {
        const rows = await execute('COUNT_FILE', { formName, templateFile }, context);
        return Number(rows[0]?.referenceCount || 0);
    }

    return Object.freeze({ list, find, create, update, remove, countByFile });
}
