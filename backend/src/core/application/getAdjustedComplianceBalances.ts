import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetAdjustedComplianceBalances {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number) {
    const routes = await this.routeRepository.getByYear(year);
    const records = await this.bankingRepository.getRecords(year);
    const banked = records
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const applied = records
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);

    return routes.map((route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;

      return {
        routeId: route.routeId,
        year: route.year,
        cbBefore,
        banked,
        applied,
        adjustedCb: cbBefore,
      };
    });
  }
}
