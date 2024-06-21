import { findMaxSumCombination, getArrayIndicesFromOriginal, getDeliveryTimeSetup, getUniqueCombinationsToTargetSum } from "./index.js";
import path from 'node:path';

const filePath = path.join(__dirname, 'sample.txt');

describe('findMaxSumCombination', () => {
    it('should find the optimal combination of objects that sum up to or less than the target sum', () => {
        const items = [
            { index: 0, value: 50 },
            { index: 1, value: 75 },
            { index: 2, value: 185 },
            { index: 3, value: 110 },
            { index: 4, value: 155 }
        ];
        const targetSum = 200;
        const result = findMaxSumCombination(items, targetSum);
        expect(result).toEqual([{ index: 1, value: 75 }, { index: 3, value: 110 }]);
    });
});

describe('getUniqueCombinationsToTargetSum', () => {
    it('should get unique combinations of index-value pairs that sum up to or less than the target sum', () => {
        const arr = [
            { index: 0, value: 50 },
            { index: 1, value: 75 },
            { index: 2, value: 185 },
            { index: 3, value: 110 },
            { index: 4, value: 155 }
        ];
        const target = 200;
        const result = getUniqueCombinationsToTargetSum(arr, target);
        expect(result.get(185)).toEqual([
            [{ index: 1, value: 75 }, { index: 3, value: 110 }],
            [{ index: 2, value: 185 }]
        ]);
    });
});

describe('getArrayIndicesFromOriginal', () => {
    it('should get the original array indices for each element in the sub-array', () => {
        const arr = [10, 20, 30, 40, 50];
        const subArr = [20, 40];
        const result = getArrayIndicesFromOriginal(arr, subArr);
        expect(result).toEqual([1, 3]);
    });
});

describe('getDeliveryTimeSetup', () => {
    it('should return null if file reading fails', async () => {
        const result = await getDeliveryTimeSetup('invalid/path');
        expect(result).toBeNull();
    });

    it('should return parsed data if file reading succeeds', async () => {
        const result = await getDeliveryTimeSetup(filePath);
        expect(result).not.toBeNull();
    });
});

