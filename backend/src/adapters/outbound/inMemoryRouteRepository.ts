import type { Route } from "../../core/domain/Route";
import type { RouteFilters, RouteRepository } from "../../core/ports/routeRepository";
import { routes } from "../../data/routes";

export class InMemoryRouteRepository implements RouteRepository {
  getAll(filters?: RouteFilters): Route[] {
    if (!filters) {
      return routes;
    }

    return routes.filter((route) => {
      const matchesVesselType =
        !filters.vesselType || route.vesselType === filters.vesselType;

      const matchesFuelType =
        !filters.fuelType || route.fuelType === filters.fuelType;

      const matchesYear =
        !filters.year || route.year === filters.year;

      return matchesVesselType && matchesFuelType && matchesYear;
    });
  }

  setBaseline(id: number): Route | undefined {
    const selectedRoute = routes.find((route) => route.id === id);

    if (!selectedRoute) {
      return undefined;
    }

    for (const route of routes) {
      route.isBaseline = route.id === id;
    }

    return selectedRoute;
  }
}
