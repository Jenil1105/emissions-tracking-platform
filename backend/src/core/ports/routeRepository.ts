import type { Route } from "../domain/Route";

export type RouteFilters = {
  vesselType?: string;
  fuelType?: string;
  year?: number;
};

export interface RouteRepository {
  getAll(filters?: RouteFilters): Route[];
  setBaseline(routeId: string): Route | undefined;
  getBaseline(): Route | undefined;
  getByYear(year: number): Route[];
  getByShipIdAndYear(shipId: string, year: number): Route | undefined;
}
