---
"next-url-state": minor
---

Add `UrlParamsPagesRouterProvider` for SSR-safe Pages Router setup

Introduces `UrlParamsPagesRouterProvider` as the recommended provider for Next.js Pages Router apps. It reads `router.asPath` from `next/router` automatically and seeds the context with the correct URL during server-side rendering, so URL params are available on both server and client from the very first render — eliminating hydration mismatches in components that render differently based on URL params (e.g. an accordion that opens when `?section=true` is present).

**Before** — hydration mismatch when URL params are used during SSR:

```tsx
// pages/_app.tsx
import { UrlParamsProvider } from 'next-url-state';

export default function App({ Component, pageProps }) {
  return (
    <UrlParamsProvider>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}
```

**After** — consistent server/client rendering:

```tsx
// pages/_app.tsx
import { UrlParamsPagesRouterProvider } from 'next-url-state';

export default function App({ Component, pageProps }) {
  return (
    <UrlParamsPagesRouterProvider>
      <Component {...pageProps} />
    </UrlParamsPagesRouterProvider>
  );
}
```

`UrlParamsProvider` remains unchanged and still works for fully client-side-rendered Pages Router apps. The new `ssrPath` prop on `UrlParamsProvider` is also available as a lower-level escape hatch for custom setups.
