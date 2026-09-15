# API, session, and permission boundary

Related to #4, #5, and #6. PR #11 established the session boundary; delivery PR 2 completes API extraction and permission integration. Data freshness and polling remain delivery PR 3. The app still runs on Next.js.

## Directory ownership

```text
src/
  api/                             # HTTP operations with adjacent query-option adapters
    AdminLogin.ts
    AdminRefreshToken.ts
    GetConfigs.ts
    GetConfigs.query.ts             # TanStack adapter calling its Server Action
    GetJPYRates.ts
    backend/
      items/AdminUpdateItem.ts
      items/GetItemsAndDetails.ts
      items/GetItemAndDetails.query.ts
      shippings/ExportShippings.ts
      ...                          # Original resource hierarchy and function names
    core/static.ts                 # Response envelopes and pure validation helper

  server-action/                   # Browser-callable Next.js wrappers, mirroring API paths
    AdminLogin.ts
    backend/items/AdminUpdateItem.ts
    ...

  server/
    api.ts                         # Shared native Ky instance, without user credentials
    apiClientBase.ts                # Environment configuration and redacted logging
    apiConfig.ts
    next/
      createActionApi.ts           # Writable request-scoped session adapter
      createRenderApi.ts           # Read-only rendering adapter
      createApiErrorServerSide.ts  # Next.js-aware error conversion
      cookies.ts
      refreshMiddleware.ts
      queries/                     # Thin rendering adapters, mirroring API paths
        backend/items/GetItemAndDetails.ts
        ...

  domain/
    auth/                          # Session state, auth hooks, refresh policy, navigation
    api/                           # Existing UI error types, messages, and presentation
    permission/                    # Shared key/field evaluator and permission-load handling
```

`@/api/...` continues to address the original API hierarchy. All 70 HTTP operation modules accept an explicit native `KyInstance`; they preserve methods, paths, request schemas, serialization, and backend response envelopes. They do not read cookies, configure the environment, invalidate caches, redirect, or convert errors into UI feedback. Native Ky `HTTPError` reaches the caller.

`tests/fixtures/api-inventory.json` records every expected operation path, including the PR 1 pilot, login, refresh, config, rates, and export. Architecture tests load every API module without a configured backend or request context, inspect the complete local dependency graph, and verify browser code reaches Server Actions instead of raw HTTP operations. Data types remain exported from their API modules and are imported with `import type` in client code.

## Usage

```ts
// Client component: the browser supplies operation arguments, never bearer tokens.
import { AdminUpdateItem } from '@/server-action/backend/items/AdminUpdateItem';

await AdminUpdateItem(id, payload);
```

```ts
// src/server-action/backend/items/AdminUpdateItem.ts
'use server';

import { revalidateTag } from 'next/cache';
import * as itemApi from '@/api/backend/items/AdminUpdateItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof itemApi.AdminUpdateItem>[2]) {
  const result = await itemApi.AdminUpdateItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return result;
}
```

```ts
// Server rendering: use a render adapter or call the raw API with a render client.
import { GetItemsAndDetails } from '@/api/backend/items/GetItemsAndDetails';
import { createRenderApi } from '@/server/next/createRenderApi';

const api = createRenderApi().extend({ next: { tags: ['items'] } });
const result = await GetItemsAndDetails(api, filters);
```

Existing query keys, successful/error-envelope query results, cache tags, and mutation invalidation remain unchanged. TanStack adapters call the relocated Server Actions. Queries also used during rendering have a separate render adapter so rendering never attempts cookie persistence. Route Handlers use the writable action adapter. The configured Ky instance is shared, while each action/render instance owns its session credentials.

## Refresh and persistence

- `domain/auth/session.ts` lazily evaluates the injected token reader once. Credentials, pending refresh, failure state, and persistence revisions remain isolated per invocation. `ensureFreshToken` applies the existing 30-second expiry margin; decoding a JWT is an expiry hint, not signature verification.
- `domain/auth/createAuthHooks.ts` returns individual native Ky hooks. Factories register them explicitly so additional hooks can be composed. An eligible GET receiving HTTP 401 with backend code `1003` gets one refresh/retry. Only that request is retried.
- `api/AdminRefreshToken.ts` implements the existing `POST backend/session/refresh` contract: current Bearer token and form-encoded `refreshToken`, returning the backend envelope. `domain/auth/refreshTokens.ts` interprets definitive rejection, validates the returned access token, and retains the existing refresh token. Both middleware and action sessions use this policy.
- Middleware updates forwarded request cookies for the current render and response cookies for the browser. Auth hooks persist a successful refresh before sending the next request, even if that later operation fails. Failed persistence remains retryable; transient service failures keep the browser session.
- Rendering redirects through `/auth/refresh?goto=...` when refresh is required. That route can write cookies and returns to a validated local destination. The `__auth_retry=1` marker bounds repeated rejection and remains until navigation to a clean URL.

**Mutation replay remains disabled.** The deployed backend must establish that expired credentials are rejected before a write executes before automatic write retries can be enabled. Deduplication is within one invocation; cross-request/tab/process behavior still depends on backend refresh-token semantics. No persistent session store or shared mutable credential cache is introduced.

## Errors, permissions, navigation, and logout

The existing backend-code-to-toast/redirect mapping lives in `domain/api/ApiError.ts`. The Next.js error converter preserves navigation signals and maps backend code `1003` to the existing sign-in result regardless of HTTP status. Other code meanings and browser-facing error shapes are unchanged. API functions themselves retain native errors.

`evaluatePermissions` is shared by server guards and the client hook. Every requested key and field must be granted; inherited properties do not grant access, and empty requirements succeed. Permission loading distinguishes a successful empty grant set, backend denial (`1001`), unauthenticated state (`1003`), and unavailable service. Service failures reach an error boundary rather than becoming empty grants, and leave cookies intact.

`domain/auth/navigation.ts` encodes and validates return paths for middleware, rendering, and client navigation. Sign-in validates the decoded `goto`; auth-error navigation preserves nested query parameters with `pathname + search`. Login returns only the existing success sentinel/error envelope. Both logout entry points clear both cookies consistently and work without a backend call. Cookie defaults remain host-scoped, HttpOnly, SameSite Strict, and Secure for HTTPS hosts. Tokens never enter browser-facing action results, rendered HTML, or logs.

## Validation and completion limits

```sh
npm run test:api
npm run typecheck
API_BASE_URL=http://127.0.0.1:16009 HOST_BASE_URL=http://localhost:16008 npm run build
npm run test:api:next
```

The HTTP smoke test runs the built Next.js app on port 16008 with a synthetic upstream on 16009. It covers middleware forwarding, rendering fallback, refresh-route persistence, loop protection, local destinations, permission denial versus outage, binary export with reactive refresh, login/logout, and credential non-disclosure.

The tests do not contact the deployed backend. Deployed screen verification, concurrent refresh reuse/rotation semantics, and backend mutation rejection ordering remain unverified. Keep those acceptance checks visible in #4/#5. Data invalidation/query-error/polling redesign remains #6 / delivery PR 3; the React Router migration remains separate.

Query options are colocated as `*.query.ts` beside the corresponding HTTP operation. They keep existing query keys and call Server Actions. Raw HTTP operations remain framework-independent and must not import query adapters; client runtime graphs may import query adapters but cannot reach raw HTTP operations.
