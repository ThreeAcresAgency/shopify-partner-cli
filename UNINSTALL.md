# Uninstalling Shopify Partner CLI

## If installed via npm link (development)

```bash
npm unlink -g shopify-partner-cli
```

This removes the symlink and uninstalls the package.

## If installed via npm install -g

```bash
npm uninstall -g shopify-partner-cli
```

## If installed via Homebrew (future)

```bash
brew uninstall shopify-partner-cli
```

## Verify uninstallation

```bash
which sp
# Should return nothing or "sp not found"

sp --help
# Should return "command not found"
```

## Reinstall for testing

After uninstalling, you can test the installation process:

### From GitHub:
```bash
npm install -g https://github.com/ThreeAcresAgency/shopify-partner-cli.git
```

### From local development:
```bash
cd /path/to/shopify-partner-cli
npm link
```
