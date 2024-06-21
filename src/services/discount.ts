import { Discount } from "../models/discount.js";

export class DiscountService {
    private discountCodes: Discount[]
    constructor({ discountCodes }: { discountCodes: Discount[] }) {
        this.discountCodes = discountCodes
    }
    findDiscountForPackage(packageDiscountCode: string, packageName: string): Discount {
        const discount = this.discountCodes.find(code => {

            return code.code === packageDiscountCode
        });
        if (!discount) {
            throw new Error(`Discount code ${packageDiscountCode} not found for package ${packageName}`);
        }
        return discount;
    }

    calculateDiscountValue(discount: Discount, packageDistance: number, packageWeight: number, deliveryCost: number): number {
        const isValidDistance = discount.distance.min <= packageDistance && discount.distance.max >= packageDistance;
        const isValidWeight = discount.weight.min <= packageWeight && discount.weight.max >= packageWeight;
        const isValidDistanceWeight = isValidDistance && isValidWeight;
        const getDiscount = (discount: Discount) => {
            if (typeof discount.discount.value === 'string') {
                return 0;
            }

            switch (discount.discount.type) {
                case 'fixed':
                    return discount.discount.value;
                case 'percentage':
                    return deliveryCost * (discount.discount.value / 100);
                default:
                    return 0;
            }
        }
        return isValidDistanceWeight ? getDiscount(discount) : 0;
    }
}
