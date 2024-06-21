import { z } from "zod";
import { deliverySetupSchema, packageSetupArraySchema } from "./base-setup.js";

// no_of_vehicles, max_speed, max_carriable_weight
const noOfVehiclesSchema = z.number();
const maxSpeedSchema = z.number();
const maxCarriableWeightSchema = z.number();

const deliveryVehicleSchema = z.tuple([
    noOfVehiclesSchema, // noOfVehicles
    maxSpeedSchema, // maxSpeed
    maxCarriableWeightSchema // maxCarriableWeight
]);

const whiteSpaceRegex = /[\s]+/;

export const deliveryVehicleSetupSchema = z.array(z.string()).min(3)
    .refine(array => {
        const [setup, ...packageCosts] = array;
        if (!setup) return false;
        packageCosts.splice(-1)
        const validateSetup = deliverySetupSchema.safeParse(setup.trim().split(whiteSpaceRegex).map(Number))
        if (!validateSetup.success) return false;
        const [_, numberOfPackages] = validateSetup.data
        if (numberOfPackages !== packageCosts.length) return false;
        packageCosts.forEach(packageCost => {
            return packageSetupArraySchema.safeParse(packageCost.trim().split(whiteSpaceRegex)).success
        })
        return true
    }, {
        message: 'Invalid setup',
    })
    .refine(array => {
        const [_, ...rest] = array;
        const deliveryDetail = rest.splice(-1);
        return deliveryVehicleSchema.safeParse(deliveryDetail.join(' ').trim().split(whiteSpaceRegex).map(Number)).success;
    }, {
        message: 'Invalid delivery vehicle setup',
    })
    .transform(array => {
        const [setup, ...packageCosts] = array;
        if (!setup) throw new Error('Invalid setup');
        const deliveryDetails = packageCosts.splice(-1);
        if (!packageCosts.length) throw new Error('Invalid package costs');
        if (!deliveryDetails[0]) throw new Error('Invalid delivery details');
        const [baseDeliveryCost, numberOfPackages] = setup.split(' ').map(Number);
        const packageSetup = packageCosts.map(packageCost => {
            const [packageName, packageWeight, packageDistance, discountCode] = packageCost.trim().split(whiteSpaceRegex);
            return {
                packageName: packageName || '',
                packageWeight: Number(packageWeight) || 0,
                packageDistance: Number(packageDistance) || 0,
                discountCode: discountCode || ''
            };
        });
        const [numberOfVehicles, maxSpeed, maxCarriableWeight] = deliveryDetails[0].split(' ').map(Number);
        return {
            baseDeliveryCost: Number(baseDeliveryCost) || 0,
            numberOfPackages: Number(numberOfPackages) || 0,
            packageSetup,
            numberOfVehicles: Number(numberOfVehicles) || 0,
            maxSpeed: Number(maxSpeed) || 0,
            maxCarriableWeight: Number(maxCarriableWeight) || 0
        };
    });

export type DeliveryTimeSetup = z.infer<typeof deliveryVehicleSetupSchema>;

