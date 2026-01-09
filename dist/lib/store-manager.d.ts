export interface Merchant {
    id: string;
    name: string;
    handle: string;
    url: string;
    createdAt: string;
}
export declare function getStoresPath(): string;
export declare function readStores(): Promise<Merchant[]>;
export declare function writeStores(merchants: Merchant[]): Promise<void>;
export declare function findStores(merchants: Merchant[], query: string): Merchant[];
export declare function fuzzySearchStores(merchants: Merchant[], query: string): Merchant[];
//# sourceMappingURL=store-manager.d.ts.map