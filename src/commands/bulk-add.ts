import {Command, Args, Flags} from '@oclif/core';
import {randomUUID} from 'crypto';
import {readFile} from 'fs/promises';
import {existsSync} from 'fs';
import {readStores, writeStores, type Merchant} from '../lib/store-manager.js';
import {validateAndGetStoreInfo} from '../lib/store-validator.js';

interface BulkMerchantInput {
  name: string;
  handle: string;
}

export default class BulkAdd extends Command {
  static description = 'Bulk add merchants from a CSV or JSON file';

  static args = {
    file: Args.file({
      description: 'Path to CSV or JSON file',
      required: true,
      exists: true,
    }),
  };

  static flags = {
    'skip-validation': Flags.boolean({
      description: 'Skip store validation (faster but no URL detection)',
      default: false,
    }),
    format: Flags.string({
      description: 'File format (csv or json). Auto-detected if not specified',
      options: ['csv', 'json'],
    }),
  };

  async run(): Promise<void> {
    const {args, flags} = await this.parse(BulkAdd);

    if (!existsSync(args.file)) {
      this.error(`File not found: ${args.file}`);
    }

    // Detect file format
    const fileFormat =
      flags.format || (args.file.endsWith('.json') ? 'json' : 'csv');

    this.log(`Reading ${fileFormat.toUpperCase()} file: ${args.file}\n`);

    // Parse file
    let merchants: BulkMerchantInput[];
    try {
      const fileContent = await readFile(args.file, 'utf-8');
      merchants = this.parseFile(fileContent, fileFormat);
    } catch (error: any) {
      this.error(`Failed to read file: ${error.message}`);
    }

    if (merchants.length === 0) {
      this.error('No merchants found in file');
    }

    this.log(`Found ${merchants.length} merchant(s) to process\n`);

    // Read existing merchants
    const existingMerchants = await readStores();
    const existingHandles = new Set(existingMerchants.map((m) => m.handle));

    // Process each merchant
    const results = {
      added: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < merchants.length; i++) {
      const input = merchants[i];
      const num = i + 1;
      const total = merchants.length;

      try {
        // Validate inputs
        if (!input.name || input.name.trim().length === 0) {
          results.failed++;
          results.errors.push(
            `Row ${num}: Merchant name cannot be empty`
          );
          continue;
        }

        if (!input.handle || input.handle.trim().length === 0) {
          results.failed++;
          results.errors.push(`Row ${num}: Handle cannot be empty`);
          continue;
        }

        // Validate handle format
        const trimmedHandle = input.handle.trim().toLowerCase();
        if (!/^[a-z0-9-]+$/.test(trimmedHandle)) {
          results.failed++;
          results.errors.push(
            `Row ${num}: Invalid handle format "${input.handle}" (must be lowercase letters, numbers, and hyphens)`
          );
          continue;
        }

        // Check for duplicates
        if (existingHandles.has(trimmedHandle)) {
          this.log(
            `[${num}/${total}] ⚠ Skipped "${input.name}" - handle "${trimmedHandle}" already exists`
          );
          results.skipped++;
          continue;
        }

        // Validate store (if not skipped)
        let frontendUrl = `https://${trimmedHandle}.myshopify.com`;
        if (!flags['skip-validation']) {
          this.log(
            `[${num}/${total}] Checking "${input.name}" (${trimmedHandle})...`
          );
          try {
            const storeInfo = await validateAndGetStoreInfo(trimmedHandle);
            if (!storeInfo.exists) {
              results.failed++;
              results.errors.push(
                `Row ${num}: Store "${trimmedHandle}.myshopify.com" not found`
              );
              continue;
            }
            frontendUrl = storeInfo.frontendUrl;
          } catch (error: any) {
            results.failed++;
            results.errors.push(
              `Row ${num}: Failed to validate store - ${error.message}`
            );
            continue;
          }
        }

        // Create merchant
        const merchant: Merchant = {
          id: randomUUID(),
          name: input.name.trim(),
          handle: trimmedHandle,
          url: frontendUrl,
          createdAt: new Date().toISOString(),
        };

        existingMerchants.push(merchant);
        existingHandles.add(trimmedHandle); // Track added merchants

        this.log(
          `[${num}/${total}] ✓ Added "${merchant.name}" (${merchant.handle})`
        );
        results.added++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${num}: ${error.message}`);
      }
    }

    // Write all merchants at once
    if (results.added > 0) {
      await writeStores(existingMerchants);
    }

    // Summary
    this.log('\n' + '='.repeat(50));
    this.log('Summary:');
    this.log(`  ✓ Added:    ${results.added}`);
    this.log(`  ⚠ Skipped:  ${results.skipped} (duplicates)`);
    this.log(`  ✗ Failed:   ${results.failed}`);
    this.log('='.repeat(50) + '\n');

    if (results.errors.length > 0) {
      this.log('Errors:');
      results.errors.forEach((error) => {
        this.log(`  - ${error}`);
      });
      this.log('');
    }

    if (results.failed > 0) {
      this.exit(1);
    }
  }

  private parseFile(
    content: string,
    format: string
  ): BulkMerchantInput[] {
    if (format === 'json') {
      return this.parseJSON(content);
    } else {
      return this.parseCSV(content);
    }
  }

  private parseJSON(content: string): BulkMerchantInput[] {
    try {
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of objects');
      }
      return data.map((item) => {
        if (!item.name || !item.handle) {
          throw new Error(
            'Each JSON object must have "name" and "handle" fields'
          );
        }
        return {
          name: String(item.name),
          handle: String(item.handle),
        };
      });
    } catch (error: any) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }

  private parseCSV(content: string): BulkMerchantInput[] {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (lines.length === 0) {
      return [];
    }

    // Check if first line is a header
    const startIndex = lines[0]
      .toLowerCase()
      .includes('name') && lines[0].toLowerCase().includes('handle')
      ? 1
      : 0;

    return lines.slice(startIndex).map((line, index) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 2) {
        throw new Error(
          `Line ${startIndex + index + 1}: CSV must have at least 2 columns (name, handle)`
        );
      }
      return {
        name: parts[0],
        handle: parts[1],
      };
    });
  }
}
