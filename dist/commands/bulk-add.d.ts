import { Command } from '@oclif/core';
export default class BulkAdd extends Command {
    static description: string;
    static args: {
        file: import("@oclif/core/lib/interfaces/parser.js").Arg<string, {
            exists?: boolean | undefined;
        }>;
    };
    static flags: {
        'skip-validation': import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        format: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
    private parseFile;
    private parseJSON;
    private parseCSV;
}
//# sourceMappingURL=bulk-add.d.ts.map