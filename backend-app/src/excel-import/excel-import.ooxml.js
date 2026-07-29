import path from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { SaxesParser } from 'saxes';
import yauzl from 'yauzl';
import { ExcelImportError } from './excel-import.errors.js';

const WORKBOOK_PATH = 'xl/workbook.xml';
const WORKBOOK_RELS_PATH = 'xl/_rels/workbook.xml.rels';
const CALLBACK_FAILURE = Symbol('OOXML_CALLBACK_FAILURE');
const DATE_FORMAT_IDS = new Set([
    14, 15, 16, 17, 18, 19, 20, 21, 22,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    45, 46, 47,
    50, 51, 52, 53, 54, 55, 56, 57, 58
]);

function workbookError(reason) {
    return new ExcelImportError(
        'Không đọc được cấu trúc file Excel.',
        'EXCEL_IMPORT_WORKBOOK_INVALID',
        422,
        { reason: String(reason?.code || reason?.message || reason || 'OOXML_INVALID').slice(0, 200) }
    );
}

function localName(tag) {
    const name = typeof tag === 'string' ? tag : tag?.name;
    return String(name || '').split(':').pop();
}

function attribute(attributes, ...names) {
    const wanted = new Set(names.map((name) => String(name).toLowerCase()));
    for (const [name, value] of Object.entries(attributes || {})) {
        if (wanted.has(String(name).toLowerCase())
            || wanted.has(localName(name).toLowerCase())) {
            return value;
        }
    }
    return undefined;
}

function normalizeEntryName(name) {
    return String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function resolveRelationshipTarget(target) {
    const raw = String(target || '').replace(/\\/g, '/');
    const resolved = raw.startsWith('/')
        ? normalizeEntryName(raw)
        : path.posix.normalize(path.posix.join('xl', raw));
    if (!resolved || resolved === '..' || resolved.startsWith('../') || resolved.includes('/../')) {
        throw workbookError('OOXML_RELATIONSHIP_PATH_INVALID');
    }
    return resolved;
}

async function openArchive(filePath) {
    const zipfile = await new Promise((resolve, reject) => {
        yauzl.open(filePath, { lazyEntries: true, autoClose: false }, (error, opened) => {
            if (error) reject(workbookError(error));
            else resolve(opened);
        });
    });
    const entries = new Map();
    try {
        await new Promise((resolve, reject) => {
            zipfile.on('error', reject);
            zipfile.on('entry', (entry) => {
                entries.set(normalizeEntryName(entry.fileName).toLowerCase(), entry);
                zipfile.readEntry();
            });
            zipfile.on('end', resolve);
            zipfile.readEntry();
        });
        return { zipfile, entries };
    } catch (error) {
        try { zipfile.close(); } catch { /* ignore */ }
        throw workbookError(error);
    }
}

function findEntry(archive, entryPath, required = true) {
    const entry = archive.entries.get(normalizeEntryName(entryPath).toLowerCase());
    if (!entry && required) throw workbookError(`OOXML_ENTRY_NOT_FOUND:${entryPath}`);
    return entry || null;
}

async function openEntryStream(archive, entryPath, required = true) {
    const entry = findEntry(archive, entryPath, required);
    if (!entry) return null;
    return new Promise((resolve, reject) => {
        archive.zipfile.openReadStream(entry, (error, stream) => {
            if (error) reject(workbookError(error));
            else resolve(stream);
        });
    });
}

function createParser(handlers) {
    const parser = new SaxesParser({ xmlns: false, position: false });
    for (const [eventName, handler] of Object.entries(handlers)) parser.on(eventName, handler);
    return parser;
}

async function parseXmlEntry(archive, entryPath, handlers, required = true) {
    const stream = await openEntryStream(archive, entryPath, required);
    if (!stream) return false;
    const parser = createParser(handlers);
    const decoder = new StringDecoder('utf8');
    try {
        for await (const chunk of stream) parser.write(decoder.write(chunk));
        parser.write(decoder.end()).close();
        return true;
    } catch (error) {
        throw error instanceof ExcelImportError ? error : workbookError(error);
    }
}

async function readRelationships(archive) {
    const relationships = new Map();
    const typedPaths = new Map();
    await parseXmlEntry(archive, WORKBOOK_RELS_PATH, {
        opentag(tag) {
            if (localName(tag) !== 'Relationship') return;
            const id = attribute(tag.attributes, 'Id');
            const type = String(attribute(tag.attributes, 'Type') || '');
            const target = attribute(tag.attributes, 'Target');
            const targetMode = String(attribute(tag.attributes, 'TargetMode') || '');
            if (!id || !target || targetMode.toLowerCase() === 'external') return;
            const entryPath = resolveRelationshipTarget(target);
            relationships.set(String(id), { type, entryPath });
            if (type) typedPaths.set(type.split('/').pop(), entryPath);
        }
    });
    return { relationships, typedPaths };
}

async function readWorkbookInfo(archive, relationships) {
    const sheets = [];
    let date1904 = false;
    await parseXmlEntry(archive, WORKBOOK_PATH, {
        opentag(tag) {
            const name = localName(tag);
            if (name === 'workbookPr') {
                const value = String(attribute(tag.attributes, 'date1904') || '').toLowerCase();
                date1904 = value === '1' || value === 'true';
                return;
            }
            if (name !== 'sheet') return;
            const relationshipId = attribute(tag.attributes, 'r:id', 'id');
            const relationship = relationships.get(String(relationshipId || ''));
            if (!relationship || !relationship.type.endsWith('/worksheet')) return;
            sheets.push({
                name: String(attribute(tag.attributes, 'name') || '').slice(0, 255),
                entryPath: relationship.entryPath
            });
        }
    });
    if (!sheets.length) throw workbookError('OOXML_NO_WORKSHEETS');
    return { sheets, date1904 };
}

async function readSharedStrings(archive, entryPath) {
    if (!entryPath || !findEntry(archive, entryPath, false)) return [];
    const values = [];
    let insideItem = false;
    let insideText = false;
    let current = '';
    await parseXmlEntry(archive, entryPath, {
        opentag(tag) {
            const name = localName(tag);
            if (name === 'si') {
                insideItem = true;
                current = '';
            } else if (insideItem && name === 't') {
                insideText = true;
            }
        },
        text(text) {
            if (insideItem && insideText) current += text;
        },
        closetag(tag) {
            const name = localName(tag);
            if (name === 't') insideText = false;
            if (name === 'si') {
                values.push(current);
                current = '';
                insideItem = false;
            }
        }
    }, false);
    return values;
}

function isDateFormat(formatCode) {
    const withoutLiterals = String(formatCode || '')
        .replace(/\[[^\]]*]/g, '')
        .replace(/"[^"]*"/g, '')
        .replace(/\\./g, '');
    return /[ymdhMsb]+/.test(withoutLiterals);
}

async function readDateStyles(archive, entryPath) {
    if (!entryPath || !findEntry(archive, entryPath, false)) return new Set();
    const customFormats = new Map();
    const cellFormats = [];
    let insideCellFormats = false;
    await parseXmlEntry(archive, entryPath, {
        opentag(tag) {
            const name = localName(tag);
            if (name === 'numFmt') {
                const id = Number(attribute(tag.attributes, 'numFmtId'));
                const code = attribute(tag.attributes, 'formatCode');
                if (Number.isInteger(id) && code !== undefined) customFormats.set(id, String(code));
            } else if (name === 'cellXfs') {
                insideCellFormats = true;
            } else if (insideCellFormats && name === 'xf') {
                cellFormats.push(Number(attribute(tag.attributes, 'numFmtId')) || 0);
            }
        },
        closetag(tag) {
            if (localName(tag) === 'cellXfs') insideCellFormats = false;
        }
    }, false);
    const dateStyles = new Set();
    cellFormats.forEach((formatId, styleIndex) => {
        if (DATE_FORMAT_IDS.has(formatId) || isDateFormat(customFormats.get(formatId))) {
            dateStyles.add(styleIndex);
        }
    });
    return dateStyles;
}

function columnNumber(reference) {
    const letters = String(reference || '').match(/^[A-Za-z]+/)?.[0];
    if (!letters) return null;
    let value = 0;
    for (const letter of letters.toUpperCase()) {
        value = (value * 26) + letter.charCodeAt(0) - 64;
    }
    return value || null;
}

function excelSerialToDate(value, date1904) {
    const serial = Number(value);
    if (!Number.isFinite(serial)) return value;
    const unixDays = serial - 25569 + (date1904 ? 1462 : 0);
    return new Date(Math.round(unixDays * 86400000));
}

function parseScalar(rawValue, type, styleIndex, sharedStrings, dateStyles, date1904) {
    const raw = rawValue === undefined || rawValue === null ? '' : String(rawValue);
    if (type === 's') return sharedStrings[Number(raw)] ?? '';
    if (type === 'str' || type === 'inlineStr') return raw;
    if (type === 'b') return raw === '1' || raw.toLowerCase() === 'true';
    if (type === 'd') {
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? raw : parsed;
    }
    if (type === 'e') return { error: raw };
    if (raw.trim() === '') return null;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return raw;
    return dateStyles.has(styleIndex)
        ? excelSerialToDate(numeric, date1904)
        : numeric;
}

function createRow(rowNumber, cells, lastColumn) {
    const values = Array(Math.max(0, lastColumn) + 1);
    for (const [column, value] of cells) values[column] = value;
    return {
        number: rowNumber,
        cellCount: Math.max(0, lastColumn),
        values,
        getCell(column) {
            return { value: cells.get(Number(column)) };
        },
        eachCell(options, callback) {
            const includeEmpty = options?.includeEmpty === true;
            if (includeEmpty) {
                for (let column = 1; column <= lastColumn; column += 1) {
                    callback({ value: cells.get(column) }, column);
                }
                return;
            }
            for (const [column, value] of cells) {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    callback({ value }, column);
                }
            }
        }
    };
}

async function streamWorksheet(
    archive,
    sheet,
    { sharedStrings, dateStyles, date1904 },
    onRow
) {
    const stream = await openEntryStream(archive, sheet.entryPath);
    const decoder = new StringDecoder('utf8');
    const completedRows = [];
    let currentRow = null;
    let currentCell = null;
    let activeValueTag = '';
    let nextRowNumber = 1;

    const parser = createParser({
        opentag(tag) {
            const name = localName(tag);
            if (name === 'row') {
                const explicitNumber = Number(attribute(tag.attributes, 'r'));
                const rowNumber = Number.isInteger(explicitNumber) && explicitNumber > 0
                    ? explicitNumber
                    : nextRowNumber;
                currentRow = { number: rowNumber, cells: new Map(), lastColumn: 0 };
                nextRowNumber = rowNumber + 1;
                return;
            }
            if (name === 'c' && currentRow) {
                const referencedColumn = columnNumber(attribute(tag.attributes, 'r'));
                const column = referencedColumn || currentRow.lastColumn + 1;
                currentCell = {
                    column,
                    type: String(attribute(tag.attributes, 't') || ''),
                    styleIndex: Number(attribute(tag.attributes, 's')) || 0,
                    value: '',
                    inlineText: '',
                    formula: ''
                };
                currentRow.lastColumn = Math.max(currentRow.lastColumn, column);
                return;
            }
            if (!currentCell) return;
            if (name === 'v' || name === 'f' || name === 't') activeValueTag = name;
        },
        text(text) {
            if (!currentCell || !activeValueTag) return;
            if (activeValueTag === 'v') currentCell.value += text;
            else if (activeValueTag === 'f') currentCell.formula += text;
            else if (activeValueTag === 't') currentCell.inlineText += text;
        },
        closetag(tag) {
            const name = localName(tag);
            if (name === 'v' || name === 'f' || name === 't') {
                activeValueTag = '';
                return;
            }
            if (name === 'c' && currentRow && currentCell) {
                const sourceValue = currentCell.type === 'inlineStr'
                    ? currentCell.inlineText
                    : currentCell.value;
                const scalar = parseScalar(
                    sourceValue,
                    currentCell.type,
                    currentCell.styleIndex,
                    sharedStrings,
                    dateStyles,
                    date1904
                );
                const value = currentCell.formula
                    ? {
                        formula: currentCell.formula,
                        result: sourceValue === '' ? undefined : scalar
                    }
                    : scalar;
                currentRow.cells.set(currentCell.column, value);
                currentCell = null;
                return;
            }
            if (name === 'row' && currentRow) {
                completedRows.push(createRow(
                    currentRow.number,
                    currentRow.cells,
                    currentRow.lastColumn
                ));
                currentRow = null;
            }
        }
    });

    try {
        for await (const chunk of stream) {
            parser.write(decoder.write(chunk));
            while (completedRows.length) {
                const row = completedRows.shift();
                let resolved;
                try {
                    const result = onRow(row, sheet);
                    resolved = result && typeof result.then === 'function' ? await result : result;
                } catch (error) {
                    throw { type: CALLBACK_FAILURE, cause: error };
                }
                if (resolved === false) {
                    stream.destroy();
                    return;
                }
            }
        }
        parser.write(decoder.end()).close();
        while (completedRows.length) {
            const row = completedRows.shift();
            let resolved;
            try {
                const result = onRow(row, sheet);
                resolved = result && typeof result.then === 'function' ? await result : result;
            } catch (error) {
                throw { type: CALLBACK_FAILURE, cause: error };
            }
            if (resolved === false) return;
        }
    } catch (error) {
        if (error?.type === CALLBACK_FAILURE) throw error.cause;
        throw error instanceof ExcelImportError ? error : workbookError(error);
    }
}

export async function withOoxmlWorkbook(filePath, task) {
    const archive = await openArchive(filePath);
    try {
        const { relationships, typedPaths } = await readRelationships(archive);
        const workbookInfo = await readWorkbookInfo(archive, relationships);
        const sharedStrings = await readSharedStrings(archive, typedPaths.get('sharedStrings'));
        const dateStyles = await readDateStyles(archive, typedPaths.get('styles'));
        const context = {
            sheets: workbookInfo.sheets.map(({ name }) => ({ name })),
            async streamRows(sheetName, onRow) {
                const sheet = workbookInfo.sheets.find(
                    (item) => String(item.name) === String(sheetName)
                );
                if (!sheet) return false;
                await streamWorksheet(archive, sheet, {
                    sharedStrings,
                    dateStyles,
                    date1904: workbookInfo.date1904
                }, onRow);
                return true;
            }
        };
        return await task(context);
    } finally {
        try { archive.zipfile.close(); } catch { /* ignore */ }
    }
}
