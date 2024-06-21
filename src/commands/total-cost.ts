import type { Flag, FlagType, Options } from 'meow';
import meow from 'meow';
import { getDiscountCode } from '../utils/discount-code/index.js';
import { getTotalCostSetup } from '../utils/total-cost/index.js';
import { CostCalculator } from '../services/total-cost.js';
import fs from 'fs';
const flags: Record<string, Flag<FlagType, any>> = {
	help: { type: 'boolean', aliases: ['h'] },
	interactive: { type: 'boolean', aliases: ['i'], default: false },
	setup: {
		type: 'string',
		aliases: ['s'],
		isRequired: flags => {
			return !flags['interactive'] && !flags['help'];
		},
	},
	discount: {
		type: 'string',
		aliases: ['d'],
		isRequired: flags => {
			return !flags['interactive'] && !flags['help'];
		},
	},
};
const options: Options<typeof flags> = {
	importMeta: import.meta,
	autoHelp: true,
	flags,
	version: '0.0.1',
};

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
	options,
);

if (cli.flags['help']) {
	cli.showHelp(0);
}

const checkFiles = async () => {
	const setupFile = cli.flags['setup'] as string;
	const discountFile = cli.flags['discount'] as string;
	const [setup, discountCodes] = await Promise.all([
		getTotalCostSetup(setupFile),
		getDiscountCode(discountFile),
	]);

	return { setup, discountCodes };
};

const { setup, discountCodes } = await checkFiles();

if (!setup || !discountCodes) {
	console.error("Error: setup or discount codes not found")
	process.exit(1)
}
const costcalculator = new CostCalculator({ baseDeliveryCost: setup.baseDeliveryCost, discountCodes })
const getOutput = () => {
	const out = setup.packageSetup.map((pkg) => {
		const { costDiscounted, discountValue } = costcalculator.calculatePackageCost(pkg)
		return `${pkg.packageName} ${discountValue} ${costDiscounted}`

	})
	return out.join('\r\n')
}
fs.writeFile('total-cost-out.txt', getOutput(), (err) => {
	if (err)
		console.log(err);
	else {
		console.log("File written successfully\n");
		console.log("The written has the following contents:");
		console.log(fs.readFileSync("total-cost-out.txt", "utf8"));
	}
}
)