"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePool = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;
class CreatePool {
    routeRepository;
    poolRepository;
    constructor(routeRepository, poolRepository) {
        this.routeRepository = routeRepository;
        this.poolRepository = poolRepository;
    }
    execute(year, shipIds) {
        const routes = this.routeRepository
            .getByYear(year)
            .filter((route) => shipIds.includes(route.shipId));
        if (routes.length !== shipIds.length) {
            return { error: "Some ships were not found for the selected year" };
        }
        const members = routes.map((route) => {
            const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
            const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
            return {
                shipId: route.shipId,
                routeId: route.routeId,
                cbBefore,
                cbAfter: cbBefore,
            };
        });
        const total = members.reduce((sum, member) => sum + member.cbBefore, 0);
        if (total < 0) {
            return { error: "Pool sum must be zero or positive" };
        }
        const surplusMembers = [...members]
            .filter((member) => member.cbBefore > 0)
            .sort((left, right) => right.cbBefore - left.cbBefore);
        const deficitMembers = [...members]
            .filter((member) => member.cbBefore < 0)
            .sort((left, right) => left.cbBefore - right.cbBefore);
        for (const deficit of deficitMembers) {
            let remainingDeficit = Math.abs(deficit.cbAfter);
            for (const surplus of surplusMembers) {
                if (remainingDeficit <= 0) {
                    break;
                }
                const transferable = Math.min(surplus.cbAfter, remainingDeficit);
                if (transferable <= 0) {
                    continue;
                }
                surplus.cbAfter -= transferable;
                deficit.cbAfter += transferable;
                remainingDeficit -= transferable;
            }
        }
        const invalidDeficit = members.some((member) => member.cbBefore < 0 && member.cbAfter < member.cbBefore);
        if (invalidDeficit) {
            return { error: "Deficit ship cannot exit worse after pooling" };
        }
        const invalidSurplus = members.some((member) => member.cbBefore > 0 && member.cbAfter < 0);
        if (invalidSurplus) {
            return { error: "Surplus ship cannot exit negative after pooling" };
        }
        const pool = this.poolRepository.create(year, members);
        return pool;
    }
}
exports.CreatePool = CreatePool;
