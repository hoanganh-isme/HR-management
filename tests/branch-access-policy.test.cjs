const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const context = vm.createContext({
  console,
  Promise,
  APP_SETTINGS: { adminGroupIds: ['Admin'] },
  AppStorage: {
    getStored(key, fallback) { return storage.has(key) ? storage.get(key) : fallback; },
    setStored(key, value) { storage.set(key, value); },
    removeStored(key) { storage.delete(key); }
  }
});
context.window = context;

function load(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
}

load('src/js/app/AppContext.js');
load('src/js/app/BranchAccessPolicy.js');

const allBranches = [
  'VANPHONGCHINHANH', 'VANPHONG', 'TRANHUNGDAO', 'THANHDA', 'SGCENTER',
  'NAMVINH', 'HUNGVUONG', 'HOANGHAI', 'ESTELLA', 'DONGDU', 'COBI'
].map((id) => ({ BranchID: id, BranchName: id }));

storage.set('user', JSON.stringify({
  code: 0,
  records: [{ UserName: 'testapp', UserGroupID: 'Nhom', BranchID: 'ESTELLA, HOANGHAI,HUNGVUONG' }]
}));

assert.equal(context.AppContext.getUserName(), 'testapp');
assert.deepEqual(
  Array.from(context.BranchAccessPolicy.getAssignedBranchIds(context.AppContext.getCurrentUser())),
  ['ESTELLA', 'HOANGHAI', 'HUNGVUONG']
);
assert.deepEqual(
  Array.from(context.BranchAccessPolicy.filterBranches(allBranches)).map((row) => row.BranchID),
  ['HUNGVUONG', 'HOANGHAI', 'ESTELLA']
);
assert.equal(
  context.BranchAccessPolicy.applyScopeToFilter({ Keyword: 'A' }).BranchID,
  'ESTELLA,HOANGHAI,HUNGVUONG'
);
assert.equal(
  context.BranchAccessPolicy.applyScopeToFilter({ BranchID: 'COBI,HUNGVUONG' }).BranchID,
  'HUNGVUONG'
);

const scopedEmployeeResponse = context.BranchAccessPolicy.applyResponseScope({
  records: [
    { PersonID: 'A', BranchID: 'ESTELLA' },
    { PersonID: 'B', BranchID: 'COBI' },
    { PersonID: 'C', BranchID: 'HUNGVUONG' }
  ],
  _recordtotal: 3,
  _pagetotal: 1
});
assert.deepEqual(Array.from(scopedEmployeeResponse.records).map((row) => row.PersonID), ['A', 'C']);
assert.equal(scopedEmployeeResponse._recordtotal, 2);

storage.set('user', JSON.stringify({ UserName: 'admin', UserGroupID: 'Admin', BranchID: '' }));
assert.equal(context.BranchAccessPolicy.filterBranches(allBranches).length, 11);

storage.set('user', JSON.stringify({ UserName: 'limited', UserGroupID: 'Nhom', BranchID: '' }));
assert.equal(context.BranchAccessPolicy.filterBranches(allBranches).length, 0);
assert.equal(context.BranchAccessPolicy.isAdmin({ UserGroupID: 'XEM', IsAdmin: true }), false);
assert.deepEqual(
  Array.from(context.BranchAccessPolicy.applyResponseScope({
    records: [{ PersonID: 'blocked', BranchID: 'COBI' }]
  }).records),
  []
);

storage.set('user', JSON.stringify({ code: 0, UserName: 'testapp', access_token: 'not-persisted-in-context' }));
context.GatewayClient = {
  view(listName, options) {
    assert.equal(listName, 'WA_NguoiDungFrm');
    assert.equal(options.keyword, 'testapp');
    return Promise.resolve({
      UserName: 'testapp',
      UserGroupID: 'Nhom',
      BranchID: 'ESTELLA,HOANGHAI,HUNGVUONG',
      Password: 'hidden',
      records: [
        { UserName: 'testapp2', BranchID: 'COBI' },
        { UserName: 'testapp', HoTen: 'Test App', BranchID: '', UserGroupID: 'XEM' }
      ]
    });
  }
};
load('src/js/data/UserContextRepository.js');

let capturedRequest;
context.UserContextRepository.resolveCurrent().then((resolvedUser) => {
  assert.equal(resolvedUser.BranchID, 'ESTELLA,HOANGHAI,HUNGVUONG');
  assert.equal(resolvedUser.Password, undefined);
  context.GatewayClient = {
    execute(listName, data, options) {
      capturedRequest = { listName, data, options };
      return Promise.resolve({ records: allBranches });
    }
  };
  load('src/js/data/BranchRepository.js');
  return context.BranchRepository.getAccessible();
}).then((rows) => {
  assert.equal(capturedRequest.listName, 'CF_BranchListFrm');
  assert.equal(capturedRequest.data.BranchID, 'ESTELLA,HOANGHAI,HUNGVUONG');
  assert.equal(capturedRequest.options.payload.UserName, 'testapp');
  assert.deepEqual(Array.from(rows).map((row) => row.BranchID), ['HUNGVUONG', 'HOANGHAI', 'ESTELLA']);
  context.AppContext.setResolvedUser(null);
  storage.set('user', JSON.stringify({ code: 0, access_token: 'token-only-response' }));
  storage.set('auth_username', 'testapp');
  context.GatewayClient = {
    execute(listName, data, options) {
      capturedRequest = { listName, data, options };
      return Promise.resolve({ records: allBranches.filter((row) => ['HUNGVUONG', 'HOANGHAI', 'ESTELLA'].includes(row.BranchID)) });
    }
  };
  return context.BranchRepository.getAccessible();
}).then((rows) => {
  assert.equal(capturedRequest.options.payload.UserName, 'testapp');
  assert.equal(capturedRequest.data.BranchID, '');
  assert.deepEqual(Array.from(rows), []);
  assert.equal(context.AppContext.getCurrentUser().BranchID, undefined);
  console.log('branch-access-policy: OK');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
