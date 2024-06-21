import type { Flag, FlagType, Options } from 'meow';
import meow from 'meow';

const flags: Record<string, Flag<FlagType, any>> = {
    help: { type: "boolean", aliases: ["h"] },
    interactive: { type: "boolean", aliases: ["i"], default: false },
    setup: {
        type: 'string', aliases: ["s"], isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    },
    discount: {
        type: 'string', aliases: ["d"], isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    }


}
const options: Options<typeof flags> = {
    importMeta: import.meta,
    autoHelp: true,
    flags,
    version: "0.0.1"

}

const cli = meow(
    `Usage
     $ cli-alt delivery-time
     
     Options:
     -i, --interactive    Interactive mode
     -s, --setup          Setup cost
     -d, --discount       Discount
     `,
    options
)

if (cli.flags['help']) {
    cli.showHelp(0)

}