#!/usr/bin/env node

import meow from 'meow';

const cli = meow(
	`
	Usage
	  $ cli-alt

	Commands
	  total-cost calculate total cost
	  delivery-cost calculate delivery cost

	Examples
	  $ total-cost
	  
`,
	{
		importMeta: import.meta,
		autoHelp: true,
		flags: {
			name: {
				type: 'string',
			},
		},
	},
);



switch (cli.input[0]) {
	case 'total-cost':
		await import('./commands/total-cost.js')
		break;

	default:
		cli.showHelp(0)
}
