"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetComplianceBalance = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;
class GetComplianceBalance {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    execute(shipId, year) {
        const route = this.routeRepository.getByShipIdAndYear(shipId, year);
        if (!route) {
            return undefined;
        }
        const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
        const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
        return {
            shipId,
            routeId: route.routeId,
            year,
            ghgIntensity: route.ghgIntensity,
            energyInScope,
            complianceBalance: cbBefore,
            cbBefore,
        };
    }
}
exports.GetComplianceBalance = GetComplianceBalance;
