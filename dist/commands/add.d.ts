import { Command } from '@oclif/core';
export default class Add extends Command {
    static description: string;
    static args: {
        name: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        handle: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=add.d.ts.map