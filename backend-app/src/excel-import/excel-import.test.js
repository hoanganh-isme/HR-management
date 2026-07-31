import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ExcelJS from 'exceljs';
import PizZip from 'pizzip';
import { createSqlServer } from '../db/sql-server.js';
import { queryTargetMetadata } from './excel-import.bulk.js';
import { resolveExcelImportContract } from './excel-import.registry.js';
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

async function withPrefixedOoxmlWorkbook(run) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hrm-import-ooxml-'));
    const filePath = path.join(tempDir, 'shuffled-columns.xlsx');
    const zip = new PizZip();
    zip.file('[Content_Types].xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>',
        '</Types>'
    ].join(''));
    zip.file('_rels/.rels', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="R1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="/xl/workbook.xml"/>',
        '</Relationships>'
    ].join(''));
    zip.file('xl/workbook.xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        '<x:sheets><x:sheet name="DuLieuImport" sheetId="1" r:id="SheetRel"',
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></x:sheets>',
        '</x:workbook>'
    ].join(''));
    zip.file('xl/_rels/workbook.xml.rels', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="StringsRel" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="/xl/sharedStrings.xml"/>',
        '<Relationship Id="SheetRel" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="/xl/worksheets/sheet1.xml"/>',
        '</Relationships>'
    ].join(''));
    const strings = [
        'Giới tính', 'Bậc', 'Đến', 'Thuế suất', 'Từ', 'Người liên hệ',
        'Nữ', 'Nguyễn Văn An', 'Nam', 'Trần Văn Bình'
    ];
    zip.file('xl/sharedStrings.xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<x:sst xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="10" uniqueCount="10">',
        strings.map((value) => `<x:si><x:t>${value}</x:t></x:si>`).join(''),
        '</x:sst>'
    ].join(''));
    zip.file('xl/worksheets/sheet1.xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:sheetData>',
        '<x:row r="1"><x:c r="A1" t="s"><x:v>0</x:v></x:c><x:c r="B1" t="s"><x:v>1</x:v></x:c><x:c r="C1" t="s"><x:v>2</x:v></x:c><x:c r="D1" t="s"><x:v>3</x:v></x:c><x:c r="E1" t="s"><x:v>4</x:v></x:c><x:c r="F1" t="s"><x:v>5</x:v></x:c></x:row>',
        '<x:row r="2"><x:c r="A2" t="s"><x:v>6</x:v></x:c><x:c r="B2"><x:v>1</x:v></x:c><x:c r="C2"><x:v>5000000</x:v></x:c><x:c r="D2"><x:v>5</x:v></x:c><x:c r="E2"><x:v>0</x:v></x:c><x:c r="F2" t="s"><x:v>7</x:v></x:c></x:row>',
        '<x:row r="3"><x:c r="A3" t="s"><x:v>8</x:v></x:c><x:c r="B3"><x:v>2</x:v></x:c><x:c r="C3"><x:v>25000000</x:v></x:c><x:c r="D3"><x:v>10</x:v></x:c><x:c r="E3"><x:v>5000000</x:v></x:c><x:c r="F3" t="s"><x:v>9</x:v></x:c></x:row>',
        '</x:sheetData></x:worksheet>'
    ].join(''));
    try {
        await fs.writeFile(filePath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
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

test('XLSX có namespace prefix và relationship tuyệt đối vẫn đọc đúng sheet, dòng và thứ tự cột', async () => {
    await withPrefixedOoxmlWorkbook(async (filePath) => {
        const workbookConfig = {
            ...config,
            maxUncompressedBytes: 5 * 1024 * 1024,
            maxSheets: 5
        };
        await validateWorkbookFile(filePath, workbookConfig);
        const sheets = await scanWorkbook(filePath, workbookConfig);
        assert.deepEqual(sheets.map((sheet) => [sheet.name, sheet.estimatedRows]), [
            ['DuLieuImport', 3]
        ]);
        const headers = await readSheetHeader(filePath, 'DuLieuImport', 1, workbookConfig);
        assert.deepEqual(headers, [
            'Giới tính', 'Bậc', 'Đến', 'Thuế suất', 'Từ', 'Người liên hệ'
        ]);
        const mapped = validateHeaderAndMapping(headers, {
            'Giới tính': 'GioiTinh',
            'Bậc': 'Bac',
            'Đến': 'Den',
            'Thuế suất': 'ThueSuat',
            'Từ': 'Tu',
            'Người liên hệ': 'NguoiLienHe'
        }, [
            { name: 'Den', label: 'Đến', importable: true },
            { name: 'Bac', label: 'Bậc', importable: true, required: true },
            { name: 'Tu', label: 'Từ', importable: true },
            { name: 'GioiTinh', label: 'Giới tính', importable: true },
            { name: 'ThueSuat', label: 'Thuế suất', importable: true },
            { name: 'NguoiLienHe', label: 'Người liên hệ', importable: true }
        ]);
        assert.deepEqual(
            mapped.mappings.map((item) => [item.sourceIndex, item.field.name]),
            [
                [1, 'GioiTinh'],
                [2, 'Bac'],
                [3, 'Den'],
                [4, 'ThueSuat'],
                [5, 'Tu'],
                [6, 'NguoiLienHe']
            ]
        );

        const rows = [];
        await streamSheetRows(filePath, 'DuLieuImport', (row) => {
            rows.push(row.values.slice(1));
        });
        assert.equal(rows.length, 3);
        assert.deepEqual(rows[1], ['Nữ', 1, 5_000_000, 5, 0, 'Nguyễn Văn An']);
    });
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

test('contract import được tạo từ metadata DB, không phụ thuộc danh sách form hard-code', () => {
    const contract = resolveExcelImportContract({
        webFormName: 'WA_HinhThucNghiFrm',
        erpFormId: 'WA_HinhThucNghiFrm',
        permissionFormName: 'WA_HinhThucNghiFrm',
        contractType: 'SIMPLE_TABLE',
        expectedTableName: 'HR_HinhThucNghiTbl',
        expectedPrimaryKey: 'HinhThucNghiID',
        viewProcedure: 'API_TruyVanDong_V2',
        saveProcedure: 'API_LuuDong_V2',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        branchPolicy: 'AUTO_SCHEMA',
        schemaVersion: 2,
        isEnabled: true
    });
    assert.equal(contract.webFormName, 'WA_HinhThucNghiFrm');
    assert.equal(contract.expectedTableName, 'HR_HinhThucNghiTbl');
    assert.equal(contract.importMode, 'INSERT_ONLY');
});

test('contract import từ chối màn hình chỉ đọc', () => {
    const contract = resolveExcelImportContract({
        webFormName: 'WA_OnlyReadFrm',
        erpFormId: 'WA_OnlyReadFrm',
        permissionFormName: 'WA_OnlyReadFrm',
        contractType: 'READ_ONLY',
        expectedTableName: 'HR_OnlyReadTbl',
        expectedPrimaryKey: 'ID',
        saveProcedure: 'API_LuuDong_V2',
        writePolicy: 'READ_ONLY',
        schemaVersion: 2,
        isEnabled: true
    });
    assert.equal(contract, null);
});

test('layout import dùng thứ tự Tabulator, chỉ auto-map cột đang hiển thị', async () => {
    const source = await fs.readFile(
        new URL('../../../src/js/utils/TableColumnLayout.js', import.meta.url),
        'utf8'
    );
    const context = vm.createContext({ window: {} });
    vm.runInContext(source, context);
    const utility = context.window.TableColumnLayout;
    const column = (name, label, visible) => ({
        getField: () => name,
        getDefinition: () => ({ title: label }),
        getSubColumns: () => [],
        isVisible: () => visible
    });
    const layout = utility.capture({
        getColumns: () => [
            column('', '', true),
            column('Den', 'Đến', true),
            column('Tu', 'Từ', false),
            column('Bac', 'Bậc', true)
        ]
    });
    const arranged = utility.arrangeFields([
        { name: 'Bac', label: 'Bậc' },
        { name: 'Tu', label: 'Từ' },
        { name: 'Den', label: 'Đến' },
        { name: 'GioiTinh', label: 'Giới tính' }
    ], layout);

    assert.deepEqual(
        JSON.parse(JSON.stringify(arranged.all.map((field) => field.name))),
        ['Den', 'Tu', 'Bac', 'GioiTinh']
    );
    assert.deepEqual(
        JSON.parse(JSON.stringify(arranged.positional.map((field) => field.name))),
        ['Den', 'Bac']
    );
    const orderedSources = utility.orderMappedSources([
        'Giới tính', 'Bậc', 'Đến', 'Thuế suất', 'Từ', 'Người liên hệ'
    ], {
        'Giới tính': 'GioiTinh',
        'Bậc': 'Bac',
        'Đến': 'Den',
        'Thuế suất': 'ThueSuat',
        'Từ': 'Tu',
        'Người liên hệ': 'NguoiLienHe'
    }, [
        { name: 'Den' },
        { name: 'Tu' },
        { name: 'GioiTinh' },
        { name: 'ThueSuat' },
        { name: 'Bac' },
        { name: 'NguoiLienHe' }
    ]);
    assert.deepEqual(
        JSON.parse(JSON.stringify(orderedSources.map((column) => column.header))),
        ['Đến', 'Từ', 'Giới tính', 'Thuế suất', 'Bậc', 'Người liên hệ']
    );
    assert.deepEqual(
        JSON.parse(JSON.stringify(orderedSources.map((column) => column.sourceIndex))),
        [2, 4, 0, 3, 1, 5]
    );
    assert.equal(arranged.hasLayout, true);
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
    permissionFormName: 'WA_BangThueTNCNFrm',
    expectedTableName: 'HR_BangThueTNCNTbl',
    expectedPrimaryKey: 'Bac',
    expectedSaveProcedure: 'API_LuuDong_V2',
    branchPolicy: 'GLOBAL_REFERENCE',
    importMode: 'INSERT_ONLY'
});

const metadataSchema = Object.freeze({
    fields: [{ name: 'Bac', label: 'Bậc', supportsInsert: true }]
});

test('Bulk Import chấp nhận người dùng có quyền Xuất Excel', async () => {
    const sqlServer = metadataSqlServer({
        UserGroupID: 'HR',
        UserBranches: '',
        CanImport: 1
    });
    const target = await queryTargetMetadata(
        sqlServer,
        metadataContract,
        metadataSchema,
        { userName: 'hr.user', branchId: '' }
    );
    assert.equal(target.userGroupId, 'HR');
    assert.equal(sqlServer.inputs.get('PermissionFormName'), 'WA_BangThueTNCNFrm');
});

test('Bulk Import từ chối người dùng chưa có quyền Xuất Excel', async () => {
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
            { userName: 'hr.user', branchId: 'CN01' }
        ),
        (error) => error.code === 'EXCEL_IMPORT_EXPORT_PERMISSION_REQUIRED' && error.statusCode === 403
    );
});

test('implementation không fallback sang HTTP lưu từng dòng', async () => {
    const bulkSource = await fs.readFile(new URL('./excel-import.bulk.js', import.meta.url), 'utf8');
    const routesSource = await fs.readFile(new URL('./excel-import.routes.js', import.meta.url), 'utf8');
    const registrySource = await fs.readFile(new URL('./excel-import.registry.js', import.meta.url), 'utf8');
    const serviceSource = await fs.readFile(new URL('./excel-import.service.js', import.meta.url), 'utf8');
    const serverSource = await fs.readFile(new URL('../../server.js', import.meta.url), 'utf8');
    const modalSource = await fs.readFile(
        new URL('../../../src/components/excel-import/ExcelImportModal.js', import.meta.url),
        'utf8'
    );
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
    assert.match(bulkSource, /transaction\.request\(\)\.batch\(`CREATE TABLE/);
    assert.match(bulkSource, /transaction\.request\(\)\.bulk\(table\)/);
    assert.match(bulkSource, /WITH \(TABLOCK\)/);
    assert.match(bulkSource, /transaction\.rollback\(\)/);
    assert.match(bulkSource, /EXCEL_IMPORT_EXPORT_PERMISSION_REQUIRED/);
    assert.match(bulkSource, /WA_UserGroupPermisstion/);
    assert.match(bulkSource, /isExportExcel/);
    assert.doesNotMatch(canImportSource, /_phase2RegistryEntry\(\)/);
    assert.doesNotMatch(canImportSource, /_usesUnifiedMetadata\(\)/);
    assert.doesNotMatch(canImportSource, /_usesUnifiedFieldContract\(\)/);
    assert.match(canImportSource, /_hasPermission\('EXPORT'\)/);
    assert.doesNotMatch(canImportSource, /AppSession\.isAdmin\(\)/);
    assert.doesNotMatch(formEngineSource, /id:\s*'btn-excel-import'/);
    assert.match(
        formEngineSource,
        /createMenuItem\('upload_file',\s*'Lấy dữ liệu Excel'/
    );
    assert.doesNotMatch(registrySource, /getFieldContractMigration/);
    assert.match(serviceSource, /repository\.resolveContract\(formName,\s*context\)/);
    assert.match(serverSource, /repository:\s*fieldContractRepository/);
    assert.match(formEngineSource, /TableColumnLayout\.capture\(window\.tabulatorInstance\)/);
    assert.match(formEngineSource, /columnLayout:\s*importColumnLayout/);
    assert.match(modalSource, /value="TABLE_ORDER">Theo thứ tự cột bảng/);
    assert.match(modalSource, /positionalFields\[index\]/);
    assert.match(modalSource, /TableColumnLayout\.orderMappedSources/);
    assert.match(modalSource, /Bản xem trước theo thứ tự cột bảng/);
    assert.match(modalSource, /Đã lưu thành công.*dòng dữ liệu/);
    assert.match(modalSource, /backdrop\.remove\(\)/);
    assert.match(modalSource, /Alert\.success\('Thành công', message\)/);
    assert.doesNotMatch(modalSource, /excel-import-success-result/);
});
