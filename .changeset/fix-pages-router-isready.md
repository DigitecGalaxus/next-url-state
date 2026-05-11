---
"next-url-state": patch
---

Fix Pages Router URL params not available on first render

The Pages Router adapter was waiting for `router.isReady` before providing URL params.
This caused `useEffect([])` patterns to receive empty values on first render, since the
effect fires before `router.isReady` becomes true.

`router.asPath` is always available on the client regardless of `router.isReady`, so
the adapter now sets `isReady: true` immediately. Server-side rendering still uses the
fallback adapter (isReady=false) to prevent hydration mismatches.

This restores the behavior of the original internal `@segments/url-params` implementation.
