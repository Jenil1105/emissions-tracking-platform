import type { ComparisonResponse, Route, RouteFilters } from "../../core/domain/Route";
import type { RouteGateway } from "../../core/ports/RouteGateway";

const API_BASE_URL = "http://localhost:3000";

export class HttpRouteGateway implements RouteGateway {
  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const params = new URLSearchParams();

    if (filters?.vesselType) {
      params.append("vesselType", filters.vesselType);
    }

    if (filters?.fuelType) {
      params.append("fuelType", filters.fuelType);
    }

    if (filters?.year) {
      params.append("year", filters.year);
    }

    const url = `${API_BASE_URL}/routes${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch routes");
    }

    return response.json();
  }

  async setBaseline(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/routes/${id}/baseline`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to set baseline");
    }
  }

  async getComparison(): Promise<ComparisonResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);

    if (!response.ok) {
      throw new Error("Failed to fetch comparison");
    }

    return response.json();
  }
}
