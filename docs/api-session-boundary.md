# API, session, and permission boundary

Related to #4, #5, and #6. Delivery PR 1 established the boundary; delivery PR 2 completes endpoint extraction and permission integration. Data freshness and polling remain delivery PR 3. The app still runs on Next.js.

## Contract preservation

This is an architecture migration. Preserve existing API function names, HTTP methods and paths, payload serialization, validation, response envelopes, and backend error-code meanings. Do not infer new error meanings from HTTP status or add contract changes as part of extraction.

## Ownership and usage

- `api/core/apiClientBase.ts` and `server/api.ts`: shared native Ky configuration, with no user credentials. Endpoints accept `KyInstance` and use its standard methods and `HTTPError`.
- `api/createAuthHooks.ts`: returns individual `beforeRequest` and `beforeRetry` functions. Factories register them explicitly in Ky hook arrays so callers can compose additional hooks.
- `api/session.ts`: lazy `readTokens` thunk evaluated once per session; current credentials, pending refresh, and persistence revision are isolated per invocation. `ensureFreshToken` handles the 30-second expiry margin. `refreshRejectedToken` reuses a newer token or shares a pending refresh.
- `api/endpoints/`: existing validation, serialization, response shapes, and upstream paths. All existing HTTP operations now live here, including login, refresh, and binary shipping export. The original pilot files remain at the root; remaining backend endpoints are grouped by resource.
- `server/next/`: HttpOnly cookie readers/writers, request-cookie forwarding, cache tags and execution-context adapters. Pure return-path encoding and validation live in `domain/auth/navigation.ts`, shared by middleware, rendering, and browser navigation.

```ts
// Server Action or Route Handler: this context can persist cookies.
const result = await AdminUpdateItem(createActionApi(), id, payload);
revalidateTag('items');

// Server Component: refresh must happen in a separate cookie-writable response.
const api = createRenderApi().extend({ next: { tags: ['items'] } });
const result = await GetItemsAndDetails(api, filters);
```

The browser calls the existing action and supplies no token argument. The browser's HttpOnly cookies carry tokens to Next.js; only server code supplies the upstream Bearer header. The raw token is never returned from the explicit refresh action, rendered into HTML, or logged. Existing JWT claims used by the UI remain unchanged. JWT decoding is only an expiry hint; the backend must verify signatures and permissions.

Server Actions belong at browser entry points, not at every endpoint. The item edit form calls `AdminUpdateItem`; the items page calls `GetItemsAndDetails` directly using `createRenderApi()`. There is no item-list action because it has no browser caller. Client components import its types directly from the endpoint module using type-only imports. Other endpoint types remain available through type-only exports at their existing paths. Existing browser calls keep their Server Action signatures. Queries used in both browser code and rendering have a separate render adapter in `server/next/queries/`; server callers import that adapter instead of invoking a cookie-writing Server Action during rendering. Render-only legacy paths are marked `server-only`.

The action factory is also usable in Route Handlers. Middleware only needs the base Ky instance for its refresh endpoint and writes both response cookies and forwarded request cookies. Each action/render instance owns its session state; no authenticated singleton is shared between users.

## Refresh and persistence

1. Middleware proactively refreshes near-expiry credentials. It updates both the forwarded request cookie header (for the current render) and response cookies (for subsequent browser requests), preserving other cookies.
2. API sessions also check expiry before sending. Only HTTP 401 with backend code `1003` triggers reactive refresh for eligible reads. Only the individual GET request is retried, once; a callback containing several operations is never replayed.
3. Refresh calls the existing `POST backend/session/refresh` through the base Ky instance, using the current Bearer token and form-encoded `refreshToken`. The endpoint returns an access token; the existing refresh token is retained.
4. `persistTokens()` invokes the injected writer only after credentials change. Failed persistence can be retried. Auth hooks persist a successful refresh before sending the next request, so cookies are saved even if that request fails. Explicit refresh callers persist before returning. Definitively invalid sessions clear cookies; transient failures do not log users out.
5. A render that needs refresh redirects to `/auth/refresh?goto=...`; that route writes cookies and redirects back. An `__auth_retry=1` query marker bounds the flow: another rejected read redirects to sign-in instead of refreshing again. The marker remains until navigating to a clean URL. Return destinations are validated local paths; auth/API/internal destinations are rejected. Refresh route responses are not cacheable.

## Deliberate stage boundaries and limitations

- **Mutation replay is disabled.** This repository does not establish that the backend rejects expired credentials before executing a write. Mutations receive proactive refresh, but an expired-token response is returned through the existing login-required presentation rather than replaying the mutation. Confirm backend rejection ordering before enabling automatic mutation retries.
- Refresh deduplication is **within one invocation**, not across browser requests, tabs, app processes, or middleware/render boundaries. The observed client contract does not return a rotated refresh token, but that does not prove the backend allows concurrent reuse or that every issued access token remains valid. No global user-token cache or persistence layer is introduced. Backend refresh semantics must be confirmed before claiming cross-request serialization or single-use refresh-token support.
- The compatibility `apiClientWithToken` and legacy cookie-reading `AdminRefreshToken` helper are removed. Authenticated endpoint adapters create action/render Ky instances explicitly. Public login/config calls use the shared base instance. Existing query tags and mutation invalidation tags stay in adapters; their current dependencies are intentionally unchanged pending PR 3.
- HTTP errors flow directly to the existing `createApiErrorServerSide` backend-code/toast/redirect handler. There is no custom API error classification. Local invalid credentials use the existing redirect error shape; refresh responses use the same backend-code handler. Backend code `1003` redirects to sign-in regardless of HTTP status; other backend codes retain their original toast behavior. Full query failure semantics, invalidation inventory, and polling behavior remain PR 3 work.
- Cookie defaults remain host-scoped, HttpOnly, SameSite Strict, and Secure when the configured host uses HTTPS. Cookie lifetimes and backend endpoints are unchanged.

## Permissions, navigation, and logout

- `evaluatePermissions` is the pure evaluator used by server guards and the client hook. It requires every key and every requested field, rejects inherited properties, and treats an empty requirement list as satisfied.
- `permissionResult` interprets the existing backend codes specifically for permission loading: `1003` requires sign-in, `1001` is denial, and all other failures are unavailable. A successful empty grant set remains an ordinary loaded result. No new global error-code taxonomy is introduced.
- `loadPermissions` redirects unauthenticated rendering to sign-in with an encoded local return path. Denial renders the existing permission feedback. Service failure throws a credential-free error to the error boundary rather than substituting empty permissions; it leaves session cookies intact.
- Sign-in validates the decoded `goto` before navigation. Auth-error redirects encode `pathname + search`, preserving nested query values without accepting arbitrary external destinations.
- Login uses the shared cookie writer and returns only the existing success sentinel/error envelope. Both logout entry points clear both cookies through `clearTokens`, with the same root path and cookie attributes. Logout is idempotent and needs no backend call. Revocation of already copied backend tokens still depends on the backend; there is no new persistent session store.

## Completion limits

The local tests exercise a synthetic backend, not the deployed authentication service. Cross-request refresh reuse/rotation semantics and backend rejection ordering for writes remain unverified; mutation replay remains disabled. Validate representative deployed screens and backend concurrency behavior before closing all acceptance checks in #4/#5. This PR does not close #6 or start the React Router migration.

## Validation

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test:api
pnpm typecheck
API_BASE_URL=http://127.0.0.1:16009 HOST_BASE_URL=http://localhost:16008 pnpm build
pnpm test:api:next
```

The HTTP smoke test starts the built Next.js app on port 16008 and a synthetic upstream on port 16009, then shuts both down. Those ports must be free. It checks middleware cookie forwarding into actual rendering, rendering fallback, refresh-route persistence, loop protection, local return destinations, permission denial versus service failure, binary export with reactive refresh/persistence, login/logout, transient failure, and absence of credentials from HTML, action results, and logs. It does not contact the real backend or validate its token-rotation semantics.
