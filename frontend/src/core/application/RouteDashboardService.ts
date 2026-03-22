import type { ComparisonResponse, Route, RouteFilters } from "../domain/Route";
import type { RouteGateway } from "../ports/RouteGateway";

export class RouteDashboardService {
  private readonly routeGateway: RouteGateway;

  constructor(routeGateway: RouteGateway) {
    this.routeGateway = routeGateway;
  }

  getRoutes(filters?: RouteFilters): Promise<Route[]> {
    return this.routeGateway.getRoutes(filters);
  }

  setBaseline(id: number): Promise<void> {
    return this.routeGateway.setBaseline(id);
  }

  getComparison(): Promise<ComparisonResponse> {
    return this.routeGateway.getComparison();
  }
}
