# 🚀 Quick Start Guide

## Test the Package Locally (Right Now!)

The package is **ready to test**! Here's the fastest way:

### Option 1: Run the Built-in Example (Easiest!)

```bash
# Windows (double-click or run in terminal)
cd /path/to/next-url-state
test-local.bat

# Mac/Linux
cd /path/to/next-url-state
chmod +x test-local.sh
./test-local.sh
```

Then open **http://localhost:3001** in your browser! 🎉

### Option 2: Manual Steps

```bash
# 1. Go to the package directory
cd /path/to/next-url-state

# 2. Install dependencies
npm install/next-url-state

# 2. Install and build
npm install
npm run build

# 3. Run the example
cd example
npm install
npm run dev
```

Open **http://localhost:3001**

## What You'll See

The example page includes 7 interactive tests:

1. ✅ **Search Box** - Type to see URL update instantly
2. ✅ **Counter** - Number parsing with auto-hide when zero
3. ✅ **Checkbox** - Boolean parameter toggle
4. ✅ **Tags** - Array parameters (add/remove multiple values)
5. ✅ **Filters** - Multiple parameters managed together
6. ✅ **User ID** - Read-only parameter example
7. ✅ **Pagination** - Real-world pagination pattern

## Test Checklist

Try these interactions:

- [x] Type in the search box → URL updates immediately
- [x] Click counter +/- → Number appears in URL (hidden when 0)
- [x] Toggle checkbox → Parameter appears/disappears
- [x] Add multiple tags → See `?tags=react&tags=next` in URL
- [x] Change filter dropdown → Multiple params update
- [x] Click pagination → Page number in URL
- [x] Use browser BACK button → State syncs correctly
- [x] Refresh page → State persists from URL
- [x] Check console → Should be no errors

## Project Structure

```
next-url-state/
├── src/                       # Source code
│   ├── UrlParamsContext.tsx   # Main context provider
│   ├── useUrlParam.ts         # Single param hook
│   ├── useUrlParamArray.ts    # Array param hook
│   ├── useUrlParams.tsx       # Multiple params hook
│   ├── useUrlParamValue.ts    # Read-only hook
│   └── utils/                 # Utilities
├── dist/                      # Built package (after npm run build)
│   ├── index.js               # CommonJS build
│   ├── index.mjs              # ES Module build
│   └── index.d.ts             # TypeScript types
├── example/                   # Test application
│   └── pages/
│       ├── _app.tsx           # Provider setup
│       └── index.tsx          # All examples
├── README.md                  # Main documentation
├── TESTING.md                 # Detailed testing guide
├── SETUP_GUIDE.md            # Publishing instructions
```

## Next Steps

### 1. Test in Your Own Project

```bash
# In your Next.js project
npm install next-url-state

# Or using npm link
cd /path/to/next-url-state
npm link

cd /your/nextjs/project
npm link next-url-state
```

## Development Workflow

### Watch Mode (for active development)

```bash
# Terminal 1: Watch and rebuild
npm run dev

# Terminal 2: Run example
cd example
npm run dev
```

### Make Changes

1. Edit files in `src/`
2. Changes auto-rebuild (if using `npm run dev`)
3. Restart example app to see changes
4. Test in browser

## Documentation

| File | Purpose |
|------|---------|
| [README.md](README.md) | Main documentation with API reference |
| [TESTING.md](TESTING.md) | Comprehensive testing guide |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | How to publish to npm/GitHub |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [example/README.md](example/README.md) | Example app documentation |

## Common Issues

**Q: Changes not appearing?**
A: Run `npm run build` in the root directory

**Q: Can't find module error?**
A: Make sure you ran `npm install` in both root and example directories

**Q: TypeScript errors?**
A: Check that `dist/index.d.ts` exists after building

**Q: Port 3001 already in use?**
A: Change port in example/package.json or stop other apps on port 3001

## Build Output

After running `npm run build`, you should see:

```
dist/
├── index.js        (~12 KB) - CommonJS
├── index.mjs       (~12 KB) - ES Module
├── index.d.ts      (~4 KB)  - TypeScript types
└── *.map files              - Source maps
```

Total package size: ~30 KB (minified)

## Support

- Read [README.md](README.md) for full API documentation
- Check [TESTING.md](TESTING.md) for testing strategies

**You're ready to go!** 🎉

Open http://localhost:3001 and start testing!
