# Installation Guide

## Quick Install (Recommended)

Install directly from GitHub:

```bash
npm install -g https://github.com/ThreeAcresAgency/shopify-partner-cli.git
```

This will:
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
