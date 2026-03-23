import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";
import { distributeBankingToRoutes } from "./distributeBankingToRoutes";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetAdjustedComplianceBalances {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number) {
    const routes = await this.routeRepository.getByYear(year);
    const records = await this.bankingRepository.getRecords();
    const appliedForYear = records
      .filter((record) => record.type === "APPLY" && record.year === year)
      .reduce((sum, record) => sum + record.amount, 0);

    const balances = routes.map((route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      return {
        routeId: route.routeId,
        year: route.year,
        cbBefore: (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope,
      };
    });

    return distributeBankingToRoutes(balances, appliedForYear);
  }
}
