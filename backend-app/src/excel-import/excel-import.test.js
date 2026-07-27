import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { createSqlServer } from '../db/sql-server.js';
import { queryTargetMetadata } from './excel-import.bulk.js';
import {
    readDelimitedHeader,
    scanDelimited,
    streamDelimitedRows
} from './excel-import.delimited.js';
import { resolveImportSource } from './excel-import.source.js';
import {
    readSheetHeader,
    scanWorkbook,
    streamSheetRows,
    validateWorkbookFile
} from './excel-import.workbook.js';
import {
    createErrorCollector,
    validateHeaderAndMapping,
    validateRow
} from './excel-import.validator.js';

const config = Object.freeze({
    maxFileBytes: 1024 * 1024,
    maxRows: 100,
    maxHeaderRow: 5,
    maxColumns: 10,
    previewRows: 3
});

async function withTsv(content, run) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hrm-import-'));
    const filePath = path.join(tempDir, 'clipboard.tsv');
    try {
        await fs.writeFile(filePath, content, 'utf8');
        return await run(filePath);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}

test('clipboard TSV stream giữ tab/newline trong ô và quote kép của Excel', async () => {
    await withTsv(
        '\uFEFFMã\tGhi chú\r\nNV01\t"Dòng 1\nDòng 2"\r\n"NV""02"\tHoàn tất',
        async (filePath) => {
            const rows = [];
            await streamDelimitedRows(filePath, config, async (row) => rows.push(row));
            assert.equal(rows.length, 3);
            assert.deepEqual(rows[0].values.slice(1), ['Mã', 'Ghi chú']);
            assert.deepEqual(rows[1].values.slice(1), ['NV01', 'Dòng 1\nDòng 2']);
            assert.deepEqual(rows[2].values.slice(1), ['NV"02', 'Hoàn tất']);
        }
    );
});

test('file .xlsx được đọc streaming và chỉ giữ preview nhỏ', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hrm-import-xlsx-'));
    const filePath = path.join(tempDir, 'tax.xlsx');
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Bảng thuế');
        sheet.addRow(['Bậc', 'Từ mức']);
        for (let index = 1; index <= 2_000; index += 1) sheet.addRow([index, index * 1000]);
        await workbook.xlsx.writeFile(filePath);

        await validateWorkbookFile(filePath, {
            ...config,
            maxUncompressedBytes: 20 * 1024 * 1024,
            maxSheets: 5
        });
        const sheets = await scanWorkbook(filePath, {
            ...config,
            maxRows: 2_000,
            maxSheets: 5,
            previewRows: 4
        });
        assert.equal(sheets[0].estimatedRows, 2_001);
        assert.equal(sheets[0].preview.length, 4);
        assert.deepEqual(await readSheetHeader(filePath, 'Bảng thuế', 1, config), ['Bậc', 'Từ mức']);

        let streamedRows = 0;
        await streamSheetRows(filePath, 'Bảng thuế', () => { streamedRows += 1; });
        assert.equal(streamedRows, 2_001);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});

test('clipboard scan chỉ giữ preview nhỏ và tạo header vị trí khi không có tiêu đề', async () => {
    await withTsv('1\tNguyễn An\n2\tTrần Bình\n3\tLê Chi\n4\tPhạm Dũng', async (filePath) => {
        const sheets = await scanDelimited(filePath, { ...config, previewRows: 2 });
        assert.equal(sheets[0].estimatedRows, 4);
        assert.equal(sheets[0].preview.length, 2);
        assert.deepEqual(await readDelimitedHeader(filePath, 0, config), ['Cột 1', 'Cột 2']);
        assert.deepEqual(await readDelimitedHeader(filePath, 1, config), ['1', 'Nguyễn An']);
    });
});

test('clipboard 100.000 dòng vẫn chỉ giữ số dòng preview đã cấu hình', async () => {
    const lines = ['Mã\tGiá trị'];
    for (let index = 1; index <= 100_000; index += 1) {
        lines.push(`NV${index}\t${index}`);
    }
    await withTsv(lines.join('\n'), async (filePath) => {
        const sheets = await scanDelimited(filePath, {
            ...config,
            maxFileBytes: 10 * 1024 * 1024,
            maxRows: 100_000,
            previewRows: 5
        });
        assert.equal(sheets[0].estimatedRows, 100_001);
        assert.equal(sheets[0].preview.length, 5);
    });
});

test('clipboard và Excel dùng chung mapping/validation theo field contract', async () => {
    await withTsv('Bậc\tTừ mức\n1\t10,000\n2\t10,5\n3\t10.000.002', async (filePath) => {
        const rows = [];
        await streamDelimitedRows(filePath, config, async (row) => rows.push(row));
        const fields = [
            { name: 'Bac', label: 'Bậc', sqlType: 'int', importable: true, required: true, nullable: false },
            { name: 'TuMuc', label: 'Từ mức', sqlType: 'decimal', importable: true, required: true, nullable: false }
        ];
        const mapping = validateHeaderAndMapping(
            rows[0].values.slice(1),
            { 'Bậc': 'Bac', 'Từ mức': 'TuMuc' },
            fields
        );
        const collector = createErrorCollector(10);
        assert.deepEqual(validateRow(rows[1], mapping.mappings, 2, collector), {
            Bac: 1,
            TuMuc: '10000'
        });
        assert.deepEqual(validateRow(rows[2], mapping.mappings, 3, collector), {
            Bac: 2,
            TuMuc: '10.5'
        });
        assert.deepEqual(validateRow(rows[3], mapping.mappings, 4, collector), {
            Bac: 3,
            TuMuc: '10000002'
        });
        assert.equal(collector.total, 0);
    });
});

test('source type fail-closed khi extension không khớp nguồn đã khai báo', () => {
    assert.equal(resolveImportSource({ originalname: 'data.xlsx' }, 'FILE'), 'FILE');
    assert.equal(resolveImportSource({ originalname: 'clipboard.tsv' }, 'CLIPBOARD'), 'CLIPBOARD');
    assert.throws(
        () => resolveImportSource({ originalname: 'data.xlsx' }, 'CLIPBOARD'),
        (error) => error.code === 'EXCEL_IMPORT_SOURCE_MISMATCH'
    );
});

test('Bulk Import thiếu biến SQL báo lỗi cấu hình ngay, không dùng host hard-code', async () => {
    const sqlServer = createSqlServer({});
    await assert.rejects(
        sqlServer.getPool(),
        (error) => error.code === 'EXCEL_IMPORT_SQL_CONFIG_MISSING'
    );
});

function metadataSqlServer(permissionRow) {
    const inputs = new Map();
    const request = {
        input(name, _type, value) {
            inputs.set(name, value);
            return this;
        },
        async query() {
            return {
                recordsets: [
                    [{
                        ObjectID: 1,
                        ExactFormRegistrationCount: 1,
                        SaveRouteCount: 1,
                        RegisteredSave: 'API_LuuDong_V2'
                    }],
                    [permissionRow],
                    [{
                        ColumnName: 'Bac',
                        SqlType: 'int',
                        MaxLength: 4,
                        PrecisionValue: 10,
                        ScaleValue: 0,
                        IsNullable: false,
                        IsIdentity: false,
                        IsComputed: false,
                        HasDefault: false,
                        IsPrimaryKey: true
                    }],
                    [{}],
                    [{ PrimaryKeyUnique: 1 }]
                ]
            };
        }
    };
    return {
        inputs,
        driver: { NVarChar: () => ({}) },
        async getPool() {
            return { request: () => request };
        }
    };
}

const metadataContract = Object.freeze({
    webFormName: 'WA_BangThueTNCNFrm',
    expectedTableName: 'HR_BangThueTNCNTbl',
    expectedPrimaryKey: 'Bac',
    expectedSaveProcedure: 'API_LuuDong_V2',
    branchPolicy: 'GLOBAL_REFERENCE',
    importMode: 'INSERT_ONLY'
});

const metadataSchema = Object.freeze({
    fields: [{ name: 'Bac', label: 'Bậc', supportsInsert: true }]
});

test('Bulk Import chỉ chấp nhận nhóm ứng dụng được cấu hình là Admin', async () => {
    const sqlServer = metadataSqlServer({
        UserGroupID: 'Admin',
        UserBranches: '',
        CanImport: 1
    });
    const target = await queryTargetMetadata(
        sqlServer,
        metadataContract,
        metadataSchema,
        { userName: 'admin.user', branchId: '' },
        'Admin'
    );
    assert.equal(target.userGroupId, 'Admin');
    assert.equal(sqlServer.inputs.get('AllowedUserGroup'), 'Admin');
});

test('Bulk Import từ chối nhóm không phải Admin dù người dùng đã đăng nhập', async () => {
    const sqlServer = metadataSqlServer({
        UserGroupID: 'HR',
        UserBranches: 'CN01',
        CanImport: 0
    });
    await assert.rejects(
        queryTargetMetadata(
            sqlServer,
            metadataContract,
            metadataSchema,
            { userName: 'hr.user', branchId: 'CN01' },
            'Admin'
        ),
        (error) => error.code === 'EXCEL_IMPORT_ADMIN_REQUIRED' && error.statusCode === 403
    );
});

test('implementation không fallback sang HTTP lưu từng dòng', async () => {
    const bulkSource = await fs.readFile(new URL('./excel-import.bulk.js', import.meta.url), 'utf8');
    const routesSource = await fs.readFile(new URL('./excel-import.routes.js', import.meta.url), 'utf8');
    const formEngineSource = await fs.readFile(
        new URL('../../../src/js/core/DynamicFormEngine.js', import.meta.url),
        'utf8'
    );
    const canImportSource = formEngineSource.match(
        /function _canImportExcel\(\) \{[\s\S]*?\n  \}/
    )?.[0] || '';
    assert.doesNotMatch(bulkSource, /gatewayBulkImport|fetch\s*\(/);
    assert.doesNotMatch(routesSource, /clipboard-execute/);
    assert.match(bulkSource, /transaction\.begin\(driver\.ISOLATION_LEVEL\.SERIALIZABLE\)/);
    assert.match(bulkSource, /transaction\.request\(\)\.bulk\(table\)/);
    assert.match(bulkSource, /WITH \(TABLOCK\)/);
    assert.match(bulkSource, /transaction\.rollback\(\)/);
    assert.match(bulkSource, /EXCEL_IMPORT_ADMIN_REQUIRED/);
    assert.doesNotMatch(bulkSource, /WA_UserGroupPermisstion|WA_UserPermisstion|isNotCheckPermission/);
    assert.match(canImportSource, /_hasPermission\('ADD'\)/);
    assert.doesNotMatch(canImportSource, /AppSession\.isAdmin\(\)/);
});
