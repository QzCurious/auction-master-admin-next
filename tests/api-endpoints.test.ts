import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import ky, { HTTPError } from 'ky';

import { AdminLogin } from '../src/api/endpoints/AdminLogin';
import { CreateAdmin } from '../src/api/endpoints/admins/CreateAdmin';
import { GetAdmins } from '../src/api/endpoints/admins/GetAdmins';
import { UpdateAdminPassword } from '../src/api/endpoints/admins/UpdateAdminPassword';
import { BidAuctionItem } from '../src/api/endpoints/auction-items/BidAuctionItem';
import { HandleConsignorVerification } from '../src/api/endpoints/consignor/HandleConsignorVerification';
import { AdminReorderItemPhoto } from '../src/api/endpoints/items/AdminReorderItemPhoto';
import { AdminUpsertItemPhoto } from '../src/api/endpoints/items/AdminUpsertItemPhoto';
import { AddPermissionForRole } from '../src/api/endpoints/rbac/AddPermissionForRole';
import { GetAdminPermissions } from '../src/api/endpoints/rbac/GetAdminPermissions';
import { GetRecordsSummary } from '../src/api/endpoints/reports/GetRecordsSummary';
import { ExportShippings } from '../src/api/endpoints/shippings/ExportShippings';
import { UpdateShipping } from '../src/api/endpoints/shippings/UpdateShipping';
import { GetWorkers } from '../src/api/endpoints/workers/GetWorkers';
import { SetWorkerCookie } from '../src/api/endpoints/workers/SetWorkerCookie';

function fixture() {
  const requests: Request[] = [];
  const api = ky.create({
    prefixUrl: 'https://upstream.example/',
    retry: 0,
    headers: { Authorization: 'Bearer synthetic' },
    fetch: async (input) => {
      requests.push(input as Request);
      return Response.json({ data: 'Success', status: { code: '0' } });
    },
  });
  return { api, requests };
}

void test('query contracts retain repeated filters, coercion, dates, defaults, and Bearer headers', async () => {
  const { api, requests } = fixture();
  await GetWorkers(api, { type: ['seller', 'watcher'], status: [0, 1] });
  let url = new URL(requests[0].url);
  assert.equal(url.pathname, '/backend/workers');
  assert.deepEqual(url.searchParams.getAll('type'), ['seller', 'watcher']);
  assert.deepEqual(url.searchParams.getAll('status'), ['0', '1']);
  assert.equal(url.searchParams.get('limit'), '10');
  assert.equal(url.searchParams.get('offset'), '0');
  await GetRecordsSummary(api, { type: [0, 1], startAt: new Date('2025-01-01Z') });
  url = new URL(requests[1].url);
  assert.equal(url.pathname, '/backend/reports/records/summary');
  assert.equal(url.searchParams.get('startAt'), '2025-01-01T00:00:00.000Z');
  assert.deepEqual(url.searchParams.getAll('type'), ['0', '1']);
  await GetAdminPermissions(api, 'operator');
  assert.equal(new URL(requests[2].url).pathname, '/backend/permissions/operator');
  for (const request of requests) {
    assert.equal(request.method, 'GET');
    assert.equal(request.headers.get('Authorization'), 'Bearer synthetic');
  }
});

void test('mutation contracts preserve JSON transforms, form arrays, zero values, and raw cookie payloads', async () => {
  const { api, requests } = fixture();
  await AddPermissionForRole(api, { role: 'operator', permissions: [{ key: 'AdminUpdateItem', fields: ['name'] }] });
  assert.equal(requests[0].method, 'POST');
  assert.equal(new URL(requests[0].url).pathname, '/backend/permissions');
  assert.deepEqual(await requests[0].json(), {
    role: ['operator'],
    permissions: [{ key: 'AdminUpdateItem', fields: ['name'] }],
  });
  await UpdateShipping(api, '42', {
    itemIds: [1, 2],
    auctionIds: ['a', 'b'],
    internationalShippingCosts: 0,
    remark: '',
  });
  assert.equal(requests[1].method, 'PATCH');
  assert.equal(new URL(requests[1].url).pathname, '/backend/shippings/42');
  assert.equal(
    await requests[1].text(),
    'itemIds=1&itemIds=2&auctionIds=a&auctionIds=b&internationalShippingCosts=0&remark='
  );
  await SetWorkerCookie(api, 4, '[{"name":"session","value":"synthetic"}]');
  assert.equal(requests[2].headers.get('Content-Type'), 'application/json');
  assert.equal(await requests[2].text(), '[{"name":"session","value":"synthetic"}]');
  await BidAuctionItem(api, 'auction-1', { price: 0 });
  assert.equal(new URL(requests[3].url).pathname, '/backend/auction-items/auction-1/bid');
  assert.equal(await requests[3].text(), 'price=0');
  await AdminReorderItemPhoto(api, 1, { originalSorted: 0, newSorted: 2 });
  assert.equal(await requests[4].text(), 'originalSorted=0&newSorted=2');
  for (const action of ['approve', 'reject'] as const) await HandleConsignorVerification(api, 9, action);
  assert.equal(new URL(requests[5].url).pathname, '/backend/consignors/verifications/9/approve');
  assert.equal(new URL(requests[6].url).pathname, '/backend/consignors/verifications/9/reject');
});

void test('validation precedes HTTP and multipart upload preserves files and ordering', async () => {
  const { api, requests } = fixture();
  await assert.rejects(UpdateAdminPassword(api, 1, { oldPassword: '', password: 'new' }));
  await assert.rejects(AdminUpsertItemPhoto(api, 1, new FormData()));
  assert.equal(requests.length, 0);
  const form = new FormData();
  form.append('photo', new Blob(['image contents'], { type: 'image/png' }), 'test.png');
  form.append('sorted', '0');
  await AdminUpsertItemPhoto(api, 1, form);
  const body = await requests[0].formData();
  assert.equal(body.get('sorted'), '0');
  assert.equal(await (body.get('photo') as File).text(), 'image contents');
  assert.equal((body.get('photo') as File).name, 'test.png');
});

void test('login and admin creation keep form encoding; endpoints propagate native HTTPError', async () => {
  const { api, requests } = fixture();
  await AdminLogin(api, { account: 'a&b', password: 'p=+' });
  assert.equal(new URL(requests[0].url).pathname, '/backend/session');
  assert.equal(await requests[0].text(), 'account=a%26b&password=p%3D%2B');
  await CreateAdmin(api, { account: 'operator', password: 'secret', status: 0 });
  assert.equal(await requests[1].text(), 'account=operator&password=secret&status=0');
  const failing = api.extend({
    fetch: async () => Response.json({ data: null, status: { code: '1001' } }, { status: 403 }),
  });
  await assert.rejects(
    GetAdmins(failing, {}),
    (asyncError) => asyncError instanceof HTTPError && asyncError.response.status === 403
  );
});

void test('shipping export returns the original binary response and preserves query encoding', async () => {
  const { api, requests } = fixture();
  const binary = api.extend({
    fetch: async (input) => {
      requests.push(input as Request);
      return new Response(new Uint8Array([0, 1, 255]), { headers: { 'Content-Type': 'application/vnd.ms-excel' } });
    },
  });
  const response = await ExportShippings(binary, new URLSearchParams('id=1&id=2&name=a%26b'));
  assert.equal(new URL(requests[0].url).pathname, '/backend/shippings/excel');
  assert.equal(new URL(requests[0].url).search, '?id=1&id=2&name=a%26b');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array([0, 1, 255]));
});

void test('all extracted endpoint modules load without Next.js context or configured backend', async () => {
  const root = path.resolve('src/api/endpoints');
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (file.endsWith('.ts')) {
        const source = await readFile(file, 'utf8');
        assert.doesNotMatch(source, /next\/|@\/server\/|use server|createApiErrorServerSide|apiClientWithToken/);
        await import(file);
      }
    }
  }
  await visit(root);
});
