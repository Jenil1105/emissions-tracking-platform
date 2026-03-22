import type { Route } from "../domain/Route";

export type RouteFilters = {
  vesselType?: string;
  fuelType?: string;
  year?: number;
};

export interface RouteRepository {
  getAll(filters?: RouteFilters): Route[];
  setBaseline(id: number): Route | undefined;
}
