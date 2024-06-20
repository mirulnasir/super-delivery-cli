import { z } from 'zod';
import { deliverySetupSchema, packageSetupArraySchema } from './base-setup.js';

const whitespaceRegex = /[\s]+/;

// FIXME : using refine doesn't should error details, need to use superRefine
export const totalCostSetupFileSchema = z.array(z.string()).min(2).refine(
    array => {
        const [setup] = array
        if (!setup) return false
        return deliverySetupSchema.safeParse(setup.trim().split(whitespaceRegex).map(Number)).success
    },
    {
        message: 'Invalid setup',

    }
).refine(
    array => {
        const [_, ...packageCosts] = array
        packageCosts.forEach(packageCost => {
            return packageSetupArraySchema.safeParse(packageCost.trim().split(whitespaceRegex)).success
        })
        return true
    },
    {
        message: 'Invalid package costs',
    }
)
    .transform(array => {
        const [setup, ...packageCosts] = array
        if (!setup) throw new Error('Invalid setup')
        if (!packageCosts.length) throw new Error('Invalid package costs')
        const [baseDeliveryCost, numberOfPackages] = setup.split(' ').map(Number)
        const packageSetup = packageCosts.map(packageCost => {
            const [packageName, packageWeight, packageDistance, discountCode] = packageCost.trim().split(whitespaceRegex)
            return {
                packageName: packageName as string,
                packageWeight: Number(packageWeight),
                packageDistance: Number(packageDistance),
                discountCode: discountCode as string
            }
        })
        return {
            baseDeliveryCost: Number(baseDeliveryCost),
            numberOfPackages: Number(numberOfPackages),
            packageSetup
        }
    }
    )

export type TotalCostSetup = z.infer<typeof totalCostSetupFileSchema>
