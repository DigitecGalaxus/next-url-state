# next-url-state Pages Router Example

This example demonstrates `next-url-state` using the **Next.js Pages Router** (`/pages` directory).

## Running the Example

From the root of the `next-url-state` project:

```bash
# 1. Build and pack the package
yarn build
yarn pack --filename next-url-state-local-v2.tgz

# 2. Install example dependencies (clean install required)
cd examples/pages-router
rm -rf node_modules .next yarn.lock
yarn

# 3. Run the example
yarn dev
```

Then open http://localhost:3005

## Updating After Library Changes

Whenever you change the library source, repeat steps 1 and 2 above. Yarn caches tarballs aggressively — the full clean is required to pick up changes.

## What's Included

The example page demonstrates all features of `next-url-state`:

1. **Simple String Parameter** - Basic text input synced to URL
2. **Number Parameter** - Parsing and serializing numbers
3. **Boolean Parameter** - Checkbox state in URL
4. **Array Parameter** - Multiple values for the same parameter
5. **Multiple Parameters** - Managing several params at once
6. **Read-Only Parameter** - Getting values without setters
7. **Pagination** - Practical pagination example

## File Structure

```
pages-router/
├── components/
│   └── demoComponents.tsx  # Demo UI components
├── pages/
│   ├── _app.tsx            # UrlParamsProvider setup
│   └── index.tsx           # Example page with all demos
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── next.config.js          # Next.js config
```

## Notes

- The example installs from a local tarball (`next-url-state-local-v2.tgz`) to avoid yarn caching issues with `file:` dependencies
- Runs on port 3005 to avoid conflicts with the App Router example (port 3004)
