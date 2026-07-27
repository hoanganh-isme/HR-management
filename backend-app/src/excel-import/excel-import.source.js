import path from 'node:path';
import { ExcelImportError } from './excel-import.errors.js';
import {
    readSheetHeader,
    scanWorkbook,
    streamSheetRows,
    validateWorkbookFile
} from './excel-import.workbook.js';
import {
    readDelimitedHeader,
    scanDelimited,
    streamDelimitedRows,
    validateDelimitedFile
} from './excel-import.delimited.js';

export const IMPORT_SOURCE = Object.freeze({
    FILE: 'FILE',
    CLIPBOARD: 'CLIPBOARD'
});

export function resolveImportSource(file, requestedSource) {
    const requested = String(requestedSource || '').trim().toUpperCase();
    const extension = path.extname(String(file?.originalname || file?.path || '')).toLowerCase();
    const sourceType = requested === IMPORT_SOURCE.CLIPBOARD
        ? IMPORT_SOURCE.CLIPBOARD
        : IMPORT_SOURCE.FILE;
    const expectedExtension = sourceType === IMPORT_SOURCE.CLIPBOARD ? '.tsv' : '.xlsx';
    if (extension !== expectedExtension) {
        throw new ExcelImportError(
            sourceType === IMPORT_SOURCE.CLIPBOARD
                ? 'Nguồn clipboard không đúng định dạng TSV.'
                : 'Nguồn file chỉ hỗ trợ Excel .xlsx không có macro.',
            'EXCEL_IMPORT_SOURCE_MISMATCH',
            415
        );
    }
    return sourceType;
}

export async function validateImportSource(record, config) {
    if (record.sourceType === IMPORT_SOURCE.CLIPBOARD) {
        await validateDelimitedFile(record.tempPath, config);
        return;
    }
    await validateWorkbookFile(record.tempPath, config);
}

export async function scanImportSource(record, config) {
    if (record.sourceType === IMPORT_SOURCE.CLIPBOARD) {
        return scanDelimited(record.tempPath, config);
    }
    return scanWorkbook(record.tempPath, config);
}

export async function readImportHeader(record, sheetName, headerRow, config) {
    if (record.sourceType === IMPORT_SOURCE.CLIPBOARD) {
        if (String(sheetName) !== 'Clipboard') {
            throw new ExcelImportError('Nguồn clipboard không có sheet đã chọn.', 'EXCEL_IMPORT_SHEET_NOT_FOUND', 422);
        }
        return readDelimitedHeader(record.tempPath, headerRow, config);
    }
    if (headerRow === 0) {
        let generated = null;
        await streamSheetRows(record.tempPath, sheetName, async (row) => {
            if (row.values.slice(1).every((value) => String(value ?? '').trim() === '')) return true;
            generated = Array.from(
                { length: Math.min(config.maxColumns, row.cellCount) },
                (_value, index) => `Cột ${index + 1}`
            );
            return false;
        });
        if (!generated) {
            throw new ExcelImportError('Sheet không có dòng dữ liệu.', 'EXCEL_IMPORT_NO_DATA_ROWS', 422);
        }
        return generated;
    }
    return readSheetHeader(record.tempPath, sheetName, headerRow, config);
}

export async function streamImportRows(record, sheetName, config, onRow) {
    if (record.sourceType === IMPORT_SOURCE.CLIPBOARD) {
        if (String(sheetName) !== 'Clipboard') {
            throw new ExcelImportError('Nguồn clipboard không có sheet đã chọn.', 'EXCEL_IMPORT_SHEET_NOT_FOUND', 422);
        }
        await streamDelimitedRows(record.tempPath, config, onRow);
        return;
    }
    await streamSheetRows(record.tempPath, sheetName, onRow);
}
