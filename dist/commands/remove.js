import { Command, Args } from '@oclif/core';
import { readStores, writeStores, fuzzySearchStores } from '../lib/store-manager.js';
import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', AutocompletePrompt);
export default class Remove extends Command {
    static description = 'Remove a merchant from the database';
    static args = {
        name: Args.string({
            description: 'Optional merchant name or handle to remove',
            required: false,
        }),
    };
    async run() {
        const { args } = await this.parse(Remove);
        const allMerchants = await readStores();
        if (allMerchants.length === 0) {
            this.error('No merchants found.');
        }
        let merchantsToRemove;
        if (args.name) {
            // Filter merchants by search term
            merchantsToRemove = fuzzySearchStores(allMerchants, args.name);
            if (merchantsToRemove.length === 0) {
                this.error(`No merchants found matching "${args.name}"`);
            }
        }
        else {
            merchantsToRemove = allMerchants;
        }
        let merchantToRemove;
        if (merchantsToRemove.length === 1) {
            merchantToRemove = merchantsToRemove[0];
        }
        else {
            // Use autocomplete to select merchant
            const merchantOptions = merchantsToRemove.map((m) => ({
                name: `${m.name} (${m.handle})`,
                value: m.id,
            }));
            const { merchantId } = await inquirer.prompt([
                {
                    type: 'autocomplete',
                    name: 'merchantId',
                    message: 'Select a merchant to remove:',
                    source: (answersSoFar, input) => {
                        if (!input) {
                            return merchantOptions;
                        }
                        const searchTerm = input.toLowerCase();
                        return merchantOptions.filter((opt) => opt.name.toLowerCase().includes(searchTerm) ||
                            opt.value.toLowerCase().includes(searchTerm));
                    },
                },
            ]);
            const found = merchantsToRemove.find((m) => m.id === merchantId);
            if (!found) {
                this.error('Merchant selection failed');
            }
            merchantToRemove = found;
        }
        // Confirm deletion
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to remove "${merchantToRemove.name}" (${merchantToRemove.handle})?`,
                default: false,
            },
        ]);
        if (!confirm) {
            this.log('Removal cancelled.');
            return;
        }
        // Remove merchant
        const remainingMerchants = allMerchants.filter((m) => m.id !== merchantToRemove.id);
        await writeStores(remainingMerchants);
        this.log(`✓ Removed merchant "${merchantToRemove.name}" (${merchantToRemove.handle})`);
    }
}
//# sourceMappingURL=remove.js.map