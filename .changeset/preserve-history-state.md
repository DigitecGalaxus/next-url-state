---
"next-url-state": patch
---

Preserve the current `window.history.state` in the History API fallback instead of clobbering it with `{}`.

Next.js keeps its own bookkeeping (`__N`, `key`, `idx`) on `history.state` and ignores `popstate` events on entries that lack it. Overwriting it desynced the browser/webview history stack from the router and froze back navigation in hosts that drive the native history (e.g. app webviews calling `webView.goBack()`).
