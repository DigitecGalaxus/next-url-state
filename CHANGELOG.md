# Changelog

## 1.0.8

### Patch Changes

- Fix History API fallback: preserve basePath and Next.js history state

  The History API fallback path (used when the router adapter isn't ready yet) had two bugs:

  **BasePath stripped from URL** — `usePathname()` and `router.asPath` both return the path without the Next.js `basePath`. Using them directly with `window.history.replaceState` wrote the wrong URL to the address bar, breaking page reloads on apps with a `basePath` configured.

  Fixed by using `window.location.pathname` instead, which always reflects the full address bar path including the `basePath`.

  **`history.state` clobbered with `{}`** — Next.js stores its own bookkeeping (`__N`, `key`, `idx`) on `history.state`. Its `onPopState` handler silently early-returns on entries where `__N` is absent, desyncing the router from the native history stack. In hosts that drive navigation directly (e.g. iOS/Android webviews calling `goBack()`), this froze back navigation for the rest of the session.

  Fixed by forwarding `window.history.state` instead of `{}`.

## 1.0.7

### Patch Changes

- dbe4ee3: Add `UrlParamsPagesRouterProvider` for SSR-safe Pages Router setup

  Introduces `UrlParamsPagesRouterProvider` as the recommended provider for Next.js Pages Router apps. It reads `router.asPath` from `next/router` automatically and seeds the context with the correct URL during server-side rendering, so URL params are available on both server and client from the very first render — eliminating hydration mismatches in components that render differently based on URL params (e.g. an accordion that opens when `?section=true` is present).

  **Before** — hydration mismatch when URL params are used during SSR:

  ```tsx
  // pages/_app.tsx
  import { UrlParamsProvider } from "next-url-state";

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
  import { UrlParamsPagesRouterProvider } from "next-url-state";

  export default function App({ Component, pageProps }) {
    return (
      <UrlParamsPagesRouterProvider>
        <Component {...pageProps} />
      </UrlParamsPagesRouterProvider>
    );
  }
  ```

  `UrlParamsProvider` remains unchanged and still works for fully client-side-rendered Pages Router apps. The new `ssrPath` prop on `UrlParamsProvider` is also available as a lower-level escape hatch for custom setups.

## 1.0.6

### Patch Changes

- 1038018: Fix Pages Router URL params not available on first render

  The Pages Router adapter was waiting for `router.isReady` before providing URL params.
  This caused `useEffect([])` patterns to receive empty values on first render, since the
  effect fires before `router.isReady` becomes true.

  `router.asPath` is always available on the client regardless of `router.isReady`, so
  the adapter now sets `isReady: true` immediately. Server-side rendering still uses the
  fallback adapter (isReady=false) to prevent hydration mismatches.

  This restores the behavior of the original internal `@segments/url-params` implementation.

## 1.0.5

### Patch Changes

- 7dff3f3: Fix useUrlParams and useUrlParamsArray not reading initial URL params in Pages Router

  In Pages Router, `router.isReady` starts as `false`, causing `UrlParamsProviderClient` to
  render `DUMMY_CONTEXT` on the first render. Both hooks captured empty initial state from
  that dummy context via `useState`. When the context switched to the real one (after
  `router.isReady` became `true`), the `useEffect` callback registration didn't re-run
  because `addParamsCallback` wasn't in the deps — leaving the hooks subscribed to the
  no-op DUMMY callback with stale empty state.

  Fix: add `addParamsCallback` to the effect deps and re-seed state from `urlParams.sync`
  when the context identity changes.

## 1.0.4

### Patch Changes

- 0279717: fix: stabilize setter returned from useUrlParam/useUrlParamArray\

## 1.0.3

### Patch Changes

- 43b193b: The mounted state guard in UrlParamsProvider was only needed for App Router to prevent SSR hydration mismatches. For Pages Router, the router adapter starts with isReady=false, so UrlParamsProviderClient already renders DUMMY_CONTEXT on first render — the mounted guard was redundant.

## 1.0.2

### Patch Changes

- 0c94f86: Fix issue #34: Error: invariant expected app router to be mounted

## 1.0.1

### Patch Changes

- Broaden peer dependency ranges for wider compatibility: next lowered from >=16.0.0 to >=13.4.0 (minimum for App Router support), react/react-dom changed from ^18.0.0 to >=18.0.0 (adds React 19 support), and Node engine requirement relaxed from >=20.9.0 to >=18.

## 1.0.0

### Major Changes

- b257db7: Initial public release — Next.js URL state management that gets out of your way.
  Manage URL search parameters with hooks that work just like useState — no boilerplate, no race conditions, no manual URL construction. Supports both App Router and Pages Router with automatic detection, built-in batching and optimistic updates, and read-only access in React Server Components via next-url-state/rsc

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-14

### Added

- Initial release of next-url-state
- `useUrlParam` hook for managing single URL parameters
- `useUrlParamArray` hook for managing array URL parameters
- `useUrlParams` hook for managing multiple URL parameters
- `useUrlParamsArray` hook for managing multiple array parameters
- `useUrlParamValue` hook for read-only URL parameter access
- `UrlParamsProvider` context provider
- TypeScript support with full type inference
- Custom parse and serialize functions support
- Shallow routing support
- History entry management
- Optimistic UI updates with URL synchronization
- Comprehensive documentation and examples

[Unreleased]: https://github.com/yourusername/next-url-state/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/next-url-state/releases/tag/v0.1.0
