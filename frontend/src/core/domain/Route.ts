export type Route = {
  id: number;
  routeId: string;
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
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};

export type BankingRecordsResponse = {
  year: number;
  records: BankingRecord[];
  banked: number;
  applied: number;
  totalBanked: number;
};

export type ComplianceBalanceResponse = {
  year: number;
  ghgIntensity: number;
  energyInScope: number;
  complianceBalance: number;
  cbBefore?: number;
  applied?: number;
  cbAfter?: number;
};

export type AdjustedComplianceBalance = {
  routeId: string;
  year: number;
  cbBefore: number;
  banked: number;
  applied: number;
  adjustedCb: number;
};

export type PoolMember = {
  routeId: string;
  cbBefore: number;
  cbAfter: number;
};

export type PoolResponse = {
  id: number;
  year: number;
  members: PoolMember[];
};
