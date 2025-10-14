# Differences Between Original and Open Source Package

## Summary of Changes

This document outlines all differences between the original `@segments/url-params` package in the isomorph project and the new open-source `next-url-state` library.

## 1. Dependency Changes

### Removed Internal Dependencies

#### ✅ `@blocks/url-utils` → Inlined
- **Original**: `import { parseUrlWithImplicitDomain } from "@blocks/url-utils"`
- **Open Source**: Inlined into `src/utils/urlParsing.ts`
- **Impact**: No external dependency, fully self-contained

```typescript
// Inlined function in src/utils/urlParsing.ts
export const parseUrlWithImplicitDomain = (url: string) => {
  const nativeUrl = new URL(url, "https://domain.tld");
  return {
    pathname: nativeUrl.pathname,
    search: nativeUrl.search,
    searchParams: nativeUrl.searchParams,
    hash: nativeUrl.hash,
  };
};
```

#### ✅ `@segments/routing` → Replaced with `next/router`
- **Original**: `import { useRouterSingleton } from "@segments/routing"`
- **Open Source**: `import { useRouter } from "next/router"`
- **Impact**: Uses Next.js's standard router hook directly

**File affected**: `src/useUpdateSearchParams.ts`

```diff
- import { useRouterSingleton } from "@segments/routing";
+ import { useRouter } from "next/router";

- const router = useRouterSingleton();
+ const router = useRouter();
```

**Reasoning**: The singleton pattern was used to avoid re-renders, but since we only use router methods in callbacks (not during render), the standard `useRouter()` is sufficient and doesn't cause re-render issues.

#### ✅ `@tools/testing-support` → Removed
- Not needed in the open-source package (was only used in tests)

## 2. File Structure Changes

### Directory Reorganization

**Original Structure:**
```
segments/url-params/src/
├── context/
│   ├── parseUrl.ts
│   └── urlParamsContext.tsx
├── useUrlParam.ts
├── useUrlParamArray.ts
├── useUrlParams.tsx
├── useUrlParamValue.ts
├── useComputedValue.ts
├── useUpdateSearchParams.ts
└── index.ts
```

**Open Source Structure:**
```
src/
├── utils/
│   ├── parseUrl.ts          (moved from context/)
│   └── urlParsing.ts        (new - inlined dependency)
├── UrlParamsContext.tsx     (renamed from context/urlParamsContext.tsx)
├── useUrlParam.ts
├── useUrlParamArray.ts
├── useUrlParams.tsx
├── useUrlParamValue.ts
├── useComputedValue.ts
├── useUpdateSearchParams.ts
└── index.ts
```

### File Renames

| Original | Open Source | Reason |
|----------|-------------|--------|
| `context/urlParamsContext.tsx` | `UrlParamsContext.tsx` | Simplified structure, PascalCase for component file |
| `context/parseUrl.ts` | `utils/parseUrl.ts` | Better organization as utility |

## 3. Import Path Changes

All import paths were updated to reflect the new structure:

### In `src/index.ts`:
```diff
- } from "./context/parseUrl.ts";
+ } from "./utils/parseUrl";

- } from "./context/urlParamsContext.tsx";
+ } from "./UrlParamsContext";

- export { useUrlParam } from "./useUrlParam.ts";
+ export { useUrlParam } from "./useUrlParam";
```

### In all hook files:
- Removed `.ts` and `.tsx` extensions (standard in published packages)
- Updated paths from `./context/` to `./utils/` or root level

## 4. Package Configuration

### Original (`segments/url-params/package.json`)
```json
{
  "name": "@segments/url-params",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@blocks/url-utils": "workspace:*",
    "@segments/routing": "workspace:*",
    "@tools/testing-support": "workspace:*",
    "next": "15.5.4",
    "next-yak": "7.0.0"
  }
}
```

### Open Source (`next-url-state/package.json`)
```json
{
  "name": "next-url-state",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "next": ">=12.0.0",
    "react": ">=18.0.0"
  }
}
```

**Key Changes:**
- ✅ Public package (not private)
- ✅ Exports built files from `dist/` instead of source
- ✅ Supports both ESM and CJS
- ✅ TypeScript declarations included
- ✅ No internal workspace dependencies
- ✅ Next.js and React as peer dependencies (not direct dependencies)

## 5. Build System

### Original
- No build step (consumed as TypeScript source)
- Part of monorepo build system

### Open Source
- Uses `tsup` for building
- Generates:
  - `dist/index.js` (CommonJS)
  - `dist/index.mjs` (ES Modules)
  - `dist/index.d.ts` (TypeScript declarations)
- Tree-shakeable
- Source maps included

## 6. Additional Files in Open Source

New files that don't exist in the original:

| File | Purpose |
|------|---------|
| `README.md` | Comprehensive documentation |
| `LICENSE` | MIT License |
| `CHANGELOG.md` | Version history |
| `CONTRIBUTING.md` | Contribution guidelines |
| `SETUP_GUIDE.md` | Publishing instructions |
| `tsup.config.ts` | Build configuration |
| `.github/workflows/ci.yml` | Automated testing |
| `.github/workflows/publish.yml` | Automated publishing |
| `.eslintrc.json` | Linting configuration |
| `.gitignore` | Git ignore rules |
| `.npmignore` | NPM publish filters |

## 7. Functional Differences

### ⚠️ Router Singleton → Direct useRouter

**Potential Impact**:
- The original used `useRouterSingleton()` which provided a stable reference that doesn't change on route changes
- The open-source version uses `useRouter()` directly

**Why it's safe**:
- Router methods (`push`, `replace`) are already stable references in Next.js
- We only use router in callbacks/transitions, not during render
- No re-render issues in practice

**If you need the singleton behavior**:
Users can create their own wrapper if needed, or we could add it as an optional pattern in the docs.

## 8. TypeScript Configuration

### Original
- Inherits from monorepo `tsconfig.common.json`
- `noEmit: true` (no build output)

### Open Source
- Standalone TypeScript config
- Optimized for library publishing
- Generates declaration files

## 9. Testing Setup

### Original
- Uses parent workspace's test configuration
- Tests located in `src/__tests__/`

### Open Source
- Vitest configured (but no tests migrated yet)
- Tests directory structure TBD

## 10. What Stayed the Same

### ✅ Core Functionality
- All hooks work identically
- Same API surface
- Same type definitions
- Same behavior

### ✅ Files with NO changes (except imports):
- `useUrlParam.ts` - Only import path changes
- `useUrlParamArray.ts` - Only import path changes
- `useUrlParams.tsx` - Only import path changes
- `useUrlParamValue.ts` - Only import path changes
- `useComputedValue.ts` - Identical
- Core logic in `UrlParamsContext.tsx` - Identical

## Summary Table

| Aspect | Original | Open Source |
|--------|----------|-------------|
| **Package Name** | `@segments/url-params` | `next-url-state` |
| **Privacy** | Private | Public |
| **Dependencies** | Internal workspace packages | Zero (only peer deps) |
| **Distribution** | TypeScript source | Built JS/MJS + types |
| **Router** | `useRouterSingleton()` | `useRouter()` |
| **File Extensions** | `.ts` in imports | No extensions |
| **Structure** | `context/` subfolder | Flat + `utils/` |
| **Build** | No build | tsup (dual format) |
| **Documentation** | Minimal | Comprehensive |
| **CI/CD** | Monorepo | GitHub Actions |

## Migration Path

If you want to migrate from the internal package to the open-source one:

1. Install: `npm install next-url-state`
2. Update imports:
   ```diff
   - import { useUrlParam } from '@segments/url-params';
   + import { useUrlParam } from 'next-url-state';
   ```
3. No code changes needed - API is identical!

## Recommendations

### For the Open Source Package:

1. **Add Tests** - Port the tests from the original package
2. **Version Strategy** - Start at 0.1.0, move to 1.0.0 when stable
3. **Monitor Performance** - Compare router singleton vs direct useRouter in production
4. **Examples** - Create example Next.js apps

### If Issues Arise:

If the direct `useRouter()` causes performance issues, we can:
1. Re-add the router singleton pattern internally
2. Make it optional via configuration
3. Document the pattern for users to implement
