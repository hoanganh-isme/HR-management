import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function loadBrowserScript(relativePath, extras = {}) {
  const window = {};
  const context = vm.createContext({ window, console, Promise, ...extras });
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { filename: relativePath });
  return { window, context };
}

test('ModuleDefinition keeps form contract and adds mobile metadata', () => {
  const { window } = loadBrowserScript('src/js/core/ModuleDefinition.js');
  const result = window.ModuleDefinition.create({ FormName: 'WA_PersonFullFrm', PrimaryKey: 'PersonID', FormFields: [{ name: 'PersonID', label: 'Mã nhân sự', orderNo: 1 }] });
  assert.equal(result.FormName, 'WA_PersonFullFrm');
  assert.equal(result.PrimaryKey, 'PersonID');
  assert.deepEqual(Array.from(result.capabilities), ['responsive']);
  assert.equal(result.FormFields[0].MobileVisible, true);
  assert.equal(result.FormFields[0].MobileOrder, 1);
});

test('FormActionRegistry always returns a Promise', async () => {
  const { window } = loadBrowserScript('src/js/core/FormActionRegistry.js');
  window.FormActionRegistry.register('test-action', (ctx) => ({ id: ctx.id }));
  assert.deepEqual(await window.FormActionRegistry.execute('test-action', { id: 'NV0001' }), { id: 'NV0001' });
  await assert.rejects(window.FormActionRegistry.execute('missing-action'), /Unknown form action/);
});

test('SafeFormula evaluates arithmetic only and rejects code', () => {
  const { window } = loadBrowserScript('src/js/core/SafeFormula.js');
  assert.equal(window.SafeFormula.evaluate('({base} + 5) * 2'.replace('{base}', '10')), 30);
  assert.throws(() => window.SafeFormula.evaluate('globalThis.process.exit()'), /Unsupported formula/);
});

test('ApiClient response normalizer accepts existing envelopes', () => {
  const { window } = loadBrowserScript('src/js/utils/apiClient.js', {
    document: { cookie: '', },
    fetch: async () => { throw new Error('not called'); },
    localStorage: { removeItem() {} }
  });
  const normalize = window.ApiClient.normalizeResponse;
  assert.deepEqual(normalize({ records: [{ id: 1 }] }).records, [{ id: 1 }]);
  assert.deepEqual(normalize({ list: [{ id: 2 }] }).records, [{ id: 2 }]);
  assert.deepEqual(normalize({ data: [{ id: 3 }] }).records, [{ id: 3 }]);
  assert.deepEqual(normalize([{ id: 4 }]).records, [{ id: 4 }]);
});

test('DocumentExportPlugin carries the HR-neutral id and compatibility alias', () => {
  const source = fs.readFileSync(path.join(root, 'src/js/utils/DocumentExportPlugin.js'), 'utf8');
  assert.match(source, /documentId:\s*docId/);
  assert.match(source, /customerId:\s*docId/);
});
