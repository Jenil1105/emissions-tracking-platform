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
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalanceResponse>;
  getBankingRecords(shipId: string, year: number): Promise<BankingRecordsResponse>;
  bankSurplus(shipId: string, year: number, amount?: number): Promise<void>;
  applyBanked(shipId: string, year: number, amount: number): Promise<void>;
  getAdjustedComplianceBalances(year: number, shipId?: string): Promise<AdjustedComplianceBalance[]>;
  createPool(year: number, shipIds: string[]): Promise<PoolResponse>;
}
