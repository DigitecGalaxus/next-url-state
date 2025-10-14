# Testing Guide for next-url-state

This guide explains how to test the `next-url-state` package locally before publishing.

## Quick Start (Recommended)

### Method 1: Using the Built-in Example

The easiest way to test the package:

```bash
# 1. Navigate to the package root
cd C:/development/next-url-state

# 2. Install dependencies
npm install

# 3. Build the package
npm run build

# 4. Navigate to the example directory
cd example

# 5. Install example dependencies
npm install

# 6. Run the example app
npm run dev
```

Then open http://localhost:3001 in your browser.

The example page includes tests for:
- ✅ Simple string parameters
- ✅ Number parameters with parsing
- ✅ Boolean parameters
- ✅ Array parameters
- ✅ Multiple parameters at once
- ✅ Read-only parameters
- ✅ Pagination example

### What to Test

1. **Type in the search box** - URL should update immediately
2. **Use the counter buttons** - Number should appear in URL only when > 0
3. **Toggle the checkbox** - Boolean param should appear/disappear
4. **Add/remove tags** - Array params should update (e.g., `?tags=react&tags=next`)
5. **Change filters** - Multiple params should update together
6. **Navigate with browser back/forward** - State should sync correctly
7. **Refresh the page** - State should persist from URL
8. **Navigate to page 2+** - Pagination should work

## Method 2: Test in Your Existing Next.js Project

### Option A: Using npm link

```bash
# 1. In the next-url-state directory
cd C:/development/next-url-state
npm install
npm run build
npm link

# 2. In your Next.js project
cd /path/to/your/nextjs/project
npm link next-url-state

# 3. Use it in your project
# Add to pages/_app.tsx:
import { UrlParamsProvider } from 'next-url-state';

export default function App({ Component, pageProps }) {
  return (
    <UrlParamsProvider>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}
```

**To unlink later:**
```bash
cd /path/to/your/nextjs/project
npm unlink next-url-state
```

### Option B: Using file: protocol

In your Next.js project's `package.json`:

```json
{
  "dependencies": {
    "next-url-state": "file:../next-url-state"
  }
}
```

Then run:
```bash
npm install
```

### Option C: Using npm pack

```bash
# 1. In the next-url-state directory
cd C:/development/next-url-state
npm run build
npm pack
# This creates: next-url-state-0.1.0.tgz

# 2. In your Next.js project
npm install /path/to/next-url-state-0.1.0.tgz
```

## Method 3: Test in the Isomorph Project

Since you already have a Next.js setup, you can test it there:

```bash
# 1. Build the package
cd C:/development/next-url-state
npm install
npm run build

# 2. In your isomorph project, install from local
cd C:/development/isomorph
npm install ../next-url-state

# 3. Update imports in a test component
# Old:
import { useUrlParam } from '@segments/url-params';
# New:
import { useUrlParam } from 'next-url-state';
```

## Development Workflow

### Watch Mode for Development

If you're actively developing and want changes to rebuild automatically:

```bash
# Terminal 1: Watch and rebuild the package
cd C:/development/next-url-state
npm run dev

# Terminal 2: Run the example
cd C:/development/next-url-state/example
npm run dev
```

**Note:** After rebuilding, you may need to restart the example dev server to pick up changes.

## What to Test

### Functional Tests

- [ ] **Basic state management**: URL params update when state changes
- [ ] **Type safety**: TypeScript types work correctly
- [ ] **Parsing**: Custom parse functions work (numbers, booleans, objects)
- [ ] **Serialization**: Custom serialize functions work
- [ ] **Arrays**: Multiple values for same param work
- [ ] **Shallow routing**: Page doesn't reload on param change (default behavior)
- [ ] **History**: Back/forward buttons work correctly
- [ ] **SSR**: Page loads correctly with URL params on first load
- [ ] **Provider**: UrlParamsProvider is required and works

### Edge Cases

- [ ] **Empty values**: Parameters can be removed (set to undefined)
- [ ] **Special characters**: URL encoding works correctly
- [ ] **Multiple hooks**: Multiple components can use the same param
- [ ] **Rapid updates**: Batching works (updates within 250ms are merged)
- [ ] **Hash fragments**: Hash (#) in URL is preserved
- [ ] **Concurrent updates**: Multiple param updates are handled correctly

### Performance Tests

- [ ] **No unnecessary re-renders**: Components only re-render when their subscribed params change
- [ ] **Large param sets**: Works with many parameters
- [ ] **Rapid typing**: Smooth UI updates while typing quickly

## Debugging

### Enable console logging

Add this to the example page to see what's happening:

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function DebugPanel() {
  const router = useRouter();

  useEffect(() => {
    console.log('Router query:', router.query);
    console.log('Router asPath:', router.asPath);
  }, [router.query, router.asPath]);

  return (
    <div>
      <h3>Debug Info</h3>
      <pre>{JSON.stringify(router.query, null, 2)}</pre>
    </div>
  );
}
```

### Common Issues

**Issue: Changes not appearing**
- Solution: Make sure you ran `npm run build` after making changes
- For development, use `npm run dev` in watch mode

**Issue: "Cannot find module 'next-url-state'"**
- Solution: Make sure you installed dependencies in the example folder
- Check that the build succeeded (dist/ folder exists)

**Issue: TypeScript errors**
- Solution: Make sure type declarations were generated (dist/index.d.ts exists)
- Try deleting node_modules and reinstalling

**Issue: React hydration errors**
- Solution: This is expected on first load if URL has params
- Should only happen once, not on subsequent navigation

## Comparison Test

To verify the open-source version behaves identically to the original:

1. **Create identical test pages** in both projects
2. **Test the same scenarios** in parallel
3. **Compare behavior** - they should be identical

Example test component:

```tsx
import { useUrlParam } from 'next-url-state'; // or '@segments/url-params'

export default function ComparisonTest() {
  const [value, setValue] = useUrlParam('test');

  return (
    <div>
      <input value={value || ''} onChange={e => setValue(e.target.value)} />
      <pre>URL param: {value}</pre>
    </div>
  );
}
```

## Automated Testing (Future)

To add unit tests (using Vitest):

```bash
# Install test dependencies
npm install -D vitest @testing-library/react @testing-library/react-hooks

# Run tests
npm test
```

You can port the tests from the original package:
- `segments/url-params/src/__tests__/useUrlParam.test.tsx`
- `segments/url-params/src/__tests__/useUrlParams.test.tsx`
- etc.

## Pre-publish Checklist

Before publishing to npm, verify:

- [ ] `npm run build` completes without errors
- [ ] Example app runs without errors
- [ ] All hooks work as expected
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Bundle size is reasonable (check dist/ folder)
- [ ] README examples work
- [ ] package.json metadata is correct

## Getting Help

If you find issues:

1. Check the browser console for errors
2. Check the terminal for build errors
3. Compare with the original implementation
4. Create an issue with a reproduction case

Happy testing! 🧪
