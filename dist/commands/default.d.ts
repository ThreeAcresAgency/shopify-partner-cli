import { Command } from '@oclif/core';
export default class Search extends Command {
    static description: string;
    static strict: boolean;
    static flags: {
        open: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    static args: {
        name: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    private detectEditor;
    private openInEditor;
    private openInSystemDefault;
}
//# sourceMappingURL=default.d.ts.map