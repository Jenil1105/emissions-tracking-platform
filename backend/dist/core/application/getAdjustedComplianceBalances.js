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
    async execute(year, shipId) {
        const routes = await this.routeRepository.getByYear(year);
        const scopedRoutes = shipId
            ? routes.filter((route) => route.shipId === shipId)
            : routes;
        return Promise.all(scopedRoutes.map(async (route) => {
            const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
            const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
            const records = await this.bankingRepository.getRecords(route.shipId, year);
            const banked = records
                .filter((record) => record.type === "BANK")
                .reduce((sum, record) => sum + record.amount, 0);
            const applied = records
                .filter((record) => record.type === "APPLY")
                .reduce((sum, record) => sum + record.amount, 0);
            return {
                shipId: route.shipId,
                routeId: route.routeId,
                year: route.year,
                cbBefore,
                banked,
                applied,
                cbAfterBanking: cbBefore - banked + applied,
            };
        }));
    }
}
exports.GetAdjustedComplianceBalances = GetAdjustedComplianceBalances;
