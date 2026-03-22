"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAdjustedComplianceBalances = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;
class GetAdjustedComplianceBalances {
    routeRepository;
    bankingRepository;
    constructor(routeRepository, bankingRepository) {
        this.routeRepository = routeRepository;
        this.bankingRepository = bankingRepository;
    }
    execute(year) {
        const routes = this.routeRepository.getByYear(year);
        return routes.map((route) => {
            const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
            const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
            const records = this.bankingRepository.getRecords(route.shipId, route.year);
            const banked = records
                .filter((record) => record.type === "BANK")
                .reduce((sum, record) => sum + record.amount, 0);
            const applied = records
                .filter((record) => record.type === "APPLY")
                .reduce((sum, record) => sum + record.amount, 0);
            const adjustedCb = cbBefore - banked + applied;
            return {
                shipId: route.shipId,
                routeId: route.routeId,
                year: route.year,
                cbBefore,
                banked,
                applied,
                adjustedCb,
            };
        });
    }
}
exports.GetAdjustedComplianceBalances = GetAdjustedComplianceBalances;
