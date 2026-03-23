export type Route = {
  id: number;
  routeId: string;
  shipId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
};

export type RouteFilters = {
  vesselType?: string;
  fuelType?: string;
  year?: string;
};

export type ComparisonRoute = Route & {
  percentDiff: number;
  compliant: boolean;
};

export type ComparisonResponse = {
  baseline: Route;
  comparisonRoutes: ComparisonRoute[];
};

export type BankingRecord = {
  id: number;
  shipId: string;
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};

export type BankingRecordsResponse = {
  shipId: string;
  year: number;
  records: BankingRecord[];
  banked: number;
  applied: number;
  totalBanked: number;
};

export type ComplianceBalanceResponse = {
  shipId: string;
  routeId: string;
  year: number;
  ghgIntensity: number;
  energyInScope: number;
  complianceBalance: number;
  cbBefore: number;
  applied?: number;
  cbAfter?: number;
};

export type AdjustedComplianceBalance = {
  shipId: string;
  routeId: string;
  year: number;
  cbBefore: number;
  banked: number;
  applied: number;
  cbAfterBanking: number;
};

export type PoolMember = {
  shipId: string;
  routeId: string;
  cbBefore: number;
  cbAfter: number;
};

export type PoolResponse = {
  id: number;
  year: number;
  members: PoolMember[];
};
