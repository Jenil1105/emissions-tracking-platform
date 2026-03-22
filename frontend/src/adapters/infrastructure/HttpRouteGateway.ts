import type {
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  Route,
  RouteFilters,
} from "../../core/domain/Route";
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

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalanceResponse> {
    const response = await fetch(`${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`);

    if (!response.ok) {
      throw new Error("Failed to fetch compliance balance");
    }

    return response.json();
  }

  async getBankingRecords(shipId: string, year: number): Promise<BankingRecordsResponse> {
    const response = await fetch(`${API_BASE_URL}/banking/records?shipId=${shipId}&year=${year}`);

    if (!response.ok) {
      throw new Error("Failed to fetch banking records");
    }

    return response.json();
  }

  async bankSurplus(shipId: string, year: number, amount?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shipId, year, amount }),
    });

    if (!response.ok) {
      throw new Error("Failed to bank surplus");
    }
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shipId, year, amount }),
    });

    if (!response.ok) {
      throw new Error("Failed to apply banked surplus");
    }
  }
}
