import type {
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  Route,
  RouteFilters,
} from "../domain/Route";

export interface RouteGateway {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(id: number): Promise<void>;
  getComparison(): Promise<ComparisonResponse>;
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalanceResponse>;
  getBankingRecords(shipId: string, year: number): Promise<BankingRecordsResponse>;
  bankSurplus(shipId: string, year: number, amount?: number): Promise<void>;
  applyBanked(shipId: string, year: number, amount: number): Promise<void>;
}
