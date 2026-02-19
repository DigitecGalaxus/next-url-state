# Contributing to next-url-state

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm, yarn, or pnpm

### Setup

1. Fork and clone the repository

```bash
git clone https://github.com/DigitecGalaxus/next-url-state.git
cd next-url-state
```

2. Install dependencies

```bash
npm install
```

3. Run the development build

```bash
npm run dev
```

## Development Workflow

### Available Scripts

| Script | Description |
|---|---|
| `npm run build` | Build the library with tsup |
| `npm run dev` | Build in watch mode for development |
| `npm run lint` | Lint source files with ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once with coverage |

### Project Structure

```
src/
  config.ts                  # Library configuration constants
  index.ts                   # Public API exports
  UrlParamsContext.tsx        # React context and provider
  routerAdapters.ts          # Pages Router / App Router / Fallback adapters
  useUrlParam.ts             # Single parameter hook
  useUrlParamArray.ts        # Single parameter (multi-value) hook
  useUrlParams.tsx           # Multi-parameter hooks
  useUrlParamValue.ts        # Read-only parameter hook
  useComputedValue.ts        # Internal computed value utility
  useUpdateSearchParams.ts   # Internal URL update logic
  utils/
    parseUrl.ts              # URL parsing utilities
    stringifyUrlParams.ts    # URL serialization utilities
  __tests__/                 # Test files
```

### Making Changes

1. Create a feature branch from `main`

```bash
git checkout -b feature/my-feature
```

2. Make your changes and ensure they follow existing patterns
3. Add or update tests for your changes
4. Run the full check suite before committing

```bash
npm run lint && npm run typecheck && npm run test:ci
```

## Pull Requests

### Before Submitting

- Ensure all tests pass (`npm run test:ci`)
- Ensure type checking passes (`npm run typecheck`)
- Ensure linting passes (`npm run lint`)
- Update documentation if your change affects the public API
- Keep PRs focused on a single concern

### PR Guidelines

- Use a clear, descriptive title
- Describe what the change does and why
- Reference any related issues
- Include a test plan or steps to verify the change

## Code Guidelines

### General

- Write TypeScript with strict type safety. Avoid `any` and type assertions where possible
- Keep functions small and focused
- Prefer explicit over implicit behavior
- Follow existing patterns in the codebase

### React Hooks

- All public hooks should include JSDoc with `@example` blocks
- Hooks must be SSR-safe (check `typeof window` where needed)
- Hooks should work with both Pages Router and App Router

### Testing

- Place test files in `src/__tests__/`
- Use descriptive test names that explain the expected behavior
- Test edge cases: empty values, arrays, special characters, SSR

## Reporting Bugs

When filing a bug report, please include:

- Library version
- Next.js version and router type (Pages or App)
- React version
- Minimal reproduction (a code snippet or repository)
- Expected vs. actual behavior

Use the [GitHub Issues](https://github.com/DigitecGalaxus/next-url-state/issues) page to report bugs.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
