import path from 'path';

import { totalCostSetupStringToSchema, getTotalCostSetup } from '../total-cost.js';
import { totalCostSetupFileSchema } from '../../models/total-cost.js';
const filePath = path.join(__dirname, 'sample.txt');

describe('totalCostSetupStringToSchema', () => {
	it('should return null if schema parsing fails', () => {
		const invalidString = 'invalid string';
		const result = totalCostSetupStringToSchema(invalidString, totalCostSetupFileSchema);
		expect(result).toBeNull();
	});

	it('should return parsed data if schema parsing succeeds', () => {
		const validString = '100 1\nPKG1 5 5 OFR001\nPKG2 15 5 OFR002\nPKG3 10 100 OFR003';
		const result = totalCostSetupStringToSchema(validString, totalCostSetupFileSchema);
		expect(result).not.toBeNull();
	});
});

describe('getTotalCostSetup', () => {
	it('should return null if file reading fails', async () => {
		const result = await getTotalCostSetup('invalid/path');
		expect(result).toBeNull();
	});

	it('should return parsed data if file reading succeeds', async () => {
		const result = await getTotalCostSetup(filePath);
		expect(result).not.toBeNull();
	});
});
