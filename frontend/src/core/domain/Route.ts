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
  records: BankingRecord[];
  totalBanked: number;
};

export type ComplianceBalanceResponse = {
  shipId: string;
  year: number;
  ghgIntensity: number;
  energyInScope: number;
  complianceBalance: number;
};
