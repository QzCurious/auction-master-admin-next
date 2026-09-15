# Data freshness scope after API extraction

Related to #6 and parent migration #3.

## Preserved behavior

The completed API/session extraction in PRs #11 and #12 preserves the existing application flow:

- Framework-independent HTTP functions retain their original `src/api/` paths.
- Next.js Server Actions live in `src/server-action/`; UI callers invoke them directly and keep their existing pending, error, and success handling.
- Server Actions call `revalidateTag(...)` directly with the existing tags after handled API results, including error results. There is no mutation registry or mutation runner.
- Colocated `*.query.ts` helpers retain their query keys and Server Action result envelopes.
- QueryClient defaults, route refresh calls, polling, form drafts, and selection behavior remain as they were after PR #12.

PR #13 adds no runtime behavior changes. Data freshness improvements should be reviewed as separate, focused fixes with concrete before/after examples rather than bundled into the code organization refactor.

## Deferred work in #6

- Demonstrate stale consumers and add only the required cache invalidation at the relevant action/call site. Next cache tags and TanStack Query caches are separate; changing one does not automatically invalidate the other.
- Decide and test a query failure contract before changing error envelopes, retries, or global feedback.
- Review polling visibility, edit preservation, and selection behavior independently, with regression coverage for each intended change.

The API organization work does not satisfy these remaining #6 acceptance criteria. Keep #6 open; this documentation does not claim runtime fixes or live-backend verification.
