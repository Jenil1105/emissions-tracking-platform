import type {
  AdjustedComplianceBalance,
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  PoolResponse,
  Route,
  RouteFilters,
} from "../domain/Route";
import type { RouteGateway } from "../ports/RouteGateway";

export class RouteDashboardService {
  private readonly routeGateway: RouteGateway;

  constructor(routeGateway: RouteGateway) {
    this.routeGateway = routeGateway;
  }

  getRoutes(filters?: RouteFilters): Promise<Route[]> {
    return this.routeGateway.getRoutes(filters);
  }

  setBaseline(routeId: string): Promise<void> {
    return this.routeGateway.setBaseline(routeId);
  }

  getComparison(): Promise<ComparisonResponse> {
    return this.routeGateway.getComparison();
  }

  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalanceResponse> {
    return this.routeGateway.getComplianceBalance(shipId, year);
  }

  getBankingRecords(shipId: string, year: number): Promise<BankingRecordsResponse> {
    return this.routeGateway.getBankingRecords(shipId, year);
  }

  bankSurplus(shipId: string, year: number, amount?: number): Promise<void> {
    return this.routeGateway.bankSurplus(shipId, year, amount);
  }

  applyBanked(shipId: string, year: number, amount: number): Promise<void> {
    return this.routeGateway.applyBanked(shipId, year, amount);
  }

  getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]> {
    return this.routeGateway.getAdjustedComplianceBalances(year);
  }

  createPool(year: number, shipIds: string[]): Promise<PoolResponse> {
    return this.routeGateway.createPool(year, shipIds);
  }
}
