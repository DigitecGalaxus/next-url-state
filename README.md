# next-url-state

> Next.js URL state management that gets out of your way.

[![npm version](https://badge.fury.io/js/next-url-state.svg)](https://www.npmjs.com/package/next-url-state)
[![npm downloads](https://img.shields.io/npm/dw/next-url-state.svg)](https://www.npmjs.com/package/next-url-state)
[![GitHub stars](https://img.shields.io/github/stars/DigitecGalaxus/next-url-state.svg)](https://github.com/DigitecGalaxus/next-url-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Used in production by:**

[<img src="https://github.com/DigitecGalaxus.png" height="40" alt="Digitec Galaxus" />](https://www.galaxus.ch)

## Table of Contents

- [Why you should use this library?](#why-you-should-use-this-library)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Pages Router Setup](#pages-router-setup)
  - [App Router Setup](#app-router-setup)
  - [React Server Components](#react-server-components)
- [Migration Guide](#migration-guide)
  - [From Next.js Pages Router (the /pages directory)](#from-vanilla-nextjs--pages-router-the-pages-directory)
  - [From Next.js App Router (the /app directory)](#from-vanilla-nextjs--app-router-the-app-directory)
  - [From use-query-params](#from-use-query-params)
- [API Reference](#api-reference)
  - [useUrlParam](#useurlparam)
  - [useUrlParamArray](#useurlparamarray)
  - [useUrlParams](#useurlparams)
  - [useUrlParamsArray](#useurlparamsarray)
  - [useUrlParamValue](#useurlparamvalue)
- [Advanced Usage](#advanced-usage)
  - [Custom Types with Parsing and Serialization](#custom-types-with-parsing-and-serialization)
  - [Pagination Example](#pagination-example)
  - [Search with Filters](#search-with-filters)
- [Options](#options)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [TypeScript Support](#typescript-support)
- [Compatibility](#compatibility)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Why you should use this library?

### The Problem with Vanilla Next.js

Managing URL state in Next.js requires a lot of boilerplate and comes with several pain points

**Problems:**
- **Lots of boilerplate** - Manual state synchronization, useEffect hooks, query object spreading
- **Race conditions** - State and URL can get out of sync during navigation
- **Performance issues** - Every keystroke triggers a router update, causing re-renders
- **Type safety** - URL params are always `string | string[] | undefined`, requiring type guards
- **Complex updates** - Managing multiple parameters requires careful query object manipulation
- **Router differences** - Different APIs for Pages Router (`next/router`) vs App Router (`next/navigation`)

### The Solution with next-url-state is slim and simple

**Benefits:**
- ✅ **Minimal code** - One line hook replaces 20+ lines of boilerplate
- ✅ **Automatic sync** - State and URL stay in sync automatically
- ✅ **Optimized performance** - Built-in batching ( default: 250ms, configurable ) and optimistic updates
- ✅ **Type safety & Flexibility** - Support for basic and custom data types, including custom serialization
- ✅ **Simple API** - Works just like `useState` but with URL persistence
- ✅ **Router agnostic** - Works with both Pages Router and App Router automatically
- ✅ **Zero Dependencies** - Lightweight with only peer dependencies on React and Next.js

This library handles all the complexity of URL state management, letting you focus on building features instead of wrestling with router APIs.

## Installation

```bash
npm install next-url-state
```

```bash
yarn add next-url-state
```

```bash
pnpm add next-url-state
```

## Quick Start

### Pages Router Setup

#### 1. Wrap your app with `UrlParamsProvider`

```tsx
// pages/_app.tsx
import { UrlParamsProvider } from 'next-url-state';

const MyApp = ({ Component, pageProps }) => {
  return (
    <UrlParamsProvider>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}

export default MyApp;
```

#### 2. Use the hooks in your components

```tsx
import { useUrlParam } from 'next-url-state';

const SearchComponent = () => {
  const [query, setQuery] = useUrlParam('q');

  return (
    <input
      value={query || ''}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### App Router Setup

#### 1. Create a client provider component (if only this provider is needed proceed with step 2)

```tsx
// app/providers.tsx
'use client';

import { UrlParamsProvider } from 'next-url-state';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <UrlParamsProvider>{children}</UrlParamsProvider>;
}
```

#### 2. Use it in your root layout

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* UrlParamsProvider can be used directly if no other provider is needed */}
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}
```

#### 3. Use the hooks in your components

```tsx
// app/search/page.tsx
'use client';

import { useUrlParam } from 'next-url-state';

export default function SearchPage() {
  const [query, setQuery] = useUrlParam('q');

  return (
    <input
      value={query || ''}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

> **Note**: Components using these hooks must be client components (`'use client'`)

### React Server Components

For React Server Components, use the `createRscAdapter` function to read URL parameters (no writing):

```tsx
// app/products/page.tsx (Server Component)
import { createRscAdapter } from 'next-url-state/rsc';

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const adapter = createRscAdapter(
    '/products',
    new URLSearchParams(params as Record<string, string>)
  );

  const currentPath = adapter.getCurrentPath();
  // → "/products?category=electronics&sort=price"

  // Note: adapter.updateUrl() is a no-op in RSC
  // For URL updates, use a Client Component

  return (
    <div>
      <p>Current path: {currentPath}</p>
      {/* Pass data to Client Components for interactivity */}
    </div>
  );
}
```

> **Note**: `updateUrl()` returns `false` and logs a warning in development mode, since URL updates require client-side JavaScript.

## Migration Guide

### From Next.js Pages Router (the /pages directory)

**Before** — manual state sync, boilerplate, and race-condition-prone:

```tsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const SearchPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState((router.query.q as string) ?? '');

  useEffect(() => {
    setSearch((router.query.q as string) ?? '');
  }, [router.query.q]);

  const handleChange = (value: string) => {
    setSearch(value);
    router.replace(
      { query: { ...router.query, q: value } },
      undefined,
      { shallow: true }
    );
  };
};
```

**After** — one line, no boilerplate:

```tsx
import { useUrlParam } from 'next-url-state';

const SearchPage = () => {
  const [search, setSearch] = useUrlParam('q');
};
```

Provider change in `_app.tsx`:

```tsx
// Before
import { useRouter } from 'next/router'; // no provider needed, but lots of manual work

// After
import { UrlParamsProvider } from 'next-url-state';

const MyApp = ({ Component, pageProps }) => (
  <UrlParamsProvider>
    <Component {...pageProps} />
  </UrlParamsProvider>
);
```

---

### From Next.js App Router (the /app directory)

**Before** — verbose URL construction on every update:

```tsx
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('q');

  const setSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('q', value);
      else params.delete('q');
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );
};
```

**After**:

```tsx
'use client';
import { useUrlParam } from 'next-url-state';

const SearchPage = () => {
  const [search, setSearch] = useUrlParam('q');
};
```

Provider change in `layout.tsx`:

```tsx
// Before — no provider, but each component wires up routing manually

// After
import { UrlParamsProvider } from 'next-url-state';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UrlParamsProvider>{children}</UrlParamsProvider>
      </body>
    </html>
  );
}
```

---

### From `use-query-params`

**Provider** — simpler setup, no adapter required:

```tsx
// Before
import { QueryParamProvider } from 'use-query-params';
import { NextAdapter } from 'next-query-params';

<QueryParamProvider adapter={NextAdapter}>
  <Component {...pageProps} />
</QueryParamProvider>

// After
import { UrlParamsProvider } from 'next-url-state';

<UrlParamsProvider>
  <Component {...pageProps} />
</UrlParamsProvider>
```

**Hook equivalents:**

| `use-query-params` | `next-url-state` |
|---|---|
| `useQueryParam('q', StringParam)` | `useUrlParam('q')` |
| `useQueryParam('page', NumberParam)` | `useUrlParam<number>('page', { parse: (v) => parseInt(v ?? '1', 10), serialize: String })` |
| `useQueryParam('flag', BooleanParam)` | `useUrlParam<boolean>('flag', { parse: (v) => v === 'true', serialize: (v) => v ? 'true' : undefined })` |
| `useQueryParam('tags', ArrayParam)` | `useUrlParamArray('tags')` |
| `useQueryParams({ q: StringParam, page: NumberParam })` | `useUrlParams(['q', 'page'])` |

**Example side-by-side:**

```tsx
// Before
import { useQueryParam, useQueryParams, StringParam, NumberParam, ArrayParam } from 'use-query-params';

const [search, setSearch] = useQueryParam('q', StringParam);
const [page, setPage] = useQueryParam('page', NumberParam);
const [tags, setTags] = useQueryParam('tags', ArrayParam);
const [{ q, page }, setQuery] = useQueryParams({ q: StringParam, page: NumberParam });

// After
import { useUrlParam, useUrlParamArray, useUrlParams } from 'next-url-state';

const [search, setSearch] = useUrlParam('q');
const [page, setPage] = useUrlParam<number>('page', { parse: (v) => parseInt(v ?? '1', 10), serialize: String });
const [tags, setTags] = useUrlParamArray('tags');
const [{ q, page }, setQuery] = useUrlParams(['q', 'page']);
```

## API Reference

### `useUrlParam`

Hook for managing a single URL parameter.

```tsx
const [value, setValue] = useUrlParam<T>(paramName, options?);
```

**Examples:**

```tsx
// Simple string parameter
const [name, setName] = useUrlParam('name');

// With type parsing (number)
const [age, setAge] = useUrlParam<number>('age', {
  parse: (value) => (value ? parseInt(value, 10) : undefined),
  serialize: (value) => value?.toString(),
});

// Boolean parameter
const [enabled, setEnabled] = useUrlParam<boolean>('enabled', {
  parse: (value) => value === 'true',
  serialize: (value) => (value ? 'true' : undefined),
});

// With history entry (creates browser history entry)
await setName('John', { historyEntry: true });

// Without shallow routing (triggers data fetching)
await setName('John', { shallow: false });
```

### `useUrlParamArray`

Hook for managing URL parameters with multiple values.

```tsx
const [values, setValues] = useUrlParamArray<T>(paramName, options?);
```

**Example:**

```tsx
// Multiple tags: /page?tag=react&tag=nextjs&tag=typescript
// RECOMMENDED: Always use a parser to ensure you get an array
const [tags, setTags] = useUrlParamArray<string[]>('tag', {
  parse: (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value]; // Single value becomes array
  },
});

// Now tags is always string[] (never undefined or string)
setTags([...tags, 'new-tag']); // ✅ Safe to use array methods

// Simple usage (may return string | string[] | undefined)
const [tags, setTags] = useUrlParamArray('tag');
// tags could be: undefined, 'single', or ['multiple', 'values']
```

> **💡 Best Practice**: Always provide a `parse` function to ensure consistent array behavior and avoid `.map()` errors.

### `useUrlParams`

Hook for managing multiple URL parameters at once.

```tsx
const [params, setParams] = useUrlParams<Keys>(keys?);
```

**Examples:**

```tsx
// Subscribe to all URL parameters
const [params, setParams] = useUrlParams();
// params = { q: 'search', page: '1', sort: 'date' }

// Subscribe to specific parameters only
const [params, setParams] = useUrlParams(['q', 'page']);
// Only re-renders when 'q' or 'page' changes

// Update multiple parameters at once
setParams({ q: 'new search', page: '1' });
```

### `useUrlParamsArray`

Similar to `useUrlParams` but returns arrays for each param.

```tsx
const [params, setParams] = useUrlParamsArray<Keys>(keys?);
```

**Example:**

```tsx
const [params, setParams] = useUrlParamsArray(['tags', 'categories']);
// params = { tags: ['react', 'nextjs'], categories: ['web'] }
```

### `useUrlParamValue`

Read-only hook for getting a URL parameter value without setter.

```tsx
const value = useUrlParamValue<T>(paramName, options?);
```

**Example:**

```tsx
const currentPage = useUrlParamValue<number>('page', {
  parse: (value) => (value ? parseInt(value, 10) : 1),
});
```

## Advanced Usage

### Custom Types with Parsing and Serialization

```tsx
interface Filters {
  minPrice: number;
  maxPrice: number;
  category: string;
}

const [filters, setFilters] = useUrlParam<Filters>('filters', {
  parse: (value) => {
    if (!value) return { minPrice: 0, maxPrice: 1000, category: 'all' };
    return JSON.parse(value);
  },
  serialize: (filters) => JSON.stringify(filters),
});
```

### Pagination Example

```tsx
const PaginatedList = () => {
  const [page, setPage] = useUrlParam<number>('page', {
    parse: (value) => (value ? parseInt(value, 10) : 1),
    serialize: (value) => value?.toString(),
  });

  const [itemsPerPage] = useUrlParam<number>('limit', {
    parse: (value) => (value ? parseInt(value, 10) : 10),
    serialize: (value) => value?.toString(),
  });

  return (
    <div>
      <div>Page {page}</div>
      <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
```

### Search with Filters

```tsx
const ProductSearch = () => {
  const [search, setSearch] = useUrlParam('q');
  const [categories, setCategories] = useUrlParamArray('category');
  const [priceRange, setPriceRange] = useUrlParam('price');

  const [allFilters, setAllFilters] = useUrlParams([
    'q',
    'category',
    'price',
    'sort',
  ]);

  const clearFilters = () => {
    setAllFilters({ q: undefined, category: undefined, price: undefined });
  };

  return (
    <div>
      <input
        value={search || ''}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

## Options

### `UrlChangeOptions`

Options that can be passed to setter functions:

```tsx
interface UrlChangeOptions {
  /**
   * Shallow routing - doesn't run data fetching methods
   * @default true
   */
  shallow?: boolean;

  /**
   * Create a browser history entry
   * @default false
   */
  historyEntry?: boolean;
}
```

**Example:**

```tsx
// Create history entry (browser back button will undo this)
await setQuery('search term', { historyEntry: true });

// Trigger data fetching (getServerSideProps, etc.)
await setQuery('search term', { shallow: false });
```

## How It Works

This library provides optimistic updates with URL synchronization:

1. **Immediate UI updates** - When you call a setter, the UI updates immediately
2. **URL synchronization** - The URL is updated in the background using Next.js Router (next-router or App router)
3. **Smart batching** - Multiple updates within the debounce window are batched into a single URL change
4. **Minimal re-renders** - Only components subscribed to changed parameters re-render

## Configuration

Library defaults are defined in `src/config.ts` and can be adjusted to tune behavior:

| Constant | Default | Description |
|---|---|---|
| `HISTORY_DEBOUNCE_MS` | `250` | Minimum interval (ms) between URL updates that create separate browser history entries. Rapid changes within this window are coalesced into a single entry, preventing the back button from stepping through every keystroke. |

```ts
// src/config.ts
export const HISTORY_DEBOUNCE_MS = 250;
```

## TypeScript Support

Full TypeScript support with type inference:

```tsx
// Type is inferred as string | undefined
const [name, setName] = useUrlParam('name');

// Explicit typing
const [count, setCount] = useUrlParam<number>('count', {
  parse: (v) => parseInt(v || '0', 10),
  serialize: (v) => v.toString(),
});

// Multiple params with specific keys
const [params, setParams] = useUrlParams(['search', 'page'] as const);
// params type: { search: string | undefined; page: string | undefined }
```

## Compatibility

- **Next.js**: >= 12.0.0 (Pages Router and App Router)
- **React**: >= 18.0.0

### Router Support

This library supports **both** Next.js routing systems:

#### ✅ Pages Router (`next/router`)
- Fully supported with all features
- Shallow routing enabled by default
- Automatic detection when using Pages Router

#### ✅ App Router (`next/navigation`)
- Fully supported with all features
- Automatic detection when using App Router
- Note: App Router doesn't support shallow routing (handled gracefully)

#### ✅ React Server Components (RSC)
- Read-only access to URL parameters
- Use `createRscAdapter` for Server Components
- Setter is a no-op (URL updates require client-side JavaScript)

See the [examples](example/) folder for demos of all supported router types.

## FAQ / Troubleshooting

**Why not just use `useSearchParams()` directly?**

`useSearchParams` (App Router) and `router.query` (Pages Router) require you to wire up reading, writing, and URL construction yourself every single time. For a single param that means three hooks, manual `URLSearchParams` construction, careful spreading to preserve other params, and no batching. `next-url-state` reduces all of that to one line that behaves like `useState`.

---

**Does this work with SSR / Server-Side Rendering?**

Yes — in two ways:
- **Client components** (`'use client'`) rendered on the server: the initial URL is read correctly during SSR and hydrated without a flicker on the client.
- **React Server Components**: use `createRscAdapter` from `next-url-state/rsc` for read-only access. Setters are no-ops in RSC since URL updates require client-side JavaScript.

---

**How does batching work exactly?**

Every setter call updates the UI **immediately** (optimistic update), but the actual URL write is debounced. All setter calls that happen within the `HISTORY_DEBOUNCE_MS` window (default 250 ms) are merged into a single `router.replace` / `router.push` call. This means typing into a search input doesn't flood the browser history with one entry per keystroke — only a single history entry is created once the user pauses. The debounce is [configurable](src/config.ts).

---

**Does batching work across multiple components?**

Yes. All hooks share the same internal store via `UrlParamsProvider`. Updates from different components within the same debounce window are merged into one URL change.

---

**Why do I need `UrlParamsProvider`?**

The provider creates the shared reactive store that all hooks read from and write to. Without it, hooks can't share state between components or batch their updates together. If you forget it, hooks will throw an error pointing you to add the provider.

---

**What happens when I set a value to `undefined`?**

The parameter is removed from the URL entirely, keeping it clean. For example, `setSearch(undefined)` turns `?q=hello&page=2` into `?page=2`.

---

**Does this work with the browser's Back / Forward buttons?**

Yes. When `historyEntry: true` is passed to a setter, a new browser history entry is created and the back button will undo that change. By default (`historyEntry: false`) the URL is replaced without adding a history entry, which is the right default for things like search inputs.

---

**Can I use this outside of Next.js?**

No. The library depends on Next.js routing APIs (`next/router` for the Pages Router, `next/navigation` for the App Router) and is not designed for plain React or other frameworks.

## Contributing

Contributions are welcome!

The [contributing guide](CONTRIBUTING.md) helps you get started with setting up the development environment and explains the development workflow.

## License

**next-url-state** is licensed under the [MIT License](https://github.com/DigitecGalaxus/next-url-state/blob/main/LICENSE).

## Acknowledgments

This library was inspired by the need for better URL state management in Next.js applications.
