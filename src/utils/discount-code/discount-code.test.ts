import { getDiscountCode } from './index.js';
import path from 'path';

const filePath = path.join(__dirname, 'sample.json');

test('should return discount codes', async () => {
	const discountCodes = await getDiscountCode(filePath);
	expect(discountCodes?.length).toBe(3);
});

test('should return null for invalid file path', async () => {
	const invalidFilePath = path.join(__dirname, 'invalid.json');
	const discountCodes = await getDiscountCode(invalidFilePath);
	expect(discountCodes).toBeNull();
});

