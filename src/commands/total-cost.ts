import type { Flag, FlagType, Options, } from 'meow';
import meow from "meow"
const flags: Record<string, Flag<FlagType, any>> = {
    help: { type: "boolean", alias: "h" },
    interactive: { type: "boolean", alias: "i", default: false },
    setup: {
        type: 'string', alias: 's', isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    },
    discount: {
        type: 'string', alias: 'd', isRequired: (
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
    `
	Usage
	  $ cli-alt total-cost 

    Options
    --interactive, i    interactive mode (NOT IMPLEMENTED)
    --setup, s          (required if interactive mode is off) setup file
    --discount, d       (required if interactive mode is off) discount file
    --help, h           help
`,
    options

)

if (cli.flags["help"]) {
    cli.showHelp(0)
}