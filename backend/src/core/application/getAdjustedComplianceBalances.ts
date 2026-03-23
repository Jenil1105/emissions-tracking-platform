import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetAdjustedComplianceBalances {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number, shipId?: string) {
    const routes = await this.routeRepository.getByYear(year);
    const scopedRoutes = shipId
      ? routes.filter((route) => route.shipId === shipId)
      : routes;

    return Promise.all(scopedRoutes.map(async (route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
      const records = await this.bankingRepository.getRecords(route.shipId, year);
      const banked = records
        .filter((record) => record.type === "BANK")
        .reduce((sum, record) => sum + record.amount, 0);
      const applied = records
        .filter((record) => record.type === "APPLY")
        .reduce((sum, record) => sum + record.amount, 0);

      return {
        shipId: route.shipId,
        routeId: route.routeId,
        year: route.year,
        cbBefore,
        banked,
        applied,
        cbAfterBanking: cbBefore - banked + applied,
      };
    }));
  }
}
