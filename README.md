# Shopify Partner CLI

A CLI tool to help manage and access Shopify merchant stores via the Shopify CLI.

## What is this?

Shopify Partner CLI Companion (`sp`) is a command-line tool that simplifies working with multiple Shopify stores. Instead of remembering or typing store handles every time you need to run Shopify CLI commands, you can store your stores once and quickly search and select them.

## What problem does it solve?

When working as a Shopify Partner with multiple client stores, you frequently need to run commands like `shopify theme dev --store <handle>` or `shopify theme pull --store <handle>`. This becomes tedious when:

- You have many stores to manage
- Store handles are hard to remember (e.g., `acme-store-2024`, `acme-store-v2`)
- **Store handles change** - Sometimes merchants change their store handle, making it difficult to track which handle corresponds to which store
- You need to quickly switch between stores during development

This tool solves these problems by:
- Storing store information (name and handle) in a centralized location
- Providing fuzzy search to quickly find stores by name
- Automatically using the correct handle when executing Shopify CLI commands
- Displaying the selected handle so you can verify you're working with the right store

## Installation

### Install from npm (Recommended)

```bash
npm install -g shopify-partner-cli
```

After installation, verify it works:

```bash
sp --help
```

### Install from GitHub

```bash
npm install -g https://github.com/ThreeAcresAgency/shopify-partner-cli.git
```

### Development Installation

Clone and install for development:

```bash
git clone https://github.com/ThreeAcresAgency/shopify-partner-cli.git
cd shopify-partner-cli
npm install
npm link
```

## Uninstallation

To uninstall:

```bash
npm uninstall -g shopify-partner-cli
```

## Usage

### Add a merchant

```bash
sp add "Acme Store" "acme-store"
```

The command will automatically:
- Construct the myshopify.com URL from the handle
- Verify the store exists
- Detect the frontend URL (custom domain if available)

### Bulk add merchants

Import multiple merchants from a CSV or JSON file:

```bash
sp bulk-add merchants.csv
sp bulk-add merchants.json
```

**CSV Format:**
```csv
name,handle
Acme Store,acme-store
Another Store,another-store
Example Store,example-store
```

**JSON Format:**
```json
[
  {"name": "Acme Store", "handle": "acme-store"},
  {"name": "Another Store", "handle": "another-store"}
]
```

**Options:**
- `--skip-validation` - Skip store validation (faster, but no URL detection)
- `--format csv|json` - Force file format (auto-detected by extension)

The command will show progress and provide a summary of added, skipped (duplicates), and failed entries.

### Remove a merchant

```bash
sp remove [name]
```

If no name is provided, you'll get an interactive menu to select which merchant to remove.

### List all merchants

```bash
sp list
```

Displays a numbered list of all merchants with their names, handles, and URLs.

### Open stores.json in editor

```bash
sp --open
# or
sp -o
```

Opens the `stores.json` file in your code editor. The command will automatically detect and use:
- Cursor (if running in Cursor or if `cursor` command is available)
- VS Code (if running in VS Code or if `code` command is available)
- System default editor (if no editor is detected)

### Search and execute commands

Search for a merchant (interactive):

```bash
sp Acme
# or just
sp
```

This will:
1. Show an interactive search/selection menu for merchants (with fuzzy search)
2. Display the selected store handle
3. Let you select a Shopify CLI command to run:
   - `shopify theme dev --store <handle>`
   - `shopify theme pull --store <handle>`
   - `shopify theme push --store <handle>`
4. Execute the selected command

## Data Storage

Merchant data is stored in `~/.shopify-partner/stores.json`.

## Autocomplete

To enable tab autocomplete for the `sp` command:

```bash
./install-completion.sh
source ~/.zshrc
```

After installation, you can use tab completion:
- `sp <TAB>` - shows available commands (add, remove)
- `sp add <TAB>` - shows command help
- `sp remove <TAB>` - shows command help

## Contributing

Made by Brendan Quigley at [Three Acres](https://threeacres.ca)
