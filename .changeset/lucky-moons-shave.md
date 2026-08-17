---
"next-url-state": patch
---

Fix URL params not being removed when a param is set during mount

The router adapter was stored in an effect. Because effects run child-first, a
param update fired from a child's mount effect ran before the provider's effect
and silently took the raw History API fallback, even though a router was
available. That left the Next.js router pointing at the original URL, so its
next commit wrote that URL — including the param that was just removed — back to
the address bar. The adapter is now assigned during render, so the first update
of a page load goes through the router like every later one.

The History API fallback additionally no longer forwards the App Router's
`history.state`. The App Router patches `pushState`/`replaceState` to keep
`usePathname()`/`useSearchParams()` in sync, but skips that sync when the passed
state already carries its `__NA` marker. Passing `null` lets the patch copy its
own bookkeeping over and dispatch the sync. The Pages Router's state is still
forwarded as before, so back navigation keeps working in native webviews.
