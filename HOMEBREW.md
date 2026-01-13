# Submitting to Homebrew

## Prerequisites

1. **Publish to npm** (required for homebrew-core):
   ```bash
   npm publish
   ```

2. **Create a git tag** for the version:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Steps to Submit

### 1. Fork homebrew-core
   - Go to https://github.com/Homebrew/homebrew-core
   - Click "Fork" to create your fork

### 2. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/homebrew-core.git
   cd homebrew-core
   ```

### 3. Generate the formula
   
   **Option A: Use homebrew-npm-noob tool** (recommended):
   ```bash
   pip install homebrew-npm-noob
   # or
   brew install zmwangx/npm-noob/noob
   
   noob shopify-partner-cli
   ```
   
   This will output a Ruby formula file.

   **Option B: Create manually** - Use this template:
   ```ruby
   class ShopifyPartnerCli < Formula
     desc "CLI tool to manage and access Shopify merchant stores"
     homepage "https://github.com/ThreeAcresAgency/shopify-partner-cli"
     url "https://registry.npmjs.org/shopify-partner-cli/-/shopify-partner-cli-1.0.0.tgz"
     sha256 "REPLACE_WITH_ACTUAL_SHA256"
     license "SEE LICENSE IN LICENSE"
   
     depends_on "node"
   
     def install
       system "npm", "install", *Language::Node.std_npm_install_args(libexec)
       bin.install_symlink Dir["#{libexec}/bin/*"]
     end
   
     test do
       system "#{bin}/sp", "--version"
     end
   end
   ```

### 4. Get the SHA256 hash
   ```bash
   curl -L https://registry.npmjs.org/shopify-partner-cli/-/shopify-partner-cli-1.0.0.tgz | shasum -a 256
   ```
   Replace `REPLACE_WITH_ACTUAL_SHA256` in the formula with this value.

### 5. Add formula to your fork
   ```bash
   # Create a new branch
   git checkout -b shopify-partner-cli
   
   # Add the formula file
   cp /path/to/shopify-partner-cli.rb Formula/shopify-partner-cli.rb
   
   # Or create it directly
   # Edit Formula/shopify-partner-cli.rb with the formula content
   ```

### 6. Test the formula locally
   ```bash
   brew install --build-from-source ./Formula/shopify-partner-cli.rb
   brew test shopify-partner-cli
   brew audit --new-formula shopify-partner-cli
   ```

### 7. Commit and push
   ```bash
   git add Formula/shopify-partner-cli.rb
   git commit -m "shopify-partner-cli: add formula"
   git push origin shopify-partner-cli
   ```

### 8. Submit Pull Request
   - Go to https://github.com/Homebrew/homebrew-core
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Submit the PR

## Requirements for Acceptance

- ✅ Package must be published on npm
- ✅ At least 30 GitHub stars (sometimes enforced)
- ✅ Stable, well-maintained project
- ✅ Formula must pass `brew audit`
- ✅ Formula must pass `brew test`
- ✅ Follows Homebrew's guidelines
- ✅ License must be compatible

## Alternative: Custom Tap (Easier)

If you don't want to submit to homebrew-core, create your own tap:

1. Create repository: `ThreeAcresAgency/homebrew-tap`
2. Add formula file (can install from GitHub instead of npm)
3. Users install with:
   ```bash
   brew tap ThreeAcresAgency/tap
   brew install shopify-partner-cli
   ```

Custom taps don't require npm publication or the same strict requirements.
