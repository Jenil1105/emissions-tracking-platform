import type {
  AdjustedComplianceBalance,
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  PoolResponse,
  Route,
  RouteFilters,
} from "../domain/Route";

export interface RouteGateway {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonResponse>;
  getComplianceBalance(year: number): Promise<ComplianceBalanceResponse>;
  getBankingRecords(year: number): Promise<BankingRecordsResponse>;
  bankSurplus(year: number, amount?: number): Promise<void>;
  applyBanked(year: number, amount: number): Promise<void>;
  getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]>;
  createPool(year: number, routeIds: string[]): Promise<PoolResponse>;
}
