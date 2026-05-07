---
"next-url-state": patch
---

Fix useUrlParams and useUrlParamsArray not reading initial URL params in Pages Router

In Pages Router, `router.isReady` starts as `false`, causing `UrlParamsProviderClient` to
render `DUMMY_CONTEXT` on the first render. Both hooks captured empty initial state from
that dummy context via `useState`. When the context switched to the real one (after
`router.isReady` became `true`), the `useEffect` callback registration didn't re-run
because `addParamsCallback` wasn't in the deps — leaving the hooks subscribed to the
no-op DUMMY callback with stale empty state.

Fix: add `addParamsCallback` to the effect deps and re-seed state from `urlParams.sync`
when the context identity changes.