# Publishing to npm

## Pre-publish Checklist

1. **Update version number** in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Update repository URL** in `package.json` if you have a GitHub repo:
   - Replace `YOUR_USERNAME` with your GitHub username
   - Or remove the repository/homepage/bugs fields if you don't have a repo

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Test the package**:
   ```bash
   npm pack
   # This creates a .tgz file you can test
   npm install -g shopify-partner-cli-1.0.0.tgz
   sp --help  # Test it works
   ```

5. **Login to npm** (if not already):
   ```bash
   npm login
   ```

6. **Publish**:
   ```bash
   npm publish
   ```

   Or if publishing a scoped package for the first time:
   ```bash
   npm publish --access public
   ```

## Post-publish

After publishing, users can install with:

```bash
npm install -g shopify-partner-cli
```

## Troubleshooting

- **Package name taken?** Change `shopify-partner-cli` in package.json to something unique like `@yourusername/shopify-partner-cli`
- **Need to unpublish?** Only possible within 72 hours: `npm unpublish shopify-partner-cli@1.0.0`
- **Update existing version?** Use `npm version` commands above to bump version, then `npm publish`
