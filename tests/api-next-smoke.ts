/** Run after `pnpm build`; uses only synthetic credentials and a local upstream. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';

async function main() {
  const appPort = 16008;
  const upstreamPort = 16009;
  const origin = `http://localhost:${appPort}`;
  const jwt = (suffix: string, exp = Date.now() / 1000 + 3600) =>
    `e30.${Buffer.from(JSON.stringify({ id: 1, account: 'test', exp, iat: 1, nbf: 1, suffix })).toString('base64url')}.signature`;
  const old = jwt('old');
  const fresh = jwt('new');
  let refreshes = 0;
  let rejectItems = false;
  let refreshStatus = 200;
  const itemTokens: string[] = [];
  const upstream = createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'no-store');
    if (request.url === '/backend/session/refresh') {
      refreshes++;
      response.statusCode = refreshStatus;
      response.end(
        JSON.stringify(
          refreshStatus === 200
            ? { data: { token: fresh }, status: { code: '0' } }
            : { data: null, status: { code: '9999' } }
        )
      );
    } else if (request.url?.startsWith('/backend/items?')) {
      itemTokens.push(request.headers.authorization ?? '');
      response.statusCode = rejectItems ? 401 : 200;
      response.end(
        JSON.stringify(
          rejectItems
            ? { data: null, status: { code: '1003' } }
            : { data: { items: [], count: 0, statusCounts: {} }, status: { code: '0' } }
        )
      );
    } else if (request.url?.startsWith('/backend/permissions/')) {
      response.end(JSON.stringify({ data: { GetItemsAndDetails: { fields: [] } }, status: { code: '0' } }));
    } else {
      response.end(JSON.stringify({ data: {}, status: { code: '0' } }));
    }
  });
  upstream.listen(upstreamPort, '127.0.0.1');
  await once(upstream, 'listening');
  const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(appPort)], {
    env: {
      ...process.env,
      API_BASE_URL: `http://127.0.0.1:${upstreamPort}`,
      HOST_BASE_URL: origin,
      NEXT_PUBLIC_IS_MAINTENANCE: '',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  app.stdout.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  app.stderr.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  const cookie = (accessToken: string) => `admin-token=${accessToken}; admin-refresh-token=smoke-refresh-secret`;
  const get = (path: string, accessToken = old) =>
    fetch(origin + path, { headers: { cookie: cookie(accessToken) }, redirect: 'manual' });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        await fetch(`${origin}/robots.txt`);
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => {
          setTimeout(resolve, 200);
        });
      }
    }
    assert.ok(ready, 'Next.js must start');

    const proactive = await get('/dashboard/items?limit=10', jwt('expired', 1));
    const html = await proactive.text();
    assert.equal(proactive.status, 200);
    assert.ok(proactive.headers.get('set-cookie')?.includes(fresh));
    assert.ok(itemTokens.includes(`Bearer ${fresh}`), 'render must receive the middleware-refreshed cookie');
    assert.ok(
      !html.includes(fresh) && !html.includes('smoke-refresh-secret'),
      'credentials must not enter rendered HTML'
    );

    rejectItems = true;
    const rendering = await get('/dashboard/items?limit=11');
    const renderingBody = await rendering.text();
    assert.ok(
      (rendering.headers.get('location') ?? renderingBody).includes('/auth/refresh?'),
      'render rejection must redirect to the cookie-writable route'
    );

    const route = await get('/auth/refresh?goto=%2Fdashboard%2Fitems%3Flimit%3D11');
    assert.equal(route.status, 307);
    assert.ok(route.headers.get('set-cookie')?.includes(fresh));
    assert.equal(new URL(route.headers.get('location')!).searchParams.get('__auth_retry'), '1');

    const beforeLoop = refreshes;
    const loop = await get('/dashboard/items?limit=12&__auth_retry=1', fresh);
    const loopBody = await loop.text();
    assert.ok(
      (loop.headers.get('location') ?? loopBody).includes('/auth/sign-in?'),
      'second render rejection must stop the loop'
    );
    assert.equal(refreshes, beforeLoop);

    const external = await get('/auth/refresh?goto=https%3A%2F%2Fevil.example');
    assert.equal(new URL(external.headers.get('location')!).origin, origin);
    assert.equal(new URL(external.headers.get('location')!).pathname, '/dashboard');

    refreshStatus = 503;
    const unavailable = await get('/auth/refresh');
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get('set-cookie'), null);
    assert.ok(
      !output.includes(fresh) && !output.includes(old) && !output.includes('smoke-refresh-secret'),
      'logs must not contain tokens'
    );
    console.log(
      'Next.js smoke passed: proactive cookie forwarding, render fallback, route persistence, loop guard, local return URL, transient failure, and credential non-disclosure.'
    );
  } catch (error) {
    console.error(output);
    throw error;
  } finally {
    app.kill('SIGTERM');
    await once(app, 'exit');
    upstream.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      upstream.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
