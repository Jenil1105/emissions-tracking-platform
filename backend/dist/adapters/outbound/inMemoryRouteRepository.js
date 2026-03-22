"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRouteRepository = void 0;
const routes_1 = require("../../data/routes");
class InMemoryRouteRepository {
    getAll(filters) {
        if (!filters) {
            return routes_1.routes;
        }
        return routes_1.routes.filter((route) => {
            const matchesVesselType = !filters.vesselType || route.vesselType === filters.vesselType;
            const matchesFuelType = !filters.fuelType || route.fuelType === filters.fuelType;
            const matchesYear = !filters.year || route.year === filters.year;
            return matchesVesselType && matchesFuelType && matchesYear;
        });
    }
    setBaseline(routeId) {
        const selectedRoute = routes_1.routes.find((route) => route.routeId === routeId);
        if (!selectedRoute) {
            return undefined;
        }
        for (const route of routes_1.routes) {
            route.isBaseline = route.routeId === routeId;
        }
        return selectedRoute;
    }
    getBaseline() {
        return routes_1.routes.find((route) => route.isBaseline);
    }
    getByYear(year) {
        return routes_1.routes.filter((route) => route.year === year);
    }
    getByShipIdAndYear(shipId, year) {
        return routes_1.routes.find((route) => route.shipId === shipId && route.year === year);
    }
}
exports.InMemoryRouteRepository = InMemoryRouteRepository;
