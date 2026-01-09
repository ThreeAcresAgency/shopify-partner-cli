# Installation Guide

## Quick Install (Recommended)

### Public Repository

Install directly from GitHub:

```bash
npm install -g https://github.com/ThreeAcresAgency/shopify-partner-cli.git
```

### Private Repository

If the repository is private, you'll need to authenticate. Here are your options:

#### Option 1: Using Personal Access Token (PAT) - Simplest

1. Create a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` scope
   - Copy the token

2. Install using the token:

```bash
npm install -g https://YOUR_TOKEN@github.com/ThreeAcresAgency/shopify-partner-cli.git
```

Replace `YOUR_TOKEN` with your actual token.

#### Option 2: Using SSH URL (Recommended for frequent use)

1. Set up SSH keys with GitHub (if not already done):
   - https://docs.github.com/en/authentication/connecting-to-github-with-ssh

2. Install using SSH:

```bash
npm install -g git+ssh://git@github.com/ThreeAcresAgency/shopify-partner-cli.git
```

#### Option 3: Using .npmrc Configuration

1. Create/edit `~/.npmrc` and add:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@threeacresagency:registry=https://npm.pkg.github.com
```

2. Then install with the scoped package name (requires package.json changes)

**All methods will:**
- Download the latest code from GitHub
- Install all dependencies
- Build the TypeScript code
- Make the `sp` command available globally

## Development Installation

For development or to contribute:

```bash
# Clone the repository
git clone https://github.com/ThreeAcresAgency/shopify-partner-cli.git
cd shopify-partner-cli

# Install dependencies
npm install

# Link globally for development
npm link
```

## Enable Tab Autocomplete

After installation, enable tab autocomplete for zsh:

```bash
# If you installed from GitHub directly
cd $(npm root -g)/shopify-partner-cli
./install-completion.sh
source ~/.zshrc

# Or if you cloned the repo
cd shopify-partner-cli
./install-completion.sh
source ~/.zshrc
```

## Verify Installation

Test that it works:

```bash
sp --help
```

You should see the help menu with all available commands.
