import {Command, Args} from '@oclif/core';
import {randomUUID} from 'crypto';
import {readStores, writeStores, type Merchant} from '../lib/store-manager.js';
import {validateAndGetStoreInfo} from '../lib/store-validator.js';

export default class Add extends Command {
  static description = 'Add a new merchant to the database';

  static args = {
    name: Args.string({
      description: 'Merchant name',
      required: true,
    }),
    handle: Args.string({
      description: 'Shopify store handle (e.g., "acme-store")',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {args} = await this.parse(Add);

    // Validate inputs
    if (!args.name || args.name.trim().length === 0) {
      this.error('Merchant name cannot be empty');
    }

    if (!args.handle || args.handle.trim().length === 0) {
      this.error('Handle cannot be empty');
    }

    // Validate handle format (basic check)
    const trimmedHandle = args.handle.trim();
    if (!/^[a-z0-9-]+$/.test(trimmedHandle)) {
      this.error(
        'Handle must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Validate store and get store info
    this.log(`Checking store: ${trimmedHandle}.myshopify.com...`);
    const storeInfo = await validateAndGetStoreInfo(trimmedHandle);

    if (!storeInfo.exists) {
      this.error(
        `Store "${trimmedHandle}.myshopify.com" not found or not accessible. Please verify the handle is correct.`
      );
    }

    // Check if merchant with same handle already exists
    const existingMerchants = await readStores();
    const duplicate = existingMerchants.find(
      (m) => m.handle === trimmedHandle
    );

    if (duplicate) {
      this.error(`Merchant with handle "${trimmedHandle}" already exists`);
    }

    // Create new merchant
    const merchant: Merchant = {
      id: randomUUID(),
      name: args.name.trim(),
      handle: trimmedHandle,
      url: storeInfo.frontendUrl,
      createdAt: new Date().toISOString(),
    };

    // Add to stores
    existingMerchants.push(merchant);
    await writeStores(existingMerchants);

    this.log(`✓ Added merchant "${merchant.name}" (${merchant.handle})`);
    this.log(`  Store URL: ${storeInfo.myshopifyUrl}`);
    if (storeInfo.frontendUrl !== storeInfo.myshopifyUrl) {
      this.log(`  Frontend URL: ${storeInfo.frontendUrl}`);
    }
  }
}
