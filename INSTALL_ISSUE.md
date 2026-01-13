# Installation Issue & Solution

## Problem
When installing from GitHub using `npm install -g https://github.com/...`, npm creates a symlink to a temporary cache directory that gets cleaned up, causing the `sp` command to break.

## Solutions

### Option 1: Publish to npm (Recommended)
Publishing to npm ensures proper installation:
```bash
npm publish
# Then users can install with:
npm install -g shopify-partner-cli
```

### Option 2: Use git clone + npm link (For testing)
```bash
git clone https://github.com/ThreeAcresAgency/shopify-partner-cli.git
cd shopify-partner-cli
npm install
npm link
```

### Option 3: Install from local tarball
```bash
# Create a tarball
npm pack

# Install from tarball
npm install -g shopify-partner-cli-1.0.0.tgz
```

## Current Status
The package works when:
- Installed via `npm link` (development)
- Installed from npm (once published)

The package has issues when:
- Installed directly from GitHub URL

## Recommendation
Publish to npm for the most reliable installation experience.
