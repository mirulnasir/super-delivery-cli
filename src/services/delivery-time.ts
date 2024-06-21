import { PackageSetup } from "../models/base-setup.js";
import { getUniqueCombinationsToTargetSum } from "../utils/delivery-time/index.js";
import { CostCalculator } from "../services/total-cost.js";

type Delivery = {
    id: string
    sumWeight: number
    maxDistance: number
    packages: PackageSetup[]
}

type AssignedJob = Omit<Delivery, 'packages'> & {
    packages: (PackageSetup & {
        tripTime: number
        deliveryTime: number

    })[]
} & {
    roundTripTime: number;
};

interface IVehicle {
    addJob(job: Pick<Delivery, 'packages'>): void;
    getAllJobs(): AssignedJob[];
    getTotalDeliveryTime(): number;
}
type VehicleProps = {
    id: number
    maxSpeed: number
    maxWeight: number
}
class Vehicle implements IVehicle {
    private id: number;
    private jobs: AssignedJob[];
    private maxSpeed: number;
    private maxWeight: number;
    private totalRoundTripTime: number

    constructor({ id, maxSpeed, maxWeight }: VehicleProps) {
        this.id = id;
        this.maxSpeed = maxSpeed;
        this.maxWeight = maxWeight;
        this.totalRoundTripTime = 0
        this.jobs = [];
    }

    public getId() {
        return this.id
    }
    public getmisc() {
        return { id: this.id, weight: this.maxWeight }
    }
    public addJob(delivery: Delivery): void {
        const roundTripTime = this.calculateJobDeliveryTime(delivery);

        const packages: AssignedJob['packages'] = delivery.packages.map((pkg) => {
            const tripTime = pkg.packageDistance / this.maxSpeed
            const deliveryTime = parseFloat((Math.floor((this.totalRoundTripTime + tripTime) * 100) / 100).toFixed(2))
            return {
                ...pkg,
                tripTime,
                deliveryTime
            }
        })
        this.jobs.push({ ...delivery, roundTripTime, packages });
        this.totalRoundTripTime += roundTripTime
    }
    public getPackageDetail(packageName: string) {
        for (const job of this.jobs) {
            const foundPackage = job.packages.find(pkg => pkg.packageName === packageName);
            if (foundPackage) {
                return foundPackage;
            }
        }
        throw new Error('Cannot find package')
    }

    public getAllJobs(): AssignedJob[] {
        return this.jobs;
    }

    public getTotalDeliveryTime(): number {
        // return this.jobs.reduce((acc, job) => acc + job.deliveryTime, 0);
        return this.totalRoundTripTime
    }

    private calculateJobDeliveryTime(delivery: Delivery): number {
        const distance = Math.max(...delivery.packages.map(pkg => pkg.packageDistance));
        return parseFloat((Math.floor((distance / this.maxSpeed * 100)) * 2 / 100).toFixed(4))
    }
}

type DeliverySystemProps = {
    numberOfVehicles: number
    packages: PackageSetup[]
    maxSpeed: number,
    maxWeight: number
    costCalculator: CostCalculator
}
type MaybeAssignedPackage = PackageSetup & {
    deliveryId?: string,
    vehicleId?: number,
    cost?: number,
    discount?: number,
    // time it takes to travel from depot to destination
    tripTime?: number,
    // time it takes to deliver the package
    // so it should be tripTime + deliveryTime (vehicle accumulated time)
    deliveryTime?: number
}

type MaybeAssignedDelivery = Delivery & { packages: MaybeAssignedPackage[] } & { vehicleId?: number }

/**
 * The DeliverySystem class manages the delivery process, including vehicle management,
 * delivery planning, and package assignment.
 * 
 * Usage:
 * 1. Instantiate the class with the number of vehicles, max speed, max weight, packages, and cost calculator.
 * 2. Add more vehicles using the .addVehicle() method.
 * 3. Plan deliveries using the .planDelivery() method, which utilizes the max weight.
 * 4. Assign deliveries to vehicles using the .assignDeliveriesToVehicles() method.
 * 5. Retrieve sorted deliveries using the .getSortedDeliveries() method.
 * 6. Retrieve a delivery by its ID using the .getDeliveryById() method.
 * 7. Retrieve a package by its ID using the .getPackageById() method.
 */
class DeliverySystem {
    private vehicles: Vehicle[];
    private packages: MaybeAssignedPackage[];
    // maxweight is set here because it is the same for all vehicles,
    // ideally we should use maxweight from vehicle class, but this is ok for now
    private maxWeight: number;
    private sortedDeliveries: MaybeAssignedDelivery[];
    private mappedDeliveries: Map<string, MaybeAssignedDelivery>;
    private maxSpeed: number;
    private costCalculator: CostCalculator

    constructor({ maxSpeed, maxWeight, numberOfVehicles, packages, costCalculator }: DeliverySystemProps) {
        this.vehicles = this.initVehicles({ maxSpeed, maxWeight, numberOfVehicles });
        this.maxSpeed = maxSpeed;
        this.maxWeight = maxWeight;
        this.sortedDeliveries = [];
        this.packages = packages;
        this.mappedDeliveries = new Map();
        this.costCalculator = costCalculator
    }

    public getMaxSpeed(): number {
        return this.maxSpeed;
    }

    public addPackage(deliveryPackage: PackageSetup): void {
        this.packages.push(deliveryPackage);
    }

    public addVehicle(vehicle: Vehicle): void {
        this.vehicles.push(vehicle);
    }

    public getVehicle(id: number): Vehicle | undefined {
        return this.vehicles.find(vehicle => vehicle.getId() === id);
    }

    private initVehicles({ maxSpeed, maxWeight, numberOfVehicles }: Omit<DeliverySystemProps, 'packages' | 'costCalculator'>): Vehicle[] {
        return Array.from({ length: numberOfVehicles }, (_, i) => new Vehicle({ id: i, maxSpeed, maxWeight }));
    }

    public planDelivery(): void {
        if (this.vehicles.length === 0 || this.packages.length === 0) {
            throw new Error('Incomplete setup. No vehicle or package.');
        }
        this.sortedDeliveries = this.groupPackagesToMaxWeight();
    }

    public assignDeliveriesToVehicles(): void {
        if (this.sortedDeliveries.length === 0) {
            throw new Error('No delivery available, please plan delivery');
        }
        for (const delivery of this.sortedDeliveries) {
            const availableVehicle = this.getFirstAvailableVehicle();
            availableVehicle.addJob(delivery);

            const vehicleId = availableVehicle.getId();
            delivery.vehicleId = vehicleId;
            delivery.packages.forEach(pkg => {
                const { tripTime, deliveryTime } = availableVehicle.getPackageDetail(pkg.packageName)

                this.updatePackageWithDeliveryCost(pkg.packageName, { deliveryId: delivery.id, vehicleId, deliveryTime, tripTime });
            });
        }
        this.mappedDeliveries = new Map(this.sortedDeliveries.map(delivery => [delivery.id, delivery]));
    }

    public getSortedDeliveries(): MaybeAssignedDelivery[] {
        return this.sortedDeliveries;
    }

    public getDeliveryById(id: string): MaybeAssignedDelivery | null {
        return this.mappedDeliveries.get(id) ?? null;
    }

    public getPackageById(id: string): MaybeAssignedPackage {
        const pkg = this.packages.find(pkg => pkg.packageName === id);
        if (!pkg) throw new Error('Cannot find package with the id');
        return pkg;
    }
    private updatePackageWithDeliveryCost(id: string, { deliveryId, vehicleId, deliveryTime, tripTime }: Required<Pick<MaybeAssignedPackage, 'vehicleId' | 'deliveryId' | 'deliveryTime' | 'tripTime'>>): MaybeAssignedPackage {
        const pkg = this.getPackageById(id);
        pkg.deliveryId = deliveryId;
        pkg.vehicleId = vehicleId;
        const { costDiscounted, discountValue } = this.costCalculator.calculatePackageCost(pkg)
        pkg.cost = costDiscounted
        pkg.discount = discountValue
        pkg.deliveryTime = deliveryTime
        pkg.tripTime = tripTime
        return pkg;
    }

    private getFirstAvailableVehicle(): Vehicle {
        if (this.vehicles.length === 0) {
            throw new Error('Please add vehicle');
        }
        return this.vehicles.reduce((prev, curr) => prev.getTotalDeliveryTime() < curr.getTotalDeliveryTime() ? prev : curr);
    }

    private groupPackagesToMaxWeight(): MaybeAssignedDelivery[] {
        const weights = this.packages.map((pkg, i) => ({ index: i, value: pkg.packageWeight }));
        const allCombinations = getUniqueCombinationsToTargetSum(weights, this.maxWeight);

        return Array.from(allCombinations.entries())
            .flatMap(([sumWeight, indexValueArrs]) => indexValueArrs.map(indexValueArr => {
                const packages = indexValueArr.map(indexValue => {
                    const pkg = this.packages[indexValue.index];
                    if (!pkg) throw new Error('Package not found');
                    return pkg;
                });
                const maxDistance = Math.max(...packages.map(pkg => pkg.packageDistance));
                const id = packages.map(pkg => pkg.packageName).join('&');
                return { id, sumWeight, packages, maxDistance };
            }))
            .sort((a, b) => b.sumWeight === a.sumWeight ? a.maxDistance - b.maxDistance : b.sumWeight - a.sumWeight);
    }


}

export { DeliverySystem, Vehicle };
