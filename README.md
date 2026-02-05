# next-url-state

> React hooks for elegantly managing state in URL search parameters with Next.js

[![npm version](https://badge.fury.io/js/next-url-state.svg)](https://www.npmjs.com/package/next-url-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why use this library?

### The Problem with Vanilla Next.js

Managing URL state in Next.js requires a lot of boilerplate and comes with several pain points

**Problems:**
- **Lots of boilerplate** - Manual state synchronization, useEffect hooks, query object spreading
- **Race conditions** - State and URL can get out of sync during navigation
- **Performance issues** - Every keystroke triggers a router update, causing re-renders
- **Type safety** - URL params are always `string | string[] | undefined`, requiring type guards everywhere
- **Complex updates** - Managing multiple parameters requires careful query object manipulation
- **Router differences** - Different APIs for Pages Router (`next/router`) vs App Router (`next/navigation`)

### The Solution with next-url-state is very slim and simple

**Benefits:**
- ✅ **Minimal code** - One line hook replaces 20+ lines of boilerplate
- ✅ **Automatic sync** - State and URL stay in sync automatically
- ✅ **Optimized performance** - Built-in batching (250ms) and optimistic updates
- ✅ **Type safety** - Support for custom types with automatic inference
- ✅ **Simple API** - Works just like `useState` but with URL persistence
- ✅ **Router agnostic** - Works with both Pages Router and App Router automatically

This library handles all the complexity of URL state management, letting you focus on building features instead of wrestling with router APIs.

## Features

- **Type-safe** - Full TypeScript support with automatic type inference and custom type parsing
- **Optimized** - Minimal re-renders with smart change detection and automatic batching (250ms window)
- **Sync & Async** - Optimistic UI updates with background URL synchronization using `useTransition`
- **Flexible** - Support for strings, numbers, booleans, arrays, objects, and custom serialization
- **Multiple Hooks** - Specialized hooks for single params, arrays, multiple params, and read-only access
- **Dual Router Support** - Works seamlessly with both Next.js Pages Router and App Router
- **Zero Dependencies** - Lightweight with only peer dependencies on React and Next.js

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

#### 1. Create a client provider component (if only this provider is needed proceed with point 2)

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

export default const RootLayout = ({ children }: { children: React.ReactNode }) => {
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

export default const SearchPage = () => {
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

> **Note**: Components using the hooks must be client components (`'use client'`)

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
3. **Smart batching** - Multiple updates within 250ms are batched into a single URL change
4. **Minimal re-renders** - Only components subscribed to changed parameters re-render

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

The library **automatically detects** which router you're using - no configuration needed! See the [examples](example/) folder for demonstrations of both routers.

### React Server Components

For React Server Components, use the `createRscAdapter` function to read URL parameters:

```tsx
// app/products/page.tsx (Server Component)
import { createRscAdapter } from 'next-url-state';

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Michael Holzner

## Acknowledgments

This library was inspired by the need for better URL state management in Next.js applications.
