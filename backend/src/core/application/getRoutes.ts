import type { Route } from "../domain/Route";
import type { RouteFilters, RouteRepository } from "../ports/routeRepository";

export class GetRoutes {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routeRepository.getAll(filters);
  }
}
