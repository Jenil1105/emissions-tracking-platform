import type { Route } from "../domain/Route";

export type RouteFilters = {
  vesselType?: string;
  fuelType?: string;
  year?: number;
};

export interface RouteRepository {
  getAll(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route | undefined>;
  getBaseline(): Promise<Route | undefined>;
  getByYear(year: number): Promise<Route[]>;
}
