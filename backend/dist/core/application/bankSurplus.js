"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankSurplus = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;
class BankSurplus {
    routeRepository;
    bankingRepository;
    constructor(routeRepository, bankingRepository) {
        this.routeRepository = routeRepository;
        this.bankingRepository = bankingRepository;
    }
    execute(shipId, year, amount) {
        const route = this.routeRepository.getByShipIdAndYear(shipId, year);
        if (!route) {
            return { error: "Ship route not found for year" };
        }
        const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
        const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
        const existingRecords = this.bankingRepository.getRecords(shipId, year);
        const banked = existingRecords
            .filter((record) => record.type === "BANK")
            .reduce((sum, record) => sum + record.amount, 0);
        const applied = existingRecords
            .filter((record) => record.type === "APPLY")
            .reduce((sum, record) => sum + record.amount, 0);
        const cbAfter = cbBefore - banked + applied;
        if (cbAfter <= 0) {
            return { error: "Only positive compliance balance can be banked" };
        }
        const bankAmount = amount ?? cbAfter;
        if (bankAmount <= 0 || bankAmount > cbAfter) {
            return { error: "Invalid bank amount" };
        }
        const record = this.bankingRepository.create(shipId, year, bankAmount, "BANK");
        const totalBanked = banked + bankAmount - applied;
        return {
            shipId,
            year,
            record,
            cbBefore,
            applied,
            cbAfter: cbAfter - bankAmount,
            totalBanked,
        };
    }
}
exports.BankSurplus = BankSurplus;
