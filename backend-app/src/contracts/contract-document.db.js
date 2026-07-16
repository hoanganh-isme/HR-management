import axios from 'axios';

function createError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function rowsOf(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.records)) return response.records;
    if (Array.isArray(response?.list)) return response.list;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.records)) return response.data.records;
    return [];
}

function isTrue(value) {
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
}

function normalizeGroup(row) {
    return row?.UserGroupID || row?.userGroupID || row?.userGroupId || row?.Group || row?.GroupUser || row?.GroupID || '';
}

function normalizeBranches(row) {
    const raw = row?.BranchID ?? row?.branchID ?? row?.branchId ?? '';
    return String(raw)
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);
}

export function createContractDocumentDb(config) {
    const gatewayUrl = `${config.sqlApiBase}/api/API_Gateway_Router`;

    function headers(context) {
        const result = { 'Content-Type': 'application/json', Connection: 'close' };
        if (context?.authorization) result.Authorization = context.authorization;
        return result;
    }

    function assertGatewayResponse(body) {
        const code = body?.code ?? body?.Code ?? body?.result?.code ?? body?.result?.Code;
        if (code !== undefined && String(code) !== '0') {
            const status = String(code) === '2' ? 401 : 502;
            throw createError(body.msg || body.message || 'SQL API Gateway từ chối request.', status);
        }
        return body;
    }

    async function postJson(url, payload, context, timeoutMs = 20000) {
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: headers(context),
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(timeoutMs)
            });
        } catch (error) {
            throw createError(`SQL API không phản hồi hợp lệ: ${error.message}`, 502);
        }
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw createError(body.msg || body.message || `SQL API trả HTTP ${response.status}.`, response.status);
        }
        return body;
    }

    async function gateway(payload, context, method = 'get') {
        const requestPayload = {
            ...payload,
            UserName: payload.UserName || context?.userName || config.sqlApiUser || ''
        };
        try {
            if (method === 'post') {
                return assertGatewayResponse(await postJson(gatewayUrl, requestPayload, context, 20000));
            }
            const query = encodeURIComponent(JSON.stringify(requestPayload));
            const response = await axios.get(`${gatewayUrl}?q=${query}`, { headers: headers(context), timeout: 20000 });
            return assertGatewayResponse(response.data);
        } catch (error) {
            if (error.statusCode) throw error;
            const detail = error.response?.data?.msg || error.response?.data?.message || error.message;
            throw createError(`SQL API không phản hồi hợp lệ: ${detail}`, error.response?.status || 502);
        }
    }

    async function authenticate(authorization, claimedUserName = '') {
        const bearer = String(authorization || '').trim();
        if (!/^Bearer\s+\S+$/i.test(bearer)) {
            throw createError('Cần đăng nhập để sử dụng chức năng tài liệu hợp đồng.', 401);
        }
        const claimed = String(claimedUserName || '').trim();
        if (!claimed) throw createError('Không xác định được tài khoản của phiên đăng nhập.', 401);
        const context = { authorization: bearer, userName: claimed };
        const response = await gateway({
            List: 'WA_NguoiDungFrm',
            Func: 'View',
            Keyword: claimed,
            SortColumn: 'UserName',
            SortDir: 'ASC',
            Page: 1,
            Limit: 100
        }, context);
        const authenticatedUser = rowsOf(response).find((row) =>
            String(row.UserName || row.Username || row.username || row.TaiKhoan || '').toLowerCase() === claimed.toLowerCase()
        );
        if (!authenticatedUser) throw createError('Phiên đăng nhập không khớp với người dùng trong WA_NguoiDungFrm.', 401);
        return { ...context, authenticatedUser };
    }

    async function getUserAccess(context) {
        const response = context.authenticatedUser ? null : await gateway({
            List: 'WA_NguoiDungFrm', Func: 'View', Keyword: context.userName,
            SortColumn: 'UserName', SortDir: 'ASC', Page: 1, Limit: 100
        }, context);
        const user = context.authenticatedUser || rowsOf(response).find((row) =>
            String(row.UserName || row.Username || row.username || row.TaiKhoan || '').toLowerCase() === context.userName.toLowerCase()
        );
        if (!user) throw createError('Không xác định được người dùng trong WA_NguoiDungFrm.', 403);

        const isAdmin = String(normalizeGroup(user)).toLowerCase() === 'admin';
        const branches = normalizeBranches(user);
        if (!isAdmin && branches.length === 0) {
            throw createError('Người dùng chưa được gán chi nhánh nên không thể xử lý hợp đồng.', 403);
        }

        let permission = null;
        if (!isAdmin) {
            try {
                const permissionResponse = await postJson(
                    `${config.sqlApiBase}/api/API_LayQuyenCuaToi`,
                    { Username: context.userName },
                    context,
                    10000
                );
                permission = rowsOf(permissionResponse).find((row) =>
                    String(row.FormName || row.formName || row.formname || '').toLowerCase() === config.contractFormName.toLowerCase()
                );
            } catch (error) {
                const detail = error.response?.data?.msg || error.response?.data?.message || error.message;
                throw createError(`Không kiểm tra được quyền hợp đồng: ${detail}`, error.response?.status || 502);
            }
            if (!permission) throw createError('Người dùng không có quyền truy cập form hợp đồng.', 403);
        }

        const canView = isAdmin || isTrue(permission?.CanView) || isTrue(permission?.IsRun) || isTrue(permission?.canView);
        const canWrite = isAdmin
            || isTrue(permission?.CanAdd)
            || isTrue(permission?.CanEdit)
            || isTrue(permission?.IsAdd)
            || isTrue(permission?.IsUpdate)
            || isTrue(permission?.canAdd)
            || isTrue(permission?.canEdit);
        if (!canView) throw createError('Người dùng không có quyền xem hợp đồng.', 403);

        return { user, isAdmin, branches, canView, canWrite };
    }

    async function listTemplates(context) {
        const access = await getUserAccess(context);
        if (!access.canWrite) throw createError('Người dùng không có quyền xuất hoặc sửa tài liệu hợp đồng.', 403);
        const response = await gateway({
            List: config.templateListName,
            Func: 'View',
            Keyword: config.contractFormName,
            Page: 1,
            Limit: 1000
        }, context);
        return rowsOf(response).filter((row) =>
            !row.FormName || String(row.FormName).toLowerCase() === config.contractFormName.toLowerCase()
        );
    }

    async function getContract(context, maHopDong, access = null) {
        const resolvedAccess = access || await getUserAccess(context);
        if (!resolvedAccess.canView) throw createError('Người dùng không có quyền xem hợp đồng.', 403);
        const response = await gateway({
            List: config.contractFormName,
            Func: 'View',
            Keyword: maHopDong,
            BranchID: resolvedAccess.isAdmin ? '' : resolvedAccess.branches.join(','),
            Page: 1,
            Limit: 100
        }, context);
        const contract = rowsOf(response).find((row) =>
            String(row.MaHopDong || row.maHopDong || '').toLowerCase() === String(maHopDong).toLowerCase()
        );
        if (!contract) throw createError('Hợp đồng không tồn tại hoặc người dùng không có quyền xem.', 404);
        return contract;
    }

    async function assertContractAccess(context, maHopDong, requireWrite = true) {
        const access = await getUserAccess(context);
        if (requireWrite && !access.canWrite) throw createError('Người dùng không có quyền cập nhật hợp đồng.', 403);
        const contract = await getContract(context, maHopDong, access);
        const contractBranch = String(contract.BranchID || contract.branchID || contract.branchId || '').trim().toUpperCase();
        if (!access.isAdmin && (!contractBranch || !access.branches.includes(contractBranch))) {
            throw createError('Hợp đồng không thuộc chi nhánh được cấp cho người dùng.', 403);
        }
        return { access, contract };
    }

    async function findAttachment(context, maHopDong, userAutoId) {
        const response = await gateway({
            List: config.attachmentListName,
            Func: 'View',
            MaHopDong: maHopDong,
            Page: 1,
            Limit: 1000
        }, context);
        return rowsOf(response).find((row) =>
            String(row.UserAutoID || '').toLowerCase() === String(userAutoId).toLowerCase()
        ) || null;
    }

    async function saveAttachment(context, attachment) {
        const response = await gateway({
            List: config.attachmentListName,
            Func: 'Save',
            JsonData: JSON.stringify(attachment),
            UserName: context.userName
        }, context, 'post');
        const code = response?.code ?? response?.Code ?? response?.result?.code;
        if (code !== undefined && String(code) !== '0') {
            throw createError(response.msg || response.Msg || response.message || 'SQL API từ chối lưu attachment.', 502);
        }
        return response;
    }

    async function getKnownTemplateFields(context) {
        const fields = new Set();
        try {
            const response = await postJson(
                `${config.sqlApiBase}/api/API_DanhSachTruongGiaoDien`,
                { FormName: config.contractFormName, Username: context.userName, Limit: 1000 },
                context,
                10000
            );
            rowsOf(response).forEach((row) => {
                const field = row.FieldName || row.fieldName || row.fieldname;
                if (field) fields.add(String(field));
            });
        } catch (error) {
            const detail = error.response?.data?.msg || error.response?.data?.message || error.message;
            throw createError(`Không tải được danh sách placeholder từ SQL API: ${detail}`, error.response?.status || 502);
        }
        return Array.from(fields);
    }

    return {
        authenticate,
        listTemplates,
        getContract,
        getUserAccess,
        assertContractAccess,
        findAttachment,
        saveAttachment,
        getKnownTemplateFields,
        rowsOf
    };
}
