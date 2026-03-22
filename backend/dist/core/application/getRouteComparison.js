"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRouteComparison = void 0;
const TARGET_GHG_INTENSITY = 89.3368;
class GetRouteComparison {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    execute() {
        const baseline = this.routeRepository.getBaseline();
        if (!baseline) {
            return undefined;
        }
        const allRoutes = this.routeRepository.getAll();
        const comparisonRoutes = allRoutes
            .filter((route) => route.id !== baseline.id)
            .map((route) => ({
            ...route,
            percentDiff: ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100,
            compliant: route.ghgIntensity <= TARGET_GHG_INTENSITY,
        }));
        return {
            baseline,
            comparisonRoutes,
        };
    }
}
exports.GetRouteComparison = GetRouteComparison;
