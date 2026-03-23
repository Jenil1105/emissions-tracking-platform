import type {
  AdjustedComplianceBalance,
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  PoolResponse,
  Route,
  RouteFilters,
} from "../../core/domain/Route";
import type { RouteGateway } from "../../core/ports/RouteGateway";

const API_BASE_URL = "http://localhost:3000";

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error ?? data.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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

  async setBaseline(routeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/baseline`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to set baseline"));
    }
  }

  async getComparison(): Promise<ComparisonResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch comparison"));
    }

    return response.json();
  }

  async getComplianceBalance(year: number): Promise<ComplianceBalanceResponse> {
    const response = await fetch(`${API_BASE_URL}/compliance/cb?year=${year}`);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch compliance balance"));
    }

    return response.json();
  }

  async getBankingRecords(year: number): Promise<BankingRecordsResponse> {
    const response = await fetch(`${API_BASE_URL}/banking/records?year=${year}`);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch banking records"));
    }

    return response.json();
  }

  async bankSurplus(year: number, amount?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, amount }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to bank surplus"));
    }
  }

  async applyBanked(year: number, amount: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, amount }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to apply banked surplus"));
    }
  }

  async getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]> {
    const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?year=${year}`);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch adjusted compliance balances"));
    }

    return response.json();
  }

  async createPool(year: number, routeIds: string[]): Promise<PoolResponse> {
    const response = await fetch(`${API_BASE_URL}/pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, routeIds }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to create pool"));
    }

    return response.json();
  }
}
