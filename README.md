# next-url-state

> React hooks for elegantly managing state in URL search parameters with Next.js

[![npm version](https://badge.fury.io/js/next-url-state.svg)](https://www.npmjs.com/package/next-url-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Type-safe** - Full TypeScript support with type inference
- ⚡ **Optimized** - Minimal re-renders with smart change detection
- 🔄 **Sync & Async** - Optimistic updates with URL synchronization
- 🎨 **Flexible** - Support for strings, arrays, custom types, and serialization
- 🪝 **Multiple Hooks** - Different hooks for different use cases
- 📦 **Zero Dependencies** - Only peer dependencies on React and Next.js

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

### 1. Wrap your app with `UrlParamsProvider`

```tsx
// pages/_app.tsx
import { UrlParamsProvider } from 'next-url-state';

function MyApp({ Component, pageProps }) {
  return (
    <UrlParamsProvider>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}

export default MyApp;
```

### 2. Use the hooks in your components

```tsx
import { useUrlParam } from 'next-url-state';

function SearchComponent() {
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
const [tags, setTags] = useUrlParamArray('tag');
// tags = ['react', 'nextjs', 'typescript']

setTags(['react', 'vue']);
// URL becomes: /page?tag=react&tag=vue
```

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

Similar to `useUrlParams` but returns arrays for all values.

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
function PaginatedList() {
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
function ProductSearch() {
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
2. **URL synchronization** - The URL is updated in the background using Next.js router
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

- **Next.js**: >= 12.0.0 (Pages Router)
- **React**: >= 18.0.0

> **Note**: This library is designed for Next.js Pages Router. For App Router support, please open an issue.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Acknowledgments

This library was inspired by the need for better URL state management in Next.js applications.
