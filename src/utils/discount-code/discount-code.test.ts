import test from 'ava';
import {getDiscountCode} from './index.js';

test('should return discount codes', async t => {
	const discountCodes = await getDiscountCode('sample.json');
	t.is(discountCodes?.length, 3);
});
