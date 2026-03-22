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

  setBaseline(routeId: string): Route | undefined {
    const selectedRoute = routes.find((route) => route.routeId === routeId);

    if (!selectedRoute) {
      return undefined;
    }

    for (const route of routes) {
      route.isBaseline = route.routeId === routeId;
    }

    return selectedRoute;
  }

  getBaseline(): Route | undefined {
    return routes.find((route) => route.isBaseline);
  }

  getByYear(year: number): Route[] {
    return routes.filter((route) => route.year === year);
  }

  getByShipIdAndYear(shipId: string, year: number): Route | undefined {
    return routes.find((route) => route.shipId === shipId && route.year === year);
  }
}
