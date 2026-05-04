---
"next-url-state": patch
---

The mounted state guard in UrlParamsProvider was only needed for App Router to prevent SSR hydration mismatches. For Pages Router, the router adapter starts with isReady=false, so UrlParamsProviderClient already renders DUMMY_CONTEXT on first render — the mounted guard was redundant.
