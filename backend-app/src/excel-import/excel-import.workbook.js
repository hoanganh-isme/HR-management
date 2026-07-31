import fsp from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';
import yauzl from 'yauzl';
import { ExcelImportError } from './excel-import.errors.js';
import { withOoxmlWorkbook } from './excel-import.ooxml.js';

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function safePreviewValue(value) {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
        if (value.formula) {
            if (value.result === undefined || value.result === null) return '[Công thức chưa có kết quả]';
            return String(value.result).slice(0, 500);
        }
        if (Array.isArray(value.richText)) return value.richText.map((item) => item.text || '').join('').slice(0, 500);
        if (value.text !== undefined) return String(value.text).slice(0, 500);
        return '[Dữ liệu không hỗ trợ]';
    }
    return String(value).slice(0, 500);
}

export function readCellValue(cell) {
    const value = cell?.value;
    if (value && typeof value === 'object' && value.formula) {
        if (value.result === undefined || value.result === null || typeof value.result === 'object') {
            return { formula: true, hasCachedResult: false, value: null };
        }
        return { formula: true, hasCachedResult: true, value: value.result };
    }
    if (value && typeof value === 'object' && Array.isArray(value.richText)) {
        return { formula: false, hasCachedResult: true, value: value.richText.map((item) => item.text || '').join('') };
    }
    if (value && typeof value === 'object' && value.text !== undefined) {
        return { formula: false, hasCachedResult: true, value: value.text };
    }
    return { formula: false, hasCachedResult: true, value };
}

function rowValues(row, maxColumns) {
    const values = [];
    const rowArray = Array.isArray(row?.values) ? row.values : [];
    const lastColumn = Math.min(maxColumns, Math.max(0, row?.cellCount || rowArray.length - 1));
    for (let column = 1; column <= lastColumn; column += 1) {
        values.push(safePreviewValue(row.getCell(column).value));
    }
    return values;
}

function isNonEmptyRow(row) {
    const rowArray = Array.isArray(row?.values) ? row.values : [];
    return rowArray.slice(1).some((value) => !isBlank(value));
}

async function inspectZip(filePath, config) {
    const stat = await fsp.stat(filePath);
    if (stat.size > config.maxFileBytes) {
        throw new ExcelImportError(
            `File vượt giới hạn ${Math.round(config.maxFileBytes / 1024 / 1024)} MB.`,
            'EXCEL_IMPORT_FILE_TOO_LARGE',
            413
        );
    }

    const header = Buffer.alloc(4);
    const handle = await fsp.open(filePath, 'r');
    try {
        await handle.read(header, 0, 4, 0);
    } finally {
        await handle.close();
    }
    if (header[0] !== 0x50 || header[1] !== 0x4b) {
        throw new ExcelImportError(
            'File không phải Excel .xlsx hợp lệ.',
            'EXCEL_IMPORT_XLSX_INVALID',
            415
        );
    }

    await new Promise((resolve, reject) => {
        yauzl.open(filePath, { lazyEntries: true, autoClose: true }, (error, zipfile) => {
            if (error) {
                reject(new ExcelImportError('Không đọc được cấu trúc file Excel.', 'EXCEL_IMPORT_WORKBOOK_INVALID', 422));
                return;
            }
            let entryCount = 0;
            let uncompressedBytes = 0;
            let settled = false;
            const fail = (importError) => {
                if (settled) return;
                settled = true;
                try { zipfile.close(); } catch { /* ignore */ }
                reject(importError);
            };
            zipfile.on('error', (zipError) => fail(new ExcelImportError(
                'Không đọc được cấu trúc file Excel.',
                'EXCEL_IMPORT_WORKBOOK_INVALID',
                422,
                { reason: zipError.code || 'ZIP_ERROR' }
            )));
            zipfile.on('entry', (entry) => {
                entryCount += 1;
                uncompressedBytes += Number(entry.uncompressedSize) || 0;
                const normalizedName = String(entry.fileName || '').replace(/\\/g, '/');
                if (normalizedName.startsWith('/') || normalizedName.split('/').includes('..')) {
                    fail(new ExcelImportError('File Excel chứa đường dẫn nội bộ không an toàn.', 'EXCEL_IMPORT_ZIP_PATH_INVALID', 422));
                    return;
                }
                if ((entry.generalPurposeBitFlag & 1) !== 0) {
                    fail(new ExcelImportError('File Excel được mã hóa, chưa được hỗ trợ.', 'EXCEL_IMPORT_ENCRYPTED', 415));
                    return;
                }
                if (entryCount > config.maxSheets * 200) {
                    fail(new ExcelImportError('File Excel có quá nhiều thành phần.', 'EXCEL_IMPORT_ZIP_TOO_MANY_ENTRIES', 413));
                    return;
                }
                if (uncompressedBytes > config.maxUncompressedBytes) {
                    fail(new ExcelImportError('File Excel giải nén vượt giới hạn an toàn.', 'EXCEL_IMPORT_ZIP_BOMB_SUSPECTED', 413));
                    return;
                }
                zipfile.readEntry();
            });
            zipfile.on('end', () => {
                if (settled) return;
                settled = true;
                resolve();
            });
            zipfile.readEntry();
        });
    });
}

function createReader(filePath) {
    return new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
        worksheets: 'emit',
        sharedStrings: 'cache',
        hyperlinks: 'ignore',
        styles: 'cache'
    });
}

export async function validateWorkbookFile(filePath, config) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension !== '.xlsx') {
        throw new ExcelImportError(
            'Phiên bản này chỉ nhận .xlsx. Hãy lưu file .xls/.xlsm thành .xlsx trước khi import.',
            extension === '.xls'
                ? 'EXCEL_IMPORT_XLS_LEGACY_NOT_SUPPORTED'
                : 'EXCEL_IMPORT_FILE_TYPE_NOT_SUPPORTED',
            415
        );
    }
    await inspectZip(filePath, config);
}

async function scanWithExcelJs(filePath, config) {
    const sheets = [];
    const reader = createReader(filePath);
    for await (const worksheet of reader) {
        if (sheets.length >= config.maxSheets) {
            throw new ExcelImportError('Workbook có quá nhiều sheet.', 'EXCEL_IMPORT_TOO_MANY_SHEETS', 413);
        }
        let estimatedRows = 0;
        const preview = [];
        for await (const row of worksheet) {
            if (preview.length < config.previewRows) preview.push(rowValues(row, config.maxColumns));
            if (!isNonEmptyRow(row)) continue;
            estimatedRows += 1;
            if (estimatedRows > config.maxRows + config.maxHeaderRow) {
                throw new ExcelImportError(
                    `Sheet "${worksheet.name}" vượt giới hạn ${config.maxRows.toLocaleString('vi-VN')} dòng.`,
                    'EXCEL_IMPORT_MAX_ROWS_EXCEEDED',
                    413
                );
            }
        }
        sheets.push({ name: String(worksheet.name || '').slice(0, 255), estimatedRows, preview });
    }
    return sheets;
}

async function scanWithOoxml(filePath, config) {
    return withOoxmlWorkbook(filePath, async (workbook) => {
        if (workbook.sheets.length > config.maxSheets) {
            throw new ExcelImportError('Workbook có quá nhiều sheet.', 'EXCEL_IMPORT_TOO_MANY_SHEETS', 413);
        }
        const sheets = [];
        for (const worksheet of workbook.sheets) {
            let estimatedRows = 0;
            const preview = [];
            await workbook.streamRows(worksheet.name, (row) => {
                if (preview.length < config.previewRows) preview.push(rowValues(row, config.maxColumns));
                if (!isNonEmptyRow(row)) return;
                estimatedRows += 1;
                if (estimatedRows > config.maxRows + config.maxHeaderRow) {
                    throw new ExcelImportError(
                        `Sheet "${worksheet.name}" vượt giới hạn ${config.maxRows.toLocaleString('vi-VN')} dòng.`,
                        'EXCEL_IMPORT_MAX_ROWS_EXCEEDED',
                        413
                    );
                }
            });
            sheets.push({ name: worksheet.name, estimatedRows, preview });
        }
        return sheets;
    });
}

export async function scanWorkbook(filePath, config) {
    let sheets = null;
    try {
        sheets = await scanWithExcelJs(filePath, config);
    } catch (error) {
        if (error instanceof ExcelImportError) throw error;
    }
    // Một số workbook OpenXML hợp lệ dùng namespace có prefix và relationship
    // tuyệt đối. ExcelJS 4.x có thể tạo "Sheet1" rỗng trong trường hợp này.
    if (!sheets || sheets.every((sheet) => sheet.estimatedRows === 0)) {
        sheets = await scanWithOoxml(filePath, config);
    }
    if (!sheets.length) {
        throw new ExcelImportError('Workbook không có sheet dữ liệu.', 'EXCEL_IMPORT_NO_SHEETS', 422);
    }
    return sheets;
}

async function readHeaderWithExcelJs(filePath, sheetName, headerRow, config) {
    let found = null;
    const reader = createReader(filePath);
    for await (const worksheet of reader) {
        if (String(worksheet.name) !== String(sheetName)) continue;
        for await (const row of worksheet) {
            if (row.number !== headerRow) continue;
            found = rowValues(row, config.maxColumns);
            break;
        }
        break;
    }
    return found;
}

async function readHeaderWithOoxml(filePath, sheetName, headerRow, config) {
    return withOoxmlWorkbook(filePath, async (workbook) => {
        let found = null;
        const foundSheet = await workbook.streamRows(sheetName, (row) => {
            if (row.number !== headerRow) return;
            found = rowValues(row, config.maxColumns);
            return false;
        });
        return foundSheet ? found : null;
    });
}

export async function readSheetHeader(filePath, sheetName, headerRow, config) {
    let found = null;
    try {
        found = await readHeaderWithExcelJs(filePath, sheetName, headerRow, config);
    } catch {
        // Thử parser OOXML tương thích trước khi trả lỗi cho người dùng.
    }
    if (!found) found = await readHeaderWithOoxml(filePath, sheetName, headerRow, config);
    if (!found) {
        throw new ExcelImportError('Không tìm thấy dòng tiêu đề trong sheet đã chọn.', 'EXCEL_IMPORT_HEADER_ROW_INVALID', 422);
    }
    return found;
}

export async function streamSheetRows(filePath, sheetName, onRow) {
    let foundSheet = false;
    try {
        const reader = createReader(filePath);
        for await (const worksheet of reader) {
            if (String(worksheet.name) !== String(sheetName)) continue;
            foundSheet = true;
            for await (const row of worksheet) {
                const callbackResult = onRow(row, worksheet);
                const resolved = callbackResult && typeof callbackResult.then === 'function'
                    ? await callbackResult
                    : callbackResult;
                if (resolved === false) break;
            }
            break;
        }
    } catch (error) {
        // Khi callback đã chạy, không được fallback vì sẽ xử lý trùng dòng.
        if (foundSheet) throw error;
    }
    if (foundSheet) return;

    foundSheet = await withOoxmlWorkbook(
        filePath,
        (workbook) => workbook.streamRows(sheetName, onRow)
    );
    if (!foundSheet) {
        throw new ExcelImportError('Sheet đã chọn không tồn tại.', 'EXCEL_IMPORT_SHEET_NOT_FOUND', 422);
    }
}
