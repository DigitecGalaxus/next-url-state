# Changelog

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
