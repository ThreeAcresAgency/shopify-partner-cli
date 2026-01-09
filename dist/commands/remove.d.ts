import { Command } from '@oclif/core';
export default class Remove extends Command {
    static description: string;
    static args: {
        name: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=remove.d.ts.map