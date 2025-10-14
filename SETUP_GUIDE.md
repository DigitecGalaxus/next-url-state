# Setup Guide for Publishing next-url-state

## Prerequisites

- Node.js 18+ installed
- npm account (sign up at https://www.npmjs.com/)
- GitHub account

## Step 1: Update Package Information

Before publishing, update the following in `package.json`:

1. **Author information:**
   ```json
   "author": "Your Name <your.email@example.com>"
   ```

2. **Repository URLs** (replace `yourusername` with your GitHub username):
   ```json
   "repository": {
     "type": "git",
     "url": "git+https://github.com/DigitecGalaxus/next-url-state.git"
   },
   "bugs": {
     "url": "https://github.com/DigitecGalaxus/next-url-state/issues"
   },
   "homepage": "https://github.com/DigitecGalaxus/next-url-state#readme"
   ```

3. Update the LICENSE file with your name and year

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `next-url-state`
3. Don't initialize with README (we already have one)
4. Add the remote and push:

```bash
cd C:/development/next-url-state
git remote add origin https://github.com/DigitecGalaxus/next-url-state.git
git branch -M main
git push -u origin main
```

## Step 3: Set up NPM Publishing

### Option A: Manual Publishing

1. Login to npm:
   ```bash
   npm login
   ```

2. Build the package:
   ```bash
   npm install
   npm run build
   ```

3. Test the build locally:
   ```bash
   npm pack
   # This creates a .tgz file you can test in another project
   ```

4. Publish to npm:
   ```bash
   npm publish
   ```

### Option B: Automated Publishing with GitHub Actions

1. Get your NPM token:
   - Go to https://www.npmjs.com/
   - Click your profile → Access Tokens → Generate New Token
   - Select "Automation" type
   - Copy the token

2. Add the token to GitHub:
   - Go to your repository on GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: paste your npm token

3. Create a release:
   - Go to Releases → Create a new release
   - Create a new tag (e.g., `v0.1.0`)
   - Fill in release notes
   - Publish release

The GitHub Action will automatically publish to npm!

## Step 4: Verify Installation

Test your published package:

```bash
# In a test Next.js project
npm install next-url-state

# Or using npx
npx create-next-app test-app
cd test-app
npm install next-url-state
```

## Version Management

Follow semantic versioning (semver):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features (backward compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

Update version:
```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

## Maintenance Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test
```

## Publishing Checklist

Before each release:

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md (create if needed)
- [ ] Run tests and ensure they pass
- [ ] Build the package (`npm run build`)
- [ ] Test locally in a project
- [ ] Commit and push changes
- [ ] Create GitHub release
- [ ] Verify npm publish was successful
- [ ] Test installation from npm

## Badges for README

After publishing, you can verify these badges work:

```markdown
[![npm version](https://badge.fury.io/js/next-url-state.svg)](https://www.npmjs.com/package/next-url-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

## Support

If you encounter issues:

1. Check the GitHub Actions logs for CI/CD errors
2. Verify npm token is correctly set in GitHub secrets
3. Ensure package.json has correct repository URLs
4. Make sure you're logged into npm (`npm whoami`)

## Next Steps

1. Add tests (vitest setup is already configured)
2. Create examples directory with demo projects
3. Add more comprehensive documentation
4. Set up automated release notes
5. Consider adding code coverage reporting
6. Set up issue templates for GitHub

Good luck with your open source library! 🚀
