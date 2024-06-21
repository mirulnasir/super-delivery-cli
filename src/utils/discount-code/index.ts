import { Discount, discountArraySchema } from '../../models/discount.js';
import { fromError } from 'zod-validation-error';
import { readFile } from '../file.js';

export const getDiscountCode = async (
	filePath: string,
): Promise<Discount[] | null> => {
	const file = await readFile(filePath);
	if (!file) return null;
	const discountCodeArray = discountArraySchema.safeParse(JSON.parse(file));
	if (!discountCodeArray.success) {
		const validationError = fromError(discountCodeArray.error);
		console.error(validationError.toString());
		return null; // Early return on failure to parse
	}
	return discountCodeArray.data;
};

