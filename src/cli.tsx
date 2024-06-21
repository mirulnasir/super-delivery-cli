#!/usr/bin/env node

import meow from 'meow';

const cli = meow(
	`
	$ super-delivery --help

	Usage
	  $ super-delivery
	
	Commands
	  total-cost 		calculate total cost
	  delivery-time 	calculate delivery time
  
	Examples
	  $ super-delivery total-cost --setup=setup.txt --discount=discount-codes.json
	  $ super-delivery delivery-time --setup=setup.txt --discount=discount-codes.json
	  
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
		await import('./commands/total-cost.js');
		break;
	case 'delivery-time':
		await import('./commands/delivery-time.js')
		break;
	default:
		cli.showHelp(0);
}
