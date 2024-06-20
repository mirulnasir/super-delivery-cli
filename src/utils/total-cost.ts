
import { TotalCostSetup, totalCostSetupFileSchema } from "../models/total-cost.js"
import { fromError } from 'zod-validation-error';
import { readFile } from "../utils/file.js";


const totalCostSetupStringToSchema = (packageDeliverySetupString: string, schema = totalCostSetupFileSchema) => {
    const strArray = packageDeliverySetupString.split('\n').filter(Boolean);
    const deliverySetup = schema.safeParse(strArray);

    if (!deliverySetup.success) {
        const validationError = fromError(deliverySetup.error);
        console.error(validationError.toString());
        return null; // Early return on failure to parse
    }

    return deliverySetup.data ? { ...deliverySetup.data } : null;
}



export const getTotalCostSetup = async (filePath: string): Promise<TotalCostSetup | null> => {
    const file = await readFile(filePath)
    if (!file) return null
    return totalCostSetupStringToSchema(file)
}