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

  getComplianceBalance(year: number): Promise<ComplianceBalanceResponse> {
    return this.routeGateway.getComplianceBalance(year);
  }

  getBankingRecords(year: number): Promise<BankingRecordsResponse> {
    return this.routeGateway.getBankingRecords(year);
  }

  bankSurplus(year: number, amount?: number): Promise<void> {
    return this.routeGateway.bankSurplus(year, amount);
  }

  applyBanked(year: number, amount: number): Promise<void> {
    return this.routeGateway.applyBanked(year, amount);
  }

  getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]> {
    return this.routeGateway.getAdjustedComplianceBalances(year);
  }

  createPool(year: number, routeIds: string[]): Promise<PoolResponse> {
    return this.routeGateway.createPool(year, routeIds);
  }
}
