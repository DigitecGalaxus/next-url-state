# next-url-state Example App

This is a test/example application for the `next-url-state` package.

## Running the Example

From the root of the `next-url-state` project:

```bash
# Quick start (Windows)
.\test-local.bat

# Quick start (Mac/Linux)
chmod +x test-local.sh
./test-local.sh
```

Or manually:

```bash
# 1. Build the package
npm run build

# 2. Install example dependencies
cd example
npm install

# 3. Run the example
npm run dev
```

Then open http://localhost:3001

## What's Included

The example page demonstrates all features of `next-url-state`:

1. **Simple String Parameter** - Basic text input synced to URL
2. **Number Parameter** - Parsing and serializing numbers
3. **Boolean Parameter** - Checkbox state in URL
4. **Array Parameter** - Multiple values for the same parameter
5. **Multiple Parameters** - Managing several params at once
6. **Read-Only Parameter** - Getting values without setters
7. **Pagination** - Practical pagination example

## Testing Checklist

- [ ] Type in search box → URL updates
- [ ] Increment counter → URL updates (hidden when 0)
- [ ] Toggle checkbox → URL param appears/disappears
- [ ] Add tags → Multiple param values in URL
- [ ] Change filters → Multiple params update together
- [ ] Use pagination → Page number in URL
- [ ] Browser back/forward → State syncs correctly
- [ ] Refresh page → State persists from URL
- [ ] No console errors

## File Structure

```
example/
├── pages/
│   ├── _app.tsx       # UrlParamsProvider setup
│   └── index.tsx      # Example page with all tests
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── next.config.js     # Next.js config
```

## Notes

- The example uses `file:..` to link to the parent package
- Changes to the package require rebuilding (`npm run build` in root)
- For live development, use `npm run dev` in the root (watch mode)