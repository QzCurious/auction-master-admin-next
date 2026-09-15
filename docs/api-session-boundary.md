# API and session boundary (delivery PR 1)

Related to #4, #5, and #6. This is the first stage of the three-PR plan; it does not complete those issues or migrate routers.

## Contract preservation

This is an architecture migration. Preserve existing API function names, HTTP methods and paths, payload serialization, validation, response envelopes, and backend error-code meanings. Do not infer new error meanings from HTTP status or add contract changes as part of extraction.

## Ownership and usage

- `api/transport.ts`: HTTP execution using Ky and its existing `HTTPError` behavior. The shared instance/configuration in `server/` never retains user credentials.
- `api/session.ts`: lazy `readTokens` thunk evaluated once per session; current credentials, pending refresh, and persistence revision are isolated per invocation. `ensureFreshToken` handles the 30-second expiry margin. `refreshRejectedToken` reuses a newer token or shares a pending refresh.
- `api/endpoints/`: existing validation, serialization, response shapes, and upstream paths. The pilot moves only `GetItemsAndDetails` and `AdminUpdateItem`, plus the shared refresh endpoint.
- `server/next/`: HttpOnly cookie readers/writers, request-cookie forwarding, cache tags, navigation, and execution-context adapters.

```ts
// Server Action or Route Handler: this context can persist cookies.
const result = await withApiSession((api) => AdminUpdateItem(api, id, payload));
revalidateTag('items');

// Server Component: refresh must happen in a separate cookie-writable response.
const result = await withRenderApiSession((api) =>
  GetItemsAndDetails(withCacheTags(api, ['items']), filters)
);
```

The browser calls the existing action and supplies no token argument. The browser's HttpOnly cookies carry tokens to Next.js; only server code supplies the upstream Bearer header. The raw token is never returned from the explicit refresh action, rendered into HTML, or logged. Existing JWT claims used by the UI remain unchanged. JWT decoding is only an expiry hint; the backend must verify signatures and permissions.

Server Actions belong at browser entry points, not at every endpoint. The item edit form calls `AdminUpdateItem`; the items page calls `GetItemsAndDetails` directly through `withRenderApiSession`. There is no item-list action because it has no browser caller. Client components import its types directly from the endpoint module using type-only imports.

## Refresh and persistence

1. Middleware proactively refreshes near-expiry credentials. It updates both the forwarded request cookie header (for the current render) and response cookies (for subsequent browser requests), preserving other cookies.
2. API sessions also check expiry before sending. Only HTTP 401 with backend code `1003` triggers reactive refresh for eligible reads. Only the individual GET request is retried, once; a callback containing several operations is never replayed.
3. Refresh calls the existing `POST backend/session/refresh` through the base transport, using the current Bearer token and form-encoded `refreshToken`. The endpoint returns an access token; the existing refresh token is retained.
4. `persistTokens()` invokes the injected writer only after credentials change. Failed persistence can be retried. A successful refresh is persisted in the writable adapter's `finally` block even if a later endpoint fails. Definitively invalid sessions clear cookies; transient failures do not log users out.
5. A render that needs refresh signals `SessionRefreshRequired`. The adapter redirects to `/auth/refresh?goto=...`; that route writes cookies and redirects back. An `__auth_retry=1` query marker bounds the flow: another rejected read redirects to sign-in instead of refreshing again. The marker remains until navigating to a clean URL. Return destinations are validated local paths; auth/API/internal destinations are rejected. Refresh route responses are not cacheable.

## Deliberate stage boundaries and limitations

- **Mutation replay is disabled.** This repository does not establish that the backend rejects expired credentials before executing a write. Mutations receive proactive refresh, but an expired-token response is returned through the existing login-required presentation rather than replaying the mutation. Confirm backend rejection ordering before enabling automatic mutation retries.
- Refresh deduplication is **within one invocation**, not across browser requests, tabs, app processes, or middleware/render boundaries. The observed client contract does not return a rotated refresh token, but that does not prove the backend allows concurrent reuse or that every issued access token remains valid. No global user-token cache or persistence layer is introduced. Backend refresh semantics must be confirmed before claiming cross-request serialization or single-use refresh-token support.
- Remaining endpoint wrappers keep their existing payloads/signatures through `apiClientWithToken`. Middleware refreshes proactively for them. Its old retry hook, which refreshed without writing the browser cookie, is removed; a reactive expired-token response on an unmigrated endpoint follows the existing login-required error path. PR 2 migrates those callers to explicit writable/render adapters and removes the compatibility client and legacy refresh helper.
- HTTP errors flow directly to the existing `createApiErrorServerSide` backend-code/toast/redirect handler. There is no custom API error classification. Local invalid credentials use the existing redirect error shape; refresh responses use the same backend-code handler. Backend code `1003` redirects to sign-in regardless of HTTP status; other backend codes retain their original toast behavior. Full query failure semantics, permission evaluation, invalidation inventory, and polling behavior remain PR 2/3 work.
- Cookie defaults remain host-scoped, HttpOnly, SameSite Strict, and Secure when the configured host uses HTTPS. Cookie lifetimes and backend endpoints are unchanged.

## Validation

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test:api
pnpm typecheck
API_BASE_URL=http://127.0.0.1:16009 HOST_BASE_URL=http://localhost:16008 pnpm build
pnpm test:api:next
```

The HTTP smoke test starts the built Next.js app on port 16008 and a synthetic upstream on port 16009, then shuts both down. Those ports must be free. It checks middleware cookie forwarding into actual rendering, rendering fallback, refresh-route persistence, loop protection, local return destinations, transient failure, and absence of credentials from HTML and logs. It does not contact the real backend or validate its token-rotation semantics.
