import {Command, Args} from '@oclif/core';
import {readStores, fuzzySearchStores, type Merchant} from '../lib/store-manager.js';
import {executeShopifyCommand} from '../lib/command-executor.js';
import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
import Fuse from 'fuse.js';

inquirer.registerPrompt('autocomplete', AutocompletePrompt);

export default class Search extends Command {
  static description = 'Search for merchants and execute Shopify CLI commands';

  static strict = false;

  static args = {
    name: Args.string({
      description: 'Optional search query to filter merchants',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const parsed = await this.parse(Search);
    const args = parsed.args as {name?: string};

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

    // Show command selection
    const commands = [
      {
        label: 'shopify pull --store',
        value: 'pull',
        args: ['pull', '--store', selectedMerchant.handle],
      },
      {
        label: 'shopify push --store',
        value: 'push',
        args: ['push', '--store', selectedMerchant.handle],
      },
      {
        label: 'shopify theme dev --store',
        value: 'theme dev',
        args: ['theme', 'dev', '--store', selectedMerchant.handle],
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
}
