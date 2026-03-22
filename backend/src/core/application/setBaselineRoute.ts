import type { Route } from "../domain/Route";
import type { RouteRepository } from "../ports/routeRepository";

export class SetBaselineRoute {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(id: number): Route | undefined {
    return this.routeRepository.setBaseline(id);
  }
}
