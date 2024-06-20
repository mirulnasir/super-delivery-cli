import { z } from 'zod'

const baseDeliverySchema = z.number().nonnegative()
const numberOfPackagesSchema = z.number({
    invalid_type_error: 'Number of packages should be a number',
}).nonnegative().int('Number of packages should be an integer')

const packageNameSchema = z.string()
const packageWeightSchema = z.number().nonnegative()
const packageDistanceSchema = z.number().nonnegative()
const discountCodeSchema = z.string()

export const deliverySetupSchema = z.tuple([baseDeliverySchema, numberOfPackagesSchema])
export const packageSetupArraySchema = z.tuple(
    [
        packageNameSchema,
        packageWeightSchema,
        packageDistanceSchema,
        discountCodeSchema
    ]
)

export type PackageSetup = {
    packageName: string;
    packageWeight: number;
    packageDistance: number;
    discountCode: string;
}