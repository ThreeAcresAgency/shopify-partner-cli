import {Command, Args, Flags} from '@oclif/core';
import {readStores, fuzzySearchStores, getStoresPath, type Merchant} from '../lib/store-manager.js';
import {executeShopifyCommand} from '../lib/command-executor.js';
import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
import Fuse from 'fuse.js';
import {spawn, execSync} from 'child_process';
import {existsSync} from 'fs';

inquirer.registerPrompt('autocomplete', AutocompletePrompt);

export default class Search extends Command {
  static description = 'Search for merchants and execute Shopify CLI commands';

  static strict = false;

  static flags = {
    open: Flags.boolean({
      description: 'Open stores.json in your code editor',
      char: 'o',
    }),
  };

  static args = {
    name: Args.string({
      description: 'Optional search query to filter merchants',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const parsed = await this.parse(Search);
    const args = parsed.args as {name?: string};
    const flags = parsed.flags as {open?: boolean};

    // Handle --open flag
    if (flags.open) {
      const storesPath = getStoresPath();

      if (!existsSync(storesPath)) {
        this.log('No stores.json file found. Add a merchant first with "sp add"');
        return;
      }

      const editor = this.detectEditor();

      if (editor) {
        this.log(`Opening ${storesPath} in ${editor}...`);
        try {
          this.openInEditor(editor, storesPath);
        } catch (error) {
          this.log(`Failed to open in ${editor}, using system default...`);
          this.openInSystemDefault(storesPath);
        }
      } else {
        this.log(`Opening ${storesPath}...`);
        this.openInSystemDefault(storesPath);
      }
      return;
    }

    // Get and sort merchants alphabetically by name
    const allMerchantsUnsorted = await readStores();
    const allMerchants = [...allMerchantsUnsorted].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (allMerchants.length === 0) {
      this.error('No merchants found. Add a merchant first with "sp add"');
    }

    // Always show interactive prompt with fuzzy search
    let selectedMerchant: Merchant;

    // Use autocomplete prompt with fuzzy search
    const merchantOptions = allMerchants.map((m) => ({
      name: `${m.name} (${m.handle})`,
      value: m.id,
      merchant: m,
    }));

    // Create Fuse instance for fuzzy search
    const fuse = new Fuse(allMerchants, {
      keys: [
        {name: 'name', weight: 0.8},
        {name: 'handle', weight: 0.2},
      ],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      includeScore: true,
    });

    // Pre-filter if search query provided as argument
    let initialFiltered = allMerchants;
    if (args.name) {
      initialFiltered = fuzzySearchStores(allMerchants, args.name);
    }

    const {merchantId} = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'merchantId',
        message: args.name
          ? `Select a merchant (filtered by "${args.name}"):`
          : 'Select a merchant:',
        source: (answersSoFar: any, input: string | undefined) => {
          // Start with pre-filtered list if argument provided, otherwise all merchants
          let searchResults = input ? fuzzySearchStores(allMerchants, input) : initialFiltered;

          // Convert to option format
          return searchResults.map((m) => ({
            name: `${m.name} (${m.handle})`,
            value: m.id,
          }));
        },
      } as any,
    ]);

    const found = allMerchants.find((m) => m.id === merchantId);
    if (!found) {
      this.error('Merchant selection failed');
    }
    selectedMerchant = found;

    // Show the selected handle
    this.log(`\nSelected store: ${selectedMerchant.handle}\n`);

    // Show command selection
    const commands = [
      {
        label: 'shopify theme dev --store',
        value: 'theme dev',
        args: ['theme', 'dev', '--store', selectedMerchant.handle],
      },
      {
        label: 'shopify theme pull --store',
        value: 'theme pull',
        args: ['theme', 'pull', '--store', selectedMerchant.handle],
      },
      {
        label: 'shopify theme push --store',
        value: 'theme push',
        args: ['theme', 'push', '--store', selectedMerchant.handle],
      },
    ];

    const {selectedCommand} = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCommand',
        message: `Select a command for ${selectedMerchant.name}:`,
        choices: commands.map((c, index) => ({
          name: `${index + 1}. ${c.label}`,
          value: c.value,
          short: c.label,
        })),
        pageSize: 10,
      },
    ]);

    const commandToRun = commands.find((c) => c.value === selectedCommand);
    if (!commandToRun) {
      this.error('Command selection failed');
    }

    // Execute the command
    this.log(
      `Executing: shopify ${commandToRun.args.join(' ')}`
    );
    const exitCode = await executeShopifyCommand('', commandToRun.args);

    if (exitCode !== 0) {
      this.exit(exitCode);
    }
  }

  private detectEditor(): string | null {
    // Check if cursor command exists in PATH (prioritize Cursor)
    try {
      execSync('which cursor', {stdio: 'ignore'});
      return 'cursor';
    } catch {
      // cursor not found
    }

    // Check if code command exists in PATH
    try {
      execSync('which code', {stdio: 'ignore'});
      return 'code';
    } catch {
      // code not found
    }

    // Check for Cursor via environment variables (fallback)
    if (
      process.env.CURSOR_INJECTION ||
      process.env.CURSOR_PID ||
      process.env.CURSOR ||
      process.env.TERM_PROGRAM === 'cursor'
    ) {
      // Try to find cursor in common locations
      const cursorPaths = [
        '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
        '/usr/local/bin/cursor',
      ];
      for (const path of cursorPaths) {
        if (existsSync(path)) {
          return path;
        }
      }
    }

    // Check for VS Code via environment variables (fallback)
    if (
      process.env.VSCODE_INJECTION ||
      process.env.VSCODE_PID ||
      process.env.VSCODE ||
      process.env.TERM_PROGRAM === 'vscode'
    ) {
      // Try to find code in common locations
      const codePaths = [
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
        '/usr/local/bin/code',
      ];
      for (const path of codePaths) {
        if (existsSync(path)) {
          return path;
        }
      }
    }

    return null;
  }

  private openInEditor(editor: string, filePath: string): void {
    try {
      const editorProcess = spawn(editor, [filePath], {
        stdio: 'ignore',
        detached: true,
      });

      editorProcess.on('error', (error) => {
        // Silently fall back to system default
        this.openInSystemDefault(filePath);
      });

      editorProcess.unref();
    } catch (error) {
      // Fall back to system default if spawn fails
      this.openInSystemDefault(filePath);
    }
  }

  private openInSystemDefault(filePath: string): void {
    const platform = process.platform;
    let command: string;
    let args: string[];

    if (platform === 'darwin') {
      command = 'open';
      args = [filePath];
    } else if (platform === 'win32') {
      command = 'cmd';
      args = ['/c', 'start', '', filePath];
    } else {
      // Linux
      command = 'xdg-open';
      args = [filePath];
    }

    const openProcess = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
    });

    openProcess.unref();
  }
}
