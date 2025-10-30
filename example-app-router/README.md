# next-url-state - App Router Example

This example demonstrates `next-url-state` working with Next.js **App Router** (`next/navigation`).

## Features Demonstrated

- ✅ Single string parameters
- ✅ Array parameters (multiple values)
- ✅ Multiple parameters at once
- ✅ Custom parsing and serialization
- ✅ Pagination example

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3004](http://localhost:3004) to see the example.

## Key Differences from Pages Router

The library automatically detects that you're using App Router and uses the appropriate adapter internally. You don't need to change anything in your code!

### What Works

- All hooks: `useUrlParam`, `useUrlParamArray`, `useUrlParams`, `useUrlParamValue`
- Optimistic updates with URL synchronization
- Custom parsing and serialization
- Array parameters

### App Router Specifics

- **No shallow routing**: App Router doesn't support shallow routing, but the library handles this gracefully
- **Always ready**: App Router's navigation hooks are always ready (no `isReady` check needed)
- **Client components**: The `UrlParamsProvider` must be in a client component (`'use client'`)

## Project Structure

```
example-app-router/
├── app/
│   ├── layout.tsx          # Root layout with UrlParamsProvider
│   └── page.tsx            # Demo components
├── package.json
└── tsconfig.json
```
