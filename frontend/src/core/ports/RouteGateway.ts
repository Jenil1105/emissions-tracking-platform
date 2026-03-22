import type { ComparisonResponse, Route, RouteFilters } from "../domain/Route";

export interface RouteGateway {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(id: number): Promise<void>;
  getComparison(): Promise<ComparisonResponse>;
}
