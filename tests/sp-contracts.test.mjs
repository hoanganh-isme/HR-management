import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const calls = [];
const context = vm.createContext({
  console,
  Promise,
  JSON,
  Object,
  Array,
  String,
  Number,
  Error,
  window: null,
  ApiClient: {
    post(endpoint, payload) {
      calls.push({ endpoint, payload });
      return Promise.resolve({ code: 0, msg: 'ok', records: [] });
    }
  }
});
context.window = context;

function loadSource(path) {
  vm.runInContext(readFileSync(new URL(path, root), 'utf8'), context, { filename: path });
}

function fixture(domain, name) {
  return JSON.parse(readFileSync(new URL(`fixtures/sp/${domain}/${name}.json`, import.meta.url), 'utf8'));
}

loadSource('src/js/core/metadata/ModuleConfigNormalizer.js');
loadSource('src/js/data/GatewayClient.js');
loadSource('src/js/core/metadata/ModuleDefinition.js');
loadSource('src/js/core/metadata/ModuleRegistry.js');

test.beforeEach(() => { calls.length = 0; });

test('GatewayClient builds the unchanged gateway payload', async () => {
  await context.GatewayClient.run(
    { sp: 'WA_PersonFullFrm', func: 'View', formName: 'WA_PersonFullFrm', limit: 100 },
    { BranchID: 'CN01' },
    { page: 2, keyword: 'NV', payload: { UserName: 'tester' } }
  );
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), {
    endpoint: '/api/API_Gateway_Router',
    payload: {
      UserName: 'tester',
      List: 'WA_PersonFullFrm',
      FormName: 'WA_PersonFullFrm',
      Func: 'View',
      Limit: 100,
      Page: 2,
      Keyword: 'NV',
      JsonData: JSON.stringify({ BranchID: 'CN01' })
    }
  });
});

test('GatewayClient builds paging and search fields for direct transport', async () => {
  await context.GatewayClient.run(
    { endpoint: '/api/shift/auto-assign', transport: 'direct' },
    { BranchID: 'CN01' },
    { page: 3, limit: 25, keyword: 'NV' }
  );
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), {
    endpoint: '/api/shift/auto-assign',
    payload: { BranchID: 'CN01', Limit: 25, Page: 3, Keyword: 'NV' }
  });
});

test('module operation resolution and required fields', async () => {
  const config = {
    FormName: 'WA_BaoHiemFrm',
    actions: {
      calculateInsurance: {
        sp: 'WA_BaoHiemFrm_Calculate',
        func: 'View',
        requiredFields: ['PeriodID', 'LoaiBaoHiem', 'MucDong']
      }
    }
  };
  assert.throws(
    () => context.GatewayClient.runModuleOperation(config, 'calculateInsurance', { PeriodID: '202601' }),
    /LoaiBaoHiem, MucDong/
  );
  await context.GatewayClient.runModuleOperation(config, 'calculateInsurance', {
    PeriodID: '202601', LoaiBaoHiem: 'BHXH', MucDong: 10000000
  });
  assert.equal(calls[0].payload.List, 'WA_BaoHiemFrm_Calculate');
});

test('compatibility methods preserve View, Save, Delete and execute', async () => {
  await context.GatewayClient.view('SY_Period', { limit: 20 });
  await context.GatewayClient.save('WA_PersonFullFrm', { PersonID: 'NV001' });
  await context.GatewayClient.delete('WA_PersonFullFrm', { PersonID: 'NV001' });
  await context.GatewayClient.execute('WA_PayRoll_Process_Stp', { PeriodID: '202601' }, { func: 'Run' });
  assert.deepEqual(calls.map((call) => call.payload.Func), ['View', 'Save', 'Delete', 'Run']);
});

test('controlled config inheritance merges maps and overrides arrays', () => {
  const merged = context.ModuleRegistry.mergeConfig(
    { operations: { list: { sp: 'Base' } }, responsive: { desktop: 'table' }, messages: ['base'] },
    { operations: { save: { sp: 'Save' } }, responsive: { mobile: 'card' }, messages: ['module'] }
  );
  assert.equal(merged.operations.list.sp, 'Base');
  assert.equal(merged.operations.save.sp, 'Save');
  assert.deepEqual(JSON.parse(JSON.stringify(merged.responsive)), { desktop: 'table', mobile: 'card' });
  assert.deepEqual(JSON.parse(JSON.stringify(merged.messages)), ['module']);

  const appended = context.ModuleRegistry.mergeConfig(
    { messages: ['base'] },
    { messages: ['module'], mergeMode: { messages: 'append' } }
  );
  assert.deepEqual(JSON.parse(JSON.stringify(appended.messages)), ['base', 'module']);
});

test('domain success fixtures expose required fields and data types', () => {
  const employee = fixture('employee', 'success').records[0];
  const contract = fixture('contract', 'success').records[0];
  const shift = fixture('shift', 'success').records[0];
  const insurance = fixture('insurance', 'success').records[0];
  const payroll = fixture('payroll', 'success').records[0];
  const dashboard = fixture('dashboard', 'success').records[0];

  assert.equal(typeof employee.PersonID, 'string');
  assert.equal(typeof employee.BranchID, 'string');
  assert.equal(typeof contract.MaHopDong, 'string');
  assert.equal(typeof shift.SapCaID, 'string');
  assert.equal(typeof insurance.MucDongBHXHNLD, 'number');
  assert.equal(typeof payroll.totalSalary, 'number');
  assert.equal(typeof dashboard.headcount, 'number');
  assert.equal(dashboard.avgSalary, dashboard.totalSalary / dashboard.headcount);
});

test('fixtures cover paging, code/msg, empty and error responses', () => {
  ['employee', 'contract', 'shift', 'insurance', 'payroll', 'dashboard'].forEach((domain) => {
    const success = fixture(domain, 'success');
    const empty = fixture(domain, 'empty');
    const error = fixture(domain, 'error');
    assert.equal(success.code, 0);
    assert.equal(typeof success.msg, 'string');
    assert.ok(Array.isArray(success.records));
    assert.equal(typeof success._recordtotal, 'number');
    assert.equal(typeof success._pagetotal, 'number');
    assert.deepEqual(empty.records, []);
    assert.equal(error.code, 1);
    assert.equal(error.records, null);
  });
});

test('annual leave module uses the leave-row CRUD contract', () => {
  loadSource('src/js/modules/leave/annual-leave.module.js');
  const config = context.APP_MODULES.WA_QUANLYNGHIPHEPNAMFRM;

  assert.equal(config.PrimaryKey, 'UserAutoID');
  assert.notEqual(config.HideAddBtn, true);
  assert.notEqual(config.HideEditBtn, true);
  assert.notEqual(config.HideDeleteBtn, true);
});
