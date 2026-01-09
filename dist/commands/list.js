import { Command } from '@oclif/core';
import { readStores } from '../lib/store-manager.js';
export default class List extends Command {
    static description = 'List all merchants';
    async run() {
        const allMerchants = await readStores();
        if (allMerchants.length === 0) {
            this.log('No merchants found. Add a merchant first with "sp add"');
            return;
        }
        this.log('\nAvailable merchants:\n');
        allMerchants.forEach((merchant, index) => {
            this.log(`  ${index + 1}. ${merchant.name} (${merchant.handle})`);
            this.log(`     ${merchant.url}`);
            if (index < allMerchants.length - 1) {
                this.log('');
            }
        });
        this.log('');
    }
}
//# sourceMappingURL=list.js.map