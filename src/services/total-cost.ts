import { PackageSetup } from "../models/base-setup.js";
import { Discount } from "../models/discount.js";
import { TotalCostSetup } from "../models/total-cost.js";
import { DiscountService } from "./discount.js";

const WEIGHT_COST = 10
const DISTANCE_COST = 5
const calculateDeliveryCost = ({ base, distance, weight }: {
    base: number,
    weight: number,
    distance: number,
}) => {
    return base + (distance * DISTANCE_COST) + (weight * WEIGHT_COST)
}

export class CostCalculator extends DiscountService {

    private baseDeliveryCost: number
    constructor({ baseDeliveryCost, discountCodes }: { baseDeliveryCost: number, discountCodes: Discount[] }) {
        super({ discountCodes })
        this.baseDeliveryCost = baseDeliveryCost
    }
    calculateTotalCost(packages: TotalCostSetup['packageSetup']): number {
        let totalCostSum = 0;
        for (const packageCost of packages) {
            const totalCost = this.calculatePackageCost(packageCost);
            totalCostSum += totalCost.costDiscounted;
        }
        return totalCostSum;
    }

    public calculatePackageCost(packageCostSetup: PackageSetup): { costOriginal: number, costDiscounted: number, discountValue: number } {
        const { discountCode: packageDiscountCode, packageDistance, packageName, packageWeight } = packageCostSetup;

        const discount = this.getDiscountCode(packageDiscountCode, packageName);
        const deliveryCost = this.computeDeliveryCost(packageDistance, packageWeight);
        const discountValue = this.calculateDiscountValueIfApplicable(discount, packageDistance, packageWeight, deliveryCost);

        return { costOriginal: Math.floor(deliveryCost), costDiscounted: Math.floor(deliveryCost - discountValue), discountValue: Math.floor(discountValue) };
    }

    private getDiscountCode(packageDiscountCode: string, packageName: string): Discount | null {
        if (packageDiscountCode === 'NA') {
            return null;
        }

        try {
            return this.findDiscountForPackage(packageDiscountCode, packageName);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            throw new Error('Failed to retrieve discount code');
        }
    }

    private computeDeliveryCost(packageDistance: number, packageWeight: number): number {
        return calculateDeliveryCost({
            base: this.baseDeliveryCost,
            distance: packageDistance,
            weight: packageWeight
        });
    }

    private calculateDiscountValueIfApplicable(discount: Discount | null, packageDistance: number, packageWeight: number, deliveryCost: number): number {
        if (!discount) {
            return 0;
        }
        return this.calculateDiscountValue(discount, packageDistance, packageWeight, deliveryCost);
    }
}
