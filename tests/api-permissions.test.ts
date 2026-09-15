import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluatePermissions, type Permissions } from '../src/domain/permission/evaluatePermissions';
import { permissionResult } from '../src/domain/permission/permissionResult';

void test('shared permission evaluator handles keys, fields, empty requirements, and missing grants', () => {
  const grants: Permissions = { AdminUpdateItem: { fields: ['name', 'status'] }, GetItemsAndDetails: { fields: [] } };
  assert.equal(evaluatePermissions(null, []), true);
  assert.equal(evaluatePermissions(null, ['AdminUpdateItem']), false);
  assert.equal(evaluatePermissions(grants, ['GetItemsAndDetails', 'AdminUpdateItem']), true);
  assert.equal(evaluatePermissions(grants, [{ key: 'AdminUpdateItem', fields: ['name', 'status'] }]), true);
  assert.equal(evaluatePermissions(grants, [{ key: 'AdminUpdateItem', fields: ['name', 'reservePrice'] }]), false);
  assert.equal(evaluatePermissions(grants, [{ key: 'DeleteAdmin', fields: [] }]), false);
  assert.equal(evaluatePermissions(grants, [{ key: 'GetItemsAndDetails', fields: [] }]), true);
  assert.equal(evaluatePermissions(Object.create(grants) as Permissions, ['AdminUpdateItem']), false);
  assert.equal(evaluatePermissions({ AdminUpdateItem: undefined }, ['AdminUpdateItem']), false);
});

void test('permission fetch failures stay distinct from empty grants and backend denial', () => {
  assert.deepEqual(permissionResult({ data: {} }), { kind: 'loaded', permissions: {} });
  assert.deepEqual(permissionResult({ data: null, error: { code: '1003', type: 'redirect', url: '/auth/sign-in' } }), {
    kind: 'unauthenticated',
  });
  assert.deepEqual(permissionResult({ data: null, error: { code: '1001', type: 'toast', message: '沒有權限' } }), {
    kind: 'forbidden',
  });
  for (const code of ['9999', '10', '1002']) {
    assert.deepEqual(permissionResult({ data: null, error: { code, type: 'toast', message: 'upstream failure' } }), {
      kind: 'unavailable',
    });
  }
  assert.deepEqual(permissionResult({ data: null }), { kind: 'unavailable' });
});
