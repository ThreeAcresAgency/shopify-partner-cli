import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
const STORES_DIR = join(homedir(), '.shopify-partner');
const STORES_FILE = join(STORES_DIR, 'stores.json');
export function getStoresPath() {
    return STORES_FILE;
}
async function ensureStoresDir() {
    if (!existsSync(STORES_DIR)) {
        await mkdir(STORES_DIR, { recursive: true });
    }
}
export async function readStores() {
    await ensureStoresDir();
    if (!existsSync(STORES_FILE)) {
        return [];
    }
    try {
        const content = await readFile(STORES_FILE, 'utf-8');
        const data = JSON.parse(content);
        return data.merchants || [];
    }
    catch (error) {
        // If file is malformed, return empty array
        return [];
    }
}
export async function writeStores(merchants) {
    await ensureStoresDir();
    const data = {
        merchants,
    };
    await writeFile(STORES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
export function findStores(merchants, query) {
    if (!query) {
        return merchants;
    }
    const lowerQuery = query.toLowerCase();
    return merchants.filter((merchant) => merchant.name.toLowerCase().includes(lowerQuery) ||
        merchant.handle.toLowerCase().includes(lowerQuery));
}
import Fuse from 'fuse.js';
export function fuzzySearchStores(merchants, query) {
    if (!query || query.trim().length === 0) {
        return merchants;
    }
    const fuse = new Fuse(merchants, {
        keys: [
            { name: 'name', weight: 0.8 },
            { name: 'handle', weight: 0.2 },
        ],
        threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
        includeScore: true,
    });
    const results = fuse.search(query);
    return results.map((result) => result.item);
}
//# sourceMappingURL=store-manager.js.map