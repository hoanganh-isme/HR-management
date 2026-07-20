import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { resolveFieldSyncContext } from './field-sync.auth.js';
import { FieldSyncCache } from './field-sync.cache.js';
import { createFieldSyncGateway, FieldSyncGatewayError } from './field-sync.gateway.js';
import { normalizeGridCompare, normalizeGridSchema, normalizeLookupSchema, normalizeRegisteredLookup, resolveRenderType } from './field-sync.resolver.js';
import { createFieldSyncRouter } from './field-sync.routes.js';

const HTTP_TEST_CONFIG = Object.freeze({
    cacheTtlMs: 5_000,
    aliases: Object.freeze({ WA_BangThueTNCNFrm: 'HR_BangThueTNCNFrm' })
});

function gridSchemaRows() {
    return [{
        FieldName: 'Bac',
        Caption: 'Bậc',
        FieldOrdinal: 1,
        SqlType: 'int',
        SourceKind: 'RESULT_SET',
        PrimaryKey: 'Bac'
    }];
}

async function startFieldSyncTestServer(t, gateway, config = HTTP_TEST_CONFIG) {
    const app = express();
    app.use(express.json());
    app.use('/api/metadata', createFieldSyncRouter({ gateway, config }));
    app.use((error, req, res, next) => {
        if (res.headersSent) return next(error);
        return res.status(Number(error.statusCode) || 500).json({ success: false, message: error.message });
    });

    const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
        instance.once('error', reject);
    });
    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    }));
    return `http://127.0.0.1:${server.address().port}/api/metadata`;
}

function authHeaders(token = 'valid-token', branchId = 'CN01') {
    return {
        Authorization: `Bearer ${token}`,
        Username: 'Admin',
        BranchID: branchId
    };
}

test('auth fail-closed khi thiếu bearer token', () => {
    assert.throws(() => resolveFieldSyncContext({ headers: { username: 'Admin' } }), /token/i);
});

test('auth từ chối username khác JWT claim', () => {
    const payload = Buffer.from(JSON.stringify({ username: 'LanAnh' })).toString('base64url');
    assert.throws(() => resolveFieldSyncContext({ headers: { authorization: `Bearer x.${payload}.x`, username: 'Admin' } }), /không khớp/i);
});

test('auth từ chối branch context có ký tự không an toàn', () => {
    assert.throws(() => resolveFieldSyncContext({
        headers: { authorization: 'Bearer opaque', username: 'Admin', branchid: "CN01' OR 1=1" }
    }), /chi nhánh/i);
});

test('auth chuẩn hóa danh sách branch để cache key ổn định', () => {
    const context = resolveFieldSyncContext({
        headers: { authorization: 'Bearer opaque', username: 'Admin', branchid: 'DONGDU, COBI,DONGDU' }
    });
    assert.equal(context.branchId, 'COBI,DONGDU');
});

test('cache hết hạn theo TTL', () => {
    let now = 10;
    const cache = new FieldSyncCache(100, () => now);
    cache.set('a', 1);
    assert.equal(cache.get('a'), 1);
    now = 111;
    assert.equal(cache.get('a'), undefined);
});

test('cache giới hạn số entry để không tăng vô hạn', () => {
    const cache = new FieldSyncCache(10_000, () => 10, 2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    assert.equal(cache.get('a'), undefined);
    assert.equal(cache.get('b'), 2);
    assert.equal(cache.get('c'), 3);
});

test('resolver loại field name không an toàn và không chuyển SQL thô', () => {
    const schema = normalizeGridSchema([
        { FieldName: 'EmployeeID', Caption: 'Mã NV', FieldOrdinal: 1, SourceKind: 'RESULT_SET', LookupKey: 'A'.repeat(64) },
        { FieldName: 'x; DROP TABLE y', Caption: 'Sai', Source: 'SELECT * FROM Secret' },
        { FieldName: '__proto__', Caption: 'Prototype pollution' }
    ], 'WA_TestFrm', 'HR_TestFrm');
    assert.deepEqual(schema.gridFields.map((field) => field.name), ['EmployeeID']);
    assert.equal(JSON.stringify(schema).includes('SELECT *'), false);
});

test('resolver làm sạch caption và báo lỗi khi thiếu primary key', () => {
    const schema = normalizeGridSchema([{
        FieldName: 'EmployeeName',
        Caption: '<img src=x onerror=alert(1)>Tên nhân viên',
        FieldOrdinal: 1,
        SourceKind: 'RESULT_SET',
        PrimaryKey: ''
    }], 'WA_TestFrm', 'HR_TestFrm');
    assert.doesNotMatch(schema.gridFields[0].label, /[<>]/);
    assert.ok(schema.diagnostics.some((item) => item.code === 'NO_PRIMARY_KEY' && item.severity === 'error'));
});

test('resolver giữ diagnostic shadow để chặn active trước khi WA_API đăng ký V2', () => {
    const schema = normalizeGridSchema([{
        FieldName: 'Bac',
        Caption: 'Bậc',
        FieldOrdinal: 1,
        SqlType: 'int',
        SourceKind: 'RESULT_SET',
        PrimaryKey: 'Bac',
        DiagnosticCode: 'SHADOW_VIEW_NOT_REGISTERED'
    }], 'WA_BangThueTNCNFrm', 'HR_BangThueTNCNFrm');
    assert.ok(schema.diagnostics.some((item) => item.code === 'SHADOW_VIEW_NOT_REGISTERED'));
});

test('resolver biến diagnostic result-set không an toàn thành lỗi blocking', () => {
    for (const code of ['RESULTSET_METADATA_ERROR', 'RESULTSET_UNSAFE_FIELD']) {
        const schema = normalizeGridSchema([{
            FieldName: 'Bac',
            Caption: 'Bậc',
            FieldOrdinal: 1,
            SqlType: 'int',
            SourceKind: 'RESULT_SET',
            PrimaryKey: 'Bac',
            DiagnosticCode: code
        }], 'WA_BangThueTNCNFrm', 'HR_BangThueTNCNFrm');
        assert.ok(schema.diagnostics.some((item) => item.code === code && item.severity === 'error'));
    }
});

test('resolver chỉ trả dependsOn identifier an toàn', () => {
    const schema = normalizeGridSchema([{
        FieldName: 'BranchID',
        SqlType: 'varchar(20)',
        LookupKey: 'B'.repeat(64),
        LookupDependsOn: '@CompanyID;CostID;Bad value;X--;constructor',
        LookupMultiSelect: 1,
        LookupReloadMode: 'OnParent'
    }], 'WA_TestFrm', 'HR_TestFrm');
    assert.deepEqual(schema.gridFields[0].lookup.dependsOn, ['CompanyID', 'CostID']);
    assert.equal(schema.gridFields[0].lookup.multiSelect, true);
});

test('resolver không bật lookup đã bị disable', () => {
    const schema = normalizeGridSchema([{
        FieldName: 'SecretCode',
        SqlType: 'varchar(20)',
        LookupKey: 'C'.repeat(64),
        LookupDisabled: 1
    }], 'WA_TestFrm', 'HR_TestFrm');
    assert.equal(schema.gridFields[0].renderRule, 'text');
});

test('lookup chỉ chấp nhận mode đăng ký hoặc danh sách tĩnh', () => {
    assert.equal(normalizeLookupSchema([{ LookupMode: 'RAW_SQL', DiagnosticCode: 'BLOCKED_RAW_SQL' }]).mode, 'BLOCKED');
    assert.equal(normalizeLookupSchema([{ LookupMode: 'REGISTERED_API', RegisteredList: 'CF_BranchListFrm', ValueColumn: 'Code', DisplayColumn: 'Name' }]).mode, 'REGISTERED_API');
    assert.equal(normalizeLookupSchema([{ LookupMode: 'REGISTERED_API', RegisteredList: 'CF_BranchListFrm' }]).diagnosticCode, 'LOOKUP_COLUMNS_NOT_CONFIGURED');
});

test('registered lookup không fallback sang cột tùy ý hoặc cột nhạy cảm', () => {
    const descriptor = normalizeLookupSchema([{ LookupMode: 'REGISTERED_API', RegisteredList: 'CF_BranchListFrm', ValueColumn: 'Code', DisplayColumn: 'Name' }]);
    assert.deepEqual(normalizeRegisteredLookup([{ Code: '01', Name: 'Hà Nội', PasswordHash: 'secret' }], descriptor), [{ value: '01', label: 'Hà Nội' }]);
    assert.equal(normalizeRegisteredLookup([{ PasswordHash: 'secret', UserName: 'Admin' }], descriptor), null);
});

test('format registry V2 đúng contract ERP', () => {
    assert.equal(resolveRenderType('D', 'nvarchar(20)'), 'date');
    assert.equal(resolveRenderType('DT', 'datetime'), 'datetime');
    assert.equal(resolveRenderType('H', 'time'), 'time');
    assert.equal(resolveRenderType('B', 'decimal(18,2)'), 'money');
    assert.equal(resolveRenderType('Q', 'decimal(18,3)'), 'decimal');
    assert.equal(resolveRenderType('N3', 'numeric(18,3)'), 'number');
    assert.equal(resolveRenderType('', 'bit'), 'boolean');
    assert.equal(resolveRenderType('', 'varchar(50)', true), 'lookup');
    assert.equal(resolveRenderType('', 'datetime2', false, 'DT'), 'datetime');
    assert.equal(resolveRenderType('', 'time', false, 'H'), 'time');
});

test('compare contract giữ primary-key parity và chỉ trả cờ lookup', () => {
    const comparison = normalizeGridCompare([{
        FieldName: 'BranchID',
        ParityStatus: 'LOOKUP_DIFF',
        LegacyHasLookup: 0,
        V2HasLookup: 1,
        LegacyPrimaryKey: 'ID',
        V2PrimaryKey: 'ERP_ID',
        PrimaryKeyStatus: 'CRITICAL'
    }], 'WA_TestFrm', 'HR_TestFrm');
    assert.deepEqual(comparison.primaryKey, { legacy: 'ID', v2: 'ERP_ID', status: 'CRITICAL' });
    assert.equal(comparison.items[0].v2HasLookup, true);
    assert.equal(JSON.stringify(comparison).includes('DataSource'), false);
});

test('gateway che nội dung SQL khi downstream lỗi', async () => {
    const http = {
        post: async (url) => {
            if (url.includes('API_UserInfo')) return { data: { UserName: 'Admin' } };
            throw { response: { status: 500, data: { msg: 'SELECT password FROM SY_User' } } };
        }
    };
    const gateway = createFieldSyncGateway({ sqlGatewayUrl: 'http://sql/api/API_Gateway_Router', authVerifyUrl: 'http://sql/api/API_UserInfo', requestTimeoutMs: 100, authCacheTtlMs: 1000, sqlApiUser: '' }, http);
    await assert.rejects(
        gateway.gridSchema({ FormName: 'WA_TestFrm' }, { userName: 'Admin', branchId: '', authorization: 'Bearer opaque' }),
        (error) => error instanceof FieldSyncGatewayError && !error.message.includes('SELECT')
    );
});

test('gateway ràng buộc username với phiên upstream', async () => {
    const http = { post: async (url) => ({ data: url.includes('API_UserInfo') ? { UserName: 'LanAnh' } : { records: [] } }) };
    const gateway = createFieldSyncGateway({ sqlGatewayUrl: 'http://sql/api/API_Gateway_Router', authVerifyUrl: 'http://sql/api/API_UserInfo', requestTimeoutMs: 100, authCacheTtlMs: 1000, sqlApiUser: '' }, http);
    await assert.rejects(
        gateway.gridSchema({ FormName: 'WA_TestFrm' }, { userName: 'Admin', branchId: '', authorization: 'Bearer opaque' }),
        (error) => error instanceof FieldSyncGatewayError && error.statusCode === 403
    );
});

test('gateway không tin UserName trong auth envelope báo thất bại', async () => {
    const http = { post: async () => ({ data: { success: false, UserName: 'Admin' } }) };
    const gateway = createFieldSyncGateway({ sqlGatewayUrl: 'http://sql/api/API_Gateway_Router', authVerifyUrl: 'http://sql/api/API_UserInfo', requestTimeoutMs: 100, authCacheTtlMs: 1000 }, http);
    await assert.rejects(
        gateway.verifySession({ userName: 'Admin', branchId: '', authorization: 'Bearer opaque' }),
        (error) => error instanceof FieldSyncGatewayError && error.statusCode === 401
    );
});

test('gateway coalesce xác minh đồng thời và giới hạn auth cache', async () => {
    let authCalls = 0;
    const http = {
        post: async (url) => {
            assert.match(url, /API_UserInfo/);
            authCalls += 1;
            return { data: { UserName: 'Admin' } };
        }
    };
    const gateway = createFieldSyncGateway({
        sqlGatewayUrl: 'http://sql/api/API_Gateway_Router',
        authVerifyUrl: 'http://sql/api/API_UserInfo',
        requestTimeoutMs: 100,
        authCacheTtlMs: 10_000,
        authCacheMaxEntries: 2
    }, http);
    const context = (token) => ({ userName: 'Admin', branchId: 'CN01', authorization: `Bearer ${token}` });

    await Promise.all([gateway.verifySession(context('token-1')), gateway.verifySession(context('token-1'))]);
    assert.equal(authCalls, 1);
    await gateway.verifySession(context('token-2'));
    await gateway.verifySession(context('token-3'));
    assert.equal(authCalls, 3);
    await gateway.verifySession(context('token-1'));
    assert.equal(authCalls, 4);
});

test('gateway fail-closed với HTTP 200 nhưng envelope báo thất bại', async () => {
    const http = {
        post: async (url) => url.includes('API_UserInfo')
            ? { data: { UserName: 'Admin' } }
            : { data: { success: false, message: 'SELECT password FROM SY_User' } }
    };
    const gateway = createFieldSyncGateway({ sqlGatewayUrl: 'http://sql/api/API_Gateway_Router', authVerifyUrl: 'http://sql/api/API_UserInfo', requestTimeoutMs: 100, authCacheTtlMs: 1000 }, http);
    await assert.rejects(
        gateway.gridSchema({ FormName: 'WA_TestFrm' }, { userName: 'Admin', branchId: '', authorization: 'Bearer opaque' }),
        (error) => error instanceof FieldSyncGatewayError && !error.message.includes('SELECT')
    );
});

test('HTTP metadata thiếu Bearer trả 401, không gọi gateway và không cho cache', async (t) => {
    let verifyCalls = 0;
    const gateway = {
        async verifySession() { verifyCalls += 1; },
        async gridSchema() { throw new Error('không được gọi'); }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const response = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm`, {
        headers: { Username: 'Admin', BranchID: 'CN01' }
    });
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(verifyCalls, 0);
    assert.match(response.headers.get('cache-control') || '', /no-store/i);
});

test('HTTP metadata xác minh phiên trước cache hit', async (t) => {
    let verifyCalls = 0;
    let schemaCalls = 0;
    const gateway = {
        async verifySession(context) {
            verifyCalls += 1;
            if (context.authorization === 'Bearer forged-token') {
                const error = new Error('Phiên không hợp lệ.');
                error.statusCode = 401;
                throw error;
            }
        },
        async gridSchema() {
            schemaCalls += 1;
            return gridSchemaRows();
        }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const endpoint = `${baseUrl}/grid-schema/WA_BangThueTNCNFrm`;
    const warmResponse = await fetch(endpoint, { headers: authHeaders('valid-token') });
    assert.equal(warmResponse.status, 200);
    await warmResponse.json();

    const forgedResponse = await fetch(endpoint, { headers: authHeaders('forged-token') });
    const forgedBody = await forgedResponse.json();
    assert.equal(forgedResponse.status, 401);
    assert.equal(forgedBody.success, false);
    assert.equal(forgedBody.schema, undefined);
    assert.equal(verifyCalls, 2);
    assert.equal(schemaCalls, 1);
});

test('HTTP metadata chuẩn hóa alias/branch cho cache và cô lập branch khác', async (t) => {
    const calls = [];
    const gateway = {
        async verifySession() {},
        async gridSchema(params, context) {
            calls.push({ params, context });
            return gridSchemaRows();
        }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const aliasUrl = `${baseUrl}/grid-schema/wa_bangthuetncnfrm?erpFormId=hr_bangthuetncnfrm`;
    const first = await fetch(aliasUrl, { headers: authHeaders('valid-token', 'DONGDU, COBI,DONGDU') });
    assert.equal(first.status, 200);
    await first.json();

    const sameContext = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm`, {
        headers: authHeaders('valid-token', 'COBI,DONGDU')
    });
    assert.equal(sameContext.status, 200);
    await sameContext.json();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].params.FormName, 'WA_BangThueTNCNFrm');
    assert.equal(calls[0].params.ERPFormID, 'HR_BangThueTNCNFrm');
    assert.equal(calls[0].context.branchId, 'COBI,DONGDU');

    const otherBranch = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm`, {
        headers: authHeaders('valid-token', 'CN02')
    });
    assert.equal(otherBranch.status, 200);
    await otherBranch.json();
    assert.equal(calls.length, 2);
    assert.equal(calls[1].context.branchId, 'CN02');

    const caseVariantBranch = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm`, {
        headers: authHeaders('valid-token', 'cn02')
    });
    assert.equal(caseVariantBranch.status, 200);
    await caseVariantBranch.json();
    assert.equal(calls.length, 3);

    const caseVariantUser = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm`, {
        headers: { ...authHeaders('valid-token', 'CN02'), Username: 'admin' }
    });
    assert.equal(caseVariantUser.status, 200);
    await caseVariantUser.json();
    assert.equal(calls.length, 4);
});

test('HTTP metadata từ chối alias ERP không đúng trước khi gọi gateway', async (t) => {
    let verifyCalls = 0;
    const gateway = {
        async verifySession() { verifyCalls += 1; },
        async gridSchema() { throw new Error('không được gọi'); }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const response = await fetch(`${baseUrl}/grid-schema/WA_BangThueTNCNFrm?erpFormId=HR_ChucDanhFrm`, {
        headers: authHeaders()
    });
    const body = await response.json();
    assert.equal(response.status, 409);
    assert.equal(body.success, false);
    assert.equal(verifyCalls, 1);
    assert.match(response.headers.get('cache-control') || '', /no-store/i);
});

test('HTTP lookup raw SQL bị chặn và không rò nội dung nguồn', async (t) => {
    let verifyCalls = 0;
    const gateway = {
        async verifySession() { verifyCalls += 1; },
        async lookupSchema() {
            return [{
                LookupMode: 'RAW_SQL',
                DiagnosticCode: 'LOOKUP_SOURCE_NOT_REGISTERED',
                Source: 'SELECT secret FROM SY_User'
            }];
        }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const lookupKey = 'A'.repeat(64);
    const response = await fetch(`${baseUrl}/lookups/${lookupKey}/search`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ formName: 'WA_BangThueTNCNFrm', keyword: '', page: 1, pageSize: 30 })
    });
    const body = await response.json();
    const serialized = JSON.stringify(body);
    assert.equal(response.status, 409);
    assert.equal(body.success, false);
    assert.equal(body.code, 'LOOKUP_SOURCE_NOT_REGISTERED');
    assert.doesNotMatch(serialized, /SELECT|secret|\"Source\"/i);
    assert.equal(verifyCalls, 1);
    assert.match(response.headers.get('cache-control') || '', /no-store/i);
});

test('HTTP registered lookup chỉ trả hai cột đã đăng ký và fail-closed khi mismatch', async (t) => {
    const gateway = {
        async verifySession() {},
        async lookupSchema() {
            return [{
                LookupMode: 'REGISTERED_API',
                RegisteredList: 'CF_BranchListFrm',
                ValueColumn: 'Code',
                DisplayColumn: 'Name'
            }];
        },
        async registeredLookup(list, params) {
            assert.equal(list, 'CF_BranchListFrm');
            return params.Keyword === 'mismatch'
                ? [{ PasswordHash: 'secret', UserName: 'Admin' }]
                : [{ Code: 'CN01', Name: 'Chi nhánh 01', PasswordHash: 'secret' }];
        }
    };
    const baseUrl = await startFieldSyncTestServer(t, gateway);
    const endpoint = `${baseUrl}/lookups/${'D'.repeat(64)}/search`;
    const request = (keyword) => fetch(endpoint, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ formName: 'WA_BangThueTNCNFrm', keyword, page: 1, pageSize: 30 })
    });

    const successResponse = await request('ok');
    const successBody = await successResponse.json();
    assert.equal(successResponse.status, 200);
    assert.deepEqual(successBody.options, [{ value: 'CN01', label: 'Chi nhánh 01' }]);
    assert.doesNotMatch(JSON.stringify(successBody), /PasswordHash|secret/i);

    const mismatchResponse = await request('mismatch');
    const mismatchBody = await mismatchResponse.json();
    assert.equal(mismatchResponse.status, 409);
    assert.equal(mismatchBody.code, 'LOOKUP_COLUMNS_MISMATCH');
    assert.doesNotMatch(JSON.stringify(mismatchBody), /PasswordHash|secret/i);
});
