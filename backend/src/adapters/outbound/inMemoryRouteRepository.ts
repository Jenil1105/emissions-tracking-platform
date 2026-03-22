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

  getBaseline(): Route | undefined {
    return routes.find((route) => route.isBaseline);
  }

  findByShipAndYear(shipId: string, year: number): Route | undefined {
    return routes.find((route) => route.shipId === shipId && route.year === year);
  }
}
