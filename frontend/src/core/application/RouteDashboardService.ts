import type {
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
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

  setBaseline(id: number): Promise<void> {
    return this.routeGateway.setBaseline(id);
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
}
