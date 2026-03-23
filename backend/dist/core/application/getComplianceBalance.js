"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetComplianceBalance = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;
class GetComplianceBalance {
    routeRepository;
    shipComplianceRepository;
    constructor(routeRepository, shipComplianceRepository) {
        this.routeRepository = routeRepository;
        this.shipComplianceRepository = shipComplianceRepository;
    }
    async execute(shipId, year) {
        const route = await this.routeRepository.getByShipIdAndYear(shipId, year);
        if (!route) {
            return undefined;
        }
        const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
        const complianceBalance = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
        await this.shipComplianceRepository.saveSnapshot({
            shipId,
            year,
            cbGco2eq: complianceBalance,
            ghgIntensity: route.ghgIntensity,
            energyInScope,
        });
        return {
            shipId,
            routeId: route.routeId,
            year,
            ghgIntensity: route.ghgIntensity,
            energyInScope,
            complianceBalance,
            cbBefore: complianceBalance,
        };
    }
}
exports.GetComplianceBalance = GetComplianceBalance;
