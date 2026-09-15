# Data freshness and action errors

This is the third preparation PR for issues #4–#6, before the React Router migration (#3). Backend endpoints, request payloads, native Ky errors, API paths, Server Action paths and query keys retain their existing contracts.

## Ownership

- `src/api/`: HTTP operations and backend response contracts. No cache invalidation or UI policy.
- Adjacent `*.query.ts`: call the mirrored Server Action and `requireActionSuccess`. Inline consignor query functions use the same helper.
- Server Actions call `revalidateTag` directly for each affected tag after the endpoint settles, including when the adapter returns an error envelope, so users can receive newer server state. Server Actions update the current Next route tree; do not also call `router.refresh()` for the same mutation.
- `useRunApiMutation`: TanStack mutation lifecycle, with no automatic mutation retries. Call sites supply explicit query-key prefixes. On success, invalidate those queries; active observers refetch and inactive entries become stale. This is separate from the Next cache.
- Components: success messages, validation, navigation, dialog closing and deliberate selection clearing. The adapter preserves their success envelope and existing error handling, while TanStack itself records failures as `error`.

One browser has one QueryClient created by Providers. A request still has its own authenticated session; query caching never stores credentials.

## Mutation inventory

Each Server Action declares its Next tags directly. Browser mutation call sites declare the affected TanStack query-key prefixes directly, including `GetWorkers`, `consignor`, `/reports/records`, and `/reports/records/summary` where relevant. Prefix invalidation includes every cached filter/ID, not just the visible page. There is no mutation-name registry.

| Mutation family | Consumers refreshed |
| --- | --- |
| Item photos, metadata, arrival, appraisal, confirmation, return-pending | Item list, status counts, item detail/picking cards, related auction list/detail |
| Bidding and watcher activation | Auction/watch lists and details, linked items |
| Item bidding linkage, returning/returned; auction shipping, fees, cancellation, deletion, purchase, update; shipping transitions/update | Items, auctions, shipping lists/details/counts, records and summaries, reports, wallet/bonus logs |
| Record payment review | Records, record summaries, reports and wallet/bonus logs |
| Consignor update | Consignor selectors/list/detail and embedded consignor information in item/auction/shipping views |
| Consignor verification | Verification list and consignor views; fixes the old singular/plural verification-tag mismatch |
| Worker create/update/delete/activation/cookie | Worker list/detail and seller/watcher dropdown queries (all filters) |
| Admin create/update/delete and role assignment | Admin list/detail and current permission consumers (tagged `admins`) |
| Role create/delete and permission changes | Roles, role permissions, admins and current permission consumers (tagged `roles`/`admins`) |

Lifecycle/payment operations intentionally invalidate related financial groups conservatively: the fixed backend does not return an affected-resource manifest. Photo and simple status operations use narrower groups. This can fetch more than the minimum after a mutation, but avoids stale linked views. No conversion of server-rendered pages to TanStack Query is required.

Login/logout retain their separate session/navigation lifecycle. Password change has no displayed cached password resource; its existing form handles the action error directly. Upload preparation and read/export operations are not data mutations.

## Errors

HTTP operations still throw native `HTTPError`, retaining backend codes. The server adapter is responsible for reducing those errors to the existing browser-safe error envelope; it does not send upstream messages or credentials to the browser.

`requireActionSuccess` turns a failed action envelope into `ActionResultError`. The error retains the adapter's existing code/presentation mapping without changing the backend contract. Successful data stays in its existing envelope, avoiding a second response-shape migration.

Queries reject on failure rather than caching error envelopes as successful data. QueryCache presents the existing localized feedback once per failed fetch, even with multiple observers. Missing authentication navigates to sign-in with the current return path. Failed background fetches retain the last successful cache data. Queries have no automatic retry; focus, reconnection, explicit invalidation or a new mount can retry stale reads. Unknown transport failures use the existing generic message.

Browser mutations likewise reject internally, so TanStack records an error and skips browser-query success invalidation. Server Actions still revalidate their Next tags after an error result. The compatibility runner then returns the familiar failure envelope for existing forms to present and keep their drafts/dialogs open. Callers must inspect `result.error` before success effects; deletes, worker activation and photo actions now do so. Do not wrap an entire multi-operation workflow in a replay/retry callback.

## Polling, drafts and selection

Items, auctions and the watch list retain their 10-second route polling interval. There is no new global query polling loop. Route polling pauses while the document is hidden, a route refresh is pending, an input/select/editable element has focus, a dialog is open, or the URL is in a picking workflow. It resumes on a subsequent interval once idle. Visibility is observed on `document` and checked again immediately before a tick. TanStack background interval polling is disabled.

Reactive edit forms use `keepDirtyValues` when server props change: unsaved fields remain local while untouched fields can update. Bid entry already had this behavior and retains it. Default-value shipping/return forms retain their local form state. A failed selected-item query no longer filters the query array and shifts IDs/React keys; its position remains visible as loading/unavailable, error feedback is shown, and dependent submission is disabled. Existing explicit toggle/clear and route-navigation selection semantics remain unchanged.

## Verification and limits

The API regression suite exercises real QueryClient/QueryObserver/MutationObserver behavior, the real React mutation hook in jsdom, preserved dirty form fields, query error feedback and last-good data, active/inactive invalidation, mutation failures, polling policy, and direct Server Action tag invalidation after both successful and failed upstream results. Existing HTTP/session/permission/architecture tests remain in place. Production smoke uses a local synthetic upstream, not production credentials.

The backend remains the authority for mutation success and permissions. This PR cannot make another browser/tab or a backend background job push updates; those are discovered through existing polling, focus/reconnection or subsequent navigation. Cross-request token refresh coordination is unchanged. Polling policy and cache tests are deterministic; they do not substitute for a full live-backend workflow acceptance test.
