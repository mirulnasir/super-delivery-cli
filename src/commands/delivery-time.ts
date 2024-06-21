import type { Flag, FlagType, Options } from 'meow';
import meow from 'meow';
import { getDeliveryTimeSetup } from '../utils/delivery-time/index.js';
import { getDiscountCode } from '../utils/discount-code/index.js';
import { DeliverySystem } from '../services/delivery-time.js';
import { CostCalculator } from '../services/total-cost.js';
import fs from 'fs';

const flags: Record<string, Flag<FlagType, any>> = {
    help: { type: "boolean", aliases: ["h"] },
    interactive: { type: "boolean", aliases: ["i"], default: false },
    setup: {
        type: 'string', aliases: ["s"], isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    },
    discount: {
        type: 'string', aliases: ["d"], isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    }


}
const options: Options<typeof flags> = {
    importMeta: import.meta,
    autoHelp: true,
    flags,
    version: "0.0.1"

}

const cli = meow(
    `Usage
     $ cli-alt delivery-time
     
     Options:
     -i, --interactive    Interactive mode
     -s, --setup          Setup cost
     -d, --discount       Discount
     `,
    options
)

if (cli.flags['help']) {
    cli.showHelp(0)

}

const checkFiles = async () => {
    const setupPath = cli.flags['setup'] as string
    const discountFile = cli.flags["discount"] as string
    const [setup, discountCodes] = await Promise.all([
        getDeliveryTimeSetup(setupPath),
        getDiscountCode(discountFile)
    ]);

    return { setup, discountCodes }

}
const { setup, discountCodes } = await checkFiles();


if (!setup || !discountCodes) {
    console.error("Error: setup or discount codes not found")
    process.exit(1)
}

const { numberOfVehicles, maxCarriableWeight, maxSpeed, packageSetup, baseDeliveryCost } = setup;


// while (numberOfPackages > 0) {
const costCalculator = new CostCalculator({ baseDeliveryCost, discountCodes })

const ds = new DeliverySystem({
    maxSpeed,
    maxWeight: maxCarriableWeight, numberOfVehicles, packages: packageSetup,
    costCalculator
})
ds.planDelivery()
ds.assignDeliveriesToVehicles()

const getOutput = () => {
    const out = packageSetup.map((pkg) => {
        const { discount, cost, deliveryTime } = ds.getPackageById(pkg.packageName)
        return `${pkg.packageName} ${discount} ${cost} ${deliveryTime}`
    })
    return out.join('\n')
}

fs.writeFile('delivery-time-out.txt', getOutput(), (err) => {
    if (err)
        console.log(err);
    else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        console.log(fs.readFileSync("delivery-time-out.txt", "utf8"));
    }
})