import { Command } from '@oclif/core';
export default class Search extends Command {
    static description: string;
    static strict: boolean;
    static args: {
        name: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=default.d.ts.map