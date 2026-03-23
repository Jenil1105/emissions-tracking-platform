import type {
  AdjustedComplianceBalance,
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  Route,
} from "../core/domain/Route";

export const routesFixture: Route[] = [
  {
    id: 1,
    routeId: "R001",
    shipId: "SHIP-001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true,
  },
  {
    id: 2,
    routeId: "R002",
    shipId: "SHIP-002",
    vesselType: "BulkCarrier",
    fuelType: "LNG",
    year: 2024,
    ghgIntensity: 88,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 4200,
    isBaseline: false,
  },
  {
    id: 3,
    routeId: "R003",
    shipId: "SHIP-003",
    vesselType: "Tanker",
    fuelType: "MGO",
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false,
  },
];

export const comparisonFixture: ComparisonResponse = {
  baseline: routesFixture[0]!,
  comparisonRoutes: [
    {
      ...routesFixture[1]!,
      percentDiff: ((88 / 91) - 1) * 100,
      compliant: true,
    },
    {
      ...routesFixture[2]!,
      percentDiff: ((93.5 / 91) - 1) * 100,
      compliant: false,
    },
  ],
};

export const complianceBalanceFixture: ComplianceBalanceResponse = {
  shipId: "SHIP-003",
  routeId: "R003",
  year: 2024,
  ghgIntensity: 93.5,
  energyInScope: 209100000,
  complianceBalance: -871288.88,
  cbBefore: -871288.88,
  applied: 120000,
  cbAfter: -751288.88,
};

export const bankingRecordsFixture: BankingRecordsResponse = {
  shipId: "SHIP-003",
  year: 2024,
  records: [
    {
      id: 1,
      shipId: "SHIP-003",
      year: 2024,
      amount: 120000,
      type: "APPLY",
    },
  ],
  banked: 0,
  applied: 120000,
  totalBanked: 450000,
};

export const adjustedBalancesFixture: AdjustedComplianceBalance[] = [
  {
    shipId: "SHIP-001",
    routeId: "R001",
    year: 2024,
    cbBefore: -342000,
    banked: 0,
    applied: 100000,
    cbAfterBanking: -242000,
  },
  {
    shipId: "SHIP-002",
    routeId: "R002",
    year: 2024,
    cbBefore: 263424,
    banked: 0,
    applied: 0,
    cbAfterBanking: 263424,
  },
];
