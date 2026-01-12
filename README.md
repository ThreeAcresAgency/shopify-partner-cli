# Shopify Partner CLI

A CLI tool to help manage and access Shopify merchant stores via the Shopify CLI.

Made by [Brendan Quigley](https://threeacres.ca) at [Three Acres](https://threeacres.ca)

## Installation

Install directly from GitHub:

```bash
npm install -g https://github.com/ThreeAcresAgency/shopify-partner-cli.git
```

Or clone and install for development:

```bash
git clone https://github.com/ThreeAcresAgency/shopify-partner-cli.git
cd shopify-partner-cli
npm install
npm link
```

Or install locally in your project:

```bash
npm install https://github.com/ThreeAcresAgency/shopify-partner-cli.git
npx sp --help
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

### Search and execute commands

Search for a merchant (interactive):

```bash
sp Acme
# or just
sp
```

This will:
1. Show an interactive search/selection menu for merchants (with fuzzy search)
2. Let you select a Shopify CLI command to run:
   - `shopify theme pull --store <handle>`
   - `shopify theme push --store <handle>`
   - `shopify theme dev --store <handle>`
3. Execute the selected command

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
